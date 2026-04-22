def generate_questions(suggested_symptoms):
    """
    Convert symptom suggestions into yes/no questions.
    """
    questions = []

    for symptom in suggested_symptoms:
        formatted = symptom.replace("_", " ")
        question = f"Are you experiencing {formatted}? (yes/no)"
        questions.append({
            "symptom": symptom,
            "question": question
        })

    return questions


def update_symptoms_with_answers(original_symptoms, answers):
    """
    Add confirmed symptoms to original list.

    :param original_symptoms: list of symptoms user initially gave
    :param answers: dictionary {symptom: True/False}
    :return: updated symptom list
    """

    updated_symptoms = original_symptoms.copy()

    for symptom, has_symptom in answers.items():
        if has_symptom and symptom not in updated_symptoms:
            updated_symptoms.append(symptom)

    return updated_symptoms
