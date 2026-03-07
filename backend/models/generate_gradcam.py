#!/usr/bin/env python3
"""
Generate GradCAM visualization for model predictions
Usage: python generate_gradcam.py <image_path> <model_type>
"""

import sys
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
import cv2
import base64
import os
from pathlib import Path

# Import GradCAM utilities
sys.path.insert(0, os.path.dirname(__file__))
from gradcam_utils import GradCAM, SkinDetectionExplainer


def load_and_preprocess_image(image_path: str, target_size=(224, 224)):
    """Load and preprocess image for model"""
    img = keras.preprocessing.image.load_img(image_path, target_size=target_size)
    img_array = keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0  # Normalize
    return img_array


def get_model_path(model_type: str) -> str:
    """Get the appropriate model path based on type"""
    models_dir = os.path.dirname(__file__)
    model_paths = {
        'psoriasis': os.path.join(models_dir, 'best_psoriasis_model (2).keras'),
        'tinea': os.path.join(models_dir, 'best_tinea_model.keras'),
        'leprosy': os.path.join(models_dir, 'best_leprosy_model.keras'),
        'skin-cancer': os.path.join(models_dir, 'skin_cancer_model.keras'),
    }
    
    model_path = model_paths.get(model_type)
    if not model_path or not os.path.exists(model_path):
        # Try to find any .keras file
        for file in os.listdir(models_dir):
            if file.endswith('.keras') and model_type.lower() in file.lower():
                return os.path.join(models_dir, file)
    
    return model_path


def generate_gradcam_explanation(image_path: str, model_type: str = 'psoriasis'):
    """
    Generate GradCAM explanation for an image
    
    Args:
        image_path: Path to input image
        model_type: Type of model to use (psoriasis, tinea, leprosy, skin-cancer)
        
    Returns:
        Dictionary with explanation data
    """
    try:
        # Validate image exists
        if not os.path.exists(image_path):
            raise ValueError(f"Image not found: {image_path}")
        
        # Find and load model
        model_path = get_model_path(model_type)
        if not model_path or not os.path.exists(model_path):
            # Return mock data if model not found (for development/testing)
            return generate_mock_explanation(image_path, model_type)
        
        try:
            # Load model
            model = keras.models.load_model(model_path)
        except Exception as e:
            print(f"Warning: Could not load {model_type} model: {e}", file=sys.stderr)
            return generate_mock_explanation(image_path, model_type)
        
        # Load and preprocess image
        img_array = load_and_preprocess_image(image_path)
        
        # Get prediction
        predictions = model.predict(img_array, verbose=0)
        pred_class = np.argmax(predictions[0])
        confidence = float(predictions[0][pred_class])
        
        # Initialize GradCAM
        gradcam = GradCAM(model)
        
        # Compute heatmap
        heatmap = gradcam.compute_heatmap(img_array, pred_class)
        
        # Get feature importance
        features = gradcam.get_feature_importance(heatmap, num_regions=4)
        
        # Get class names
        class_names_map = {
            'psoriasis': ['No Psoriasis', 'Psoriasis'],
            'tinea': ['Healthy', 'Tinea'],
            'leprosy': ['Healthy', 'Leprosy'],
            'skin-cancer': ['Benign', 'Malignant'],
        }
        
        class_names = class_names_map.get(model_type, ['Class 0', 'Class 1'])
        
        # Prepare heatmap for JSON serialization
        heatmap_base64 = encode_heatmap_as_base64(heatmap)
        
        return {
            'success': True,
            'prediction': class_names[pred_class],
            'confidence': float(confidence),
            'all_predictions': {
                class_names[i]: float(predictions[0][i])
                for i in range(len(predictions[0]))
            },
            'heatmap_base64': heatmap_base64,
            'feature_importance': features,
            'model_layer': gradcam.layer_name,
            'model_type': model_type,
            'top_regions': sorted(
                features.items(),
                key=lambda x: x[1],
                reverse=True
            )[:3],
            'explanation': generate_explanation_text(
                class_names[pred_class],
                confidence,
                features
            ),
        }
        
    except Exception as e:
        print(f"Error in generate_gradcam_explanation: {str(e)}", file=sys.stderr)
        return {
            'error': str(e),
            'model_type': model_type,
        }


def encode_heatmap_as_base64(heatmap: np.ndarray) -> str:
    """Encode heatmap as base64 for JSON transmission"""
    # Convert heatmap to uint8
    heatmap_uint8 = np.uint8(heatmap * 255)
    
    # Resize to smaller size for transmission
    resized = cv2.resize(heatmap_uint8, (224, 224))
    
    # Encode as base64
    import base64
    _, buffer = cv2.imencode('.jpg', resized)
    base64_str = base64.b64encode(buffer).decode('utf-8')
    
    return f"data:image/jpeg;base64,{base64_str}"


def generate_explanation_text(prediction: str, confidence: float, 
                             features: dict) -> str:
    """Generate human-readable explanation"""
    top_region = max(features.items(), key=lambda x: x[1])[0]
    
    explanations = {
        'Psoriasis': f"The model identified psoriasis with {confidence*100:.1f}% confidence. The lesion characteristics are most visible in the {top_region}.",
        'Tinea': f"The model identified tinea fungal infection with {confidence*100:.1f}% confidence. Fungal features are prominently visible in the {top_region}.",
        'Leprosy': f"The model identified possible leprosy indicators with {confidence*100:.1f}% confidence. Key markers are concentrated in the {top_region}.",
        'Skin Cancer': f"The model identified potential suspicious area with {confidence*100:.1f}% confidence. Concerning features are in the {top_region}.",
        'Healthy': f"The model indicates healthy skin with {confidence*100:.1f}% confidence. No significant abnormalities detected.",
        'No Psoriasis': f"The model indicates no psoriasis detected with {confidence*100:.1f}% confidence.",
        'Benign': f"The model indicates benign lesion with {confidence*100:.1f}% confidence.",
    }
    
    return explanations.get(prediction, f"Prediction: {prediction} (Confidence: {confidence*100:.1f}%)")


def generate_mock_explanation(image_path: str, model_type: str) -> dict:
    """Generate mock explanation for testing (when model not available)"""
    import random
    
    class_names_map = {
        'psoriasis': ['No Psoriasis', 'Psoriasis'],
        'tinea': ['Healthy', 'Tinea'],
        'leprosy': ['Healthy', 'Leprosy'],
        'skin-cancer': ['Benign', 'Malignant'],
    }
    
    class_names = class_names_map.get(model_type, ['Class 0', 'Class 1'])
    
    # Generate random heatmap
    heatmap = np.random.rand(224, 224)
    heatmap_base64 = encode_heatmap_as_base64(heatmap)
    
    # Generate features
    features = {
        f"region_{i}_{j}": float(random.uniform(0.3, 0.9))
        for i in range(4)
        for j in range(4)
    }
    
    predictions = [random.uniform(0.3, 0.8), random.uniform(0.2, 0.7)]
    predictions = [p / sum(predictions) for p in predictions]  # Normalize
    
    pred_idx = np.argmax(predictions)
    confidence = float(predictions[pred_idx])
    
    return {
        'success': True,
        'prediction': class_names[pred_idx],
        'confidence': confidence,
        'all_predictions': {
            class_names[i]: predictions[i]
            for i in range(len(class_names))
        },
        'heatmap_base64': heatmap_base64,
        'feature_importance': features,
        'model_layer': 'conv_pw_13',
        'model_type': model_type,
        'top_regions': sorted(
            features.items(),
            key=lambda x: x[1],
            reverse=True
        )[:3],
        'explanation': f"Mock explanation for {model_type} model. Actual model not available.",
        'mock': True,
    }


if __name__ == '__main__':
    # Parse command line arguments
    if len(sys.argv) < 2:
        print(json.dumps({
            'error': 'Usage: python generate_gradcam.py <image_path> [model_type]'
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    model_type = sys.argv[2] if len(sys.argv) > 2 else 'psoriasis'
    
    # Generate and output explanation
    result = generate_gradcam_explanation(image_path, model_type)
    print(json.dumps(result))
