import { Injectable, Injector, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DriverCompensationRule } from '@finances/models/finance-rules.models';
import { Driver, DriverService } from '@drivers/public-api';
import { OrderDetail, OrdersService } from '@orders/public-api';
import { VendorDetail, VendorService } from '@vendors/public-api';
import {
  AuditLogEntry,
  AuditLogFilter,
  ChartDataPoint,
  CodFilter,
  CodRecord,
  CodReconciliationSummary,
  CityDeliveryPricingSettings,
  DeliveryPricingDefaults,
  DriverFinanceProfile,
  EntityType,
  FinanceDashboardAlert,
  FinanceDashboardSnapshot,
  FinanceCurrency,
  FinancePeriod,
  FinancialAdjustment,
  LedgerEntry,
  LedgerDirection,
  LedgerEntryType,
  LedgerFilter,
  OrderFinancialBreakdown,
  PricingRuleSet,
  RegionDeliveryPricingSettings,
  RefundCase,
  RefundFilter,
  RefundStatus,
  Settlement,
  SettlementFilter,
  SettlementStatus,
  VendorFinanceProfile,
  ZoneFinanceSettings
} from '../models/finance.models';

interface FinanceOrderContext {
  order: OrderDetail;
  vendor?: VendorDetail;
  driver?: Driver;
  breakdown: OrderFinancialBreakdown;
  vendorCommissionRate: number;
  driverCompensation: DriverCompensationRule;
}

interface RefundOverride {
  status: RefundStatus;
  note: string;
  updatedAt: string;
}

interface FinanceDriverDirectory {
  list: Driver[];
  byId: Map<string, Driver>;
  byPhone: Map<string, Driver>;
  byName: Map<string, Driver>;
}

interface DeliveryPricingRuleApiModel {
  id: string;
  deliveryZoneId: string | null;
  city: string;
  name: string;
  baseFee: number;
  includedKm: number;
  perKmFee: number;
  minFee: number;
  maxFee: number;
  isActive: boolean;
}

interface UpsertDeliveryPricingRulePayload {
  deliveryZoneId: string;
  city: string;
  name: string;
  baseFee: number;
  includedKm: number;
  perKmFee: number;
  minFee: number;
  maxFee: number;
  isActive: boolean;
  surgeWindows: [];
}

interface DeliveryZoneApiModel {
  id: string;
  city: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  isActive: boolean;
}

interface AdminLedgerLineApiModel {
  id: string;
  accountCode: string;
  ownerType: string | null;
  ownerId: string | null;
  debitAmount: number;
  creditAmount: number;
  currencyCode: string;
  orderId: string | null;
  settlementId: string | null;
  payoutId: string | null;
  memo: string | null;
}

interface AdminLedgerEntryApiModel {
  id: string;
  sequenceNumber: number;
  status: string;
  eventType: string;
  correlationId: string;
  idempotencyKey: string;
  orderId: string | null;
  settlementId: string | null;
  payoutId: string | null;
  refundId: string | null;
  currencyCode: string;
  postedAtUtc: string;
  debitTotal: number;
  creditTotal: number;
  memo: string | null;
  lines: AdminLedgerLineApiModel[];
}

interface AdminLedgerEntryListApiModel {
  items: AdminLedgerEntryApiModel[];
  page: number;
  pageSize: number;
  totalCount: number;
}

interface AdminSettlementApiModel {
  id: string;
  ownerType: string;
  ownerId: string;
  status: string;
  resolutionType: string;
  periodFrom: string;
  periodTo: string;
  grossAmount: number;
  commissionAmount: number;
  refundAmount: number;
  adjustmentAmount: number;
  recoveryAmount: number;
  netAmount: number;
}

interface AdminSettlementListApiModel {
  items: AdminSettlementApiModel[];
  page: number;
  pageSize: number;
  totalCount: number;
}

interface AdminCodReconciliationApiModel {
  items: Array<{
    driverId: string;
    driverName: string;
    driverPhone: string;
    codOwedBalance: number;
    lastJournalSequence: number;
  }>;
  totalCodOwed: number;
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly injector = inject(Injector);
  private pricingRulesStore: PricingRuleSet = {
    id: 'price-001',
    name: 'FINANCES.PRICING.RULESET_NAME',
    effectiveFrom: '2026-01-01T00:00:00Z',
    lastUpdatedAt: '2026-03-25T10:00:00Z',
    lastUpdatedBy: 'FINANCES.ADMINS.SUPER_ADMIN',
    vendorCommission: { defaultPercent: 5.5, minPercent: 3, maxPercent: 15, overrideAllowed: true },
    driverCompensation: { basePayout: 8, distanceRatePerKm: 2.5, peakBonus: 15, zoneBonus: 10, overrideAllowed: true },
    deliveryPricing: {
      baseFee: 10,
      perKmRate: 2.5,
      peakMultiplier: 1.5,
      peakHoursStart: '12:00',
      peakHoursEnd: '14:00',
      zoneRates: [
        { zone: 'zone_a', name: 'Zone A (Central)', multiplier: 1.0 },
        { zone: 'zone_b', name: 'Zone B (Remote)', multiplier: 1.3 }
      ]
    },
    serviceFee: { percent: 5, capAmount: 50, applyOnDelivery: false },
    codFee: { percent: 1.5, flatFee: 5, useFlat: false },
    vat: { percent: 15, applyOnServiceFee: true, applyOnDelivery: true, applyOnCommission: false }
  };

  private readonly refundOverrides = new Map<string, RefundOverride>();
  private readonly adjustmentsStore: FinancialAdjustment[];
  private readonly auditStore: AuditLogEntry[];
  private driverDirectory: FinanceDriverDirectory | null = null;
  private orderContextsCache: FinanceOrderContext[] | null = null;
  private vendorServiceInstance: VendorService | null = null;
  private driverServiceInstance: DriverService | null = null;
  private ordersServiceInstance: OrdersService | null = null;

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/finances`;
  private readonly settlementsApiUrl = `${environment.apiUrl}/admin/settlements`;
  private readonly deliveryPricingApiUrl = `${environment.apiUrl}/admin/delivery-pricing`;
  private readonly deliveryZonesApiUrl = `${environment.apiUrl}/admin/delivery-zones`;
  private readonly geographyApiUrl = `${environment.apiUrl}/geography`;

  constructor() {
    this.adjustmentsStore = this.buildInitialAdjustments();
    this.auditStore = this.buildInitialAuditLog();
  }

  getDashboardSnapshot(period: FinancePeriod = 'month'): Observable<FinanceDashboardSnapshot> {
    return this.http.get<FinanceDashboardSnapshot>(`${this.apiUrl}/dashboard/snapshot`, {
      params: { period }
    }).pipe(
      catchError((error) => {
        console.error('Failed to build finance dashboard snapshot.', error);
        return of(this.buildEmptyDashboardSnapshot(period));
      })
    );
  }

  getLedgerEntries(filter?: LedgerFilter): Observable<LedgerEntry[]> {
    let params = new HttpParams()
      .set('page', '1')
      .set('pageSize', '200');

    if (filter?.orderId) {
      params = params.set('orderId', filter.orderId);
    }

    return this.http.get<AdminLedgerEntryListApiModel>(`${this.apiUrl}/ledger`, { params }).pipe(
      map((response) => this.filterLedgerEntries(this.mapLedgerEntries(response.items), filter)),
      catchError((error) => {
        console.error('Failed to load ledger entries from backend.', error);
        return of<LedgerEntry[]>([]);
      })
    );
  }

  getSettlements(filter?: SettlementFilter): Observable<Settlement[]> {
    let params = new HttpParams()
      .set('page', '1')
      .set('pageSize', '200');

    const ownerType = this.toBackendOwnerType(filter?.entityType);
    if (ownerType) {
      params = params.set('ownerType', ownerType);
    }
    if (filter?.entityId) {
      params = params.set('ownerId', filter.entityId);
    }
    const status = this.toBackendSettlementStatus(filter?.status);
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<AdminSettlementListApiModel>(this.settlementsApiUrl, { params }).pipe(
      map((response) => this.filterSettlements(response.items.map((item) => this.mapSettlement(item)), filter)),
      catchError((error) => {
        console.error('Failed to load settlements from backend.', error);
        return of<Settlement[]>([]);
      })
    );
  }

  getCodRecords(filter?: CodFilter): Observable<{ summary: CodReconciliationSummary; records: CodRecord[] }> {
    return this.http.get<AdminCodReconciliationApiModel>(`${this.apiUrl}/cod-reconciliation`).pipe(
      map((response) => {
        const records = this.filterCodRecords(this.mapCodRecords(response), filter);
        const summary: CodReconciliationSummary = {
          totalExpected: this.sum(records.map((record) => record.expectedAmount)),
          totalCollected: this.sum(records.map((record) => record.collectedAmount)),
          totalDelta: this.sum(records.map((record) => record.delta)),
          overdueCases: records.filter((record) => record.status === 'overdue').length,
          pendingCases: records.filter((record) => record.status === 'pending').length
        };

        return { summary, records };
      }),
      catchError((error) => {
        console.error('Failed to load COD reconciliation from backend.', error);
        return of({
          summary: { totalExpected: 0, totalCollected: 0, totalDelta: 0, overdueCases: 0, pendingCases: 0 },
          records: []
        });
      })
    );
  }

  approveSettlement(settlementId: string): Observable<void> {
    return this.http.post<void>(`${this.settlementsApiUrl}/${settlementId}/approve`, { resolutionType: 'BankPayout' });
  }

  getRefundCases(filter?: RefundFilter): Observable<RefundCase[]> {
    return of(this.filterRefundCases(this.buildRefundCases(), filter));
  }

  updateRefundStatus(caseId: string, status: RefundStatus, note: string): Observable<void> {
    const updatedAt = new Date().toISOString();
    this.refundOverrides.set(caseId, { status, note, updatedAt });

    const currentCase = this.buildRefundCases().find((item) => item.id === caseId);
    if (currentCase) {
      this.auditStore.unshift({
        id: `audit-refund-${Date.now()}`,
        timestamp: updatedAt,
        adminId: 'adm-001',
        adminName: 'FINANCES.ADMINS.SUPER_ADMIN',
        adminRole: 'FINANCES.ROLES.SUPER_ADMIN',
        action: status === 'approved'
          ? 'FINANCES.AUDIT.ACTIONS.REFUND_APPROVED'
          : status === 'rejected'
            ? 'FINANCES.AUDIT.ACTIONS.REFUND_REJECTED'
            : 'FINANCES.AUDIT.ACTIONS.REFUND_ESCALATED',
        actionCategory: 'refund',
        entityType: currentCase.responsibleParty,
        entityId: currentCase.responsibleParty === 'driver' ? currentCase.driverId : currentCase.vendorId,
        orderId: currentCase.orderId,
        entityName: currentCase.responsibleParty === 'driver' ? currentCase.driverName : currentCase.vendorName,
        before: { status: currentCase.status },
        after: { status, note }
      });
    }

    return of(undefined);
  }

  getAdjustments(): Observable<FinancialAdjustment[]> {
    return of(this.clone(this.adjustmentsStore));
  }

  createAdjustment(adj: Partial<FinancialAdjustment>): Observable<FinancialAdjustment> {
    const createdAt = new Date().toISOString();
    const newAdjustment: FinancialAdjustment = {
      id: `adj-${Date.now()}`,
      adjustmentRef: `ADJ-${Date.now()}`,
      entityType: adj.entityType ?? 'platform',
      entityId: adj.entityId ?? 'platform',
      entityName: adj.entityName ?? 'Platform',
      direction: adj.direction ?? 'credit',
      amount: this.round(adj.amount ?? 0),
      currency: 'SAR',
      reason: adj.reason ?? 'FINANCES.ADJUSTMENTS.REASONS.SYSTEM_DOWNTIME',
      category: adj.category ?? 'other',
      adminId: 'adm-001',
      adminName: 'FINANCES.ADMINS.SUPER_ADMIN',
      createdAt,
      status: 'approved',
      approvedAt: createdAt,
      approvedBy: 'FINANCES.ADMINS.SUPER_ADMIN'
    };

    this.adjustmentsStore.unshift(newAdjustment);
    this.auditStore.unshift({
      id: `audit-adjustment-${Date.now()}`,
      timestamp: createdAt,
      adminId: 'adm-001',
      adminName: 'FINANCES.ADMINS.SUPER_ADMIN',
      adminRole: 'FINANCES.ROLES.SUPER_ADMIN',
      action: 'FINANCES.AUDIT.ACTIONS.ADJUSTMENT_CREATED',
      actionCategory: 'adjustment',
      entityType: newAdjustment.entityType,
      entityId: newAdjustment.entityId,
      entityName: newAdjustment.entityName,
      after: {
        amount: newAdjustment.amount,
        direction: newAdjustment.direction,
        reason: newAdjustment.reason
      }
    });

    return of(this.clone(newAdjustment));
  }

  getAuditLog(filter?: AuditLogFilter): Observable<AuditLogEntry[]> {
    return of(this.filterAuditEntries(this.auditStore, filter));
  }

  getPricingRules(): Observable<PricingRuleSet> {
    return of(this.clone(this.pricingRulesStore));
  }

  savePricingRules(rules: PricingRuleSet): Observable<PricingRuleSet> {
    const updatedAt = new Date().toISOString();
    const previousRules = this.clone(this.pricingRulesStore);
    this.pricingRulesStore = {
      ...this.clone(rules),
      lastUpdatedAt: updatedAt,
      lastUpdatedBy: 'FINANCES.ADMINS.SUPER_ADMIN'
    };
    this.invalidateFinanceCaches();

    this.auditStore.unshift({
      id: `audit-pricing-${Date.now()}`,
      timestamp: updatedAt,
      adminId: 'adm-001',
      adminName: 'FINANCES.ADMINS.SUPER_ADMIN',
      adminRole: 'FINANCES.ROLES.SUPER_ADMIN',
      action: 'FINANCES.AUDIT.ACTIONS.PRICING_UPDATED',
      actionCategory: 'pricing',
      entityType: 'platform',
      entityId: 'platform',
      entityName: 'Platform',
      before: {
        vendorCommission: previousRules.vendorCommission.defaultPercent,
        driverBasePayout: previousRules.driverCompensation.basePayout
      },
      after: {
        vendorCommission: this.pricingRulesStore.vendorCommission.defaultPercent,
        driverBasePayout: this.pricingRulesStore.driverCompensation.basePayout
      }
    });

    return of(this.clone(this.pricingRulesStore));
  }

  getZonePricingSettings(): Observable<ZoneFinanceSettings[]> {
    return forkJoin({
      financeSettings: this.http.get<ZoneFinanceSettings[]>(`${this.apiUrl}/pricing-settings`).pipe(
        catchError((error) => {
          console.warn('Failed to load finance zone pricing settings. Falling back to delivery zones.', error);
          return of<ZoneFinanceSettings[] | null>(null);
        })
      ),
      deliveryRules: this.http.get<DeliveryPricingRuleApiModel[]>(this.deliveryPricingApiUrl).pipe(
        catchError((error) => {
          console.warn('Failed to load delivery pricing rules while building zone pricing settings.', error);
          return of<DeliveryPricingRuleApiModel[]>([]);
        })
      ),
      deliveryZones: this.http.get<DeliveryZoneApiModel[]>(this.deliveryZonesApiUrl).pipe(
        catchError((error) => {
          console.warn('Failed to load delivery zones while building zone pricing settings.', error);
          return of<DeliveryZoneApiModel[]>([]);
        })
      )
    }).pipe(
      map(({ financeSettings, deliveryRules, deliveryZones }) => {
        const rulesByZoneId = new Map<string, DeliveryPricingRuleApiModel>();
        const zonesById = new Map<string, ZoneFinanceSettings>();

        deliveryRules.forEach((rule) => {
          if (rule.deliveryZoneId) {
            rulesByZoneId.set(rule.deliveryZoneId, rule);
          }
        });

        (financeSettings ?? []).forEach((zone) => {
          zonesById.set(zone.zoneId, this.mergeZoneWithPricingRule(zone, rulesByZoneId.get(zone.zoneId)));
        });

        deliveryZones.forEach((zone) => {
          if (!zonesById.has(zone.id)) {
            zonesById.set(
              zone.id,
              this.mergeZoneWithPricingRule(
                this.buildZoneFinanceSettingsFromDeliveryZone(zone),
                rulesByZoneId.get(zone.id)
              )
            );
          }
        });

        return Array.from(zonesById.values()).sort((left, right) =>
          left.city.localeCompare(right.city) || left.zoneName.localeCompare(right.zoneName)
        );
      }),
      catchError((error) => {
        console.error('Failed to load zone pricing settings.', error);
        return throwError(() => error);
      })
    );
  }

  getCityPricingSettings(): Observable<CityDeliveryPricingSettings[]> {
    return this.http.get<CityDeliveryPricingSettings[]>(`${this.apiUrl}/city-pricing`).pipe(
      catchError((error) => {
        console.error('Failed to load city pricing settings.', error);
        return throwError(() => error);
      })
    );
  }

  updateCityPricingSettings(cityId: string, settings: Partial<CityDeliveryPricingSettings>): Observable<CityDeliveryPricingSettings> {
    return this.http.put<CityDeliveryPricingSettings>(`${this.apiUrl}/city-pricing/${cityId}`, {
      cityId,
      baseDeliveryFee: settings.baseDeliveryFee ?? 0,
      includedKm: settings.includedKm ?? 0,
      extraKmFee: settings.extraKmFee ?? 0,
      minDeliveryFee: settings.minDeliveryFee ?? 0,
      maxDeliveryFee: settings.maxDeliveryFee ?? 0,
      isPricingActive: settings.isPricingActive ?? false,
      vatPercent: settings.vatPercent ?? 0,
      codFeeType: settings.codFeeType ?? 'flat',
      codFlatFee: settings.codFlatFee ?? 0,
      codPercent: settings.codPercent ?? 0,
      isVatActive: settings.isVatActive ?? true,
      isCodFeeActive: settings.isCodFeeActive ?? false
    }).pipe(
      catchError((error) => {
        console.error(`Failed to update city pricing settings for ${cityId}.`, error);
        return throwError(() => error);
      })
    );
  }

  getRegionPricingSettings(): Observable<RegionDeliveryPricingSettings[]> {
    return this.http.get<RegionDeliveryPricingSettings[]>(`${this.apiUrl}/region-pricing`).pipe(
      catchError((error) => {
        console.error('Failed to load region pricing settings.', error);
        return throwError(() => error);
      })
    );
  }

  updateRegionPricingSettings(regionId: string, settings: Partial<RegionDeliveryPricingSettings>): Observable<RegionDeliveryPricingSettings> {
    return this.http.put<RegionDeliveryPricingSettings>(`${this.apiUrl}/region-pricing/${regionId}`, {
      regionId,
      baseDeliveryFee: settings.baseDeliveryFee ?? 0,
      includedKm: settings.includedKm ?? 0,
      extraKmFee: settings.extraKmFee ?? 0,
      minDeliveryFee: settings.minDeliveryFee ?? 0,
      maxDeliveryFee: settings.maxDeliveryFee ?? 0,
      isPricingActive: settings.isPricingActive ?? false,
      vatPercent: settings.vatPercent ?? 0,
      codFeeType: settings.codFeeType ?? 'flat',
      codFlatFee: settings.codFlatFee ?? 0,
      codPercent: settings.codPercent ?? 0,
      isVatActive: settings.isVatActive ?? true,
      isCodFeeActive: settings.isCodFeeActive ?? false
    }).pipe(
      catchError((error) => {
        console.error(`Failed to update region pricing settings for ${regionId}.`, error);
        return throwError(() => error);
      })
    );
  }

  getDeliveryPricingDefaults(): Observable<DeliveryPricingDefaults> {
    return this.http.get<DeliveryPricingDefaults>(`${this.apiUrl}/delivery-defaults`).pipe(
      catchError((error) => {
        console.error('Failed to load delivery pricing defaults.', error);
        return throwError(() => error);
      })
    );
  }

  updateDeliveryPricingDefaults(settings: DeliveryPricingDefaults): Observable<DeliveryPricingDefaults> {
    return this.http.put<DeliveryPricingDefaults>(`${this.apiUrl}/delivery-defaults`, settings).pipe(
      catchError((error) => {
        console.error('Failed to update delivery pricing defaults.', error);
        return throwError(() => error);
      })
    );
  }

  updateZonePricingSettings(zoneId: string, settings: Partial<ZoneFinanceSettings>): Observable<ZoneFinanceSettings> {
    if (!this.isGuid(zoneId)) {
      return throwError(() => new Error('Zone pricing can only be saved for real delivery zones. Use city pricing for city-level settings.'));
    }

    const normalized = this.normalizeZonePricingSettingsForSave(zoneId, settings);
    const deliveryRulePayload = this.buildDeliveryRulePayload(normalized);
    const financePayload = {
      zoneId: normalized.zoneId,
      vatPercent: normalized.vatPercent,
      codFeeType: normalized.codFeeType,
      codFlatFee: normalized.codFlatFee,
      codPercent: normalized.codPercent,
      isVatActive: normalized.isVatActive,
      isCodFeeActive: normalized.isCodFeeActive
    };

    const upsertPricingRule$ = normalized.pricingRuleId
      ? this.http.put<DeliveryPricingRuleApiModel>(
          `${this.deliveryPricingApiUrl}/${normalized.pricingRuleId}`,
          deliveryRulePayload
        )
      : this.http.post<DeliveryPricingRuleApiModel>(this.deliveryPricingApiUrl, deliveryRulePayload);

    return upsertPricingRule$.pipe(
      switchMap((rule) =>
        this.http.put<ZoneFinanceSettings>(`${this.apiUrl}/pricing-settings/${zoneId}`, financePayload).pipe(
          map((savedFinanceSettings) => this.mergeZoneWithPricingRule(savedFinanceSettings, rule))
        )
      ),
      catchError((error) => {
        console.error(`Failed to update zone pricing settings for ${zoneId}.`, error);
        return throwError(() => error);
      })
    );
  }

  getVendorFinanceProfile(vendorId: string): Observable<VendorFinanceProfile> {
    const vendor = this.vendorService.getVendorSnapshotById(vendorId);
    const contexts = this.getOrderContexts().filter((context) => context.vendor?.id === vendorId);
    const settlements = this.buildSettlements().filter((settlement) => settlement.entityType === 'vendor' && settlement.entityId === vendorId);
    const refunds = this.buildRefundCases().filter((refund) => refund.vendorId === vendorId);
    const paidSettlements = settlements.filter((settlement) => settlement.status === 'paid');
    const pendingSettlements = settlements.filter((settlement) => settlement.status !== 'paid');
    const totalSales = this.sum(contexts.map((context) => context.order.total));
    const totalCommissions = this.sum(contexts.map((context) => context.breakdown.vendorCommission));
    const totalRefunds = this.sum(refunds.filter((refund) => refund.status === 'approved').map((refund) => refund.approvedAmount ?? refund.requestedAmount));
    const availableBalance = this.sum(paidSettlements.map((settlement) => settlement.netAmount));
    const pendingBalance = this.sum(pendingSettlements.map((settlement) => settlement.netAmount));
    const lastSettlement = [...paidSettlements].sort((left, right) => (right.paidAt ?? '').localeCompare(left.paidAt ?? ''))[0];

    return of({
      vendorId,
      vendorName: vendor?.businessNameAr ?? vendor?.businessNameEn ?? 'Vendor',
      commissionRate: vendor?.commissionRate ?? this.pricingRulesStore.vendorCommission.defaultPercent,
      commissionOverride: vendor?.commissionRate ?? undefined,
      totalSales: this.round(totalSales),
      netSales: this.round(totalSales - totalCommissions - totalRefunds),
      totalCommissions: this.round(totalCommissions),
      availableBalance: this.round(availableBalance),
      pendingBalance: this.round(pendingBalance),
      lastPaymentAmount: this.round(lastSettlement?.netAmount ?? 0),
      lastPaymentDate: lastSettlement?.paidAt ?? '2026-03-12T10:00:00Z',
      financialSummary: {
        sales: this.round(totalSales),
        returns: this.round(-totalRefunds),
        discounts: 0,
        commissions: this.round(-totalCommissions),
        netTotal: this.round(totalSales - totalRefunds - totalCommissions)
      },
      bankInfo: {
        bankName: 'Al Rajhi Bank',
        iban: this.maskIban(vendorId),
        paymentCycle: 'VENDOR_FINANCE.WEEKLY_CYCLE'
      },
      settlements,
      refundExposure: this.round(this.sum(refunds.filter((refund) => refund.status !== 'approved' && refund.status !== 'rejected').map((refund) => refund.requestedAmount))),
      disputeCount: refunds.filter((refund) => refund.status === 'under_review' || refund.status === 'escalated').length,
      sparklineSales: this.buildSparkline(Math.max(totalSales, 1000), 8, 140)
    });
  }

  getDriverFinanceProfile(driverId: string): Observable<DriverFinanceProfile> {
    const driver = this.driverService.getDriverSnapshotById(driverId);
    const contexts = this.getOrderContexts().filter((context) => context.driver?.id === driverId);
    const settlements = this.buildSettlements().filter((settlement) => settlement.entityType === 'driver' && settlement.entityId === driverId);
    const codRecords = this.buildCodData().records.filter((record) => record.driverId === driverId);
    const compensationRule = driver?.compensationOverride ?? this.pricingRulesStore.driverCompensation;
    const paidSettlements = settlements.filter((settlement) => settlement.status === 'paid');
    const pendingSettlements = settlements.filter((settlement) => settlement.status !== 'paid');
    const lastPayout = [...paidSettlements].sort((left, right) => (right.paidAt ?? '').localeCompare(left.paidAt ?? ''))[0];

    const earningsBreakdown = {
      baseAmount: this.round(this.sum(contexts.map((context) => context.driver ? compensationRule.basePayout : 0))),
      distanceAmount: this.round(this.sum(contexts.map((context) => context.driver ? compensationRule.distanceRatePerKm * this.getEstimatedDistanceKm(context.order) : 0))),
      peakBonusAmount: this.round(this.sum(contexts.map((context) => this.isPeakOrder(context.order) ? compensationRule.peakBonus : 0))),
      zoneBonusAmount: this.round(this.sum(contexts.map((context) => this.getZoneBonusAmount(context.order, compensationRule)))),
      deductions: this.round(-Math.max(0, this.sum(codRecords.map((record) => Math.max(0, record.expectedAmount - record.collectedAmount))))),
      netTotal: 0
    };
    earningsBreakdown.netTotal = this.round(
      earningsBreakdown.baseAmount
      + earningsBreakdown.distanceAmount
      + earningsBreakdown.peakBonusAmount
      + earningsBreakdown.zoneBonusAmount
      + earningsBreakdown.deductions
    );

    const codBalance = this.round(this.sum(codRecords.map((record) => record.expectedAmount - record.collectedAmount)));

    return of({
      driverId,
      driverName: driver ? `${driver.firstName} ${driver.lastName}` : 'Driver',
      compensationRule,
      compensationOverride: driver?.compensationOverride,
      basePayout: compensationRule.basePayout,
      distanceRatePerKm: compensationRule.distanceRatePerKm,
      peakBonus: compensationRule.peakBonus,
      zoneBonus: compensationRule.zoneBonus,
      totalEarnings: this.round(this.sum(contexts.map((context) => context.breakdown.driverPayout))),
      availableBalance: this.round(Math.max(0, driver?.walletBalance ?? 0)),
      pendingBalance: this.round(this.sum(pendingSettlements.map((settlement) => settlement.netAmount))),
      lastPayoutAmount: this.round(lastPayout?.netAmount ?? 0),
      lastPayoutDate: lastPayout?.paidAt ?? '2026-03-22T14:00:00Z',
      earningsBreakdown,
      paymentHistory: paidSettlements.map((settlement) => ({
        id: settlement.id,
        paymentRef: settlement.settlementCode,
        amount: settlement.netAmount,
        period: settlement.period,
        status: settlement.status,
        paidAt: settlement.paidAt
      })),
      sparklineEarnings: this.buildSparkline(Math.max(earningsBreakdown.netTotal, 500), 8, 110),
      codBalance,
      codStatus: codRecords.some((record) => record.status === 'overdue')
        ? 'overdue'
        : codRecords.some((record) => record.status === 'pending')
          ? 'pending'
          : 'collected'
    });
  }

  getOrderFinancialBreakdown(orderId: string): Observable<OrderFinancialBreakdown | null> {
    const context = this.getOrderContexts().find((item) => item.order.id === orderId);
    return of(context ? this.clone(context.breakdown) : null);
  }

  private getOrderContexts(): FinanceOrderContext[] {
    if (this.orderContextsCache) {
      return this.orderContextsCache;
    }

    const orders = this.ordersService.getOrdersSnapshot();
    const vendors = this.vendorService.getVendorsSnapshot();
    const drivers = this.getDriverDirectory();

    this.orderContextsCache = orders.map((order) => {
      const vendor = this.findVendorByName(order.merchantName, vendors);
      const driver = this.findDriverForOrder(order, drivers);
      const vendorCommissionRate = this.clamp(
        vendor?.commissionRate ?? this.pricingRulesStore.vendorCommission.defaultPercent,
        this.pricingRulesStore.vendorCommission.minPercent,
        this.pricingRulesStore.vendorCommission.maxPercent
      );
      const driverCompensation = driver?.compensationOverride ?? this.pricingRulesStore.driverCompensation;

      return {
        order,
        vendor,
        driver,
        breakdown: this.buildOrderBreakdown(order, vendorCommissionRate, driverCompensation),
        vendorCommissionRate,
        driverCompensation
      };
    });

    return this.orderContextsCache;
  }

  private buildOrderBreakdown(
    order: OrderDetail,
    vendorCommissionRate: number,
    driverCompensation: DriverCompensationRule
  ): OrderFinancialBreakdown {
    const listPriceTotal = this.round(order.subtotal + order.deliveryFee + order.tax);
    const discounts = this.round(Math.max(0, listPriceTotal - order.total));
    const couponDiscount = discounts;
    const chargeableSubtotal = this.round(Math.max(0, order.subtotal - couponDiscount));
    const deliveryFee = this.round(order.deliveryFee || this.pricingRulesStore.deliveryPricing.baseFee);
    const vendorCommission = this.round(chargeableSubtotal * (vendorCommissionRate / 100));
    const serviceFeeBase = chargeableSubtotal + (this.pricingRulesStore.serviceFee.applyOnDelivery ? deliveryFee : 0);
    const serviceFee = this.round(
      Math.min(this.pricingRulesStore.serviceFee.capAmount, serviceFeeBase * (this.pricingRulesStore.serviceFee.percent / 100))
    );
    const codFee = this.isCodOrder(order)
      ? this.round(
          this.pricingRulesStore.codFee.useFlat
            ? this.pricingRulesStore.codFee.flatFee
            : order.total * (this.pricingRulesStore.codFee.percent / 100)
        )
      : 0;
    const taxableBase =
      (this.pricingRulesStore.vat.applyOnServiceFee ? serviceFee : 0)
      + (this.pricingRulesStore.vat.applyOnDelivery ? deliveryFee : 0)
      + (this.pricingRulesStore.vat.applyOnCommission ? vendorCommission : 0)
      + codFee;
    const vat = this.round(order.tax > 0 ? order.tax : taxableBase * (this.pricingRulesStore.vat.percent / 100));
    const peakBonus = this.isPeakOrder(order) ? driverCompensation.peakBonus : 0;
    const zoneBonus = this.getZoneBonusAmount(order, driverCompensation);
    const driverPayout = this.round(
      driverCompensation.basePayout
      + (this.getEstimatedDistanceKm(order) * driverCompensation.distanceRatePerKm)
      + peakBonus
      + zoneBonus
    );
    const vendorEarnings = this.round(chargeableSubtotal - vendorCommission);
    const platformRevenue = this.round(vendorCommission + serviceFee + codFee + vat);
    const netMargin = this.round(platformRevenue + deliveryFee - driverPayout);

    return {
      orderId: order.id,
      orderRef: order.displayId.replace(/^#/, ''),
      subtotal: this.round(order.subtotal),
      discounts,
      couponDiscount,
      deliveryFee,
      serviceFee,
      codFee,
      vat,
      total: this.round(order.total),
      vendorEarnings,
      vendorCommission,
      driverPayout,
      platformRevenue,
      netMargin,
      marginPercent: this.round((netMargin / Math.max(order.total, 1)) * 100, 1)
    };
  }

  private mapLedgerEntries(entries: AdminLedgerEntryApiModel[]): LedgerEntry[] {
    const rows = entries.flatMap((entry) =>
      entry.lines
        .filter((line) => Math.max(line.debitAmount, line.creditAmount) > 0)
        .map((line) => this.mapLedgerLine(entry, line))
    );

    return this.withBalances(rows);
  }

  private mapLedgerLine(entry: AdminLedgerEntryApiModel, line: AdminLedgerLineApiModel): LedgerEntry {
    const direction: LedgerDirection = line.creditAmount >= line.debitAmount ? 'credit' : 'debit';
    const ownerType = this.toFrontendEntityType(line.ownerType);
    const entityId = line.ownerId ?? entry.correlationId;

    return {
      id: line.id,
      timestamp: entry.postedAtUtc,
      entityType: ownerType,
      entityId,
      entityName: this.formatOwnerName(line.ownerType, line.ownerId, line.accountCode),
      type: this.toLedgerEntryType(entry.eventType, line.accountCode),
      direction,
      amount: this.round(Math.max(line.debitAmount, line.creditAmount)),
      currency: this.normalizeCurrency(line.currencyCode),
      referenceId: entry.id,
      description: line.memo ?? entry.memo ?? entry.eventType,
      orderId: line.orderId ?? entry.orderId ?? undefined,
      settlementId: line.settlementId ?? entry.settlementId ?? undefined
    };
  }

  private mapSettlement(item: AdminSettlementApiModel): Settlement {
    const entityType = this.toFrontendEntityType(item.ownerType);
    const period = `${this.shortDate(item.periodFrom)} - ${this.shortDate(item.periodTo)}`;

    return {
      id: item.id,
      settlementCode: `SET-${item.id.slice(0, 8).toUpperCase()}`,
      entityType,
      entityId: item.ownerId,
      entityName: this.formatOwnerName(item.ownerType, item.ownerId),
      period,
      periodFrom: item.periodFrom,
      periodTo: item.periodTo,
      ordersCount: 0,
      grossAmount: this.round(item.grossAmount),
      deductions: this.round(item.commissionAmount + item.refundAmount + item.adjustmentAmount + item.recoveryAmount),
      netAmount: this.round(item.netAmount),
      status: this.toFrontendSettlementStatus(item.status),
      createdAt: item.periodTo,
      paidAt: item.status === 'PaidOut' ? item.periodTo : undefined,
      failureReason: item.status === 'PayoutFailed' ? 'Payout failed' : undefined
    };
  }

  private mapCodRecords(response: AdminCodReconciliationApiModel): CodRecord[] {
    return response.items.map((item) => ({
      id: `cod-${item.driverId}`,
      orderId: item.driverId,
      orderRef: `COD-${item.driverId.slice(0, 8).toUpperCase()}`,
      driverId: item.driverId,
      driverName: item.driverName,
      vendorId: 'platform',
      vendorName: 'Platform',
      expectedAmount: this.round(item.codOwedBalance),
      collectedAmount: 0,
      delta: this.round(-item.codOwedBalance),
      status: item.codOwedBalance > 0 ? 'pending' : 'collected',
      notes: `Last journal sequence: ${item.lastJournalSequence}`
    }));
  }

  private toLedgerEntryType(eventType: string, accountCode: string): LedgerEntryType {
    if (eventType.includes('Payout')) return 'payout';
    if (eventType.includes('Refund')) return 'refund';
    if (eventType.includes('Cod') || accountCode === 'DriverCodReceivable') return 'cod_collection';
    if (eventType.includes('Adjustment') || accountCode === 'ManualAdjustment') return 'adjustment';
    if (accountCode === 'PlatformRevenue') return 'service_fee';
    if (accountCode === 'VendorPayable' || accountCode === 'DriverPayable') return 'settlement';
    return 'adjustment';
  }

  private toFrontendEntityType(ownerType: string | null | undefined): EntityType {
    const normalized = ownerType?.toLowerCase();
    if (normalized === 'vendor') return 'vendor';
    if (normalized === 'driver') return 'driver';
    if (normalized === 'customer') return 'customer';
    return 'platform';
  }

  private toBackendOwnerType(entityType: EntityType | undefined): string | null {
    if (entityType === 'vendor') return 'Vendor';
    if (entityType === 'driver') return 'Driver';
    return null;
  }

  private toFrontendSettlementStatus(status: string): SettlementStatus {
    switch (status) {
      case 'PaidOut':
      case 'Settled':
        return 'paid';
      case 'Processing':
      case 'Approved':
        return 'processing';
      case 'OnHold':
        return 'on_hold';
      case 'PayoutFailed':
      case 'Failed':
      case 'Rejected':
      case 'Reversed':
        return 'failed';
      case 'Disputed':
        return 'disputed';
      case 'PendingReview':
        return 'pending_review';
      case 'Pending':
      default:
        return 'pending';
    }
  }

  private toBackendSettlementStatus(status: SettlementStatus | undefined): string | null {
    switch (status) {
      case 'paid':
      case 'settled':
        return 'PaidOut';
      case 'processing':
      case 'approved':
        return 'Processing';
      case 'on_hold':
        return 'OnHold';
      case 'failed':
      case 'reversed':
        return 'PayoutFailed';
      case 'disputed':
        return 'Disputed';
      case 'pending_review':
        return 'PendingReview';
      case 'pending':
        return 'PendingReview';
      default:
        return null;
    }
  }

  private normalizeCurrency(value: string): FinanceCurrency {
    return value === 'SAR' ? 'SAR' : 'EGP';
  }

  private formatOwnerName(ownerType: string | null | undefined, ownerId?: string | null, fallback?: string): string {
    const prefix = ownerType && ownerType.trim().length > 0 ? ownerType : fallback ?? 'Platform';
    return ownerId ? `${prefix} ${ownerId.slice(0, 8)}` : prefix;
  }

  private shortDate(value: string): string {
    return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  private buildSettlements(): Settlement[] {
    const contexts = this.getOrderContexts();
    const refundCases = this.buildRefundCases();
    const codShortages = new Map(
      this.buildCodData().records.map((record) => [record.orderId, this.round(Math.max(0, record.expectedAmount - record.collectedAmount))])
    );
    const vendorRefundDeductions = new Map<string, number>();
    const driverRefundDeductions = new Map<string, number>();
    const groups = new Map<string, Settlement>();
    const currentMonthKey = '2026-03';

    refundCases.forEach((refund) => {
      if (refund.status !== 'approved') {
        return;
      }

      const approvedAmount = this.round(refund.approvedAmount ?? refund.requestedAmount);
      if (refund.responsibleParty === 'vendor') {
        vendorRefundDeductions.set(refund.orderId, approvedAmount);
      } else if (refund.responsibleParty === 'driver') {
        driverRefundDeductions.set(refund.orderId, approvedAmount);
      }
    });

    contexts.forEach((context, index) => {
      const settlementDate = new Date(this.sequenceDate(index));
      const monthKey = settlementDate.toISOString().slice(0, 7);
      const periodLabel = settlementDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
      const periodFrom = new Date(Date.UTC(settlementDate.getUTCFullYear(), settlementDate.getUTCMonth(), 1, 0, 0, 0)).toISOString();
      const periodTo = new Date(Date.UTC(settlementDate.getUTCFullYear(), settlementDate.getUTCMonth() + 1, 0, 23, 59, 59)).toISOString();

      if (context.vendor) {
        const grossAmount = this.round(context.breakdown.vendorEarnings + context.breakdown.vendorCommission);
        const deductions = this.round(context.breakdown.vendorCommission + (vendorRefundDeductions.get(context.order.id) ?? 0));
        const netAmount = this.round(grossAmount - deductions);
        const key = `vendor:${context.vendor.id}:${monthKey}`;
        const existing = groups.get(key) ?? {
          id: key,
          settlementCode: `VND-SET-${context.vendor.id.replace(/\D+/g, '').slice(-4)}-${monthKey.replace('-', '')}`,
          entityType: 'vendor',
          entityId: context.vendor.id,
          entityName: context.vendor.businessNameAr || context.vendor.businessNameEn,
          period: periodLabel,
          periodFrom,
          periodTo,
          ordersCount: 0,
          grossAmount: 0,
          deductions: 0,
          netAmount: 0,
          status: monthKey === currentMonthKey ? 'processing' : 'paid',
          createdAt: this.sequenceDate(index, 2),
          paidAt: monthKey === currentMonthKey ? undefined : this.sequenceDate(index, 6),
          bankAccount: this.maskIban(context.vendor.id),
          items: []
        } satisfies Settlement;

        existing.ordersCount += 1;
        existing.grossAmount = this.round(existing.grossAmount + grossAmount);
        existing.deductions = this.round(existing.deductions + deductions);
        existing.netAmount = this.round(existing.netAmount + netAmount);
        existing.items = [
          ...(existing.items ?? []),
          {
            orderId: context.order.id,
            orderRef: context.order.displayId.replace(/^#/, ''),
            amount: grossAmount,
            commission: this.round(context.breakdown.vendorCommission),
            netEarning: netAmount,
            date: this.sequenceDate(index, 1)
          }
        ];

        groups.set(key, existing);
      }

      if (context.driver) {
        const grossAmount = this.round(context.breakdown.driverPayout);
        const deductions = this.round((driverRefundDeductions.get(context.order.id) ?? 0) + (codShortages.get(context.order.id) ?? 0));
        const netAmount = this.round(grossAmount - deductions);
        const key = `driver:${context.driver.id}:${monthKey}`;
        const existing = groups.get(key) ?? {
          id: key,
          settlementCode: `DRV-SET-${context.driver.driverId.replace(/\D+/g, '').slice(-4)}-${monthKey.replace('-', '')}`,
          entityType: 'driver',
          entityId: context.driver.id,
          entityName: `${context.driver.firstName} ${context.driver.lastName}`,
          period: periodLabel,
          periodFrom,
          periodTo,
          ordersCount: 0,
          grossAmount: 0,
          deductions: 0,
          netAmount: 0,
          status: monthKey === currentMonthKey ? 'pending' : 'paid',
          createdAt: this.sequenceDate(index, 3),
          paidAt: monthKey === currentMonthKey ? undefined : this.sequenceDate(index, 7),
          bankAccount: this.maskIban(context.driver.driverId),
          items: []
        } satisfies Settlement;

        existing.ordersCount += 1;
        existing.grossAmount = this.round(existing.grossAmount + grossAmount);
        existing.deductions = this.round(existing.deductions + deductions);
        existing.netAmount = this.round(existing.netAmount + netAmount);
        existing.items = [
          ...(existing.items ?? []),
          {
            orderId: context.order.id,
            orderRef: context.order.displayId.replace(/^#/, ''),
            amount: grossAmount,
            commission: 0,
            netEarning: netAmount,
            date: this.sequenceDate(index, 1)
          }
        ];

        groups.set(key, existing);
      }
    });

    return [...groups.values()]
      .map((group) => ({
        ...group,
        items: group.items?.sort((left, right) => right.date.localeCompare(left.date))
      }))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  private buildCodData(): { summary: CodReconciliationSummary; records: CodRecord[] } {
    const records: CodRecord[] = [];

    this.getOrderContexts().forEach((context, index) => {
      if (!this.isCodOrder(context.order)) {
        return;
      }

      const expectedAmount = this.round(context.order.total);
      const delta = this.getCodDeltaForOrder(context.order);
      const collectedAmount = this.round(Math.max(0, expectedAmount + delta));
      const status: CodRecord['status'] = delta === 0 ? 'collected' : (index % 2 === 0 ? 'pending' : 'overdue');

      records.push({
        id: `cod-${context.order.id}`,
        orderId: context.order.id,
        orderRef: context.order.displayId.replace(/^#/, ''),
        driverId: context.driver?.id ?? 'unassigned-driver',
        driverName: context.driver ? `${context.driver.firstName} ${context.driver.lastName}` : context.order.driverName || 'Unassigned Driver',
        vendorId: context.vendor?.id ?? 'unmapped-vendor',
        vendorName: context.vendor?.businessNameAr ?? context.vendor?.businessNameEn ?? context.order.merchantName,
        expectedAmount,
        collectedAmount,
        delta: this.round(delta),
        status,
        collectionDate: status === 'collected' ? this.sequenceDate(index, 4) : undefined,
        reconciledAt: status === 'collected' ? this.sequenceDate(index, 5) : undefined,
        notes: status === 'overdue'
          ? 'FINANCES.ALERTS.COD_OVERDUE_DESC'
          : status === 'pending'
            ? 'FINANCES.STATUS.PENDING'
            : 'FINANCES.STATUS.COLLECTED'
      });
    });

    return {
      summary: {
        totalExpected: this.round(this.sum(records.map((record) => record.expectedAmount))),
        totalCollected: this.round(this.sum(records.map((record) => record.collectedAmount))),
        totalDelta: this.round(this.sum(records.map((record) => record.delta))),
        overdueCases: records.filter((record) => record.status === 'overdue').length,
        pendingCases: records.filter((record) => record.status === 'pending').length
      },
      records
    };
  }

  private buildRefundCases(): RefundCase[] {
    return this.getOrderContexts()
      .map((context, index) => {
        const includeCase =
          context.order.paymentStatus === 'REFUNDED'
          || context.order.paymentStatus === 'PARTIALLY_REFUNDED'
          || context.order.paymentStatus === 'FAILED'
          || context.order.hasActiveIssue
          || !!context.order.cancellationSummary
          || index % 2 === 0;

        if (!includeCase) {
          return null;
        }

        const baseRequestedAmount =
          context.order.paymentStatus === 'REFUNDED'
            ? context.order.total
            : context.order.paymentStatus === 'PARTIALLY_REFUNDED'
              ? Math.min(context.order.total * 0.45, context.order.subtotal * 0.6)
              : context.order.paymentStatus === 'FAILED'
                ? Math.min(context.order.total, context.order.subtotal * 0.35)
                : Math.max(context.order.deliveryFee + context.order.tax, context.order.total * 0.2);
        const status = this.deriveRefundStatus(context.order, index);
        const requestedAmount = this.round(baseRequestedAmount);
        const approvedAmount = status === 'approved'
          ? this.round(
              context.order.paymentStatus === 'PARTIALLY_REFUNDED'
                ? requestedAmount * 0.7
                : requestedAmount
            )
          : undefined;
        const override = this.refundOverrides.get(`refund-${context.order.id}`);
        const reason = this.getRefundReasonKey(context.order, index);
        const responsibleParty = this.deriveResponsibleParty(context.order, index);
        const createdAt = this.sequenceDate(index, 2);
        const updatedAt = override?.updatedAt ?? this.sequenceDate(index, 5);

        const refund: RefundCase = {
          id: `refund-${context.order.id}`,
          caseRef: `RFD-${context.order.displayId.replace(/\D+/g, '')}`,
          orderId: context.order.id,
          orderRef: context.order.displayId.replace(/^#/, ''),
          customerId: `CUST-${context.order.id.replace(/\D+/g, '')}`,
          customerName: context.order.customerName,
          driverId: context.driver?.id,
          driverName: context.driver ? `${context.driver.firstName} ${context.driver.lastName}` : undefined,
          vendorId: context.vendor?.id ?? 'unmapped-vendor',
          vendorName: context.vendor?.businessNameAr ?? context.vendor?.businessNameEn ?? context.order.merchantName,
          requestedAmount,
          approvedAmount,
          reason,
          status,
          financialImpact: this.getRefundImpact(requestedAmount, approvedAmount, status),
          responsibleParty,
          createdAt,
          updatedAt,
          resolvedAt: status === 'approved' || status === 'rejected' ? updatedAt : undefined,
          adminNote: override?.note || undefined,
          timeline: []
        };

        refund.timeline = this.buildRefundTimeline(refund);
        return refund;
      })
      .filter((refund): refund is RefundCase => !!refund)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  private buildLedgerEntries(): LedgerEntry[] {
    const contexts = this.getOrderContexts();
    const refundCases = this.buildRefundCases();
    const settlements = this.buildSettlements();
    const codRecords = this.buildCodData().records;
    const refundMap = new Map(refundCases.map((refund) => [refund.orderId, refund]));
    const codMap = new Map(codRecords.map((record) => [record.orderId, record]));
    const entries: LedgerEntry[] = [];

    contexts.forEach((context, index) => {
      const orderRef = context.order.displayId.replace(/^#/, '');

      if (context.vendor) {
        entries.push({
          id: `ledger-commission-${context.order.id}`,
          timestamp: this.sequenceDate(index, 1),
          entityType: 'vendor',
          entityId: context.vendor.id,
          entityName: context.vendor.businessNameAr || context.vendor.businessNameEn,
          type: 'commission',
          direction: 'debit',
          amount: context.breakdown.vendorCommission,
          currency: 'SAR',
          referenceId: orderRef,
          description: 'FINANCES.LEDGER.DESC.COMMISSION',
          orderId: context.order.id
        });
      }

      if (context.driver) {
        entries.push({
          id: `ledger-payout-${context.order.id}`,
          timestamp: this.sequenceDate(index, 2),
          entityType: 'driver',
          entityId: context.driver.id,
          entityName: `${context.driver.firstName} ${context.driver.lastName}`,
          type: 'payout',
          direction: 'credit',
          amount: context.breakdown.driverPayout,
          currency: 'SAR',
          referenceId: orderRef,
          description: 'FINANCES.LEDGER.DESC.PAYOUT',
          orderId: context.order.id
        });
      }

      entries.push({
        id: `ledger-service-${context.order.id}`,
        timestamp: this.sequenceDate(index, 3),
        entityType: 'platform',
        entityId: 'platform',
        entityName: 'Platform',
         type: 'service_fee',
        direction: 'credit',
        amount: context.breakdown.serviceFee,
        currency: 'SAR',
        referenceId: orderRef,
        description: 'FINANCES.LEDGER.DESC.SERVICE_FEE',
        orderId: context.order.id
      });

      entries.push({
        id: `ledger-delivery-${context.order.id}`,
        timestamp: this.sequenceDate(index, 4),
        entityType: 'platform',
        entityId: 'platform',
        entityName: 'Platform',
        type: 'delivery_fee',
        direction: 'credit',
        amount: context.breakdown.deliveryFee,
        currency: 'SAR',
        referenceId: orderRef,
        description: 'FINANCES.LEDGER.DESC.DELIVERY_FEE',
        orderId: context.order.id
      });

      if (context.breakdown.vat > 0) {
        entries.push({
          id: `ledger-vat-${context.order.id}`,
          timestamp: this.sequenceDate(index, 5),
          entityType: 'platform',
          entityId: 'platform',
          entityName: 'Platform',
          type: 'vat',
          direction: 'credit',
          amount: context.breakdown.vat,
          currency: 'SAR',
          referenceId: orderRef,
          description: 'FINANCES.LEDGER.DESC.VAT',
          orderId: context.order.id
        });
      }

      if (context.breakdown.codFee > 0) {
        entries.push({
          id: `ledger-cod-fee-${context.order.id}`,
          timestamp: this.sequenceDate(index, 6),
          entityType: 'platform',
          entityId: 'platform',
          entityName: 'Platform',
          type: 'service_fee',
          direction: 'credit',
          amount: context.breakdown.codFee,
          currency: 'SAR',
          referenceId: orderRef,
          description: 'FINANCES.LEDGER.DESC.SERVICE_FEE',
          orderId: context.order.id
        });
      }

      const refund = refundMap.get(context.order.id);
      if (refund && refund.status === 'approved') {
        entries.push({
          id: `ledger-refund-${context.order.id}`,
          timestamp: refund.updatedAt,
          entityType: refund.responsibleParty,
          entityId: refund.responsibleParty === 'driver'
            ? (refund.driverId ?? 'unassigned-driver')
            : refund.responsibleParty === 'vendor'
              ? refund.vendorId
              : 'platform',
          entityName: refund.responsibleParty === 'driver'
            ? (refund.driverName ?? 'Driver')
            : refund.responsibleParty === 'vendor'
              ? refund.vendorName
              : 'Platform',
          type: 'refund',
          direction: 'debit',
          amount: refund.approvedAmount ?? refund.requestedAmount,
          currency: 'SAR',
          referenceId: refund.caseRef,
          description: 'FINANCES.LEDGER.DESC.REFUND',
          orderId: context.order.id
        });
      }

      const codRecord = codMap.get(context.order.id);
      if (codRecord) {
        entries.push({
          id: `ledger-cod-${context.order.id}`,
          timestamp: codRecord.reconciledAt ?? this.sequenceDate(index, 7),
          entityType: 'driver',
          entityId: codRecord.driverId,
          entityName: codRecord.driverName,
          type: 'cod_collection',
          direction: codRecord.delta === 0 ? 'credit' : 'debit',
          amount: codRecord.delta === 0 ? codRecord.collectedAmount : Math.abs(codRecord.delta),
          currency: 'SAR',
          referenceId: codRecord.orderRef,
          description: 'FINANCES.LEDGER.DESC.COD_COLLECTION',
          orderId: context.order.id
        });
      }
    });

    settlements
      .filter((settlement) => settlement.status === 'paid')
      .forEach((settlement, index) => {
        entries.push({
          id: `ledger-settlement-${settlement.id}`,
          timestamp: settlement.paidAt ?? settlement.createdAt,
          entityType: settlement.entityType,
          entityId: settlement.entityId,
          entityName: settlement.entityName,
          type: 'settlement',
          direction: 'credit',
          amount: settlement.netAmount,
          currency: 'SAR',
          referenceId: settlement.settlementCode,
          description: 'FINANCES.LEDGER.DESC.SETTLEMENT',
          settlementId: settlement.id,
          adminId: `settlement-batch-${index + 1}`
        });
      });

    this.adjustmentsStore.forEach((adjustment) => {
      entries.push({
        id: `ledger-adjustment-${adjustment.id}`,
        timestamp: adjustment.createdAt,
        entityType: adjustment.entityType,
        entityId: adjustment.entityId,
        entityName: adjustment.entityName,
        type: 'adjustment',
        direction: adjustment.direction,
        amount: adjustment.amount,
        currency: 'SAR',
        referenceId: adjustment.adjustmentRef,
        description: 'FINANCES.LEDGER.DESC.ADJUSTMENT',
        adminId: adjustment.adminId
      });
    });

    return this.withBalances(entries);
  }

  private buildDashboardAlerts(
    refunds: RefundCase[],
    settlements: Settlement[],
    codSummary: CodReconciliationSummary
  ): FinanceDashboardAlert[] {
    const contexts = this.getOrderContexts();
    const negativeMargin = contexts
      .filter((context) => context.breakdown.netMargin < 0)
      .sort((left, right) => left.breakdown.netMargin - right.breakdown.netMargin)[0];
    const disputeVendorCounts = refunds.reduce((accumulator, refund) => {
      if (refund.status !== 'rejected') {
        accumulator.set(refund.vendorId, (accumulator.get(refund.vendorId) ?? 0) + 1);
      }
      return accumulator;
    }, new Map<string, number>());
    const topDisputeVendor = [...disputeVendorCounts.entries()].sort((left, right) => right[1] - left[1])[0];
    const topVendorRefund = topDisputeVendor ? refunds.find((refund) => refund.vendorId === topDisputeVendor[0]) : undefined;
    const pendingSettlement = settlements.find((settlement) => settlement.status === 'pending' || settlement.status === 'processing');

    const alerts: FinanceDashboardAlert[] = [];

    if (negativeMargin) {
      alerts.push({
        id: 'alert-negative-margin',
        severity: 'warning',
        titleKey: 'FINANCES.ALERTS.NEGATIVE_MARGIN',
        descriptionKey: 'FINANCES.ALERTS.NEGATIVE_MARGIN_DESC',
        entityType: 'order',
        entityId: negativeMargin.order.id,
        orderId: negativeMargin.order.id,
        entityName: negativeMargin.order.displayId.replace(/^#/, ''),
        amount: negativeMargin.breakdown.netMargin,
        actionKey: 'FINANCES.ACTIONS.VIEW_ALL',
        actionRoute: `/finances/ledger?orderId=${negativeMargin.order.id}`,
        timestamp: this.sequenceDate(40, 1)
      });
    }

    if (topVendorRefund) {
      alerts.push({
        id: 'alert-high-dispute-vendor',
        severity: 'critical',
        titleKey: 'FINANCES.ALERTS.HIGH_DISPUTE_VENDOR',
        descriptionKey: 'FINANCES.ALERTS.HIGH_DISPUTE_VENDOR_DESC',
        entityType: 'vendor',
        entityId: topVendorRefund.vendorId,
        entityName: topVendorRefund.vendorName,
        amount: this.round(this.sum(refunds.filter((refund) => refund.vendorId === topVendorRefund.vendorId).map((refund) => refund.requestedAmount))),
        actionKey: 'FINANCES.ACTIONS.VIEW_VENDOR',
        actionRoute: `/finances/refunds?entityType=vendor&entityId=${topVendorRefund.vendorId}`,
        timestamp: this.sequenceDate(41, 1)
      });
    }

    if (codSummary.overdueCases > 0) {
      alerts.push({
        id: 'alert-cod-overdue',
        severity: 'warning',
        titleKey: 'FINANCES.ALERTS.COD_OVERDUE',
        descriptionKey: 'FINANCES.ALERTS.COD_OVERDUE_DESC',
        entityType: 'driver',
        amount: codSummary.totalDelta,
        actionKey: 'FINANCES.ACTIONS.VIEW_COD',
        actionRoute: '/finances/cod',
        timestamp: this.sequenceDate(42, 1)
      });
    }

    if (pendingSettlement) {
      alerts.push({
        id: 'alert-settlement-due',
        severity: 'info',
        titleKey: 'FINANCES.ALERTS.SETTLEMENT_DUE',
        descriptionKey: 'FINANCES.ALERTS.SETTLEMENT_DUE_DESC',
        entityType: pendingSettlement.entityType,
        entityId: pendingSettlement.entityId,
        entityName: pendingSettlement.entityName,
        amount: pendingSettlement.netAmount,
        actionKey: 'FINANCES.ACTIONS.VIEW_SETTLEMENTS',
        actionRoute: `/finances/settlements?entityType=${pendingSettlement.entityType}&entityId=${pendingSettlement.entityId}`,
        timestamp: this.sequenceDate(43, 1)
      });
    }

    return alerts;
  }

  private buildTrendSeries(contexts: FinanceOrderContext[]): ChartDataPoint[] {
    const buckets = new Map<string, { value: number; secondaryValue: number }>();

    contexts.forEach((context, index) => {
      const label = new Date(this.sequenceDate(index)).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
      const current = buckets.get(label) ?? { value: 0, secondaryValue: 0 };
      current.value += context.order.total;
      current.secondaryValue += context.breakdown.netMargin;
      buckets.set(label, current);
    });

    return [...buckets.entries()].map(([label, values]) => ({
      label,
      value: this.round(values.value),
      secondaryValue: this.round(values.secondaryValue)
    }));
  }

  private buildRefundTrend(refunds: RefundCase[]): ChartDataPoint[] {
    const buckets = new Map<string, number>();

    refunds.forEach((refund) => {
      const label = new Date(refund.createdAt).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
      buckets.set(label, (buckets.get(label) ?? 0) + refund.requestedAmount);
    });

    return [...buckets.entries()].map(([label, value]) => ({
      label,
      value: this.round(value)
    }));
  }

  private buildKpi(
    id: string,
    labelKey: string,
    value: number,
    currency: 'SAR' | undefined,
    trend: 'up' | 'down' | 'flat',
    trendPercent: number,
    trendLabel: string | undefined,
    severity: 'success' | 'warning' | 'danger' | 'neutral' | undefined,
    icon: string,
    clickRoute?: string
  ): FinanceDashboardSnapshot['grossCollections'] {
    const roundedValue = this.round(value);

    return {
      id,
      labelKey,
      value: roundedValue,
      formattedValue: currency ? `${roundedValue} ${currency}` : `${roundedValue}`,
      currency,
      trend,
      trendPercent,
      trendLabel,
      severity,
      clickRoute,
      icon,
      sparkline: this.buildSparkline(Math.max(Math.abs(roundedValue), 1), 8, Math.max(Math.abs(roundedValue) * 0.06, 6))
    };
  }

  private filterLedgerEntries(entries: LedgerEntry[], filter?: LedgerFilter): LedgerEntry[] {
    if (!filter) {
      return entries;
    }

    return entries.filter((entry) => {
      if (filter.entityType && entry.entityType !== filter.entityType) return false;
      if (filter.entityId && entry.entityId !== filter.entityId) return false;
      if (filter.orderId && entry.orderId !== filter.orderId) return false;
      if (filter.type && entry.type !== filter.type) return false;
      if (filter.direction && entry.direction !== filter.direction) return false;
      if (filter.minAmount !== undefined && entry.amount < filter.minAmount) return false;
      if (filter.maxAmount !== undefined && entry.amount > filter.maxAmount) return false;
      if (filter.search) {
        const haystack = `${entry.entityName} ${entry.referenceId} ${entry.orderId ?? ''}`;
        if (!this.normalizeText(haystack).includes(this.normalizeText(filter.search))) return false;
      }
      if (filter.dateFrom && entry.timestamp < filter.dateFrom) return false;
      if (filter.dateTo && entry.timestamp > filter.dateTo) return false;
      return true;
    });
  }

  private filterSettlements(settlements: Settlement[], filter?: SettlementFilter): Settlement[] {
    if (!filter) {
      return settlements;
    }

    return settlements.filter((settlement) => {
      if (filter.entityType && settlement.entityType !== filter.entityType) return false;
      if (filter.entityId && settlement.entityId !== filter.entityId) return false;
      if (filter.status && settlement.status !== filter.status) return false;
      if (filter.search) {
        const haystack = `${settlement.settlementCode} ${settlement.entityName} ${settlement.period}`;
        if (!this.normalizeText(haystack).includes(this.normalizeText(filter.search))) return false;
      }
      return true;
    });
  }

  private filterCodRecords(records: CodRecord[], filter?: CodFilter): CodRecord[] {
    if (!filter) {
      return records;
    }

    return records.filter((record) => {
      if (filter.entityType === 'vendor' && filter.entityId && record.vendorId !== filter.entityId) return false;
      if (filter.entityType === 'driver' && filter.entityId && record.driverId !== filter.entityId) return false;
      if (filter.orderId && record.orderId !== filter.orderId) return false;
      if (filter.status && record.status !== filter.status) return false;
      return true;
    });
  }

  private filterRefundCases(cases: RefundCase[], filter?: RefundFilter): RefundCase[] {
    if (!filter) {
      return cases;
    }

    return cases.filter((refund) => {
      if (filter.status && refund.status !== filter.status) return false;
      if (filter.vendorId && refund.vendorId !== filter.vendorId) return false;
      if (filter.entityType === 'vendor' && filter.entityId && refund.vendorId !== filter.entityId) return false;
      if (filter.entityType === 'driver' && filter.entityId && refund.driverId !== filter.entityId) return false;
      if (filter.entityType === 'order' && filter.orderId && refund.orderId !== filter.orderId) return false;
      if (!filter.entityType && filter.entityId && refund.vendorId !== filter.entityId && refund.driverId !== filter.entityId) return false;
      if (filter.orderId && refund.orderId !== filter.orderId) return false;
      if (filter.minAmount !== undefined && refund.requestedAmount < filter.minAmount) return false;
      if (filter.responsibleParty && refund.responsibleParty !== filter.responsibleParty) return false;
      if (filter.dateFrom && refund.createdAt < filter.dateFrom) return false;
      if (filter.dateTo && refund.createdAt > filter.dateTo) return false;
      return true;
    });
  }

  private filterAuditEntries(entries: AuditLogEntry[], filter?: AuditLogFilter): AuditLogEntry[] {
    if (!filter) {
      return this.clone(entries);
    }

    return entries.filter((entry) => {
      if (filter.entityType && entry.entityType !== filter.entityType) return false;
      if (filter.entityId && entry.entityId !== filter.entityId) return false;
      if (filter.orderId && entry.orderId !== filter.orderId) return false;
      if (filter.actionCategory && entry.actionCategory !== filter.actionCategory) return false;
      return true;
    });
  }

  private buildInitialAdjustments(): FinancialAdjustment[] {
    return [];
  }

  private buildInitialAuditLog(): AuditLogEntry[] {
    return [];
  }

  private withBalances(entries: LedgerEntry[]): LedgerEntry[] {
    const balances = new Map<string, number>();

    const withBalance = [...entries]
      .sort((left, right) => left.timestamp.localeCompare(right.timestamp))
      .map((entry) => {
        const key = `${entry.entityType}:${entry.entityId}`;
        const current = balances.get(key) ?? 0;
        const nextBalance = this.round(current + (entry.direction === 'credit' ? entry.amount : -entry.amount));
        balances.set(key, nextBalance);
        return { ...entry, balanceAfter: nextBalance };
      });

    return withBalance.sort((left, right) => right.timestamp.localeCompare(left.timestamp));
  }

  private buildRefundTimeline(refund: RefundCase): RefundCase['timeline'] {
    const timeline: RefundCase['timeline'] = [
      {
        id: `${refund.id}-open`,
        status: 'open',
        note: 'FINANCES.REFUNDS.NOTES.CUSTOMER_SUBMITTED_REQUEST',
        timestamp: refund.createdAt
      }
    ];

    if (refund.status === 'under_review' || refund.status === 'escalated' || refund.status === 'approved' || refund.status === 'rejected') {
      timeline.push({
        id: `${refund.id}-review`,
        status: refund.status === 'escalated' ? 'under_review' : refund.status,
        note: refund.status === 'escalated'
          ? 'FINANCES.REFUNDS.NOTES.ESCALATED_TO_FINANCE_REVIEW'
          : 'FINANCES.REFUNDS.NOTES.AWAITING_ADMIN_ASSIGNMENT',
        timestamp: refund.updatedAt
      });
    }

    if (refund.status === 'approved') {
      timeline.push({
        id: `${refund.id}-approved`,
        status: 'approved',
        note: refund.adminNote || 'FINANCES.REFUNDS.NOTES.FULL_REFUND_VENDOR_AT_FAULT',
        timestamp: refund.updatedAt
      });
    }

    if (refund.status === 'rejected') {
      timeline.push({
        id: `${refund.id}-rejected`,
        status: 'rejected',
        note: refund.adminNote || 'FINANCES.REFUNDS.NOTES.INSUFFICIENT_EVIDENCE',
        timestamp: refund.updatedAt
      });
    }

    return timeline;
  }

  private deriveRefundStatus(order: OrderDetail, index: number): RefundStatus {
    const override = this.refundOverrides.get(`refund-${order.id}`);
    if (override) {
      return override.status;
    }

    if (order.paymentStatus === 'REFUNDED') {
      return 'approved';
    }

    if (order.paymentStatus === 'PARTIALLY_REFUNDED') {
      return index % 3 === 0 ? 'under_review' : 'approved';
    }

    if (order.paymentStatus === 'FAILED') {
      return 'escalated';
    }

    if (order.operationalCase?.type === 'REFUND') {
      return 'under_review';
    }

    return index % 4 === 0 ? 'open' : 'under_review';
  }

  private deriveResponsibleParty(order: OrderDetail, index: number): RefundCase['responsibleParty'] {
    if (order.cancellationSummary?.costBearer === 'merchant') {
      return 'vendor';
    }

    if (order.paymentStatus === 'FAILED') {
      return 'platform';
    }

    if (order.isLate || order.fulfillmentStatus === 'FAILED') {
      return 'driver';
    }

    return index % 2 === 0 ? 'vendor' : 'platform';
  }

  private getRefundReasonKey(order: OrderDetail, index: number): string {
    if (order.paymentStatus === 'FAILED') {
      return 'FINANCES.REFUNDS.REASONS.DUPLICATE_CHARGE';
    }

    if (order.isLate || order.fulfillmentStatus === 'FAILED') {
      return 'FINANCES.REFUNDS.REASONS.ORDER_NEVER_ARRIVED';
    }

    if (order.cancellationReason) {
      return 'FINANCES.REFUNDS.REASONS.ITEM_QUALITY_ISSUE';
    }

    return index % 2 === 0
      ? 'FINANCES.REFUNDS.REASONS.WRONG_ITEM_DELIVERED'
      : 'FINANCES.REFUNDS.REASONS.DAMAGED_PRODUCTS';
  }

  private getRefundImpact(requestedAmount: number, approvedAmount: number | undefined, status: RefundStatus): number {
    if (status === 'approved') {
      return this.round(-(approvedAmount ?? requestedAmount));
    }

    return this.round(-requestedAmount);
  }

  private getRefundDeductionForVendor(refund: RefundCase): number {
    return refund.responsibleParty === 'vendor' && refund.status === 'approved'
      ? this.round(refund.approvedAmount ?? refund.requestedAmount)
      : 0;
  }

  private getCodDeltaForOrder(order: OrderDetail): number {
    if (!this.isCodOrder(order)) {
      return 0;
    }

    const numericId = Number(order.id.replace(/\D+/g, '')) || 0;
    const exposure = numericId % 5;
    if (exposure === 0) {
      return this.round(-Math.min(order.total * 0.12, 24));
    }
    if (exposure === 1) {
      return this.round(-Math.min(order.total * 0.05, 10));
    }
    return 0;
  }

  private getEstimatedDistanceKm(order: OrderDetail): number {
    const numericId = Number(order.id.replace(/\D+/g, '')) || 0;
    const baseDistance = 2.5 + (numericId % 6);
    const surcharge = order.isLate ? 1.2 : 0;
    return this.round(baseDistance + surcharge, 1);
  }

  private getZoneBonusAmount(order: OrderDetail, rule: DriverCompensationRule): number {
    const normalizedDistrict = this.normalizeText(order.district || order.city || '');
    return /airport|industrial|north|south|east|west|جنوب|شمال|شرق|غرب/.test(normalizedDistrict)
      ? this.round(rule.zoneBonus)
      : 0;
  }

  private isPeakOrder(order: OrderDetail): boolean {
    const normalized = this.normalizeText(`${order.expectedDeliveryWindow} ${order.time}`);
    return normalized.includes('12') || normalized.includes('13') || normalized.includes('14');
  }

  private isCodOrder(order: OrderDetail): boolean {
    const numericId = Number(order.id.replace(/\D+/g, '')) || 0;
    const paymentLabel = this.normalizeText(order.paymentMethodLabel || '');
    return paymentLabel.includes('cod')
      || paymentLabel.includes('cash')
      || paymentLabel.includes('نقد')
      || order.paymentStatus === 'COD_PENDING'
      || numericId % 4 === 0;
  }

  private findVendorByName(name: string, vendors = this.vendorService.getVendorsSnapshot()): VendorDetail | undefined {
    const normalizedTarget = this.normalizeText(name)
      .replace(/hyper|hypermarket|market|markets|هايبر|ماركت/g, '')
      .replace(/\s+/g, '');

    return vendors.find((vendor) => {
      const normalizedArabic = this.normalizeText(vendor.businessNameAr)
        .replace(/هايبر|ماركت/g, '')
        .replace(/\s+/g, '');
      const normalizedEnglish = this.normalizeText(vendor.businessNameEn)
        .replace(/hyper|hypermarket|market|markets/g, '')
        .replace(/\s+/g, '');

      return normalizedArabic.includes(normalizedTarget)
        || normalizedTarget.includes(normalizedArabic)
        || normalizedEnglish.includes(normalizedTarget)
        || normalizedTarget.includes(normalizedEnglish);
    });
  }

  private findDriverForOrder(order: OrderDetail, directory: FinanceDriverDirectory): Driver | undefined {
    const explicitDriverId = order.driverCandidates[0]?.id?.replace(/\D+/g, '');
    const explicitDriver = explicitDriverId ? directory.byId.get(explicitDriverId) : undefined;
    if (explicitDriver) {
      return explicitDriver;
    }

    const normalizedPhone = this.normalizePhone(order.driverPhone && order.driverPhone !== '--'
      ? order.driverPhone
      : order.driverCandidates[0]?.phone);
    if (normalizedPhone && directory.byPhone.has(normalizedPhone)) {
      return directory.byPhone.get(normalizedPhone);
    }

    const normalizedName = this.normalizeText(order.driverName && order.driverName !== '--'
      ? order.driverName
      : order.driverCandidates[0]?.name ?? '');
    if (normalizedName && directory.byName.has(normalizedName)) {
      return directory.byName.get(normalizedName);
    }

    return this.driverService.findDriverByIdentity({
      fullName: order.driverName && order.driverName !== '--' ? order.driverName : order.driverCandidates[0]?.name ?? null,
      phoneNumber: order.driverPhone && order.driverPhone !== '--' ? order.driverPhone : order.driverCandidates[0]?.phone ?? null
    });
  }

  private getDriverDirectory(): FinanceDriverDirectory {
    if (this.driverDirectory) {
      return this.driverDirectory;
    }

    const drivers = this.driverService.getDriversSnapshot();
    const byId = new Map<string, Driver>();
    const byPhone = new Map<string, Driver>();
    const byName = new Map<string, Driver>();

    drivers.forEach((driver) => {
      byId.set(driver.id, driver);
      byId.set(driver.driverId, driver);

      const normalizedPhone = this.normalizePhone(driver.phoneNumber);
      if (normalizedPhone) {
        byPhone.set(normalizedPhone, driver);
      }

      const normalizedName = this.normalizeText(`${driver.firstName} ${driver.lastName}`);
      if (normalizedName) {
        byName.set(normalizedName, driver);
      }
    });

    this.driverDirectory = { list: drivers, byId, byPhone, byName };
    return this.driverDirectory;
  }

  private invalidateFinanceCaches(): void {
    this.orderContextsCache = null;
  }

  private buildEmptyDashboardSnapshot(period: FinancePeriod): FinanceDashboardSnapshot {
    const collectionTrend = [
      { label: 'Jan', value: 0, secondaryValue: 0 },
      { label: 'Feb', value: 0, secondaryValue: 0 },
      { label: 'Mar', value: 0, secondaryValue: 0 }
    ];
    const revenueTrend = collectionTrend.map(({ label }) => ({ label, value: 0 }));

    return {
      period,
      grossCollections: this.buildKpi('gross_collections', 'FINANCES.KPI.GROSS_COLLECTIONS', 0, 'SAR', 'flat', 0, 'FINANCES.KPI.VS_LAST_MONTH', 'neutral', 'trending_up', '/finances/ledger'),
      platformNetRevenue: this.buildKpi('platform_net_revenue', 'FINANCES.KPI.PLATFORM_NET_REVENUE', 0, 'SAR', 'flat', 0, undefined, 'neutral', 'account_balance_wallet', '/finances/overview'),
      commissionRevenue: this.buildKpi('commission_revenue', 'FINANCES.KPI.COMMISSION_REVENUE', 0, 'SAR', 'flat', 0, undefined, 'neutral', 'store', '/finances/settlements?entityType=vendor'),
      deliveryRevenue: this.buildKpi('delivery_revenue', 'FINANCES.KPI.DELIVERY_REVENUE', 0, 'SAR', 'flat', 0, undefined, 'neutral', 'local_shipping', '/finances/overview'),
      codFeesCollected: this.buildKpi('cod_fees_collected', 'FINANCES.KPI.COD_FEES_COLLECTED', 0, 'SAR', 'flat', 0, undefined, 'neutral', 'payments', '/finances/cod'),
      vatCollected: this.buildKpi('vat_collected', 'FINANCES.KPI.VAT_COLLECTED', 0, 'SAR', 'flat', 0, undefined, 'neutral', 'receipt', '/finances/ledger'),
      driverPayouts: this.buildKpi('driver_payouts', 'FINANCES.KPI.DRIVER_PAYOUTS', 0, 'SAR', 'flat', 0, undefined, 'neutral', 'local_shipping', '/finances/settlements?entityType=driver'),
      refundExposure: this.buildKpi('refund_exposure', 'FINANCES.KPI.REFUND_EXPOSURE', 0, 'SAR', 'flat', 0, undefined, 'neutral', 'undo', '/finances/refunds'),
      revenueComposition: [
        { id: 'commissions', labelKey: 'FINANCES.COMPOSITION.COMMISSIONS', amount: 0, percent: 0, color: '#127C8C' },
        { id: 'delivery_fees', labelKey: 'FINANCES.COMPOSITION.DELIVERY_FEES', amount: 0, percent: 0, color: '#1FA3B5' },
        { id: 'service_fees', labelKey: 'FINANCES.COMPOSITION.SERVICE_FEES', amount: 0, percent: 0, color: '#e48215' },
        { id: 'cod_fees', labelKey: 'FINANCES.COMPOSITION.COD_FEES', amount: 0, percent: 0, color: '#f59e0b' },
        { id: 'vat', labelKey: 'FINANCES.COMPOSITION.VAT', amount: 0, percent: 0, color: '#94a3b8' }
      ],
      collectionTrend,
      revenueTrend,
      alerts: []
    };
  }

  private buildSparkline(seed: number, points: number, variance: number): number[] {
    return Array.from({ length: points }, (_, index) => {
      const drift = (index - ((points - 1) / 2)) * (variance * 0.16);
      const wave = Math.sin(index * 0.9) * variance;
      return this.round(Math.max(0, seed + drift + wave));
    });
  }

  private maskIban(seed: string): string {
    const digits = seed.replace(/\D+/g, '').padStart(8, '0');
    return `SA** **** **** ${digits.slice(-4)}`;
  }

  private sequenceDate(sequence: number, dayOffset = 0): string {
    const month = Math.min(2, Math.floor(sequence / 2));
    const day = Math.min(28, 3 + ((sequence * 3 + dayOffset) % 25));
    const hour = 8 + (sequence % 9);
    const minute = (sequence % 4) * 15;
    return new Date(Date.UTC(2026, month, day, hour, minute, 0)).toISOString();
  }

  private normalizeText(value: string): string {
    return (value || '')
      .toLowerCase()
      .replace(/[\u064B-\u065F]/g, '')
      .replace(/[#*'".,()/\\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizePhone(value: string | null | undefined): string {
    return (value || '').replace(/\D+/g, '');
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private sum(values: number[]): number {
    return values.reduce((accumulator, value) => accumulator + value, 0);
  }

  private round(value: number, digits = 2): number {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  private mergeZoneWithPricingRule(
    zone: ZoneFinanceSettings,
    rule?: DeliveryPricingRuleApiModel | null
  ): ZoneFinanceSettings {
    return {
      ...zone,
      pricingRuleId: rule?.id ?? null,
      baseDeliveryFee: rule?.baseFee ?? zone.baseDeliveryFee ?? 0,
      includedKm: rule?.includedKm ?? zone.includedKm ?? 0,
      extraKmFee: rule?.perKmFee ?? zone.extraKmFee ?? 0,
      minDeliveryFee: rule?.minFee ?? zone.minDeliveryFee ?? 0,
      maxDeliveryFee: rule?.maxFee ?? zone.maxDeliveryFee ?? 0,
      isPricingActive: rule?.isActive ?? zone.isPricingActive ?? false,
      codFeeType: this.normalizeCodFeeType(zone.codFeeType)
    };
  }

  private buildZoneFinanceSettingsFromDeliveryZone(zone: DeliveryZoneApiModel): ZoneFinanceSettings {
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      city: zone.city,
      pricingRuleId: null,
      baseDeliveryFee: 0,
      includedKm: 0,
      extraKmFee: 0,
      minDeliveryFee: 0,
      maxDeliveryFee: 0,
      isPricingActive: zone.isActive,
      vatPercent: 15,
      codFeeType: 'flat',
      codFlatFee: 10,
      codPercent: 0,
      isVatActive: true,
      isCodFeeActive: true
    };
  }

  private normalizeZonePricingSettingsForSave(
    zoneId: string,
    settings: Partial<ZoneFinanceSettings>
  ): ZoneFinanceSettings {
    const zoneName = settings.zoneName?.trim() || 'Zone pricing';
    const city = settings.city?.trim() || 'Unknown city';

    return {
      zoneId,
      zoneName,
      city,
      pricingRuleId: settings.pricingRuleId ?? null,
      baseDeliveryFee: this.round(Math.max(0, Number(settings.baseDeliveryFee ?? 0))),
      includedKm: this.round(Math.max(0, Number(settings.includedKm ?? 0))),
      extraKmFee: this.round(Math.max(0, Number(settings.extraKmFee ?? 0))),
      minDeliveryFee: this.round(Math.max(0, Number(settings.minDeliveryFee ?? 0))),
      maxDeliveryFee: this.round(Math.max(0, Number(settings.maxDeliveryFee ?? 0))),
      isPricingActive: Boolean(settings.isPricingActive),
      vatPercent: this.round(Math.max(0, Number(settings.vatPercent ?? 0))),
      codFeeType: this.normalizeCodFeeType(settings.codFeeType),
      codFlatFee: this.round(Math.max(0, Number(settings.codFlatFee ?? 0))),
      codPercent: this.round(Math.max(0, Number(settings.codPercent ?? 0))),
      isVatActive: Boolean(settings.isVatActive),
      isCodFeeActive: Boolean(settings.isCodFeeActive)
    };
  }

  private normalizeCodFeeType(value: string | undefined): 'flat' | 'percent' {
    return value?.toLowerCase() === 'percent' ? 'percent' : 'flat';
  }

  private isGuid(value: string | null | undefined): boolean {
    if (!value) {
      return false;
    }

    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  private buildDeliveryRulePayload(zone: ZoneFinanceSettings): UpsertDeliveryPricingRulePayload {
    return {
      deliveryZoneId: zone.zoneId,
      city: zone.city,
      name: `${zone.city} - ${zone.zoneName}`,
      baseFee: zone.baseDeliveryFee,
      includedKm: zone.includedKm,
      perKmFee: zone.extraKmFee,
      minFee: zone.minDeliveryFee,
      maxFee: zone.maxDeliveryFee,
      isActive: zone.isPricingActive,
      surgeWindows: []
    };
  }

  private get vendorService(): VendorService {
    this.vendorServiceInstance ??= this.injector.get(VendorService);
    return this.vendorServiceInstance;
  }

  private get driverService(): DriverService {
    this.driverServiceInstance ??= this.injector.get(DriverService);
    return this.driverServiceInstance;
  }

  private get ordersService(): OrdersService {
    this.ordersServiceInstance ??= this.injector.get(OrdersService);
    return this.ordersServiceInstance;
  }
}
