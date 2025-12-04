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
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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

        {/* Smartwatch Data Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow-lg p-8 mb-8 border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">📱 Smartwatch Live Data</h2>
              <p className="text-sm text-gray-600 mt-1">Real-time health metrics preview</p>
            </div>
            <div className="text-4xl">⌚</div>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Heart Rate */}
            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Heart Rate</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{smartwatchData.heartRate}</p>
                  <p className="text-xs text-gray-500 mt-1">BPM</p>
                </div>
                <div className="text-4xl">❤️</div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-red-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${(smartwatchData.heartRate / 150) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Steps */}
            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Steps</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{smartwatchData.steps.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">steps today</p>
                </div>
                <div className="text-4xl">👟</div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${(smartwatchData.steps / 10000) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Calories */}
            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Calories</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{smartwatchData.calories}</p>
                  <p className="text-xs text-gray-500 mt-1">kcal burned</p>
                </div>
                <div className="text-4xl">🔥</div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-orange-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${(smartwatchData.calories / 500) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Temperature */}
            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Temperature</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{smartwatchData.temperature.toFixed(1)}°C</p>
                  <p className="text-xs text-gray-500 mt-1">body temp</p>
                </div>
                <div className="text-4xl">🌡️</div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-yellow-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${(smartwatchData.temperature / 40) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Oxygen Level */}
            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Oxygen Level</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{smartwatchData.oxygenLevel}%</p>
                  <p className="text-xs text-gray-500 mt-1">SpO₂</p>
                </div>
                <div className="text-4xl">💨</div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${smartwatchData.oxygenLevel}%` }}
                ></div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Status</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">Live</p>
                  <p className="text-xs text-green-500 mt-1">✓ Connected</p>
                </div>
                <div className="text-4xl animate-pulse">📡</div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600 text-center mt-4">Data updates every 2 seconds • This is a live preview simulation</p>
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
