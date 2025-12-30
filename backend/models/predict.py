
import tensorflow as tf
import numpy as np
from PIL import Image
import os
import sys
import json

# Define IMAGE_SIZE and the path to the model
# These should match what was used during training
IMAGE_SIZE = (224, 224) # Assuming this was the image size used for training
# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, 'best_psoriasis_model (2).keras')

    def load_model():
        """Loads the trained TensorFlow model."""
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print(f"Model loaded successfully from {MODEL_PATH}")
            return model
        except Exception as e:
            print(f"Error loading model from {MODEL_PATH}: {e}")
            print("Please ensure 'best_psoriasis_model.keras' is in the same directory as predict.py")
            return None

    def preprocess_image(image_path):
        """Loads and preprocesses a single image for prediction."""
        img = Image.open(image_path).convert('RGB')
        img_array = np.array(img)

        # Resize the image to the model's expected input size
        img_array = tf.image.resize(img_array, IMAGE_SIZE)

        # Normalize pixel values to [0, 1]
        img_array = tf.cast(img_array, tf.float32) / 255.0

        # Add a batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    def predict_single_image(model, image_path):
        """Makes a prediction on a single image."""
        if not os.path.exists(image_path):
            return {"error": f"Image file not found at {image_path}"}

        processed_image = preprocess_image(image_path)
        prediction = model.predict(processed_image)[0][0]

        if prediction > 0.5:
            label = 'Psoriasis'
            confidence = prediction
        else:
            label = 'Normal'
            confidence = 1 - prediction

        return {"label": label, "confidence": float(confidence)}


    # Main execution block for the script
    if __name__ == "__main__":
        # Check if an image path was provided as command line argument
        if len(sys.argv) < 2:
            result = {"error": "No image path provided. Usage: python predict.py <image_path>"}
            print(json.dumps(result))
            sys.exit(1)
        
        image_path = sys.argv[1]
        
        model = load_model()
        if model is None:
            result = {"error": "Failed to load model"}
            print(json.dumps(result))
            sys.exit(1)

        result = predict_single_image(model, image_path)
        # Output JSON result so backend can parse it
        print(json.dumps(result))
