#
# import joblib
# import pandas as pd
# import os
#
# # -----------------------------
# # Load Paths
# # -----------------------------
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
#
# MODEL_PATH = os.path.join(BASE_DIR, "models", "disease_model.pkl")
# ENCODER_PATH = os.path.join(BASE_DIR, "models", "symptom_encoder.pkl")
#
# DATASET_PATH = os.path.join(BASE_DIR, "data", "dataset.csv")
# DESCRIPTION_PATH = os.path.join(BASE_DIR, "data", "symptom_description.csv")
# PRECAUTION_PATH = os.path.join(BASE_DIR, "data", "symptom_precaution.csv")
# SEVERITY_PATH = os.path.join(BASE_DIR, "data", "symptom_severity.csv")
#
# # -----------------------------
# # Load Model & Data
# # -----------------------------
# model = joblib.load(MODEL_PATH)
# mlb = joblib.load(ENCODER_PATH)
#
# dataset_df = pd.read_csv(DATASET_PATH)
# description_df = pd.read_csv(DESCRIPTION_PATH)
# precaution_df = pd.read_csv(PRECAUTION_PATH)
# severity_df = pd.read_csv(SEVERITY_PATH)
#
# # -----------------------------
# # Risk Calculation
# # -----------------------------
# def calculate_risk(symptoms):
#     total_severity = 0
#     for symptom in symptoms:
#         row = severity_df[severity_df['Symptom'] == symptom]
#         if not row.empty:
#             total_severity += int(row['weight'].values[0])
#     return total_severity
#
# # -----------------------------
# # Interactive Terminal
# # -----------------------------
# print("\n🧠 Smart Healthcare AI (Terminal Mode)")
# print("Enter symptoms separated by comma (example: fever, headache)\n")
#
# user_input = input("Enter symptoms: ")
# input_symptoms = [s.strip() for s in user_input.split(",")]
#
# # Encode
# input_encoded = mlb.transform([input_symptoms])
#
# # Predict
# prediction = model.predict(input_encoded)[0]
# probabilities = model.predict_proba(input_encoded)[0]
# model_confidence = max(probabilities)
#
# # Explainable AI
# disease_symptoms = dataset_df[dataset_df['Disease'] == prediction].iloc[:, 1:].values.flatten()
# disease_symptoms = [s for s in disease_symptoms if pd.notna(s)]
#
# matched_symptoms = list(set(input_symptoms) & set(disease_symptoms))
# match_ratio = len(matched_symptoms) / len(disease_symptoms)
#
# final_confidence = ((model_confidence * 0.7) + (match_ratio * 0.3)) * 100
#
# # Risk
# risk_score = calculate_risk(input_symptoms)
#
# if risk_score <= 5:
#     risk_level = "Low"
# elif risk_score <= 10:
#     risk_level = "Moderate"
# else:
#     risk_level = "High"
#
# # Description
# description_row = description_df[description_df['Disease'] == prediction]
# description = description_row['Description'].values[0] if not description_row.empty else "No description available"
#
# # Precautions
# precaution_row = precaution_df[precaution_df['Disease'] == prediction]
# precautions = precaution_row.iloc[0, 1:].dropna().tolist() if not precaution_row.empty else []
#
# # -----------------------------
# # Output
# # -----------------------------
# print("\n🔍 Prediction Result")
# print("Predicted Disease:", prediction)
# print("Confidence:", round(final_confidence, 2), "%")
# print("Risk Level:", risk_level)
# print("Matched Symptoms:", matched_symptoms)
# print("\nDescription:", description)
# print("\nPrecautions:")
# for p in precautions:
#     print("-", p)


#core/symptom_suggester testing

# from core.symptom_suggester import suggest_missing_symptoms
# 
# input_symptoms = ["itching"]
# suggestions = suggest_missing_symptoms(input_symptoms)
# 
# print("Suggested Additional Symptoms:", suggestions)

#questioning_engine testing

# from core.symptom_suggester import suggest_missing_symptoms
# from core.questioning_engine import generate_questions, update_symptoms_with_answers
#
# # Initial user input
# input_symptoms = ["itching"]
#
# # Step 1: Suggest missing symptoms
# suggestions = suggest_missing_symptoms(input_symptoms)
# print("Suggested Symptoms:", suggestions)
#
# # Step 2: Generate questions
# questions = generate_questions(suggestions)
#
# answers = {}
#
# # Simulate user answering
# for q in questions:
#     user_input = input(q["question"] + " ")
#     answers[q["symptom"]] = user_input.lower() == "yes"
#
# # Step 3: Update symptom list
# final_symptoms = update_symptoms_with_answers(input_symptoms, answers)
#
# print("Updated Symptom List:", final_symptoms)

#risk_calculator testing

# from core.symptom_suggester import suggest_missing_symptoms
# from core.questioning_engine import generate_questions, update_symptoms_with_answers
# from core.risk_calculator import calculate_risk
#
# # 1️⃣ Initial input
# input_symptoms = ["itching"]
#
# # 2️⃣ Suggest missing symptoms
# suggestions = suggest_missing_symptoms(input_symptoms)
# print("Suggested Symptoms:", suggestions)
#
# # 3️⃣ Generate questions
# questions = generate_questions(suggestions)
#
# answers = {}
#
# # 4️⃣ Ask user
# for q in questions:
#     user_input = input(q["question"] + " ")
#     answers[q["symptom"]] = user_input.lower() == "yes"
#
# # 5️⃣ Update symptoms
# final_symptoms = update_symptoms_with_answers(input_symptoms, answers)
#
# print("Updated Symptom List:", final_symptoms)
#
# # 6️⃣ Calculate risk
# risk_percent, severity_level = calculate_risk(final_symptoms)
#
# print(f"Risk Percentage: {risk_percent}%")
# print(f"Severity Level: {severity_level}")

#emergency_detector testing

# from core.symptom_suggester import suggest_missing_symptoms
# from core.questioning_engine import generate_questions, update_symptoms_with_answers
# from core.risk_calculator import calculate_risk
# from core.emergency_detector import check_emergency
#
#
# # 1️⃣ Initial user input
# input_symptoms = ["itching"]
#
# # 2️⃣ Suggest missing symptoms
# suggestions = suggest_missing_symptoms(input_symptoms)
# print("Suggested Symptoms:", suggestions)
#
# # 3️⃣ Generate follow-up questions
# questions = generate_questions(suggestions)
#
# answers = {}
#
# # 4️⃣ Ask user
# for q in questions:
#     user_input = input(q["question"] + " ")
#     answers[q["symptom"]] = user_input.lower() == "yes"
#
# # 5️⃣ Update symptoms
# final_symptoms = update_symptoms_with_answers(input_symptoms, answers)
# print("Updated Symptom List:", final_symptoms)
#
# # 6️⃣ Calculate risk
# risk_percent, severity_level = calculate_risk(final_symptoms)
# print(f"Risk Percentage: {risk_percent}%")
# print(f"Severity Level: {severity_level}")
#
# # 7️⃣ Emergency detection
# is_emergency, message = check_emergency(final_symptoms)
# print("Emergency Status:", message)

# all testing

from core.predictor import predict_disease
from core.symptom_suggester import suggest_missing_symptoms
from core.questioning_engine import generate_questions, update_symptoms_with_answers
from core.risk_calculator import calculate_risk
from core.emergency_detector import check_emergency
from core.xai_explainer import explain_prediction


# 1️⃣ Initial input
input_symptoms = ["itching"]

# 2️⃣ Initial prediction
initial_results = predict_disease(input_symptoms)

print("\n🔍 Initial Predictions:")
for disease, conf in initial_results:
    print(f"{disease} ({conf}%)")


# 3️⃣ Suggest symptoms
suggestions = suggest_missing_symptoms(input_symptoms)
print("\nSuggested Symptoms:", suggestions)

# 4️⃣ Questioning
questions = generate_questions(suggestions)

answers = {}

for q in questions:
    user_input = input(q["question"] + " ")
    answers[q["symptom"]] = user_input.lower() == "yes"

# 5️⃣ Update symptoms
final_symptoms = update_symptoms_with_answers(input_symptoms, answers)
print("\nUpdated Symptom List:", final_symptoms)

# 6️⃣ Re-run prediction
final_results = predict_disease(final_symptoms)

print("\n🩺 Final Predictions:")
for disease, conf in final_results:
    print(f"{disease} ({conf}%)")

# Extract top prediction for SHAP explanation
top_disease = final_results[0][0]


# 7️⃣ Risk
risk_percent, severity_level = calculate_risk(final_symptoms)
print(f"\nRisk Percentage: {risk_percent}%")
print(f"Severity Level: {severity_level}")

# 8️⃣ Emergency check
is_emergency, message = check_emergency(final_symptoms)
print("Emergency Status:", message)


# 9️⃣ SHAP Explainability
prediction, shap_values = explain_prediction(final_symptoms)

print("\n🔬 SHAP Explanation (Top Contributing Features):")

for feature, value in shap_values:
    if abs(value) > 0.001:
        sign = "+" if value > 0 else "-"
        print(f"{feature} → {sign}{round(abs(value), 4)}")





