import type { DriverCompensationRule } from '@finances/models/finance-rules.models';

export type { DriverCompensationRule };

export type FinanceCurrency = 'SAR' | 'EGP';
export type TrendDirection = 'up' | 'down' | 'flat';
export type FinancePeriod = 'today' | 'week' | 'month' | 'quarter' | 'custom';
export type EntityType = 'vendor' | 'driver' | 'order' | 'platform' | 'customer';
export type LedgerDirection = 'credit' | 'debit';
export type SettlementStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'disputed';
export type RefundStatus = 'open' | 'under_review' | 'approved' | 'rejected' | 'escalated';
export type CodStatus = 'collected' | 'pending' | 'overdue' | 'disputed';
export type AdjustmentDirection = 'credit' | 'debit';
export type PricingZone = 'standard' | 'peak' | 'zone_a' | 'zone_b';

export interface FinanceKPI {
  id: string;
  labelKey: string;
  value: number;
  formattedValue: string;
  currency?: FinanceCurrency;
  trend: TrendDirection;
  trendPercent: number;
  trendLabel?: string;
  severity?: 'success' | 'warning' | 'danger' | 'neutral';
  clickRoute?: string;
  icon: string;
  sparkline?: number[];
}

export interface FinanceDashboardAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  titleKey: string;
  descriptionKey: string;
  entityType: EntityType;
  entityId?: string;
  orderId?: string;
  entityName?: string;
  amount?: number;
  actionKey?: string;
  actionRoute?: string;
  timestamp: string;
}

export interface FinanceDashboardSnapshot {
  period: FinancePeriod;
  grossCollections: FinanceKPI;
  platformNetRevenue: FinanceKPI;
  commissionRevenue: FinanceKPI;
  deliveryRevenue: FinanceKPI;
  codFeesCollected: FinanceKPI;
  vatCollected: FinanceKPI;
  driverPayouts: FinanceKPI;
  refundExposure: FinanceKPI;
  revenueComposition: RevenueCompositionSegment[];
  collectionTrend: ChartDataPoint[];
  revenueTrend: ChartDataPoint[];
  alerts: FinanceDashboardAlert[];
}

export interface RevenueCompositionSegment {
  id: string;
  labelKey: string;
  amount: number;
  percent: number;
  color: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export type LedgerEntryType =
  | 'commission'
  | 'payout'
  | 'refund'
  | 'adjustment'
  | 'settlement'
  | 'cod_collection'
  | 'service_fee'
  | 'delivery_fee'
  | 'vat'
  | 'penalty'
  | 'bonus';

export interface LedgerEntry {
  id: string;
  timestamp: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  type: LedgerEntryType;
  direction: LedgerDirection;
  amount: number;
  currency: FinanceCurrency;
  referenceId: string;
  description: string;
  balanceAfter?: number;
  orderId?: string;
  settlementId?: string;
  adminId?: string;
}

export interface LedgerFilter {
  period?: FinancePeriod;
  dateFrom?: string;
  dateTo?: string;
  entityType?: EntityType;
  entityId?: string;
  orderId?: string;
  type?: LedgerEntryType;
  direction?: LedgerDirection;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface Settlement {
  id: string;
  settlementCode: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  period: string;
  periodFrom: string;
  periodTo: string;
  ordersCount: number;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: SettlementStatus;
  createdAt: string;
  paidAt?: string;
  failureReason?: string;
  bankAccount?: string;
  items?: SettlementItem[];
}

export interface SettlementItem {
  orderId: string;
  orderRef: string;
  amount: number;
  commission: number;
  netEarning: number;
  date: string;
}

export interface SettlementFilter {
  period?: FinancePeriod;
  entityType?: EntityType;
  entityId?: string;
  status?: SettlementStatus;
  search?: string;
}

export interface CodRecord {
  id: string;
  orderId: string;
  orderRef: string;
  driverId: string;
  driverName: string;
  vendorId: string;
  vendorName: string;
  expectedAmount: number;
  collectedAmount: number;
  delta: number;
  status: CodStatus;
  collectionDate?: string;
  reconciledAt?: string;
  notes?: string;
}

export interface CodReconciliationSummary {
  totalExpected: number;
  totalCollected: number;
  totalDelta: number;
  overdueCases: number;
  pendingCases: number;
}

export interface CodFilter {
  entityType?: 'vendor' | 'driver';
  entityId?: string;
  orderId?: string;
  status?: CodStatus;
}

export interface RefundCase {
  id: string;
  caseRef: string;
  orderId: string;
  orderRef: string;
  customerId: string;
  customerName: string;
  driverId?: string;
  driverName?: string;
  vendorId: string;
  vendorName: string;
  requestedAmount: number;
  approvedAmount?: number;
  reason: string;
  status: RefundStatus;
  financialImpact: number;
  responsibleParty: EntityType;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  adminNote?: string;
  timeline: RefundTimelineEvent[];
}

export interface RefundTimelineEvent {
  id: string;
  status: RefundStatus;
  adminId?: string;
  adminName?: string;
  note?: string;
  timestamp: string;
}

export interface RefundFilter {
  status?: RefundStatus;
  vendorId?: string;
  entityType?: EntityType;
  entityId?: string;
  orderId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  responsibleParty?: EntityType;
}

export interface FinancialAdjustment {
  id: string;
  adjustmentRef: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  direction: AdjustmentDirection;
  amount: number;
  currency: FinanceCurrency;
  reason: string;
  category: string;
  adminId: string;
  adminName: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  status: 'pending_approval' | 'approved' | 'rejected';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  action: string;
  actionCategory: 'settlement' | 'refund' | 'adjustment' | 'pricing' | 'override' | 'auth';
  entityType: EntityType;
  entityId?: string;
  orderId?: string;
  entityName?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
  sessionId?: string;
}

export interface AuditLogFilter {
  entityType?: EntityType;
  entityId?: string;
  orderId?: string;
  actionCategory?: AuditLogEntry['actionCategory'];
}

export interface PricingRuleSet {
  id: string;
  name: string;
  effectiveFrom: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  vendorCommission: CommissionRule;
  driverCompensation: DriverCompensationRule;
  deliveryPricing: DeliveryPricingRule;
  serviceFee: ServiceFeeRule;
  codFee: CodFeeRule;
  vat: VatRule;
}

export interface CommissionRule {
  defaultPercent: number;
  minPercent: number;
  maxPercent: number;
  overrideAllowed: boolean;
}

export interface DeliveryPricingRule {
  baseFee: number;
  perKmRate: number;
  peakMultiplier: number;
  peakHoursStart: string;
  peakHoursEnd: string;
  zoneRates: ZoneRate[];
}

export interface ZoneRate {
  zone: string;
  name: string;
  multiplier: number;
}

export interface ServiceFeeRule {
  percent: number;
  capAmount: number;
  applyOnDelivery: boolean;
}

export interface CodFeeRule {
  percent: number;
  flatFee: number;
  useFlat: boolean;
}

export interface VatRule {
  percent: number;
  applyOnServiceFee: boolean;
  applyOnDelivery: boolean;
  applyOnCommission: boolean;
}

export interface OrderFinancialBreakdown {
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
}

export interface VendorFinanceProfile {
  vendorId: string;
  vendorName: string;
  commissionRate: number;
  commissionOverride?: number;
  totalSales: number;
  netSales: number;
  totalCommissions: number;
  availableBalance: number;
  pendingBalance: number;
  lastPaymentAmount: number;
  lastPaymentDate: string;
  financialSummary: FinancialSummary;
  bankInfo: BankInfo;
  settlements: Settlement[];
  refundExposure: number;
  disputeCount: number;
  sparklineSales: number[];
}

export interface FinancialSummary {
  sales: number;
  returns: number;
  discounts: number;
  commissions: number;
  netTotal: number;
}

export interface BankInfo {
  bankName: string;
  iban: string;
  paymentCycle: string;
}

export interface DriverFinanceProfile {
  driverId: string;
  driverName: string;
  compensationRule: DriverCompensationRule;
  compensationOverride?: DriverCompensationRule;
  basePayout: number;
  distanceRatePerKm: number;
  peakBonus: number;
  zoneBonus: number;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  lastPayoutAmount: number;
  lastPayoutDate: string;
  earningsBreakdown: DriverEarningsBreakdown;
  paymentHistory: DriverPayment[];
  sparklineEarnings: number[];
  codBalance: number;
  codStatus: CodStatus;
}

export interface DriverEarningsBreakdown {
  baseAmount: number;
  distanceAmount: number;
  peakBonusAmount: number;
  zoneBonusAmount: number;
  deductions: number;
  netTotal: number;
}

export interface DriverPayment {
  id: string;
  paymentRef: string;
  amount: number;
  period: string;
  status: SettlementStatus;
  paidAt?: string;
}

export interface ZoneFinanceSettings {
  zoneId: string;
  zoneName: string;
  city: string;
  regionId?: string | null;
  regionCode?: string | null;
  regionNameAr?: string | null;
  regionNameEn?: string | null;
  pricingRuleId?: string | null;
  
  // Pricing Rule
  baseDeliveryFee: number;
  includedKm: number;
  extraKmFee: number;
  minDeliveryFee: number;
  maxDeliveryFee: number;
  isPricingActive: boolean;
  
  // Finance Settings
  vatPercent: number;
  codFeeType: 'flat' | 'percent';
  codFlatFee: number;
  codPercent: number;
  isVatActive: boolean;
  isCodFeeActive: boolean;
}

export interface CityDeliveryPricingSettings {
  cityId: string;
  cityCode: string;
  cityNameAr: string;
  cityNameEn: string;
  regionId: string;
  regionCode: string;
  regionNameAr: string;
  regionNameEn: string;
  pricingScope: 'city';
  baseDeliveryFee: number;
  includedKm: number;
  extraKmFee: number;
  minDeliveryFee: number;
  maxDeliveryFee: number;
  isPricingActive: boolean;
  vatPercent: number;
  codFeeType: 'flat' | 'percent';
  codFlatFee: number;
  codPercent: number;
  isVatActive: boolean;
  isCodFeeActive: boolean;
}

export interface RegionDeliveryPricingSettings {
  regionId: string;
  regionCode: string;
  regionNameAr: string;
  regionNameEn: string;
  pricingScope: 'region';
  baseDeliveryFee: number;
  includedKm: number;
  extraKmFee: number;
  minDeliveryFee: number;
  maxDeliveryFee: number;
  isPricingActive: boolean;
  vatPercent: number;
  codFeeType: 'flat' | 'percent';
  codFlatFee: number;
  codPercent: number;
  isVatActive: boolean;
  isCodFeeActive: boolean;
}

export interface DeliveryPricingDefaults {
  id: string;
  pricingScope: 'global';
  baseDeliveryFee: number;
  includedKm: number;
  extraKmFee: number;
  minDeliveryFee: number;
  maxDeliveryFee: number;
  isPricingActive: boolean;
  vatPercent: number;
  codFeeType: 'flat' | 'percent';
  codFlatFee: number;
  codPercent: number;
  isVatActive: boolean;
  isCodFeeActive: boolean;
  minTotalDeliveryFee: number;
  maxTotalDeliveryFee: number;
  maxQuotedDistanceKm: number;
  warningSubtotalRatioThreshold: number;
}

export type PricingScope = 'zone' | 'city' | 'region' | 'global';
export type PricingSettingsItem = ZoneFinanceSettings | CityDeliveryPricingSettings | RegionDeliveryPricingSettings | DeliveryPricingDefaults;

