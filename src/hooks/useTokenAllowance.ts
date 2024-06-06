import { useMemo } from 'react';

import { BigNumber } from 'ethers';

import useContractQuery from './useContractQuery';

/**
 * Returns the allowance of the given tokenAddress from the ownerAddress,
 * to be spent by the spenderAddress
 * @param tokenAddress the given token contract address
 * @param ownerAddress the wallet owner's address
 * @param spenderAddress the spender's address that the allowance is granted on
 */
const useTokenAllowance = (
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string
) => {
  const inputs = ['allowance', ownerAddress, spenderAddress];
  const { data: allowance, refetch } = useContractQuery(tokenAddress, inputs);

  const amount = useMemo(() => allowance ?? BigNumber.from(0), [allowance]);

  return { amount, refetch };
};

export default useTokenAllowance;
