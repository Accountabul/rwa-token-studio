import React, { createContext, useContext, useMemo } from "react";
import { AuditService, auditService } from "./services/AuditService";
import { LedgerService, ledgerService } from "./services/LedgerService";
import { TaxService, taxService } from "./services/TaxService";
import { ReportsService, reportsService } from "./services/ReportsService";

/**
 * Service container for dependency injection
 */
export interface ServiceContainer {
  auditService: AuditService;
  ledgerService: LedgerService;
  taxService: TaxService;
  reportsService: ReportsService;
}

/**
 * Default service container using mock repositories
 */
const defaultServices: ServiceContainer = {
  auditService,
  ledgerService,
  taxService,
  reportsService,
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
