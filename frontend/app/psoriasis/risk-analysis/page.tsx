"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Cloud, CloudRain, Wind, Droplets, AlertCircle, TrendingUp, Shield, Zap } from "lucide-react";

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  location: string;
  feelsLike: number;
  windSpeed: number;
}

interface RiskAnalysis {
  score: number;
  level: "Low" | "Moderate" | "High" | "Very High";
  color: string;
  suggestions: string[];
  factors: { label: string; impact: string; value: number }[];
}

export default function PsoriasisRiskAnalysis() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch weather data
  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      // Using Open-Meteo API (free, no key required)
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&temperature_unit=celsius`
      );
      const weatherJson = await weatherResponse.json();
      const current = weatherJson.current;

      // Reverse geocode to get location name
      let locationName = "Your Location";
      try {
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const geoJson = await geoResponse.json();
        locationName = geoJson.address?.city || geoJson.address?.town || "Your Location";
      } catch (e) {
        // Keep default location name
      }

      const weather: WeatherData = {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        condition: getWeatherCondition(current.weather_code),
        location: locationName,
        feelsLike: current.apparent_temperature,
        windSpeed: current.wind_speed_10m,
      };

      setWeatherData(weather);
      calculateRiskAnalysis(weather);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError("Unable to fetch weather data. Please check your location permissions.");
      setLoading(false);
    }
  };

  // Get weather condition from WMO code
  const getWeatherCondition = (code: number): string => {
    if (code === 0 || code === 1) return "Clear";
    if (code === 2) return "Partly Cloudy";
    if (code === 3) return "Overcast";
    if (code === 45 || code === 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Drizzle";
    if (code >= 71 && code <= 85) return "Snow";
    if (code >= 80 && code <= 82) return "Rain Showers";
    if (code === 85 || code === 86) return "Snow Showers";
    if (code >= 90 && code <= 99) return "Thunderstorm";
    return "Unknown";
  };

  // Calculate risk score based on environmental factors
  const calculateRiskAnalysis = (weather: WeatherData) => {
    let riskScore = 0;
    const factors: { label: string; impact: string; value: number }[] = [];

    // Temperature factor (Psoriasis often triggered by cold)
    const tempImpact = weather.temperature < 10 ? 30 : weather.temperature < 15 ? 20 : 0;
    riskScore += tempImpact;
    factors.push({
      label: "Temperature",
      impact: weather.temperature < 10 ? "High Risk" : weather.temperature < 15 ? "Moderate" : "Low",
      value: tempImpact,
    });

    // Humidity factor (Very low humidity worsens psoriasis)
    const humidityImpact = weather.humidity < 30 ? 35 : weather.humidity < 40 ? 20 : weather.humidity > 80 ? 10 : 0;
    riskScore += humidityImpact;
    factors.push({
      label: "Humidity",
      impact: weather.humidity < 30 ? "Critical" : weather.humidity < 40 ? "Moderate" : weather.humidity > 80 ? "Increased" : "Optimal",
      value: humidityImpact,
    });

    // Determine risk level
    let level: "Low" | "Moderate" | "High" | "Very High";
    let color: string;
    if (riskScore >= 80) {
      level = "Very High";
      color = "from-red-600 to-red-500";
    } else if (riskScore >= 60) {
      level = "High";
      color = "from-orange-600 to-orange-500";
    } else if (riskScore >= 40) {
      level = "Moderate";
      color = "from-yellow-600 to-yellow-500";
    } else {
      level = "Low";
      color = "from-green-600 to-green-500";
    }

    // Generate suggestions
    const suggestions: string[] = [];
    if (weather.humidity < 30) {
      suggestions.push("🌊 Use a humidifier to increase indoor humidity");
      suggestions.push("💧 Apply heavy moisturizer immediately after showering");
    }
    if (weather.temperature < 15) {
      suggestions.push("🧥 Keep your skin covered and warm");
      suggestions.push("♨️ Use lukewarm water for bathing (not hot)");
    }
    if (suggestions.length === 0) {
      suggestions.push("✅ Conditions are favorable - maintain your skincare routine");
      suggestions.push("🌳 Safe to go outside, remember to hydrate");
      suggestions.push("😊 Monitor your skin and enjoy the day responsibly");
    }

    setRiskAnalysis({
      score: riskScore,
      level,
      color,
      suggestions,
      factors,
    });
    setLoading(false);
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
            <div className="text-5xl">🌡️</div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Psoriasis Risk Analysis
              </h1>
              <p className="text-gray-600 mt-2">Real-time weather impact assessment</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-700 font-semibold">Fetching weather data...</p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Weather</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Location */}
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-6 text-center">
                  <p className="text-gray-600 text-sm font-semibold mb-2">Location</p>
                  <p className="text-2xl font-bold text-blue-900">{weatherData.location}</p>
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
              </div>
              <p className="text-xs text-gray-500 mt-4">Last updated: {lastUpdate.toLocaleTimeString()}</p>
            </div>

            {/* Risk Score Card */}
            <div className={`bg-gradient-to-r ${riskAnalysis.color} rounded-3xl p-12 shadow-2xl mb-8 text-white`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Overall Risk Assessment</h2>
                  <p className="text-white/90">Based on current weather conditions</p>
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

                {/* Risk Level Description */}
                <div className="flex flex-col justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                    <p className="font-semibold text-lg mb-3">Risk Interpretation:</p>
                    {riskAnalysis.level === "Very High" && (
                      <p className="text-white/95">
                        ⚠️ Current conditions are highly unfavorable for your skin. Consider staying indoors and intensifying your skincare routine.
                      </p>
                    )}
                    {riskAnalysis.level === "High" && (
                      <p className="text-white/95">
                        ⚠️ Current conditions may trigger psoriasis flare-ups. Take extra precautions with your skincare.
                      </p>
                    )}
                    {riskAnalysis.level === "Moderate" && (
                      <p className="text-white/95">
                        ⚡ Conditions are somewhat challenging. Maintain your regular skincare routine with extra care.
                      </p>
                    )}
                    {riskAnalysis.level === "Low" && (
                      <p className="text-white/95">
                        ✅ Conditions are favorable for your skin. Continue your regular skincare routine.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="bg-white rounded-3xl p-8 shadow-lg mb-8 border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <TrendingUp className="text-purple-600" />
                Contributing Factors
              </h2>
              <div className="space-y-4">
                {riskAnalysis.factors.map((factor, idx) => (
                  <div key={idx} className="flex items-center gap-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{factor.label}</h3>
                        <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                          factor.impact === "Critical" ? "bg-red-200 text-red-900" :
                          factor.impact === "High Risk" ? "bg-orange-200 text-orange-900" :
                          factor.impact === "High" ? "bg-orange-200 text-orange-900" :
                          factor.impact === "Moderate" ? "bg-yellow-200 text-yellow-900" :
                          factor.impact === "Increased" ? "bg-yellow-100 text-yellow-900" :
                          "bg-green-200 text-green-900"
                        }`}>
                          {factor.impact}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            factor.value > 20 ? "bg-red-500" :
                            factor.value > 10 ? "bg-yellow-500" :
                            "bg-green-500"
                          }`}
                          style={{ width: `${(factor.value / 35) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Zap className="text-green-600" />
                Personalized Recommendations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {riskAnalysis.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:shadow-md transition-shadow"
                  >
                    <span className="text-2xl flex-shrink-0">{suggestion.split(" ")[0]}</span>
                    <p className="text-gray-700 leading-relaxed font-medium">
                      {suggestion.substring(2)}
                    </p>
                  </div>
                ))}
              </div>
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
    </div>
  );
}
