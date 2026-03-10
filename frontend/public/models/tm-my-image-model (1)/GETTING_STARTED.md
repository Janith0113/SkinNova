# Tinea Detector - Complete Installation & Usage Guide

## 📋 Prerequisites

- **Node.js**: Version 18 or higher
- **npm** or **yarn**: Package manager
- Your Teachable Machine model files:
  - `model.json`
  - `metadata.json`
  - `weights.bin`

## 🚀 Installation Steps

### Step 1: Install Dependencies
Open terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- Next.js 14 (React framework)
- React 18
- TensorFlow.js (ML library)
- Teachable Machine JS
- Tailwind CSS

### Step 2: Prepare Model Files

Your model files are currently in the workspace root. Follow these steps:

1. **Copy JSON files to public/model/:

From workspace root copy to `public/model/`:
- `metadata.json` ➜ `public/model/metadata.json`
- `model.json` ➜ `public/model/model.json`

2. **Add weights.bin:**

If you haven't downloaded the weights yet:
- Go to https://teachablemachine.withgoogle.com/
- Find your project "tm-my-image-model"
- Click Export → TensorFlow.js → Download
- Extract the zip file and copy `weights.bin` to `public/model/`

Your file structure should look like:
```
public/
└── model/
    ├── model.json
    ├── metadata.json
    └── weights.bin
```

### Step 3: Start Development Server

```bash
npm run dev
```

The app will start on **http://localhost:3000**

## 🎯 Using the Application

1. **Open the web interface** → http://localhost:3000

2. **Upload an image:**
   - Click the upload area or drag & drop
   - Supported formats: PNG, JPG, GIF

3. **Analyze:**
   - Click "Analyze Image" button
   - Wait for AI processing (1-3 seconds)

4. **View Results:**
   - Main classification (Tinea/Non-Tinea)
   - Confidence score (0-100%)
   - Visual bars for all predictions
   - Medical recommendation

## 📦 Build for Production

```bash
# Build optimized version
npm run build

# Start production server
npm start
```

The optimized build will be ready for deployment.

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify
1. Connect your GitHub repo to Netlify
2. Netlify auto-detects Next.js configuration
3. Deploy with one click

### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 4: Traditional Server
- Push code to server
- Run `npm install && npm run build`
- Use PM2 or similar for process management

## 📁 Project Structure

```
tinea-detector/
├── app/
│   ├── api/
│   │   └── health/route.ts         # Health check endpoint
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home page
│   └── styles/
│       └── globals.css
├── components/
│   ├── TiniaDetector.tsx           # Main component
│   ├── ImageUploadArea.tsx         # Upload interface
│   ├── ResultsDisplay.tsx          # Results UI
│   └── LoadingSpinner.tsx          # Loading state
├── lib/
│   └── model.ts                    # Model utilities
├── public/
│   └── model/                      # Model files go here!
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── .env.example
├── README.md
└── SETUP.md
```

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` and update if needed:

```bash
# .env.local
NEXT_PUBLIC_APP_NAME="Tinea Detector"
NEXT_PUBLIC_MODEL_URL="/model/model.json"
NEXT_PUBLIC_METADATA_URL="/model/metadata.json"
```

## 🐛 Troubleshooting

### Model Files Not Found
- ✓ Check files are in `public/model/`
- ✓ Verify exact file names (case-sensitive on Linux/Mac)
- ✓ Check browser console (F12 > Console) for errors

### Application won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port 3000 Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

### No predictions appearing
- ✓ Ensure image is clear and relevant
- ✓ Check browser console for JavaScript errors
- ✓ Try refreshing the page
- ✓ Clear browser cache

## 📱 Features

### Frontend Features
- ✅ Drag & drop image upload
- ✅ Real-time image preview
- ✅ AI-powered classification
- ✅ Confidence visualization
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading indicators
- ✅ Error handling
- ✅ Beautiful dark/light UI

### Technical Features
- ✅ Client-side model inference (no server needed)
- ✅ TensorFlow.js for fast predictions
- ✅ TypeScript for type safety
- ✅ Next.js 14 with App Router
- ✅ Tailwind CSS for styling
- ✅ Automatic image resizing

## ⚙️ Available Commands

```bash
# Development
npm run dev                 # Start dev server with hot-reload

# Production
npm run build              # Create optimized build
npm start                  # Start production server

# Quality
npm run lint              # Run ESLint
npm run type-check        # TypeScript checking

# Cleanup
rm -rf node_modules       # Remove dependencies
npm cache clean --force   # Clear npm cache
```

## 🔒 Security Notes

- Model inference runs entirely on the client (browser)
- No images are sent to external servers
- All processing happens locally on user's device
- Model files are publicly accessible in `/public/model/`
- Consider CORS headers for production deployment

## 📊 Performance

- **Model Loading**: ~2-5 seconds (first load, then cached)
- **Prediction Time**: ~1-3 seconds per image
- **Bundle Size**: ~4-5 MB (including TensorFlow.js)
- **Supported Image Size**: Automatically resized to 224x224

## ⚠️ Medical Disclaimer

**This application is for informational and educational purposes only.**

This is NOT a medical device and should NOT be used for:
- Professional medical diagnosis
- Clinical decision-making
- Patient treatment planning

**Always consult qualified healthcare professionals** for medical concerns.

## 💡 Tips for Best Results

1. **Image Quality**
   - Use clear, well-lit images
   - Focus on the affected area
   - Avoid blurry or partial images

2. **Model Training**
   - Train model with diverse images
   - Use balanced datasets
   - Include variations in lighting and angles

3. **Confidence Scores**
   - Scores above 80% are generally very confident
   - Scores 50-80% need verification
   - Scores below 50% are uncertain

## 📞 Support & Troubleshooting

### Getting Help
1. Check console errors (F12)
2. Review README.md for common solutions
3. Check SETUP.md for setup issues
4. Review code comments in components

### Reporting Issues
- Check browser console for error messages
- Verify model files are correctly placed
- Try with different image
- Clear browser cache and reload

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TensorFlow.js Guide](https://www.tensorflow.org/js)
- [Teachable Machine](https://teachablemachine.withgoogle.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 License

MIT License - Free for personal and commercial use

## 🚀 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Copy model files to `public/model/`
3. ✅ Start server: `npm run dev`
4. ✅ Open http://localhost:3000
5. ✅ Upload image and test!

---

**Ready to detect Tinea? Let's go! 🎯**
