'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Brain, AlertCircle, CheckCircle, ChevronDown, ChevronUp, RotateCcw, FileDown } from 'lucide-react';
import { generateLeprosyReport, downloadReportAsPDF } from '@/utils/reportGenerator';

interface XAITopFeature {
  feature: string;
  display_name: string;
  shap_value: number;
  feature_value: number;
  direction: 'positive' | 'negative';
}

interface XAIExplanation {
  image_base64: string | null;
  base_value: number;
  prediction_score: number;
  shap_values: Record<string, number>;
  top_features: XAITopFeature[];
  error?: string;
}

interface PredictionResult {
  success: boolean;
  prediction: {
    leprosy_type_id: number;
    leprosy_type_name: string;
    leprosy_type_code: string;
    risk_level: string;
    description: string;
    confidence: number;
    confidence_percent: number;
  };
  class_probabilities: Record<string, number>;
  clinical_interpretation: {
    type_classification: string;
    bacillary_load: string;
    treatment_regimen: string;
    monitoring_priority: string;
    key_clinical_notes: string[];
  };
  feature_importance: Record<string, number>;
  xai_explanation: XAIExplanation | null;
  xai_narrative: string | null;
  disclaimer: string;
  timestamp: string;
}

const LEPROSY_TYPE_COLORS: Record<string, string> = {
  TT: 'bg-green-100 text-green-800 border-green-300',
  BT: 'bg-lime-100 text-lime-800 border-lime-300',
  BB: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  BL: 'bg-orange-100 text-orange-800 border-orange-300',
  LL: 'bg-red-100 text-red-800 border-red-300',
};

const RISK_COLORS: Record<string, string> = {
  Low: 'text-green-700 bg-green-50 border-green-200',
  'Low-Moderate': 'text-lime-700 bg-lime-50 border-lime-200',
  Moderate: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  High: 'text-red-700 bg-red-50 border-red-200',
};

const BAR_COLORS: Record<string, string> = {
  TT: 'bg-green-500',
  BT: 'bg-lime-500',
  BB: 'bg-yellow-500',
  BL: 'bg-orange-500',
  LL: 'bg-red-500',
};

const FEATURE_ICONS: Record<string, string> = {
  age: '👤',
  gender: '⚧️',
  duration_of_illness_months: '📅',
  number_of_lesions: '🩹',
  largest_lesion_size_cm: '📏',
  nerve_involvement: '🧠',
  nerve_thickening: '🫀',
  loss_of_sensation: '✋',
  muscle_weakness: '💪',
  eye_involvement: '👁️',
  prev_treatment: '💊',
  household_contacts: '👨‍👩‍👧',
  skin_smear_right: '🔬',
  skin_smear_left: '🔬',
  bacillus_index: '🦠',
  morphological_index: '📊',
};

const LEPROSY_PATIENT_GUIDANCE: Record<string, { title: string; explanation: string; action: string; borderColor: string }> = {
  TT: {
    title: 'Tuberculoid Leprosy (TT) — What this means for you',
    explanation:
      'Your results suggest Tuberculoid Leprosy, the mildest form of the disease. This type typically involves very few skin patches (usually 1–5), well-defined borders, and limited nerve damage. Your immune system is responding strongly, which is a positive sign. With proper Multi-Drug Therapy (MDT), this type is highly treatable.',
    action: 'Start a 6-month MDT (Paucibacillary regimen) under medical supervision.',
    borderColor: 'border-green-200 bg-green-50',
  },
  BT: {
    title: 'Borderline Tuberculoid (BT) — What this means for you',
    explanation:
      'Your results suggest Borderline Tuberculoid Leprosy. You have several skin patches with some nerve involvement. While more advanced than TT, this form still responds well to early treatment. Protecting your nerves and skin is important to prevent long-term complications.',
    action: 'Begin a 12-month MDT (Multibacillary regimen) and attend regular nerve function assessments.',
    borderColor: 'border-lime-200 bg-lime-50',
  },
  BB: {
    title: 'Mid-Borderline Leprosy (BB) — What this means for you',
    explanation:
      'Your results indicate Mid-Borderline Leprosy. This is an unstable form that can shift toward a milder (TT) or more severe (LL) type depending on your immune response. Timely treatment is especially important to prevent nerve damage and disability.',
    action: 'Start 12-month MDT immediately and monitor closely for Type 1 (reversal) reactions.',
    borderColor: 'border-yellow-200 bg-yellow-50',
  },
  BL: {
    title: 'Borderline Lepromatous (BL) — What this means for you',
    explanation:
      'Your results suggest Borderline Lepromatous Leprosy. This type involves more widespread skin lesions and a higher bacterial load. Your immune system needs support through treatment. With consistent Multi-Drug Therapy, the bacterial count will drop significantly over time.',
    action: 'Begin 12-month MDT, monitor skin smear results every 6 months, and watch for nerve function changes.',
    borderColor: 'border-orange-200 bg-orange-50',
  },
  LL: {
    title: 'Lepromatous Leprosy (LL) — What this means for you',
    explanation:
      'Your results indicate Lepromatous Leprosy, the most advanced form. There is a high bacterial load present and the immune response to the bacteria is reduced. However, this is treatable. Consistent medication will eliminate the bacteria and halt disease progression over the course of your treatment.',
    action: 'Start 12-month MDT urgently, protect all numb areas from injury, and schedule eye and nerve examinations.',
    borderColor: 'border-red-200 bg-red-50',
  },
};

function getFeatureExplanation(
  feature: string,
  value: number,
  direction: 'positive' | 'negative',
  typeCode: string
): string {
  const explanations: Record<string, (v: number, dir: 'positive' | 'negative') => string> = {
    number_of_lesions: (v, dir) =>
      dir === 'positive'
        ? `You reported ${v} skin lesion(s). A higher number of lesions is associated with more widespread forms of leprosy (LL / BL).`
        : `You reported ${v} skin lesion(s), which is relatively low — a pattern more typical of milder forms (TT / BT).`,
    largest_lesion_size_cm: (v, dir) =>
      dir === 'positive'
        ? `Your largest lesion is ${v} cm. Larger lesion sizes suggest the disease has progressed beyond the earliest stage.`
        : `Your largest lesion is ${v} cm, which is small — consistent with an early or mild presentation.`,
    bacillus_index: (v, dir) =>
      dir === 'positive'
        ? `Your Bacillus Index (BI) of ${v} indicates a measurable bacterial presence, characteristic of multibacillary leprosy.`
        : `Your Bacillus Index (BI) of ${v} is low or absent, suggesting minimal bacterial load — more typical of paucibacillary leprosy.`,
    morphological_index: (v, dir) =>
      dir === 'positive'
        ? `Your Morphological Index of ${v}% indicates a proportion of live, active bacteria — a sign the disease is actively progressing.`
        : `Your Morphological Index of ${v}% is low, suggesting most bacteria may be non-viable — a positive indicator.`,
    nerve_involvement: (v, dir) =>
      dir === 'positive'
        ? `Nerve involvement was detected in your case. This is a key feature used to determine the type and severity of leprosy.`
        : `No significant nerve involvement was detected, which is reassuring and typically seen in milder forms.`,
    loss_of_sensation: (v, dir) =>
      dir === 'positive'
        ? `You reported loss of sensation in affected areas. This indicates that some nerve damage has already occurred.`
        : `No loss of sensation was reported, suggesting your nerve function is currently well preserved.`,
    muscle_weakness: (v, dir) =>
      dir === 'positive'
        ? `You reported muscle weakness, which can indicate motor nerve damage — a marker of significant nerve involvement.`
        : `No muscle weakness was reported, suggesting your motor nerves are not significantly affected at this stage.`,
    nerve_thickening: (v, dir) =>
      dir === 'positive'
        ? `Thickened, palpable nerves were detected. This is a direct physical sign of nerve involvement in leprosy.`
        : `No palpable nerve thickening was detected, indicating limited nerve involvement.`,
    eye_involvement: (v, dir) =>
      dir === 'positive'
        ? `Eye involvement is present. This is more common in LL / BL types and requires close ophthalmological monitoring.`
        : `No eye involvement was detected — a reassuring finding, as eye complications are more typical of severe forms.`,
    duration_of_illness_months: (v, dir) =>
      dir === 'positive'
        ? `Your condition has been present for ${v} months. A longer illness duration can allow the disease to develop features of more advanced types.`
        : `Your condition has been present for ${v} months. A shorter duration suggests earlier-stage disease, typically associated with milder types.`,
    skin_smear_right: (v, dir) =>
      dir === 'positive'
        ? `Your right-side skin smear score of ${v} detected bacteria, supporting a multibacillary classification.`
        : `Your right-side skin smear score of ${v} showed minimal or no bacteria, consistent with paucibacillary disease.`,
    skin_smear_left: (v, dir) =>
      dir === 'positive'
        ? `Your left-side skin smear score of ${v} detected bacteria, supporting a multibacillary classification.`
        : `Your left-side skin smear score of ${v} showed minimal or no bacteria, consistent with paucibacillary disease.`,
    age: (v) =>
      `Your age of ${v} years was factored into the classification model as age influences how leprosy presents clinically.`,
    prev_treatment: (v, dir) =>
      dir === 'positive'
        ? `You have had previous treatment for leprosy. A prior treatment history can affect how the disease currently presents.`
        : `No prior treatment history was recorded, providing the model with a baseline first-presentation assessment.`,
    household_contacts: (v, dir) =>
      dir === 'positive'
        ? `You reported ${v} household contact(s). Higher contact numbers can be associated with multibacillary forms due to greater exposure.`
        : `You reported ${v} household contact(s), which did not significantly shift the prediction.`,
  };
  const fn = explanations[feature];
  if (fn) return fn(value, direction);
  return direction === 'positive'
    ? 'This factor contributed toward the predicted classification.'
    : 'This factor suggested a less severe presentation.';
}

export default function LeprosyPredictPage() {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const [form, setForm] = useState({
    age: '',
    gender: 'M',
    duration_of_illness_months: '',
    number_of_lesions: '',
    largest_lesion_size_cm: '',
    nerve_involvement: false,
    nerve_thickening: false,
    loss_of_sensation: false,
    muscle_weakness: false,
    eye_involvement: false,
    prev_treatment: false,
    household_contacts: '',
    // Advanced clinical
    skin_smear_right: '',
    skin_smear_left: '',
    bacillus_index: '',
    morphological_index: '',
  });

  const handleChange = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.age || !form.duration_of_illness_months || !form.number_of_lesions) {
      setError('Please fill in Age, Duration of Illness and Number of Lesions at minimum.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        age: Number(form.age),
        gender: form.gender,
        duration_of_illness_months: Number(form.duration_of_illness_months),
        number_of_lesions: Number(form.number_of_lesions),
        largest_lesion_size_cm: form.largest_lesion_size_cm ? Number(form.largest_lesion_size_cm) : 2,
        nerve_involvement: form.nerve_involvement ? 1 : 0,
        nerve_thickening: form.nerve_thickening ? 1 : 0,
        loss_of_sensation: form.loss_of_sensation ? 1 : 0,
        muscle_weakness: form.muscle_weakness ? 1 : 0,
        eye_involvement: form.eye_involvement ? 1 : 0,
        prev_treatment: form.prev_treatment ? 1 : 0,
        household_contacts: form.household_contacts ? Number(form.household_contacts) : 0,
        skin_smear_right: form.skin_smear_right ? Number(form.skin_smear_right) : 0,
        skin_smear_left: form.skin_smear_left ? Number(form.skin_smear_left) : 0,
        bacillus_index: form.bacillus_index ? Number(form.bacillus_index) : 0,
        morphological_index: form.morphological_index ? Number(form.morphological_index) : 0,
      };

      const response = await fetch('http://localhost:4000/api/leprosy/ai-predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 503 || response.status === 504) {
          throw new Error('AI prediction server is not running. Please start leprosy_prediction_server.py first.');
        }
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Prediction failed');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [reportLoading, setReportLoading] = useState(false);

  const handleDownloadReport = async () => {
    if (!result) return;
    setReportLoading(true);
    try {
      const html = generateLeprosyReport({
        timestamp: new Date(result.timestamp).toLocaleString(),
        form,
        prediction: result.prediction,
        class_probabilities: result.class_probabilities,
        clinical_interpretation: result.clinical_interpretation,
        feature_importance: result.feature_importance,
        xai_narrative: result.xai_narrative,
        xai_top_features: result.xai_explanation?.top_features ?? [],
        xai_base_value: result.xai_explanation?.base_value,
        xai_prediction_score: result.xai_explanation?.prediction_score,
        disclaimer: result.disclaimer,
      });
      const filename = `Leprosy_Risk_Report_${result.prediction.leprosy_type_code}_${Date.now()}.pdf`;
      await downloadReportAsPDF(html, filename);
    } finally {
      setReportLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setForm({
      age: '', gender: 'M', duration_of_illness_months: '', number_of_lesions: '',
      largest_lesion_size_cm: '', nerve_involvement: false, nerve_thickening: false,
      loss_of_sensation: false, muscle_weakness: false, eye_involvement: false,
      prev_treatment: false, household_contacts: '', skin_smear_right: '',
      skin_smear_left: '', bacillus_index: '', morphological_index: '',
    });
  };

  const typeCode = result?.prediction.leprosy_type_code ?? '';
  const riskLevel = result?.prediction.risk_level ?? '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pt-20 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-600 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-4">
            <Brain className="w-10 h-10 text-indigo-200" />
            <div>
              <h1 className="text-3xl font-bold">AI Leprosy Type Predictor</h1>
              <p className="text-indigo-200 mt-1">Enter clinical data to classify leprosy type using the trained ML model</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!result ? (
          /* ── INPUT FORM ── */
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Patient Clinical Data</h2>
            <p className="text-sm text-gray-500 mb-6">Fields marked <span className="text-red-500">*</span> are required. All others improve prediction accuracy.</p>

            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Basic Info */}
            <section className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Age <span className="text-red-500">*</span></label>
                  <input
                    type="number" min="0" max="120" placeholder="e.g. 35"
                    value={form.age}
                    onChange={e => handleChange('age', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => handleChange('gender', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Household Contacts</label>
                  <input
                    type="number" min="0" placeholder="e.g. 3"
                    value={form.household_contacts}
                    onChange={e => handleChange('household_contacts', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </section>

            {/* Disease Info */}
            <section className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Disease Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration of Illness (months) <span className="text-red-500">*</span></label>
                  <input
                    type="number" min="0" placeholder="e.g. 12"
                    value={form.duration_of_illness_months}
                    onChange={e => handleChange('duration_of_illness_months', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Lesions <span className="text-red-500">*</span></label>
                  <input
                    type="number" min="0" placeholder="e.g. 5"
                    value={form.number_of_lesions}
                    onChange={e => handleChange('number_of_lesions', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Largest Lesion Size (cm)</label>
                  <input
                    type="number" min="0" step="0.1" placeholder="e.g. 3.5"
                    value={form.largest_lesion_size_cm}
                    onChange={e => handleChange('largest_lesion_size_cm', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </section>

            {/* Clinical Symptoms */}
            <section className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Clinical Symptoms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'nerve_involvement', label: 'Nerve Involvement', icon: '🧠' },
                  { key: 'nerve_thickening', label: 'Nerve Thickening (palpable)', icon: '🫀' },
                  { key: 'loss_of_sensation', label: 'Loss of Sensation', icon: '✋' },
                  { key: 'muscle_weakness', label: 'Muscle Weakness', icon: '💪' },
                  { key: 'eye_involvement', label: 'Eye Involvement', icon: '👁️' },
                  { key: 'prev_treatment', label: 'Previously Treated', icon: '💊' },
                ].map(item => (
                  <label key={item.key} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    form[item.key as keyof typeof form]
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={form[item.key as keyof typeof form] as boolean}
                      onChange={e => handleChange(item.key, e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-800">{item.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Advanced Clinical Measurements */}
            <section className="mb-8">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors mb-4"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showAdvanced ? 'Hide' : 'Show'} Advanced Clinical Measurements
                <span className="text-xs font-normal text-gray-400">(improves accuracy)</span>
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                  {[
                    { key: 'skin_smear_right', label: 'Skin Smear — Right (0–6)', step: '0.5', max: '6' },
                    { key: 'skin_smear_left', label: 'Skin Smear — Left (0–6)', step: '0.5', max: '6' },
                    { key: 'bacillus_index', label: 'Bacillus Index — BI (0–6)', step: '0.1', max: '6' },
                    { key: 'morphological_index', label: 'Morphological Index — MI (0–100%)', step: '1', max: '100' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-blue-800 mb-1">{field.label}</label>
                      <input
                        type="number" min="0" max={field.max} step={field.step}
                        placeholder="0"
                        value={form[field.key as keyof typeof form] as string}
                        onChange={e => handleChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Running AI Model...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Predict Leprosy Type
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              This prediction is for research/informational purposes only. Always consult a healthcare professional.
            </p>
          </div>
        ) : (
          /* ── RESULTS ── */
          <div className="space-y-6">
            {/* Primary Result Card */}
            <div className={`rounded-3xl border-2 p-8 shadow-xl ${LEPROSY_TYPE_COLORS[typeCode] || 'bg-gray-50 text-gray-800 border-gray-300'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">AI Prediction Result</p>
                  <h2 className="text-4xl font-extrabold mb-1">{result.prediction.leprosy_type_name}</h2>
                  <p className="text-base opacity-80 mb-4">{result.prediction.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${RISK_COLORS[riskLevel] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {riskLevel} Risk
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-white/60 border border-current">
                      {result.prediction.confidence_percent.toFixed(1)}% Confidence
                    </span>
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <div className="text-6xl font-black opacity-30">{typeCode}</div>
                  <CheckCircle className="w-8 h-8 mx-auto mt-2 opacity-60" />
                </div>
              </div>
            </div>

            {/* Probability Distribution */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Probability by Leprosy Type</h3>
              <div className="space-y-3">
                {Object.entries(result.class_probabilities)
                  .sort(([, a], [, b]) => b - a)
                  .map(([typeName, prob]) => {
                    const pct = Math.round(Number(prob) * 100);
                    const code = Object.entries({
                      'Tuberculoid (TT)': 'TT', 'Borderline Tuberculoid (BT)': 'BT',
                      'Mid-Borderline (BB)': 'BB', 'Borderline Lepromatous (BL)': 'BL',
                      'Lepromatous (LL)': 'LL'
                    }).find(([k]) => typeName.includes(k.split(' ')[0]) || typeName.includes(k.split('(')[1]?.replace(')', '')))?.[1]
                      ?? typeName.match(/\(([A-Z]+)\)/)?.[1] ?? '';
                    const isTop = typeName === result.prediction.leprosy_type_name;
                    const barColor = BAR_COLORS[code] || 'bg-indigo-400';
                    return (
                      <div key={typeName}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm font-medium ${isTop ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                            {isTop && '▶ '}{typeName}
                          </span>
                          <span className={`text-sm font-bold ${isTop ? 'text-gray-900' : 'text-gray-500'}`}>{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${isTop ? barColor : 'bg-gray-300'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Clinical Interpretation */}
            {result.clinical_interpretation && (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Clinical Interpretation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {[
                    { label: 'Classification', value: result.clinical_interpretation.type_classification, icon: '🏷️' },
                    { label: 'Bacillary Load', value: result.clinical_interpretation.bacillary_load, icon: '🦠' },
                    { label: 'Recommended Treatment', value: result.clinical_interpretation.treatment_regimen, icon: '💊' },
                    { label: 'Monitoring Priority', value: result.clinical_interpretation.monitoring_priority, icon: '📋' },
                  ].map(item => (
                    <div key={item.label} className="flex gap-3 p-4 bg-gray-50 rounded-2xl">
                      <span className="text-2xl shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.label}</p>
                        <p className="text-sm text-gray-900 mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {result.clinical_interpretation.key_clinical_notes?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <p className="text-sm font-bold text-amber-800 mb-2">⚠️ Key Clinical Notes</p>
                    <ul className="space-y-1.5">
                      {result.clinical_interpretation.key_clinical_notes.map((note, i) => (
                        <li key={i} className="text-sm text-amber-900">{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Feature Importance */}
            {result.feature_importance && Object.keys(result.feature_importance).length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Top Contributing Factors</h3>
                <p className="text-xs text-gray-500 mb-4">Features the model weighted most in this prediction</p>
                <div className="space-y-2">
                  {Object.entries(result.feature_importance).slice(0, 8).map(([feat, imp]) => {
                    const pct = Math.round(Number(imp) * 100);
                    const label = feat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    return (
                      <div key={feat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">{label}</span>
                          <span className="text-gray-500">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full bg-indigo-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── XAI Decision Narrative ── */}
            {result.xai_narrative && (
              <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl">
                    🔍
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-indigo-900 mb-2">
                      Why did the AI make this prediction?
                    </h3>
                    <p className="text-sm text-indigo-800 leading-relaxed">
                      {result.xai_narrative}
                    </p>
                    <p className="mt-3 text-xs text-indigo-500 italic">
                      This explanation is generated from SHAP (SHapley Additive Explanations) values —
                      a mathematically rigorous method that attributes each feature's contribution to
                      the model's output, analogous to Grad-CAM in image-based AI.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Patient-Friendly Result Explanation ── */}
            {result.xai_explanation !== null && result.xai_explanation.top_features && result.xai_explanation.top_features.length > 0 && (
              <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl shrink-0">
                    💡
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Understanding Your Result</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Plain-language explanation of the key factors that led the AI to classify your condition as{' '}
                      <span className="font-semibold text-indigo-700">{result.prediction.leprosy_type_name}</span>.
                    </p>
                  </div>
                </div>

                {/* Supporting vs. Mitigating factors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  {/* Factors pushing toward this diagnosis */}
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-xs font-bold text-red-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      Factors supporting this diagnosis
                    </p>
                    <div className="space-y-3">
                      {result.xai_explanation!.top_features
                        .filter(f => f.direction === 'positive')
                        .slice(0, 4)
                        .map(f => (
                          <div key={f.feature} className="flex items-start gap-2.5">
                            <span className="text-lg shrink-0">{FEATURE_ICONS[f.feature] ?? '📌'}</span>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{f.display_name}</p>
                              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                {getFeatureExplanation(f.feature, f.feature_value, 'positive', typeCode)}
                              </p>
                            </div>
                          </div>
                        ))}
                      {result.xai_explanation!.top_features.filter(f => f.direction === 'positive').length === 0 && (
                        <p className="text-xs text-red-500 italic">No strongly supporting factors detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Factors suggesting milder presentation */}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      Factors suggesting a milder presentation
                    </p>
                    <div className="space-y-3">
                      {result.xai_explanation!.top_features
                        .filter(f => f.direction === 'negative')
                        .slice(0, 4)
                        .map(f => (
                          <div key={f.feature} className="flex items-start gap-2.5">
                            <span className="text-lg shrink-0">{FEATURE_ICONS[f.feature] ?? '📌'}</span>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{f.display_name}</p>
                              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                {getFeatureExplanation(f.feature, f.feature_value, 'negative', typeCode)}
                              </p>
                            </div>
                          </div>
                        ))}
                      {result.xai_explanation!.top_features.filter(f => f.direction === 'negative').length === 0 && (
                        <p className="text-xs text-blue-500 italic">No significant mitigating factors detected.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* What this means for the patient */}
                {LEPROSY_PATIENT_GUIDANCE[typeCode] && (
                  <div className={`rounded-2xl p-4 border ${LEPROSY_PATIENT_GUIDANCE[typeCode].borderColor}`}>
                    <p className="text-sm font-bold text-gray-800 mb-1.5">
                      {LEPROSY_PATIENT_GUIDANCE[typeCode].title}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {LEPROSY_PATIENT_GUIDANCE[typeCode].explanation}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-800">
                      ✅ Recommended next step: {LEPROSY_PATIENT_GUIDANCE[typeCode].action}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Grad-CAM Style XAI Explanation ── */}
            {result.xai_explanation && (
              <div className="rounded-3xl border border-gray-200 shadow-xl overflow-hidden"
                   style={{ background: '#0f172a' }}>
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-700"
                     style={{ background: '#1e293b' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        🧠 Explainable AI — Grad-CAM Analysis
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        SHAP (SHapley Additive Explanations) — the tabular-data equivalent of
                        image Grad-CAM. Each feature is coloured by how strongly it pushed the
                        model toward (red/warm) or away from (blue/cool) the predicted class.
                      </p>
                    </div>
                    <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      SHAP v TreeExplainer
                    </span>
                  </div>

                  {/* Score summary row */}
                  {result.xai_explanation?.base_value !== undefined && result.xai_explanation?.prediction_score !== undefined && (
                    <div className="mt-4 flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 bg-slate-700/60 rounded-xl px-4 py-2">
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Base Score</span>
                        <span className="text-sm font-bold text-slate-200">
                          {result.xai_explanation.base_value.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-indigo-500/20 rounded-xl px-4 py-2 border border-indigo-500/30">
                        <span className="text-xs text-indigo-300 uppercase tracking-wide">Prediction Score</span>
                        <span className="text-sm font-bold text-indigo-200">
                          {result.xai_explanation.prediction_score.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-amber-500/10 rounded-xl px-4 py-2 border border-amber-500/20">
                        <span className="text-xs text-amber-400 uppercase tracking-wide">SHAP Δ</span>
                        <span className="text-sm font-bold text-amber-300">
                          {(result.xai_explanation.prediction_score - result.xai_explanation.base_value) >= 0 ? '+' : ''}
                          {(result.xai_explanation.prediction_score - result.xai_explanation.base_value).toFixed(4)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Grad-CAM image */}
                {result.xai_explanation?.image_base64 ? (
                  <div className="p-4">
                    <img
                      src={`data:image/png;base64,${result.xai_explanation.image_base64}`}
                      alt="Grad-CAM style feature activation map"
                      className="w-full rounded-2xl"
                      style={{ imageRendering: 'crisp-edges' }}
                    />
                  </div>
                ) : (
                  result.xai_explanation?.error && (
                    <div className="p-6 text-sm text-red-400">
                      ⚠️ Could not generate visual map: {result.xai_explanation.error}
                    </div>
                  )
                )}

                {/* Top feature table */}
                {result.xai_explanation.top_features?.length > 0 && (
                  <div className="px-6 pb-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Top Feature Contributions
                    </p>
                    <div className="space-y-2">
                      {result.xai_explanation.top_features.slice(0, 8).map((f, i) => {
                        const pct = Math.min(100, Math.abs(f.shap_value) * 200);
                        const isPos = f.direction === 'positive';
                        return (
                          <div key={f.feature} className="flex items-center gap-3">
                            <span className="w-5 text-xs text-slate-500 text-right shrink-0">{i + 1}</span>
                            <span className="w-44 text-xs font-medium text-slate-300 truncate shrink-0">
                              {f.display_name}
                            </span>
                            <span className="w-14 text-xs text-amber-400 text-right shrink-0 font-mono">
                              {f.feature_value}
                            </span>
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${isPos ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className={`w-16 text-xs font-bold text-right shrink-0 font-mono ${isPos ? 'text-red-400' : 'text-blue-400'}`}>
                              {f.shap_value >= 0 ? '+' : ''}{f.shap_value.toFixed(4)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                        Increases predicted probability
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                        Decreases predicted probability
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-500 italic text-center">
              {result.disclaimer}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                New Prediction
              </button>
              <button
                onClick={handleDownloadReport}
                disabled={reportLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {reportLoading ? (
                  <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Generating...</>
                ) : (
                  <><FileDown className="w-4 h-4" /> Download Report</>
                )}
              </button>
              <button
                onClick={() => router.push('/leprosy/assistant')}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
              >
                Open Care Assistant →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
