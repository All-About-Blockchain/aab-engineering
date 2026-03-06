// x402 Payment Protocol Integration
// Per-request payments in USDC

import axios from 'axios';

// x402 header name
const PAYMENT_HEADER = 'x-payment';

// Price list (in USDC cents = $0.01)
const PRICES = {
  // Free tier
  free: { calls: 100, period: 'hour' },
  
  // Rate queries
  '/health': { price: 0, name: 'Health check' },
  '/v1/chains': { price: 0, name: 'Chain list' },
  '/v1/rates': { price: 1, name: 'Yield rates' }, // $0.01
  '/v1/bridge/config': { price: 0, name: 'Bridge config' },
  '/v1/bridge/chains': { price: 0, name: 'Bridge chains' },
  '/v1/swap/tokens': { price: 0, name: 'Swap tokens' },
  '/v1/staking/rates': { price: 1, name: 'Staking rates' },
  
  // Premium (authenticated)
  '/v1/bridge/quote': { price: 5, name: 'Bridge quote' },
  '/v1/bridge/routes': { price: 5, name: 'Bridge routes' },
  '/v1/swap/quote': { price: 5, name: 'Swap quote' },
  '/v1/staking/deposit': { price: 25, name: 'Staking deposit tx' },
  '/v1/staking/withdraw': { price: 25, name: 'Staking withdraw tx' },
  '/v1/wallet/create': { price: 50, name: 'Wallet creation' },
  '/v1/wallet/sign': { price: 10, name: 'Transaction signing' },
  '/v1/moonpay/buy-url': { price: 5, name: 'MoonPay widget' },
  '/v1/moonpay/quote': { price: 2, name: 'MoonPay quote' },
};

// Free tier limits (in-memory, would use Redis in production)
const freeTierLimits = new Map();

// USDC token on Ethereum (would be chain-specific in production)
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

// Payment wallet (would be configured via env)
const PAYMENT_WALLET = process.env.PAYMENT_WALLET || '0x0000000000000000000000000000000000000000';

// x402 payment verification
export async function verifyPayment(payment, endpoint, payer) {
  // Free endpoint
  if (!PRICES[endpoint] || PRICES[endpoint].price === 0) {
    return { valid: true, price: 0, reason: 'free endpoint' };
  }
  
  // Check free tier
  const freeUsage = freeTierLimits.get(payer) || { count: 0, periodStart: Date.now() };
  const hourMs = 60 * 60 * 1000;
  
  // Reset if new hour
  if (Date.now() - freeUsage.periodStart > hourMs) {
    freeUsage.count = 0;
    freeUsage.periodStart = Date.now();
  }
  
  // Within free tier
  if (freeUsage.count < PRICES.free.calls) {
    freeUsage.count++;
    freeTierLimits.set(payer, freeUsage);
    return { valid: true, price: 0, reason: 'free tier', remaining: PRICES.free.calls - freeUsage.count };
  }
  
  // Check x402 payment format
  // Format: USDC:<amount>:<signature>
  if (!payment) {
    return { valid: false, price: PRICES[endpoint].price, reason: 'payment required' };
  }
  
  const parts = payment.split(':');
  if (parts[0] !== 'USDC' || parts.length < 2) {
    return { valid: false, price: PRICES[endpoint].price, reason: 'invalid payment format' };
  }
  
  const amount = parseInt(parts[1]);
  const requiredPrice = PRICES[endpoint].price;
  
  if (amount < requiredPrice) {
    return { valid: false, price: requiredPrice, amount, reason: 'insufficient payment' };
  }
  
  // In production: verify signature and transfer
  // For now, accept payments
  return { 
    valid: true, 
    price: requiredPrice, 
    amount,
    payer,
    reason: 'paid'
  };
}

// Get price for endpoint
export function getPrice(endpoint) {
  return PRICES[endpoint]?.price || 0;
}

// Get all prices
export function getPriceList() {
  return Object.entries(PRICES).map(([endpoint, info]) => ({
    endpoint,
    price: info.price,
    priceUsd: (info.price / 100).toFixed(2),
    name: info.name
  }));
}

// Middleware for x402
export function x402Middleware(req, res, next) {
  const endpoint = req.path;
  const payer = req.headers['x-payer'] || req.ip;
  const payment = req.headers[PAYMENT_HEADER];
  
  // Skip for public endpoints
  if (!PRICES[endpoint] || PRICES[endpoint].price === 0) {
    return next();
  }
  
  // Check API key (already handled by authMiddleware)
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    // API key holders get free tier
    return next();
  }
  
  // Verify payment
  verifyPayment(payment, endpoint, payer).then(result => {
    if (!result.valid) {
      return res.status(402).json({
        success: false,
        error: 'Payment required',
        required: {
          price: result.price,
          priceUsd: '$' + (result.price / 100).toFixed(2),
          reason: result.reason,
          accept: `USDC:${result.price}`
        },
        endpoint: endpoint,
        learnMore: 'https://x402.org'
      });
    }
    
    // Add payment info to request
    req.payment = result;
    next();
  }).catch(next);
}

// x402 response header
export function setPaymentHeaders(res, price) {
  res.set('Accept-Payment', 'USDC:' + price);
  if (price > 0) {
    res.set('x-payment-required', price.toString());
  }
}

export { PRICES, USDC_ADDRESS, PAYMENT_WALLET };
