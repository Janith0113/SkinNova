"use client";

import React, { useState, useRef, useCallback } from "react";
import * as tmImage from "@teachablemachine/image";

interface PredictionResult {
  label: string;
  probability: number;
}

// ─── Inline: LoadingSpinner ───────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 animate-spin"></div>
      </div>
      <p className="text-gray-700 font-semibold text-lg">Analyzing image...</p>
      <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
    </div>
  );
}

// ─── Inline: ImageUploadArea ──────────────────────────────────────────────────
function ImageUploadArea({ onImageSelected }: { onImageSelected: (file: File) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) onImageSelected(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) onImageSelected(e.target.files[0]);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        dragActive
          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-105"
          : "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-blue-400 hover:shadow-md"
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
        <div className="text-5xl mb-4 drop-shadow-sm">📸</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Click to upload or drag &amp; drop
        </h3>
        <p className="text-gray-600 text-sm font-medium">PNG, JPG, GIF up to 10MB</p>
      </div>
    </div>
  );
}

// ─── Inline: ResultsDisplay ───────────────────────────────────────────────────
function ResultsDisplay({ predictions }: { predictions: PredictionResult[] }) {
  if (!predictions.length) return null;

  const topPrediction = predictions[0];
  const isConfident = topPrediction.probability > 70;
  const isTinea = topPrediction.label.toLowerCase().includes("tinea");

  return (
    <div className="space-y-6">
      <div
        className={`p-6 rounded-xl border-2 shadow-lg transition-all duration-300 ${
          isTinea 
            ? "bg-gradient-to-br from-red-50 via-red-100 to-rose-100 border-red-400 drop-shadow-lg" 
            : "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 border-green-400"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Classification Result</h3>
          {isConfident && (
            <span className="px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
              ✓ High Confidence
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-6xl drop-shadow-lg">{isTinea ? "⚠️" : "✅"}</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Predicted Class:</p>
            <p
              className={`text-4xl font-bold mt-1 ${
                isTinea ? "text-red-700" : "text-green-700"
              }`}
            >
              {topPrediction.label}
            </p>
            <p className="text-lg font-bold text-gray-800 mt-2">
              Confidence: <span className={isTinea ? "text-red-600" : "text-green-600"}>{topPrediction.probability.toFixed(1)}%</span>
            </p>
          </div>
        </div>
        <div className="mt-6">
          <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                isTinea 
                  ? "bg-gradient-to-r from-red-500 to-rose-600" 
                  : "bg-gradient-to-r from-green-500 to-emerald-600"
              }`}
              style={{ width: `${topPrediction.probability}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">All Predictions</h3>
        <div className="space-y-3">
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 hover:border-blue-400 hover:shadow-md transition-all duration-200 transform hover:scale-102"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-lg">
                  {index + 1}. {prediction.label}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-gray-300 rounded-full h-3 overflow-hidden shadow-sm">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-700 rounded-full"
                    style={{ width: `${prediction.probability}%` }}
                  />
                </div>
                <span className="text-xl font-bold text-gray-900 w-20 text-right">
                  {prediction.probability.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TineaDetectPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const modelRef = useRef<tmImage.CustomMobileNet | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const initializeModel = useCallback(async () => {
    if (modelLoaded) return;
    try {
      setLoading(true);
      setError(null);
      const modelURL = "/models/New%20folder/public/model/model.json";
      const metadataURL = "/models/New%20folder/public/model/metadata.json";
      const model = await tmImage.load(modelURL, metadataURL);
      modelRef.current = model;
      setModelLoaded(true);
    } catch (err) {
      setError(
        "Failed to load the model. Ensure model files are in /public/models/New folder/public/model/"
      );
      console.error("Model loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [modelLoaded]);

  const handleImageSelected = useCallback(
    async (file: File) => {
      setError(null);
      setPredictions([]);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        setSelectedImage(imageData);
        if (!modelLoaded) await initializeModel();
      };
      reader.readAsDataURL(file);
    },
    [modelLoaded, initializeModel]
  );

  const handlePredict = useCallback(async () => {
    if (!imageRef.current || !modelRef.current) {
      setError("Image or model not ready");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const preds = await modelRef.current.predict(imageRef.current);
      const labels = modelRef.current.getClassLabels();
      const results: PredictionResult[] = preds.map((pred: any, index: number) => ({
        label: labels[index],
        probability: Math.round(pred.probability * 10000) / 100,
      }));
      results.sort((a, b) => b.probability - a.probability);
      setPredictions(results);
    } catch (err) {
      setError("Failed to make prediction: " + (err as Error).message);
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClear = () => {
    setSelectedImage(null);
    setPredictions([]);
    setError(null);
  };

  React.useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  return (
    <div className="min-h-screen py-8 px-3 sm:px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 mt-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4 drop-shadow-lg">
            🔬 Tinea Detector
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">AI-Powered Classification System</p>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg font-semibold">
            Upload an image to detect Tinea or Non-Tinea conditions with high accuracy
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Left Panel — Upload */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-gray-100 hover:shadow-3xl transition-shadow duration-300">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">📤</span>
              Upload Image
            </h2>

            {!selectedImage ? (
              <ImageUploadArea onImageSelected={handleImageSelected} />
            ) : (
              <div>
                <div className="mb-6 rounded-xl overflow-hidden shadow-lg border-4 border-blue-200">
                  <img
                    ref={imageRef}
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handlePredict}
                    disabled={loading || !modelLoaded}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    {loading ? "⏳ Processing..." : "✨ Analyze Image"}
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 disabled:from-gray-200 disabled:to-gray-300 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    🔄 Clear
                  </button>
                </div>
              </div>
            )}

            {!modelLoaded && !loading && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg text-yellow-800 text-sm font-semibold flex items-center gap-2">
                <span>⏳</span>
                Loading AI model...
              </div>
            )}
          </div>

          {/* Right Panel — Results */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-gray-100 hover:shadow-3xl transition-shadow duration-300">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">📊</span>
              Results
            </h2>

            {loading && <LoadingSpinner />}

            {error && (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-red-100 to-rose-100 border-2 border-red-400 text-red-700 rounded-lg shadow-md">
                <p className="font-bold text-lg flex items-center gap-2">
                  <span>❌</span> Error
                </p>
                <p className="text-sm mt-2 font-semibold">{error}</p>
              </div>
            )}

            {predictions.length > 0 && !loading && (
              <ResultsDisplay predictions={predictions} />
            )}

            {!selectedImage && !loading && predictions.length === 0 && !error && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="text-5xl mb-4">📸</div>
                <p className="text-center text-lg font-semibold">
                  Upload an image and click &quot;Analyze Image&quot; to see results
                </p>
                <p className="text-center text-sm mt-2">
                  Supported formats: PNG, JPG, GIF (up to 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer status */}
        <div className="text-center text-gray-700 font-semibold">
          <p className="text-base sm:text-lg">
            Model Status: <span className={modelLoaded ? "text-green-600 font-bold" : "text-orange-600 font-bold"}>
              {modelLoaded ? "✅ Ready" : "⏳ Loading..."}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
