const API_KEYS = new Set([
  process.env.API_KEY || 'aab_cron_key_2026',
  process.env.CRON_KEY || 'aab_cron_key_2026'
]);

// Free tier settings
const FREE_TIER_LIMIT = 10; // requests per minute

// Endpoints that don't require auth (free tier)
const PUBLIC_ENDPOINTS = [
  '/health',
  '/v1/chains',
  '/v1/rates',
  '/v1/rates/etherfi',
  '/v1/rates/protocols',
  '/v1/bridge/config',
  '/v1/bridge/chains',
  '/v1/bridge/tokens',
  '/v1/staking/rates',
  '/v1/swap/tokens'
];

// Track free tier usage (in-memory, resets on restart)
const freeTierUsage = new Map();

export function authMiddleware(req, res, next) {
  // Check if public endpoint
  const isPublic = PUBLIC_ENDPOINTS.some(path => req.path.startsWith(path));
  
  if (isPublic) {
    return next();
  }
  
  // For protected endpoints, require API key
  const apiKey = req.headers['x-api-key'];
  const authHeader = req.headers['authorization'];
  
  // Check Authorization header (Bearer token)
  let key = apiKey;
  if (authHeader) {
    key = authHeader.replace('Bearer ', '');
  }
  
  if (!key) {
    return res.status(401).json({ 
      success: false, 
      error: 'Missing API key. Use X-API-Key header or Authorization: Bearer <key>',
      publicEndpoints: PUBLIC_ENDPOINTS
    });
  }
  
  if (!API_KEYS.has(key)) {
    return res.status(401).json({ success: false, error: 'Invalid API key' });
  }
  
  next();
}

// Rate limiter for free tier
export function freeTierLimiter(req, res, next) {
  // Only apply to public endpoints
  const isPublic = PUBLIC_ENDPOINTS.some(path => req.path.startsWith(path));
  
  if (!isPublic) {
    return next();
  }
  
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  
  // Get or create usage record
  let usage = freeTierUsage.get(ip) || { count: 0, resetTime: now + windowMs };
  
  // Reset if window expired
  if (now > usage.resetTime) {
    usage = { count: 0, resetTime: now + windowMs };
  }
  
  // Check limit
  if (usage.count >= FREE_TIER_LIMIT) {
    return res.status(429).json({ 
      success: false, 
      error: 'Free tier limit exceeded',
      limit: FREE_TIER_LIMIT,
      window: '1 minute',
      upgrade: 'Contact hello@aab.engineering for API key'
    });
  }
  
  // Increment and store
  usage.count++;
  freeTierUsage.set(ip, usage);
  
  // Add rate limit headers
  res.set('X-RateLimit-Limit', FREE_TIER_LIMIT);
  res.set('X-RateLimit-Remaining', FREE_TIER_LIMIT - usage.count);
  
  next();
}

export function addApiKey(key) { API_KEYS.add(key); }
export function removeApiKey(key) { API_KEYS.delete(key); }
