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
  symptomSeverity: {
    skinPatches?: 'mild' | 'moderate' | 'severe'
    numbness?: 'mild' | 'moderate' | 'severe'
    weakness?: 'mild' | 'moderate' | 'severe'
    eyeIssues?: 'mild' | 'moderate' | 'severe'
    painfulNerves?: 'mild' | 'moderate' | 'severe'
  }
  affectedAreas: string[]
  spreadingRate: 'static' | 'slow' | 'rapid'
  notes: string
  previousLogComparison?: {
    newSymptoms: string[]
    resolvedSymptoms: string[]
    worsened: string[]
    improved: string[]
  }
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
    symptomSeverity: {
      skinPatches: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' },
      numbness: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' },
      weakness: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' },
      eyeIssues: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' },
      painfulNerves: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' }
    },
    affectedAreas: {
      type: [String],
      default: []
    },
    spreadingRate: {
      type: String,
      enum: ['static', 'slow', 'rapid'],
      default: 'static'
    },
    notes: {
      type: String,
      default: ''
    },
    previousLogComparison: {
      newSymptoms: [String],
      resolvedSymptoms: [String],
      worsened: [String],
      improved: [String]
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

// Index for efficient queries
SymptomLogSchema.index({ userId: 1, timestamp: -1 })
export default mongoose.model<ISymptomLog>('SymptomLog', SymptomLogSchema)