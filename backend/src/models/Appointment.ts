import { Schema, model, Document } from 'mongoose'

export interface IAppointment extends Document {
  patientId: string
  patientName: string
  patientEmail: string
  doctorId: string
  doctorName: string
  doctorEmail: string
  requestedDate: Date
  approvedDate?: Date
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  notes?: string
  availabilitySlotId?: string
  location?: {
    address: string
    latitude: number
    longitude: number
  }
  createdAt: Date
  updatedAt: Date
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorEmail: { type: String, required: true },
    requestedDate: { type: Date, required: true },
    approvedDate: { type: Date },
    reason: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending'
    },
    notes: { type: String },
    availabilitySlotId: { type: String },
    location: {
      address: { type: String },
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  { timestamps: true }
)

export default model<IAppointment>('Appointment', AppointmentSchema)
