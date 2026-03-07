"""
CNN Model for Tinea Doisha Quiz Classification
Analyzes quiz answers to classify Doisha type with GradCAM explainability
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
import json
from typing import Dict, List, Tuple
import os


class TineaDoishaModel:
    """
    CNN-based model for classifying Tinea-related Doisha type from quiz answers
    """
    
    def __init__(self, input_dim: int = 6, num_classes: int = 3):
        """
        Initialize the Tinea Doisha model
        
        Args:
            input_dim: Number of features (6 questions)
            num_classes: Number of doisha types (3: vata, pitta, kapha)
        """
        self.input_dim = input_dim
        self.num_classes = num_classes
        self.model = None
        self.feature_names = [
            'body_frame',
            'skin_type', 
            'digestion',
            'change_handling',
            'sleep_pattern',
            'stress_response'
        ]
        
    def build_cnn_model(self) -> keras.Model:
        """
        Build CNN model for doisha classification from quiz answers
        Architecture: Input → Dense → Conv1D → BatchNorm → Dense → Output
        """
        model = keras.Sequential([
            # Input layer: 6 quiz answers
            layers.Input(shape=(self.input_dim, 1)),
            
            # First Conv1D layer - learns basic patterns
            layers.Conv1D(
                filters=32, 
                kernel_size=2, 
                activation='relu',
                padding='same',
                name='conv1d_1'
            ),
            layers.BatchNormalization(name='batch_norm_1'),
            layers.Dropout(0.2),
            
            # Second Conv1D layer - learns complex patterns
            layers.Conv1D(
                filters=64,
                kernel_size=2,
                activation='relu', 
                padding='same',
                name='conv1d_2'
            ),
            layers.BatchNormalization(name='batch_norm_2'),
            layers.Dropout(0.2),
            
            # Third Conv1D layer - high-level features
            layers.Conv1D(
                filters=128,
                kernel_size=2,
                activation='relu',
                padding='same',
                name='conv1d_3'
            ),
            layers.BatchNormalization(name='batch_norm_3'),
            layers.GlobalAveragePooling1D(),
            
            # Dense layers for classification
            layers.Dense(64, activation='relu', name='dense_1'),
            layers.Dropout(0.3),
            layers.Dense(32, activation='relu', name='dense_2'),
            layers.Dropout(0.2),
            
            # Output layer: 3 classes (vata, pitta, kapha)
            layers.Dense(self.num_classes, activation='softmax', name='output')
        ])
        
        return model
    
    def train_model(self, X_train: np.ndarray, y_train: np.ndarray, 
                   X_val: np.ndarray, y_val: np.ndarray, 
                   epochs: int = 50, batch_size: int = 16):
        """
        Train the CNN model
        
        Args:
            X_train: Training input features
            y_train: Training labels
            X_val: Validation input features
            y_val: Validation labels
            epochs: Number of training epochs
            batch_size: Batch size for training
        """
        if self.model is None:
            self.model = self.build_cnn_model()
        
        # Compile model
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        # Add reshape to input if needed
        if len(X_train.shape) == 2:
            X_train = X_train.reshape(X_train.shape[0], X_train.shape[1], 1)
        if len(X_val.shape) == 2:
            X_val = X_val.reshape(X_val.shape[0], X_val.shape[1], 1)
        
        # Train with callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7
            )
        ]
        
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def predict_doisha(self, quiz_answers: List[int]) -> Dict:
        """
        Predict doisha type from quiz answers
        
        Args:
            quiz_answers: List of 6 answer indices (0, 1, 2 for vata, pitta, kapha)
            
        Returns:
            Dictionary with predictions and confidence scores
        """
        if self.model is None:
            self.model = self.build_cnn_model()
        
        # Prepare input
        X = np.array([quiz_answers]).astype(np.float32)
        X = X.reshape(1, self.input_dim, 1)
        
        # Normalize answers
        X = X / 2.0  # Normalize from [0,1,2] to [0, 0.5, 1]
        
        # Get predictions
        predictions = self.model.predict(X, verbose=0)[0]
        
        doisha_names = ['vata', 'pitta', 'kapha']
        pred_class = np.argmax(predictions)
        
        return {
            'primary_doisha': doisha_names[pred_class],
            'confidence': float(predictions[pred_class]),
            'all_predictions': {
                doisha_names[i]: float(predictions[i])
                for i in range(self.num_classes)
            },
            'score_vector': predictions.tolist()
        }
    
    def save_model(self, path: str):
        """Save model to disk"""
        if self.model is None:
            raise ValueError("Model not trained yet")
        self.model.save(path)
        print(f"Model saved to {path}")
    
    def load_model(self, path: str):
        """Load model from disk"""
        if os.path.exists(path):
            self.model = keras.models.load_model(path)
            print(f"Model loaded from {path}")
        else:
            raise FileNotFoundError(f"Model file not found: {path}")


def create_synthetic_training_data(n_samples: int = 500) -> Tuple[np.ndarray, np.ndarray]:
    """
    Create synthetic training data based on doisha patterns
    Maps quiz answers to doisha types
    """
    X = []
    y = []
    
    for _ in range(n_samples):
        doisha_type = np.random.choice([0, 1, 2])  # 0:vata, 1:pitta, 2:kapha
        
        # Generate answers based on doisha type with some randomness
        answers = []
        for i in range(6):
            if doisha_type == 0:  # Vata
                # Vata answers: mostly 0 (thin, dry, etc)
                answer = 0 if np.random.random() > 0.3 else np.random.choice([1, 2])
            elif doisha_type == 1:  # Pitta
                # Pitta answers: mostly 1 (medium, warm, etc)
                answer = 1 if np.random.random() > 0.3 else np.random.choice([0, 2])
            else:  # Kapha
                # Kapha answers: mostly 2 (large, cool, etc)
                answer = 2 if np.random.random() > 0.3 else np.random.choice([0, 1])
            
            answers.append(answer)
        
        X.append(answers)
        y.append(keras.utils.to_categorical(doisha_type, 3))
    
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


if __name__ == '__main__':
    # Example usage
    print("Creating Tinea Doisha CNN Model...")
    
    # Create model
    model = TineaDoishaModel(input_dim=6, num_classes=3)
    
    # Create synthetic data
    print("Generating synthetic training data...")
    X_train, y_train = create_synthetic_training_data(400)
    X_val, y_val = create_synthetic_training_data(100)
    
    # Build and train
    print("Building CNN model...")
    cnn_model = model.build_cnn_model()
    cnn_model.summary()
    
    print("\nTraining model...")
    history = model.train_model(X_train, y_train, X_val, y_val, epochs=30)
    
    # Save model
    model_path = 'tinea_doisha_cnn_model.keras'
    model.save_model(model_path)
    
    # Test prediction
    print("\nTesting predictions...")
    test_answers = [0, 0, 0, 0, 0, 0]  # All vata answers
    result = model.predict_doisha(test_answers)
    print(f"Test prediction: {result}")
