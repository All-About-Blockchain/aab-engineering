import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import healthRoutes from './routes/health.js';
import ratesRoutes from './routes/rates.js';
import chainsRoutes from './routes/chains.js';
import bridgeRoutes from './routes/bridge.js';
import swapRoutes from './routes/swap.js';
import stakingRoutes from './routes/staking.js';
import walletRoutes from './routes/wallet.js';
import moonpayRoutes from './routes/moonpay.js';

// Middleware
import { authMiddleware, freeTierLimiter } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security & Basic Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: 'Rate limit exceeded' }
});
app.use(limiter);

// Swagger UI (no auth required)
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// Serve index.html at root
app.use('/', express.static(path.join(__dirname, 'docs'), { index: 'index.html' }));

// Health check (no auth required, free tier)
app.use('/health', freeTierLimiter, healthRoutes);

// API Routes
// Public endpoints (free tier): /v1/rates, /v1/chains, /v1/bridge/config, /v1/staking/rates, /v1/swap/tokens
// Protected (auth required): everything else
app.use('/v1/rates', freeTierLimiter, ratesRoutes);
app.use('/v1/chains', freeTierLimiter, chainsRoutes);
app.use('/v1/bridge', freeTierLimiter, authMiddleware, bridgeRoutes);
app.use('/v1/swap', freeTierLimiter, authMiddleware, swapRoutes);
app.use('/v1/staking', freeTierLimiter, authMiddleware, stakingRoutes);
app.use('/v1/wallet', authMiddleware, walletRoutes);
app.use('/v1/moonpay', moonpayRoutes);

// Root
app.use('/v1', (req, res) => {
  res.json({
    name: 'aab.engineering API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      rates: '/v1/rates',
      chains: '/v1/chains',
      bridge: '/v1/bridge',
      swap: '/v1/swap',
      staking: '/v1/staking',
      wallet: '/v1/wallet',
      moonpay: '/v1/moonpay'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 aab.engineering API running on port ${PORT}`);
});

export default app;
