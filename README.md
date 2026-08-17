# 🏥 Multimodal AI-Driven Smart Healthcare Platform

[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Backend-Python%203.11+-3776AB?logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Framework-Flask-000000?logo=flask)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![SHAP](https://img.shields.io/badge/XAI-SHAP-FF6F61)](https://shap.readthedocs.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent digital healthcare ecosystem for **telemedicine**, **explainable diagnostic decision support**, and **multimodal patient interaction**. The platform combines machine learning disease prediction, SHAP (SHapley Additive exPlanations) model interpretability, dynamic diagnostic chatbot questioning, hybrid OCR/vision report analysis, and multi-system medical treatment recommendations (Allopathy, Ayurveda, and Siddha).

---

## ✨ Key Features

### 🎙️ 1. Multimodal Input Options
- **Voice Symptom Input**: Web Speech API integration allowing elderly and disabled users to speak symptoms directly.
- **Text Input**: Quick comma-separated symptom entry with real-time autocompletion.
- **Hybrid Document & Image Scanner**: Drag-and-drop support for **Medical Reports (PDF/TXT)**, **Scanned Lab Reports (OCR)**, and **Skin Photo Symptoms (Vision Analyzer)**.

### 🧠 2. Intelligent AI Predictor & Dynamic Follow-up Chatbot
- **Random Forest Classifier**: Trained on 130+ medical symptoms mapping to 40+ clinical conditions with top-3 confidence rankings.
- **Adaptive Diagnostic Chatbot**: Triggers intelligent Yes/No follow-up questions using co-occurrence frequency analysis when prediction confidence is below 80%.

### 📊 3. Explainable AI (XAI Traceback)
- **SHAP Integration**: Quantifies exact positive/negative contributions of each symptom to build patient trust and transparency.

### 🚨 4. Critical Emergency Detection System
- **Real-Time Rule Engine**: Immediately flags emergency symptom combinations (e.g. *chest pain + breathlessness* or *high fever + stiff neck*) and displays simulated SMS/email dispatch alerts.

### 🌿 5. Multi-System Medical Protocol Classification
- Comprehensive treatment strategies across **Allopathy** (standard precautions), **Ayurveda**, and **Siddha** systems of medicine.

### 🧪 6. Interactive "What-If" Simulation Sandbox
- **Monte Carlo Trajectory Charting**: 6-month projected risk recovery trajectories based on medical interventions (pharmaceuticals, diet, Ayurveda, treatment delay).
- **Cyber-Body Map**: Dynamic SVG anatomical visualization highlighting affected body zones (head, chest, abdomen).

---

## 🏗️ System Architecture

```
[ User Input ] ---> Voice (Web Speech) / Text / Image OCR / PDF
                         │
                         ▼
        [ Vite React 19 Frontend Dashboard ]
                         │
                      HTTP REST
                         │
                         ▼
             [ Flask Backend API Server ]
                         │
  ┌──────────────────────┼──────────────────────┐
  │                      │                      │
  ▼                      ▼                      ▼
[ Random Forest ML ]  [ SHAP Explainer ]  [ Hybrid Vision/OCR ]
  │                      │                      │
  └──────────────────────┼──────────────────────┘
                         │
                         ▼
  [ Output: Diagnosis, XAI Trace, Precautions, Lab Costs ]
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide React Icons, Recharts, Vanilla CSS (Glassmorphism & Neural Canvas Animation).
- **Backend**: Python 3.11+, Flask, Flask-CORS, PyPDF2, Pillow (PIL), PyTesseract.
- **Machine Learning / Data Science**: Scikit-Learn (Random Forest), Pandas, NumPy, SHAP (TreeExplainer).
- **Deployment**: Render / Gunicorn.

---

## 📂 Project Directory Structure

```
smart-healthcare-platform/
├── frontend/                   # React + Vite Web Application
│   ├── src/
│   │   ├── components/         # Dashboard, ReportUploader, WhatIfSandbox, EHR, etc.
│   │   ├── App.jsx             # Main Application Shell
│   │   └── index.css           # Modern Glassmorphic Design System
│   └── package.json
│
└── ai-model/                   # Flask Backend & ML Engine
    ├── app.py                  # API endpoints (/predict, /suggest, /upload-report)
    ├── core/                   # ML Core Pipelines
    │   ├── predictor.py        # Random Forest disease predictor
    │   ├── xai_explainer.py    # SHAP explainer module
    │   ├── image_analyzer.py   # Hybrid OCR & Skin Vision analyzer
    │   ├── emergency_detector.py # Emergency rule matcher
    │   ├── risk_calculator.py  # Severity scoring module
    │   ├── symptom_suggester.py # Co-occurrence chatbot logic
    │   └── report_parser.py    # PDF & text report parser
    ├── data/                   # Kaggle Medical Datasets & Symptom Lookups
    └── models/                 # Saved Scikit-Learn .pkl Model Files
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v18+) & npm
- Python 3.10+

### 1. Run Backend API Server
```bash
cd ai-model
pip install -r requirements.txt
python app.py
```
*Backend server runs on `http://localhost:5000`*

### 2. Run Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server runs on `http://localhost:5173`*

---

## 📡 API Endpoints Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check endpoint |
| `/predict` | `POST` | Disease prediction, risk calculation, emergency check, and SHAP feature impact |
| `/suggest` | `POST` | Generates diagnostic follow-up questions for low-confidence inputs |
| `/upload-report` | `POST` | Parses PDF documents, lab report scans (OCR), or skin symptom photos |

---

## 👨‍💻 Project Team & Credits

- **Department of Information Technology**
- **Presented By**:
  - Kesavan. R `[510422205027]`
  - Purushothaman. S `[510422205302]`
  - Janamejan. V `[510422205020]`
  - Syed Adhil B `[510422205056]`
- **Project Guide**: Mrs. K. Haripriya, AP/IT

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
