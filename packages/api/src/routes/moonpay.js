// MoonPay routes - Fiat on/off ramp
// KYC handled by MoonPay - we just integrate

import { Router } from 'express';
import { 
  getBuyWidgetURL, 
  getSellWidgetURL, 
  getBuyQuote,
  getSupportedFiat,
  getSupportedCrypto,
  verifyWebhook,
  MoonPayTransaction
} from '../services/moonpay/index.js';

const router = Router();

// GET /v1/moonpay/buy-url - Get widget URL for buying crypto
router.get('/buy-url', async (req, res) => {
  try {
    const { walletAddress, fiatCurrency, cryptoCurrency, amount } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'walletAddress required' 
      });
    }
    
    const url = getBuyWidgetURL(
      walletAddress as string,
      fiatCurrency as string || 'CAD',
      cryptoCurrency as string || 'ETH',
      amount ? parseFloat(amount as string) : undefined
    );
    
    res.json({
      success: true,
      url,
      message: 'Open this URL in a webview to complete purchase via MoonPay'
    });
  } catch (error) {
    console.error('MoonPay buy URL error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /v1/moonpay/sell-url - Get widget URL for selling crypto
router.get('/sell-url', async (req, res) => {
  try {
    const { walletAddress, cryptoCurrency } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'walletAddress required' 
      });
    }
    
    const url = getSellWidgetURL(
      walletAddress as string,
      cryptoCurrency as string || 'ETH'
    );
    
    res.json({
      success: true,
      url,
      message: 'Open this URL in a webview to sell crypto via MoonPay'
    });
  } catch (error) {
    console.error('MoonPay sell URL error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /v1/moonpay/quote - Get buy quote
router.get('/quote', async (req, res) => {
  try {
    const { amount, fiatCurrency, cryptoCurrency } = req.query;
    
    if (!amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'amount required' 
      });
    }
    
    const quote = await getBuyQuote(
      parseFloat(amount as string),
      fiatCurrency as string || 'CAD',
      cryptoCurrency as string || 'ETH'
    );
    
    res.json({
      success: true,
      quote: {
        youPay: `${quote.baseCurrency} ${quote.baseAmount.toFixed(2)}`,
        youGet: `${quote.quoteCurrency} ${quote.quoteAmount.toFixed(6)}}`,
        fees: {
          network: `${quote.quoteCurrency} ${quote.fees.networkFee}`,
          platform: `${quote.baseCurrency} ${quote.fees.moonpayFee.toFixed(2)}`,
          total: `${quote.baseCurrency} ${quote.fees.total.toFixed(2)}`
        }
      }
    });
  } catch (error) {
    console.error('MoonPay quote error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /v1/moonpay/supported/fiat - Get supported fiat currencies
router.get('/supported/fiat', async (req, res) => {
  try {
    const currencies = await getSupportedFiat();
    res.json({ success: true, currencies });
  } catch (error) {
    res.json({ success: true, currencies: ['CAD', 'USD', 'EUR', 'GBP'] });
  }
});

// GET /v1/moonpay/supported/crypto - Get supported crypto
router.get('/supported/crypto', async (req, res) => {
  try {
    const currencies = await getSupportedCrypto();
    res.json({ success: true, currencies });
  } catch (error) {
    res.json({ success: true, currencies: ['ETH', 'BTC', 'SOL', 'USDC', 'USDT'] });
  }
});

// POST /v1/moonpay/webhook - Handle MoonPay callbacks
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['moonpay-signature'] as string;
    const webhookSecret = process.env.MOONPAY_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const body = JSON.stringify(req.body);
      if (!verifyWebhook(body, signature, webhookSecret)) {
        return res.status(401).json({ success: false, error: 'Invalid signature' });
      }
    }
    
    const event = req.body as MoonPayTransaction;
    
    // Handle different event types
    switch (event.type) {
      case 'payment_completed':
      case 'order_completed':
        // Update user balance in database
        console.log(`MoonPay: Order completed - ${event.cryptoAmount} ${event.cryptoCurrency} to ${event.walletAddress}`);
        break;
        
      case 'payment_failed':
      case 'order_failed':
        console.log(`MoonPay: Order failed - ${event.id}`);
        break;
        
      default:
        console.log(`MoonPay: Unknown event - ${event.type}`);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('MoonPay webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
