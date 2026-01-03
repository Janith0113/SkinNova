'use client';

import { useState, useRef, useEffect } from 'react';
import ImageUploader from '@/components/leprosy/ImageUploader';
import ResultDisplay from '@/components/leprosy/ResultDisplay';
import ModelLoader from '@/components/leprosy/ModelLoader';

interface PredictionResult {
  label: string;
  confidence: number;
}

export default function LeprosyDetection() {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<any>(null);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      setError(null);
      const tmImage = await import('@teachablemachine/image');
      
      const modelURL = '/leprosy/model.json';
      const metadataURL = '/leprosy/metadata.json';

      const model = await tmImage.load(modelURL, metadataURL);
      modelRef.current = model;
      setModelLoaded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load model';
      setError(`Model loading failed: ${errorMessage}`);
      console.error('Model loading error:', err);
    }
  };

  const handleImageSelect = async (imageFile: File | string) => {
    if (!modelRef.current) {
      setError('Model not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let image: HTMLImageElement | HTMLCanvasElement;

      if (typeof imageFile === 'string') {
        // Camera/video capture
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        const video = document.querySelector('video') as HTMLVideoElement;
        if (video) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          image = canvas;
        } else {
          throw new Error('No video element found');
        }
      } else {
        // File upload
        image = new Image();
        image.src = URL.createObjectURL(imageFile);

        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });
      }

      const predictions = await modelRef.current.predict(image);

      let maxPrediction = predictions[0];
      predictions.forEach((pred: any) => {
        if (pred.probability > maxPrediction.probability) {
          maxPrediction = pred;
        }
      });

      setPrediction({
        label: maxPrediction.className,
        confidence: (maxPrediction.probability * 100).toFixed(2) as any,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
      setError(`Scanning failed: ${errorMessage}`);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Leprosy Disease Scanner
          </h1>
          <p className="text-lg text-gray-600">
            Upload or capture an image to scan for leprosy disease identification
          </p>
        </div>

        {/* Model Status */}
        <div className="mb-6">
          <ModelLoader loaded={modelLoaded} />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!prediction ? (
            <ImageUploader
              onImageSelect={handleImageSelect}
              loading={loading}
              disabled={!modelLoaded}
            />
          ) : (
            <>
              <ResultDisplay result={prediction} />
              <div className="mt-6">
                <button
                  onClick={handleReset}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                >
                  Scan Another Image
                </button>
              </div>
            </>
          )}
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
          <p className="font-semibold text-yellow-900 mb-2">⚠️ Medical Disclaimer</p>
          <p className="text-yellow-800 text-sm">
            This AI-powered scanner is designed to assist with preliminary leprosy detection analysis. 
            It is NOT a substitute for professional medical diagnosis. Always consult with a qualified 
            healthcare provider for proper evaluation, diagnosis, and treatment recommendations. 
            Early detection and proper medical care are essential for managing leprosy effectively.
          </p>
        </div>
      </div>
    </main>
  );
}
