import { useWeb3React } from '@web3-react/core';
import type { Web3Provider } from '@ethersproject/providers';
import { useQuery } from '@tanstack/react-query';
import { useEVMCCTP } from './useEvmCCTP';
import { formatUnits } from 'ethers/lib/utils';
import { DEFAULT_DECIMALS } from '@/constants/tokens';

export function useEvmUSDCBalance() {
  const { chainId, account } = useWeb3React<Web3Provider>();
  const evmCCTP = useEVMCCTP();

  return useQuery({
    queryKey: ['usdc-balance', chainId, account],
    queryFn: async () => {
      if (!account || !evmCCTP || !chainId) {
        return 0;
      }
      try {
        const amount = await evmCCTP.getUSDCBalance(account, chainId);
        return Number(formatUnits(amount, DEFAULT_DECIMALS));
      } catch {
        return 0;
      }
    },
    refetchInterval: 60 * 1000,
  });
}
