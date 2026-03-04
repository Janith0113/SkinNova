# Leprosy Risk Analysis - Code Templates & Starter Files

## 1. Backend Service Template

**File: `backend/src/services/leprosyRiskAnalysisService.ts`**

```typescript
import SymptomLog from '../models/SymptomLog';
import LeprosyUserProfile from '../models/LeprosyUserProfile';
import LeprosyRiskAssessment from '../models/LeprosyRiskAssessment';

interface ComponentScores {
  symptomProgressionRisk: number;
  treatmentAdherenceRisk: number;
  complicationRisk: number;
  sensorimotorCompromiseRisk: number;
  immuneResponseRisk: number;
  lifeconditionsRisk: number;
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

interface RiskAssessment {
  overallRiskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  diseaseTrajectory: 'Improving' | 'Stable' | 'Progressing' | 'Unknown';
  componentScores: ComponentScores;
  criticalFactors: CriticalFactor[];
  protectiveFactors: ProtectiveFactor[];
  predictions: {
    riskOfReaction: number;
    riskOfDisability: number;
    estimatedImprovementTimeline: string;
  };
  recommendations: string[];
  nextCheckupDueDate: Date;
}

class LeprosyRiskAnalysisService {
  /**
   * Main method: Calculate comprehensive risk assessment
   */
  async calculateRiskScore(userId: string): Promise<RiskAssessment> {
    try {
      console.log(`[Risk Analysis] Starting calculation for user ${userId}`);

      // Fetch all necessary data
      const [profile, symptomLogs, previousAssessments] = await Promise.all([
        LeprosyUserProfile.findOne({ userId }),
        SymptomLog.find({ userId }).sort({ timestamp: -1 }).limit(30),
        LeprosyRiskAssessment.find({ userId }).sort({ timestamp: -1 }).limit(10),
      ]);

      // Validate sufficient data
      if (!profile && symptomLogs.length === 0) {
        throw new Error('Insufficient profile data to calculate risk');
      }

      // Calculate individual component scores
      const componentScores: ComponentScores = {
        symptomProgressionRisk: this.calculateSymptomProgressionRisk(symptomLogs, profile),
        treatmentAdherenceRisk: this.calculateAdherenceRisk(profile),
        complicationRisk: this.calculateComplicationRisk(profile),
        sensorimotorCompromiseRisk: this.calculateSensoriomotorRisk(symptomLogs, profile),
        immuneResponseRisk: this.calculateImmuneRisk(profile),
        lifeconditionsRisk: this.calculateLifeConditionsRisk(profile),
      };

      // Calculate weighted overall score
      const overallScore = this.calculateWeightedScore(componentScores);

      // Determine risk level
      const riskLevel = this.getRiskLevel(overallScore);

      // Analyze disease trajectory
      const trajectory = this.analyzeDiseaseTrajectory(
        symptomLogs,
        previousAssessments
      );

      // Identify critical and protective factors
      const criticalFactors = this.identifyCriticalFactors(profile, symptomLogs);
      const protectiveFactors = this.identifyProtectiveFactors(profile);

      // Generate predictions
      const predictions = this.generatePredictions(
        overallScore,
        riskLevel,
        trajectory,
        profile
      );

      // Generate personalized recommendations
      const recommendations = this.generateRecommendations(
        overallScore,
        riskLevel,
        trajectory,
        criticalFactors,
        protectiveFactors,
        profile
      );

      // Calculate next checkup date based on risk level
      const nextCheckupDueDate = this.calculateNextCheckupDate(
        overallScore,
        trajectory
      );

      const assessment: RiskAssessment = {
        overallRiskScore: Math.round(overallScore),
        riskLevel,
        diseaseTrajectory: trajectory,
        componentScores,
        criticalFactors,
        protectiveFactors,
        predictions,
        recommendations,
        nextCheckupDueDate,
      };

      // Save assessment to database
      const riskAssessmentRecord = new LeprosyRiskAssessment({
        userId,
        assessment,
        timestamp: new Date(),
      });

      await riskAssessmentRecord.save();

      console.log(`[Risk Analysis] Calculation complete: ${riskLevel} risk`);

      return assessment;
    } catch (error) {
      console.error('[Risk Analysis] Error:', error);
      throw error;
    }
  }

  /**
   * Calculate Symptom Progression Risk (0-100)
   * Base calculation on: symptom improvement timeline, new symptoms, severity
   */
  private calculateSymptomProgressionRisk(
    symptomLogs: any[],
    profile: any
  ): number {
    let risk = 25; // Base score

    if (symptomLogs.length === 0) return 50; // Insufficient data

    // Get treatment duration
    const treatmentDurationMonths = profile?.medical?.treatmentDuration || 0;
    
    // Get timeline since treatment started
    const treatmentStartDate = new Date();
    treatmentStartDate.setMonth(
      treatmentStartDate.getMonth() - treatmentDurationMonths
    );

    // Check symptom improvement timeline
    if (treatmentDurationMonths >= 2) {
      // Should see improvement by week 4 of MDT
      const noImprovementRisk = 30; // High risk if no improvement
      risk = Math.max(risk, noImprovementRisk);
    }

    // Check for rapid spreading
    if (symptomLogs.length >= 2) {
      const recentLog = symptomLogs[0];
      const previousLog = symptomLogs[1];

      const recentSymptomCount = this.countActiveSymptoms(recentLog);
      const previousSymptomCount = this.countActiveSymptoms(previousLog);

      if (recentSymptomCount > previousSymptomCount) {
        risk += 25; // New symptoms = significant risk increase
      }
    }

    // Check for spreading rate
    const spreadingRate = symptomLogs[0]?.symptomSeverity?.skinPatches?.spreadingRate;
    if (spreadingRate === 'rapid') {
      risk += 30;
    } else if (spreadingRate === 'slow') {
      risk -= 10;
    }

    // Check for critical symptoms (nerve/eye involvement)
    if (symptomLogs[0]?.symptoms?.painfulNerves) {
      risk += 20;
    }
    if (symptomLogs[0]?.symptoms?.eyeIssues) {
      risk += 25;
    }

    // Normalize to 0-100
    return Math.max(0, Math.min(100, risk));
  }

  /**
   * Calculate Treatment Adherence Risk (0-100)
   */
  private calculateAdherenceRisk(profile: any): number {
    let risk = 30; // Base score

    if (!profile?.treatmentAdherence) return 50; // No data

    const compliance = profile.treatmentAdherence.medicationCompliancePercent || 50;

    // Medication compliance scoring
    if (compliance >= 90) {
      risk = 10;
    } else if (compliance >= 70) {
      risk = 30;
    } else if (compliance >= 50) {
      risk = 60;
    } else {
      risk = 80;
    }

    // Missed dose penalty
    const missedDoses = profile.treatmentAdherence.missedDosesLastMonth || 0;
    risk += Math.min(missedDoses * 5, 20); // Max +20 points for missed doses

    // Treatment interruption penalty
    const interruptions = profile.treatmentAdherence.treatmentInterruptions || [];
    if (interruptions.length > 0) {
      risk += 50;
    }

    // Missed appointments
    const missedAppointments =
      profile.treatmentAdherence.missedAppointmentsLastMonth || 0;
    risk += Math.min(missedAppointments * 10, 15);

    return Math.max(0, Math.min(100, risk));
  }

  /**
   * Calculate Complication Risk (0-100)
   */
  private calculateComplicationRisk(profile: any): number {
    let risk = 20; // Base score

    if (!profile?.leprosy) return 50;

    // Nerve involvement severity
    const nerveInvolvement = profile.leprosy.nerveInvolvement || false;
    if (nerveInvolvement) {
      risk += 30;

      // Check how many nerves affected
      const affectedAreas = profile.leprosy.affectedAreas || [];
      if (affectedAreas.length >= 3) {
        risk += 20; // Multiple areas = higher risk
      }
    }

    // Eye involvement severity
    const eyeInvolvement = profile.leprosy.eyeInvolvement || false;
    if (eyeInvolvement) {
      risk += 30;
    }

    // Pre-existing disabilities
    const disabilities = profile.leprosy.disabilities || [];
    if (disabilities.length >= 1) {
      risk += 15;
    }
    if (disabilities.length >= 3) {
      risk += 20;
    }

    return Math.max(0, Math.min(100, risk));
  }

  /**
   * Calculate Sensorimotor Compromise Risk (0-100)
   */
  private calculateSensoriomotorRisk(symptomLogs: any[], profile: any): number {
    let risk = 30; // Base score

    // WHO disability grading
    const whoGrade = profile?.clinicalAssessments?.whoDisabilityGrade ?? 1;
    if (whoGrade === 0) {
      risk = 10;
    } else if (whoGrade === 1) {
      risk = 50;
    } else if (whoGrade === 2) {
      risk = 80;
    }

    // Pain intensity from symptom logs
    if (symptomLogs.length > 0) {
      const painIntensity =
        symptomLogs[0]?.symptomSeverity?.painfulNerves?.painIntensity || 0;
      risk = Math.max(risk, painIntensity * 8); // Scale 0-80
    }

    // Numbness progression
    const numbnessSeverity = symptomLogs[0]?.symptomSeverity?.numbness?.severity;
    if (numbnessSeverity === 'severe') {
      risk = Math.max(risk, 75);
    } else if (numbnessSeverity === 'moderate') {
      risk = Math.max(risk, 50);
    }

    return Math.max(0, Math.min(100, risk));
  }

  /**
   * Calculate Immune Response Risk (0-100)
   */
  private calculateImmuneRisk(profile: any): number {
    let risk = 30; // Base score

    // Leprosy type (most significant factor)
    const leprosyType = profile?.medical?.leprosyType || 'unknown';
    if (leprosyType === 'lepromatous') {
      risk += 40; // Highest risk
    } else if (leprosyType === 'borderline') {
      risk += 20;
    } else if (leprosyType === 'tuberculoid') {
      risk += 5; // Lowest risk
    }

    // Comorbidities
    const riskFactors = profile?.riskFactors || {};

    if (riskFactors.hivStatus === 'positive') {
      risk += 50;
    }

    if (riskFactors.tbCoinfection) {
      risk += 30;
    }

    if (riskFactors.diabetes) {
      risk += 15;
    }

    if (riskFactors.malnutrition) {
      risk += 20;
    }

    // Age factors
    const age = profile?.personalInfo?.age || 40;
    if (age < 15) {
      risk += 10; // Pediatric cases more severe
    } else if (age > 60) {
      risk += 10; // Elderly have weaker immunity
    }

    return Math.max(0, Math.min(100, risk));
  }

  /**
   * Calculate Life Conditions Risk (0-100)
   */
  private calculateLifeConditionsRisk(profile: any): number {
    let risk = 30; // Base score

    const lifestyle = profile?.lifestyle || {};

    // Nutrition
    const dietQuality = lifestyle.dietQuality || 'moderate';
    if (dietQuality === 'poor') {
      risk += 20;
    } else if (dietQuality === 'good') {
      risk -= 10;
    }

    // Sleep quality
    const sleepHours = lifestyle.sleepHours || 7;
    if (sleepHours < 6) {
      risk += 15;
    } else if (sleepHours > 9) {
      risk += 10; // Oversleeping also concerning
    } else {
      risk -= 5;
    }

    // Stress level
    const stressLevel = lifestyle.stressLevel || 'moderate';
    if (stressLevel === 'high') {
      risk += 25;
    } else if (stressLevel === 'low') {
      risk -= 10;
    }

    // Treatment access
    const treatmentAccess = lifestyle.treatmentAccess || 'limited';
    if (treatmentAccess === 'poor') {
      risk += 30;
    } else if (treatmentAccess === 'limited') {
      risk += 15;
    }

    // Hygiene
    const hygiene = lifestyle.hygiene_conditions || 'moderate';
    if (hygiene === 'poor') {
      risk += 30;
    } else if (hygiene === 'good') {
      risk -= 10;
    }

    return Math.max(0, Math.min(100, risk));
  }

  /**
   * Calculate weighted overall score
   */
  private calculateWeightedScore(scores: ComponentScores): number {
    const weights = {
      symptomProgressionRisk: 0.25,
      treatmentAdherenceRisk: 0.20,
      complicationRisk: 0.20,
      sensorimotorCompromiseRisk: 0.15,
      immuneResponseRisk: 0.12,
      lifeconditionsRisk: 0.08,
    };

    return (
      scores.symptomProgressionRisk * weights.symptomProgressionRisk +
      scores.treatmentAdherenceRisk * weights.treatmentAdherenceRisk +
      scores.complicationRisk * weights.complicationRisk +
      scores.sensorimotorCompromiseRisk * weights.sensorimotorCompromiseRisk +
      scores.immuneResponseRisk * weights.immuneResponseRisk +
      scores.lifeconditionsRisk * weights.lifeconditionsRisk
    );
  }

  /**
   * Determine risk level from score
   */
  private getRiskLevel(
    score: number
  ): 'Low' | 'Moderate' | 'High' | 'Critical' {
    if (score <= 25) return 'Low';
    if (score <= 50) return 'Moderate';
    if (score <= 75) return 'High';
    return 'Critical';
  }

  /**
   * Analyze disease trajectory
   */
  private analyzeDiseaseTrajectory(
    symptomLogs: any[],
    previousAssessments: any[]
  ): 'Improving' | 'Stable' | 'Progressing' | 'Unknown' {
    if (symptomLogs.length < 2 || previousAssessments.length < 2) {
      return 'Unknown';
    }

    // Check if symptoms improving
    const recent = symptomLogs[0];
    const previous = symptomLogs[1];

    if (
      recent?.changes?.sinceLastLog === 'improved' &&
      previousAssessments[0]?.assessment?.overallRiskScore <
        previousAssessments[1]?.assessment?.overallRiskScore
    ) {
      return 'Improving';
    }

    if (recent?.changes?.sinceLastLog === 'worsened') {
      return 'Progressing';
    }

    if (
      previousAssessments[0]?.assessment?.diseaseTrajectory === 'Progressing'
    ) {
      return 'Progressing';
    }

    return 'Stable';
  }

  /**
   * Identify critical factors
   */
  private identifyCriticalFactors(profile: any, symptomLogs: any[]): CriticalFactor[] {
    const factors: CriticalFactor[] = [];

    // Nerve involvement
    if (profile?.leprosy?.nerveInvolvement) {
      factors.push({
        factor: `Nerve involvement in ${profile.leprosy.affectedAreas?.length || 1} area(s)`,
        severity: 'critical',
        explanation: 'Progressive nerve damage requires immediate attention',
        action: 'Schedule nerve conduction test within 1 week',
      });
    }

    // Eye involvement
    if (profile?.leprosy?.eyeInvolvement) {
      factors.push({
        factor: 'Eye involvement detected',
        severity: 'critical',
        explanation: 'Vision loss risk - requires ophthalmology review',
        action: 'Urgent ophthalmology referral',
      });
    }

    // Poor medication adherence
    if ((profile?.treatmentAdherence?.medicationCompliancePercent || 100) < 70) {
      factors.push({
        factor: 'Poor medication adherence',
        severity: 'high',
        explanation: `Only ${profile?.treatmentAdherence?.medicationCompliancePercent}% compliance reduces treatment efficacy`,
        action: 'Identify barriers, implement reminder system',
      });
    }

    // No improvement after treatment duration
    if (
      (profile?.medical?.treatmentDuration || 0) >= 4 &&
      symptomLogs[0]?.changes?.sinceLastLog === 'worsened'
    ) {
      factors.push({
        factor: 'Lack of treatment response',
        severity: 'critical',
        explanation: 'Should see symptom improvement by week 4 of MDT',
        action: 'Urgent doctor review - consider medication adjustment',
      });
    }

    return factors;
  }

  /**
   * Identify protective factors
   */
  private identifyProtectiveFactors(profile: any): ProtectiveFactor[] {
    const factors: ProtectiveFactor[] = [];

    // Good medication adherence
    if ((profile?.treatmentAdherence?.medicationCompliancePercent || 0) >= 90) {
      factors.push({
        factor: 'Excellent medication adherence',
        explanation: 'Taking medications as prescribed consistently',
        encouragement:
          'Your commitment to treatment significantly improves your outcome!',
      });
    }

    // Tuberculoid leprosy
    if (profile?.medical?.leprosyType === 'tuberculoid') {
      factors.push({
        factor: 'Tuberculoid leprosy type (lowest risk)',
        explanation: 'Better immune response and prognosis',
        encouragement: 'Your disease type has the best treatment response',
      });
    }

    // No comorbidities
    const riskFactors = profile?.riskFactors || {};
    if (
      !riskFactors.hivStatus &&
      !riskFactors.tbCoinfection &&
      !riskFactors.diabetes
    ) {
      factors.push({
        factor: 'No significant comorbidities',
        explanation: 'Improves treatment response and recovery',
        encouragement: 'Good overall health status supports treatment',
      });
    }

    // Regular appointments
    if ((profile?.treatmentAdherence?.missedAppointmentsLastMonth || 0) === 0) {
      factors.push({
        factor: 'Perfect appointment attendance',
        explanation: 'Staying monitored ensures early problem detection',
        encouragement: 'Consistent monitoring is key to your recovery',
      });
    }

    return factors;
  }

  /**
   * Generate predictions
   */
  private generatePredictions(
    overallScore: number,
    riskLevel: string,
    trajectory: string,
    profile: any
  ) {
    // Risk of reaction (Type 1/2)
    const baseReactionRisk =
      profile?.medical?.leprosyType === 'lepromatous' ? 30 : 15;
    const reactionRisk = Math.max(
      0,
      Math.min(
        100,
        baseReactionRisk + overallScore * 0.3 - (trajectory === 'Improving' ? 10 : 0)
      )
    );

    // Risk of disability
    const baseDisabilityRisk = profile?.leprosy?.nerveInvolvement ? 40 : 15;
    const disabilityRisk = Math.max(
      0,
      Math.min(
        100,
        baseDisabilityRisk +
          overallScore * 0.2 -
          (trajectory === 'Improving' ? 15 : 0)
      )
    );

    // Improvement timeline
    let timeline = 'Unknown';
    if (overallScore <= 30) {
      timeline = '2-4 weeks';
    } else if (overallScore <= 50) {
      timeline = '4-8 weeks';
    } else if (overallScore <= 75) {
      timeline = '8-12 weeks';
    } else {
      timeline = '12+ weeks (requires intervention)';
    }

    return {
      riskOfReaction: Math.round(reactionRisk),
      riskOfDisability: Math.round(disabilityRisk),
      estimatedImprovementTimeline: timeline,
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    overallScore: number,
    riskLevel: string,
    trajectory: string,
    criticalFactors: CriticalFactor[],
    protectiveFactors: ProtectiveFactor[],
    profile: any
  ): string[] {
    const recommendations: string[] = [];

    // Based on critical factors
    criticalFactors.forEach((factor) => {
      recommendations.push(factor.action);
    });

    // Based on risk level
    if (riskLevel === 'Critical') {
      recommendations.push('Weekly clinical follow-up');
      recommendations.push('Consider hospitalization for close monitoring');
    } else if (riskLevel === 'High') {
      recommendations.push('Bi-weekly clinical assessments');
      recommendations.push('Medication adherence counseling');
    } else if (riskLevel === 'Moderate') {
      recommendations.push('Monthly clinical review');
    }

    // Trajectory-based
    if (trajectory === 'Progressing') {
      recommendations.push('Doctor review for possible medication adjustment');
      recommendations.push('Investigate barriers to treatment success');
    } else if (trajectory === 'Improving') {
      recommendations.push('Continue current treatment plan');
      recommendations.push('Maintain excellent adherence');
    }

    // Lifestyle improvements
    if ((profile?.lifestyle?.sleepHours || 7) < 6) {
      recommendations.push('Improve sleep (aim for 7-9 hours/night)');
    }
    if ((profile?.lifestyle?.stressLevel || 'moderate') === 'high') {
      recommendations.push('Stress management counseling');
    }
    if ((profile?.lifestyle?.dietQuality || 'moderate') !== 'good') {
      recommendations.push('Nutritional counseling for immune support');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Calculate next checkup due date
   */
  private calculateNextCheckupDate(overallScore: number, trajectory: string): Date {
    const nextDate = new Date();

    if (overallScore >= 75) {
      nextDate.setDate(nextDate.getDate() + 7); // Weekly
    } else if (overallScore >= 50) {
      nextDate.setDate(nextDate.getDate() + 14); // Bi-weekly
    } else if (overallScore >= 25) {
      nextDate.setDate(nextDate.getDate() + 30); // Monthly
    } else {
      nextDate.setDate(nextDate.getDate() + 60); // Bi-monthly
    }

    // Adjust if trajectory is progressing
    if (trajectory === 'Progressing') {
      nextDate.setDate(nextDate.getDate() - 7); // One week earlier
    }

    return nextDate;
  }

  /**
   * Helper: Count active symptoms
   */
  private countActiveSymptoms(log: any): number {
    let count = 0;
    const symptoms = log?.symptoms || {};
    Object.values(symptoms).forEach((value) => {
      if (value === true) count++;
    });
    return count;
  }
}

export default new LeprosyRiskAnalysisService();
```

---

## 2. API Route Handler Template

**File: `backend/src/routes/leprosy.ts` - ADD ENDPOINTS**

```typescript
import leprosyRiskAnalysisService from '../services/leprosyRiskAnalysisService';
import LeprosyRiskAssessment from '../models/LeprosyRiskAssessment';

// ... existing imports and routes ...

// NEW ENDPOINTS FOR RISK ANALYSIS:

// 1. Calculate risk assessment
router.post('/risk-assessment', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { forceRecalculate } = req.body;

    console.log(`[API] Risk assessment requested for user ${userId}`);

    // Optional: Check cache if not forcing recalc ulation
    if (!forceRecalculate) {
      const recent = await LeprosyRiskAssessment.findOne({ userId })
        .sort({ timestamp: -1 });

      if (recent) {
        const hourAgo = new Date(Date.now() - 1000 * 60 * 60);
        if (recent.timestamp > hourAgo) {
          return res.json({
            success: true,
            riskScore: recent.assessment,
            cached: true,
          });
        }
      }
    }

    // Calculate fresh score
    const riskScore = await leprosyRiskAnalysisService.calculateRiskScore(
      userId
    );

    res.json({ success: true, riskScore });
  } catch (error) {
    console.error('[API] Risk assessment error:', error);
    res.status(500).json({
      error: 'Failed to calculate risk assessment',
      reason: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 2. Get latest risk assessment
router.get('/risk-assessment/latest', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;

    const assessment = await LeprosyRiskAssessment.findOne({ userId }).sort({
      timestamp: -1,
    });

    res.json({
      success: true,
      assessment: assessment || null,
    });
  } catch (error) {
    console.error('[API] Error fetching latest assessment:', error);
    res.status(500).json({ error: 'Failed to fetch risk assessment' });
  }
});

// 3. Get risk history
router.get('/risk-assessment/history', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const limit = Math.min(parseInt(req.query.limit || '12'), 100);
    const skip = parseInt(req.query.skip || '0');

    const assessments = await LeprosyRiskAssessment.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);

    const total = await LeprosyRiskAssessment.countDocuments({ userId });

    res.json({
      success: true,
      assessments,
      count: assessments.length,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[API] Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch risk history' });
  }
});

// 4. Get risk trends
router.get('/risk-assessment/trends', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const days = parseInt(req.query.days || '90');

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const assessments = await LeprosyRiskAssessment.find({
      userId,
      timestamp: { $gte: sinceDate },
    }).sort({ timestamp: 1 });

    const trends = assessments.map((a) => ({
      date: a.timestamp,
      overallScore: a.assessment.overallRiskScore,
      riskLevel: a.assessment.riskLevel,
      trajectory: a.assessment.diseaseTrajectory,
    }));

    res.json({ success: true, trends });
  } catch (error) {
    console.error('[API] Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch risk trends' });
  }
});

// ... continue with other endpoints ...
```

---

## 3. Frontend Component Template

**File: `frontend/components/leprosy/RiskAnalysis.tsx`** (Skeleton)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RiskAssessment {
  overallRiskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  diseaseTrajectory: 'Improving' | 'Stable' | 'Progressing' | 'Unknown';
  componentScores: {
    symptomProgressionRisk: number;
    treatmentAdherenceRisk: number;
    complicationRisk: number;
    sensorimotorCompromiseRisk: number;
    immuneResponseRisk: number;
    lifeconditionsRisk: number;
  };
  criticalFactors: Array<{
    factor: string;
    severity: 'high' | 'critical';
    explanation: string;
    action: string;
  }>;
  protectiveFactors: Array<{
    factor: string;
    explanation: string;
    encouragement: string;
  }>;
  predictions: {
    riskOfReaction: number;
    riskOfDisability: number;
    estimatedImprovementTimeline: string;
  };
  recommendations: string[];
  nextCheckupDueDate: string;
}

export default function RiskAnalysis() {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRiskAssessment();
  }, []);

  const fetchRiskAssessment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:4000/api/leprosy/risk-assessment/latest',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch assessment');

      const data = await response.json();
      if (data.assessment) {
        setAssessment(data.assessment.assessment);
      }
    } catch (err) {
      setError(err instanceof Error? err.message : 'Error loading assessment');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Moderate':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'High':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrajectoryIcon = (trajectory: string) => {
    switch (trajectory) {
      case 'Improving':
        return <TrendingDown className="w-5 h-5 text-green-600" />;
      case 'Progressing':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'Stable':
        return <Minus className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 mb-4">No risk assessment yet</p>
        <button
          onClick={fetchRiskAssessment}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Calculate Risk Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Overall Risk Score Card */}
      <div className={`rounded-lg border-2 p-6 ${getRiskColor(assessment.riskLevel)}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold mb-2">Overall Risk Score</h3>
            <div className="text-4xl font-bold mb-2">
              {assessment.overallRiskScore}/100
            </div>
            <p className="text-sm font-medium">{assessment.riskLevel} Risk</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTrajectoryIcon(assessment.diseaseTrajectory)}</span>
            <span className="text-sm font-medium">{assessment.diseaseTrajectory}</span>
          </div>
        </div>
      </div>

      {/* Component Scores */}
      <div className="grid gap-4">
        <h3 className="font-semibold text-lg">Risk Component Breakdown</h3>
        {/* Add score bars here */}
      </div>

      {/* Critical Factors */}
      {assessment.criticalFactors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-600 font-semibold">
            <AlertCircle className="w-5 h-5" />
            Critical Factors
          </div>
          {assessment.criticalFactors.map((factor, idx) => (
            <div key={idx} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
              <p className="font-medium text-red-900">{factor.factor}</p>
              <p className="text-sm text-red-700 mt-1">{factor.explanation}</p>
              <p className="text-sm font-semibold text-red-600 mt-2">
                Action: {factor.action}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Recommendations</h3>
        <ul className="space-y-2">
          {assessment.recommendations.map((rec, idx) => (
            <li key={idx} className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm">
                {idx + 1}
              </span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Checkup */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">Next Checkup Due:</p>
        <p className="text-lg font-semibold text-blue-900">
          {new Date(assessment.nextCheckupDueDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
```

---

These templates will get you started! Customize them based on your specific needs.

