#!/usr/bin/env bash

# Tinea Detector - Quick Setup Script for Windows/Mac/Linux

set -e

echo "🚀 Tinea Detector - Quick Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION found"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "⚠️  Before running the app, please:"
echo "1. Copy your model files to public/model/:"
echo "   - metadata.json"
echo "   - model.json"
echo "   - weights.bin"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "✨ Setup complete! Happy detecting! 🎯"
