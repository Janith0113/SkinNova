"use client";

import React, { useState, useRef, useCallback } from "react";
import * as tmImage from "@teachablemachine/image";
import * as tf from "@tensorflow/tfjs";
import ImageUploadArea from "./ImageUploadArea";
import ResultsDisplay from "./ResultsDisplay";
import LoadingSpinner from "./LoadingSpinner";

interface PredictionResult {
  label: string;
  probability: number;
}

export default function TiniaDetector() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const modelRef = useRef<tmImage.CustomMobileNet | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize model
  const initializeModel = useCallback(async () => {
    if (modelLoaded) return;

    try {
      setLoading(true);
      setError(null);

      // Load the model and metadata from public folder
      const modelURL = "/model/model.json";
      const metadataURL = "/model/metadata.json";

      const model = await tmImage.load(modelURL, metadataURL);
      modelRef.current = model;
      setModelLoaded(true);
    } catch (err) {
      setError(
        "Failed to load the model. Ensure model files are in /public/model directory."
      );
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

        // Initialize model if not already done
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

      // Make predictions
      const predictions = await modelRef.current.predict(imageRef.current);

      // Convert to array and format results
      const results = Array.from(predictions).map((pred: any, index: number) => {
        const labels = modelRef.current!.getClassLabels();
        return {
          label: labels[index],
          probability: Math.round(pred.probability * 10000) / 100, // Convert to percentage
        };
      });

      // Sort by probability
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

  // Load model on component mount
  React.useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🔬 Tinea Detector
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            AI-Powered Classification System
          </p>
          <p className="text-gray-500">
            Upload an image to detect Tinea or Non-Tinea conditions
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left Panel - Image Upload */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Upload Image
            </h2>

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
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Results
            </h2>

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
                  Upload an image and click "Analyze Image" to see results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Model Status */}
        <div className="text-center text-gray-600 text-sm">
          <p>Model Status: {modelLoaded ? "✓ Ready" : "Loading..."}</p>
        </div>
      </div>
    </div>
  );
}
