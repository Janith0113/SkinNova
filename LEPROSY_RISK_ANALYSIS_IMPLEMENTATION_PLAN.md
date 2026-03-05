# Leprosy Risk Analysis Implementation Plan

## Overview
Add a comprehensive Risk Analysis section to the Leprosy Care Assistant that predicts disease progression, critical risk factors, and treatment efficacy based on patient data, symptom logs, and lifestyle factors.

---

## 1. DATA COLLECTION STRATEGY

### 1.1 Temporal Symptom Tracking
**What to gather:**
- **Symptom progression history** (longitudinal data over weeks/months)
  - `skinPatchesProgression`: Initial → Current severity trend
  - `numbnessPropagation`: Affected areas expanding or stable
  - `weaknessIntensity`: Muscle weakness progression
  - `eyeInvolvementStatus`: Ocular involvement timeline

- **Symptom frequency metrics**
  - Symptom onset date (vs treatment start date)
  - Days since first symptom
  - Days between symptom escalations
  - Regression vs progression pattern

**Data Model Enhancement:**
```typescript
interface EnhancedSymptomLog {
  // Existing fields...
  symptoms: {
    skinPatches: boolean;
    numbness: boolean;
    weakness: boolean;
    eyeIssues: boolean;
    painfulNerves: boolean;
    other: string;
  };
  
  // NEW: Severity and progression tracking
  symptomSeverity: {
    skinPatches?: {
      severity: 'mild' | 'moderate' | 'severe';  // Based on area affected %
      affectedAreasCount: number;
      spreadingRate: 'stable' | 'slow' | 'rapid';
    };
    numbness?: {
      severity: 'mild' | 'moderate' | 'severe';
      affectedLimbs: string[];
      functionalImpact: 'minimal' | 'moderate' | 'severe';
    };
    weakness?: {
      severity: 'mild' | 'moderate' | 'severe';
      affectedMuscleGroups: string[];
      dailyActivityImpact: number; // 0-100 scale
    };
  };
  
  // NEW: Change comparison with previous log
  changes: {
    sinceLastLog: 'improved' | 'stable' | 'worsened';
    daysSinceLastLog: number;
    newSymptomsAdded: string[];
    symptomsResolved: string[];
  };
  
  timestamp: Date;
}
```

### 1.2 Treatment Adherence & Response Factors
**What to gather:**
```typescript
interface TreatmentAdherence {
  // Medication compliance
  medicationsTakenOnSchedule: number; // % (0-100)
  missedDoses: number; // in last 30 days
  treatmentInterruptions: {
    duration: number; // days
    reason?: string;
  }[];
  
  // Treatment response indicators
  improvementTimeline: {
    weeksUntilSkinPatchImprovement?: number;
    weeksUntilNervePainRelief?: number;
    weeksUntilWeaknessImprovement?: number;
  };
  
  // Medical check-ups
  lastNerveClincialExam?: Date;
  lastEyeExamination?: Date;
  improvementNotes?: string;
}
```

### 1.3 Clinical Profile Risk Factors
**What to gather:**
```typescript
interface LeprosyRiskFactors {
  // Disease classification factors (from profile)
  leprosyType: 'tuberculoid' | 'borderline' | 'lepromatous'; // High-risk if lepromatous
  lesionCount: number; // More lesions = higher risk
  affectedAreasCount: number; // Multiple areas = higher risk
  
  // Complication risks
  nerveInvolvement: boolean; // Critical risk factor
  eyeInvolvement: boolean; // Critical risk factor
  existingDisabilities: string[]; // Pre-treatment disabilities
  
  // Immune status indicators
  hiv_status?: 'negative' | 'positive' | 'unknown';
  tuberculosis_coinfection?: boolean;
  diabetes?: boolean;
  malnutrition_indicators?: boolean;
  
  // Age-related risk
  age: number; // Pediatric cases more severe
  genderConsiderations: 'male' | 'female' | 'other'; // Females often have better prognosis
  
  // Socioeconomic factors
  treatmentAccess: 'good' | 'limited' | 'poor';
  hygiene_conditions: 'good' | 'moderate' | 'poor';
  nutrition_status: 'adequate' | 'borderline' | 'inadequate';
}
```

### 1.4 Lifestyle & Environmental Factors
**What to gather:**
```typescript
interface LifestyleRiskFactors {
  // Physical activity (impacts nerve stress & healing)
  physicalActivity: 'sedentary' | 'light' | 'moderate' | 'vigorous';
  stressfulActivity?: string[]; // Jobs/activities that stress affected areas
  
  // Nutrition (impacts immune response)
  dietQuality: 'poor' | 'moderate' | 'good';
  proteinIntake: 'inadequate' | 'adequate' | 'excellent';
  vitaminD_exposure?: 'low' | 'moderate' | 'high';
  
  // Sleep & immunity
  sleepHours: number;
  sleepQuality: 'poor' | 'fair' | 'good';
  
  // Stress & mental health
  stressLevel: 'low' | 'moderate' | 'high';
  depressionScreening?: number; // PHQ-9 score or similar
  
  // Environmental exposure
  climate: string; // Damp/humid increases risk
  exposureToMoisture: 'low' | 'moderate' | 'high';
}
```

### 1.5 Dermatological Scan History
**What to gather:**
```typescript
interface ScanAnalysisForRisk {
  scanId: string;
  date: Date;
  
  // Image analysis results
  lesionCount: number;
  lesionSize: { min: number; max: number; unit: 'cm' };
  lesionBoundary: 'sharp' | 'blurred';
  pigmentationPattern: 'hypopigmented' | 'normopigmented' | 'hyperpigmented';
  skinTextureChange: 'smooth' | 'rough' | 'scaly';
  
  // Inflammation markers
  activeInflammation: boolean;
  inflammationSeverity?: 'mild' | 'moderate' | 'severe';
  
  // Trend across scans
  comparisonToPrevious?: {
    lesionArea: 'increased' | 'stable' | 'decreased';
    inflammationTrend: 'worsening' | 'stable' | 'improving';
    confidenceScore: number; // 0-1
  };
}
```

---

## 2. RISK ANALYSIS ALGORITHM

### 2.1 Risk Scoring Framework

```typescript
interface LeprosyRiskScore {
  overallRiskScore: number; // 0-100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  diseaseTrajectory: 'Improving' | 'Stable' | 'Progressing' | 'Unknown';
  
  // Component scores (each 0-100)
  componentScores: {
    symptomProgressionRisk: number;
    treatmentAdherenceRisk: number;
    complicationRisk: number;
    sensorimotorCompromiseRisk: number;
    immuneResponseRisk: number;
    lifeconditionsRisk: number;
  };
  
  // Critical alerts
  criticalFactors: CriticalFactor[];
  protectiveFactors: ProtectiveFactor[];
  
  // Predictions
  predictions: {
    riskOfReaction: number; // % probability of Type 1/2 reaction
    riskOfDisability: number; // % probability of new disability
    estimatedImprovementTimeline: string; // e.g., "4-6 weeks"
  };
  
  recommendations: string[];
  nextCheckupDueDate: Date;
}

interface CriticalFactor {
  factor: string;
  severity: 'high' | 'critical';
  explanation: string;
  action: string;
}

interface ProtectiveFactor {
  factor: string;
  explanation: string;
  encouragement: string;
}
```

### 2.2 Risk Calculation Logic

**Symptom Progression Risk (0-100):**
- Days since treatment start vs symptom improvement window
  - No improvement after 4 weeks of MDT = High risk
  - Rapid progression despite treatment = Critical
- Threshold crossing analysis:
  - New nerve involvement = +30 points
  - New eye involvement = +25 points
  - Multiple area spread = +20 points
- Symptom acceleration:
  - Symptoms improving = -15 points
  - Symptoms stable = 0 points
  - Symptoms worsening = +25 points

**Treatment Adherence Risk (0-100):**
- Medication compliance tracking:
  - >90% adherence = 10 points
  - 70-90% adherence = 30 points
  - <70% adherence = 60 points
  - Treatment interruption = +50 points
- Follow-up compliance:
  - Missed appointments = +15 points per appointment

**Complication Risk (0-100):**
- Nerve involvement severity:
  - Single nerve affected = Base 25
  - Multiple nerves = Base 50
  - Severe pain/functional loss = +25
- Eye involvement:
  - Vision threatened = +40
  - Lagophthalmos = +30
- Pre-existing disabilities:
  - 1-2 disabilities = +15
  - 3+ disabilities = +35

**Sensorimotor Compromise Risk (0-100):**
- Functional status assessment:
  - WHO Grade 0 (no disability) = 10
  - WHO Grade 1 (signs of disability) = 40
  - WHO Grade 2 (visible disability) = 80
- Symptom severity tracking:
  - Pain intensity score (numeric)
  - Numbness distribution map
  - Weakness progression rate

**Immune Response Risk (0-100):**
- Baseline factors:
  - Lepromatous type = +40
  - Borderline = +20
  - Tuberculoid = +5
- Comorbidities:
  - HIV positive = +50
  - TB coinfection = +30
  - Diabetes = +15
  - Malnutrition = +20
- Age factors:
  - <15 years old = +10
  - >60 years old = +10

**Life Conditions Risk (0-100):**
- Nutrition: Poor diet = +20, Borderline = +10, Good = 0
- Sleep: <6 hours = +15, 6-8 hours = 0, >8 hours = +5
- Stress: High = +25, Moderate = +10, Low = 0
- Treatment access: Poor = +30, Limited = +15, Good = 0
- Hygiene: Poor = +30, Moderate = +15, Good = 0

### 2.3 Disease Trajectory Analysis

Compare metrics across timepoints:

```typescript
function analyzeDiseaseTrajectory(
  currentSymptoms: SymptomLog,
  previousSymptoms: SymptomLog[],
  riskScores: RiskScore[]
): 'Improving' | 'Stable' | 'Progressing' | 'Unknown' {
  
  if (previousSymptoms.length === 0) return 'Unknown';
  
  // Calculate 30-day trend
  const last30Days = previousSymptoms.filter(
    s => daysSince(s.timestamp) <= 30
  );
  
  if (last30Days.length < 2) return 'Unknown';
  
  // Trend analysis
  const improvingSymptoms = calculateSymptomImprovement(last30Days);
  const worseningSymptoms = calculateSymptomWorsening(last30Days);
  
  const riskScoreTrend = analyzeRiskScores(riskScores);
  
  if (improvingSymptoms > 50) return 'Improving';
  if (worseningSymptoms > 50) return 'Progressing';
  if (riskScoreTrend === 'increasing') return 'Progressing';
  
  return 'Stable';
}
```

---

## 3. BACKEND IMPLEMENTATION

### 3.1 New Service: `leprosyRiskAnalysisService.ts`

```typescript
import SymptomLog from '../models/SymptomLog';
import LeprosyUserProfile from '../models/LeprosyUserProfile';
import LeprosyRiskAssessment from '../models/LeprosyRiskAssessment';

class LeprosyRiskAnalysisService {
  async calculateRiskScore(userId: string): Promise<LeprosyRiskScore> {
    // Fetch all necessary data
    const profile = await LeprosyUserProfile.findOne({ userId });
    const symptomLogs = await SymptomLog.find({ userId })
      .sort({ timestamp: -1 }).limit(30);
    const previousAssessments = await LeprosyRiskAssessment.find({ userId })
      .sort({ timestamp: -1 }).limit(10);
    
    // Calculate component scores
    const symptomRisk = this.calculateSymptomProgressionRisk(symptomLogs);
    const adherenceRisk = this.calculateAdherenceRisk(profile, symptomLogs);
    const complicationRisk = this.calculateComplicationRisk(profile);
    const sensoriomotorRisk = this.calculateSensoriomotorRisk(symptomLogs);
    const immuneRisk = this.calculateImmuneRisk(profile);
    const lifeconditionsRisk = this.calculateLifeConditionsRisk(profile);
    
    // Calculate overall score
    const overallScore = this.weightedAverage([
      { score: symptomRisk, weight: 0.25 },
      { score: adherenceRisk, weight: 0.20 },
      { score: complicationRisk, weight: 0.20 },
      { score: sensoriomotorRisk, weight: 0.15 },
      { score: immuneRisk, weight: 0.12 },
      { score: lifeconditionsRisk, weight: 0.08 },
    ]);
    
    // Determine risk level
    const riskLevel = this.getRiskLevel(overallScore);
    
    // Analyze trajectory
    const trajectory = this.analyzeDiseaseTrajectory(symptomLogs, previousAssessments);
    
    // Identify critical and protective factors
    const criticalFactors = this.identifyCriticalFactors(profile, symptomLogs);
    const protectiveFactors = this.identifyProtectiveFactors(profile);
    
    // Generate predictions
    const predictions = this.generatePredictions(overallScore, riskLevel, trajectory);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      criticalFactors, protectiveFactors, trajectory, profile
    );
    
    const assessment: LeprosyRiskScore = {
      overallRiskScore: Math.round(overallScore),
      riskLevel,
      diseaseTrajectory: trajectory,
      componentScores: {
        symptomProgressionRisk: symptomRisk,
        treatmentAdherenceRisk: adherenceRisk,
        complicationRisk,
        sensorimotorCompromiseRisk: sensoriomotorRisk,
        immuneResponseRisk: immuneRisk,
        lifeconditionsRisk,
      },
      criticalFactors,
      protectiveFactors,
      predictions,
      recommendations,
      nextCheckupDueDate: this.calculateNextCheckupDate(overallScore, trajectory),
    };
    
    // Save assessment
    const riskAssessment = new LeprosyRiskAssessment({
      userId,
      assessment,
      timestamp: new Date(),
    });
    await riskAssessment.save();
    
    return assessment;
  }
  
  // Helper methods...
}

export default new LeprosyRiskAnalysisService();
```

### 3.2 New Model: `LeprosyRiskAssessment.ts`

```typescript
interface ILeprosyRiskAssessment extends Document {
  userId: string;
  assessment: LeprosyRiskScore;
  timestamp: Date;
  createdAt: Date;
}

const LeprosyRiskAssessmentSchema = new Schema<ILeprosyRiskAssessment>({
  userId: { type: String, required: true, index: true },
  assessment: {
    overallRiskScore: Number,
    riskLevel: String,
    diseaseTrajectory: String,
    componentScores: {
      symptomProgressionRisk: Number,
      treatmentAdherenceRisk: Number,
      complicationRisk: Number,
      sensorimotorCompromiseRisk: Number,
      immuneResponseRisk: Number,
      lifeconditionsRisk: Number,
    },
    criticalFactors: [
      { factor: String, severity: String, explanation: String, action: String },
    ],
    protectiveFactors: [
      { factor: String, explanation: String, encouragement: String },
    ],
    predictions: {
      riskOfReaction: Number,
      riskOfDisability: Number,
      estimatedImprovementTimeline: String,
    },
    recommendations: [String],
    nextCheckupDueDate: Date,
  },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });
```

### 3.3 New API Routes: `leprosy.ts`

Add these endpoints:

```typescript
// Calculate risk assessment
router.post('/risk-assessment', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const riskScore = await leprosyRiskAnalysisService.calculateRiskScore(userId);
    res.json({ success: true, riskScore });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate risk assessment' });
  }
});

// Get latest risk assessment
router.get('/risk-assessment/latest', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const assessment = await LeprosyRiskAssessment.findOne({ userId })
      .sort({ timestamp: -1 });
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch risk assessment' });
  }
});

// Get risk assessment history
router.get('/risk-assessment/history', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const assessments = await LeprosyRiskAssessment.find({ userId })
      .sort({ timestamp: -1 }).limit(12); // Last 12 assessments
    res.json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch risk history' });
  }
});

// Get risk trends (for charts)
router.get('/risk-assessment/trends', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const assessments = await LeprosyRiskAssessment.find({ userId })
      .sort({ timestamp: 1 });
    
    const trends = assessments.map(a => ({
      date: a.timestamp,
      overallScore: a.assessment.overallRiskScore,
      riskLevel: a.assessment.riskLevel,
      trajectory: a.assessment.diseaseTrajectory,
    }));
    
    res.json({ success: true, trends });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch risk trends' });
  }
});
```

---

## 4. FRONTEND IMPLEMENTATION

### 4.1 New Component: `LeprosyRiskAnalysis.tsx`

Location: `frontend/components/leprosy/RiskAnalysis.tsx`

**Key sections:**
1. **Risk Score Dashboard**
   - Overall score (gauge/circular progress)
   - Risk level indicator (Low/Moderate/High/Critical)
   - Disease trajectory (Improving/Stable/Progressing)

2. **Component Scores Breakdown**
   - Radar chart showing all 6 component scores
   - Color-coded breakdown with hover tooltips
   - Each component explains its calculation

3. **Critical Factors Alert Panel**
   - Red-colored cards for high/critical factors
   - Each with explanation and recommended action
   - Severity badges

4. **Protective Factors Section**
   - Green-colored cards
   - Encouraging text highlighting patient's strengths

5. **Risk Trend Chart**
   - Line chart showing risk score over time
   - Trajectory overlay
   - Comparison to previous assessments

6. **Predictions Section**
   - Risk of Type 1/2 reaction (%)
   - Risk of new disability (%)
   - Estimated improvement timeline
   - Visual indicators (progress bars)

7. **Recommendations Section**
   - Prioritized action items
   - Color-coded by urgency
   - Clickable to add to care plan
   - Next checkup date highlighted

### 4.2 Integration into Leprosy Assistant Page

Add Risk Analysis tab alongside existing tabs:
- Symptom Tracker
- **Risk Analysis** ← NEW
- Profile Management
- Chat Assistant
- Appointments

### 4.3 UI Layout

```
┌─────────────────────────────────────────┐
│  LEPROSY RISK ANALYSIS DASHBOARD         │
├─────────────────────────────────────────┤
│                                           │
│  ┌─ Overall Risk Score ─┐                │
│  │  ████████░░░░ 72%   │  HIGH RISK      │
│  │  Trajectory: Progressing              │
│  └────────────────────────┘              │
│                                           │
│  Component Scores (Radar Chart):         │
│  ┌─────────────────────────────────────┐ │
│  │    Symptom Progression:  65%       │ │
│  │    Treatment Adherence:  45%       │ │
│  │    Complication Risk:    78% ⚠️   │ │
│  │    Immunity Response:    82% 🔴   │ │
│  │    Sensorimotor:         70%       │ │
│  │    Life Conditions:      60%       │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  🔴 CRITICAL FACTORS:                     │
│  ├─ Nerve involvement in 3 areas        │
│  │  Action: Schedule nerve exam         │
│  └─ Poor medication adherence (60%)     │
│     Action: Review compliance barriers  │
│                                           │
│  ✅ PROTECTIVE FACTORS:                   │
│  ├─ Good family support system          │
│  └─ Consistent monthly check-ups        │
│                                           │
│  Risk Trend (Last 3 months):             │
│  [Line Chart showing score progression]  │
│                                           │
│  📊 PREDICTIONS:                          │
│  ├─ Type 1/2 Reaction Risk: 15%          │
│  └─ Disability Risk: 25%                 │
│                                           │
│  💡 RECOMMENDATIONS:                      │
│  1. Increase medication adherence       │
│  2. Schedule nerve assessment           │
│  3. Optimize nutrition...               │
│                                           │
│  📅 Next Checkup: Due in 2 weeks       │
└─────────────────────────────────────────┘
```

---

## 5. DATA GATHERING CHECKLIST

### 5.1 Enhanced Symptom Logging UI
- Add severity sliders for each symptom
- Track affected areas visually (body diagram)
- Compare with previous logs side-by-side
- Auto-calculate progression rate

### 5.2 Treatment Adherence Tracking
- Weekly medication compliance input
- Missed dose logging with reasons
- Appointment attendance tracking
- Self-assessment of treatment response

### 5.3 Clinical Data Enhancements
- Extend profile to capture:
  - WHO disability grading (0/1/2)
  - Specific nerve involvement map
  - Recent lab results (if available)
  - Medical history timeline

### 5.4 Optional Advanced Metrics
- Temperature/humidity data (if stored)
- Sleep tracking integration
- Stress level entries (PHQ-9 or similar)
- Physical activity logs
- Pain intensity (numeric rating scale)

---

## 6. IMPLEMENTATION TIMELINE

**Phase 1 (Week 1-2):**
- Create new models and database schema
- Build risk calculation service
- Implement API endpoints

**Phase 2 (Week 3):**
- Build UI components
- Integrate risk assessment into assistant page
- Add data visualization charts

**Phase 3 (Week 4):**
- Testing and validation
- Deploy to production
- User feedback collection

---

## 7. EXPECTED OUTCOMES

✅ Early detection of disease progression
✅ Personalized risk stratification
✅ Actionable intervention recommendations
✅ Visual trend analysis for patient engagement
✅ Doctor-friendly risk summaries for appointments
✅ Compliance improvement through alerts
✅ Better prediction of complications

---

## 8. CONSIDERATIONS & NEXT STEPS

1. **Validation**: Validate algorithm against medical literature
2. **Sensitivity**: Consider cultural/regional differences in risk factors
3. **Accessibility**: Ensure UI is accessible for visually impaired users
4. **Privacy**: Secure storage of sensitive health data
5. **Integration**: Link risk assessment to appointment scheduling
6. **AI Enhancement**: Future: Train ML model on historical patient outcomes

