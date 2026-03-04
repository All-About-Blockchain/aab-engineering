// Wallet routes - MPC via TurnKey
// Non-custodial: user controls keys, we facilitate

import { Router } from 'express';
import { createWallet, getWallet, signTransaction, getUserWallets, getWalletBalance } from '../services/wallet/index.js';

const router = Router();

// POST /v1/wallet/create - Create new MPC wallet
router.post('/create', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId required' 
      });
    }
    
    const wallet = await createWallet(userId);
    
    res.json({
      success: true,
      wallet: {
        id: wallet.walletId,
        address: wallet.address,
        publicKey: wallet.publicKey
      },
      message: 'Wallet created. You control the keys - never share your seed phrase.'
    });
  } catch (error) {
    console.error('Wallet create error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /v1/wallet/:walletId - Get wallet info
router.get('/:walletId', async (req, res) => {
  try {
    const { walletId } = req.params;
    
    const wallet = await getWallet(walletId);
    
    if (!wallet) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wallet not found' 
      });
    }
    
    res.json({
      success: true,
      wallet: {
        id: wallet.walletId,
        address: wallet.address,
        publicKey: wallet.publicKey
      }
    });
  } catch (error) {
    console.error('Wallet get error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /v1/wallet/:walletId/balance - Get wallet balance
router.get('/:walletId/balance', async (req, res) => {
  try {
    const { walletId } = req.params;
    const { chain } = req.query;
    
    const wallet = await getWallet(walletId);
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }
    
    const balance = await getWalletBalance(wallet.address, (chain as any) || 'ethereum');
    
    res.json({
      success: true,
      walletId,
      address: wallet.address,
      chain: chain || 'ethereum',
      balance
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /v1/wallet/:walletId/sign - Sign transaction (user must approve)
router.post('/:walletId/sign', async (req, res) => {
  try {
    const { walletId } = req.params;
    const { to, value, data } = req.body;
    
    if (!to || !value) {
      return res.status(400).json({ 
        success: false, 
        error: 'to and value required' 
      });
    }
    
    // This creates a signing request
    // User must approve via email/2FA before signing
    const signature = await signTransaction(walletId, to, value, data || '0x');
    
    res.json({
      success: true,
      walletId,
      signature: {
        r: signature.r,
        s: signature.s,
        v: signature.v
      },
      message: 'Transaction signed. Awaiting broadcast.'
    });
  } catch (error) {
    console.error('Sign error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /v1/wallet/user/:userId - Get all wallets for user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const wallets = await getUserWallets(userId);
    
    res.json({
      success: true,
      count: wallets.length,
      wallets: wallets.map(w => ({
        id: w.walletId,
        address: w.address,
        publicKey: w.publicKey
      }))
    });
  } catch (error) {
    console.error('User wallets error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
