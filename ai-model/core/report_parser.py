import re
import os
import pandas as pd
import PyPDF2
from io import BytesIO

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/dataset.csv")

try:
    df = pd.read_csv(DATA_PATH)
    # Extract all possible symptoms from dataset headers and values
    all_symptoms = set()
    
    # Check headers (usually they are symptom names if it's a sparse matrix)
    # Or if it's rows of symptoms, check the values.
    # In this dataset structure, symptoms are often values in the cells.
    symptom_columns = [col for col in df.columns if 'symptom' in col.lower() or df[col].dtype == 'object']
    
    for col in symptom_columns:
        for val in df[col].dropna().unique():
            if isinstance(val, str):
                cleaned = val.strip().lower().replace('_', ' ')
                if cleaned:
                    all_symptoms.add(cleaned)
                    
    # Also manual common dataset symptoms just in case
    # This acts as an NLP synonym dictionary
    all_symptoms.update([
        "chest pain", "fever", "chills", "fatigue", "cough", "nausea",
        "vomiting", "headache", "dizziness", "shortness of breath",
        "abdominal pain", "diarrhea", "muscle ache", "joint pain", "rash"
    ])
    
    KNOWLEDGE_BASE = list(all_symptoms)
    # Sort by length descending to match longest phrases first (e.g., "shortness of breath" before "breath")
    KNOWLEDGE_BASE.sort(key=len, reverse=True)

except Exception as e:
    KNOWLEDGE_BASE = []

def extract_text_from_pdf(file_stream):
    """ Extracts text from a PDF file stream using PyPDF2 """
    text = ""
    try:
        reader = PyPDF2.PdfReader(file_stream)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + " "
    except Exception as e:
        print(f"PDF Parsing Error: {e}")
    return text

def parse_symptoms_from_text(raw_text):
    """ Simple NLP heuristic to extract symptoms based on dataset intersection """
    detected = []
    text = raw_text.lower()
    
    # Basic token scrubbing
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    
    # Greedy substring match based on knowledge base
    for symptom in KNOWLEDGE_BASE:
        # Check if symptom is in text as a whole word/phrase
        pattern = r'\b' + re.escape(symptom) + r'\b'
        if re.search(pattern, text):
            detected.append(symptom)
            # Remove the detected phrase from text so we don't double match subsets 
            # (e.g. if "chest pain" matched, don't match "pain" later)
            text = re.sub(pattern, ' ', text)
            
    return list(set(detected))

def process_medical_report(file_stream, filename):
    """ Master pipeline for processing upload """
    if filename.lower().endswith('.pdf'):
        raw_text = extract_text_from_pdf(file_stream)
    else:
        # Fallback for plain text
        raw_text = file_stream.read().decode('utf-8', errors='ignore')
        
    symptoms = parse_symptoms_from_text(raw_text)
    return {
        "status": "success",
        "raw_text_Preview": raw_text[:200] + "..." if len(raw_text) > 200 else raw_text,
        "extracted_symptoms": symptoms
    }
