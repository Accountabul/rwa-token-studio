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
    name: "Account Setup Batch",
    description: "Configure multi-sig and account settings for new institutional wallet",
    atomicityMode: "ALL_OR_NOTHING",
    transactions: [
      {
        id: "tx_002_1",
        order: 1,
        txType: "AccountSet",
        params: { 
          domain: "6163636f756e746162756c2e636f6d", // accountabul.com in hex
          transferRate: 1000000000,
          tickSize: 5
        },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_002_1"
      },
      {
        id: "tx_002_2",
        order: 2,
        txType: "SignerListSet",
        params: { 
          signerQuorum: 2,
          signerEntries: '[{"Account": "rSigner001", "SignerWeight": 1}, {"Account": "rSigner002", "SignerWeight": 1}, {"Account": "rSigner003", "SignerWeight": 1}]'
        },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_002_2"
      },
      {
        id: "tx_002_3",
        order: 3,
        txType: "SetRegularKey",
        params: { regularKey: "rRegularKey001" },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_002_3"
      },
      {
        id: "tx_002_4",
        order: 4,
        txType: "DepositPreauth",
        params: { authorize: "rTrustedPartner001" },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_002_4"
      }
    ],
    status: "COMPLETED",
    outerTxHash: "OUTER_TX_BATCH_002",
    successCount: 4,
    failedCount: 0,
    createdAt: "2024-03-05T14:00:00Z",
    submittedAt: "2024-03-05T14:02:00Z",
    completedAt: "2024-03-05T14:02:30Z",
    createdBy: "admin@accountabul.com",
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
        params: { 
          takerGetsValue: "1000",
          takerGetsCurrency: "XRP",
          takerPaysValue: "500",
          takerPaysCurrency: "USD"
        },
        status: "PENDING"
      },
      {
        id: "tx_005_2",
        order: 2,
        txType: "OfferCreate",
        params: { 
          takerGetsValue: "2000",
          takerGetsCurrency: "XRP",
          takerPaysValue: "1000",
          takerPaysCurrency: "USD"
        },
        status: "PENDING"
      }
    ],
    status: "DRAFT",
    successCount: 0,
    failedCount: 0,
    createdAt: "2024-03-12T11:00:00Z",
    createdBy: "tokenization@accountabul.com",
    network: "devnet"
  },
  {
    id: "batch_006",
    name: "AMM Liquidity Provision",
    description: "Add liquidity to XRP/USD AMM pool and vote on trading fee",
    atomicityMode: "UNTIL_FAILURE",
    transactions: [
      {
        id: "tx_006_1",
        order: 1,
        txType: "AMMDeposit",
        params: {
          asset1Currency: "XRP",
          asset2Currency: "USD",
          asset2Issuer: "rIssuer001",
          amount: "10000",
          amount2: "5000"
        },
        status: "PENDING"
      },
      {
        id: "tx_006_2",
        order: 2,
        txType: "AMMVote",
        params: {
          asset1Currency: "XRP",
          asset2Currency: "USD",
          asset2Issuer: "rIssuer001",
          tradingFee: 100
        },
        status: "PENDING"
      }
    ],
    status: "DRAFT",
    successCount: 0,
    failedCount: 0,
    createdAt: "2024-03-15T09:00:00Z",
    createdBy: "custody@accountabul.com",
    network: "testnet"
  },
  {
    id: "batch_007",
    name: "Payment Channel Setup",
    description: "Create and fund payment channel for streaming payments",
    atomicityMode: "ALL_OR_NOTHING",
    transactions: [
      {
        id: "tx_007_1",
        order: 1,
        txType: "PaymentChannelCreate",
        params: {
          destination: "rReceiver001",
          amount: "100000000",
          settleDelay: 86400,
          publicKey: "ED1234567890ABCDEF..."
        },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_007_1"
      },
      {
        id: "tx_007_2",
        order: 2,
        txType: "PaymentChannelFund",
        params: {
          channel: "5DB01B7FFED6B67E6B0414DED11E051D2EE2B7...",
          amount: "50000000"
        },
        status: "SUCCESS",
        innerTxHash: "INNER_TX_007_2"
      }
    ],
    status: "COMPLETED",
    outerTxHash: "OUTER_TX_BATCH_007",
    successCount: 2,
    failedCount: 0,
    createdAt: "2024-03-18T14:00:00Z",
    submittedAt: "2024-03-18T14:05:00Z",
    completedAt: "2024-03-18T14:05:10Z",
    createdBy: "custody@accountabul.com",
    network: "testnet"
  },
  {
    id: "batch_008",
    name: "NFT Marketplace Sale",
    description: "Create sell offers for multiple NFTs",
    atomicityMode: "INDEPENDENT",
    transactions: [
      {
        id: "tx_008_1",
        order: 1,
        txType: "NFTokenCreateOffer",
        params: {
          nfTokenId: "000800000...",
          amount: "50000000",
          currency: "XRP",
          isSellOffer: true
        },
        status: "PENDING"
      },
      {
        id: "tx_008_2",
        order: 2,
        txType: "NFTokenCreateOffer",
        params: {
          nfTokenId: "000800001...",
          amount: "75000000",
          currency: "XRP",
          isSellOffer: true
        },
        status: "PENDING"
      },
      {
        id: "tx_008_3",
        order: 3,
        txType: "NFTokenCreateOffer",
        params: {
          nfTokenId: "000800002...",
          amount: "100000000",
          currency: "XRP",
          isSellOffer: true
        },
        status: "PENDING"
      }
    ],
    status: "READY",
    successCount: 0,
    failedCount: 0,
    createdAt: "2024-03-20T10:00:00Z",
    createdBy: "tokenization@accountabul.com",
    network: "testnet"
  }
];
