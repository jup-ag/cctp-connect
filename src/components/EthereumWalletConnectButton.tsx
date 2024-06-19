import { useWeb3React } from '@web3-react/core';
import React, { useCallback, useEffect } from 'react';
import type { Web3Provider } from '@ethersproject/providers';
import { InjectedConnector } from '@web3-react/injected-connector';
import { ALL_SUPPORTED_CHAIN_IDS, CHAIN_IDS_TO_PARAMETERS, SupportedChainId } from '@/constants';
import { numToHex } from '@/utils';

interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

const injected = new InjectedConnector({
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
});

const EthereumWalletConnectButton: React.FC<{
  chainId: number;
}> = ({ chainId }) => {
  const {
    activate,
    chainId: connectedChainId,
    library,
  } = useWeb3React<Web3Provider>();

  const switchNetwork = useCallback(
    async (chainId: number) => {
      if (library?.provider?.request == null) return;
      console.log('runn', chainId);

      if (chainId != null) {
        // only attempt to switch if the state is mismatched
        const hexChainId = numToHex(chainId);
        try {
          await library.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: hexChainId }],
          });
        } catch (error) {
          console.log("error", error, CHAIN_IDS_TO_PARAMETERS, chainId);
          const switchError = error as ProviderRpcError;

          if (switchError.code === 4902 && chainId !== SupportedChainId.SOLANA) {
               try {
              await library.provider.request({
                method: 'wallet_addEthereumChain',
                params: [CHAIN_IDS_TO_PARAMETERS[chainId]],
              });
            } catch (error) {
              console.error(error);
            }
          }
        }
      }
    },
    [library]
  );

  useEffect(() => {
    if (connectedChainId && connectedChainId !== chainId) {
      switchNetwork(chainId);
    }
  }, [switchNetwork, connectedChainId, chainId]);

  return (
    <div>
      <button
        className={'btn'}
        onClick={() => {
          activate(injected);
        }}
      >
        Connect wallet
      </button>
    </div>
  );
};

export default EthereumWalletConnectButton;
