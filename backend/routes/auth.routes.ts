import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbRepository, logAudit } from '../../database/db.ts';
import { generateToken, hashPassword, verifyPassword, requireAuth, revokeToken, type AuthenticatedRequest } from '../middleware/auth.ts';
import { authRateLimiter, resetAuthRateLimit } from '../middleware/rateLimiter.ts';

const router = Router();

// POST /api/auth/register
router.post('/register', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, password, role, city, state, annual_income } = req.body;

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Validation Error', detail: 'full_name, email, phone, and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({ error: 'Validation Error', detail: 'Please provide a valid email address' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Validation Error', detail: 'Password must be at least 6 characters long' });
    }

    // Explicitly reject any attempt to self-assign elevated administrative or credit officer roles
    if (role && (role === 'admin' || role === 'super_admin' || role === 'credit_officer')) {
      return res.status(403).json({
        error: 'Forbidden',
        detail: 'Administrative and Credit Officer roles cannot be self-assigned via public registration. Contact the system administrator.'
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existing = await dbRepository.users.findByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'Conflict', detail: 'An account with this email already exists' });
    }

    const hashedPassword = await hashPassword(password);

    // Public registration strictly assigns 'customer' role
    const newUser = await dbRepository.users.create({
      full_name: full_name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password_hash: hashedPassword,
      role: 'customer',
      wallet_balance: 25000.00
    });

    // Create associated user_profile via repository
    await dbRepository.profiles.upsert(newUser.id, {
      city: city || 'Kadapa',
      state: state || 'Andhra Pradesh',
      annual_income: parseFloat(annual_income) || 750000.00,
      occupation_type: 'Salaried'
    });

    // Create welcome notification via repository
    await dbRepository.notifications.create({
      user_id: newUser.id,
      title: 'Welcome to Tatito Financial Services!',
      message: 'Your account has been registered. You can explore borrowing, investing in mutual funds, and trading.',
      category: 'general'
    });

    logAudit(newUser.id, 'REGISTER', 'users', String(newUser.id), { email: cleanEmail, role: newUser.role });

    const token = generateToken(newUser);
    const { password_hash: _, ...safeUser } = newUser;

    return res.status(201).json({
      access_token: token,
      token_type: 'bearer',
      user: safeUser
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/auth/login
router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Bad Request', detail: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await dbRepository.users.findByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', detail: 'Invalid email or password' });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Unauthorized', detail: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Forbidden', detail: 'Account has been deactivated. Contact branch.' });
    }

    resetAuthRateLimit(req);
    const token = generateToken(user);
    const { password_hash: _, ...safeUser } = user;

    logAudit(user.id, 'LOGIN', 'users', String(user.id), { ip: req.ip });

    return res.json({
      access_token: token,
      token_type: 'bearer',
      user: safeUser
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await dbRepository.users.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: 'Not Found', detail: 'User profile not found' });
    const { password_hash: _, ...safeUser } = user;
    const profile = (await dbRepository.profiles.getByUserId(user.id)) || {};
    return res.json({ ...safeUser, profile });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (req.body?.revoke_token === true || req.query?.revoke === 'true') {
      revokeToken(token);
    }
  }
  logAudit(null, 'LOGOUT', 'users', null, { ip: req.ip });
  res.json({ message: 'Logged out successfully', status: 'LOGGED_OUT' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Bad Request', detail: 'Email address is required' });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    const user = await dbRepository.users.findByEmail(cleanEmail);
    const refId = `PWD-RESET-${Date.now()}`;
    if (user) {
      logAudit(user.id, 'FORGOT_PASSWORD_REQUEST', 'users', String(user.id), { referenceId: refId });
    }
    return res.json({
      status: 'OTP_DISPATCHED_SANDBOX',
      is_sandbox: true,
      sandbox_otp_hint: '849201',
      referenceId: refId,
      message: 'If the email exists, a simulated password reset OTP (849201 in Test Sandbox) has been dispatched.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, otp, new_password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Bad Request', detail: 'Email is required' });
    }

    // If new_password is provided, perform actual password reset with OTP verification
    if (new_password) {
      if (!otp || (otp !== '849201' && otp !== '123456')) {
        return res.status(400).json({
          error: 'Invalid OTP',
          detail: 'Invalid or expired sandbox reset OTP. Use 849201 for sandbox verification.'
        });
      }
      if (String(new_password).length < 8) {
        return res.status(400).json({
          error: 'Validation Error',
          detail: 'New password must be at least 8 characters long.'
        });
      }
      const user = await dbRepository.users.findByEmail(String(email).toLowerCase().trim());
      if (!user) {
        return res.status(404).json({ error: 'Not Found', detail: 'Account not found for this email' });
      }
      const hashed = await hashPassword(String(new_password));
      await dbRepository.users.updatePassword(user.id, hashed);
      logAudit(user.id, 'RESET_PASSWORD_SUCCESS', 'users', String(user.id), { mode: 'sandbox_otp' });

      return res.json({
        status: 'PASSWORD_UPDATED',
        message: 'Password has been reset successfully. You may now sign in with your new credentials.',
        referenceId: `PWD-RESET-${Date.now()}`
      });
    }

    return res.json({
      message: 'If the email exists, a simulated password reset OTP has been dispatched.',
      sandbox_otp_hint: '849201',
      referenceId: `PWD-RESET-${Date.now()}`
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/auth/verify-otp (Clearly labeled Development / Test OTP verification)
router.post('/verify-otp', authRateLimiter, (req: Request, res: Response) => {
  const { identifier, otp } = req.body;
  if (!otp || String(otp).length < 4) {
    return res.status(400).json({ error: 'Bad Request', detail: 'Valid 6-digit OTP is required' });
  }
  const isValidTestOtp = otp === '123456' || otp === '849201';
  if (!isValidTestOtp) {
    return res.status(400).json({
      error: 'OTP Verification Failed',
      detail: 'Invalid test OTP code. Use 123456 or 849201 in Development Sandbox.'
    });
  }
  return res.json({
    status: 'SANDBOX_OTP_VERIFIED',
    is_sandbox: true,
    is_simulated: true,
    verified: true,
    identifier: identifier || 'sandbox-user',
    disclaimer: 'DEVELOPMENT SANDBOX OTP: For testing only. Not connected to live telecom SMS gateway.'
  });
});

export default router;
