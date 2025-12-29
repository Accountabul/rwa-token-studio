# Reports & Logs Alignment Mapping

This document maps new PRD concepts to existing codebase structures for backward-compatible implementation.

## Alignment Scan Summary

| New Concept | Existing Type/Variable | Decision | Fields Added |
|-------------|----------------------|----------|--------------|
| `audit_events` | `UnifiedAuditEntry` | **REUSE** + extend | `source`, `requestId`, `traceId`, `severity`, `classification`, `exportReason` |
| `ledger_events` | `TransactionLedgerEntry` | **REUSE** + extend | `grossAmount`, `feesAmount`, `netAmount`, `payerOfRecord`, `earningCategory`, `evidenceUri`, `auditEventId` |
| `payee_profiles` | `TaxProfile` | **REUSE** + extend | `payeeType`, `payeeCategory`, `countryCode`, `restrictedAccess` |
| `xrpl_transactions` | _(none)_ | **CREATE NEW** | Full table |
| `tax_form_submissions` | _(none)_ | **CREATE NEW** | Full table |
| `tax_rules` | _(none)_ | **CREATE NEW** | Full table |
| `user_roles` | `Role` enum exists | **REUSE** enum + create table | DB table only |
| `report_templates` | `ReportDefinition` | **REUSE** | None |
| `report_runs` | `ReportRun` | **REUSE** + extend | `exportReason`, `auditEventId` |

## Type Mapping: Existing → Canonical

### UnifiedAuditEntry → CanonicalAuditEvent

| Existing Field | Canonical Field | Notes |
|---------------|-----------------|-------|
| `id` | `eventId` | Direct map |
| `entityType` | `entityType` | Direct map |
| `entityId` | `entityId` | Direct map |
| `entityName` | `entityName` | Direct map |
| `action` | `eventType` | Rename for PRD alignment |
| `actorUserId` | `actorUserId` | Direct map |
| `actorName` | `actorName` | Direct map |
| `actorRole` | `actorRole` | Direct map |
| `sourceIp` | `ipAddress` | Rename |
| `userAgent` | `userAgent` | Direct map |
| `beforeState` | `beforeState` | Direct map |
| `afterState` | `afterState` | Direct map |
| `xrplTxHash` | `xrplTxHash` | Direct map |
| `metadata` | `metadata` | Direct map |
| `createdAt` | `timestampUtc` | Rename |
| _(new)_ | `source` | NEW: UI/API/WEBHOOK/BATCH_JOB/LLM_AGENT |
| _(new)_ | `requestId` | NEW: Request correlation |
| _(new)_ | `traceId` | NEW: Trace correlation |
| _(new)_ | `severity` | NEW: INFO/WARN/HIGH |
| _(new)_ | `classification` | NEW: INTERNAL/CONFIDENTIAL/RESTRICTED |
| _(new)_ | `exportReason` | NEW: Justification for exports |

### TransactionLedgerEntry → CanonicalLedgerEvent

| Existing Field | Canonical Field | Notes |
|---------------|-----------------|-------|
| `id` | `ledgerEventId` | Direct map |
| `entryType` | `entryType` | Direct map |
| `amount` | `amount` | Direct map |
| `currency` | `currency` | Direct map |
| `rail` | `rail` | Extend with ACCOUNTABUL_MANUAL |
| `status` | `status` | Extend with DISPUTED/REVERSED |
| All payer/payee fields | Same | Direct map |
| `xrplTxHash` | `xrplTxHash` | Direct map |
| `processorRef` | `externalRefId` | Rename |
| `taxCategory` | `earningCategory` | Rename for PRD alignment |
| `effectiveAt` | `eventTimeUtc` | Rename |
| _(new)_ | `grossAmount` | NEW: Before fees |
| _(new)_ | `feesAmount` | NEW: Fee amount |
| _(new)_ | `netAmount` | NEW: After fees |
| _(new)_ | `payerOfRecord` | NEW: STRIPE_PLATFORM/ACCOUNTABUL/VENDOR |
| _(new)_ | `evidenceUri` | NEW: For manual payouts |
| _(new)_ | `auditEventId` | NEW: Link to audit entry |

### TaxProfile → CanonicalPayeeProfile

| Existing Field | Canonical Field | Notes |
|---------------|-----------------|-------|
| `userId` | `payeeId` | Direct map |
| `userName` | `displayName` | Rename |
| `legalName` | `legalName` | Direct map |
| `entityType` | `entityType` | Direct map (EntityLegalType) |
| `isUsPerson` | `residency` | Derive: US/NON_US |
| `addressJson` | `address` | Direct map |
| `tinLast4` | `tinLast4` | Direct map (NEVER store full) |
| `w9Status` | `taxFormStatus` | Map to unified status |
| `w8Status` | `taxFormStatus` | Map to unified status |
| _(new)_ | `payeeType` | NEW: INDIVIDUAL/BUSINESS |
| _(new)_ | `payeeCategory` | NEW: WORKER/VENDOR/USER |
| _(new)_ | `countryCode` | NEW: ISO country code |
| _(new)_ | `restrictedAccess` | NEW: PII protection flag |

## Mock Data Compatibility

All existing mock data in `src/data/mockReportsLogs.ts` remains unchanged:
- `mockAuditEntries: UnifiedAuditEntry[]` - works with extended type (new fields optional)
- `mockLedgerEntries: TransactionLedgerEntry[]` - works with extended type (new fields optional)
- `mockTaxProfiles: TaxProfile[]` - works with extended type (new fields optional)
- `mockReportRuns: ReportRun[]` - works as-is
- `mockDashboardMetrics: ReportsDashboardMetrics` - works as-is

## UI Component Compatibility

| Component | Status | Changes |
|-----------|--------|---------|
| `AuditLogViewer.tsx` | **ENHANCE** | Add severity filter, wire to service |
| `TransactionLedger.tsx` | **ENHANCE** | Add XRPL/Fiat tabs, payer_of_record filter |
| `TaxCenter.tsx` | **ENHANCE** | Add Payout Summaries tab |
| `OverviewDashboard.tsx` | **ENHANCE** | Add exceptions panel |
| `ReportsLibrary.tsx` | **ENHANCE** | Add export reason modal integration |
| `AuditLogDrawer.tsx` | **PRESERVE** | No changes needed |

## Role & Permission Compatibility

Existing `Role` enum preserved:
```typescript
type Role = 
  | "SUPER_ADMIN"
  | "FINANCE_OFFICER"
  | "COMPLIANCE_OFFICER"
  | "AUDITOR"
  | "TOKENIZATION_MANAGER"
  | "CUSTODY_OFFICER"
  | "VALUATION_OFFICER";
```

Existing `rolePermissionsMatrix` preserved and used by services.

## Database Schema (Future Supabase)

When enabling Supabase, create tables that map to existing types:
1. `audit_events` - columns map to `UnifiedAuditEntry` fields (snake_case)
2. `ledger_events` - columns map to `TransactionLedgerEntry` fields (snake_case)
3. `tax_form_submissions` - new table, links via `payee_id` to existing user IDs
4. `xrpl_transactions` - new table for XRPL-specific data
5. `user_roles` - new table for RBAC (separate from profiles per security requirements)

## Implementation Strategy

1. **Domain Services Layer**: New services wrap existing mock repositories
2. **Normalizers**: Map between existing types and canonical formats
3. **Additive Type Extensions**: New optional fields only
4. **Service Context**: React context for dependency injection
5. **UI Enhancements**: Add filters/tabs without replacing components
