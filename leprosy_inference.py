"""
Leprosy Prediction Inference Script
Use trained model to make predictions on new data
"""

import numpy as np
import pandas as pd
import joblib
from leprosy_model_training import LeprosyPredictionModel


class LeprosyPredictor:
    """
    Make predictions using trained leprosy model
    """
    
    def __init__(self, model_path='leprosy_model.pkl'):
        """
        Initialize predictor with trained model
        
        Args:
            model_path: Path to trained model
        """
        self.model = LeprosyPredictionModel()
        try:
            self.model.load_model(model_path)
            self.leprosy_types = {
                0: 'Tuberculoid (TT)',
                1: 'Borderline Tuberculoid (BT)',
                2: 'Mid-Borderline (BB)',
                3: 'Borderline Lepromatous (BL)',
                4: 'Lepromatous (LL)'
            }
            print("✓ Model loaded successfully!")
        except FileNotFoundError:
            print(f"Error: Model file '{model_path}' not found")
            print("Please train the model first using leprosy_model_training.py")
    
    def predict_single(self, patient_data):
        """
        Make prediction for a single patient
        
        Args:
            patient_data: Dictionary with patient features
            
        Returns:
            Prediction with confidence scores
        """
        try:
            prediction, probabilities = self.model.predict(patient_data)
            
            result = {
                'predicted_class': prediction,
                'predicted_type': self.leprosy_types.get(prediction, 'Unknown'),
                'confidence': probabilities[int(prediction)],
                'all_probabilities': {
                    self.leprosy_types[i]: round(float(prob), 4)
                    for i, prob in enumerate(probabilities)
                }
            }
            
            return result
        except Exception as e:
            print(f"Error making prediction: {e}")
            return None
    
    def predict_batch(self, data_df):
        """
        Make predictions for multiple patients
        
        Args:
            data_df: DataFrame with patient features
            
        Returns:
            DataFrame with predictions
        """
        predictions = []
        
        for idx, row in data_df.iterrows():
            patient_data = row.to_dict()
            result = self.predict_single(patient_data)
            
            if result:
                result['patient_id'] = idx
                predictions.append(result)
        
        results_df = pd.DataFrame(predictions)
        return results_df
    
    def predict_with_explanation(self, patient_data, feature_names=None):
        """
        Make prediction with detailed explanation
        
        Args:
            patient_data: Dictionary with patient features
            feature_names: List of feature names for interpretation
            
        Returns:
            Detailed prediction explanation
        """
        result = self.predict_single(patient_data)
        
        if result:
            print("\n" + "="*60)
            print("LEPROSY PREDICTION RESULT")
            print("="*60)
            print(f"\nPredicted Leprosy Type: {result['predicted_type']}")
            print(f"Confidence Level: {result['confidence']*100:.2f}%")
            
            print("\nProbabilities for all classes:")
            for class_name, prob in result['all_probabilities'].items():
                bar = '█' * int(prob * 30) + '░' * (30 - int(prob * 30))
                print(f"  {class_name:25s} {bar} {prob*100:.2f}%")
            
            print("\n" + "="*60)
        
        return result


def demo_prediction():
    """
    Demo prediction with sample patient data
    """
    predictor = LeprosyPredictor()
    
    # Sample patient data
    sample_patient = {
        'age': 45,
        'gender': 'M',
        'duration_of_illness_months': 12,
        'number_of_lesions': 15,
        'largest_lesion_size_cm': 8.5,
        'skin_smear_right': 4,
        'skin_smear_left': 3,
        'nerve_involvement': 1,
        'nerve_thickening': 1,
        'loss_of_sensation': 1,
        'muscle_weakness': 0,
        'eye_involvement': 0,
        'bacillus_index': 4.5,
        'morphological_index': 85.0,
        'household_contacts': 3,
        'prev_treatment': 0
    }
    
    print("Making prediction for sample patient...")
    predictor.predict_with_explanation(sample_patient)


def batch_prediction_from_csv(csv_path):
    """
    Make predictions for all patients in a CSV file
    
    Args:
        csv_path: Path to CSV file with patient data
    """
    predictor = LeprosyPredictor()
    
    # Load data
    df = pd.read_csv(csv_path)
    
    # Remove target column if present
    if 'leprosy_type' in df.columns:
        df = df.drop('leprosy_type', axis=1)
    
    # Make predictions
    print(f"Making predictions for {len(df)} patients...")
    results = predictor.predict_batch(df)
    
    # Save results
    results.to_csv('leprosy_predictions.csv', index=False)
    print(f"✓ Predictions saved to leprosy_predictions.csv")
    
    # Display summary
    print("\n" + "="*60)
    print("PREDICTION SUMMARY")
    print("="*60)
    print(results[['predicted_type', 'confidence']].describe())
    print("\nPrediction distribution:")
    print(results['predicted_type'].value_counts())


if __name__ == '__main__':
    # Run demo prediction
    demo_prediction()
    
    # To make batch predictions from CSV:
    # batch_prediction_from_csv('leprosy_dataset_processed.csv')
