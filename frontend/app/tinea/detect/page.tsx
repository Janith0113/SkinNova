"use client";

import React, { useState, useRef, useCallback } from "react";
import * as tmImage from "@teachablemachine/image";

interface PredictionResult {
  label: string;
  probability: number;
}

//  LoadingSpinner (from tm-my-image-model (1)/components/LoadingSpinner.tsx) 
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
      </div>
      <p className="text-gray-600 font-medium">Analyzing image...</p>
      <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
    </div>
  );
}

//  ImageUploadArea (from tm-my-image-model (1)/components/ImageUploadArea.tsx) 
function ImageUploadArea({ onImageSelected }: { onImageSelected: (file: File) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onImageSelected(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
        dragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-gray-50 hover:border-blue-400"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
        <div className="text-4xl mb-3"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Click to upload or drag &amp; drop
        </h3>
        <p className="text-gray-600 text-sm">PNG, JPG, GIF up to 10MB</p>
      </div>
    </div>
  );
}

//  ResultsDisplay (from tm-my-image-model (1)/components/ResultsDisplay.tsx) 
function ResultsDisplay({ predictions }: { predictions: PredictionResult[] }) {
  if (!predictions.length) return null;

  const topPrediction = predictions[0];
  const isConfident = topPrediction.probability > 70;
  const isTinea = topPrediction.label.toLowerCase().includes("tinea");

  return (
    <div className="space-y-6">
      {/* Primary Result */}
      <div
        className={`p-6 rounded-lg border-2 ${
          isTinea ? "bg-red-50 border-red-300" : "bg-green-50 border-green-300"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Classification Result</h3>
          {isConfident && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
              High Confidence
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-4xl">{isTinea ? "" : ""}</div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Predicted Class:</p>
            <p className={`text-3xl font-bold ${isTinea ? "text-red-600" : "text-green-600"}`}>
              {topPrediction.label}
            </p>
            <p className="text-lg font-semibold text-gray-700 mt-1">
              Confidence: {topPrediction.probability.toFixed(1)}%
            </p>
          </div>
        </div>
        {/* Confidence Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${isTinea ? "bg-red-500" : "bg-green-500"}`}
              style={{ width: `${topPrediction.probability}%` }}
            />
          </div>
        </div>
      </div>

      {/* All Predictions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Predictions</h3>
        <div className="space-y-3">
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {index + 1}. {prediction.label}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${prediction.probability}%` }}
                  />
                </div>
                <span className="text-lg font-semibold text-gray-900 w-16 text-right">
                  {prediction.probability.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div
        className={`p-4 rounded-lg ${
          isTinea
            ? "bg-red-100 border border-red-300 text-red-800"
            : "bg-blue-100 border border-blue-300 text-blue-800"
        }`}
      >
        <p className="text-sm font-semibold">ℹ Note:</p>
        <p className="text-sm mt-1">
          {isTinea
            ? "This image has been classified as Tinea. Consider consulting with a healthcare professional for medical advice."
            : "This image has been classified as Non-Tinea. No fungal infection detected."}
        </p>
      </div>
    </div>
  );
}

//  Main Page (adapted from tm-my-image-model (1)/components/TiniaDetector.tsx) 
export default function TineaDetectPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const modelRef = useRef<tmImage.CustomMobileNet | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize model  files are served from /models/tm-my-image-model (1)/public/model/
  const initializeModel = useCallback(async () => {
    if (modelLoaded) return;
    try {
      setLoading(true);
      setError(null);
      const modelURL = "/models/tm-my-image-model%20(1)/public/model/model.json";
      const metadataURL = "/models/tm-my-image-model%20(1)/public/model/metadata.json";
      const model = await tmImage.load(modelURL, metadataURL);
      modelRef.current = model;
      setModelLoaded(true);
    } catch (err) {
      setError("Failed to load the model. Ensure model files are in /public/model directory.");
      console.error("Model loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [modelLoaded]);

  // Handle image selection
  const handleImageSelected = useCallback(
    async (file: File) => {
      setError(null);
      setPredictions([]);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        setSelectedImage(imageData);
        if (!modelLoaded) {
          await initializeModel();
        }
      };
      reader.readAsDataURL(file);
    },
    [modelLoaded, initializeModel]
  );

  // Make prediction
  const handlePredict = useCallback(async () => {
    if (!imageRef.current || !modelRef.current) {
      setError("Image or model not ready");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const preds = await modelRef.current.predict(imageRef.current);
      const results = Array.from(preds).map((pred: any, index: number) => {
        const labels = modelRef.current!.getClassLabels();
        return {
          label: labels[index],
          probability: Math.round(pred.probability * 10000) / 100,
        };
      });
      results.sort((a, b) => b.probability - a.probability);
      setPredictions(results);
    } catch (err) {
      setError("Failed to make prediction: " + (err as Error).message);
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear results
  const handleClear = () => {
    setSelectedImage(null);
    setPredictions([]);
    setError(null);
  };

  // Load model on mount
  React.useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4"> Tinea Detector</h1>
          <p className="text-xl text-gray-600 mb-2">AI-Powered Classification System</p>
          <p className="text-gray-500">
            Upload an image to detect Tinea or Non-Tinea conditions
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left Panel - Image Upload */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload Image</h2>

            {!selectedImage ? (
              <ImageUploadArea onImageSelected={handleImageSelected} />
            ) : (
              <div>
                <div className="mb-6">
                  <img
                    ref={imageRef}
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handlePredict}
                    disabled={loading || !modelLoaded}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    {loading ? "Processing..." : "Analyze Image"}
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={loading}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {!modelLoaded && !loading && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded text-yellow-800 text-sm">
                Loading model...
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Results</h2>

            {loading && <LoadingSpinner />}

            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-semibold">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            {predictions.length > 0 && !loading && (
              <ResultsDisplay predictions={predictions} />
            )}

            {!selectedImage && !loading && predictions.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p className="text-center">
                  Upload an image and click &quot;Analyze Image&quot; to see results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Model Status */}
        <div className="text-center text-gray-600 text-sm">
          <p>Model Status: {modelLoaded ? " Ready" : "Loading..."}</p>
        </div>
      </div>
    </div>
  );
}
