import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Routes
import healthRoutes from './routes/health.js';
import ratesRoutes from './routes/rates.js';
import chainsRoutes from './routes/chains.js';
import bridgeRoutes from './routes/bridge.js';
import swapRoutes from './routes/swap.js';

// Middleware
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Health check (no auth required)
app.use('/health', healthRoutes);

// API Routes (require auth)
app.use('/v1/rates', authMiddleware, ratesRoutes);
app.use('/v1/chains', authMiddleware, chainsRoutes);
app.use('/v1/bridge', authMiddleware, bridgeRoutes);
app.use('/v1/swap', authMiddleware, swapRoutes);

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
      swap: '/v1/swap'
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
