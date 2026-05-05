import mongoose, { Schema, Document } from 'mongoose'

interface IMedicationNotification extends Document {
  userId: string
  notificationsEnabled: boolean
  medicationTimes: string[] // e.g., ['08:00 AM', '06:00 PM']
  notifications: Array<{
    id: string
    day: string
    time: string
    medicationName: string
    dosage?: string
    isCompleted?: boolean
    completedAt?: Date
    missedAt?: Date
    notificationSent?: boolean
    notificationSentAt?: Date
  }>
  notificationMethod: 'push' | 'browser' | 'email' | 'sms' | 'none'
  notificationFrequency: 'on-time' | '15-min-before' | '30-min-before' | '1-hour-before'
  allowSound: boolean
  allowVibration: boolean
  deviceTokens?: string[] // For push notifications
  createdAt: Date
  updatedAt: Date
}

const MedicationNotificationSchema = new Schema<IMedicationNotification>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    notificationsEnabled: {
      type: Boolean,
      default: false
    },
    medicationTimes: [
      {
        type: String
      }
    ],
    notifications: [
      {
        id: String,
        day: String,
        time: String,
        medicationName: String,
        dosage: String,
        isCompleted: {
          type: Boolean,
          default: false
        },
        completedAt: Date,
        missedAt: Date,
        notificationSent: {
          type: Boolean,
          default: false
        },
        notificationSentAt: Date
      }
    ],
    notificationMethod: {
      type: String,
      enum: ['push', 'browser', 'email', 'sms', 'none'],
      default: 'browser'
    },
    notificationFrequency: {
      type: String,
      enum: ['on-time', '15-min-before', '30-min-before', '1-hour-before'],
      default: '15-min-before'
    },
    allowSound: {
      type: Boolean,
      default: true
    },
    allowVibration: {
      type: Boolean,
      default: true
    },
    deviceTokens: [String]
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IMedicationNotification>(
  'MedicationNotification',
  MedicationNotificationSchema
)
