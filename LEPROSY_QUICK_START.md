# Leprosy Detection - Quick Start Guide

## 🎯 One-Minute Setup

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start the Application
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend  
cd frontend
npm run dev
```

### Step 3: Use the Feature
1. Open `http://localhost:3000/leprosy`
2. Click **"🔍 Start a New Leprosy Scan"**
3. Upload an image
4. Click **"🔍 Scan the Image"**
5. View results with accuracy percentage

## 📸 Features

- ✅ Upload image or use camera
- ✅ AI analysis of skin images
- ✅ Positive/Negative detection
- ✅ Confidence accuracy percentage
- ✅ Detailed analysis information

## 🎨 User Interface

### Upload Page
- Clean, modern design
- Two options: Upload file or capture photo
- Real-time image preview
- Tips for best results

### Results Page
- Large detection result (Positive ⚠️ or Negative ✓)
- Confidence accuracy bar (0-100%)
- Model scores breakdown
- Detailed analysis information
- Medical disclaimer

## 🔗 Routes

| Route | Purpose |
|-------|---------|
| `/leprosy` | Main leprosy information page |
| `/leprosy/detect` | Image upload and analysis page |
| `POST /api/detect/leprosy` | Backend detection endpoint |

## 📝 File Locations

| File | Purpose |
|------|---------|
| `/frontend/app/leprosy/detect/page.tsx` | Detection UI component |
| `/frontend/app/leprosy/page.tsx` | Main leprosy info (updated) |
| `/backend/src/routes/detection.ts` | Backend API endpoint |
| `/frontend/public/models/leprosy-model/leprosy_detection_model.h5` | AI model |

## ⚡ API Usage

### Request
```bash
curl -X POST http://localhost:4000/api/detect/leprosy \
  -F "file=@image.jpg"
```

### Response
```json
{
  "success": true,
  "is_leprosy": false,
  "confidence": 0.85,
  "accuracy": "85%",
  "message": "CONFIRMED NEGATIVE: No leprosy characteristics detected..."
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Model not loading | Ensure `/public/models/leprosy-model/leprosy_detection_model.h5` exists |
| Backend not responding | Check backend running on `localhost:4000` |
| Slow analysis | Use smaller images (< 5MB) |
| No results | Check browser console for errors |

## ✅ What's Working

- ✅ Image upload via file browser
- ✅ Image capture via camera
- ✅ Real-time preview
- ✅ Backend analysis
- ✅ Results display with accuracy
- ✅ Error handling
- ✅ Medical disclaimer
- ✅ Navigation back to info page

## 📱 Supported Formats

- JPG
- PNG
- WebP
- Maximum 10MB

## 🎓 Learn More

See detailed documentation in:
- [LEPROSY_DETECTION_SETUP.md](./LEPROSY_DETECTION_SETUP.md) - Full setup guide
- [LEPROSY_IMPLEMENTATION_COMPLETE.md](./LEPROSY_IMPLEMENTATION_COMPLETE.md) - Implementation details

---

**Ready to use!** Start by running the application and navigating to the leprosy page.
