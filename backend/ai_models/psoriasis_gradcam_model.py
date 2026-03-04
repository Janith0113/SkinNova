"""
Real Grad-CAM Implementation for Psoriasis Risk Analysis
Author: AI Medical Assistant
Description: PyTorch-based CNN model with Grad-CAM for explainable AI visualization
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Dict, Tuple, List
import cv2


class PsoriasisRiskCNN(nn.Module):
    """
    CNN model for psoriasis risk prediction
    Input: Weather features (temperature, humidity, wind speed, trend)
    Output: Risk score (0-100) with activation maps
    """
    
    def __init__(self, input_features: int = 4):
        super(PsoriasisRiskCNN, self).__init__()
        
        # Reshape 4 features into (1, 2, 2) spatial format for CNN
        self.input_features = input_features
        
        # Convolutional layers
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(16)
        self.relu1 = nn.ReLU()
        
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(32)
        self.relu2 = nn.ReLU()
        
        self.conv3 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(64)
        self.relu3 = nn.ReLU()
        
        # Global average pooling
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        
        # Fully connected layers
        self.fc1 = nn.Linear(64, 128)
        self.dropout1 = nn.Dropout(0.3)
        self.fc2 = nn.Linear(128, 64)
        self.dropout2 = nn.Dropout(0.3)
        self.fc3 = nn.Linear(64, 1)  # Risk score output
        
        # Store for Grad-CAM
        self.activation = None
        self.gradient = None
        
        # Register hook to capture activations
        self.conv3.register_forward_hook(self._forward_hook)
        self.conv3.register_backward_hook(self._backward_hook)
    
    def _forward_hook(self, module, input, output):
        """Store activations from conv3 layer"""
        self.activation = output.detach()
    
    def _backward_hook(self, module, grad_input, grad_output):
        """Store gradients from conv3 layer"""
        self.gradient = grad_output[0].detach()
    
    def forward(self, x):
        """Forward pass through network"""
        # Reshape input features to 2D spatial format
        batch_size = x.size(0)
        x = x.view(batch_size, 1, 2, 2)
        
        # Conv block 1
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu1(x)
        
        # Conv block 2
        x = self.conv2(x)
        x = self.bn2(x)
        x = self.relu2(x)
        
        # Conv block 3
        x = self.conv3(x)
        x = self.bn3(x)
        x = self.relu3(x)
        
        # Global average pooling
        x = self.pool(x)
        x = x.view(batch_size, -1)
        
        # Fully connected layers
        x = self.fc1(x)
        x = self.relu1(x)
        x = self.dropout1(x)
        
        x = self.fc2(x)
        x = self.relu2(x)
        x = self.dropout2(x)
        
        # Output risk score (scaled to 0-100)
        x = self.fc3(x)
        risk_score = torch.sigmoid(x) * 100  # Scale to 0-100
        
        return risk_score
    
    def get_grad_cam(self) -> np.ndarray:
        """
        Compute Grad-CAM heatmap
        Combines gradients and activations to show important regions
        """
        if self.gradient is None or self.activation is None:
            raise ValueError("Gradients and activations not captured. Run forward-backward pass first.")
        
        # Get gradients and activations
        gradients = self.gradient.cpu().numpy()
        activations = self.activation.cpu().numpy()
        
        # Average gradients across channels
        grad_cam = np.mean(gradients, axis=1)  # Shape: (batch, height, width)
        
        # Weight activations by gradients
        batch_size = grad_cam.shape[0]
        heatmaps = []
        
        for b in range(batch_size):
            # Compute weighted sum
            cam = np.zeros((activations.shape[2], activations.shape[3]))
            
            for c in range(activations.shape[1]):
                cam += gradients[b, c, :, :] * activations[b, c, :, :]
            
            # Apply ReLU to keep only positive contributions
            cam = np.maximum(cam, 0)
            
            # Normalize
            if cam.max() > 0:
                cam = cam / cam.max()
            
            heatmaps.append(cam)
        
        return np.array(heatmaps)


class GradCAMExplainer:
    """
    Grad-CAM explainer for model interpretability
    Generates visual explanations for model predictions
    """
    
    def __init__(self, model: PsoriasisRiskCNN, device: str = 'cpu'):
        self.model = model
        self.device = device
        self.feature_names = ['Temperature', 'Humidity', 'Trend', 'Wind Speed']
    
    def explain(self, weather_features: Dict[str, float]) -> Dict:
        """
        Generate Grad-CAM explanation for weather input
        
        Args:
            weather_features: Dict with keys 'temperature', 'humidity', 'trend_value', 'wind_speed'
        
        Returns:
            Dictionary with risk score, Grad-CAM heatmap, and factor importance
        """
        # Prepare input
        features = torch.tensor([
            weather_features.get('temperature', 0),
            weather_features.get('humidity', 50),
            weather_features.get('trend_value', 0),
            weather_features.get('wind_speed', 0)
        ], dtype=torch.float32, device=self.device).unsqueeze(0)
        
        # Enable gradient computation
        features.requires_grad = True
        self.model.train()
        
        # Forward pass
        risk_score = self.model(features)
        
        # Backward pass for gradients
        risk_score.backward()
        
        # Get Grad-CAM heatmap
        grad_cam_maps = self.model.get_grad_cam()
        
        # Normalize Grad-CAM to 0-1 range
        grad_cam = grad_cam_maps[0]  # Single batch
        if grad_cam.max() > 0:
            grad_cam = grad_cam / grad_cam.max()
        
        # Compute factor importance from gradients
        with torch.no_grad():
            if features.grad is not None:
                factor_importance = torch.abs(features.grad[0]).cpu().numpy()
                # Normalize
                if factor_importance.max() > 0:
                    factor_importance = factor_importance / factor_importance.max()
            else:
                factor_importance = np.ones(4) * 0.25
        
        return {
            'risk_score': float(risk_score.item()),
            'grad_cam_heatmap': grad_cam.tolist(),
            'factor_importance': dict(zip(self.feature_names, factor_importance.tolist())),
            'feature_values': {
                'temperature': weather_features.get('temperature', 0),
                'humidity': weather_features.get('humidity', 50),
                'trend': weather_features.get('trend_value', 0),
                'wind_speed': weather_features.get('wind_speed', 0)
            }
        }
    
    def visualize_grad_cam(self, grad_cam_heatmap: np.ndarray, feature_names: List[str]) -> Dict:
        """
        Generate color-mapped Grad-CAM visualization
        
        Args:
            grad_cam_heatmap: Normalized heatmap (0-1)
            feature_names: Names of weather features
        
        Returns:
            RGB color mapping for visualization
        """
        # Upsample heatmap to 4x4 for features
        heatmap_upsampled = cv2.resize(grad_cam_heatmap, (2, 2))
        
        # Convert to RGB using colormap
        heatmap_uint8 = (heatmap_upsampled * 255).astype(np.uint8)
        
        # Apply colormap (jet: blue=low, red=high)
        heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        
        # Map to features
        visualization = {}
        for i, feature_name in enumerate(feature_names):
            # Get intensity for this feature (simple mapping for 4 features)
            intensity = heatmap_upsampled.flatten()[i % len(heatmap_upsampled.flatten())]
            
            # Convert to RGB hex color
            color_intensity = int(intensity * 255)
            rgb = cv2.applyColorMap(np.array([[color_intensity]], dtype=np.uint8), cv2.COLORMAP_JET)
            b, g, r = rgb[0][0]
            hex_color = f'#{r:02x}{g:02x}{b:02x}'
            
            visualization[feature_name] = {
                'intensity': float(intensity),
                'color': hex_color,
                'importance_score': float(intensity * 100)
            }
        
        return visualization


def load_pretrained_model(device: str = 'cpu') -> PsoriasisRiskCNN:
    """
    Load pretrained model or create new one
    In production, this would load from saved weights
    """
    model = PsoriasisRiskCNN(input_features=4)
    model.to(device)
    model.eval()
    return model


# Example usage
if __name__ == '__main__':
    # Initialize model
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    model = load_pretrained_model(device)
    
    # Create explainer
    explainer = GradCAMExplainer(model, device)
    
    # Test with sample weather data
    weather_data = {
        'temperature': 8,
        'humidity': 65,
        'trend_value': -0.5,  # Cooling trend
        'wind_speed': 18
    }
    
    # Get explanation
    explanation = explainer.explain(weather_data)
    print("Risk Score:", explanation['risk_score'])
    print("Factor Importance:", explanation['factor_importance'])
    print("Grad-CAM Heatmap:", explanation['grad_cam_heatmap'])
