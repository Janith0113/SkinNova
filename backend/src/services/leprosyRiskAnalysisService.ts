import SymptomLog from '../models/SymptomLog'
import LeprosyUserProfile from '../models/LeprosyUserProfile'
import LeprosyRiskAssessment from '../models/LeprosyRiskAssessment'
import { IRiskAssessment } from '../models/LeprosyRiskAssessment'
import leprosyXAIService from './leprosyXAIService'

interface ComponentScores {
  symptomProgressionRisk: number
  treatmentAdherenceRisk: number
  complicationRisk: number
  sensorimotorCompromiseRisk: number
  immuneResponseRisk: number
  lifeconditionsRisk: number
}

interface CriticalFactor {
  factor: string
  severity: 'high' | 'critical'
  explanation: string
  action: string
}

interface ProtectiveFactor {
  factor: string
  explanation: string
  encouragement: string
}

class LeprosyRiskAnalysisService {
  /**
   * Main method: Calculate comprehensive risk assessment
   */
  async calculateRiskScore(userId: string): Promise<IRiskAssessment> {
    try {
      console.log(`[Risk Analysis] Starting calculation for user ${userId}`)

      // Fetch all necessary data
      const [profile, symptomLogs, previousAssessments] = await Promise.all([
        LeprosyUserProfile.findOne({ userId }),
        SymptomLog.find({ userId }).sort({ timestamp: -1 }).limit(30),
        LeprosyRiskAssessment.find({ userId }).sort({ timestamp: -1 }).limit(10)
      ])

      // Validate sufficient data
      if (!profile && symptomLogs.length === 0) {
        throw new Error('Insufficient profile data to calculate risk')
      }

      // Calculate individual component scores
      const componentScores: ComponentScores = {
        symptomProgressionRisk: this.calculateSymptomProgressionRisk(symptomLogs, profile),
        treatmentAdherenceRisk: this.calculateAdherenceRisk(profile),
        complicationRisk: this.calculateComplicationRisk(profile),
        sensorimotorCompromiseRisk: this.calculateSensoriomotorRisk(symptomLogs, profile),
        immuneResponseRisk: this.calculateImmuneRisk(profile),
        lifeconditionsRisk: this.calculateLifeConditionsRisk(profile)
      }

      // Calculate weighted overall score
      const overallScore = this.calculateWeightedScore(componentScores)

      // Determine risk level
      const riskLevel = this.getRiskLevel(overallScore)

      // Analyze disease trajectory
      const trajectory = this.analyzeDiseaseTrajectory(symptomLogs, previousAssessments)

      // Identify critical and protective factors
      const criticalFactors = this.identifyCriticalFactors(profile, symptomLogs)
      const protectiveFactors = this.identifyProtectiveFactors(profile)

      // Generate predictions
      const predictions = this.generatePredictions(overallScore, riskLevel, trajectory, profile)

      // Generate personalized recommendations
      const recommendations = this.generateRecommendations(
        overallScore,
        riskLevel,
        trajectory,
        criticalFactors,
        protectiveFactors,
        profile
      )

      // Calculate next checkup date
      const nextCheckupDueDate = this.calculateNextCheckupDate(overallScore, trajectory)

      // Generate XAI explanation
      const xaiExplanation = await leprosyXAIService.generateXAIExplanation(
        userId,
        Math.round(overallScore),
        componentScores,
        profile,
        symptomLogs
      )

      const assessment: IRiskAssessment = {
        overallRiskScore: Math.round(overallScore),
        riskLevel,
        diseaseTrajectory: trajectory,
        componentScores,
        criticalFactors,
        protectiveFactors,
        predictions,
        recommendations,
        nextCheckupDueDate,
        xai: xaiExplanation
      }

      // Save assessment
      const riskAssessmentRecord = new LeprosyRiskAssessment({
        userId,
        assessment,
        timestamp: new Date()
      })

      await riskAssessmentRecord.save()

      console.log(`[Risk Analysis] Calculation complete: ${riskLevel} risk (Score: ${Math.round(overallScore)})`)

      return assessment
    } catch (error) {
      console.error('[Risk Analysis] Error:', error)
      throw error
    }
  }

  /**
   * Calculate Symptom Progression Risk (0-100)
   */
  private calculateSymptomProgressionRisk(symptomLogs: any[], profile: any): number {
    let risk = 25

    if (symptomLogs.length === 0) return 50

    const recentLog = symptomLogs[0]
    const activeSymptoms = this.countActiveSymptoms(recentLog)

    // Check for multiple symptoms
    if (activeSymptoms >= 4) {
      risk += 25
    } else if (activeSymptoms >= 2) {
      risk += 15
    }

    // Check if condition is new or chronic
    if (recentLog?.notes?.includes('new') || recentLog?.notes?.toLowerCase().includes('recent onset')) {
      risk += 20
    }

    // Check for nerve involvement (critical symptom)
    if (recentLog?.symptoms?.painfulNerves) {
      risk += 35
    }

    // Check for eye issues
    if (recentLog?.symptoms?.eyeIssues) {
      risk += 30
    }

    // Check for numbness progression
    if (recentLog?.symptoms?.numbness) {
      risk += 25
    }

    // Check for weakness
    if (recentLog?.symptoms?.weakness) {
      risk += 20
    }

    // Normalize to 0-100
    return Math.max(0, Math.min(100, risk))
  }

  /**
   * Calculate Treatment Adherence Risk (0-100)
   */
  private calculateAdherenceRisk(profile: any): number {
    let risk = 30

    if (!profile?.treatmentAdherence) return 50

    const compliance = profile.treatmentAdherence.medicationCompliancePercent || 50

    if (compliance >= 90) {
      risk = 10
    } else if (compliance >= 70) {
      risk = 30
    } else if (compliance >= 50) {
      risk = 60
    } else {
      risk = 80
    }

    const missedDoses = profile.treatmentAdherence.missedDosesLastMonth || 0
    risk += Math.min(missedDoses * 5, 20)

    const interruptions = profile.treatmentAdherence.treatmentInterruptions || []
    if (interruptions.length > 0) {
      risk += 50
    }

    const missedAppointments = profile.treatmentAdherence.missedAppointmentsLastMonth || 0
    risk += Math.min(missedAppointments * 10, 15)

    return Math.max(0, Math.min(100, risk))
  }

  /**
   * Calculate Complication Risk (0-100)
   */
  private calculateComplicationRisk(profile: any): number {
    let risk = 20

    if (!profile?.leprosy) return 50

    // Nerve involvement severity
    const nerveInvolvement = profile.leprosy.nerveInvolvement || false
    if (nerveInvolvement) {
      risk += 35
      const affectedAreas = profile.leprosy.affectedAreas || []
      if (affectedAreas.length >= 3) {
        risk += 25
      }
    }

    // Eye involvement severity
    const eyeInvolvement = profile.leprosy.eyeInvolvement || false
    if (eyeInvolvement) {
      risk += 35
    }

    // Pre-existing disabilities
    const disabilities = profile.leprosy.disabilities || []
    if (disabilities.length >= 1) {
      risk += 15
    }
    if (disabilities.length >= 3) {
      risk += 20
    }

    return Math.max(0, Math.min(100, risk))
  }

  /**
   * Calculate Sensorimotor Compromise Risk (0-100)
   */
  private calculateSensoriomotorRisk(symptomLogs: any[], profile: any): number {
    let risk = 30

    // WHO disability grading
    const whoGrade = profile?.clinicalAssessments?.whoDisabilityGrade ?? 1
    if (whoGrade === 0) {
      risk = 15
    } else if (whoGrade === 1) {
      risk = 50
    } else if (whoGrade === 2) {
      risk = 80
    }

    // Check numbness from symptom logs
    if (symptomLogs.length > 0) {
      if (symptomLogs[0]?.symptoms?.numbness) {
        risk = Math.max(risk, 60)
      }
    }

    // Check weakness
    if (symptomLogs.length > 0) {
      if (symptomLogs[0]?.symptoms?.weakness) {
        risk = Math.max(risk, 55)
      }
    }

    return Math.max(0, Math.min(100, risk))
  }

  /**
   * Calculate Immune Response Risk (0-100)
   */
  private calculateImmuneRisk(profile: any): number {
    let risk = 30

    // Leprosy type (most significant factor)
    const leprosyType = profile?.medical?.leprosyType || 'unknown'
    if (leprosyType.toLowerCase().includes('lepromatous')) {
      risk += 40
    } else if (leprosyType.toLowerCase().includes('borderline')) {
      risk += 20
    } else if (leprosyType.toLowerCase().includes('tuberculoid')) {
      risk += 5
    }

    // Comorbidities
    const riskFactors = profile?.riskFactors || {}

    if (riskFactors.hivStatus === 'positive') {
      risk += 50
    }

    if (riskFactors.tbCoinfection) {
      risk += 30
    }

    if (riskFactors.diabetes) {
      risk += 15
    }

    if (riskFactors.malnutrition) {
      risk += 20
    }

    // Age factors
    const age = profile?.personalInfo?.age || 40
    if (age < 15) {
      risk += 10
    } else if (age > 60) {
      risk += 10
    }

    return Math.max(0, Math.min(100, risk))
  }

  /**
   * Calculate Life Conditions Risk (0-100)
   */
  private calculateLifeConditionsRisk(profile: any): number {
    let risk = 30

    const lifestyle = profile?.lifestyle || {}

    // Nutrition
    const dietQuality = lifestyle.dietQuality || 'moderate'
    if (dietQuality === 'poor') {
      risk += 20
    } else if (dietQuality === 'good') {
      risk -= 10
    }

    // Sleep quality
    const sleepHours = lifestyle.sleepHours || 7
    if (sleepHours < 6) {
      risk += 15
    } else if (sleepHours > 9) {
      risk += 10
    } else {
      risk -= 5
    }

    // Stress level
    const stressLevel = lifestyle.stressLevel || 'moderate'
    if (stressLevel === 'high') {
      risk += 25
    } else if (stressLevel === 'low') {
      risk -= 10
    }

    // Treatment access
    const treatmentAccess = lifestyle.treatmentAccess || 'limited'
    if (treatmentAccess === 'poor') {
      risk += 30
    } else if (treatmentAccess === 'limited') {
      risk += 15
    }

    // Hygiene
    const hygiene = lifestyle.hygiene_conditions || 'moderate'
    if (hygiene === 'poor') {
      risk += 30
    } else if (hygiene === 'good') {
      risk -= 10
    }

    return Math.max(0, Math.min(100, risk))
  }

  /**
   * Calculate weighted overall score
   */
  private calculateWeightedScore(scores: ComponentScores): number {
    const weights = {
      symptomProgressionRisk: 0.25,
      treatmentAdherenceRisk: 0.2,
      complicationRisk: 0.2,
      sensorimotorCompromiseRisk: 0.15,
      immuneResponseRisk: 0.12,
      lifeconditionsRisk: 0.08
    }

    return (
      scores.symptomProgressionRisk * weights.symptomProgressionRisk +
      scores.treatmentAdherenceRisk * weights.treatmentAdherenceRisk +
      scores.complicationRisk * weights.complicationRisk +
      scores.sensorimotorCompromiseRisk * weights.sensorimotorCompromiseRisk +
      scores.immuneResponseRisk * weights.immuneResponseRisk +
      scores.lifeconditionsRisk * weights.lifeconditionsRisk
    )
  }

  /**
   * Determine risk level from score
   */
  private getRiskLevel(score: number): 'Low' | 'Moderate' | 'High' | 'Critical' {
    if (score <= 25) return 'Low'
    if (score <= 50) return 'Moderate'
    if (score <= 75) return 'High'
    return 'Critical'
  }

  /**
   * Analyze disease trajectory
   */
  private analyzeDiseaseTrajectory(
    symptomLogs: any[],
    previousAssessments: any[]
  ): 'Improving' | 'Stable' | 'Progressing' | 'Unknown' {
    if (symptomLogs.length < 2 && previousAssessments.length < 2) {
      return 'Unknown'
    }

    // Check symptom trend
    if (symptomLogs.length >= 2) {
      const recent = symptomLogs[0]
      const previous = symptomLogs[1]

      const recentCount = this.countActiveSymptoms(recent)
      const previousCount = this.countActiveSymptoms(previous)

      if (recentCount < previousCount) {
        return 'Improving'
      } else if (recentCount > previousCount) {
        return 'Progressing'
      }
    }

    // Check risk score trend
    if (previousAssessments.length >= 2) {
      const recentScore = previousAssessments[0]?.assessment?.overallRiskScore
      const previousScore = previousAssessments[1]?.assessment?.overallRiskScore

      if (recentScore < previousScore) {
        return 'Improving'
      } else if (recentScore > previousScore) {
        return 'Progressing'
      }
    }

    return 'Stable'
  }

  /**
   * Identify critical factors
   */
  private identifyCriticalFactors(profile: any, symptomLogs: any[]): CriticalFactor[] {
    const factors: CriticalFactor[] = []

    // Nerve involvement
    if (profile?.leprosy?.nerveInvolvement) {
      factors.push({
        factor: `Nerve involvement detected`,
        severity: 'critical',
        explanation: 'Progressive nerve damage requires careful monitoring',
        action: 'Schedule nerve examination within 1 week'
      })
    }

    // Eye involvement
    if (profile?.leprosy?.eyeInvolvement) {
      factors.push({
        factor: 'Eye involvement detected',
        severity: 'critical',
        explanation: 'Vision loss risk - requires ophthalmology review',
        action: 'Urgent ophthalmology referral'
      })
    }

    // Multiple symptoms
    if (symptomLogs.length > 0 && this.countActiveSymptoms(symptomLogs[0]) >= 4) {
      factors.push({
        factor: 'Multiple active symptoms',
        severity: 'high',
        explanation: 'Four or more concurrent symptoms indicate significant disease activity',
        action: 'Comprehensive clinical assessment recommended'
      })
    }

    // Poor medication adherence
    if ((profile?.treatmentAdherence?.medicationCompliancePercent || 100) < 70) {
      factors.push({
        factor: 'Suboptimal medication adherence',
        severity: 'high',
        explanation: `Only ${profile?.treatmentAdherence?.medicationCompliancePercent}% compliance reduces treatment efficacy`,
        action: 'Identify barriers to compliance and implement reminder system'
      })
    }

    return factors
  }

  /**
   * Identify protective factors
   */
  private identifyProtectiveFactors(profile: any): ProtectiveFactor[] {
    const factors: ProtectiveFactor[] = []

    // Good medication adherence
    if ((profile?.treatmentAdherence?.medicationCompliancePercent || 0) >= 90) {
      factors.push({
        factor: 'Excellent medication adherence',
        explanation: 'Taking medications as prescribed consistently',
        encouragement: 'Your commitment to treatment significantly improves your outcome!'
      })
    }

    // Favorable leprosy type
    if (profile?.medical?.leprosyType?.toLowerCase().includes('tuberculoid')) {
      factors.push({
        factor: 'Tuberculoid leprosy (more favorable prognosis)',
        explanation: 'Better immune response and generally better treatment response',
        encouragement: 'Your disease type has generally good treatment outcomes'
      })
    }

    // No significant comorbidities
    const riskFactors = profile?.riskFactors || {}
    if (!riskFactors.hivStatus && !riskFactors.tbCoinfection && !riskFactors.diabetes) {
      factors.push({
        factor: 'No significant comorbidities',
        explanation: 'Improves treatment response and recovery potential',
        encouragement: 'Good overall health supports your treatment plan'
      })
    }

    // Young age
    if ((profile?.personalInfo?.age || 40) < 40) {
      factors.push({
        factor: 'Younger age group',
        explanation: 'Generally associated with better immune response',
        encouragement: 'Your age is an advantage in disease management'
      })
    }

    return factors
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
    const baseReactionRisk = profile?.medical?.leprosyType?.toLowerCase().includes('lepromatous') ? 30 : 15
    const reactionRisk = Math.max(
      0,
      Math.min(100, baseReactionRisk + overallScore * 0.3 - (trajectory === 'Improving' ? 10 : 0))
    )

    // Risk of disability
    const baseDisabilityRisk = profile?.leprosy?.nerveInvolvement ? 40 : 15
    const disabilityRisk = Math.max(
      0,
      Math.min(100, baseDisabilityRisk + overallScore * 0.2 - (trajectory === 'Improving' ? 15 : 0))
    )

    // Improvement timeline
    let timeline = 'Unknown'
    if (overallScore <= 30) {
      timeline = '2-4 weeks'
    } else if (overallScore <= 50) {
      timeline = '4-8 weeks'
    } else if (overallScore <= 75) {
      timeline = '8-12 weeks'
    } else {
      timeline = '12+ weeks (requires intervention)'
    }

    return {
      riskOfReaction: Math.round(reactionRisk),
      riskOfDisability: Math.round(disabilityRisk),
      estimatedImprovementTimeline: timeline
    }
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
    const recommendations: string[] = []

    // Based on critical factors
    criticalFactors.forEach(factor => {
      recommendations.push(factor.action)
    })

    // Based on risk level
    if (riskLevel === 'Critical') {
      recommendations.push('Weekly clinical follow-up required')
      recommendations.push('Consider close observation or hospitalization')
    } else if (riskLevel === 'High') {
      recommendations.push('Bi-weekly clinical assessments recommended')
      recommendations.push('Medication adherence counseling needed')
    } else if (riskLevel === 'Moderate') {
      recommendations.push('Monthly clinical review recommended')
    }

    // Trajectory-based
    if (trajectory === 'Progressing') {
      recommendations.push('Discuss possible medication adjustment with doctor')
      recommendations.push('Investigate barriers to treatment success')
    } else if (trajectory === 'Improving') {
      recommendations.push('Continue current treatment plan')
      recommendations.push('Maintain excellent adherence to achieve full recovery')
    }

    // Lifestyle improvements
    if ((profile?.lifestyle?.sleepHours || 7) < 6) {
      recommendations.push('Improve sleep hygiene (aim for 7-9 hours per night)')
    }

    if ((profile?.lifestyle?.stressLevel || 'moderate') === 'high') {
      recommendations.push('Consider stress management support or counseling')
    }

    if ((profile?.lifestyle?.dietQuality || 'moderate') !== 'good') {
      recommendations.push('Nutritional counseling for immune support')
    }

    return [...new Set(recommendations)]
  }

  /**
   * Calculate next checkup due date
   */
  private calculateNextCheckupDate(overallScore: number, trajectory: string): Date {
    const nextDate = new Date()

    if (overallScore >= 75) {
      nextDate.setDate(nextDate.getDate() + 7)
    } else if (overallScore >= 50) {
      nextDate.setDate(nextDate.getDate() + 14)
    } else if (overallScore >= 25) {
      nextDate.setDate(nextDate.getDate() + 30)
    } else {
      nextDate.setDate(nextDate.getDate() + 60)
    }

    // Adjust if progressing
    if (trajectory === 'Progressing') {
      nextDate.setDate(nextDate.getDate() - 7)
    }

    return nextDate
  }

  /**
   * Helper: Count active symptoms
   */
  private countActiveSymptoms(log: any): number {
    let count = 0
    const symptoms = log?.symptoms || {}
    Object.values(symptoms).forEach(value => {
      if (value === true) count++
    })
    return count
  }
}

export default new LeprosyRiskAnalysisService()
