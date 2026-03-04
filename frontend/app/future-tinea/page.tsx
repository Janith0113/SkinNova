'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PredictionResult {
  health: string;
  wealth: string;
  relationships: string;
  career: string;
  personalGrowth: string;
  recommendations: string[];
  fullPrediction: string;
}

export default function FutureTineaPage() {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthVenue, setBirthVenue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState('');

  const handleGeneratePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dateOfBirth || !birthTime || !birthVenue) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-future-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateOfBirth,
          birthTime,
          birthVenue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prediction');
      }

      const data = await response.json();
      setResult(data.prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDateOfBirth('');
    setBirthTime('');
    setBirthVenue('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-300 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-800 font-semibold mb-6 transition-colors">
            ← Back Home
          </Link>
          <div className="mb-4">
            <span className="text-6xl">🔮</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Your Future Tinea Page</h1>
          <p className="text-xl text-gray-700">
            Discover personalized predictions about your health, wealth, and future based on your birth details
          </p>
        </div>

        {!result ? (
          // Form Section
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/40 mb-8">
            <form onSubmit={handleGeneratePrediction} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  📅 Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:outline-none text-gray-900 font-medium transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  ⏰ Birth Time
                </label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:outline-none text-gray-900 font-medium transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  🌍 Birth Venue (City/Location)
                </label>
                <input
                  type="text"
                  value={birthVenue}
                  onChange={(e) => setBirthVenue(e.target.value)}
                  placeholder="e.g., New York, USA"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:outline-none text-gray-900 font-medium transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-100 border-2 border-red-400 rounded-xl p-4">
                  <p className="text-red-800 font-semibold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {loading ? '✨ Generating Your Future...' : '🔮 Generate My Future Prediction'}
              </button>
            </form>
          </div>
        ) : (
          // Results Section
          <div className="space-y-6 animate-fade-in">
            {/* Main Prediction Card */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 text-white border border-white/40">
              <div className="mb-6">
                <p className="text-sm font-semibold text-indigo-100 mb-2">BIRTH DETAILS</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-indigo-100">Date:</p>
                    <p className="font-bold">{dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-indigo-100">Time:</p>
                    <p className="font-bold">{birthTime}</p>
                  </div>
                  <div>
                    <p className="text-indigo-100">Venue:</p>
                    <p className="font-bold">{birthVenue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Prediction */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-green-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💚</span>
                <h3 className="text-2xl font-bold text-gray-900">Health Prediction</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{result.health}</p>
            </div>

            {/* Wealth Prediction */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-yellow-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💰</span>
                <h3 className="text-2xl font-bold text-gray-900">Wealth Prediction</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{result.wealth}</p>
            </div>

            {/* Relationships */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-pink-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💕</span>
                <h3 className="text-2xl font-bold text-gray-900">Relationships</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{result.relationships}</p>
            </div>

            {/* Career */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-blue-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎯</span>
                <h3 className="text-2xl font-bold text-gray-900">Career & Success</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{result.career}</p>
            </div>

            {/* Personal Growth */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-purple-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🌟</span>
                <h3 className="text-2xl font-bold text-gray-900">Personal Growth</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{result.personalGrowth}</p>
            </div>

            {/* Recommendations */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-indigo-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📋</span>
                <h3 className="text-2xl font-bold text-gray-900">Recommendations</h3>
              </div>
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-700">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Full Prediction */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-8 border-2 border-indigo-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🔮 Complete Prediction</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.fullPrediction}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg transition-all transform hover:scale-105"
              >
                🔄 Generate New Prediction
              </button>
              <Link href="/" className="flex-1">
                <button className="w-full px-8 py-4 rounded-xl bg-gray-600 text-white font-bold hover:bg-gray-700 transition-all transform hover:scale-105">
                  🏠 Back to Home
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
