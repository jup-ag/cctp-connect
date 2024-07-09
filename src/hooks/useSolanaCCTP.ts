import { useWallet } from '@jup-ag/wallet-adapter';
import { useMemo } from 'react';
import { Connection } from '@solana/web3.js';
import { createProvider } from '@/programs/solana-program/util';
import { SolanaCCTP } from '@/programs/solana-program';
import { SOLANA_API_URL } from '@/constants';

export function useSolanaCCTP() {
  const solanaWallet = useWallet();
  const provider = useMemo(() => {
    const connection = new Connection(SOLANA_API_URL, {
      confirmTransactionInitialTimeout: 2 * 60 * 1000
    });
    const provider = createProvider(solanaWallet, connection, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 2 * 60 * 1000
    });

    return provider;
  }, [solanaWallet]);

  const cctp = useMemo(() => {
    return new SolanaCCTP(provider);
  }, [provider]);

  return cctp;
}
