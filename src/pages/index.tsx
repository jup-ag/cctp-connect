import EthereumWalletConnectButton from '@/components/EthereumWalletConnectButton';
import SolanaWalletConnectButton from '@/components/SolanaWalletConnectButton';
import { Chain, DestinationDomain, SupportedChainId } from '@/constants/chains';
import { DEFAULT_DECIMALS } from '@/constants/tokens';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import useTokenAllowance from '@/hooks/useTokenAllowance';
import useTokenApproval from '@/hooks/useTokenApproval';
import useTokenBalance from '@/hooks/useTokenBalance';
import useTokenMessenger from '@/hooks/useTokenMessenger';
import {
  SOLANA_USDC_ADDRESS,
  createProvider,
  getOrCreateATAInstruction,
} from '@/solana-program/util';
import { getAddressAbbreviation } from '@/utils';
import {
  getTokenMessengerContractAddress,
  getUSDCContractAddress,
} from '@/utils/addresses';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useMutation } from '@tanstack/react-query';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { Bytes, formatUnits, hexlify, parseUnits } from 'ethers/lib/utils';
import React, { useEffect, useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import { receiveMessage } from '@/solana-program/program';

type Transaction = {
  fromDomain: number;
  toAddress: string;
  usdcAddress: string;
  amount: number;
  messageBytes: Bytes;
  signature: string;
};

const Transfer: React.FC = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    'pending-transactions',
    []
  );
  const { account, chainId, error, active } = useWeb3React();
  const [selectedChain, setSelectedChain] = useState(Chain.ETH);
  const solanaWallet = useWallet();
  const provider = useMemo(() => {
    const connection = new Connection('https://api.devnet.solana.com');
    const provider = createProvider(solanaWallet, connection, {
      commitment: 'confirmed',
    });

    return provider;
  }, [solanaWallet]);

  const USDC_ADDRESS = getUSDCContractAddress(chainId);
  const TOKEN_MESSENGER_ADDRESS = getTokenMessengerContractAddress(chainId);

  const [amountToSend, setAmountToSend] = useState('');
  const { amount: approvedAmountBN, refetch: refetchApprovedAmount } =
    useTokenAllowance(USDC_ADDRESS, account ?? '', TOKEN_MESSENGER_ADDRESS);

  const balance = useTokenBalance(USDC_ADDRESS, account ?? '');

  const usdcBalance = useMemo(() => {
    if (account && active) {
      return Number(formatUnits(balance, DEFAULT_DECIMALS));
    }
    return 0;
  }, [account, active, balance]);

  const { approve } = useTokenApproval(USDC_ADDRESS, TOKEN_MESSENGER_ADDRESS);
  const { depositForBurn } = useTokenMessenger(chainId);

  const { mutate: handleApprove, isPending: isApproving } = useMutation({
    mutationFn: async () => {
      const amountToApprove: BigNumber = parseUnits('9', DEFAULT_DECIMALS);

      await approve(amountToApprove);
    },
  });

  const { mutate: handleTransfer, isPending: isTranfering } = useMutation({
    mutationFn: async () => {
      if (!solanaWallet.publicKey) {
        return;
      }
      const amount: BigNumber = parseUnits(amountToSend, DEFAULT_DECIMALS);

      const [userATA] = await getOrCreateATAInstruction(
        new PublicKey(SOLANA_USDC_ADDRESS),
        provider.wallet.publicKey,
        provider.connection,
        true
      );

      const response = await depositForBurn(
        amount,
        DestinationDomain.SOLANA,
        hexlify(bs58.decode(userATA.toBase58())),
        USDC_ADDRESS
      );

      if (response) {
        setTransactions([
          ...transactions,
          {
            amount: Number(amountToSend),
            fromDomain: DestinationDomain[selectedChain],
            messageBytes: response.messageBytes,
            signature: response.signature,
            usdcAddress: USDC_ADDRESS,
            toAddress: solanaWallet.publicKey?.toBase58(),
          },
        ]);
      }
    },
  });

  const { mutate: handleReceive, isPending: isReceving } = useMutation({
    mutationFn: async (transaction: Transaction) => {
      await receiveMessage(
        provider,
        transaction.usdcAddress,
        transaction.fromDomain.toString(),
        transaction.messageBytes + '',
        transaction.signature
      );
    },
  });

  const approvedAmount = useMemo(
    () => formatUnits(approvedAmountBN, DEFAULT_DECIMALS),
    [approvedAmountBN]
  );

  const selectedChainId = SupportedChainId[selectedChain];

  return (
    <div className="flex flex-col items-center p-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex space-x-4 ">
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value as Chain)}
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

        <div className="flex space-x-4">
          <input
            type="number"
            placeholder="Amount"
            className="input input-bordered w-full max-w-xs"
            value={amountToSend}
            onChange={(e) => setAmountToSend(e.target.value)}
          />
          {approvedAmount &&
          amountToSend &&
          Number(amountToSend) <= Number(approvedAmount) ? (
            <button
              disabled={
                !amountToSend ||
                !approvedAmount ||
                !solanaWallet.publicKey ||
                isTranfering
              }
              className="btn"
              onClick={() => {
                handleTransfer(undefined, {
                  onSuccess: () => {
                    refetchApprovedAmount();
                    alert('Approved successfully');
                  },
                });
              }}
            >
              {isTranfering ? 'Transfering' : 'Transfer'}
            </button>
          ) : (
            <button
              onClick={() => {
                handleApprove(undefined, {
                  onSuccess: () => {
                    refetchApprovedAmount();
                    alert('Transferred successfully');
                  },
                });
              }}
              disabled={
                !amountToSend ||
                !approvedAmount ||
                !solanaWallet.publicKey ||
                isApproving
              }
              className="btn"
            >
              {isApproving ? 'Approving' : 'Approve'}
            </button>
          )}
        </div>
        <div>USDC balance: {usdcBalance}</div>
        <div>
          {transactions.map((transaction) => {
            return (
              <div key={transaction.signature}>
                <button
                  className="btn"
                  onClick={() => {
                    handleReceive(transaction, {
                      onSuccess: () => {
                        alert('Redeemed successfully');
                        setTransactions((transactions) =>
                          transactions.filter(
                            (t) => t.signature !== transaction.signature
                          )
                        );
                      },
                    });
                  }}
                  disabled={isReceving}
                >
                  {isReceving
                    ? 'Redeeming'
                    : `Redeem ${transaction.amount} USDC`}
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
