import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

const API_KEYS = new Set([
  process.env.API_KEY || 'aab_cron_key_2026', // Default for backwards compatibility
  process.env.CRON_KEY || 'aab_cron_key_2026'
]);

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    logger.warn('Missing API key', { path: req.path, ip: req.ip });
    res.status(401).json({ success: false, error: 'Missing API key' });
    return;
  }

  if (!API_KEYS.has(apiKey)) {
    logger.warn('Invalid API key', { path: req.path, ip: req.ip });
    res.status(401).json({ success: false, error: 'Invalid API key' });
    return;
  }

  next();
}

export function addApiKey(key: string): void {
  API_KEYS.add(key);
}

export function removeApiKey(key: string): void {
  API_KEYS.delete(key);
}
