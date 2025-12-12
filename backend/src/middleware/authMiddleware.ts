import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: 'doctor' | 'patient';
    email?: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = (req.headers.authorization || '') as string;
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;

    req.user = {
      id: decoded.id || decoded.userId || decoded.sub,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};