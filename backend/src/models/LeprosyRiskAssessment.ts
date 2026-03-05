import mongoose, { Schema, Document } from 'mongoose'

interface ICriticalFactor {
  factor: string
  severity: 'high' | 'critical'
  explanation: string
  action: string
}

interface IProtectiveFactor {
  factor: string
  explanation: string
  encouragement: string
}

interface IPredictions {
  riskOfReaction: number
  riskOfDisability: number
  estimatedImprovementTimeline: string
}

interface IComponentScores {
  symptomProgressionRisk: number
  treatmentAdherenceRisk: number
  complicationRisk: number
  sensorimotorCompromiseRisk: number
  immuneResponseRisk: number
  lifeconditionsRisk: number
}

// XAI Interfaces
interface IFeatureContribution {
  name: string
  value: string | number | boolean
  importance: number
  direction: 'positive' | 'negative' | 'neutral'
  explanation: string
  category: string
}

interface IAttributionMap {
  feature: string
  contribution: number
  gradient: number
  color: string
}

interface IXAIExplanation {
  overallExplanation: string
  keyDrivers: IFeatureContribution[]
  protectiveFactors: IFeatureContribution[]
  attributionMap: IAttributionMap[]
  confidenceScore: number
  dataCompleteness: number
  riskContributionBreakdown: {
    symptomContribution: number
    adherenceContribution: number
    complicationContribution: number
    sensorimotorContribution: number
    immuneContribution: number
    lifestyleContribution: number
  }
}

interface IRiskAssessment {
  overallRiskScore: number
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
  diseaseTrajectory: 'Improving' | 'Stable' | 'Progressing' | 'Unknown'
  componentScores: IComponentScores
  criticalFactors: ICriticalFactor[]
  protectiveFactors: IProtectiveFactor[]
  predictions: IPredictions
  recommendations: string[]
  nextCheckupDueDate: Date
  xai?: IXAIExplanation
}

interface ILeprosyRiskAssessment extends Document {
  userId: string
  assessment: IRiskAssessment
  timestamp: Date
  createdAt: Date
  updatedAt: Date
}

const criticalFactorSchema = new Schema<ICriticalFactor>(
  {
    factor: String,
    severity: { type: String, enum: ['high', 'critical'] },
    explanation: String,
    action: String
  },
  { _id: false }
)

const protectiveFactorSchema = new Schema<IProtectiveFactor>(
  {
    factor: String,
    explanation: String,
    encouragement: String
  },
  { _id: false }
)

const componentScoresSchema = new Schema<IComponentScores>(
  {
    symptomProgressionRisk: Number,
    treatmentAdherenceRisk: Number,
    complicationRisk: Number,
    sensorimotorCompromiseRisk: Number,
    immuneResponseRisk: Number,
    lifeconditionsRisk: Number
  },
  { _id: false }
)

const featureContributionSchema = new Schema<IFeatureContribution>(
  {
    name: String,
    value: Schema.Types.Mixed,
    importance: Number,
    direction: { type: String, enum: ['positive', 'negative', 'neutral'] },
    explanation: String,
    category: String
  },
  { _id: false }
)

const attributionMapSchema = new Schema<IAttributionMap>(
  {
    feature: String,
    contribution: Number,
    gradient: Number,
    color: String
  },
  { _id: false }
)

const xaiExplanationSchema = new Schema<IXAIExplanation>(
  {
    overallExplanation: String,
    keyDrivers: [featureContributionSchema],
    protectiveFactors: [featureContributionSchema],
    attributionMap: [attributionMapSchema],
    confidenceScore: Number,
    dataCompleteness: Number,
    riskContributionBreakdown: {
      symptomContribution: Number,
      adherenceContribution: Number,
      complicationContribution: Number,
      sensorimotorContribution: Number,
      immuneContribution: Number,
      lifestyleContribution: Number,
      _id: false
    }
  },
  { _id: false }
)

const riskAssessmentSchema = new Schema<IRiskAssessment>(
  {
    overallRiskScore: Number,
    riskLevel: { type: String, enum: ['Low', 'Moderate', 'High', 'Critical'] },
    diseaseTrajectory: {
      type: String,
      enum: ['Improving', 'Stable', 'Progressing', 'Unknown']
    },
    componentScores: componentScoresSchema,
    criticalFactors: [criticalFactorSchema],
    protectiveFactors: [protectiveFactorSchema],
    predictions: {
      riskOfReaction: Number,
      riskOfDisability: Number,
      estimatedImprovementTimeline: String,
      _id: false
    },
    recommendations: [String],
    nextCheckupDueDate: Date,
    xai: xaiExplanationSchema
  },
  { _id: false }
)

const LeprosyRiskAssessmentSchema = new Schema<ILeprosyRiskAssessment>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    assessment: riskAssessmentSchema,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
)

// Indexes for efficient querying
LeprosyRiskAssessmentSchema.index({ userId: 1, timestamp: -1 })

export default mongoose.model<ILeprosyRiskAssessment>(
  'LeprosyRiskAssessment',
  LeprosyRiskAssessmentSchema
)
export type { IRiskAssessment, ILeprosyRiskAssessment, IXAIExplanation, IFeatureContribution, IAttributionMap }
