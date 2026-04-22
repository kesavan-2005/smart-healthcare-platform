def check_emergency(symptoms):
    """
    Detect critical symptom combinations.
    """

    symptoms = [s.lower() for s in symptoms]

    emergency_rules = [
        {"chest pain", "breathlessness"},
        {"high fever", "stiff neck"},
        {"vomiting", "severe headache"},
        {"abdominal pain", "vomiting", "high fever"}
    ]

    for rule in emergency_rules:
        if rule.issubset(set(symptoms)):
            return True, "⚠ Immediate medical attention recommended!"

    return False, "No immediate emergency detected."
