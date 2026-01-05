# Tinea Classifier UI

A professional Next.js + Tailwind CSS web application for AI-powered tinea (fungal infection) detection using your Teachable Machine image classifier model.

## Features

- 🖼️ **Image Upload**: Drag-and-drop or click to upload images
- 🤖 **Real-time Predictions**: Instant AI analysis using TensorFlow.js
- 📊 **Detailed Results**: View confidence scores and classification probabilities
- 🎨 **Modern UI**: Built with Tailwind CSS for a professional look
- ⚡ **Fast Performance**: Client-side inference with no backend required
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Setup Instructions

### 1. Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### 2. Install Dependencies
```bash
npm install
```

### 3. Copy Model Files
Copy your Teachable Machine model files to the public folder:
```
public/
└── model/
    ├── model.json
    └── metadata.json
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── ImageUploader.tsx # Image upload component
│   └── ResultCard.tsx    # Results display component
└── lib/
    ├── modelConfig.ts    # Model configuration
    └── modelLoader.ts    # TensorFlow.js model loading
```

## How to Use

1. **Upload Image**: Click the upload area or drag-and-drop an image
2. **View Results**: The AI automatically analyzes and displays:
   - Classification result (Tinea or Non-Tinea)
   - Confidence percentage
   - Detailed probability breakdown
3. **Upload Another**: Click the preview to upload a different image

## Configuration

Edit `src/lib/modelConfig.ts` to customize:
- Model file paths
- Input image size
- Model labels
- Other parameters

## Building for Production

```bash
npm run build
npm start
```

## Technologies Used

- **Next.js 14**: React framework for production
- **Tailwind CSS**: Utility-first CSS framework
- **TensorFlow.js**: Client-side machine learning
- **Teachable Machine**: Pre-trained image model
- **TypeScript**: Type-safe JavaScript

## Important Notice

This application is designed for educational and demonstration purposes. For medical diagnosis and treatment, always consult with a qualified healthcare professional.

## License

MIT
