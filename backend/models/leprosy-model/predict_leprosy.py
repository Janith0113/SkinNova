import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
import os

# Define the image size used during training
IMAGE_SIZE = (224, 224)

def preprocess_image(image_path):
    img_raw = tf.io.read_file(image_path)
    img = tf.image.decode_image(img_raw, channels=3, expand_animations=False)
    img = tf.image.resize(img, IMAGE_SIZE)
    img = tf.cond(tf.shape(img)[-1] == 1,
                      lambda: tf.image.grayscale_to_rgb(img),
                      lambda: img)
    img = tf.cast(img, tf.float32) / 255.0  # Normalize to [0, 1]
    img = np.expand_dims(img, axis=0)  # Add batch dimension
    return img

def predict_leprosy(model_path, image_path):
    # Load the trained model
    model = load_model(model_path)
    
    # Preprocess the image
    processed_image = preprocess_image(image_path)
    
    # Make prediction
    prediction = model.predict(processed_image)[0][0]
    
    # Interpret prediction
    if prediction >= 0.5:
        return f"Leprosy Detected (Probability: {prediction:.4f})"
    else:
        return f"Normal Skin (Probability: {prediction:.4f})"

if __name__ == '__main__':
    # --- Configuration ---
    # IMPORTANT: Update this path to where your model is saved in Google Drive
    # E.g., '/content/drive/MyDrive/Research Data set/leprosy_detection_model.keras'
    MODEL_PATH = '/content/drive/MyDrive/Research Data set/leprosy_detection_model.keras'
    
    # Example image path for prediction. Replace with the actual path to your image.
    # You can pick an image from your dataset or provide a new one.
    EXAMPLE_IMAGE_PATH = '/content/drive/MyDrive/Research Data set/Validation/Normal Skin/Image_1.jpeg' # Replace with actual image path
    
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model not found at {MODEL_PATH}. Please ensure the model is saved correctly and update the path in the script.")
    elif not os.path.exists(EXAMPLE_IMAGE_PATH):
        print(f"Error: Example image not found at {EXAMPLE_IMAGE_PATH}. Please provide a valid image path.")
    else:
        result = predict_leprosy(MODEL_PATH, EXAMPLE_IMAGE_PATH)
        print(f"Prediction for {EXAMPLE_IMAGE_PATH}: {result}")
