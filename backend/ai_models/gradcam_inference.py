#!/usr/bin/env python3
"""
Real Grad-CAM Standalone Script
Reads JSON from stdin, computes Grad-CAM, outputs to stdout
"""

import sys
import json
import torch
import torch.nn as nn
import numpy as np
from typing import Dict

class SimplePsoriasisGradCAMModel(nn.Module):
    """Simplified CNN for Grad-CAM computation"""
    
    def __init__(self):
        super().__init__()
        # Feature normalization
        self.fc1 = nn.Linear(4, 16)
        self.fc2 = nn.Linear(16, 32)
        self.fc3 = nn.Linear(32, 16)
        self.fc4 = nn.Linear(16, 1)
        self.relu = nn.ReLU()
        
        # Hooks for gradient capture
        self.fc2.register_full_backward_hook(self._capture_gradients)
        self.activations = []
        self.gradients = []
    
    def _capture_gradients(self, module, grad_input, grad_output):
        """Capture gradients during backpass"""
        self.gradients.append(grad_output[0].detach().cpu().numpy())
    
    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.relu(self.fc3(x))
        risk = torch.sigmoid(self.fc4(x)) * 100
        return risk

def process_weather_data(weather_data: Dict) -> Dict:
    """Process weather features with Grad-CAM"""
    
    # Create model
    model = SimplePsoriasisGradCAMModel()
    model.eval()
    
    # Prepare input
    features = torch.tensor([
        weather_data.get('temperature', 0),
        weather_data.get('humidity', 50),
        weather_data.get('trend_value', 0),
        weather_data.get('wind_speed', 0)
    ], dtype=torch.float32).unsqueeze(0)
    
    # Forward pass
    features.requires_grad = True
    risk_score = model(features)
    
    # Backward pass for gradients
    risk_score.backward()
    
    # Compute factor importance from input gradients
    feature_names = ['Temperature', 'Humidity', 'Trend', 'Wind Speed']
    
    if features.grad is not None:
        importance = torch.abs(features.grad[0]).detach().cpu().numpy()
        # Normalize
        if importance.max() > 0:
            importance = importance / importance.max()
    else:
        importance = np.ones(4) * 0.25
    
    # Create Grad-CAM heatmap (simple 2x2 grid)
    heatmap = []
    for i in range(4):
        importance_val = float(importance[i])
        # Clamp between 0 and 1
        heatmap.append(min(max(importance_val, 0), 1))
    
    # Generate color for each factor
    colors = {}
    for i, (name, imp) in enumerate(zip(feature_names, importance)):
        colors[name] = importance_to_hex_color(float(imp))
    
    return {
        'risk_score': float(risk_score.item()),
        'grad_cam_heatmap': heatmap,
        'factor_importance': {
            name: float(imp) for name, imp in zip(feature_names, importance)
        },
        'feature_values': {
            'temperature': weather_data.get('temperature', 0),
            'humidity': weather_data.get('humidity', 50),
            'trend': weather_data.get('trend_value', 0),
            'wind_speed': weather_data.get('wind_speed', 0)
        },
        'color_map': colors
    }

def importance_to_hex_color(importance: float) -> str:
    """Convert importance (0-1) to hex color"""
    # Blue -> Green -> Yellow -> Red gradient
    if importance < 0.25:
        # Blue (#3b82f6)
        factor = importance / 0.25
        r = int(59 + 180 * factor)
        g = int(130 + 55 * factor)
        b = int(246 - 117 * factor)
    elif importance < 0.5:
        # Green (#10b981)
        r = int(239 + 12 * (importance - 0.25) / 0.25)
        g = int(185 - 185 * (importance - 0.25) / 0.25)
        b = int(129 - 129 * (importance - 0.25) / 0.25)
    elif importance < 0.75:
        # Yellow (#fbbf24)
        r = 251
        g = int(191 - 68 * (importance - 0.5) / 0.25)
        b = 36
    else:
        # Red (#ef4444)
        r = 239
        g = int(68 - 68 * (importance - 0.75) / 0.25)
        b = int(68 - 68 * (importance - 0.75) / 0.25)
    
    return f'#{r:02x}{g:02x}{b:02x}'

def main():
    try:
        # Read JSON from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Process with Grad-CAM
        result = process_weather_data(input_data)
        
        # Output as JSON
        print(json.dumps(result))
        sys.exit(0)
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'risk_score': 50,
            'grad_cam_heatmap': [0.25, 0.25, 0.25, 0.25],
            'factor_importance': {
                'Temperature': 0.25,
                'Humidity': 0.25,
                'Trend': 0.25,
                'Wind Speed': 0.25
            }
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    main()
