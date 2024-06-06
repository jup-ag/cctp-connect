/*
 * Copyright (c) 2024, Circle Internet Financial LTD All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { AnchorProvider } from '@coral-xyz/anchor';
import * as spl from '@solana/spl-token';
import { PublicKey, SystemProgram } from '@solana/web3.js';

import {
  decodeEventNonceFromMessage,
  getOrCreateATAInstruction,
  getPrograms,
  getReceiveMessagePdas,
  SOLANA_USDC_ADDRESS,
} from './util';

export const receiveMessage = async (
  provider: AnchorProvider,
  remoteTokenAddressHex: string,
  remoteDomain: string,
  messageHex: string,
  attestationHex: string
) => {
  const { messageTransmitterProgram, tokenMessengerMinterProgram } =
    getPrograms(provider);

  // Init needed variables
  const usdcAddress = new PublicKey(SOLANA_USDC_ADDRESS);
  const nonce = decodeEventNonceFromMessage(messageHex);

  const [userATA, createUserATA] = await getOrCreateATAInstruction(
    new PublicKey(SOLANA_USDC_ADDRESS),
    provider.wallet.publicKey,
    provider.connection,
    true
  );

  // Get PDAs
  const pdas = await getReceiveMessagePdas(
    { messageTransmitterProgram, tokenMessengerMinterProgram },
    usdcAddress,
    remoteTokenAddressHex,
    remoteDomain,
    nonce
  );

  console.log('runnnn');

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
      message: Buffer.from(messageHex.replace('0x', ''), 'hex'),
      attestation: Buffer.from(attestationHex.replace('0x', ''), 'hex'),
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
};
