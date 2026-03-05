import mongoose from 'mongoose'
import dotenv from 'dotenv'
import LeprosyUserProfile from './src/models/LeprosyUserProfile'
import SymptomLog from './src/models/SymptomLog'

dotenv.config()

// Sample patient data based on the provided dataset
const samplePatients = [
  {
    userId: 'patient_001',
    personalInfo: {
      age: 35,
      gender: 'male',
      weight: 68,
      height: 172
    },
    medical: {
      leprosyType: 'borderline',
      treatmentDuration: 6,
      treatmentStatus: 'ongoing',
      currentMedications: ['Rifampicin', 'Dapsone', 'Clofazimine'],
      allergies: [],
      comorbidities: []
    },
    leprosy: {
      affectedAreas: ['left arm', 'legs'],
      nerveInvolvement: true,
      eyeInvolvement: false,
      disabilities: ['weakness in left hand'],
      treatmentResponse: 'good'
    },
    treatmentAdherence: {
      medicationCompliancePercent: 90,
      missedDosesLastMonth: 1,
      missedAppointmentsLastMonth: 0,
      treatmentInterruptions: []
    },
    clinicalAssessments: {
      whoDisabilityGrade: 1,
      nerveThickenings: [
        { location: 'left ulnar', severity: 'moderate' },
        { location: 'left median', severity: 'mild' }
      ],
      eyeStatus: 'normal'
    },
    riskFactors: {
      hivStatus: 'negative',
      tbCoinfection: false,
      diabetes: false,
      malnutrition: false
    },
    lifestyle: {
      occupation: 'farmer',
      physicalActivity: 'moderate',
      dietQuality: 'moderate',
      sleepHours: 7,
      smokingStatus: 'never',
      stressLevel: 'moderate',
      treatmentAccess: 'good',
      hygiene_conditions: 'moderate'
    },
    goals: ['Complete MDT treatment', 'Regain hand strength', 'Prevent disability'],
    notes: 'Diagnosed 6 months ago, responding well to treatment'
  },
  {
    userId: 'patient_002',
    personalInfo: {
      age: 42,
      gender: 'female',
      weight: 58,
      height: 160
    },
    medical: {
      leprosyType: 'tuberculoid',
      treatmentDuration: 4,
      treatmentStatus: 'ongoing',
      currentMedications: ['Rifampicin', 'Dapsone'],
      allergies: ['Penicillin'],
      comorbidities: []
    },
    leprosy: {
      affectedAreas: ['right leg'],
      nerveInvolvement: false,
      eyeInvolvement: false,
      disabilities: [],
      treatmentResponse: 'excellent'
    },
    treatmentAdherence: {
      medicationCompliancePercent: 95,
      missedDosesLastMonth: 0,
      missedAppointmentsLastMonth: 0,
      treatmentInterruptions: []
    },
    clinicalAssessments: {
      whoDisabilityGrade: 0,
      nerveThickenings: [],
      eyeStatus: 'normal'
    },
    riskFactors: {
      hivStatus: 'negative',
      tbCoinfection: false,
      diabetes: false,
      malnutrition: false
    },
    lifestyle: {
      occupation: 'teacher',
      physicalActivity: 'light',
      dietQuality: 'good',
      sleepHours: 8,
      smokingStatus: 'never',
      stressLevel: 'low',
      treatmentAccess: 'good',
      hygiene_conditions: 'good'
    },
    goals: ['Cure leprosy', 'Maintain health'],
    notes: 'Excellent prognosis, early diagnosis helped'
  },
  {
    userId: 'patient_003',
    personalInfo: {
      age: 55,
      gender: 'male',
      weight: 72,
      height: 175
    },
    medical: {
      leprosyType: 'lepromatous',
      treatmentDuration: 12,
      treatmentStatus: 'ongoing',
      currentMedications: ['Rifampicin', 'Dapsone', 'Clofazimine', 'Prednisolone'],
      allergies: [],
      comorbidities: ['diabetes']
    },
    leprosy: {
      affectedAreas: ['face', 'both arms', 'both legs'],
      nerveInvolvement: true,
      eyeInvolvement: true,
      disabilities: ['eye damage', 'foot numbness'],
      treatmentResponse: 'moderate'
    },
    treatmentAdherence: {
      medicationCompliancePercent: 75,
      missedDosesLastMonth: 3,
      missedAppointmentsLastMonth: 1,
      treatmentInterruptions: [
        { date: new Date('2024-01-15'), durationDays: 5, reason: 'work commitment' }
      ]
    },
    clinicalAssessments: {
      whoDisabilityGrade: 2,
      nerveThickenings: [
        { location: 'bilateral great auricular', severity: 'severe' },
        { location: 'bilateral ulnar', severity: 'severe' }
      ],
      eyeStatus: 'severe'
    },
    riskFactors: {
      hivStatus: 'negative',
      tbCoinfection: false,
      diabetes: true,
      malnutrition: false
    },
    lifestyle: {
      occupation: 'laborer',
      physicalActivity: 'light',
      dietQuality: 'poor',
      sleepHours: 6,
      smokingStatus: 'current',
      stressLevel: 'high',
      treatmentAccess: 'limited',
      hygiene_conditions: 'poor'
    },
    goals: ['Control complications', 'Improve vision', 'Stop disease progression'],
    notes: 'Complex case with multiple complications, requires careful management'
  },
  {
    userId: 'patient_004',
    personalInfo: {
      age: 28,
      gender: 'female',
      weight: 62,
      height: 165
    },
    medical: {
      leprosyType: 'borderline',
      treatmentDuration: 3,
      treatmentStatus: 'ongoing',
      currentMedications: ['Rifampicin', 'Dapsone', 'Clofazimine'],
      allergies: [],
      comorbidities: []
    },
    leprosy: {
      affectedAreas: ['chest', 'arms'],
      nerveInvolvement: true,
      eyeInvolvement: false,
      disabilities: [],
      treatmentResponse: 'good'
    },
    treatmentAdherence: {
      medicationCompliancePercent: 85,
      missedDosesLastMonth: 2,
      missedAppointmentsLastMonth: 0,
      treatmentInterruptions: []
    },
    clinicalAssessments: {
      whoDisabilityGrade: 0,
      nerveThickenings: [{ location: 'left ulnar', severity: 'mild' }],
      eyeStatus: 'normal'
    },
    riskFactors: {
      hivStatus: 'negative',
      tbCoinfection: false,
      diabetes: false,
      malnutrition: false
    },
    lifestyle: {
      occupation: 'student',
      physicalActivity: 'moderate',
      dietQuality: 'moderate',
      sleepHours: 7,
      smokingStatus: 'never',
      stressLevel: 'high',
      treatmentAccess: 'good',
      hygiene_conditions: 'good'
    },
    goals: ['Complete treatment', 'Return to normal activities'],
    notes: 'Young patient, good recovery potential'
  },
  {
    userId: 'patient_005',
    personalInfo: {
      age: 50,
      gender: 'male',
      weight: 65,
      height: 168
    },
    medical: {
      leprosyType: 'tuberculoid',
      treatmentDuration: 2,
      treatmentStatus: 'ongoing',
      currentMedications: ['Rifampicin', 'Dapsone'],
      allergies: [],
      comorbidities: ['TB']
    },
    leprosy: {
      affectedAreas: ['left foot'],
      nerveInvolvement: false,
      eyeInvolvement: false,
      disabilities: [],
      treatmentResponse: 'good'
    },
    treatmentAdherence: {
      medicationCompliancePercent: 80,
      missedDosesLastMonth: 2,
      missedAppointmentsLastMonth: 0,
      treatmentInterruptions: []
    },
    clinicalAssessments: {
      whoDisabilityGrade: 0,
      nerveThickenings: [],
      eyeStatus: 'normal'
    },
    riskFactors: {
      hivStatus: 'negative',
      tbCoinfection: true,
      diabetes: false,
      malnutrition: true
    },
    lifestyle: {
      occupation: 'shopkeeper',
      physicalActivity: 'light',
      dietQuality: 'poor',
      sleepHours: 6,
      smokingStatus: 'current',
      stressLevel: 'moderate',
      treatmentAccess: 'limited',
      hygiene_conditions: 'moderate'
    },
    goals: ['Complete both TB and leprosy treatment'],
    notes: 'Co-infected with TB, nutrition support needed'
  }
]

// Sample symptom logs
const generateSymptomLogs = () => {
  const logs: any[] = []
  const now = new Date()

  samplePatients.forEach(patient => {
    // Create multiple symptom logs per patient
    for (let i = 0; i < 5; i++) {
      const daysAgo = i * 14 // 2 weeks apart
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

      const symptomsData = {
        userId: patient.userId,
        symptoms: {
          skinPatches: true,
          numbness: patient.leprosy.nerveInvolvement && i < 3,
          weakness: patient.leprosy.nerveInvolvement && i < 2,
          eyeIssues: patient.leprosy.eyeInvolvement,
          painfulNerves: patient.leprosy.nerveInvolvement && i === 0,
          other: ''
        },
        symptomSeverity: {
          skinPatches: i === 0 ? 'moderate' : i === 1 ? 'mild' : 'mild',
          numbness: patient.leprosy.nerveInvolvement && i < 3 ? 'mild' : 'mild',
          weakness: patient.leprosy.nerveInvolvement && i < 2 ? 'mild' : 'mild',
          eyeIssues: patient.leprosy.eyeInvolvement ? 'mild' : 'mild',
          painfulNerves: patient.leprosy.nerveInvolvement && i === 0 ? 'moderate' : 'mild'
        },
        affectedAreas: patient.leprosy.affectedAreas,
        spreadingRate: i === 0 ? 'slow' : 'static',
        notes: i === 0 ? 'Recent symptoms, under treatment' : 'Symptom improving with treatment',
        timestamp: date
      }

      logs.push(symptomsData)
    }
  })

  return logs
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skinnova'
    await mongoose.connect(mongoUri)
    console.log('✓ Connected to MongoDB')

    // Clear existing data
    await LeprosyUserProfile.deleteMany({})
    await SymptomLog.deleteMany({})
    console.log('✓ Cleared existing data')

    // Insert user profiles
    const insertedProfiles = await LeprosyUserProfile.insertMany(samplePatients)
    console.log(`✓ Inserted ${insertedProfiles.length} patient profiles`)

    // Insert symptom logs
    const symptomLogs = generateSymptomLogs()
    const insertedLogs = await SymptomLog.insertMany(symptomLogs)
    console.log(`✓ Inserted ${insertedLogs.length} symptom logs`)

    console.log('\n✅ Database seeding completed successfully!')
    console.log('\nSample patient IDs for testing:')
    samplePatients.forEach(p => {
      console.log(`  - ${p.userId}`)
    })
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\n✓ Database connection closed')
  }
}

seedDatabase()
