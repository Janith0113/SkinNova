import mongoose, { Document, Schema } from 'mongoose';

export interface IDeviceConnection extends Document {
  userId: mongoose.Types.ObjectId;
  deviceType: 'apple-watch' | 'samsung-watch' | 'wear-os' | 'fitbit' | 'smartphone' | 'other';
  deviceId: string;
  deviceName: string;
  deviceModel?: string;
  osVersion?: string;
  
  // Connection Status
  isConnected: boolean;
  lastSyncedAt?: Date;
  connectionToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  
  // Permissions
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
  
  // Sync Settings
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  autoSync: boolean;
  lastError?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const DeviceConnectionSchema = new Schema<IDeviceConnection>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deviceType: {
    type: String,
    enum: ['apple-watch', 'samsung-watch', 'wear-os', 'fitbit', 'smartphone', 'other'],
    required: true
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  deviceName: {
    type: String,
    required: true
  },
  deviceModel: String,
  osVersion: String,
  
  isConnected: {
    type: Boolean,
    default: false
  },
  lastSyncedAt: Date,
  connectionToken: String,
  refreshToken: String,
  tokenExpiresAt: Date,
  
  permissions: {
    heartRate: { type: Boolean, default: false },
    steps: { type: Boolean, default: false },
    sleep: { type: Boolean, default: false },
    temperature: { type: Boolean, default: false },
    stress: { type: Boolean, default: false },
    ecg: { type: Boolean, default: false },
    bloodPressure: { type: Boolean, default: false },
    spO2: { type: Boolean, default: false },
    activity: { type: Boolean, default: false },
    hydration: { type: Boolean, default: false }
  },
  
  syncFrequency: {
    type: String,
    enum: ['realtime', 'hourly', 'daily', 'manual'],
    default: 'hourly'
  },
  autoSync: {
    type: Boolean,
    default: true
  },
  lastError: String
}, {
  timestamps: true
});

// Compound index for user's devices
DeviceConnectionSchema.index({ userId: 1, isConnected: 1 });

export default mongoose.model<IDeviceConnection>('DeviceConnection', DeviceConnectionSchema);
