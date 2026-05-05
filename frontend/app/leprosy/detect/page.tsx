'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/leprosy/ImageUploader';
import ResultDisplay from '@/components/leprosy/ResultDisplay';
import ModelLoader from '@/components/leprosy/ModelLoader';

interface PredictionResult {
  label: string;
  confidence: number;
}

// Apply temperature scaling to make confidence scores more realistic
function applyTemperatureScaling(probability: number, temperature: number = 1.5): number {
  // probability should be between 0 and 1
  if (probability <= 0) {
    return probability;
  }

  // Special handling for extreme confidences (0.95-1.0)
  // Map them to realistic ranges (90-98%)
  if (probability >= 0.95) {
    // Linear interpolation from 0.95 -> 0.90 and 1.0 -> 0.98
    return 0.90 + (probability - 0.95) * 1.6;
  }

  // For probabilities < 0.95, apply temperature scaling
  // p_scaled = p^(1/T)
  const scaled = Math.pow(probability, 1.0 / temperature);
  
  return scaled;
}

export default function LeprosyDetection() {
  const router = useRouter();
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingReport, setSavingReport] = useState(false);
  const [lastImageFile, setLastImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showingPreview, setShowingPreview] = useState(false);
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

    // For file uploads, show preview immediately for at least 2 seconds
    let objectUrl: string | null = null;
    if (typeof imageFile !== 'string') {
      objectUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objectUrl);
      setShowingPreview(true);
      setLastImageFile(imageFile);
    }

    const minDisplayTime = new Promise<void>((resolve) => setTimeout(resolve, 2000));

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
        image = new Image();
        image.src = objectUrl!;

        await new Promise((resolve, reject) => {
          (image as HTMLImageElement).onload = resolve;
          (image as HTMLImageElement).onerror = reject;
        });
      }

      const predictions = await modelRef.current.predict(image);

      let maxPrediction = predictions[0];
      predictions.forEach((pred: any) => {
        if (pred.probability > maxPrediction.probability) {
          maxPrediction = pred;
        }
      });

      // Apply temperature scaling to make confidence more realistic
      const scaledProbability = applyTemperatureScaling(maxPrediction.probability, 1.5);
      const confidencePercentage = Number((scaledProbability * 100).toFixed(2));

      const result: PredictionResult = {
        label: maxPrediction.className,
        confidence: confidencePercentage,
      };

      // Ensure the preview is shown for at least 2 seconds
      await minDisplayTime;

      setPrediction(result);
    } catch (err) {
      await minDisplayTime;
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
      setError(`Scanning failed: ${errorMessage}`);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
      setShowingPreview(false);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setError(null);
    setLastImageFile(null);
    setPreviewUrl(null);
    setShowingPreview(false);
  };

  const saveScanResult = async () => {
    console.log('=== Save scan result called ===');
    console.log('Prediction:', prediction);
    console.log('Last image file:', lastImageFile);

    if (!prediction) {
      console.log('ERROR: No prediction available');
      setError('No prediction available. Please scan an image first.');
      return;
    }

    if (!lastImageFile) {
      console.log('ERROR: No image file available');
      setError('No image file available. Please scan an image again.');
      return;
    }

    console.log('Starting save process...');
    setSavingReport(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('Token exists:', !!token);
      console.log('User exists:', !!user);

      if (!token || !user) {
        console.log('ERROR: No authentication');
        setError('Authentication required. Redirecting to login...');
        setSavingReport(false);
        setTimeout(() => {
          router.push('/login');
        }, 1000);
        return;
      }

      const userData = JSON.parse(user);
      const formData = new FormData();
      
      // Convert confidence to 0-1 range if it's a percentage string
      const confidenceValue = typeof prediction.confidence === 'string' 
        ? parseFloat(prediction.confidence) / 100 
        : prediction.confidence / 100;

      console.log('Confidence value:', confidenceValue);
      console.log('Prediction confidence:', prediction.confidence);
      console.log('Prediction label:', prediction.label);
      
      // Add scan details
      formData.append('reportName', `Leprosy Scan - ${new Date().toLocaleDateString()}`);
      formData.append('reportType', 'Leprosy Scan');
      formData.append('diseaseType', 'leprosy');
      formData.append('skinCondition', prediction.label);
      formData.append('confidence', confidenceValue.toString());
      formData.append('scanStatus', prediction.label === 'Leprosy Skin' ? 'Monitor' : 'Stable');
      formData.append('description', `Leprosy detection scan with ${prediction.confidence}% confidence`);
      formData.append('file', lastImageFile);

      console.log('Sending request to save scan...');

      const response = await fetch('http://localhost:4000/api/analysis/new-detection', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.message || `Failed to save scan result (${response.status})`;
        console.log('ERROR Response:', errorMsg);
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log('Save result:', result);
      
      if (result.success) {
        console.log('SUCCESS: Scan saved successfully');
        setError(null);
        // Navigate to dashboard after successful save
        console.log('Navigating to dashboard...');
        setTimeout(() => {
          router.push('/patient/dashboard');
        }, 500);
      } else {
        const errMsg = result.message || 'Server returned unsuccessful response';
        console.log('ERROR:', errMsg);
        throw new Error(errMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save scan';
      console.error('=== Save scan error ===', err);
      setError(errorMessage);
    } finally {
      setSavingReport(false);
    }
  };


  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto pt-28 px-4 sm:px-6 lg:px-8 pb-24">
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
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-red-800 font-bold text-lg mb-2">Error</p>
              <p className="text-red-700 text-base">{error}</p>
            </div>
          )}

          {showingPreview && previewUrl ? (
            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Uploaded image"
                  className="w-full h-auto max-h-96 object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                    <p className="text-white font-semibold text-lg">Analyzing image...</p>
                    <p className="text-gray-300 text-sm mt-1">Please wait</p>
                  </div>
                </div>
              </div>
            </div>
          ) : !prediction ? (
            <ImageUploader
              onImageSelect={handleImageSelect}
              loading={loading}
              disabled={!modelLoaded}
            />
          ) : (
            <>
              <ResultDisplay result={prediction} />
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    console.log('DEBUG: Button clicked!');
                    saveScanResult();
                  }}
                  disabled={savingReport}
                  type="button"
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  {savingReport ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      ✓ Save & Go to Dashboard
                    </>
                  )}
                </button>
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
