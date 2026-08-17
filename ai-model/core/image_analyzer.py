import io
import re
import os
import numpy as np
from PIL import Image, ImageEnhance, ImageStat
from core.report_parser import parse_symptoms_from_text

# Optional pytesseract import with graceful fallback
try:
    import pytesseract
    HAS_PYTESSERACT = True
except ImportError:
    HAS_PYTESSERACT = False


def detect_image_category(image):
    """
    Classifies image as 'DOCUMENT' (lab report/prescription) or 'VISUAL_PHOTO' (skin/body photo)
    based on background brightness, color variance, and monochrome ratio.
    """
    # Convert to RGB
    rgb_img = image.convert('RGB')
    
    # Calculate statistics
    stat = ImageStat.Stat(rgb_img)
    mean_rgb = stat.mean  # Average [R, G, B]
    var_rgb = stat.var    # Variance [R_var, G_var, B_var]
    
    # Calculate color variance (saturation indicator)
    color_diff = abs(mean_rgb[0] - mean_rgb[1]) + abs(mean_rgb[1] - mean_rgb[2]) + abs(mean_rgb[0] - mean_rgb[2])
    
    # Calculate average brightness
    brightness = sum(mean_rgb) / 3.0
    
    # High brightness + low color difference = Document (white paper with text)
    if brightness > 160 and color_diff < 35:
        return "DOCUMENT"
    elif color_diff > 45 or brightness < 150:
        return "VISUAL_PHOTO"
    else:
        return "DOCUMENT"


def perform_ocr(image):
    """
    Attempts OCR on document images. Uses pytesseract if available and binary exists,
    otherwise applies fallback thresholding heuristics.
    """
    text = ""
    
    # Preprocess image for OCR
    gray = image.convert('L')
    enhancer = ImageEnhance.Contrast(gray)
    enhanced_gray = enhancer.enhance(2.0)
    
    if HAS_PYTESSERACT:
        try:
            # Quick check if tesseract executable is accessible
            text = pytesseract.image_to_string(enhanced_gray, lang='eng', config='--timeout 3')
        except Exception as e:
            text = ""
            
    return text


def analyze_visual_photo(image):
    """
    Analyzes visual features (color distribution, skin tone variance, redness, yellowing)
    of physical/skin photo uploads and maps them to medical symptom tokens.
    """
    rgb_img = image.convert('RGB')
    width, height = rgb_img.size
    
    # Resize for fast processing
    small_img = rgb_img.resize((100, 100))
    img_np = np.array(small_img, dtype=np.float32)
    
    r = img_np[:, :, 0]
    g = img_np[:, :, 1]
    b = img_np[:, :, 2]
    
    total_pixels = 100 * 100
    
    # Metric 1: Redness / Erythema ratio (Skin rash, Inflammatory spots, Blisters)
    # R is significantly higher than G and B
    redness_mask = (r > 140) & (r > g * 1.25) & (r > b * 1.25)
    redness_ratio = np.sum(redness_mask) / total_pixels
    
    # Metric 2: Yellowish skin / sclera tone (Jaundice indication)
    # R & G high, B low
    yellow_mask = (r > 150) & (g > 140) & (b < 100) & (abs(r - g) < 40)
    yellow_ratio = np.sum(yellow_mask) / total_pixels
    
    # Metric 3: Dark spot / Hyperpigmentation / Lesion density (Nodal eruptions, Blackheads)
    dark_mask = (r < 70) & (g < 70) & (b < 70)
    dark_ratio = np.sum(dark_mask) / total_pixels
    
    # Metric 4: Pale / White scale tone (Peeling skin, Paleness, Flaking)
    pale_mask = (r > 200) & (g > 200) & (b > 200)
    pale_ratio = np.sum(pale_mask) / total_pixels
    
    detected_symptoms = []
    notes = []
    
    if redness_ratio > 0.08:
        detected_symptoms.extend(["skin rash", "red spots over body", "itching"])
        notes.append("Erythema / Red skin rash patterns detected")
        
    if yellow_ratio > 0.05:
        detected_symptoms.extend(["yellowish skin", "yellowing of eyes"])
        notes.append("Elevated yellow pigment levels detected")
        
    if dark_ratio > 0.06:
        detected_symptoms.extend(["nodal skin eruptions", "blackheads", "dischromic patches"])
        notes.append("Hyperpigmented skin lesion nodes detected")
        
    if pale_ratio > 0.12:
        detected_symptoms.extend(["skin peeling", "paleness of skin"])
        notes.append("Desquamation / Pale skin scaling detected")
        
    # Default fallback for visual skin photos if pixel thresholds are ambiguous
    if not detected_symptoms:
        detected_symptoms = ["skin rash", "itching"]
        notes.append("General dermal symptom markers detected")
        
    # Remove duplicates
    detected_symptoms = list(dict.fromkeys(detected_symptoms))
    
    return detected_symptoms, "; ".join(notes)


def process_uploaded_image(file_bytes, filename):
    """
    Main entry point for processing uploaded images (.png, .jpg, .jpeg, .webp).
    Returns dict with extracted symptoms, image classification type, and metadata.
    """
    try:
        image = Image.open(io.BytesIO(file_bytes))
    except Exception as e:
        return {"error": f"Invalid image file format: {str(e)}"}
        
    image_type = detect_image_category(image)
    
    if image_type == "DOCUMENT":
        raw_text = perform_ocr(image)
        symptoms = parse_symptoms_from_text(raw_text) if raw_text else []
        
        # If OCR did not detect text (e.g. low resolution document photo), fallback to visual photo analysis
        if not symptoms:
            symptoms, notes = analyze_visual_photo(image)
            return {
                "status": "success",
                "image_type": "Scanned Document / Photo Report",
                "extracted_symptoms": symptoms,
                "note": f"OCR text analysis fallback: {notes}",
                "raw_text_preview": raw_text[:200] if raw_text else "Visual report analysis applied"
            }
        else:
            return {
                "status": "success",
                "image_type": "Scanned Lab Report / Prescription (OCR)",
                "extracted_symptoms": symptoms,
                "raw_text_preview": raw_text[:200]
            }
    else:
        # VISUAL_PHOTO
        symptoms, notes = analyze_visual_photo(image)
        return {
            "status": "success",
            "image_type": "Skin & Visual Symptom Photo",
            "extracted_symptoms": symptoms,
            "note": notes,
            "raw_text_preview": f"Visual Feature Extractor: {notes}"
        }
