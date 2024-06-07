import { useWeb3React } from '@web3-react/core';
import type { Web3Provider } from '@ethersproject/providers';
import { useQuery } from '@tanstack/react-query';
import { useEVMCCTP } from './useEvmCCTP';
import { formatUnits } from 'ethers/lib/utils';
import { DEFAULT_DECIMALS } from '@/constants/tokens';
import { useSolanaCCTP } from './useSolanaCCTP';
import { useWallet } from '@jup-ag/wallet-adapter';
import { fromLamports } from '@/solana-program/util';

export function useSolanaUSDCBalance() {
  const wallet = useWallet();
  const solanaCCTP = useSolanaCCTP();

  return useQuery({
    queryKey: ['solana-usdc-balance', wallet.publicKey?.toBase58()],
    queryFn: async () => {
      if (!wallet.publicKey) {
        return 0;
      }
      try {
        const amount = await solanaCCTP.getUSDCBalance();
        return Number(fromLamports(amount, DEFAULT_DECIMALS));
      } catch {
        return 0;
      }
    },
    refetchInterval: 60 * 1000,
  });
}
