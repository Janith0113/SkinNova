import { Schema, model, Document } from 'mongoose'

export interface IReportAccess extends Document {
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  appointmentId: string
  accessGranted: boolean
  grantedAt?: Date
  revokedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ReportAccessSchema = new Schema<IReportAccess>(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    appointmentId: { type: String, required: true, index: true },
    accessGranted: { type: Boolean, default: false },
    grantedAt: { type: Date },
    revokedAt: { type: Date },
  },
  { timestamps: true }
)

// Compound index to prevent duplicate access records
ReportAccessSchema.index({ patientId: 1, doctorId: 1, appointmentId: 1 }, { unique: true })

export default model<IReportAccess>('ReportAccess', ReportAccessSchema)
