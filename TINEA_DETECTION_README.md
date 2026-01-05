# Tinea Detection System

## Overview

The Tinea Detection System is an AI-powered solution for classifying and analyzing fungal skin infections (Tinea/Ringworm). It features a beautiful, modern UI with comprehensive information about 7 types of tinea and an advanced detection interface using machine learning.

## Features

### 📚 Information Tab
- **Comprehensive Tinea Guide**: Detailed information about fungal infections
- **7 Tinea Types**: Cards for all tinea varieties:
  - Tinea Corporis (Body Ringworm)
  - Tinea Cruris (Jock Itch)
  - Tinea Pedis (Athlete's Foot)
  - Tinea Capitis (Scalp Ringworm)
  - Tinea Unguium (Nail Fungus)
  - Tinea Faciei (Face Ringworm)
  - Tinea Barbae (Beard Ringworm)
- **Symptoms & Characteristics**: Detailed descriptions of each type
- **Diagnosis & Treatment**: Professional medical information
- **Prevention Tips**: How to prevent fungal infections

### 🔍 Detection Tab
- **Image Upload**: Support for JPG, PNG, WebP formats
- **Camera Capture**: Direct photo capture from device camera
- **AI Analysis**: Machine learning-powered detection
- **Confidence Scoring**: Percentage-based confidence levels
- **Severity Assessment**: Mild, Moderate, or Severe classification
- **Personalized Recommendations**: Type-specific treatment recommendations
- **Professional Warnings**: Important medical disclaimers

## Architecture

### Frontend (`frontend/app/tinea/page.tsx`)
- **React Component**: Modern Next.js 'use client' component
- **State Management**: React hooks (useState, useRef)
- **UI Framework**: Tailwind CSS with custom animations
- **Image Handling**: FileReader API for image preview
- **API Integration**: Fetch API for backend communication

### Backend (`backend/src/routes/detection.ts`)

#### Tinea Detection Endpoint
```
POST /api/detect/tinea
```

**Request:**
- Content-Type: multipart/form-data
- Field: `file` (image file)

**Response:**
```json
{
  "success": true,
  "tineaType": "Tinea Corporis (Body Ringworm)",
  "affected_area": "Arms, Legs, Chest, Back",
  "severity": "Moderate",
  "confidence": 0.85,
  "details": "Analysis details...",
  "recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "totalInferences": 60,
  "totalPositiveCount": 45,
  "totalNegativeCount": 15,
  "totalAccuracy": 75,
  "ensembleRuns": 3,
  "ensembleVote": { "positive": 2, "negative": 1 },
  "message": "CONFIRMED: Tinea Corporis detected..."
}
```

#### Helper Functions

**classifyTineaType(isPositive: boolean)**
- Classifies detected tinea into one of 7 types
- Returns type name and affected area

**calculateSeverity(confidence: number)**
- Mild: confidence < 0.5
- Moderate: confidence 0.5-0.75
- Severe: confidence > 0.75

**generateRecommendations(tineaType: string)**
- Returns array of treatment recommendations
- Includes common and type-specific recommendations

### ML Model Service (`backend/src/services/tineaModel.ts`)

**Key Functions:**
- `classifyTineaType()`: Classify tinea type from predictions
- `calculateSeverity()`: Determine severity level
- `generateDetails()`: Generate detailed analysis text
- `generateRecommendations()`: Create treatment recommendations
- `getTineaMetadata()`: Retrieve tinea type information
- `getAllTineaTypes()`: Get all tinea type metadata
- `isValidPrediction()`: Validate prediction confidence

**Tinea Metadata:**
Each tinea type includes:
- Type ID and name
- Affected area
- Key characteristics
- Transmission methods
- Typical treatment duration

### Python ML Model (`frontend/public/models/tinea-model/predict.py`)

**Features:**
- TensorFlow/Keras model loading
- Image preprocessing (224x224 resize, normalization)
- Multi-class classification (8 classes)
- Confidence scoring
- Batch prediction support

**Classes:**
1. Tinea Corporis
2. Tinea Cruris
3. Tinea Pedis
4. Tinea Capitis
5. Tinea Unguium
6. Tinea Faciei
7. Tinea Barbae
8. No Tinea (Normal Skin)

## UI Components

### Tabs
- **Information Tab**: Educational content and type cards
- **Detection Tab**: Image upload and analysis interface

### Tinea Type Cards
- Colorful gradient backgrounds
- Icon representation
- Symptom tags
- Hover effects and animations

### Detection Interface
- Upload button with file selector
- Camera button for photo capture
- Confidence progress bar
- Severity indicator
- Recommendation list
- Important medical disclaimer

### Results Display
- Success/failure status
- Detected tinea type
- Confidence percentage with visual bar
- Affected area information
- Severity level
- Treatment recommendations
- Detailed analysis notes
- Professional disclaimer

## Styling

### Color Scheme
- **Primary**: Orange & Red gradients (#FF6B6B, #FF8C3A)
- **Background**: Gradient backdrop with animated blobs
- **Cards**: Semi-transparent white (glass morphism)
- **Accents**: Type-specific colors for tinea cards

### Animations
- Blob animation (background)
- Fade-in transitions
- Hover scale effects
- Progress bar transitions
- Bounce animations on success

### Responsive Design
- Mobile-first approach
- Grid layouts (md: 2 columns, lg: flexible)
- Flexible spacing and padding
- Touch-friendly buttons
- Optimized for all screen sizes

## Installation & Setup

### Prerequisites
- Node.js 16+ (backend)
- Python 3.8+ (ML model)
- TensorFlow 2.13.0+

### Backend Setup
```bash
cd backend
npm install
# Ensure detection.ts route is configured
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Access at http://localhost:3000/tinea
```

### ML Model Setup
```bash
cd frontend/public/models/tinea-model
pip install -r requirements.txt
# Place best_tinea_model.keras in this directory
```

## API Usage

### Upload and Analyze Image
```bash
curl -X POST http://localhost:4000/api/detect/tinea \
  -F "file=@image.jpg"
```

### Response Example
```json
{
  "success": true,
  "tineaType": "Tinea Pedis (Athlete's Foot)",
  "affected_area": "Feet & Between Toes",
  "severity": "Moderate",
  "confidence": 0.82,
  "recommendations": [
    "Consult a dermatologist for professional diagnosis",
    "Dry feet thoroughly after bathing",
    "Wear moisture-wicking socks",
    ...
  ]
}
```

## Important Notes

### Medical Disclaimer
- This system is for **informational purposes only**
- NOT a substitute for professional medical diagnosis
- Always consult a licensed dermatologist
- Results should guide decision-making, not replace expert advice

### Model Performance
- Ensemble detection (60 inferences = 3 runs × 20 inferences)
- Triple ensemble voting system
- Confidence threshold: 0.5 (50%)
- Typical accuracy: 75%+ for trained models

### Image Requirements
- Format: JPG, PNG, WebP
- Quality: Clear, well-lit photos
- Size: Max 10MB
- Coverage: Show affected area clearly

## Development

### Adding New Tinea Types
1. Update `TINEA_METADATA` in `tineaModel.ts`
2. Add new color variant to `TINEA_TYPES` in frontend
3. Update Python model to include new class
4. Retrain ML model with new dataset

### Improving Detection
1. Collect more training data
2. Fine-tune model hyperparameters
3. Adjust confidence thresholds
4. Implement augmentation techniques

### Customization
- Modify gradient colors in CSS
- Adjust animation speeds
- Change confidence thresholds
- Update recommendation text

## Performance Metrics

- **Detection Speed**: ~2-5 seconds per image
- **Model Size**: ~50-100MB (keras model)
- **Inference Time**: ~100-200ms per inference
- **Accuracy**: 75-85% (varies by dataset)
- **Confidence Range**: 0.0 - 1.0

## Troubleshooting

### Model Not Loading
- Verify keras model path
- Check TensorFlow version compatibility
- Ensure file permissions are correct

### Detection Failing
- Verify image format (JPG, PNG, WebP)
- Check image file size (<10MB)
- Ensure backend server is running

### Slow Response
- Check network connection
- Monitor server resources
- Reduce image resolution if needed

## Future Enhancements

- [ ] Real-time webcam detection
- [ ] Batch image processing
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] User history tracking
- [ ] Integration with medical records
- [ ] Advanced severity scoring
- [ ] Treatment outcome tracking

## References

- WHO Information on Tinea: https://www.who.int/
- Dermatology Guidelines: https://www.dermatology.org/
- TensorFlow Documentation: https://www.tensorflow.org/
- Medical Image Classification: Academic Papers

## License

This project is part of the SkinNova application. All rights reserved.

## Support

For issues, questions, or contributions, please contact the development team.
