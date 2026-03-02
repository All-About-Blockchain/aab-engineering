import axios from 'axios';
import { logger } from '../utils/logger.js';

// Cache for rates
let ratesCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

// Chain configurations
const CHAINS = {
  ethereum: {
    name: 'Ethereum',
    rpc: process.env.ETHEREUM_RPC || 'https://eth.llamarpc.com',
    protocols: ['aave_v3', 'compound', 'morpho', 'etherfi', 'lido', 'rocketpool', 'yearn', 'fraxlend']
  },
  arbitrum: {
    name: 'Arbitrum',
    rpc: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
    protocols: ['aave_v3', 'compound', 'radient']
  },
  optimism: {
    name: 'Optimism',
    rpc: process.env.OPTIMISM_RPC || 'https://mainnet.optimism.io',
    protocols: ['aave_v3', 'velodrome']
  },
  base: {
    name: 'Base',
    rpc: process.env.BASE_RPC || 'https://mainnet.base.org',
    protocols: ['aave_v3', 'morpho', 'moonwell']
  },
  polygon: {
    name: 'Polygon',
    rpc: process.env.POLYGON_RPC || 'https://polygon-rpc.com',
    protocols: ['aave_v3', 'compound']
  },
  solana: {
    name: 'Solana',
    rpc: process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
    protocols: ['kamino', 'solend', 'port_finance', 'jito', 'marinade']
  },
  osmosis: {
    name: 'Osmosis',
    rpc: process.env.OSMOSIS_RPC || 'https://osmosis-rpc.polkachu.com',
    protocols: ['osmosis', 'astroport']
  },
  injective: {
    name: 'Injective',
    rpc: process.env.INJECTIVE_RPC || 'https://injective-rpc.polkachu.com',
    protocols: ['neptune', 'hydro', 'injective']
  },
  cosmos: {
    name: 'Cosmos Hub',
    rpc: process.env.COSMOS_RPC || 'https://cosmos-rpc.polkachu.com',
    protocols: ['stride', 'quicksilver']
  },
  avalanche: {
    name: 'Avalanche',
    rpc: process.env.AVALANCHE_RPC || 'https://api.avax.network/ext/bc/C/rpc',
    protocols: ['aave_v3', 'benqi', 'traderjoe', 'gmx', 'curve']
  }
};

// Mock rates data (same as current Trident)
const MOCK_RATES: any = {
  USDC: {
    ethereum: {
      aave_v3: { supply: 4.12, borrow: 5.68 },
      compound: { supply: 3.82, borrow: 5.42 },
      morpho: { supply: 4.25, borrow: 5.82 },
      etherfi_eusd: { supply: 5.85, borrow: null },
      lido: { supply: 0, borrow: null },
      yearn: { supply: 4.45, borrow: null },
      fraxlend: { supply: 4.65, borrow: 6.12 }
    },
    arbitrum: {
      aave_v3: { supply: 4.85, borrow: 6.25 },
      compound: { supply: 4.12, borrow: 5.78 },
      radient: { supply: 4.45, borrow: 6.05 }
    },
    optimism: {
      aave_v3: { supply: 4.55, borrow: 6.02 },
      velodrome: { supply: 3.85, borrow: 5.25 }
    },
    base: {
      aave_v3: { supply: 4.95, borrow: 6.45 },
      morpho: { supply: 5.15, borrow: 6.72 },
      moonwell: { supply: 4.25, borrow: 5.85 }
    },
    solana: {
      kamino: { supply: 5.2, borrow: 7.5 },
      solend: { supply: 4.8, borrow: 7.2 },
      port_finance: { supply: 4.65, borrow: 6.95 }
    },
    injective: {
      neptune: { supply: 5, borrow: 7.2 },
      hydro: { supply: 4.75, borrow: 6.85 },
      injective_native: { supply: 4.5, borrow: 6.5 }
    }
  },
  ETH: {
    ethereum: {
      aave_v3: { supply: 2.45, borrow: 4.12 },
      compound: { supply: 2.18, borrow: 3.85 },
      morpho: { supply: 2.58, borrow: 4.25 },
      etherfi_weeth: { supply: 4.15, borrow: null },
      lido_steth: { supply: 4.08, borrow: null },
      rocketpool_reth: { supply: 3.95, borrow: null },
      yearn: { supply: 3.25, borrow: null }
    },
    solana: {
      jito: { supply: 8.25, borrow: 12.5 },
      marinade: { supply: 7.85, borrow: null },
      blazestake: { supply: 7.5, borrow: 11.25 }
    }
  },
  USDT: {
    ethereum: {
      aave_v3: { supply: 3.95, borrow: 5.42 },
      compound: { supply: 3.52, borrow: 5.18 },
      morpho: { supply: 4.08, borrow: 5.55 }
    },
    solana: {
      kamino: { supply: 5, borrow: 7.2 },
      solend: { supply: 4.5, borrow: 6.8 }
    }
  },
  SOL: {
    solana: {
      jito: { supply: 8.25, borrow: 12.5 },
      marinade: { supply: 7.85, borrow: null },
      kamino: { supply: 7.5, borrow: 11 },
      solend: { supply: 6.5, borrow: 10.5 }
    }
  },
  ATOM: {
    cosmos: {
      stride: { supply: 18.5, borrow: null },
      osmosis: { supply: 8.5, borrow: 12.5 },
      quicksilver: { supply: 15.25, borrow: null }
    }
  },
  INJ: {
    injective: {
      neptune: { supply: 8.5, borrow: 12.5 },
      injective_native: { supply: 7.85, borrow: 11.75 }
    }
  },
  AVAX: {
    avalanche: {
      aave_v3: { supply: 3.25, borrow: 4.95 },
      compound: { supply: 2.95, borrow: 4.65 },
      benqi: { supply: 3.55, borrow: 5.25 },
      traderjoe: { supply: 4.85, borrow: 7 },
      gmx: { supply: 5.25, borrow: 7.5 }
    }
  },
  MATIC: {
    polygon: {
      aave_v3: { supply: 3.45, borrow: 5.25 },
      aave_v2: { supply: 3.15, borrow: 4.95 },
      compound: { supply: 2.95, borrow: 4.65 },
      quickswap: { supply: 4.25, borrow: 6.5 }
    }
  },
  DAI: {
    ethereum: {
      aave_v3: { supply: 3.82, borrow: 5.15 },
      compound: { supply: 3.68, borrow: 5.25 },
      morpho: { supply: 3.95, borrow: 5.42 },
      fraxlend: { supply: 4.05, borrow: 5.35 }
    }
  },
  WBTC: {
    ethereum: {
      aave_v3: { supply: 1.85, borrow: 3.45 },
      compound: { supply: 1.52, borrow: 3.12 }
    }
  }
};

export async function getRates(chain?: string): Promise<any> {
  // Check cache
  if (ratesCache && Date.now() - ratesCache.timestamp < CACHE_TTL) {
    return chain ? ratesCache.data[chain] : ratesCache.data;
  }

  try {
    // Try to fetch from DefiLlama
    const response = await axios.get('https://yields.llama.fi/lending', {
      timeout: 5000
    });
    
    // Transform and cache
    const rates = transformLlamaRates(response.data);
    ratesCache = { data: rates, timestamp: Date.now() };
    
    return chain ? rates[chain] : rates;
  } catch (error) {
    logger.warn('Failed to fetch from DefiLlama, using cache/mock data');
    
    // Return mock data if available
    if (ratesCache) {
      return chain ? ratesCache.data[chain] : ratesCache.data;
    }
    
    // Return hardcoded mock data
    ratesCache = { data: MOCK_RATES, timestamp: Date.now() };
    return chain ? MOCK_RATES[chain] : MOCK_RATES;
  }
}

function transformLlamaRates(data: any): any {
  // Transform DefiLlama data to our format
  // This is a simplified version
  const result: any = {};
  
  // For now, just return mock data
  return MOCK_RATES;
}

export function getChains() {
  return Object.entries(CHAINS).map(([key, value]) => ({
    id: key,
    name: value.name,
    protocols: value.protocols
  }));
}

export { CHAINS };
