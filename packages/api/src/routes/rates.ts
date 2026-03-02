import { Router, Request, Response } from 'express';
import { getRates } from '../services/rates.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Get all rates or chain-specific rates
router.get('/', async (req: Request, res: Response) => {
  try {
    const { chain } = req.query;
    const rates = await getRates(chain as string | undefined);
    
    res.json({
      success: true,
      timestamp: Date.now(),
      rates
    });
  } catch (error) {
    logger.error('Error fetching rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rates'
    });
  }
});

// Get specific chain rates
router.get('/:chain', async (req: Request, res: Response) => {
  try {
    const { chain } = req.params;
    const rates = await getRates(chain);
    
    res.json({
      success: true,
      timestamp: Date.now(),
      chain,
      rates
    });
  } catch (error) {
    logger.error(`Error fetching rates for ${req.params.chain}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rates'
    });
  }
});

export default router;
