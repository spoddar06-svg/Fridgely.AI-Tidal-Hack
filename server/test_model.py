import os
import sys
import requests
import tempfile
import random
import glob
import subprocess
import cv2
from roboflow import Roboflow
from dotenv import load_dotenv


def main():
    print("========================================")
    print("SCRIPT STARTED")
    print("========================================")

    # Load .env file
    load_dotenv()
    print("\n[1/4] Loading environment variables...")

    api_key = os.getenv('ROBOFLOW_API_KEY')
    if not api_key:
        print("ERROR: ROBOFLOW_API_KEY not found in .env file!")
        print("Make sure your .env file exists and has:")
        print("ROBOFLOW_API_KEY=your_key_here")
        sys.exit(1)

    print(f"✓ API Key found: {api_key[:15]}...")

    # Connect to Roboflow
    print("\n[2/4] Connecting to Roboflow...")
    rf = Roboflow(api_key=api_key)
    workspace = os.getenv('ROBOFLOW_WORKSPACE', 'security-detection')
    project_name = os.getenv('ROBOFLOW_PROJECT', 'fridge-food-images-suzmb')
    version = int(os.getenv('ROBOFLOW_VERSION', '2'))
    project = rf.workspace(workspace).project(project_name)
    model = project.version(version).model
    print("✓ Model loaded")

    # Determine input (CLI arg or pick a random validation image)
    if len(sys.argv) > 1:
        test_input = sys.argv[1]
    else:
        # Try to find validation images under valid/
        base_dir = os.path.dirname(__file__)
        val_pattern = os.path.join(base_dir, "valid", "*")
        candidates = [p for p in glob.glob(val_pattern) if p.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if candidates:
            test_input = random.choice(candidates)
            print(f"Picked random validation image: {test_input}")
        else:
            print("ERROR: No test image found.")
            print("Usage: python test_model.py <image_path_or_url>")
            print("Or place images in server/valid/")
            sys.exit(1)

    print(f"\n[3/4] Preparing image...")
    print(f"Testing with: {test_input}")

    # If input is a URL, download it temporarily
    tmp_path = None
    if isinstance(test_input, str) and test_input.startswith("http"):
        try:
            resp = requests.get(test_input, timeout=15)
            resp.raise_for_status()
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
                tmp.write(resp.content)
                tmp_path = tmp.name
            image_path = tmp_path
        except Exception as e:
            print(f"Failed to download image URL: {e}")
            sys.exit(1)
    else:
        image_path = test_input

    # Validate local file
    if not os.path.exists(image_path):
        print(f"Image file not found: {image_path}")
        sys.exit(1)

    # Perform prediction
    print("\n[4/4] Running prediction...")
    try:
        result = model.predict(image_path, confidence=40, overlap=30).json()
    except Exception as e:
        print(f"Prediction error: {e}")
        sys.exit(1)

    # Display results
    print("\n========================================")
    print("DETECTION RESULTS")
    print("========================================")

    # Draw bounding boxes on the image
    image = cv2.imread(image_path)

    if result.get('predictions'):
        predictions = result['predictions']
        print(f"\nDetected {len(predictions)} items:\n")
        for i, pred in enumerate(predictions, 1):
            item_name = pred.get('class', 'unknown')
            confidence = pred.get('confidence', 0) * 100
            print(f"  {i}. {item_name}: {confidence:.1f}% confidence")

            # Roboflow returns center x, y, width, height
            cx = int(pred['x'])
            cy = int(pred['y'])
            w = int(pred['width'])
            h = int(pred['height'])
            x1 = cx - w // 2
            y1 = cy - h // 2
            x2 = cx + w // 2
            y2 = cy + h // 2

            # Draw bounding box
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

            # Draw label background
            label = f"{item_name} {confidence:.0f}%"
            (label_w, label_h), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(image, (x1, y1 - label_h - baseline - 4), (x1 + label_w, y1), (0, 255, 0), -1)
            cv2.putText(image, label, (x1, y1 - baseline - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
    else:
        print("\nNo items detected")

    # Save annotated image and open it
    annotated_path = os.path.join(os.path.dirname(image_path), "annotated_result.jpg")
    cv2.imwrite(annotated_path, image)
    print(f"\nOpening annotated image: {annotated_path}")
    if sys.platform == "win32":
        os.startfile(annotated_path)
    elif sys.platform == "darwin":
        subprocess.Popen(["open", annotated_path])
    else:
        subprocess.Popen(["xdg-open", annotated_path])

    # Clean up temp file
    if tmp_path:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

    print("\n========================================")
    print("TEST COMPLETE")
    print("========================================")


if __name__ == '__main__':
    main()
