import type { Request, Response, NextFunction } from 'express';

interface AttemptRecord {
  count: number;
  firstAttempt: number;
}

const loginAttempts = new Map<string, AttemptRecord>();
const MAX_AUTH_ATTEMPTS = 15;
const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const apiRequests = new Map<string, AttemptRecord>();
const MAX_API_REQUESTS = 300;
const API_WINDOW_MS = 60 * 1000; // 1 minute

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
    if (now - record.firstAttempt > AUTH_WINDOW_MS) {
      loginAttempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }
    if (record.count >= MAX_AUTH_ATTEMPTS) {
      return res.status(429).json({
        error: 'Too Many Requests',
        detail: 'Exceeded maximum authentication attempts. Please wait 15 minutes before trying again.'
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

export function apiRateLimiter(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = apiRequests.get(ip);

  if (record) {
    if (now - record.firstAttempt > API_WINDOW_MS) {
      apiRequests.set(ip, { count: 1, firstAttempt: now });
      return next();
    }
    if (record.count >= MAX_API_REQUESTS) {
      return res.status(429).json({
        error: 'Too Many Requests',
        detail: 'API rate limit exceeded. Please wait 60 seconds and try again.'
      });
    }
    record.count++;
  } else {
    apiRequests.set(ip, { count: 1, firstAttempt: now });
  }
  next();
}
