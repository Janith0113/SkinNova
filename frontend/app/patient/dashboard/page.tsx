"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DiseaseKey = "psoriasis" | "tinea" | "leprosy" | "skinCancer";

const DISEASE_CONFIG: Record<
  DiseaseKey,
  {
    label: string;
    accent: string;
    bgPill: string;
    lastScan: string;
    risk: string;
    riskColor: string;
    riskHint: string;
    upcoming: string;
    upcomingHint: string;
    checks: { area: string; label: string; status: string; color: string }[];
    tip: string;
  }
> = {
  psoriasis: {
    label: "Psoriasis",
    accent: "text-purple-700",
    bgPill: "bg-purple-600/90",
    lastScan: "1 day ago",
    risk: "Medium",
    riskColor: "text-amber-600",
    riskHint: "Follow your treatment plan and track flare patterns.",
    upcoming: "Review in 2 weeks",
    upcomingHint: "Ideal time to re‑check chronic patches.",
    checks: [
      {
        area: "Elbows",
        label: "Plaque psoriasis pattern",
        status: "Stable",
        color: "text-emerald-700 bg-emerald-100",
      },
      {
        area: "Knees",
        label: "Mild scaling",
        status: "Improving",
        color: "text-sky-700 bg-sky-100",
      },
      {
        area: "Scalp line",
        label: "Psoriasis vs dandruff",
        status: "Monitor",
        color: "text-amber-700 bg-amber-100",
      },
    ],
    tip: "Moisturize daily and note what seems to trigger your flare‑ups such as stress, climate or certain foods.",
  },
  tinea: {
    label: "Tinea",
    accent: "text-yellow-700",
    bgPill: "bg-yellow-600/90",
    lastScan: "3 days ago",
    risk: "Low–Medium",
    riskColor: "text-amber-600",
    riskHint: "Keep the area clean, dry and follow antifungal guidance.",
    upcoming: "Review in 1 week",
    upcomingHint: "Check that ring‑like patches are shrinking, not spreading.",
    checks: [
      {
        area: "Neck",
        label: "Ring‑like patch",
        status: "Improving",
        color: "text-emerald-700 bg-emerald-100",
      },
      {
        area: "Chest",
        label: "Mild fungal pattern",
        status: "Stable",
        color: "text-sky-700 bg-sky-100",
      },
      {
        area: "Back",
        label: "Previous tinea spot",
        status: "Healed",
        color: "text-emerald-800 bg-emerald-200",
      },
    ],
    tip: "Dry thoroughly after bathing and avoid sharing towels or clothing to prevent reinfection.",
  },
  leprosy: {
    label: "Leprosy",
    accent: "text-red-700",
    bgPill: "bg-red-600/90",
    lastScan: "5 days ago",
    risk: "Requires follow‑up",
    riskColor: "text-red-600",
    riskHint: "Stick closely to medication schedule and nerve‑sensation checks.",
    upcoming: "Clinic visit scheduled",
    upcomingHint: "Important to review skin patches and nerve status.",
    checks: [
      {
        area: "Forearm patch",
        label: "Reduced sensation area",
        status: "Under treatment",
        color: "text-red-700 bg-red-100",
      },
      {
        area: "Upper arm",
        label: "Light patch border",
        status: "Stable",
        color: "text-amber-700 bg-amber-100",
      },
      {
        area: "Back of hand",
        label: "Nerve tenderness",
        status: "Monitor",
        color: "text-rose-700 bg-rose-100",
      },
    ],
    tip: "Report any new numbness, muscle weakness or burns you don’t feel immediately.",
  },
  skinCancer: {
    label: "Skin Cancer",
    accent: "text-green-800",
    bgPill: "bg-green-600/90",
    lastScan: "Today",
    risk: "High priority",
    riskColor: "text-red-600",
    riskHint: "Watch any changing mole closely and follow medical advice promptly.",
    upcoming: "Dermatologist review recommended",
    upcomingHint: "Early review can dramatically improve outcomes.",
    checks: [
      {
        area: "Upper back mole",
        label: "Asymmetry + color change",
        status: "Needs review",
        color: "text-red-700 bg-red-100",
      },
      {
        area: "Shoulder freckle",
        label: "Stable pigment",
        status: "Stable",
        color: "text-emerald-700 bg-emerald-100",
      },
      {
        area: "Facial spot",
        label: "Sun‑exposed area",
        status: "Monitor",
        color: "text-amber-700 bg-amber-100",
      },
    ],
    tip: "Use sunscreen daily and photograph suspicious spots monthly to track any change in size, color or border.",
  },
};

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseKey>("psoriasis");
  const router = useRouter();

  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) {
      setUser(JSON.parse(raw));
    } else {
      router.push("/login");
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100">
        <div className="animate-pulse text-gray-600 text-sm">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  const cfg = DISEASE_CONFIG[selectedDisease];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Top section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Hi, <span className="text-emerald-700">{user.name}</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-xl">
              Welcome to your SkinNova space. Track your skin health, review AI insights,
              and stay ahead of potential issues with simple, clear guidance.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="inline-flex items-center rounded-full bg-sky-600/90 px-3 py-1 text-xs font-semibold text-white shadow-md">
              Role • {user.role?.toUpperCase()}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500 text-white text-sm font-semibold px-4 py-2 shadow hover:bg-red-600 transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Disease selector tabs */}
        <div className="flex flex-wrap gap-3">
          {(
            [
              { key: "psoriasis", label: "Psoriasis" },
              { key: "tinea", label: "Tinea" },
              { key: "leprosy", label: "Leprosy" },
              { key: "skinCancer", label: "Skin Cancer" },
            ] as { key: DiseaseKey; label: string }[]
          ).map((d) => {
            const active = selectedDisease === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setSelectedDisease(d.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition-all border ${
                  active
                    ? "bg-white/80 border-transparent text-emerald-800"
                    : "bg-white/10 border-white/50 text-gray-700 hover:bg-white/40"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Status cards – content depends on selectedDisease */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Last Scan ({cfg.label})
            </span>
            <span className="text-lg font-bold text-gray-900">
              {cfg.lastScan}
            </span>
            <span className={`text-xs font-medium ${cfg.accent}`}>
              {cfg.upcomingHint}
            </span>
          </div>
          <div className="rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              AI Risk Level
            </span>
            <span className={`text-lg font-bold ${cfg.riskColor}`}>
              {cfg.risk}
            </span>
            <span className="text-xs text-amber-700 font-medium">
              {cfg.riskHint}
            </span>
          </div>
          <div className="rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Upcoming Plan
            </span>
            <span className="text-lg font-bold text-gray-900">
              {cfg.upcoming}
            </span>
            <span className="text-xs text-sky-700 font-medium">
              {cfg.upcomingHint}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Recent results */}
          <div className="lg:col-span-2 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Recent Skin Checks – {cfg.label}
              </h2>
              <span className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                View history
              </span>
            </div>

            <div className="space-y-4">
              {cfg.checks.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl bg-white/50 px-4 py-3 shadow-sm hover:shadow-md transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.area}
                    </p>
                    <p className="text-xs text-gray-600">{item.label}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${item.color}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quick actions & tips */}
          <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-7 space-y-5">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              What would you like to do?
            </h2>
            <div className="space-y-3">
              <button className="w-full rounded-2xl bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 shadow hover:bg-emerald-700 transition-all">
                Start a new {cfg.label.toLowerCase()} scan
              </button>
              <button className="w-full rounded-2xl bg-sky-600 text-white text-sm font-semibold px-4 py-2.5 shadow hover:bg-sky-700 transition-all">
                View my previous reports
              </button>
              <button className="w-full rounded-2xl bg-purple-600 text-white text-sm font-semibold px-4 py-2.5 shadow hover:bg-purple-700 transition-all">
                Ask a doctor about {cfg.label.toLowerCase()}
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-white/50 px-4 py-3 text-xs text-gray-700">
              <p className="font-semibold mb-1">Daily tip for {cfg.label}</p>
              <p>{cfg.tip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
