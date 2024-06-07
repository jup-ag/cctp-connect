import { useCallback } from 'react';

import { useWeb3React } from '@web3-react/core';

import { TokenMessenger__factory } from '../typechain/index';
import {
  addressToBytes32,
  getMessageBytesFromEventLogs,
  getMessageHashFromBytes,
} from '../utils';
import { getTokenMessengerContractAddress } from '../utils/addresses';

import type {
  TransactionResponse,
  Web3Provider,
} from '@ethersproject/providers';
import type { DestinationDomain, SupportedChainId } from '../constants/chains';
import type { BigNumber, Bytes, Transaction } from 'ethers';
import { DEFAULT_API_DELAY, DEFAULT_BLOCKCHAIN_DELAY } from '@/constants';
import useTransaction from './useTransaction';
import {
  AttestationStatus,
  getAttestation,
} from '@/services/attestationService';

/**
 * Returns a list of methods to call the Token Messenger contract
 * @param chainId the ID of the current connected chain/network
 */
const useTokenMessenger = (
  chainId: SupportedChainId | undefined,
  signal?: AbortSignal
) => {
  const { library } = useWeb3React<Web3Provider>();
  const { getTransactionReceipt } = useTransaction();

  const TOKEN_MESSENGER_CONTRACT_ADDRESS =
    getTokenMessengerContractAddress(chainId);

  /**
   * Returns transaction response from contract call
   * @param amount the amount to be deposit for burn on source chain
   * @param destinationDomain the Circle defined ID of target chain
   * @param mintRecipient the recipient address on target chain
   * @param burnToken the address of token to burn
   */
  const depositForBurn = useCallback(
    async (
      amount: BigNumber,
      destinationDomain: DestinationDomain,
      mintRecipient: string,
      burnToken: string
    ) => {
      if (!library) return;
      const contract = TokenMessenger__factory.connect(
        TOKEN_MESSENGER_CONTRACT_ADDRESS,
        library.getSigner()
      );

      return await contract
        .depositForBurn(amount, destinationDomain, mintRecipient, burnToken)
        .then((response: TransactionResponse) => {
          const { hash } = response;
          return new Promise<{
            messageBytes: Bytes;
            messageHash: string;
            hash: string;
          }>((resolve, reject) => {
            const interval = setInterval(async () => {
              if (signal?.aborted) {
                clearInterval(interval);
                reject(null);
              }

              const transactionReceipt = await getTransactionReceipt(hash);
              if (transactionReceipt != null) {
                const { status, logs } = transactionReceipt;
                // Success
                if (status === 1) {
                  clearInterval(interval);

                  const messageBytes = getMessageBytesFromEventLogs(
                    logs,
                    'MessageSent(bytes)'
                  );
                  // hash the message bytes
                  const messageHash = getMessageHashFromBytes(messageBytes);

                  resolve({
                    messageBytes,
                    messageHash,
                    hash,
                  });
                }
              }
            }, DEFAULT_BLOCKCHAIN_DELAY);
          });
        })
        .then(({ messageBytes, messageHash, hash }) => {
          return new Promise<{
            signature: string;
            messageBytes: Bytes;
          }>((resolve, reject) => {
            const interval = setInterval(async () => {
              if (signal?.aborted) {
                clearInterval(interval);
                reject(null);
              }

              const attestation = await getAttestation(messageHash);
              if (attestation != null) {
                const { status, message } = attestation;

                // Success
                if (status === AttestationStatus.complete && message !== null) {
                  resolve({
                    signature: message,
                    messageBytes,
                  });

                  clearInterval(interval);
                }
              }
            }, DEFAULT_API_DELAY);
          });
        })
        .catch((error: Error) => {
          throw new Error(error.message);
        });
    },
    [TOKEN_MESSENGER_CONTRACT_ADDRESS, library, signal, getTransactionReceipt]
  );

  return {
    depositForBurn,
  };
};

export default useTokenMessenger;
