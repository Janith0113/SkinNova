#!/usr/bin/env bash

# Tinea Detector - Model File Setup Helper

set -e

echo "🎯 Tinea Detector - Model File Setup"
echo "===================================="
echo ""

MODEL_DIR="./public/model"
MISSING_FILES=false

# Create model directory if it doesn't exist
mkdir -p "$MODEL_DIR"
echo "📁 Model directory: $MODEL_DIR"
echo ""

# Check for required files
echo "🔍 Checking for model files..."
echo ""

if [ -f "$MODEL_DIR/model.json" ]; then
    echo "✅ model.json found"
else
    echo "❌ model.json NOT found"
    MISSING_FILES=true
fi

if [ -f "$MODEL_DIR/metadata.json" ]; then
    echo "✅ metadata.json found"
else
    echo "❌ metadata.json NOT found"
    MISSING_FILES=true
fi

if [ -f "$MODEL_DIR/weights.bin" ]; then
    SIZE=$(du -h "$MODEL_DIR/weights.bin" | cut -f1)
    echo "✅ weights.bin found ($SIZE)"
else
    echo "❌ weights.bin NOT found"
    MISSING_FILES=true
fi

echo ""

if [ "$MISSING_FILES" = true ]; then
    echo "⚠️  Missing files detected!"
    echo ""
    echo "To get your model files:"
    echo "1. Go to: https://teachablemachine.withgoogle.com/"
    echo "2. Open your 'tm-my-image-model' project"
    echo "3. Click 'Export Model'"
    echo "4. Select 'TensorFlow.js' option"
    echo "5. Click 'Download my model'"
    echo "6. Extract the download and copy all files to: $MODEL_DIR"
    echo ""
    echo "Files you need to copy:"
    echo "  - model.json"
    echo "  - metadata.json"
    echo "  - weights.bin"
else
    echo "✨ All model files found!"
    echo "You're ready to run: npm run dev"
fi

echo ""
