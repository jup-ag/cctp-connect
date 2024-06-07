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
import { receiveMessage } from '@/solana-program';
import { useSolanaCCTP } from '@/hooks/useSolanaCCTP';
import clsx from 'clsx';
import useMessageTransmitter from '@/hooks/useMessageTransmitter';

type Transaction = {
  fromDomain: number;
  toAddress: string;
  usdcAddress: string;
  amount: number;
  messageBytes: Bytes;
  signature: string;
};

const obj = {
  signature:
    '0xeffdae47d185b67f4bf014d00940f2f479eacc3233bed05f6502dda4071868371a15ef85737b670137104db01672d62f168d1f012f19993c8d4617667e52b7c31b4bc2b1efaa8efb6d97d650f9cdcfa4be94c26013b4b0a55545ba793f0311bf4c38f4d2e33c76657039fff66283f84966bf1f7824028ac1d5993eee02de650e531b',
  message:
    '0x0000000000000005000000000000000000000d35a65fc943419a5ad590042fd67c9791fd015acf53a54cc823edb8ff81b9ed722e0000000000000000000000009f3b8679c73c2fef8b59b4f3444d4e156fb70aa50000000000000000000000000000000000000000000000000000000000000000000000003b442cb3912157f13a933d0134282d032b5ffecd01a2dbf1b7790608df002ea700000000000000000000000088b8ae6b9d66728afbea7357c7650caaccd5111f00000000000000000000000000000000000000000000000000000000000186a0e439a697d9e3acdd2003a50b91abf1f62a0fc91d8823138c34924d3bddc104ef',
  eventNonce: '3381',
};

const hash =
  '5fZTFpCxazAqHFRgniJHo1qejMb1g6Ey1w35s7bkKJJUFUMa4o7g7X9PYhMsJp5Tvi7SoSHoY1NuUCqbAMf4eLzz';

const Transfer: React.FC = () => {
  const solanaCCTP = useSolanaCCTP();
  const [isSwapped, setIsSwapped] = useState(false);
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

  const func = useMessageTransmitter(SupportedChainId[selectedChain]);

  const { mutate: handleTransfer, isPending: isTranfering } = useMutation({
    mutationFn: async () => {
      if (!solanaWallet.publicKey || !account) {
        return;
      }
      const amount: BigNumber = parseUnits(amountToSend, DEFAULT_DECIMALS);

      if (isSwapped) {
        console.log(amount.toNumber());

        try {
          const response = await solanaCCTP.depositForBurn({
            destinationDomain: DestinationDomain[selectedChain],
            amount: Number(amountToSend),
            recipient: account,
          });
          console.log(response);
        } catch (e) {
          console.log(e);
        }

        return;
      }

      const [recipientATA] = await solanaCCTP.getOrCreateUSDCATAInstruction();

      const response = await depositForBurn(
        amount,
        DestinationDomain.SOLANA,
        hexlify(bs58.decode(recipientATA.toBase58())),
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
      await solanaCCTP.receiveMessage({
        remoteDomain: transaction.fromDomain.toString(),
        remoteUSDCAddressHex: transaction.usdcAddress,
        message: transaction.messageBytes + '',
        attestation: transaction.signature,
      });
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
        <div
          className={clsx(
            'flex flex-col space-y-6',
            isSwapped && '!flex-col-reverse space-y-reverse'
          )}
        >
          <>
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
          </>

          <button
            onClick={() => {
              setIsSwapped((s) => !s);
            }}
            className="btn"
          >
            Swap
          </button>

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
        </div>

        <div className="flex space-x-4">
          <input
            type="number"
            placeholder="Amount"
            className="input input-bordered w-full max-w-xs"
            value={amountToSend}
            onChange={(e) => setAmountToSend(e.target.value)}
          />
          {isSwapped ||
          (approvedAmount &&
            amountToSend &&
            Number(amountToSend) <= Number(approvedAmount)) ? (
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
                    alert('Transfered successfully');
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
                    alert('Approved successfully');
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
        <button
          onClick={async () => {
            await func.receiveMessage(obj.message as any, obj.signature as any);
            console.log('done');
          }}
        >
          Redeem
        </button>
      </div>
    </div>
  );
};

export default Transfer;
