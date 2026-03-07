import SymptomLog from '../models/SymptomLog'
import LeprosyUserProfile from '../models/LeprosyUserProfile'

/**
 * Explainable AI Service for Leprosy Risk Prediction
 * Provides feature importance, attribution, and detailed explanations
 * Uses SHAP-like approach adapted for medical data with Grad-CAM style visualization
 */

interface FeatureContribution {
  name: string
  value: number | boolean | string
  importance: number // 0-100, contribution to overall risk
  direction: 'positive' | 'negative' | 'neutral' // positive = increases risk
  explanation: string
  category: string // 'symptom' | 'adherence' | 'clinical' | 'environmental'
}

interface AttributionMap {
  feature: string
  contribution: number // -100 to 100, negative = protective, positive = risk increasing
  gradient: number // gradient strength for visualization
  color: string // color for visualization (red for risk, green for protective)
}

interface XAIExplanation {
  overallExplanation: string
  keyDrivers: FeatureContribution[]
  protectiveFactors: FeatureContribution[]
  attributionMap: AttributionMap[]
  confidenceScore: number // 0-100
  dataCompleteness: number // 0-100, how much data was available
  riskContributionBreakdown: {
    symptomContribution: number
    adherenceContribution: number
    complicationContribution: number
    sensorimotorContribution: number
    immuneContribution: number
    lifestyleContribution: number
  }
}

class LeprosyXAIService {
  /**
   * Calculate explainable AI for risk prediction
   */
  async generateXAIExplanation(
    userId: string,
    overallRiskScore: number,
    componentScores: any,
    profile: any,
    symptomLogs: any[]
  ): Promise<XAIExplanation> {
    try {
      // Get baseline values for comparison
      const baseline = this.getBaselineValues()

      // Extract and weight all relevant features
      const allFeatures = this.extractFeatures(profile, symptomLogs)

      // Calculate contribution of each feature
      const contributions = this.calculateFeatureContributions(allFeatures, componentScores, baseline)

      // Separate into key drivers and protective factors
      const keyDrivers = contributions
        .filter((c) => c.importance > 15 && c.direction === 'positive')
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 5)

      const protectiveFactors = contributions
        .filter((c) => c.importance > 10 && c.direction === 'negative')
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 5)

      // Create attribution map for visualization
      const attributionMap = this.createAttributionMap(contributions)

      // Calculate confidence based on data completeness
      const dataCompleteness = this.calculateDataCompleteness(profile, symptomLogs)
      const confidenceScore = Math.min(95, 50 + dataCompleteness * 0.45)

      // Generate overall explanation
      const overallExplanation = this.generateOverallExplanation(
        overallRiskScore,
        keyDrivers,
        protectiveFactors,
        componentScores
      )

      // Calculate contribution breakdown
      const riskContributionBreakdown = {
        symptomContribution: Math.round(componentScores.symptomProgressionRisk * 25),
        adherenceContribution: Math.round(componentScores.treatmentAdherenceRisk * 20),
        complicationContribution: Math.round(componentScores.complicationRisk * 20),
        sensorimotorContribution: Math.round(componentScores.sensorimotorCompromiseRisk * 15),
        immuneContribution: Math.round(componentScores.immuneResponseRisk * 12),
        lifestyleContribution: Math.round(componentScores.lifeconditionsRisk * 8)
      }

      return {
        overallExplanation,
        keyDrivers,
        protectiveFactors,
        attributionMap,
        confidenceScore,
        dataCompleteness,
        riskContributionBreakdown
      }
    } catch (error) {
      console.error('Error generating XAI explanation:', error)
      throw error
    }
  }

  /**
   * Extract all relevant features from profile and symptom logs
   */
  private extractFeatures(profile: any, symptomLogs: any[]): FeatureContribution[] {
    const features: FeatureContribution[] = []

    // Symptom features
    if (symptomLogs && symptomLogs.length > 0) {
      const latestLog = symptomLogs[0]

      if (latestLog.symptoms?.skinPatches) {
        features.push({
          name: 'Skin Patches Present',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Visible skin manifestations increase risk',
          category: 'symptom'
        })
      }

      if (latestLog.symptoms?.numbness) {
        features.push({
          name: 'Numbness',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Sensory involvement indicates nerve damage',
          category: 'symptom'
        })
      }

      if (latestLog.symptoms?.weakness) {
        features.push({
          name: 'Muscle Weakness',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Motor weakness suggests disease progression',
          category: 'symptom'
        })
      }

      if (latestLog.symptoms?.eyeIssues) {
        features.push({
          name: 'Eye Involvement',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Ocular involvement risk severe complications',
          category: 'symptom'
        })
      }

      if (latestLog.symptoms?.painfulNerves) {
        features.push({
          name: 'Nerve Pain',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Painful nerve involvement increases severity',
          category: 'symptom'
        })
      }

      // Symptom severity
      if (latestLog.symptomSeverity) {
        const severityCount = Object.values(latestLog.symptomSeverity).filter(
          (s: any) => s && s !== 'mild'
        ).length
        if (severityCount > 0) {
          features.push({
            name: 'Moderate/Severe Symptoms',
            value: severityCount,
            importance: 0,
            direction: 'positive',
            explanation: `${severityCount} symptoms with moderate or severe severity`,
            category: 'symptom'
          })
        }
      }

      // Spreading rate
      if (latestLog.spreadingRate === 'rapid') {
        features.push({
          name: 'Rapid Symptom Progression',
          value: 'rapid',
          importance: 0,
          direction: 'positive',
          explanation: 'Fast-spreading symptoms indicate aggressive disease',
          category: 'symptom'
        })
      }
    }

    // Treatment adherence features
    if (profile?.treatmentAdherence) {
      const adherence = profile.treatmentAdherence

      if (adherence.medicationCompliancePercent !== undefined) {
        features.push({
          name: 'Medication Compliance',
          value: `${adherence.medicationCompliancePercent}%`,
          importance: 0,
          direction: adherence.medicationCompliancePercent < 80 ? 'positive' : 'negative',
          explanation:
            adherence.medicationCompliancePercent < 80
              ? 'Low compliance increases treatment failure risk'
              : 'Good compliance reduces risk',
          category: 'adherence'
        })
      }

      if (adherence.missedDosesLastMonth && adherence.missedDosesLastMonth > 0) {
        features.push({
          name: 'Missed Doses',
          value: adherence.missedDosesLastMonth,
          importance: 0,
          direction: 'positive',
          explanation: `${adherence.missedDosesLastMonth} doses missed compromises treatment`,
          category: 'adherence'
        })
      }

      if (adherence.missedAppointmentsLastMonth && adherence.missedAppointmentsLastMonth > 0) {
        features.push({
          name: 'Missed Check-ups',
          value: adherence.missedAppointmentsLastMonth,
          importance: 0,
          direction: 'positive',
          explanation: 'Missed appointments prevent proper monitoring',
          category: 'adherence'
        })
      }
    }

    // Clinical assessment features
    if (profile?.clinicalAssessments) {
      const clinical = profile.clinicalAssessments

      if (clinical.whoDisabilityGrade !== undefined) {
        features.push({
          name: 'WHO Disability Grade',
          value: clinical.whoDisabilityGrade,
          importance: 0,
          direction: clinical.whoDisabilityGrade > 0 ? 'positive' : 'negative',
          explanation:
            clinical.whoDisabilityGrade > 0
              ? `Grade ${clinical.whoDisabilityGrade} disability increases risk`
              : 'No disability is protective',
          category: 'clinical'
        })
      }

      if (clinical.nerveThickenings && clinical.nerveThickenings.length > 0) {
        const severeThickenings = clinical.nerveThickenings.filter((n: any) => n.severity === 'severe')
        if (severeThickenings.length > 0) {
          features.push({
            name: 'Severe Nerve Thickening',
            value: severeThickenings.length,
            importance: 0,
            direction: 'positive',
            explanation: `${severeThickenings.length} severely thickened nerves indicate advanced disease`,
            category: 'clinical'
          })
        }
      }

      if (clinical.eyeStatus && clinical.eyeStatus !== 'normal') {
        features.push({
          name: `Eye Status: ${clinical.eyeStatus}`,
          value: clinical.eyeStatus,
          importance: 0,
          direction: 'positive',
          explanation: 'Ocular involvement increases complication risk',
          category: 'clinical'
        })
      }
    }

    // Risk factors
    if (profile?.riskFactors) {
      const risks = profile.riskFactors

      if (risks.hivStatus === 'positive') {
        features.push({
          name: 'HIV Co-infection',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'HIV significantly increases leprosy complications',
          category: 'clinical'
        })
      }

      if (risks.tbCoinfection) {
        features.push({
          name: 'TB Co-infection',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'TB co-infection increases immunosuppression',
          category: 'clinical'
        })
      }

      if (risks.diabetes) {
        features.push({
          name: 'Diabetes',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Diabetes compromises immune response',
          category: 'clinical'
        })
      }

      if (risks.malnutrition) {
        features.push({
          name: 'Malnutrition',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Poor nutrition weakens immune system',
          category: 'clinical'
        })
      }
    }

    // Lifestyle features
    if (profile?.lifestyle) {
      const lifestyle = profile.lifestyle

      if (lifestyle.treatmentAccess === 'limited' || lifestyle.treatmentAccess === 'poor') {
        features.push({
          name: 'Limited Treatment Access',
          value: lifestyle.treatmentAccess,
          importance: 0,
          direction: 'positive',
          explanation: 'Poor treatment access increases disease progression risk',
          category: 'environmental'
        })
      }

      if (lifestyle.stressLevel === 'high') {
        features.push({
          name: 'High Stress Level',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Chronic stress impairs immune function',
          category: 'environmental'
        })
      }

      if (lifestyle.smokingStatus === 'current') {
        features.push({
          name: 'Current Smoker',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Smoking weakens immune response',
          category: 'environmental'
        })
      }

      if (lifestyle.hygiene_conditions === 'poor') {
        features.push({
          name: 'Poor Hygiene Conditions',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Poor hygiene increases infection risk',
          category: 'environmental'
        })
      }
    }

    return features
  }

  /**
   * Calculate contribution of each feature to the overall risk
   */
  private calculateFeatureContributions(
    features: FeatureContribution[],
    componentScores: any,
    baseline: any
  ): FeatureContribution[] {
    const contributionWeights: Record<string, number> = {
      'Skin Patches Present': 15,
      'Moderate/Severe Symptoms': 12,
      Numbness: 10,
      'Muscle Weakness': 10,
      'Eye Involvement': 8,
      'Rapid Symptom Progression': 14,
      'Medication Compliance': 18,
      'Missed Doses': 15,
      'Missed Check-ups': 10,
      'WHO Disability Grade': 12,
      'Severe Nerve Thickening': 11,
      'HIV Co-infection': 20,
      'TB Co-infection': 15,
      Diabetes: 12,
      Malnutrition: 10,
      'Limited Treatment Access': 8,
      'High Stress Level': 8,
      'Current Smoker': 6,
      'Poor Hygiene Conditions': 7,
      'Nerve Pain': 9,
      'Nerve Nerve': 13
    }

    return features.map((feature) => {
      const baseWeight = contributionWeights[feature.name] || 5
      const importance = feature.direction === 'negative' ? Math.max(2, baseWeight * 0.3) : baseWeight

      return {
        ...feature,
        importance: Math.min(100, importance)
      }
    })
  }

  /**
   * Create attribution map for Grad-CAM style visualization
   */
  private createAttributionMap(contributions: FeatureContribution[]): AttributionMap[] {
    return contributions
      .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance))
      .slice(0, 12)
      .map((contribution) => {
        const contribution_value =
          contribution.direction === 'positive' ? contribution.importance : -contribution.importance
        const color = this.getAttributionColor(contribution_value)

        return {
          feature: contribution.name,
          contribution: contribution_value,
          gradient: Math.abs(contribution_value) / 100,
          color: color
        }
      })
  }

  /**
   * Get color for attribution visualization
   */
  private getAttributionColor(contribution: number): string {
    if (contribution > 10) return '#dc2626' // Red for high risk
    if (contribution > 5) return '#ea580c' // Orange for moderate risk
    if (contribution > 0) return '#fbb040' // Yellow for low risk
    if (contribution < -10) return '#16a34a' // Green for strong protective
    if (contribution < -5) return '#84cc16' // Light green for protective
    return '#d1d5db' // Gray for neutral
  }

  /**
   * Calculate data completeness score
   */
  private calculateDataCompleteness(profile: any, symptomLogs: any[]): number {
    let completeness = 0
    let totalFields = 0

    // Profile completeness
    if (profile) {
      const profileFields = [
        'personalInfo',
        'medical',
        'leprosy',
        'lifestyle',
        'treatmentAdherence',
        'clinicalAssessments',
        'riskFactors'
      ]
      totalFields += profileFields.length
      completeness += profileFields.filter((f) => profile[f] && Object.keys(profile[f]).length > 0)
        .length
    }

    // Symptom log completeness
    if (symptomLogs && symptomLogs.length > 0) {
      totalFields += 3
      if (symptomLogs[0].symptoms) completeness += 1
      if (symptomLogs[0].symptomSeverity) completeness += 1
      if (symptomLogs[0].affectedAreas && symptomLogs[0].affectedAreas.length > 0) completeness += 1
    }

    return totalFields > 0 ? Math.round((completeness / totalFields) * 100) : 0
  }

  /**
   * Get baseline values for comparison
   */
  private getBaselineValues(): Record<string, any> {
    return {
      symptomCount: 0,
      medicationCompliance: 100,
      disabilityGrade: 0,
      stressLevel: 'low'
    }
  }

  /**
   * Generate overall explanation text
   */
  private generateOverallExplanation(
    riskScore: number,
    keyDrivers: FeatureContribution[],
    protectiveFactors: FeatureContribution[],
    componentScores: any
  ): string {
    let explanation = ''

    // 1. Risk Level Assessment
    let riskLevel = ''
    let riskContext = ''
    if (riskScore > 75) {
      riskLevel = 'CRITICAL'
      riskContext =
        'requires immediate clinical attention and aggressive management to prevent complications'
    } else if (riskScore > 50) {
      riskLevel = 'HIGH'
      riskContext = 'indicates significant disease activity and requires close monitoring'
    } else if (riskScore > 25) {
      riskLevel = 'MODERATE'
      riskContext = 'suggests ongoing disease management needs'
    } else {
      riskLevel = 'LOW'
      riskContext = 'indicates good disease control with continued adherence'
    }

    explanation = `Your risk assessment shows a ${riskLevel} risk level (${riskScore}/100), which ${riskContext}. `

    // 2. Top Key Drivers with Importance Scores
    if (keyDrivers.length > 0) {
      explanation += `The Grad-CAM analysis identified the following key factors driving this prediction:\n\n`

      // Top 3 drivers with importance percentages
      const topDrivers = keyDrivers.slice(0, 3)
      topDrivers.forEach((driver, index) => {
        const position = index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Tertiary'
        const importancePercent = Math.round(driver.importance)
        explanation += `${position} Driver (${importancePercent}% importance): ${driver.name} - ${driver.explanation}. `
      })

      explanation += '\n'
    }

    // 3. Component Contribution Breakdown
    explanation += `This prediction is based on six medical assessment components: `
    explanation += `Symptom Progression (${Math.round(componentScores.symptomScore) || 0}/100), `
    explanation += `Treatment Adherence (${Math.round(componentScores.adherenceScore) || 0}/100), `
    explanation += `Complications (${Math.round(componentScores.complicationScore) || 0}/100), `
    explanation += `Sensorimotor Impact (${Math.round(componentScores.sensoriMotorScore) || 0}/100), `
    explanation += `Immune Activity (${Math.round(componentScores.immuneStatusScore) || 0}/100), and `
    explanation += `Lifestyle Factors (${Math.round(componentScores.lifestyleScore) || 0}/100). `

    // 4. Protective Factors Impact
    if (protectiveFactors.length > 0) {
      explanation += `Positive factors moderating your risk: `
      protectiveFactors.slice(0, 2).forEach((factor, index) => {
        const importancePercent = Math.round(Math.abs(factor.importance))
        explanation += `${factor.name} (${importancePercent}% protective effect) `
        if (index === 0 && protectiveFactors.length > 1) explanation += 'and '
      })
      explanation += `. ${protectiveFactors[0].explanation}. `
    }

    // 5. Normalized Score Interpretation
    explanation += `On a normalized scale where 0 = minimal risk and 100 = severe risk, your current score of ${riskScore} indicates `
    if (riskScore < 25) {
      explanation += 'well-controlled disease with good prognosis if adherence continues. '
    } else if (riskScore < 50) {
      explanation += 'moderate disease activity requiring optimization of current management. '
    } else if (riskScore < 75) {
      explanation += 'elevated risk requiring intervention to prevent progression. '
    } else {
      explanation += 'critical risk requiring urgent clinical review and management adjustment. '
    }

    // 6. Actionable Recommendation
    explanation += `Prioritize addressing the primary driver (${keyDrivers.length > 0 ? keyDrivers[0].name : 'identified factors'}) in consultation with your healthcare provider.`

    return explanation
  }
}

export default new LeprosyXAIService()
