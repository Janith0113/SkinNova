import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthData extends Document {
  userId: mongoose.Types.ObjectId;
  deviceType: 'apple-watch' | 'samsung-watch' | 'wear-os' | 'fitbit' | 'other';
  deviceId: string;
  deviceName?: string;
  
  // Vital Signs
  heartRate?: number; // bpm
  heartRateVariability?: number; // ms
  bloodPressureSystolic?: number; // mmHg
  bloodPressureDiastolic?: number; // mmHg
  bodyTemperature?: number; // Celsius
  spO2?: number; // percentage
  respiratoryRate?: number; // breaths per minute
  
  // Activity & Fitness
  steps?: number;
  caloriesBurned?: number;
  activeMinutes?: number;
  distanceMeters?: number;
  floors?: number;
  
  // Sleep Data
  sleepDurationMinutes?: number;
  deepSleepMinutes?: number;
  lightSleepMinutes?: number;
  remSleepMinutes?: number;
  sleepQualityScore?: number; // 0-100
  
  // Stress & Mental Health
  stressLevel?: number; // 0-100
  hrvStressScore?: number;
  mentalHealthScore?: number;
  
  // Environmental
  ambientTemperature?: number;
  humidity?: number;
  uvExposure?: number;
  
  // Hydration
  waterIntakeMl?: number;
  
  // ECG Data (if available)
  ecgData?: {
    rhythm: string;
    bpm: number;
    classification: string;
    rawData?: number[];
  };
  
  // Metadata
  recordedAt: Date;
  syncedAt: Date;
  dataSource: string; // e.g., 'Apple Health', 'Samsung Health', 'Google Fit'
  notes?: string;
}

const HealthDataSchema = new Schema<IHealthData>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deviceType: {
    type: String,
    enum: ['apple-watch', 'samsung-watch', 'wear-os', 'fitbit', 'other'],
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  deviceName: String,
  
  // Vital Signs
  heartRate: Number,
  heartRateVariability: Number,
  bloodPressureSystolic: Number,
  bloodPressureDiastolic: Number,
  bodyTemperature: Number,
  spO2: Number,
  respiratoryRate: Number,
  
  // Activity & Fitness
  steps: Number,
  caloriesBurned: Number,
  activeMinutes: Number,
  distanceMeters: Number,
  floors: Number,
  
  // Sleep Data
  sleepDurationMinutes: Number,
  deepSleepMinutes: Number,
  lightSleepMinutes: Number,
  remSleepMinutes: Number,
  sleepQualityScore: Number,
  
  // Stress & Mental Health
  stressLevel: Number,
  hrvStressScore: Number,
  mentalHealthScore: Number,
  
  // Environmental
  ambientTemperature: Number,
  humidity: Number,
  uvExposure: Number,
  
  // Hydration
  waterIntakeMl: Number,
  
  // ECG Data
  ecgData: {
    rhythm: String,
    bpm: Number,
    classification: String,
    rawData: [Number]
  },
  
  // Metadata
  recordedAt: {
    type: Date,
    required: true,
    index: true
  },
  syncedAt: {
    type: Date,
    default: Date.now
  },
  dataSource: {
    type: String,
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// Compound index for efficient querying
HealthDataSchema.index({ userId: 1, recordedAt: -1 });
HealthDataSchema.index({ userId: 1, deviceType: 1 });

export default mongoose.model<IHealthData>('HealthData', HealthDataSchema);
