import { useWeb3React } from '@web3-react/core';

import type { Web3Provider } from '@ethersproject/providers';
import { useMemo } from 'react';
import { EvmCCTP } from '@/evm-program';

export function useEVMCCTP() {
  const { library } = useWeb3React<Web3Provider>();

  const evmCCTP = useMemo(() => {
    if (!library) {
      return null;
    }
    return new EvmCCTP(library);
  }, [library]);

  return evmCCTP;
}
