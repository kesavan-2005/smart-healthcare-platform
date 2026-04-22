import joblib
import pandas as pd
import os

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "../models/disease_model.pkl")
FEATURE_PATH = os.path.join(BASE_DIR, "../models/feature_names.pkl")

# -----------------------------
# Load Model + Feature Order
# -----------------------------
model = joblib.load(MODEL_PATH)
feature_names = joblib.load(FEATURE_PATH)


def predict_disease(symptom_list):
    """
    Predict disease and return:
    - Top 3 probable diseases
    - Their confidence scores
    """

    # Normalize input
    symptom_list = [s.lower() for s in symptom_list]

    # Create input vector using SAME feature order as training
    input_vector = []

    for feature in feature_names:
        clean_feature = feature.strip().replace("_", " ").lower()
        if clean_feature in symptom_list:
            input_vector.append(1)
        else:
            input_vector.append(0)

    # Create DataFrame with correct feature names
    input_df = pd.DataFrame([input_vector], columns=feature_names)

    # Get probability distribution
    probabilities = model.predict_proba(input_df)[0]

    # Get top 3 predictions
    top_indices = probabilities.argsort()[-3:][::-1]

    results = []

    for idx in top_indices:
        disease = model.classes_[idx]
        confidence = round(probabilities[idx] * 100, 2)
        results.append((disease, confidence))

    return results