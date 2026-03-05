'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FuturePredictionResult {
  prediction: string;
  tineaType?: string;
  confidence?: number;
  dateOfBirth: string;
  birthTime?: string;
  birthVenue?: string;
}

export default function FutureTineaPage() {
  const [symptoms, setSymptoms] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthVenue, setBirthVenue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FuturePredictionResult | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(true);

  const handleGeneratePrediction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateOfBirth) {
      setError('Please fill in your date of birth');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/gemini/tinea-future-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms || 'Not specified',
          dateOfBirth,
          birthTime: birthTime || 'Not specified',
          birthVenue: birthVenue || 'Not specified',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate future prediction');
      }

      const data = await response.json();
      setResult({
        prediction: data.prediction,
        tineaType: data.tineaType,
        confidence: data.confidence,
        dateOfBirth: data.dateOfBirth,
        birthTime: data.birthTime,
        birthVenue: data.birthVenue,
      });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSymptoms('');
    setDateOfBirth('');
    setBirthTime('');
    setBirthVenue('');
    setResult(null);
    setError('');
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-800 font-semibold mb-6 transition-colors">
            ← Back Home
          </Link>
          <div className="mb-4">
            <span className="text-6xl">🔮</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Future Tinea Health Prediction</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Discover your personalized future health predictions based on your birth details and current Tinea condition. Get AI-powered insights on health risks and solutions.
          </p>
        </div>

        {showForm ? (
          // Form Section
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-purple-200 mb-8">
            <form onSubmit={handleGeneratePrediction} className="space-y-6">
              {/* Birth Details Section */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📅 Birth Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      📆 Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-gray-900 font-medium transition-colors bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      🕐 Birth Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-gray-900 font-medium transition-colors bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      🌍 Birth City/Venue (Optional)
                    </label>
                    <input
                      type="text"
                      value={birthVenue}
                      onChange={(e) => setBirthVenue(e.target.value)}
                      placeholder="e.g., New York, USA"
                      className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-gray-900 font-medium transition-colors bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Symptoms Input */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  🩺 Additional Symptoms (Optional)
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g., itching, redness, burning sensation, scaling, blistering..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-gray-900 resize-none transition-colors bg-white"
                />
              </div>

              {error && (
                <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4">
                  <p className="text-red-800 font-semibold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {loading ? (
                  <span>🔮 Generating Your Future Health Prediction...</span>
                ) : (
                  <span>🔮 Get My Future Health Prediction</span>
                )}
              </button>
            </form>
          </div>
        ) : result ? (
          // Results Section
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Birth Details Summary Card */}
            <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-3xl shadow-2xl p-8 text-white border border-white/40">
              <div className="mb-6">
                <p className="text-sm font-semibold text-purple-100 mb-3">📋 YOUR BIRTH DETAILS</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-purple-100">Date of Birth:</p>
                    <p className="font-bold text-lg">{result.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-purple-100">Birth Time:</p>
                    <p className="font-bold">{result.birthTime || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-purple-100">Birth Venue:</p>
                    <p className="font-bold">{result.birthVenue || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Prediction Section */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🔮</span>
                <h2 className="text-3xl font-bold text-gray-900">Your Future Health Prediction & Solutions</h2>
              </div>

              {/* Render prediction with formatting */}
              <div className="space-y-4 text-gray-800 leading-relaxed">
                {result.prediction.split('\n').map((section, idx) => {
                  // Check if line is a header (contains ** markers or numbered headers)
                  if (section.includes('**') || /^\d+\./.test(section.trim())) {
                    const cleanText = section.replace(/\*\*/g, '').trim();
                    return (
                      <div key={idx}>
                        <h3 className="text-lg font-bold text-purple-700 mt-5 mb-3 flex items-center gap-2">
                          {getIconForSection(cleanText)}
                          {cleanText}
                        </h3>
                      </div>
                    );
                  } else if (section.trim()) {
                    // Regular text lines
                    return (
                      <p key={idx} className="mb-2">
                        {section.trim()}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Key Insights Section */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                ⭐ Quick Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                  <p className="text-sm font-semibold text-purple-700 mb-2">🎯 Main Recommendation</p>
                  <p className="text-gray-700">Consult a healthcare provider and follow the personalized health plan above</p>
                </div>
                <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-sm font-semibold text-blue-700 mb-2">🛡️ Prevention Focus</p>
                  <p className="text-gray-700">Follow the preventive strategies outlined in your prediction for long-term health</p>
                </div>
                <div className="bg-white rounded-lg p-4 border-l-4 border-pink-500">
                  <p className="text-sm font-semibold text-pink-700 mb-2">📈 Future Outlook</p>
                  <p className="text-gray-700">Monitor milestones and maintain healthy practices to improve overall immunity</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleReset}
                className="px-8 py-4 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700 transition-all transform hover:scale-105"
              >
                🔄 New Prediction
              </button>
              <Link
                href="/tinea"
                className="px-8 py-4 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all transform hover:scale-105 text-center"
              >
                📸 Detect Tinea
              </Link>
              <Link
                href="/"
                className="px-8 py-4 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all transform hover:scale-105 text-center"
              >
                🏠 Home
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Helper function to get icons for different sections
function getIconForSection(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('outlook') || lower.includes('future')) return '🔮';
  if (lower.includes('risk') || lower.includes('alert')) return '⚠️';
  if (lower.includes('treatment') || lower.includes('solution')) return '💊';
  if (lower.includes('prevention')) return '🛡️';
  if (lower.includes('lifestyle')) return '🏃';
  if (lower.includes('immunity') || lower.includes('immune')) return '💪';
  if (lower.includes('doctor') || lower.includes('medical') || lower.includes('when')) return '👨‍⚕️';
  if (lower.includes('recovery') || lower.includes('timeline') || lower.includes('milestones')) return '📅';
  if (lower.includes('constitution') || lower.includes('optimal')) return '⚡';
  if (lower.includes('guidance') || lower.includes('summary')) return '📋';
  if (lower.includes('supplement') || lower.includes('food')) return '🥗';
  return '📍';
}
