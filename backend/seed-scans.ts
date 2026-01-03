import mongoose from 'mongoose'
import Report from './src/models/Report'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.MONGODB_URI || 'mongodb+srv://Skin123:Skin123%23@cluster0.ycpp8kz.mongodb.net/?appName=Cluster0'

// Sample data for different diseases
const sampleScans = [
  // Psoriasis scans
  {
    patientId: 'test-patient-1',
    patientName: 'John Doe',
    patientEmail: 'john@example.com',
    reportName: 'Psoriasis Scan - Elbows',
    reportType: 'Skin Analysis',
    diseaseType: 'psoriasis',
    skinCondition: 'Psoriasis',
    confidence: 0.92,
    scanArea: 'Elbows',
    scanStatus: 'Stable',
    description: 'Plaque psoriasis pattern detected on elbows',
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    patientId: 'test-patient-1',
    patientName: 'John Doe',
    patientEmail: 'john@example.com',
    reportName: 'Psoriasis Scan - Knees',
    reportType: 'Skin Analysis',
    diseaseType: 'psoriasis',
    skinCondition: 'Psoriasis',
    confidence: 0.78,
    scanArea: 'Knees',
    scanStatus: 'Improving',
    description: 'Mild scaling detected on knees',
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    patientId: 'test-patient-1',
    patientName: 'John Doe',
    patientEmail: 'john@example.com',
    reportName: 'Psoriasis Scan - Scalp',
    reportType: 'Skin Analysis',
    diseaseType: 'psoriasis',
    skinCondition: 'Psoriasis',
    confidence: 0.65,
    scanArea: 'Scalp line',
    scanStatus: 'Monitor',
    description: 'Psoriasis vs dandruff - monitoring required',
    uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  },
  // Tinea scans
  {
    patientId: 'test-patient-1',
    patientName: 'John Doe',
    patientEmail: 'john@example.com',
    reportName: 'Tinea Scan - Neck',
    reportType: 'Skin Analysis',
    diseaseType: 'tinea',
    skinCondition: 'Tinea',
    confidence: 0.85,
    scanArea: 'Neck',
    scanStatus: 'Improving',
    description: 'Ring-like patch improving with treatment',
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    patientId: 'test-patient-1',
    patientName: 'John Doe',
    patientEmail: 'john@example.com',
    reportName: 'Tinea Scan - Chest',
    reportType: 'Skin Analysis',
    diseaseType: 'tinea',
    skinCondition: 'Tinea',
    confidence: 0.72,
    scanArea: 'Chest',
    scanStatus: 'Stable',
    description: 'Mild fungal pattern on chest',
    uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
  },
  // Leprosy scans
  {
    patientId: 'test-patient-1',
    patientName: 'John Doe',
    patientEmail: 'john@example.com',
    reportName: 'Leprosy Scan - Forearm',
    reportType: 'Skin Analysis',
    diseaseType: 'leprosy',
    skinCondition: 'Leprosy',
    confidence: 0.88,
    scanArea: 'Forearm patch',
    scanStatus: 'Under treatment',
    description: 'Reduced sensation area under treatment',
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  // Skin Cancer scans
  {
    patientId: 'test-patient-1',
    patientName: 'John Doe',
    patientEmail: 'john@example.com',
    reportName: 'Skin Cancer Scan - Back',
    reportType: 'Skin Analysis',
    diseaseType: 'skinCancer',
    skinCondition: 'Melanoma Risk',
    confidence: 0.76,
    scanArea: 'Upper back mole',
    scanStatus: 'Needs review',
    description: 'Asymmetry and color change detected',
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
]

async function seedScans() {
  try {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')

    // Clear existing scan data (optional - comment out to keep existing data)
    // await Report.deleteMany({ diseaseType: { $exists: true, $ne: null } })

    // Insert sample scans
    const result = await Report.insertMany(sampleScans)
    console.log(`✅ Seeded ${result.length} sample scans`)

    // Show what was added
    const psoriasisScans = await Report.find({ diseaseType: 'psoriasis' })
    const tineaScans = await Report.find({ diseaseType: 'tinea' })
    const leprosyScans = await Report.find({ diseaseType: 'leprosy' })
    const skinCancerScans = await Report.find({ diseaseType: 'skinCancer' })

    console.log('\n📊 Sample Data Summary:')
    console.log(`- Psoriasis: ${psoriasisScans.length} scans`)
    console.log(`- Tinea: ${tineaScans.length} scans`)
    console.log(`- Leprosy: ${leprosyScans.length} scans`)
    console.log(`- Skin Cancer: ${skinCancerScans.length} scans`)

    console.log('\n✨ Database seeding complete!')
  } catch (err) {
    console.error('Error seeding database:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

seedScans()
