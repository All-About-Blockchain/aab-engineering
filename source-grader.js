// Source Grader Configuration
// Last updated: 2026-03-08T01:06:00Z

const sources = {
  staking: {
    rocketpool: {
      url: "https://api.rocketpool.net/api/node/apr",
      grade: "A",
      reliability: 98,
      lastChecked: "2026-03-08T01:06:00Z",
      value: 2.1275
    },
    lido: {
      url: "https://api.lido.fi/v1/steth/apr",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-08T01:06:00Z",
      error: "Connection failed (curl exit code 6)"
    }
  },
  prices: {
    coingecko: {
      url: "https://api.coingecko.com/api/v3/simple/price",
      grade: "B",
      reliability: 90,
      lastChecked: "2026-03-08T01:06:00Z",
      params: { ids: "ethereum,solana", vs_currencies: "usd" },
      values: { ETH: 1952.62, SOL: 82.88 }
    },
    binance: {
      url: "https://api.binance.com/api/v3/ticker/price",
      grade: "A",
      reliability: 99,
      lastChecked: "2026-03-08T01:06:00Z",
      params: { symbol: "ETHUSDT" },
      value: 1953.89
    }
  },
  yields: {
    defillama: {
      url: "https://yields.llama.fi/pools",
      grade: "B",
      reliability: 85,
      lastChecked: "2026-03-08T01:06:00Z"
    }
  },
  aab_api: {
    rates: {
      url: "https://aab.engineering/v1/rates",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-03-08T01:06:00Z",
      status: "operational"
    },
    staking_rates: {
      url: "https://aab.engineering/v1/staking/rates",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-08T01:06:00Z",
      error: "Requires API key"
    }
  }
};

module.exports = { sources };
