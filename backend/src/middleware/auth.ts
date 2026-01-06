import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' })
  const parts = auth.split(' ')
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid Authorization header' })
  const token = parts[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    ;(req as any).userId = payload.id
    
    // Fetch user data to attach to request asynchronously
    User.findById(payload.id)
      .select('name email role')
      .then(user => {
        if (user) {
          ;(req as any).user = user
        }
      })
      .catch(err => {
        console.error('Error fetching user data in auth middleware:', err)
        // Continue without user data - endpoint will handle gracefully
      })
    
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
