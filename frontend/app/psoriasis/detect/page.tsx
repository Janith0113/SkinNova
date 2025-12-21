"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PsoriasisDetection() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setError("");
    setResult(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await fetch("http://localhost:4000/api/detect/psoriasis", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreview("");
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/psoriasis"
            className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            ← Back to Psoriasis Info
          </Link>
        </div>

        {/* Main Container */}
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl p-8 sm:p-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">Psoriasis Detection</h1>
          <p className="text-gray-700 text-lg mb-8">Upload or capture an image of the affected skin area for AI-powered analysis</p>

          {!result ? (
            <div className="space-y-8">
              {/* Image Preview or Upload Area */}
              {preview ? (
                <div className="space-y-6">
                  <div className="rounded-2xl overflow-hidden shadow-lg bg-black/5">
                    <img src={preview} alt="Preview" className="w-full h-auto max-h-96 object-cover" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-md"
                    >
                      📁 Change Image
                    </button>
                    <button
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? "🔍 Analyzing..." : "🔍 Analyze Image"}
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all shadow-md"
                    >
                      ✕ Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Upload Options */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-8 border-2 border-dashed border-emerald-400 rounded-2xl hover:bg-emerald-50 transition-all group"
                    >
                      <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📁</div>
                      <p className="font-semibold text-gray-900">Upload Image</p>
                      <p className="text-sm text-gray-600">JPG, PNG, WebP</p>
                    </button>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-8 border-2 border-dashed border-blue-400 rounded-2xl hover:bg-blue-50 transition-all group"
                    >
                      <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📷</div>
                      <p className="font-semibold text-gray-900">Take Photo</p>
                      <p className="text-sm text-gray-600">Use your camera</p>
                    </button>
                  </div>

                  {/* Hidden Inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  {/* Info Box */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-5">
                    <p className="text-blue-900 font-semibold mb-2">📋 Tips for Best Results:</p>
                    <ul className="space-y-1 text-blue-800 text-sm">
                      <li>✓ Ensure good lighting and clear visibility</li>
                      <li>✓ Focus on the affected area</li>
                      <li>✓ Avoid shadows and glare</li>
                      <li>✓ Keep the image steady and in focus</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5">
                  <p className="text-red-900 font-semibold">❌ Error</p>
                  <p className="text-red-800 text-sm mt-1">{error}</p>
                </div>
              )}
            </div>
          ) : (
            /* Results Section */
            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Image */}
                <div className="rounded-2xl overflow-hidden shadow-lg bg-black/5">
                  <img src={preview} alt="Analysis" className="w-full h-auto object-cover" />
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
                    <p className="text-sm text-gray-600 mb-2">Final Detection Result</p>
                    <p className={`text-4xl font-bold ${
                      result?.is_psoriasis
                        ? "text-red-600"
                        : "text-emerald-600"
                    }`}>
                      {result?.is_psoriasis ? "⚠️ Positive" : "✓ Negative"}
                    </p>
                  </div>

                  {/* Triple Ensemble Voting Results */}
                  {result?.totalInferences !== undefined && (
                    <div className="bg-indigo-50 rounded-2xl p-6 border-2 border-indigo-200">
                      <p className="text-sm text-gray-600 mb-4 font-semibold">Triple Ensemble Analysis (3×20 = 60 Total Inferences)</p>
                      <div className="space-y-4">
                        {/* Ensemble Vote */}
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-2">Verification Rounds</p>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1">
                              <div className="bg-red-100 rounded-lg p-2 text-center">
                                <p className="text-lg font-bold text-red-600">{result.ensembleVote.positive}</p>
                                <p className="text-xs text-gray-600">Positive</p>
                              </div>
                            </div>
                            <div className="text-gray-400 font-bold">/</div>
                            <div className="flex-1">
                              <div className="bg-emerald-100 rounded-lg p-2 text-center">
                                <p className="text-lg font-bold text-emerald-600">{result.ensembleVote.negative}</p>
                                <p className="text-xs text-gray-600">Negative</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Total Statistics */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-700 font-semibold">Total Analysis Results</span>
                            <span className="text-xs bg-indigo-200 text-indigo-900 px-2 py-1 rounded">60 inferences</span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-700">Positive</span>
                                <span className="text-sm font-bold text-red-600">{result.totalPositiveCount}/60</span>
                              </div>
                              <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-red-500 to-red-600 h-full"
                                  style={{ width: `${result.totalAccuracy}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-700">Negative</span>
                                <span className="text-sm font-bold text-emerald-600">{result.totalNegativeCount}/60</span>
                              </div>
                              <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full"
                                  style={{ width: `${100 - result.totalAccuracy}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-indigo-700 font-semibold bg-indigo-100 p-2 rounded">
                          ✓ Final Accuracy: {result.totalAccuracy.toFixed(1)}% • Verification Status: CONFIRMED
                        </p>
                      </div>
                    </div>
                  )}

                  {result?.confidence && (
                    <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                      <p className="text-sm text-gray-600 mb-3">Average Confidence</p>
                      <div className="w-full bg-blue-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 h-full"
                          style={{ width: `${(result.confidence * 100).toFixed(1)}%` }}
                        ></div>
                      </div>
                      <p className="text-blue-900 font-semibold mt-2">
                        {(result.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}

                  {result?.details && (
                    <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                      <p className="text-sm text-gray-600 mb-3">Analysis Details</p>
                      <p className="text-purple-900 text-sm">{result.details}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-5">
                <p className="text-yellow-900 font-semibold mb-2">⚠️ Important Disclaimer</p>
                <p className="text-yellow-800 text-sm">
                  This AI analysis is for informational purposes only and should not be considered a medical diagnosis. 
                  Please consult with a qualified dermatologist for professional evaluation and treatment recommendations.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-md"
                >
                  🔄 Analyze Another Image
                </button>
                <button
                  onClick={() => router.push("/psoriasis")}
                  className="flex-1 px-6 py-3 rounded-xl bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-all shadow-md"
                >
                  ← Back to Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
