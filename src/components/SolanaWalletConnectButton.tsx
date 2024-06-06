import { UnifiedWalletButton, useWallet } from '@jup-ag/wallet-adapter';
import React from 'react';

const SolanaWalletConnectButton: React.FC = () => {
  const wallet = useWallet();
  return (
    <div>
      <UnifiedWalletButton
        buttonClassName="!bg-transparent"
        overrideContent={
          <button className={'btn'} onClick={() => {}}>
            Connect wallet
          </button>
        }
      />
    </div>
  );
};

export default SolanaWalletConnectButton;
