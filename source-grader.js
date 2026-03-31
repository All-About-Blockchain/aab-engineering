// Source Grader Configuration
// Last updated: 2026-03-31T01:06:00Z (HOURLY AUDIT)

const sources = {
  staking: {
    rocketpool: {
      url: "https://api.rocketpool.net/api/node/apr",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-03-30T21:58:00Z",
      value: "2.086% APR",
      change: "Stable: 2.086% APR. Official Rocket Pool API. Grade A.",
      note: "Grade A. Direct Rocket Pool node APR endpoint. ~2.086% APR. Stable."
    },
    lido: {
      url: "https://api.lido.fi/v1/steth/apr",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-30T13:05:00Z",
      value: null,
      error: "No output (empty response or silent failure)",
      change: "FAILED: Direct Lido API still returning no output. Remains Grade F.",
      consecutiveFailures: 13,
      note: "Grade F. Direct Lido API unreachable (13 consecutive failures). Use DeFiLlama fallback."
    },
    lido_defillama: {
      url: "https://yields.llama.fi/pools (Lido STETH pool)",
      grade: "A",
      reliability: 90,
      lastChecked: "2026-03-30T13:05:00Z",
      value: "STETH APY ~2.38% (via DeFiLlama, 30D avg 2.51%)",
      change: "Stable: Lido STETH via DeFiLlama APY 2.38%. 30D avg 2.51%. PRIMARY Lido staking source.",
      note: "PRIMARY Lido staking data source. DeFiLlama Lido STETH pool. APY 2.38%. Grade A."
    },
    etherfi: {
      url: "https://yields.llama.fi/pools (ether.fi weETH pool)",
      grade: "B",
      reliability: 85,
      lastChecked: "2026-03-30T13:05:00Z",
      value: "weETH via DeFiLlama (~2.4% APY, TVL ~$6B+)",
      note: "DeFiLlama ether.fi-stake WEETH: APY ~2.4%. TVL ~$6B+. Grade B."
    }
  },
  prices: {
    coingecko: {
      url: "https://api.coingecko.com/api/v3/simple/price",
      grade: "B",
      reliability: 90,
      lastChecked: "2026-03-30T21:58:00Z",
      params: { ids: "ethereum,solana", vs_currencies: "usd" },
      value: { ETH: 2037.46, SOL: 83.25 },
      change: "ETH $2037.46, SOL $83.25. Binance ETH $2036.59 — spread $0.87 (0.04%). Normal spread.",
      note: "Grade B. ETH $2029.51, SOL $82.62. Cross-validated vs Binance ETH $2030.90. Spread 0.07%."
    },
    binance: {
      url: "https://api.binance.com/api/v3/ticker/price",
      grade: "A",
      reliability: 92,
      lastChecked: "2026-03-30T18:53:00Z",
      params: { symbol: "ETHUSDT" },
      value: { ETH: 2073.07 },
      change: "ETH $2073.07. Fastest price source. Grade A. Spread vs CoinGecko: $0.12 (0.006%).",
      note: "Grade A. Fastest ETH price source. Primary price feed. ETH $2073.07. High reliability."
    }
  },
  yields: {
    defillama: {
      url: "https://yields.llama.fi/pools",
      grade: "B",
      reliability: 85,
      lastChecked: "2026-03-30T13:05:00Z",
      status: "operational",
      poolCount: "6000+",
      note: "Grade B. Large response returned successfully. Source stable."
    }
  },
  aab_api: {
    rates: {
      url: "https://aab.engineering/v1/rates",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-03-30T18:53:00Z",
      status: "operational",
      value: "Full multi-chain rate data returned (200 OK). ETH yields: Lido stETH 4.08%, Rocket Pool rETH 3.95%, Aave v3 2.45%. SOL yields: Jito 8.25%, Marinade 7.85%",
      note: "Grade A. Returns 200 with comprehensive multi-chain yield data. ETH Lido/rocketpool rates current."
    },
    staking_rates: {
      url: "https://aab.engineering/v1/staking/rates",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-30T13:05:00Z",
      status: "auth_required",
      error: "Missing API key - X-API-Key header required",
      value: null,
      note: "Route EXISTS (publicEndpoints listed). Requires X-API-Key header. Authenticated access only. Grade F."
    }
  }
};

module.exports = { sources };