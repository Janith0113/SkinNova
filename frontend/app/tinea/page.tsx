'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TinePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
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
    <div className={`min-h-screen transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50'
    }`}>
      <div className="max-w-5xl mx-auto">
        {/* Theme Toggle Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-full transition-all duration-300 shadow-lg hover:scale-110 ${
              isDarkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-yellow-300'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Animated Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6 animate-bounce">
            <span className="text-7xl">🦠</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 mb-4">
            Tinea (Ringworm)
          </h1>
          <p className={`text-xl transition-colors duration-300 max-w-2xl mx-auto leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Complete guide to understanding fungal skin infections and recognizing symptoms
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="h-1 w-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
          </div>
        </div>

        {/* Information Section */}
        <div className={`rounded-2xl shadow-2xl p-10 mb-12 border transition-all duration-300 backdrop-blur-xl ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700/50'
            : 'bg-gradient-to-br from-white to-slate-100 border-slate-200'
        }`}>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-4">What is Tinea?</h2>
            <p className={`mb-4 leading-relaxed text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Tinea is a common fungal skin infection caused by dermatophyte fungi. It affects the skin, scalp, nails, and groin and spreads easily through direct contact or shared items.
            </p>
          </div>

          <div className={`h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-8 transition-colors duration-300 ${
            isDarkMode ? 'via-slate-600' : 'via-slate-300'
          }`}></div>

          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-8 mt-10">Types of Tinea & How to Identify Them</h2>

          {/* Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Type 1: Tinea Corporis */}
            <div className={`border rounded-xl p-6 hover:transition-all duration-300 hover:shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-orange-500/30 hover:border-orange-500/60 hover:shadow-orange-500/20'
                : 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-300/60 hover:border-orange-500 hover:shadow-orange-300/30'
            }`}>
              <div className="flex items-start gap-4">
                <span className="text-4xl">1️⃣</span>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-orange-400' : 'text-orange-600'
                  }`}>Tinea Corporis</h3>
                  <p className={`text-sm mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}><strong>Ringworm of the Body</strong></p>
                  <p className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>📍 Arms, legs, chest, back</p>
                  <p className={`text-xs mb-2 font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Identifying signs:</p>
                  <ul className="space-y-1">
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Circular or ring-shaped red rash</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Clear center with raised, scaly edges</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Itching and mild burning</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Type 2: Tinea Cruris */}
            <div className={`border rounded-xl p-6 hover:transition-all duration-300 hover:shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-red-500/30 hover:border-red-500/60 hover:shadow-red-500/20'
                : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-300/60 hover:border-red-500 hover:shadow-red-300/30'
            }`}>
              <div className="flex items-start gap-4">
                <span className="text-4xl">2️⃣</span>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>Tinea Cruris</h3>
                  <p className={`text-sm mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}><strong>Jock Itch</strong></p>
                  <p className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>📍 Groin, inner thighs</p>
                  <p className={`text-xs mb-2 font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Identifying signs:</p>
                  <ul className="space-y-1">
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Red, itchy rash in groin area</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Clear border with scaling</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Often worse with sweating</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Type 3: Tinea Pedis */}
            <div className={`border rounded-xl p-6 hover:transition-all duration-300 hover:shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-yellow-500/20'
                : 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-300/60 hover:border-yellow-500 hover:shadow-yellow-300/30'
            }`}>
              <div className="flex items-start gap-4">
                <span className="text-4xl">3️⃣</span>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>Tinea Pedis</h3>
                  <p className={`text-sm mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}><strong>Athlete's Foot</strong></p>
                  <p className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>📍 Feet (between toes, soles)</p>
                  <p className={`text-xs mb-2 font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Identifying signs:</p>
                  <ul className="space-y-1">
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Itching, burning between toes</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Cracked, peeling skin</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ White, soggy skin between toes</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Type 4: Tinea Capitis */}
            <div className={`border rounded-xl p-6 hover:transition-all duration-300 hover:shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-blue-500/30 hover:border-blue-500/60 hover:shadow-blue-500/20'
                : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-300/60 hover:border-blue-500 hover:shadow-blue-300/30'
            }`}>
              <div className="flex items-start gap-4">
                <span className="text-4xl">4️⃣</span>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>Tinea Capitis</h3>
                  <p className={`text-sm mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}><strong>Scalp Ringworm</strong></p>
                  <p className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>📍 Scalp (common in children)</p>
                  <p className={`text-xs mb-2 font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Identifying signs:</p>
                  <ul className="space-y-1">
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Scaly patches on scalp</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Hair loss or broken hair</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Sometimes swelling or pus</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Type 5: Tinea Unguium */}
            <div className={`border rounded-xl p-6 hover:transition-all duration-300 hover:shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-purple-500/30 hover:border-purple-500/60 hover:shadow-purple-500/20'
                : 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-300/60 hover:border-purple-500 hover:shadow-purple-300/30'
            }`}>
              <div className="flex items-start gap-4">
                <span className="text-4xl">5️⃣</span>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>Tinea Unguium</h3>
                  <p className={`text-sm mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}><strong>Nail Fungus</strong></p>
                  <p className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>📍 Fingernails or toenails</p>
                  <p className={`text-xs mb-2 font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Identifying signs:</p>
                  <ul className="space-y-1">
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Thick, yellow or white nails</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Brittle or crumbling nails</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Nail separates from bed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Type 6: Tinea Faciei */}
            <div className={`border rounded-xl p-6 hover:transition-all duration-300 hover:shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-pink-500/30 hover:border-pink-500/60 hover:shadow-pink-500/20'
                : 'bg-gradient-to-br from-pink-50 to-pink-100/50 border-pink-300/60 hover:border-pink-500 hover:shadow-pink-300/30'
            }`}>
              <div className="flex items-start gap-4">
                <span className="text-4xl">6️⃣</span>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-600'
                  }`}>Tinea Faciei</h3>
                  <p className={`text-sm mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}><strong>Face Ringworm</strong></p>
                  <p className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>📍 Face (excluding beard)</p>
                  <p className={`text-xs mb-2 font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Identifying signs:</p>
                  <ul className="space-y-1">
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Red, scaly patches on face</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Itching or mild pain</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ May look like eczema</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Type 7: Tinea Barbae */}
            <div className={`border rounded-xl p-6 hover:transition-all duration-300 hover:shadow-lg md:col-span-2 lg:col-span-1 ${
              isDarkMode
                ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-green-500/30 hover:border-green-500/60 hover:shadow-green-500/20'
                : 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-300/60 hover:border-green-500 hover:shadow-green-300/30'
            }`}>
              <div className="flex items-start gap-4">
                <span className="text-4xl">7️⃣</span>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>Tinea Barbae</h3>
                  <p className={`text-sm mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}><strong>Beard Ringworm</strong></p>
                  <p className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>📍 Beard & mustache (men)</p>
                  <p className={`text-xs mb-2 font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Identifying signs:</p>
                  <ul className="space-y-1">
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Red, swollen patches</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Hair breaks easily</li>
                    <li className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>✓ Sometimes painful nodules</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className={`h-px bg-gradient-to-r from-transparent to-transparent my-8 transition-colors duration-300 ${
            isDarkMode ? 'via-slate-600' : 'via-slate-300'
          }`}></div>

          {/* Diagnosis Section */}
          <div className="mb-8">
            <h3 className={`text-2xl font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
              isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
            }`}>🧪 Medical Diagnosis Methods</h3>
            <div className={`border rounded-lg p-6 transition-all duration-300 ${
              isDarkMode
                ? 'bg-slate-700/30 border-cyan-500/30'
                : 'bg-cyan-50/30 border-cyan-300/60'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <p className={`font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>Visual Examination</p>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Initial assessment by healthcare provider</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🧬</span>
                  <div>
                    <p className={`font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>KOH Skin Test</p>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Potassium hydroxide scraping analysis</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔬</span>
                  <div>
                    <p className={`font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>Fungal Culture</p>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Laboratory cultivation and identification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className={`font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>Wood's Lamp</p>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Ultraviolet light examination</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Check */}
          <div className="mb-8">
            <h3 className={`text-2xl font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}>⚠️ Quick Symptom Checker</h3>
            <div className={`border rounded-lg p-6 transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/40'
                : 'bg-gradient-to-br from-red-100/40 to-orange-100/40 border-red-300/60'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-red-500/10'
                    : 'bg-red-200/30'
                }`}>
                  <span className="text-2xl">✔️</span>
                  <span className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>Circular or ring-shaped rash</span>
                </div>
                <div className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-red-500/10'
                    : 'bg-red-200/30'
                }`}>
                  <span className="text-2xl">✔️</span>
                  <span className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>Red & scaly border</span>
                </div>
                <div className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-red-500/10'
                    : 'bg-red-200/30'
                }`}>
                  <span className="text-2xl">✔️</span>
                  <span className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>Persistent itching</span>
                </div>
                <div className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-red-500/10'
                    : 'bg-red-200/30'
                }`}>
                  <span className="text-2xl">✔️</span>
                  <span className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>Spreads slowly over time</span>
                </div>
                <div className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-300 md:col-span-2 ${
                  isDarkMode
                    ? 'bg-red-500/10'
                    : 'bg-red-200/30'
                }`}>
                  <span className="text-2xl">✔️</span>
                  <span className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>Worsens with moisture & humidity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prevention Tips */}
          <div>
            <h3 className={`text-2xl font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
              isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`}>🛡️ Prevention & Protection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`border rounded-lg p-5 hover:transition-all transition-all duration-300 ${
                isDarkMode
                  ? 'bg-emerald-900/20 border-emerald-500/40 hover:bg-emerald-900/30'
                  : 'bg-emerald-100/40 border-emerald-300/60 hover:bg-emerald-100/60'
              }`}>
                <div className="flex gap-3">
                  <span className="text-3xl">🧼</span>
                  <div>
                    <p className={`font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>Keep Clean & Dry</p>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Wash thoroughly and dry all skin folds</p>
                  </div>
                </div>
              </div>
              <div className={`border rounded-lg p-5 hover:transition-all transition-all duration-300 ${
                isDarkMode
                  ? 'bg-emerald-900/20 border-emerald-500/40 hover:bg-emerald-900/30'
                  : 'bg-emerald-100/40 border-emerald-300/60 hover:bg-emerald-100/60'
              }`}>
                <div className="flex gap-3">
                  <span className="text-3xl">🚫</span>
                  <div>
                    <p className={`font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>Avoid Sharing</p>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Don't share towels, clothes, or items</p>
                  </div>
                </div>
              </div>
              <div className={`border rounded-lg p-5 hover:transition-all transition-all duration-300 ${
                isDarkMode
                  ? 'bg-emerald-900/20 border-emerald-500/40 hover:bg-emerald-900/30'
                  : 'bg-emerald-100/40 border-emerald-300/60 hover:bg-emerald-100/60'
              }`}>
                <div className="flex gap-3">
                  <span className="text-3xl">👕</span>
                  <div>
                    <p className={`font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>Wear Breathable</p>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Choose loose, moisture-wicking clothes</p>
                  </div>
                </div>
              </div>
              <div className={`border rounded-lg p-5 hover:transition-all transition-all duration-300 ${
                isDarkMode
                  ? 'bg-emerald-900/20 border-emerald-500/40 hover:bg-emerald-900/30'
                  : 'bg-emerald-100/40 border-emerald-300/60 hover:bg-emerald-100/60'
              }`}>
                <div className="flex gap-3">
                  <span className="text-3xl">🦶</span>
                  <div>
                    <p className={`font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>Dry Feet Well</p>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Thoroughly dry feet after bathing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smartwatch Data Card */}
        <div className={`rounded-2xl shadow-2xl p-10 mb-12 border transition-all duration-300 backdrop-blur-xl ${
          isDarkMode
            ? 'bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border-indigo-500/30'
            : 'bg-gradient-to-br from-indigo-100/40 to-blue-100/40 border-indigo-300/60'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className={`text-3xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-indigo-300' : 'text-indigo-700'
              }`}>📱 Health Monitoring</h2>
              <p className={`text-sm transition-colors duration-300 mt-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Real-time health metrics tracking</p>
            </div>
            <div className="text-5xl animate-pulse">⌚</div>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Heart Rate */}
            <div className={`border rounded-xl p-6 backdrop-blur-sm hover:transition-all transition-all duration-300 hover:shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-red-900/40 to-red-900/20 border-red-500/50 hover:border-red-500 hover:shadow-red-500/20'
                : 'bg-gradient-to-br from-red-100/40 to-red-100/20 border-red-300/60 hover:border-red-500 hover:shadow-red-300/30'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Heart Rate</p>
                  <p className={`text-4xl font-bold mt-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>{smartwatchData.heartRate}</p>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}>BPM</p>
                </div>
                <div className="text-3xl">❤️</div>
              </div>
              <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
                isDarkMode ? 'bg-slate-700/50' : 'bg-slate-300/50'
              }`}>
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(smartwatchData.heartRate / 150) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Steps */}
            <div className={`border rounded-xl p-6 backdrop-blur-sm hover:transition-all transition-all duration-300 hover:shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-green-900/40 to-green-900/20 border-green-500/50 hover:border-green-500 hover:shadow-green-500/20'
                : 'bg-gradient-to-br from-green-100/40 to-green-100/20 border-green-300/60 hover:border-green-500 hover:shadow-green-300/30'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Steps</p>
                  <p className={`text-4xl font-bold mt-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>{(smartwatchData.steps / 1000).toFixed(1)}k</p>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}>steps today</p>
                </div>
                <div className="text-3xl">👟</div>
              </div>
              <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
                isDarkMode ? 'bg-slate-700/50' : 'bg-slate-300/50'
              }`}>
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(smartwatchData.steps / 10000) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Calories */}
            <div className={`border rounded-xl p-6 backdrop-blur-sm hover:transition-all transition-all duration-300 hover:shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-orange-900/40 to-orange-900/20 border-orange-500/50 hover:border-orange-500 hover:shadow-orange-500/20'
                : 'bg-gradient-to-br from-orange-100/40 to-orange-100/20 border-orange-300/60 hover:border-orange-500 hover:shadow-orange-300/30'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Calories</p>
                  <p className={`text-4xl font-bold mt-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-orange-400' : 'text-orange-600'
                  }`}>{smartwatchData.calories}</p>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}>kcal burned</p>
                </div>
                <div className="text-3xl">🔥</div>
              </div>
              <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
                isDarkMode ? 'bg-slate-700/50' : 'bg-slate-300/50'
              }`}>
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(smartwatchData.calories / 500) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Temperature */}
            <div className={`border rounded-xl p-6 backdrop-blur-sm hover:transition-all transition-all duration-300 hover:shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-yellow-900/40 to-yellow-900/20 border-yellow-500/50 hover:border-yellow-500 hover:shadow-yellow-500/20'
                : 'bg-gradient-to-br from-yellow-100/40 to-yellow-100/20 border-yellow-300/60 hover:border-yellow-500 hover:shadow-yellow-300/30'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Temperature</p>
                  <p className={`text-4xl font-bold mt-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>{smartwatchData.temperature.toFixed(1)}°C</p>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}>body temp</p>
                </div>
                <div className="text-3xl">🌡️</div>
              </div>
              <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
                isDarkMode ? 'bg-slate-700/50' : 'bg-slate-300/50'
              }`}>
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(smartwatchData.temperature / 40) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Oxygen Level */}
            <div className={`border rounded-xl p-6 backdrop-blur-sm hover:transition-all transition-all duration-300 hover:shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-blue-900/40 to-blue-900/20 border-blue-500/50 hover:border-blue-500 hover:shadow-blue-500/20'
                : 'bg-gradient-to-br from-blue-100/40 to-blue-100/20 border-blue-300/60 hover:border-blue-500 hover:shadow-blue-300/30'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Oxygen Level</p>
                  <p className={`text-4xl font-bold mt-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>{smartwatchData.oxygenLevel}%</p>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}>SpO₂</p>
                </div>
                <div className="text-3xl">💨</div>
              </div>
              <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
                isDarkMode ? 'bg-slate-700/50' : 'bg-slate-300/50'
              }`}>
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${smartwatchData.oxygenLevel}%` }}
                ></div>
              </div>
            </div>

            {/* Connection Status */}
            <div className={`border rounded-xl p-6 backdrop-blur-sm hover:transition-all transition-all duration-300 hover:shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-br from-purple-900/40 to-purple-900/20 border-purple-500/50 hover:border-purple-500 hover:shadow-purple-500/20'
                : 'bg-gradient-to-br from-purple-100/40 to-purple-100/20 border-purple-300/60 hover:border-purple-500 hover:shadow-purple-300/30'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Status</p>
                  <p className={`text-3xl font-bold mt-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>Live</p>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>✓ Connected</p>
                </div>
                <div className="text-3xl animate-pulse">📡</div>
              </div>
              <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
                isDarkMode ? 'bg-slate-700/50' : 'bg-slate-300/50'
              }`}>
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full"
                  style={{ width: `100%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className={`mt-6 p-4 border rounded-lg text-center transition-all duration-300 ${
            isDarkMode
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-slate-200/50 border-slate-300'
          }`}>
            <p className={`text-xs transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>📊 Data updates every 2 seconds • Simulated live preview</p>
          </div>
        </div>

        {/* CTA Section with Check Dosha Button */}
        <div className={`rounded-2xl shadow-2xl p-10 text-center border backdrop-blur-xl mb-12 transition-all duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 border-red-500/50'
            : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 border-red-300/50'
        }`}>
          <h2 className="text-3xl font-bold text-white mb-4">Concerned About Your Symptoms?</h2>
          <p className={`mb-8 text-lg leading-relaxed max-w-2xl mx-auto transition-colors duration-300 ${
            isDarkMode ? 'text-orange-100' : 'text-white/90'
          }`}>
            Use our advanced dosha analysis to understand your constitution and receive personalized health recommendations tailored to you.
          </p>
          <button
            onClick={handleCheckDosha}
            disabled={isLoading}
            className={`px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl hover:scale-105 transform ${
              isDarkMode
                ? 'bg-white text-orange-600 hover:bg-orange-50'
                : 'bg-white text-orange-600 hover:bg-orange-50'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Loading...
              </span>
            ) : (
              '✨ Check Your Dosha'
            )}
          </button>
        </div>

        {/* Additional Info */}
        <div className={`border-l-4 rounded-xl p-8 backdrop-blur-xl transition-all duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-br from-blue-900/40 to-blue-900/20 border-l-blue-500'
            : 'bg-gradient-to-br from-blue-100/40 to-blue-100/20 border-l-blue-400'
        }`}>
          <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
            isDarkMode ? 'text-blue-300' : 'text-blue-700'
          }`}>💡 Did You Know?</h3>
          <p className={`leading-relaxed transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Tinea is highly contagious through direct contact or contaminated surfaces. Keeping your skin clean, dry, and maintaining good personal hygiene practices is crucial for both prevention and recovery from fungal infections.
          </p>
        </div>
      </div>
    </div>
  );
}
