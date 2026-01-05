from flask import Flask, render_template, request, jsonify
import numpy as np
from PIL import Image
import io
import base64
import os
from werkzeug.utils import secure_filename
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Create uploads folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load the model with minimal memory footprint
model = None
input_shape = (224, 224)

try:
    # Set environment variables BEFORE importing TensorFlow
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    os.environ['TF_FORCE_GPU_ALLOW_GROWTH'] = 'true'
    
    import tensorflow as tf
    # Limit memory growth
    gpus = tf.config.list_physical_devices('GPU')
    for gpu in gpus:
        try:
            tf.config.experimental.set_memory_growth(gpu, True)
        except RuntimeError:
            pass
    
    from tensorflow import keras
    model = keras.models.load_model('tinea_identification_model (2).keras')
    print("✓ Model loaded successfully with TensorFlow/Keras")
except Exception as e:
    print(f"✗ Model loading error: {e}")
    print("  App will start but predictions won't work until paging file is increased.")
    model = None

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image, target_size):
    """Preprocess image for model prediction"""
    image = image.convert('RGB')
    image = image.resize(target_size, Image.Resampling.LANCZOS)
    img_array = np.array(image).astype(np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if not model:
            return jsonify({
                'error': 'Model not loaded. This is typically due to insufficient virtual memory (paging file). '
                        'To fix this, increase your Windows paging file size.'
            }), 503
            
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: ' + ', '.join(ALLOWED_EXTENSIONS)}), 400
        
        # Read and process image
        image = Image.open(io.BytesIO(file.read()))
        
        # Preprocess image
        processed_image = preprocess_image(image, input_shape)
        
        # Make prediction
        prediction = model.predict(processed_image, verbose=0)
        
        # Get the result
        confidence = float(np.max(prediction[0]))
        predicted_class = int(np.argmax(prediction[0]))
        
        # Convert image to base64 for display
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='PNG')
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'predicted_class': predicted_class,
            'confidence': round(confidence * 100, 2),
            'prediction_scores': prediction[0].tolist(),
            'image': f'data:image/png;base64,{img_str}'
        })
    
    except Exception as e:
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    return jsonify({
        'input_shape': input_shape,
        'output_units': 2,
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    print("=" * 60)
    print("🔬 TINEA IDENTIFICATION SYSTEM")
    print("=" * 60)
    if model:
        print("✓ Model loaded successfully!")
    else:
        print("✗ MODEL NOT LOADED - See error message above")
        print("\nTROUBLESHOOTING:")
        print("The error 'paging file is too small' means your system needs")
        print("more virtual memory. To fix this:")
        print("\n1. Press Windows key + I (Settings)")
        print("2. Search for 'Virtual memory' or 'performance'")
        print("3. Click 'Adjust the appearance and performance...'")
        print("4. Go to 'Advanced' tab → 'Change...' (under Virtual memory)")
        print("5. Increase Initial size and Max size (e.g., 8000-16000 MB)")
        print("6. Restart your computer")
        print("\nThen run the app again.")
    print("\n📍 Access the app at: http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
