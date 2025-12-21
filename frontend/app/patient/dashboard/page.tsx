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
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseKey>("psoriasis");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [scheduleFormData, setScheduleFormData] = useState({
    requestedDate: "",
    reason: "",
  });
  const [doctorAvailability, setDoctorAvailability] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) {
      const userData = JSON.parse(raw);
      setUser(userData);
      
      // Load profile photo if it exists
      if (userData._id || userData.id || userData.userId) {
        const userId = userData._id || userData.id || userData.userId;
        setProfilePhoto(`http://localhost:4000/api/profile/photo/${userId}?t=${Date.now()}`);
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user?.role === "patient") {
      fetchAppointments();
      fetchVerifiedDoctors();
      const interval = setInterval(fetchAppointments, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/appointments", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchVerifiedDoctors = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/doctors/verified", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("API Error:", response.status, response.statusText);
        throw new Error(`Failed to fetch doctors: ${response.status}`);
      }

      const data = await response.json();
      console.log("Verified doctors found:", data.doctors);
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setDoctors([]);
    }
  };

  const fetchDoctorAvailability = async (doctorId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/api/availability/${doctorId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch doctor availability");
      }

      const data = await response.json();
      setDoctorAvailability(data.availabilitySlots || []);
    } catch (err) {
      console.error("Error fetching doctor availability:", err);
      setDoctorAvailability([]);
    }
  };

  const generateAvailableDates = (): string[] => {
    if (!doctorAvailability || doctorAvailability.length === 0) {
      return [];
    }

    const dates: Set<string> = new Set();
    const now = new Date();
    const maxDays = 90; // Generate dates for next 90 days

    for (let daysAhead = 1; daysAhead <= maxDays; daysAhead++) {
      const date = new Date(now);
      date.setDate(date.getDate() + daysAhead);
      const dayOfWeek = date.getDay();

      // Find availability for this day of week
      const dayAvailability = doctorAvailability.find(a => a.dayOfWeek === dayOfWeek);
      if (!dayAvailability) continue;

      // Add only the date (YYYY-MM-DD), not time
      const dateStr = date.toISOString().split('T')[0];
      dates.add(dateStr);
    }

    return Array.from(dates).sort();
  };

  const handleScheduleAppointment = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setScheduleFormData({ requestedDate: "", reason: "" });
    setShowScheduleModal(true);
    fetchDoctorAvailability(doctorId);
  };

  const handleConfirmScheduleAppointment = async () => {
    if (!scheduleFormData.requestedDate || !scheduleFormData.reason) {
      alert("Please fill all fields");
      return;
    }

    // Validate that the selected date is in the future
    const selectedDate = new Date(scheduleFormData.requestedDate);
    const now = new Date();
    
    if (selectedDate <= now) {
      alert("Please select a future date");
      return;
    }

    try {
      // Get all appointments for this doctor on the selected date to auto-assign time
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/appointments", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const appointmentsData = await response.json();
      const allAppointments = appointmentsData.appointments || [];

      // Filter appointments for this doctor on the selected date
      const dateStr = scheduleFormData.requestedDate; // Format: YYYY-MM-DD
      const sameDateAppointments = allAppointments.filter((apt: any) => {
        const aptDate = new Date(apt.requestedDate).toISOString().split('T')[0];
        return apt.doctorId === selectedDoctorId && aptDate === dateStr;
      });

      // Auto-assign time based on doctor availability and existing appointments
      let appointmentTime = "";
      let slotLocation = undefined;
      let dayAvailability: any = null;
      
      if (doctorAvailability && doctorAvailability.length > 0) {
        const [year, month, day] = scheduleFormData.requestedDate.split('-').map(Number);
        const selectedDateObj = new Date(year, month - 1, day);
        const dayOfWeek = selectedDateObj.getDay();
        dayAvailability = doctorAvailability.find((a: any) => a.dayOfWeek === dayOfWeek);

        if (dayAvailability) {
          const [startHour, startMin] = dayAvailability.startTime.split(':').map(Number);
          const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number);

          // Create date in local timezone (not UTC)
          const appointmentDateTime = new Date(year, month - 1, day, startHour, startMin, 0, 0);
          
          // Calculate appointment slot based on number of appointments that day (30 min intervals)
          const slotMinutes = sameDateAppointments.length * 30;
          appointmentDateTime.setMinutes(appointmentDateTime.getMinutes() + slotMinutes);

          // Check if the calculated time is within doctor's available hours
          const appointmentEndTime = new Date(appointmentDateTime);
          appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + 30); // Appointment duration is 30 min

          const endDateTime = new Date(year, month - 1, day, endHour, endMin, 0, 0);

          // If appointment would go past doctor's availability, alert user
          if (appointmentEndTime > endDateTime) {
            alert(`Doctor's availability ends at ${dayAvailability.endTime}. No more slots available for this date.`);
            return;
          }

          // Format time properly for sending to backend
          const hours = String(appointmentDateTime.getHours()).padStart(2, '0');
          const minutes = String(appointmentDateTime.getMinutes()).padStart(2, '0');
          const dateStrFormatted = String(appointmentDateTime.getFullYear()).padStart(4, '0') + '-' +
                         String(appointmentDateTime.getMonth() + 1).padStart(2, '0') + '-' +
                         String(appointmentDateTime.getDate()).padStart(2, '0');
          appointmentTime = `${dateStrFormatted}T${hours}:${minutes}`;
          
          // Capture location from availability slot
          if (dayAvailability.location?.address) {
            slotLocation = dayAvailability.location;
          }
        } else {
          alert("Doctor is not available on this day");
          return;
        }
      } else {
        alert("Doctor has not set their availability yet");
        return;
      }

      // Schedule the appointment with auto-assigned time and location
      const scheduleResponse = await fetch("http://localhost:4000/api/appointments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          patientId: user._id,
          requestedDate: appointmentTime,
          reason: scheduleFormData.reason,
          availabilitySlotId: dayAvailability?._id,
          location: slotLocation,
        }),
      });

      if (!scheduleResponse.ok) {
        throw new Error("Failed to schedule appointment");
      }

      alert("Appointment requested successfully!");
      setShowScheduleModal(false);
      setScheduleFormData({ requestedDate: "", reason: "" });
      await fetchAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to schedule appointment");
    }
  };

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  const handleProfilePhotoUpload = async (file: File) => {
    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("profilePhoto", file);

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/profile/upload-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload profile photo");
      }

      const data = await response.json();
      // Update profile photo URL with cache busting timestamp
      if (user && (user._id || user.id || user.userId)) {
        const userId = user._id || user.id || user.userId;
        setProfilePhoto(`http://localhost:4000/api/profile/photo/${userId}?t=${Date.now()}`);
      }
      alert("Profile photo uploaded successfully!");
      setShowPhotoModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemoveProfilePhoto = async () => {
    if (!window.confirm("Are you sure you want to remove your profile photo?")) {
      return;
    }

    try {
      setUploadingPhoto(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch("http://localhost:4000/api/profile/remove-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to remove profile photo");
      }

      // Clear profile photo by setting to empty string
      setProfilePhoto("");
      alert("Profile photo removed successfully!");
      setShowPhotoModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

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
          <div className="flex items-center gap-6">
            {/* Profile Photo - Creative Design */}
            <div className="relative group">
              {/* Animated background gradient circles */}
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 via-sky-500 to-cyan-400 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              
              {/* Main profile container */}
              <div
                onClick={() => setShowPhotoModal(true)}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center cursor-pointer overflow-hidden group/photo shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-white"
              >
                {/* Animated border effect */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-white/50 via-transparent to-white/50 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 animate-spin" style={{ animationDuration: '3s' }}></div>
                
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover relative z-10 group-hover/photo:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-5xl sm:text-6xl relative z-10 group-hover/photo:scale-125 transition-transform duration-300">👤</span>
                )}
                
                {/* Hover overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover/photo:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 z-20 rounded-full">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Upload</span>
                </div>

                {/* Status indicator badge */}
                <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-3 border-white shadow-lg z-30 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Hi, <span className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">{user.name}</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-xl leading-relaxed">
                Welcome to your SkinNova space. Track your skin health, review AI insights,
                and stay ahead of potential issues with simple, clear guidance.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="inline-flex items-center rounded-full bg-sky-600/90 px-3 py-1 text-xs font-semibold text-white shadow-md">
              Role • {user.role?.toUpperCase()}
            </span>
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
              <button 
                onClick={() => {
                  const diseaseRoutes: Record<DiseaseKey, string> = {
                    psoriasis: "/psoriasis/detect",
                    tinea: "/tinea/detect",
                    leprosy: "/leprosy/detect",
                    skinCancer: "/melanoma/detect"
                  };
                  router.push(diseaseRoutes[selectedDisease]);
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-semibold px-4 py-2.5 shadow hover:shadow-lg hover:scale-105 transition-all"
              >
                🔍 Start a new {cfg.label.toLowerCase()} scan
              </button>
              <button onClick={() => router.push('/patient/reports')} className="w-full rounded-2xl bg-sky-600 text-white text-sm font-semibold px-4 py-2.5 shadow hover:bg-sky-700 transition-all">
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

        {/* Doctors Section - Book Appointment */}
        <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            👨‍⚕️ Available Doctors - Schedule Appointment
          </h2>
          
          {doctors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-700 text-lg">No verified doctors available</p>
              <p className="text-gray-600 text-sm mt-2">Please check back later</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="bg-white/40 rounded-2xl p-5 border border-white/50 hover:shadow-lg transition-all">
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">Dr. {doctor.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{doctor.email}</p>
                      <div className="mt-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-1">
                        <span className="text-xs font-semibold text-emerald-700">✓ Verified</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleScheduleAppointment(doctor._id)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointments Section */}
        <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            📅 Your Appointments
          </h2>
          
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-700 text-lg">No appointments scheduled yet</p>
              <p className="text-gray-600 text-sm mt-2">Request an appointment through the admin to schedule with a doctor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pending Appointments */}
              {appointments.filter(apt => apt.status === "pending").length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-yellow-700 mb-3">⏳ Pending (Waiting for Doctor Approval)</h3>
                  <div className="space-y-3">
                    {appointments.filter(apt => apt.status === "pending").map((apt) => (
                      <div key={apt._id} className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              Dr. {apt.doctorName}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              📅 Requested: {new Date(apt.requestedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              {apt.requestedDate && new Date(apt.requestedDate).getHours() !== 0 && (
                                <span className="ml-2">at {new Date(apt.requestedDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              📝 Reason: {apt.reason}
                            </p>
                            {apt.location?.address && (
                              <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                                📍 {apt.location.address}
                              </p>
                            )}
                            <p className="text-xs text-yellow-700 mt-2 font-medium">
                              ⏳ Doctor will confirm a specific time for this appointment
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Appointments */}
              {appointments.filter(apt => apt.status === "approved").length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-emerald-700 mb-3">✅ Confirmed Appointments</h3>
                  <div className="space-y-3">
                    {appointments.filter(apt => apt.status === "approved").map((apt) => (
                      <div key={apt._id} className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              Dr. {apt.doctorName}
                            </p>
                            <p className="text-sm font-bold text-emerald-700 mt-2">
                              🕐 {new Date(apt.approvedDate).toLocaleString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              📝 {apt.reason}
                            </p>
                            {apt.location?.address && (
                              <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                                📍 {apt.location.address}
                              </p>
                            )}
                            {apt.notes && (
                              <p className="text-xs text-gray-700 mt-2">
                                <strong>Notes:</strong> {apt.notes}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => router.push(`/direct-chat?patientId=${user._id || user.id}&doctorId=${apt.doctorId}`)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm whitespace-nowrap h-fit"
                          >
                            💬 Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected Appointments */}
              {appointments.filter(apt => apt.status === "rejected").length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-3">❌ Rejected Appointments</h3>
                  <div className="space-y-3">
                    {appointments.filter(apt => apt.status === "rejected").map((apt) => (
                      <div key={apt._id} className="bg-red-50 rounded-2xl p-4 border border-red-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              Dr. {apt.doctorName}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              📅 Requested: {new Date(apt.requestedDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              📝 Reason: {apt.reason}
                            </p>
                            {apt.location?.address && (
                              <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                                📍 {apt.location.address}
                              </p>
                            )}
                            {apt.notes && (
                              <p className="text-xs text-red-700 mt-2">
                                <strong>Doctor's Message:</strong> {apt.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Photo Upload Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
              {/* Header with gradient */}
              <div className="px-6 py-6 bg-gradient-to-r from-emerald-600 via-sky-600 to-cyan-600 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white">Upload Profile Photo</h2>
                  <p className="text-white/80 text-sm mt-1">Make a great first impression</p>
                </div>
              </div>

              <div className="px-6 py-8 space-y-6">
                {/* Photo preview with creative border */}
                <div className="flex justify-center">
                  <div className="relative group/preview">
                    {/* Animated border glow */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full blur opacity-50 group-hover/preview:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                    
                    {/* Main preview circle */}
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl sm:text-6xl">👤</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* File upload section with enhanced styling */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">📁</span>
                    Choose Photo
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert("File size must be less than 5MB");
                            return;
                          }
                          handleProfilePhotoUpload(file);
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-dashed border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer hover:border-emerald-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                      disabled={uploadingPhoto}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">JPG, PNG, GIF, WEBP • Max 5MB</p>
                </div>

                {/* Upload progress indicator */}
                {uploadingPhoto && (
                  <div className="flex flex-col items-center justify-center space-y-3 py-4">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 text-emerald-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">Uploading your photo...</span>
                  </div>
                )}
              </div>

              {/* Footer with action buttons */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-3xl flex justify-between items-center border-t border-gray-100">
                {profilePhoto && (
                  <button
                    onClick={handleRemoveProfilePhoto}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={uploadingPhoto}
                  >
                    <span>🗑️</span>
                    Remove
                  </button>
                )}
                <div className="flex-1"></div>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-sky-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploadingPhoto}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Appointment Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600">
                <h2 className="text-xl font-bold text-white">Schedule Appointment</h2>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Appointment Date
                  </label>
                  <select
                    value={scheduleFormData.requestedDate}
                    onChange={(e) =>
                      setScheduleFormData({ ...scheduleFormData, requestedDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Available Date --</option>
                    {generateAvailableDates().map((dateStr) => {
                      const date = new Date(dateStr + 'T00:00:00');
                      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      const dayName = days[date.getDay()];
                      const monthName = date.toLocaleString('default', { month: 'short' });
                      const fullDateStr = `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`;
                      return (
                        <option key={dateStr} value={dateStr}>
                          {fullDateStr}
                        </option>
                      );
                    })}
                  </select>
                  {generateAvailableDates().length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      No available dates for this doctor
                    </p>
                  )}
                  {doctorAvailability.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-600 font-semibold">Doctor Availability:</p>
                      {doctorAvailability.map((d, idx) => {
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        return (
                          <div key={idx} className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
                            <p className="text-gray-700">
                              <span className="font-semibold">{days[d.dayOfWeek]}</span>: {d.startTime} - {d.endTime}
                            </p>
                            {d.location && d.location.address && (
                              <p className="text-blue-600 mt-1">
                                📍 {d.location.address}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    ✓ Time will be automatically assigned (30 min slots)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Appointment
                  </label>
                  <textarea
                    value={scheduleFormData.reason}
                    onChange={(e) =>
                      setScheduleFormData({ ...scheduleFormData, reason: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="e.g., Skin consultation, treatment follow-up..."
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-2">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmScheduleAppointment}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Request Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
