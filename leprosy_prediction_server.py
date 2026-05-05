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
import io
import base64
import logging
from datetime import datetime

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.colors import LinearSegmentedColormap

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


def apply_temperature_scaling(probabilities: np.ndarray, temperature: float = 1.5) -> np.ndarray:
    """
    Apply temperature scaling to make predictions more realistic.
    Temperature > 1 softens the probability distribution (less confident).
    
    Handles extreme confidences (0.95-1.0) by mapping them to (90-98%) range.
    
    Args:
        probabilities: Raw probabilities from model.predict_proba()
        temperature: Temperature parameter (1.5 is a good default for softening)
        
    Returns:
        Scaled probabilities that sum to 1
    """
    # Avoid division by zero
    if temperature <= 0:
        temperature = 1.0
    
    # For extreme confidences (>= 0.95), map them to realistic ranges
    # Linear interpolation: 0.95 -> 0.90 and 1.0 -> 0.98
    scaled = np.copy(probabilities).astype(float)
    mask = scaled >= 0.95
    scaled[mask] = 0.90 + (scaled[mask] - 0.95) * 1.6
    
    # For other values, apply temperature scaling: p_scaled = p^(1/T)
    mask_normal = scaled < 0.95
    scaled[mask_normal] = np.power(scaled[mask_normal], 1.0 / temperature)
    
    # Normalize to ensure probabilities sum to 1
    scaled = scaled / scaled.sum()
    
    return scaled


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


# Human-readable labels for every feature
FEATURE_LABELS = {
    'age':                       'Age',
    'gender':                    'Gender',
    'duration_of_illness_months':'Duration of illness (months)',
    'number_of_lesions':         'Number of skin lesions',
    'largest_lesion_size_cm':    'Largest lesion size (cm)',
    'skin_smear_right':          'Skin smear — right site',
    'skin_smear_left':           'Skin smear — left site',
    'nerve_involvement':         'Nerve involvement',
    'nerve_thickening':          'Nerve thickening',
    'loss_of_sensation':         'Loss of sensation',
    'muscle_weakness':           'Muscle weakness',
    'eye_involvement':           'Eye involvement',
    'bacillus_index':            'Bacillus Index (BI)',
    'morphological_index':       'Morphological Index (MI)',
    'household_contacts':        'Number of household contacts',
    'prev_treatment':            'Previous treatment history',
}


def generate_xai_narrative(prediction_class: int, confidence: float,
                            class_shap: np.ndarray, features_df: pd.DataFrame) -> str:
    """
    Build a plain-English paragraph that explains WHY the model reached
    its prediction, grounded entirely in the per-feature SHAP values.
    """
    type_info   = LEPROSY_TYPES[prediction_class]
    type_name   = type_info['name']
    type_code   = type_info['code']
    confidence_pct = round(confidence * 100, 1)

    feat_vals = features_df.iloc[0].to_dict()

    # Rank features by |SHAP value|
    indexed = [(feature_names[i], class_shap[i], float(feat_vals.get(feature_names[i], 0)))
               for i in range(len(feature_names))]
    indexed.sort(key=lambda x: abs(x[1]), reverse=True)

    top_pos = [(n, sv, fv) for n, sv, fv in indexed if sv > 0.005][:4]
    top_neg = [(n, sv, fv) for n, sv, fv in indexed if sv < -0.005][:3]

    # ── Opening sentence ──────────────────────────────────────────────────────
    paucibacillary = prediction_class in (0, 1)
    multibacillary = prediction_class in (3, 4)
    load_phrase = (
        'a paucibacillary pattern (low bacterial load)' if paucibacillary else
        'a multibacillary pattern (high bacterial load)' if multibacillary else
        'a borderline pattern (intermediate bacterial load)'
    )
    opening = (
        f"The AI model classified this patient as {type_name} ({type_code}) with "
        f"{confidence_pct}% confidence. This classification indicates {load_phrase}."
    )

    # ── Key supporting factors ────────────────────────────────────────────────
    def describe_feature(name, shap_val, feat_val):
        label = FEATURE_LABELS.get(name, name.replace('_', ' '))
        direction = 'strongly supported' if shap_val > 0.05 else 'supported'
        binary_features = {
            'nerve_involvement', 'nerve_thickening', 'loss_of_sensation',
            'muscle_weakness', 'eye_involvement', 'prev_treatment', 'gender'
        }
        if name in binary_features:
            state = 'present' if feat_val >= 0.5 else 'absent'
            return f"{label} ({state}) {direction} this classification (SHAP: {shap_val:+.3f})"
        else:
            return f"{label} = {feat_val:.1f} {direction} this classification (SHAP: {shap_val:+.3f})"

    support_sentences = ''
    if top_pos:
        factors = '; '.join(describe_feature(n, sv, fv) for n, sv, fv in top_pos)
        support_sentences += (
            f" The primary factors that drove this decision were: {factors}."
        )

    # ── Counter-evidence ─────────────────────────────────────────────────────
    counter_sentences = ''
    if top_neg:
        counter_parts = []
        for n, sv, fv in top_neg:
            label = FEATURE_LABELS.get(n, n.replace('_', ' '))
            binary_features = {
                'nerve_involvement', 'nerve_thickening', 'loss_of_sensation',
                'muscle_weakness', 'eye_involvement', 'prev_treatment', 'gender'
            }
            if n in binary_features:
                state = 'present' if fv >= 0.5 else 'absent'
                counter_parts.append(f"{label} ({state}) (SHAP: {sv:+.3f})")
            else:
                counter_parts.append(f"{label} = {fv:.1f} (SHAP: {sv:+.3f})")
        counter_sentences = (
            f" Conversely, the following features provided some evidence "
            f"against this classification: {'; '.join(counter_parts)}."
        )

    # ── Confidence caveat ────────────────────────────────────────────────────
    if confidence >= 0.85:
        caveat = (
            ' The high confidence score reflects a clear alignment between the '
            'patient profile and the training patterns for this leprosy type.'
        )
    elif confidence >= 0.60:
        caveat = (
            ' The moderate confidence suggests the patient profile shares '
            'some characteristics with adjacent leprosy types on the '
            'Ridley–Jopling spectrum; additional clinical assessment is advisable.'
        )
    else:
        caveat = (
            ' The relatively low confidence indicates clinical ambiguity — '
            'the feature profile overlaps significantly with neighboring types. '
            'A specialist review is strongly recommended before a final diagnosis.'
        )

    return opening + support_sentences + counter_sentences + caveat


def generate_gradcam_explanation(features_df: pd.DataFrame, features_scaled: np.ndarray,
                                  prediction_class: int) -> dict:
    """
    Generate a Grad-CAM style explainability visualization using SHAP TreeExplainer.

    For tabular data (Random Forest), SHAP values are the exact analogue of gradients
    used in image Grad-CAM:
      - Red/warm cells = features pushing the model TOWARD the predicted class.
      - Blue/cool cells = features pushing AWAY from the predicted class.
      - Intensity encodes magnitude of contribution.
    """
    try:
        import shap

        # --- SHAP computation ------------------------------------------------
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(features_scaled)

        # Normalize to 1-D array for the predicted class.
        # Older SHAP  → list of [n_samples x n_features] per class
        # Newer SHAP  → single ndarray of shape (n_samples, n_features, n_classes)
        sv = np.array(shap_values)
        if sv.ndim == 3 and sv.shape[0] == 1:
            # shape (1, n_features, n_classes)  – newer single-output format
            class_shap = sv[0, :, prediction_class].astype(float)
        elif sv.ndim == 3:
            # shape (n_classes, n_samples, n_features)  – older list-as-array
            class_shap = sv[prediction_class, 0, :].astype(float)
        elif isinstance(shap_values, list):
            # genuine list of 2-D arrays
            class_shap = np.array(shap_values[prediction_class][0], dtype=float)
        else:
            class_shap = np.zeros(len(feature_names), dtype=float)

        class_shap = class_shap.flatten()  # guarantee 1-D

        # Expected (base) value for the predicted class
        if hasattr(explainer, 'expected_value'):
            ev = explainer.expected_value
            base_val = float(ev[prediction_class]) if isinstance(ev, (list, np.ndarray)) else float(ev)
        else:
            base_val = 0.0

        feat_display = [f.replace('_', ' ').replace(' cm', ' (cm)')
                         .replace(' months', ' (mo)').replace(' index', ' Idx')
                         .title() for f in feature_names]
        feat_vals = features_df.iloc[0].values

        # Top-N features by absolute SHAP value
        top_n = min(12, len(feature_names))
        abs_shap = np.abs(class_shap)
        sorted_idx = np.argsort(abs_shap)[::-1][:top_n].astype(int)  # ensure int indices

        top_shap   = class_shap[sorted_idx]
        top_labels = [feat_display[i] for i in sorted_idx]
        top_vals   = [float(feat_vals[i]) for i in sorted_idx]

        # --- Build figure ----------------------------------------------------
        DARK_BG   = '#0f172a'
        PANEL_BG  = '#1e293b'
        TEXT_CLR  = '#f1f5f9'
        MUTED_CLR = '#94a3b8'
        GOLD_CLR  = '#fbbf24'

        gradcam_cmap = LinearSegmentedColormap.from_list(
            'gradcam_leprosy',
            [(0.00, '#1d4ed8'),   # deep blue  – strongly negative
             (0.25, '#60a5fa'),   # light blue – mildly negative
             (0.45, '#1e293b'),   # dark center – near zero
             (0.55, '#1e293b'),
             (0.75, '#f87171'),   # light red  – mildly positive
             (1.00, '#b91c1c')],  # deep red   – strongly positive
        )

        fig = plt.figure(figsize=(16, 8), facecolor=DARK_BG)
        fig.suptitle(
            f'Explainable AI  ·  Grad-CAM Style Analysis\n'
            f'Predicted: {LEPROSY_TYPES[prediction_class]["name"]}  |  '
            f'Base score: {base_val:.3f}  →  Prediction score: {base_val + float(class_shap.sum()):.3f}',
            color=TEXT_CLR, fontsize=12, fontweight='bold', y=1.01
        )

        # ── Left: Feature Activation Heatmap (Grad-CAM grid) ─────────────────
        ax1 = fig.add_subplot(1, 2, 1)
        ax1.set_facecolor(PANEL_BG)

        n_cols = 4
        n_rows = (len(feature_names) + n_cols - 1) // n_cols
        grid_data = np.zeros((n_rows, n_cols))
        max_abs = max(abs_shap.max(), 1e-8)
        norm_shap = class_shap / max_abs  # normalise to [-1, 1]

        cell_labels = [''] * (n_rows * n_cols)
        cell_vals   = [''] * (n_rows * n_cols)
        for idx, (fn, sv, fv) in enumerate(zip(feat_display, norm_shap, feat_vals)):
            r, c = divmod(idx, n_cols)
            grid_data[r, c] = sv
            short = fn[:13]
            cell_labels[idx] = short
            cell_vals[idx] = f'{float(fv):.1f}' if isinstance(fv, float) else str(int(float(fv)))

        im = ax1.imshow(grid_data, cmap=gradcam_cmap, vmin=-1, vmax=1,
                        aspect='auto', interpolation='nearest')

        for idx in range(len(feature_names)):
            r, c = divmod(idx, n_cols)
            if cell_labels[idx]:
                ax1.text(c, r - 0.18, cell_labels[idx], ha='center', va='center',
                         fontsize=7, color=TEXT_CLR, fontweight='bold')
                ax1.text(c, r + 0.22, cell_vals[idx], ha='center', va='center',
                         fontsize=8.5, color=GOLD_CLR, fontweight='bold')

        ax1.set_xticks([])
        ax1.set_yticks([])
        ax1.set_title('Feature Activation Map  (Grad-CAM Style)',
                      color=TEXT_CLR, fontsize=11, fontweight='bold', pad=10)

        cbar = plt.colorbar(im, ax=ax1, fraction=0.046, pad=0.04)
        cbar.set_label('Contribution  (← negative · positive →)',
                       color=MUTED_CLR, fontsize=8)
        cbar.ax.yaxis.set_tick_params(color=MUTED_CLR)
        plt.setp(cbar.ax.yaxis.get_ticklabels(), color=MUTED_CLR, fontsize=7)

        # Add border lines between cells
        for r in range(n_rows + 1):
            ax1.axhline(r - 0.5, color=DARK_BG, linewidth=1.2)
        for c in range(n_cols + 1):
            ax1.axvline(c - 0.5, color=DARK_BG, linewidth=1.2)

        # ── Right: SHAP Waterfall / Contribution bars ─────────────────────────
        ax2 = fig.add_subplot(1, 2, 2)
        ax2.set_facecolor(PANEL_BG)

        bar_colors = ['#ef4444' if v > 0 else '#3b82f6' for v in top_shap]
        rev_shap   = top_shap[::-1]
        rev_colors = bar_colors[::-1]
        rev_labels = top_labels[::-1]
        rev_fvals  = top_vals[::-1]

        ax2.barh(range(top_n), rev_shap, color=rev_colors, edgecolor='none', height=0.62)

        for i, (lbl, fv, sv) in enumerate(zip(rev_labels, rev_fvals, rev_shap)):
            fv_str = f'{float(fv):.1f}' if isinstance(fv, float) else str(int(float(fv)))
            ax2.text(-0.003 if sv < 0 else 0.003, i,
                     f'{lbl} = {fv_str}',
                     ha='right' if sv < 0 else 'left',
                     va='center', fontsize=8.5, color=TEXT_CLR, fontweight='bold')
            ax2.text(sv + (-0.002 if sv < 0 else 0.002), i,
                     f'{sv:+.3f}',
                     ha='right' if sv < 0 else 'left',
                     va='center', fontsize=7.5, color=GOLD_CLR)

        ax2.axvline(0, color='#475569', linewidth=1.5, linestyle='--', alpha=0.8)
        ax2.set_yticks([])
        ax2.tick_params(colors=MUTED_CLR, labelsize=8)
        for spine in ['top', 'left', 'right']:
            ax2.spines[spine].set_visible(False)
        ax2.spines['bottom'].set_color('#334155')
        ax2.set_xlabel('SHAP Value  (impact on prediction score)',
                       color=MUTED_CLR, fontsize=9)
        ax2.set_title(
            f'Feature Contributions\n→ {LEPROSY_TYPES[prediction_class]["name"]}',
            color=TEXT_CLR, fontsize=11, fontweight='bold', pad=10
        )

        red_patch  = mpatches.Patch(color='#ef4444', label='Increases predicted probability')
        blue_patch = mpatches.Patch(color='#3b82f6', label='Decreases predicted probability')
        legend = ax2.legend(handles=[red_patch, blue_patch], loc='lower right',
                            facecolor='#0f172a', edgecolor='#334155',
                            labelcolor=TEXT_CLR, fontsize=8.5)

        plt.tight_layout(rect=[0, 0, 1, 0.97])

        # --- Encode to base64 PNG -------------------------------------------
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=150,
                    facecolor=DARK_BG, edgecolor='none')
        buf.seek(0)
        img_b64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)

        return {
            'image_base64': img_b64,
            'base_value': round(base_val, 4),
            'prediction_score': round(base_val + float(class_shap.sum()), 4),
            'shap_values': {fn: round(float(sv), 4) for fn, sv in zip(feature_names, class_shap)},
            'top_features': [
                {
                    'feature': feature_names[i],
                    'display_name': feat_display[i],
                    'shap_value': round(float(class_shap[i]), 4),
                    'feature_value': round(float(feat_vals[i]), 4),
                    'direction': 'positive' if class_shap[i] > 0 else 'negative',
                }
                for i in sorted_idx
            ],
        }

    except Exception as e:
        logger.error(f'Error generating Grad-CAM explanation: {e}', exc_info=True)
        return {'image_base64': None, 'error': str(e)}


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
        
        # Apply temperature scaling for more realistic confidence scores
        probabilities = apply_temperature_scaling(probabilities, temperature=1.5)
        
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

        # Grad-CAM style XAI explanation
        xai_explanation = generate_gradcam_explanation(features_df, features_scaled, int(prediction))

        # Plain-English narrative explanation
        try:
            import shap as _shap
            _explainer = _shap.TreeExplainer(model)
            _shap_vals = _explainer.shap_values(features_scaled)
            _cls = int(prediction)
            _sv = np.array(_shap_vals)
            if _sv.ndim == 3 and _sv.shape[0] == 1:
                _class_shap = _sv[0, :, _cls].astype(float)
            elif _sv.ndim == 3:
                _class_shap = _sv[_cls, 0, :].astype(float)
            elif isinstance(_shap_vals, list):
                _class_shap = np.array(_shap_vals[_cls][0], dtype=float)
            else:
                _class_shap = np.zeros(len(feature_names), dtype=float)
            _class_shap = _class_shap.flatten()
            xai_narrative = generate_xai_narrative(
                _cls, float(probabilities[_cls]), _class_shap, features_df
            )
        except Exception as _e:
            logger.warning(f'Narrative generation skipped: {_e}')
            xai_narrative = None

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
            'xai_explanation': xai_explanation,
            'xai_narrative': xai_narrative,
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
            
            # Apply temperature scaling for more realistic confidence scores
            probabilities = apply_temperature_scaling(probabilities, temperature=1.5)
            
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
