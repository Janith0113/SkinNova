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
}

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvalData, setApprovalData] = useState({ approvedDate: "", notes: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [followRequests, setFollowRequests] = useState<any[]>([]);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChatPatient, setSelectedChatPatient] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
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
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user?.role === "doctor") {
      fetchAppointments();
      fetchFollowRequests();
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

  const fetchFollowRequests = async () => {
    try {
      const doctorId = user?._id || user?.id || user?.userId;
      
      if (!doctorId) {
        console.warn("Doctor ID not available yet");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/api/follow-requests/doctor/${doctorId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch follow requests");
      }

      const data = await response.json();
      setFollowRequests(data.requests || []);
    } catch (err) {
      console.error("Error fetching follow requests:", err);
    }
  };

  const handleAcceptFollowRequest = async (followRequestId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/api/follow-requests/accept/${followRequestId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept follow request");
      }

      alert("Follow request accepted!");
      await fetchFollowRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to accept follow request");
    }
  };

  const handleRejectFollowRequest = async (followRequestId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/api/follow-requests/reject/${followRequestId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to reject follow request");
      }

      alert("Follow request rejected!");
      await fetchFollowRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject follow request");
    }
  };

  const handleUnfollowPatient = async (patientId: string) => {
    try {
      const doctorId = user?._id || user?.id || user?.userId;

      if (!doctorId || !patientId) {
        alert("Error: Doctor or Patient ID missing");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/follow-requests/reject/${patientId}/${doctorId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unfollow patient");
      }

      alert("Unfollowed successfully!");
      await fetchFollowRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to unfollow patient");
    }
  };

  const handleOpenChat = async (patient: any) => {
    setSelectedChatPatient(patient);
    try {
      const doctorId = user?._id || user?.id || user?.userId;
      
      if (!doctorId || !patient?.patientId) {
        alert("Patient or doctor info not loaded");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/api/chat/${patient.patientId}/${doctorId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load chat");
      }

      const data = await response.json();
      setChatMessages(data.chat?.messages || []);
      setShowChatModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load chat");
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    try {
      const doctorId = user?._id || user?.id || user?.userId;
      
      if (!doctorId || !selectedChatPatient?.patientId) {
        alert("Chat info not loaded");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/api/chat/${selectedChatPatient.patientId}/${doctorId}/message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: doctorId,
          senderName: user.name,
          senderRole: "doctor",
          content: chatInput,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setChatMessages(data.chat?.messages || []);
      setChatInput("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

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

        {/* Follow Requests Section */}
        {followRequests.length > 0 && (
          <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              ⭐ Patient Follow Requests ({followRequests.filter(f => f.status === 'pending').length})
            </h2>
            <div className="space-y-4">
              {followRequests.map((request) => (
                <div key={request._id} className={`bg-white/40 rounded-2xl p-5 border border-white/50 hover:shadow-lg transition-all ${request.status === 'accepted' ? 'border-emerald-300' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">
                        {request.patientName} <span className="text-xs text-gray-600">({request.patientEmail})</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Status: <strong className={request.status === 'pending' ? 'text-yellow-700' : request.status === 'accepted' ? 'text-emerald-700' : 'text-red-700'}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </strong>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Requested: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptFollowRequest(request._id)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectFollowRequest(request._id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {request.status === 'accepted' && (
                        <div className="flex gap-2 flex-col sm:flex-row">
                          <button
                            onClick={() => handleOpenChat({ patientId: request.patientId, patientName: request.patientName })}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                          >
                            💬 Message
                          </button>
                          <button
                            onClick={() => handleUnfollowPatient(request.patientId)}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                          >
                            🚫 Unfollow
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

          {appointments.length === 0 && (
            <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-12 text-center">
              <p className="text-gray-700 text-lg">No appointments yet</p>
              <p className="text-gray-600 text-sm mt-2">Appointments will appear here when patients request them</p>
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

      {/* Chat Modal */}
      {showChatModal && selectedChatPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-96 flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Chat with {selectedChatPatient.patientName}</h2>
              <button
                onClick={() => setShowChatModal(false)}
                className="text-white text-xl font-bold hover:opacity-80"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-center text-gray-500 text-sm mt-4">No messages yet. Start a conversation!</p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderId === user._id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-80">{msg.senderName}</p>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Type a message..."
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
