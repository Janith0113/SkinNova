"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
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

  const stats = [
    { label: "Total Users", value: "2,847", change: "+12%", icon: "👥", color: "from-blue-500 to-cyan-500" },
    { label: "Active Patients", value: "1,239", change: "+8%", icon: "🏥", color: "from-green-500 to-emerald-500" },
    { label: "Doctors", value: "164", change: "+3%", icon: "⚕️", color: "from-purple-500 to-pink-500" },
    { label: "Appointments", value: "892", change: "+15%", icon: "📅", color: "from-orange-500 to-red-500" },
  ];

  const recentUsers = [
    { name: "Alice Johnson", email: "alice@example.com", role: "Patient", status: "Active", joined: "2024-03-15" },
    { name: "Dr. Smith", email: "smith@example.com", role: "Doctor", status: "Active", joined: "2024-03-14" },
    { name: "Bob Wilson", email: "bob@example.com", role: "Patient", status: "Pending", joined: "2024-03-13" },
    { name: "Dr. Emily Chen", email: "emily@example.com", role: "Doctor", status: "Active", joined: "2024-03-12" },
    { name: "Charlie Brown", email: "charlie@example.com", role: "Patient", status: "Inactive", joined: "2024-03-10" },
  ];

  const activityLog = [
    { action: "New user registration", user: "Alice Johnson", time: "2 minutes ago", type: "success" },
    { action: "Appointment scheduled", user: "Dr. Smith", time: "15 minutes ago", type: "info" },
    { action: "Profile updated", user: "Bob Wilson", time: "1 hour ago", type: "warning" },
    { action: "User verified", user: "Dr. Emily Chen", time: "3 hours ago", type: "success" },
    { action: "Password reset requested", user: "Charlie Brown", time: "5 hours ago", type: "warning" },
  ];

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
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content with top space */}
      <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
                {/* Chart Placeholder */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    User Growth Analytics
                  </h2>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <p className="text-gray-600 font-medium">
                        Interactive Chart Visualization
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Showing trends over the last 30 days
                      </p>
                    </div>
                  </div>
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
                    Recent Users
                  </h2>
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium">
                    Add New User
                  </button>
                </div>
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
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((u, index) => (
                        <tr
                          key={index}
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
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                u.role === "Doctor"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                u.status === "Active"
                                  ? "bg-green-100 text-green-700"
                                  : u.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 transition-colors">
                                <span className="text-lg">✏️</span>
                              </button>
                              <button className="text-red-600 hover:text-red-800 transition-colors">
                                <span className="text-lg">🗑️</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-gray-800">
                  Activity Log
                </h2>
                <div className="space-y-4">
                  {activityLog.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.type === "success"
                            ? "bg-green-100 text-green-600"
                            : activity.type === "warning"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {activity.type === "success"
                          ? "✓"
                          : activity.type === "warning"
                          ? "⚠"
                          : "ℹ"}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.user}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <span className="text-2xl font-bold">24</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-sm opacity-90">Appointments</span>
                  <span className="text-2xl font-bold">67</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Active Sessions</span>
                  <span className="text-2xl font-bold">142</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}
