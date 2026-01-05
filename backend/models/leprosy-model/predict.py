
import tensorflow as tf
import numpy as np
import os

# Define the path to the saved model
model_save_path = '/content/leprosy_detection_model.h5'

# Define the image size used during training
image_size = (180, 180)

model = None # Initialize model to None

# Load the trained model
if os.path.exists(model_save_path):
    try:
        model = tf.keras.models.load_model(model_save_path)
        print(f"Model loaded successfully from {model_save_path}")
    except Exception as e:
        print(f"Error loading model from {model_save_path}: {e}")
        print("Please ensure the model was saved correctly before attempting prediction.")
else:
    print(f"Error: Model file not found at {model_save_path}.")
    print("Please ensure the model saving cell was executed successfully.")

def preprocess_single_image(image_path):
    img = tf.io.read_file(image_path)
    img = tf.image.decode_image(img, channels=3, expand_animations=False)
    img = tf.image.resize(img, image_size)
    img = tf.cast(img, tf.float32) / 255.0  # Normalize pixel values
    img = tf.expand_dims(img, axis=0)  # Add batch dimension
    return img

def predict_image(image_path):
    if model is None:
        print("Cannot predict: Model is not loaded.")
        return

    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return

    processed_img = preprocess_single_image(image_path)
    prediction = model.predict(processed_img)

    # For binary classification with sigmoid activation, output is a probability
    # If the probability is > 0.5, classify as 1 (Leprosy), else 0 (Normal)
    predicted_class = (prediction > 0.5).astype(int)[0][0]
    confidence = prediction[0][0]

    class_labels = {0: "Normal Skin", 1: "Leprosy Skin"}

#     print(f"
# --- Prediction for {image_path} ---")
#     print(f"Predicted Class: {class_labels.get(predicted_class, 'Unknown')}")
#     print(f"Confidence: {confidence:.4f}")

    if predicted_class == 1:
        print("The model predicts this image shows Leprosy Skin.")
    else:
        print("The model predicts this image shows Normal Skin.")

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Predict leprosy from an image.')
    parser.add_argument('image_path', type=str, help='Path to the image file for prediction.')
    args = parser.parse_args()

    predict_image(args.image_path)
