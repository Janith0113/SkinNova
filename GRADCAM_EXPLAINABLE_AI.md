# GradCAM Explainable AI Implementation Guide

## Overview

GradCAM (Gradient-weighted Class Activation Mapping) is an explainability technique that helps interpret deep learning model predictions. This guide covers how to use GradCAM in SkinNova for explaining quiz recommendations and image-based disease detection results.

## Table of Contents

1. [What is GradCAM?](#what-is-gradcam)
2. [Features Implemented](#features-implemented)
3. [Quiz Explainability (Dosha Assessment)](#quiz-explainability)
4. [Image Detection Explainability](#image-detection-explainability)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Usage Examples](#usage-examples)
8. [Technical Architecture](#technical-architecture)

## What is GradCAM?

GradCAM creates visual explanations by:
- Computing gradients of the predicted class with respect to feature maps
- Weighting the gradients by the importance of each feature
- Creating a heatmap showing which regions influenced the prediction

### Benefits:
- **Interpretability**: Understand why the model made a specific prediction
- **Trust**: Build confidence in AI-based recommendations
- **Debugging**: Identify potential model biases
- **Clinical Support**: Help healthcare professionals validate AI suggestions

## Features Implemented

### 1. **Quiz Answer Explainability (Dosha Assessment)**
- Explains which answers most influenced the Dosha classification
- Shows feature importance for each question
- Provides confidence scores for predictions
- Multiple visualization modes (heatmap, detailed, decision tree)

### 2. **Image-Based Detection Explainability**
- Generates visual heatmaps for medical image predictions
- Highlights regions the model focused on
- Provides region-by-region importance breakdown
- Works with all disease detection models (Psoriasis, Tinea, Leprosy, Skin Cancer)

### 3. **Interactive Visualizations**
- Heat map view with intensity colors
- Detailed analysis with feature breakdowns
- Decision tree visualization showing prediction paths
- Question navigation with importance scoring

## Quiz Explainability (Dosha Assessment)

### How It Works

The Dosha quiz uses GradCAM-inspired analysis to explain why answers lead to a specific constitutional type:

```
Quiz Answer → Feature Category → Weight Calculation → GradCAM Score → Visualization
```

### Steps:

1. **User Completes Quiz**: Selects 25 yes/no questions
2. **Calculate Dosha Type**: Count answers for each dosha (Vata, Pitta, Kapha)
3. **Compute GradCAM Features**:
   - Map each question to a feature category
   - Calculate feature importance based on weights
   - Compute alignment scores
4. **Generate Explanation**: Create visual explanation of the result

### Feature Categories

Features are weighted based on their contribution to each dosha:

```
VATA (Air & Space):
- body_frame: 0.12 (12% importance)
- skin_type: 0.14 (14% importance)
- energy_level: 0.10
- movement: 0.09
- stress_response: 0.09

PITTA (Fire & Water):
- skin_type: 0.15
- appetite: 0.12
- emotional_state: 0.11
- body_temperature: 0.11
- body_odor: 0.10

KAPHA (Earth & Water):
- body_frame: 0.13
- skin_type: 0.13
- sleep_pattern: 0.11
- bowel_habit: 0.10
- nails: 0.09
```

### Visualization Modes

#### 1. Heat Map View
Shows feature importance with color intensity:
- 🔵 Blue (0-20%): Low importance
- 🟣 Purple (40-60%): Medium importance
- 🔴 Red (80-100%): High importance

#### 2. Detailed Analysis
Provides:
- Explanation text for each answer
- Feature contribution breakdown
- Normalized importance scores

#### 3. Decision Tree View
Shows:
- Top contributing features
- Prediction path visualization
- Combined impact scores

## Image Detection Explainability

### Supported Models

- Psoriasis Detection
- Tinea (Fungal Infection) Detection
- Leprosy Detection
- Skin Cancer Detection

### How It Works

```
Image Upload → Model Prediction → Compute Gradients → Generate Heatmap → Overlay → Display
```

### Heatmap Interpretation

- **Red/Orange**: High activation (model focusing here)
- **Yellow/Green**: Medium activation
- **Blue**: Low activation (model ignoring)

### Feature Regions

Images are divided into 4x4 grid = 16 regions:

```
┌─────┬─────┬─────┬─────┐
│ 0,0 │ 0,1 │ 0,2 │ 0,3 │  <- Top
├─────┼─────┼─────┼─────┤
│ 1,0 │ 1,1 │ 1,2 │ 1,3 │
├─────┼─────┼─────┼─────┤
│ 2,0 │ 2,1 │ 2,2 │ 2,3 │
├─────┼─────┼─────┼─────┤
│ 3,0 │ 3,1 │ 3,2 │ 3,3 │  <- Bottom
└─────┴─────┴─────┴─────┘
```

Each region's importance is calculated as mean activation.

## API Endpoints

### 1. Quiz Feature Analysis

**Endpoint**: `POST /api/xai/quiz-features`

**Request**:
```json
{
  "answers": [
    {
      "questionId": 1,
      "question": "What is your body frame?",
      "selectedAnswer": "Thin, light build",
      "dosha": "vata"
    },
    {
      "questionId": 2,
      "question": "What is your skin type?",
      "selectedAnswer": "Dry, thin, fragile",
      "dosha": "vata"
    }
  ],
  "primaryDosha": "vata"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "primaryDosha": "vata",
    "totalImportance": 72.5,
    "features": [
      {
        "questionId": 1,
        "category": "body_frame",
        "weight": 12,
        "featureImportance": {
          "answer_alignment": 12,
          "answer_specificity": 85,
          "question_relevance": 12,
          "confidence_score": 100
        },
        "gradcamScore": 52.25,
        "alignmentScore": 1
      }
    ]
  }
}
```

### 2. Image GradCAM Explanation

**Endpoint**: `POST /api/xai/image-explanation`

**Request**:
- Form data with image file
- Model type (psoriasis, tinea, leprosy, skin-cancer)

```bash
curl -F "image=@path/to/image.jpg" \
     -F "modelType=psoriasis" \
     http://localhost:4000/api/xai/image-explanation
```

**Response**:
```json
{
  "success": true,
  "data": {
    "prediction": "Psoriasis",
    "confidence": 0.92,
    "all_predictions": {
      "No Psoriasis": 0.08,
      "Psoriasis": 0.92
    },
    "heatmap_base64": "data:image/jpeg;base64,...",
    "feature_importance": {
      "region_0_0": 0.15,
      "region_0_1": 0.82,
      "region_0_2": 0.45,
      "region_0_3": 0.23,
      ...
    },
    "model_layer": "conv_pw_13",
    "top_regions": [
      ["region_0_1", 0.82],
      ["region_1_1", 0.68],
      ["region_0_2", 0.45]
    ],
    "explanation": "The model identified psoriasis with 92.0% confidence..."
  }
}
```

### 3. XAI/GradCAM Computation (Quiz)

**Endpoint**: `POST /api/xai/compute-xai`

**Request**:
```json
{
  "answers": [
    {
      "questionId": 1,
      "question": "What is your body frame?",
      "selectedAnswer": "Thin, light build",
      "dosha": "vata"
    }
  ],
  "primaryDosha": "vata"
}
```

**Response**: See original xai-dosha route documentation.

## Frontend Components

### Enhanced GradCAM Visualization Component

**File**: `frontend/components/EnhancedGradCAMVisualization.tsx`

**Props**:
```typescript
interface EnhancedGradCAMVisualizationProps {
  doshaType: 'vata' | 'pitta' | 'kapha';
  gradcamData: GradCAMData[];
  totalScore: number;
}
```

**Features**:
- Multi-view visualization (heat map, detailed, tree)
- Question navigator with importance scores
- Interactive feature breakdown
- Mobile responsive design

### Usage in Dosha Quiz

```tsx
import EnhancedGradCAMVisualization from '@/components/EnhancedGradCAMVisualization';

// In your component:
<EnhancedGradCAMVisualization 
  doshaType={primaryDosha}
  gradcamData={xaiData.results}
  totalScore={xaiData.overallConfidence}
/>
```

## Usage Examples

### Example 1: Quiz Answer Explanation

User completes Dosha quiz:
- Question 1: "Thin, light build" → Vata (weight: 0.12)
- Question 2: "Dry, thin skin" → Vata (weight: 0.14)
- Question 3: "Variable appetite" → Vata (weight: 0.08)

**Result**: 
- Primary Dosha: **Vata** (3/3 answers)
- Overall Confidence: **85%**

The GradCAM heatmap shows:
- Skin type: 14% importance (highest)
- Body frame: 12% importance
- Appetite: 8% importance

### Example 2: Image Detection

User uploads psoriasis lesion image:

1. Model predicts: **Psoriasis** with **92% confidence**
2. GradCAM analysis shows:
   - Top-left region (lesion area): 82% activation
   - Top-center region (edge): 68% activation
   - Bottom-left region (healthy): 15% activation

3. Heatmap overlay helps dermatologist verify the model's focus.

## Technical Architecture

### Python Backend

**Key Files**:
- `backend/models/gradcam_utils.py`: GradCAM implementation
- `backend/models/generate_gradcam.py`: Image explanation script
- `backend/src/routes/gradcam.ts`: API endpoints

**Key Classes**:
```python
class GradCAM:
    def compute_heatmap(img_array, pred_index)
    def overlay_heatmap(img_path, heatmap)
    def get_feature_importance(heatmap, num_regions)

class SkinDetectionExplainer:
    def explain_prediction(img_path, output_dir)
```

### TypeScript/React Frontend

**Components**:
- `EnhancedGradCAMVisualization.tsx`: Main visualization
- `GradCAMVisualization.tsx`: Original simpler version
- Quiz page integration in `app/dosha-quiz/page.tsx`

**Data Flow**:
```
User Input → API Call → Python Processing → Response → React Rendering
```

## Performance Considerations

### Optimization Tips

1. **Caching**: Cache heatmap computations for frequently analyzed images
2. **Resolution**: Use lower resolution for visualization (224x224)
3. **Async Processing**: Run GradCAM computation asynchronously
4. **Progressive Loading**: Show predictions first, then GradCAM

### Processing Times

- Quiz GradCAM: ~100ms (fast, rule-based)
- Image GradCAM: ~2-5 seconds per image (depends on model size)

## Troubleshooting

### Issue: Heatmap not generating

**Solution**:
```bash
# Check if model file exists
ls backend/models/*.keras

# Verify TensorFlow installation
python -c "import tensorflow; print(tensorflow.__version__)"
```

### Issue: API returning 500 error

**Check**:
1. Model file path is correct
2. Image file is readable
3. TensorFlow/Python dependencies installed
4. Check server logs for detailed error

### Issue: Heatmap overlay quality poor

**Solution**:
- Increase resolution in `generate_gradcam.py`
- Adjust alpha parameter in overlay function
- Use different colormap (COLORMAP_JET vs COLORMAP_HOT)

## Future Enhancements

- [ ] LIME (Local Interpretable Model-agnostic Explanations)
- [ ] Attention-based explanations
- [ ] Saliency maps
- [ ] Multi-model ensemble explanations
- [ ] Real-time explanation feedback loop
- [ ] Export explanations as PDF reports

## References

- GradCAM Paper: https://arxiv.org/abs/1610.02055
- Keras GradCAM Implementation: https://keras.io/examples/vision/grad_cam/
- Explainable AI in Healthcare: https://arxiv.org/abs/2008.07341

## Support

For questions or issues with GradCAM implementation:
1. Check the technical architecture section
2. Review API endpoint documentation
3. Check troubleshooting section
4. Review error logs in server console
