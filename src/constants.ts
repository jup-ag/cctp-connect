export enum Chain {
  ETH = 'ETH',
  AVAX = 'AVAX',
  ARB = 'ARB',
  SOLANA = 'SOLANA',
  OPTIMISM = 'OPTIMISM',
  BASE = 'BASE',
}

export const SupportedChainId: Record<Chain, number> = {
  [Chain.ETH]: 11155111,
  [Chain.AVAX]: 43113,
  [Chain.ARB]: 421614,
  [Chain.SOLANA]: 103,
  [Chain.OPTIMISM]: 11155420,
  [Chain.BASE]: 84532,
};

export const DestinationDomain: Record<Chain, number> = {
  [Chain.ETH]: 0,
  [Chain.AVAX]: 1,
  [Chain.ARB]: 3,
  [Chain.SOLANA]: 5,
  [Chain.OPTIMISM]: 2,
  [Chain.BASE]: 6,
};

export const CHAIN_IDS_TO_USDC_ADDRESSES = {
  [SupportedChainId.ETH]: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
  [SupportedChainId.AVAX]: '0x5425890298aed601595a70AB815c96711a31Bc65',
  [SupportedChainId.ARB]: '0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d',
  [SupportedChainId.SOLANA]: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  [SupportedChainId.OPTIMISM]: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
  [SupportedChainId.BASE]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
};

export const CHAIN_IDS_TO_TOKEN_MESSENGER_ADDRESSES = {
  [SupportedChainId.ETH]: '0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5',
  [SupportedChainId.AVAX]: '0xeb08f243e5d3fcff26a9e38ae5520a669f4019d0',
  [SupportedChainId.ARB]: '0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5',
  [SupportedChainId.SOLANA]: 'CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3',
  [SupportedChainId.OPTIMISM]: '0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5',
  [SupportedChainId.BASE]: '0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5',
};

export const CHAIN_IDS_TO_MESSAGE_TRANSMITTER_ADDRESSES = {
  [SupportedChainId.ETH]: '0x7865fafc2db2093669d92c0f33aeef291086befd',
  [SupportedChainId.AVAX]: '0xa9fb1b3009dcb79e2fe346c16a604b8fa8ae0a79',
  [SupportedChainId.ARB]: '0xacf1ceef35caac005e15888ddb8a3515c41b4872',
  [SupportedChainId.SOLANA]: 'CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd',
  [SupportedChainId.OPTIMISM]: '0x7865fafc2db2093669d92c0f33aeef291086befd',
  [SupportedChainId.BASE]: '0x7865fafc2db2093669d92c0f33aeef291086befd',
};

export const DEFAULT_BLOCKCHAIN_DELAY = 1000; // polling every second
export const DEFAULT_API_DELAY = 5000; // polling every 5 second
export const IRIS_ATTESTATION_API_URL = 'https://iris-api-sandbox.circle.com';
export const DEFAULT_DECIMALS = 6; // USDC

export const ALL_SUPPORTED_CHAIN_IDS = Object.values(SupportedChainId);
