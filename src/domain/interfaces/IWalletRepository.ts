import { IssuingWallet, WalletRole, WalletStatus, XRPLNetwork } from "@/types/token";

/**
 * Parameters for creating a new wallet
 */
export interface CreateWalletParams {
  name: string;
  role: WalletRole;
  network: XRPLNetwork;
  enableMultiSig: boolean;
  autoFund: boolean;
  createdBy: string;
  createdByName: string;
}

/**
 * Filters for listing wallets
 */
export interface WalletFilters {
  role?: WalletRole;
  status?: WalletStatus;
  network?: XRPLNetwork;
  search?: string;
}

/**
 * Repository interface for wallet operations
 * Implementations: MockWalletRepository, SupabaseWalletRepository
 */
export interface IWalletRepository {
  /**
   * Provision a new wallet
   */
  createWallet(params: CreateWalletParams): Promise<IssuingWallet>;

  /**
   * Get a wallet by ID
   */
  getWallet(walletId: string): Promise<IssuingWallet | null>;

  /**
   * Get a wallet by XRPL address
   */
  getWalletByAddress(address: string): Promise<IssuingWallet | null>;

  /**
   * List wallets with optional filters
   */
  listWallets(filters?: WalletFilters): Promise<IssuingWallet[]>;

  /**
   * Update wallet properties
   */
  updateWallet(walletId: string, updates: Partial<IssuingWallet>): Promise<IssuingWallet>;

  /**
   * Update wallet status
   */
  updateWalletStatus(walletId: string, status: WalletStatus): Promise<IssuingWallet>;

  /**
   * Link multi-sign configuration to wallet
   */
  linkMultiSignConfig(walletId: string, configId: string): Promise<void>;
}
