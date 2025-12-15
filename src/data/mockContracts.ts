import { SmartContract, ContractCall } from "@/types/smartContract";

export const mockContracts: SmartContract[] = [
  {
    id: "contract_001",
    name: "Property Escrow Automation",
    description: "Automates escrow release when property deed transfer is confirmed via oracle",
    template: "ESCROW_AUTOMATION",
    status: "ACTIVE",
    contractHash: "A1B2C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF123456",
    wasmSize: 42500,
    contractAddress: "rContractABC123XYZ456789",
    ownerAddress: "rOwner123ABC456DEF789",
    functions: [
      {
        name: "checkCondition",
        description: "Check if escrow release condition is met",
        parameters: [
          { name: "escrowId", type: "Hash256", required: true, description: "Escrow identifier" }
        ],
        returnType: "Boolean"
      },
      {
        name: "releaseEscrow",
        description: "Release escrow funds to destination",
        parameters: [
          { name: "escrowId", type: "Hash256", required: true },
          { name: "oracleSignature", type: "Hash256", required: true }
        ],
        flags: ["tfSendAmount"]
      }
    ],
    instanceParams: [
      { name: "oracleAddress", type: "Account", required: true, description: "Trusted oracle account" },
      { name: "minConfirmations", type: "UInt32", required: true, defaultValue: "3" }
    ],
    createTxHash: "ABC123DEF456789012345678901234567890ABCDEF1234567890ABCDEF123456",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    deployedBy: "admin@accountabul.com",
    network: "testnet",
    totalCalls: 47,
    lastCallAt: "2024-03-10T14:22:00Z"
  },
  {
    id: "contract_002",
    name: "Token Vesting Schedule",
    description: "Linear token vesting with 12-month cliff for team allocations",
    template: "TOKEN_VESTING",
    status: "ACTIVE",
    contractHash: "B2C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF123456AB",
    wasmSize: 38200,
    contractAddress: "rContractVest789XYZ123",
    ownerAddress: "rOwner123ABC456DEF789",
    functions: [
      {
        name: "claimVested",
        description: "Claim available vested tokens",
        parameters: [
          { name: "beneficiary", type: "Account", required: true }
        ],
        returnType: "Amount",
        flags: ["tfSendAmount"]
      },
      {
        name: "getVestedAmount",
        description: "Check vested amount for beneficiary",
        parameters: [
          { name: "beneficiary", type: "Account", required: true }
        ],
        returnType: "Amount"
      },
      {
        name: "addBeneficiary",
        description: "Add new beneficiary with allocation",
        parameters: [
          { name: "beneficiary", type: "Account", required: true },
          { name: "totalAllocation", type: "Amount", required: true },
          { name: "vestingStart", type: "UInt64", required: true }
        ]
      }
    ],
    instanceParams: [
      { name: "tokenId", type: "Hash256", required: true, description: "MPT Token ID" },
      { name: "cliffMonths", type: "UInt32", required: true, defaultValue: "12" },
      { name: "vestingMonths", type: "UInt32", required: true, defaultValue: "36" }
    ],
    createTxHash: "DEF456789012345678901234567890ABCDEF1234567890ABCDEF123456ABC123",
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-15T11:30:00Z",
    deployedBy: "tokenization@accountabul.com",
    network: "testnet",
    totalCalls: 156,
    lastCallAt: "2024-03-12T09:15:00Z"
  },
  {
    id: "contract_003",
    name: "Real Estate Price Oracle",
    description: "Aggregates property valuations from multiple oracle sources",
    template: "ORACLE_PRICE_FEED",
    status: "ACTIVE",
    contractHash: "C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF123456ABCD",
    wasmSize: 51800,
    contractAddress: "rContractOracle456ABC",
    ownerAddress: "rOwner123ABC456DEF789",
    functions: [
      {
        name: "getLatestPrice",
        description: "Get latest aggregated price for asset",
        parameters: [
          { name: "assetId", type: "Hash256", required: true }
        ],
        returnType: "Amount"
      },
      {
        name: "submitPrice",
        description: "Submit price update (oracle only)",
        parameters: [
          { name: "assetId", type: "Hash256", required: true },
          { name: "price", type: "Amount", required: true },
          { name: "timestamp", type: "UInt64", required: true }
        ]
      }
    ],
    instanceParams: [
      { name: "authorizedOracles", type: "String", required: true, description: "Comma-separated oracle addresses" },
      { name: "minOracles", type: "UInt32", required: true, defaultValue: "2" },
      { name: "maxDeviation", type: "UInt32", required: true, defaultValue: "5", description: "Max % deviation" }
    ],
    createTxHash: "GHI789012345678901234567890ABCDEF1234567890ABCDEF123456ABCDEF123",
    createdAt: "2024-02-20T14:00:00Z",
    updatedAt: "2024-02-20T14:00:00Z",
    deployedBy: "admin@accountabul.com",
    network: "testnet",
    totalCalls: 892,
    lastCallAt: "2024-03-12T16:45:00Z"
  },
  {
    id: "contract_004",
    name: "Staking Rewards Distribution",
    description: "Distributes staking rewards based on lock duration multiplier",
    template: "STAKING_REWARDS",
    status: "PAUSED",
    contractHash: "D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF123456ABCDEF",
    wasmSize: 45600,
    contractAddress: "rContractStake789DEF",
    ownerAddress: "rOwner123ABC456DEF789",
    functions: [
      {
        name: "stake",
        description: "Stake tokens for rewards",
        parameters: [
          { name: "amount", type: "Amount", required: true },
          { name: "lockDuration", type: "UInt32", required: true, description: "Lock duration in days" }
        ]
      },
      {
        name: "unstake",
        description: "Unstake tokens after lock period",
        parameters: [
          { name: "stakeId", type: "Hash256", required: true }
        ],
        flags: ["tfSendAmount"]
      },
      {
        name: "claimRewards",
        description: "Claim accumulated rewards",
        parameters: [],
        flags: ["tfSendAmount"]
      }
    ],
    instanceParams: [
      { name: "rewardTokenId", type: "Hash256", required: true },
      { name: "baseApy", type: "UInt32", required: true, defaultValue: "5" },
      { name: "maxMultiplier", type: "UInt32", required: true, defaultValue: "3" }
    ],
    createTxHash: "JKL012345678901234567890ABCDEF1234567890ABCDEF123456ABCDEF123456",
    createdAt: "2024-03-01T08:00:00Z",
    updatedAt: "2024-03-08T16:00:00Z",
    deployedBy: "custody@accountabul.com",
    network: "testnet",
    totalCalls: 23,
    lastCallAt: "2024-03-08T15:30:00Z"
  },
  {
    id: "contract_005",
    name: "Custom KYC Gate",
    description: "Custom contract for KYC verification before token transfers",
    template: "CUSTOM",
    status: "DRAFT",
    contractHash: "E5F6789012345678901234567890ABCDEF1234567890ABCDEF123456ABCDEF12",
    wasmSize: 28400,
    contractAddress: "",
    ownerAddress: "rOwner123ABC456DEF789",
    functions: [
      {
        name: "verifyKYC",
        description: "Verify KYC status of account",
        parameters: [
          { name: "account", type: "Account", required: true }
        ],
        returnType: "Boolean"
      }
    ],
    instanceParams: [
      { name: "kycProvider", type: "Account", required: true }
    ],
    createdAt: "2024-03-10T11:00:00Z",
    updatedAt: "2024-03-10T11:00:00Z",
    deployedBy: "compliance@accountabul.com",
    network: "devnet",
    totalCalls: 0
  }
];

export const mockContractCalls: ContractCall[] = [
  {
    id: "call_001",
    contractId: "contract_001",
    functionName: "checkCondition",
    caller: "rCaller123ABC456",
    params: { escrowId: "ESC123456789" },
    result: "SUCCESS",
    txHash: "TX123456789ABCDEF",
    timestamp: "2024-03-10T14:22:00Z",
    gasUsed: 150
  },
  {
    id: "call_002",
    contractId: "contract_001",
    functionName: "releaseEscrow",
    caller: "rCaller123ABC456",
    params: { escrowId: "ESC123456789", oracleSignature: "SIG123" },
    result: "SUCCESS",
    txHash: "TX234567890BCDEF1",
    timestamp: "2024-03-10T14:25:00Z",
    gasUsed: 320
  },
  {
    id: "call_003",
    contractId: "contract_002",
    functionName: "claimVested",
    caller: "rBeneficiary789",
    params: { beneficiary: "rBeneficiary789" },
    result: "SUCCESS",
    txHash: "TX345678901CDEF12",
    timestamp: "2024-03-12T09:15:00Z",
    gasUsed: 280
  },
  {
    id: "call_004",
    contractId: "contract_003",
    functionName: "submitPrice",
    caller: "rOracle123",
    params: { assetId: "ASSET001", price: "1500000", timestamp: "1710259500" },
    result: "SUCCESS",
    txHash: "TX456789012DEF123",
    timestamp: "2024-03-12T16:45:00Z",
    gasUsed: 190
  },
  {
    id: "call_005",
    contractId: "contract_004",
    functionName: "stake",
    caller: "rStaker456",
    params: { amount: "10000", lockDuration: "90" },
    result: "FAILED",
    txHash: "TX567890123EF1234",
    timestamp: "2024-03-08T15:30:00Z",
    gasUsed: 50,
    errorMessage: "Contract is paused"
  }
];
