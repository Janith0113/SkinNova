"""
Inference Script for Skin Cancer CNN Model
==========================================
Make predictions on new images using trained model
"""

import os
import sys
import argparse
import json
import numpy as np
from pathlib import Path
from datetime import datetime

import cv2
import numpy as np
from tensorflow.keras.models import load_model
import pickle


class SkinCancerCNNInference:
    """Load and use trained skin cancer CNN model for predictions"""
    
    def __init__(self, model_path, label_encoder_path, img_size=224):
        """
        Initialize inference with trained model
        
        Args:
            model_path: Path to saved model (.h5 file)
            label_encoder_path: Path to label encoder (.pkl file)
            img_size: Image size the model was trained on
        """
        self.img_size = img_size
        self.model = load_model(model_path)
        
        with open(label_encoder_path, 'rb') as f:
            self.label_encoder = pickle.load(f)
        
        self.class_names = self.label_encoder.classes_
        print(f"✓ Model loaded: {model_path}")
        print(f"✓ Classes: {self.class_names}")
    
    def preprocess_image(self, image_path):
        """
        Load and preprocess single image
        
        Args:
            image_path: Path to image file
            
        Returns:
            Preprocessed image array (1, img_size, img_size, 3)
        """
        # Read image
        img = cv2.imread(str(image_path))
        if img is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        # Convert BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize
        img = cv2.resize(img, (self.img_size, self.img_size))
        
        # Normalize to [0, 1]
        img = img.astype(np.float32) / 255.0
        
        # Add batch dimension
        img = np.expand_dims(img, axis=0)
        
        return img
    
    def predict(self, image_path, confidence_threshold=0.5):
        """
        Make prediction on single image
        
        Args:
            image_path: Path to image
            confidence_threshold: Minimum confidence to report positive class
            
        Returns:
            Dict with prediction results
        """
        # Load and preprocess
        img = self.preprocess_image(image_path)
        
        # Get prediction
        predictions = self.model.predict(img, verbose=0)[0]
        
        # Get class with highest probability
        predicted_idx = np.argmax(predictions)
        predicted_class = self.class_names[predicted_idx]
        confidence = float(predictions[predicted_idx])
        
        # Build result dictionary
        result = {
            'image_path': str(image_path),
            'predicted_class': predicted_class,
            'confidence': confidence,
            'timestamp': datetime.now().isoformat(),
            'all_predictions': {
                self.class_names[i]: float(predictions[i]) 
                for i in range(len(self.class_names))
            }
        }
        
        return result
    
    def batch_predict(self, image_folder, save_results=False, output_file=None):
        """
        Make predictions on all images in folder
        
        Args:
            image_folder: Folder containing images
            save_results: Whether to save results to JSON
            output_file: Output JSON file path
            
        Returns:
            List of prediction results
        """
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
        image_folder = Path(image_folder)
        
        # Find all images
        images = []
        for ext in image_extensions:
            images.extend(image_folder.rglob(f'*{ext}'))
            images.extend(image_folder.rglob(f'*{ext.upper()}'))
        
        images = list(set(images))  # Remove duplicates
        
        if not images:
            print(f"No images found in {image_folder}")
            return []
        
        print(f"\nPredicting on {len(images)} images...")
        results = []
        
        for i, img_path in enumerate(images, 1):
            try:
                result = self.predict(img_path)
                results.append(result)
                print(f"[{i}/{len(images)}] {img_path.name}: "
                      f"{result['predicted_class']} "
                      f"({result['confidence']:.2%})")
            except Exception as e:
                print(f"[{i}/{len(images)}] {img_path.name}: ERROR - {e}")
                results.append({
                    'image_path': str(img_path),
                    'error': str(e)
                })
        
        # Save results
        if save_results and output_file:
            with open(output_file, 'w') as f:
                json.dump(results, f, indent=2)
            print(f"\n✓ Results saved to {output_file}")
        
        return results
    
    def print_prediction_summary(self, results):
        """Print summary statistics of predictions"""
        print("\n" + "="*60)
        print("PREDICTION SUMMARY")
        print("="*60)
        
        valid_results = [r for r in results if 'error' not in r]
        errors = [r for r in results if 'error' in r]
        
        if not valid_results:
            print("No valid predictions")
            return
        
        # Class distribution
        class_counts = {}
        class_confidences = {}
        
        for result in valid_results:
            cls = result['predicted_class']
            conf = result['confidence']
            
            if cls not in class_counts:
                class_counts[cls] = 0
                class_confidences[cls] = []
            
            class_counts[cls] += 1
            class_confidences[cls].append(conf)
        
        print(f"\nTotal Images: {len(valid_results)}")
        print(f"Errors: {len(errors)}")
        print(f"\nClass Distribution:")
        for cls, count in class_counts.items():
            pct = count / len(valid_results) * 100
            avg_conf = np.mean(class_confidences[cls])
            print(f"  {cls:15} {count:4} ({pct:5.1f}%) "
                  f"[avg conf: {avg_conf:.2%}]")
        
        # Overall statistics
        all_confidences = []
        for confs in class_confidences.values():
            all_confidences.extend(confs)
        
        print(f"\nConfidence Statistics:")
        print(f"  Average: {np.mean(all_confidences):.2%}")
        print(f"  Min:     {np.min(all_confidences):.2%}")
        print(f"  Max:     {np.max(all_confidences):.2%}")
        print(f"  Median:  {np.median(all_confidences):.2%}")
        print("="*60)


def main():
    parser = argparse.ArgumentParser(
        description="Predict skin cancer using trained CNN model"
    )
    
    parser.add_argument('--model', required=True,
                       help='Path to trained model (.h5)')
    parser.add_argument('--encoder', required=True,
                       help='Path to label encoder (.pkl)')
    parser.add_argument('--image', default=None,
                       help='Single image file to predict')
    parser.add_argument('--folder', default=None,
                       help='Folder of images to predict')
    parser.add_argument('--img_size', type=int, default=224,
                       help='Image size model was trained on')
    parser.add_argument('--output', default=None,
                       help='Save results to JSON file')
    
    args = parser.parse_args()
    
    # Validate inputs
    if not os.path.exists(args.model):
        print(f"Error: Model file not found: {args.model}")
        sys.exit(1)
    
    if not os.path.exists(args.encoder):
        print(f"Error: Encoder file not found: {args.encoder}")
        sys.exit(1)
    
    if not args.image and not args.folder:
        print("Error: Specify either --image or --folder")
        sys.exit(1)
    
    # Initialize inference
    inference = SkinCancerCNNInference(
        args.model, 
        args.encoder,
        img_size=args.img_size
    )
    
    # Single image prediction
    if args.image:
        if not os.path.exists(args.image):
            print(f"Error: Image not found: {args.image}")
            sys.exit(1)
        
        print(f"\nPredicting on: {args.image}")
        result = inference.predict(args.image)
        
        print("\nResult:")
        print(f"  Class:      {result['predicted_class']}")
        print(f"  Confidence: {result['confidence']:.2%}")
        print(f"  All predictions:")
        for cls, prob in result['all_predictions'].items():
            print(f"    {cls:15} {prob:.2%}")
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"\n✓ Results saved to {args.output}")
    
    # Batch prediction
    if args.folder:
        if not os.path.isdir(args.folder):
            print(f"Error: Folder not found: {args.folder}")
            sys.exit(1)
        
        results = inference.batch_predict(
            args.folder,
            save_results=bool(args.output),
            output_file=args.output
        )
        
        inference.print_prediction_summary(results)


if __name__ == '__main__':
    main()
