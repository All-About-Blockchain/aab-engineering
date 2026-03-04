// Stargate Bridge Service
// Cross-chain liquidity via LayerZero

import axios from 'axios';

const STARGATE_API = 'https://api.stargatefinance.io/v2';

// Chain ID mapping for Stargate
export const STARGATE_CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  arbitrum: 110,
  optimism: 111,
  base: 184,
  avalanche: 106,
  polygon: 109,
  bsc: 102,
  // New additions
  injective: 124,
  solana: 1, // Stargate on Solana
  cosmos: 118,
  osmosis: 187,
  sei: 032,
  terra: 2,
};

// Token addresses on different chains
export const STARGATE_TOKENS: Record<string, Record<string, string>> = {
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    ETH: '0x0000000000000000000000000000000000000000',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  arbitrum: {
    USDC: '0xaf88d065e77c8cC223932742C2474B2c0a6A6D21',
    USDT: '0xFd086bC7CD5C481DCC93C76CCCDA0dFcEa7dE157',
    ETH: '0x0000000000000000000000000000000000000000',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f341541FB1Abd1',
  },
  optimism: {
    USDC: '0x0b2C639c533813f1Aa8D1E2aD8a3C0b7c0f9E4b2',
    USDT: '0x94b008aA00579c1307B0EF2c4945f7f57A9d8e4',
    ETH: '0x0000000000000000000000000000000000000000',
    WETH: '0x4200000000000000000000000000000000000006',
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4d71e70280fEbE',
    USDT: '0xfde4C48cE405CEEAC2131E2f29D51c2a19A79C1D',
    ETH: '0x0000000000000000000000000000000000000000',
    WETH: '0x4200000000000000000000000000000000000006',
  },
  avalanche: {
    USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    USDT: '0x9702230A8Ea53601f5cD2fd00FBF6e511dCe6748',
    AVAX: '0x0000000000000000000000000000000000000000',
    WAVAX: '0xB31f66AA3C1e785363F0874A1C74BFd17E0b8C24',
  },
  polygon: {
    USDC: '0x3c499c542cEFb5E7b0FBb1d7D046b1D2c2c7d70c',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    MATIC: '0x0000000000000000000000000000000000000000',
    WMATIC: '0x0d500B1d8E8eF31F21C08dE1E28c8D004d7d5b6c',
  },
  injective: {
    INJ: '0xe28B3F32FDEe2f4A23EFBaB89F4BfA7C32C4C1E2',
    ETH: '0x0000000000000000000000000000000000000000',
    WETH: '0xB4FBDr6o9k8fV3c8k1v6L1Tz5Z7K8f9d3c2b1a0', // Will be added
  },
  bsc: {
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    BNB: '0x0000000000000000000000000000000000000000',
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bd095',
  },
};

export interface BridgeQuote {
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  fee: number;
  estimatedTime: string;
  router: string;
}

export interface BridgeRoute {
  name: string;
  fee: string;
  time: string;
  chains: string[];
  supported: boolean;
}

// Get available routes (cached config)
export function getBridgeRoutes(): BridgeRoute[] {
  return [
    {
      name: 'Stargate',
      fee: '0.06%',
      time: '10-30min',
      chains: ['ethereum', 'arbitrum', 'optimism', 'base', 'polygon', 'avalanche', 'bsc', 'injective'],
      supported: true,
    },
    {
      name: 'LayerZero',
      fee: '0.05%',
      time: '5-20min',
      chains: ['ethereum', 'arbitrum', 'optimism', 'base', 'polygon', 'avalanche', 'bsc', 'injective', 'solana', 'cosmos', 'osmosis'],
      supported: true,
    },
    {
      name: 'Wormhole',
      fee: '0.1%',
      time: '15-45min',
      chains: ['ethereum', 'solana', 'avalanche', 'polygon', 'bsc', 'injective'],
      supported: true,
    },
    {
      name: 'Axelar',
      fee: '0.1%',
      time: '10-30min',
      chains: ['ethereum', 'avalanche', 'polygon', 'bsc', 'injective', 'cosmos', 'osmosis'],
      supported: true,
    },
    {
      name: 'Hop',
      fee: '0.03%',
      time: '5-15min',
      chains: ['ethereum', 'arbitrum', 'optimism', 'polygon'],
      supported: true,
    },
    {
      name: 'Celer',
      fee: '0.2%',
      time: '10-30min',
      chains: ['ethereum', 'arbitrum', 'optimism', 'polygon', 'avalanche', 'bsc'],
      supported: false, // Deprecated
    },
  ];
}

// Get supported chains for Stargate
export function getStargateChains(): string[] {
  return Object.keys(STARGATE_CHAIN_IDS);
}

// Get supported tokens for a chain
export function getStargateTokens(chain: string): string[] {
  return Object.keys(STARGATE_TOKENS[chain] || {});
}

// Get bridge quote
export async function getBridgeQuote(
  fromChain: string,
  toChain: string,
  fromToken: string,
  toToken: string,
  amount: string
): Promise<BridgeQuote | null> {
  try {
    const srcChainId = STARGATE_CHAIN_IDS[fromChain];
    const dstChainId = STARGATE_CHAIN_IDS[toChain];
    
    if (!srcChainId || !dstChainId) {
      return null;
    }
    
    const srcToken = STARGATE_TOKENS[fromChain]?.[fromToken];
    const dstToken = STARGATE_TOKENS[toChain]?.[toToken];
    
    if (!srcToken || !dstToken) {
      return null;
    }
    
    // In production, call Stargate API
    // For now, return mock quote
    const feePercent = 0.0006; // 0.06%
    const fee = parseFloat(amount) * feePercent;
    const toAmount = (parseFloat(amount) - fee).toString();
    
    return {
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount,
      fee,
      estimatedTime: '10-30min',
      router: 'Stargate',
    };
  } catch (error) {
    console.error('Bridge quote error:', error);
    return null;
  }
}

// Check if route is available
export function isRouteAvailable(
  fromChain: string,
  toChain: string,
  bridge: string = 'Stargate'
): boolean {
  const routes = getBridgeRoutes();
  const route = routes.find(r => r.name === bridge);
  
  if (!route || !route.supported) return false;
  
  return route.chains.includes(fromChain) && route.chains.includes(toChain);
}

// Get best bridge for route
export function getBestBridge(fromChain: string, toChain: string): string {
  const routes = getBridgeRoutes().filter(r => r.supported);
  
  for (const route of routes) {
    if (route.chains.includes(fromChain) && route.chains.includes(toChain)) {
      return route.name;
    }
  }
  
  return 'LayerZero'; // Fallback
}
