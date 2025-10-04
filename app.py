from flask import Flask, render_template, request, flash, redirect, url_for
import os
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import cv2
from mtcnn import MTCNN
from werkzeug.utils import secure_filename
import socket

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Change this to a random secret key

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load the trained model
model = load_model('cnn_model.h5')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to detect and crop the face using MTCNN
def detect_and_crop_face(img_path):
    img = cv2.imread(img_path)
    detector = MTCNN()
    results = detector.detect_faces(img)
    
    if results:
        bounding_box = results[0]['box']
        x, y, width, height = bounding_box
        face = img[y:y+height, x:x+width]
        face = cv2.resize(face, (128, 128))  # Resize to the target size
        return face
    else:
        # If no face is detected, return the original resized image
        return cv2.resize(img, (128, 128))

# Function to preprocess the cropped face
def preprocess_face(face):
    img_array = image.img_to_array(face)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0  # Normalize to [0, 1]
    return img_array

# Main function to predict if an image is real or fake
def predict_real_or_fake(img_path):
    try:
        # Detect and preprocess the face in the provided image
        face = detect_and_crop_face(img_path)
        processed_image = preprocess_face(face)

        # Predict the class of the image
        prediction = model.predict(processed_image)

        # Return the result
        result = 'Real' if prediction[0][0] < 0.5 else 'Fake'
        confidence = float(prediction[0][0])
        
        return result, confidence
    except Exception as e:
        return None, str(e)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        flash('No file selected')
        return redirect(request.url)
    
    file = request.files['image']
    
    if file.filename == '':
        flash('No file selected')
        return redirect(request.url)
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Make prediction
        result, confidence = predict_real_or_fake(filepath)
        
        # Clean up uploaded file
        os.remove(filepath)
        
        if result is None:
            flash(f'Error processing image: {confidence}')
            return redirect(url_for('index'))
        
        return render_template('index.html', 
                             result=result, 
                             confidence=confidence,
                             filename=filename)
    else:
        flash('Invalid file type. Please upload an image file.')
        return redirect(url_for('index'))

if __name__ == '__main__':
    # Determine local IP addresses so we can print URLs where the app is reachable
    def get_local_ips():
        ips = set()
        # Try getting the primary outbound IP (works without external network traffic)
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            # doesn't actually send packets
            s.connect(('8.8.8.8', 80))
            ips.add(s.getsockname()[0])
        except Exception:
            pass
        finally:
            try:
                s.close()
            except Exception:
                pass

        # Also include any non-loopback host addresses from hostname resolution
        try:
            hostname = socket.gethostname()
            for ip in socket.gethostbyname_ex(hostname)[2]:
                if not ip.startswith('127.'):
                    ips.add(ip)
        except Exception:
            pass

        if not ips:
            ips.add('127.0.0.1')

        return sorted(ips)

    ips = get_local_ips()
    print('\n* Starting Flask app. Accessible at:')
    for ip in ips:
        print(f'  - http://{ip}:8000')
    # Always show localhost as a convenience
    if '127.0.0.1' not in ips:
        print('  - http://127.0.0.1:8000')

    # Run the app on port 8000 and bind to all interfaces so it's reachable from the host
    app.run(host='0.0.0.0', port=8000, debug=True)