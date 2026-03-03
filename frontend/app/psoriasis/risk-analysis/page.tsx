"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Wind, Droplets, AlertCircle, TrendingUp, Shield, Zap, Lightbulb, BarChart3, Brain } from "lucide-react";

interface RiskFactor {
  label: string;
  value: number;
  impact: string;
  explanation: string;
  recommendation: string;
}

interface RiskAnalysis {
  score: number;
  level: "Low" | "Moderate" | "High" | "Very High";
  color: string;
  factors: RiskFactor[];
  suggestions: string[];
  trend: string;
  explainableInsights: {
    topRisks: string[];
    protectiveFactors: string[];
    holisticAssessment: string;
  };
}

interface ApiResponse {
  success: boolean;
  location: string;
  weather: {
    temperature: number;
    humidity: number;
    feelsLike: number;
    windSpeed: number;
    condition: string;
    temperatureTrend: string;
  };
  riskAnalysis: RiskAnalysis;
}

export default function PsoriasisRiskAnalysis() {
  const [weatherData, setWeatherData] = useState<ApiResponse['weather'] | null>(null);
  const [location, setLocation] = useState<string>("");
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [expandedFactor, setExpandedFactor] = useState<number | null>(null);

  // Fetch weather data from backend API
  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/psoriasis/weather-risk?latitude=${latitude}&longitude=${longitude}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data: ApiResponse = await response.json();
      setWeatherData(data.weather);
      setLocation(data.location);
      setRiskAnalysis({
        score: data.riskAnalysis.score,
        level: data.riskAnalysis.level,
        color: getColorGradient(data.riskAnalysis.level),
        factors: data.riskAnalysis.factors,
        suggestions: data.riskAnalysis.suggestions,
        trend: data.riskAnalysis.explainableInsights ? 
          `${data.weather.temperatureTrend} - ${data.riskAnalysis.trend}` : 
          data.riskAnalysis.trend,
        explainableInsights: data.riskAnalysis.explainableInsights,
      });
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError("Unable to fetch weather data. Please check your location permissions.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get color gradient based on risk level
  const getColorGradient = (level: string): string => {
    switch (level) {
      case 'Very High':
        return 'from-red-600 to-red-500';
      case 'High':
        return 'from-orange-600 to-orange-500';
      case 'Moderate':
        return 'from-yellow-600 to-yellow-500';
      default:
        return 'from-green-600 to-green-500';
    }
  };

  // Grad-CAM: Calculate activation intensity for each factor (0-1 scale)
  const calculateGradCAMActivation = (factors: RiskFactor[]): Record<string, number> => {
    const maxValue = Math.max(...factors.map(f => f.value), 1);
    const activations: Record<string, number> = {};
    
    factors.forEach(factor => {
      // Normalize factor value to 0-1 scale
      activations[factor.label] = factor.value / maxValue;
    });
    
    return activations;
  };

  // Get RGB color from heatmap (blue -> green -> yellow -> red)
  const getHeatmapColor = (activation: number): string => {
    if (activation < 0.25) return '#3b82f6'; // Blue
    if (activation < 0.5) return '#10b981'; // Green
    if (activation < 0.75) return '#fbbf24'; // Yellow
    return '#ef4444'; // Red
  };

  // Get user location and fetch weather
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          // Default to London if location access denied
          fetchWeatherData(51.5074, -0.1278);
        }
      );
    }
  }, []);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeatherData(position.coords.latitude, position.coords.longitude);
          }
        );
      }
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/psoriasis"
          className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-800 font-semibold mb-8 transition-colors"
        >
          ← Back to Psoriasis
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">�️</div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Psoriasis Risk Analysis
              </h1>
              <p className="text-gray-600 mt-2">Real-time environmental impact assessment with explainable AI</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-700 font-semibold">Fetching real-time weather data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-red-800 text-lg">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {weatherData && riskAnalysis && !loading && (
          <>
            {/* Current Weather Card */}
            <div className="bg-white rounded-3xl p-8 shadow-lg mb-8 border-2 border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📍 Current Environmental Conditions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Location */}
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-6 text-center">
                  <p className="text-gray-600 text-sm font-semibold mb-2">Location</p>
                  <p className="text-2xl font-bold text-blue-900">{location}</p>
                </div>

                {/* Temperature */}
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-2">🌡️</div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">Temperature</p>
                  <p className="text-3xl font-bold text-orange-900">{weatherData.temperature}°C</p>
                  <p className="text-xs text-orange-700 mt-2">Feels like {weatherData.feelsLike}°C</p>
                </div>

                {/* Humidity */}
                <div className="bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-2xl p-6 text-center">
                  <Droplets className="mx-auto mb-2 text-cyan-600" size={32} />
                  <p className="text-gray-600 text-sm font-semibold mb-2">Humidity</p>
                  <p className="text-3xl font-bold text-cyan-900">{weatherData.humidity}%</p>
                </div>

                {/* Wind & Trend */}
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl p-6 text-center">
                  <Wind className="mx-auto mb-2 text-indigo-600" size={32} />
                  <p className="text-gray-600 text-sm font-semibold mb-2">Wind Speed</p>
                  <p className="text-3xl font-bold text-indigo-900">{weatherData.windSpeed} km/h</p>
                  <p className="text-xs text-indigo-700 mt-2">{weatherData.temperatureTrend}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-6 text-center">Last updated: {lastUpdate.toLocaleTimeString()} | Data from Open-Meteo API</p>
            </div>

            {/* Risk Score Card */}
            <div className={`bg-gradient-to-r ${riskAnalysis.color} rounded-3xl p-12 shadow-2xl mb-8 text-white`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Overall Risk Assessment</h2>
                  <p className="text-white/90">Based on current environmental conditions</p>
                </div>
                <Shield size={48} className="flex-shrink-0" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Risk Score */}
                <div>
                  <div className="text-7xl font-bold mb-2">{riskAnalysis.score}</div>
                  <div className="text-xl font-semibold mb-4">Risk Score / 100</div>
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-bold text-lg">
                    {riskAnalysis.level} Risk
                  </div>
                </div>

                {/* Holistic Assessment */}
                <div className="flex flex-col justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                    <p className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Lightbulb size={20} />
                      AI Insight:
                    </p>
                    <p className="text-white/95 leading-relaxed">
                      {riskAnalysis.explainableInsights.holisticAssessment}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Gauge - Visual Risk Level */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-amber-200 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="text-amber-600" />
                Risk Level Gauge
              </h3>
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Circular Gauge */}
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {/* Background arc */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    {/* Risk arc */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke={
                        riskAnalysis.score > 75
                          ? '#ef4444'
                          : riskAnalysis.score > 50
                          ? '#f97316'
                          : riskAnalysis.score > 25
                          ? '#eab308'
                          : '#22c55e'
                      }
                      strokeWidth="8"
                      strokeDasharray={`${(riskAnalysis.score / 100) * 565} 565`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900">
                        {Math.round(riskAnalysis.score)}
                      </div>
                      <div className="text-sm text-gray-600">/ 100</div>
                    </div>
                  </div>
                </div>

                {/* Gauge Scale */}
                <div className="w-full">
                  <div className="flex justify-between text-xs text-gray-600 mb-2 font-semibold">
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>High</span>
                    <span>Critical</span>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded-full"></div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>0</span>
                    <span>33</span>
                    <span>67</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grad-CAM: Visual Feature Activation Map */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl mb-8 border-2 border-cyan-500 text-white">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Brain className="text-cyan-400" />
                Grad-CAM: Feature Activation Map
              </h3>
              <p className="text-gray-300 text-sm mb-6">Gradient-weighted Class Activation Mapping - Shows which factors have the strongest influence on your risk score</p>
              
              {/* Grad-CAM Heatmap Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {riskAnalysis && riskAnalysis.factors.map((factor, idx) => {
                  const activations = calculateGradCAMActivation(riskAnalysis.factors);
                  const activation = activations[factor.label] || 0;
                  const color = getHeatmapColor(activation);
                  const intensity = Math.round(activation * 100);

                  return (
                    <div key={idx} className="group">
                      <div
                        className="w-full aspect-square rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer relative overflow-hidden flex items-center justify-center border-2"
                        style={{
                          backgroundColor: color,
                          borderColor: color,
                          opacity: 0.8 + activation * 0.2,
                        }}
                      >
                        <div className="text-center z-10">
                          <div className="text-sm font-bold text-white/90 mb-1">{factor.label}</div>
                          <div className="text-2xl font-bold text-white">{intensity}%</div>
                          <div className="text-xs text-white/70 mt-1">Activation</div>
                        </div>

                        {/* Animated gradient overlay */}
                        <div
                          className="absolute inset-0 opacity-30 animate-pulse"
                          style={{
                            background: `radial-gradient(circle, ${color}, transparent)`,
                          }}
                        ></div>
                      </div>
                      
                      <div className="mt-2 text-center text-xs text-gray-400">
                        {factor.impact}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Heatmap Legend */}
              <div className="p-4 bg-slate-700/50 rounded-2xl border border-slate-600">
                <p className="text-xs font-semibold text-gray-300 mb-3">Activation Intensity Scale:</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-12 h-2 rounded" style={{background: 'linear-gradient(to right, #3b82f6, #10b981, #fbbf24, #ef4444)'}}></div>
                    <span className="text-xs text-gray-300">
                      Low (0%) → High (100%)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  🔍 Interpretation: Brighter/redder tiles = stronger influence on risk score. These are the primary drivers of your psoriasis risk.
                </p>
              </div>
            </div>

            {/* Grad-CAM: Factor Sensitivity Analysis */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-indigo-200 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="text-indigo-600" />
                Grad-CAM: Gradient Activation by Factor
              </h3>
              
              <div className="space-y-6">
                {riskAnalysis && riskAnalysis.factors.map((factor, idx) => {
                  const activations = calculateGradCAMActivation(riskAnalysis.factors);
                  const activation = activations[factor.label] || 0;
                  const color = getHeatmapColor(activation);
                  
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{factor.label}</p>
                          <p className="text-xs text-gray-600">Value: {factor.value}% | Impact: {factor.impact}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{color}}>
                            {Math.round(activation * 100)}%
                          </p>
                          <p className="text-xs text-gray-600">Activation</p>
                        </div>
                      </div>

                      {/* Gradient Activation Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full transition-all duration-500 relative"
                          style={{
                            width: `${activation * 100}%`,
                            background: `linear-gradient(90deg, #3b82f6, ${color})`,
                          }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>

                      {/* Activation Reasons */}
                      <p className="text-sm text-gray-700 leading-relaxed">
                        💡 <span className="font-semibold">Why this activation:</span> {factor.explanation.substring(0, 120)}...
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <p className="text-xs text-gray-700">
                  📊 <span className="font-semibold">Grad-CAM Interpretation:</span> This visualization shows the gradient activation map - indicating which features have the highest influence on the model's prediction. Higher activation = stronger contribution to risk score.
                </p>
              </div>
            </div>

            {/* Grad-CAM: 2D Heatmap - Factor Interaction Matrix */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-rose-200 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Brain className="text-rose-600" />
                Grad-CAM: Feature Interaction Heatmap
              </h3>
              
              {riskAnalysis && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-bold text-gray-900">Factor</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-900">Activation</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-900">Contribution</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-900">Risk Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riskAnalysis.factors.map((factor, idx) => {
                        const activations = calculateGradCAMActivation(riskAnalysis.factors);
                        const activation = activations[factor.label] || 0;
                        const contribution = Math.round((factor.value / riskAnalysis.score) * 100);
                        const color = getHeatmapColor(activation);

                        return (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-semibold text-gray-900">{factor.label}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center">
                                <div
                                  className="w-16 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm transition-transform hover:scale-110"
                                  style={{backgroundColor: color}}
                                >
                                  {Math.round(activation * 100)}%
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="h-full transition-all"
                                    style={{
                                      width: `${contribution}%`,
                                      backgroundColor: color,
                                    }}
                                  ></div>
                                </div>
                                <span className="font-bold text-gray-900 min-w-fit">{contribution}%</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                factor.impact === 'Critical' ? 'bg-red-100 text-red-800' :
                                factor.impact === 'High Risk' ? 'bg-orange-100 text-orange-800' :
                                factor.impact === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {factor.impact}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6 p-4 bg-rose-50 rounded-xl border border-rose-200">
                <p className="text-xs text-gray-700">
                  🎨 <span className="font-semibold">Feature Interaction Matrix:</span> This heatmap shows how each environmental factor activates in the model and contributes to your overall risk. Combines Grad-CAM activation with actual risk contribution percentages.
                </p>
              </div>
            </div>

            {/* Key Insights - Explainable AI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Top Risks */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-red-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-red-500" />
                  Top Risk Factors
                </h3>
                {riskAnalysis.explainableInsights.topRisks.length > 0 ? (
                  <ul className="space-y-3">
                    {riskAnalysis.explainableInsights.topRisks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                        <span className="text-red-600 font-bold">⚠️</span>
                        <span className="text-gray-700">{risk}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No significant risk factors detected.</p>
                )}
              </div>

              {/* Protective Factors */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-green-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="text-green-500" />
                  Protective Factors
                </h3>
                {riskAnalysis.explainableInsights.protectiveFactors.length > 0 ? (
                  <ul className="space-y-3">
                    {riskAnalysis.explainableInsights.protectiveFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-gray-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Monitor current conditions.</p>
                )}
              </div>
            </div>

            {/* Risk Factors - Detailed Explainable Analysis */}
            <div className="bg-white rounded-3xl p-8 shadow-lg mb-8 border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <TrendingUp className="text-purple-600" />
                Detailed Factor Analysis
              </h2>
              <div className="space-y-4">
                {riskAnalysis.factors.map((factor, idx) => (
                  <div key={idx}>
                    {/* Collapsible Factor Card */}
                    <button
                      onClick={() => setExpandedFactor(expandedFactor === idx ? null : idx)}
                      className="w-full text-left p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">{factor.label}</h3>
                            <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                              factor.impact === 'Critical' ? 'bg-red-200 text-red-900' :
                              factor.impact === 'High Risk' ? 'bg-orange-200 text-orange-900' :
                              factor.impact === 'Moderate' ? 'bg-yellow-200 text-yellow-900' :
                              factor.impact === 'Increased' ? 'bg-yellow-100 text-yellow-900' :
                              'bg-green-200 text-green-900'
                            }`}>
                              {factor.impact}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                factor.value > 30 ? 'bg-red-500' :
                                factor.value > 15 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(factor.value, 45)}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="ml-4 text-2xl transition-transform" style={{
                          transform: expandedFactor === idx ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </span>
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {expandedFactor === idx && (
                      <div className="mt-2 p-5 bg-white rounded-2xl border-2 border-purple-100 animate-fadeIn">
                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <Lightbulb size={18} className="text-amber-500" />
                              Why This Matters:
                            </p>
                            <p className="text-gray-700 leading-relaxed">{factor.explanation}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-2">💡 Recommendation:</p>
                            <p className="text-gray-700 leading-relaxed">{factor.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Zap className="text-green-600" />
                Personalized Action Plan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {riskAnalysis.factors.flatMap((factor, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:shadow-md transition-shadow"
                  >
                    <span className="text-2xl flex-shrink-0">{factor.recommendation.split(" ")[0]}</span>
                    <p className="text-gray-700 leading-relaxed font-medium">
                      {factor.recommendation.substring(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Info & Medical Disclaimer */}
            <div className="bg-yellow-50 rounded-3xl p-8 shadow-lg border-2 border-yellow-300 mb-8">
              <p className="text-sm text-yellow-900 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚕️</span>
                <span>
                  <span className="font-bold">Medical Disclaimer:</span> This AI risk analysis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified dermatologist for diagnosis, treatment, and medical decisions. Model limitations: environmental factors only, not personalized to individual history.
                </span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                🔄 Refresh Data
              </button>
              <Link
                href="/psoriasis/upload"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center"
              >
                🔍 AI Detection
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
