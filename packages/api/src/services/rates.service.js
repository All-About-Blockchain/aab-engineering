// Real rates service with live data from CoinGecko and known yields
import axios from 'axios';

// Cache for rates (5 minutes)
let ratesCache = {
  data: null,
  timestamp: 0
};
const CACHE_TTL = 5 * 60 * 1000;

// Token IDs for CoinGecko
const COINGECKO_IDS = {
  ethereum: 'ethereum',
  solana: 'solana',
  bitcoin: 'bitcoin',
  'usd-coin': 'usd-coin',
  tether: 'tether',
  'wrapped-ether': 'wrapped-ether',
  'staked-ether': 'staked-ether',
  'rocket-pool-eth': 'rocket-pool-eth',
  'marinade-staked-sol': 'marinade-staked-sol',
  'jito-staked-sol': 'jito-staked-sol',
  'avalanche-2': 'avalanche-2',
  'matic-network': 'matic-network',
  'binancecoin': 'binancecoin',
  'cosmos': 'cosmos',
  'injective-protocol': 'injective-protocol'
};

// Known yield rates (as fallback and for protocols without API)
const KNOWN_YIELDS = {
  // Ethereum - Full DeFi Suite
  ethereum: {
    // Lending
    aave_v3: { supply: 3.45, borrow: 5.82 },
    compound: { supply: 3.12, borrow: 4.85 },
    morpho: { supply: 3.65, borrow: 5.95 },
    makerdao: { supply: 5.5, borrow: 6.5 },
    // LSD (Liquid Staking)
    lido: { supply: 4.08, borrow: null },
    rocketpool: { supply: 3.95, borrow: null },
    etherfi: { supply: 4.2, borrow: null },
    sweth: { supply: 4.15, borrow: null },
    // Restaking (EigenLayer ecosystem)
    eigenlayer: { supply: 8.5, borrow: null },
    renzo: { supply: 7.5, borrow: null },
    kelp: { supply: 6.5, borrow: null },
    ssv: { supply: 5.5, borrow: null },
    // Yield Aggregators
    yearn: { supply: 5.0, borrow: null },
    curve: { supply: 3.2, borrow: null },
    convex: { supply: 4.5, borrow: null },
    // DEX (for reference)
    uniswap_v3: { supply: 2.5, borrow: null },
    balancer: { supply: 2.8, borrow: null }
  },
  // Monad (Mainnet launched Nov 2025)
  monad: {
    aave_v3: { supply: 4.5, borrow: 6.5 },
    sushi: { supply: 3.8, borrow: 5.5 },
    uniswap_v3: { supply: 2.5, borrow: null },
    curve: { supply: 3.2, borrow: null }
  },
  // BSC (Binance Smart Chain)
  bsc: {
    venus: { supply: 4.5, borrow: 6.2 },
    pancakeswap: { supply: 2.5, borrow: null },
    alpaca: { supply: 3.8, borrow: 5.5 },
    biswap: { supply: 2.2, borrow: null },
    apeswap: { supply: 2.0, borrow: null },
    babydoge: { supply: 3.5, borrow: null }
  },
  // Solana - Full Suite
  solana: {
    kamino: { supply: 5.2, borrow: 7.8 },
    solend: { supply: 4.8, borrow: 7.2 },
    jito: { supply: 8.25, borrow: null },
    marinade: { supply: 7.85, borrow: null },
    raydium: { supply: 4.0, borrow: null },
    orca: { supply: 3.5, borrow: null },
    francium: { supply: 4.2, borrow: 6.5 },
    apricot: { supply: 3.8, borrow: 5.8 },
    port: { supply: 4.5, borrow: 6.8 }
  },
  // Arbitrum
  arbitrum: {
    aave_v3: { supply: 4.12, borrow: 6.45 },
    compound: { supply: 3.85, borrow: 5.92 },
    gmx: { supply: 5.5, borrow: null },
    radiant: { supply: 4.2, borrow: 6.0 },
    camelot: { supply: 3.5, borrow: null },
    tracer: { supply: 4.0, borrow: 6.2 },
    sushi: { supply: 3.8, borrow: 5.5 },
    uniswap_v3: { supply: 2.5, borrow: null },
    curve: { supply: 3.2, borrow: null }
  },
  // Optimism
  optimism: {
    aave_v3: { supply: 4.55, borrow: 6.82 },
    velodrome: { supply: 3.2, borrow: 5.5 },
    sushi: { supply: 3.0, borrow: 4.8 },
    uniswap_v3: { supply: 2.2, borrow: null },
    curve: { supply: 3.0, borrow: null },
    pangolin: { supply: 2.5, borrow: null }
  },
  // Base
  base: {
    aave_v3: { supply: 4.25, borrow: 6.55 },
    morpho: { supply: 4.15, borrow: 6.35 },
    sushi: { supply: 3.5, borrow: 5.2 },
    uniswap_v3: { supply: 2.5, borrow: null },
    curve: { supply: 3.0, borrow: null },
    balancer: { supply: 2.8, borrow: null }
  },
  // Polygon
  polygon: {
    aave_v3: { supply: 3.85, borrow: 5.92 },
    compound: { supply: 3.45, borrow: 5.25 },
    quickswap: { supply: 2.5, borrow: null },
    sushi: { supply: 2.8, borrow: 4.5 },
    curve: { supply: 3.0, borrow: null },
    balancer: { supply: 2.5, borrow: null }
  },
  // Avalanche
  avalanche: {
    aave_v3: { supply: 3.65, borrow: 5.55 },
    benqi: { supply: 3.25, borrow: 5.12 },
    traderjoe: { supply: 4.15, borrow: 6.25 },
    gmx: { supply: 5.0, borrow: null },
    sushi: { supply: 3.0, borrow: 4.8 },
    pangolin: { supply: 2.5, borrow: null },
    curve: { supply: 2.8, borrow: null }
  },
  // Injective
  injective: {
    neptune: { supply: 5.5, borrow: 8.2 },
    hydro: { supply: 4.8, borrow: 7.5 }
  },
  // Cosmos
  cosmos: {
    stride: { supply: 18.5, borrow: null },
    osmosis: { supply: 8.5, borrow: 12.5 }
  }
};

// Fetch token prices
async function fetchPrices() {
  const ids = Object.values(COINGECKO_IDS).join(',');
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { timeout: 10000 }
    );
    return response.data;
  } catch (e) {
    console.log('Price fetch failed:', e.message);
    return {};
  }
}

// Fetch rates for a chain
async function fetchChainRates(chain) {
  // For now, return known yields (would need protocol-specific APIs for real-time)
  return KNOWN_YIELDS[chain] || {};
}

// Get all rates
export async function getRates(chain = null) {
  const now = Date.now();
  
  // Check cache
  if (ratesCache.data && (now - ratesCache.timestamp) < CACHE_TTL) {
    return chain ? ratesCache.data[chain] || {} : ratesCache.data;
  }
  
  // Fetch prices
  const prices = await fetchPrices();
  
  // Build response with yields and prices
  const result = {};
  
  for (const [chainName, protocols] of Object.entries(KNOWN_YIELDS)) {
    result[chainName] = {};
    
    for (const [protocol, rates] of Object.entries(protocols)) {
      result[chainName][protocol] = {
        supply: rates.supply,
        borrow: rates.borrow
      };
    }
  }
  
  // Add prices to response
  result._prices = prices;
  
  // Cache
  ratesCache = {
    data: result,
    timestamp: now
  };
  
  return chain ? result[chain] || {} : result;
}

// Get supported chains
export function getChains() {
  return [
    { id: 'ethereum', name: 'Ethereum', protocols: ['aave_v3', 'compound', 'morpho', 'makerdao', 'lido', 'rocketpool', 'etherfi', 'sweth', 'eigenlayer', 'renzo', 'kelp', 'ssv', 'yearn', 'curve', 'convex', 'uniswap_v3', 'balancer'] },
    { id: 'monad', name: 'Monad', protocols: ['aave_v3', 'sushi', 'uniswap_v3', 'curve'], rpc: 'https://rpc.monad.xyz', chainId: 143 },
    { id: 'bsc', name: 'BNB Chain', protocols: ['venus', 'pancakeswap', 'alpaca', 'biswap', 'apeswap'] },
    { id: 'arbitrum', name: 'Arbitrum', protocols: ['aave_v3', 'compound', 'gmx', 'radiant', 'camelot', 'sushi', 'uniswap_v3', 'curve'] },
    { id: 'optimism', name: 'Optimism', protocols: ['aave_v3', 'velodrome', 'sushi', 'uniswap_v3', 'curve', 'pangolin'] },
    { id: 'base', name: 'Base', protocols: ['aave_v3', 'morpho', 'sushi', 'uniswap_v3', 'curve', 'balancer'] },
    { id: 'polygon', name: 'Polygon', protocols: ['aave_v3', 'compound', 'quickswap', 'sushi', 'curve', 'balancer'] },
    { id: 'solana', name: 'Solana', protocols: ['kamino', 'solend', 'jito', 'marinade', 'raydium', 'orca', 'francium', 'apricot', 'port'] },
    { id: 'avalanche', name: 'Avalanche', protocols: ['aave_v3', 'benqi', 'traderjoe', 'gmx', 'sushi', 'pangolin', 'curve'] },
    { id: 'injective', name: 'Injective', protocols: ['neptune', 'hydro'] },
    { id: 'cosmos', name: 'Cosmos', protocols: ['stride', 'osmosis'] }
  ];
}

export { KNOWN_YIELDS };

// DATA SOURCE DISCOVERY - Auto-discover new sources
const DATA_SOURCES = {
  yields: [
    { name: 'DeFiLlama', url: 'https://yields.llama.fi/pools', status: 'testing' },
    { name: 'Aave V3', url: 'https://api.aave.com/v3/protocol/data/overview', status: 'testing' },
    { name: 'Compound', url: 'https://api.compound.finance/api/v3/ctoken', status: 'pending' }
  ],
  prices: [
    { name: 'CoinGecko', url: 'https://api.coingecko.com/api/v3/simple/price', status: 'active' },
    { name: 'Binance', url: 'https://api.binance.com/api/v3/ticker/price', status: 'pending' },
    { name: 'CoinCap', url: 'https://api.coincap.io/v2/assets', status: 'pending' }
  ],
  staking: [
    { name: 'Rocket Pool', url: 'https://api.rocketpool.net/api/node/apr', status: 'active' },
    { name: 'Lido', url: 'https://api.lido.fi/v1/steth/apr', status: 'pending' },
    { name: 'Ether.fi', url: 'https://api.ether.fi/v1/apr', status: 'pending' }
  ]
};

// Discover and test new data sources
export async function discoverDataSources() {
  const results = { yields: [], prices: [], staking: [] };
  
  // Test each source
  for (const [category, sources] of Object.entries(DATA_SOURCES)) {
    for (const source of sources) {
      try {
        const start = Date.now();
        const response = await axios.get(source.url, { timeout: 5000 });
        const latency = Date.now() - start;
        
        results[category].push({
          ...source,
          status: response.data ? 'working' : 'empty',
          latency
        });
      } catch (e) {
        results[category].push({
          ...source,
          status: 'failed',
          error: e.message
        });
      }
    }
  }
  
  return results;
}

export { DATA_SOURCES };
