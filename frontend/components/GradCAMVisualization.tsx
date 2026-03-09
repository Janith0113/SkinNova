'use client';

import React from 'react';

interface GradCAMVisualizationProps {
  doshaType: 'vata' | 'pitta' | 'kapha';
  gradcamData: any;
  totalScore: number;
}

export default function GradCAMVisualization({
  doshaType,
  gradcamData,
  totalScore,
}: GradCAMVisualizationProps) {
  const doshaColors: Record<string, string> = {
    vata: 'from-blue-500 to-cyan-500',
    pitta: 'from-red-500 to-orange-500',
    kapha: 'from-green-500 to-emerald-500',
  };

  const doshaEmojis: Record<string, string> = {
    vata: '🌬️',
    pitta: '🔥',
    kapha: '💧',
  };

  return (
    <div className={`bg-gradient-to-r ${doshaColors[doshaType]} rounded-xl p-8 shadow-2xl mt-8`}>
      <div className="text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">{doshaEmojis[doshaType]}</span>
          <div>
            <h3 className="text-2xl font-bold capitalize">
              {doshaType} Analysis
            </h3>
            <p className="text-white/80">
              Confidence Score: {totalScore.toFixed(1)}%
            </p>
          </div>
        </div>

        {gradcamData && (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-semibold opacity-95">
              Key influencing factors:
            </p>
            {Array.isArray(gradcamData) && gradcamData.length > 0 && (
              <div className="space-y-3">
                {gradcamData.slice(0, 5).map((item: any, idx: number) => (
                  <div key={idx} className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="font-medium text-sm flex-1">{item.question || `Question ${item.questionId}`}</span>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">{item.gradcamScore?.toFixed(1) || 0}/100</span>
                    </div>
                    <p className="text-xs opacity-90 mb-2">Answer: {item.selectedAnswer}</p>
                    <p className="text-xs opacity-75">{item.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
