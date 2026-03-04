import { Router } from 'express';
import { 
  getBridgeRoutes, 
  getStargateChains, 
  getStargateTokens, 
  getBridgeQuote,
  isRouteAvailable,
  getBestBridge,
  STARGATE_CHAIN_IDS
} from '../services/bridge/stargate.js';

const router = Router();

// GET /v1/bridge/config - Get all bridge configurations
router.get('/config', (req, res) => {
  const routes = getBridgeRoutes();
  
  res.json({
    success: true,
    bridges: routes.map(r => ({
      name: r.name,
      fee: r.fee,
      time: r.time,
      chains: r.chains,
      supported: r.supported
    }))
  });
});

// GET /v1/bridge/chains - Get supported chains
router.get('/chains', (req, res) => {
  const chains = getStargateChains();
  
  res.json({
    success: true,
    chains: chains.map(c => ({
      id: c,
      name: c.charAt(0).toUpperCase() + c.slice(1),
      stargateId: STARGATE_CHAIN_IDS[c]
    }))
  });
});

// GET /v1/bridge/tokens - Get tokens for a chain
router.get('/tokens', (req, res) => {
  const { chain } = req.query;
  
  if (!chain) {
    return res.status(400).json({ success: false, error: 'chain parameter required' });
  }
  
  const tokens = getStargateTokens(chain);
  
  if (tokens.length === 0) {
    return res.status(400).json({ success: false, error: 'Unknown chain' });
  }
  
  res.json({
    success: true,
    chain,
    tokens: tokens.map(t => ({ symbol: t }))
  });
});

// POST /v1/bridge/quote - Get bridge quote
router.post('/quote', async (req, res) => {
  try {
    const { fromChain, toChain, fromToken, toToken, amount, bridge } = req.body;
    
    if (!fromChain || !toChain || !fromToken || !toToken || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: fromChain, toChain, fromToken, toToken, amount' 
      });
    }
    
    // Check if route is available
    const bridgeName = bridge || getBestBridge(fromChain, toChain);
    
    if (!isRouteAvailable(fromChain, toChain, bridgeName)) {
      return res.status(400).json({ 
        success: false, 
        error: `No route available from ${fromChain} to ${toChain}` 
      });
    }
    
    // Get quote
    const quote = await getBridgeQuote(fromChain, toChain, fromToken, toToken, amount);
    
    if (!quote) {
      return res.status(400).json({ success: false, error: 'Could not get quote' });
    }
    
    res.json({
      success: true,
      quote: {
        fromChain: quote.fromChain,
        toChain: quote.toChain,
        fromToken: quote.fromToken,
        toToken: quote.toToken,
        fromAmount: quote.fromAmount,
        toAmount: quote.toAmount,
        fee: quote.fee,
        estimatedTime: quote.estimatedTime,
        router: quote.router
      }
    });
  } catch (error) {
    console.error('Bridge quote error:', error);
    res.status(500).json({ success: false, error: 'Failed to get quote' });
  }
});

// POST /v1/bridge/routes - Get available routes between chains
router.post('/routes', (req, res) => {
  const { fromChain, toChain } = req.body;
  
  if (!fromChain || !toChain) {
    return res.status(400).json({ success: false, error: 'fromChain and toChain required' });
  }
  
  const routes = getBridgeRoutes()
    .filter(r => r.supported)
    .filter(r => r.chains.includes(fromChain) && r.chains.includes(toChain))
    .map(r => ({
      name: r.name,
      fee: r.fee,
      time: r.time
    }));
  
  res.json({
    success: true,
    fromChain,
    toChain,
    routes
  });
});

// POST /v1/bridge/execute - Execute bridge (placeholder)
router.post('/execute', (req, res) => {
  const { fromChain, toChain, fromToken, toToken, amount, toAddress } = req.body;
  
  if (!fromChain || !toChain || !fromToken || !toToken || !amount || !toAddress) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  
  // In production, this would:
  // 1. Get the bridge transaction data
  // 2. Have user sign via MPC wallet
  // 3. Submit to bridge
  
  res.status(501).json({ 
    success: false, 
    error: 'Bridge execution not yet implemented. Use quote to get transaction data.',
    note: 'Contact us for bridge execution support'
  });
});

export default router;
