// Source Grader Configuration
// Last updated: 2026-03-21T02:07:00Z (HOURLY AUDIT)

const sources = {
  staking: {
    rocketpool: {
      url: "https://api.rocketpool.net/api/node/apr",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-03-21T02:07:00Z",
      value: "1.945% APR",
      note: "Stable Grade A. Direct Rocket Pool node APR endpoint. 1.945% (consistent with previous cycle)."
    },
    lido: {
      url: "https://api.lido.fi/v1/steth/apr",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-21T02:07:00Z",
      value: null,
      error: "Empty response (API down)",
      note: "DOWN 5+ consecutive cycles. DeFiLlama Lido STETH pool is primary Lido data source (Grade A, 2.447% APY, $19.83B TVL)."
    },
    lido_defillama: {
      url: "https://yields.llama.fi/pools (Lido STETH pool)",
      grade: "A",
      reliability: 90,
      lastChecked: "2026-03-21T02:07:00Z",
      value: "2.447% APY",
      tvlUsd: 19833157589,
      note: "DeFiLlama Lido STETH pool. APY: 2.447%, TVL: ~$19.83B (up $360M from last cycle). Primary Lido staking data source."
    },
    etherfi: {
      url: "https://yields.llama.fi/pools (ether.fi weETH pool)",
      grade: "B",
      reliability: 85,
      lastChecked: "2026-03-21T02:07:00Z",
      value: "2.774% APY",
      tvlUsd: 6189510588,
      note: "DeFiLlama ether.fi-stake WEETH: APY 2.774% (base 2.683% + reward 0.091%). TVL: ~$6.19B."
    }
  },
  prices: {
    coingecko: {
      url: "https://api.coingecko.com/api/v3/simple/price",
      grade: "A",
      reliability: 92,
      lastChecked: "2026-03-21T02:07:00Z",
      params: { ids: "ethereum,solana", vs_currencies: "usd" },
      value: { ETH: 2147.59, SOL: 89.83 },
      note: "Stable Grade A. Cross-validated vs Binance: variance 0.055% ($1.19). Best multi-asset price coverage."
    },
    binance: {
      url: "https://api.binance.com/api/v3/ticker/price",
      grade: "A",
      reliability: 94,
      lastChecked: "2026-03-21T02:07:00Z",
      params: { symbol: "ETHUSDT" },
      value: { ETH: 2148.78 },
      note: "Fastest ETH price source. Primary price feed. ETH price: $2148.78 (cross-validates CoinGecko at $2147.59, 0.055% spread)."
    }
  },
  yields: {
    defillama: {
      url: "https://yields.llama.fi/pools",
      grade: "A",
      reliability: 88,
      lastChecked: "2026-03-21T02:07:00Z",
      poolCount: "6000+",
      note: "DeFiLlama pools endpoint fully operational. 6000+ pools. Best overall yield data aggregator."
    }
  },
  aab_api: {
    rates: {
      url: "https://aab.engineering/v1/rates",
      grade: "A",
      reliability: 95,
      lastChecked: "2026-03-21T02:07:00Z",
      status: "operational",
      data: "comprehensive lending/borrowing rates for USDC, ETH, USDT, SOL, ATOM, INJ, AVAX, MATIC across Aave V3, Lido, RocketPool, Morpho, Kamino, Solend, Neptune, etc.",
      note: "Internal API fully operational. ETH Aave V3: 2.45%/4.12%. Kamino SOL: 5.2%/7.5%. Morpho ETH USDC: 4.25%/5.82%. SOL Jito: 8.25%/12.5%. INJ Neptune: 8.5%/12.5%. Aave Base USDC: 4.95%/6.45%. STRIDE ATOM: 18.5%."
    },
    staking_rates: {
      url: "https://aab.engineering/v1/staking/rates",
      grade: "F",
      reliability: 0,
      lastChecked: "2026-03-21T02:07:00Z",
      error: "403 Missing API key",
      note: "BUG PERSISTS (5+ cycles): Listed in publicEndpoints but requires auth. Backend fix needed - expose publicly or remove from publicEndpoints list."
    }
  }
};

module.exports = { sources };
