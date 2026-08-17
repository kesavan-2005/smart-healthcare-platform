import pandas as pd
import os

# Load severity data
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/symptom_severity.csv")
severity_df = pd.read_csv(DATA_PATH)

# Convert to dictionary for fast lookup
severity_dict = dict(zip(severity_df["Symptom"].str.lower(), severity_df["weight"]))


def calculate_risk(symptoms):
    """
    Calculate severity score and risk percentage
    """

    total_score = 0
    max_possible_score = 0

    for symptom in symptoms:
        symptom = symptom.lower()
        if symptom in severity_dict:
            total_score += severity_dict[symptom]

    # Calculate max possible score (assuming max weight is 7)
    max_possible_score = len(symptoms) * 7

    if max_possible_score == 0:
        return 0, "Low"

    risk_percentage = (total_score / max_possible_score) * 100

    # Severity classification
    if risk_percentage < 30:
        level = "Mild"
    elif risk_percentage < 60:
        level = "Moderate"
    else:
        level = "Severe"

    return round(risk_percentage, 2), level
