import { Router, Request, Response } from 'express';
import { getChains, CHAINS } from '../services/rates.service.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const chains = getChains();
  
  const response: any = {};
  chains.forEach(chain => {
    response[chain.id] = {
      name: chain.name,
      protocols: chain.protocols.reduce((acc, protocol) => {
        acc[protocol] = {};
        return acc;
      }, {} as Record<string, any>)
    };
  });

  res.json({
    success: true,
    chains: response
  });
});

router.get('/:chain', (req: Request, res: Response) => {
  const { chain } = req.params;
  
  if (!CHAINS[chain]) {
    res.status(404).json({
      success: false,
      error: 'Chain not found'
    });
    return;
  }

  res.json({
    success: true,
    chain: {
      name: CHAINS[chain].name,
      protocols: CHAINS[chain].protocols
    }
  });
});

export default router;
