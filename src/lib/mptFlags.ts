// MPT Flag constants from XRPL XLS-33 specification
export const MPT_FLAGS = {
  CAN_LOCK: 0x00000002,
  REQUIRE_AUTH: 0x00000004,
  CAN_ESCROW: 0x00000008,
  CAN_TRADE: 0x00000010,
  CAN_TRANSFER: 0x00000020,
  CAN_CLAWBACK: 0x00000040,
} as const;

export interface MPTFlagsState {
  canLock: boolean;
  requireAuth: boolean;
  canEscrow: boolean;
  canTrade: boolean;
  canTransfer: boolean;
  canClawback: boolean;
}

export interface MPTFlagInfo {
  key: keyof MPTFlagsState;
  name: string;
  description: string;
  hex: string;
  value: number;
}

export const MPT_FLAG_INFO: MPTFlagInfo[] = [
  {
    key: "canLock",
    name: "Can Lock",
    description: "Allows the issuer to lock the MPT both individually and globally",
    hex: "0x00000002",
    value: MPT_FLAGS.CAN_LOCK,
  },
  {
    key: "requireAuth",
    name: "Require Authorization",
    description: "Holders must be authorized by the issuer before they can receive the MPT",
    hex: "0x00000004",
    value: MPT_FLAGS.REQUIRE_AUTH,
  },
  {
    key: "canEscrow",
    name: "Can Escrow",
    description: "Holders can place tokens into an escrow",
    hex: "0x00000008",
    value: MPT_FLAGS.CAN_ESCROW,
  },
  {
    key: "canTrade",
    name: "Can Trade",
    description: "Enables trading on the XRPL decentralized exchange",
    hex: "0x00000010",
    value: MPT_FLAGS.CAN_TRADE,
  },
  {
    key: "canTransfer",
    name: "Can Transfer",
    description: "Allows holders to transfer tokens to other accounts",
    hex: "0x00000020",
    value: MPT_FLAGS.CAN_TRANSFER,
  },
  {
    key: "canClawback",
    name: "Can Clawback",
    description: "The issuer can reclaim balances from individual holders",
    hex: "0x00000040",
    value: MPT_FLAGS.CAN_CLAWBACK,
  },
];

export function calculateFlagsValue(flags: MPTFlagsState): { decimal: number; hex: string } {
  let value = 0;
  if (flags.canLock) value |= MPT_FLAGS.CAN_LOCK;
  if (flags.requireAuth) value |= MPT_FLAGS.REQUIRE_AUTH;
  if (flags.canEscrow) value |= MPT_FLAGS.CAN_ESCROW;
  if (flags.canTrade) value |= MPT_FLAGS.CAN_TRADE;
  if (flags.canTransfer) value |= MPT_FLAGS.CAN_TRANSFER;
  if (flags.canClawback) value |= MPT_FLAGS.CAN_CLAWBACK;
  return { decimal: value, hex: `0x${value.toString(16).padStart(8, '0')}` };
}

export function getFlagsFromValue(value: number): MPTFlagsState {
  return {
    canLock: (value & MPT_FLAGS.CAN_LOCK) !== 0,
    requireAuth: (value & MPT_FLAGS.REQUIRE_AUTH) !== 0,
    canEscrow: (value & MPT_FLAGS.CAN_ESCROW) !== 0,
    canTrade: (value & MPT_FLAGS.CAN_TRADE) !== 0,
    canTransfer: (value & MPT_FLAGS.CAN_TRANSFER) !== 0,
    canClawback: (value & MPT_FLAGS.CAN_CLAWBACK) !== 0,
  };
}
