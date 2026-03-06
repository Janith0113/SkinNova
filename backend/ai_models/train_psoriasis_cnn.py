"""
CNN Model Training Script for Psoriasis Risk Analysis
Trains the neural network on historical weather + psoriasis data
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from torch.utils.data import DataLoader, TensorDataset
import json
import os
from pathlib import Path


class PsoriasisRiskCNN(nn.Module):
    """CNN model for psoriasis risk prediction"""
    
    def __init__(self, input_features: int = 4):
        super(PsoriasisRiskCNN, self).__init__()
        
        # Convolutional layers
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(16)
        self.relu = nn.ReLU()
        
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(32)
        
        self.conv3 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(64)
        
        # Global average pooling
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        
        # Fully connected layers
        self.fc1 = nn.Linear(64, 128)
        self.dropout1 = nn.Dropout(0.3)
        self.fc2 = nn.Linear(128, 64)
        self.dropout2 = nn.Dropout(0.3)
        self.fc3 = nn.Linear(64, 1)
        
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
        x = self.relu(x)
        
        # Conv block 2
        x = self.conv2(x)
        x = self.bn2(x)
        x = self.relu(x)
        
        # Conv block 3
        x = self.conv3(x)
        x = self.bn3(x)
        x = self.relu(x)
        
        # Global average pooling
        x = self.pool(x)
        x = x.view(batch_size, -1)
        
        # Fully connected layers
        x = self.fc1(x)
        x = self.relu(x)
        x = self.dropout1(x)
        
        x = self.fc2(x)
        x = self.relu(x)
        x = self.dropout2(x)
        
        # Output risk score (scaled to 0-100)
        x = self.fc3(x)
        risk_score = torch.sigmoid(x) * 100
        
        return risk_score


def generate_synthetic_training_data(num_samples: int = 1000):
    """
    Generate synthetic training data based on psoriasis medical knowledge
    
    In production, this would use real patient data from database
    """
    np.random.seed(42)
    
    weather_data = []
    risk_scores = []
    
    for _ in range(num_samples):
        # Generate random weather features
        temperature = np.random.uniform(-10, 35)  # -10°C to 35°C
        humidity = np.random.uniform(10, 95)      # 10% to 95%
        trend_value = np.random.uniform(-2, 2)    # -2 to +2 (cooling/warming)
        wind_speed = np.random.uniform(0, 50)     # 0 to 50 km/h
        
        # Calculate risk score based on medical knowledge
        # (This is what the model should learn)
        risk = calculate_risk_from_weather(
            temperature, humidity, trend_value, wind_speed
        )
        
        weather_data.append([temperature, humidity, trend_value, wind_speed])
        risk_scores.append([risk])
    
    return np.array(weather_data), np.array(risk_scores)


def calculate_risk_from_weather(temp: float, humidity: float, trend: float, wind: float) -> float:
    """
    Calculate psoriasis risk based on weather (ground truth for training)
    
    Based on medical research:
    - Cold temps (< 10°C) increase risk
    - Low humidity (< 30%) increase risk
    - Cooling trend increases risk
    - High wind increases risk
    """
    risk = 0
    
    # Temperature factor (0-50 points)
    if temp <= 0:
        temp_risk = 50
    elif temp >= 30:
        temp_risk = 5
    else:
        temp_risk = max(5, 50 - (temp * 1.5))
    risk += temp_risk
    
    # Humidity factor (0-45 points)
    if humidity <= 10:
        humidity_risk = 45
    elif humidity < 40:
        humidity_risk = max(0, 45 - (humidity * 1.125))
    elif humidity <= 85:
        humidity_risk = 0
    else:
        humidity_risk = min(10, 5 + (humidity - 85) * 0.2)
    risk += humidity_risk
    
    # Trend factor (0-15 points)
    if trend < -0.5:
        trend_risk = 15
    elif trend > 0.5:
        trend_risk = 5
    else:
        trend_risk = 0
    risk += trend_risk
    
    # Wind factor (0-20 points)
    if wind > 30:
        wind_risk = 20
    elif wind > 15:
        wind_risk = 10
    else:
        wind_risk = 0
    risk += wind_risk
    
    return min(100, risk)  # Cap at 100


def train_model(
    model: PsoriasisRiskCNN,
    train_loader: DataLoader,
    val_loader: DataLoader,
    num_epochs: int = 50,
    device: str = 'cpu'
):
    """
    Train the CNN model
    
    Steps:
    1. Forward pass - feed data through network
    2. Compute loss - how wrong is the prediction?
    3. Backward pass - compute gradients
    4. Update weights - optimizer changes model parameters
    5. Repeat until convergence
    """
    
    # Define loss function (MSE = Mean Squared Error)
    # Measures difference between predicted and actual risk
    criterion = nn.MSELoss()
    
    # Define optimizer (Adam = adaptive learning rate algorithm)
    # Adjusts model weights to minimize loss
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # Learning rate scheduler - reduce learning rate as training progresses
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.5)
    
    train_losses = []
    val_losses = []
    
    print("🚀 Starting training...")
    print(f"Device: {device}")
    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    print(f"Epochs: {num_epochs}\n")
    
    for epoch in range(num_epochs):
        # ============ TRAINING PHASE ============
        model.train()  # Set model to training mode
        total_train_loss = 0
        
        for batch_idx, (features, targets) in enumerate(train_loader):
            features = features.to(device)
            targets = targets.to(device)
            
            # Step 1: Forward pass
            # Input weather data → Network → Predicted risk score
            predictions = model(features)
            
            # Step 2: Calculate loss
            # How far off are our predictions?
            loss = criterion(predictions, targets)
            
            # Step 3: Backward pass
            # Compute gradients (derivative of loss w.r.t. weights)
            optimizer.zero_grad()  # Clear old gradients
            loss.backward()         # Compute new gradients (backpropagation)
            
            # Step 4: Update weights
            # Adjust model parameters based on gradients
            optimizer.step()
            
            total_train_loss += loss.item()
        
        avg_train_loss = total_train_loss / len(train_loader)
        train_losses.append(avg_train_loss)
        
        # ============ VALIDATION PHASE ============
        model.eval()  # Set model to evaluation mode
        total_val_loss = 0
        
        with torch.no_grad():  # Don't compute gradients (faster)
            for features, targets in val_loader:
                features = features.to(device)
                targets = targets.to(device)
                
                # Forward pass only (no backprop)
                predictions = model(features)
                loss = criterion(predictions, targets)
                total_val_loss += loss.item()
        
        avg_val_loss = total_val_loss / len(val_loader)
        val_losses.append(avg_val_loss)
        
        # Update learning rate
        scheduler.step()
        
        # Print progress
        if (epoch + 1) % 5 == 0:
            print(f"Epoch {epoch+1:3d}/{num_epochs} | "
                  f"Train Loss: {avg_train_loss:.6f} | "
                  f"Val Loss: {avg_val_loss:.6f}")
    
    print("\n✅ Training complete!")
    return train_losses, val_losses


def evaluate_model(model: PsoriasisRiskCNN, test_loader: DataLoader, device: str = 'cpu'):
    """Evaluate model on test data"""
    model.eval()
    criterion = nn.MSELoss()
    
    total_loss = 0
    predictions = []
    targets = []
    
    with torch.no_grad():
        for features, target in test_loader:
            features = features.to(device)
            target = target.to(device)
            
            pred = model(features)
            loss = criterion(pred, target)
            total_loss += loss.item()
            
            predictions.append(pred.cpu().numpy())
            targets.append(target.cpu().numpy())
    
    avg_loss = total_loss / len(test_loader)
    predictions = np.concatenate(predictions)
    targets = np.concatenate(targets)
    
    # Calculate metrics
    mae = np.mean(np.abs(predictions - targets))
    mse = np.mean((predictions - targets) ** 2)
    rmse = np.sqrt(mse)
    
    print(f"\n📊 Test Results:")
    print(f"Loss (MSE): {avg_loss:.6f}")
    print(f"Mean Absolute Error: {mae:.2f}")
    print(f"Root Mean Squared Error: {rmse:.2f}")
    
    return avg_loss, mae, rmse


def save_model(model: PsoriasisRiskCNN, filepath: str):
    """Save trained model weights"""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    torch.save(model.state_dict(), filepath)
    print(f"✅ Model saved to {filepath}")


def load_model(model: PsoriasisRiskCNN, filepath: str, device: str = 'cpu'):
    """Load trained model weights"""
    if not os.path.exists(filepath):
        print(f"⚠️  Model not found at {filepath}")
        return model
    
    model.load_state_dict(torch.load(filepath, map_location=device))
    print(f"✅ Model loaded from {filepath}")
    return model


def main():
    """Main training pipeline"""
    
    # Configuration
    DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
    NUM_EPOCHS = 50
    BATCH_SIZE = 32
    TRAIN_SIZE = 800
    VAL_SIZE = 100
    TEST_SIZE = 100
    MODEL_PATH = 'backend/ai_models/psoriasis_cnn_weights.pth'
    
    print(f"🎯 CNN Training Pipeline for Psoriasis Risk")
    print(f"Device: {DEVICE}\n")
    
    # Step 1: Generate synthetic training data
    print("📊 Generating synthetic training data...")
    X, y = generate_synthetic_training_data(TRAIN_SIZE + VAL_SIZE + TEST_SIZE)
    
    # Split data
    X_train = X[:TRAIN_SIZE]
    y_train = y[:TRAIN_SIZE]
    X_val = X[TRAIN_SIZE:TRAIN_SIZE+VAL_SIZE]
    y_val = y[TRAIN_SIZE:TRAIN_SIZE+VAL_SIZE]
    X_test = X[TRAIN_SIZE+VAL_SIZE:]
    y_test = y[TRAIN_SIZE+VAL_SIZE:]
    
    # Normalize features
    X_mean = X_train.mean(axis=0)
    X_std = X_train.std(axis=0) + 1e-6
    X_train = (X_train - X_mean) / X_std
    X_val = (X_val - X_mean) / X_std
    X_test = (X_test - X_mean) / X_std
    
    # Convert to PyTorch tensors
    train_dataset = TensorDataset(
        torch.FloatTensor(X_train),
        torch.FloatTensor(y_train)
    )
    val_dataset = TensorDataset(
        torch.FloatTensor(X_val),
        torch.FloatTensor(y_val)
    )
    test_dataset = TensorDataset(
        torch.FloatTensor(X_test),
        torch.FloatTensor(y_test)
    )
    
    # Create data loaders
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE)
    
    print(f"✅ Data generated!")
    print(f"Training samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")
    print(f"Test samples: {len(test_dataset)}\n")
    
    # Step 2: Create model
    print("🧠 Creating CNN model...")
    model = PsoriasisRiskCNN(input_features=4)
    model.to(DEVICE)
    
    total_params = sum(p.numel() for p in model.parameters())
    print(f"✅ Model created! Total parameters: {total_params:,}\n")
    
    # Step 3: Train model
    train_losses, val_losses = train_model(
        model,
        train_loader,
        val_loader,
        num_epochs=NUM_EPOCHS,
        device=DEVICE
    )
    
    # Step 4: Evaluate on test set
    evaluate_model(model, test_loader, device=DEVICE)
    
    # Step 5: Save model
    save_model(model, MODEL_PATH)
    
    print("\n🎉 Training pipeline complete!")


if __name__ == '__main__':
    main()
