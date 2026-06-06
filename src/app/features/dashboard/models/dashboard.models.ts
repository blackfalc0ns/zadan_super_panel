export type DashboardDateRange = 'today' | 'week' | 'month';
export type DashboardRefreshMode = 'manual';
export type DashboardSeverity = 'critical' | 'warning' | 'info' | 'success' | 'neutral';
export type DashboardTrendDirection = 'up' | 'down' | 'flat';

export interface DashboardFilterState {
  dateRange: DashboardDateRange;
  region: string;
  vendorId: string;
  refreshMode: DashboardRefreshMode;
}

export interface DashboardFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface DashboardKpiCard {
  id: string;
  labelKey: string;
  value: string;
  unitLabel?: string;
  trendLabel: string;
  trendDirection: DashboardTrendDirection;
  severity: DashboardSeverity;
  contextKey: string;
}

export interface DashboardAlert {
  id: string;
  severity: DashboardSeverity;
  titleKey: string;
  summaryKey: string;
  summaryParams?: Record<string, string | number>;
  count: number;
  route: string;
}

export interface DashboardQueue {
  id: string;
  labelKey: string;
  count: number;
  helperKey: string;
  severity: DashboardSeverity;
  route: string;
}

export interface DashboardChartPoint {
  label: string;
  value: number;
}

export interface DashboardChartSeries {
  id: string;
  labelKey: string;
  color: string;
  points: DashboardChartPoint[];
}

export interface DashboardSeriesChart {
  titleKey: string;
  descriptionKey: string;
  series: DashboardChartSeries[];
}

export interface DashboardRegionPressureRow {
  regionKey: string;
  regionLabel: string;
  lateOrders: number;
  paymentIssues: number;
  driverGap: number;
  score: number;
  route: string;
}

export interface DashboardSupplyBucket {
  id: string;
  labelKey: string;
  count: number;
  share: number;
  color: string;
  severity: DashboardSeverity;
}

export interface DashboardAttentionItem {
  id: string;
  entityLabelKey: string;
  entityName: string;
  summary: string;
  owner: string;
  priority: DashboardSeverity;
  route: string;
  actionLabelKey: string;
}

export interface DashboardAuditItem {
  id: string;
  titleKey: string;
  titleParams?: Record<string, string | number>;
  subtitleKey: string;
  subtitleParams?: Record<string, string | number>;
  severity: DashboardSeverity;
  timestampUtc: string;
  route: string;
}

export interface DashboardSectionStatus {
  severity: DashboardSeverity;
  summaryKey: string;
  summaryParams?: Record<string, string | number>;
}

export interface DashboardSectionStat {
  id: string;
  labelKey: string;
  value: number;
  displayValue: string;
  unit?: string;
  tone: DashboardSeverity;
  helperKey: string;
}

export interface DashboardRankedRow {
  id: string;
  label: string;
  value: string;
  secondaryValue?: string;
  metaLabel?: string;
  severity: DashboardSeverity;
  route: string;
}

export interface DashboardRankedList {
  id: string;
  titleKey: string;
  descriptionKey: string;
  rows: DashboardRankedRow[];
}

export interface DashboardExceptionRow {
  id: string;
  entityLabel: string;
  issueLabel: string;
  ownerLabel: string;
  metricLabel: string;
  severity: DashboardSeverity;
  route: string;
}

export interface DashboardSection {
  id: string;
  titleKey: string;
  descriptionKey: string;
  route: string;
  status: DashboardSectionStatus;
  stats: DashboardSectionStat[];
  rankedLists: DashboardRankedList[];
  exceptions: DashboardExceptionRow[];
}

export type GeographyCoverageGapFlag =
  | 'NoVendor'
  | 'NoDriver'
  | 'NoSupply'
  | 'DemandWithoutBoth'
  | 'NoActivity'
  | 'SupplyWithoutDemand';

export interface GeographyCoverageRoutes {
  customers: string;
  vendors: string;
  drivers: string;
}

export interface GeographyCoverageCityRow {
  cityCode: string;
  regionCode: string;
  cityNameAr: string;
  cityNameEn: string;
  customerCount: number;
  activeVendorCount: number;
  readyDriverCount: number;
  verifiedDriverCount: number;
  activeBranchCount: number;
  gapFlags: GeographyCoverageGapFlag[];
  routes: GeographyCoverageRoutes;
}

export interface GeographyCoverageSummary {
  officialCityCount: number;
  citiesWithGaps: number;
  customersWithoutVendor: number;
  customersWithoutDriver: number;
  unmappedCustomers: number;
  topDemandGaps: Array<{
    cityCode: string;
    cityNameAr: string;
    cityNameEn: string;
    customerCount: number;
    gapFlags: GeographyCoverageGapFlag[];
  }>;
}

export interface GeographyCoverageSnapshot {
  summary: GeographyCoverageSummary;
  cities: GeographyCoverageCityRow[];
  regionRollup: Array<{
    regionCode: string;
    regionNameAr: string;
    regionNameEn: string;
    customerCount: number;
    activeVendorCount: number;
    readyDriverCount: number;
    citiesWithGaps: number;
  }>;
}

export interface DashboardSnapshot {
  filterState: DashboardFilterState;
  filterOptions: {
    dateRanges: DashboardFilterOption[];
    regions: DashboardFilterOption[];
    vendors: DashboardFilterOption[];
  };
  headerSummary: string;
  lastUpdatedLabel: string;
  systemMode: 'live' | 'snapshot';
  systemStatusLabelKey: string;
  kpis: DashboardKpiCard[];
  alerts: DashboardAlert[];
  queues: {
    live: DashboardQueue[];
    risk: DashboardQueue[];
  };
  charts: {
    ordersTrend: DashboardSeriesChart;
    revenueTrend: DashboardSeriesChart;
    regionPressure: DashboardRegionPressureRow[];
    vendorReadiness: DashboardSupplyBucket[];
    driverReadiness: DashboardSupplyBucket[];
  };
  attentionItems: DashboardAttentionItem[];
  auditItems: DashboardAuditItem[];
  sections: DashboardSection[];
}
