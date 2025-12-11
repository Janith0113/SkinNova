"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  requestedDate: string;
  approvedDate?: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed";
  notes?: string;
  availabilitySlotId?: string;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvalData, setApprovalData] = useState({ approvedDate: "", notes: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) {
      const userData = JSON.parse(raw);
      setUser(userData);
      if (userData.role !== "doctor") {
        router.push("/");
      } else if (userData.verified === false) {
        // Redirect unverified doctors to upload documents page
        router.push("/doctor/upload-documents");
      }
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
    if (user?.role === "doctor") {
      fetchAppointments();
      const interval = setInterval(fetchAppointments, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedAppointment) {
      alert("No appointment selected");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/appointments/${selectedAppointment._id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes: approvalData.notes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve appointment");
      }

      alert("Appointment approved! Email sent to patient.");
      setShowApproveModal(false);
      setApprovalData({ approvedDate: "", notes: "" });
      await fetchAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve appointment");
    }
  };

  const handleReject = async () => {
    if (!selectedAppointment) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/appointments/${selectedAppointment._id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject appointment");
      }

      alert("Appointment rejected! Email sent to patient.");
      setShowRejectModal(false);
      setRejectReason("");
      await fetchAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject appointment");
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
      console.log("Uploading file:", file.name, "Size:", file.size, "Type:", file.type);
      console.log("Token present:", !!token);
      
      const response = await fetch("http://localhost:4000/api/profile/upload-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Upload response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Upload error response:", errorData);
        throw new Error(errorData.error || "Failed to upload profile photo");
      }

      const data = await response.json();
      console.log("Upload success response:", data);
      
      // Update profile photo URL with cache busting timestamp
      if (user && (user._id || user.id || user.userId)) {
        const userId = user._id || user.id || user.userId;
        setProfilePhoto(`http://localhost:4000/api/profile/photo/${userId}?t=${Date.now()}`);
      }
      alert("Profile photo uploaded successfully!");
      setShowPhotoModal(false);
    } catch (err) {
      console.error("Upload error:", err);
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

      console.log("Remove photo response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Remove error response:", errorData);
        throw new Error(errorData.error || "Failed to remove profile photo");
      }

      // Clear profile photo by setting to empty string
      setProfilePhoto("");
      alert("Profile photo removed successfully!");
      setShowPhotoModal(false);
    } catch (err) {
      console.error("Remove error:", err);
      alert(err instanceof Error ? err.message : "Failed to remove profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const pendingAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.requestedDate);
    const now = new Date();
    return apt.status === "pending" && appointmentDate > now;
  });

  const approvedAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.approvedDate || apt.requestedDate);
    const now = new Date();
    return apt.status === "approved" && appointmentDate > now;
  });

  const pastAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.approvedDate || apt.requestedDate);
    const now = new Date();
    return (apt.status === "approved" || apt.status === "pending") && appointmentDate <= now;
  });

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
                  <span className="text-5xl sm:text-6xl relative z-10 group-hover/photo:scale-125 transition-transform duration-300">👨‍⚕️</span>
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
                Welcome back, <span className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">Dr {user.name}</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-xl leading-relaxed">
                Manage your patients, review AI-generated skin assessments, and track clinical insights from a single, smart dashboard.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="inline-flex items-center rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white shadow-md">
              Role • {user.role?.toUpperCase()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/doctor/availability")}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 text-white text-sm font-semibold px-4 py-2 shadow hover:bg-blue-600 transition-all"
              >
                <span>📅 Availability</span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 text-white text-sm font-semibold px-4 py-2 shadow hover:bg-red-600 transition-all"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Pending Appointments
            </span>
            <span className="text-3xl font-extrabold text-gray-900">{pendingAppointments.length}</span>
            <span className="text-xs text-yellow-700 font-medium">
              Awaiting your approval
            </span>
          </div>
          <div className="rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Approved Appointments
            </span>
            <span className="text-3xl font-extrabold text-gray-900">{approvedAppointments.length}</span>
            <span className="text-xs text-emerald-700 font-medium">
              Confirmed with patients
            </span>
          </div>
          <div className="rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Total Appointments
            </span>
            <span className="text-3xl font-extrabold text-gray-900">{appointments.length}</span>
            <span className="text-xs text-blue-700 font-medium">
              Overall management
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

        {/* Appointments Section */}
        <div className="space-y-8">
          {/* Pending Appointments */}
          {pendingAppointments.length > 0 && (
            <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                ⏳ Pending Appointments ({pendingAppointments.length})
              </h2>
              <div className="space-y-4">
                {pendingAppointments.map((apt) => (
                  <div key={apt._id} className="bg-white/40 rounded-2xl p-5 border border-white/50 hover:shadow-lg transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-gray-900">
                          {apt.patientName} <span className="text-xs text-gray-600">({apt.patientId})</span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">📅 {new Date(apt.requestedDate).toLocaleString()}</p>
                        <p className="text-sm text-gray-700">📝 {apt.reason}</p>
                        {apt.location?.address && (
                          <p className="text-sm text-blue-700 mt-1 flex items-center gap-1">
                            📍 {apt.location.address}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setShowApproveModal(true);
                          }}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setShowRejectModal(true);
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Appointments */}
          {approvedAppointments.length > 0 && (
            <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                ✅ Approved Appointments ({approvedAppointments.length})
              </h2>
              <div className="space-y-4">
                {approvedAppointments.map((apt) => (
                  <div key={apt._id} className="bg-white/40 rounded-2xl p-5 border border-green-200 hover:shadow-lg transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-gray-900">
                          {apt.patientName} <span className="text-xs text-gray-600">({apt.patientId})</span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">📅 Approved: {apt.approvedDate ? new Date(apt.approvedDate).toLocaleString() : "N/A"}</p>
                        <p className="text-sm text-gray-700">📝 {apt.reason}</p>
                        {apt.location?.address && (
                          <p className="text-sm text-blue-700 mt-1 flex items-center gap-1">
                            📍 {apt.location.address}
                          </p>
                        )}
                        {apt.notes && <p className="text-sm text-gray-700 mt-2"><strong>Notes:</strong> {apt.notes}</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/doctor/view-patient-reports?patientId=${apt.patientId}&appointmentId=${apt._id}`
                            )
                          }
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold whitespace-nowrap"
                        >
                          📄 View Reports
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {appointments.length === 0 && (
            <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-12 text-center">
              <p className="text-gray-700 text-lg">No appointments yet</p>
              <p className="text-gray-600 text-sm mt-2">Appointments will appear here when patients request them</p>
            </div>
          )}

          {/* Past/Completed Appointments */}
          {pastAppointments.length > 0 && (
            <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                📋 Past Appointments ({pastAppointments.length})
              </h2>
              <div className="space-y-4">
                {pastAppointments.map((apt) => (
                  <div key={apt._id} className="bg-white/40 rounded-2xl p-5 border border-gray-300 hover:shadow-lg transition-all opacity-75">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-gray-700">
                          {apt.patientName} <span className="text-xs text-gray-600">({apt.patientId})</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">📅 {new Date(apt.approvedDate || apt.requestedDate).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">📝 {apt.reason}</p>
                        {apt.notes && <p className="text-sm text-gray-600 mt-2"><strong>Notes:</strong> {apt.notes}</p>}
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Approve Appointment</h2>
            <p className="text-gray-600 mb-4">Patient: <strong>{selectedAppointment.patientName}</strong></p>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Scheduled Date & Time</p>
              <p className="text-gray-600">{new Date(selectedAppointment.requestedDate).toLocaleString()}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={approvalData.notes}
                onChange={(e) =>
                  setApprovalData({ ...approvalData, notes: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
                placeholder="Add any notes for the patient"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Reject Appointment</h2>
            <p className="text-gray-600 mb-4">Patient: <strong>{selectedAppointment.patientName}</strong></p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Please explain why you are rejecting this appointment"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

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
                      <span className="text-5xl sm:text-6xl">👨‍⚕️</span>
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
    </div>
  );
}
