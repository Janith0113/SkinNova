# Leprosy Risk Analysis - Data Models & API Specification

## 1. DATABASE MODELS

### 1.1 Enhanced SymptomLog Model

**File:** `backend/src/models/SymptomLog.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose'

interface ISymptomLog extends Document {
  userId: string
  // Basic symptoms
  symptoms: {
    skinPatches: boolean
    numbness: boolean
    weakness: boolean
    eyeIssues: boolean
    painfulNerves: boolean
    other: string
  }
  // NEW: Severity tracking per symptom
  symptomSeverity?: {
    skinPatches?: {
      severity: 'mild' | 'moderate' | 'severe'
      affectedAreasCount: number
      affectedAreas: string[] // e.g., ['left arm', 'right leg']
      spreadingRate: 'stable' | 'slow' | 'rapid'
      estimatedAreaCm2?: number
    }
    numbness?: {
      severity: 'mild' | 'moderate' | 'severe'
      affectedLimbs: string[]
      functionalImpact: 'minimal' | 'moderate' | 'severe'
      spreadingRate: 'stable' | 'slow' | 'rapid'
    }
    weakness?: {
      severity: 'mild' | 'moderate' | 'severe'
      affectedMuscleGroups: string[]
      dailyActivityImpact: number // 0-100
      worstTask: string // e.g., "gripping objects"
    }
    eyeIssues?: {
      severity: 'mild' | 'moderate' | 'severe'
      symptomType: string // e.g., "dryness", "vision blurring", "pain"
      affectsWhichEye: 'left' | 'right' | 'both'
    }
    painfulNerves?: {
      severity: 'mild' | 'moderate' | 'severe'
      painIntensity: number // 0-10 scale
      affectedNerves: string[] // e.g., ['ulnar', 'peroneal']
      painType: string // e.g., "burning", "sharp", "throbbing"
    }
  }
  
  // NEW: Comparison with previous log
  changes?: {
    comparedToDate?: Date // Date of previous log
    sinceLastLog: 'improved' | 'stable' | 'worsened'
    daysSinceLastLog: number
    newSymptomsAdded: string[]
    symptomsResolved: string[]
    changesDescription: string // Free text explanation
  }
  
  notes: string
  timestamp: Date
  createdAt: Date
  updatedAt: Date
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
      skinPatches: {
        severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
        affectedAreasCount: Number,
        affectedAreas: [String],
        spreadingRate: { type: String, enum: ['stable', 'slow', 'rapid'] },
        estimatedAreaCm2: Number
      },
      numbness: {
        severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
        affectedLimbs: [String],
        functionalImpact: { type: String, enum: ['minimal', 'moderate', 'severe'] },
        spreadingRate: { type: String, enum: ['stable', 'slow', 'rapid'] }
      },
      weakness: {
        severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
        affectedMuscleGroups: [String],
        dailyActivityImpact: { type: Number, min: 0, max: 100 },
        worstTask: String
      },
      eyeIssues: {
        severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
        symptomType: String,
        affectsWhichEye: { type: String, enum: ['left', 'right', 'both'] }
      },
      painfulNerves: {
        severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
        painIntensity: { type: Number, min: 0, max: 10 },
        affectedNerves: [String],
        painType: String
      }
    },
    changes: {
      comparedToDate: Date,
      sinceLastLog: { 
        type: String, 
        enum: ['improved', 'stable', 'worsened']
      },
      daysSinceLastLog: Number,
      newSymptomsAdded: [String],
      symptomsResolved: [String],
      changesDescription: String
    },
    notes: {
      type: String,
      default: ''
    },
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

// Index for efficient querying
SymptomLogSchema.index({ userId: 1, timestamp: -1 })

export default mongoose.model<ISymptomLog>('SymptomLog', SymptomLogSchema)
```

### 1.2 Enhanced LeprosyUserProfile Model

**File:** `backend/src/models/LeprosyUserProfile.ts`

```typescript
// Add these fields to existing model:

interface ILeprosyUserProfile extends Document {
  // ... existing fields ...
  
  // NEW: Treatment adherence tracking
  treatmentAdherence?: {
    medicationCompliancePercent: number // 0-100
    lastDoseDate?: Date
    missedDosesLastMonth: number
    missedAppointmentsLastMonth: number
    treatmentInterruptions: {
      duration: number // days
      reason?: string
      date: Date
    }[]
    improvementNotesFromDoctor?: string
  }
  
  // NEW: Clinical assessments
  clinicalAssessments?: {
    whoDisabilityGrade: 0 | 1 | 2 // WHO grading
    lastNerveExamDate?: Date
    nerveInventory: {
      nerve: string // e.g., "Ulnar", "Peroneal"
      status: 'normal' | 'thickened' | 'tender' | 'impaired'
      functionLoss: 'mild' | 'moderate' | 'severe' | 'none'
    }[]
    lastEyeExamDate?: Date
    eyeStatus?: {
      lagophthalmusPresent: boolean
      visionThreat: boolean
      otherIssues?: string
    }
    skinLesionCount: number
    lesionDistribution: string[] // body areas
    activeLesionCount: number // non-healed
  }
  
  // NEW: Comorbidities & risk factors
  riskFactors?: {
    hivStatus: 'negative' | 'positive' | 'unknown'
    tbCoinfection: boolean
    diabetes: boolean
    hypertension: boolean
    malnutrition: boolean
    otherComorbidities: string[]
  }
  
  // NEW: Lifestyle detailed tracking
  lifestyle: {
    occupation?: string
    physicalActivity?: 'sedentary' | 'light' | 'moderate' | 'vigorous'
    dietType?: 'vegetarian' | 'non-vegetarian' | 'vegan'
    dietQuality?: 'poor' | 'moderate' | 'good'
    proteinIntake?: 'inadequate' | 'adequate' | 'excellent'
    sleepHours?: number
    sleepQuality?: 'poor' | 'fair' | 'good'
    smokingStatus?: 'never' | 'former' | 'current'
    stressLevel?: 'low' | 'moderate' | 'high'
    depressionScreening?: number // PHQ-9 score
    treatmentAccess?: 'good' | 'limited' | 'poor'
    hygiene_conditions?: 'good' | 'moderate' | 'poor'
    climate?: string
    exposureToMoisture?: 'low' | 'moderate' | 'high'
  }
}

// Updated schema additions:
const LeprosyUserProfileSchema = new Schema<ILeprosyUserProfile>(
  {
    // ... existing fields ...
    
    treatmentAdherence: {
      medicationCompliancePercent: { type: Number, min: 0, max: 100 },
      lastDoseDate: Date,
      missedDosesLastMonth: { type: Number, default: 0 },
      missedAppointmentsLastMonth: { type: Number, default: 0 },
      treatmentInterruptions: [
        {
          duration: Number,
          reason: String,
          date: Date
        }
      ],
      improvementNotesFromDoctor: String
    },
    
    clinicalAssessments: {
      whoDisabilityGrade: { 
        type: Number, 
        enum: [0, 1, 2]
      },
      lastNerveExamDate: Date,
      nerveInventory: [
        {
          nerve: String,
          status: { type: String, enum: ['normal', 'thickened', 'tender', 'impaired'] },
          functionLoss: { type: String, enum: ['mild', 'moderate', 'severe', 'none'] }
        }
      ],
      lastEyeExamDate: Date,
      eyeStatus: {
        lagophthalmusPresent: Boolean,
        visionThreat: Boolean,
        otherIssues: String
      },
      skinLesionCount: Number,
      lesionDistribution: [String],
      activeLesionCount: Number
    },
    
    riskFactors: {
      hivStatus: { type: String, enum: ['negative', 'positive', 'unknown'] },
      tbCoinfection: Boolean,
      diabetes: Boolean,
      hypertension: Boolean,
      malnutrition: Boolean,
      otherComorbidities: [String]
    },
    
    lifestyle: {
      // ... existing + new fields ...
      dietQuality: { type: String, enum: ['poor', 'moderate', 'good'] },
      proteinIntake: { type: String, enum: ['inadequate', 'adequate', 'excellent'] },
      sleepQuality: { type: String, enum: ['poor', 'fair', 'good'] },
      stressLevel: { type: String, enum: ['low', 'moderate', 'high'] },
      depressionScreening: Number,
      treatmentAccess: { type: String, enum: ['good', 'limited', 'poor'] },
      hygiene_conditions: { type: String, enum: ['good', 'moderate', 'poor'] },
      climate: String,
      exposureToMoisture: { type: String, enum: ['low', 'moderate', 'high'] }
    }
  },
  { timestamps: true }
)
```

### 1.3 NEW: LeprosyRiskAssessment Model

**File:** `backend/src/models/LeprosyRiskAssessment.ts`

```typescript
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
  riskOfReaction: number // percentage 0-100
  riskOfDisability: number // percentage 0-100
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
      estimatedImprovementTimeline: String
    },
    recommendations: [String],
    nextCheckupDueDate: Date
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

// Indexes for querying
LeprosyRiskAssessmentSchema.index({ userId: 1, timestamp: -1 })

export default mongoose.model<ILeprosyRiskAssessment>(
  'LeprosyRiskAssessment',
  LeprosyRiskAssessmentSchema
)
```

---

## 2. API ENDPOINTS SPECIFICATION

### Base URL: `http://localhost:4000/api/leprosy`

### 2.1 Calculate Risk Assessment

**POST** `/risk-assessment`

Calculate a fresh risk assessment based on current patient data.

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "forceRecalculate": false  // Optional: skip cache, always recalculate
}
```

**Response (200):**
```json
{
  "success": true,
  "riskScore": {
    "overallRiskScore": 62,
    "riskLevel": "High",
    "diseaseTrajectory": "Progressing",
    "timestamp": "2026-03-03T10:30:00Z",
    "componentScores": {
      "symptomProgressionRisk": 78,
      "treatmentAdherenceRisk": 45,
      "complicationRisk": 65,
      "sensorimotorCompromiseRisk": 72,
      "immuneResponseRisk": 55,
      "lifeconditionsRisk": 48
    },
    "criticalFactors": [
      {
        "factor": "Nerve involvement in 3 areas",
        "severity": "critical",
        "explanation": "Facial, ulnar, and peroneal nerves showing involvement",
        "action": "Schedule nerve conduction test"
      }
    ],
    "protectiveFactors": [
      {
        "factor": "Good family support",
        "explanation": "Family actively involved in treatment",
        "encouragement": "This is a major asset"
      }
    ],
    "predictions": {
      "riskOfReaction": 22,
      "riskOfDisability": 18,
      "estimatedImprovementTimeline": "6-8 weeks if adherence improves"
    },
    "recommendations": [
      "Schedule nerve examination",
      "Implement medication reminder system"
    ],
    "nextCheckupDueDate": "2026-03-10"
  }
}
```

**Error Response (500):**
```json
{
  "error": "Failed to calculate risk assessment",
  "reason": "Insufficient profile data"
}
```

---

### 2.2 Get Latest Risk Assessment

**GET** `/risk-assessment/latest`

Get the most recent risk assessment without recalculating.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "assessment": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user123",
    "assessment": { /* Full assessment object */ },
    "timestamp": "2026-03-03T10:30:00Z",
    "createdAt": "2026-03-03T10:30:00Z",
    "updatedAt": "2026-03-03T10:30:00Z"
  }
}
```

**No Assessment Response (200):**
```json
{
  "success": true,
  "assessment": null,
  "message": "No risk assessment yet. Create one with POST /risk-assessment"
}
```

---

### 2.3 Get Risk Assessment History

**GET** `/risk-assessment/history?limit=12`

Get recent risk assessments for trend analysis.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 12 | Number of assessments to return |
| skip | number | 0 | Pagination offset |

**Response (200):**
```json
{
  "success": true,
  "assessments": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "user123",
      "assessment": { /* Full assessment */ },
      "timestamp": "2026-03-03T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "user123",
      "assessment": { /* Full assessment */ },
      "timestamp": "2026-02-24T09:15:00Z"
    }
  ],
  "count": 2,
  "total": 8
}
```

---

### 2.4 Get Risk Trends

**GET** `/risk-assessment/trends?days=90`

Get simplified trend data for charting.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| days | number | 90 | Days of history to return |

**Response (200):**
```json
{
  "success": true,
  "trends": [
    {
      "date": "2026-02-01T10:30:00Z",
      "overallScore": 45,
      "riskLevel": "Moderate",
      "trajectory": "Stable"
    },
    {
      "date": "2026-02-15T09:15:00Z",
      "overallScore": 55,
      "riskLevel": "High",
      "trajectory": "Progressing"
    },
    {
      "date": "2026-03-03T10:30:00Z",
      "overallScore": 62,
      "riskLevel": "High",
      "trajectory": "Progressing"
    }
  ]
}
```

---

### 2.5 Get Risk Assessment Comparison

**GET** `/risk-assessment/comparison?assessmentId1={id1}&assessmentId2={id2}`

Compare two specific assessments to see what changed.

**Response (200):**
```json
{
  "success": true,
  "comparison": {
    "assessment1": { /* Full assessment */ },
    "assessment2": { /* Full assessment */ },
    "changes": {
      "overallScoreDelta": +17,
      "riskLevelChanged": {
        "from": "Moderate",
        "to": "High"
      },
      "trajectoryChanged": {
        "from": "Stable",
        "to": "Progressing"
      },
      "componentChanges": {
        "symptomProgressionRisk": { "from": 61, "to": 78, "delta": +17 },
        "treatmentAdherenceRisk": { "from": 52, "to": 45, "delta": -7 }
      },
      "newCriticalFactors": [
        { "factor": "Nerve involvement spread", ... }
      ],
      "resolvedFactors": [
        { "factor": "Poor diet quality", ... }
      ]
    },
    "daysBetween": 17
  }
}
```

---

### 2.6 Get Risk Summary for Doctor

**GET** `/risk-assessment/doctor-summary`

Get a formatted summary for doctor appointments/referrals.

**Response (200):**
```json
{
  "success": true,
  "summary": {
    "patientId": "user123",
    "patientName": "John Doe",
    "age": 35,
    "leprosyType": "Borderline tuberculoid",
    "treatmentDuration": "8 weeks",
    
    "currentRisk": {
      "score": 62,
      "level": "High",
      "trajectory": "Progressing"
    },
    
    "keyFindings": [
      "Nerve involvement spreading to 3 areas",
      "Treatment adherence declining (65%)",
      "New eye symptoms reported"
    ],
    
    "recommendations": [
      "Schedule urgent nerve exam",
      "Review medication barriers",
      "Ophthalmology referral needed"
    ],
    
    "urgencyLevel": "High",
    "suggestedFollowup": "Within 1 week",
    "lastAssessment": "2026-03-03",
    "nextCheckup": "2026-03-10"
  }
}
```

---

### 2.7 Webhook for Auto-Assessment

**POST** `/risk-assessment/auto-trigger`

Backend can trigger auto-assessment when:
- New symptom log added
- Profile updated
- Monthly check-in reminder

**Request Body:**
```json
{
  "userId": "user123",
  "trigger": "symptom_log_added",
  "triggerData": {
    "symptomLogId": "log_12345",
    "timestamp": "2026-03-03T10:30:00Z"
  }
}
```

---

## 3. RESPONSE CODES & ERROR HANDLING

| Code | Scenario | Response |
|------|----------|----------|
| 200 | Success | Normal JSON response |
| 400 | Bad request | `{ "error": "Missing required fields" }` |
| 401 | Unauthorized | `{ "error": "Token required" }` |
| 404 | Not found | `{ "error": "Assessment not found" }` |
| 500 | Server error | `{ "error": "Failed to calculate...", "reason": "..." }` |

---

## 4. AUTHENTICATION

All endpoints (except knowledge base endpoints) require:
- Header: `Authorization: Bearer {JWT_TOKEN}`
- Token obtained from `/api/auth/login`

---

## 5. PAGINATION

For list endpoints:
```typescript
GET /risk-assessment/history?limit=20&skip=40

Response includes:
{
  "data": [...],
  "count": 20,
  "total": 150,
  "pages": 8,
  "currentPage": 3
}
```

---

## 6. RATE LIMITING

- Calculation endpoints: 1 request per 60 seconds per user
- Read endpoints: 10 requests per 60 seconds per user
- History endpoints: 5 requests per 60 seconds per user

---

## 7. CACHING STRATEGY

- Latest assessment: Cache for 1 hour
- Risk trends: Cache for 6 hours
- Component scores: Recalculate on each profile/symptom change
- Comparison data: No cache (always fresh)

