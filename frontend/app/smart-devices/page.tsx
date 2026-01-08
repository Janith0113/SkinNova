'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Device {
  _id: string;
  deviceType: string;
  deviceName: string;
  deviceModel?: string;
  isConnected: boolean;
  lastSyncedAt?: string;
  permissions: {
    heartRate: boolean;
    steps: boolean;
    sleep: boolean;
    temperature: boolean;
    stress: boolean;
    ecg: boolean;
    bloodPressure: boolean;
    spO2: boolean;
    activity: boolean;
    hydration: boolean;
  };
}

export default function SmartDevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState('');

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      const response = await fetch('http://localhost:4000/api/health/devices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectDevice = async (deviceType: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Generate a unique device ID (in real app, this would come from the actual device)
      const deviceId = `${deviceType}-${Date.now()}`;
      
      const response = await fetch('http://localhost:4000/api/health/devices/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceType,
          deviceId,
          deviceName: deviceType === 'apple-watch' ? 'Apple Watch' : 
                     deviceType === 'samsung-watch' ? 'Samsung Galaxy Watch' : 
                     deviceType === 'wear-os' ? 'Wear OS Device' : 'Smartwatch',
          permissions: {
            heartRate: true,
            steps: true,
            sleep: true,
            temperature: true,
            stress: true,
            ecg: true,
            bloodPressure: true,
            spO2: true,
            activity: true,
            hydration: true
          },
          syncFrequency: 'hourly'
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowConnectModal(false);
        fetchDevices();
        
        // Start syncing health data
        syncHealthData(data.device.deviceId, deviceType);
      }
    } catch (error) {
      console.error('Error connecting device:', error);
    }
  };

  const syncHealthData = async (deviceId: string, deviceType: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Simulate health data (in real app, this would come from the actual device)
      const healthData = {
        heartRate: Math.floor(Math.random() * 30) + 60,
        steps: Math.floor(Math.random() * 10000) + 5000,
        bodyTemperature: Math.random() * 2 + 36.5,
        spO2: Math.floor(Math.random() * 5) + 95,
        stressLevel: Math.floor(Math.random() * 50) + 20,
        sleepDurationMinutes: Math.floor(Math.random() * 180) + 360,
        caloriesBurned: Math.floor(Math.random() * 1000) + 1500,
        activeMinutes: Math.floor(Math.random() * 60) + 30,
        recordedAt: new Date(),
        dataSource: deviceType === 'apple-watch' ? 'Apple Health' : 
                   deviceType === 'samsung-watch' ? 'Samsung Health' : 'Google Fit'
      };

      await fetch('http://localhost:4000/api/health/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId,
          healthData
        })
      });
    } catch (error) {
      console.error('Error syncing health data:', error);
    }
  };

  const disconnectDevice = async (deviceId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:4000/api/health/devices/${deviceId}/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchDevices();
      }
    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-700"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                ⌚ Smart Device Hub
              </h1>
            </div>
            <button
              onClick={() => setShowConnectModal(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
            >
              + Connect Device
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connected Devices */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connected Devices</h2>
          
          {devices.filter(d => d.isConnected).length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border-2 border-gray-200">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-gray-600 text-lg">No devices connected yet</p>
              <p className="text-gray-500 mt-2">Connect your smartwatch or smartphone to start tracking your health</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.filter(d => d.isConnected).map(device => (
                <div key={device._id} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-300 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">
                      {device.deviceType === 'apple-watch' ? '⌚' : 
                       device.deviceType === 'samsung-watch' ? '⌚' : 
                       device.deviceType === 'smartphone' ? '📱' : '⌚'}
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                      Connected
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{device.deviceName}</h3>
                  {device.deviceModel && (
                    <p className="text-gray-600 text-sm mb-3">{device.deviceModel}</p>
                  )}
                  
                  {device.lastSyncedAt && (
                    <p className="text-gray-500 text-xs mb-4">
                      Last synced: {new Date(device.lastSyncedAt).toLocaleString()}
                    </p>
                  )}
                  
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Tracking:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(device.permissions)
                        .filter(([_, enabled]) => enabled)
                        .map(([perm]) => (
                          <span key={perm} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {perm}
                          </span>
                        ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => disconnectDevice(device.deviceName)}
                    className="w-full bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-all"
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Devices */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Devices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Apple Watch */}
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 shadow-lg border-2 border-blue-300 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">⌚</div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Apple Watch</h3>
              <p className="text-gray-700 text-sm mb-4">Real-time heart rate, body temperature, and stress monitoring</p>
              
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="text-xs bg-blue-200 text-blue-900 px-3 py-1 rounded-full">Heart Rate</span>
                <span className="text-xs bg-blue-200 text-blue-900 px-3 py-1 rounded-full">Temperature</span>
                <span className="text-xs bg-blue-200 text-blue-900 px-3 py-1 rounded-full">Sleep Data</span>
                <span className="text-xs bg-blue-200 text-blue-900 px-3 py-1 rounded-full">Stress Level</span>
              </div>
              
              <button
                onClick={() => connectDevice('apple-watch')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                Connect Apple Watch
              </button>
            </div>

            {/* Samsung Watch */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg border-2 border-purple-300 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">⌚</div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Samsung Galaxy Watch</h3>
              <p className="text-gray-700 text-sm mb-4">Comprehensive health tracking with Samsung Health integration</p>
              
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="text-xs bg-purple-200 text-purple-900 px-3 py-1 rounded-full">Activity</span>
                <span className="text-xs bg-purple-200 text-purple-900 px-3 py-1 rounded-full">Hydration</span>
                <span className="text-xs bg-purple-200 text-purple-900 px-3 py-1 rounded-full">ECG</span>
                <span className="text-xs bg-purple-200 text-purple-900 px-3 py-1 rounded-full">SpO2</span>
              </div>
              
              <button
                onClick={() => connectDevice('samsung-watch')}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all"
              >
                Connect Samsung Watch
              </button>
            </div>

            {/* Wear OS */}
            <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-6 shadow-lg border-2 border-green-300 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">⌚</div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Wear OS Devices</h3>
              <p className="text-gray-700 text-sm mb-4">Compatible with all Wear OS smartwatches</p>
              
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="text-xs bg-green-200 text-green-900 px-3 py-1 rounded-full">Heart Rate</span>
                <span className="text-xs bg-green-200 text-green-900 px-3 py-1 rounded-full">Steps</span>
                <span className="text-xs bg-green-200 text-green-900 px-3 py-1 rounded-full">Sleep</span>
                <span className="text-xs bg-green-200 text-green-900 px-3 py-1 rounded-full">Calories</span>
              </div>
              
              <button
                onClick={() => connectDevice('wear-os')}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
              >
                Connect Wear OS
              </button>
            </div>
          </div>
        </div>

        {/* Health Dashboard Link */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-4">📊 View Your Health Dashboard</h3>
          <p className="mb-6">Track your health metrics, analyze trends, and get personalized insights for better skin health</p>
          <button
            onClick={() => router.push('/health-dashboard')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all"
          >
            Open Health Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
