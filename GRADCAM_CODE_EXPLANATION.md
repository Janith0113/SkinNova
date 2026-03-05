# 🧠 CNN Grad-CAM Code Explanation

## Overview
This is a **real neural network implementation** for understanding how AI predicts psoriasis risk. It uses **Grad-CAM (Gradient-weighted Class Activation Mapping)** to show which weather factors the AI focuses on most.

---

## 📂 File Structure & Purpose

### **1. Backend/AI_Models/psoriasis_gradcam_model.py**
**Purpose:** Define the neural network architecture and Grad-CAM computation

#### **A. PsoriasisRiskCNN Class (Lines 14-288)**
The neural network model itself

**What it does:**
- Takes 4 weather features as input: temperature, humidity, wind speed, trend
- Converts them to a 2x2 image format (so CNN can process them)
- Passes through 3 convolutional layers (learns features)
- Outputs a risk score (0-100)

**Structure:**
```
Input (4 features: temp, humidity, trend, wind)
    ↓
Transform to 2x2 image
    ↓
Conv1: 1 channel → 16 channels (learn basic patterns)
Batch Norm + ReLU (normalize & activate)
    ↓
Conv2: 16 channels → 32 channels (learn complex patterns)
Batch Norm + ReLU
    ↓
Conv3: 32 channels → 64 channels (learn risk patterns) ⭐ GRAD-CAM CAPTURES HERE
Batch Norm + ReLU
    ↓
Global Average Pooling (compress to 1x1)
    ↓
Fully Connected Layers
    ↓
Output: Risk Score (0-100)
```

**Key Methods:**

```python
_forward_hook()  # Captures activations during forward pass
                 # Stores what the conv3 layer is "seeing"

_backward_hook() # Captures gradients during backpropagation
                 # Stores which features the model "cares about"

get_grad_cam()   # Combines activations + gradients
                 # Creates heatmap showing importance
```

#### **B. GradCAMExplainer Class (Lines 91-180)**
Makes the model interpretable

**Methods:**
- `explain()` - Runs input through network, computes Grad-CAM
- `visualize_grad_cam()` - Converts heatmap to colors for UI

---

### **2. Backend/AI_Models/gradcam_inference.py**
**Purpose:** Simple standalone script for running inference

**How it works:**
1. Reads JSON from stdin (from Node.js)
2. Creates neural network
3. Runs weather data through it
4. Computes Grad-CAM
5. Outputs JSON with results to stdout

**Key Functions:**
```python
SimplePsoriasisGradCAMModel  # Lightweight CNN
process_weather_data()       # Main inference function
importance_to_hex_color()    # Converts importance to color
```

**Input JSON:**
```json
{
  "temperature": 8,
  "humidity": 65,
  "trend_value": -0.5,
  "wind_speed": 18
}
```

**Output JSON:**
```json
{
  "risk_score": 55.2,
  "grad_cam_heatmap": [0.1, 0.8, 0.3, 0.2],
  "factor_importance": {
    "Temperature": 0.1,
    "Humidity": 0.8,
    "Trend": 0.3,
    "Wind Speed": 0.2
  },
  "color_map": {
    "Temperature": "#3b82f6",
    "Humidity": "#ef4444",
    "Trend": "#fbbf24",
    "Wind Speed": "#10b981"
  }
}
```

---

### **3. Backend/src/routes/psoriasisGradCAM.ts**
**Purpose:** API endpoint to connect frontend to Python model

**What it does:**
1. Receives POST request with weather data
2. Spawns Python process running gradcam_inference.py
3. Sends JSON to Python stdin
4. Reads JSON output from Python stdout
5. Returns to frontend

```typescript
POST /api/psoriasis/grad-cam
Body: {temperature, humidity, trend_value, wind_speed}
Response: {gradcamExplanation: {...}}
```

---

### **4. Frontend/app/psoriasis/risk-analysis/page.tsx**
**Purpose:** Display Grad-CAM visualization to user

#### **A. New State Variables (Lines 44-46)**
```typescript
const [gradcamData, setGradcamData] = useState<GradCAMData | null>(null);
const [gradcamLoading, setGradcamLoading] = useState(false);
```
- Store Grad-CAM results
- Track loading state

#### **B. fetchGradCAMExplanation() Function (Lines 79-100)**
```typescript
const fetchGradCAMExplanation = async (weather) => {
  // Call backend API
  // POST to /api/psoriasis/grad-cam
  // Store results in gradcamData
}
```

#### **C. UI Rendering (Lines 385-475 in modified file)**
Shows:
- 4 colored boxes (one per weather factor)
- Color intensity = how much model focuses on that factor
- Percentage importance
- Bar chart showing gradients

---

## 🔄 Complete Data Flow

```
USER LOADS PAGE
    ↓
getWeatherData() - Gets temp, humidity, etc from Open-Meteo API
    ↓
fetchGradCAMExplanation(weather) - Calls our backend
    ↓
Backend: POST /api/psoriasis/grad-cam
    ↓
spawn('python', ['gradcam_inference.py'])
    ↓
Python receives JSON via stdin
    ↓
PsoriasisRiskCNN processes features
    ↓
Grad-CAM computes gradients (backpropagation)
    ↓
Importance scores calculated (0-1 scale)
    ↓
Colors assigned: Blue (low) → Red (high)
    ↓
JSON output written to stdout
    ↓
Node.js reads Python output
    ↓
Returns JSON to frontend
    ↓
Frontend displays colored visualization
    ↓
USER SEES: Which weather factors AI focuses on
```

---

## 🎯 What Each Component EXPLAINS

| Component | Explains |
|-----------|----------|
| **CNN Layers** | How neural network learns risk patterns |
| **Conv3 Layer** | The layer we analyze for Grad-CAM |
| **Forward Hook** | What the model "sees" (activations) |
| **Backward Hook** | What the model "cares about" (gradients) |
| **Grad-CAM Heatmap** | Combination of what it sees + what it cares about |
| **Factor Importance** | Percentage influence of each weather factor |
| **Color Map** | Visual representation (Blue=low, Red=high) |

---

## 📊 Grad-CAM Technical Details

**What is Grad-CAM?**
- **Grad**: Gradients from backpropagation
- **CAM**: Class Activation Mapping (visualize what matters)

**Formula:**
```
Grad-CAM = ReLU(Σ(gradient × activation))
```

For each weather factor:
1. Get gradient of risk score w.r.t. that feature
2. Multiply by activation values
3. Apply ReLU (keep only positive)
4. Average across channels
5. Normalize to 0-1 range

**Result:** A heatmap showing which factors drive the prediction

---

## 🎨 Color Coding System

```
Importance → Color
0-25%     → Blue (#3b82f6)    - Low impact
25-50%    → Green (#10b981)   - Medium-low
50-75%    → Yellow (#fbbf24)  - Medium-high
75-100%   → Red (#ef4444)     - High impact
```

---

## 💡 Why This Matters

**Before (Rule-Based):**
- "Cold weather increases risk because temperature < 10°C triggers immune response"
- Simple thresholds

**After (AI Grad-CAM):**
- "The neural network focused on humidity 85% and temperature 10%"
- Shows actual AI decision-making process
- More transparent & trustworthy
- Users understand AI reasoning

---

## ⚙️ How to Run

1. **Install PyTorch:**
   ```bash
   pip install torch numpy opencv-python
   ```

2. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **View Grad-CAM:**
   - Go to psoriasis risk analysis page
   - Wait for "Computing Grad-CAM..." message
   - See colored factor importance visualization

---

## 🔧 Debug Tips

If Grad-CAM doesn't show:
1. Check Python installed: `python --version`
2. Check PyTorch: `python -c "import torch; print(torch.__version__)"`
3. Check backend logs for spawn() errors
4. Verify `backend/ai_models/gradcam_inference.py` exists
5. Test Python script directly: `echo '{"temperature":8}' | python gradcam_inference.py`

---

## Summary

| What | Where | Purpose |
|------|-------|---------|
| **CNN Model** | `psoriasis_gradcam_model.py` | Neural network architecture |
| **Inference** | `gradcam_inference.py` | Run model & compute Grad-CAM |
| **API Route** | `psoriasisGradCAM.ts` | Connect Node.js to Python |
| **UI Display** | `page.tsx` | Show colors & importance |
| **Data Flow** | Frontend → Backend → Python → Backend → Frontend |

This creates **real explainable AI** by showing exactly which factors the neural network focuses on! 🧠✨
