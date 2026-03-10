#!/usr/bin/env bash
set -e

# Tinea Detector - Build and Run Script

echo "🔧 Building Tinea Detector Docker Image..."
docker build -t tinea-detector:latest .

echo "✅ Build complete!"
echo ""
echo "To run the container:"
echo "  docker run -p 3000:3000 tinea-detector:latest"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose up -d"
echo ""
echo "The application will be available at http://localhost:3000"
