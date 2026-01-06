import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import path from 'path'
import { connectDb } from './db'
import authRoutes from './routes/auth'
import adminRoutes from './routes/admin'
import activityRoutes from './routes/activity'
import appointmentRoutes from './routes/appointments'
import doctorRoutes from './routes/doctors'
import availabilityRoutes from './routes/availability'
import reportRoutes from './routes/reports'
import reportAccessRoutes from './routes/reportAccess'
import bannerRoutes from './routes/banner'
import chatRoutes from './routes/chat'
import newDetectionRoutes from './routes/newDetection'
import detectionRoutes from './routes/detection'
import profileRoutes from './routes/profile'
import leprosyRoutes from './routes/leprosy'
import { testEmailConnection } from './services/mailService'

const app = express()
const port = process.env.PORT || 4000

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' })
})

// Temporary endpoint to clear all chats (for testing only)
app.post('/api/admin/clear-chats', async (req, res) => {
  try {
    const Chat = require('./models/Chat').default
    const result = await Chat.deleteMany({})
    res.json({ success: true, deletedCount: result.deletedCount, message: `Deleted ${result.deletedCount} chats` })
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear chats' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/availability', availabilityRoutes)
app.use('/api', activityRoutes)
app.use('/api', appointmentRoutes)
app.use('/api', reportRoutes)
app.use('/api', reportAccessRoutes)
app.use('/api/banners', bannerRoutes)
app.use('/api', chatRoutes)
app.use('/api/detect', detectionRoutes)
app.use('/api/analysis', newDetectionRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/leprosy', leprosyRoutes)
app.use('/api/new-detection', newDetectionRoutes)

async function start() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://Skin123:Skin123%23@cluster0.ycpp8kz.mongodb.net/?appName=Cluster0'
  await connectDb(uri)
  
  // Skip email connection test - configure in .env if needed
  console.log('Email service: Skipped (configure GMAIL_USER and GMAIL_APP_PASSWORD in .env to enable)')
  
  // Fix existing availability slots - set isActive to true
  try {
    const DoctorAvailability = (await import('./models/DoctorAvailability')).default
    const result = await DoctorAvailability.updateMany(
      { isActive: false },
      { isActive: true }
    )
    if (result.modifiedCount > 0) {
      console.log(`Fixed ${result.modifiedCount} availability slots - set isActive to true`)
    }
  } catch (err) {
    console.error('Error fixing availability slots:', err)
  }
  
  // Ensure admin account exists (admin cannot sign up)
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@skinova.local'
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!'
    const User = (await import('./models/User')).default
    const existing = await User.findOne({ email: adminEmail })
    if (!existing) {
      const bcrypt = await import('bcryptjs')
      const hashed = await bcrypt.hash(adminPassword, 10)
      await User.create({ name: 'Admin', email: adminEmail, password: hashed, role: 'admin', profile: {} })
      console.log('Default admin user created:', adminEmail)
    } else {
      // ensure role is admin
      if (existing.role !== 'admin') {
        existing.role = 'admin'
        await existing.save()
      }
    }
  } catch (err) {
    console.error('Error ensuring admin user:', err)
  }
  
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`)
  })
}

start().catch(err => {
  console.error('Failed to start server', err)
  process.exit(1)
})

