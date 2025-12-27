'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TinePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [smartwatchData, setSmartWatchData] = useState({
    heartRate: 72,
    steps: 0,
    calories: 0,
    temperature: 36.5,
    oxygenLevel: 98,
  });

  // Simulate live smartwatch data
  useEffect(() => {
    const interval = setInterval(() => {
      setSmartWatchData(prev => ({
        heartRate: Math.floor(Math.random() * (95 - 60) + 60),
        steps: Math.floor(Math.random() * 10000),
        calories: Math.floor(Math.random() * (300 - 100) + 100),
        temperature: parseFloat((Math.random() * (37.5 - 36.0) + 36.0).toFixed(1)),
        oxygenLevel: Math.floor(Math.random() * (100 - 95) + 95),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleCheckDosha = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dosha-quiz');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-300 to-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-red-300 to-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200 to-transparent animate-gradient-shift opacity-10"></div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tinea (Ringworm)</h1>
          <p className="text-lg text-gray-600">Learn about this common fungal infection and check your symptoms</p>
        </div>

        {/* Information Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">What is Tinea?</h2>
          <p className="text-gray-700 mb-4">
            Tinea, commonly known as ringworm, is a fungal infection that affects the skin. Despite its name, it's not caused by a worm but by a fungus that thrives in warm, moist environments.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Common Types:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li><strong>Tinea Pedis (Athlete's Foot)</strong> - Affects the feet</li>
            <li><strong>Tinea Corporis</strong> - Affects the body</li>
            <li><strong>Tinea Capitis</strong> - Affects the scalp</li>
            <li><strong>Tinea Cruris (Jock Itch)</strong> - Affects the groin area</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Symptoms:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Red, circular rash with raised edges</li>
            <li>Itching and burning sensation</li>
            <li>Scaling and cracking of the skin</li>
            <li>Blistering in severe cases</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Risk Factors:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Warm and humid environments</li>
            <li>Poor hygiene</li>
            <li>Contact with infected individuals</li>
            <li>Weakened immune system</li>
          </ul>
        </div>

        {/* Smartwatch Data Card - Apple Glass Skin */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">📱 Smartwatch Live Data</h2>
              <p className="text-sm text-gray-600 mt-1">Real-time health metrics preview</p>
            </div>
            <div className="text-5xl">⌚</div>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Heart Rate */}
            <div className="group bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-2xl hover:from-white/50 hover:to-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Heart Rate</p>
                  <p className="text-4xl font-bold bg-gradient-to-br from-red-500 to-red-600 bg-clip-text text-transparent mt-2">{smartwatchData.heartRate}</p>
                  <p className="text-xs text-gray-600 mt-1 font-medium">BPM</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">❤️</div>
              </div>
              <div className="mt-4 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-500 shadow-lg shadow-red-500/50"
                  style={{ width: `${(smartwatchData.heartRate / 150) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Steps */}
            <div className="group bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-2xl hover:from-white/50 hover:to-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Steps</p>
                  <p className="text-4xl font-bold bg-gradient-to-br from-green-500 to-green-600 bg-clip-text text-transparent mt-2">{smartwatchData.steps.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 mt-1 font-medium">steps today</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">👟</div>
              </div>
              <div className="mt-4 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500 shadow-lg shadow-green-500/50"
                  style={{ width: `${(smartwatchData.steps / 10000) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Calories */}
            <div className="group bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-2xl hover:from-white/50 hover:to-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Calories</p>
                  <p className="text-4xl font-bold bg-gradient-to-br from-orange-500 to-orange-600 bg-clip-text text-transparent mt-2">{smartwatchData.calories}</p>
                  <p className="text-xs text-gray-600 mt-1 font-medium">kcal burned</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">🔥</div>
              </div>
              <div className="mt-4 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500 shadow-lg shadow-orange-500/50"
                  style={{ width: `${(smartwatchData.calories / 500) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Temperature */}
            <div className="group bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-2xl hover:from-white/50 hover:to-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Temperature</p>
                  <p className="text-4xl font-bold bg-gradient-to-br from-yellow-500 to-yellow-600 bg-clip-text text-transparent mt-2">{smartwatchData.temperature.toFixed(1)}°C</p>
                  <p className="text-xs text-gray-600 mt-1 font-medium">body temp</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">🌡️</div>
              </div>
              <div className="mt-4 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500 shadow-lg shadow-yellow-500/50"
                  style={{ width: `${(smartwatchData.temperature / 40) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Oxygen Level */}
            <div className="group bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-2xl hover:from-white/50 hover:to-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Oxygen Level</p>
                  <p className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 bg-clip-text text-transparent mt-2">{smartwatchData.oxygenLevel}%</p>
                  <p className="text-xs text-gray-600 mt-1 font-medium">SpO₂</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">💨</div>
              </div>
              <div className="mt-4 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50"
                  style={{ width: `${smartwatchData.oxygenLevel}%` }}
                ></div>
              </div>
            </div>

            {/* Status */}
            <div className="group bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-2xl hover:from-white/50 hover:to-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Status</p>
                  <p className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-purple-600 bg-clip-text text-transparent mt-2">Live</p>
                  <p className="text-xs text-green-600 font-semibold mt-1">✓ Connected</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300 animate-pulse">📡</div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600 text-center mt-6 font-medium">Data updates every 2 seconds • This is a live preview simulation</p>
        </div>

        {/* CTA Section with Check Dosha Button */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Concerned About Your Symptoms?</h2>
          <p className="text-orange-100 mb-6">
            Use our advanced dosha analysis to understand your constitution and get personalized recommendations.
          </p>
          <button
            onClick={handleCheckDosha}
            disabled={isLoading}
            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Check Dosha'}
          </button>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Did You Know?</h3>
          <p className="text-blue-800">
            Tinea is highly contagious through direct contact or contaminated surfaces. Keeping skin clean and dry is crucial for prevention and recovery.
          </p>
        </div>
      </div>
    </div>
  );
}
