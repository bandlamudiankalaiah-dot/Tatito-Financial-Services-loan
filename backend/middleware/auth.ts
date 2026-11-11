import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbRepository } from '../../database/db.ts';

export const DEFAULT_DEV_SECRET = 'tatito-kadapa-dev-secret-key-only-2026';

export function getJwtSecret(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const secret = process.env.JWT_SECRET;
  if (isProd) {
    if (!secret || secret === DEFAULT_DEV_SECRET || secret.length < 32) {
      throw new Error(
        'FATAL SECURITY VIOLATION: Production environment requires a strong, environment-configured JWT_SECRET of at least 32 characters.'
      );
    }
    return secret;
  }
  return secret || DEFAULT_DEV_SECRET;
}

const JWT_EXPIRES_IN = '7d';

export interface AuthUserPayload {
  userId: number;
  email: string;
  role: 'customer' | 'agent' | 'credit_officer' | 'admin' | 'super_admin';
  fullName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function generateToken(user: { id: number; email: string; role: string; full_name: string }): string {
  const payload: AuthUserPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as any,
    fullName: user.full_name
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  // Disallow plain-text passwords outright. All passwords must be verified via bcrypt hashes.
  if (!hash || (!hash.startsWith('$2a$') && !hash.startsWith('$2b$'))) {
    return false;
  }
  return bcrypt.compare(plainText, hash);
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      detail: 'Missing or malformed Authorization header. Expected Bearer <token>'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthUserPayload;
    // Always check the current active user and current role from the database
    const user = await dbRepository.users.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', detail: 'User account not found' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'Forbidden', detail: 'User account is deactivated or suspended' });
    }

    // Attach fresh live DB role and active identity to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
      fullName: user.full_name
    };
    next();
  } catch (err: any) {
    return res.status(401).json({
      error: 'Unauthorized',
      detail: 'Invalid or expired session token. Please re-authenticate.'
    });
  }
}

export function requireRole(...allowedRoles: Array<'customer' | 'agent' | 'credit_officer' | 'admin' | 'super_admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', detail: 'Authentication required' });
    }

    const effectiveAllowed = allowedRoles.includes('admin') && !allowedRoles.includes('super_admin')
      ? [...allowedRoles, 'super_admin']
      : allowedRoles;

    if (!effectiveAllowed.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        detail: `Access restricted. Your active role '${req.user.role}' lacks permissions for this endpoint. Required: [${effectiveAllowed.join(', ')}]`
      });
    }

    next();
  };
}
