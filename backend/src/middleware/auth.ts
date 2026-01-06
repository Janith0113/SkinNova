import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  
  if (!auth) {
    console.error('[Auth Middleware] Missing Authorization header');
    return res.status(401).json({ error: 'Missing Authorization header' })
  }
  
  const parts = auth.split(' ')
  if (parts.length !== 2) {
    console.error('[Auth Middleware] Invalid Authorization header format:', parts.length);
    return res.status(401).json({ error: 'Invalid Authorization header' })
  }
  
  const token = parts[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    ;(req as any).userId = payload.id
    console.log('[Auth Middleware] Token verified for user:', payload.id);
    
    // Fetch user data from database
    try {
      const User = (await import('../models/User')).default
      const user = await User.findById(payload.id)
      if (user) {
        ;(req as any).user = user
        console.log('[Auth Middleware] User data loaded:', user.email);
      } else {
        console.log('[Auth Middleware] User not found in database for ID:', payload.id);
      }
    } catch (err) {
      console.error('[Auth Middleware] Error fetching user data:', err)
      // Continue anyway with just userId
    }
    
    return next()
  } catch (err) {
    console.error('[Auth Middleware] Token verification failed:', err instanceof Error ? err.message : err);
    return res.status(401).json({ error: 'Invalid token' })
  }
}
