import { Router } from 'express';
import { getChains, CHAINS } from '../services/rates.service.js';

const router = Router();

router.get('/', (req, res) => {
  const chains = getChains();
  const response = {};
  chains.forEach(chain => {
    response[chain.id] = { name: chain.name, protocols: chain.protocols.reduce((acc, p) => { acc[p] = {}; return acc; }, {}) };
  });
  res.json({ success: true, chains: response });
});

router.get('/:chain', (req, res) => {
  const { chain } = req.params;
  if (!CHAINS[chain]) {
    return res.status(404).json({ success: false, error: 'Chain not found' });
  }
  res.json({ success: true, chain: { name: CHAINS[chain].name, protocols: CHAINS[chain].protocols } });
});

export default router;
