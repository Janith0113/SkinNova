# CNN Model Training - Quick Start

## 1️⃣ Install Dependencies (One-time)

```bash
cd backend
pip install tensorflow scikit-learn numpy pandas matplotlib pillow opencv-python
```

## 2️⃣ Organize Your Data

### Option A: Folder Structure (Recommended)
```
your_data_folder/
├── melanoma/
│   ├── sample1.jpg
│   ├── sample2.jpg
│   └── ...
├── benign/
│   ├── sample1.jpg
│   ├── sample2.jpg
│   └── ...
```

### Option B: CSV File
Create `labels.csv`:
```csv
filename,label
images/pic1.jpg,melanoma
images/pic2.jpg,benign
...
```

## 3️⃣ Train Model

```bash
# Basic (uses folder structure)
python ai_models/train_skin_cancer_cnn.py --data_dir ./your_data_folder

# Advanced (uses CSV + custom parameters)
python ai_models/train_skin_cancer_cnn.py \
    --data_dir ./your_data_folder \
    --labels_file ./your_data_folder/labels.csv \
    --img_size 224 \
    --batch_size 32 \
    --epochs 100 \
    --output_dir ./models
```

**Training will output:**
- `skin_cancer_cnn_best.h5` - Best model weights
- `training_history.png` - Loss/accuracy curves
- `confusion_matrix.png` - Performance breakdown
- `metrics.json` - Accuracy, precision, recall, F1 scores
- `label_encoder.pkl` - Class labels (needed for inference)

## 4️⃣ Test with Single Image

```bash
python ai_models/inference_skin_cancer_cnn.py \
    --model ./models/skin_cancer_cnn_best.h5 \
    --encoder ./models/label_encoder.pkl \
    --image ./test_image.jpg
```

## 5️⃣ Batch Predictions

```bash
python ai_models/inference_skin_cancer_cnn.py \
    --model ./models/skin_cancer_cnn_best.h5 \
    --encoder ./models/label_encoder.pkl \
    --folder ./test_images \
    --output results.json
```

## 📊 Expected Performance

| Metric | Expected Range |
|--------|-----------------|
| Accuracy | 85-95% |
| Precision | 85-95% |
| Recall | 85-95% |
| F1 Score | 85-95% |

*Depends on data quality and quantity (1000+ images per class recommended)*

## ⚡ Performance Tips

1. **Start Small**: Test with 2 classes (melanoma/benign) first
2. **Quality Over Quantity**: 500 high-quality images > 5000 poor images
3. **Balance**: Equal images per class (e.g., 1000 melanoma + 1000 benign)
4. **Monitor**: Watch `training_history.png` for overfitting
5. **Patience**: Let early stopping run (15 epoch patience by default)

## 🔧 Common Issues

| Problem | Solution |
|---------|----------|
| Out of memory | Reduce `--batch_size` (32→16→8) |
| Image size error | Ensure all images are valid JPG/PNG |
| Low accuracy | Add more data, increase epochs, check labels |
| Training too slow | Use smaller `--img_size` (224→128) |
| Model not found | Check file path is correct |

## 📁 File Structure

```
backend/ai_models/
├── train_skin_cancer_cnn.py          # Main training script
├── inference_skin_cancer_cnn.py      # Inference/prediction script
├── TRAINING_GUIDE.md                 # Detailed guide
├── QUICK_START.md                    # This file
├── models/                           # Output directory (auto-created)
│   ├── skin_cancer_cnn_best.h5      # Best trained model
│   ├── label_encoder.pkl            # Class labels
│   ├── metrics.json                 # Performance metrics
│   ├── training_history.png         # Training curves
│   └── confusion_matrix.png         # Prediction breakdown
```

## ✅ Full Workflow Example

```bash
# 1. Install
pip install tensorflow scikit-learn numpy pandas matplotlib pillow opencv-python

# 2. Prepare data in folder structure
mkdir -p data/melanoma data/benign
cp my_melanoma_images/* data/melanoma/
cp my_benign_images/* data/benign/

# 3. Train
python ai_models/train_skin_cancer_cnn.py --data_dir ./data --epochs 100

# 4. Check results
# Review: ./models/metrics.json
# View:   ./models/training_history.png

# 5. Test single image
python ai_models/inference_skin_cancer_cnn.py \
    --model ./models/skin_cancer_cnn_best.h5 \
    --encoder ./models/label_encoder.pkl \
    --image ./test_sample.jpg

# 6. Predict on many images
python ai_models/inference_skin_cancer_cnn.py \
    --model ./models/skin_cancer_cnn_best.h5 \
    --encoder ./models/label_encoder.pkl \
    --folder ./test_images \
    --output predictions.json
```

## 📚 Next Steps

After training:

1. **Review metrics** in `./models/metrics.json`
2. **Check accuracy** by viewing `training_history.png` and `confusion_matrix.png`
3. **If accuracy too low:**
   - Add more training data
   - Increase epochs (100→150)
   - Check data quality/labels
4. **If accuracy good:**
   - Use model for production inference
   - Replace pre-trained model in frontend
   - Deploy to Flask/FastAPI backend

## 🚀 Integration with Frontend

To use trained model in the Next.js frontend:

1. **Option A: Backend API (Recommended)**
   ```python
   # Backend (Flask/FastAPI)
   from inference_skin_cancer_cnn import SkinCancerCNNInference
   
   @app.post('/api/predict')
   def predict(image):
       inference = SkinCancerCNNInference('models/best.h5', 'models/encoder.pkl')
       result = inference.predict(image)
       return result
   ```

2. **Option B: TensorFlow.js (Browser)**
   ```bash
   pip install tensorflowjs
   tensorflowjs_converter --input_format keras \
       models/skin_cancer_cnn_best.h5 \
       frontend/public/models/trained-model/
   ```

---

**Questions?** See `TRAINING_GUIDE.md` for detailed documentation.
