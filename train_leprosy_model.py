"""
Quick-start trainer: generates realistic synthetic leprosy data and trains the model.
Run: py train_leprosy_model.py
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

np.random.seed(42)

N = 1200  # rows per class (balanced)

def make_class(n, label, age_range, lesion_range, duration_range,
               nerve_p, thickening_p, sensation_p, muscle_p, eye_p,
               smear_range, bi_range, mi_range, contact_range, treat_p):
    age = np.random.randint(*age_range, n)
    gender = np.random.choice(['M', 'F'], n)
    duration = np.random.randint(*duration_range, n)
    lesions = np.random.randint(*lesion_range, n)
    lesion_size = np.round(np.random.uniform(0.5, lesion_range[1] * 0.4, n), 1)
    smear_r = np.round(np.random.uniform(*smear_range, n), 1)
    smear_l = np.round(np.random.uniform(*smear_range, n), 1)
    nerve = np.random.binomial(1, nerve_p, n)
    thickening = np.random.binomial(1, thickening_p, n)
    sensation = np.random.binomial(1, sensation_p, n)
    muscle = np.random.binomial(1, muscle_p, n)
    eye = np.random.binomial(1, eye_p, n)
    bi = np.round(np.random.uniform(*bi_range, n), 2)
    mi = np.round(np.random.uniform(*mi_range, n), 1)
    contacts = np.random.randint(*contact_range, n)
    prev_treat = np.random.binomial(1, treat_p, n)
    target = np.full(n, label)

    return pd.DataFrame({
        'age': age, 'gender': gender, 'duration_of_illness_months': duration,
        'number_of_lesions': lesions, 'largest_lesion_size_cm': lesion_size,
        'skin_smear_right': smear_r, 'skin_smear_left': smear_l,
        'nerve_involvement': nerve, 'nerve_thickening': thickening,
        'loss_of_sensation': sensation, 'muscle_weakness': muscle,
        'eye_involvement': eye, 'bacillus_index': bi, 'morphological_index': mi,
        'household_contacts': contacts, 'prev_treatment': prev_treat,
        'target': target
    })

# TT – Tuberculoid: few lesions, low bacillary load, strong nerve involvement
tt = make_class(N, 0, (15, 60), (1, 5), (3, 18), 0.80, 0.45, 0.65, 0.10, 0.05,
                (0.0, 0.5), (0.0, 0.5), (0.0, 5.0), (1, 4), 0.10)

# BT – Borderline Tuberculoid
bt = make_class(N, 1, (18, 65), (3, 10), (6, 30), 0.70, 0.55, 0.60, 0.20, 0.08,
                (0.0, 1.5), (0.0, 1.5), (0.0, 15.0), (1, 5), 0.15)

# BB – Mid-Borderline
bb = make_class(N, 2, (20, 70), (8, 20), (12, 48), 0.65, 0.60, 0.55, 0.35, 0.15,
                (1.0, 3.0), (1.0, 3.0), (5.0, 30.0), (1, 6), 0.20)

# BL – Borderline Lepromatous
bl = make_class(N, 3, (22, 70), (15, 50), (24, 72), 0.55, 0.65, 0.50, 0.45, 0.25,
                (2.5, 4.5), (2.5, 4.5), (15.0, 50.0), (2, 8), 0.25)

# LL – Lepromatous: many lesions, high bacillary load
ll = make_class(N, 4, (25, 75), (30, 200), (36, 120), 0.40, 0.75, 0.45, 0.55, 0.40,
                (4.0, 6.0), (4.0, 6.0), (30.0, 100.0), (2, 10), 0.30)

df = pd.concat([tt, bt, bb, bl, ll], ignore_index=True).sample(frac=1, random_state=42)

# Encode gender
df['gender'] = (df['gender'] == 'M').astype(int)

feature_names = [
    'age', 'gender', 'duration_of_illness_months', 'number_of_lesions',
    'largest_lesion_size_cm', 'skin_smear_right', 'skin_smear_left',
    'nerve_involvement', 'nerve_thickening', 'loss_of_sensation',
    'muscle_weakness', 'eye_involvement', 'bacillus_index',
    'morphological_index', 'household_contacts', 'prev_treatment'
]

X = df[feature_names].values
y = df['target'].values

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

clf = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)
clf.fit(X_train_s, y_train)

print("\n=== Evaluation ===")
y_pred = clf.predict(X_test_s)
print(classification_report(y_test, y_pred,
      target_names=['TT', 'BT', 'BB', 'BL', 'LL']))

base = os.path.dirname(os.path.abspath(__file__))
joblib.dump(clf, os.path.join(base, 'leprosy_model.pkl'))
joblib.dump(scaler, os.path.join(base, 'leprosy_model_scaler.pkl'))
joblib.dump({}, os.path.join(base, 'leprosy_model_encoders.pkl'))
joblib.dump(feature_names, os.path.join(base, 'leprosy_model_features.pkl'))

print("\n✓ Model saved: leprosy_model.pkl")
print("✓ Scaler saved: leprosy_model_scaler.pkl")
print("✓ Features saved: leprosy_model_features.pkl")
print("\nNow (re)start leprosy_prediction_server.py\n")
