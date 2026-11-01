import type { Request, Response, NextFunction } from 'express';

interface AttemptRecord {
  count: number;
  firstAttempt: number;
}

const loginAttempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 15;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function authRateLimiter(req: Request, res: Response, next: NextFunction) {
  // Bypass in test mode for rapid automated runs
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const email = (req.body && req.body.email ? String(req.body.email) : '').trim().toLowerCase();
  const key = `${ip}_${email}`;
  const now = Date.now();

  const record = loginAttempts.get(key);
  if (record) {
    if (now - record.firstAttempt > WINDOW_MS) {
      loginAttempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }
    if (record.count >= MAX_ATTEMPTS) {
      return res.status(429).json({
        error: 'Too Many Requests',
        detail: 'Exceeded maximum login attempts. Please wait 15 minutes before trying again.'
      });
    }
    record.count++;
  } else {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
  }
  next();
}

export function resetAuthRateLimit(req: Request) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const email = (req.body && req.body.email ? String(req.body.email) : '').trim().toLowerCase();
  const key = `${ip}_${email}`;
  loginAttempts.delete(key);
}
