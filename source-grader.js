// Source Grader Configuration
// Last updated: 2026-03-11T12:20:00-07:00 (HOURLY AUDIT)

const sources = {
  staking: {
    rocketpool: {
      url: "https://api.rocketpool.net/api/node/apr",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-03-11T12:20:00-07:00",
      apr: "2.11%",
      note: "OPERATIONAL - Official Rocket Pool API, on-chain verified"
    },
    lido: {
      url: "https://api.lido.fi/v1/steth/apr",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-11T12:20:00-07:00",
      error: "FAILED - Exit code 6 (connection failed)",
      note: "OFFLINE - Endpoint failing persistently, investigate alternative or wait for recovery"
    }
  },
  prices: {
    coingecko: {
      url: "https://api.coingecko.com/api/v3/simple/price",
      grade: "B",
      reliability: 95,
      lastChecked: "2026-03-11T12:20:00-07:00",
      params: { ids: "ethereum,solana", vs_currencies: "usd" },
      values: { ETH: 2068.74, SOL: 87.78 },
      note: "Trusted aggregator - operational, prices updated"
    },
    binance: {
      url: "https://api.binance.com/api/v3/ticker/price",
      grade: "A",
      reliability: 98,
      lastChecked: "2026-03-11T12:20:00-07:00",
      params: { symbol: "ETHUSDT" },
      value: 2071.70,
      note: "Real-time exchange price - primary price source"
    }
  },
  yields: {
    defillama: {
      url: "https://yields.llama.fi/pools",
      grade: "B",
      reliability: 92,
      lastChecked: "2026-03-11T12:20:00-07:00",
      poolCount: "~600+ pools returned",
      note: "Large dataset - operational, returns comprehensive yield data"
    }
  },
  aab_api: {
    rates: {
      url: "https://aab.engineering/v1/rates",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-03-11T12:20:00-07:00",
      status: "operational",
      note: "Internal API working - yield data available for multiple tokens/chains"
    },
    staking_rates: {
      url: "https://aab.engineering/v1/staking/rates",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-11T12:20:00-07:00",
      error: "Requires API key - endpoint protected",
      note: "Public endpoint exists but requires X-API-Key header"
    }
  }
};

module.exports = { sources };
