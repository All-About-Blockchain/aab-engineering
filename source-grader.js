// Source Grader Configuration
// Last updated: 2026-03-06 05:00

const sources = {
  staking: {
    rocketpool: {
      url: "https://api.rocketpool.net/api/node/apr",
      grade: "A",
      reliability: 98,
      lastChecked: "2026-03-06T05:00:00Z",
      value: 2.14
    },
    lido: {
      url: "https://api.lido.fi/v1/steth/apr",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-06T05:00:00Z",
      error: "Connection failed"
    }
  },
  prices: {
    coingecko: {
      url: "https://api.coingecko.com/api/v3/simple/price",
      grade: "B",
      reliability: 95,
      lastChecked: "2026-03-06T05:00:00Z",
      params: { ids: "ethereum,solana", vs_currencies: "usd" }
    },
    binance: {
      url: "https://api.binance.com/api/v3/ticker/price",
      grade: "A",
      reliability: 99,
      lastChecked: "2026-03-06T05:00:00Z",
      params: { symbol: "ETHUSDT" }
    }
  },
  yields: {
    defillama: {
      url: "https://yields.llama.fi/pools",
      grade: "B",
      reliability: 92,
      lastChecked: "2026-03-06T05:00:00Z"
    }
  }
};

module.exports = { sources };
