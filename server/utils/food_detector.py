"""
Food detection using custom Roboflow model
This module handles detecting food items in fridge images
"""
import cv2
import numpy as np
from roboflow import Roboflow
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()


class FoodDetector:
    """Detect food items in images using a custom Roboflow model"""

    def __init__(self):
        api_key = os.getenv('ROBOFLOW_API_KEY')
        workspace = os.getenv('ROBOFLOW_WORKSPACE', 'security-detection')
        project_name = os.getenv('ROBOFLOW_PROJECT', 'fridge-food-images-suzmb')
        version = int(os.getenv('ROBOFLOW_VERSION', '1'))

        if not api_key:
            raise RuntimeError("ROBOFLOW_API_KEY not set in .env")

        rf = Roboflow(api_key=api_key)
        project = rf.workspace(workspace).project(project_name)
        self.model = project.version(version).model
        print(f"✅ Loaded Roboflow model: {workspace}/{project_name} v{version}")

    def detect_items(self, image_path: str, confidence_threshold: float = 0.4) -> List[dict]:
        """
        Detect food items in an image

        Args:
            image_path: Path to the image file
            confidence_threshold: Minimum confidence score (0-1)

        Returns:
            List of detected items with bounding boxes and confidence scores
        """
        try:
            result = self.model.predict(
                image_path,
                confidence=int(confidence_threshold * 100),
                overlap=30,
            ).json()

            detections = []
            for pred in result.get('predictions', []):
                # Roboflow returns center x, y, width, height
                cx = int(pred['x'])
                cy = int(pred['y'])
                w = int(pred['width'])
                h = int(pred['height'])
                x1 = cx - w // 2
                y1 = cy - h // 2
                x2 = cx + w // 2
                y2 = cy + h // 2

                detection = {
                    "item_name": pred.get('class', 'unknown'),
                    "confidence": round(float(pred.get('confidence', 0)), 3),
                    "bounding_box": [x1, y1, x2, y2],
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
