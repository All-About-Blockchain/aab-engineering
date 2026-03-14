// Source Grader Configuration
// Last updated: 2026-03-14T15:33:00-06:00 (HOURLY AUDIT)

const sources = {
  staking: {
    rocketpool: {
      url: "https://api.rocketpool.net/api/node/apr",
      grade: "A",
      reliability: 100,
      lastChecked: "2026-03-14T15:33:00-06:00",
      value: "1.99%",
      note: "ONLINE - Official Rocket Pool API. On-chain verified. Returns rETH APR 1.99%"
    },
    lido: {
      url: "https://api.lido.fi/v1/steth/apr",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-14T15:33:00-06:00",
      value: "FAILED",
      error: "Exit code 6 - Couldn't resolve host (DNS/CORS failure)",
      note: "FAILED - Use cached value ~4.08% (Lido stETH from aab API)"
    }
  },
  prices: {
    coingecko: {
      url: "https://api.coingecko.com/api/v3/simple/price",
      grade: "B",
      reliability: 95,
      lastChecked: "2026-03-14T15:33:00-06:00",
      params: { ids: "ethereum,solana", vs_currencies: "usd" },
      values: { ETH: 2083.55, SOL: 87.01 },
      note: "Trusted aggregator - operational"
    },
    binance: {
      url: "https://api.binance.com/api/v3/ticker/price",
      grade: "A",
      reliability: 98,
      lastChecked: "2026-03-14T15:33:00-06:00",
      params: { symbol: "ETHUSDT" },
      value: 2083.81,
      note: "Real-time exchange price - primary price source"
    }
  },
  yields: {
    defillama: {
      url: "https://yields.llama.fi/pools",
      grade: "B",
      reliability: 90,
      lastChecked: "2026-03-14T15:33:00-06:00",
      poolCount: "~600+ pools returned",
      sample: { ETH: "various" },
      note: "Large dataset - operational"
    }
  },
  aab_api: {
    rates: {
      url: "https://aab.engineering/v1/rates",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-03-14T15:33:00-06:00",
      status: "operational",
      data: { 
        USDC: { ethereum: { aave_v3: { supply: 4.12, borrow: 5.68 } } }, 
        ETH: { lido_steth: { supply: 4.08 }, rocketpool_reth: { supply: 3.95 } }, 
        SOL: { jito: { supply: 8.25, borrow: 12.5 }, marinade: { supply: 7.85 } } 
      },
      note: "Internal API working - yield data available"
    },
    staking_rates: {
      url: "https://aab.engineering/v1/staking/rates",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-14T15:33:00-06:00",
      error: "401 - Missing API key",
      note: "Protected - requires X-API-Key header. Use /v1/rates for public data."
    }
  }
};

module.exports = { sources };
