// constants/contract.ts

export const CONTRACT_ADDRESS = "0xdDB740Ee774faB7D88Dfb5803F07feFE807494F6" as `0x${string}`; // paste your deployed address here

export const CITREA_CHAIN_ID = 5115; 

import { CONTRACT_ABI } from "./abi";

export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI.abi,
};

// Export for marketplace page
export const capsuleXAbi = CONTRACT_ABI.abi;
export const capsuleXAddress = CONTRACT_ADDRESS;