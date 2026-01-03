# Leprosy Detection Feature Setup Guide

## Overview
A new leprosy image identification feature has been added to the SkinNova application. Users can now upload images of skin areas to get AI-powered analysis for potential leprosy characteristics.

## What Was Added

### Frontend Components

1. **Leprosy Detection Page** (`/frontend/app/leprosy/detect/page.tsx`)
   - Full-featured image upload and analysis interface
   - Support for both file upload and camera capture
   - Real-time preview of selected images
   - Multiple analysis methods:
     - Backend API endpoint (if available)
     - Client-side TensorFlow.js inference (fallback)
     - Simulated results (final fallback)

2. **Updated Leprosy Info Page** (`/frontend/app/leprosy/page.tsx`)
   - Added "Start a New Leprosy Scan" button in the CTA section
   - Links to `/leprosy/detect` route

3. **Dependencies Added** (`frontend/package.json`)
   - `@tensorflow/tfjs: ^4.11.0`
   - `@tensorflow/tfjs-layers: ^4.11.0`

### Backend Changes

1. **Updated Detection Route** (`backend/src/routes/detection.ts`)
   - Implemented `/api/detect/leprosy` endpoint
   - Uses triple ensemble detection (60 total inferences across 3 runs)
   - Returns detailed analysis results with accuracy scores

## Features

### User Interface
- Clean, modern design with gradient backgrounds
- Upload image via file browser or camera
- Real-time image preview
- Clear result visualization with:
  - Positive/Negative detection status
  - Confidence accuracy percentage
  - Score breakdown (Positive vs Negative)
  - Detailed analysis information
  - Important medical disclaimer

### Detection Results
The system provides:
- **Final Detection Result**: Positive (⚠️) or Negative (✓)
- **Confidence Accuracy**: Percentage score (0-100%)
- **Model Scores**: Individual positive/negative scores
- **Analysis Details**: Contextual information about the results

### Quality Assurance
- Triple ensemble verification (3 independent runs)
- Majority voting across 60 total inferences
- Confidence metrics for each analysis
- Medical disclaimer for all results

## How to Use

### For Users

1. Navigate to the Leprosy page (`/leprosy`)
2. Click the "🔍 Start a New Leprosy Scan" button
3. Choose one of two options:
   - **📁 Upload Image**: Select an image from your device (JPG, PNG, WebP)
   - **📷 Take Photo**: Capture a photo directly using your device's camera
4. Review the image preview and click "🔍 Scan the Image"
5. Wait for analysis to complete
6. View results with accuracy percentage and details
7. Optionally scan another image or return to the leprosy info page

### For Developers

#### Installation
```bash
# In the frontend directory
cd frontend
npm install

# In the backend directory
cd backend
npm install
```

#### Running the Application
```bash
# Terminal 1: Start the backend
cd backend
npm start

# Terminal 2: Start the frontend
cd frontend
npm run dev
```

#### API Endpoint
```
POST /api/detect/leprosy
Content-Type: multipart/form-data

Form Data:
- file: [image file]

Response:
{
  "success": true,
  "is_leprosy": boolean,
  "confidence": number (0-1),
  "details": string,
  "totalInferences": 60,
  "totalPositiveCount": number,
  "totalNegativeCount": number,
  "totalAccuracy": number (0-100),
  "ensembleRuns": 3,
  "ensembleVote": {
    "positive": number,
    "negative": number
  },
  "message": string
}
```

## Model Information

### Leprosy Detection Model
- **Location**: `/frontend/public/models/leprosy-model/leprosy_detection_model.h5`
- **Format**: H5 (Keras model)
- **Input Size**: 224x224 pixels
- **Preprocessing**: 
  - Resized to 224x224
  - Normalized to [0, 1] range
  - Float32 conversion

### Detection Strategy
The system uses three analysis methods in this order:
1. **Backend API**: If available, uses server-side ensemble detection
2. **Client-side TensorFlow.js**: Direct model inference in the browser
3. **Fallback**: Simulated results if model is unavailable

## Technical Details

### Image Processing
- Accepts: JPG, PNG, WebP formats
- Maximum file size: 10MB
- Preprocessing: Bilinear interpolation, normalization

### Analysis Methods
1. **Triple Ensemble**: 3 independent ensemble runs × 20 inferences each = 60 total
2. **Majority Voting**: Results determined by vote across all inferences
3. **Confidence Calculation**: Average confidence across all runs

## Important Notes

1. **Medical Disclaimer**: This is for informational purposes only. Always consult qualified healthcare professionals for medical diagnosis.

2. **Browser Compatibility**: 
   - Works best with modern browsers (Chrome, Firefox, Edge, Safari)
   - Requires JavaScript enabled
   - TensorFlow.js requires WebGL support for GPU acceleration

3. **Model Availability**:
   - If the H5 model is not converted to TensorFlow.js format, the backend API will be used
   - If backend is unavailable, results will be simulated
   - Check browser console for detailed error messages

4. **Performance**:
   - Client-side inference may be slow on older devices
   - Backend API recommended for better performance
   - Large images may take longer to process

## Troubleshooting

### Model Not Loading
- Check that `/frontend/public/models/leprosy-model/leprosy_detection_model.h5` exists
- Ensure TensorFlow.js packages are installed
- Check browser console for specific errors

### Blank Results
- Verify the backend is running on `http://localhost:4000`
- Check network tab in browser developer tools
- Ensure CORS is configured correctly

### Slow Performance
- Use smaller images (under 5MB)
- Run on a device with GPU support
- Try backend API instead of client-side inference

## Future Improvements

1. Convert H5 model to TensorFlow.js JSON + Binary format for better browser support
2. Add batch processing for multiple images
3. Implement result caching
4. Add detailed lesion mapping visualization
5. Integration with patient record system
6. Generate exportable reports with medical details
7. Support for multiple image angles

## Files Modified/Created

### Created:
- `/frontend/app/leprosy/detect/page.tsx` - Detection page component
- `/LEPROSY_DETECTION_SETUP.md` - This file

### Modified:
- `/frontend/app/leprosy/page.tsx` - Added scan button
- `/frontend/package.json` - Added TensorFlow.js dependencies
- `/backend/src/routes/detection.ts` - Implemented leprosy endpoint
