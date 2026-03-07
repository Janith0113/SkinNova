"""
Data Processing and Preparation Script for Leprosy Dataset
Handles data loading, cleaning, and feature engineering
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import os


class LeprosyDataProcessor:
    """
    Process and prepare leprosy data for model training
    """
    
    def __init__(self):
        self.df = None
        self.processed_df = None
        
    def load_csv(self, filepath):
        """Load CSV file"""
        print(f"Loading data from {filepath}...")
        self.df = pd.read_csv(filepath)
        print(f"Loaded {self.df.shape[0]} rows and {self.df.shape[1]} columns")
        return self.df
    
    def load_excel(self, filepath):
        """Load Excel file"""
        print(f"Loading data from {filepath}...")
        self.df = pd.read_excel(filepath)
        print(f"Loaded {self.df.shape[0]} rows and {self.df.shape[1]} columns")
        return self.df
    
    def create_sample_dataset(self, filename='leprosy_dataset.csv'):
        """
        Create a sample leprosy dataset for testing
        Based on common leprosy classification features
        """
        print("Creating sample leprosy dataset...")
        
        np.random.seed(42)
        n_samples = 300
        
        # Features commonly used in leprosy diagnosis
        data = {
            'age': np.random.randint(5, 80, n_samples),
            'gender': np.random.choice(['M', 'F'], n_samples),
            'duration_of_illness_months': np.random.randint(1, 120, n_samples),
            'number_of_lesions': np.random.randint(1, 100, n_samples),
            'largest_lesion_size_cm': np.random.uniform(0.5, 15, n_samples),
            'skin_smear_right': np.random.choice([0, 1, 2, 3, 4, 5, 6], n_samples),
            'skin_smear_left': np.random.choice([0, 1, 2, 3, 4, 5, 6], n_samples),
            'nerve_involvement': np.random.choice([0, 1], n_samples),
            'nerve_thickening': np.random.choice([0, 1], n_samples),
            'loss_of_sensation': np.random.choice([0, 1], n_samples),
            'muscle_weakness': np.random.choice([0, 1], n_samples),
            'eye_involvement': np.random.choice([0, 1], n_samples),
            'bacillus_index': np.random.uniform(0, 6, n_samples),
            'morphological_index': np.random.uniform(0, 100, n_samples),
            'household_contacts': np.random.randint(0, 10, n_samples),
            'prev_treatment': np.random.choice([0, 1], n_samples),
            # Target: 0=Tuberculoid, 1=Borderline Tuberculoid, 2=Mid-Borderline, 
            #         3=Borderline Lepromatous, 4=Lepromatous
            'leprosy_type': np.random.choice([0, 1, 2, 3, 4], n_samples)
        }
        
        self.df = pd.DataFrame(data)
        self.df.to_csv(filename, index=False)
        print(f"✓ Sample dataset created: {filename}")
        return self.df
    
    def info(self):
        """Display dataset information"""
        if self.df is None:
            print("No data loaded!")
            return
        
        print("\n" + "="*60)
        print("DATASET INFORMATION")
        print("="*60)
        print(f"\nShape: {self.df.shape}")
        print(f"\nColumn Names and Types:\n{self.df.dtypes}")
        print(f"\nFirst few rows:\n{self.df.head()}")
        print(f"\nMissing Values:\n{self.df.isnull().sum()}")
        print(f"\nBasic Statistics:\n{self.df.describe()}")
    
    def clean_data(self):
        """Clean the dataset"""
        print("\nCleaning data...")
        
        # Remove duplicates
        before = len(self.df)
        self.df = self.df.drop_duplicates()
        print(f"Removed {before - len(self.df)} duplicate rows")
        
        # Handle missing values
        missing = self.df.isnull().sum().sum()
        if missing > 0:
            print(f"Handling {missing} missing values...")
            # Fill numeric columns with median
            numeric_cols = self.df.select_dtypes(include=[np.number]).columns
            self.df[numeric_cols] = self.df[numeric_cols].fillna(self.df[numeric_cols].median())
            
            # Fill categorical columns with mode
            categorical_cols = self.df.select_dtypes(include=['object']).columns
            for col in categorical_cols:
                self.df[col] = self.df[col].fillna(self.df[col].mode()[0] if len(self.df[col].mode()) > 0 else 'Unknown')
        
        return self.df
    
    def feature_engineering(self):
        """Create new features from existing ones"""
        print("\nPerforming feature engineering...")
        
        # Example: Create composite features
        if 'number_of_lesions' in self.df.columns and 'largest_lesion_size_cm' in self.df.columns:
            self.df['lesion_burden'] = self.df['number_of_lesions'] * self.df['largest_lesion_size_cm']
        
        if 'skin_smear_right' in self.df.columns and 'skin_smear_left' in self.df.columns:
            self.df['total_skin_smear'] = self.df['skin_smear_right'] + self.df['skin_smear_left']
        
        if 'nerve_thickening' in self.df.columns and 'loss_of_sensation' in self.df.columns:
            self.df['nerve_symptoms'] = self.df['nerve_thickening'] + self.df['loss_of_sensation']
        
        print(f"Created new features. Total columns: {len(self.df.columns)}")
        return self.df
    
    def normalize_data(self):
        """Normalize numeric features"""
        print("\nNormalizing data...")
        
        scaler = MinMaxScaler()
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        self.df[numeric_cols] = scaler.fit_transform(self.df[numeric_cols])
        
        return self.df
    
    def save_processed_data(self, filename='leprosy_dataset_processed.csv'):
        """Save processed dataset"""
        if self.df is None:
            print("No data to save!")
            return
        
        self.df.to_csv(filename, index=False)
        print(f"✓ Processed data saved to {filename}")
    
    def get_data(self):
        """Return the processed dataframe"""
        return self.df
    
    def split_features_target(self, target_column='leprosy_type'):
        """Split data into features and target"""
        if target_column not in self.df.columns:
            print(f"Error: Target column '{target_column}' not found!")
            return None, None
        
        X = self.df.drop(target_column, axis=1)
        y = self.df[target_column]
        print(f"Features shape: {X.shape}")
        print(f"Target shape: {y.shape}")
        return X, y


def prepare_dataset(csv_path=None, create_sample=False):
    """
    Prepare dataset for training
    
    Args:
        csv_path: Path to CSV file
        create_sample: If True, create sample data
    """
    processor = LeprosyDataProcessor()
    
    if create_sample:
        processor.create_sample_dataset()
    elif csv_path:
        if csv_path.endswith('.xlsx') or csv_path.endswith('.xls'):
            processor.load_excel(csv_path)
        else:
            processor.load_csv(csv_path)
    else:
        print("Error: Provide csv_path or set create_sample=True")
        return None
    
    processor.info()
    processor.clean_data()
    processor.feature_engineering()
    # processor.normalize_data()  # Optional: normalization
    processor.save_processed_data()
    
    return processor


if __name__ == '__main__':
    # Create sample dataset
    processor = prepare_dataset(create_sample=True)
    
    # Alternatively, use your own data:
    # processor = prepare_dataset('your_leprosy_data.csv')
    
    print("\n" + "="*60)
    print("Dataset is ready for model training!")
    print("="*60)
