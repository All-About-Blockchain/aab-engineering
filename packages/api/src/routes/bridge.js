import { Router } from 'express';

const router = Router();

const BRIDGES = {
  axelar: { time: '10-30min', fee: '0.1%' },
  wormhole: { time: '15-45min', fee: '0.1%' },
  layerzero: { time: '5-20min', fee: '0.05%' },
  stargate: { time: '10-30min', fee: '0.06%' },
  hop: { time: '5-15min', fee: '0.03%' },
  celer: { time: '10-30min', fee: '0.2%' }
};

router.get('/config', (req, res) => {
  res.json({ success: true, bridges: BRIDGES });
});

router.post('/quote', (req, res) => {
  const { fromChain, toChain, fromToken, toToken, amount } = req.body;
  if (!fromChain || !toChain || !fromToken || !toToken || !amount) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  res.json({ success: true, quote: { fromChain, toChain, fromToken, toToken, amount, estimatedAmount: parseFloat(amount) * 0.999, fee: '0.05%', time: '5-20min', route: 'layerzero' } });
});

router.post('/execute', (req, res) => {
  res.status(501).json({ success: false, error: 'Bridge execution not yet implemented' });
});

export default router;
