"""
Leprosy AI Model Prediction API Server
Flask server that serves the trained ML model for integration with the Node.js backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global model variables
model = None
scaler = None
label_encoders = None
feature_names = None

# Leprosy type mapping
LEPROSY_TYPES = {
    0: {'name': 'Tuberculoid (TT)', 'code': 'TT', 'risk_level': 'Low', 'description': 'Paucibacillary - Stable form with strong immune response'},
    1: {'name': 'Borderline Tuberculoid (BT)', 'code': 'BT', 'risk_level': 'Low-Moderate', 'description': 'Paucibacillary - Good immune response'},
    2: {'name': 'Mid-Borderline (BB)', 'code': 'BB', 'risk_level': 'Moderate', 'description': 'Borderline - Intermediate characteristics, unstable'},
    3: {'name': 'Borderline Lepromatous (BL)', 'code': 'BL', 'risk_level': 'High', 'description': 'Multibacillary - Many lesions, unstable form'},
    4: {'name': 'Lepromatous (LL)', 'code': 'LL', 'risk_level': 'High', 'description': 'Multibacillary - Severe form with poor immune response'},
}


def load_model():
    """Load the trained model and preprocessing objects"""
    global model, scaler, label_encoders, feature_names
    
    model_path = os.path.join(os.path.dirname(__file__), 'leprosy_model.pkl')
    scaler_path = os.path.join(os.path.dirname(__file__), 'leprosy_model_scaler.pkl')
    encoders_path = os.path.join(os.path.dirname(__file__), 'leprosy_model_encoders.pkl')
    features_path = os.path.join(os.path.dirname(__file__), 'leprosy_model_features.pkl')
    
    if not os.path.exists(model_path):
        logger.error(f"Model file not found: {model_path}")
        return False
    
    try:
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        label_encoders = joblib.load(encoders_path)
        feature_names = joblib.load(features_path)
        logger.info("✓ Model loaded successfully!")
        logger.info(f"  Features: {feature_names}")
        return True
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return False


def prepare_features(input_data: dict) -> pd.DataFrame:
    """Prepare input features for prediction"""
    # Expected features
    expected_features = [
        'age', 'gender', 'duration_of_illness_months', 'number_of_lesions',
        'largest_lesion_size_cm', 'skin_smear_right', 'skin_smear_left',
        'nerve_involvement', 'nerve_thickening', 'loss_of_sensation',
        'muscle_weakness', 'eye_involvement', 'bacillus_index',
        'morphological_index', 'household_contacts', 'prev_treatment'
    ]
    
    # Build feature dict
    features = {}
    for feat in expected_features:
        val = input_data.get(feat, 0)
        # Handle boolean strings
        if isinstance(val, bool):
            val = 1 if val else 0
        elif isinstance(val, str) and val.lower() in ('true', 'false', 'yes', 'no'):
            val = 1 if val.lower() in ('true', 'yes') else 0
        features[feat] = val
    
    df = pd.DataFrame([features])
    
    # Encode gender: M=1, F=0 (matches training script encoding)
    gender_val = str(df['gender'].iloc[0]).strip().upper()
    df['gender'] = 1 if gender_val == 'M' else 0
    
    # Ensure all columns are numeric
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    
    return df


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict leprosy type from clinical features
    
    Expected JSON body:
    {
        "age": 45,
        "gender": "M",
        "duration_of_illness_months": 12,
        "number_of_lesions": 5,
        "largest_lesion_size_cm": 3.5,
        "skin_smear_right": 2,
        "skin_smear_left": 1,
        "nerve_involvement": 1,
        "nerve_thickening": 0,
        "loss_of_sensation": 1,
        "muscle_weakness": 0,
        "eye_involvement": 0,
        "bacillus_index": 2.0,
        "morphological_index": 45.0,
        "household_contacts": 3,
        "prev_treatment": 0
    }
    """
    if model is None:
        return jsonify({
            'error': 'Model not loaded. Please train the model first using leprosy_model_training.py',
            'success': False
        }), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided', 'success': False}), 400
        
        logger.info(f"Received prediction request: {data}")
        
        # Prepare features
        features_df = prepare_features(data)
        
        # Scale features
        features_scaled = scaler.transform(features_df)
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        
        # Build detailed result
        predicted_type = LEPROSY_TYPES.get(int(prediction), {
            'name': 'Unknown', 'code': 'UNK', 'risk_level': 'Unknown', 'description': 'Unknown type'
        })
        
        # Build all class probabilities
        class_probabilities = {}
        for class_id, type_info in LEPROSY_TYPES.items():
            if class_id < len(probabilities):
                class_probabilities[type_info['name']] = round(float(probabilities[class_id]), 4)
        
        # Feature importance for this prediction
        feature_importance = {}
        if hasattr(model, 'feature_importances_'):
            if feature_names:
                for fname, importance in zip(feature_names, model.feature_importances_):
                    feature_importance[fname] = round(float(importance), 4)
        
        # Clinical interpretation
        interpretation = generate_clinical_interpretation(int(prediction), probabilities, data)
        
        result = {
            'success': True,
            'prediction': {
                'leprosy_type_id': int(prediction),
                'leprosy_type_name': predicted_type['name'],
                'leprosy_type_code': predicted_type['code'],
                'risk_level': predicted_type['risk_level'],
                'description': predicted_type['description'],
                'confidence': round(float(probabilities[int(prediction)]), 4),
                'confidence_percent': round(float(probabilities[int(prediction)]) * 100, 2),
            },
            'class_probabilities': class_probabilities,
            'feature_importance': dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:10]),
            'clinical_interpretation': interpretation,
            'disclaimer': 'This AI prediction is for informational purposes only. Always consult a qualified healthcare professional for diagnosis and treatment decisions.',
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Prediction: {predicted_type['name']} (confidence: {result['prediction']['confidence_percent']}%)")
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """Make predictions for multiple patients"""
    if model is None:
        return jsonify({'error': 'Model not loaded', 'success': False}), 503
    
    try:
        data = request.get_json()
        patients = data.get('patients', [])
        
        if not patients:
            return jsonify({'error': 'No patient data provided', 'success': False}), 400
        
        results = []
        for i, patient in enumerate(patients):
            features_df = prepare_features(patient)
            features_scaled = scaler.transform(features_df)
            prediction = model.predict(features_scaled)[0]
            probabilities = model.predict_proba(features_scaled)[0]
            
            predicted_type = LEPROSY_TYPES.get(int(prediction), {})
            results.append({
                'patient_index': i,
                'patient_id': patient.get('patient_id', f'patient_{i}'),
                'leprosy_type_id': int(prediction),
                'leprosy_type_name': predicted_type.get('name', 'Unknown'),
                'risk_level': predicted_type.get('risk_level', 'Unknown'),
                'confidence': round(float(probabilities[int(prediction)]), 4)
            })
        
        return jsonify({'success': True, 'results': results, 'count': len(results)})
    
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        return jsonify({'error': str(e), 'success': False}), 500


def generate_clinical_interpretation(prediction_class: int, probabilities: np.ndarray, input_data: dict) -> dict:
    """Generate clinical interpretation of the prediction"""
    
    type_info = LEPROSY_TYPES.get(prediction_class, {})
    confidence = float(probabilities[prediction_class])
    
    interpretation = {
        'type_classification': '',
        'bacillary_load': '',
        'treatment_regimen': '',
        'monitoring_priority': '',
        'key_clinical_notes': []
    }
    
    # Classification interpretation
    if prediction_class in [0, 1]:
        interpretation['type_classification'] = 'Paucibacillary (PB)'
        interpretation['bacillary_load'] = 'Low bacillary load - ≤5 skin lesions'
        interpretation['treatment_regimen'] = 'WHO PB-MDT: 6 months (Rifampicin + Dapsone)'
        interpretation['monitoring_priority'] = 'Standard monitoring - monthly clinic visits'
    elif prediction_class in [3, 4]:
        interpretation['type_classification'] = 'Multibacillary (MB)'
        interpretation['bacillary_load'] = 'High bacillary load - >5 skin lesions or positive smear'
        interpretation['treatment_regimen'] = 'WHO MB-MDT: 12 months (Rifampicin + Dapsone + Clofazimine)'
        interpretation['monitoring_priority'] = 'Enhanced monitoring - monthly clinic visits + nerve exams'
    else:
        interpretation['type_classification'] = 'Borderline (BB)'
        interpretation['bacillary_load'] = 'Intermediate bacillary load'
        interpretation['treatment_regimen'] = 'WHO MB-MDT: 12 months (Rifampicin + Dapsone + Clofazimine)'
        interpretation['monitoring_priority'] = 'Close monitoring - unstable form, reaction risk'
    
    # Key clinical notes based on input
    notes = []
    if input_data.get('nerve_involvement') or input_data.get('nerve_thickening'):
        notes.append('⚠️ Nerve involvement detected - neuritis risk assessment required')
    if input_data.get('eye_involvement'):
        notes.append('⚠️ Eye involvement detected - urgent ophthalmology referral recommended')
    if input_data.get('loss_of_sensation'):
        notes.append('⚠️ Sensory loss detected - WHO disability grading recommended')
    if float(input_data.get('bacillus_index', 0)) > 3:
        notes.append('⚠️ High bacillary index - monitor for Type 2 (ENL) reactions')
    if prediction_class == 2:
        notes.append('⚠️ Borderline form is immunologically unstable - Type 1 reactions are common')
    if confidence < 0.6:
        notes.append('ℹ️ Prediction confidence is moderate - additional clinical assessment recommended')
    
    interpretation['key_clinical_notes'] = notes
    
    return interpretation


@app.route('/model/info', methods=['GET'])
def model_info():
    """Get model information"""
    if model is None:
        return jsonify({'error': 'Model not loaded', 'success': False}), 503
    
    info = {
        'success': True,
        'model_type': type(model).__name__,
        'features': feature_names or [],
        'n_classes': 5,
        'class_names': [t['name'] for t in LEPROSY_TYPES.values()],
        'leprosy_types': LEPROSY_TYPES
    }
    
    if hasattr(model, 'n_estimators'):
        info['n_estimators'] = model.n_estimators
    if hasattr(model, 'feature_importances_') and feature_names:
        importance_dict = dict(zip(feature_names, model.feature_importances_.tolist()))
        info['feature_importance'] = dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
    
    return jsonify(info)


if __name__ == '__main__':
    logger.info("Starting Leprosy AI Prediction Server...")
    
    # Load model
    if not load_model():
        logger.warning("⚠️ Model not loaded. Run leprosy_model_training.py first to train and save the model.")
        logger.warning("  Starting server anyway - predictions will return 503 until model is trained.")
    
    logger.info("🚀 Server starting on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=False)
