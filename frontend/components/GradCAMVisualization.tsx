'use client';

import { useState, useMemo } from 'react';

interface GradCAMData {
  questionId: number;
  question: string;
  selectedAnswer: string;
  gradcamScore: number;
  featureImportance: {
    [key: string]: number;
  };
  explanation: string;
}

interface GradCAMVisualizationProps {
  doshaType: 'vata' | 'pitta' | 'kapha';
  gradcamData: GradCAMData[];
  totalScore: number;
}

const GradCAMVisualization: React.FC<GradCAMVisualizationProps> = ({
  doshaType,
  gradcamData,
  totalScore,
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'detailed'>('heatmap');

  const doshaColors = {
    vata: 'from-blue-500 to-cyan-500',
    pitta: 'from-orange-500 to-red-500',
    kapha: 'from-green-500 to-emerald-500',
  };

  const doshaAccent = {
    vata: 'bg-blue-500/30 border-blue-500',
    pitta: 'bg-orange-500/30 border-orange-500',
    kapha: 'bg-green-500/30 border-green-500',
  };

  // Calculate normalized importance scores
  const normalizedImportance = useMemo(() => {
    return gradcamData.map((data) => {
      const maxScore = Math.max(...Object.values(data.featureImportance));
      const normalized = Object.entries(data.featureImportance).reduce(
        (acc, [key, value]) => {
          acc[key] = maxScore > 0 ? (value / maxScore) * 100 : 0;
          return acc;
        },
        {} as Record<string, number>
      );
      return { ...data, normalizedImportance: normalized };
    });
  }, [gradcamData]);

  const getIntensityColor = (value: number): string => {
    if (value < 20) return 'from-blue-900 to-blue-700';
    if (value < 40) return 'from-blue-700 to-blue-500';
    if (value < 60) return 'from-purple-500 to-pink-500';
    if (value < 80) return 'from-pink-500 to-red-500';
    return 'from-red-600 to-red-500';
  };

  const getTextColor = (value: number): string => {
    return value > 50 ? 'text-white' : 'text-gray-900';
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className={`bg-gradient-to-r ${doshaColors[doshaType]} rounded-lg p-6 text-white shadow-lg`}>
        <h3 className="text-2xl font-bold mb-2">🧠 AI Decision Explanation (GradCAM)</h3>
        <p className="text-sm opacity-90 mb-4">
          Shows which answers had the most influence on identifying your {doshaType.charAt(0).toUpperCase() + doshaType.slice(1)} dosha
        </p>

        {/* View Mode Toggle */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              viewMode === 'heatmap'
                ? 'bg-white/20 border border-white'
                : 'bg-white/10 border border-white/30 hover:bg-white/15'
            }`}
          >
            🔥 Heat Map View
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              viewMode === 'detailed'
                ? 'bg-white/20 border border-white'
                : 'bg-white/10 border border-white/30 hover:bg-white/15'
            }`}
          >
            📊 Detailed Analysis
          </button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${doshaAccent[doshaType]} border rounded-lg p-4`}>
          <p className="text-gray-400 text-sm mb-1">Overall Impact Score</p>
          <p className="text-3xl font-bold text-white">{totalScore.toFixed(1)}%</p>
          <p className="text-xs text-gray-300 mt-2">Model confidence</p>
        </div>

        <div className={`${doshaAccent[doshaType]} border rounded-lg p-4`}>
          <p className="text-gray-400 text-sm mb-1">Contributing Answers</p>
          <p className="text-3xl font-bold text-white">{gradcamData.length}</p>
          <p className="text-xs text-gray-300 mt-2">Out of total questions</p>
        </div>

        <div className={`${doshaAccent[doshaType]} border rounded-lg p-4`}>
          <p className="text-gray-400 text-sm mb-1">Top Influence</p>
          <p className="text-3xl font-bold text-white">
            {Math.max(...gradcamData.map((d) => d.gradcamScore)).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-300 mt-2">Maximum factor weight</p>
        </div>
      </div>

      {/* Heatmap View */}
      {viewMode === 'heatmap' && (
        <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4">
          <h4 className="text-lg font-bold text-white mb-6">Answer Contribution Heatmap</h4>

          {normalizedImportance.map((data, index) => (
            <div key={data.questionId} className="space-y-2">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Q{index + 1}: {data.question}</p>
                  <p className="text-xs text-gray-400 mt-1">Your answer: "{data.selectedAnswer}"</p>
                </div>
                <span className="text-xs font-bold text-pink-400 ml-4">{data.gradcamScore.toFixed(1)}%</span>
              </div>

              <div className="flex gap-2 items-stretch h-8">
                {Object.entries(data.normalizedImportance).map(([feature, importance]) => (
                  <div
                    key={feature}
                    className={`flex-1 rounded-md transition-all relative group bg-gradient-to-r ${getIntensityColor(
                      importance
                    )}`}
                    style={{ opacity: Math.max(0.3, importance / 100) }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                      {feature}: {importance.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-3 font-semibold">Intensity Legend:</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { range: '0-20%', color: 'from-blue-900 to-blue-700' },
                { range: '20-40%', color: 'from-blue-700 to-blue-500' },
                { range: '40-60%', color: 'from-purple-500 to-pink-500' },
                { range: '60-80%', color: 'from-pink-500 to-red-500' },
                { range: '80-100%', color: 'from-red-600 to-red-500' },
              ].map((item) => (
                <div key={item.range} className="flex flex-col items-center">
                  <div className={`w-full h-6 rounded bg-gradient-to-r ${item.color} mb-1`}></div>
                  <span className="text-xs text-gray-400">{item.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analysis View */}
      {viewMode === 'detailed' && (
        <div className="space-y-3">
          {normalizedImportance.map((data) => (
            <div key={data.questionId} className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedQuestion(expandedQuestion === data.questionId ? null : data.questionId)}
                className="w-full p-4 text-left hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Q{data.questionId}: {data.question}</p>
                    <p className="text-xs text-gray-400 mt-1">Answer: "{data.selectedAnswer}"</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{data.gradcamScore.toFixed(0)}%</span>
                      </div>
                    </div>
                    <span className="text-white text-xl">{expandedQuestion === data.questionId ? '▼' : '▶'}</span>
                  </div>
                </div>
              </button>

              {expandedQuestion === data.questionId && (
                <div className="p-4 bg-white/5 border-t border-white/10 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-white mb-3">Feature Weights:</p>
                    <div className="space-y-2">
                      {Object.entries(data.normalizedImportance)
                        .sort(([, a], [, b]) => b - a)
                        .map(([feature, importance]) => (
                          <div key={feature} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-300">{feature}</span>
                              <span className="text-pink-400 font-bold">{importance.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/5">
                              <div
                                className={`h-2 bg-gradient-to-r ${getIntensityColor(importance)} rounded-full`}
                                style={{ width: `${importance}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <p className="text-xs text-gray-300 leading-relaxed">{data.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Information Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-xs text-blue-200">
          <span className="font-semibold">💡 How to read this:</span> Lighter areas show less influence on the model's decision, while darker/hotter colors indicate features that heavily contributed to classifying you as a {doshaType.charAt(0).toUpperCase() + doshaType.slice(1)} dosha type.
        </p>
      </div>
    </div>
  );
};

export default GradCAMVisualization;
