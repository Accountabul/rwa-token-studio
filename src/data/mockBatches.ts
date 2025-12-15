import { TransactionBatch } from "@/types/batchTransaction";

export const mockBatches: TransactionBatch[] = [
  {
    id: "batch_001",
    name: "Multi-Property Escrow Setup",
    description: "Create escrows for 3 property transactions with staggered release dates",
    atomicityMode: "ALL_OR_NOTHING",
    transactions: [
      {
        id: "tx_001_1",
        order: 1,
        txType: "EscrowCreate",
        params: {
          destination: "rBuyer123ABC",
          amount: "500000",
          currency: "USD",
          finishAfter: "2024-06-01T00:00:00Z",
          condition: "Property deed transfer confirmation"
        },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_001_1"
      },
      {
        id: "tx_001_2",
        order: 2,
        txType: "EscrowCreate",
        params: {
          destination: "rBuyer456DEF",
          amount: "750000",
          currency: "USD",
          finishAfter: "2024-07-01T00:00:00Z",
          condition: "Property deed transfer confirmation"
        },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_001_2"
      },
      {
        id: "tx_001_3",
        order: 3,
        txType: "EscrowCreate",
        params: {
          destination: "rBuyer789GHI",
          amount: "325000",
          currency: "USD",
          finishAfter: "2024-08-01T00:00:00Z",
          condition: "Property deed transfer confirmation"
        },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_001_3"
      }
    ],
    status: "COMPLETED",
    outerTxHash: "OUTER_TX_BATCH_001",
    successCount: 3,
    failedCount: 0,
    createdAt: "2024-03-01T10:00:00Z",
    submittedAt: "2024-03-01T10:05:00Z",
    completedAt: "2024-03-01T10:05:15Z",
    createdBy: "custody@accountabul.com",
    network: "testnet"
  },
  {
    id: "batch_002",
    name: "Bulk Token Authorization",
    description: "Authorize 5 new investors for Property Token Alpha",
    atomicityMode: "INDEPENDENT",
    transactions: [
      {
        id: "tx_002_1",
        order: 1,
        txType: "MPTokenAuthorize",
        params: { holder: "rInvestor001", tokenId: "MPT_ALPHA_001" },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_002_1"
      },
      {
        id: "tx_002_2",
        order: 2,
        txType: "MPTokenAuthorize",
        params: { holder: "rInvestor002", tokenId: "MPT_ALPHA_001" },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_002_2"
      },
      {
        id: "tx_002_3",
        order: 3,
        txType: "MPTokenAuthorize",
        params: { holder: "rInvestor003", tokenId: "MPT_ALPHA_001" },
        status: "FAILED",
        resultMessage: "Holder already authorized"
      },
      {
        id: "tx_002_4",
        order: 4,
        txType: "MPTokenAuthorize",
        params: { holder: "rInvestor004", tokenId: "MPT_ALPHA_001" },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_002_4"
      },
      {
        id: "tx_002_5",
        order: 5,
        txType: "MPTokenAuthorize",
        params: { holder: "rInvestor005", tokenId: "MPT_ALPHA_001" },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_002_5"
      }
    ],
    status: "PARTIAL",
    outerTxHash: "OUTER_TX_BATCH_002",
    successCount: 4,
    failedCount: 1,
    createdAt: "2024-03-05T14:00:00Z",
    submittedAt: "2024-03-05T14:02:00Z",
    completedAt: "2024-03-05T14:02:30Z",
    createdBy: "tokenization@accountabul.com",
    network: "testnet"
  },
  {
    id: "batch_003",
    name: "NFT Collection Mint",
    description: "Mint batch of 4 property deed NFTs",
    atomicityMode: "UNTIL_FAILURE",
    transactions: [
      {
        id: "tx_003_1",
        order: 1,
        txType: "NFTokenMint",
        params: { uri: "ipfs://deed_001", transferFee: 500, taxon: 1 },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_003_1"
      },
      {
        id: "tx_003_2",
        order: 2,
        txType: "NFTokenMint",
        params: { uri: "ipfs://deed_002", transferFee: 500, taxon: 1 },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_003_2"
      },
      {
        id: "tx_003_3",
        order: 3,
        txType: "NFTokenMint",
        params: { uri: "ipfs://deed_003", transferFee: 500, taxon: 1 },
        status: "FAILED",
        resultMessage: "Insufficient reserve for NFT"
      },
      {
        id: "tx_003_4",
        order: 4,
        txType: "NFTokenMint",
        params: { uri: "ipfs://deed_004", transferFee: 500, taxon: 1 },
        status: "SKIPPED",
        resultMessage: "Skipped due to previous failure"
      }
    ],
    status: "PARTIAL",
    outerTxHash: "OUTER_TX_BATCH_003",
    successCount: 2,
    failedCount: 1,
    createdAt: "2024-03-08T09:00:00Z",
    submittedAt: "2024-03-08T09:10:00Z",
    completedAt: "2024-03-08T09:10:20Z",
    createdBy: "admin@accountabul.com",
    network: "testnet"
  },
  {
    id: "batch_004",
    name: "Quarterly Distribution",
    description: "Q1 dividend payments to token holders",
    atomicityMode: "ALL_OR_NOTHING",
    transactions: [
      {
        id: "tx_004_1",
        order: 1,
        txType: "Payment",
        params: { destination: "rHolder001", amount: "1250.00", currency: "USD" },
        status: "PENDING"
      },
      {
        id: "tx_004_2",
        order: 2,
        txType: "Payment",
        params: { destination: "rHolder002", amount: "3750.00", currency: "USD" },
        status: "PENDING"
      },
      {
        id: "tx_004_3",
        order: 3,
        txType: "Payment",
        params: { destination: "rHolder003", amount: "2500.00", currency: "USD" },
        status: "PENDING"
      },
      {
        id: "tx_004_4",
        order: 4,
        txType: "Payment",
        params: { destination: "rHolder004", amount: "5000.00", currency: "USD" },
        status: "PENDING"
      }
    ],
    status: "READY",
    successCount: 0,
    failedCount: 0,
    createdAt: "2024-03-10T16:00:00Z",
    createdBy: "custody@accountabul.com",
    network: "testnet"
  },
  {
    id: "batch_005",
    name: "DEX Order Bundle",
    description: "Create multiple DEX offers for token liquidity",
    atomicityMode: "INDEPENDENT",
    transactions: [
      {
        id: "tx_005_1",
        order: 1,
        txType: "OfferCreate",
        params: { takerGets: { currency: "XRP", value: "1000" }, takerPays: { currency: "USD", value: "500" } },
        status: "PENDING"
      },
      {
        id: "tx_005_2",
        order: 2,
        txType: "OfferCreate",
        params: { takerGets: { currency: "XRP", value: "2000" }, takerPays: { currency: "USD", value: "1000" } },
        status: "PENDING"
      }
    ],
    status: "DRAFT",
    successCount: 0,
    failedCount: 0,
    createdAt: "2024-03-12T11:00:00Z",
    createdBy: "tokenization@accountabul.com",
    network: "devnet"
  }
];
