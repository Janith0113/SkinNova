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
import profileRoutes from './routes/profile'
import { testEmailConnection } from './services/mailService'

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/availability', availabilityRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api', activityRoutes)
app.use('/api', appointmentRoutes)
app.use('/api', reportRoutes)
app.use('/api', reportAccessRoutes)

async function start() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://Skin123:Skin123%23@cluster0.ycpp8kz.mongodb.net/?appName=Cluster0'
  await connectDb(uri)
  
  // Test email connection
  await testEmailConnection()
  
  // Ensure admin account exists (admin cannot sign up)
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@skinnova.local'
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

