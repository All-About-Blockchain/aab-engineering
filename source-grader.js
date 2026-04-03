// Source Grader Configuration
// Last updated: 2026-04-03T14:46:00Z (HOURLY AUDIT)

const sources = {
  staking: {
    rocketpool: {
      url: "https://api.rocketpool.net/api/node/apr",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-04-02T08:41:00Z",
      value: "2.01% APR",
      change: "Stable: 2.01% APR. Official Rocket Pool API. Grade A.",
      note: "Grade A. Direct Rocket Pool node APR endpoint. ~2.01% APR. Stable."
    },
    lido: {
      url: "https://api.lido.fi/v1/steth/apr",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-04-02T08:41:00Z",
      value: null,
      error: "exit code 6 - connection failed",
      change: "FAILED: Direct Lido API unreachable. Use DeFiLlama fallback.",
      note: "Grade F. Direct Lido API unreachable (16+ consecutive failures). Use DeFiLlama fallback (lido_defillama)."
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
      lastChecked: "2026-04-03T14:46:00Z",
      params: { ids: "ethereum,solana", vs_currencies: "usd" },
      value: { ETH: 2050.89, SOL: 79.86 },
      change: "ETH $2050.89, SOL $79.86. Binance ETH $2051.74 — spread $0.85 (0.04%). Tight spread.",
      note: "Grade B. ETH $2050.89, SOL $79.86. Cross-validated vs Binance ETH $2051.74. Spread 0.04%."
    },
    binance: {
      url: "https://api.binance.com/api/v3/ticker/price",
      grade: "A",
      reliability: 92,
      lastChecked: "2026-04-03T14:46:00Z",
      params: { symbol: "ETHUSDT" },
      value: { ETH: 2051.74 },
      change: "ETH $2051.74. Fastest price source. Grade A.",
      note: "Grade A. Fastest ETH price source. Primary price feed. ETH $2051.74. High reliability."
    }
  },
  yields: {
    defillama: {
      url: "https://yields.llama.fi/pools",
      grade: "B",
      reliability: 90,
      lastChecked: "2026-04-02T02:13:00Z",
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
      lastChecked: "2026-04-03T14:46:00Z",
      status: "operational",
      value: "Full multi-chain rate data returned (200 OK). ETH yields: Lido stETH 4.08%, Rocket Pool rETH 3.95%, Aave v3 2.45%. SOL yields: Jito 8.25%, Marinade 7.85%. USDC: Aave v3 4.12% supply, 5.68% borrow.",
      note: "Grade A. Returns 200 with comprehensive multi-chain yield data. ETH Lido/rocketpool rates current."
    },
    staking_rates: {
      url: "https://aab.engineering/v1/staking/rates",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-04-03T14:46:00Z",
      status: "auth_required",
      error: "Missing API key - X-API-Key header required",
      value: null,
      note: "Route EXISTS (publicEndpoints listed). Requires X-API-Key header. Authenticated access only. Grade F."
    }
  }
};

module.exports = { sources };