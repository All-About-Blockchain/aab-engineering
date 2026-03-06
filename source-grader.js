// Source Grader - AAB Engineering Data Quality
// Auto-optimized: 2026-03-05T22:01:00-07:00

const sources = {
  rocket_pool: {
    url: 'https://api.rocketpool.net/api/node/apr',
    grade: 'A',
    reliability: 100,
    type: 'official'
  },
  coingecko: {
    url: 'https://api.coingecko.com/api/v3/simple/price',
    grade: 'B',
    reliability: 95,
    type: 'aggregator'
  },
  lido: {
    url: 'https://api.lido.fi/v1/steth/apr',
    grade: 'F',
    reliability: 0,
    type: 'official',
    needsRetry: true
  },
  binance: {
    url: 'https://api.binance.com/api/v3/ticker/price',
    grade: 'A',
    reliability: 98,
    type: 'exchange'
  },
  defillama: {
    url: 'https://yields.llama.fi/pools',
    grade: 'B',
    reliability: 90,
    type: 'aggregator'
  }
};

module.exports = { sources };
