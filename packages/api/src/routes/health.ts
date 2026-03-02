import { Router, Request, Response } from 'express';

const router = Router();

// Simple health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    version: '1.0.0',
    name: 'aab.engineering',
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    }
  });
});

export default router;
