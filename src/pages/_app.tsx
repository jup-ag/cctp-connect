import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import type { FC, ReactNode } from 'react';

import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider } from '@web3-react/core';
import type { ExternalProvider } from '@ethersproject/providers';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import SolanaWalletConnectionProvider from '../components/WalletConnectionProvider';

const queryClient = new QueryClient();

export const WalletContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const getLibrary = (provider: ExternalProvider) => {
    return new Web3Provider(provider);
  };

  return (
    <Web3ReactProvider getLibrary={getLibrary}>{children}</Web3ReactProvider>
  );
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SolanaWalletConnectionProvider>
      <WalletContextProvider>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </WalletContextProvider>
    </SolanaWalletConnectionProvider>
  );
}
