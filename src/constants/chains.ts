/**
 * List of all the chains/networks supported
 */
export enum Chain {
  ETH = 'ETH',
  AVAX = 'AVAX',
  ARB = 'ARB',
  SOLANA = 'SOLANA',
  OPTIMISM = 'OPTIMISM',
  BASE = 'BASE',
}

/**
 * List of all the chain/network IDs supported
 */
export enum SupportedChainId {
  ETH = 11155111,
  AVAX = 43113,
  ARB = 421614,
  SOLANA = 103,
  OPTIMISM = 11155420,
  BASE = 84532,
}

/**
 * List of all the chain/network IDs supported in hexadecimals
 * TODO: Infer from SupportedChainId
 */
export const SupportedChainIdHex = {
  ETH: '0xaa36a7',
  AVAX: '0xa869',
  ARB: '0x66eee',
  SOLANA: '0x67',
  OPTIMISM: '0xaa37dc',
  BASE: '0x14a34',
};

interface ChainToChainIdMap {
  [key: string]: number;
}

/**
 * Maps a chain to it's chain ID
 */

export const CHAIN_TO_CHAIN_ID: ChainToChainIdMap = {
  [Chain.ETH]: SupportedChainId.ETH,
  [Chain.AVAX]: SupportedChainId.AVAX,
  [Chain.ARB]: SupportedChainId.ARB,
  [Chain.SOLANA]: SupportedChainId.SOLANA,
  [Chain.OPTIMISM]: SupportedChainId.OPTIMISM,
  [Chain.BASE]: SupportedChainId.BASE,
};

// /**
//  * Maps a chain to it's readable name
//  */
// export const CHAIN_TO_CHAIN_NAME: {
//   [key: string]: string;
// } = {
//   ETH: 'Ethereum',
//   AVAX: 'Avalanche',
//   ARB: 'Arbitrum',
//   SOLANA: 'Solana',
// };

/**
 * Array of all the supported chain IDs
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(
  SupportedChainId
).filter((id) => typeof id === 'number') as SupportedChainId[];

/**
 * List of Circle-defined IDs referring to specific domains
 */
export enum DestinationDomain {
  ETH = 0,
  AVAX = 1,
  ARB = 3,
  SOLANA = 5,
  OPTIMISM = 2,
  BASE = 6,
}

// // https://eips.ethereum.org/EIPS/eip-3085
// interface AddEthereumChainParameter {
//   chainId: string;
//   blockExplorerUrls?: string[];
//   chainName?: string;
//   iconUrls?: string[];
//   nativeCurrency?: {
//     name: string;
//     symbol: string;
//     decimals: number;
//   };
//   rpcUrls?: string[];
// }

// const ETH: AddEthereumChainParameter = {
//   chainId: SupportedChainIdHex.ETH,
//   blockExplorerUrls: ['https://sepolia.etherscan.io'],
//   chainName: 'Sepolia Test Network',
//   nativeCurrency: {
//     name: 'Ethereum',
//     symbol: 'ETH',
//     decimals: 18,
//   },
//   rpcUrls: ['https://sepolia.infura.io/v3/'],
// };

// const AVAX: AddEthereumChainParameter = {
//   chainId: SupportedChainIdHex.AVAX,
//   blockExplorerUrls: ['https://testnet.snowtrace.io/'],
//   chainName: 'Avalanche FUJI C-Chain',
//   nativeCurrency: {
//     name: 'Avalanche',
//     symbol: 'AVAX',
//     decimals: 18,
//   },
//   rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
// };

// const ARB: AddEthereumChainParameter = {
//   chainId: SupportedChainIdHex.ARB,
//   blockExplorerUrls: ['https://sepolia.arbiscan.io/'],
//   chainName: 'Arbitrum Sepolia Testnet',
//   nativeCurrency: {
//     name: 'Ethereum',
//     symbol: 'ETH',
//     decimals: 18,
//   },
//   rpcUrls: ['https://arb-sepolia.g.alchemy.com/v2/demo'],
// };

// const OPTIMISM: AddEthereumChainParameter = {
//   chainId: SupportedChainIdHex.OPTIMISM,
//   blockExplorerUrls: ['https://sepolia-optimistic.etherscan.io'],
//   chainName: 'OPTIMISM Sepolia Testnet',
//   nativeCurrency: {
//     name: 'Ethereum',
//     symbol: 'ETH',
//     decimals: 18,
//   },
//   rpcUrls: ['https://sepolia.optimism.io'],
// };

// const BASE: AddEthereumChainParameter = {
//   chainId: SupportedChainIdHex.BASE,
//   blockExplorerUrls: ['https://sepolia.base.org'],
//   chainName: 'BASE Sepolia Testnet',
//   nativeCurrency: {
//     name: 'Ethereum',
//     symbol: 'ETH',
//     decimals: 18,
//   },
//   rpcUrls: ['https://sepolia.base.org'],
// };

// const SOLANA: AddEthereumChainParameter = {
//   chainId: SupportedChainIdHex.SOLANA,
//   chainName: 'Solana Testnet',
//   nativeCurrency: {
//     name: 'Solana',
//     symbol: 'SOL',
//     decimals: 9,
//   },
//   rpcUrls: ['https://api.testnet.solana.com'],
// };
// interface ChainIdToChainParameters {
//   [key: string]: AddEthereumChainParameter;
// }

// export const CHAIN_ID_HEXES_TO_PARAMETERS: ChainIdToChainParameters = {
//   [SupportedChainIdHex.ETH]: ETH,
//   [SupportedChainIdHex.AVAX]: AVAX,
//   [SupportedChainIdHex.ARB]: ARB,
//   [SupportedChainIdHex.SOLANA]: SOLANA,
// };
