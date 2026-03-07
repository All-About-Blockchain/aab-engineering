import { Router } from 'express';
import { getRates, getRatesStatus } from '../services/rates.service.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { chain } = req.query;
    const rates = await getRates(chain);
    res.json({ success: true, timestamp: Date.now(), rates });
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch rates' });
  }
});

// Status endpoint - shows last updated times
router.get('/status', async (req, res) => {
  try {
    const status = getRatesStatus();
    res.json({ success: true, ...status });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch status' });
  }
});

router.get('/:chain', async (req, res) => {
  try {
    const { chain } = req.params;
    const rates = await getRates(chain);
    res.json({ success: true, timestamp: Date.now(), chain, rates });
  } catch (error) {
    console.error(`Error fetching rates for ${req.params.chain}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch rates' });
  }
});

export default router;
