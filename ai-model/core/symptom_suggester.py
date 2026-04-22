import pandas as pd
import os
from collections import Counter

# Load dataset
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/dataset.csv")
df = pd.read_csv(DATA_PATH)

# Identify symptom columns
symptom_columns = [col for col in df.columns if "Symptom" in col]


def suggest_missing_symptoms(input_symptoms, top_n=5):
    """
    Suggest additional symptoms based on co-occurrence frequency
    using text-based symptom dataset.
    """

    input_symptoms = [s.strip().lower() for s in input_symptoms]

    matching_rows = []

    # Find rows where input symptoms exist
    for _, row in df.iterrows():
        row_symptoms = [str(row[col]).strip().lower().replace('_', ' ')
                        for col in symptom_columns
                        if pd.notna(row[col])]

        if any(symptom in rs for rs in row_symptoms for symptom in input_symptoms):
            matching_rows.append(row_symptoms)

    if not matching_rows:
        return []

    # Flatten symptom list
    all_related_symptoms = []
    for symptoms in matching_rows:
        all_related_symptoms.extend(symptoms)

    # Count frequency
    symptom_counts = Counter(all_related_symptoms)

    # Remove already given symptoms
    for symptom in input_symptoms:
        symptom_counts.pop(symptom, None)

    # Get top N suggestions
    suggestions = [symptom for symptom, count in symptom_counts.most_common(top_n)]

    return suggestions
