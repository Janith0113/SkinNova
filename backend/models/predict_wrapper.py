#!/usr/bin/env python3
"""
Wrapper script for running model predictions using best_psoriasis_model.keras
Supports Keras format models
"""

import sys
import json
import os
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

def run_prediction(image_path):
    """
    Run prediction on an image using the best_psoriasis_model.keras
    """
    try:
        import tensorflow as tf
        import numpy as np
        from PIL import Image
        
        # Model configuration
        IMAGE_SIZE = (224, 224)
        
        # Model path - best_psoriasis_model.keras in same directory
        model_dir = Path(__file__).parent
        model_path = model_dir / 'best_psoriasis_model (2).keras'
        
        print(f"[Model] Loading model from: {model_path}")
        
        if not model_path.exists():
            return {
                "error": f"Model file not found at {model_path}",
                "label": "Error",
                "confidence": 0
            }
        
        # Load Keras model
        try:
            model = tf.keras.models.load_model(str(model_path))
            print("[Model] Loaded Keras model successfully")
        except Exception as e:
            print(f"[Model] Error loading model: {e}")
            return {
                "error": f"Failed to load model: {str(e)}",
                "label": "Error",
                "confidence": 0
            }
        
        # Preprocess and predict
        try:
            img = Image.open(image_path).convert('RGB')
            img_array = np.array(img)
            img_array = tf.image.resize(img_array, IMAGE_SIZE)
            img_array = tf.cast(img_array, tf.float32) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            
            prediction = model.predict(img_array, verbose=0)
            
            # Handle different output shapes
            if isinstance(prediction, list):
                prediction = prediction[0]
            
            if len(prediction.shape) > 1:
                prediction = prediction[0][0] if len(prediction[0].shape) > 0 else prediction[0]
            
            # Convert to scalar if needed
            if hasattr(prediction, 'numpy'):
                prediction = float(prediction.numpy())
            else:
                prediction = float(prediction)
            
            # Classification logic
            if prediction > 0.5:
                label = 'Psoriasis'
                confidence = prediction
            else:
                label = 'Normal'
                confidence = 1 - prediction
            
            return {
                "label": label, 
                "confidence": round(float(confidence), 4),
                "raw_prediction": round(prediction, 4)
            }
        except Exception as e:
            print(f"[Model] Prediction error: {e}")
            return {
                "error": f"Failed to process image: {str(e)}", 
                "label": "Error", 
                "confidence": 0
            }
            
    except ImportError as e:
        # TensorFlow not available, return mock results
        import random
        print(f"[Model] TensorFlow not available: {e}, returning mock prediction")
        return {
            "label": "Psoriasis" if random.random() > 0.5 else "Normal",
            "confidence": round(random.uniform(0.7, 0.99), 4),
            "mock": True
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        result = {"error": "No image path provided. Usage: python predict_wrapper.py <image_path>"}
        print(json.dumps(result))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        result = {"error": f"Image file not found: {image_path}"}
        print(json.dumps(result))
        sys.exit(1)
    
    result = run_prediction(image_path)
    print(json.dumps(result))
