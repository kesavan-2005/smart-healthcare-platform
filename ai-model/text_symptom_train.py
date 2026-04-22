import pandas as pd
import os
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Paths
BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "data/dataset.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models/disease_model.pkl")
FEATURE_PATH = os.path.join(BASE_DIR, "models/feature_names.pkl")

# Load dataset
df = pd.read_csv(DATA_PATH)

# Extract symptom columns
symptom_columns = [col for col in df.columns if "Symptom" in col]

# Build unique symptom list
unique_symptoms = set()

for col in symptom_columns:
    unique_symptoms.update(df[col].dropna().str.lower().unique())

unique_symptoms = sorted(list(unique_symptoms))

# Create one-hot encoded feature matrix
X = []

for _, row in df.iterrows():
    row_symptoms = [
        str(row[col]).lower()
        for col in symptom_columns
        if pd.notna(row[col])
    ]

    vector = []
    for symptom in unique_symptoms:
        if symptom in row_symptoms:
            vector.append(1)
        else:
            vector.append(0)

    X.append(vector)

X = pd.DataFrame(X, columns=unique_symptoms)

# Target
y = df["Disease"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(
    n_estimators=300,
    random_state=42
)

model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("Model Training Completed")
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# Save model
joblib.dump(model, MODEL_PATH)

# Save feature order
joblib.dump(unique_symptoms, FEATURE_PATH)

print("Model and Feature List Saved Successfully")