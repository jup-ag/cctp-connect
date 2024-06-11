import { defaultAbiCoder, id, keccak256 } from 'ethers/lib/utils';
import type { Log } from '@ethersproject/providers';
import type { Bytes } from 'ethers/lib/utils';
import {
  CHAIN_IDS_TO_USDC_ADDRESSES,
  CHAIN_IDS_TO_TOKEN_MESSENGER_ADDRESSES,
  CHAIN_IDS_TO_MESSAGE_TRANSMITTER_ADDRESSES,
} from './constants';

export const getUSDCContractAddress = (chainId?: number): string => {
  if (chainId == null) {
    return '';
  }
  return CHAIN_IDS_TO_USDC_ADDRESSES[chainId];
};

export const getTokenMessengerContractAddress = (chainId?: number): string => {
  if (chainId == null) {
    return '';
  }
  return CHAIN_IDS_TO_TOKEN_MESSENGER_ADDRESSES[chainId];
};

export const getMessageTransmitterContractAddress = (
  chainId?: number
): string => {
  if (chainId == null) {
    return '';
  }
  return CHAIN_IDS_TO_MESSAGE_TRANSMITTER_ADDRESSES[chainId];
};

/**
 * Returns the abbreviation of an address
 * @param address the address to be convert to abbreviation
 */
export function getAddressAbbreviation(address: string): string {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

/**
 * Returns message bytes from decoding the event logs
 * @param logs the event logs of a transaction
 * @param topic the topic to be filter from the log
 */
export function getMessageBytesFromEventLogs(
  logs: Log[],
  topic: string
): Bytes {
  const eventTopic = id(topic);
  const log = logs.filter((l) => l.topics[0] === eventTopic)[0];
  return defaultAbiCoder.decode(['bytes'], log.data)[0] as Bytes;
}

/**
 * Returns message hash from the message bytes
 * @param message the message bytes
 */
export function getMessageHashFromBytes(message: Bytes): string {
  return keccak256(message);
}

export const numToHex = (num: number) => {
  const val = Number(num);
  return '0x' + val.toString(16);
};
