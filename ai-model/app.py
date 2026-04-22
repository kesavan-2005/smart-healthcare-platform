from flask import Flask, request, jsonify, render_template
import os
import pandas as pd

# Import your modular pipeline
from core.predictor import predict_disease
from core.risk_calculator import calculate_risk
from core.emergency_detector import check_emergency
from core.xai_explainer import explain_prediction
from core.symptom_suggester import suggest_missing_symptoms
from core.questioning_engine import generate_questions
from core.report_parser import process_medical_report
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow React to connect
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16 MB max upload

# -----------------------------
# Load Extra Data
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DESCRIPTION_PATH = os.path.join(BASE_DIR, "data", "symptom_description.csv")
PRECAUTION_PATH = os.path.join(BASE_DIR, "data", "symptom_precaution.csv")
DOCTOR_PATH = os.path.join(BASE_DIR, "data", "symptom_doctor.csv")
ALT_MED_PATH = os.path.join(BASE_DIR, "data", "symptom_alt_medicine.csv")
LAB_TEST_PATH = os.path.join(BASE_DIR, "data", "symptom_lab_tests.csv")

description_df = pd.read_csv(DESCRIPTION_PATH)
precaution_df = pd.read_csv(PRECAUTION_PATH)
doctor_df = pd.read_csv(DOCTOR_PATH)
alt_med_df = pd.read_csv(ALT_MED_PATH)
lab_test_df = pd.read_csv(LAB_TEST_PATH)


# -----------------------------
# Home Route
# -----------------------------
@app.route('/api/health')
def health_check():
    return jsonify({"status": "running", "message": "SmartHealth AI Server Active"})

# -----------------------------
# Upload Report Route
# -----------------------------
@app.route('/upload-report', methods=['POST'])
def upload_report():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
        
    try:
        result = process_medical_report(file, file.filename)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Suggest Route
# -----------------------------
@app.route("/suggest", methods=["POST"])
def suggest_symptoms():
    data = request.get_json()

    if not data or "symptoms" not in data:
        return jsonify({"error": "No symptoms provided"}), 400

    input_symptoms = [s.lower() for s in data["symptoms"]]
    
    # Generate suggestions
    suggestions = suggest_missing_symptoms(input_symptoms, top_n=5)
    
    # Format queries
    questions = generate_questions(suggestions)

    return jsonify({"questions": questions})


# -----------------------------
# Prediction Route
# -----------------------------
@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    if not data or "symptoms" not in data:
        return jsonify({"error": "No symptoms provided"}), 400

    input_symptoms = [s.lower() for s in data["symptoms"]]

    # -------------------------
    # 1️⃣ Initial Prediction
    # -------------------------
    predictions = predict_disease(input_symptoms)

    # Top predicted disease
    top_disease = predictions[0][0]
    top_confidence = predictions[0][1]

    # -------------------------
    # 2️⃣ Risk Calculation
    # -------------------------
    risk_percent, severity_level = calculate_risk(input_symptoms)

    # -------------------------
    # 3️⃣ Emergency Detection
    # -------------------------
    is_emergency, emergency_message = check_emergency(input_symptoms)
    
    # Override standard risk if there is an emergency
    if is_emergency:
        risk_percent = 100
        severity_level = "Critical"

    # -------------------------
    # 4️⃣ SHAP Explainability
    # -------------------------
    prediction_label, shap_values = explain_prediction(
        input_symptoms,
        save_plot=False  # Don't save image in API mode
    )

    shap_output = [
        {"feature": feature, "impact": round(float(value), 4)} # type: ignore
        for feature, value in shap_values
        if abs(value) > 0.001 # type: ignore
    ]

    # -------------------------
    # 5️⃣ Disease Description
    # -------------------------
    description_row = description_df[
        description_df["Disease"] == top_disease
    ]

    description = (
        description_row["Description"].values[0]
        if not description_row.empty
        else "No description available"
    )

    # -------------------------
    # 6️⃣ Precautions
    # -------------------------
    precaution_row = precaution_df[
        precaution_df["Disease"] == top_disease
    ]

    precautions = (
        precaution_row.iloc[0, 1:].dropna().tolist()
        if not precaution_row.empty
        else []
    )

    # -------------------------
    # 7️⃣ Doctor Recommendation
    # -------------------------
    doctor_row = doctor_df[
        doctor_df["Disease"] == top_disease
    ]

    recommended_doctor = (
        doctor_row["Doctor"].values[0]
        if not doctor_row.empty
        else "General Physician"
    )

    # -------------------------
    # 8️⃣ Alternative Medicine
    # -------------------------
    alt_med_row = alt_med_df[
        alt_med_df["Disease"] == top_disease
    ]

    ayurveda_treatment = alt_med_row["Ayurveda"].values[0] if not alt_med_row.empty else "Seek general Ayurvedic consultation."
    siddha_treatment = alt_med_row["Siddha"].values[0] if not alt_med_row.empty else "Seek general Siddha consultation."

    # -------------------------
    # 9️⃣ Lab Tests & Cost
    # -------------------------
    lab_row = lab_test_df[
        lab_test_df["Disease"] == top_disease
    ]

    lab_tests = lab_row["LabTests"].values[0] if not lab_row.empty else "Standard Blood Test (CBC)"
    lab_cost = str(lab_row["Cost"].values[0]) if not lab_row.empty else "500"

    # -------------------------
    # Final JSON Response
    # -------------------------
    return jsonify({
        "top_3_predictions": [
            {"disease": d, "confidence": c}
            for d, c in predictions
        ],
        "final_diagnosis": top_disease,
        "confidence_percentage": top_confidence,
        "risk_percentage": risk_percent,
        "severity_level": severity_level,
        "emergency_alert": emergency_message,
        "description": description,
        "precautions": precautions,
        "recommended_doctor": recommended_doctor,
        "ayurveda": ayurveda_treatment,
        "siddha": siddha_treatment,
        "lab_tests": lab_tests,
        "lab_cost": lab_cost,
        "shap_explanation": shap_output
    })


# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    app.run(debug=False)