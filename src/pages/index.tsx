import EthereumWalletConnectButton from '@/components/EthereumWalletConnectButton';
import SolanaWalletConnectButton from '@/components/SolanaWalletConnectButton';
import { DEFAULT_BLOCKCHAIN_DELAY } from '@/constants';
import { Chain, DestinationDomain, SupportedChainId } from '@/constants';
import { useEVMCCTP } from '@/hooks/useEvmCCTP';
import { useEvmUSDCAllowance } from '@/hooks/useEvmUSDCAllowance';
import { useEvmUSDCBalance } from '@/hooks/useEvmUSDCBalance';
import { useSolanaCCTP } from '@/hooks/useSolanaCCTP';
import { useSolanaUSDCBalance } from '@/hooks/useSolanaUSDCBalance';
import { useTransactions } from '@/hooks/useTransactions';
import { getAddressAbbreviation, getUSDCContractAddress } from '@/utils';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useMutation } from '@tanstack/react-query';
import { useWeb3React } from '@web3-react/core';
import clsx from 'clsx';
import React, { useState } from 'react';

const Transfer: React.FC = () => {
  const evmCCTP = useEVMCCTP();
  const solanaCCTP = useSolanaCCTP();
  const [isSwapped, setIsSwapped] = useState(false);
  const [selectedEvmChain, setSelectedEvmChain] = useState(Chain.ETH);
  const { account, chainId, error } = useWeb3React();
  const solanaWallet = useWallet();
  const selectedChainId = SupportedChainId[selectedEvmChain];
  const [amount, setAmount] = useState('');

  const { data: evmUSDCBalance, refetch: refetchEvmUSDCBalance } =
    useEvmUSDCBalance(selectedChainId);

  const { data: solanaUSDCBalance, refetch: refetchSolanaUSDCBalance } =
    useSolanaUSDCBalance();

  const { data: usdcAllowance, refetch: refetchUSDCAllowance } =
    useEvmUSDCAllowance();

  const { transactions, addTransaction, removeTransaction } = useTransactions(
    isSwapped ? selectedEvmChain : Chain.SOLANA,
    isSwapped ? account! : solanaWallet?.publicKey?.toBase58()
  );

  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: async (amount: string) => {
      if (!Number(amount) || isSwapped || !evmCCTP) {
        throw new Error('Not valid');
      }

      const transaction = await evmCCTP.approve({
        amount: Number(amount),
        chain: selectedEvmChain,
      });

      const { hash } = transaction;

      return new Promise<boolean>((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const transactionReceipt = await evmCCTP.getTransactionReceipt(
              hash
            );
            if (transactionReceipt != null) {
              const { status } = transactionReceipt;
              // Success
              if (status === 1) {
                clearInterval(interval);
                resolve(true);
              }
            }
          } catch (e) {
            clearInterval(interval);
            reject(false);
          }
        }, DEFAULT_BLOCKCHAIN_DELAY);
      });
    },
  });

  const { mutate: depositForBurn, isPending: isDepositing } = useMutation({
    mutationFn: async (amount: string) => {
      if (
        (!Number(amount) && isSwapped && !solanaCCTP) ||
        (!isSwapped && (!evmCCTP || !account))
      ) {
        return;
      }

      let result: string;
      try {
        if (isSwapped) {
          result = await solanaCCTP.depositForBurn({
            destinationDomain: DestinationDomain[selectedEvmChain],
            amount: Number(amount),
            recipient: account!,
          });
        } else {
          const [recipient] = await solanaCCTP.getOrCreateUSDCATAInstruction();
          result = await evmCCTP!.depositForBurn({
            amount: Number(amount),
            chain: selectedEvmChain,
            recipient: recipient.toBase58(),
          });
        }

        return {
          hash: result,
          fromChain: isSwapped ? Chain.SOLANA : selectedEvmChain,
          toChain: !isSwapped ? Chain.SOLANA : selectedEvmChain,
          amount: Number(amount),
          recipient: isSwapped ? account! : solanaWallet.publicKey!.toBase58(),
        };
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  });

  const { mutate: receiveMessage, isPending: isReceiving } = useMutation({
    mutationFn: async ({
      message,
      attestation,
      fromChain,
      toChain,
    }: {
      message: string;
      attestation: string;
      fromChain: Chain;
      toChain: Chain;
    }) => {
      if (toChain === Chain.SOLANA && solanaCCTP) {
        try {
          const res = await solanaCCTP.receiveMessage({
            attestation,
            message,
            remoteDomain: DestinationDomain[fromChain].toString(),
            remoteUSDCAddressHex: getUSDCContractAddress(
              SupportedChainId[fromChain]
            ),
          });

          return res;
        } catch (e) {
          console.error(e);
          throw e;
        }
      }

      if (toChain !== Chain.SOLANA && evmCCTP && account) {
        return evmCCTP.receiveMessage({
          message,
          attestation,
          chain: toChain,
        });
      }
    },
  });

  return (
    <div className="flex flex-col items-center p-10">
      <div className="w-full max-w-lg space-y-6">
        <div
          className={clsx(
            'flex flex-col space-y-6',
            isSwapped && '!flex-col-reverse space-y-reverse'
          )}
        >
          <div className="space-y-6">
            <div className="flex space-x-4 ">
              <select
                value={selectedEvmChain}
                onChange={(e) => setSelectedEvmChain(e.target.value as Chain)}
                className="select select-bordered w-full max-w-xs"
              >
                <option value={Chain.ETH}>Ethereum Sepolia</option>
                <option value={Chain.OPTIMISM}>Optimism Sepolia</option>
                <option value={Chain.BASE}>Base Sepolia</option>
                <option value={Chain.ARB}>Arb Sepolia</option>
              </select>
              {chainId === selectedChainId && account ? (
                <p className="self-center">{getAddressAbbreviation(account)}</p>
              ) : (
                <EthereumWalletConnectButton chainId={selectedChainId} />
              )}
            </div>
            {error && <div className="flex text-red-500">{error?.message}</div>}
            <div>Balance: {evmUSDCBalance || '-'} USDC</div>
          </div>

          <button
            onClick={() => {
              setIsSwapped((s) => !s);
            }}
            className="btn"
          >
            Swap
          </button>

          <div className="space-y-6">
            <div className="flex space-x-4">
              <select className="select select-bordered w-full max-w-xs">
                <option value={SupportedChainId.SOLANA}>Solana</option>
              </select>
              {solanaWallet.publicKey ? (
                <p className="self-center">
                  {getAddressAbbreviation(solanaWallet.publicKey?.toBase58())}
                </p>
              ) : (
                <SolanaWalletConnectButton />
              )}
            </div>
            <div>Balance: {solanaUSDCBalance || '-'} USDC</div>
          </div>
        </div>

        <div className="flex space-x-4">
          <input
            type="number"
            placeholder="Amount"
            className="input input-bordered w-full max-w-xs"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {isSwapped ||
          (usdcAllowance && amount && Number(amount) <= usdcAllowance) ? (
            <button
              disabled={
                !amount ||
                (!isSwapped && !usdcAllowance) ||
                !solanaWallet.publicKey ||
                isDepositing
              }
              className="btn"
              onClick={() => {
                depositForBurn(amount, {
                  onSuccess: (data) => {
                    refetchUSDCAllowance();
                    setAmount('');
                    if (data) {
                      addTransaction({
                        ...data,
                        message: '',
                        attestation: '',
                        readyToRedeem: false,
                      });
                    }
                    alert('Transfered successfully');
                  },
                });
              }}
            >
              {isDepositing ? 'Transfering' : 'Transfer'}
            </button>
          ) : (
            <button
              onClick={() => {
                approve(amount, {
                  onSuccess: () => {
                    refetchUSDCAllowance();
                    alert('Approved successfully');
                  },
                });
              }}
              disabled={!amount || !solanaWallet.publicKey || isApproving}
              className="btn"
            >
              {isApproving ? 'Approving' : 'Approve'}
            </button>
          )}
        </div>
        <div>
          {transactions.map((transaction) => {
            return (
              <div
                key={transaction.hash}
                className="flex items-center space-x-2"
              >
                <p>Redeem {transaction.amount} USDC</p>
                <button
                  className="btn"
                  onClick={() => {
                    receiveMessage(transaction, {
                      onSuccess: () => {
                        alert('Redeemed successfully');
                        removeTransaction(transaction.hash);
                        refetchEvmUSDCBalance();
                        refetchSolanaUSDCBalance();
                      },
                    });
                  }}
                  disabled={isReceiving || !transaction.readyToRedeem}
                >
                  {!transaction.readyToRedeem
                    ? 'Pending'
                    : isReceiving
                    ? 'Redeeming'
                    : `Redeem`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Transfer;
