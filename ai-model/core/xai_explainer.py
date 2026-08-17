import shap
import joblib
import pandas as pd
import os
import matplotlib.pyplot as plt
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "../models/disease_model.pkl")
FEATURE_PATH = os.path.join(BASE_DIR, "../models/feature_names.pkl")

model = joblib.load(MODEL_PATH)
feature_names = joblib.load(FEATURE_PATH)

explainer = shap.TreeExplainer(model)


def explain_prediction(symptom_list, save_plot=True):

    symptom_list = [s.lower() for s in symptom_list]

    input_vector = [
        1 if feature.strip().replace("_", " ").lower() in symptom_list else 0
        for feature in feature_names
    ]

    input_df = pd.DataFrame([input_vector], columns=feature_names)

    shap_values = explainer.shap_values(input_df)

    prediction = model.predict(input_df)[0]
    class_index = list(model.classes_).index(prediction)

    # 🔥 UNIVERSAL MULTICLASS HANDLING

    if isinstance(shap_values, list):
        # Older SHAP
        class_shap_values = shap_values[class_index][0]

    elif isinstance(shap_values, np.ndarray):
        # ndarray format (n_samples, n_features, n_classes)
        if shap_values.ndim == 3:
            class_shap_values = shap_values[0, :, class_index]
        else:
            class_shap_values = shap_values[0]

    else:
        # Explanation object format
        class_shap_values = shap_values.values[0][:, class_index]

    shap_result = list(zip(feature_names, class_shap_values))

    shap_result_sorted = sorted(
        shap_result,
        key=lambda x: abs(x[1]),
        reverse=True
    )[:10]

    # -----------------------------
    # BAR PLOT
    # -----------------------------
    if save_plot:
        features = [x[0] for x in shap_result_sorted]
        values = [x[1] for x in shap_result_sorted]

        plt.figure(figsize=(8, 6))
        colors = ["green" if v > 0 else "red" for v in values]

        plt.barh(features[::-1], values[::-1], color=colors[::-1])
        plt.xlabel("SHAP Value (Impact on Model Output)")
        plt.title(f"SHAP Explanation for {prediction}")
        plt.tight_layout()

        plot_path = os.path.join(BASE_DIR, "../shap_explanation.png")
        plt.savefig(plot_path)
        print(f"\n📊 SHAP bar plot saved at: {plot_path}")
        plt.show()

    return prediction, shap_result_sorted