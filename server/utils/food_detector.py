"""
Food detection using YOLO
This module handles detecting food items in images
"""
import cv2
import numpy as np
from ultralytics import YOLO
from typing import List, Tuple
import os


class FoodDetector:
    """Detect food items in images using YOLOv8"""

    def __init__(self, model_path: str = "yolov8n.pt"):
        """
        Initialize the food detector

        Args:
            model_path: Path to YOLO model weights
                       Use 'yolov8n.pt' for nano (fastest)
                       Use 'yolov8s.pt' for small (balanced)
                       Use 'yolov8m.pt' for medium (more accurate)
        """
        try:
            self.model = YOLO(model_path)
            print(f"✅ Loaded YOLO model: {model_path}")
        except Exception as e:
            print(f"⚠️  Error loading YOLO model: {e}")
            print("📥 Downloading default YOLOv8 model...")
            self.model = YOLO("yolov8n.pt")

        # Food-related class names from COCO dataset
        self.food_classes = {
            'apple', 'banana', 'orange', 'broccoli', 'carrot',
            'hot dog', 'pizza', 'donut', 'cake', 'sandwich',
            'bottle', 'wine glass', 'cup', 'fork', 'knife',
            'spoon', 'bowl'
        }

    def detect_items(self, image_path: str, confidence_threshold: float = 0.5) -> List[dict]:
        """
        Detect food items in an image

        Args:
            image_path: Path to the image file
            confidence_threshold: Minimum confidence score (0-1)

        Returns:
            List of detected items with bounding boxes and confidence scores
        """
        try:
            # Run YOLO detection
            results = self.model(image_path, conf=confidence_threshold)

            detections = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    # Get box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].tolist()

                    # Get class name and confidence
                    class_id = int(box.cls[0])
                    class_name = self.model.names[class_id]
                    confidence = float(box.conf[0])

                    # Filter for food-related items or accept all with high confidence
                    if confidence >= confidence_threshold:
                        detection = {
                            "item_name": class_name,
                            "confidence": round(confidence, 3),
                            "bounding_box": [round(x1), round(y1), round(x2), round(y2)],
                            "is_food_related": class_name.lower() in self.food_classes
                        }
                        detections.append(detection)

            print(f"🔍 Detected {len(detections)} items in image")
            return detections

        except Exception as e:
            print(f"❌ Error during detection: {e}")
            return []

    def crop_detection(self, image_path: str, bounding_box: List[int], padding: int = 10) -> np.ndarray:
        """
        Crop a detected region from the image (useful for OCR)

        Args:
            image_path: Path to the original image
            bounding_box: [x1, y1, x2, y2] coordinates
            padding: Extra pixels to include around the box

        Returns:
            Cropped image as numpy array
        """
        try:
            image = cv2.imread(image_path)
            x1, y1, x2, y2 = bounding_box

            # Add padding
            x1 = max(0, x1 - padding)
            y1 = max(0, y1 - padding)
            x2 = min(image.shape[1], x2 + padding)
            y2 = min(image.shape[0], y2 + padding)

            cropped = image[y1:y2, x1:x2]
            return cropped

        except Exception as e:
            print(f"❌ Error cropping image: {e}")
            return None


# Utility function to draw detections on image (for debugging/demo)
def draw_detections(image_path: str, detections: List[dict], output_path: str = None):
    """
    Draw bounding boxes on image

    Args:
        image_path: Path to original image
        detections: List of detections from detect_items()
        output_path: Where to save annotated image (optional)
    """
    image = cv2.imread(image_path)

    for det in detections:
        x1, y1, x2, y2 = det["bounding_box"]
        label = f"{det['item_name']} {det['confidence']:.2f}"

        # Draw box
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

        # Draw label
        cv2.putText(image, label, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    if output_path:
        cv2.imwrite(output_path, image)

    return image
