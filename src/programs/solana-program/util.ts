import * as anchor from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { hexlify } from 'ethers/lib/utils';

import {
  IDL as MessageTransmitterIDL,
  MessageTransmitter,
} from './types/MessageTransmitter';
import {
  IDL as TokenMessengerMinterIDL,
  TokenMessengerMinter,
} from './types/TokenMessengerMinter';

import { WalletContextState } from '@jup-ag/wallet-adapter';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Connection,
  ConnectionConfig,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import Decimal from 'decimal.js';

export const IRIS_API_URL =
  process.env.NEXT_PUBLIC_IRIS_API_URL ?? 'https://iris-api-sandbox.circle.com';
export const SOLANA_SRC_DOMAIN_ID = 5;
export const SOLANA_USDC_ADDRESS =
  process.env.NEXT_PUBLIC_SOLANA_USDC_ADDRESS ??
  '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

export interface FindProgramAddressResponse {
  publicKey: anchor.web3.PublicKey;
  bump: number;
}

// Configure client to use the provider and return it.
// Must set ANCHOR_WALLET (solana keypair path) and ANCHOR_PROVIDER_URL (node URL) env vars
export const getAnchorConnection = () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  return provider;
};

export const getPrograms = (provider: anchor.AnchorProvider) => {
  // Initialize contracts
  const messageTransmitterProgram = new anchor.Program<MessageTransmitter>(
    MessageTransmitterIDL,
    'CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd',
    provider
  );
  const tokenMessengerMinterProgram = new anchor.Program<TokenMessengerMinter>(
    TokenMessengerMinterIDL,
    'CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3',
    provider
  );
  return { messageTransmitterProgram, tokenMessengerMinterProgram };
};

export const getDepositForBurnPdas = (
  {
    messageTransmitterProgram,
    tokenMessengerMinterProgram,
  }: ReturnType<typeof getPrograms>,
  usdcAddress: PublicKey,
  destinationDomain: Number
) => {
  const messageTransmitterAccount = findProgramAddress(
    'message_transmitter',
    messageTransmitterProgram.programId
  );
  const tokenMessengerAccount = findProgramAddress(
    'token_messenger',
    tokenMessengerMinterProgram.programId
  );
  const tokenMinterAccount = findProgramAddress(
    'token_minter',
    tokenMessengerMinterProgram.programId
  );
  const localToken = findProgramAddress(
    'local_token',
    tokenMessengerMinterProgram.programId,
    [usdcAddress]
  );
  const remoteTokenMessengerKey = findProgramAddress(
    'remote_token_messenger',
    tokenMessengerMinterProgram.programId,
    [destinationDomain.toString()]
  );
  const authorityPda = findProgramAddress(
    'sender_authority',
    tokenMessengerMinterProgram.programId
  );

  return {
    messageTransmitterAccount,
    tokenMessengerAccount,
    tokenMinterAccount,
    localToken,
    remoteTokenMessengerKey,
    authorityPda,
  };
};

export const getReceiveMessagePdas = async (
  {
    messageTransmitterProgram,
    tokenMessengerMinterProgram,
  }: ReturnType<typeof getPrograms>,
  solUsdcAddress: PublicKey,
  remoteUsdcAddressHex: string,
  remoteDomain: string,
  nonce: string
) => {
  const tokenMessengerAccount = findProgramAddress(
    'token_messenger',
    tokenMessengerMinterProgram.programId
  );
  const messageTransmitterAccount = findProgramAddress(
    'message_transmitter',
    messageTransmitterProgram.programId
  );
  const tokenMinterAccount = findProgramAddress(
    'token_minter',
    tokenMessengerMinterProgram.programId
  );
  const localToken = findProgramAddress(
    'local_token',
    tokenMessengerMinterProgram.programId,
    [solUsdcAddress]
  );
  const remoteTokenMessengerKey = findProgramAddress(
    'remote_token_messenger',
    tokenMessengerMinterProgram.programId,
    [remoteDomain]
  );
  const remoteTokenKey = new PublicKey(hexToBytes(remoteUsdcAddressHex));
  const tokenPair = findProgramAddress(
    'token_pair',
    tokenMessengerMinterProgram.programId,
    [remoteDomain, remoteTokenKey]
  );
  const custodyTokenAccount = findProgramAddress(
    'custody',
    tokenMessengerMinterProgram.programId,
    [solUsdcAddress]
  );
  const authorityPda = findProgramAddress(
    'message_transmitter_authority',
    messageTransmitterProgram.programId,
    [tokenMessengerMinterProgram.programId]
  ).publicKey;
  const tokenMessengerEventAuthority = findProgramAddress(
    '__event_authority',
    tokenMessengerMinterProgram.programId
  );

  console.log("log", nonce, remoteDomain, messageTransmitterAccount.publicKey.toBase58());
  
  const usedNonces = await messageTransmitterProgram.methods
    .getNoncePda({
      nonce: new anchor.BN(nonce),
      sourceDomain: Number(remoteDomain),
    })
    .accounts({
      messageTransmitter: messageTransmitterAccount.publicKey,
    })
    .view();

  return {
    messageTransmitterAccount,
    tokenMessengerAccount,
    tokenMinterAccount,
    localToken,
    remoteTokenMessengerKey,
    remoteTokenKey,
    tokenPair,
    custodyTokenAccount,
    authorityPda,
    tokenMessengerEventAuthority,
    usedNonces,
  };
};

export const solanaAddressToHex = (solanaAddress: string): string =>
  hexlify(bs58.decode(solanaAddress));

export const evmAddressToSolana = (evmAddress: string): string =>
  bs58.encode(hexToBytes(evmAddress));

export const evmAddressToBytes32 = (address: string): string =>
  `0x000000000000000000000000${address.replace('0x', '')}`;

export const hexToBytes = (hex: string): Buffer =>
  Buffer.from(hex.replace('0x', ''), 'hex');

// Convenience wrapper for PublicKey.findProgramAddressSync
export const findProgramAddress = (
  label: string,
  programId: PublicKey,
  extraSeeds: (string | number[] | Buffer | PublicKey)[] | null = null
): FindProgramAddressResponse => {
  const seeds = [Buffer.from(anchor.utils.bytes.utf8.encode(label))];
  if (extraSeeds) {
    for (const extraSeed of extraSeeds) {
      if (typeof extraSeed === 'string') {
        seeds.push(Buffer.from(anchor.utils.bytes.utf8.encode(extraSeed)));
      } else if (Array.isArray(extraSeed)) {
        seeds.push(Buffer.from(extraSeed as number[]));
      } else if (Buffer.isBuffer(extraSeed)) {
        seeds.push(extraSeed);
      } else {
        seeds.push(extraSeed.toBuffer());
      }
    }
  }
  const res = PublicKey.findProgramAddressSync(seeds, programId);
  return { publicKey: res[0], bump: res[1] };
};

// Fetches attestation from attestation service given the txHash
export const getMessages = async (txHash: string) => {
  const res = await fetch(
    `${IRIS_API_URL}/messages/${SOLANA_SRC_DOMAIN_ID}/${txHash}`
  );

  if (!res.ok) {
    return null;
  }

  const attestationResponse = await res.json();

  if (
    !attestationResponse.error &&
    attestationResponse.messages &&
    attestationResponse.messages?.[0]?.attestation !== 'PENDING'
  ) {
    return attestationResponse.messages[0] as {
      attestation: string;
      message: string;
    };
  }

  return null;
};

export const decodeEventNonceFromMessage = (messageHex: string): string => {
  const nonceIndex = 12;
  const nonceBytesLength = 8;
  const message = hexToBytes(messageHex);
  const eventNonceBytes = message.subarray(
    nonceIndex,
    nonceIndex + nonceBytesLength
  );
  const eventNonceHex = hexlify(eventNonceBytes);
  return BigInt(eventNonceHex).toString();
};

export const createProvider = (
  wallet: WalletContextState,
  connection: Connection,
  config: ConnectionConfig
) => {
  //@ts-ignore
  const provider = new anchor.AnchorProvider(connection, wallet, config);
  return provider;
};

export const getOrCreateATAInstruction = async (
  tokenMint: PublicKey,
  owner: PublicKey,
  connection: Connection,
  allowOwnerOffCurve = false,
  payer = owner
): Promise<[PublicKey, TransactionInstruction?]> => {
  let toAccount;
  try {
    toAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenMint,
      owner,
      allowOwnerOffCurve
    );
    const account = await connection.getAccountInfo(toAccount);
    if (!account) {
      const ix = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        tokenMint,
        toAccount,
        owner,
        payer
      );
      return [toAccount, ix];
    }
    return [toAccount, undefined];
  } catch (e) {
    /* handle error */
    console.error('Error::getOrCreateATAInstruction', e);
    throw e;
  }
};

export function fromLamports(
  lamportsAmount: anchor.BN | number | bigint | string,
  decimals: number
): number {
  return new Decimal(lamportsAmount.toString())
    .div(10 ** decimals)
    .toDP(decimals, Decimal.ROUND_DOWN)
    .toNumber();
}

export function toLamports(
  amount: anchor.BN | number,
  decimals: number
): anchor.BN {
  return new anchor.BN(
    new Decimal(amount.toString())
      .mul(10 ** decimals)
      .floor()
      .toNumber()
  );
}
