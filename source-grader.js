// Source Grader Configuration
// Last updated: 2026-03-29T00:10:00Z (HOURLY AUDIT)

const sources = {
  staking: {
    rocketpool: {
      url: "https://api.rocketpool.net/api/node/apr",
      grade: "A",
      reliability: 98,
      lastChecked: "2026-03-29T00:10:00Z",
      value: "2.09% APR",
      change: "Stable: 2.09% APR. Official Rocket Pool API.",
      note: "Grade A. Direct Rocket Pool node APR endpoint. ~2.09% APR. Stable."
    },
    lido: {
      url: "https://api.lido.fi/v1/steth/apr",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-29T00:10:00Z",
      value: null,
      error: "curl exit code 6 - connection failed",
      change: "FAILED: Direct Lido API unreachable (exit code 6). Remains Grade F.",
      consecutiveFailures: 10,
      note: "Grade F. Direct API failing for 10 consecutive checks. Use DeFiLlama fallback."
    },
    lido_defillama: {
      url: "https://yields.llama.fi/pools (Lido STETH pool)",
      grade: "A",
      reliability: 90,
      lastChecked: "2026-03-28T22:07:00Z",
      value: "STETH APY ~2.43% (via DeFiLlama)",
      change: "Stable: Lido STETH via DeFiLlama. PRIMARY Lido staking data source.",
      note: "PRIMARY Lido staking data source. DeFiLlama Lido STETH pool. APY ~2.43%. Grade A."
    },
    etherfi: {
      url: "https://yields.llama.fi/pools (ether.fi weETH pool)",
      grade: "B",
      reliability: 85,
      lastChecked: "2026-03-28T22:07:00Z",
      value: "weETH via DeFiLlama (~2.4% APY)",
      note: "DeFiLlama ether.fi-stake WEETH: APY ~2.4%. TVL ~$6B+. Grade B."
    }
  },
  prices: {
    coingecko: {
      url: "https://api.coingecko.com/api/v3/simple/price",
      grade: "B",
      reliability: 95,
      lastChecked: "2026-03-29T00:10:00Z",
      params: { ids: "ethereum,solana", vs_currencies: "usd" },
      value: { ETH: 1994.02, SOL: 82.1 },
      change: "ETH $1994.02, SOL $82.10. Binance ETH $1997.03 — spread $3.01 (0.15%).",
      note: "Grade B. ETH $1994.02, SOL $82.10. Cross-validated vs Binance ETH $1997.03."
    },
    binance: {
      url: "https://api.binance.com/api/v3/ticker/price",
      grade: "A",
      reliability: 99,
      lastChecked: "2026-03-29T00:10:00Z",
      params: { symbol: "ETHUSDT" },
      value: { ETH: 1997.03 },
      change: "ETH $1997.03. Fastest price source. Grade A.",
      note: "Grade A. Fastest ETH price source. Primary price feed. ETH $1997.03."
    }
  },
  yields: {
    defillama: {
      url: "https://yields.llama.fi/pools",
      grade: "B",
      reliability: 75,
      lastChecked: "2026-03-28T22:07:00Z",
      status: "operational (large response)",
      poolCount: "6000+",
      note: "Grade B. Large response returned but parse timeout occurred. Consider caching."
    }
  },
  aab_api: {
    rates: {
      url: "https://aab.engineering/v1/rates",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-03-29T00:10:00Z",
      status: "operational",
      value: "Full multi-chain rate data returned (200 OK)",
      note: "Grade A. Returns 200 with comprehensive multi-chain yield data. Reliability 95."
    },
    staking_rates: {
      url: "https://aab.engineering/v1/staking/rates",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-29T00:10:00Z",
      status: "auth_required",
      error: "Missing API key - X-API-Key header required",
      value: null,
      note: "Route EXISTS (publicEndpoints listed). Requires X-API-Key header. Authenticated access only. Grade F."
    }
  }
};

module.exports = { sources };