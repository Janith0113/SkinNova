import { Router } from 'express'
import { signup, login, me, forgotPassword, resetPassword } from '../controllers/authController'
import { requireAuth } from '../middleware/auth'
import User from '../models/User'
import bcrypt from 'bcryptjs'

const router = Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', requireAuth, me)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// Test user creation endpoint
router.post('/create-test-user', async (req, res) => {
  try {
    const email = 'sunil@gmail.com'
    const password = 'Test@123'
    
    // Check if user already exists
    const existing = await User.findOne({ email })
    if (existing) {
      return res.json({ message: 'Test user already exists', email, password })
    }
    
    // Create test user
    const hashed = await bcrypt.hash(password, 10)
    const user = new User({
      name: 'Sunil Sharma',
      email: email,
      password: hashed,
      role: 'patient',
      verified: true,
      profile: {
        age: 35,
        gender: 'Male',
        location: 'Mumbai',
        phoneNumber: '+91-9876543210'
      }
    })
    
    await user.save()
    return res.json({ message: 'Test user created successfully', email, password })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

export default router
