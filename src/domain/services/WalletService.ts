import { IssuingWallet, WalletStatus } from "@/types/token";
import {
  IWalletRepository,
  CreateWalletParams,
  WalletFilters,
} from "@/domain/interfaces/IWalletRepository";
import { mockWalletRepository } from "@/infra/repositories/mock/MockWalletRepository";
import { AuditService, auditService as defaultAuditService } from "./AuditService";

/**
 * Wallet provisioning and management service
 * Orchestrates wallet operations with full audit logging
 */
export class WalletService {
  constructor(
    private walletRepo: IWalletRepository = mockWalletRepository,
    private auditService: AuditService = defaultAuditService
  ) {}

  /**
   * Provision a new XRPL wallet
   * - Creates wallet via repository
   * - Logs PROVISION audit event
   * - Logs FUND audit event if auto-funded
   */
  async provisionWallet(params: CreateWalletParams): Promise<IssuingWallet> {
    // 1. Create wallet via repository
    const wallet = await this.walletRepo.createWallet(params);

    // 2. Log PROVISION audit event
    await this.auditService.writeEvent({
      entityType: "WALLET",
      entityId: wallet.id,
      entityName: wallet.name,
      action: "PROVISION",
      actorUserId: params.createdBy,
      actorName: params.createdByName,
      actorRole: "SUPER_ADMIN",
      afterState: {
        address: wallet.xrplAddress,
        role: wallet.role,
        network: wallet.network,
        status: wallet.status,
      },
      metadata: {
        autoFund: params.autoFund,
        enableMultiSig: params.enableMultiSig,
      },
      severity: "INFO",
      classification: "CONFIDENTIAL",
      walletAddress: wallet.xrplAddress,
      linkedWalletId: wallet.id,
    });

    // 3. Log FUND audit event if faucet used
    if (params.autoFund && wallet.fundedAt) {
      await this.auditService.writeEvent({
        entityType: "WALLET",
        entityId: wallet.id,
        entityName: wallet.name,
        action: "FUND",
        actorUserId: params.createdBy,
        actorName: params.createdByName,
        actorRole: "SUPER_ADMIN",
        metadata: {
          source: "TESTNET_FAUCET",
          amount: 1000,
          currency: "XRP",
        },
        severity: "INFO",
        walletAddress: wallet.xrplAddress,
        linkedWalletId: wallet.id,
      });
    }

    return wallet;
  }

  /**
   * List all wallets with optional filters
   */
  async listWallets(filters?: WalletFilters): Promise<IssuingWallet[]> {
    return this.walletRepo.listWallets(filters);
  }

  /**
   * Get a wallet by ID
   */
  async getWallet(walletId: string): Promise<IssuingWallet | null> {
    return this.walletRepo.getWallet(walletId);
  }

  /**
   * Get a wallet by XRPL address
   */
  async getWalletByAddress(address: string): Promise<IssuingWallet | null> {
    return this.walletRepo.getWalletByAddress(address);
  }

  /**
   * Sync wallet balance (mock implementation)
   */
  async syncWalletBalance(
    walletId: string,
    actorUserId: string,
    actorName: string
  ): Promise<IssuingWallet> {
    const wallet = await this.walletRepo.getWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet not found: ${walletId}`);
    }

    // In real implementation, this would call XRPL account_info
    const updatedWallet = await this.walletRepo.updateWallet(walletId, {
      lastSyncedAt: new Date().toISOString(),
    });

    await this.auditService.writeEvent({
      entityType: "WALLET",
      entityId: wallet.id,
      entityName: wallet.name,
      action: "SYNC",
      actorUserId,
      actorName,
      actorRole: "SUPER_ADMIN",
      metadata: {
        balance: updatedWallet.balance,
      },
      severity: "INFO",
      walletAddress: wallet.xrplAddress,
      linkedWalletId: wallet.id,
    });

    return updatedWallet;
  }

  /**
   * Suspend a wallet
   */
  async suspendWallet(
    walletId: string,
    reason: string,
    actorUserId: string,
    actorName: string
  ): Promise<IssuingWallet> {
    const wallet = await this.walletRepo.getWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet not found: ${walletId}`);
    }

    const updatedWallet = await this.walletRepo.updateWalletStatus(
      walletId,
      "SUSPENDED"
    );

    await this.auditService.writeEvent({
      entityType: "WALLET",
      entityId: wallet.id,
      entityName: wallet.name,
      action: "SUSPEND",
      actorUserId,
      actorName,
      actorRole: "SUPER_ADMIN",
      beforeState: { status: wallet.status },
      afterState: { status: "SUSPENDED" },
      metadata: { reason },
      severity: "HIGH",
      classification: "CONFIDENTIAL",
      walletAddress: wallet.xrplAddress,
      linkedWalletId: wallet.id,
    });

    return updatedWallet;
  }

  /**
   * Archive a wallet
   */
  async archiveWallet(
    walletId: string,
    actorUserId: string,
    actorName: string
  ): Promise<IssuingWallet> {
    const wallet = await this.walletRepo.getWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet not found: ${walletId}`);
    }

    const updatedWallet = await this.walletRepo.updateWalletStatus(
      walletId,
      "ARCHIVED"
    );

    await this.auditService.writeEvent({
      entityType: "WALLET",
      entityId: wallet.id,
      entityName: wallet.name,
      action: "ARCHIVE",
      actorUserId,
      actorName,
      actorRole: "SUPER_ADMIN",
      beforeState: { status: wallet.status },
      afterState: { status: "ARCHIVED" },
      severity: "WARN",
      classification: "CONFIDENTIAL",
      walletAddress: wallet.xrplAddress,
      linkedWalletId: wallet.id,
    });

    return updatedWallet;
  }
}

// Default singleton instance
export const walletService = new WalletService();
