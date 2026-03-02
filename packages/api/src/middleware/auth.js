const API_KEYS = new Set([
  process.env.API_KEY || 'trident_cron_key_2026',
  process.env.CRON_KEY || 'trident_cron_key_2026'
]);

export function authMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ success: false, error: 'Missing API key' });
  }
  if (!API_KEYS.has(apiKey)) {
    return res.status(401).json({ success: false, error: 'Invalid API key' });
  }
  next();
}

export function addApiKey(key) { API_KEYS.add(key); }
export function removeApiKey(key) { API_KEYS.delete(key); }
