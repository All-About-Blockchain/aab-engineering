import { Router } from 'express';
import { getJupiterQuote, get1InchQuote, getSwapTransaction } from '../services/swap/index.js';

const router = Router();

// Token addresses
const TOKEN_ADDRESSES = {
  solana: {
    'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    'SOL': 'So11111111111111111111111111111111111111112',
    'jitoSOL': 'JUPyiwrYJFskUPiHa7hkeR8VUtkqjberbSOWd91pbT2',
    'mSOL': 'mSoLzYCxHdYgdzU18gCGEQXyZat4HMdKJHKpLusGvza'
  },
  ethereum: {
    'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'ETH': '0xEeeeeEeeeEeEeeEdeeEAdEAdEeEeeFEEeeeeEEE',
    'stETH': '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    'rETH': '0xae78736Cd615f374D3085123A210178E74C77554'
  }
};

// GET /v1/swap/tokens - Get supported tokens
router.get('/tokens', async (req, res) => {
  const { chain } = req.query;
  
  if (!chain) {
    return res.status(400).json({ success: false, error: 'Chain required' });
  }
  
  const tokens = TOKEN_ADDRESSES[chain.toLowerCase()];
  if (!tokens) {
    return res.status(400).json({ success: false, error: 'Unsupported chain' });
  }
  
  res.json({
    success: true,
    chain,
    tokens: Object.entries(tokens).map(([symbol, address]) => ({ symbol, address }))
  });
});

// POST /v1/swap/quote - Get swap quote
router.post('/quote', async (req, res) => {
  try {
    const { chain, fromToken, toToken, amount, slippage } = req.body;
    
    if (!chain || !fromToken || !toToken || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: chain, fromToken, toToken, amount' 
      });
    }
    
    // Resolve token addresses
    const fromAddress = TOKEN_ADDRESSES[chain.toLowerCase()]?.[fromToken] || fromToken;
    const toAddress = TOKEN_ADDRESSES[chain.toLowerCase()]?.[toToken] || toToken;
    
    let quote;
    if (chain.toLowerCase() === 'solana') {
      quote = await getJupiterQuote(fromAddress, toAddress, parseFloat(amount));
    } else {
      // Convert ETH amount to wei
      const weiAmount = fromToken === 'ETH' ? (parseFloat(amount) * 1e18).toString() : amount;
      quote = await get1InchQuote(
        getChainId(chain),
        fromAddress,
        toAddress,
        weiAmount
      );
    }
    
    res.json({
      success: true,
      quote: {
        chain,
        fromToken,
        toToken,
        fromAmount: amount,
        toAmount: (parseInt(quote.toAmount) / 1e18).toFixed(6),
        priceImpact: quote.priceImpact,
        route: quote.route
      }
    });
  } catch (error) {
    console.error('Swap quote error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /v1/swap/execute - Get transaction data for execution
router.post('/execute', async (req, res) => {
  try {
    const { chain, fromToken, toToken, amount, userAddress, slippage } = req.body;
    
    if (!chain || !fromToken || !toToken || !amount || !userAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: chain, fromToken, toToken, amount, userAddress' 
      });
    }
    
    // Resolve token addresses
    const fromAddress = TOKEN_ADDRESSES[chain.toLowerCase()]?.[fromToken] || fromToken;
    const toAddress = TOKEN_ADDRESSES[chain.toLowerCase()]?.[toToken] || toToken;
    
    // Convert amount to appropriate format
    let amountStr = amount;
    if (chain.toLowerCase() !== 'solana' && fromToken === 'ETH') {
      amountStr = (parseFloat(amount) * 1e18).toString();
    }
    
    const txData = await getSwapTransaction(
      chain.toLowerCase(),
      fromAddress,
      toAddress,
      amountStr,
      userAddress,
      slippage || 0.5
    );
    
    res.json({
      success: true,
      transaction: {
        chain,
        fromToken,
        toToken,
        fromAmount: amount,
        toAmount: (parseInt(txData.toAmount) / 1e18).toFixed(6),
        tx: txData.tx
      }
    });
  } catch (error) {
    console.error('Swap execute error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper: Get chain ID for 1Inch
function getChainId(chain: string): number {
  const chainIds: Record<string, number> = {
    ethereum: 1,
    polygon: 137,
    arbitrum: 42161,
    base: 8453,
    optimism: 10
  };
  return chainIds[chain.toLowerCase()] || 1;
}

export default router;
