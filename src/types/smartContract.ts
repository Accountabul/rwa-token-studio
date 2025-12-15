import { Role } from "./tokenization";

export type ContractStatus = "DRAFT" | "DEPLOYING" | "ACTIVE" | "PAUSED" | "DELETED";

export type ContractTemplate = 
  | "ESCROW_AUTOMATION"
  | "TOKEN_VESTING"
  | "ORACLE_PRICE_FEED"
  | "STAKING_REWARDS"
  | "CUSTOM";

export const contractTemplateLabels: Record<ContractTemplate, string> = {
  ESCROW_AUTOMATION: "Escrow Automation",
  TOKEN_VESTING: "Token Vesting",
  ORACLE_PRICE_FEED: "Oracle Price Feed",
  STAKING_REWARDS: "Staking Rewards",
  CUSTOM: "Custom Contract",
};

export const contractTemplateDescriptions: Record<ContractTemplate, string> = {
  ESCROW_AUTOMATION: "Automate escrow release based on conditions and oracles",
  TOKEN_VESTING: "Time-based token vesting with cliff and linear release",
  ORACLE_PRICE_FEED: "Connect external price data to on-chain logic",
  STAKING_REWARDS: "Distribute staking rewards based on lock duration",
  CUSTOM: "Upload your own WASM contract",
};

export type ContractParamType = 
  | "UInt32" 
  | "UInt64" 
  | "Hash256" 
  | "Amount" 
  | "Account" 
  | "Issue"
  | "String"
  | "Boolean";

export interface ContractParameter {
  name: string;
  type: ContractParamType;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

export interface ContractFunction {
  name: string;
  description?: string;
  parameters: ContractParameter[];
  returnType?: ContractParamType;
  flags?: string[];
}

export interface SmartContract {
  id: string;
  name: string;
  description: string;
  template: ContractTemplate;
  status: ContractStatus;
  
  contractHash: string;
  wasmSize: number;
  
  contractAddress: string;
  ownerAddress: string;
  
  functions: ContractFunction[];
  instanceParams: ContractParameter[];
  
  createTxHash?: string;
  deleteTxHash?: string;
  
  createdAt: string;
  updatedAt: string;
  deployedBy: string;
  
  network: "mainnet" | "testnet" | "devnet";
  
  totalCalls: number;
  lastCallAt?: string;
}

export interface ContractCall {
  id: string;
  contractId: string;
  functionName: string;
  caller: string;
  params: Record<string, any>;
  result: "SUCCESS" | "FAILED";
  txHash: string;
  timestamp: string;
  gasUsed?: number;
  errorMessage?: string;
}

export function canDeployContract(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "TOKENIZATION_MANAGER";
}

export function canCallContract(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "CUSTODY_OFFICER";
}

export function canPauseContract(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "COMPLIANCE_OFFICER";
}

export function canDeleteContract(role: Role): boolean {
  return role === "SUPER_ADMIN";
}
