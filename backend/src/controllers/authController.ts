import { Request, Response } from 'express'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendPasswordResetEmail } from '../services/mailService'
import crypto from 'crypto'
import { logActivity } from '../routes/activity'

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    
    // Normalize role to lowercase
    const normalizedRole = role ? role.toLowerCase() : 'patient'
    
    // prevent creating admin via signup
    if (normalizedRole === 'admin') return res.status(403).json({ error: 'Cannot create admin via signup' })

    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'Email already in use' })

    const hashed = await bcrypt.hash(password, 10)
    const user = new User({ name, email, password: hashed, role: normalizedRole, profile: {} })
    await user.save()

    // Log user registration activity
    await logActivity(
      user._id.toString(),
      user.name || email,
      user.email,
      'user_registration',
      'New user registration',
      `${user.name || email} registered as ${user.role}`
    )

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, profile: user.profile, verified: user.verified }, token })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, profile: user.profile, verified: user.verified }, token })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

export async function me(req: Request, res: Response) {
  // `req` should have `userId` set by the auth middleware
  const anyReq = req as any
  if (!anyReq.userId) return res.status(401).json({ error: 'Unauthorized' })
  const user = await User.findById(anyReq.userId).select('-password')
  if (!user) return res.status(404).json({ error: 'User not found' })
  return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, profile: user.profile, verified: user.verified } })
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })

    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If email exists, reset link sent' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    
    // Store hashed token and expiry (1 hour)
    user.resetToken = hashedToken
    user.resetTokenExpires = new Date(Date.now() + 3600000)
    await user.save()

    // Log password reset request activity
    await logActivity(
      user._id.toString(),
      user.name || email,
      user.email,
      'password_reset_requested',
      'Password reset requested',
      'User requested a password reset'
    )

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
    const emailSent = await sendPasswordResetEmail(email, resetToken, resetUrl)

    if (!emailSent) return res.status(500).json({ error: 'Failed to send email' })
    return res.json({ message: 'Password reset link sent to email' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body
    if (!token || !password) return res.status(400).json({ error: 'Token and password required' })

    // Hash token to match stored value
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with valid token
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpires: { $gt: new Date() }
    })

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' })

    // Hash new password
    const hashed = await bcrypt.hash(password, 10)
    user.password = hashed
    user.resetToken = undefined
    user.resetTokenExpires = undefined
    await user.save()

    return res.json({ message: 'Password reset successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
