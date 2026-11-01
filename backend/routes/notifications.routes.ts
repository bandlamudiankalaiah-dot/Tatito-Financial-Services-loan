import { Router } from 'express';
import type { Response } from 'express';
import { dbRepository } from '../../database/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await dbRepository.notifications.getByUser(req.user!.userId);
    res.json(list);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await dbRepository.notifications.markAllRead(req.user!.userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

export default router;
