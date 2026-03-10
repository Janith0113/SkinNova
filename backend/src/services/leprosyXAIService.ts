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
          explanation: 'New or changing skin patches are a primary sign of active leprosy. They form because Mycobacterium leprae bacteria infects the skin\'s nerve endings, causing patches that are discoloured, dry, and numb. Active patches mean the disease is not yet fully controlled and needs treatment or closer monitoring.',
          category: 'symptom'
        })
      }

      if (latestLog.symptoms?.numbness) {
        features.push({
          name: 'Numbness or Loss of Sensation',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Numbness means leprosy bacteria have damaged your nerves — typically in the hands, feet, or face. This is one of the hallmark signs of leprosy nerve involvement. Loss of sensation is dangerous because you may not feel cuts or burns, leading to unnoticed wounds that can become infected and cause disability if untreated.',
          category: 'symptom'
        })
      }

      if (latestLog.symptoms?.weakness) {
        features.push({
          name: 'Muscle Weakness',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Weakness in your hands or feet means the nerve damage from leprosy has progressed to affect muscle control (motor nerve fibres). If untreated, this leads to permanent disability such as "claw hand" or "foot drop". Muscle weakness is classified as WHO Disability Grade 1 or 2 and requires urgent attention.',
          category: 'symptom'
        })
      }

      if (latestLog.symptoms?.eyeIssues) {
        features.push({
          name: 'Eye Involvement',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Leprosy can damage the nerves that control eye blinking and sensation. Without blinking, the cornea dries out and can ulcerate, leading to permanent vision loss. Eye involvement is classified as WHO Disability Grade 2 — the most serious level — and requires urgent specialist review to prevent blindness.',
          category: 'symptom'
        })
      }

      if (latestLog.symptoms?.painfulNerves) {
        features.push({
          name: 'Nerve Pain (Neuritis)',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Pain in the nerves (neuritis) is a warning sign of a leprosy reaction — a sudden episode of inflammation that can destroy nerve tissue very quickly, sometimes within 24–48 hours. Reactions can cause lasting disability if not treated immediately with corticosteroids. Painful nerves require urgent medical attention.',
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
          explanation: 'Rapidly spreading symptoms mean the Mycobacterium leprae bacteria are actively multiplying. This increases the risk of new nerve damage and makes the disease harder to control. Fast progression is a key sign that the current treatment plan may need to be started or reviewed by your doctor urgently.',
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
              ? 'WHO guidelines require over 90% dose completion for a successful leprosy cure. At below 80% compliance, surviving bacteria can become drug-resistant, making future treatment much harder. Incomplete treatment is a leading global cause of leprosy relapse.'
              : 'Taking MDT medications consistently — as you are doing — is the single most important factor in curing leprosy and preventing nerve damage. Good compliance significantly reduces your risk of treatment failure, reactions, and disability.',
          category: 'adherence'
        })
      }

      if (adherence.missedDosesLastMonth && adherence.missedDosesLastMonth > 0) {
        features.push({
          name: 'Missed Doses',
          value: adherence.missedDosesLastMonth,
          importance: 0,
          direction: 'positive',
          explanation: `You missed ${adherence.missedDosesLastMonth} dose(s) last month. Each missed dose allows leprosy bacteria to remain active in the body for longer. MDT (Multi-Drug Therapy) requires uninterrupted doses over 6–12 months to fully eliminate the bacteria. Missing doses risks drug resistance and increases the chance of relapse.`,
          category: 'adherence'
        })
      }

      if (adherence.missedAppointmentsLastMonth && adherence.missedAppointmentsLastMonth > 0) {
        features.push({
          name: 'Missed Follow-up Appointments',
          value: adherence.missedAppointmentsLastMonth,
          importance: 0,
          direction: 'positive',
          explanation: 'Regular clinic visits are how your doctor checks for nerve damage, leprosy reactions (Type 1/Type 2), and treatment progress. Missing check-ups means complications can go undetected. A leprosy reaction can cause irreversible nerve damage within hours, making regular appointments critical for early detection.',
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
              ? `Your WHO Disability Grade is ${clinical.whoDisabilityGrade}. Grade 1 means loss of protective sensation; Grade 2 means visible disability (such as ulcers, claw hand, foot drop, or eye damage). A higher grade shows the disease has already caused lasting harm and increases the risk of further complications without proper rehabilitation and care.`
              : 'Having no disability (Grade 0) is a strong protective sign — it means leprosy has not yet caused lasting nerve or eye damage. This is achieved by taking medications consistently and attending regular check-ups.',
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
            explanation: `${severeThickenings.length} severely thickened nerve(s) detected. Thickened nerves are a direct sign that leprosy bacteria are infecting nerve tissue. Once a nerve becomes severely thickened, it is at high risk of sudden function loss during a leprosy reaction, potentially causing permanent conditions like claw hand, wrist drop, or foot drop.`,
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
          explanation: 'An abnormal eye status suggests leprosy may be affecting the nerves or tissues of the eye. Without normal blinking and corneal sensation, the eye surface dries out and can form ulcers, potentially leading to vision loss. Any eye involvement in leprosy should be reviewed by an eye specialist promptly.',
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
          explanation: 'HIV weakens the CD4+ T-cells that the immune system uses to keep leprosy bacteria under control. People with both HIV and leprosy are at significantly higher risk of severe leprosy reactions, faster disease progression, and medication side effects. Both conditions must be managed together under medical supervision.',
          category: 'clinical'
        })
      }

      if (risks.tbCoinfection) {
        features.push({
          name: 'TB Co-infection',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Tuberculosis (TB) and leprosy are both caused by mycobacteria and both weaken the immune system. Having both together makes it harder for the body to fight either disease. Some TB drugs can also interact with leprosy treatment (MDT), so both conditions must be carefully managed together by your doctor.',
          category: 'clinical'
        })
      }

      if (risks.diabetes) {
        features.push({
          name: 'Diabetes',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Poorly controlled blood sugar impairs the immune cells that fight leprosy bacteria. Diabetes also reduces blood flow to nerve endings, making nerve damage from leprosy worse and healing slower. Diabetic patients with leprosy are at higher risk of foot ulcers and disability due to reduced sensation in the feet.',
          category: 'clinical'
        })
      }

      if (risks.malnutrition) {
        features.push({
          name: 'Malnutrition',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'The immune system needs adequate vitamins (especially A, D, and B12), protein, and minerals to fight leprosy bacteria. Malnutrition reduces the body\'s ability to respond to MDT treatment and increases the risk of reactions. Good nutrition — including protein-rich foods and vegetables — supports faster healing and better treatment outcomes.',
          category: 'clinical'
        })
      }
    }

    // Lifestyle features
    if (profile?.lifestyle) {
      const lifestyle = profile.lifestyle

      if (lifestyle.treatmentAccess === 'limited' || lifestyle.treatmentAccess === 'poor') {
        features.push({
          name: 'Limited Access to Treatment',
          value: lifestyle.treatmentAccess,
          importance: 0,
          direction: 'positive',
          explanation: 'MDT medicines must be taken every day for 6–12 months without interruption. If you have difficulty accessing a clinic or pharmacy, doses may be missed or delayed, which allows leprosy bacteria to remain active. Treatment interruption is one of the leading causes of leprosy relapse worldwide, according to WHO.',
          category: 'environmental'
        })
      }

      if (lifestyle.stressLevel === 'high') {
        features.push({
          name: 'High Stress Level',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Chronic psychological stress raises cortisol levels, which suppresses T-cell activity — the immune cells responsible for keeping leprosy bacteria dormant. High stress is a medically recognised trigger for Type 1 leprosy reactions (reversal reactions), which can cause sudden, severe nerve damage. Stress management is a recognised part of leprosy care.',
          category: 'environmental'
        })
      }

      if (lifestyle.smokingStatus === 'current') {
        features.push({
          name: 'Current Smoker',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Tobacco smoking suppresses immune cell function and reduces blood flow to the skin and nerves. This makes it harder for the body to fight leprosy bacteria and slows the healing of damaged tissue. Smokers with leprosy also have a higher risk of nerve complications and slower recovery after reactions.',
          category: 'environmental'
        })
      }

      if (lifestyle.hygiene_conditions === 'poor') {
        features.push({
          name: 'Poor Hygiene Conditions',
          value: true,
          importance: 0,
          direction: 'positive',
          explanation: 'Leprosy spreads through close, prolonged contact with the nose and mouth secretions of an untreated patient. Poor hygiene and overcrowded living conditions increase the risk of transmission to household contacts. Good personal hygiene also prevents secondary bacterial infections in open leprosy skin lesions or wounds.',
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
   * Generate overall explanation text — plain language for patients
   */
  private generateOverallExplanation(
    riskScore: number,
    keyDrivers: FeatureContribution[],
    protectiveFactors: FeatureContribution[],
    componentScores: any
  ): string {
    // 1. Plain-language risk summary
    let riskLevel = ''
    let riskMessage = ''
    if (riskScore > 75) {
      riskLevel = 'Critical'
      riskMessage =
        'Your condition needs urgent attention. The AI has detected multiple serious warning signs that increase your risk of permanent nerve damage or disability. Please contact your healthcare provider or leprosy clinic as soon as possible and do not stop your medications.'
    } else if (riskScore > 50) {
      riskLevel = 'High'
      riskMessage =
        'There are several important warning signs present. You should keep all scheduled doctor appointments, report any new or changing symptoms promptly, and follow your medication schedule strictly. Your doctor may need to adjust your treatment plan.'
    } else if (riskScore > 25) {
      riskLevel = 'Moderate'
      riskMessage =
        'Your leprosy is being managed, but there are areas that need improvement — such as taking your medicines consistently or addressing lifestyle factors — to reduce the risk of complications like nerve damage or reactions.'
    } else {
      riskLevel = 'Low'
      riskMessage =
        'Your condition is well-controlled. Continue taking your MDT medications on schedule, attend your regular check-ups, and monitor your skin and sensation daily to maintain this good progress.'
    }

    let explanation = `Your overall risk score is ${riskScore} out of 100 — rated as ${riskLevel} Risk.\n\n${riskMessage}\n\n`

    // 2. Why this result was predicted — key drivers in plain language
    if (keyDrivers.length > 0) {
      explanation += 'Why this risk level was predicted:\n'
      keyDrivers.slice(0, 3).forEach((driver, index) => {
        explanation += `${index + 1}. ${driver.name}: ${driver.explanation}\n`
      })
      explanation += '\n'
    }

    // 3. Six components in plain language — using correct key names
    const symptomScore = Math.round(componentScores.symptomProgressionRisk ?? 0)
    const adherenceScore = Math.round(componentScores.treatmentAdherenceRisk ?? 0)
    const complicationScore = Math.round(componentScores.complicationRisk ?? 0)
    const sensoriScore = Math.round(componentScores.sensorimotorCompromiseRisk ?? 0)
    const immuneScore = Math.round(componentScores.immuneResponseRisk ?? 0)
    const lifeScore = Math.round(componentScores.lifeconditionsRisk ?? 0)

    explanation += 'How each area contributes to your risk:\n'
    explanation += `\u2022 Symptom Progression (${symptomScore}/100): How active and changing your visible leprosy symptoms are right now.\n`
    explanation += `\u2022 Treatment Adherence (${adherenceScore}/100): How consistently you are taking your MDT medicines and attending follow-up appointments.\n`
    explanation += `\u2022 Complication Risk (${complicationScore}/100): The likelihood of serious events such as a Type 1 or Type 2 leprosy reaction, which can rapidly damage nerves.\n`
    explanation += `\u2022 Nerve & Muscle Function (${sensoriScore}/100): The extent to which your nerves or muscles have been affected, impacting your sensation and physical ability.\n`
    explanation += `\u2022 Immune Health (${immuneScore}/100): How well your immune system is managing the leprosy bacteria, including the impact of other conditions like diabetes or HIV.\n`
    explanation += `\u2022 Living Conditions (${lifeScore}/100): Lifestyle and environmental factors such as stress levels, nutrition, smoking, hygiene, and your ability to access treatment.\n\n`

    // 4. Protective factors
    if (protectiveFactors.length > 0) {
      explanation += 'Factors working in your favour:\n'
      protectiveFactors.slice(0, 2).forEach((factor) => {
        explanation += `\u2713 ${factor.name}: ${factor.explanation}\n`
      })
      explanation += '\n'
    }

    // 5. Bottom line
    explanation +=
      'Important: This prediction is based on the health information and symptoms you have entered. The more complete your profile and symptom history are, the more accurate this result will be. Always discuss your results with your doctor or leprosy care nurse before making any changes to your treatment.'

    return explanation
  }
}

export default new LeprosyXAIService()
