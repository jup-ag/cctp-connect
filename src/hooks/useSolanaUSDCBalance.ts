import { useQuery } from '@tanstack/react-query';
import { DEFAULT_DECIMALS } from '@/constants';
import { useSolanaCCTP } from './useSolanaCCTP';
import { useWallet } from '@jup-ag/wallet-adapter';
import { fromLamports } from '@/programs/solana-program/util';

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
