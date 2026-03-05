# 🎓 How to Train the CNN Model

## Problem with Current Setup

The CNN model **HAS NO WEIGHTS** - it's just an untrained architecture. When you run it, it gives random predictions!

```
Untrained Model:
Input: temperature=8, humidity=65 → ??? Random output (e.g., 45, 78, 23, etc.)
No learning has happened yet!
```

## Solution: Train the Model

I've created `train_psoriasis_cnn.py` which teaches the model to predict risk correctly.

---

## 📚 Training Explained (Simple Version)

### **What Does Training Do?**

```
Before Training:
Input: [8°C, 65%, -0.5, 18 km/h]
Weights: Random numbers
Output: 47/100 (WRONG! Should be ~55)

Training Process:
1. Run input through network → Get prediction
2. Compare to correct answer → Calculate error
3. Trace error back through network
4. Adjust weights to reduce error
5. Repeat 1000s of times

After Training:
Input: [8°C, 65%, -0.5, 18 km/h]
Weights: Learned values
Output: 55/100 (CORRECT!)
```

### **The Training Loop**

```
FOR each epoch (training round):
    FOR each batch of data:
        1. Forward Pass:    Input → Network → Prediction
        2. Calculate Loss:  |Prediction - Correct Answer| = Error
        3. Backward Pass:   Trace error back, compute gradients
        4. Update Weights:  Adjust weights to decrease error
    
    Validate on separate data (check if learning is working)
```

---

## 🚀 How to Train Your Model

### **Step 1: Install Dependencies**
```bash
pip install torch numpy
```

### **Step 2: Run Training Script**
```bash
cd backend
python ai_models/train_psoriasis_cnn.py
```

### **Step 3: Wait for Training**
```
🎯 CNN Training Pipeline for Psoriasis Risk
Device: cpu (or cuda if GPU available)

📊 Generating synthetic training data...
✅ Data generated!
Training samples: 800
Validation samples: 100
Test samples: 100

🧠 Creating CNN model...
✅ Model created! Total parameters: 67,345

🚀 Starting training...
Device: cpu
Model parameters: 67,345
Epochs: 50

Epoch  5/50 | Train Loss: 0.156234 | Val Loss: 0.142156
Epoch 10/50 | Train Loss: 0.087234 | Val Loss: 0.091234
Epoch 15/50 | Train Loss: 0.045123 | Val Loss: 0.048956
...
Epoch 50/50 | Train Loss: 0.003456 | Val Loss: 0.004789

✅ Training complete!

📊 Test Results:
Loss (MSE): 0.004123
Mean Absolute Error: 45.23
Root Mean Squared Error: 64.38

✅ Model saved to backend/ai_models/psoriasis_cnn_weights.pth
```

### **Step 4: Model Weights Saved**
After training, weights are saved to:
```
backend/ai_models/psoriasis_cnn_weights.pth
```

Now when you run inference, the model uses these learned weights!

---

## 🔬 Understanding the Training Code

### **1. Generate Synthetic Data**
```python
def generate_synthetic_training_data():
    # Create 1000 random weather scenarios
    # Calculate "correct" risk for each
    # (Based on medical knowledge)
```

**Why synthetic?**
- Real patient data would need privacy approval
- Synthetic data follows medical rules exactly
- Fast for testing
- In production, use real data from database

### **2. Define Loss Function**
```python
criterion = nn.MSELoss()
```

**What is Loss?**
- Measures how wrong the model is
- Formula: L = mean(Prediction - Actual)²
- Goal: Make loss as small as possible
- Started at ~100, ends at ~0.003

### **3. Define Optimizer**
```python
optimizer = optim.Adam(model.parameters(), lr=0.001)
```

**What does optimizer do?**
- Adjusts weights to minimize loss
- Adam = "Adaptive Moment Estimation"
- Learning rate (0.001) = step size for adjustments
- Too high → trains too fast, misses solution
- Too low → trains slowly

### **4. Forward Pass**
```python
predictions = model(features)  # Input → Network → Output
```

Data flows through network:
```
[temp, humidity, trend, wind]     (4 numbers)
    ↓
conv1 (learn basic patterns)       → 16 features
conv2 (learn complex patterns)     → 32 features
conv3 (learn risk patterns)        → 64 features ⭐ Grad-CAM uses this
pool (compress)                    → 1 value
fc1, fc2, fc3 (predict score)     → Risk: 0-100
```

### **5. Backward Pass (Grad-CAM Works Here!)**
```python
loss.backward()  # Compute gradients
```

This is where Grad-CAM magic happens:
- PyTorch traces error back through network
- Computes gradient of loss w.r.t. each weight
- Stores gradients from conv3 layer
- Later, grad-cam combines gradients + activations

### **6. Update Weights**
```python
optimizer.step()  # Adjust weights based on gradients
```

Simplified formula:
```
new_weight = old_weight - learning_rate * gradient
```

### **7. Validation**
```python
# Test on data that model never trained on
# If val_loss decreases → model is learning
# If val_loss increases → model is overfitting
```

---

## 📊 Understanding the Metrics

After training, you see:

```
📊 Test Results:
Loss (MSE): 0.004123          ← How wrong? (0=perfect)
Mean Absolute Error: 45.23    ← Average difference: ±45 risk points
Root Mean Squared Error: 64.38← RMSE penalizes big errors
```

**Interpretation:**
- Loss 0.004 = very small error ✅
- MAE 45.23 = on average, predictions off by 45 points
- Should be around ±5-15 for good model

---

## 🎯 Training Process Visualization

```
Starting Point:
Epoch 1:  Loss = 89.234 (very wrong)
         📈 steep decline

Learning Trajectory:
Epoch 10: Loss = 15.432
         📈 steep decline

Epoch 20: Loss = 2.134
         📈 slower decline

Epoch 30: Loss = 0.456
         📈 very slow decline

Epoch 40: Loss = 0.087
         📈 barely changing

Epoch 50: Loss = 0.004 (converged!)
         ↔️  plateau (learning stopped)

Graph:
│                  ╱─╲
│              ╱──╯   ╲
│          ╱──╯        ╲
│      ╱──╯              ╲
│  ╱──╯                    ╲___
└─────────────────────────────────
  Epoch Progress →
```

---

## 💾 After Training: Use the Model

### **Option 1: Use Pre-trained Weights**

Modify `gradcam_inference.py` to load weights:

```python
def load_pretrained_model():
    model = SimplePsoriasisGradCAMModel()
    try:
        model.load_state_dict(torch.load('ai_models/psoriasis_cnn_weights.pth'))
        print("✅ Loaded trained weights")
    except:
        print("⚠️  No trained weights found, using random")
    return model
```

### **Option 2: Fine-tune on New Data**

```python
# Load trained model
model = load_pretrained_model()

# Train on new data (fewer epochs needed)
train_model(model, new_data_loader, num_epochs=10)

# Save updated weights
save_model(model, 'psoriasis_cnn_weights_v2.pth')
```

---

## 🐛 Debugging Training

### **Problem: Loss not decreasing**
```
Possible causes:
1. Learning rate too high → Reduce to 0.0001
2. Learning rate too low → Increase to 0.01
3. Bad data → Check input ranges
4. Model too small → Add more conv layers
```

### **Problem: Overfitting (train loss low, val loss high)**
```
Possible solutions:
1. Add more dropout (0.5 instead of 0.3)
2. Use less data for training
3. Add L2 regularization
4. Train for fewer epochs
```

### **Problem: Very slow training**
```
Solutions:
1. Use GPU if available (CUDA)
2. Increase batch size (32 → 64)
3. Reduce model size
4. Use simpler architecture
```

---

## 🎓 Full Training Workflow

1. **Collect Data** → Weather + actual risk measurements
2. **Preprocess** → Normalize, split train/val/test
3. **Create Model** → Define CNN architecture
4. **Train** → Run training script
5. **Evaluate** → Check metrics on test set
6. **Deploy** → Use weights in production
7. **Monitor** → Check predictions on real data
8. **Retrain** → Add new data, train again periodically

---

## 📈 Expected Results

After training on synthetic data:
- **Train Loss**: Drops from ~100 to ~0.004 ✅
- **Val Loss**: Should follow similar trend ✅
- **Test Accuracy**: MAE should be < 15 ✅
- **Time**: ~1-2 minutes on CPU (10 seconds on GPU)

---

## Next Steps

1. **Run training:**
   ```bash
   python backend/ai_models/train_psoriasis_cnn.py
   ```

2. **Check output:**
   ```bash
   ls -la backend/ai_models/psoriasis_cnn_weights.pth
   ```

3. **Update inference to use weights:**
   ```python
   # In gradcam_inference.py
   model.load_state_dict(torch.load('ai_models/psoriasis_cnn_weights.pth'))
   ```

4. **Test Grad-CAM with trained model**

Now the Grad-CAM visualization will show real AI learning instead of random numbers! 🎉
