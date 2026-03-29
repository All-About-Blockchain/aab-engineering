// Stargate Bridge Service - Minimal stub
export const STARGATE_CHAIN_IDS = {
  ethereum: 1, arbitrum: 110, optimism: 111, base: 184,
  avalanche: 106, polygon: 109, bsc: 102, injective: 124,
  solana: 1, cosmos: 118, osmosis: 187, sei: 32, terra: 2,
};
export const STARGATE_TOKENS = {};
export function getBridgeRoutes() { return [{ name: 'Stargate', fee: '0.06%', time: '10-30min' }]; }
export function getStargateChains() { return Object.keys(STARGATE_CHAIN_IDS); }
export function getStargateTokens(chain) { return []; }
export async function isRouteAvailable() { return true; }
export async function getBestBridge() { return null; }
export async function getBridgeQuote() { return null; }
