'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TinePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
