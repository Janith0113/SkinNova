"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AvailabilitySlot {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function DoctorAvailability() {
  const [user, setUser] = useState<any>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [formData, setFormData] = useState({ dayOfWeek: 0, startTime: "09:00", endTime: "17:00" });
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) {
      const userData = JSON.parse(raw);
      setUser(userData);
      if (userData.role !== "doctor") {
        router.push("/");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user?.role === "doctor") {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/availability/my-availability", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }

      const data = await response.json();
      setAvailabilitySlots(data.availabilitySlots || []);
    } catch (err) {
      console.error("Error fetching availability:", err);
      alert("Failed to load availability slots");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.startTime >= formData.endTime) {
      alert("Start time must be before end time");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const method = editingSlot ? "PUT" : "POST";
      const url = editingSlot
        ? `http://localhost:4000/api/availability/${editingSlot._id}`
        : "http://localhost:4000/api/availability";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dayOfWeek: parseInt(formData.dayOfWeek as any),
          startTime: formData.startTime,
          endTime: formData.endTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save availability");
      }

      alert(editingSlot ? "Availability updated!" : "Availability slot added!");
      setShowForm(false);
      setEditingSlot(null);
      setFormData({ dayOfWeek: 0, startTime: "09:00", endTime: "17:00" });
      fetchAvailability();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save availability");
    }
  };

  const handleEdit = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setFormData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setShowForm(true);
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm("Are you sure you want to remove this availability slot?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/api/availability/${slotId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete availability");
      }

      alert("Availability slot removed!");
      fetchAvailability();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete availability");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSlot(null);
    setFormData({ dayOfWeek: 0, startTime: "09:00", endTime: "17:00" });
  };

  const slotsByDay = DAYS_OF_WEEK.map((day, index) => {
    const slot = availabilitySlots.find(s => s.dayOfWeek === index);
    return { day, index, slot };
  });

  if (!user || user.role !== "doctor") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Your Availability
          </h1>
          <p className="text-gray-600">Set your available time slots for appointments</p>
        </div>

        {/* Add Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            {showForm ? "Cancel" : "+ Add Time Slot"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingSlot ? "Edit Time Slot" : "Add New Time Slot"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Day of Week
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  {editingSlot ? "Update" : "Add"} Slot
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Availability Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Weekly Schedule</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slotsByDay.map(({ day, index, slot }) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    slot
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <h3 className="font-bold text-gray-800 mb-3">{day}</h3>
                  {slot ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        {slot.startTime} - {slot.endTime}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(slot)}
                          className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(slot._id)}
                          className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Not available</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/doctor/dashboard")}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
