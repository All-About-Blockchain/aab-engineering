// Self-Optimizing Data Source Manager
// Grades, tracks, and auto-selects best sources

import axios from 'axios';

// Source grading system
const SOURCE_GRADES = {
  // Grade A: Primary verified sources (on-chain, official APIs)
  A: {
    weight: 1.0,
    label: 'Verified',
    color: '#22c55e'
  },
  // Grade B: Secondary trusted sources (well-known aggregators)
  B: {
    weight: 0.7,
    label: 'Trusted',
    color: '#3b82f6'
  },
  // Grade C: Community/known estimates
  C: {
    weight: 0.4,
    label: 'Estimated',
    color: '#f59e0b'
  },
  // Grade F: Failed/unreliable
  F: {
    weight: 0,
    label: 'Failed',
    color: '#ef4444'
  }
};

// Data source registry with grades
let SOURCE_REGISTRY = {
  // STAKING SOURCES
  staking: {
    rocketpool_api: {
      url: 'https://api.rocketpool.net/api/node/apr',
      grade: 'A',
      provenance: 'Official RPC/API',
      reliability: 0.98,
      calls: 0,
      successes: 0,
      lastLatency: 0,
      lastCheck: null
    },
    lido_api: {
      url: 'https://api.lido.fi/v1/steth/apr',
      grade: 'A',
      provenance: 'Official Lido API',
      reliability: 0.95,
      calls: 0,
      successes: 0,
      lastLatency: 0,
      lastCheck: null
    },
    coingecko_staking: {
      url: 'https://api.coingecko.com/api/v3/coins/staked-ether/market_data',
      grade: 'B',
      provenance: 'CoinGecko (aggregator)',
      reliability: 0.85,
      calls: 0,
      successes: 0,
      lastLatency: 0,
      lastCheck: null
    }
  },
  // PRICES
  prices: {
    coingecko: {
      url: 'https://api.coingecko.com/api/v3/simple/price',
      grade: 'A',
      provenance: 'CoinGecko (major aggregator)',
      reliability: 0.95,
      calls: 0,
      successes: 0,
      lastLatency: 0,
      lastCheck: null
    },
    binance: {
      url: 'https://api.binance.com/api/v3/ticker/price',
      grade: 'A',
      provenance: 'Binance (exchange)',
      reliability: 0.97,
      calls: 0,
      successes: 0,
      lastLatency: 0,
      lastCheck: null
    },
    defillama: {
      url: 'https://api.llama.fi/prices',
      grade: 'B',
      provenance: 'DeFiLlama (aggregator)',
      reliability: 0.88,
      calls: 0,
      successes: 0,
      lastLatency: 0,
      lastCheck: null
    }
  },
  // YIELDS
  yields: {
    aave_api: {
      url: 'https://api.aave.com/v3/protocolV3/ethereum/overview',
      grade: 'A',
      provenance: 'Official Aave API',
      reliability: 0.96,
      calls: 0,
      successes: 0,
      lastLatency: 0,
      lastCheck: null
    },
    defillama_yields: {
      url: 'https://yields.llama.fi/pools',
      grade: 'B',
      provenance: 'DeFiLlama (aggregator)',
      reliability: 0.85,
      calls: 0,
      successes: 0,
      lastLatency: 0,
      lastCheck: null
    }
  }
};

// Track source performance
export function trackSourceCall(category, sourceId, success, latency) {
  const source = SOURCE_REGISTRY[category]?.[sourceId];
  if (!source) return;
  
  source.calls++;
  source.lastLatency = latency;
  source.lastCheck = Date.now();
  
  if (success) {
    source.successes++;
    // Upgrade grade if 10+ calls and 95%+ success
    if (source.calls >= 10 && source.successes / source.calls >= 0.95 && source.grade !== 'A') {
      source.grade = 'A';
      source.provenance += ' (upgraded)';
    }
  } else {
    // Downgrade if 3+ failures
    const failures = source.calls - source.successes;
    if (failures >= 3 && source.grade !== 'F') {
      source.grade = source.grade === 'A' ? 'B' : 'F';
    }
  }
}

// Calculate weighted score for category
export function getBestSource(category) {
  const sources = SOURCE_REGISTRY[category];
  if (!sources) return null;
  
  let best = null;
  let bestScore = -1;
  
  for (const [id, source] of Object.entries(sources)) {
    if (source.grade === 'F') continue;
    
    const gradeWeight = SOURCE_GRADES[source.grade]?.weight || 0;
    const reliability = source.reliability || 0.5;
    const recencyBonus = source.lastCheck ? Math.max(0, 1 - (Date.now() - source.lastCheck) / (24 * 60 * 60 * 1000)) : 0;
    
    const score = gradeWeight * reliability * (1 + recencyBonus * 0.1);
    
    if (score > bestScore) {
      bestScore = score;
      best = { id, ...source, score };
    }
  }
  
  return best;
}

// Get all sources with grades
export function getSourceGrades() {
  const result = {};
  
  for (const [category, sources] of Object.entries(SOURCE_REGISTRY)) {
    result[category] = {};
    for (const [id, source] of Object.entries(sources)) {
      result[category][id] = {
        grade: source.grade,
        gradeLabel: SOURCE_GRADES[source.grade]?.label,
        provenance: source.provenance,
        reliability: source.reliability,
        successRate: source.calls > 0 ? (source.successes / source.calls * 100).toFixed(1) + '%' : 'N/A',
        calls: source.calls,
        lastLatency: source.lastLatency + 'ms'
      };
    }
  }
  
  return result;
}

// Auto-discover new source
export async function discoverSource(category, url, name, provenance) {
  const start = Date.now();
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const latency = Date.now() - start;
    
    if (response.data) {
      // Add as new source with initial grade C
      SOURCE_REGISTRY[category][name] = {
        url,
        grade: 'C',
        provenance,
        reliability: 0.6,
        calls: 1,
        successes: 1,
        lastLatency: latency,
        lastCheck: Date.now(),
        autoDiscovered: true
      };
      
      return { success: true, latency, grade: 'C' };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
  
  return { success: false, error: 'No data' };
}

export { SOURCE_GRADES, SOURCE_REGISTRY };
