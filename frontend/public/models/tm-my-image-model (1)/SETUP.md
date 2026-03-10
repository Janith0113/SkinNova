# Setup Instructions for Tinea Detector

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Copy Model Files
Copy your Teachable Machine model files to `public/model/`:
- `model.json`
- `metadata.json`  
- `weights.bin`

Your current files are here:
- metadata.json (already in workspace root)
- model.json (already in workspace root)

### Files to Move/Copy

From the workspace root directory, you need to move:
```
metadata.json  →  public/model/metadata.json
model.json     →  public/model/model.json
weights.bin    →  public/model/weights.bin (You'll need to extract this from the downloaded model)
```

### 3. Download Weights File

The `weights.bin` file should be in your downloaded Teachable Machine model. If you haven't downloaded the model yet:

1. Go to https://teachablemachine.withgoogle.com/
2. Find your "tm-my-image-model" project
3. Click "Export Model"
4. Select "TensorFlow.js"
5. Click "Download my model"
6. Extract the downloaded zip file
7. Copy `weights.bin` to `public/model/`

### 4. Run Development Server
```bash
npm run dev
```

Then open: http://localhost:3000

## Troubleshooting

### Model files not loading?
1. Verify files are in: `public/model/`
2. Check file names exactly match:
   - `model.json` (not modelData.json, etc.)
   - `metadata.json`
   - `weights.bin`
3. Check browser console (F12 > Console tab) for errors

### No predictions showing?
1. Ensure model files loaded successfully
2. Try uploading a different image
3. Check browser console for error messages

## Build for Production
```bash
npm run build
npm start
```

## Project Structure
```
tinea-detector/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Main home page
│   └── styles/
│       └── globals.css          # Tailwind CSS global styles
├── components/
│   ├── TiniaDetector.tsx       # Main detector component
│   ├── ImageUploadArea.tsx     # Upload UI component
│   ├── ResultsDisplay.tsx      # Results visualization
│   └── LoadingSpinner.tsx      # Loading indicator
├── lib/
│   └── model.ts                # Model utilities
├── public/
│   └── model/                  # Model files (put model here!)
└── package.json
```

## Features Included

✓ Image upload with drag & drop
✓ Real-time AI classification
✓ Confidence visualization  
✓ Mobile responsive design
✓ Beautiful Tailwind UI
✓ TensorFlow.js integration
✓ TypeScript support

Good to go! 🚀
