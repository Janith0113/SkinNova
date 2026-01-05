import mongoose from 'mongoose'
import User from './src/models/User'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.MONGODB_URI || 'mongodb+srv://Skin123:Skin123%23@cluster0.ycpp8kz.mongodb.net/?appName=Cluster0'

const seedUsers = [
  {
    name: 'Visal Patient',
    email: 'visal@gmail.com',
    password: 'Password123!',
    role: 'patient'
  },
  {
    name: 'Test Doctor',
    email: 'doctor@example.com',
    password: 'Password123!',
    role: 'doctor'
  },
  {
    name: 'Admin User',
    email: 'admin@skinova.local',
    password: 'Admin123!',
    role: 'admin'
  }
]

async function seedDatabase() {
  try {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')

    // Clear existing users (optional - comment out to keep existing)
    // await User.deleteMany({})
    // console.log('Cleared existing users')

    for (const userData of seedUsers) {
      const existing = await User.findOne({ email: userData.email })
      if (!existing) {
        const hashed = await bcrypt.hash(userData.password, 10)
        await User.create({
          ...userData,
          password: hashed,
          profile: {},
          verified: true
        })
        console.log(`Created user: ${userData.email} (password: ${userData.password})`)
      } else {
        console.log(`User already exists: ${userData.email}`)
      }
    }

    console.log('Database seeding complete!')
    await mongoose.connection.close()
  } catch (err) {
    console.error('Error seeding database:', err)
    process.exit(1)
  }
}

seedDatabase()
