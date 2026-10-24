import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

// Database & Relational Store
import { dbRepository, initPostgres, isPostgresConnected, DatabaseUnavailableError } from './database/db.ts';

// Route Modules
import authRoutes from './backend/routes/auth.routes.ts';
import usersRoutes from './backend/routes/users.routes.ts';
import kycRoutes from './backend/routes/kyc.routes.ts';
import loansRoutes from './backend/routes/loans.routes.ts';
import paymentsRoutes from './backend/routes/payments.routes.ts';
import investmentsRoutes from './backend/routes/investments.routes.ts';
import adminRoutes from './backend/routes/admin.routes.ts';
import agentsRoutes from './backend/routes/agents.routes.ts';
import notificationsRoutes from './backend/routes/notifications.routes.ts';

import { getJwtSecret } from './backend/middleware/auth.ts';

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Strict CORS: Restrict to configured origins in production
const configuredOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!isProd || configuredOrigins.length === 0 || configuredOrigins.includes('*') || configuredOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy: Access forbidden from this origin'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Requested-With', 'X-Simulate-Failure']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  const isPg = isPostgresConnected();
  res.json({
    status: 'healthy',
    service: 'Tatito Financial Services Full-Stack API',
    database_mode: isPg ? 'PostgreSQL (Connected)' : 'Persistent Fallback Relational Store',
    postgres_connected: isPg,
    branch: 'Kadapa Central Hub, Andhra Pradesh',
    timestamp: new Date().toISOString()
  });
});

// Mount API Route Modules
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/loan-products', async (req: Request, res: Response) => {
  try {
    const products = await dbRepository.loans.getProducts();
    res.json(products);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});
app.use('/api/payments', paymentsRoutes);
app.use('/api/bills', paymentsRoutes); // Alias for BBPS utility bills
app.use('/api/investments', investmentsRoutes);
app.use('/api/stocks', (req, res, next) => {
  req.url = req.url === '/' ? '/stocks' : `/stocks${req.url}`;
  investmentsRoutes(req, res, next);
});
app.use('/api/watchlist', (req, res, next) => {
  req.url = req.url === '/' ? '/watchlist' : `/watchlist${req.url}`;
  investmentsRoutes(req, res, next);
});
app.use('/api/mutual-funds', (req, res, next) => {
  req.url = req.url === '/' ? '/mutual-funds' : `/mutual-funds${req.url}`;
  investmentsRoutes(req, res, next);
});
app.use('/api/sips', (req, res, next) => {
  req.url = req.url === '/' ? '/sips' : `/sips${req.url}`;
  investmentsRoutes(req, res, next);
});
app.use('/api/demat', (req, res, next) => {
  req.url = req.url === '/' ? '/demat' : `/demat${req.url}`;
  investmentsRoutes(req, res, next);
});
app.use('/api/admin', adminRoutes);
app.use('/api/reports', (req, res, next) => {
  req.url = req.url === '/' ? '/reports/csv' : req.url;
  adminRoutes(req, res, next);
});
app.use('/api/agents', agentsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Contact / Enquiries endpoint
app.post('/api/contact', (req: Request, res: Response) => {
  const { full_name, email, phone, subject, category, message } = req.body;
  if (!full_name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Please provide all required enquiry fields' });
  }

  const newEnquiry = {
    id: `ENQ-${Date.now()}`,
    full_name: full_name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    subject: subject || 'General Enquiry',
    category: category || 'General Support',
    message: message.trim(),
    created_at: new Date().toISOString()
  };

  return res.status(201).json({
    status: 'RECEIVED',
    enquiry: newEnquiry,
    message: 'Enquiry received. Kadapa branch customer advisor will respond within 24 hours.'
  });
});

// Clean HTML page route aliases
const pages = [
  'login', 'register', 'dashboard', 'loans', 'loan-application',
  'emi-calculator', 'investments', 'stocks', 'mutual-funds',
  'sip-calculator', 'demat', 'profile', 'notifications', 'admin', 'agents'
];

pages.forEach((page) => {
  app.get(`/${page}`, (req: Request, res: Response) => {
    const isProd = process.env.NODE_ENV === 'production';
    const distPath = path.resolve(process.cwd(), 'dist');
    const staticRoot = (isProd && fs.existsSync(distPath)) ? distPath : process.cwd();
    const filePath = path.resolve(staticRoot, `${page}.html`);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    return res.sendFile(path.resolve(process.cwd(), `${page}.html`));
  });
});

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof DatabaseUnavailableError || err.statusCode === 503) {
    return res.status(503).json({
      error: 'Service Unavailable',
      detail: err.message || 'PostgreSQL database required in production mode',
      database_mode: 'fail_safe'
    });
  }
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({ error: 'Internal Error', detail: err.message });
});

// Static Web Serving & Development Server
export async function startServer() {
  await initPostgres();
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(process.cwd(), 'dist');
  const staticRoot = (isProd && fs.existsSync(distPath)) ? distPath : process.cwd();

  // Always serve js, css, and assets explicitly from root or dist
  app.use('/js', express.static(path.resolve(process.cwd(), 'js')));
  app.use('/css', express.static(path.resolve(process.cwd(), 'css')));
  app.use('/assets', express.static(path.resolve(process.cwd(), 'assets')));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(staticRoot));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(staticRoot, 'index.html'));
    });
  }

  return app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tatito Financial Services Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

// Auto-start when executed directly (not imported by test runner)
const isDirectRun = process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js');
if (isDirectRun && process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Fatal: Failed to start server:', err);
    process.exit(1);
  });
}
