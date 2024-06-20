import { useWallet } from '@jup-ag/wallet-adapter';
import { useMemo } from 'react';
import { Connection } from '@solana/web3.js';
import { createProvider } from '@/programs/solana-program/util';
import { SolanaCCTP } from '@/programs/solana-program';
import { SOLANA_API_URL } from '@/constants';

export function useSolanaCCTP() {
  const solanaWallet = useWallet();
  const provider = useMemo(() => {
    const connection = new Connection(SOLANA_API_URL);
    const provider = createProvider(solanaWallet, connection, {
      commitment: 'confirmed',
    });

    return provider;
  }, [solanaWallet]);

  const cctp = useMemo(() => {
    return new SolanaCCTP(provider);
  }, [provider]);

  return cctp;
}
