"use client";

import Sidebar from "../components/Sidebar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100 flex">
      <Sidebar />

      <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-10 pb-10">
        {/* Top header strip */}
        <section className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-700">
                Overview
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">
                Skin Nova Conditions
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-700 max-w-xl">
                Choose a condition to explore focused explanations, risk cues, and guidance tailored to that specific disease.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="hidden sm:inline-flex items-center rounded-full bg-white/60 px-3 py-1 text-[11px] font-semibold text-emerald-800 shadow">
                AI‑assisted • Not a diagnosis
              </span>
            </div>
          </div>
        </section>

        {/* Condition tiles */}
        <section className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-4 md:grid-cols-2">
          {/* Psoriasis */}
          <article className="relative rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white p-5 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <span className="text-2xl">🩹</span>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold">
                Chronic immune‑driven
              </span>
            </div>
            <h2 className="text-xl font-extrabold mb-2">Psoriasis</h2>
            <p className="text-xs leading-relaxed text-purple-50 mb-4">
              Patches of skin grow too quickly, piling into thick, silvery‑red plates that may itch, sting, or crack. Often linked with stress, genetics, and immune over‑activity.
            </p>
            <button
              onClick={() => (window.location.href = "/psoriasis")}
              className="w-full mt-auto inline-flex justify-center items-center rounded-2xl bg-white text-xs font-semibold text-purple-800 py-2.5 shadow hover:bg-purple-50 transition-colors"
            >
              Open Psoriasis workspace
            </button>
          </article>

          {/* Tinea */}
          <article className="relative rounded-3xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 text-white p-5 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <span className="text-2xl">🦠</span>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold">
                Fungal infection
              </span>
            </div>
            <h2 className="text-xl font-extrabold mb-2">Tinea</h2>
            <p className="text-xs leading-relaxed text-amber-50 mb-4">
              Classic ring‑shaped, itchy patches caused by fungi that love warm, moist skin folds, feet, and scalp. Spread by contact, but very treatable when caught early.
            </p>
            <button
              onClick={() => (window.location.href = "/tinea")}
              className="w-full mt-auto inline-flex justify-center items-center rounded-2xl bg-white text-xs font-semibold text-amber-800 py-2.5 shadow hover:bg-amber-50 transition-colors"
            >
              Open Tinea workspace
            </button>
          </article>

          {/* Leprosy */}
          <article className="relative rounded-3xl bg-gradient-to-br from-rose-600 via-red-500 to-orange-500 text-white p-5 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <span className="text-2xl">🧠</span>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold">
                Nerve‑linked
              </span>
            </div>
            <h2 className="text-xl font-extrabold mb-2">Leprosy</h2>
            <p className="text-xs leading-relaxed text-rose-50 mb-4">
              Slowly appearing pale or reddish patches with numb or “less alive” feeling skin, reflecting how the infection touches both skin and nearby nerves over time.
            </p>
            <button
              onClick={() => (window.location.href = "/leprosy")}
              className="w-full mt-auto inline-flex justify-center items-center rounded-2xl bg-white text-xs font-semibold text-rose-800 py-2.5 shadow hover:bg-rose-50 transition-colors"
            >
              Open Leprosy workspace
            </button>
          </article>

          {/* Skin Cancer */}
          <article className="relative rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600 text-white p-5 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <span className="text-2xl">🌞</span>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold">
                High‑priority checks
              </span>
            </div>
            <h2 className="text-xl font-extrabold mb-2">Skin Cancer</h2>
            <p className="text-xs leading-relaxed text-emerald-50 mb-4">
              New or changing moles, spots that bleed, or wounds that never fully heal can be early warnings when sun‑exposed cells start multiplying out of control.
            </p>
            <button
              onClick={() => (window.location.href = "/skin-cancer")}
              className="w-full mt-auto inline-flex justify-center items-center rounded-2xl bg-white text-xs font-semibold text-emerald-800 py-2.5 shadow hover:bg-emerald-50 transition-colors"
            >
              Open Skin Cancer workspace
            </button>
          </article>
        </section>

        {/* Secondary band with guidance */}
        <section className="max-w-6xl mx-auto mt-10 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg px-5 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              How to use this dashboard
            </h3>
            <p className="text-xs text-gray-700 mt-1 max-w-xl">
              Pick the condition that matches what you see on your skin. Each workspace will guide you with focused education, risk cues, and next‑step suggestions to discuss with a healthcare professional.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Not a replacement for a doctor
            </span>
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-semibold">
              Built for early awareness
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
