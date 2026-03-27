// Source Grader Configuration
// Last updated: 2026-03-27T05:50:00Z (HOURLY AUDIT)

const sources = {
  staking: {
    rocketpool: {
      url: "https://api.rocketpool.net/api/node/apr",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-03-27T05:50:00Z",
      value: "2.088% APR",
      change: "Stable: 2.088% APR. Official Rocket Pool API.",
      note: "Grade A. Direct Rocket Pool node APR endpoint. ~2.088% APR. Stable."
    },
    lido: {
      url: "https://api.lido.fi/v1/steth/apr",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-27T05:50:00Z",
      value: null,
      error: "curl exit code 6 - could not resolve host",
      change: "FAILED: Direct Lido API unreachable. Remains Grade F.",
      consecutiveFailures: 4,
      note: "Grade F. Direct API failing - connection error. Fallback to DeFiLlama required."
    },
    lido_defillama: {
      url: "https://yields.llama.fi/pools (Lido STETH pool)",
      grade: "A",
      reliability: 90,
      lastChecked: "2026-03-27T05:50:00Z",
      value: "STETH APY ~2.43% (via DeFiLlama)",
      change: "Stable: Lido STETH via DeFiLlama. PRIMARY Lido staking data source.",
      note: "PRIMARY Lido staking data source. DeFiLlama Lido STETH pool. APY ~2.43%. Grade A."
    },
    etherfi: {
      url: "https://yields.llama.fi/pools (ether.fi weETH pool)",
      grade: "B",
      reliability: 85,
      lastChecked: "2026-03-27T05:50:00Z",
      value: "weETH via DeFiLlama (~2.4% APY)",
      note: "DeFiLlama ether.fi-stake WEETH: APY ~2.4%. TVL ~$6B+. Grade B."
    }
  },
  prices: {
    coingecko: {
      url: "https://api.coingecko.com/api/v3/simple/price",
      grade: "B",
      reliability: 90,
      lastChecked: "2026-03-27T05:50:00Z",
      params: { ids: "ethereum,solana", vs_currencies: "usd" },
      value: { ETH: 2057.69, SOL: 85.99 },
      change: "ETH $2057.69, SOL $85.99. Binance ETH $2058.59 — spread $0.90 (0.044%).",
      note: "Grade B. ETH $2057.69, SOL $85.99. Cross-validated vs Binance ETH $2058.59. Very tight spread."
    },
    binance: {
      url: "https://api.binance.com/api/v3/ticker/price",
      grade: "B",
      reliability: 90,
      lastChecked: "2026-03-27T05:50:00Z",
      params: { symbol: "ETHUSDT" },
      value: { ETH: 2058.59 },
      change: "ETH $2058.59. Fastest price source.",
      note: "Grade B. Fastest ETH price source. Primary price feed. ETH $2058.59."
    }
  },
  yields: {
    defillama: {
      url: "https://yields.llama.fi/pools",
      grade: "A",
      reliability: 88,
      lastChecked: "2026-03-27T05:50:00Z",
      status: "operational",
      poolCount: "6000+",
      note: "Grade A. Full data returned successfully. 6000+ pools. Operational."
    }
  },
  aab_api: {
    rates: {
      url: "https://aab.engineering/v1/rates",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-03-27T05:50:00Z",
      status: "operational",
      value: "Full multi-chain rate data returned (200 OK)",
      note: "Grade A. Returns 200 with comprehensive multi-chain yield data. Reliability 95."
    },
    staking_rates: {
      url: "https://aab.engineering/v1/staking/rates",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-27T05:50:00Z",
      status: "auth_required",
      value: null,
      note: "Route EXISTS (publicEndpoints listed). Requires X-API-Key header. Authenticated access only. Grade F."
    }
  }
};

module.exports = { sources };