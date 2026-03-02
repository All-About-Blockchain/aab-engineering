// Rates service with mock data
const CHAINS = {
  ethereum: { name: 'Ethereum', protocols: ['aave_v3', 'compound', 'morpho', 'etherfi', 'lido', 'rocketpool'] },
  arbitrum: { name: 'Arbitrum', protocols: ['aave_v3', 'compound', 'radient'] },
  optimism: { name: 'Optimism', protocols: ['aave_v3', 'velodrome'] },
  base: { name: 'Base', protocols: ['aave_v3', 'morpho', 'moonwell'] },
  polygon: { name: 'Polygon', protocols: ['aave_v3', 'compound'] },
  solana: { name: 'Solana', protocols: ['kamino', 'solend', 'jito', 'marinade'] },
  osmosis: { name: 'Osmosis', protocols: ['osmosis', 'astroport'] },
  injective: { name: 'Injective', protocols: ['neptune', 'hydro'] },
  cosmos: { name: 'Cosmos Hub', protocols: ['stride', 'quicksilver'] },
  avalanche: { name: 'Avalanche', protocols: ['aave_v3', 'benqi', 'traderjoe', 'gmx'] }
};

const MOCK_RATES = {
  USDC: {
    ethereum: { aave_v3: { supply: 4.12, borrow: 5.68 }, compound: { supply: 3.82, borrow: 5.42 }, morpho: { supply: 4.25, borrow: 5.82 } },
    arbitrum: { aave_v3: { supply: 4.85, borrow: 6.25 } },
    optimism: { aave_v3: { supply: 4.55, borrow: 6.02 } },
    base: { aave_v3: { supply: 4.95, borrow: 6.45 } },
    solana: { kamino: { supply: 5.2, borrow: 7.5 }, solend: { supply: 4.8, borrow: 7.2 } },
    injective: { neptune: { supply: 5, borrow: 7.2 } }
  },
  ETH: {
    ethereum: { aave_v3: { supply: 2.45, borrow: 4.12 }, lido_steth: { supply: 4.08 }, rocketpool_reth: { supply: 3.95 } },
    solana: { jito: { supply: 8.25, borrow: 12.5 }, marinade: { supply: 7.85 } }
  },
  USDT: { ethereum: { aave_v3: { supply: 3.95, borrow: 5.42 } }, solana: { kamino: { supply: 5, borrow: 7.2 } } },
  SOL: { solana: { jito: { supply: 8.25, borrow: 12.5 }, marinade: { supply: 7.85 } } },
  ATOM: { cosmos: { stride: { supply: 18.5 }, osmosis: { supply: 8.5, borrow: 12.5 } } },
  INJ: { injective: { neptune: { supply: 8.5, borrow: 12.5 } } },
  AVAX: { avalanche: { aave_v3: { supply: 3.25, borrow: 4.95 }, benqi: { supply: 3.55, borrow: 5.25 } } },
  MATIC: { polygon: { aave_v3: { supply: 3.45, borrow: 5.25 } } }
};

export async function getRates(chain) {
  return chain ? MOCK_RATES[chain] || {} : MOCK_RATES;
}

export function getChains() {
  return Object.entries(CHAINS).map(([key, value]) => ({
    id: key,
    name: value.name,
    protocols: value.protocols
  }));
}

export { CHAINS };
