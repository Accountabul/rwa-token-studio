import React, { createContext, useContext, useMemo } from "react";
import { AuditService, auditService } from "./services/AuditService";
import { LedgerService, ledgerService } from "./services/LedgerService";
import { TaxService, taxService } from "./services/TaxService";
import { ReportsService, reportsService } from "./services/ReportsService";
import { BusinessService, businessService } from "./services/BusinessService";
import { WorkOrderService, workOrderService } from "./services/WorkOrderService";
import { PayeeService, payeeService } from "./services/PayeeService";
import { PayoutRequestService, payoutRequestService } from "./services/PayoutRequestService";

/**
 * Service container for dependency injection
 */
export interface ServiceContainer {
  auditService: AuditService;
  ledgerService: LedgerService;
  taxService: TaxService;
  reportsService: ReportsService;
  businessService: BusinessService;
  workOrderService: WorkOrderService;
  payeeService: PayeeService;
  payoutRequestService: PayoutRequestService;
}

/**
 * Default service container using mock repositories
 */
const defaultServices: ServiceContainer = {
  auditService,
  ledgerService,
  taxService,
  reportsService,
  businessService,
  workOrderService,
  payeeService,
  payoutRequestService,
};

/**
 * React context for services
 */
const ServiceContext = createContext<ServiceContainer>(defaultServices);

/**
 * Provider component for service injection
 */
export interface ServiceProviderProps {
  services?: Partial<ServiceContainer>;
  children: React.ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  services,
  children,
}) => {
  const mergedServices = useMemo<ServiceContainer>(
    () => ({
      ...defaultServices,
      ...services,
    }),
    [services]
  );

  return (
    <ServiceContext.Provider value={mergedServices}>
      {children}
    </ServiceContext.Provider>
  );
};

/**
 * Hook to access all services
 */
export function useServices(): ServiceContainer {
  return useContext(ServiceContext);
}

/**
 * Hook to access audit service
 */
export function useAuditService(): AuditService {
  const { auditService } = useContext(ServiceContext);
  return auditService;
}

/**
 * Hook to access ledger service
 */
export function useLedgerService(): LedgerService {
  const { ledgerService } = useContext(ServiceContext);
  return ledgerService;
}

/**
 * Hook to access tax service
 */
export function useTaxService(): TaxService {
  const { taxService } = useContext(ServiceContext);
  return taxService;
}

/**
 * Hook to access reports service
 */
export function useReportsService(): ReportsService {
  const { reportsService } = useContext(ServiceContext);
  return reportsService;
}

/**
 * Hook to access business service
 */
export function useBusinessService(): BusinessService {
  const { businessService } = useContext(ServiceContext);
  return businessService;
}

/**
 * Hook to access work order service
 */
export function useWorkOrderService(): WorkOrderService {
  const { workOrderService } = useContext(ServiceContext);
  return workOrderService;
}

/**
 * Hook to access payee service
 */
export function usePayeeService(): PayeeService {
  const { payeeService } = useContext(ServiceContext);
  return payeeService;
}

/**
 * Hook to access payout request service
 */
export function usePayoutRequestService(): PayoutRequestService {
  const { payoutRequestService } = useContext(ServiceContext);
  return payoutRequestService;
}
