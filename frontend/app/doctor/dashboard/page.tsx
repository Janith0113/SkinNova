"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Top section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, <span className="text-emerald-700">{user.name}</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-xl">
              Manage your patients, review AI-generated skin assessments, and track clinical insights from a single, smart dashboard.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="inline-flex items-center rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white shadow-md">
              Role • {user.role?.toUpperCase()}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500 text-white text-sm font-semibold px-4 py-2 shadow hover:bg-red-600 transition-all"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Today&apos;s Appointments
            </span>
            <span className="text-3xl font-extrabold text-gray-900">12</span>
            <span className="text-xs text-emerald-700 font-medium">
              +3 new compared to yesterday
            </span>
          </div>
          <div className="rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Pending AI Reviews
            </span>
            <span className="text-3xl font-extrabold text-gray-900">7</span>
            <span className="text-xs text-purple-700 font-medium">
              Psoriasis, Tinea & Skin Cancer cases
            </span>
          </div>
          <div className="rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Follow‑up Patients
            </span>
            <span className="text-3xl font-extrabold text-gray-900">5</span>
            <span className="text-xs text-blue-700 font-medium">
              Recommended review this week
            </span>
          </div>
        </div>

        {/* Main panels */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Recent cases */}
          <div className="lg:col-span-2 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Recent AI‑Flagged Cases
              </h2>
              <span className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                View all
              </span>
            </div>
            <div className="space-y-4">
              {[
                { name: "Patient A", type: "Psoriasis", risk: "High", color: "text-red-600 bg-red-100" },
                { name: "Patient B", type: "Tinea", risk: "Medium", color: "text-amber-600 bg-amber-100" },
                { name: "Patient C", type: "Skin Cancer", risk: "Critical", color: "text-red-700 bg-red-200" },
              ].map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl bg-white/40 px-4 py-3 shadow-sm hover:shadow-md transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-600">{p.type}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${p.color}`}
                  >
                    {p.risk} risk
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-7 space-y-5">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full rounded-2xl bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 shadow hover:bg-emerald-700 transition-all">
                Review AI assessments
              </button>
              <button className="w-full rounded-2xl bg-sky-600 text-white text-sm font-semibold px-4 py-2.5 shadow hover:bg-sky-700 transition-all">
                Schedule new appointment
              </button>
              <button className="w-full rounded-2xl bg-purple-600 text-white text-sm font-semibold px-4 py-2.5 shadow hover:bg-purple-700 transition-all">
                View patient history
              </button>
            </div>
            <div className="mt-4 rounded-2xl bg-white/50 px-4 py-3 text-xs text-gray-700">
              <p className="font-semibold mb-1">Tip for today</p>
              <p>
                Prioritize cases with rapidly changing lesions or AI‑flagged high‑risk patterns for earlier in‑person review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
