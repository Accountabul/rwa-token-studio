// XRPL Explorer Integration
// Provides deterministic URL generation for accounts, tokens, and transactions

export type XRPLNetwork = "mainnet" | "testnet" | "devnet";
export type ExplorerLinkType = "ACCOUNT" | "TOKEN_IOU" | "TOKEN_MPT" | "TX" | "NFT";

export interface ExplorerConfig {
  primary: string;
  fallback?: string;
  name: string;
}

// Explorer configuration by network
const explorersByNetwork: Record<XRPLNetwork, ExplorerConfig> = {
  mainnet: {
    primary: "https://xrpscan.com",
    fallback: "https://bithomp.com",
    name: "XRPScan",
  },
  testnet: {
    primary: "https://testnet.xrpl.org",
    fallback: "https://xrpscan.com",
    name: "XRPL Testnet",
  },
  devnet: {
    primary: "https://devnet.xrpl.org",
    name: "XRPL Devnet",
  },
};

/**
 * Get the base explorer URL for a given network
 */
export function getExplorerBase(network: XRPLNetwork = "mainnet"): string {
  return explorersByNetwork[network].primary;
}

/**
 * Get explorer configuration for a network
 */
export function getExplorerConfig(network: XRPLNetwork = "mainnet"): ExplorerConfig {
  return explorersByNetwork[network];
}

export interface ExplorerLinkParams {
  type: ExplorerLinkType;
  network?: XRPLNetwork;
  address?: string;
  currencyCode?: string;
  issuer?: string;
  txHash?: string;
  nftId?: string;
  mptId?: string;
}

/**
 * Build a deterministic explorer URL based on provided parameters
 */
export function buildExplorerLink(params: ExplorerLinkParams): string {
  const { type, network = "mainnet", address, currencyCode, issuer, txHash, nftId, mptId } = params;
  const base = getExplorerBase(network);

  switch (type) {
    case "ACCOUNT":
      if (!address) throw new Error("Address required for ACCOUNT link");
      return `${base}/account/${address}`;

    case "TOKEN_IOU":
      if (!currencyCode || !issuer) throw new Error("Currency code and issuer required for TOKEN_IOU link");
      // XRPScan format: /token/{CURRENCY}.{ISSUER}
      return `${base}/token/${currencyCode}.${issuer}`;

    case "TOKEN_MPT":
      // MPT explorers are still maturing - use account-centric view
      if (!issuer) throw new Error("Issuer required for TOKEN_MPT link");
      // For now, show issuer account with MPT context
      return `${base}/account/${issuer}${mptId ? `#mpt-${mptId}` : ""}`;

    case "TX":
      if (!txHash) throw new Error("Transaction hash required for TX link");
      return `${base}/tx/${txHash}`;

    case "NFT":
      if (!nftId) throw new Error("NFT ID required for NFT link");
      return `${base}/nft/${nftId}`;

    default:
      throw new Error(`Unknown explorer link type: ${type}`);
  }
}

/**
 * Build all available explorer links for a token
 */
export interface TokenExplorerLinks {
  issuerWallet: string;
  token?: string;
  issuanceTx?: string;
}

export function buildTokenExplorerLinks(params: {
  standard: "IOU" | "MPT" | "NFT";
  issuerAddress: string;
  currencyCode?: string;
  txHash?: string;
  nftId?: string;
  mptId?: string;
  network?: XRPLNetwork;
}): TokenExplorerLinks {
  const { standard, issuerAddress, currencyCode, txHash, nftId, mptId, network = "mainnet" } = params;

  const links: TokenExplorerLinks = {
    issuerWallet: buildExplorerLink({ type: "ACCOUNT", address: issuerAddress, network }),
  };

  // Token-specific link
  if (standard === "IOU" && currencyCode) {
    links.token = buildExplorerLink({ type: "TOKEN_IOU", currencyCode, issuer: issuerAddress, network });
  } else if (standard === "MPT") {
    links.token = buildExplorerLink({ type: "TOKEN_MPT", issuer: issuerAddress, mptId, network });
  } else if (standard === "NFT" && nftId) {
    links.token = buildExplorerLink({ type: "NFT", nftId, network });
  }

  // Transaction link
  if (txHash) {
    links.issuanceTx = buildExplorerLink({ type: "TX", txHash, network });
  }

  return links;
}

/**
 * Get a shortened display version of an XRPL address
 */
export function shortenAddress(address: string, startChars = 6, endChars = 4): string {
  if (address.length <= startChars + endChars + 3) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Get a shortened display version of a transaction hash
 */
export function shortenTxHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/**
 * Network display labels
 */
export const networkLabels: Record<XRPLNetwork, string> = {
  mainnet: "XRPL Mainnet",
  testnet: "XRPL Testnet",
  devnet: "XRPL Devnet",
};

/**
 * Network badge colors (for UI)
 */
export const networkColors: Record<XRPLNetwork, { bg: string; text: string; border: string }> = {
  mainnet: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    border: "border-emerald-500/20",
  },
  testnet: {
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    border: "border-amber-500/20",
  },
  devnet: {
    bg: "bg-purple-500/10",
    text: "text-purple-600",
    border: "border-purple-500/20",
  },
};
