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
    leprosyType?: 'tuberculoid' | 'borderline' | 'lepromatous' | 'multibacillary' | 'paucibacillary' | 'unknown'
    treatmentDuration?: number // in months
    treatmentStatus?: 'ongoing' | 'completed' | 'not-started'
    currentMedications?: string[]
    allergies?: string[]
    comorbidities?: string[]
  }
  leprosy: {
    affectedAreas?: string[]
    nerveInvolvement?: boolean
    eyeInvolvement?: boolean
    disabilities?: string[]
    treatmentResponse?: 'excellent' | 'good' | 'moderate' | 'poor' | 'unknown'
  }
  treatmentAdherence?: {
    medicationCompliancePercent?: number
    missedDosesLastMonth?: number
    missedAppointmentsLastMonth?: number
    treatmentInterruptions?: Array<{
      date: Date
      durationDays: number
      reason: string
    }>
    lastAdherenceAssessmentDate?: Date
  }
  clinicalAssessments?: {
    whoDisabilityGrade?: number // 0, 1, or 2
    lastNerveExaminationDate?: Date
    lastEyeExaminationDate?: Date
    lastSkinExaminationDate?: Date
    nerveThickenings?: Array<{
      location: string
      severity: 'mild' | 'moderate' | 'severe'
    }>
    eyeStatus?: 'normal' | 'mild' | 'moderate' | 'severe'
  }
  riskFactors?: {
    hivStatus?: 'positive' | 'negative' | 'unknown'
    tbCoinfection?: boolean
    diabetes?: boolean
    malnutrition?: boolean
    other?: string[]
  }
  lifestyle: {
    occupation?: string
    physicalActivity?: 'sedentary' | 'light' | 'moderate' | 'vigorous'
    dietQuality?: 'poor' | 'moderate' | 'good'
    sleepHours?: number
    smokingStatus?: 'never' | 'former' | 'current'
    stressLevel?: 'low' | 'moderate' | 'high'
    treatmentAccess?: 'good' | 'limited' | 'poor'
    hygiene_conditions?: 'poor' | 'moderate' | 'good'
  }
  goals?: string[]
  notes?: string
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
        enum: ['tuberculoid', 'borderline', 'lepromatous', 'multibacillary', 'paucibacillary', 'unknown']
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
    treatmentAdherence: {
      medicationCompliancePercent: { type: Number, min: 0, max: 100 },
      missedDosesLastMonth: { type: Number, min: 0 },
      missedAppointmentsLastMonth: { type: Number, min: 0 },
      treatmentInterruptions: [
        {
          date: Date,
          durationDays: Number,
          reason: String
        }
      ],
      lastAdherenceAssessmentDate: Date
    },
    clinicalAssessments: {
      whoDisabilityGrade: { type: Number, enum: [0, 1, 2] },
      lastNerveExaminationDate: Date,
      lastEyeExaminationDate: Date,
      lastSkinExaminationDate: Date,
      nerveThickenings: [
        {
          location: String,
          severity: { type: String, enum: ['mild', 'moderate', 'severe'] }
        }
      ],
      eyeStatus: {
        type: String,
        enum: ['normal', 'mild', 'moderate', 'severe']
      }
    },
    riskFactors: {
      hivStatus: {
        type: String,
        enum: ['positive', 'negative', 'unknown']
      },
      tbCoinfection: { type: Boolean, default: false },
      diabetes: { type: Boolean, default: false },
      malnutrition: { type: Boolean, default: false },
      other: [String]
    },
    lifestyle: {
      occupation: String,
      physicalActivity: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'vigorous']
      },
      dietQuality: {
        type: String,
        enum: ['poor', 'moderate', 'good'],
        default: 'moderate'
      },
      sleepHours: { type: Number, min: 0, max: 24, default: 7 },
      smokingStatus: {
        type: String,
        enum: ['never', 'former', 'current']
      },
      stressLevel: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate'
      },
      treatmentAccess: {
        type: String,
        enum: ['good', 'limited', 'poor'],
        default: 'good'
      },
      hygiene_conditions: {
        type: String,
        enum: ['poor', 'moderate', 'good'],
        default: 'moderate'
      }
    },
    goals: [String],
    notes: String
  },
  {
    timestamps: true
  }
)

export default mongoose.model<ILeprosyUserProfile>(
  'LeprosyUserProfile',
  LeprosyUserProfileSchema
)
