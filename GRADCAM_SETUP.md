# GradCAM Implementation - Setup Instructions

## Installation & Setup

### 1. Backend Dependencies

All required packages should already be installed. Verify:

```bash
cd backend
pip install tensorflow>=2.10.0
pip install opencv-python>=4.5.0
pip install numpy>=1.21.0
```

### 2. File Structure

Ensure these files exist:

```
backend/
├── models/
│   ├── gradcam_utils.py          ✅ Created
│   ├── generate_gradcam.py       ✅ Created
│   └── *.keras                    (Your trained models)
├── src/
│   ├── routes/
│   │   ├── gradcam.ts            ✅ Created
│   │   └── xai-dosha.ts          ✅ Exists
│   └── index.ts                  ✅ Updated with routes
└── uploads/
    └── gradcam/                  (Auto-created)

frontend/
├── components/
│   ├── EnhancedGradCAMVisualization.tsx  ✅ Created
│   └── GradCAMVisualization.tsx          ✅ Exists
└── app/
    └── dosha-quiz/
        └── page.tsx              (Optional: Update to use Enhanced version)
```

### 3. Environment Variables

Make sure `.env` is configured (no changes needed if already set up):

```
MONGODB_URI=<your-uri>
PORT=4000
NODE_ENV=development
```

### 4. Python Configuration

Check `backend/models/` has:
- `best_psoriasis_model (2).keras`
- Other trained model files

If models are missing:
- Create mock versions for testing
- Or use the `mock` mode in `generate_gradcam.py`

---

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

This starts TypeScript watch mode. API will be available at:
- Health check: `http://localhost:4000/api/health`
- XAI endpoints: `http://localhost:4000/api/xai/*`

### Start Frontend

```bash
cd frontend  
npm run dev
```

Frontend will be at `http://localhost:3000`

### Combined Start

From root:

```bash
npm run dev  # Runs both backend and frontend
```

---

## Verification Checklist

### Backend Running ✅

Test with curl:

```bash
curl http://localhost:4000/api/health
# Expected: {"status":"ok","message":"Backend is running"}
```

### Quiz Endpoint Available ✅

```bash
curl -X POST http://localhost:4000/api/xai/quiz-features \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": 1,
        "question": "What is your body frame?",
        "selectedAnswer": "Thin, light build",
        "dosha": "vata"
      }
    ],
    "primaryDosha": "vata"
  }'
```

### Image Endpoint Available ✅

```bash
curl -X POST http://localhost:4000/api/xai/image-explanation \
  -F "image=@path/to/image.jpg" \
  -F "modelType=psoriasis"
```

### Frontend Availability ✅

Visit: `http://localhost:3000/dosha-quiz`

---

## Using GradCAM in Your App

### In Dosha Quiz (Already Implemented)

The quiz already calls the XAI endpoint:

```typescript
// In app/dosha-quiz/page.tsx
const computeXAI = async (answers, scores) => {
  const response = await fetch('/api/xai/compute-xai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answers: answerData,
      primaryDosha: primaryDosha,
    }),
  });
  
  const data = await response.json();
  setXaiData(data.data);
};
```

### Using Enhanced Component (Optional)

To use the new enhanced visualization:

```typescript
import EnhancedGradCAMVisualization from '@/components/EnhancedGradCAMVisualization';

// In your results section:
{xaiData && !loadingXAI && (
  <EnhancedGradCAMVisualization 
    doshaType={primaryDosha}
    gradcamData={xaiData.results}
    totalScore={xaiData.overallConfidence}
  />
)}
```

### For Image Detection

Add this to your detection result component:

```typescript
const handleImageExplanation = async (imagePath: string) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('modelType', 'psoriasis'); // or tinea, leprosy, skin-cancer
  
  const response = await fetch('/api/xai/image-explanation', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  displayHeatmap(result.data.heatmap_base64);
  displayFeatures(result.data.feature_importance);
};
```

---

## Testing GradCAM Locally

### Test 1: Quiz Explanation

1. Go to `http://localhost:3000/dosha-quiz`
2. Complete the quiz
3. Check Results tab
4. Look for "AI Decision Explanation (GradCAM)" section
5. Try different view modes (Heat Map, Detailed, Decision Tree)

### Test 2: Image Explanation (If Upload Feature Available)

1. Upload a skin image
2. Wait for prediction
3. Check for GradCAM visualization below
4. Verify heatmap overlay is visible

### Test 3: API Direct Test

Using Postman or curl:

```bash
# Test quiz features endpoint
POST http://localhost:4000/api/xai/quiz-features
Content-Type: application/json

{
  "answers": [
    {"questionId": 1, "question": "Q1", "selectedAnswer": "Thin build", "dosha": "vata"},
    {"questionId": 2, "question": "Q2", "selectedAnswer": "Dry skin", "dosha": "vata"}
  ],
  "primaryDosha": "vata"
}
```

Expected response:
```json
{
  "success": true,
  "data": {
    "primaryDosha": "vata",
    "totalImportance": 70.5,
    "features": [...]
  }
}
```

---

## Troubleshooting

### Issue: Module not found error

**Solution**:
```bash
cd backend
npm install ts-node typescript  # If needed
npm run dev  # Restart server
```

### Issue: Python script not found

**Check**:
1. `ls backend/models/generate_gradcam.py`
2. Make sure Python is in PATH
3. Check logs for exact error

### Issue: Model file .keras not found

**Options**:
1. Download the model file to `backend/models/`
2. Use mock mode (automatically falls back)
3. Create a dummy .keras file for testing

### Issue: Heatmap not displaying

**Check**:
1. Base64 encoding is correct (starts with `data:image/jpeg;base64,`)
2. Firefox/Chrome supports data URLs
3. Try a different image format

### Issue: Slow heatmap generation

**Solutions**:
1. Use lower resolution images (224x224)
2. Reduce number of inference runs
3. Optimize Python script with multiprocessing

---

## Performance Optimization

### Frontend Optimization

```typescript
// Memoize expensive computations
const normalizedImportance = useMemo(() => {
  return compute...
}, [gradcamData]);

// Use lazy loading for images
<Image 
  src={heatmap} 
  alt="Heatmap"
  loading="lazy"
/>
```

### Backend Optimization

```python
# Cache model loading
@cache
def load_model(model_path):
    return keras.models.load_model(model_path)

# Use async processing
async def generate_gradcam_async(image_path):
    # Run in thread pool
    return await asyncio.to_thread(generate_gradcam, image_path)
```

### API Response Optimization

- Compress heatmap image (97% smaller with lossy JPEG)
- Use progressive JPEG encoding
- Cache frequent requests

---

## Production Deployment

### Docker Setup (Optional)

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["npm", "run", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=<production-uri>
GRADCAM_CACHE_ENABLED=true
GRADCAM_CACHE_TTL=3600  # 1 hour
```

### Monitoring

Monitor these metrics:
- API response time (target: < 5s for images)
- Model inference time
- Memory usage (GradCAM can be memory-intensive)
- Error rates

---

## Advanced Customization

### Custom Feature Weights

Edit `backend/src/routes/gradcam.ts`:

```typescript
const dosha_feature_weights: Record<string, Record<string, number>> = {
  vata: {
    'body_frame': 0.12,  // Adjust these values
    'skin_type': 0.14,
    // ...
  }
}
```

### Custom Color Maps

Edit `EnhancedGradCAMVisualization.tsx`:

```typescript
const getIntensityColor = (value: number): string => {
  // Customize colors here
  if (value < 20) return 'from-blue-900 to-blue-700';
  // ...
}
```

### Custom Models

In `backend/models/generate_gradcam.py`:

```python
def get_model_path(model_type: str) -> str:
    model_paths = {
        'your_model': '/path/to/model.keras',
        # ...
    }
```

---

## Support & Documentation

### Available Docs
- `GRADCAM_EXPLAINABLE_AI.md` - Full technical docs
- `GRADCAM_QUICK_START.md` - User guide
- `GRADCAM_SETUP.md` - This file

### Getting Help

1. Check the documentation files
2. Review error logs in console
3. Check API response format
4. Verify file paths and permissions

---

## Next Steps

1. ✅ **Complete**: Backend routes configured
2. ✅ **Complete**: Frontend components ready
3. ✅ **Complete**: Python utilities created
4. **Next**: Update dosha quiz to use enhanced component (optional)
5. **Next**: Integrate image GradCAM into detection pages
6. **Next**: Add GradCAM to other quiz types

---

**Version**: 1.0  
**Last Updated**: March 2026
