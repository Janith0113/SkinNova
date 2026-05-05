'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Volume2, Vibrate, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { registerServiceWorker, requestNotificationPermission, sendLocalNotification, listenForNotificationMessages } from '@/utils/notificationUtils';

interface NotificationSettings {
  notificationsEnabled: boolean;
  notificationMethod: 'push' | 'browser' | 'email' | 'sms' | 'none';
  notificationFrequency: 'on-time' | '15-min-before' | '30-min-before' | '1-hour-before';
  allowSound: boolean;
  allowVibration: boolean;
}

interface MedicationNotif {
  id: string;
  day: string;
  time: string;
  medicationName: string;
  dosage?: string;
  isCompleted?: boolean;
  completedAt?: Date;
}

interface MedicationStats {
  totalMedications: number;
  completedMedications: number;
  missedMedications: number;
  compliancePercent: number;
  notificationsEnabled: boolean;
  notificationMethod: string;
}

export default function MedicationNotificationSettings() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    notificationsEnabled: false,
    notificationMethod: 'browser',
    notificationFrequency: '15-min-before',
    allowSound: true,
    allowVibration: true
  });

  const [medicationSchedule, setMedicationSchedule] = useState<MedicationNotif[]>([]);
  const [todaysSchedule, setTodaysSchedule] = useState<MedicationNotif[]>([]);
  const [stats, setStats] = useState<MedicationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Register service worker
    registerServiceWorker();
    
    // Load notification settings
    loadNotificationSettings();
    
    // Check notification permission
    checkNotificationPermission();
    
    // Listen for notification messages from service worker
    listenForNotificationMessages((data) => {
      if (data.type === 'MARK_MEDICATION_COMPLETED') {
        handleMarkCompleted(data.notificationId);
      }
    });
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const requestNotificationPermissionHandler = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      setMessage('✓ Notification permission granted!');
      setTimeout(() => setMessage(''), 3000);
      return true;
    } else {
      setMessage('✗ Notification permission denied.');
      setTimeout(() => setMessage(''), 3000);
      return false;
    }
  };

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Load settings
      const settingsResponse = await fetch('http://localhost:4000/api/leprosy/notifications/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (settingsData.settings) {
          setNotificationSettings({
            notificationsEnabled: settingsData.settings.notificationsEnabled,
            notificationMethod: settingsData.settings.notificationMethod,
            notificationFrequency: settingsData.settings.notificationFrequency,
            allowSound: settingsData.settings.allowSound,
            allowVibration: settingsData.settings.allowVibration
          });
          setMedicationSchedule(settingsData.settings.notifications || []);
        }
      }

      // Load stats
      const statsResponse = await fetch('http://localhost:4000/api/leprosy/notifications/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Load today's schedule
      const todayResponse = await fetch('http://localhost:4000/api/leprosy/notifications/todays-schedule', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        if (todayData.schedule?.medications) {
          setTodaysSchedule(todayData.schedule.medications);
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      setMessage('✗ Failed to load settings');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (notificationSettings.notificationsEnabled) {
        // Disable
        const response = await fetch('http://localhost:4000/api/leprosy/notifications/disable', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setNotificationSettings(prev => ({ ...prev, notificationsEnabled: false }));
          setMessage('✓ Notifications disabled');
        }
      } else {
        // Request browser permission first
        if ('Notification' in window && Notification.permission !== 'granted') {
          const hasPermission = await requestNotificationPermissionHandler();
          if (!hasPermission) {
            setMessage('⚠ Browser notification permission required');
            setLoading(false);
            return;
          }
        }

        // Enable
        const response = await fetch('http://localhost:4000/api/leprosy/notifications/enable', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            notificationMethod: notificationSettings.notificationMethod,
            notificationFrequency: notificationSettings.notificationFrequency
          })
        });

        if (response.ok) {
          setNotificationSettings(prev => ({ ...prev, notificationsEnabled: true }));
          setMessage('✓ Notifications enabled successfully');
          // Test notification
          sendLocalNotification('SkinNova - Leprosy Care Assistant', {
            body: 'Medication reminders are now active!',
          });
        }
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error toggling notifications:', error);
      setMessage('✗ Failed to update notifications');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (setting: string, value: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const updatedSettings = {
        ...notificationSettings,
        [setting]: value
      };

      const response = await fetch('http://localhost:4000/api/leprosy/notifications/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [setting === 'method' ? 'notificationMethod' : setting === 'frequency' ? 'notificationFrequency' : setting === 'sound' ? 'allowSound' : 'allowVibration']: value
        })
      });

      if (response.ok) {
        setNotificationSettings(updatedSettings);
        setMessage('✓ Settings updated');
      }

      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('✗ Failed to update settings');
      setTimeout(() => setMessage(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:4000/api/leprosy/notifications/mark-completed', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        // Update local state
        setMedicationSchedule(prev =>
          prev.map(med =>
            med.id === notificationId ? { ...med, isCompleted: true } : med
          )
        );
        setMessage('✓ Medication marked as taken');
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (error) {
      console.error('Error marking medication as completed:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✓') ? 'bg-green-100 text-green-800' : message.includes('⚠') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Enable/Disable Notifications */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Medication Notifications</h2>
              <p className="text-sm text-gray-600">Get reminded about your medication times</p>
            </div>
          </div>
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              notificationSettings.notificationsEnabled
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {notificationSettings.notificationsEnabled ? 'Disable' : 'Enable'} Notifications
          </button>
        </div>

        {notificationPermission !== 'granted' && (
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Browser notifications are not enabled. Click the button above to grant permission.
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalMedications}</div>
            <div className="text-xs text-gray-600 mt-1">Total Medications</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completedMedications}</div>
            <div className="text-xs text-gray-600 mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.missedMedications}</div>
            <div className="text-xs text-gray-600 mt-1">Missed</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.compliancePercent}%</div>
            <div className="text-xs text-gray-600 mt-1">Compliance</div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {notificationSettings.notificationsEnabled && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-800">Notification Settings</h3>

          {/* Notification Method */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Notification Method</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['browser', 'email', 'sms', 'push'].map(method => (
                <button
                  key={method}
                  onClick={() => handleSettingChange('method', method)}
                  className={`p-3 rounded-lg border-2 transition-all capitalize font-medium ${
                    notificationSettings.notificationMethod === method
                      ? 'border-purple-600 bg-purple-50 text-purple-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Frequency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Remind Me</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'on-time', label: 'On Time' },
                { value: '15-min-before', label: '15 Min Before' },
                { value: '30-min-before', label: '30 Min Before' },
                { value: '1-hour-before', label: '1 Hour Before' }
              ].map(freq => (
                <button
                  key={freq.value}
                  onClick={() => handleSettingChange('frequency', freq.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    notificationSettings.notificationFrequency === freq.value
                      ? 'border-purple-600 bg-purple-50 text-purple-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Vibration */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={notificationSettings.allowSound}
                onChange={(e) => handleSettingChange('sound', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm font-medium">Sound</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={notificationSettings.allowVibration}
                onChange={(e) => handleSettingChange('vibration', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4" />
                <span className="text-sm font-medium">Vibration</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      {todaysSchedule.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Medications</h3>
          <div className="space-y-3">
            {todaysSchedule.map(med => (
              <div
                key={med.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  med.isCompleted
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className={`w-5 h-5 ${med.isCompleted ? 'text-green-600' : 'text-gray-600'}`} />
                  <div>
                    <div className="font-semibold text-gray-800">{med.time} - {med.medicationName}</div>
                    {med.dosage && <div className="text-sm text-gray-600">{med.dosage}</div>}
                  </div>
                </div>
                {!med.isCompleted ? (
                  <button
                    onClick={() => handleMarkCompleted(med.id)}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all"
                  >
                    Mark Done
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    Taken
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Medications Schedule */}
      {medicationSchedule.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Medication Schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 text-gray-700 font-semibold">Day</th>
                  <th className="text-left p-3 text-gray-700 font-semibold">Time</th>
                  <th className="text-left p-3 text-gray-700 font-semibold">Medication</th>
                  <th className="text-center p-3 text-gray-700 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {medicationSchedule.slice(0, 10).map(med => (
                  <tr key={med.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 text-gray-800 font-medium">{med.day}</td>
                    <td className="p-3 text-gray-700">{med.time}</td>
                    <td className="p-3 text-gray-700">{med.medicationName}</td>
                    <td className="p-3 text-center">
                      {med.isCompleted ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          ✓ Taken
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {medicationSchedule.length > 10 && (
            <div className="text-center mt-4 text-sm text-gray-600">
              Showing 10 of {medicationSchedule.length} medications
            </div>
          )}
        </div>
      )}
    </div>
  );
}
