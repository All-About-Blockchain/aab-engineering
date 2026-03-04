// Staking service - fetches rates from liquid staking protocols

import axios from 'axios';

// Protocol interfaces
export interface StakingAsset {
  id: string;
  name: string;
  symbol: string;
  protocol: string;
  chain: string;
  tokenAddress: string;
  apy: number;
  type: 'liquid' | 'native';
  depositToken: string; // What user receives
}

export interface StakingPosition {
  assetId: string;
  amount: string;
  valueUsd: number;
  rewards: string;
}

// Lido API
async function getLidoAPY(): Promise<number> {
  try {
    const response = await axios.get('https://api.lido.fi/v1/steth/apr', {
      timeout: 5000
    });
    return response.data.apr || 0;
  } catch (e) {
    return 0.041; // Fallback ~4.1%
  }
}

// Rocket Pool API
async function getRocketPoolAPY(): Promise<number> {
  try {
    const response = await axios.get('https://api.rocketpool.net/api/node/apr', {
      timeout: 5000
    });
    return (response.data.nodeApy || 0) / 100;
  } catch (e) {
    return 0.039; // Fallback ~3.9%
  }
}

// Jito API
async function getJitoAPY(): Promise<number> {
  try {
    const response = await axios.get('https://api.jito.network/api/v1/apr', {
      timeout: 5000
    });
    return response.data.apr || 0;
  } catch (e) {
    return 0.082; // Fallback ~8.2%
  }
}

// Marinade API
async function getMarinadeAPY(): Promise<number> {
  try {
    const response = await axios.get('https://api.marinade.finance/v2/stats/apr', {
      timeout: 5000
    });
    return (response.data.apr || 0) / 100;
  } catch (e) {
    return 0.075; // Fallback ~7.5%
  }
}

// Ether.fi API
async function getEtherFiAPY(): Promise<number> {
  try {
    const response = await axios.get('https://api.etherfi.io/v1/apr', {
      timeout: 5000
    });
    return response.data.apr || 0;
  } catch (e) {
    return 0.045; // Fallback ~4.5%
  }
}

// Fetch all staking rates
export async function getStakingRates(): Promise<StakingAsset[]> {
  const [lidoAPY, rocketAPY, jitoAPY, marinadeAPY, etherAPY] = await Promise.all([
    getLidoAPY(),
    getRocketPoolAPY(),
    getJitoAPY(),
    getMarinadeAPY(),
    getEtherFiAPY()
  ]);

  return [
    {
      id: 'steth',
      name: 'Lido Staked ETH',
      symbol: 'stETH',
      protocol: 'lido',
      chain: 'ethereum',
      tokenAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      apy: lidoAPY,
      type: 'liquid',
      depositToken: '0xEeeeeEeeeEeEeeEdeeEAdEAdEeEeeFEEeeeeEEE'
    },
    {
      id: 'reth',
      name: 'Rocket Pool ETH',
      symbol: 'rETH',
      protocol: 'rocketpool',
      chain: 'ethereum',
      tokenAddress: '0xae78736Cd615f374D3085123A210178E74C77554',
      apy: rocketAPY,
      type: 'liquid',
      depositToken: '0xEeeeeEeeeEeEeeEdeeEAdEAdEeEeeFEEeeeeEEE'
    },
    {
      id: 'ezeth',
      name: 'Ether.fi ezETH',
      symbol: 'ezETH',
      protocol: 'etherfi',
      chain: 'ethereum',
      tokenAddress: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
      apy: etherAPY,
      type: 'liquid',
      depositToken: '0xEeeeeEeeeEeEeeEdeeEAdEAdEeEeeFEEeeeeEEE'
    },
    {
      id: 'jitosol',
      name: 'Jito SOL',
      symbol: 'jitoSOL',
      protocol: 'jito',
      chain: 'solana',
      tokenAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtkqjberbSOWd91pbT2',
      apy: jitoAPY,
      type: 'liquid',
      depositToken: 'So11111111111111111111111111111111111111112'
    },
    {
      id: 'msol',
      name: 'Marinade SOL',
      symbol: 'mSOL',
      protocol: 'marinade',
      chain: 'solana',
      tokenAddress: 'mSoLzYCxHdYgdzU18gCGEQXyZat4HMdKJHKpLusGvza',
      apy: marinadeAPY,
      type: 'liquid',
      depositToken: 'So11111111111111111111111111111111111111112'
    }
  ];
}

// Get rates for specific chain
export async function getStakingRatesByChain(chain: string): Promise<StakingAsset[]> {
  const allRates = await getStakingRates();
  return allRates.filter(asset => asset.chain.toLowerCase() === chain.toLowerCase());
}

// Get single asset
export async function getStakingAsset(assetId: string): Promise<StakingAsset | null> {
  const allRates = await getStakingRates();
  return allRates.find(asset => asset.id === assetId) || null;
}
