import { useCallback } from 'react';

import { MaxUint256 } from '@ethersproject/constants';
import { useWeb3React } from '@web3-react/core';

import type {
  TransactionResponse,
  Web3Provider,
} from '@ethersproject/providers';
import type { BigNumber } from 'ethers';
import { Erc20__factory } from '@/typechain';
import useTransaction from './useTransaction';
import { DEFAULT_BLOCKCHAIN_DELAY } from '@/constants';

interface TokenApprovalResponse {
  approve: (amountToApprove: BigNumber) => Promise<boolean | undefined>;
}

/**
 * Returns a approve method that can be used to approve allowance
 * @param tokenAddress the given token contract address
 * @param spenderAddress the spender's address that the allowance is granted on
 * @param useExact boolean to approve exact amount or infinite amount
 */
const useTokenApproval = (
  tokenAddress: string,
  spenderAddress: string,
  useExact = true,
  signal?: AbortSignal
): TokenApprovalResponse => {
  const { library } = useWeb3React<Web3Provider>();
  const { getTransactionReceipt } = useTransaction();

  const approve = useCallback<TokenApprovalResponse['approve']>(
    async (amountToApprove) => {
      if (!library) return;
      const token = Erc20__factory.connect(tokenAddress, library.getSigner());

      return await token
        .approve(
          spenderAddress,
          useExact ? amountToApprove.toString() : MaxUint256
        )
        .then((response: TransactionResponse) => {
          const { hash } = response;
          return new Promise<boolean>((resolve, reject) => {
            const interval = setInterval(async () => {
              if (signal?.aborted) {
                clearInterval(interval);
                reject(false);
              }

              const transactionReceipt = await getTransactionReceipt(hash);
              if (transactionReceipt != null) {
                const { status, logs } = transactionReceipt;
                // Success
                if (status === 1) {
                  clearInterval(interval);
                  resolve(true);
                }
              }
            }, DEFAULT_BLOCKCHAIN_DELAY);
          });
        })
        .catch((error: Error) => {
          throw new Error(error.message);
        });
    },
    [
      library,
      useExact,
      getTransactionReceipt,
      signal,
      tokenAddress,
      spenderAddress,
    ]
  );

  return {
    approve,
  };
};

export default useTokenApproval;
