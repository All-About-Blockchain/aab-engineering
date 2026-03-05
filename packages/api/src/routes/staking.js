// Staking routes for stakefolio

import { Router } from 'express';
import { getStakingRates, getStakingRatesByChain, getStakingAsset } from '../services/staking/index.js';

const router = Router();

// GET /v1/staking/rates - All staking rates
router.get('/rates', async (req, res) => {
  try {
    const { chain } = req.query;
    
    let assets;
    if (chain) {
      assets = await getStakingRatesByChain(chain);
    } else {
      assets = await getStakingRates();
    }
    
    res.json({
      success: true,
      count: assets.length,
      assets: assets.map(a => ({
        id: a.id,
        name: a.name,
        symbol: a.symbol,
        protocol: a.protocol,
        chain: a.chain,
        apy: a.apy,
        type: a.type
      }))
    });
  } catch (error) {
    console.error('Staking rates error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch staking rates' });
  }
});

// GET /v1/staking/rates/:assetId - Single asset rate
router.get('/rates/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;
    const asset = await getStakingAsset(assetId);
    
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }
    
    res.json({
      success: true,
      asset: {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        protocol: asset.protocol,
        chain: asset.chain,
        tokenAddress: asset.tokenAddress,
        apy: asset.apy,
        type: asset.type
      }
    });
  } catch (error) {
    console.error('Staking rate error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch staking rate' });
  }
});

// POST /v1/staking/deposit - Get deposit transaction data
router.post('/deposit', async (req, res) => {
  try {
    const { assetId, amount, userAddress } = req.body;
    
    if (!assetId || !amount || !userAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: assetId, amount, userAddress' 
      });
    }
    
    const asset = await getStakingAsset(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }
    
    // Generate deposit transaction based on protocol
    const txData = await generateDepositTx(asset, amount, userAddress);
    
    res.json({
      success: true,
      deposit: {
        assetId: asset.id,
        amount,
        userAddress,
        txData,
        estimatedOutput: amount, // 1:1 for liquid staking
        apy: asset.apy
      }
    });
  } catch (error) {
    console.error('Staking deposit error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate deposit transaction' });
  }
});

// POST /v1/staking/withdraw - Get withdraw transaction data
router.post('/withdraw', async (req, res) => {
  try {
    const { assetId, amount, userAddress } = req.body;
    
    if (!assetId || !amount || !userAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: assetId, amount, userAddress' 
      });
    }
    
    const asset = await getStakingAsset(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }
    
    // Generate withdraw transaction
    const txData = await generateWithdrawTx(asset, amount, userAddress);
    
    res.json({
      success: true,
      withdraw: {
        assetId: asset.id,
        amount,
        userAddress,
        txData,
        estimatedOutput: amount,
        unbondingPeriod: getUnbondingPeriod(asset.protocol)
      }
    });
  } catch (error) {
    console.error('Staking withdraw error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate withdraw transaction' });
  }
});

// Helper: Generate deposit transaction
async function generateDepositTx(asset, amount, userAddress) {
  // Different logic per protocol
  switch (asset.protocol) {
    case 'lido':
      return {
        to: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        value: amount,
        data: '0x', // Lido uses ERC-20 approve + deposit
        gasEstimate: '150000'
      };
    case 'rocketpool':
      return {
        to: '0x2DAC63E344D20C3c7BFc7F68A4fb9EBF5B4E2f4c',
        value: amount,
        data: '0x',
        gasEstimate: '200000'
      };
    case 'etherfi':
      return {
        to: '0x62Bc5F6DfE6f59d7f52b4d5d6e7F9F7cF8c7dE9a',
        value: amount,
        data: '0x',
        gasEstimate: '150000'
      };
    case 'jito':
    case 'marinade':
      // Solana - return instruction data
      return {
        chain: 'solana',
        protocol: asset.protocol,
        amount,
        userAddress,
        instructions: [] // Would be populated with actual Solana instructions
      };
    default:
      throw new Error(`Unknown protocol: ${asset.protocol}`);
  }
}

// Helper: Generate withdraw transaction
async function generateWithdrawTx(asset, amount, userAddress) {
  switch (asset.protocol) {
    case 'lido':
      return {
        to: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        value: '0',
        data: '0x', // withdrawal request
        gasEstimate: '200000'
      };
    case 'rocketpool':
      return {
        to: '0x2DAC63E344D20C3c7BFc7F68A4fb9EBF5B4E2f4c',
        value: '0',
        data: '0x',
        gasEstimate: '250000'
      };
    case 'jito':
    case 'marinade':
      return {
        chain: 'solana',
        protocol: asset.protocol,
        amount,
        userAddress,
        instructions: []
      };
    default:
      throw new Error(`Unknown protocol: ${asset.protocol}`);
  }
}

// Helper: Get unbonding period
function getUnbondingPeriod(protocol) {
  const periods = {
    lido: '1-5 days',
    rocketpool: '13-17 days',
    etherfi: '7-10 days',
    jito: '0 days (instant)',
    marinade: '2-3 days'
  };
  return periods[protocol] || 'unknown';
}

export default router;
