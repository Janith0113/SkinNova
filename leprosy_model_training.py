"""
Leprosy Prediction AI Model - Training Pipeline
Trains a machine learning model to predict leprosy classification
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score,
    precision_score, recall_score, f1_score, roc_auc_score, roc_curve
)
import joblib
import warnings
warnings.filterwarnings('ignore')


class LeprosyPredictionModel:
    """
    AI Model for leprosy classification and prediction
    """
    
    def __init__(self, model_type='random_forest'):
        """
        Initialize the model
        
        Args:
            model_type: 'random_forest' or 'xgboost'
        """
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.results = {}
        
    def load_data(self, filepath):
        """
        Load dataset from CSV file
        
        Args:
            filepath: Path to the CSV file
            
        Returns:
            DataFrame with loaded data
        """
        print(f"Loading data from {filepath}...")
        df = pd.read_csv(filepath)
        print(f"Dataset shape: {df.shape}")
        print(f"\nFirst few rows:\n{df.head()}")
        print(f"\nColumn names: {df.columns.tolist()}")
        print(f"\nData types:\n{df.dtypes}")
        print(f"\nMissing values:\n{df.isnull().sum()}")
        return df
    
    def exploratory_analysis(self, df, target_column):
        """
        Perform exploratory data analysis
        
        Args:
            df: Input DataFrame
            target_column: Name of target column
        """
        print("\n" + "="*60)
        print("EXPLORATORY DATA ANALYSIS")
        print("="*60)
        
        # Target distribution
        print(f"\nTarget variable distribution:\n{df[target_column].value_counts()}")
        
        # Statistical summary
        print(f"\nStatistical summary:\n{df.describe()}")
        
        # Correlation analysis
        numeric_df = df.select_dtypes(include=[np.number])
        if len(numeric_df.columns) > 1:
            corr_matrix = numeric_df.corr()
            print(f"\nTop correlations with target:\n{corr_matrix[target_column].sort_values(ascending=False)[:10]}")
        
        return df
    
    def preprocess_data(self, df, target_column, test_size=0.2, random_state=42):
        """
        Preprocess data for model training
        
        Args:
            df: Input DataFrame
            target_column: Name of target column
            test_size: Proportion of test data
            random_state: Random seed
        """
        print("\n" + "="*60)
        print("DATA PREPROCESSING")
        print("="*60)
        
        # Handle missing values
        print("\nHandling missing values...")
        df = df.fillna(df.mean(numeric_only=True))
        df = df.fillna('Unknown')
        
        # Separate features and target
        X = df.drop(target_column, axis=1)
        y = df[target_column]
        
        # Encode categorical variables
        print("Encoding categorical variables...")
        for column in X.select_dtypes(include=['object']).columns:
            le = LabelEncoder()
            X[column] = le.fit_transform(X[column].astype(str))
            self.label_encoders[column] = le
        
        self.feature_names = X.columns.tolist()
        
        # Split data
        print(f"Splitting data (test_size={test_size})...")
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        # Scale features
        print("Scaling features...")
        self.X_train = self.scaler.fit_transform(self.X_train)
        self.X_test = self.scaler.transform(self.X_test)
        
        print(f"Training set size: {self.X_train.shape}")
        print(f"Test set size: {self.X_test.shape}")
        print(f"Number of features: {self.X_train.shape[1]}")
        
        return self.X_train, self.X_test, self.y_train, self.y_test
    
    def build_and_train_model(self):
        """
        Build and train the ML model
        """
        print("\n" + "="*60)
        print("MODEL TRAINING")
        print("="*60)
        
        if self.model_type == 'random_forest':
            print("Building Random Forest Classifier...")
            self.model = RandomForestClassifier(
                n_estimators=200,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1,
                class_weight='balanced'
            )
        elif self.model_type == 'xgboost':
            try:
                import xgboost as xgb
                print("Building XGBoost Classifier...")
                self.model = xgb.XGBClassifier(
                    n_estimators=200,
                    max_depth=7,
                    learning_rate=0.1,
                    subsample=0.8,
                    random_state=42,
                    use_label_encoder=False,
                    eval_metric='logloss'
                )
            except ImportError:
                print("XGBoost not installed. Falling back to Random Forest...")
                return self.build_and_train_model()
        
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
        
        print("Training model...")
        self.model.fit(self.X_train, self.y_train)
        print("✓ Model training complete!")
        
        # Cross-validation
        print("\nPerforming cross-validation...")
        cv_scores = cross_val_score(self.model, self.X_train, self.y_train, cv=5, scoring='f1_weighted')
        print(f"Cross-validation scores: {cv_scores}")
        print(f"Mean CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        
        return self.model
    
    def evaluate_model(self):
        """
        Evaluate model performance on test set
        """
        print("\n" + "="*60)
        print("MODEL EVALUATION")
        print("="*60)
        
        # Predictions
        y_pred = self.model.predict(self.X_test)
        y_pred_proba = self.model.predict_proba(self.X_test)[:, 1]
        
        # Metrics
        accuracy = accuracy_score(self.y_test, y_pred)
        precision = precision_score(self.y_test, y_pred, average='weighted')
        recall = recall_score(self.y_test, y_pred, average='weighted')
        f1 = f1_score(self.y_test, y_pred, average='weighted')
        
        print(f"\nAccuracy:  {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall:    {recall:.4f}")
        print(f"F1-Score:  {f1:.4f}")
        
        # ROC-AUC (for binary classification)
        try:
            roc_auc = roc_auc_score(self.y_test, y_pred_proba)
            print(f"ROC-AUC:   {roc_auc:.4f}")
        except:
            print("ROC-AUC: N/A (multi-class classification)")
        
        print(f"\nClassification Report:\n{classification_report(self.y_test, y_pred)}")
        
        # Store results
        self.results = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'y_pred': y_pred,
            'y_pred_proba': y_pred_proba
        }
        
        return self.results
    
    def plot_results(self, output_dir='./'):
        """
        Plot model results and metrics
        
        Args:
            output_dir: Directory to save plots
        """
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        
        # Confusion Matrix
        cm = confusion_matrix(self.y_test, self.results['y_pred'])
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[0, 0])
        axes[0, 0].set_title('Confusion Matrix')
        axes[0, 0].set_ylabel('True Label')
        axes[0, 0].set_xlabel('Predicted Label')
        
        # ROC Curve
        try:
            fpr, tpr, _ = roc_curve(self.y_test, self.results['y_pred_proba'])
            axes[0, 1].plot(fpr, tpr, label='ROC Curve', lw=2)
            axes[0, 1].plot([0, 1], [0, 1], 'k--', label='Random')
            axes[0, 1].set_xlabel('False Positive Rate')
            axes[0, 1].set_ylabel('True Positive Rate')
            axes[0, 1].set_title('ROC Curve')
            axes[0, 1].legend()
        except:
            axes[0, 1].text(0.5, 0.5, 'ROC Curve\n(Multi-class)', ha='center')
        
        # Feature Importance
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
            indices = np.argsort(importances)[-10:]
            axes[1, 0].barh([self.feature_names[i] for i in indices], importances[indices])
            axes[1, 0].set_title('Top 10 Feature Importances')
            axes[1, 0].set_xlabel('Importance')
        
        # Metrics Summary
        metrics_text = (
            f"Accuracy:  {self.results['accuracy']:.4f}\n"
            f"Precision: {self.results['precision']:.4f}\n"
            f"Recall:    {self.results['recall']:.4f}\n"
            f"F1-Score:  {self.results['f1']:.4f}"
        )
        axes[1, 1].text(0.5, 0.5, metrics_text, ha='center', va='center',
                       fontsize=12, bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
        axes[1, 1].axis('off')
        axes[1, 1].set_title('Model Metrics')
        
        plt.tight_layout()
        plot_path = os.path.join(output_dir, 'model_results.png')
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        print(f"\n✓ Results plot saved to {plot_path}")
        plt.close()
    
    def save_model(self, filepath='leprosy_model.pkl'):
        """
        Save trained model to file
        
        Args:
            filepath: Path to save the model
        """
        joblib.dump(self.model, filepath)
        joblib.dump(self.scaler, filepath.replace('.pkl', '_scaler.pkl'))
        joblib.dump(self.label_encoders, filepath.replace('.pkl', '_encoders.pkl'))
        joblib.dump(self.feature_names, filepath.replace('.pkl', '_features.pkl'))
        print(f"\n✓ Model saved to {filepath}")
    
    def load_model(self, filepath='leprosy_model.pkl'):
        """
        Load trained model from file
        
        Args:
            filepath: Path to load the model
        """
        self.model = joblib.load(filepath)
        self.scaler = joblib.load(filepath.replace('.pkl', '_scaler.pkl'))
        self.label_encoders = joblib.load(filepath.replace('.pkl', '_encoders.pkl'))
        self.feature_names = joblib.load(filepath.replace('.pkl', '_features.pkl'))
        print(f"✓ Model loaded from {filepath}")
    
    def predict(self, input_data):
        """
        Make predictions on new data
        
        Args:
            input_data: Input features (dict or DataFrame)
            
        Returns:
            Prediction and probabilities
        """
        if isinstance(input_data, dict):
            input_data = pd.DataFrame([input_data])
        
        # Encode categorical variables
        for column in input_data.select_dtypes(include=['object']).columns:
            if column in self.label_encoders:
                input_data[column] = self.label_encoders[column].transform(input_data[column].astype(str))
        
        # Scale features
        input_scaled = self.scaler.transform(input_data)
        
        # Predict
        prediction = self.model.predict(input_scaled)
        probabilities = self.model.predict_proba(input_scaled)
        
        return prediction[0], probabilities[0]


def main():
    """
    Main training pipeline
    """
    print("="*60)
    print("LEPROSY PREDICTION AI MODEL TRAINING")
    print("="*60)
    
    # Initialize model
    leprosy_model = LeprosyPredictionModel(model_type='random_forest')
    
    # Load data
    # Replace with your actual data path
    data_path = 'leprosy_dataset.csv'
    try:
        df = leprosy_model.load_data(data_path)
    except FileNotFoundError:
        print(f"Error: {data_path} not found.")
        print("Please ensure your dataset is in CSV format.")
        return
    
    # Exploratory analysis
    target_column = 'target'  # Change to your target column name
    if target_column in df.columns:
        leprosy_model.exploratory_analysis(df, target_column)
    else:
        print(f"Warning: Target column '{target_column}' not found.")
        print(f"Available columns: {df.columns.tolist()}")
        return
    
    # Preprocess data
    leprosy_model.preprocess_data(df, target_column)
    
    # Build and train model
    leprosy_model.build_and_train_model()
    
    # Evaluate model
    leprosy_model.evaluate_model()
    
    # Plot results
    leprosy_model.plot_results()
    
    # Save model
    leprosy_model.save_model('leprosy_model.pkl')
    
    print("\n" + "="*60)
    print("TRAINING COMPLETE!")
    print("="*60)


if __name__ == '__main__':
    main()
