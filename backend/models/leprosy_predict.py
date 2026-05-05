#!/usr/bin/env python3
"""Leprosy image prediction helper used by the backend API."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image

IMAGE_SIZE = (224, 224)
MODEL_PATH = Path(__file__).with_name("leprosy-model") / "leprosy_detection_model.keras"


def load_model():
    try:
        import tensorflow as tf

        if not MODEL_PATH.exists():
            return None, f"Model file not found at {MODEL_PATH}"

        return tf.keras.models.load_model(str(MODEL_PATH)), None
    except ImportError as exc:
        return None, f"TensorFlow is not available: {exc}"
    except Exception as exc:
        return None, f"Failed to load model: {exc}"


def preprocess_image(image_path: str):
    import tensorflow as tf

    img = Image.open(image_path).convert("RGB")
    img_array = np.array(img)
    img_array = tf.image.resize(img_array, IMAGE_SIZE)
    img_array = tf.cast(img_array, tf.float32) / 255.0
    return np.expand_dims(img_array, axis=0)


def run_prediction(image_path: str):
    model, error = load_model()

    if error:
        if error.startswith("TensorFlow is not available"):
            import random

            is_leprosy = random.random() > 0.5
            confidence = round(random.uniform(0.7, 0.99), 4)
            return {
                "label": "Leprosy Skin" if is_leprosy else "Normal Skin",
                "confidence": confidence,
                "is_leprosy": is_leprosy,
                "mock": True,
            }

        return {"error": error}

    if not os.path.exists(image_path):
        return {"error": f"Image file not found at {image_path}"}

    processed_image = preprocess_image(image_path)
    prediction = model.predict(processed_image, verbose=0)
    prediction_value = float(np.asarray(prediction).reshape(-1)[0])

    if prediction_value > 0.5:
        return {
            "label": "Leprosy Skin",
            "confidence": float(prediction_value),
            "is_leprosy": True,
            "raw_prediction": prediction_value,
        }

    return {
        "label": "Normal Skin",
        "confidence": float(1 - prediction_value),
        "is_leprosy": False,
        "raw_prediction": prediction_value,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided. Usage: python leprosy_predict.py <image_path>"}))
        sys.exit(1)

    result = run_prediction(sys.argv[1])
    print(json.dumps(result))
    sys.exit(0 if "error" not in result else 1)