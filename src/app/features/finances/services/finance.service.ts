import { Injectable, Injector, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DriverService } from '@drivers/public-api';
import { VendorService } from '@vendors/public-api';
import {
 AuditLogEntry,
 AuditLogFilter,
 AdjustmentDirection,
 CodFilter,
 CodRecord,
 CodReconciliationSummary,
 VendorCodRecord,
 CityDeliveryPricingSettings,
 DeliveryPricingDefaults,
 DriverFinanceProfile,
 EntityType,
 FinanceCurrency,
 FinanceDashboardSnapshot,
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
 SettlementsPage,
 SettlementStatus,
 VendorFinanceProfile,
 ZoneFinanceSettings
} from '../models/finance.models';

interface RefundOverride {
 status: RefundStatus;
 note: string;
 updatedAt: string;
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
 ownerName?: string | null;
 debitAmount: number;
 creditAmount: number;
 currencyCode: string;
 orderId: string | null;
 settlementId: string | null;
 payoutId: string | null;
 memo: string | null;
}

interface AdminFinancialAdjustmentApiModel {
 id: string;
 ownerType: string;
 ownerId: string;
 ownerName: string | null;
 amount: number;
 direction: string;
 description: string | null;
 createdAtUtc: string;
}

interface AdminFinancialAdjustmentListApiModel {
 items: AdminFinancialAdjustmentApiModel[];
 page: number;
 pageSize: number;
 totalCount: number;
}

interface AdminFinanceRefundCaseApiModel {
 id: string;
 orderId: string | null;
 orderRef: string | null;
 vendorId: string | null;
 vendorName: string;
 driverId: string | null;
 driverName: string | null;
 requestedAmount: number;
 approvedAmount: number;
 status: string;
 createdAt: string;
 reason: string | null;
}

interface AdminFinanceRefundCaseListApiModel {
 items: AdminFinanceRefundCaseApiModel[];
 page: number;
 pageSize: number;
 totalCount: number;
}

interface AdminFinanceStatementSummaryApiModel {
 revenue: number;
 expenses: number;
 vatPayable: number;
 netIncome: number;
 periodLabel: string;
}

interface AdminVendorFinanceSummaryApiModel {
 availableBalance: number;
 pendingSettlement: number;
 holdAmount: number;
 totalPaidOut: number;
 pendingOrdersNet: number;
 pendingOrdersGross: number;
 pendingOrdersCommission: number;
 pendingOrdersCount: number;
 failedPayoutsCount: number;
 totalSettlementsCount: number;
 directSettlementsCount: number;
 batchSettlementsCount: number;
 totalPayoutsCount: number;
 latestPayoutAtUtc: string | null;
 latestPayoutNumber: string | null;
 latestPayoutAmount: number | null;
 latestPayoutStatus: string | null;
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
 createdAtUtc: string;
 processedAtUtc?: string | null;
 itemCount: number;
}

interface AdminOrderFinancialBreakdownApiModel {
 orderId: string;
 orderRef: string;
 subtotal: number;
 discounts: number;
 couponDiscount: number;
 deliveryFee: number;
 serviceFee: number;
 codFee: number;
 vat: number;
 total: number;
 vendorEarnings: number;
 vendorCommission: number;
 driverPayout: number;
 platformRevenue: number;
 netMargin: number;
 marginPercent: number;
 fulfillmentType?: string | null;
 FulfillmentType?: string | null;
}

interface AdminManualPayoutConfirmationApiModel {
  id: string;
  transferReference: string;
  proofAttachmentId: string | null;
  hasLegacyProof: boolean;
  confirmedByUserId: string;
  confirmedAtUtc: string;
}

interface AdminPayoutExecutionReservationApiModel {
  id: string;
  mode: string;
  status: string;
  claimedByUserId: string | null;
  claimedAtUtc: string;
  submittedByUserId: string | null;
  submittedAtUtc: string | null;
  submissionReference: string | null;
  releasedByUserId: string | null;
  releasedAtUtc: string | null;
  releaseReason: string | null;
}

interface AdminPayoutProofAttachmentApiModel {
  id: string;
  payoutId: string;
  kind: string;
  fileName: string;
  contentType: string;
  contentLength: number;
  sha256: string;
  uploadedByUserId: string;
  uploadedAtUtc: string;
  isFinalized: boolean;
  finalizedByUserId: string | null;
  finalizedAtUtc: string | null;
}

interface AdminPayoutWorkflowApiModel {
  id: string;
  status: string;
  executionReservation: AdminPayoutExecutionReservationApiModel | null;
}

interface AdminSettlementPayoutApiModel {
  id: string;
  amount: number;
  status: string;
  providerTransferId?: string | null;
  transferReference?: string | null;
  manualConfirmation?: AdminManualPayoutConfirmationApiModel | null;
  executionReservation?: AdminPayoutExecutionReservationApiModel | null;
  destinationMaskedLabel?: string | null;
  scheduledPayoutDay?: string | null;
}

interface AdminSettlementDetailApiModel {
  settlement: AdminSettlementApiModel;
  payouts: AdminSettlementPayoutApiModel[];
  settlementProcessingMode: 'Manual' | 'Automatic';
}

interface AdminConfirmManualPayoutRequest {
  transferReference: string;
  proofAttachmentId: string;
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

interface AdminVendorCodReconciliationApiModel {
 items: Array<{
 vendorId: string;
 vendorName: string;
 codOwedBalance: number;
 lastJournalSequence: number;
 }>;
 totalCodOwedBalance: number;
}

interface AdminCodRemittanceResultApiModel {
 financialEventId: string;
 journalEntryId: string;
 sequenceNumber: number;
 wasAlreadyPosted: boolean;
}

interface AdminFinanceAuditLogApiModel {
 items: AdminFinanceAuditLogEntryApiModel[];
 totalCount: number;
}

interface AdminFinanceAuditLogEntryApiModel {
 id: string;
 timestampUtc: string;
 adminId: string;
 adminName: string;
 adminRole: string;
 action: string;
 actionCategory: string;
 entityType: string;
 entityId?: string | null;
 orderId?: string | null;
 entityName?: string | null;
 before?: Record<string, unknown> | null;
 after?: Record<string, unknown> | null;
 ipAddress?: string | null;
 sessionId?: string | null;
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
 private vendorServiceInstance: VendorService | null = null;
 private driverServiceInstance: DriverService | null = null;

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
 });
 }

 getLedgerEntries(filter?: LedgerFilter): Observable<LedgerEntry[]> {
 const resolved = this.resolveLedgerFilter(filter);
 let params = new HttpParams().set('page', '1').set('pageSize', '500');

 if (resolved?.orderId) {
 params = params.set('orderId', resolved.orderId);
 }
 if (resolved?.entityId && resolved.entityType === 'vendor') {
 params = params.set('ownerType', 'Vendor').set('ownerId', resolved.entityId);
 } else if (resolved?.entityId && resolved.entityType === 'driver') {
 params = params.set('ownerType', 'Driver').set('ownerId', resolved.entityId);
 } else if (resolved?.entityType === 'vendor') {
 params = params.set('ownerType', 'Vendor');
 } else if (resolved?.entityType === 'driver') {
 params = params.set('ownerType', 'Driver');
 } else if (resolved?.entityType === 'platform') {
 params = params.set('ownerType', 'Platform');
 }
 if (resolved?.search?.trim()) {
 params = params.set('search', resolved.search.trim());
 }
 if (resolved?.dateFrom) {
 params = params.set('dateFrom', resolved.dateFrom);
 }
 if (resolved?.dateTo) {
 params = params.set('dateTo', resolved.dateTo);
 }

 return this.http.get<AdminLedgerEntryListApiModel>(`${this.apiUrl}/ledger`, { params }).pipe(
 map((response) => this.filterLedgerEntries(this.mapLedgerEntries(response.items), resolved))
 );
 }

 exportLedger(filter?: {
 orderId?: string;
 settlementId?: string;
 payoutId?: string;
 }): Observable<Blob> {
 let params = new HttpParams();

 if (filter?.orderId) {
 params = params.set('orderId', filter.orderId);
 }
 if (filter?.settlementId) {
 params = params.set('settlementId', filter.settlementId);
 }
 if (filter?.payoutId) {
 params = params.set('payoutId', filter.payoutId);
 }

 return this.http.get(`${this.apiUrl}/ledger/export`, { params, responseType: 'blob' });
 }

 exportSettlementStatement(id: string): Observable<Blob> {
 return this.http.get(`${this.settlementsApiUrl}/${id}/statement`, { responseType: 'blob' });
 }

 exportFinanceReport(
 title?: string,
 route?: string,
 summary?: string,
 period: FinancePeriod = 'month'
 ): Observable<Blob> {
 let params = new HttpParams();

 if (title?.trim()) {
 params = params.set('title', title.trim());
 }
 if (route?.trim()) {
 params = params.set('route', route.trim());
 }
 if (summary?.trim()) {
 params = params.set('summary', summary.trim());
 }
 if (period) {
 params = params.set('period', period);
 }

 return this.http.get(`${this.apiUrl}/report`, { params, responseType: 'blob' });
 }

 getSettlements(filter?: SettlementFilter): Observable<SettlementsPage> {
 const page = Math.max(1, filter?.page ?? 1);
 const pageSize = Math.min(200, Math.max(1, filter?.pageSize ?? 200));
 let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));

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
 map((response) => ({
 items: this.filterSettlements(response.items.map((item) => this.mapSettlement(item)), filter),
 totalCount: response.totalCount,
 page: response.page,
 pageSize: response.pageSize
 }))
 );
 }

 getSettlement(settlementId: string): Observable<Settlement> {
 return this.http.get<AdminSettlementDetailApiModel>(`${this.settlementsApiUrl}/${settlementId}`).pipe(
 map((detail) => this.mapSettlementDetail(detail))
 );
 }

 getCodRecords(filter?: CodFilter): Observable<{ summary: CodReconciliationSummary; records: CodRecord[] }> {
 return this.http.get<AdminCodReconciliationApiModel>(`${this.apiUrl}/cod-reconciliation`).pipe(
 map((response) => {
 const records = this.filterCodRecords(this.mapCodRecords(response), filter);
 const totalOutstanding = this.round(response.totalCodOwed);
 const summary: CodReconciliationSummary = {
 totalExpected: totalOutstanding,
 totalCollected: 0,
 totalDelta: this.round(-totalOutstanding),
 overdueCases: records.filter((record) => record.status === 'overdue').length,
 pendingCases: records.filter((record) => record.status === 'pending').length
 };

 return { summary, records };
 })
 );
 }

 createCodRemittance(payload: {
 driverId: string;
 amount: number;
 reference?: string;
 idempotencyKey?: string;
 }): Observable<AdminCodRemittanceResultApiModel> {
 return this.http.post<AdminCodRemittanceResultApiModel>(`${this.apiUrl}/cod-remittances`, {
 driverId: payload.driverId,
 amount: payload.amount,
 reference: payload.reference ?? null,
 idempotencyKey: payload.idempotencyKey ?? null,
 platformOwnerId: null
 });
 }

 getVendorCodRecords(vendorId?: string): Observable<{ summary: CodReconciliationSummary; records: VendorCodRecord[] }> {
 return this.http.get<AdminVendorCodReconciliationApiModel>(`${this.apiUrl}/vendor-cod-reconciliation`).pipe(
 map((response) => {
 const records = this.mapVendorCodRecords(response).filter((record) =>
 !vendorId || record.vendorId === vendorId
 );
 const totalOutstanding = this.round(
 vendorId
 ? records.reduce((sum, record) => sum + record.expectedAmount, 0)
 : response.totalCodOwedBalance
 );
 const summary: CodReconciliationSummary = {
 totalExpected: totalOutstanding,
 totalCollected: 0,
 totalDelta: this.round(-totalOutstanding),
 overdueCases: records.filter((record) => record.status === 'overdue').length,
 pendingCases: records.filter((record) => record.status === 'pending').length
 };

 return { summary, records };
 })
 );
 }

 createVendorCodRemittance(payload: {
 vendorId: string;
 amount: number;
 reference?: string;
 idempotencyKey?: string;
 }): Observable<AdminCodRemittanceResultApiModel> {
 return this.http.post<AdminCodRemittanceResultApiModel>(`${this.apiUrl}/vendor-cod-remittances`, {
 vendorId: payload.vendorId,
 amount: payload.amount,
 reference: payload.reference ?? null,
 idempotencyKey: payload.idempotencyKey ?? null,
 platformOwnerId: null
 });
 }

 approveSettlement(settlementId: string): Observable<Settlement> {
 return this.http.post<AdminSettlementDetailApiModel>(
 `${this.settlementsApiUrl}/${settlementId}/approve`,
 { resolutionType: 'BankPayout', triggerPayout: true }
 ).pipe(map((detail) => this.mapSettlementDetail(detail)));
 }

 confirmManualPayout(payoutId: string, payload: AdminConfirmManualPayoutRequest): Observable<void> {
  return this.http.post<void>(`${environment.apiUrl}/admin/payouts/${payoutId}/confirm-manual`, payload);
 }

 claimManualPayout(payoutId: string): Observable<AdminPayoutWorkflowApiModel> {
  return this.http.post<AdminPayoutWorkflowApiModel>(`${environment.apiUrl}/admin/payouts/${payoutId}/manual-claim`, {});
 }

 recordManualBankSubmission(payoutId: string, bankSubmissionReference: string): Observable<AdminPayoutWorkflowApiModel> {
  return this.http.post<AdminPayoutWorkflowApiModel>(
  `${environment.apiUrl}/admin/payouts/${payoutId}/manual-bank-submission`,
  { bankSubmissionReference }
  );
 }

 uploadManualPayoutProof(payoutId: string, file: File): Observable<AdminPayoutProofAttachmentApiModel> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kind', 'ManualTransfer');

  return this.http.post<AdminPayoutProofAttachmentApiModel>(
  `${environment.apiUrl}/admin/payouts/${payoutId}/proofs`,
  formData
  );
 }

 downloadManualPayoutProof(payoutId: string, attachmentId: string): Observable<Blob> {
  return this.http.get(`${environment.apiUrl}/admin/payouts/${payoutId}/proofs/${attachmentId}`, {
  responseType: 'blob'
  });
 }

 getRefundCases(filter?: RefundFilter): Observable<RefundCase[]> {
 let params = new HttpParams().set('page', '1').set('pageSize', '200');
 if (filter?.status) {
 params = params.set('status', this.toBackendRefundStatus(filter.status));
 }
 if (filter?.vendorId) {
 params = params.set('vendorId', filter.vendorId);
 }
 if (filter?.entityType === 'driver' && filter.entityId) {
 params = params.set('driverId', filter.entityId);
 }

 return this.http.get<AdminFinanceRefundCaseListApiModel>(`${this.apiUrl}/refunds`, { params }).pipe(
 map((response) => this.filterRefundCases(response.items.map((item) => this.mapRefundCase(item)), filter))
 );
 }

 getStatementSummary(period: FinancePeriod = 'month'): Observable<AdminFinanceStatementSummaryApiModel> {
 return this.http.get<AdminFinanceStatementSummaryApiModel>(`${this.apiUrl}/statements/summary`, {
 params: { period }
 });
 }

 updateRefundStatus(_caseId: string, _status: RefundStatus, _note: string): Observable<void> {
 return throwError(() => new Error('FINANCES.REFUNDS.ERRORS.USE_DISPUTES_WORKFLOW'));
 }

 private mapRefundCase(item: AdminFinanceRefundCaseApiModel): RefundCase {
 const status = this.toFrontendRefundStatus(item.status);
 const requestedAmount = this.round(item.requestedAmount);
 const approvedAmount = item.approvedAmount > 0 ? this.round(item.approvedAmount) : undefined;
 const createdAt = item.createdAt;
 const responsibleParty: EntityType = item.driverId ? 'driver' : 'vendor';

 return {
 id: item.id,
 caseRef: item.orderRef ? `RFD-${item.orderRef}` : `RFD-${item.id.slice(0, 8).toUpperCase()}`,
 orderId: item.orderId ?? '',
 orderRef: item.orderRef ?? '',
 customerId: '',
 customerName: '',
 driverId: item.driverId ?? undefined,
 driverName: item.driverName ?? undefined,
 vendorId: item.vendorId ?? '',
 vendorName: item.vendorName,
 requestedAmount,
 approvedAmount,
 reason: item.reason ?? '',
 status,
 financialImpact: this.getRefundImpact(requestedAmount, approvedAmount, status),
 responsibleParty,
 createdAt,
 updatedAt: createdAt,
 resolvedAt: status === 'approved' || status === 'rejected' ? createdAt : undefined,
 timeline: []
 };
 }

 private toBackendRefundStatus(status: RefundStatus): string {
 switch (status) {
 case 'open': return 'Submitted';
 case 'under_review': return 'InReview';
 case 'approved': return 'Approved';
 case 'rejected': return 'Rejected';
 case 'escalated': return 'InReview';
 default: return status;
 }
 }

 private toFrontendRefundStatus(status: string): RefundStatus {
 switch (status.toLowerCase()) {
 case 'submitted': return 'open';
 case 'inreview':
 case 'awaitingcustomerevidence': return 'under_review';
 case 'approved':
 case 'resolved': return 'approved';
 case 'rejected': return 'rejected';
 default: return 'under_review';
 }
 }

 getAdjustments(filter?: { ownerType?: EntityType; ownerId?: string }): Observable<FinancialAdjustment[]> {
 let params = new HttpParams().set('page', '1').set('pageSize', '200');
 if (filter?.ownerType === 'vendor') {
 params = params.set('ownerType', 'Vendor');
 } else if (filter?.ownerType === 'driver') {
 params = params.set('ownerType', 'Driver');
 }
 if (filter?.ownerId?.trim()) {
 params = params.set('ownerId', filter.ownerId.trim());
 }

 return this.http.get<AdminFinancialAdjustmentListApiModel>(`${this.apiUrl}/adjustments`, { params }).pipe(
 map((response) => response.items.map((item) => this.mapFinancialAdjustment(item)))
 );
 }

 createAdjustment(adj: Partial<FinancialAdjustment>): Observable<FinancialAdjustment> {
 const ownerType = adj.entityType === 'driver' ? 'driver' : 'vendor';
 const ownerId = adj.entityId?.trim();
 if (!ownerId) {
 return throwError(() => new Error('FINANCES.ADJUSTMENTS.ERRORS.OWNER_ID_REQUIRED'));
 }

 return this.http.post<AdminFinancialAdjustmentApiModel>(`${this.apiUrl}/adjustments`, {
 ownerType,
 ownerId,
 amount: adj.amount ?? 0,
 direction: adj.direction ?? 'credit',
 reason: adj.reason ?? '',
 category: adj.category ?? 'other'
 }).pipe(map((item) => this.mapFinancialAdjustment(item)));
 }

 private mapFinancialAdjustment(item: AdminFinancialAdjustmentApiModel): FinancialAdjustment {
 const direction: AdjustmentDirection = item.direction?.toUpperCase() === 'OUT' ? 'debit' : 'credit';
 const entityType: EntityType = item.ownerType?.toLowerCase() === 'driver' ? 'driver' : 'vendor';

 return {
 id: item.id,
 adjustmentRef: `ADJ-${item.id.slice(0, 8).toUpperCase()}`,
 entityType,
 entityId: item.ownerId,
 entityName: item.ownerName ?? this.formatOwnerName(item.ownerType, item.ownerId),
 direction,
 amount: this.round(item.amount),
 currency: 'SAR',
 reason: item.description ?? '',
 category: 'other',
 adminId: 'finance-system',
 adminName: 'FINANCES.AUDIT.ADMINS.FINANCE_SYSTEM',
 createdAt: item.createdAtUtc,
 status: 'approved',
 approvedAt: item.createdAtUtc,
 approvedBy: 'FINANCES.AUDIT.ADMINS.FINANCE_SYSTEM'
 };
 }

 getAuditLog(filter?: AuditLogFilter): Observable<AuditLogEntry[]> {
 let params = new HttpParams().set('page', '1').set('pageSize', '200');
 if (filter?.entityType) {
 params = params.set('entityType', filter.entityType);
 }
 if (filter?.entityId) {
 params = params.set('entityId', filter.entityId);
 }
 if (filter?.orderId) {
 params = params.set('orderId', filter.orderId);
 }
 if (filter?.actionCategory) {
 params = params.set('actionCategory', filter.actionCategory);
 }

 return this.http.get<AdminFinanceAuditLogApiModel>(`${this.apiUrl}/audit-log`, { params }).pipe(
 map((response) => this.filterAuditEntries(response.items.map((item) => this.mapAuditLogEntry(item)), filter))
 );
 }

 getPricingRules(): Observable<PricingRuleSet> {
 return of(this.clone(this.pricingRulesStore));
 }

 savePricingRules(rules: PricingRuleSet): Observable<PricingRuleSet> {
 const updatedAt = new Date().toISOString();
 const previousRules = this.clone(this.pricingRulesStore);
 this.pricingRulesStore = {...this.clone(rules),
 lastUpdatedAt: updatedAt,
 lastUpdatedBy: 'FINANCES.ADMINS.SUPER_ADMIN'
 };

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

 // Backend pricing-settings already includes operational delivery zones.
 // Only fall back to the raw delivery-zones list when that endpoint fails.
 if (!financeSettings) {
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
 }

 return Array.from(zonesById.values())
 .filter((zone) => !zone.regionCode || zone.regionCode.toUpperCase() === 'EASTERN')
 .sort((left, right) =>
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
 return forkJoin({
 summary: this.http.get<AdminVendorFinanceSummaryApiModel>(`${environment.apiUrl}/admin/vendors/${vendorId}/finance-summary`),
 settlements: this.getSettlements({ entityType: 'vendor', entityId: vendorId }),
 refunds: this.getRefundCases({ vendorId })
 }).pipe(
 map(({ summary, settlements: settlementsPage, refunds }) => {
 const settlements = settlementsPage.items;
 const paidSettlements = settlements.filter((settlement) => settlement.status === 'paid' || settlement.status === 'settled');
 const totalRefunds = this.sum(refunds.filter((refund) => refund.status === 'approved').map((refund) => refund.approvedAmount ?? refund.requestedAmount));
 const totalSales = this.round(summary.pendingOrdersGross + summary.totalPaidOut);
 const totalCommissions = this.round(summary.pendingOrdersCommission);
 const lastSettlement = [...paidSettlements].sort((left, right) => (right.paidAt ?? '').localeCompare(left.paidAt ?? ''))[0];
 const bank = vendor?.primaryBankAccount;

 return {
 vendorId,
 vendorName: vendor?.businessNameAr ?? vendor?.businessNameEn ?? 'Vendor',
 commissionRate: vendor?.commissionRate ?? this.pricingRulesStore.vendorCommission.defaultPercent,
 commissionOverride: vendor?.commissionRate ?? undefined,
 totalSales,
 netSales: this.round(summary.availableBalance + summary.pendingSettlement),
 totalCommissions,
 availableBalance: this.round(summary.availableBalance),
 pendingBalance: this.round(summary.pendingSettlement + summary.holdAmount),
 lastPaymentAmount: this.round(summary.latestPayoutAmount ?? lastSettlement?.netAmount ?? 0),
 lastPaymentDate: summary.latestPayoutAtUtc ?? lastSettlement?.paidAt ?? '',
 financialSummary: {
 sales: totalSales,
 returns: this.round(-totalRefunds),
 discounts: 0,
 commissions: this.round(-totalCommissions),
 netTotal: this.round(summary.availableBalance)
 },
 bankInfo: {
 bankName: bank?.bankName?.trim() || '—',
 iban: bank?.iban?.trim() || '—',
 paymentCycle: 'VENDOR_FINANCE.WEEKLY_CYCLE'
 },
 settlements,
 refundExposure: this.round(this.sum(refunds.filter((refund) => refund.status !== 'approved' && refund.status !== 'rejected').map((refund) => refund.requestedAmount))),
 disputeCount: refunds.filter((refund) => refund.status === 'under_review' || refund.status === 'escalated').length,
 sparklineSales: []
 };
 })
 );
 }

 getDriverFinanceProfile(driverId: string): Observable<DriverFinanceProfile> {
 const driver = this.driverService.getDriverSnapshotById(driverId);
 const compensationRule = driver?.compensationOverride ?? this.pricingRulesStore.driverCompensation;

 return forkJoin({
 settlements: this.getSettlements({ entityType: 'driver', entityId: driverId }),
 cod: this.getCodRecords({ entityType: 'driver', entityId: driverId }),
 wallet: this.http.get<{ items: Array<{ ownerId: string; currentBalance: number; availableBalance?: number; pendingBalance?: number; codOwedBalance?: number }> }>(
 `${environment.apiUrl}/admin/wallets`,
 { params: new HttpParams().set('ownerType', 'driver').set('ownerId', driverId).set('page', '1').set('pageSize', '1') }
 )
 }).pipe(
 map(({ settlements: settlementsPage, cod, wallet }) => {
 const settlements = settlementsPage.items;
 const walletRow = wallet.items.find((item) => item.ownerId === driverId) ?? wallet.items[0];
 const paidSettlements = settlements.filter((settlement) => settlement.status === 'paid' || settlement.status === 'settled');
 const pendingSettlements = settlements.filter((settlement) => settlement.status !== 'paid' && settlement.status !== 'settled');
 const lastPayout = [...paidSettlements].sort((left, right) => (right.paidAt ?? '').localeCompare(left.paidAt ?? ''))[0];
 const codBalance = this.round(walletRow?.codOwedBalance ?? cod.summary.totalExpected);
 const totalEarnings = this.round(paidSettlements.reduce((sum, settlement) => sum + settlement.netAmount, 0));

 const earningsBreakdown = {
 baseAmount: totalEarnings,
 distanceAmount: 0,
 peakBonusAmount: 0,
 zoneBonusAmount: 0,
 deductions: this.round(-Math.max(0, codBalance)),
 netTotal: this.round(totalEarnings - Math.max(0, codBalance))
 };

 return {
 driverId,
 driverName: driver ? `${driver.firstName} ${driver.lastName}` : 'Driver',
 compensationRule,
 compensationOverride: driver?.compensationOverride,
 basePayout: compensationRule.basePayout,
 distanceRatePerKm: compensationRule.distanceRatePerKm,
 peakBonus: compensationRule.peakBonus,
 zoneBonus: compensationRule.zoneBonus,
 totalEarnings,
 availableBalance: this.round(walletRow?.availableBalance ?? Math.max(0, (walletRow?.currentBalance ?? 0) - codBalance)),
 pendingBalance: this.round(walletRow?.pendingBalance ?? pendingSettlements.reduce((sum, settlement) => sum + settlement.netAmount, 0)),
 lastPayoutAmount: this.round(lastPayout?.netAmount ?? 0),
 lastPayoutDate: lastPayout?.paidAt ?? '',
 earningsBreakdown,
 paymentHistory: paidSettlements.map((settlement) => ({
 id: settlement.id,
 paymentRef: settlement.settlementCode,
 amount: settlement.netAmount,
 period: settlement.period,
 status: settlement.status,
 paidAt: settlement.paidAt
 })),
 sparklineEarnings: [],
 codBalance,
 codStatus: cod.records.some((record) => record.status === 'overdue')
 ? 'overdue'
 : cod.records.some((record) => record.status === 'pending')
 ? 'pending'
 : 'collected'
 } as DriverFinanceProfile;
 })
 );
 }

 getOrderFinancialBreakdown(orderId: string): Observable<OrderFinancialBreakdown | null> {
 return this.http.get<AdminOrderFinancialBreakdownApiModel>(`${this.apiUrl}/orders/${orderId}/breakdown`).pipe(
 map((item) => ({
 orderId: item.orderId,
 orderRef: item.orderRef,
 subtotal: this.round(item.subtotal),
 discounts: this.round(item.discounts),
 couponDiscount: this.round(item.couponDiscount),
 deliveryFee: this.round(item.deliveryFee),
 serviceFee: this.round(item.serviceFee),
 codFee: this.round(item.codFee),
 vat: this.round(item.vat),
 total: this.round(item.total),
 vendorEarnings: this.round(item.vendorEarnings),
 vendorCommission: this.round(item.vendorCommission),
 driverPayout: this.round(item.driverPayout),
 platformRevenue: this.round(item.platformRevenue),
 netMargin: this.round(item.netMargin),
 marginPercent: this.round(item.marginPercent),
 fulfillmentType: item.fulfillmentType ?? item.FulfillmentType ?? null
 })),
 catchError((error) => {
 console.error(`Failed to load order financial breakdown for ${orderId}.`, error);
 return of(null);
 })
 );
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
 sparkline: []
 };
 }

 private formatSettlementCode(settlementId: string, createdAtUtc?: string | null): string {
 const stamp = createdAtUtc ? new Date(createdAtUtc) : null;
 const datePart = stamp && !Number.isNaN(stamp.getTime())
 ? stamp.toISOString().slice(2, 10).replace(/-/g, '')
 : '--------';
 const idPart = settlementId.replace(/-/g, '').slice(0, 8).toUpperCase();
 return `SET-${datePart}-${idPart}`;
 }

 private mapLedgerEntries(entries: AdminLedgerEntryApiModel[]): LedgerEntry[] {
 const rows = entries.flatMap((entry) =>
 entry.lines.filter((line) => Math.max(line.debitAmount, line.creditAmount) > 0).map((line) => this.mapLedgerLine(entry, line))
 );

 return rows.sort((left, right) => right.timestamp.localeCompare(left.timestamp));
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
 entityName: line.ownerName?.trim() || this.formatOwnerName(line.ownerType, line.ownerId, line.accountCode),
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
 settlementCode: this.formatSettlementCode(item.id, item.createdAtUtc),
 entityType,
 entityId: item.ownerId,
 entityName: this.formatOwnerName(item.ownerType, item.ownerId),
 period,
 periodFrom: item.periodFrom,
 periodTo: item.periodTo,
 ordersCount: item.itemCount ?? 0,
 grossAmount: this.round(item.grossAmount),
 deductions: this.round(item.commissionAmount + item.refundAmount + item.adjustmentAmount + item.recoveryAmount),
 netAmount: this.round(item.netAmount),
 status: this.toFrontendSettlementStatus(item.status),
 createdAt: item.createdAtUtc,
 paidAt: item.processedAtUtc ?? undefined,
 failureReason: item.status === 'PayoutFailed' ? 'Payout failed' : undefined
 };
 }

 private mapSettlementDetail(detail: AdminSettlementDetailApiModel): Settlement {
 const settlement = this.mapSettlement(detail.settlement);
 return {
 ...settlement,
 settlementProcessingMode: detail.settlementProcessingMode,
 payouts: detail.payouts.map((payout) => ({
 id: payout.id,
 amount: this.round(payout.amount),
 status: payout.status,
 providerTransferId: payout.providerTransferId ?? null,
 transferReference: payout.transferReference ?? null,
 manualConfirmation: payout.manualConfirmation
 ? {
 id: payout.manualConfirmation.id,
 transferReference: payout.manualConfirmation.transferReference,
 proofAttachmentId: payout.manualConfirmation.proofAttachmentId,
 hasLegacyProof: payout.manualConfirmation.hasLegacyProof,
 confirmedByUserId: payout.manualConfirmation.confirmedByUserId,
 confirmedAtUtc: payout.manualConfirmation.confirmedAtUtc
 }
 : null,
 executionReservation: payout.executionReservation
 ? {
 mode: payout.executionReservation.mode,
 status: payout.executionReservation.status,
 claimedByUserId: payout.executionReservation.claimedByUserId,
 claimedAtUtc: payout.executionReservation.claimedAtUtc,
 submittedByUserId: payout.executionReservation.submittedByUserId,
 submittedAtUtc: payout.executionReservation.submittedAtUtc,
 submissionReference: payout.executionReservation.submissionReference,
 releasedByUserId: payout.executionReservation.releasedByUserId,
 releasedAtUtc: payout.executionReservation.releasedAtUtc,
 releaseReason: payout.executionReservation.releaseReason
 }
 : null,
 destinationMaskedLabel: payout.destinationMaskedLabel ?? null,
 scheduledPayoutDay: payout.scheduledPayoutDay ?? null
 }))
 };
 }

 private mapCodRecords(response: AdminCodReconciliationApiModel): CodRecord[] {
 return response.items.map((item) => ({
 id: `cod-${item.driverId}`,
 orderId: item.driverId,
 orderRef: item.driverPhone?.trim() || `DRV-${item.driverId.slice(0, 8).toUpperCase()}`,
 driverId: item.driverId,
 driverName: item.driverName,
 vendorId: 'platform',
 vendorName: '—',
 expectedAmount: this.round(item.codOwedBalance),
 collectedAmount: 0,
 delta: this.round(-item.codOwedBalance),
 status: item.codOwedBalance > 0 ? 'pending' : 'collected',
 notes: `Last journal sequence: ${item.lastJournalSequence}`
 }));
 }

 private mapVendorCodRecords(response: AdminVendorCodReconciliationApiModel): VendorCodRecord[] {
 return response.items.map((item) => ({
 id: `vendor-cod-${item.vendorId}`,
 vendorId: item.vendorId,
 vendorName: item.vendorName,
 vendorRef: `VND-${item.vendorId.slice(0, 8).toUpperCase()}`,
 expectedAmount: this.round(item.codOwedBalance),
 collectedAmount: 0,
 delta: this.round(-item.codOwedBalance),
 status: item.codOwedBalance > 0 ? 'pending' : 'collected',
 notes: `Last journal sequence: ${item.lastJournalSequence}`
 }));
 }

 private mapAuditLogEntry(item: AdminFinanceAuditLogEntryApiModel): AuditLogEntry {
 return {
 id: item.id,
 timestamp: item.timestampUtc,
 adminId: item.adminId,
 adminName: item.adminName,
 adminRole: item.adminRole,
 action: item.action,
 actionCategory: this.toFrontendAuditCategory(item.actionCategory),
 entityType: this.toFrontendEntityType(item.entityType),
 entityId: item.entityId ?? undefined,
 orderId: item.orderId ?? undefined,
 entityName: item.entityName ?? undefined,
 before: item.before ?? undefined,
 after: item.after ?? undefined,
 ipAddress: item.ipAddress ?? undefined,
 sessionId: item.sessionId ?? undefined
 };
 }

 private toFrontendAuditCategory(category: string | null | undefined): AuditLogEntry['actionCategory'] {
 switch (category?.toLowerCase()) {
 case 'settlement':
 return 'settlement';
 case 'refund':
 return 'refund';
 case 'adjustment':
 return 'adjustment';
 case 'pricing':
 return 'pricing';
 case 'auth':
 return 'auth';
 case 'override':
 default:
 return 'override';
 }
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
 return new Date(value).toLocaleDateString('en-GB', { timeZone: 'Asia/Riyadh', day: '2-digit', month: 'short' });
 }

 private getRefundImpact(requestedAmount: number, approvedAmount: number | undefined, status: RefundStatus): number {
 if (status === 'approved') {
 return this.round(-(approvedAmount ?? requestedAmount));
 }

 return this.round(-requestedAmount);
 }

 private filterLedgerEntries(entries: LedgerEntry[], filter?: LedgerFilter): LedgerEntry[] {
 if (!filter) {
 return entries;
 }

 return entries.filter((entry) => {
 if (filter.entityType && entry.entityType!== filter.entityType) return false;
 if (filter.entityId && entry.entityId!== filter.entityId) return false;
 if (filter.orderId && entry.orderId!== filter.orderId) return false;
 if (filter.type && entry.type!== filter.type) return false;
 if (filter.direction && entry.direction!== filter.direction) return false;
 if (filter.minAmount!== undefined && entry.amount < filter.minAmount) return false;
 if (filter.maxAmount!== undefined && entry.amount > filter.maxAmount) return false;
 if (filter.search) {
 const haystack = `${entry.entityName} ${entry.referenceId} ${entry.orderId ?? ''} ${entry.description ?? ''}`;
 if (!this.normalizeText(haystack).includes(this.normalizeText(filter.search))) return false;
 }
 if (filter.dateFrom && entry.timestamp < filter.dateFrom) return false;
 if (filter.dateTo && entry.timestamp > filter.dateTo) return false;
 return true;
 });
 }

 private resolveLedgerFilter(filter?: LedgerFilter): LedgerFilter | undefined {
 if (!filter) {
 return undefined;
 }

 const resolved = { ...filter };
 if (filter.period && !filter.dateFrom && !filter.dateTo) {
 const bounds = this.resolveFinancePeriodBounds(filter.period);
 resolved.dateFrom = bounds.dateFrom;
 resolved.dateTo = bounds.dateTo;
 }

 return resolved;
 }

 private resolveFinancePeriodBounds(period: FinancePeriod): { dateFrom: string; dateTo: string } {
 const now = new Date();
 const end = now.toISOString();
 const start = new Date(now);

 switch (period) {
 case 'today':
 start.setHours(0, 0, 0, 0);
 break;
 case 'week': {
 const day = start.getDay();
 const diff = day === 0 ? 6 : day - 1;
 start.setDate(start.getDate() - diff);
 start.setHours(0, 0, 0, 0);
 break;
 }
 case 'quarter': {
 const quarterStartMonth = Math.floor(start.getMonth() / 3) * 3;
 start.setMonth(quarterStartMonth, 1);
 start.setHours(0, 0, 0, 0);
 break;
 }
 case 'month':
 default:
 start.setDate(1);
 start.setHours(0, 0, 0, 0);
 break;
 }

 return { dateFrom: start.toISOString(), dateTo: end };
 }

 private filterSettlements(settlements: Settlement[], filter?: SettlementFilter): Settlement[] {
 if (!filter) {
 return settlements;
 }

 return settlements.filter((settlement) => {
 if (filter.entityType && settlement.entityType!== filter.entityType) return false;
 if (filter.entityId && settlement.entityId!== filter.entityId) return false;
 if (filter.status && settlement.status!== filter.status) return false;
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
 if (filter.entityType === 'vendor' && filter.entityId && record.vendorId!== filter.entityId) return false;
 if (filter.entityType === 'driver' && filter.entityId && record.driverId!== filter.entityId) return false;
 if (filter.orderId && record.orderId!== filter.orderId) return false;
 if (filter.status && record.status!== filter.status) return false;
 return true;
 });
 }

 private filterRefundCases(cases: RefundCase[], filter?: RefundFilter): RefundCase[] {
 if (!filter) {
 return cases;
 }

 return cases.filter((refund) => {
 if (filter.status && refund.status!== filter.status) return false;
 if (filter.vendorId && refund.vendorId!== filter.vendorId) return false;
 if (filter.entityType === 'vendor' && filter.entityId && refund.vendorId!== filter.entityId) return false;
 if (filter.entityType === 'driver' && filter.entityId && refund.driverId!== filter.entityId) return false;
 if (filter.entityType === 'order' && filter.orderId && refund.orderId!== filter.orderId) return false;
 if (!filter.entityType && filter.entityId && refund.vendorId!== filter.entityId && refund.driverId!== filter.entityId) return false;
 if (filter.orderId && refund.orderId!== filter.orderId) return false;
 if (filter.minAmount!== undefined && refund.requestedAmount < filter.minAmount) return false;
 if (filter.responsibleParty && refund.responsibleParty!== filter.responsibleParty) return false;
 if (filter.dateFrom && refund.createdAt < filter.dateFrom) return false;
 if (filter.dateTo && refund.createdAt > filter.dateTo) return false;
 return true;
 });
 }

 private filterAuditEntries(entries: AuditLogEntry[], filter?: AuditLogFilter): AuditLogEntry[] {
 const sortedEntries = [...entries].sort((left, right) => right.timestamp.localeCompare(left.timestamp));

 if (!filter) {
 return this.clone(sortedEntries);
 }

 return sortedEntries.filter((entry) => {
 if (filter.entityType && entry.entityType!== filter.entityType) return false;
 if (filter.entityId && entry.entityId!== filter.entityId) return false;
 if (filter.orderId && entry.orderId!== filter.orderId) return false;
 if (filter.actionCategory && entry.actionCategory!== filter.actionCategory) return false;
 return true;
 });
 }

 private buildInitialAdjustments(): FinancialAdjustment[] {
 return [];
 }

 private buildInitialAuditLog(): AuditLogEntry[] {
 return [];
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

 private normalizeText(value: string): string {
 return (value || '').toLowerCase().replace(/[\u064B-\u065F]/g, '').replace(/[#*'".,()/\\-]+/g, ' ').replace(/\s+/g, ' ').trim();
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
 return {...zone,
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

}
