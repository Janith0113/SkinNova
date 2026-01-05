'use client';

import { Heart, Shield, Activity, Utensils, Smile, Eye, AlertCircle, CheckCircle } from 'lucide-react';

export default function LeprosyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Understanding Leprosy (Hansen's Disease)</h1>
          <p className="text-lg text-rose-100">Comprehensive information about symptoms, treatment, and recovery</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction Section */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-orange-600">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              What is Leprosy?
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <span className="font-semibold text-blue-700">Leprosy, or Hansen's disease,</span> is a chronic infectious disease caused by the bacterium <span className="font-semibold">Mycobacterium leprae</span> or <span className="font-semibold">Mycobacterium lepromatosis</span>. It primarily affects the skin, peripheral nerves, and in some cases, the eyes and the lining of the upper respiratory tract.
              </p>
              <p>
                The disease develops <span className="font-semibold">slowly—often over several years</span>—because the bacteria multiply at a very slow rate.
              </p>
            </div>
          </div>
        </section>

        {/* Key Facts Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Key Facts to Know</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
              <h3 className="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Contagiousness
              </h3>
              <p className="text-gray-700">
                Leprosy is <span className="font-semibold">not highly contagious</span>. It spreads mainly through prolonged, close contact with an untreated person, likely through droplets from the nose or mouth. Most people have natural immunity—only a small portion of exposed individuals develop the disease.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
              <h3 className="text-xl font-bold text-purple-700 mb-3 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Good News
              </h3>
              <p className="text-gray-700">
                <span className="font-semibold">Leprosy is fully curable!</span> Modern diagnostics and <span className="font-semibold">Multidrug Therapy (MDT)</span>—a combination of antibiotics recommended globally—make complete recovery possible. Treatment stops transmission and prevents nerve damage.
              </p>
            </div>
          </div>
        </section>

        {/* Early Symptoms Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow-lg p-8 border-l-4 border-orange-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Early Symptoms</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white">
                    ●
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Light or Reddish Skin Patches</h3>
                  <p className="text-gray-700 text-sm mt-1">With reduced sensation in affected areas</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white">
                    ●
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Numbness or Weakness</h3>
                  <p className="text-gray-700 text-sm mt-1">Nerve involvement causing loss of sensation</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-orange-100 rounded text-orange-900 text-sm">
              <strong>⚠️ Important:</strong> If you notice any of these symptoms, seek medical attention promptly. Early diagnosis and treatment ensure better outcomes.
            </div>
          </div>
        </section>

        {/* Treatment Section */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-orange-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Treatment & Recovery</h2>
            <div className="bg-orange-50 p-6 rounded-lg mb-4">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold text-orange-700">Multidrug Therapy (MDT)</span> is the gold standard treatment recommended by the World Health Organization (WHO). Global health programs have made treatment widely available at <span className="font-semibold">no cost</span> in many regions, helping patients recover fully and live normal, active lives.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700"><span className="font-semibold">Fully curable</span> with proper treatment</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700">Treatment <span className="font-semibold">prevents further nerve damage</span> and stops transmission</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700">Patients can <span className="font-semibold">return to normal daily activities</span> during and after treatment</p>
              </div>
            </div>
          </div>
        </section>

        {/* Self-Care and Lifestyle Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Lifestyle & Self-Care Recommendations</h2>
          
          <div className="space-y-6">
            {/* 1. Adhere to Treatment */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 rounded-full p-3 flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">1. Adhere Strictly to Treatment</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span><span className="font-semibold">Complete the full course of MDT</span> as prescribed by a qualified healthcare provider</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span><span className="font-semibold">Regular follow-up visits</span> help monitor nerve function and treatment progress</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. Skin and Wound Care */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-pink-500 hover:shadow-xl transition">
              <div className="flex items-start gap-4">
                <div className="bg-pink-100 rounded-full p-3 flex-shrink-0">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">2. Skin and Wound Care</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-pink-600 font-bold">•</span>
                      <span><span className="font-semibold">Gently wash skin daily</span> and moisturize to prevent cracks</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-600 font-bold">•</span>
                      <span><span className="font-semibold">Examine hands, feet, and legs regularly</span> for unnoticed cuts or dry areas, especially if sensation is reduced</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-600 font-bold">•</span>
                      <span><span className="font-semibold">Protect skin from sun exposure</span> with clothing or shade</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Nerve Protection */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-500 hover:shadow-xl transition">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 rounded-full p-3 flex-shrink-0">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">3. Nerve Protection</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><span className="font-semibold">Use protective footwear</span> to avoid injuries to numb feet</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><span className="font-semibold">Avoid handling hot or sharp objects</span> without proper protection to prevent accidental burns or cuts</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><span className="font-semibold">Maintain proper posture</span> and avoid repetitive pressure on numb areas</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 4. Healthy Diet and Hydration */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                  <Utensils className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">4. Healthy Diet and Hydration</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>A <span className="font-semibold">balanced diet rich in protein, vitamins, and minerals</span> supports tissue repair and immune function</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span><span className="font-semibold">Drink sufficient water</span> to aid overall health and recovery</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 5. Physical Activity */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-100 rounded-full p-3 flex-shrink-0">
                  <Activity className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">5. Physical Activity</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span><span className="font-semibold">Gentle exercises, stretching, or physiotherapy</span> (if recommended) can help preserve muscle strength and joint mobility</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span><span className="font-semibold">Avoid overexertion,</span> especially if certain limbs have reduced strength or sensation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 6. Mental and Social Well-Being */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                  <Smile className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">6. Mental and Social Well-Being</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><span className="font-semibold">Learning about the disease</span> can reduce fear and stigma</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><span className="font-semibold">Connect with community support groups</span> or healthcare educators to maintain emotional resilience</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 7. Eye Care */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-cyan-500 hover:shadow-xl transition">
              <div className="flex items-start gap-4">
                <div className="bg-cyan-100 rounded-full p-3 flex-shrink-0">
                  <Eye className="w-6 h-6 text-cyan-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">7. Eye Care</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span>If there is <span className="font-semibold">reduced blinking or eye dryness,</span> avoid dusty environments and consult medical staff for safe eye-care options</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span><span className="font-semibold">Protect eyes from bright sunlight</span> with glasses or hats</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Important Reminder */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 text-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Remember</h2>
            <div className="space-y-3">
              <p className="flex gap-3 items-start">
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <span>Leprosy is a treatable disease with excellent prognosis when diagnosed early</span>
              </p>
              <p className="flex gap-3 items-start">
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <span>With proper medical care and self-care, patients achieve full recovery</span>
              </p>
              <p className="flex gap-3 items-start">
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <span>Early detection prevents complications and improves quality of life</span>
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Have concerns about your skin?</h2>
          <p className="text-gray-600 mb-6">Consult with our qualified healthcare professionals for proper diagnosis and treatment guidance</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/leprosy/detect" className="bg-gradient-to-r from-orange-600 to-rose-600 hover:shadow-lg text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg inline-flex items-center justify-center gap-2">
              🔍 Start a New Leprosy Scan
            </a>
            <button className="bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 hover:shadow-lg text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg">
              Book a Consultation
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}