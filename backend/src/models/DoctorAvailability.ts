import { Schema, model, Document } from 'mongoose'

export interface IDoctorAvailability extends Document {
  doctorId: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string // HH:mm format (e.g., "09:00")
  endTime: string // HH:mm format (e.g., "17:00")
  location?: {
    address: string
    latitude: number
    longitude: number
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const DoctorAvailabilitySchema = new Schema<IDoctorAvailability>(
  {
    doctorId: { type: String, required: true, index: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: {
      address: { type: String },
      latitude: { type: Number },
      longitude: { type: Number }
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

// Compound index for efficient queries
DoctorAvailabilitySchema.index({ doctorId: 1, dayOfWeek: 1 })

export default model<IDoctorAvailability>('DoctorAvailability', DoctorAvailabilitySchema)
