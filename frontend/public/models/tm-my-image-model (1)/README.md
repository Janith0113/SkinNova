# Tinea Detection UI

A modern Next.js web application for classifying images as Tinea or Non-Tinea using a Teachable Machine AI model.

## Features

✅ **AI-Powered Classification** - Uses a trained MobileNet model for accurate detection
✅ **Drag & Drop Upload** - Easy image upload with drag and drop support
✅ **Real-time Predictions** - Instant classification with confidence scores
✅ **Responsive Design** - Works on desktop, tablet, and mobile devices
✅ **Beautiful UI** - Modern interface built with Tailwind CSS
✅ **Confidence Visualization** - Visual representation of prediction confidence

## Project Structure

```
tinea-detector/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── styles/
│       └── globals.css      # Global styles
├── components/
│   ├── TiniaDetector.tsx    # Main detector component
│   ├── ImageUploadArea.tsx  # Image upload interface
│   ├── ResultsDisplay.tsx   # Results display component
│   └── LoadingSpinner.tsx   # Loading indicator
├── lib/
│   └── model.ts             # Model loading utilities
├── public/
│   └── model/
│       ├── model.json       # Model architecture
│       ├── metadata.json    # Model metadata
│       └── weights.bin      # Model weights
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── postcss.config.js
```

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup Steps

1. **Clone/Navigate to the project:**
   ```bash
   cd tinea-detector
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Add Model Files:**
   - Copy your Teachable Machine model files to `public/model/`:
     - `model.json`
     - `metadata.json`
     - `weights.bin`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - Navigate to `http://localhost:3000`

## Usage

1. **Upload Image:**
   - Click on the upload area or drag & drop an image
   - Supported formats: PNG, JPG, GIF
   - Image will be displayed in the preview

2. **Analyze:**
   - Click "Analyze Image" button
   - Wait for the AI to process (typically 1-3 seconds)

3. **View Results:**
   - Primary classification result with confidence score
   - Visual confidence bar
   - Detailed predictions for all classes
   - Medical recommendation note

## Model Information

**Model Type:** MobileNet (Teachable Machine)
**Input Size:** 224x224 pixels
**Classes:** 
- Tinea
- Non-Tinea
**Framework:** TensorFlow.js

The model is loaded from the `public/model` directory and runs entirely in the browser using TensorFlow.js.

## Building for Production

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **TensorFlow.js** - ML inference in the browser
- **Teachable Machine** - Model training platform
- **Tailwind CSS** - Utility-first CSS framework

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Important Notes

⚠️ **Medical Disclaimer:** This application is for informational purposes only and should not be used as a substitute for professional medical diagnosis or treatment. Always consult with qualified healthcare professionals for medical concerns.

⚠️ **Model Training:** For best results, ensure your model is trained with:
- Diverse, high-quality training images
- Balanced dataset between Tinea and Non-Tinea
- Proper image preprocessing (crop relevant areas)

## Troubleshooting

### Model Not Loading
- Ensure model files are in `/public/model/`
- Check browser console for error messages
- Verify file names: `model.json`, `metadata.json`, `weights.bin`

### Predictions Not Working
- Ensure image format is supported (PNG, JPG, GIF)
- Check image quality and clarity
- Model requires 224x224 input (automatically resized)

### Performance Issues
- Clear browser cache
- Close unnecessary tabs
- Use modern browser version
- For large images, consider resizing before upload

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
- Netlify
- AWS Amplify
- GitHub Pages
- Traditional Node.js hosting

## API Reference

### TiniaDetector Component

Main component that handles:
- Model initialization
- Image upload
- Prediction generation
- Results display

### ImageUploadArea Component

Props:
- `onImageSelected: (file: File) => void` - Callback when image is selected

### ResultsDisplay Component

Props:
- `predictions: PredictionResult[]` - Array of predictions with labels and probabilities

## Performance Metrics

- Model loading time: ~2-5 seconds (first load)
- Prediction time: ~1-3 seconds per image
- Bundle size: ~4-5MB (including model)

## Contributing

Feel free to fork and submit pull requests for any improvements.

## License

MIT License - Feel free to use this project for personal and commercial purposes.

## Support

For issues or questions, please check:
1. Browser console for error messages
2. Model files are correctly placed in `/public/model/`
3. Dependencies are properly installed

## Version History

- **v1.0.0** - Initial release
  - Core detection functionality
  - Responsive UI
  - Real-time predictions
  - Confidence visualization

---

**Made with ❤️ for medical image classification**
