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
  createdAt: { type: Date, default: () => new Date() }
})

export default model<IActivity>('Activity', ActivitySchema)
