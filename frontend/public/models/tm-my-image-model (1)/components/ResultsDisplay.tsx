"use client";

import React from "react";

interface PredictionResult {
  label: string;
  probability: number;
}

interface ResultsDisplayProps {
  predictions: PredictionResult[];
}

export default function ResultsDisplay({ predictions }: ResultsDisplayProps) {
  if (!predictions.length) return null;

  const topPrediction = predictions[0];
  const isConfident = topPrediction.probability > 70;
  const isTinea = topPrediction.label.toLowerCase().includes("tinea");

  return (
    <div className="space-y-6">
      {/* Primary Result */}
      <div
        className={`p-6 rounded-lg border-2 ${
          isTinea
            ? "bg-red-50 border-red-300"
            : "bg-green-50 border-green-300"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Classification Result
          </h3>
          {isConfident && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
              High Confidence
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-4xl">
            {isTinea ? "⚠️" : "✓"}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Predicted Class:</p>
            <p
              className={`text-3xl font-bold ${
                isTinea ? "text-red-600" : "text-green-600"
              }`}
            >
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
              className={`h-full transition-all duration-500 ${
                isTinea ? "bg-red-500" : "bg-green-500"
              }`}
              style={{ width: `${topPrediction.probability}%` }}
            />
          </div>
        </div>
      </div>

      {/* All Predictions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Predictions
        </h3>
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
        <p className="text-sm font-semibold">ℹ️ Note:</p>
        <p className="text-sm mt-1">
          {isTinea
            ? "This image has been classified as Tinea. Consider consulting with a healthcare professional for medical advice."
            : "This image has been classified as Non-Tinea. No fungal infection detected."}
        </p>
      </div>
    </div>
  );
}
