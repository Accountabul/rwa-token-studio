import { Payee, PayeeType, PayeeStatus, PayeeVerificationStatus } from "@/types/payout";

/**
 * Filters for listing payees
 */
export interface PayeeFilters {
  type?: PayeeType | "all";
  status?: PayeeStatus | "all";
  verificationStatus?: PayeeVerificationStatus | "all";
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Result of listing payees
 */
export interface PayeeListResult {
  payees: Payee[];
  total: number;
  hasMore: boolean;
}

/**
 * Parameters for creating a payee
 */
export interface CreatePayeeParams {
  name: string;
  dba?: string;
  type: PayeeType;
  email?: string;
  vendorId?: string;
  entityAlias?: string;
  defaultCurrency?: string;
  defaultWalletAddress?: string;
  linkedBusinessId?: string;
  linkedInvestorId?: string;
}

/**
 * Repository interface for payee operations
 */
export interface IPayeeRepository {
  /**
   * Search payees by query string (typeahead)
   * Matches: name, dba, email, vendorId, entityAlias
   */
  searchPayees(query: string, limit?: number): Promise<Payee[]>;

  /**
   * Get a payee by ID
   */
  getPayee(id: string): Promise<Payee | null>;

  /**
   * List payees with filters
   */
  listPayees(filters?: PayeeFilters): Promise<PayeeListResult>;

  /**
   * Create a new payee
   */
  createPayee(params: CreatePayeeParams): Promise<Payee>;

  /**
   * Update a payee
   */
  updatePayee(id: string, updates: Partial<CreatePayeeParams>): Promise<Payee>;

  /**
   * Update payee status
   */
  updatePayeeStatus(id: string, status: PayeeStatus): Promise<Payee>;

  /**
   * Update payee verification status
   */
  updatePayeeVerification(id: string, verificationStatus: PayeeVerificationStatus): Promise<Payee>;
}
