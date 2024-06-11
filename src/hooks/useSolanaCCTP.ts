import { useWallet } from '@jup-ag/wallet-adapter';
import { useMemo } from 'react';
import { Connection } from '@solana/web3.js';
import { createProvider } from '@/programs/solana-program/util';
import { SolanaCCTP } from '@/programs/solana-program';

export function useSolanaCCTP() {
  const solanaWallet = useWallet();
  const provider = useMemo(() => {
    const connection = new Connection('https://api.devnet.solana.com');
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
