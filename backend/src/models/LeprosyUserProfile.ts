import mongoose, { Schema, Document } from 'mongoose'

interface ILeprosyUserProfile extends Document {
  userId: string
  personalInfo: {
    age?: number
    gender?: 'male' | 'female' | 'other'
    weight?: number
    height?: number
  }
  medical: {
    leprosyType?: 'tuberculoid' | 'borderline' | 'lepromatous' | 'unknown'
    treatmentDuration?: number // in months
    treatmentStatus?: 'ongoing' | 'completed' | 'not-started'
    currentMedications?: string[]
    allergies?: string[]
    comorbidities?: string[]
  }
  leprosy: {
    affectedAreas?: string[] // e.g., "left arm", "face", "feet"
    nerveInvolvement?: boolean
    eyeInvolvement?: boolean
    disabilities?: string[]
    treatmentResponse?: 'excellent' | 'good' | 'moderate' | 'poor' | 'unknown'
  }
  lifestyle: {
    occupation?: string
    physicalActivity?: 'sedentary' | 'light' | 'moderate' | 'vigorous'
    dietType?: 'vegetarian' | 'non-vegetarian' | 'vegan'
    sleepHours?: number
    smokingStatus?: 'never' | 'former' | 'current'
  }
  goals?: string[] // Treatment goals
  notes?: string // Additional patient notes
  createdAt: Date
  updatedAt: Date
}

const LeprosyUserProfileSchema = new Schema<ILeprosyUserProfile>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    personalInfo: {
      age: { type: Number, min: 0, max: 150 },
      gender: { type: String, enum: ['male', 'female', 'other'] },
      weight: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    },
    medical: {
      leprosyType: {
        type: String,
        enum: ['tuberculoid', 'borderline', 'lepromatous', 'unknown']
      },
      treatmentDuration: { type: Number, min: 0 },
      treatmentStatus: {
        type: String,
        enum: ['ongoing', 'completed', 'not-started']
      },
      currentMedications: [String],
      allergies: [String],
      comorbidities: [String]
    },
    leprosy: {
      affectedAreas: [String],
      nerveInvolvement: { type: Boolean, default: false },
      eyeInvolvement: { type: Boolean, default: false },
      disabilities: [String],
      treatmentResponse: {
        type: String,
        enum: ['excellent', 'good', 'moderate', 'poor', 'unknown']
      }
    },
    lifestyle: {
      occupation: String,
      physicalActivity: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'vigorous']
      },
      dietType: {
        type: String,
        enum: ['vegetarian', 'non-vegetarian', 'vegan']
      },
      sleepHours: { type: Number, min: 0, max: 24 },
      smokingStatus: {
        type: String,
        enum: ['never', 'former', 'current']
      }
    },
    goals: [String],
    notes: String
  },
  {
    timestamps: true
  }
)

export default mongoose.model<ILeprosyUserProfile>('LeprosyUserProfile', LeprosyUserProfileSchema)
