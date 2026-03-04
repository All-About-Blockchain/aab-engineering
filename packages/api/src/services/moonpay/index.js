// MoonPay Service - Fiat on/off ramp
// MoonPay handles all KYC - we just integrate the widget

import axios from 'axios';

const MOONPAY_API = 'https://api.moonpay.com';
const MOONPAY_WIDGET = 'https://buy.moonpay.com';

export interface BuyQuote {
  baseCurrency: string;
  quoteCurrency: string;
  baseAmount: number;
  quoteAmount: number;
  fees: {
    networkFee: number;
    moonpayFee: number;
    total: number;
  };
}

export interface SellQuote {
  baseCurrency: string;
  quoteCurrency: number;
  baseAmount: number;
  quoteAmount: number;
}

// Get signed widget URL for buying crypto
export function getBuyWidgetURL(
  walletAddress: string,
  fiatCurrency: string = 'CAD',
  cryptoCurrency: string = 'ETH',
  amount?: number
): string {
  const publicKey = process.env.MOONPAY_PUBLIC_KEY;
  
  if (!publicKey) {
    throw new Error('MoonPay not configured');
  }

  const params = new URLSearchParams({
    apiKey: publicKey,
    walletAddress,
    currencyCode: cryptoCurrency,
    fiatCurrency: fiatCurrency,
    externalCustomerId: walletAddress, // Link to our user
    ...(amount && { amount: amount.toString() })
  });

  return `${MOONPAY_WIDGET}?${params.toString()}`;
}

// Get signed widget URL for selling crypto
export function getSellWidgetURL(
  walletAddress: string,
  cryptoCurrency: string = 'ETH'
): string {
  const publicKey = process.env.MOONPAY_PUBLIC_KEY;
  
  if (!publicKey) {
    throw new Error('MoonPay not configured');
  }

  const params = new URLSearchParams({
    apiKey: publicKey,
    walletAddress,
    currencyCode: cryptoCurrency,
    type: 'sell',
    externalCustomerId: walletAddress
  });

  return `https://sell.moonpay.com?${params.toString()}`;
}

// Get buy quote (fiat amount → crypto)
export async function getBuyQuote(
  fiatAmount: number,
  fiatCurrency: string = 'CAD',
  cryptoCurrency: string = 'ETH'
): Promise<BuyQuote> {
  const publicKey = process.env.MOONPAY_PUBLIC_KEY;
  
  if (!publicKey) {
    // Return mock for demo
    return getMockBuyQuote(fiatAmount, cryptoCurrency);
  }

  try {
    const response = await axios.get(`${MOONPAY_API}/v1/currencies/${cryptoCurrency}/buy_quote`, {
      params: {
        baseCurrencyAmount: fiatAmount,
        baseCurrencyCode: fiatCurrency,
        apiKey: publicKey
      },
      timeout: 10000
    });

    return {
      baseCurrency: fiatCurrency,
      quoteCurrency: cryptoCurrency,
      baseAmount: response.data.baseCurrencyAmount,
      quoteAmount: response.data.quoteCurrencyAmount,
      fees: {
        networkFee: response.data.networkFee || 0,
        moonpayFee: response.data.fees?.moonpay?.amount || 0,
        total: response.data.totalAmount - response.data.quoteCurrencyAmount
      }
    };
  } catch (error) {
    return getMockBuyQuote(fiatAmount, cryptoCurrency);
  }
}

// Get supported fiat currencies
export async function getSupportedFiat(): Promise<string[]> {
  try {
    const response = await axios.get(`${MOONPAY_API}/v1/currencies/fiat`, {
      timeout: 10000
    });
    return response.data.map((c: any) => c.code);
  } catch (error) {
    return ['CAD', 'USD', 'EUR', 'GBP'];
  }
}

// Get supported crypto currencies
export async function getSupportedCrypto(): Promise<string[]> {
  try {
    const response = await axios.get(`${MOONPAY_API}/v1/currencies`, {
      params: { type: 'crypto' },
      timeout: 10000
    });
    return response.data
      .filter((c: any) => c.isSupportedForBuy || c.isSupportedForSell)
      .map((c: any) => c.code);
  } catch (error) {
    return ['ETH', 'BTC', 'SOL', 'USDC', 'USDT'];
  }
}

// Verify webhook signature
export function verifyWebhook(
  body: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return signature === expected;
}

// Mock quote for demo
function getMockBuyQuote(fiatAmount: number, cryptoCurrency: string): BuyQuote {
  const rates: Record<string, number> = {
    ETH: 3500,
    BTC: 85000,
    SOL: 120,
    USDC: 1,
    USDT: 1
  };

  const rate = rates[cryptoCurrency] || 3000;
  const cryptoAmount = fiatAmount / rate;
  const fee = fiatAmount * 0.0499; // ~5% fee

  return {
    baseCurrency: 'CAD',
    quoteCurrency: cryptoCurrency,
    baseAmount: fiatAmount,
    quoteAmount: cryptoAmount,
    fees: {
      networkFee: cryptoCurrency === 'BTC' ? 0.0001 : 0.001,
      moonpayFee: fee,
      total: fee + (cryptoCurrency === 'BTC' ? 35 : 5)
    }
  };
}

// Webhook event types
export type MoonPayEventType = 
  | 'payment_pending'
  | 'payment_completed'
  | 'payment_failed'
  | 'order_completed'
  | 'order_failed';

export interface MoonPayTransaction {
  id: string;
  type: 'buy' | 'sell';
  status: string;
  cryptoAmount: string;
  cryptoCurrency: string;
  fiatAmount: string;
  fiatCurrency: string;
  walletAddress: string;
  externalCustomerId: string;
}
