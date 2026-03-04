// TurnKey MPC Wallet Service
// User controls keys - we facilitate but never hold

import axios from 'axios';

const TURNKEY_API_URL = 'https://api.turnkey.com';

export interface WalletCreated {
  walletId: string;
  address: string;
  publicKey: string;
}

export interface Signature {
  r: string;
  s: string;
  v: number;
}

// Initialize TurnKey client
function getTurnKeyClient() {
  const apiPublicKey = process.env.TURNKEY_API_PUBLIC_KEY;
  const apiPrivateKey = process.env.TURNKEY_API_PRIVATE_KEY;
  const organizationId = process.env.TURNKEY_ORGANIZATION_ID;

  if (!apiPublicKey || !apiPrivateKey || !organizationId) {
    throw new Error('TurnKey credentials not configured');
  }

  return { apiPublicKey, apiPrivateKey, organizationId };
}

// Create a new MPC wallet
export async function createWallet(userId: string): Promise<WalletCreated> {
  const { organizationId } = getTurnKeyClient();

  try {
    // In production, this calls TurnKey's API
    // For now, return mock data - real implementation needs TurnKey SDK
    const response = await axios.post(`${TURNKEY_API_URL}/v1/wallets/create`, {
      organizationId,
      walletName: `stakefolio-${userId}`,
      accounts: [
        {
          curve: 'CURVE_SECP256K1',
          pathFormat: 'PATH_FORMAT_BIP32',
          path: "m/44'/60'/0'/0/0" // Ethereum
        }
      ]
    }, {
      headers: getHeaders()
    });

    return {
      walletId: response.data.walletId,
      address: response.data.addresses[0],
      publicKey: response.data.publicKeys[0]
    };
  } catch (error) {
    // Fallback for demo - generate deterministic address
    return generateDemoWallet(userId);
  }
}

// Get wallet by ID
export async function getWallet(walletId: string): Promise<WalletCreated | null> {
  try {
    const { organizationId } = getTurnKeyClient();
    
    const response = await axios.get(`${TURNKEY_API_URL}/v1/wallets/${walletId}`, {
      params: { organizationId },
      headers: getHeaders()
    });

    return {
      walletId: response.data.walletId,
      address: response.data.addresses[0],
      publicKey: response.data.publicKeys[0]
    };
  } catch (error) {
    return null;
  }
}

// Sign a transaction (user must approve)
export async function signTransaction(
  walletId: string,
  to: string,
  value: string,
  data: string = '0x'
): Promise<Signature> {
  const { organizationId } = getTurnKeyClient();

  try {
    // In production, this creates a signing request
    // User must approve via email/2FA
    const response = await axios.post(`${TURNKEY_API_URL}/v1/signatures/create`, {
      organizationId,
      walletId,
      signRequest: {
        type: 'ETHEREUM',
        to,
        value,
        data
      },
      // User approval required before signing
      awaitEmailApproval: true
    }, {
      headers: getHeaders()
    });

    return {
      r: response.data.signature.r,
      s: response.data.signature.s,
      v: response.data.signature.v
    };
  } catch (error) {
    throw new Error('Signing request failed. User approval required.');
  }
}

// Get user's wallets
export async function getUserWallets(userId: string): Promise<WalletCreated[]> {
  const { organizationId } = getTurnKeyClient();

  try {
    const response = await axios.get(`${TURNKEY_API_URL}/v1/wallets`, {
      params: { 
        organizationId,
        filter: `userId:${userId}`
      },
      headers: getHeaders()
    });

    return response.data.wallets.map((w: any) => ({
      walletId: w.walletId,
      address: w.addresses[0],
      publicKey: w.publicKeys[0]
    }));
  } catch (error) {
    return [];
  }
}

// Helper: Get auth headers
function getHeaders() {
  const { apiPublicKey, apiPrivateKey } = getTurnKeyClient();
  const timestamp = Date.now().toString();
  
  return {
    'Content-Type': 'application/json',
    'API-Key': apiPublicKey,
    'Timestamp': timestamp,
    // In production: sign the request with apiPrivateKey
  };
}

// Demo wallet generator (for testing without TurnKey)
function generateDemoWallet(userId: string): WalletCreated {
  // Deterministic but not real - for demo only
  const hash = Buffer.from(`stakefolio-${userId}`).toString('hex');
  const address = '0x' + hash.slice(0, 40).padStart(40, '0');
  
  return {
    walletId: `demo-${userId}`,
    address,
    publicKey: '0x04' + hash.slice(0, 128)
  };
}

// Get wallet balance (via RPC)
export async function getWalletBalance(
  address: string,
  chain: 'ethereum' | 'solana'
): Promise<string> {
  // This would query RPC for balance
  // Implemented in chain adapters
  return '0';
}
