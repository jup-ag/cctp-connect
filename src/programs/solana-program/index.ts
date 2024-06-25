import { AnchorProvider, Program } from '@coral-xyz/anchor';
import * as spl from '@solana/spl-token';
import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';

import {
  decodeEventNonceFromMessage,
  evmAddressToBytes32,
  fromLamports,
  getDepositForBurnPdas,
  getOrCreateATAInstruction,
  getPrograms,
  getReceiveMessagePdas,
  SOLANA_USDC_ADDRESS,
  toLamports,
} from './util';
import { MessageTransmitter } from './types/MessageTransmitter';
import { TokenMessengerMinter } from './types/TokenMessengerMinter';
import { utils } from 'ethers';
import { DEFAULT_DECIMALS } from '@/constants';

export class SolanaCCTP {
  private messageTransmitterProgram: Program<MessageTransmitter>;
  private tokenMessengerMinterProgram: Program<TokenMessengerMinter>;

  constructor(private provider: AnchorProvider) {
    ({
      messageTransmitterProgram: this.messageTransmitterProgram,
      tokenMessengerMinterProgram: this.tokenMessengerMinterProgram,
    } = getPrograms(provider));
  }

  async getOrCreateUSDCATAInstruction() {
    return getOrCreateATAInstruction(
      new PublicKey(SOLANA_USDC_ADDRESS),
      this.provider.wallet.publicKey,
      this.provider.connection,
      true
    );
  }

  async depositForBurn({
    destinationDomain,
    amount,
    recipient,
  }: {
    destinationDomain: number;
    amount: number;
    recipient: string;
  }) {
    const { provider, tokenMessengerMinterProgram, messageTransmitterProgram } =
      this;

    const usdcAddress = new PublicKey(SOLANA_USDC_ADDRESS);
    const mintRecipient = new PublicKey(
      utils.arrayify(evmAddressToBytes32(recipient))
    );

    const pdas = getDepositForBurnPdas(
      { messageTransmitterProgram, tokenMessengerMinterProgram },
      usdcAddress,
      destinationDomain
    );

    const [userATA, createUserATA] = await this.getOrCreateUSDCATAInstruction();
    // Generate a new keypair for the MessageSent event account.
    const messageSentEventAccountKeypair = Keypair.generate();
    // Call depositForBurn
    return (
      tokenMessengerMinterProgram.methods
        .depositForBurn({
          amount: toLamports(amount, DEFAULT_DECIMALS),
          destinationDomain,
          mintRecipient,
        })
        // eventAuthority and program accounts are implicitly added by Anchor
        .accounts({
          owner: provider.wallet.publicKey,
          eventRentPayer: provider.wallet.publicKey,
          senderAuthorityPda: pdas.authorityPda.publicKey,
          burnTokenAccount: userATA,
          messageTransmitter: pdas.messageTransmitterAccount.publicKey,
          tokenMessenger: pdas.tokenMessengerAccount.publicKey,
          remoteTokenMessenger: pdas.remoteTokenMessengerKey.publicKey,
          tokenMinter: pdas.tokenMinterAccount.publicKey,
          localToken: pdas.localToken.publicKey,
          burnTokenMint: usdcAddress,
          messageTransmitterProgram: messageTransmitterProgram.programId,
          tokenMessengerMinterProgram: tokenMessengerMinterProgram.programId,
          messageSentEventData: messageSentEventAccountKeypair.publicKey,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
        })
        .preInstructions([createUserATA!].filter(Boolean))
        // messageSentEventAccountKeypair must be a signer so the MessageTransmitter program can take control of it and write to it.
        // provider.wallet is also an implicit signer
        .signers([messageSentEventAccountKeypair])
        .rpc()
    );
  }

  async receiveMessage({
    remoteUSDCAddressHex,
    remoteDomain,
    message,
    attestation,
  }: {
    remoteUSDCAddressHex: string;
    remoteDomain: string;
    message: string;
    attestation: string;
  }) {
    const { messageTransmitterProgram, tokenMessengerMinterProgram, provider } =
      this;

    if (!provider.wallet.publicKey) {
      throw new Error('Please connect wallet first!');
    }

    const usdcAddress = new PublicKey(SOLANA_USDC_ADDRESS);
    const nonce = decodeEventNonceFromMessage(message);

    const [userATA, createUserATA] = await this.getOrCreateUSDCATAInstruction();

    // Get PDAs
    const pdas = await getReceiveMessagePdas(
      { messageTransmitterProgram, tokenMessengerMinterProgram },
      usdcAddress,
      remoteUSDCAddressHex,
      remoteDomain,
      nonce
    );

    // accountMetas list to pass to remainingAccounts
    const accountMetas = [
      {
        isSigner: false,
        isWritable: false,
        pubkey: pdas.tokenMessengerAccount.publicKey,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: pdas.remoteTokenMessengerKey.publicKey,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: pdas.tokenMinterAccount.publicKey,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: pdas.localToken.publicKey,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: pdas.tokenPair.publicKey,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: userATA,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: pdas.custodyTokenAccount.publicKey,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: spl.TOKEN_PROGRAM_ID,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: pdas.tokenMessengerEventAuthority.publicKey,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: tokenMessengerMinterProgram.programId,
      },
    ];

    return await messageTransmitterProgram.methods
      .receiveMessage({
        message: Buffer.from(message.replace('0x', ''), 'hex'),
        attestation: Buffer.from(attestation.replace('0x', ''), 'hex'),
      })
      .accounts({
        payer: provider.wallet.publicKey,
        caller: provider.wallet.publicKey,
        authorityPda: pdas.authorityPda,
        messageTransmitter: pdas.messageTransmitterAccount.publicKey,
        usedNonces: pdas.usedNonces,
        receiver: tokenMessengerMinterProgram.programId,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(accountMetas)
      .preInstructions([createUserATA!].filter(Boolean))
      .rpc();
  }

  async getUSDCBalance() {
    const [ata, createATA] = await this.getOrCreateUSDCATAInstruction();
    if (createATA) {
      return 0;
    }
    let accountData = await this.provider.connection.getTokenAccountBalance(
      ata
    );

    return accountData.value.amount;
  }
}
