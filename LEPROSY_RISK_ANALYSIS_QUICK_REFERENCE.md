# Leprosy Risk Analysis - Quick Reference Guide

## At a Glance: What to Collect

### 1. FROM EVERY SYMPTOM LOG
```
✓ Date & Time
✓ Which symptoms present (skin patches, numbness, weakness, eye issues, nerve pain)
✓ Severity level for each symptom (mild/moderate/severe)
✓ Which areas affected (specific body parts)
✓ Has it spread since last log? (yes/no)
✓ Patient notes on how they're feeling
```

### 2. FROM PATIENT PROFILE (Monthly Update)
```
Personal:
  ✓ Age, weight, height, gender

Treatment:
  ✓ Type of leprosy (TB/borderline/lepromatous)
  ✓ Months on treatment
  ✓ Treatment status (ongoing/completed)
  ✓ Current medications
  ✓ Medication adherence % (self-reported)
  ✓ Missed doses in last 30 days
  ✓ Allergies & other conditions

Leprosy-Specific:
  ✓ Affected body areas
  ✓ Nerve involvement? (yes/no + which nerves)
  ✓ Eye involvement? (yes/no + severity)
  ✓ Any disabilities? (list them)
  ✓ How is treatment working? (excellent/good/moderate/poor)

Lifestyle:
  ✓ Job/occupation
  ✓ Physical activity level
  ✓ Diet type & quality
  ✓ Sleep hours (avg per night)
  ✓ Smoking status
  ✓ Stress level (low/med/high)
  ✓ Hygiene conditions at home
  ✓ Nutrition status
```

### 3. FROM MEDICAL RECORDS (If Available)
```
✓ WHO disability grade (0/1/2)
✓ Baseline lesion count
✓ Baseline affected area (cm²)
✓ Lab results (if done)
✓ Reaction episodes
✓ Nerve exam findings
✓ Eye exam findings
```

### 4. FROM IMAGING (Monthly Scans)
```
✓ Number of lesions
✓ Size & distribution
✓ Boundary clarity (sharp/blurred)
✓ Pigmentation pattern
✓ Signs of inflammation
✓ Comparison to previous scan (improving/stable/worsening)
```

---

## Risk Score Calculation Map

```
OVERALL RISK SCORE (0-100)
│
├─ 25% Symptom Progression Risk
│  ├─ Rapid spread? = HIGH
│  ├─ New symptoms? = +points
│  ├─ Improvement timeline met? = -points
│  └─ Nerve/eye involvement? = CRITICAL
│
├─ 20% Treatment Adherence Risk
│  ├─ Medication compliance % 
│  ├─ Missed appointments
│  └─ Treatment interruptions
│
├─ 20% Complication Risk
│  ├─ Nerve involvement severity
│  ├─ Eye involvement
│  └─ Pre-existing disabilities
│
├─ 15% Sensorimotor Compromise
│  ├─ WHO disability grade
│  ├─ Pain intensity
│  └─ Numbness progression
│
├─ 12% Immune Response Risk
│  ├─ Leprosy type (TB=low, Lepromat=high)
│  ├─ Comorbidities (HIV, TB, diabetes)
│  ├─ Malnutrition status
│  └─ Age factors
│
└─ 8% Life Conditions Risk
   ├─ Nutrition quality
   ├─ Sleep hours
   ├─ Stress level
   ├─ Treatment access
   └─ Hygiene conditions
```

---

## Risk Level Interpretation

| Score | Level | Meaning | Action |
|-------|-------|---------|--------|
| 0-25 | **Low** | Excellent progress, minimal concern | Continue current plan |
| 26-50 | **Moderate** | Stable, some monitoring needed | Monthly review + adherence focus |
| 51-75 | **High** | Notable risk factors present | Bi-weekly check-ins, medication review |
| 76-100 | **Critical** | Urgent intervention needed | Weekly contact, immediate doctor visit |

---

## Disease Trajectory Meanings

| Trajectory | Patient Status | What It Means | Next Steps |
|------------|---|---|---|
| **Improving** | Getting better | Symptoms decreasing, nerve function stabilizing | Continue treatment, monthly updates |
| **Stable** | No major change | Symptoms not getting worse or better | Maintain adherence, look for triggers |
| **Progressing** | Getting worse | Symptoms increasing despite treatment | Doctor visit urgent, medication review |
| **Unknown** | Not enough data | Too few logs to determine trend | Continue logging for 2-4 weeks |

---

## Critical Alert Scenarios

### 🔴 CRITICAL (Score 75+)
- **Rapid nerve function loss** → Schedule nerve exam TODAY
- **New eye symptoms** → Urgent ophthalmology referral
- **Multiple areas spreading** → Treatment adjustment needed
- **Complete treatment non-adherence** → Counseling + support

### 🟠 HIGH (Score 50-75)
- **Type 1 Reaction suspected** → Prednisone consideration
- **Medication side effects limiting adherence** → Alternative meds?
- **Significant disability progression** → Rehabilitation referral
- **Comorbidity complications** → Specialist consultation

### 🟡 MODERATE (Score 25-50)
- **Marginal medication compliance** → Reminder system
- **Persistent nerve pain** → Pain management review
- **Skin lesions not improving** → Topical therapy adjustment
- **Psychological distress** → Mental health support

---

## Protective Factors (Good Signs)

✅ **Excellent medication adherence** (>90%)
✅ **Regular follow-up appointments** (no missed visits)
✅ **Strong social/family support**
✅ **Good nutritional status**
✅ **Stable employment & income**
✅ **Access to healthcare**
✅ **No comorbidities** (HIV, TB, diabetes)
✅ **Stable stress levels**
✅ **TB-type leprosy** (vs lepromatous)
✅ **Young to middle-aged** (not extremes)
✅ **Early treatment initiation**
✅ **No pre-existing disabilities**

---

## Data Collection Timeline

| Frequency | Data Point | Who Collects |
|-----------|-----------|--------------|
| **Daily** | Medication taken? | Patient (app reminder) |
| **Weekly** | Symptom status | Patient self-log |
| **Monthly** | Profile update | Patient + Healthcare worker |
| **Monthly** | Clinical exam | Doctor |
| **Monthly** | Skin scan | Patient (if available) |
| **Every 3 months** | Formal assessment | Risk analysis system |
| **Every 3 months** | Doctor review | Specialist |
| **Every 6 months** | Lab work | Healthcare facility |

---

## Integration Points in SkinNova

```
┌─────────────────────────────────┐
│  Leprosy Care Assistant         │
├─────────────────────────────────┤
│                                   │
│  1. Symptom Tracker              │  ← Daily/Weekly
│     └─> Enhanced symptom log     │
│                                   │
│  2. Profile Management            │  ← Monthly update
│     └─> Clinical data capture    │
│                                   │
│  3. RISK ANALYSIS (NEW)           │  ← Auto-calculate
│     ├─ Risk Dashboard             │
│     ├─ Component breakdown        │
│     ├─ Critical alerts            │
│     ├─ Trend charts              │
│     ├─ Predictions               │
│     └─ Recommendations           │
│                                   │
│  4. Chat Assistant               │  ← Query-based
│     └─> Risk explanation in QA   │
│                                   │
│  5. Appointments                 │  ← Link to scheduling
│     └─> Suggest check-up dates   │
│                                   │
│  6. Reports                      │  ← Doctor export
│     └─> Risk summary for clinic  │
└─────────────────────────────────┘
```

---

## Sample Risk Assessment Output

```json
{
  "overallRiskScore": 62,
  "riskLevel": "High",
  "diseaseTrajectory": "Progressing",
  "timestamp": "2026-03-03",
  
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
      "factor": "Nerve involvement spreading to 3 areas",
      "severity": "critical",
      "explanation": "Facial, ulnar, and peroneal nerves showing progressive involvement",
      "action": "Schedule immediate nerve conduction test"
    },
    {
      "factor": "Medication adherence at 65%",
      "severity": "high",
      "explanation": "4 missed doses in last 30 days; affects treatment efficacy",
      "action": "Identify barriers to adherence; implement reminder system"
    }
  ],
  
  "protectiveFactors": [
    {
      "factor": "Strong family support",
      "explanation": "Family actively involved in treatment monitoring",
      "encouragement": "This is a major asset in your recovery"
    },
    {
      "factor": "Good nutritional status",
      "explanation": "Regular diet intake supporting immune system",
      "encouragement": "Keep maintaining this excellent habit"
    }
  ],
  
  "predictions": {
    "riskOfReaction": 22,
    "riskOfDisability": 18,
    "estimatedImprovementTimeline": "6-8 weeks if adherence improves"
  },
  
  "recommendations": [
    "Schedule nerve examination within 1 week",
    "Implement medication reminder system (SMS/app)",
    "Weekly follow-up calls for 4 weeks",
    "Consider switching to observed therapy",
    "Nutritional counseling (continue current diet)"
  ],
  
  "nextCheckupDueDate": "2026-03-10"
}
```

---

## Implementation Checklist

### Backend
- [ ] Create LeprosyRiskAssessment model
- [ ] Build leprosyRiskAnalysisService with all calculation methods
- [ ] Add API endpoints for risk endpoints
- [ ] Add database indexes for performance
- [ ] Create migration scripts (if upgrading existing DB)

### Frontend
- [ ] Create RiskAnalysis component
- [ ] Add visualization components (charts, gauges)
- [ ] Create risk dashboard layout
- [ ] Implement critical alert panels
- [ ] Add trend chart visualization
- [ ] Integrate into assistant page navigation

### Testing
- [ ] Unit test risk calculations
- [ ] Test with sample patient data
- [ ] Validate against medical literature
- [ ] Performance test with large datasets
- [ ] UI/UX testing with different screen sizes

### Deployment
- [ ] Database migration
- [ ] Backend deployment
- [ ] Frontend deployment
- [ ] Monitor initial usage
- [ ] Collect user feedback

---

## Success Metrics

- Risk score updates within 24 hours of new symptom log
- 85% of critical alerts acknowledged within 24 hours
- Improved medication adherence due to alerts
- Earlier detection of complications
- Reduced hospital visits for acute issues
- Improved patient engagement with platform
- Doctor satisfaction with risk summaries

