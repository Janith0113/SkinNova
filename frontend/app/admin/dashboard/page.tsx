"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface User {
  _id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalAdmins: number;
}

interface Activity {
  _id: string;
  action: string;
  actionTitle: string;
  userName: string;
  userEmail: string;
  description?: string;
  metadata?: any;
  createdAt: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({ patientId: "", requestedDate: "", reason: "" });
  const [editFormData, setEditFormData] = useState({ name: "", email: "", role: "patient" });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
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

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAllUsers();
      fetchActivities();
    }
  }, [user]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/api/admin/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setAllUsers(data.users || []);

      // Calculate stats
      const totalUsers = data.users?.length || 0;
      const totalPatients =
        data.users?.filter((u: User) => u.role?.toLowerCase() === "patient").length || 0;
      const totalDoctors =
        data.users?.filter((u: User) => u.role?.toLowerCase() === "doctor").length || 0;
      const totalAdmins =
        data.users?.filter((u: User) => u.role?.toLowerCase() === "admin").length || 0;

      setStats({
        totalUsers,
        totalPatients,
        totalDoctors,
        totalAdmins,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users"
      );
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/api/activities", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  const handleViewUser = (userData: User) => {
    setSelectedUser(userData);
    setShowViewModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log("Deleting user:", userId);
      const token = localStorage.getItem("token");
      console.log("Token:", token ? "exists" : "missing");
      
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response status:", response.status);
      const responseData = await response.json();
      console.log("Delete response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to delete user");
      }

      console.log("User deleted successfully");
      setDeleteConfirm(null);
      await fetchAllUsers(); // Refresh the table
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete user";
      console.error("Error deleting user:", errorMsg);
      alert(errorMsg);
    }
  };

  const handleEditUser = (userData: User) => {
    setSelectedUser(userData);
    setEditFormData({
      name: userData.name,
      email: userData.email,
      role: userData.role.toLowerCase(),
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setUpdateLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:4000/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email,
          role: editFormData.role,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update user");
      }

      alert("User updated successfully!");
      setShowEditModal(false);
      await fetchAllUsers(); // Refresh the table
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update user";
      console.error("Error updating user:", errorMsg);
      alert(errorMsg);
    } finally {
      setUpdateLoading(false);
    }
  };

  const stats_data = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "from-blue-500 to-cyan-500", change: "+12%" },
    { label: "Active Patients", value: stats.totalPatients, icon: "🏥", color: "from-green-500 to-emerald-500", change: "+8%" },
    { label: "Doctors", value: stats.totalDoctors, icon: "⚕️", color: "from-purple-500 to-pink-500", change: "+3%" },
    { label: "Admins", value: stats.totalAdmins, icon: "👨‍💼", color: "from-orange-500 to-red-500", change: "+1%" },
  ];

  // Generate real chart data based on actual user creation dates
  const generateRealChartData = () => {
    if (allUsers.length === 0) {
      return [
        { date: "No Data", users: 0, patients: 0, doctors: 0, admins: 0 },
      ];
    }

    // Get all unique dates when users were created
    const usersByDate: { [key: string]: { users: any[]; patients: any[]; doctors: any[]; admins: any[] } } = {};
    
    allUsers.forEach(user => {
      const createdDate = new Date(user.createdAt);
      const dateKey = createdDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!usersByDate[dateKey]) {
        usersByDate[dateKey] = { users: [], patients: [], doctors: [], admins: [] };
      }

      usersByDate[dateKey].users.push(user);
      
      // Categorize by role
      if (user.role?.toLowerCase() === "patient") {
        usersByDate[dateKey].patients.push(user);
      } else if (user.role?.toLowerCase() === "doctor") {
        usersByDate[dateKey].doctors.push(user);
      } else if (user.role?.toLowerCase() === "admin") {
        usersByDate[dateKey].admins.push(user);
      }
    });

    // Get sorted unique dates
    const sortedDates = Object.keys(usersByDate).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    // Calculate cumulative counts per date
    let cumulativeUsers = 0;
    let cumulativePatients = 0;
    let cumulativeDoctors = 0;
    let cumulativeAdmins = 0;

    const chartDataArray = sortedDates.map(dateKey => {
      cumulativeUsers += usersByDate[dateKey].users.length;
      cumulativePatients += usersByDate[dateKey].patients.length;
      cumulativeDoctors += usersByDate[dateKey].doctors.length;
      cumulativeAdmins += usersByDate[dateKey].admins.length;

      return {
        date: dateKey,
        users: cumulativeUsers,
        patients: cumulativePatients,
        doctors: cumulativeDoctors,
        admins: cumulativeAdmins,
      };
    });

    return chartDataArray.length > 0 ? chartDataArray : [{ date: "No Data", users: 0, patients: 0, doctors: 0, admins: 0 }];
  };

  const chartData = generateRealChartData();

  const getActionTypeColor = (action: string) => {
    switch (action) {
      case "user_registration":
        return "text-green-600";
      case "appointment_scheduled":
        return "text-blue-600";
      case "profile_updated":
        return "text-yellow-600";
      case "user_verified":
        return "text-purple-600";
      case "password_reset_requested":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleScheduleAppointment = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setScheduleFormData({ patientId: "", requestedDate: "", reason: "" });
    setShowScheduleModal(true);
  };

  const handleConfirmScheduleAppointment = async () => {
    if (!scheduleFormData.patientId || !scheduleFormData.requestedDate || !scheduleFormData.reason) {
      alert("Please fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/appointments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          patientId: scheduleFormData.patientId,
          requestedDate: scheduleFormData.requestedDate,
          reason: scheduleFormData.reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule appointment");
      }

      alert("Appointment scheduled successfully!");
      setShowScheduleModal(false);
      await fetchActivities();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to schedule appointment");
    }
  };

  const handleVerifyUser = (userId: string) => {
    // Navigate to verification page
    window.location.href = `/admin/verify-doctor?id=${userId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Patient":
        return "bg-blue-100 text-blue-700";
      case "Doctor":
        return "bg-purple-100 text-purple-700";
      case "Admin":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="pt-10 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                A
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.name || "Admin"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  fetchAllUsers();
                  fetchActivities();
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2"
              >
                <span>🔄</span> Refresh
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content with top space */}
      <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats_data.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-md`}
                >
                  {stat.icon}
                </div>
                <span className="text-green-500 text-sm font-semibold bg-green-50 px-3 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.label}
              </h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex space-x-2 overflow-x-auto">
          {["overview", "users", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex-1 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* User Growth Analytics Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    User Growth Analytics
                  </h2>
                  <Line
                    data={{
                      labels: chartData.map(d => d.date),
                      datasets: [
                        {
                          label: 'Total Users',
                          data: chartData.map(d => d.users),
                          borderColor: '#3b82f6',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                          pointBackgroundColor: '#3b82f6',
                        },
                        {
                          label: 'Patients',
                          data: chartData.map(d => d.patients),
                          borderColor: '#10b981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                          pointBackgroundColor: '#10b981',
                        },
                        {
                          label: 'Doctors',
                          data: chartData.map(d => d.doctors),
                          borderColor: '#8b5cf6',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                          pointBackgroundColor: '#8b5cf6',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                          labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12, weight: 'bold' },
                          },
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                          },
                          ticks: {
                            font: { size: 11 },
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            font: { size: 11 },
                          },
                        },
                      },
                    }}
                  />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: "Add User",
                        icon: "➕",
                        color: "from-green-500 to-emerald-500",
                      },
                      {
                        label: "View Reports",
                        icon: "📄",
                        color: "from-blue-500 to-cyan-500",
                      },
                      {
                        label: "Send Email",
                        icon: "✉️",
                        color: "from-purple-500 to-pink-500",
                      },
                      {
                        label: "Settings",
                        icon: "⚙️",
                        color: "from-orange-500 to-red-500",
                      },
                    ].map((action, index) => (
                      <button
                        key={index}
                        className={`bg-gradient-to-br ${action.color} text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center space-y-2`}
                      >
                        <span className="text-3xl">{action.icon}</span>
                        <span className="font-medium">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    All Registered Users
                  </h2>
                  <button
                    onClick={fetchAllUsers}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading users...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="p-6 text-center">
                    <p className="text-red-600 font-medium">Error: {error}</p>
                    <button
                      onClick={fetchAllUsers}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : allUsers.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <p className="text-lg font-medium">No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                            Name
                          </th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                            Email
                          </th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                            Role
                          </th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                            Joined
                          </th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((u, index) => (
                          <tr
                            key={u._id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {u.name[0]}
                                </div>
                                <span className="font-medium text-gray-800">
                                  {u.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {u.email}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                  u.role
                                )}`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {formatDate(u.createdAt)}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewUser(u)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="View user details"
                                >
                                  <span className="text-lg">👁️</span>
                                </button>
                                <button
                                  onClick={() => handleEditUser(u)}
                                  className="text-green-600 hover:text-green-800 transition-colors"
                                  title="Edit user"
                                >
                                  <span className="text-lg">✏️</span>
                                </button>
                                {u.role?.toLowerCase() === "doctor" && (
                                  <button
                                    onClick={() => handleVerifyUser(u._id)}
                                    className="text-purple-600 hover:text-purple-800 transition-colors"
                                    title="Verify doctor"
                                  >
                                    <span className="text-lg">✅</span>
                                  </button>
                                )}
                                {u.role?.toLowerCase() === "doctor" && (
                                  <button
                                    onClick={() => handleScheduleAppointment(u._id)}
                                    className="text-orange-600 hover:text-orange-800 transition-colors"
                                    title="Schedule appointment"
                                  >
                                    <span className="text-lg">📅</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => setDeleteConfirm(u._id)}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                  title="Delete user"
                                >
                                  <span className="text-lg">🗑️</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-gray-800">
                  Activity Log
                </h2>
                {activities.length > 0 ? (
                  <div className="space-y-8">
                    {/* New User Registration Section */}
                    {activities.some(a => a.action === "user_registration") && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-200">
                          👤 New user registration
                        </h3>
                        <div className="space-y-3">
                          {activities
                            .filter(a => a.action === "user_registration")
                            .map((activity) => (
                              <div
                                key={activity._id}
                                className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                              >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600">
                                  📝
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">
                                    {activity.actionTitle}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {activity.userName || activity.userEmail}
                                  </p>
                                  {activity.description && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {activity.description}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(activity.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* User Verified Section */}
                    {activities.some(a => a.action === "user_verified") && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-green-200">
                          ✅ User verified
                        </h3>
                        <div className="space-y-3">
                          {activities
                            .filter(a => a.action === "user_verified")
                            .map((activity) => (
                              <div
                                key={activity._id}
                                className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                              >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100 text-green-600">
                                  ✅
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">
                                    {activity.actionTitle}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {activity.userName || activity.userEmail}
                                  </p>
                                  {activity.description && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {activity.description}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(activity.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Other User Activities Section */}
                    {activities.some(a => ["password_reset_requested", "profile_updated"].includes(a.action)) && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-yellow-200">
                          ⚠️ Other Activities
                        </h3>
                        <div className="space-y-3">
                          {activities
                            .filter(a => ["password_reset_requested", "profile_updated"].includes(a.action))
                            .map((activity) => {
                              let activityIcon = "⚠";
                              let bgColor = "bg-yellow-100 text-yellow-600";

                              if (activity.action === "password_reset_requested") {
                                activityIcon = "🔑";
                              } else if (activity.action === "profile_updated") {
                                activityIcon = "📝";
                              }

                              return (
                                <div
                                  key={activity._id}
                                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                                >
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bgColor}`}>
                                    {activityIcon}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800">
                                      {activity.actionTitle}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {activity.userName || activity.userEmail}
                                    </p>
                                    {activity.description && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {activity.description}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(activity.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Appointment Activities Section */}
                    {activities.some(a => ["appointment_scheduled", "appointment_approved", "appointment_rejected"].includes(a.action)) && (
                      <div>
                        {/* Appointment Scheduled */}
                        {activities.some(a => a.action === "appointment_scheduled") && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-200">
                              📅 Appointment Scheduled
                            </h3>
                            <div className="space-y-3">
                              {activities
                                .filter(a => a.action === "appointment_scheduled")
                                .map((activity) => (
                                  <div
                                    key={activity._id}
                                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                                  >
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600">
                                      📅
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800">
                                        {activity.actionTitle}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        By: {activity.userName || activity.userEmail}
                                      </p>
                                      {activity.metadata?.patientName && (
                                        <p className="text-sm text-gray-600">
                                          Patient: {activity.metadata.patientName} ({activity.metadata.patientId})
                                        </p>
                                      )}
                                      {activity.description && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {activity.description}
                                        </p>
                                      )}
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(activity.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Appointment Approved */}
                        {activities.some(a => a.action === "appointment_approved") && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-green-200">
                              ✅ Appointment Approved
                            </h3>
                            <div className="space-y-3">
                              {activities
                                .filter(a => a.action === "appointment_approved")
                                .map((activity) => (
                                  <div
                                    key={activity._id}
                                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                                  >
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100 text-green-600">
                                      ✅
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800">
                                        {activity.actionTitle}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        By: {activity.userName || activity.userEmail}
                                      </p>
                                      {activity.metadata?.patientName && (
                                        <p className="text-sm text-gray-600">
                                          Patient: {activity.metadata.patientName} ({activity.metadata.patientId})
                                        </p>
                                      )}
                                      {activity.description && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {activity.description}
                                        </p>
                                      )}
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(activity.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Appointment Rejected */}
                        {activities.some(a => a.action === "appointment_rejected") && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-red-200">
                              ❌ Appointment Rejected
                            </h3>
                            <div className="space-y-3">
                              {activities
                                .filter(a => a.action === "appointment_rejected")
                                .map((activity) => (
                                  <div
                                    key={activity._id}
                                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                                  >
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
                                      ❌
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800">
                                        {activity.actionTitle}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        By: {activity.userName || activity.userEmail}
                                      </p>
                                      {activity.metadata?.patientName && (
                                        <p className="text-sm text-gray-600">
                                          Patient: {activity.metadata.patientName} ({activity.metadata.patientId})
                                        </p>
                                      )}
                                      {activity.description && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {activity.description}
                                        </p>
                                      )}
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(activity.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No activities yet
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold mb-4 text-gray-800">
                System Status
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Server Status", value: "Online", color: "green" },
                  { label: "Database", value: "Connected", color: "green" },
                  { label: "API Response", value: "45ms", color: "green" },
                  { label: "Storage Used", value: "67%", color: "yellow" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600">
                      {item.label}
                    </span>
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        item.color === "green"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold mb-4 text-gray-800">
                Notifications
              </h3>
              <div className="space-y-3">
                {[
                  { title: "New appointment", time: "5m ago", icon: "🔔" },
                  {
                    title: "System backup completed",
                    time: "1h ago",
                    icon: "💾",
                  },
                  {
                    title: "User report submitted",
                    time: "2h ago",
                    icon: "📝",
                  },
                ].map((notif, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <span className="text-2xl">{notif.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-400">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-sm opacity-90">New Signups</span>
                  <span className="text-2xl font-bold">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-sm opacity-90">Active Patients</span>
                  <span className="text-2xl font-bold">{stats.totalPatients}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Active Sessions</span>
                  <span className="text-2xl font-bold">{stats.totalAdmins + stats.totalDoctors}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <h2 className="text-xl font-bold text-white">User Details</h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="text-sm text-gray-600 font-medium">Name</label>
                <p className="text-gray-800 font-semibold">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Email</label>
                <p className="text-gray-800">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Role</label>
                <p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Joined Date</label>
                <p className="text-gray-800">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600">
              <h2 className="text-xl font-bold text-white">Edit User</h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="text-sm text-gray-600 font-medium mb-1 block">Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium mb-1 block">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium mb-1 block">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={updateLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {updateLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600">
              <h2 className="text-xl font-bold text-white">Confirm Delete</h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  User: <span className="font-semibold">{allUsers.find(u => u._id === deleteConfirm)?.name}</span>
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-pink-600">
              <h2 className="text-xl font-bold text-white">Schedule Appointment</h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Patient
                </label>
                <select
                  value={scheduleFormData.patientId}
                  onChange={(e) =>
                    setScheduleFormData({ ...scheduleFormData, patientId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">-- Choose Patient --</option>
                  {allUsers
                    .filter((u) => u.role?.toLowerCase() === "patient")
                    .map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name} ({patient.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduleFormData.requestedDate}
                  onChange={(e) =>
                    setScheduleFormData({ ...scheduleFormData, requestedDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., Regular checkup, skin consultation..."
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
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
