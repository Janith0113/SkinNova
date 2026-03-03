# 📊 LEPROSY RISK ANALYSIS - VISUAL REFERENCE CARD

## 🎯 One-Page Overview

### Risk Score Interpretation

```
Score Range    Level      Actions              Timeline
0-25          LOW        Continue plan        Re-check in 2 months
26-50         MODERATE   Monthly review       Monthly follow-up
51-75         HIGH       Intensive monitoring Bi-weekly contact
76-100        CRITICAL   Urgent intervention  Weekly monitoring
```

### Disease Trajectory Meanings

```
IMPROVING    ↘️    Symptoms getting better
             Getting better or staying positive?
             Good sign! Continue current treatment

STABLE       ═     Neither better nor worse  
             No new problems developing?
             Maintain current approach

PROGRESSING  ↗️    Symptoms getting worse
             Worsening despite treatment?
             Doctor review needed ASAP

UNKNOWN      ?     Not enough historical data
             Need 2-4 weeks more data
             Continue logging symptoms
```

---

## 📈 Data Collection Frequency

```
DAILY           →  Did patient take medicine?
                   (App-based reminder)

WEEKLY          →  Symptom status check
                   ├─ Which symptoms?
                   ├─ Severity (1-5)?
                   └─ Improving/stable/worse?

MONTHLY         →  Profile & clinical update
                   ├─ Treatment adherence %
                   ├─ Stress, sleep, diet
                   ├─ Doctor exam notes
                   └─ Any medication changes?

QUARTERLY       →  Comprehensive assessment
                   ├─ Lab results
                   ├─ Nerve exam (full)
                   ├─ Eye exam
                   └─ WHO disability grade
```

---

## 🔢 Risk Calculation Formula

```
OVERALL RISK SCORE = 
    (Symptom Prog. × 0.25) +
    (Adherence × 0.20) +
    (Complications × 0.20) +
    (Sensorimotor × 0.15) +
    (Immune Response × 0.12) +
    (Life Conditions × 0.08)

Result: 0-100 scale
```

### Component Scores Explained

| Factor | Weight | What It Measures |
|--------|--------|------------------|
| **Symptom Progression** | 25% | Speed of change, new symptoms, spreading rate |
| **Treatment Adherence** | 20% | Medication compliance, appointment attendance |
| **Complications** | 20% | Nerve/eye involvement, existing disabilities |
| **Sensorimotor** | 15% | Functional disability (WHO grade), pain level |
| **Immune Response** | 12% | Comorbidities (HIV, TB, diabetes), age, type |
| **Life Conditions** | 8% | Sleep, stress, nutrition, hygiene, environment |

---

## 🎨 Dashboard Layout

```
┌──────────────────────────────────────────────┐
│  LEPROSY RISK ANALYSIS                       │
├──────────────────────────────────────────────┤
│                                                │
│  OVERALL SCORE: 62/100 │ HIGH RISK │ ↗️ PROG │
│                                                │
│  COMPONENT SCORES (Radar Chart):             │
│                                                │
│         Symptom Prog: 78%                     │
│              ╱──────╲                         │
│       Adherence 45%  ╲  Sensorimotor 72%     │
│            ╱          ╲  ╱                    │
│     Immune 82%────────╲╱──Complication 65%   │
│            ╲          ╱                       │
│     Life Cond 60%────╱                        │
│                                                │
│  ⚠️  CRITICAL FACTORS:                        │
│  ┌────────────────────────────────────────┐  │
│  │ Nerve involvement in 3 areas (Critical) │  │
│  │ Action: Schedule nerve exam TODAY      │  │
│  │ Explanation: Progressive nerve damage  │  │
│  └────────────────────────────────────────┘  │
│                                                │
│  ✅ PROTECTIVE FACTORS:                       │
│  ┌────────────────────────────────────────┐  │
│  │ Good family support system             │  │
│  │ Regular monthly appointments           │  │
│  └────────────────────────────────────────┘  │
│                                                │
│  📊 RISK TREND (90 days):                     │
│  Score:  ┌─────────────                      │
│          │    ╱╲                              │
│          │   ╱  ╲─────────                    │
│          │  ╱               ╲                 │
│  └───────┴─────────────────────              │
│  Days:   0      30      60      90            │
│                                                │
│  🎯 PREDICTIONS:                              │
│  Type 1/2 Reaction Risk: ███░░░░░░ 22%       │
│  New Disability Risk:    ██░░░░░░░ 18%       │
│  Est. Improvement:       "6-8 weeks"         │
│                                                │
│  💡 RECOMMENDATIONS:                          │
│  1. Schedule nerve examination (URGENT)      │
│  2. Implement medication reminders           │
│  3. Increase adherence monitoring            │
│  4. Pain management review with doctor       │
│  5. Nutritional counseling                   │
│                                                │
│  📅 NEXT CHECKUP DUE: March 10, 2026        │
│                                                │
└──────────────────────────────────────────────┘
```

---

## 🚨 Alert Scenarios

### CRITICAL (Score 76+) 🔴
**What triggers it:**
- Rapid nerve spread to new areas
- New eye symptoms appearing
- Multiple lesion spread despite treatment
- Zero medication compliance
- Type 1/2 reaction likely

**What to do:**
- Doctor contact WITHIN 24 HOURS
- Weekly monitoring minimum
- Consider hospitalization
- Urgent medication review

**Example Alert:**
```
⚠️  CRITICAL: Nerve involvement spreading
Status: Immediate attention needed
Action: Emergency doctor visit today
```

### HIGH (Score 51-75) 🟠
**What triggers it:**
- Slow treatment response
- Borderline medication adherence
- Single nerve/eye involvement
- Pre-existing disability worsening

**What to do:**
- Bi-weekly doctor check-ins
- Medication adherence counseling
- Investigate pain/disability increase
- Consider treatment adjustment

**Example Alert:**
```
⚠️  HIGH: Treatment response slower than expected
Status: Needs attention
Action: Doctor appointment within 1 week
```

### MODERATE (Score 26-50) 🟡
**What triggers it:**
- Stable but slowly improving
- Some adherence gaps
- Minor new symptoms
- Environmental stressors

**What to do:**
- Monthly review with doctor
- Lifestyle modification support
- Continue current treatment
- Address barriers to adherence

**Example Alert:**
```
ℹ️  MODERATE: Medication adherence at 70%
Status: Monitor closely
Action: Reminder system needed
```

### LOW (Score 0-25) 🟢
**What triggers it:**
- Excellent response to treatment
- Perfect medication compliance
- No new complications
- Good life conditions

**What to do:**
- Continue current plan
- Bi-monthly check-ups OK
- Encourage patient engagement
- Celebrate progress!

**Example Alert:**
```
✅ LOW RISK: Excellent disease control
Status: On track
Action: Continue current plan, check in 2 months
```

---

## 📋 Data Collection Checklist

### Daily (Automated)
- [ ] Medication taken? (app reminder)

### Weekly (Patient Self-Report)
- [ ] Symptoms present? (yes/no for each)
- [ ] Severity level? (mild/moderate/severe)
- [ ] Compared to last week? (better/same/worse)
- [ ] Any new symptoms?
- [ ] Any symptoms resolved?
- [ ] General notes?

### Monthly (Requires Input)
- [ ] Medication compliance % (0-100)
- [ ] Missed doses this month? (number)
- [ ] Missed appointments? (number)
- [ ] Current stress level? (1-10)
- [ ] Sleep hours per night? (average)
- [ ] Diet quality? (poor/OK/good)
- [ ] Physical activity? (sedentary/light/moderate/vigorous)
- [ ] Recent clinical findings? (doctor notes)

### Quarterly (Medical Team)
- [ ] WHO disability grade? (0/1/2)
- [ ] Lesion count?
- [ ] Nerve exam findings?
- [ ] Eye exam findings?
- [ ] Lab results? (if done)
- [ ] Comorbidity updates?

---

## 🔄 Disease States & Transitions

```
                    ┌─ Stable ─────────┐
                    │                  │
STARTING → Improving ← → Stable → Progressing
            (Good!)      (OK)     (Watch!)
                         ↓
                    (Baseline)
```

### Improving Transition
Monitor for:
- Sustained improvement for 4+ weeks
- Reduced medication side effects
- Better function/activity
- Patient confidence

Result → Reduce frequency of check-ups

### Stable Transition  
Monitor for:
- No new symptoms
- Consistent compliance
- Pain management adequate
- Life stable

Result → Maintain current frequency

### Progressing Transition
Monitor for:
- New symptoms appearing
- Existing symptoms worsening
- Compliance dropping
- Functional decline

Result → Increase check-up frequency

---

## 🎬 Action Pathways by Risk Level

```
Patient Takes Action
         ↓
    [DAILY LOG]
    Medicine log
         ↓
    [WEEKLY LOG]
    Symptoms update
         ↓
    [MONTHLY LOG]
    Profile update + Doctor exam
         ↓
    [SYSTEM CALCULATES]
    Processes 40+ data points
    6-factor risk calculation
         ↓
    [GENERATES ASSESSMENT]
    ├─ Overall score (0-100)
    ├─ Risk level
    ├─ Disease trajectory
    ├─ Critical factors
    ├─ Protective factors
    ├─ Predictions
    └─ Recommendations
         ↓
    [DASHBOARD DISPLAY]
         ↓
    LOW (0-25)      → Continue plan, recheck in 2 mo
    MODERATE (26-50) → Monthly review needed
    HIGH (51-75)    → Bi-weekly follow-up required
    CRITICAL (76+)  → Urgent doctor visit needed
         ↓
    Patient/Doctor Takes Action
```

---

## 💻 API Response Example

```json
{
  "overallRiskScore": 62,
  "riskLevel": "High",
  "diseaseTrajectory": "Progressing",
  
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
      "explanation": "Facial, ulnar, and peroneal nerves affected",
      "action": "Schedule nerve conduction test within 1 week"
    }
  ],
  
  "protectiveFactors": [
    {
      "factor": "Excellent family support",
      "explanation": "Family actively helps with treatment",
      "encouragement": "This is a major strength"
    }
  ],
  
  "predictions": {
    "riskOfReaction": 22,
    "riskOfDisability": 18,
    "estimatedImprovementTimeline": "6-8 weeks if adherence improves"
  },
  
  "recommendations": [
    "Schedule nerve examination within 1 week",
    "Implement medication reminder system",
    "Weekly follow-up for 4 weeks",
    "Pain management review",
    "Nutritional counseling"
  ],
  
  "nextCheckupDueDate": "2026-03-10T00:00:00Z"
}
```

---

## 🏆 Success Indicators

### Patient Level
✅ Understands their risk level
✅ Follows recommendations
✅ Improves medication adherence
✅ Reports to doctor on time
✅ Engages with app weekly

### System Level
✅ Risk calculation < 2 seconds
✅ Downtime < 0.5% monthly
✅ Accuracy validated by doctors
✅ 80%+ user engagement
✅ 90%+ alert acknowledgment

### Clinical Level
✅ 70% earlier detection of complications
✅ 30% improvement in adherence
✅ 25% fewer acute hospitalizations
✅ Better disease control
✅ Improved patient satisfaction

---

## 📞 Quick Help

**"What does HIGH RISK mean?"**
→ Score 51-75, needs bi-weekly doctor contact, possible treatment issues

**"When do I need to see doctor?"**
→ Check "Next Checkup Due" date in dashboard, CRITICAL level = within 24h

**"Should I change medications?"**
→ Talk to doctor about recommendations shown

**"Why is my risk score going up?"**
→ Check Critical Factors → each shows reason and action needed

**"How accurate is this?"**
→ Based on 40+ data points and medical guidelines, but not a diagnosis

**"Can I ignore the alerts?"**
→ Critical alerts should never be ignored; discuss with doctor

---

**Print this card and keep it handy while using the system! 📋**

