/**
 * Mock Payees Data
 * Sample payees for typeahead search and payout workflow testing
 */

import { Payee } from "@/types/payout";

export const mockPayees: Payee[] = [
  // Vendors
  {
    id: "payee-001",
    name: "Acme Software Solutions",
    dba: "Acme Tech",
    type: "VENDOR",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    email: "billing@acmesoftware.com",
    vendorId: "VND-001",
    defaultCurrency: "USD",
    mailingAddress: {
      street: "123 Tech Park Drive",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "USA",
    },
    linkedBusinessId: "biz-001",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-06-01T14:30:00Z",
  },
  {
    id: "payee-002",
    name: "Federal Charter Services",
    dba: "FCS",
    type: "VENDOR",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    email: "accounts@federalcharter.com",
    vendorId: "VND-002",
    defaultCurrency: "USD",
    mailingAddress: {
      street: "456 Financial Center",
      city: "New York",
      state: "NY",
      zip: "10004",
      country: "USA",
    },
    createdAt: "2024-02-20T09:00:00Z",
    updatedAt: "2024-05-15T11:00:00Z",
  },
  {
    id: "payee-003",
    name: "Federal Bank Corp",
    type: "VENDOR",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    email: "vendor-payments@federalbank.com",
    vendorId: "VND-003",
    defaultCurrency: "USD",
    createdAt: "2024-03-01T08:00:00Z",
    updatedAt: "2024-03-01T08:00:00Z",
  },
  {
    id: "payee-004",
    name: "CloudHost Infrastructure",
    type: "VENDOR",
    status: "ACTIVE",
    verificationStatus: "PENDING",
    email: "billing@cloudhost.io",
    vendorId: "VND-004",
    defaultCurrency: "USD",
    defaultWalletAddress: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
    createdAt: "2024-04-10T12:00:00Z",
    updatedAt: "2024-04-10T12:00:00Z",
  },
  {
    id: "payee-005",
    name: "Legacy Systems Inc",
    type: "VENDOR",
    status: "INACTIVE",
    verificationStatus: "VERIFIED",
    email: "ap@legacysystems.com",
    vendorId: "VND-005",
    defaultCurrency: "USD",
    createdAt: "2023-06-01T10:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
  },

  // Contractors
  {
    id: "payee-006",
    name: "Sarah Johnson",
    type: "CONTRACTOR",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    email: "sarah.johnson@freelance.dev",
    vendorId: "CTR-001",
    defaultCurrency: "USD",
    defaultWalletAddress: "rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9",
    mailingAddress: {
      street: "789 Developer Lane",
      city: "Austin",
      state: "TX",
      zip: "78701",
      country: "USA",
    },
    createdAt: "2024-01-20T15:00:00Z",
    updatedAt: "2024-06-10T10:00:00Z",
  },
  {
    id: "payee-007",
    name: "Michael Chen",
    type: "CONTRACTOR",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    email: "m.chen@consulting.com",
    vendorId: "CTR-002",
    defaultCurrency: "RLUSD",
    defaultWalletAddress: "rLHzPsX6oXkzU2qL12kHCH8G8cnZv1rBJh",
    createdAt: "2024-02-15T11:00:00Z",
    updatedAt: "2024-05-20T16:00:00Z",
  },
  {
    id: "payee-008",
    name: "Emily Rodriguez",
    type: "CONTRACTOR",
    status: "ACTIVE",
    verificationStatus: "UNVERIFIED",
    email: "emily.r@designstudio.co",
    vendorId: "CTR-003",
    defaultCurrency: "USD",
    createdAt: "2024-05-01T09:00:00Z",
    updatedAt: "2024-05-01T09:00:00Z",
  },
  {
    id: "payee-009",
    name: "David Park",
    type: "CONTRACTOR",
    status: "INACTIVE",
    verificationStatus: "VERIFIED",
    email: "david.park@techwriter.io",
    vendorId: "CTR-004",
    defaultCurrency: "USD",
    createdAt: "2023-09-01T14:00:00Z",
    updatedAt: "2024-02-01T08:00:00Z",
  },

  // Employees
  {
    id: "payee-010",
    name: "Jennifer Williams",
    type: "EMPLOYEE",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    email: "j.williams@company.com",
    vendorId: "EMP-001",
    defaultCurrency: "USD",
    mailingAddress: {
      street: "321 Employee Ave",
      city: "Seattle",
      state: "WA",
      zip: "98101",
      country: "USA",
    },
    createdAt: "2023-03-15T10:00:00Z",
    updatedAt: "2024-06-01T12:00:00Z",
  },
  {
    id: "payee-011",
    name: "Robert Martinez",
    type: "EMPLOYEE",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    email: "r.martinez@company.com",
    vendorId: "EMP-002",
    defaultCurrency: "USD",
    createdAt: "2023-05-20T09:00:00Z",
    updatedAt: "2024-04-15T11:00:00Z",
  },

  // Entities
  {
    id: "payee-012",
    name: "Sunrise Capital Partners LLC",
    entityAlias: "SCP",
    type: "ENTITY",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    email: "treasury@sunrisecapital.com",
    vendorId: "ENT-001",
    defaultCurrency: "USD",
    defaultWalletAddress: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
    mailingAddress: {
      street: "100 Investment Blvd",
      city: "Boston",
      state: "MA",
      zip: "02110",
      country: "USA",
    },
    linkedBusinessId: "biz-002",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-06-15T14:00:00Z",
  },
  {
    id: "payee-013",
    name: "Digital Asset Holdings Corp",
    entityAlias: "DAHC",
    type: "ENTITY",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    email: "finance@dahcorp.io",
    vendorId: "ENT-002",
    defaultCurrency: "RLUSD",
    defaultWalletAddress: "rDsbeomae4FXwgQTJp9Rs64Qg9vDiTCdBv",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-05-30T09:00:00Z",
  },
  {
    id: "payee-014",
    name: "Global Compliance Services Ltd",
    entityAlias: "GCS",
    type: "ENTITY",
    status: "ACTIVE",
    verificationStatus: "PENDING",
    email: "payments@gcs-global.com",
    vendorId: "ENT-003",
    defaultCurrency: "EUR",
    createdAt: "2024-04-20T13:00:00Z",
    updatedAt: "2024-04-20T13:00:00Z",
  },
  {
    id: "payee-015",
    name: "Tokenized Real Estate Fund I",
    entityAlias: "TREF-I",
    type: "ENTITY",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    email: "admin@tref-fund.com",
    vendorId: "ENT-004",
    defaultCurrency: "USD",
    linkedBusinessId: "biz-003",
    createdAt: "2024-03-05T11:00:00Z",
    updatedAt: "2024-06-01T15:00:00Z",
  },

  // More contractors for search variety
  {
    id: "payee-016",
    name: "Alex Thompson",
    type: "CONTRACTOR",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    email: "alex.t@webdev.pro",
    vendorId: "CTR-005",
    defaultCurrency: "USDC",
    defaultWalletAddress: "rKLpjpCoXgLQQYQyj13zgay73rsgmzNH13",
    createdAt: "2024-03-10T10:00:00Z",
    updatedAt: "2024-06-05T14:00:00Z",
  },
  {
    id: "payee-017",
    name: "Maria Garcia",
    type: "CONTRACTOR",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    email: "maria.garcia@translate.pro",
    vendorId: "CTR-006",
    defaultCurrency: "USD",
    createdAt: "2024-04-01T09:00:00Z",
    updatedAt: "2024-05-15T11:00:00Z",
  },
  {
    id: "payee-018",
    name: "James Wilson",
    type: "CONTRACTOR",
    status: "ACTIVE",
    verificationStatus: "UNVERIFIED",
    email: "james.w@security-audit.io",
    vendorId: "CTR-007",
    defaultCurrency: "USD",
    createdAt: "2024-05-20T14:00:00Z",
    updatedAt: "2024-05-20T14:00:00Z",
  },
];

/**
 * Search payees by query string
 * Matches against name, dba, entityAlias, email, vendorId
 */
export function searchMockPayees(query: string, limit: number = 10): Payee[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (normalizedQuery.length < 2) {
    return [];
  }

  const results = mockPayees.filter((payee) => {
    const searchFields = [
      payee.name,
      payee.dba,
      payee.entityAlias,
      payee.email,
      payee.vendorId,
    ]
      .filter(Boolean)
      .map((field) => field!.toLowerCase());

    return searchFields.some((field) => field.includes(normalizedQuery));
  });

  // Sort: Active first, then by name
  results.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "ACTIVE" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return results.slice(0, limit);
}
