import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { DEFAULT_API_DELAY } from '@/constants';
import { Chain } from '@/constants';
import { useEVMCCTP } from './useEvmCCTP';
import { useSolanaCCTP } from './useSolanaCCTP';
import { getMessageBytesFromEventLogs, getMessageHashFromBytes } from '@/utils';
import {
  AttestationStatus,
  getAttestation,
} from '@/programs/evm-program/attestationService';
import { getMessages } from '@/programs/solana-program/util';

type Transaction = {
  recipient: string;
  fromChain: Chain;
  toChain: Chain;
  amount: number;
  message: string;
  attestation: string;
  hash: string;
  readyToRedeem: boolean;
  redeemedAt?: Date;
};

export function useTransactions(toChain: Chain, receivedAddress?: string) {
  const evmCCTP = useEVMCCTP();
  const solanaCCTP = useSolanaCCTP();

  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    'cctp-transactions',
    []
  );

  const receivedTransactions = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.toChain === toChain &&
        t.recipient === receivedAddress &&
        !t.redeemedAt
    );
  }, [transactions, receivedAddress, toChain]);

  useEffect(() => {
    const pendingTransaction = receivedTransactions.find(
      (t) => !t.readyToRedeem
    );

    if (pendingTransaction) {
      let message: string;
      let messageHash: string;
      const interval = setInterval(async () => {
        if (pendingTransaction.fromChain !== Chain.SOLANA) {
          // evm transaction
          if (!evmCCTP) {
            clearInterval(interval);
            return;
          }

          if (!pendingTransaction.attestation && !messageHash) {
            // fetch transaction
            const transactionReceipt = await evmCCTP.getTransactionReceipt(
              pendingTransaction.hash
            );
            if (transactionReceipt != null) {
              const { status, logs } = transactionReceipt;
              // Success
              if (status === 1) {
                const messageBytes = getMessageBytesFromEventLogs(
                  logs,
                  'MessageSent(bytes)'
                );

                messageHash = getMessageHashFromBytes(messageBytes);
                message = messageBytes as unknown as string;
              }
            }
          } else {
            // fetch attestation

            const attestation = await getAttestation(messageHash);
            if (attestation != null) {
              const { status, message: attestationMsg } = attestation;

              // Success
              if (
                status === AttestationStatus.complete &&
                attestationMsg !== null
              ) {
                setTransactions((transactions) => {
                  return transactions.map((t) => {
                    if (t.hash !== pendingTransaction.hash) {
                      return t;
                    }

                    return {
                      ...t,
                      message,
                      attestation: attestationMsg,
                      readyToRedeem: true,
                    };
                  });
                });

                clearInterval(interval);
                return;
              }
            }
          }
        } else {
          // solana transaction
          // fetch attestation && message
          const attestation = await getMessages(pendingTransaction.hash);

          if (attestation) {
            setTransactions((transactions) => {
              return transactions.map((t) => {
                if (t.hash !== pendingTransaction.hash) {
                  return t;
                }

                return {
                  ...t,
                  ...attestation,
                  readyToRedeem: true,
                };
              });
            });
            clearInterval(interval);
            return;
          }
        }
      }, DEFAULT_API_DELAY);

      return () => {
        clearInterval(interval);
      };
    }
  }, [receivedTransactions, evmCCTP, solanaCCTP, setTransactions]);

  const addTransaction = useCallback(
    (transaction: Transaction) => {
      setTransactions((txs) => [...txs, transaction]);
    },
    [setTransactions]
  );

  const removeTransaction = useCallback(
    (hash: string) => {
      // setTransactions((transactions) => {
      //   return transactions.map((t) => {
      //     if (t.hash !== hash) {
      //       return t;
      //     }

      //     return {
      //       ...t,
      //       redeemedAt: new Date(),
      //     };
      //   });
      // });
    },
    [setTransactions]
  );

  return {
    transactions: receivedTransactions,
    addTransaction,
    removeTransaction,
  };
}
