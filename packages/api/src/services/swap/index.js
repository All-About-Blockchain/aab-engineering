// Real swap service with Jupiter (Solana) and 1Inch (EVM)
import axios from 'axios';

const JUPITER_API = 'https://api.jup.ag/v6';
const ONEINCH_API = 'https://api.1inch.dev/v5.0';

// Token addresses
const TOKENS = {
  solana: {
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    USDT: 'Es9vMFrzaCERmJfrF4H2FY4ix8hNofckWWcNCzR3LJD',
    SOL: 'So11111111111111111111111111111111111111112',
    jitoSOL: 'JUPyiwrYJFskUPiHa7hkeR8VUtkqjberbSOWd91pbT2',
    mSOL: 'mSoLzYCxHdYgdzU18gCGEQXyZat4HMdKJHKpLusGvza'
  },
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    ETH: '0xEeeeeEeeeEeEeeEdeeEAdEAdEeEeeFEEeeeeEEE',
    WETH: '0xC02aaA39b223FE8e5C4D0A0F27eAD9083C756Cc2',
    stETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
  }
};

// Chain IDs for 1Inch
const CHAIN_IDS = {
  ethereum: 1,
  arbitrum: 42161,
  optimism: 10,
  polygon: 137,
  base: 8453,
  avalanche: 43114
};

// Get tokens for a chain
export function getTokens(chain) {
  return Object.entries(TOKENS[chain] || {}).map(([symbol, address]) => ({
    symbol,
    address
  }));
}

// Get swap quote from Jupiter (Solana)
async function getJupiterQuote(inputMint, outputMint, amount, slippage = 1) {
  try {
    const response = await axios.get(`${JUPITER_API}/quote`, {
      params: {
        inputMint,
        outputMint,
        amount,
        slippage
      },
      timeout: 10000
    });
    
    return {
      fromToken: inputMint,
      toToken: outputMint,
      fromAmount: amount,
      toAmount: response.data.outAmount,
      priceImpact: parseFloat(response.data.priceImpactPct) || 0,
      route: response.data.routePlan
    };
  } catch (e) {
    console.log('Jupiter quote failed:', e.message);
    return null;
  }
}

// Get swap quote from 1Inch (EVM)
async function get1InchQuote(chainId, fromToken, toToken, amount) {
  try {
    const response = await axios.get(`${ONEINCH_API}/${chainId}/quote`, {
      params: {
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        amount
      },
      timeout: 10000
    });
    
    return {
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount: response.data.toTokenAmount,
      priceImpact: 0
    };
  } catch (e) {
    console.log('1Inch quote failed:', e.message);
    return null;
  }
}

// Get quote
export async function getSwapQuote(chain, fromToken, toToken, amount) {
  // Resolve token addresses
  const fromAddress = TOKENS[chain]?.[fromToken] || fromToken;
  const toAddress = TOKENS[chain]?.[toToken] || toToken;
  
  if (chain === 'solana') {
    return getJupiterQuote(fromAddress, toAddress, amount);
  } else {
    const chainId = CHAIN_IDS[chain];
    if (!chainId) {
      throw new Error(`Unsupported chain: ${chain}`);
    }
    return get1InchQuote(chainId, fromAddress, toAddress, amount);
  }
}

// Get transaction for swap
export async function getSwapTransaction(chain, fromToken, toToken, amount, userAddress, slippage = 1) {
  const quote = await getSwapQuote(chain, fromToken, toToken, amount);
  
  if (!quote) {
    throw new Error('Could not get swap quote');
  }
  
  if (chain === 'solana') {
    // Get swap transaction from Jupiter
    try {
      const response = await axios.post(`${JUPITER_API}/swap`, {
        quoteResponse: quote,
        userPublicKey: userAddress,
        wrapAndUnwrapSol: true
      });
      
      return {
        tx: response.data.swapTransaction,
        quote
      };
    } catch (e) {
      console.log('Jupiter swap tx failed:', e.message);
      return { quote, tx: null };
    }
  } else {
    // For EVM, return the quote data (would need more for actual tx)
    return { quote, tx: null };
  }
}
