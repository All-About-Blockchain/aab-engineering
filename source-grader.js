// Source Grader Configuration
// Last updated: 2026-03-18T03:56:00-06:00 (HOURLY AUDIT)

const sources = {
  staking: {
    rocketpool: {
      url: "https://api.rocketpool.net/api/node/apr",
      grade: "A",
      reliability: 98,
      lastChecked: "2026-03-18T03:56:00-06:00",
      value: "1.95%",
      note: "Operational - On-chain verified APR"
    },
    lido: {
      url: "https://api.lido.fi/v1/steth/apr",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-18T03:56:00-06:00",
      value: "FAILED",
      error: "Exit code 6 - connection issue (persistent)",
      note: "OFFLINE - Using cached value ~4.08% from aab API lido_steth"
    }
  },
  prices: {
    coingecko: {
      url: "https://api.coingecko.com/api/v3/simple/price",
      grade: "B",
      reliability: 90,
      lastChecked: "2026-03-18T03:56:00-06:00",
      params: { ids: "ethereum,solana", vs_currencies: "usd" },
      value: { ETH: 2328.60, SOL: 94.27 },
      note: "Operational"
    },
    binance: {
      url: "https://api.binance.com/api/v3/ticker/price",
      grade: "A",
      reliability: 99,
      lastChecked: "2026-03-18T03:56:00-06:00",
      params: { symbol: "ETHUSDT" },
      value: 2327.84,
      note: "Operational - Real-time exchange price, primary ETH price source"
    }
  },
  yields: {
    defillama: {
      url: "https://yields.llama.fi/pools",
      grade: "B",
      reliability: 92,
      lastChecked: "2026-03-18T03:56:00-06:00",
      poolCount: "~600+ pools returned",
      note: "Operational - comprehensive yield data"
    }
  },
  aab_api: {
    rates: {
      url: "https://aab.engineering/v1/rates",
      grade: "A",
      reliability: 100,
      lastChecked: "2026-03-18T03:56:00-06:00",
      status: "operational",
      data: { 
        USDC: { ethereum: { aave_v3: { supply: 4.12, borrow: 5.68 }, compound: { supply: 3.82, borrow: 5.42 }, morpho: { supply: 4.25, borrow: 5.82 } }, arbitrum: { aave_v3: { supply: 4.85, borrow: 6.25 } }, optimism: { aave_v3: { supply: 4.55, borrow: 6.02 } }, base: { aave_v3: { supply: 4.95, borrow: 6.45 } }, solana: { kamino: { supply: 5.2, borrow: 7.5 }, solend: { supply: 4.8, borrow: 7.2 } }, injective: { neptune: { supply: 5, borrow: 7.2 } } }, 
        ETH: { ethereum: { aave_v3: { supply: 2.45, borrow: 4.12 }, lido_steth: { supply: 4.08 }, rocketpool_reth: { supply: 3.95 } }, solana: { jito: { supply: 8.25, borrow: 12.5 }, marinade: { supply: 7.85 } } }, 
        SOL: { solana: { jito: { supply: 8.25, borrow: 12.5 }, marinade: { supply: 7.85 } } }
      },
      note: "Internal API operational - multi-chain yield data available"
    },
    staking_rates: {
      url: "https://aab.engineering/v1/staking/rates",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-18T03:56:00-06:00",
      error: "401 - Missing API key",
      note: "Protected - requires X-API-Key header. Use /v1/rates for public data."
    }
  }
};

module.exports = { sources };