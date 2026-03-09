
"use client";

import React from "react";
import { RiskResult } from "@/utils/skinRiskLogic";

interface Props {
  data: RiskResult;
}

export default function MultimodalRiskResults({ data }: Props) {
  const { totalRiskScore, riskLevel, contributors, recommendations, imageClassName, imageProbability } = data;

  // Calculate image vs metadata contribution
  const imageContributor = contributors.find((c) => c.factor === "AI Image Analysis");
  const imageContribution = imageContributor?.impact || 0;
  const metadataContribution = totalRiskScore - imageContribution;

  const getScoreColor = () => {
    if (riskLevel === "Low") return "text-green-600";
    if (riskLevel === "Moderate") return "text-yellow-600";
    if (riskLevel === "High") return "text-orange-600";
    return "text-red-700";
  };

  const getBarColor = (score: number) => {
    if (score < 30) return "bg-green-500";
    if (score < 60) return "bg-yellow-500";
    if (score < 80) return "bg-orange-500";
    return "bg-red-600";
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-slide-up">
      <h2 className="text-3xl font-black text-gray-900 mb-8 border-b pb-4">
        Multimodal Risk Analysis Report
      </h2>

      {/* DEBUG: AI Classification Display */}
      <div className="mb-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <h3 className="text-sm font-bold text-blue-900 mb-2">🤖 AI Classification Result</h3>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-900">
            Detected: <span className="text-blue-700">{imageClassName || "Unknown"}</span>
          </span>
          <span className="text-lg font-bold text-blue-700">
            Confidence: {imageProbability ? `${(imageProbability * 100).toFixed(1)}%` : "N/A"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Score & Gauge */}
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-3xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-700 mb-4 uppercase tracking-wider">
              Composite Risk Score
            </h3>
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Circular Background */}
              <div className="absolute inset-0 rounded-full border-8 border-gray-200 opacity-30"></div>
              {/* Score Value */}
              <div className="text-center z-10">
                <span className={`text-6xl font-black ${getScoreColor()}`}>
                  {totalRiskScore}
                </span>
                <span className="block text-gray-400 font-bold text-lg mt-1">
                  / 100
                </span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <span className={`inline-block px-6 py-2 rounded-full text-lg font-bold bg-white shadow-md border ${getScoreColor()}`}>
                {riskLevel} Risk
              </span>
            </div>
          </div>

          {/* Risk Breakdown: Image vs Metadata */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl border border-purple-100">
            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
              <span>📊</span> Risk Score Breakdown
            </h3>
            
            {/* Image Analysis Contribution */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-700">AI Image Analysis</p>
                  <p className="text-xs text-gray-500">{imageClassName} • {imageProbability ? `${(imageProbability * 100).toFixed(1)}%` : "N/A"} confidence</p>
                </div>
                <span className="text-2xl font-black text-blue-600">+{imageContribution}</span>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                  style={{ width: `${Math.min((imageContribution / totalRiskScore) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {imageContribution === 0 ? "No image-based risk detected" : `${((imageContribution / totalRiskScore) * 100).toFixed(0)}% of total risk`}
              </p>
            </div>

            {/* Metadata Contribution */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Clinical Metadata Factors</p>
                  <p className="text-xs text-gray-500">Patient history & lesion symptoms</p>
                </div>
                <span className="text-2xl font-black text-orange-600">+{metadataContribution}</span>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                  style={{ width: `${Math.min((metadataContribution / totalRiskScore) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {metadataContribution === 0 ? "No metadata risk factors detected" : `${((metadataContribution / totalRiskScore) * 100).toFixed(0)}% of total risk`}
              </p>
            </div>

            {/* Total Risk */}
            <div className="pt-4 border-t border-purple-200">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-gray-900">TOTAL COMPOSITE RISK</p>
                <span className={`text-3xl font-black ${getScoreColor()}`}>{totalRiskScore}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span>🛡️</span> Personalized Prevention
            </h3>
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 text-blue-800">
                  <span className="mt-1 text-blue-500">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Explainability */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🧠</span> Explainability Engine (SHAP-Simulated)
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Breakdown of key factors contributing to the risk calculation, integrating both visual lesion features and patient metadata.
          </p>

          <div className="space-y-4">
            {contributors.map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">{item.factor}</span>
                  <span
                    className={`font-mono font-bold ${
                      item.impact > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {item.impact > 0 ? `+${item.impact}` : item.impact}
                  </span>
                </div>
                {/* Visual Bar */}
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${
                      item.impact > 0 ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(Math.abs(item.impact) * 2, 100)}%` }} // Scaling for visual effect
                  ></div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clinical Metadata Section */}
      {data.metadata && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📋</span> Clinical Metadata Assessment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Patient Profile Section */}
            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
              <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                <span>👤</span> Patient Profile
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Age:</span>
                  <span className="font-semibold text-gray-900">{data.metadata.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Gender:</span>
                  <span className="font-semibold text-gray-900 capitalize">{data.metadata.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Region:</span>
                  <span className="font-semibold text-gray-900">{data.metadata.region}</span>
                </div>
              </div>
            </div>

            {/* Lifestyle Factors Section */}
            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
              <h4 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                <span>🚬</span> Lifestyle Factors
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={data.metadata.smoke ? "text-orange-600" : "text-green-600"}>
                    {data.metadata.smoke ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-700">Smoking</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={data.metadata.drink ? "text-orange-600" : "text-green-600"}>
                    {data.metadata.drink ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-700">Alcohol Use</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={data.metadata.pesticide ? "text-orange-600" : "text-green-600"}>
                    {data.metadata.pesticide ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-700">Chemical Exposure</span>
                </div>
              </div>
            </div>

            {/* Medical History Section */}
            <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
              <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                <span>⚕️</span> Medical History
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={data.metadata.skinCancerHistory ? "text-red-600" : "text-green-600"}>
                    {data.metadata.skinCancerHistory ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-700">Skin Cancer History</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={data.metadata.cancerHistory ? "text-red-600" : "text-green-600"}>
                    {data.metadata.cancerHistory ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-700">Family Cancer History</span>
                </div>
              </div>
            </div>

            {/* Lesion Dimensions Section */}
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span>📏</span> Lesion Dimensions
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Diameter 1:</span>
                  <span className="font-semibold text-gray-900">{data.metadata.diameter1} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Diameter 2:</span>
                  <span className="font-semibold text-gray-900">{data.metadata.diameter2} mm</span>
                </div>
              </div>
            </div>

            {/* Lesion Symptoms Section */}
            <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100">
              <h4 className="font-bold text-yellow-900 mb-4 flex items-center gap-2">
                <span>🔍</span> Lesion Symptoms
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={data.metadata.itch ? "text-yellow-600" : "text-green-600"}>
                    {data.metadata.itch ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-700">Itching</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={data.metadata.hurt ? "text-yellow-600" : "text-green-600"}>
                    {data.metadata.hurt ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-700">Pain/Tenderness</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={data.metadata.bleed ? "text-red-600" : "text-green-600"}>
                    {data.metadata.bleed ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-700">Bleeding</span>
                </div>
              </div>
            </div>

            {/* ABCDE Changes Section */}
            <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <span>📊</span> ABCDE Changes
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={data.metadata.grow ? "text-indigo-600" : "text-green-600"}>
                    {data.metadata.grow ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-700">Growing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={data.metadata.changed ? "text-indigo-600" : "text-green-600"}>
                    {data.metadata.changed ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-700">Changed Recently</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={data.metadata.elevation ? "text-indigo-600" : "text-green-600"}>
                    {data.metadata.elevation ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-700">Elevated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
