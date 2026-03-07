"""
Quick Setup and Training Script for Leprosy Prediction Model
Run this script to complete setup and training in one go
"""

import os
import sys
import subprocess


def install_dependencies():
    """Install required packages"""
    print("\n" + "="*60)
    print("INSTALLING DEPENDENCIES")
    print("="*60)
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("\n✓ All dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError:
        print("\n✗ Error installing dependencies")
        return False


def create_sample_data():
    """Create sample dataset"""
    print("\n" + "="*60)
    print("CREATING SAMPLE DATASET")
    print("="*60)
    
    try:
        from data_processor import LeprosyDataProcessor
        processor = LeprosyDataProcessor()
        processor.create_sample_dataset('leprosy_dataset.csv')
        print("✓ Sample dataset created!")
        return True
    except Exception as e:
        print(f"✗ Error creating sample data: {e}")
        return False


def train_model():
    """Train the leprosy prediction model"""
    print("\n" + "="*60)
    print("TRAINING LEPROSY PREDICTION MODEL")
    print("="*60)
    
    try:
        from leprosy_model_training import LeprosyPredictionModel
        
        # Load data
        model = LeprosyPredictionModel(model_type='random_forest')
        df = model.load_data('leprosy_dataset.csv')
        
        # Run pipeline
        target_column = 'leprosy_type'
        model.exploratory_analysis(df, target_column)
        model.preprocess_data(df, target_column)
        model.build_and_train_model()
        model.evaluate_model()
        model.plot_results()
        model.save_model('leprosy_model.pkl')
        
        print("\n✓ Model training complete!")
        return True
    except Exception as e:
        print(f"\n✗ Error during training: {e}")
        import traceback
        traceback.print_exc()
        return False


def run_demo_prediction():
    """Run demo prediction"""
    print("\n" + "="*60)
    print("RUNNING DEMO PREDICTION")
    print("="*60)
    
    try:
        from leprosy_inference import demo_prediction
        demo_prediction()
        print("\n✓ Demo prediction complete!")
        return True
    except Exception as e:
        print(f"\n✗ Error running prediction: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main setup and training pipeline"""
    print("\n" + "="*80)
    print(" "*15 + "LEPROSY PREDICTION AI MODEL - QUICK SETUP")
    print("="*80)
    
    # Step 1: Install dependencies
    if not install_dependencies():
        print("\n✗ Setup failed: Could not install dependencies")
        sys.exit(1)
    
    # Step 2: Create sample data
    if not create_sample_data():
        print("\nWarning: Could not create sample data. Using existing data if available...")
    
    # Step 3: Train model
    if not train_model():
        print("\n✗ Setup failed: Could not train model")
        sys.exit(1)
    
    # Step 4: Demo prediction
    run_demo_prediction()
    
    # Print summary
    print("\n" + "="*80)
    print(" "*25 + "✓ SETUP COMPLETE!")
    print("="*80)
    print("""
Next steps:
1. Use your own data:
   - Replace 'leprosy_dataset.csv' with your data
   - Run: python leprosy_model_training.py

2. Make predictions:
   - Single patient: python leprosy_inference.py
   - Batch: Modify batch_prediction_from_csv() in leprosy_inference.py

3. Integrate with your application:
   - Import LeprosyPredictionModel or LeprosyPredictor
   - Use predict() methods for inference

4. Documentation:
   - See LEPROSY_PREDICTION_GUIDE.md for detailed information

Files created:
  ✓ leprosy_model_training.py    - Main training script
  ✓ data_processor.py             - Data preprocessing
  ✓ leprosy_inference.py          - Prediction script
  ✓ leprosy_model.pkl            - Trained model
  ✓ model_results.png            - Visualization
  ✓ LEPROSY_PREDICTION_GUIDE.md  - Complete documentation
""")
    print("="*80)


if __name__ == '__main__':
    main()
