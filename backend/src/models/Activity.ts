import { Schema, model, Document } from 'mongoose'

export interface IActivity extends Document {
  userId: string
  userName: string
  userEmail: string
  action: 'user_registration' | 'appointment_scheduled' | 'appointment_request_received' | 'appointment_approved' | 'appointment_rejected' | 'profile_updated' | 'user_verified' | 'password_reset_requested'
  actionTitle: string
  description?: string
  metadata?: any
  createdAt: Date
  expiresAt?: Date
}

const ActivitySchema = new Schema<IActivity>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  action: { 
    type: String, 
    enum: ['user_registration', 'appointment_scheduled', 'appointment_request_received', 'appointment_approved', 'appointment_rejected', 'profile_updated', 'user_verified', 'password_reset_requested'],
    required: true 
  },
  actionTitle: { type: String, required: true },
  description: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: () => new Date() },
  expiresAt: { type: Date, default: null }
})

// TTL (Time To Live) index - MongoDB will automatically delete documents when expiresAt is reached
ActivitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true })

export default model<IActivity>('Activity', ActivitySchema)
