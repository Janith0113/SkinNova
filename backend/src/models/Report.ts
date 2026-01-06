import { Schema, model, Document } from 'mongoose'

export interface IReport extends Document {
  patientId: string
  patientName: string
  patientEmail: string
  reportName: string
  reportType: string // e.g., "Skin Analysis", "Lab Test", "Follow-up", "Psoriasis Scan", "Tinea Scan", etc.
  fileUrl?: string
  fileName?: string
  description?: string
  // Scan/Detection specific fields
  diseaseType?: string // 'psoriasis', 'tinea', 'leprosy', 'skinCancer'
  skinCondition?: string // Result from ML model
  confidence?: number // Confidence score (0-1)
  scanArea?: string // Body area scanned (e.g., "Elbows", "Knees")
  scanStatus?: 'Stable' | 'Improving' | 'Monitor' | 'Needs review' | 'Healed' | 'Under treatment'
  imagePath?: string // Path to the scanned image
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
    // Scan/Detection fields
    diseaseType: { type: String, enum: ['psoriasis', 'tinea', 'leprosy', 'skinCancer'], default: undefined },
    skinCondition: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    scanArea: { type: String },
    scanStatus: { type: String, enum: ['Stable', 'Improving', 'Monitor', 'Needs review', 'Healed', 'Under treatment'], default: undefined },
    imagePath: { type: String },
    uploadedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
)

export default model<IReport>('Report', ReportSchema)
