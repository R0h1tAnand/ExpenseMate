# from PIL import Image
# import pytesseract
# import torch

# # 1️⃣ OCR: Extract text from the image
# image_path = "C:\\Users\\rajya\\OneDrive\\Desktop\\test-ocr-1.jpg"
# extracted_text = pytesseract.image_to_string(Image.open(image_path))
# print("Extracted Text:\n", extracted_text)

# import ollama

# def format_with_ollama(summary_text):

#     prompt = f"""
# Extract structured expense information from the following text. 
# Return output in JSON format with these fields:
# - name_of_restaurant
# - date
# - amount
# - description
# - expense_type
# - expense_lines

# Text:
# \"\"\"{extracted_text}\"\"\"
# """

    
#     response = ollama.chat(
#         model="llama3",
#         messages=[{"role": "user", "content": prompt}],
#     )
#     return response['message']['content']

# print(format_with_ollama(extracted_text))


from flask import Flask, render_template, request
from PIL import Image
import pytesseract
import os
import ollama

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Function to call LLaMA (Ollama) - OPTIMIZED for speed
def format_with_ollama(extracted_text):
    import time
    import json
    
    # Truncate text to reduce processing time
    text_snippet = extracted_text[:400] if len(extracted_text) > 400 else extracted_text
    
    # Concise prompt for faster processing
    prompt = f"""Extract expense JSON only:
{{
  "name_of_restaurant": "",
  "date": "",
  "amount": "",
  "description": "",
  "expense_type": "",
  "expense_lines": []
}}

Text: {text_snippet}"""

    try:
        start_time = time.time()
        
        response = ollama.chat(
            model="llama3.2:1b",  # Much faster 1B model
            messages=[{"role": "user", "content": prompt}],
            options={
                "temperature": 0.1,      # Faster, more deterministic
                "top_p": 0.3,           # Reduced sampling
                "num_predict": 150,     # Shorter responses
                "num_ctx": 512,         # Smaller context window
                "repeat_penalty": 1.1,
                "seed": 42
            }
        )
        
        processing_time = time.time() - start_time
        result = response['message']['content']
        
        # Add timing info to result
        return f"⚡ Processed in {processing_time:.2f}s\n\n{result}"
        
    except Exception as e:
        # Fast fallback without Ollama
        return json.dumps({
            "name_of_restaurant": "Error - check Ollama",
            "date": "N/A",
            "amount": "N/A",
            "description": extracted_text[:100],
            "expense_type": "receipt",
            "expense_lines": [extracted_text],
            "error": str(e)
        }, indent=2)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "GET":
        return render_template("index.html")
    
    elif request.method == "POST":
        # Process the upload
        import time
        total_start = time.time()
        
        if "file" not in request.files:
            return '<div class="result" style="background:#ffe6e6;"><h3>❌ Error</h3><p>No file uploaded!</p></div>'

        file = request.files["file"]
        if file.filename == "":
            return '<div class="result" style="background:#ffe6e6;"><h3>❌ Error</h3><p>No file selected!</p></div>'

        image_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(image_path)

        # ✅ 1: Extract text using Tesseract OCR (optimized)
        ocr_start = time.time()
        
        # Open and potentially resize image for faster OCR
        img = Image.open(image_path)
        
        # Resize large images to speed up OCR
        if img.width > 2000 or img.height > 2000:
            img.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
        
        # Optimized Tesseract config for speed
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$.,:/- '
        extracted_text = pytesseract.image_to_string(img, config=custom_config)
        
        ocr_time = time.time() - ocr_start

        # ✅ 2: Send to LLaMA (Ollama) - already optimized
        structured_output = format_with_ollama(extracted_text)
        
        total_time = time.time() - total_start
        
        # Return just the results HTML (will be inserted into the page)
        return f'''
        <div class="result">
            <div class="ai-output">
                <h3>Extracted Information</h3>
                <pre>{structured_output}</pre>
            </div>
        </div>
        '''


if __name__ == "__main__":
    app.run(debug=True)
