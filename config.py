"""
Configuration and Model Parameters
Customize these settings for your specific use case
"""

import os
from pathlib import Path

# =================================================================
# DATA CONFIGURATION
# =================================================================

DATA_CONFIG = {
    # Input data settings
    'data_path': 'leprosy_dataset.csv',
    'target_column': 'leprosy_type',
    'test_size': 0.2,
    'random_state': 42,
    
    # Missing value handling
    'fill_missing_numeric': 'median',  # 'mean', 'median', 'forward_fill'
    'fill_missing_categorical': 'mode',  # 'mode', 'forward_fill', 'constant'
    
    # Feature scaling
    'scale_features': True,
    'scaler_type': 'standard',  # 'standard', 'minmax', 'robust'
}

# =================================================================
# MODEL CONFIGURATION
# =================================================================

MODEL_CONFIG = {
    # Model selection
    'model_type': 'random_forest',  # 'random_forest' or 'xgboost'
    
    # Random Forest parameters
    'rf_params': {
        'n_estimators': 200,
        'max_depth': 15,
        'min_samples_split': 5,
        'min_samples_leaf': 2,
        'max_features': 'sqrt',
        'random_state': 42,
        'n_jobs': -1,
        'class_weight': 'balanced',
    },
    
    # XGBoost parameters
    'xgb_params': {
        'n_estimators': 200,
        'max_depth': 7,
        'learning_rate': 0.1,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'random_state': 42,
    },
}

# =================================================================
# TRAINING CONFIGURATION
# =================================================================

TRAINING_CONFIG = {
    # Cross-validation
    'cv_folds': 5,
    'scoring': 'f1_weighted',
    
    # Hyperparameter tuning
    'tune_hyperparameters': False,
    'grid_search_params': {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 15, 20],
        'min_samples_split': [2, 5, 10],
    },
}

# =================================================================
# EVALUATION CONFIGURATION
# =================================================================

EVALUATION_CONFIG = {
    # Metrics to calculate
    'metrics': ['accuracy', 'precision', 'recall', 'f1', 'roc_auc', 'confusion_matrix'],
    
    # Performance thresholds
    'min_accuracy': 0.80,
    'min_f1_score': 0.80,
    
    # Visualization settings
    'plot_confusion_matrix': True,
    'plot_roc_curve': True,
    'plot_feature_importance': True,
    'save_plots': True,
    'plot_dpi': 300,
}

# =================================================================
# OUTPUT CONFIGURATION
# =================================================================

OUTPUT_CONFIG = {
    # Paths
    'model_save_path': 'leprosy_model.pkl',
    'scaler_save_path': 'leprosy_model_scaler.pkl',
    'encoders_save_path': 'leprosy_model_encoders.pkl',
    'features_save_path': 'leprosy_model_features.pkl',
    'results_path': './',
    'plot_filename': 'model_results.png',
    
    # Logging
    'enable_logging': True,
    'log_file': 'training.log',
    'verbosity': 2,  # 0=silent, 1=warn, 2=info, 3=debug
}

# =================================================================
# INFERENCE CONFIGURATION
# =================================================================

INFERENCE_CONFIG = {
    # Model paths for inference
    'model_path': 'leprosy_model.pkl',
    
    # Confidence threshold for predictions
    'confidence_threshold': 0.6,
    
    # Return options
    'return_probabilities': True,
    'return_explanation': True,
}

# =================================================================
# LEPROSY TYPE MAPPING
# =================================================================

LEPROSY_TYPES = {
    0: {
        'name': 'Tuberculoid (TT)',
        'description': 'Tuberculoid leprosy - stable form',
        'characteristics': 'Few lesions, high immunity'
    },
    1: {
        'name': 'Borderline Tuberculoid (BT)',
        'description': 'Borderline tuberculoid',
        'characteristics': 'Few to moderate lesions'
    },
    2: {
        'name': 'Mid-Borderline (BB)',
        'description': 'Mid-borderline',
        'characteristics': 'Intermediate characteristics'
    },
    3: {
        'name': 'Borderline Lepromatous (BL)',
        'description': 'Borderline lepromatous',
        'characteristics': 'Many lesions, unstable'
    },
    4: {
        'name': 'Lepromatous (LL)',
        'description': 'Lepromatous leprosy - unstable form',
        'characteristics': 'Many lesions, low immunity'
    },
}

# =================================================================
# FEATURE CONFIGURATION
# =================================================================

FEATURES = {
    'demographic': ['age', 'gender'],
    'clinical_history': ['duration_of_illness_months', 'prev_treatment', 'household_contacts'],
    'lesions': ['number_of_lesions', 'largest_lesion_size_cm'],
    'nerve_symptoms': ['nerve_involvement', 'nerve_thickening', 'loss_of_sensation', 'muscle_weakness'],
    'laboratory': ['skin_smear_right', 'skin_smear_left', 'eye_involvement', 'bacillus_index', 'morphological_index'],
}

# =================================================================
# FEATURE ENGINEERING
# =================================================================

FEATURE_ENGINEERING = {
    'create_composite_features': True,
    'features_to_create': {
        'lesion_burden': ['number_of_lesions', 'largest_lesion_size_cm'],  # multiply
        'total_skin_smear': ['skin_smear_right', 'skin_smear_left'],  # sum
        'nerve_symptoms_count': ['nerve_thickening', 'loss_of_sensation', 'muscle_weakness'],  # sum
    },
    'normalize_composite_features': True,
}

# =================================================================
# UTILITY FUNCTIONS
# =================================================================

def get_feature_list():
    """Get all features from configuration"""
    features = []
    for category, feature_list in FEATURES.items():
        features.extend(feature_list)
    return features


def get_leprosy_type_name(class_id):
    """Get leprosy type name from class ID"""
    return LEPROSY_TYPES.get(class_id, {}).get('name', 'Unknown')


def print_config():
    """Print all configurations"""
    print("\n" + "="*60)
    print("LEPROSY MODEL CONFIGURATION")
    print("="*60)
    
    print("\nDATA CONFIG:")
    for key, value in DATA_CONFIG.items():
        print(f"  {key}: {value}")
    
    print("\nMODEL CONFIG:")
    print(f"  model_type: {MODEL_CONFIG['model_type']}")
    print(f"  parameters: {MODEL_CONFIG[f'{MODEL_CONFIG['model_type']}_params']}")
    
    print("\nTRAINING CONFIG:")
    for key, value in TRAINING_CONFIG.items():
        print(f"  {key}: {value}")
    
    print("\nEVALUATION CONFIG:")
    for key, value in EVALUATION_CONFIG.items():
        print(f"  {key}: {value}")
    
    print("\nINFERENCE CONFIG:")
    for key, value in INFERENCE_CONFIG.items():
        print(f"  {key}: {value}")
    
    print("\nFEATURES TO USE:")
    for category, features in FEATURES.items():
        print(f"  {category}: {features}")
    
    print("\nLEPROSY TYPES:")
    for class_id, info in LEPROSY_TYPES.items():
        print(f"  {class_id}: {info['name']} - {info['description']}")
    
    print("\n" + "="*60)


if __name__ == '__main__':
    print_config()
