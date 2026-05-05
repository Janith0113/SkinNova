import { Request, Response } from 'express'
import User from '../models/User'
import jwt from 'jsonwebtoken'
import { logActivity } from '../routes/activity'

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

export async function googleCallback(req: Request, res: Response) {
  try {
    const { googleId, email, name } = req.body

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Google ID and email are required' })
    }

    // Try to find existing user by Google ID
    let user = await User.findOne({ googleId })

    // If not found, try to find by email (user might have existing account)
    if (!user) {
      user = await User.findOne({ email })
      
      // If found, update with Google ID
      if (user) {
        user.googleId = googleId
        user.oauthProvider = 'google'
        if (!user.name) user.name = name
        user.verified = true
        await user.save()

        // Log sign in activity
        await logActivity(
          user._id.toString(),
          user.name || email,
          user.email,
          'user_login',
          'User login with Google',
          `${user.name || email} signed in with Google`
        )
      } else {
        // Create new user
        user = new User({
          googleId,
          email,
          name,
          role: 'patient',
          profile: {},
          verified: true,
          oauthProvider: 'google'
        })
        await user.save()

        // Log user registration activity
        await logActivity(
          user._id.toString(),
          user.name || email,
          user.email,
          'user_registration',
          'New user registration via Google',
          `${user.name || email} registered with Google OAuth`
        )
      }
    } else {
      // Log sign in activity for existing Google user
      await logActivity(
        user._id.toString(),
        user.name || email,
        user.email,
        'user_login',
        'User login with Google',
        `${user.name || email} signed in with Google`
      )
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        verified: user.verified
      },
      token
    })
  } catch (err) {
    console.error('Google OAuth error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

export async function verifyGoogleToken(req: Request, res: Response) {
  try {
    const { token: idToken } = req.body

    if (!idToken) {
      return res.status(400).json({ error: 'Token is required' })
    }

    // Verify token with Google's endpoint
    const response = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + idToken)
    const data = await response.json()

    if (!response.ok || data.error) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Extract user info from token
    const { sub: googleId, email, name } = data

    // Call googleCallback logic
    let user = await User.findOne({ googleId })

    if (!user) {
      user = await User.findOne({ email })

      if (user) {
        user.googleId = googleId
        user.oauthProvider = 'google'
        if (!user.name) user.name = name
        user.verified = true
        await user.save()

        await logActivity(
          user._id.toString(),
          user.name || email,
          user.email,
          'user_login',
          'User login with Google',
          `${user.name || email} signed in with Google`
        )
      } else {
        user = new User({
          googleId,
          email,
          name,
          role: 'patient',
          profile: {},
          verified: true,
          oauthProvider: 'google'
        })
        await user.save()

        await logActivity(
          user._id.toString(),
          user.name || email,
          user.email,
          'user_registration',
          'New user registration via Google',
          `${user.name || email} registered with Google OAuth`
        )
      }
    } else {
      await logActivity(
        user._id.toString(),
        user.name || email,
        user.email,
        'user_login',
        'User login with Google',
        `${user.name || email} signed in with Google`
      )
    }

    const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        verified: user.verified
      },
      token: jwtToken
    })
  } catch (err) {
    console.error('Token verification error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
