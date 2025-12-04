'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    dosha: 'vata' | 'pitta' | 'kapha';
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: 'What is your body frame?',
    options: [
      { text: 'Thin, light build', dosha: 'vata' },
      { text: 'Medium, muscular build', dosha: 'pitta' },
      { text: 'Heavy, sturdy build', dosha: 'kapha' },
    ],
  },
  {
    id: 2,
    question: 'How would you describe your skin?',
    options: [
      { text: 'Dry, thin, cool', dosha: 'vata' },
      { text: 'Warm, oily, sensitive', dosha: 'pitta' },
      { text: 'Thick, moist, cool', dosha: 'kapha' },
    ],
  },
  {
    id: 3,
    question: 'What is your appetite like?',
    options: [
      { text: 'Irregular, easily skips meals', dosha: 'vata' },
      { text: 'Strong, must eat on time', dosha: 'pitta' },
      { text: 'Steady, eats slowly', dosha: 'kapha' },
    ],
  },
  {
    id: 4,
    question: 'How do you typically feel?',
    options: [
      { text: 'Anxious, restless, energetic', dosha: 'vata' },
      { text: 'Ambitious, driven, focused', dosha: 'pitta' },
      { text: 'Calm, grounded, stable', dosha: 'kapha' },
    ],
  },
  {
    id: 5,
    question: 'What is your sleep pattern?',
    options: [
      { text: 'Light, interrupted, restless', dosha: 'vata' },
      { text: 'Medium, sound, interrupted by heat', dosha: 'pitta' },
      { text: 'Deep, heavy, tendency to oversleep', dosha: 'kapha' },
    ],
  },
  {
    id: 6,
    question: 'How do you prefer the weather?',
    options: [
      { text: 'Warm, humid weather', dosha: 'vata' },
      { text: 'Cool weather', dosha: 'pitta' },
      { text: 'Warm, dry weather', dosha: 'kapha' },
    ],
  },
  {
    id: 7,
    question: 'What is your typical digestion like?',
    options: [
      { text: 'Variable, prone to bloating', dosha: 'vata' },
      { text: 'Strong, quick, prone to diarrhea', dosha: 'pitta' },
      { text: 'Slow, sluggish, prone to constipation', dosha: 'kapha' },
    ],
  },
  {
    id: 8,
    question: 'What is your energy level throughout the day?',
    options: [
      { text: 'Fluctuating, bursts of energy', dosha: 'vata' },
      { text: 'Consistent and high', dosha: 'pitta' },
      { text: 'Steady but slow to wake up', dosha: 'kapha' },
    ],
  },
  {
    id: 9,
    question: 'How do you handle stress?',
    options: [
      { text: 'Get nervous, anxious', dosha: 'vata' },
      { text: 'Get irritable, angry', dosha: 'pitta' },
      { text: 'Get withdrawn, depressed', dosha: 'kapha' },
    ],
  },
  {
    id: 10,
    question: 'What is your hair type?',
    options: [
      { text: 'Thin, dry, early graying', dosha: 'vata' },
      { text: 'Fine, straight, premature balding', dosha: 'pitta' },
      { text: 'Thick, wavy, oily, luxuriant', dosha: 'kapha' },
    ],
  },
  {
    id: 11,
    question: 'What are your hands and feet usually like?',
    options: [
      { text: 'Small, thin, cool', dosha: 'vata' },
      { text: 'Medium, warm, reddish', dosha: 'pitta' },
      { text: 'Large, thick, cool', dosha: 'kapha' },
    ],
  },
  {
    id: 12,
    question: 'How is your memory?',
    options: [
      { text: 'Quick to learn, quick to forget', dosha: 'vata' },
      { text: 'Sharp, detailed, good retention', dosha: 'pitta' },
      { text: 'Slow to learn, excellent long-term', dosha: 'kapha' },
    ],
  },
  {
    id: 13,
    question: 'What is your speaking style?',
    options: [
      { text: 'Fast, talks a lot, gets excited', dosha: 'vata' },
      { text: 'Clear, precise, persuasive', dosha: 'pitta' },
      { text: 'Slow, measured, doesn\'t talk much', dosha: 'kapha' },
    ],
  },
  {
    id: 14,
    question: 'How do you typically move?',
    options: [
      { text: 'Quick, energetic, fidgety', dosha: 'vata' },
      { text: 'Determined, purposeful', dosha: 'pitta' },
      { text: 'Slow, graceful, deliberate', dosha: 'kapha' },
    ],
  },
  {
    id: 15,
    question: 'What is your body temperature tendency?',
    options: [
      { text: 'Cold hands and feet', dosha: 'vata' },
      { text: 'Warm, tendency to sweat easily', dosha: 'pitta' },
      { text: 'Normal, rarely feel too cold or hot', dosha: 'kapha' },
    ],
  },
  {
    id: 16,
    question: 'How do you spend your leisure time?',
    options: [
      { text: 'Traveling, socializing, new activities', dosha: 'vata' },
      { text: 'Competitive sports, goal-oriented', dosha: 'pitta' },
      { text: 'Relaxing, watching movies, comfortable activities', dosha: 'kapha' },
    ],
  },
  {
    id: 17,
    question: 'What is your natural body odor?',
    options: [
      { text: 'Minimal, slight', dosha: 'vata' },
      { text: 'Strong, pungent', dosha: 'pitta' },
      { text: 'Heavy, strong, but not unpleasant', dosha: 'kapha' },
    ],
  },
  {
    id: 18,
    question: 'How do you handle cold weather?',
    options: [
      { text: 'Dislike it, feel cold easily', dosha: 'vata' },
      { text: 'Prefer cooler weather', dosha: 'pitta' },
      { text: 'Tolerate well, don\'t mind it', dosha: 'kapha' },
    ],
  },
  {
    id: 19,
    question: 'What is your typical bowel habit?',
    options: [
      { text: 'Irregular, dry stools, tendency to constipation', dosha: 'vata' },
      { text: 'Regular, soft, tendency to loose stools', dosha: 'pitta' },
      { text: 'Regular, well-formed, heavy', dosha: 'kapha' },
    ],
  },
  {
    id: 20,
    question: 'How is your sense of humor?',
    options: [
      { text: 'Changeable, enjoys playfulness', dosha: 'vata' },
      { text: 'Sharp, sarcastic, witty', dosha: 'pitta' },
      { text: 'Gentle, likes family humor', dosha: 'kapha' },
    ],
  },
  {
    id: 21,
    question: 'What are your nails like?',
    options: [
      { text: 'Thin, fragile, easily break', dosha: 'vata' },
      { text: 'Medium, strong, pink', dosha: 'pitta' },
      { text: 'Thick, strong, pale', dosha: 'kapha' },
    ],
  },
  {
    id: 22,
    question: 'How do you react to loud noise?',
    options: [
      { text: 'Very sensitive, easily disturbed', dosha: 'vata' },
      { text: 'Somewhat bothered', dosha: 'pitta' },
      { text: 'Not particularly bothered', dosha: 'kapha' },
    ],
  },
  {
    id: 23,
    question: 'What is your financial spending pattern?',
    options: [
      { text: 'Impulsive, erratic spending', dosha: 'vata' },
      { text: 'Calculated, ambitious investment', dosha: 'pitta' },
      { text: 'Conservative, savings-oriented', dosha: 'kapha' },
    ],
  },
  {
    id: 24,
    question: 'How do you typically react to new situations?',
    options: [
      { text: 'Enthusiastic but anxious', dosha: 'vata' },
      { text: 'Confident and strategic', dosha: 'pitta' },
      { text: 'Cautious and slow to adapt', dosha: 'kapha' },
    ],
  },
  {
    id: 25,
    question: 'What is your eye color and type?',
    options: [
      { text: 'Small, active, dark', dosha: 'vata' },
      { text: 'Sharp, bright, penetrating', dosha: 'pitta' },
      { text: 'Large, calm, clear', dosha: 'kapha' },
    ],
  },
];

interface DoshaScores {
  vata: number;
  pitta: number;
  kapha: number;
}

export default function DoshaQuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<('vata' | 'pitta' | 'kapha')[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [doshaScores, setDoshaScores] = useState<DoshaScores>({ vata: 0, pitta: 0, kapha: 0 });

  const handleAnswer = (dosha: 'vata' | 'pitta' | 'kapha') => {
    const newAnswers = [...answers, dosha];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateDosha(newAnswers);
    }
  };

  const calculateDosha = (answers: ('vata' | 'pitta' | 'kapha')[]) => {
    const scores: DoshaScores = { vata: 0, pitta: 0, kapha: 0 };
    answers.forEach(answer => {
      scores[answer]++;
    });
    setDoshaScores(scores);
    setShowResults(true);
  };

  const getPrimaryDosha = () => {
    const { vata, pitta, kapha } = doshaScores;
    if (vata >= pitta && vata >= kapha) return 'vata';
    if (pitta >= vata && pitta >= kapha) return 'pitta';
    return 'kapha';
  };

  const getDoshaInfo = (dosha: string) => {
    const info: Record<string, { title: string; color: string; description: string; characteristics: string[] }> = {
      vata: {
        title: 'Vata Dosha',
        color: 'from-blue-400 to-cyan-400',
        description: 'You are the creative, energetic, and adaptable type. Vatas are characterized by qualities of air and space.',
        characteristics: [
          'Adaptable and flexible',
          'Creative and imaginative',
          'Quick-thinking and communicative',
          'Tends to be anxious or restless',
          'Prefers warm environments',
          'Has variable energy levels',
        ],
      },
      pitta: {
        title: 'Pitta Dosha',
        color: 'from-orange-400 to-red-400',
        description: 'You are the ambitious, driven, and intelligent type. Pittas are characterized by qualities of fire and water.',
        characteristics: [
          'Ambitious and goal-oriented',
          'Sharp intellect and leadership',
          'Strong metabolism and digestion',
          'Can be perfectionist or impatient',
          'Prefers cool environments',
          'Medium, muscular build',
        ],
      },
      kapha: {
        title: 'Kapha Dosha',
        color: 'from-green-400 to-emerald-400',
        description: 'You are the stable, grounded, and compassionate type. Kaphas are characterized by qualities of earth and water.',
        characteristics: [
          'Calm and grounded nature',
          'Loyal and compassionate',
          'Strong and stable health',
          'Can be stubborn or lethargic',
          'Prefers warm, dry environments',
          'Good strength and endurance',
        ],
      },
    };
    return info[dosha];
  };

  const getRecommendations = (dosha: string) => {
    const recommendations: Record<string, string[]> = {
      vata: [
        'Maintain a regular routine to ground yourself',
        'Include warm, nourishing foods in your diet',
        'Practice grounding exercises like yoga or tai chi',
        'Get adequate sleep and rest',
        'Avoid excessive stimulation',
        'Stay hydrated and keep warm',
      ],
      pitta: [
        'Practice cooling activities like swimming',
        'Avoid excessive heat and spicy foods',
        'Cultivate patience and forgiveness',
        'Take breaks to avoid burnout',
        'Practice meditation or cooling pranayama',
        'Maintain a balanced work-life schedule',
      ],
      kapha: [
        'Increase physical activity and exercise',
        'Include warm, light foods in your diet',
        'Embrace change and new challenges',
        'Practice stimulating activities',
        'Wake up early to establish routine',
        'Avoid excessive rest and sluggishness',
      ],
    };
    return recommendations[dosha] || [];
  };

  if (showResults) {
    const primaryDosha = getPrimaryDosha();
    const doshaInfo = getDoshaInfo(primaryDosha);
    const recommendations = getRecommendations(primaryDosha);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Dosha Analysis</h1>
            <p className="text-lg text-gray-600">Based on your answers, here's your constitutional profile</p>
          </div>

          {/* Primary Dosha Card */}
          <div className={`bg-gradient-to-r ${doshaInfo.color} rounded-lg shadow-2xl p-8 mb-8 text-white`}>
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">{doshaInfo.title}</h2>
              <p className="text-lg mb-6 opacity-90">{doshaInfo.description}</p>
              <div className="text-5xl mb-4">
                {primaryDosha === 'vata' && '💨'}
                {primaryDosha === 'pitta' && '🔥'}
                {primaryDosha === 'kapha' && '🌊'}
              </div>
            </div>
          </div>

          {/* Dosha Scores */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Score Breakdown</h3>
            <div className="space-y-4">
              {(['vata', 'pitta', 'kapha'] as const).map(dosha => (
                <div key={dosha}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700 capitalize">{dosha}</span>
                    <span className="text-lg font-bold text-gray-900">{doshaScores[dosha]}/25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        dosha === 'vata' ? 'bg-blue-500' : dosha === 'pitta' ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(doshaScores[dosha] / 25) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Characteristics */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Characteristics</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doshaInfo.characteristics.map((char, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <span className="text-gray-700">{char}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-lg p-8 mb-8 border-l-4 border-indigo-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Personalized Recommendations</h3>
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-xl mr-3">💡</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers([]);
                setShowResults(false);
              }}
              className="px-8 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Retake Quiz
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dosha Quiz</h1>
          <p className="text-lg text-gray-600">Discover Your Ayurvedic Constitution</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">{question.question}</h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option.dosha)}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 font-semibold text-gray-700 hover:text-purple-600"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              if (currentQuestion > 0) {
                setCurrentQuestion(currentQuestion - 1);
                setAnswers(answers.slice(0, -1));
              }
            }}
            disabled={currentQuestion === 0}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            {currentQuestion + 1}/{questions.length}
          </span>
          <div></div>
        </div>
      </div>
    </div>
  );
}
