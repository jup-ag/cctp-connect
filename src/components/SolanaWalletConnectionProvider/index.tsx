import React, { PropsWithChildren, useMemo } from 'react';
import {
  Adapter,
  UnifiedWalletProvider,
  WalletAdapterNetwork,
  WalletName,
  WalletReadyState,
} from '@jup-ag/wallet-adapter';

import {
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
  WalletConnectWalletAdapter,
  LedgerWalletAdapter,
  Coin98WalletAdapter,
  TrezorWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  initialize as initializeSolflareAndMetamaskSnap,
  SolflareWalletAdapter,
} from '@solflare-wallet/wallet-adapter';
import { TipLinkWalletAdapter } from '@tiplink/wallet-adapter';

import { APP_INFO } from './metadata';
import { HARDCODED_WALLET_STANDARDS } from './hardcodedWallets';
import { MoongateWalletAdapter } from '@moongate/moongate-adapter';

export const MWA_NOT_FOUND_ERROR = 'MWA_NOT_FOUND_ERROR';

initializeSolflareAndMetamaskSnap();

const WithCometWallet: React.FC<PropsWithChildren> = ({ children }) => {
  const metadata = APP_INFO['Jupiter'];

  const wallets: Adapter[] = useMemo(() => {
    const walletConnectWalletAdapter = (() => {
      if (!metadata.walletConnectProjectId) return null;

      const adapter = new WalletConnectWalletAdapter({
        network: WalletAdapterNetwork.Mainnet,
        options: {
          relayUrl: 'wss://relay.walletconnect.com',
          projectId: metadata.walletConnectProjectId,
          metadata: {
            name: metadata.name,
            description: metadata.description,
            url: metadata.url,
            icons: metadata.iconUrls,
          },
        },
      });

      // @ts-expect-error write to read only variable
      adapter.supportedTransactionVersions = new Set(['legacy']);
      return adapter;
    })();

    const MoongateWalletAdapterAsLoadable = new Proxy(
      new MoongateWalletAdapter(),
      {
        get: function (target, props, receiver) {
          if (props === 'readyState' || props === '_readyState') {
            return WalletReadyState.Loadable;
          }
          return Reflect.get(target, props, receiver);
        },
      }
    );

    const TipLinkAdapter = (() => {
      if (!metadata || !metadata.tiplink) return null;

      return new TipLinkWalletAdapter({
        title: metadata.tiplink.title,
        clientId: metadata.tiplink.clientId,
        theme: metadata.tiplink.theme,
      });
    })();

    return [
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
      new LedgerWalletAdapter(),
      new TrezorWalletAdapter(),
      walletConnectWalletAdapter,
      MoongateWalletAdapterAsLoadable,
      new Coin98WalletAdapter(),
      TipLinkAdapter,
    ].filter((item) => item && item.name && item.icon) as Adapter[];
  }, []);

  return (
    <UnifiedWalletProvider
      wallets={wallets}
      config={{
        env: 'mainnet-beta',
        autoConnect: true,
        metadata: metadata,
        hardcodedWallets: HARDCODED_WALLET_STANDARDS,
        walletPrecedence: [
          'Ethereum Wallet' as WalletName,
          'Bitget Wallet' as WalletName,
          'OKX Wallet' as WalletName,
        ],
        walletlistExplanation: {
          href: 'https://docs.jup.ag/docs/additional-topics/wallet-list',
        },
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
};

export default WithCometWallet;
