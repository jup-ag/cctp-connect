import { Chain, DestinationDomain, SupportedChainId } from '@/constants/chains';
import {
  getMessageTransmitterContractAddress,
  getTokenMessengerContractAddress,
  getUSDCContractAddress,
} from '@/utils/addresses';
import type { Web3Provider } from '@ethersproject/providers';
import {
  Erc20__factory,
  MessageTransmitter__factory,
  TokenMessenger__factory,
} from './types';
import { MaxUint256 } from '@ethersproject/constants';
import { parseUnits, hexlify } from 'ethers/lib/utils';
import { DEFAULT_DECIMALS } from '@/constants/tokens';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';

export class EvmCCTP {
  constructor(private library: Web3Provider) {}

  getUSDCAddress(chainId: number) {
    return getUSDCContractAddress(chainId);
  }
  async getTransactionReceipt(transactionHash: string) {
    return this.library.getTransactionReceipt(transactionHash);
  }

  async approve({
    amount,
    chain,
    useExact = true,
  }: {
    amount: number;
    chain: Chain;
    useExact?: boolean;
  }) {
    const chainId = SupportedChainId[chain];
    const usdcAddress = this.getUSDCAddress(chainId);
    const TOKEN_MESSENGER_ADDRESS = getTokenMessengerContractAddress(chainId);

    const contract = Erc20__factory.connect(
      usdcAddress,
      this.library.getSigner()
    );

    return contract.approve(
      TOKEN_MESSENGER_ADDRESS,
      useExact
        ? parseUnits(amount.toString(), DEFAULT_DECIMALS).toString()
        : MaxUint256
    );
  }

  async depositForBurn({
    amount,
    recipient,
    chain,
  }: {
    amount: number;
    recipient: string;
    chain: Chain;
  }) {
    const chainId = SupportedChainId[chain];
    const usdcAddress = this.getUSDCAddress(chainId);
    const TOKEN_MESSENGER_CONTRACT_ADDRESS =
      getTokenMessengerContractAddress(chainId);

    const contract = TokenMessenger__factory.connect(
      TOKEN_MESSENGER_CONTRACT_ADDRESS,
      this.library.getSigner()
    );

    return (
      await contract.depositForBurn(
        parseUnits(amount.toString(), DEFAULT_DECIMALS).toString(),
        DestinationDomain.SOLANA,
        hexlify(bs58.decode(recipient)),
        usdcAddress
      )
    ).hash;
  }

  async receiveMessage({
    message,
    attestation,
    chain,
  }: {
    message: string;
    attestation: string;
    chain: Chain;
  }) {
    const chainId = SupportedChainId[chain];
    const MESSAGE_TRANSMITTER_CONTRACT_ADDRESS =
      getMessageTransmitterContractAddress(chainId);

    const contract = MessageTransmitter__factory.connect(
      MESSAGE_TRANSMITTER_CONTRACT_ADDRESS,
      this.library.getSigner()
    );

    try {
      return await contract.receiveMessage(message, attestation);
    } catch (e) {
      console.error(e);

      throw e;
    }
  }

  async getUSDCBalance(address: string, chainId: number) {
    const usdcAddress = this.getUSDCAddress(chainId);
    const contract = Erc20__factory.connect(usdcAddress, this.library);

    return contract.balanceOf(address);
  }

  async getAllowance(address: string, chainId: number) {
    const usdcAddress = this.getUSDCAddress(chainId);
    const TOKEN_MESSENGER_ADDRESS = getTokenMessengerContractAddress(chainId);

    const contract = Erc20__factory.connect(usdcAddress, this.library);

    return contract.allowance(address, TOKEN_MESSENGER_ADDRESS);
  }
}
