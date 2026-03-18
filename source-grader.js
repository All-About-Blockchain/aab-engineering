// Source Grader Configuration
// Last updated: 2026-03-18T10:13:00-06:00 (HOURLY AUDIT)

const sources = {
  staking: {
    rocketpool: {
      url: "https://api.rocketpool.net/api/node/apr",
      grade: "A",
      reliability: 100,
      lastChecked: "2026-03-18T10:13:00-06:00",
      value: "1.945%",
      note: "Operational - On-chain verified APR"
    },
    lido: {
      url: "https://api.lido.fi/v1/steth/apr",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-18T10:13:00-06:00",
      value: "FAILED",
      error: "Exit code 6 - host resolution failed",
      note: "OFFLINE - Using cached value ~4.08% from aab API lido_steth"
    }
  },
  prices: {
    coingecko: {
      url: "https://api.coingecko.com/api/v3/simple/price",
      grade: "B",
      reliability: 95,
      lastChecked: "2026-03-18T10:13:00-06:00",
      params: { ids: "ethereum,solana", vs_currencies: "usd" },
      value: { ETH: 2180.87, SOL: 89.01 },
      note: "Operational - slightly lower than Binance ($3.95 spread)"
    },
    binance: {
      url: "https://api.binance.com/api/v3/ticker/price",
      grade: "A",
      reliability: 100,
      lastChecked: "2026-03-18T10:13:00-06:00",
      params: { symbol: "ETHUSDT" },
      value: 2176.92,
      note: "Operational - Real-time exchange price, primary ETH price source"
    }
  },
  yields: {
    defillama: {
      url: "https://yields.llama.fi/pools",
      grade: "B",
      reliability: 92,
      lastChecked: "2026-03-18T10:13:00-06:00",
      poolCount: "300+ pools returned",
      note: "Operational - comprehensive yield data"
    }
  },
  aab_api: {
    rates: {
      url: "https://aab.engineering/v1/rates",
      grade: "A",
      reliability: 100,
      lastChecked: "2026-03-18T10:13:00-06:00",
      status: "operational",
      note: "Internal API operational - multi-chain yield data available"
    },
    staking_rates: {
      url: "https://aab.engineering/v1/staking/rates",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-18T10:13:00-06:00",
      error: "401 - Missing API key",
      note: "Protected - requires X-API-Key header. Use /v1/rates for public data."
    }
  }
};

module.exports = { sources };