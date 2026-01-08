import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import HealthData from '../models/HealthData';
import DeviceConnection from '../models/DeviceConnection';

const router = Router();

// Get all connected devices for a user
router.get('/devices', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    const devices = await DeviceConnection.find({ userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      devices
    });
  } catch (error: any) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices',
      error: error.message
    });
  }
});

// Connect a new device
router.post('/devices/connect', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const {
      deviceType,
      deviceId,
      deviceName,
      deviceModel,
      osVersion,
      permissions,
      syncFrequency
    } = req.body;
    
    // Check if device already exists
    let device = await DeviceConnection.findOne({ deviceId });
    
    if (device) {
      // Update existing device
      device.isConnected = true;
      device.lastSyncedAt = new Date();
      if (permissions) device.permissions = { ...device.permissions, ...permissions };
      if (syncFrequency) device.syncFrequency = syncFrequency;
      await device.save();
    } else {
      // Create new device connection
      device = new DeviceConnection({
        userId,
        deviceType,
        deviceId,
        deviceName,
        deviceModel,
        osVersion,
        isConnected: true,
        permissions: permissions || {},
        syncFrequency: syncFrequency || 'hourly',
        lastSyncedAt: new Date()
      });
      await device.save();
    }
    
    res.json({
      success: true,
      message: 'Device connected successfully',
      device
    });
  } catch (error: any) {
    console.error('Error connecting device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect device',
      error: error.message
    });
  }
});

// Disconnect a device
router.post('/devices/:deviceId/disconnect', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { deviceId } = req.params;
    
    const device = await DeviceConnection.findOne({ deviceId, userId });
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    device.isConnected = false;
    await device.save();
    
    res.json({
      success: true,
      message: 'Device disconnected successfully'
    });
  } catch (error: any) {
    console.error('Error disconnecting device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect device',
      error: error.message
    });
  }
});

// Sync health data from device
router.post('/sync', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { deviceId, healthData } = req.body;
    
    // Verify device belongs to user
    const device = await DeviceConnection.findOne({ deviceId, userId });
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found or not authorized'
      });
    }
    
    if (!device.isConnected) {
      return res.status(400).json({
        success: false,
        message: 'Device is not connected'
      });
    }
    
    // Save health data (can be array or single object)
    const dataArray = Array.isArray(healthData) ? healthData : [healthData];
    const savedData = [];
    
    for (const data of dataArray) {
      const healthRecord = new HealthData({
        userId,
        deviceId,
        deviceType: device.deviceType,
        deviceName: device.deviceName,
        dataSource: data.dataSource || device.deviceName,
        recordedAt: data.recordedAt || new Date(),
        ...data
      });
      
      await healthRecord.save();
      savedData.push(healthRecord);
    }
    
    // Update device last sync time
    device.lastSyncedAt = new Date();
    device.lastError = undefined;
    await device.save();
    
    res.json({
      success: true,
      message: `Synced ${savedData.length} health data records`,
      data: savedData
    });
  } catch (error: any) {
    console.error('Error syncing health data:', error);
    
    // Update device with error
    const { deviceId } = req.body;
    if (deviceId) {
      await DeviceConnection.findOneAndUpdate(
        { deviceId },
        { lastError: error.message }
      );
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to sync health data',
      error: error.message
    });
  }
});

// Get health data for a user
router.get('/data', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const {
      startDate,
      endDate,
      deviceType,
      dataType,
      limit = 100,
      page = 1
    } = req.query;
    
    const query: any = { userId };
    
    // Date range filter
    if (startDate || endDate) {
      query.recordedAt = {};
      if (startDate) query.recordedAt.$gte = new Date(startDate as string);
      if (endDate) query.recordedAt.$lte = new Date(endDate as string);
    }
    
    // Device type filter
    if (deviceType) {
      query.deviceType = deviceType;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [data, total] = await Promise.all([
      HealthData.find(query)
        .sort({ recordedAt: -1 })
        .limit(Number(limit))
        .skip(skip),
      HealthData.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error fetching health data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health data',
      error: error.message
    });
  }
});

// Get latest health metrics summary
router.get('/latest', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    // Get the most recent data point
    const latestData = await HealthData.findOne({ userId })
      .sort({ recordedAt: -1 });
    
    // Get averages for the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const dayData = await HealthData.find({
      userId,
      recordedAt: { $gte: oneDayAgo }
    });
    
    // Calculate averages
    const calculateAverage = (field: string) => {
      const values = dayData
        .map(d => (d as any)[field])
        .filter(v => v !== undefined && v !== null);
      
      if (values.length === 0) return null;
      return values.reduce((a, b) => a + b, 0) / values.length;
    };
    
    const summary = {
      latest: latestData,
      last24Hours: {
        heartRate: {
          average: calculateAverage('heartRate'),
          current: latestData?.heartRate
        },
        steps: {
          total: dayData.reduce((sum, d) => sum + (d.steps || 0), 0),
          current: latestData?.steps
        },
        temperature: {
          average: calculateAverage('bodyTemperature'),
          current: latestData?.bodyTemperature
        },
        spO2: {
          average: calculateAverage('spO2'),
          current: latestData?.spO2
        },
        stressLevel: {
          average: calculateAverage('stressLevel'),
          current: latestData?.stressLevel
        },
        sleep: {
          totalMinutes: dayData.reduce((sum, d) => sum + (d.sleepDurationMinutes || 0), 0),
          averageQuality: calculateAverage('sleepQualityScore')
        }
      }
    };
    
    res.json({
      success: true,
      summary
    });
  } catch (error: any) {
    console.error('Error fetching latest health data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest health data',
      error: error.message
    });
  }
});

// Get health trends and analytics
router.get('/analytics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { period = '7d' } = req.query;
    
    // Calculate date range
    let daysAgo = 7;
    if (period === '30d') daysAgo = 30;
    if (period === '90d') daysAgo = 90;
    
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    const data = await HealthData.find({
      userId,
      recordedAt: { $gte: startDate }
    }).sort({ recordedAt: 1 });
    
    // Group by day
    const dailyData: any = {};
    
    data.forEach(record => {
      const day = record.recordedAt.toISOString().split('T')[0];
      
      if (!dailyData[day]) {
        dailyData[day] = {
          date: day,
          heartRate: [],
          steps: [],
          temperature: [],
          stressLevel: [],
          spO2: [],
          sleepMinutes: []
        };
      }
      
      if (record.heartRate) dailyData[day].heartRate.push(record.heartRate);
      if (record.steps) dailyData[day].steps.push(record.steps);
      if (record.bodyTemperature) dailyData[day].temperature.push(record.bodyTemperature);
      if (record.stressLevel) dailyData[day].stressLevel.push(record.stressLevel);
      if (record.spO2) dailyData[day].spO2.push(record.spO2);
      if (record.sleepDurationMinutes) dailyData[day].sleepMinutes.push(record.sleepDurationMinutes);
    });
    
    // Calculate daily averages
    const analytics = Object.values(dailyData).map((day: any) => ({
      date: day.date,
      heartRate: day.heartRate.length ? day.heartRate.reduce((a: number, b: number) => a + b, 0) / day.heartRate.length : null,
      steps: day.steps.length ? Math.max(...day.steps) : null,
      temperature: day.temperature.length ? day.temperature.reduce((a: number, b: number) => a + b, 0) / day.temperature.length : null,
      stressLevel: day.stressLevel.length ? day.stressLevel.reduce((a: number, b: number) => a + b, 0) / day.stressLevel.length : null,
      spO2: day.spO2.length ? day.spO2.reduce((a: number, b: number) => a + b, 0) / day.spO2.length : null,
      sleepMinutes: day.sleepMinutes.length ? Math.max(...day.sleepMinutes) : null
    }));
    
    res.json({
      success: true,
      period,
      analytics
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

export default router;
