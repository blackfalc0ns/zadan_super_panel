export type DashboardDateRange = 'today' | 'week' | 'month';
export type DashboardRefreshMode = 'manual' | 'live';
export type DashboardTrendDirection = 'up' | 'down' | 'flat';
export type DashboardSeverity = 'critical' | 'warning' | 'info' | 'success' | 'neutral';
export type DashboardComparisonMode = 'single' | 'dual' | 'stacked';

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
  contextKey: string;
  severity?: DashboardSeverity;
}

export interface DashboardAlert {
  id: string;
  severity: DashboardSeverity;
  titleKey: string;
  summaryKey: string;
  summaryParams?: Record<string, string | number>;
  affectedCount: number;
  actionLabelKey: string;
  route: string;
}

export interface DashboardInsight {
  id: string;
  type: DashboardSeverity;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  actionLabelKey: string;
  route: string;
  supportingMetric: string;
}

export interface DashboardOperationalQueue {
  id: string;
  labelKey: string;
  count: number;
  delta: string;
  tone: DashboardSeverity;
  helperKey: string;
  route: string;
}

export interface DashboardTrendSegment {
  id: string;
  labelKey: string;
  value: number;
  tone: DashboardSeverity;
}

export interface DashboardTrendPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  segments?: DashboardTrendSegment[];
}

export interface DashboardTrendSeries {
  id: string;
  labelKey: string;
  points: DashboardTrendPoint[];
  comparisonMode: DashboardComparisonMode;
}

export interface DashboardLeaderboardRow {
  id: string;
  title: string;
  subtitle: string;
  metricValue: string;
  metricLabelKey: string;
  secondaryValue: string;
  secondaryLabelKey: string;
  progress: number;
  tone: DashboardSeverity;
  route: string;
}

export interface DashboardAttentionItem {
  id: string;
  entityLabelKey: string;
  entityName: string;
  summary: string;
  owner: string;
  priority: DashboardSeverity;
  route: string;
  ctaLabelKey: string;
}

export interface DashboardAuditItem {
  id: string;
  titleKey: string;
  subtitleKey: string;
  subtitleParams?: Record<string, string | number>;
  tone: DashboardSeverity;
  timeLabel: string;
  route?: string;
}

export interface DashboardRegionPressureRow {
  id: string;
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
  tone: DashboardSeverity;
}

export interface DashboardCatalogPulse {
  products: number;
  brands: number;
  categories: number;
  concentrationLabel: string;
}

export interface DashboardSnapshot {
  filterState: DashboardFilterState;
  filterOptions: {
    dateRanges: DashboardFilterOption[];
    regions: DashboardFilterOption[];
    vendors: DashboardFilterOption[];
  };
  headerSummaryKey: string;
  headerSummaryParams?: Record<string, string | number>;
  lastUpdatedLabel: string;
  systemMode: 'live' | 'snapshot';
  systemStatusLabelKey: string;
  kpis: DashboardKpiCard[];
  alerts: DashboardAlert[];
  insights: DashboardInsight[];
  liveQueues: DashboardOperationalQueue[];
  riskQueues: DashboardOperationalQueue[];
  hourlyFunnel: DashboardTrendSeries;
  revenueQuality: DashboardTrendSeries;
  vendorLeaderboard: DashboardLeaderboardRow[];
  attentionItems: DashboardAttentionItem[];
  regionPressure: DashboardRegionPressureRow[];
  vendorSupplyReadiness: DashboardSupplyBucket[];
  driverSupplyReadiness: DashboardSupplyBucket[];
  auditItems: DashboardAuditItem[];
  catalogPulse: DashboardCatalogPulse;
}
