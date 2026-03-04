// Swap execution service

import axios from 'axios';

const JUPITER_API = 'https://api.jup.ag';
const ONEINCH_API = 'https://api.1inch.dev/v5.0';

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  route: any[];
}

export interface SwapExecution {
  tx: {
    to: string;
    data: string;
    value: string;
    gasLimit: string;
  };
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
}

// Get swap quote from Jupiter (Solana)
export async function getJupiterQuote(
  fromMint: string,
  toMint: string,
  amount: number
): Promise<SwapQuote> {
  try {
    const response = await axios.get(`${JUPITER_API}/v6/quote`, {
      params: {
        inputMint: fromMint,
        outputMint: toMint,
        amount: amount * 1e9, // Convert to lamports
        slippage: 0.5,
        restrictIntermediateTokens: true
      },
      timeout: 10000
    });

    return {
      fromToken: fromMint,
      toToken: toMint,
      fromAmount: String(amount),
      toAmount: response.data.outAmount,
      priceImpact: parseFloat(response.data.priceImpactPct) || 0,
      route: response.data.routePlan || []
    };
  } catch (error) {
    throw new Error(`Jupiter quote failed: ${error.message}`);
  }
}

// Get swap quote from 1Inch (EVM)
export async function get1InchQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string
): Promise<SwapQuote> {
  try {
    const response = await axios.get(
      `${ONEINCH_API}/${chainId}/quote`,
      {
        params: {
          fromTokenAddress: fromToken,
          toTokenAddress: toToken,
          amount: amount
        },
        timeout: 10000
      }
    );

    return {
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount: response.data.toTokenAmount,
      priceImpact: 0, // 1Inch doesn't provide this directly
      route: []
    };
  } catch (error) {
    throw new Error(`1Inch quote failed: ${error.message}`);
  }
}

// Get swap transaction data (for execution)
export async function getSwapTransaction(
  chain: 'solana' | 'ethereum' | 'arbitrum' | 'base' | 'polygon',
  fromToken: string,
  toToken: string,
  amount: string,
  userAddress: string,
  slippage: number = 0.5
): Promise<SwapExecution> {
  if (chain === 'solana') {
    return getJupiterSwapTx(fromToken, toToken, amount, userAddress, slippage);
  }
  
  return get1InchSwapTx(chain, fromToken, toToken, amount, userAddress, slippage);
}

// Jupiter swap transaction
async function getJupiterSwapTx(
  fromMint: string,
  toMint: string,
  amount: string,
  userAddress: string,
  slippage: number
): Promise<SwapExecution> {
  try {
    // Get quote first
    const quoteResponse = await axios.get(`${JUPITER_API}/v6/quote`, {
      params: {
        inputMint: fromMint,
        outputMint: toMint,
        amount: amount,
        slippage: slippage * 100
      }
    });

    // Get swap transaction
    const txResponse = await axios.post(`${JUPITER_API}/v6/swap`, {
      quoteResponse: quoteResponse.data,
      userPublicKey: userAddress,
      wrapAndUnwrapSol: true
    });

    return {
      tx: {
        to: 'JUP6LkfZ98WCSC7GPdrN1ZkQRAo9rYqBh' // Jupiter v6
      },
      fromToken: fromMint,
      toToken: toMint,
      fromAmount: amount,
      toAmount: quoteResponse.data.outAmount
    };
  } catch (error) {
    throw new Error(`Jupiter swap tx failed: ${error.message}`);
  }
}

// 1Inch swap transaction
async function get1InchSwapTx(
  chain: string,
  fromToken: string,
  toToken: string,
  amount: string,
  userAddress: string,
  slippage: number
): Promise<SwapExecution> {
  const chainIds: Record<string, number> = {
    ethereum: 1,
    polygon: 137,
    arbitrum: 42161,
    base: 8453,
    optimism: 10
  };

  const chainId = chainIds[chain];
  if (!chainId) throw new Error(`Unsupported chain: ${chain}`);

  try {
    const response = await axios.get(`${ONEINCH_API}/${chainId}/swap`, {
      params: {
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        amount: amount,
        fromAddress: userAddress,
        slippage: slippage * 100,
        disableEstimate: false
      }
    });

    return {
      tx: {
        to: response.data.tx.to,
        data: response.data.tx.data,
        value: response.data.tx.value || '0',
        gasLimit: response.data.tx.gas || '200000'
      },
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount: response.data.toTokenAmount
    };
  } catch (error) {
    throw new Error(`1Inch swap tx failed: ${error.message}`);
  }
}
