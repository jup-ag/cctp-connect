export enum Chain {
  ETH = 'ETH',
  AVAX = 'AVAX',
  ARB = 'ARB',
  SOLANA = 'SOLANA',
  OPTIMISM = 'OPTIMISM',
  BASE = 'BASE',
}

const DevnetSupportedChainId: Record<Chain, number> = {
  [Chain.ETH]: 11155111,
  [Chain.AVAX]: 43113,
  [Chain.ARB]: 421614,
  [Chain.SOLANA]: 103,
  [Chain.OPTIMISM]: 11155420,
  [Chain.BASE]: 84532,
};

const MainnetSupportedChainId: Record<Chain, number> = {
  [Chain.ETH]: 1,
  [Chain.AVAX]: 43114,
  [Chain.ARB]: 42161,
  [Chain.SOLANA]: 101,
  [Chain.OPTIMISM]: 10,
  [Chain.BASE]: 8453,
};

export const DestinationDomain: Record<Chain, number> = {
  [Chain.ETH]: 0,
  [Chain.AVAX]: 1,
  [Chain.ARB]: 3,
  [Chain.SOLANA]: 5,
  [Chain.OPTIMISM]: 2,
  [Chain.BASE]: 6,
};

const DEVNET_CHAIN_IDS_TO_USDC_ADDRESSES = {
  [DevnetSupportedChainId.ETH]: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
  [DevnetSupportedChainId.AVAX]: '0x5425890298aed601595a70AB815c96711a31Bc65',
  [DevnetSupportedChainId.ARB]: '0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d',
  [DevnetSupportedChainId.SOLANA]: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  [DevnetSupportedChainId.OPTIMISM]: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
  [DevnetSupportedChainId.BASE]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
}

const MAINET_CHAIN_IDS_TO_USDC_ADDRESSES = {
  [MainnetSupportedChainId.ETH]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  [MainnetSupportedChainId.AVAX]: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  [MainnetSupportedChainId.ARB]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  [MainnetSupportedChainId.SOLANA]: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  [MainnetSupportedChainId.OPTIMISM]: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
  [MainnetSupportedChainId.BASE]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
}

const DEVNET_CHAIN_IDS_TO_TOKEN_MESSENGER_ADDRESSES = {
  [DevnetSupportedChainId.ETH]: '0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5',
  [DevnetSupportedChainId.AVAX]: '0xeb08f243e5d3fcff26a9e38ae5520a669f4019d0',
  [DevnetSupportedChainId.ARB]: '0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5',
  [DevnetSupportedChainId.SOLANA]: 'CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3',
  [DevnetSupportedChainId.OPTIMISM]: '0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5',
  [DevnetSupportedChainId.BASE]: '0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5',
};

const MAINNET_CHAIN_IDS_TO_TOKEN_MESSENGER_ADDRESSES = {
  [MainnetSupportedChainId.ETH]: '0xbd3fa81b58ba92a82136038b25adec7066af3155',
  [MainnetSupportedChainId.AVAX]: '0x6b25532e1060ce10cc3b0a99e5683b91bfde6982',
  [MainnetSupportedChainId.ARB]: '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
  [MainnetSupportedChainId.SOLANA]: 'CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3',
  [MainnetSupportedChainId.OPTIMISM]: '0x2B4069517957735bE00ceE0fadAE88a26365528f',
  [MainnetSupportedChainId.BASE]: '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
};

const DEVNET_CHAIN_IDS_TO_MESSAGE_TRANSMITTER_ADDRESSES = {
  [DevnetSupportedChainId.ETH]: '0x7865fafc2db2093669d92c0f33aeef291086befd',
  [DevnetSupportedChainId.AVAX]: '0xa9fb1b3009dcb79e2fe346c16a604b8fa8ae0a79',
  [DevnetSupportedChainId.ARB]: '0xacf1ceef35caac005e15888ddb8a3515c41b4872',
  [DevnetSupportedChainId.SOLANA]: 'CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd',
  [DevnetSupportedChainId.OPTIMISM]: '0x7865fafc2db2093669d92c0f33aeef291086befd',
  [DevnetSupportedChainId.BASE]: '0x7865fafc2db2093669d92c0f33aeef291086befd',
};

const MAINNET_CHAIN_IDS_TO_MESSAGE_TRANSMITTER_ADDRESSES = {
  [MainnetSupportedChainId.ETH]: '0x0a992d191deec32afe36203ad87d7d289a738f81',
  [MainnetSupportedChainId.AVAX]: '0x8186359af5f57fbb40c6b14a588d2a59c0c29880',
  [MainnetSupportedChainId.ARB]: '0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca',
  [MainnetSupportedChainId.SOLANA]: 'CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd',
  [MainnetSupportedChainId.OPTIMISM]: '0x4d41f22c5a0e5c74090899e5a8fb597a8842b3e8',
  [MainnetSupportedChainId.BASE]: '0xAD09780d193884d503182aD4588450C416D6F9D4',
};

export const SupportedChainId = process.env.NEXT_PUBLIC_CLUSTER === 'mainnet' ?  MainnetSupportedChainId : DevnetSupportedChainId

export const CHAIN_IDS_TO_MESSAGE_TRANSMITTER_ADDRESSES = process.env.NEXT_PUBLIC_CLUSTER === 'mainnet' ?  MAINNET_CHAIN_IDS_TO_MESSAGE_TRANSMITTER_ADDRESSES : DEVNET_CHAIN_IDS_TO_MESSAGE_TRANSMITTER_ADDRESSES
export const CHAIN_IDS_TO_TOKEN_MESSENGER_ADDRESSES = process.env.NEXT_PUBLIC_CLUSTER === 'mainnet' ?  MAINNET_CHAIN_IDS_TO_TOKEN_MESSENGER_ADDRESSES : DEVNET_CHAIN_IDS_TO_TOKEN_MESSENGER_ADDRESSES
export const CHAIN_IDS_TO_USDC_ADDRESSES = process.env.NEXT_PUBLIC_CLUSTER === 'mainnet' ?  MAINET_CHAIN_IDS_TO_USDC_ADDRESSES : DEVNET_CHAIN_IDS_TO_USDC_ADDRESSES;

export const DEFAULT_BLOCKCHAIN_DELAY = 1000; // polling every second
export const DEFAULT_API_DELAY = 5000; // polling every 5 second
export const IRIS_ATTESTATION_API_URL = 'https://iris-api-sandbox.circle.com';
export const DEFAULT_DECIMALS = 6; // USDC

export const ALL_SUPPORTED_CHAIN_IDS = Object.values(SupportedChainId);
