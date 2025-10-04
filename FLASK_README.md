# Flask DeepFake Detector

A simple Flask web application for detecting deepfake images using a trained CNN model.

## Files Created/Modified:

1. **index.html** - Simple HTML form (original static version)
2. **app.py** - Flask application with deepfake detection
3. **templates/index.html** - Flask template with Jinja2 templating
4. **requirements.txt** - Updated with Flask dependencies

## How to Run:

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the Flask application:
   ```
   python app.py
   ```

3. Open your browser and go to:
   ```
   http://localhost:5000
   ```

## Features:

- Simple HTML interface with no CSS or animations
- File upload functionality
- Deepfake detection using the existing CNN model
- Real-time results display
- Error handling and validation
- Automatic file cleanup after processing

## Usage:

1. Select an image file using the file input
2. Click "Analyze Image" to upload and process
3. View the results showing whether the image is Real or Fake
4. See confidence scores and technical details

## Technical Details:

- Uses MTCNN for face detection
- Processes images at 128x128 resolution
- Supports PNG, JPG, JPEG, GIF, and BMP formats
- Temporary file storage with automatic cleanup
- Flask development server with debug mode enabled