import { Schema, model, Document } from 'mongoose'

export interface IReport extends Document {
  patientId: string
  patientName: string
  patientEmail: string
  reportName: string
  reportType: string // e.g., "Skin Analysis", "Lab Test", "Follow-up"
  fileUrl?: string
  fileName?: string
  description?: string
  uploadedAt: Date
  updatedAt: Date
}

const ReportSchema = new Schema<IReport>(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    reportName: { type: String, required: true },
    reportType: { type: String, default: 'General Report' },
    fileUrl: { type: String },
    fileName: { type: String },
    description: { type: String },
    uploadedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
)

export default model<IReport>('Report', ReportSchema)
