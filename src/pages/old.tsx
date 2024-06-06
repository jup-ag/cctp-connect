import { useWeb3React } from '@web3-react/core';

import type { Web3Provider } from '@ethersproject/providers';
import { hexlify, parseUnits } from 'ethers/lib/utils';

import { InjectedConnector } from '@web3-react/injected-connector';
import { ALL_SUPPORTED_CHAIN_IDS, DestinationDomain } from '@/constants/chains';
import useTokenApproval from '@/hooks/useTokenApproval';
import {
  getTokenMessengerContractAddress,
  getUSDCContractAddress,
} from '@/utils/addresses';
import useTokenMessenger from '@/hooks/useTokenMessenger';
import { BigNumber } from 'ethers';
import { DEFAULT_DECIMALS } from '@/constants/tokens';
import useTokenAllowance from '@/hooks/useTokenAllowance';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { UnifiedWalletButton, useWallet } from '@jup-ag/wallet-adapter';
import { createProvider } from '@/solana-program/util';
import { receiveMessage } from '@/solana-program/program';
import { Connection } from '@solana/web3.js';

export const injected = new InjectedConnector({
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
});

// input for typing amount
// input for typing destination
// select for destination domain
// select for source domain

const signatureForRedeem = {
  messageHash:
    '0xfdfb240ec14c7bac453924f709bf78aa016188e99792d3157ba8cd087cdb2e01',
  signature:
    '0x5a0e6ab1d0a38401cf0be22e71388c2c505fb1ca31c0334e…25be906f21dfb8f6d93161f8d4580f13f0bb41e011a14581b',
};

const log = {
  messageBytes:
    '0x000000000000000000000005000000000003f2480000000000000000000000009f3b8679c73c2fef8b59b4f3444d4e156fb70aa5a65fc943419a5ad590042fd67c9791fd015acf53a54cc823edb8ff81b9ed722e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c7d4b196cb0c7b01d743fbc6116a902379c7238e439a697d9e3acdd2003a50b91abf1f62a0fc91d8823138c34924d3bddc104ef0000000000000000000000000000000000000000000000000000000000002710000000000000000000000000724f337bf0fa934db9aa3ec6dea49b03c54ad3cc',
  messageHash:
    '0x167a768e3c5c55ee1bef9da7003697470b45e0a5f29a277a94598b0629b4fb1d',
  hash: '0x34ebad9abda8e9fd3e51dab5364a83de1b842a85aead81d1e7d1e0008d89fd3d',
  signature:
    '0xcce63c4df5d1cb4414b1fb8bee5b6124f3894dfa6e6467858a682915705624f4705801683bacdaf15892c78c115f176deaa8b49b6a1ca68fc443e15466229a9a1b834076bac5485a6aa23381f8ccbcbe28270cfa58875fa0d82f3fad878e6053fb6cc1b4833a2125b8637d8b7da90d54765a650a76a599e41174968b6163702d461c',
};

export default function Home() {
  const { activate, account, chainId } = useWeb3React<Web3Provider>();
  const wallet = useWallet();

  const USDC_ADDRESS = getUSDCContractAddress(chainId);
  const TOKEN_MESSENGER_ADDRESS = getTokenMessengerContractAddress(chainId);

  const { approve } = useTokenApproval(USDC_ADDRESS, TOKEN_MESSENGER_ADDRESS);
  const { depositForBurn } = useTokenMessenger(chainId);
  const { amount: approvedAmount, refetch: refetchApprovedAmount } =
    useTokenAllowance(USDC_ADDRESS, account ?? '', TOKEN_MESSENGER_ADDRESS);

  const handleApprove = async () => {
    const amountToApprove: BigNumber = parseUnits('9', DEFAULT_DECIMALS);

    await approve(amountToApprove);
    refetchApprovedAmount();
  };

  const transfer = async () => {
    const amountToSend: BigNumber = parseUnits('0.01', DEFAULT_DECIMALS);

    const response = await depositForBurn(
      amountToSend,
      DestinationDomain.SOLANA,
      // hexlify(bs58.decode('9akRjn5VKNT3vLF7iYPgdyEomNESULknSk4NzYc6VK5X')),
      hexlify(bs58.decode('3aytkKNrCTFKEazvohHgMQWftjaxvVi4KcHhMXPHnrRL')),
      USDC_ADDRESS
    );

    console.log(response);
  };
  return (
    <div className="flex flex-col items-center p-10 gap-10">
      {account ? (
        <>
          <p>{account}</p>
          <p>Approved amount:{approvedAmount.toNumber()} </p>
          <button
            onClick={() => {
              handleApprove();
            }}
            type="button"
            className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Approve
          </button>
          <button
            onClick={transfer}
            type="button"
            className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Transfer
          </button>
        </>
      ) : (
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => {
            activate(injected);
          }}
        >
          Connect wallet
        </button>
      )}
      <UnifiedWalletButton
        buttonClassName="!bg-transparent"
        overrideContent={
          <button
            className={
              'w-full rounded-lg border border-v2-primary/20 bg-v2-primary/5 text-v2-primary px-3 py-[10px] font-semibold text-base flex justify-center items-center disabled:cursor-not-allowed  disabled:bg-none disabled:text-opacity-25 disabled:text-[#CFF3FF]'
            }
            onClick={() => {}}
          >
            connect solana
          </button>
        }
      />
      {wallet.publicKey && (
        <button
          onClick={() => {
            const connection = new Connection('https://api.devnet.solana.com');
            const provider = createProvider(wallet, connection, {
              commitment: 'confirmed',
            });
            // receiveMessage(provider);
          }}
        >
          Redeem
        </button>
      )}
    </div>
  );
}
