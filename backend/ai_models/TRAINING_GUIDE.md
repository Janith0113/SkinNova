# Skin Cancer CNN Model Training Guide

## Overview
Complete CNN training pipeline for skin cancer detection using:
- **MobileNetV2** backbone (efficient, fast)
- **Transfer Learning** (pre-trained ImageNet weights)
- **Data Augmentation** (rotation, zoom, shift, flip)
- **Early Stopping** (prevent overfitting)
- **Class balancing** (stratified split)

## Requirements

### 1. Install Dependencies
```bash
pip install tensorflow scikit-learn numpy pandas matplotlib pillow opencv-python
```

### 2. Optional: TensorFlow.js Conversion
```bash
pip install tensorflowjs
```

## Data Preparation

### Option A: Organize by Subfolder
```
skin_cancer_data/
├── melanoma/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── benign/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
└── ...
```

### Option B: Use CSV with Labels
Create `labels.csv`:
```csv
filename,label
images/patient_001.jpg,melanoma
images/patient_002.jpg,benign
images/patient_003.jpg,melanoma
...
```

## Basic Training

### Command Line Training
```bash
# Default parameters (subfolder structure)
python train_skin_cancer_cnn.py --data_dir ./skin_cancer_data

# With CSV labels
python train_skin_cancer_cnn.py \
    --data_dir ./skin_cancer_data \
    --labels_file ./skin_cancer_data/labels.csv

# Custom parameters
python train_skin_cancer_cnn.py \
    --data_dir ./skin_cancer_data \
    --img_size 256 \
    --batch_size 16 \
    --epochs 150 \
    --learning_rate 0.0005 \
    --output_dir ./checkpoints
```

### Python Script Training
```python
from train_skin_cancer_cnn import SkinCancerCNNTrainer

# Initialize
trainer = SkinCancerCNNTrainer(
    img_size=224, 
    batch_size=32,
    epochs=100
)

# Build model
trainer.build_model(num_classes=2, learning_rate=0.001)

# Load data
X_train, X_val, X_test, y_train, y_val, y_test = trainer.load_and_prepare_data(
    'skin_cancer_data',
    labels_file='skin_cancer_data/labels.csv'
)

# Train
trainer.train(X_train, X_val, y_train, y_val, 
              model_save_path='models/best_model.h5')

# Evaluate
metrics, y_pred, y_pred_proba, cm = trainer.evaluate(X_test, y_test)

# Plot Results
trainer.plot_training_history('models/history.png')
trainer.plot_confusion_matrix(cm, 'models/cm.png')
```

## Output Files

After training, you'll get:

```
./models/
├── skin_cancer_cnn_best.h5       # Best trained model
├── training_history.png          # Training/validation curves
├── confusion_matrix.png          # Confusion matrix heatmap
├── metrics.json                  # Accuracy, precision, recall, F1
└── label_encoder.pkl             # Class labels encoder
```

## Expected Performance

**With good data (~1000+ images per class):**
- Accuracy: 85-95%
- Precision: 85-95%
- Recall: 85-95%
- F1 Score: 85-95%

**Factors affecting accuracy:**
- ✅ Data quality (clear, well-labeled images)
- ✅ Image resolution (224x224 minimum)
- ✅ Balanced classes (equal samples per class)
- ✅ Data augmentation
- ✅ Sufficient epochs (50-100)

## Tips for Better Accuracy

1. **More Data**: Collect 1000+ images per class (minimum)
2. **Data Quality**: Remove blurry, corrupted, or mislabeled images
3. **Balance Classes**: Ensure equal representation for each class
4. **Augmentation**: The script includes rotation, zoom, flip, shift
5. **Fine-tuning**: Unfreeze base model layers after initial training
6. **Different Architectures**: Try EfficientNet or ResNet50 for better accuracy

## Model Architecture

```
Input (224x224x3)
    ↓
MobileNetV2 (Pre-trained)
    ↓
GlobalAveragePooling2D
    ↓
Dense 512 + ReLU + BatchNorm + Dropout(0.4)
    ↓
Dense 256 + ReLU + BatchNorm + Dropout(0.3)
    ↓
Dense 128 + ReLU + BatchNorm + Dropout(0.2)
    ↓
Dense 2 (Classes) + Softmax
    ↓
Output [P(Melanoma), P(Benign)]
```

## Using Trained Model for Inference

See `inference_skin_cancer_cnn.py` for usage.

## Integration with Frontend

To use the trained model in the frontend:

1. **Option A: Keep as .h5**
   - Save as model weights
   - Update backend API to serve predictions

2. **Option B: Convert to TensorFlow.js**
   ```bash
   tensorflowjs_converter --input_format keras \
       models/skin_cancer_cnn_best.h5 \
       models/tfjs_model/
   ```
   - Use directly in browser with `tf.js`

## Troubleshooting

### Model too slow
- Use smaller img_size (128 instead of 224)
- Use smaller batch_size (16 instead of 32)
- Use lighter architecture (MobileNet instead of ResNet)

### Low accuracy
- Check data quality and balance
- Increase epochs (100→150)
- Increase training data
- Try different learning rates (0.0005 → 0.001)

### Out of memory
- Reduce batch_size (32 → 16 → 8)
- Reduce img_size (224 → 128)
- Use model.to_float16() for mixed precision

### Overfitting
- Increase Dropout rates
- Add more data augmentation
- Increase regularization
- Use EarlyStopping (already included)

## Next Steps

1. Train model: `python train_skin_cancer_cnn.py --data_dir ./your_data`
2. Check metrics in `./models/metrics.json`
3. Use `inference_skin_cancer_cnn.py` for predictions
4. Integrate with risk analysis backend

---

For questions, check the docstrings in `train_skin_cancer_cnn.py`
