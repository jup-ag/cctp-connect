import { useWeb3React } from '@web3-react/core';
import React from 'react';
import type { Web3Provider } from '@ethersproject/providers';
import { InjectedConnector } from '@web3-react/injected-connector';

const EthereumWalletConnectButton: React.FC<{
  chainId: number;
}> = ({ chainId }) => {
  const { activate } = useWeb3React<Web3Provider>();
  return (
    <div>
      <button
        className={'btn'}
        onClick={() => {
          activate(
            new InjectedConnector({
              supportedChainIds: [chainId],
            })
          );
        }}
      >
        Connect wallet
      </button>
    </div>
  );
};

export default EthereumWalletConnectButton;
