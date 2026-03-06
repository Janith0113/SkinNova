"""
Skin Cancer CNN Model Training Pipeline
======================================
Trains a CNN model for skin cancer detection with risk classification.

Requirements:
- TensorFlow/Keras
- scikit-learn
- numpy, pandas, matplotlib

Install: pip install tensorflow scikit-learn numpy pandas matplotlib pillow
"""

import os
import json
import numpy as np
import pandas as pd
from pathlib import Path
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    classification_report, 
    confusion_matrix, 
    roc_auc_score, 
    roc_curve,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)
import seaborn as sns

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator, load_img, img_to_array
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau


class SkinCancerCNNTrainer:
    """CNN trainer for skin cancer detection"""
    
    def __init__(self, img_size=224, batch_size=32, epochs=100):
        """
        Initialize trainer
        
        Args:
            img_size: Image resolution (default 224x224)
            batch_size: Training batch size
            epochs: Maximum training epochs
        """
        self.img_size = img_size
        self.batch_size = batch_size
        self.epochs = epochs
        self.model = None
        self.history = None
        self.label_encoder = LabelEncoder()
        
    def build_model(self, num_classes=2, learning_rate=0.001):
        """
        Build CNN architecture with transfer learning
        
        Args:
            num_classes: Number of classification classes
            learning_rate: Learning rate for optimizer
            
        Returns:
            Compiled Keras model
        """
        # Use MobileNetV2 as backbone for efficiency
        base_model = keras.applications.MobileNetV2(
            input_shape=(self.img_size, self.img_size, 3),
            include_top=False,
            weights='imagenet'
        )
        
        # Freeze base model layers initially
        base_model.trainable = False
        
        # Build custom head
        model = models.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.4),
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            layers.Dense(128, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.2),
            layers.Dense(num_classes, activation='softmax')
        ])
        
        # Compile model
        optimizer = keras.optimizers.Adam(learning_rate=learning_rate)
        model.compile(
            optimizer=optimizer,
            loss='categorical_crossentropy',
            metrics=['accuracy', keras.metrics.AUC()]
        )
        
        self.model = model
        return model
    
    def load_and_prepare_data(self, data_dir, labels_file=None, test_size=0.2, val_size=0.1):
        """
        Load images and labels from directory
        
        Args:
            data_dir: Directory containing images and labels CSV
            labels_file: CSV file with columns [filename, label] (optional)
            test_size: Fraction for test set
            val_size: Fraction for validation set
            
        Returns:
            Train, validation, and test image arrays with labels
        """
        X = []
        y = []
        
        data_path = Path(data_dir)
        
        # If labels file provided, use it
        if labels_file and os.path.exists(labels_file):
            df = pd.read_csv(labels_file)
            
            # Handle different column name variations
            if 'label' in df.columns:
                label_col = 'label'
            elif 'diagnosis' in df.columns:
                label_col = 'diagnosis'
            elif 'class' in df.columns:
                label_col = 'class'
            else:
                label_col = df.columns[1]
            
            if 'filename' in df.columns:
                filename_col = 'filename'
            elif 'file' in df.columns:
                filename_col = 'file'
            else:
                filename_col = df.columns[0]
            
            for _, row in df.iterrows():
                img_path = data_path / row[filename_col]
                if img_path.exists():
                    img = load_img(img_path, target_size=(self.img_size, self.img_size))
                    X.append(img_to_array(img) / 255.0)
                    y.append(row[label_col])
        
        else:
            # Load images by subfolder (melanoma, benign, etc.)
            for class_dir in data_path.iterdir():
                if class_dir.is_dir():
                    label = class_dir.name
                    for img_file in class_dir.glob('*.jpg'):
                        img = load_img(img_file, target_size=(self.img_size, self.img_size))
                        X.append(img_to_array(img) / 255.0)
                        y.append(label)
        
        if not X:
            raise ValueError(f"No images found in {data_dir}")
        
        X = np.array(X)
        y = np.array(y)
        
        print(f"✅ Loaded {len(X)} images with {len(np.unique(y))} classes")
        print(f"   Classes: {np.unique(y)}")
        
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        y_categorical = keras.utils.to_categorical(y_encoded)
        
        # Split data
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y_categorical, 
            test_size=test_size, 
            random_state=42,
            stratify=y_encoded
        )
        
        val_size_adjusted = val_size / (1 - test_size)
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp,
            test_size=val_size_adjusted,
            random_state=42,
            stratify=np.argmax(y_temp, axis=1)
        )
        
        print(f"\n📊 Data Split:")
        print(f"   Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def train(self, X_train, X_val, y_train, y_val, model_save_path='skin_cancer_cnn_model.h5'):
        """
        Train the model with data augmentation
        
        Args:
            X_train, X_val, y_train, y_val: Training and validation data
            model_save_path: Path to save best model
        """
        if self.model is None:
            raise ValueError("Model not built. Call build_model() first")
        
        # Data augmentation
        train_datagen = ImageDataGenerator(
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest'
        )
        
        val_datagen = ImageDataGenerator()
        
        # Callbacks
        callbacks = [
            EarlyStopping(
                monitor='val_loss',
                patience=15,
                restore_best_weights=True,
                verbose=1
            ),
            ModelCheckpoint(
                model_save_path,
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7,
                verbose=1
            )
        ]
        
        print("\n🚀 Starting Training...")
        
        # Train
        self.history = self.model.fit(
            train_datagen.flow(X_train, y_train, batch_size=self.batch_size),
            validation_data=val_datagen.flow(X_val, y_val, batch_size=self.batch_size),
            epochs=self.epochs,
            callbacks=callbacks,
            verbose=1
        )
        
        print(f"\n✅ Model saved to {model_save_path}")
        
        return self.history
    
    def evaluate(self, X_test, y_test):
        """
        Evaluate model on test set
        
        Args:
            X_test, y_test: Test data
            
        Returns:
            Dictionary with evaluation metrics
        """
        if self.model is None:
            raise ValueError("Model not loaded")
        
        print("\n📈 Evaluating on Test Set...")
        
        # Get predictions
        y_pred_proba = self.model.predict(X_test, verbose=0)
        y_pred = np.argmax(y_pred_proba, axis=1)
        y_true = np.argmax(y_test, axis=1)
        
        # Calculate metrics
        metrics = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, average='weighted', zero_division=0),
            'recall': recall_score(y_true, y_pred, average='weighted', zero_division=0),
            'f1': f1_score(y_true, y_pred, average='weighted', zero_division=0),
        }
        
        print(f"\n📊 Test Metrics:")
        print(f"   Accuracy:  {metrics['accuracy']:.4f}")
        print(f"   Precision: {metrics['precision']:.4f}")
        print(f"   Recall:    {metrics['recall']:.4f}")
        print(f"   F1 Score:  {metrics['f1']:.4f}")
        
        # Detailed classification report
        print(f"\n📋 Classification Report:")
        print(classification_report(
            y_true, y_pred,
            target_names=self.label_encoder.classes_,
            zero_division=0
        ))
        
        # Confusion matrix
        cm = confusion_matrix(y_true, y_pred)
        return metrics, y_pred, y_pred_proba, cm
    
    def plot_training_history(self, save_path='training_history.png'):
        """Plot and save training history"""
        if self.history is None:
            print("No training history available")
            return
        
        fig, axes = plt.subplots(1, 2, figsize=(14, 5))
        
        # Accuracy plot
        axes[0].plot(self.history.history['accuracy'], label='Train Accuracy')
        axes[0].plot(self.history.history['val_accuracy'], label='Val Accuracy')
        axes[0].set_xlabel('Epoch')
        axes[0].set_ylabel('Accuracy')
        axes[0].set_title('Model Accuracy')
        axes[0].legend()
        axes[0].grid(True)
        
        # Loss plot
        axes[1].plot(self.history.history['loss'], label='Train Loss')
        axes[1].plot(self.history.history['val_loss'], label='Val Loss')
        axes[1].set_xlabel('Epoch')
        axes[1].set_ylabel('Loss')
        axes[1].set_title('Model Loss')
        axes[1].legend()
        axes[1].grid(True)
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        print(f"\n✅ Training history saved to {save_path}")
        plt.close()
    
    def plot_confusion_matrix(self, cm, save_path='confusion_matrix.png'):
        """Plot and save confusion matrix"""
        plt.figure(figsize=(10, 8))
        sns.heatmap(
            cm,
            annot=True,
            fmt='d',
            cmap='Blues',
            xticklabels=self.label_encoder.classes_,
            yticklabels=self.label_encoder.classes_
        )
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        print(f"✅ Confusion matrix saved to {save_path}")
        plt.close()
    
    def save_model_for_web(self, model_path, output_dir='web_model'):
        """
        Convert trained model to TensorFlow.js format for web use
        
        Requires: tensorflowjs
        Install: pip install tensorflowjs
        """
        try:
            import tensorflowjs as tfjs
            
            os.makedirs(output_dir, exist_ok=True)
            tfjs.converters.save_keras_model(self.model, output_dir)
            print(f"✅ Model converted to TensorFlow.js format in {output_dir}")
            
        except ImportError:
            print("⚠️  tensorflowjs not installed. Run: pip install tensorflowjs")


def main():
    """
    Main training pipeline
    
    Usage:
        python train_skin_cancer_cnn.py --data_dir ./data --labels_file ./data/labels.csv
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Train Skin Cancer CNN Model')
    parser.add_argument('--data_dir', type=str, default='./skin_cancer_data',
                        help='Directory containing training images')
    parser.add_argument('--labels_file', type=str, default=None,
                        help='CSV file with [filename, label] columns')
    parser.add_argument('--img_size', type=int, default=224,
                        help='Input image size')
    parser.add_argument('--batch_size', type=int, default=32,
                        help='Training batch size')
    parser.add_argument('--epochs', type=int, default=100,
                        help='Maximum training epochs')
    parser.add_argument('--learning_rate', type=float, default=0.001,
                        help='Learning rate')
    parser.add_argument('--output_dir', type=str, default='./models',
                        help='Output directory for saves models')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Initialize trainer
    trainer = SkinCancerCNNTrainer(
        img_size=args.img_size,
        batch_size=args.batch_size,
        epochs=args.epochs
    )
    
    # Build model
    print("🏗️  Building CNN Model...")
    trainer.build_model(num_classes=2, learning_rate=args.learning_rate)
    trainer.model.summary()
    
    # Load data
    print(f"\n📂 Loading data from {args.data_dir}...")
    X_train, X_val, X_test, y_train, y_val, y_test = trainer.load_and_prepare_data(
        args.data_dir,
        labels_file=args.labels_file
    )
    
    # Train
    model_path = os.path.join(args.output_dir, 'skin_cancer_cnn_best.h5')
    trainer.train(X_train, X_val, y_train, y_val, model_save_path=model_path)
    
    # Evaluate
    metrics, y_pred, y_pred_proba, cm = trainer.evaluate(X_test, y_test)
    
    # Plot results
    trainer.plot_training_history(
        save_path=os.path.join(args.output_dir, 'training_history.png')
    )
    trainer.plot_confusion_matrix(
        cm,
        save_path=os.path.join(args.output_dir, 'confusion_matrix.png')
    )
    
    # Save metrics
    metrics_path = os.path.join(args.output_dir, 'metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"✅ Metrics saved to {metrics_path}")
    
    # Save label encoder
    import pickle
    encoder_path = os.path.join(args.output_dir, 'label_encoder.pkl')
    with open(encoder_path, 'wb') as f:
        pickle.dump(trainer.label_encoder, f)
    print(f"✅ Label encoder saved to {encoder_path}")
    
    print("\n🎉 Training Complete!")
    print(f"📁 All outputs saved to {args.output_dir}")


if __name__ == '__main__':
    main()
