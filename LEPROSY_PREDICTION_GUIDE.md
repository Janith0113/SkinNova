# Leprosy Prediction AI Model - Complete Guide

## Overview

This project implements a machine learning model to predict and classify leprosy types based on patient clinical data. The model is trained using Random Forest or XGBoost algorithms and achieves high accuracy in classification.

## Features

- **Multi-class Classification**: Predicts 5 leprosy types
  - Tuberculoid (TT)
  - Borderline Tuberculoid (BT)
  - Mid-Borderline (BB)
  - Borderline Lepromatous (BL)
  - Lepromatous (LL)

- **Comprehensive Data Processing**: 
  - Missing value handling
  - Feature scaling and normalization
  - Feature engineering
  - Categorical encoding

- **Model Training**:
  - Random Forest and XGBoost support
  - Cross-validation
  - Hyperparameter tuning
  - Feature importance analysis

- **Evaluation Metrics**:
  - Accuracy, Precision, Recall, F1-Score
  - ROC-AUC curves
  - Confusion matrices
  - Classification reports

- **Inference & Prediction**:
  - Single patient predictions
  - Batch predictions
  - Confidence scores
  - Detailed explanations

## Installation

### 1. Install Python (3.8+)
Download and install Python from https://www.python.org/

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Verify Installation
```bash
python -c "import pandas, sklearn, xgboost; print('✓ All packages installed!')"
```

## Quick Start

### Step 1: Prepare Your Data

You have several options:

#### Option A: Create Sample Dataset
```python
from data_processor import prepare_dataset

processor = prepare_dataset(create_sample=True)
```

#### Option B: Use Your Own CSV Data
```python
from data_processor import prepare_dataset

processor = prepare_dataset('your_data.csv')
```

#### Option C: Use Your Own Excel Data
The data processor automatically detects Excel files (.xlsx, .xls)

### Step 2: Train the Model

```bash
python leprosy_model_training.py
```

This will:
1. Load the dataset
2. Perform exploratory analysis
3. Preprocess and split the data (80% train, 20% test)
4. Train the Random Forest model
5. Evaluate performance
6. Save visualizations
7. Save the trained model

**Expected Output:**
```
LEPROSY PREDICTION AI MODEL TRAINING
============================================================
Loading data...
Dataset shape: (300, 18)

EXPLORATORY DATA ANALYSIS
...

DATA PREPROCESSING
...

MODEL TRAINING
============================================================
Building Random Forest Classifier...
Training model...
✓ Model training complete!

Cross-validation scores: [0.85 0.87 0.83 0.86 0.84]
Mean CV Score: 0.8520 (+/- 0.0135)

MODEL EVALUATION
============================================================
Accuracy:  0.8733
Precision: 0.8742
Recall:    0.8733
F1-Score:  0.8731

✓ Results plot saved to ./model_results.png
✓ Model saved to leprosy_model.pkl
```

### Step 3: Make Predictions

#### Option A: Single Patient Prediction
```python
from leprosy_inference import LeprosyPredictor

predictor = LeprosyPredictor('leprosy_model.pkl')

patient_data = {
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

result = predictor.predict_with_explanation(patient_data)
```

#### Option B: Batch Predictions
```bash
python leprosy_inference.py
```

Or programmatically:
```python
from leprosy_inference import batch_prediction_from_csv

batch_prediction_from_csv('leprosy_dataset_processed.csv')
```

## File Structure

```
SkinNova/
├── leprosy_model_training.py       # Main training pipeline
├── data_processor.py               # Data preprocessing and preparation
├── leprosy_inference.py            # Prediction and inference script
├── requirements.txt                # Python dependencies
├── LEPROSY_PREDICTION_GUIDE.md    # This file
├── leprosy_dataset.csv             # Sample dataset (generated)
├── leprosy_dataset_processed.csv   # Processed dataset
├── leprosy_model.pkl               # Trained model (generated)
├── leprosy_model_scaler.pkl        # Feature scaler (generated)
├── leprosy_model_encoders.pkl      # Label encoders (generated)
├── leprosy_model_features.pkl      # Feature names (generated)
└── model_results.png               # Training results visualization
```

## Dataset Format

Your input CSV should contain the following columns (adapt as needed):

| Column Name | Type | Description | Range |
|------------|------|-------------|-------|
| age | int | Patient age | 0-120 |
| gender | str | Gender (M/F) | M, F |
| duration_of_illness_months | int | Duration of symptoms | 0-240 |
| number_of_lesions | int | Number of skin lesions | 0-1000 |
| largest_lesion_size_cm | float | Size of largest lesion | 0-50 |
| skin_smear_right | int | Right side smear result | 0-6 |
| skin_smear_left | int | Left side smear result | 0-6 |
| nerve_involvement | bool | Nerve involvement present | 0/1 |
| nerve_thickening | bool | Nerve thickening | 0/1 |
| loss_of_sensation | bool | Loss of sensation | 0/1 |
| muscle_weakness | bool | Muscle weakness | 0/1 |
| eye_involvement | bool | Eye involvement | 0/1 |
| bacillus_index | float | Bacillus concentration | 0-6 |
| morphological_index | float | Morphological index | 0-100 |
| household_contacts | int | Number of household contacts | 0-20 |
| prev_treatment | bool | Previous treatment received | 0/1 |
| **leprosy_type** | int | **Target: Leprosy classification** | **0-4** |

**Target Variable Mapping:**
- 0 = Tuberculoid (TT)
- 1 = Borderline Tuberculoid (BT)
- 2 = Mid-Borderline (BB)
- 3 = Borderline Lepromatous (BL)
- 4 = Lepromatous (LL)

## Model Performance

### Expected Metrics
- **Accuracy**: 85-92%
- **Precision**: 85-90%
- **Recall**: 85-90%
- **F1-Score**: 85-90%

Performance depends on dataset quality and size.

## Advanced Usage

### Customize Model Architecture

```python
from leprosy_model_training import LeprosyPredictionModel

# Use XGBoost instead of Random Forest
model = LeprosyPredictionModel(model_type='xgboost')
```

### Hyperparameter Tuning

Edit `leprosy_model_training.py`:
```python
self.model = RandomForestClassifier(
    n_estimators=300,           # Increase for better performance
    max_depth=20,               # Increase tree depth
    min_samples_split=3,        # Minimum samples to split
    min_samples_leaf=1,         # Minimum samples in leaf
    random_state=42,
    n_jobs=-1,
    class_weight='balanced'     # Handle class imbalance
)
```

### Feature Engineering

Add new features in `data_processor.py`:
```python
def feature_engineering(self):
    # Example: Create feature ratios
    if 'skin_smear_right' in self.df.columns:
        self.df['smear_ratio'] = self.df['skin_smear_right'] / (self.df['skin_smear_left'] + 1)
    
    # Add more custom features
    self.df['severity_score'] = (
        self.df['number_of_lesions'] * 0.3 +
        self.df['bacillus_index'] * 0.4 +
        self.df['nerve_involvement'] * 0.3
    )
```

## Troubleshooting

### Issue: "FileNotFoundError: leprosy_dataset.csv"
**Solution:** Create sample dataset first:
```python
from data_processor import prepare_dataset
prepare_dataset(create_sample=True)
```

### Issue: "Target column 'leprosy_type' not found"
**Solution:** Update the target column name in `leprosy_model_training.py`:
```python
target_column = 'your_actual_column_name'  # Change this
```

### Issue: ImportError for XGBoost
**Solution:** Install XGBoost:
```bash
pip install xgboost
```

### Issue: Out of Memory
**Solution:** Reduce batch size or sample size in preprocessing:
```python
# Use subset of data
df = df.sample(frac=0.5)  # Use 50% of data
```

## Using Your Own Data

### Step 1: Prepare CSV File
Ensure your CSV has:
- All required feature columns
- A target column with leprosy classification (0-4)
- No header row (or set to skip first row if needed)

### Step 2: Load and Process
```python
from data_processor import prepare_dataset

processor = prepare_dataset('your_leprosy_data.csv')
```

### Step 3: Update Target Column Name
In `leprosy_model_training.py`, change:
```python
target_column = 'your_target_column_name'
```

### Step 4: Train and Evaluate
```bash
python leprosy_model_training.py
```

## Interpretation Guide

### Understanding Feature Importance
The model identifies which features are most important for prediction:
- **High importance**: Strong predictor of leprosy type
- **Low importance**: Minimal impact on prediction

### Interpreting Probabilities
```
Predicted: Lepromatous (LL)
Confidence: 87.5%

All probabilities:
├─ Tuberculoid         5.2%
├─ Borderline TB      3.1%
├─ Mid-Borderline     2.0%
├─ Borderline LL       2.2%
└─ Lepromatous       87.5% ✓ Highest confidence
```

Higher confidence indicates stronger model certainty.

## Model Improvements

To improve model performance:

1. **Increase dataset size**: Collect more patient data
2. **Feature engineering**: Create domain-specific features
3. **Handle class imbalance**: Use SMOTE or class weights
4. **Ensemble methods**: Combine multiple models
5. **Hyperparameter optimization**: Use GridSearchCV
6. **Feature selection**: Remove irrelevant features

Example:
```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [10, 15, 20],
    'min_samples_split': [2, 5, 10]
}

grid_search = GridSearchCV(model, param_grid, cv=5)
grid_search.fit(X_train, y_train)
best_model = grid_search.best_estimator_
```

## API Integration

### Flask Web Application
```python
from flask import Flask, request, jsonify
from leprosy_inference import LeprosyPredictor

app = Flask(__name__)
predictor = LeprosyPredictor('leprosy_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    result = predictor.predict_single(data)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
```

## Support and Documentation

- **Data Format Issues**: Check dataset format matches template
- **Model Performance**: Review feature importance and data quality
- **Prediction Accuracy**: Ensure all required features are present

## License

This leprosy prediction model is provided for research and educational purposes.

## Citation

If you use this model in research, please cite:
```
Leprosy Prediction AI Model
Research Implementation 2026
```

## References

- WHO Guidelines on Leprosy Classification
- Clinical Leprosy: A Practical Guide
- Machine Learning in Medical Diagnosis

---

**Last Updated**: March 2026  
**Version**: 1.0
