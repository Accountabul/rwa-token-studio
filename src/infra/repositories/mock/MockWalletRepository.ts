import { IssuingWallet, WalletStatus } from "@/types/token";
import {
  IWalletRepository,
  CreateWalletParams,
  WalletFilters,
} from "@/domain/interfaces/IWalletRepository";
import { mockWallets } from "@/data/mockWallets";

/**
 * Generate a mock XRPL address
 */
function generateMockXRPLAddress(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let address = "rTestnet";
  for (let i = 0; i < 25; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
}

/**
 * Generate a mock public key
 */
function generateMockPublicKey(): string {
  const chars = "ABCDEF0123456789";
  let key = "ED";
  for (let i = 0; i < 64; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/**
 * Mock implementation of IWalletRepository
 * Uses in-memory storage for testnet development
 */
export class MockWalletRepository implements IWalletRepository {
  private wallets: IssuingWallet[] = [...mockWallets];

  async createWallet(params: CreateWalletParams): Promise<IssuingWallet> {
    const now = new Date().toISOString();
    
    const wallet: IssuingWallet = {
      id: `wallet-${Date.now()}`,
      name: params.name,
      xrplAddress: generateMockXRPLAddress(),
      publicKey: generateMockPublicKey(),
      role: params.role,
      network: params.network,
      status: "PROVISIONING",
      multiSignEnabled: params.enableMultiSig,
      permissionDexStatus: "NOT_LINKED",
      isAuthorized: false,
      createdBy: params.createdBy,
      createdByName: params.createdByName,
      createdAt: now,
      lastSyncedAt: now,
    };

    // Simulate provisioning delay, then mark as active
    if (params.autoFund) {
      wallet.fundedAt = now;
      wallet.balance = 1000; // Testnet faucet default
    }
    
    // Mark as active (in real implementation this would happen after confirmation)
    wallet.status = "ACTIVE";

    this.wallets.push(wallet);
    return wallet;
  }

  async getWallet(walletId: string): Promise<IssuingWallet | null> {
    return this.wallets.find((w) => w.id === walletId) || null;
  }

  async getWalletByAddress(address: string): Promise<IssuingWallet | null> {
    return this.wallets.find((w) => w.xrplAddress === address) || null;
  }

  async listWallets(filters?: WalletFilters): Promise<IssuingWallet[]> {
    let result = [...this.wallets];

    if (filters?.role) {
      result = result.filter((w) => w.role === filters.role);
    }

    if (filters?.status) {
      result = result.filter((w) => w.status === filters.status);
    }

    if (filters?.network) {
      result = result.filter((w) => w.network === filters.network);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(search) ||
          w.xrplAddress.toLowerCase().includes(search)
      );
    }

    return result;
  }

  async updateWallet(
    walletId: string,
    updates: Partial<IssuingWallet>
  ): Promise<IssuingWallet> {
    const index = this.wallets.findIndex((w) => w.id === walletId);
    if (index === -1) {
      throw new Error(`Wallet not found: ${walletId}`);
    }

    this.wallets[index] = {
      ...this.wallets[index],
      ...updates,
      lastSyncedAt: new Date().toISOString(),
    };

    return this.wallets[index];
  }

  async updateWalletStatus(
    walletId: string,
    status: WalletStatus
  ): Promise<IssuingWallet> {
    return this.updateWallet(walletId, { status });
  }

  async linkMultiSignConfig(walletId: string, configId: string): Promise<void> {
    await this.updateWallet(walletId, {
      multiSignConfigId: configId,
      multiSignEnabled: true,
    });
  }
}

// Singleton instance
export const mockWalletRepository = new MockWalletRepository();
