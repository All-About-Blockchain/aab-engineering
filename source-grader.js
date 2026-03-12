// Source Grader Configuration
// Last updated: 2026-03-12T05:49:00-07:00 (HOURLY AUDIT)

const sources = {
  staking: {
    rocketpool: {
      url: "https://api.rocketpool.net/api/node/apr",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-03-12T05:49:00-07:00",
      apr: "2.09%",
      note: "OPERATIONAL - Official Rocket Pool API, on-chain verified"
    },
    lido: {
      url: "https://api.lido.fi/v1/steth/apr",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-12T05:49:00-07:00",
      error: "FAILED - Exit code 6 (connection/resolve failed)",
      note: "OFFLINE - Endpoint failing for 2+ hours, investigate alternative"
    }
  },
  prices: {
    coingecko: {
      url: "https://api.coingecko.com/api/v3/simple/price",
      grade: "B",
      reliability: 88,
      lastChecked: "2026-03-12T05:49:00-07:00",
      params: { ids: "ethereum,solana", vs_currencies: "usd" },
      values: { eth: 2073.42, sol: 86.97 },
      note: "RECOVERED - Working again, provides multi-asset prices"
    },
    binance: {
      url: "https://api.binance.com/api/v3/ticker/price",
      grade: "A",
      reliability: 98,
      lastChecked: "2026-03-12T05:49:00-07:00",
      params: { symbol: "ETHUSDT" },
      value: 2070.46,
      note: "Real-time exchange price - PRIMARY price source"
    }
  },
  yields: {
    defillama: {
      url: "https://yields.llama.fi/pools",
      grade: "B",
      reliability: 92,
      lastChecked: "2026-03-12T05:49:00-07:00",
      poolCount: "~600+ pools returned",
      note: "Large dataset - operational, Lido STETH at 2.43% APY"
    }
  },
  aab_api: {
    rates: {
      url: "https://aab.engineering/v1/rates",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-03-12T05:49:00-07:00",
      status: "operational",
      note: "Internal API working - yield data available for multiple tokens/chains"
    },
    staking_rates: {
      url: "https://aab.engineering/v1/staking/rates",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-12T05:49:00-07:00",
      error: "Requires API key - endpoint protected",
      note: "Public endpoint now requires X-API-Key - broken for public access"
    }
  }
};

module.exports = { sources };
