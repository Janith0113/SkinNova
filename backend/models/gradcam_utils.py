"""
GradCAM (Gradient-weighted Class Activation Mapping) utility module
for generating visual explanations of neural network predictions
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
import cv2
import os
from typing import Dict, Tuple, Optional, List
import json


class GradCAM:
    """
    GradCAM implementation for explaining model predictions
    """
    
    def __init__(self, model: keras.Model, layer_name: Optional[str] = None):
        """
        Initialize GradCAM
        
        Args:
            model: Keras model to explain
            layer_name: Name of the layer to compute gradient on (usually last conv layer)
        """
        self.model = model
        self.layer_name = layer_name or self._get_last_conv_layer()
        self.grad_model = self._build_grad_model()
        
    def _get_last_conv_layer(self) -> str:
        """Get the name of the last convolutional layer in the model"""
        for layer in reversed(self.model.layers):
            if 'conv' in layer.name.lower():
                return layer.name
        # Fallback to second to last layer
        return self.model.layers[-2].name
    
    def _build_grad_model(self) -> keras.Model:
        """Build model that outputs both predictions and gradients"""
        last_conv_layer = self.model.get_layer(self.layer_name)
        last_conv_output = last_conv_layer.output
        classifier_input = self.model.input
        classifier_output = self.model.layers[-1].output
        
        return keras.Model(
            inputs=classifier_input,
            outputs=[last_conv_output, classifier_output]
        )
    
    def compute_heatmap(self, img_array: np.ndarray, pred_index: int = None) -> np.ndarray:
        """
        Compute GradCAM heatmap for an image
        
        Args:
            img_array: Input image array (preprocessed)
            pred_index: Class index to compute gradients for (None = predicted class)
            
        Returns:
            Heatmap array normalized to [0, 1]
        """
        with tf.GradientTape() as tape:
            last_conv_output, preds = self.grad_model(img_array, training=False)
            
            if pred_index is None:
                pred_index = tf.argmax(preds[0])
                
            class_channel = preds[:, pred_index]
        
        # Compute gradients
        grads = tape.gradient(class_channel, last_conv_output)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        
        # Compute heatmap
        last_conv_output = last_conv_output[0]
        heatmap = last_conv_output @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        
        # Normalize heatmap
        heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
        
        return heatmap.numpy()
    
    def overlay_heatmap(self, img_path: str, heatmap: np.ndarray, 
                       alpha: float = 0.4, colormap: int = cv2.COLORMAP_JET) -> np.ndarray:
        """
        Overlay heatmap on original image
        
        Args:
            img_path: Path to original image
            heatmap: GradCAM heatmap
            alpha: Transparency of overlay
            colormap: OpenCV colormap
            
        Returns:
            Image with overlaid heatmap
        """
        # Read original image
        img = cv2.imread(img_path)
        if img is None:
            raise ValueError(f"Could not read image at {img_path}")
            
        # Resize heatmap to match image dimensions
        heatmap_resized = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
        heatmap_resized = np.uint8(255 * heatmap_resized)
        
        # Apply colormap
        heatmap_colored = cv2.applyColorMap(heatmap_resized, colormap)
        
        # Overlay on original image
        superimposed_img = cv2.addWeighted(img, 1 - alpha, heatmap_colored, alpha, 0)
        
        return superimposed_img
    
    def get_feature_importance(self, heatmap: np.ndarray, 
                              num_regions: int = 4) -> Dict[str, float]:
        """
        Extract feature importance from heatmap by dividing into regions
        
        Args:
            heatmap: GradCAM heatmap
            num_regions: Number of regions to divide image into (per dimension)
            
        Returns:
            Dictionary with region importance scores
        """
        h, w = heatmap.shape
        region_height = h // num_regions
        region_width = w // num_regions
        
        importance = {}
        for i in range(num_regions):
            for j in range(num_regions):
                y_start = i * region_height
                x_start = j * region_width
                y_end = (i + 1) * region_height if i < num_regions - 1 else h
                x_end = (j + 1) * region_width if j < num_regions - 1 else w
                
                region_name = f"region_{i}_{j}"
                region_importance = np.mean(heatmap[y_start:y_end, x_start:x_end])
                importance[region_name] = float(region_importance)
        
        return importance


class SkinDetectionExplainer:
    """
    Explainer for skin disease detection models
    """
    
    def __init__(self, model_path: str):
        """Initialize with a trained model"""
        self.model = keras.models.load_model(model_path)
        self.gradcam = GradCAM(self.model)
        self.class_names = self._get_class_names()
    
    def _get_class_names(self) -> List[str]:
        """Get class names from model configuration"""
        # This would be customized based on your disease classes
        return ['Healthy', 'Psoriasis', 'Tinea', 'Leprosy', 'Skin Cancer']
    
    def explain_prediction(self, img_path: str, output_dir: str = None) -> Dict:
        """
        Generate comprehensive explanation for a prediction
        
        Args:
            img_path: Path to input image
            output_dir: Directory to save GradCAM visualization
            
        Returns:
            Dictionary with prediction, confidence, and explanation data
        """
        # Load and preprocess image
        img = keras.preprocessing.image.load_img(img_path, target_size=(224, 224))
        img_array = keras.preprocessing.image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0  # Normalize
        
        # Get prediction
        predictions = self.model.predict(img_array, verbose=0)
        pred_class = np.argmax(predictions[0])
        confidence = float(predictions[0][pred_class])
        
        # Compute GradCAM
        heatmap = self.gradcam.compute_heatmap(img_array, pred_class)
        features = self.gradcam.get_feature_importance(heatmap)
        
        # Save visualization if output directory provided
        explanation = {
            'prediction': self.class_names[pred_class],
            'confidence': confidence,
            'all_predictions': {
                self.class_names[i]: float(predictions[0][i]) 
                for i in range(len(self.class_names))
            },
            'gradcam_heatmap': heatmap.tolist(),
            'feature_importance': features,
            'model_layer': self.gradcam.layer_name,
            'top_3_regions': sorted(
                features.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:3]
        }
        
        if output_dir and os.path.exists(output_dir):
            try:
                superimposed = self.gradcam.overlay_heatmap(img_path, heatmap)
                output_path = os.path.join(output_dir, 'gradcam_visualization.jpg')
                cv2.imwrite(output_path, superimposed)
                explanation['visualization_path'] = output_path
            except Exception as e:
                print(f"Warning: Could not save visualization: {e}")
        
        return explanation


def generate_quiz_explanation(answers: List[Dict], primary_dosha: str) -> Dict:
    """
    Generate GradCAM-style explanation for quiz answers
    
    Args:
        answers: List of answer dictionaries with question data
        primary_dosha: Predicted dosha type
        
    Returns:
        Explanation dictionary
    """
    # Feature weights for each dosha type
    dosha_features = {
        'vata': {
            'body_frame': 0.12,
            'skin_type': 0.14,
            'energy_level': 0.10,
            'emotional_state': 0.10,
            'movement': 0.09,
        },
        'pitta': {
            'skin_type': 0.15,
            'appetite': 0.12,
            'emotional_state': 0.11,
            'body_temperature': 0.11,
            'body_odor': 0.10,
        },
        'kapha': {
            'body_frame': 0.13,
            'skin_type': 0.13,
            'sleep_pattern': 0.11,
            'bowel_habit': 0.10,
            'nails': 0.09,
        }
    }
    
    weights = dosha_features.get(primary_dosha, {})
    explanations = []
    
    for answer in answers:
        category = answer.get('category', 'unknown')
        weight = weights.get(category, 0.08)
        importance_score = weight * 100
        
        explanations.append({
            'question_id': answer.get('questionId'),
            'category': category,
            'feature_importance': importance_score,
            'answer_alignment': 1.0 if answer.get('dosha') == primary_dosha else 0.4
        })
    
    return {
        'dosha': primary_dosha,
        'explanations': explanations,
        'total_importance': sum(e['feature_importance'] for e in explanations)
    }


if __name__ == '__main__':
    # Example usage
    print("GradCAM utilities loaded successfully")
