import mongoose, { Schema, Document } from 'mongoose'

interface ISymptomLog extends Document {
  userId: string
  symptoms: {
    skinPatches: boolean
    numbness: boolean
    weakness: boolean
    eyeIssues: boolean
    painfulNerves: boolean
    other: string
  }
  notes: string
  timestamp: Date
  createdAt: Date
}

const SymptomLogSchema = new Schema<ISymptomLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    symptoms: {
      skinPatches: { type: Boolean, default: false },
      numbness: { type: Boolean, default: false },
      weakness: { type: Boolean, default: false },
      eyeIssues: { type: Boolean, default: false },
      painfulNerves: { type: Boolean, default: false },
      other: { type: String, default: '' }
    },
    notes: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<ISymptomLog>('SymptomLog', SymptomLogSchema)
