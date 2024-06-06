import { useMemo } from 'react';

import { BigNumber } from 'ethers';

import useContractQuery from './useContractQuery';

/**
 * Returns the token balance of the given tokenAddress from the ownerAddress
 * @param tokenAddress the given token contract address
 * @param ownerAddress the wallet owner's address
 */
const useTokenBalance = (
  tokenAddress: string,
  ownerAddress: string
): BigNumber => {
  const inputs = ['balanceOf', ownerAddress];
  const balance = useContractQuery(tokenAddress, inputs).data;
  return useMemo(() => balance ?? BigNumber.from(0), [balance]);
};

export default useTokenBalance;
