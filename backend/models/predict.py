
    import tensorflow as tf
    import numpy as np
    from PIL import Image
    import os

    # Define IMAGE_SIZE and the path to the model
    # These should match what was used during training
    IMAGE_SIZE = (224, 224) # Assuming this was the image size used for training
    MODEL_PATH = 'best_psoriasis_model.keras'

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
        model = load_model()
        if model is None:
            exit()

        print("
--- Test Prediction ---")
        # Example usage (you can modify this to take command line arguments)
        test_image_path = input("Enter the path to an image file for prediction (e.g., 'sample_image.jpg'): ")

        if test_image_path:
            result = predict_single_image(model, test_image_path)
            if "error" in result:
                print(result["error"])
            else:
                print(f"Prediction: {result['label']} (Confidence: {result['confidence']:.4f})")
        else:
            print("No image path provided. Exiting.")
