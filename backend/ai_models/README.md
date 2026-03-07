# Skin Cancer CNN Training & Inference

Complete toolkit for training and deploying a CNN model for skin cancer detection with multimodal risk analysis.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | **START HERE** - 5-minute setup and training |
| [TRAINING_GUIDE.md](TRAINING_GUIDE.md) | Detailed training guide with all options |
| [README.md](README.md) | This file - overview and file descriptions |

## 🚀 Quick Start (2 minutes)

```bash
# 1. Install (one-time)
pip install -r requirements.txt

# 2. Prepare your data in folder structure:
# data/
# ├── melanoma/
# │   ├── img1.jpg
# │   └── ...
# └── benign/
#     ├── img1.jpg
#     └── ...

# 3. Train
python train_skin_cancer_cnn.py --data_dir ./data

# 4. Predict
python inference_skin_cancer_cnn.py \
    --model ./models/skin_cancer_cnn_best.h5 \
    --encoder ./models/label_encoder.pkl \
    --image ./test.jpg
```

Done! Your model is in `./models/`

## 📦 Files & Scripts

### Training Scripts

#### `train_skin_cancer_cnn.py` - Main Training Script
**Purpose:** Train CNN model from scratch using your data

**Class:** `SkinCancerCNNTrainer`
- `build_model()` - Create MobileNetV2-based architecture
- `load_and_prepare_data()` - Load images and split train/val/test
- `train()` - Fit model with early stopping
- `evaluate()` - Compute metrics (accuracy, precision, recall, F1, AUC)
- `plot_training_history()` - Visualize learning curves
- `plot_confusion_matrix()` - Show prediction breakdown
- `save_model_for_web()` - Convert to TensorFlow.js format

**Usage:**
```bash
# Basic
python train_skin_cancer_cnn.py --data_dir ./data

# Advanced
python train_skin_cancer_cnn.py \
    --data_dir ./data \
    --labels_file ./data/labels.csv \
    --img_size 224 \
    --batch_size 32 \
    --epochs 100 \
    --learning_rate 0.001 \
    --output_dir ./checkpoints
```

**Outputs:**
- `skin_cancer_cnn_best.h5` - Best model weights
- `training_history.png` - Loss/accuracy curves
- `confusion_matrix.png` - Performance breakdown
- `metrics.json` - Evaluation metrics
- `label_encoder.pkl` - Class labels (required for inference)

**Model Architecture:**
```
Input (224×224×3)
  ↓
MobileNetV2 (Pre-trained ImageNet)
  ↓
GlobalAveragePooling2D
  ↓
Dense(512) + ReLU + BatchNorm + Dropout(0.4)
  ↓
Dense(256) + ReLU + BatchNorm + Dropout(0.3)
  ↓
Dense(128) + ReLU + BatchNorm + Dropout(0.2)
  ↓
Dense(Classes) + Softmax
  ↓
Output [P(Class1), P(Class2), ...]
```

**Key Features:**
- Transfer learning (pre-trained MobileNetV2)
- Data augmentation (rotation, zoom, shift, flip)
- Early stopping (prevent overfitting)
- Class balancing (stratified split)
- Callbacks: EarlyStopping, ModelCheckpoint, ReduceLROnPlateau

---

### Inference Scripts

#### `inference_skin_cancer_cnn.py` - Prediction & Inference
**Purpose:** Make predictions on new images using trained model

**Class:** `SkinCancerCNNInference`
- `preprocess_image()` - Load and prepare single image
- `predict()` - Classify one image
- `batch_predict()` - Classify folder of images
- `print_prediction_summary()` - Show statistics

**Usage:**
```bash
# Single image
python inference_skin_cancer_cnn.py \
    --model ./models/skin_cancer_cnn_best.h5 \
    --encoder ./models/label_encoder.pkl \
    --image ./test.jpg

# Batch prediction
python inference_skin_cancer_cnn.py \
    --model ./models/skin_cancer_cnn_best.h5 \
    --encoder ./models/label_encoder.pkl \
    --folder ./test_images \
    --output results.json
```

**Outputs:**
- Console output with predictions and confidence scores
- JSON file with detailed results (if `--output` specified)
- Summary statistics (class distribution, average confidence)

---

### Data Preparation

#### `prepare_data.py` - Data Organization Utility
**Purpose:** Validate and organize training data

**Commands:**

1. **Validate images:**
   ```bash
   python prepare_data.py validate ./data
   ```
   Checks for:
   - Valid image extensions (.jpg, .png, etc.)
   - Corrupted files
   - Class balance
   - Returns validation report

2. **Create CSV from folder:**
   ```bash
   python prepare_data.py csv ./data --output labels.csv
   ```
   Creates CSV file from folder structure for flexible labeling

3. **Reorganize flat folder:**
   ```bash
   python prepare_data.py reorganize ./all_images \
       --labels labels.csv --output organized_data
   ```
   Reorganizes flat image folder using CSV labels

---

### Legacy Scripts

#### `train_psoriasis_cnn.py`
Similar training pipeline for psoriasis detection. Not required for skin cancer model.

#### `gradcam_inference.py`
GradCAM visualization for model explainability. Can be used to visualize which image regions the model focuses on.

---

## 📊 Expected Performance

With minimum 500-1000 images per class:

| Metric | Expected |
|--------|----------|
| Accuracy | 85-95% |
| Precision | 85-95% |
| Recall | 85-95% |
| F1 Score | 85-95% |
| AUC-ROC | 0.90-0.98 |

Performance depends on:
- ✅ Data quality (clear, well-focused images)
- ✅ Data quantity (more data = better generalization)
- ✅ Class balance (equal samples per class)
- ✅ Training epochs (100+ for convergence)
- ✅ Data augmentation (improves robustness)

---

## 🔧 Installation

### Requirements
- Python 3.8+
- TensorFlow 2.10+
- 4GB+ RAM (8GB+ recommended)
- GPU optional but recommended for faster training

### Setup

```bash
# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import tensorflow; print(f'TensorFlow {tensorflow.__version__}')"
```

### GPU Support (Optional)
```bash
# For NVIDIA GPU with CUDA support:
pip install tensorflow[and-cuda]

# Verify GPU
python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"
```

---

## 📖 Detailed Guides

### Data Organization

**Option 1: Folder Structure (Recommended)**
```
data/
├── melanoma/
│   ├── patient_001.jpg
│   ├── patient_002.jpg
│   └── ...
└── benign/
    ├── patient_001.jpg
    ├── patient_002.jpg
    └── ...
```

**Option 2: CSV with Labels**
```csv
filename,label
data/patient_001.jpg,melanoma
data/patient_002.jpg,benign
...
```

Use `prepare_data.py` to convert between formats.

### Training Tips

1. **Start small:** Test with 200 images per class first
2. **Monitor training:** Watch `training_history.png` for overfitting
3. **Adjust learning rate:** Try 0.0001 → 0.001 → 0.01
4. **Increase epochs:** Start with 50, go to 100-150 for better accuracy
5. **Reduce overfitting:** Use higher dropout, more augmentation

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `OutOfMemoryError` | Reduce `--batch_size` (32→16→8) or `--img_size` |
| Low accuracy | Add more data, increase epochs, check labels |
| Training too slow | Use GPU, reduce img_size, use smaller batch |
| Model not loading | Check file path, ensure .h5 and .pkl files exist |
| Image errors | Verify all images are valid JPG/PNG, run `validate` |
| Unbalanced classes | Use `prepare_data.py validate` to check, collect more data |

---

## 🔗 Integration Points

### With Frontend (Next.js)

**Option A: Backend API (Recommended)**
```python
from inference_skin_cancer_cnn import SkinCancerCNNInference

# Load once at startup
inference = SkinCancerCNNInference(
    'models/skin_cancer_cnn_best.h5',
    'models/label_encoder.pkl'
)

@app.post('/api/predict')
def predict(image_file):
    result = inference.predict(image_file)
    return {
        'class': result['predicted_class'],
        'confidence': result['confidence'],
        'all_predictions': result['all_predictions']
    }
```

**Option B: Browser (TensorFlow.js)**
```bash
# Convert model
tensorflowjs_converter \
    --input_format keras \
    models/skin_cancer_cnn_best.h5 \
    frontend/public/models/trained-model/
```

### Risk Assessment Integration

Use model predictions with `/frontend/utils/skinRiskLogic.ts`:
```typescript
// Get image prediction
const { probability } = await modelPrediction()

// Fuse with clinical metadata
const risk = calculateSkinCancerRisk(
    probability,  // Image classification result
    metadata      // Clinical patient data
)
```

---

## 📈 Monitoring & Validation

After training, check:

1. **Metrics File**
   ```bash
   cat models/metrics.json
   ```
   Look for: Accuracy >85%, Precision/Recall >85%

2. **Training Curves**
   ```
   View models/training_history.png
   - Loss should decrease over time
   - Validation loss should track training loss (no overfitting)
   ```

3. **Confusion Matrix**
   ```
   View models/confusion_matrix.png
   - High values on diagonal (correct predictions)
   - Low values on off-diagonal (few mistakes)
   ```

4. **Test Predictions**
   ```bash
   python inference_skin_cancer_cnn.py \
       --model models/skin_cancer_cnn_best.h5 \
       --encoder models/label_encoder.pkl \
       --folder test_images \
       --output test_results.json
   ```
   Manually review predictions for accuracy

---

## 📚 File Structure

```
ai_models/
├── train_skin_cancer_cnn.py          # Main training script
├── inference_skin_cancer_cnn.py      # Prediction script
├── prepare_data.py                   # Data organization utility
├── train_psoriasis_cnn.py            # Psoriasis model (legacy)
├── gradcam_inference.py              # Explainability (legacy)
├── requirements.txt                  # Python dependencies
├── QUICK_START.md                    # Quick start guide
├── TRAINING_GUIDE.md                 # Detailed guide
└── models/                           # Default output folder
    ├── skin_cancer_cnn_best.h5       # Best trained model
    ├── label_encoder.pkl             # Class labels
    ├── metrics.json                  # Performance metrics
    ├── training_history.png          # Training curves
    └── confusion_matrix.png          # Prediction breakdown
```

---

## 🎯 Next Steps

1. **Prepare Your Data**
   ```bash
   python prepare_data.py validate ./your_data
   ```

2. **Train Your Model**
   ```bash
   python train_skin_cancer_cnn.py --data_dir ./your_data
   ```

3. **Test Predictions**
   ```bash
   python inference_skin_cancer_cnn.py \
       --model models/skin_cancer_cnn_best.h5 \
       --encoder models/label_encoder.pkl \
       --folder test_images
   ```

4. **Integrate with Frontend**
   - Use backend API endpoint, or
   - Convert to TensorFlow.js and embed in browser

---

## 🤝 Support

- **Training issues:** Check `TRAINING_GUIDE.md`
- **Quick answers:** See `QUICK_START.md`
- **Common problems:** See troubleshooting section above
- **Code examples:** See docstrings in Python files

---

## 📝 License & Attribution

This toolkit integrates:
- **TensorFlow/Keras** for deep learning
- **MobileNetV2** pre-trained architecture
- **scikit-learn** for metrics and splitting
- **OpenCV** for image processing
- **matplotlib** for visualization

Ensure proper attribution when using these libraries in publications or products.

---

**Happy training! 🧠🚀**
