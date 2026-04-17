import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { Brand, CatalogService, Category, MasterProduct } from '@catalog/public-api';
import { CustomerDetailRecord, CustomersService } from '@customers/public-api';
import { DisputeRow, DisputesService } from '@disputes/public-api';
import { DriverService } from '@drivers/public-api';
import type { Driver } from '@drivers/public-api';
import { OrderDetail, OrdersService } from '@orders/public-api';
import { Vendor, VendorDetail, VendorService } from '@vendors/public-api';
import { AuthService } from '@core/services/auth.service';
import {
  DashboardAlert,
  DashboardAttentionItem,
  DashboardAuditItem,
  DashboardCatalogPulse,
  DashboardDateRange,
  DashboardFilterOption,
  DashboardFilterState,
  DashboardInsight,
  DashboardKpiCard,
  DashboardLeaderboardRow,
  DashboardOperationalQueue,
  DashboardRegionPressureRow,
  DashboardSeverity,
  DashboardSnapshot,
  DashboardSupplyBucket,
  DashboardTrendPoint,
  DashboardTrendSeries
} from '../models/dashboard.models';

interface DashboardSourceSnapshot {
  orders: OrderDetail[];
  drivers: Driver[];
  customers: CustomerDetailRecord[];
  disputes: DisputeRow[];
  vendors: VendorDetail[];
  products: MasterProduct[];
  brands: Brand[];
  categories: Category[];
}

interface RegionAggregation {
  regionKey: string;
  regionLabel: string;
  lateOrders: number;
  paymentIssues: number;
  readyDrivers: number;
  limitedDrivers: number;
  blockedDrivers: number;
  score: number;
}

const DEFAULT_FILTER_STATE: DashboardFilterState = {
  dateRange: 'today',
  region: 'all',
  vendorId: 'all',
  refreshMode: 'manual'
};

const KPI_BASELINES: Record<DashboardDateRange, {
  gmv: number;
  completedOrders: number;
  onTimeRate: number;
  ordersAtRisk: number;
  disputeExposure: number;
  vendorBacklog: number;
  driverBacklog: number;
}> = {
  today: {
    gmv: 482400,
    completedOrders: 1284,
    onTimeRate: 91.8,
    ordersAtRisk: 126,
    disputeExposure: 63900,
    vendorBacklog: 43,
    driverBacklog: 27
  },
  week: {
    gmv: 3218700,
    completedOrders: 8615,
    onTimeRate: 93.1,
    ordersAtRisk: 508,
    disputeExposure: 214600,
    vendorBacklog: 97,
    driverBacklog: 68
  },
  month: {
    gmv: 13422500,
    completedOrders: 35880,
    onTimeRate: 92.6,
    ordersAtRisk: 1940,
    disputeExposure: 784300,
    vendorBacklog: 212,
    driverBacklog: 149
  }
};

const TODAY_FUNNEL_TEMPLATE = [
  { label: '08:00', segments: { new: 48, preparing: 70, dispatch: 42, delivered: 18, failed: 4 } },
  { label: '09:00', segments: { new: 62, preparing: 78, dispatch: 54, delivered: 26, failed: 5 } },
  { label: '10:00', segments: { new: 74, preparing: 88, dispatch: 66, delivered: 30, failed: 6 } },
  { label: '11:00', segments: { new: 85, preparing: 98, dispatch: 74, delivered: 38, failed: 8 } },
  { label: '12:00', segments: { new: 79, preparing: 103, dispatch: 82, delivered: 42, failed: 9 } },
  { label: '13:00', segments: { new: 69, preparing: 94, dispatch: 78, delivered: 55, failed: 10 } },
  { label: '14:00', segments: { new: 57, preparing: 81, dispatch: 74, delivered: 67, failed: 8 } },
  { label: '15:00', segments: { new: 44, preparing: 68, dispatch: 58, delivered: 76, failed: 7 } }
];

const WEEK_FUNNEL_TEMPLATE = [
  { label: 'Sun', segments: { new: 280, preparing: 330, dispatch: 250, delivered: 190, failed: 16 } },
  { label: 'Mon', segments: { new: 310, preparing: 360, dispatch: 270, delivered: 210, failed: 18 } },
  { label: 'Tue', segments: { new: 340, preparing: 388, dispatch: 296, delivered: 226, failed: 19 } },
  { label: 'Wed', segments: { new: 360, preparing: 404, dispatch: 315, delivered: 245, failed: 20 } },
  { label: 'Thu', segments: { new: 382, preparing: 428, dispatch: 332, delivered: 260, failed: 22 } },
  { label: 'Fri', segments: { new: 350, preparing: 410, dispatch: 301, delivered: 230, failed: 21 } },
  { label: 'Sat', segments: { new: 325, preparing: 372, dispatch: 281, delivered: 215, failed: 18 } }
];

const MONTH_FUNNEL_TEMPLATE = [
  { label: 'W1', segments: { new: 820, preparing: 930, dispatch: 710, delivered: 560, failed: 38 } },
  { label: 'W2', segments: { new: 860, preparing: 990, dispatch: 760, delivered: 620, failed: 41 } },
  { label: 'W3', segments: { new: 910, preparing: 1040, dispatch: 810, delivered: 670, failed: 45 } },
  { label: 'W4', segments: { new: 960, preparing: 1090, dispatch: 845, delivered: 710, failed: 48 } }
];

const REVENUE_TREND_TEMPLATES: Record<DashboardDateRange, DashboardTrendPoint[]> = {
  today: [
    { label: '08:00', value: 38000, secondaryValue: 4200 },
    { label: '09:00', value: 52000, secondaryValue: 7100 },
    { label: '10:00', value: 69000, secondaryValue: 9800 },
    { label: '11:00', value: 84000, secondaryValue: 12600 },
    { label: '12:00', value: 91000, secondaryValue: 14100 },
    { label: '13:00', value: 79000, secondaryValue: 13500 },
    { label: '14:00', value: 64000, secondaryValue: 10900 },
    { label: '15:00', value: 56000, secondaryValue: 8700 }
  ],
  week: [
    { label: 'Sun', value: 392000, secondaryValue: 31800 },
    { label: 'Mon', value: 428000, secondaryValue: 34600 },
    { label: 'Tue', value: 451000, secondaryValue: 35800 },
    { label: 'Wed', value: 486000, secondaryValue: 39100 },
    { label: 'Thu', value: 514000, secondaryValue: 42800 },
    { label: 'Fri', value: 463000, secondaryValue: 38200 },
    { label: 'Sat', value: 439000, secondaryValue: 35100 }
  ],
  month: [
    { label: 'W1', value: 2980000, secondaryValue: 166000 },
    { label: 'W2', value: 3160000, secondaryValue: 181000 },
    { label: 'W3', value: 3420000, secondaryValue: 197000 },
    { label: 'W4', value: 3860000, secondaryValue: 240000 }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class SuperAdminDashboardService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly driverService: DriverService,
    private readonly customersService: CustomersService,
    private readonly disputesService: DisputesService,
    private readonly vendorService: VendorService,
    private readonly catalogService: CatalogService,
    private readonly authService: AuthService
  ) {}

  getDashboardSnapshot(
    filterState: DashboardFilterState = DEFAULT_FILTER_STATE,
    lang: 'ar' | 'en' = 'ar'
  ): Observable<DashboardSnapshot> {
    return forkJoin({
      orders: this.ordersService.getLiveSnapshot(80),
      drivers: of(this.driverService.getDriversSnapshot()),
      customers: this.customersService.getCustomers(),
      disputes: of(this.disputesService.getDisputesSnapshot()),
      vendors: this.vendorService.getVendors(1, 100),
      products: this.catalogService.getProducts(1, 250),
      brands: this.catalogService.getBrands(true),
      categories: this.catalogService.getCategories(undefined, true)
    }).pipe(
      map((response) => this.buildSnapshot({
        orders: response.orders,
        drivers: response.drivers,
        customers: response.customers,
        disputes: response.disputes,
        vendors: response.vendors.items as VendorDetail[],
        products: (response.products?.items ?? []) as MasterProduct[],
        brands: response.brands,
        categories: response.categories
      }, filterState, lang))
    );
  }

  private buildSnapshot(
    source: DashboardSourceSnapshot,
    filterState: DashboardFilterState,
    lang: 'ar' | 'en'
  ): DashboardSnapshot {
    const normalizedFilter = {
      ...DEFAULT_FILTER_STATE,
      ...filterState
    };

    const selectedVendor = normalizedFilter.vendorId !== 'all'
      ? source.vendors.find((vendor) => vendor.id === normalizedFilter.vendorId) ?? null
      : null;
    const filtered = this.filterSource(source, normalizedFilter, selectedVendor);
    const regionAggregations = this.buildRegionAggregations(filtered.orders, filtered.drivers, lang);
    const vendorLeaderboard = this.buildVendorLeaderboard(filtered, lang);

    return {
      filterState: normalizedFilter,
      filterOptions: {
        dateRanges: [
          { value: 'today', label: this.localizeRange('today', lang) },
          { value: 'week', label: this.localizeRange('week', lang) },
          { value: 'month', label: this.localizeRange('month', lang) }
        ],
        regions: this.buildRegionOptions(source, lang),
        vendors: this.buildVendorOptions(source.vendors, lang)
      },
      headerSummaryKey: 'DASHBOARD.HEADER_SUMMARY',
      headerSummaryParams: {
        scope: this.resolveScopeLabel(normalizedFilter, selectedVendor, lang),
        mode: this.authService.hasApiSession
          ? this.localizeModeLabel('live', lang)
          : this.localizeModeLabel('snapshot', lang)
      },
      lastUpdatedLabel: this.formatTimestamp(lang),
      systemMode: this.authService.hasApiSession ? 'live' : 'snapshot',
      systemStatusLabelKey: this.authService.hasApiSession
        ? 'DASHBOARD.SYSTEM_STATUS.LIVE'
        : 'DASHBOARD.SYSTEM_STATUS.SNAPSHOT',
      kpis: this.buildKpis(source, filtered, normalizedFilter, lang),
      alerts: this.buildAlerts(filtered, regionAggregations, selectedVendor, lang),
      insights: this.buildInsights(filtered, regionAggregations, vendorLeaderboard, lang),
      liveQueues: this.buildLiveQueues(filtered),
      riskQueues: this.buildRiskQueues(filtered),
      hourlyFunnel: this.buildHourlyFunnel(normalizedFilter, filtered),
      revenueQuality: this.buildRevenueTrend(normalizedFilter, filtered),
      vendorLeaderboard,
      attentionItems: this.buildAttentionItems(filtered, lang),
      regionPressure: regionAggregations
        .sort((a, b) => b.score - a.score)
        .map((region) => ({
          id: region.regionKey,
          regionLabel: region.regionLabel,
          lateOrders: region.lateOrders,
          paymentIssues: region.paymentIssues,
          driverGap: Math.max(0, region.limitedDrivers + region.blockedDrivers - region.readyDrivers),
          score: region.score,
          route: '/orders'
        })),
      vendorSupplyReadiness: this.buildVendorSupplyReadiness(filtered.vendors),
      driverSupplyReadiness: this.buildDriverSupplyReadiness(filtered.drivers),
      auditItems: this.buildAuditItems(filtered, lang),
      catalogPulse: this.buildCatalogPulse(filtered)
    };
  }

  private filterSource(
    source: DashboardSourceSnapshot,
    filterState: DashboardFilterState,
    selectedVendor: VendorDetail | null
  ): DashboardSourceSnapshot {
    const vendorMatcher = selectedVendor ? this.normalizeVendorName(selectedVendor.businessNameAr) : null;
    const regionFilter = filterState.region;

    const orders = source.orders.filter((order) => {
      const matchesRegion = regionFilter === 'all' || this.cityToRegionKey(order.city || '') === regionFilter;
      const matchesVendor = !vendorMatcher
        || this.normalizeVendorName(order.merchantName).includes(vendorMatcher)
        || vendorMatcher.includes(this.normalizeVendorName(order.merchantName));

      return matchesRegion && matchesVendor;
    });

    const orderIds = new Set(orders.map((order) => order.id));
    const orderCustomerNames = new Set(orders.map((order) => this.normalizeText(order.customerName)));

    const drivers = source.drivers.filter((driver) => {
      const matchesRegion = regionFilter === 'all' || this.cityToRegionKey(driver.city) === regionFilter;
      const matchesVendor = !selectedVendor || !orders.length || orders.some((order) => this.cityMatches(order.city, driver.city));
      return matchesRegion && matchesVendor;
    });

    const customers = source.customers.filter((customer) => {
      const hasMatchedOrder = customer.recentOrders.some((order) => orderIds.has(order.id));
      const matchesRegion = regionFilter === 'all'
        || orderCustomerNames.has(this.normalizeText(customer.name))
        || orders.some((order) => this.normalizeText(order.customerName) === this.normalizeText(customer.name));

      return (!selectedVendor && regionFilter === 'all') || hasMatchedOrder || matchesRegion;
    });

    const disputes = source.disputes.filter((dispute) => orderIds.has(dispute.orderId));

    const vendors = source.vendors.filter((vendor) => {
      const matchesRegion = regionFilter === 'all' || this.cityToRegionKey(vendor.city || '') === regionFilter;
      const matchesVendor = !selectedVendor || vendor.id === selectedVendor.id;
      return matchesRegion && matchesVendor;
    });

    return {
      ...source,
      orders,
      drivers,
      customers,
      disputes,
      vendors
    };
  }

  private buildKpis(
    source: DashboardSourceSnapshot,
    filtered: DashboardSourceSnapshot,
    filterState: DashboardFilterState,
    lang: 'ar' | 'en'
  ): DashboardKpiCard[] {
    const baseline = KPI_BASELINES[filterState.dateRange];
    const factor = this.resolveScopeFactor(source, filtered);
    const atRiskOrders = this.getAtRiskOrders(filtered.orders);
    const openDisputes = filtered.disputes.filter((dispute) => dispute.status !== 'resolved');
    const vendorBacklogCount = filtered.vendors.filter((vendor) =>
      vendor.reviewState === 'submitted'
      || vendor.reviewState === 'under_review'
      || vendor.reviewState === 'changes_requested'
      || vendor.reviewState === 'awaiting_submission'
      || vendor.status === 'Suspended'
    ).length;
    const driverBacklogCount = filtered.drivers.filter((driver) => this.getDriverReadiness(driver) !== 'ready').length;
    const paymentIssueCount = filtered.orders.filter((order) =>
      order.paymentStatus === 'FAILED' || order.paymentStatus === 'PENDING' || order.paymentStatus === 'COD_PENDING'
    ).length;
    const onTimeDirection = atRiskOrders.length > Math.max(1, Math.floor(filtered.orders.length / 3)) ? 'down' : 'up';

    const gmvValue = this.scaleNumber(baseline.gmv, factor, 25000);
    const completedOrdersValue = this.scaleNumber(baseline.completedOrders, factor, 120);
    const onTimeRate = this.clampNumber(
      baseline.onTimeRate - Math.min(4.6, atRiskOrders.length * 0.4) + Math.min(1.4, filtered.orders.length * 0.08),
      76.5,
      98.4
    );
    const atRiskValue = Math.max(atRiskOrders.length * 7, this.scaleNumber(baseline.ordersAtRisk, factor, 18));
    const disputeExposure = Math.max(
      Math.round(openDisputes.reduce((sum, dispute) => sum + dispute.amount, 0) * 900),
      this.scaleNumber(baseline.disputeExposure, factor, 15000)
    );
    const vendorBacklogDisplay = Math.max(vendorBacklogCount * 3, this.scaleNumber(baseline.vendorBacklog, factor, 6));
    const driverBacklogDisplay = Math.max(driverBacklogCount * 2, this.scaleNumber(baseline.driverBacklog, factor, 4));

    return [
      {
        id: 'gmv',
        labelKey: 'DASHBOARD.KPI.GMV',
        value: this.formatNumber(gmvValue, lang),
        unitLabel: 'SAR',
        trendLabel: this.localizeTrend('+8.6% vs yesterday', '+8.6% مقابل أمس', lang),
        trendDirection: 'up',
        contextKey: 'DASHBOARD.KPI_CONTEXT.GMV',
        severity: 'neutral'
      },
      {
        id: 'completed-orders',
        labelKey: 'DASHBOARD.KPI.COMPLETED_ORDERS',
        value: this.formatNumber(completedOrdersValue, lang),
        trendLabel: this.localizeTrend('+5.1% vs yesterday', '+5.1% مقابل أمس', lang),
        trendDirection: 'up',
        contextKey: 'DASHBOARD.KPI_CONTEXT.COMPLETED_ORDERS',
        severity: 'success'
      },
      {
        id: 'on-time-rate',
        labelKey: 'DASHBOARD.KPI.ON_TIME_RATE',
        value: `${onTimeRate.toFixed(1)}%`,
        trendLabel: onTimeDirection === 'down'
          ? this.localizeTrend('-2.4 pts', '-2.4 نقطة', lang)
          : this.localizeTrend('+0.8 pts', '+0.8 نقطة', lang),
        trendDirection: onTimeDirection,
        contextKey: 'DASHBOARD.KPI_CONTEXT.ON_TIME_RATE',
        severity: onTimeDirection === 'down' ? 'warning' : 'success'
      },
      {
        id: 'orders-at-risk',
        labelKey: 'DASHBOARD.KPI.ORDERS_AT_RISK',
        value: this.formatNumber(atRiskValue, lang),
        trendLabel: `+${Math.max(31, paymentIssueCount * 3)}`,
        trendDirection: 'up',
        contextKey: 'DASHBOARD.KPI_CONTEXT.ORDERS_AT_RISK',
        severity: 'critical'
      },
      {
        id: 'open-dispute-exposure',
        labelKey: 'DASHBOARD.KPI.DISPUTE_EXPOSURE',
        value: this.formatNumber(disputeExposure, lang),
        unitLabel: 'SAR',
        trendLabel: this.localizeTrend('+18% vs yesterday', '+18% مقابل أمس', lang),
        trendDirection: openDisputes.length > 0 ? 'up' : 'flat',
        contextKey: 'DASHBOARD.KPI_CONTEXT.DISPUTE_EXPOSURE',
        severity: openDisputes.length > 0 ? 'warning' : 'success'
      },
      {
        id: 'supply-backlog',
        labelKey: 'DASHBOARD.KPI.SUPPLY_BACKLOG',
        value: `${this.formatNumber(vendorBacklogDisplay, lang)} + ${this.formatNumber(driverBacklogDisplay, lang)}`,
        trendLabel: this.localizeTrend('+9 queue pressure', '+9 ضغط تشغيلي', lang),
        trendDirection: 'up',
        contextKey: 'DASHBOARD.KPI_CONTEXT.SUPPLY_BACKLOG',
        severity: vendorBacklogCount + driverBacklogCount > 0 ? 'warning' : 'success'
      }
    ];
  }

  private buildAlerts(
    filtered: DashboardSourceSnapshot,
    regionAggregations: RegionAggregation[],
    selectedVendor: VendorDetail | null,
    lang: 'ar' | 'en'
  ): DashboardAlert[] {
    const alerts: DashboardAlert[] = [];
    const criticalDisputes = filtered.disputes.filter((dispute) => dispute.priority === 'critical' && dispute.status !== 'resolved');
    const paymentFailures = filtered.orders.filter((order) => order.paymentStatus === 'FAILED');
    const supplyBlocked = filtered.vendors.filter((vendor) => vendor.payoutStatus === 'Blocked' || vendor.reviewState === 'suspended').length
      + filtered.drivers.filter((driver) => this.getDriverReadiness(driver) === 'blocked').length;
    const topRegion = regionAggregations[0];

    if (paymentFailures.length) {
      alerts.push({
        id: 'payment-failure-spike',
        severity: 'critical',
        titleKey: 'DASHBOARD.ALERTS.PAYMENT_FAILURE.TITLE',
        summaryKey: 'DASHBOARD.ALERTS.PAYMENT_FAILURE.SUMMARY',
        summaryParams: {
          count: paymentFailures.length,
          scope: topRegion?.regionLabel || this.localizeWord('All regions', 'كل المناطق', lang)
        },
        affectedCount: paymentFailures.length,
        actionLabelKey: 'DASHBOARD.ACTIONS.REVIEW_PAYMENTS',
        route: '/finances/ledger'
      });
    }

    if (criticalDisputes.length) {
      alerts.push({
        id: 'critical-disputes',
        severity: 'critical',
        titleKey: 'DASHBOARD.ALERTS.DISPUTE_CLUSTER.TITLE',
        summaryKey: 'DASHBOARD.ALERTS.DISPUTE_CLUSTER.SUMMARY',
        summaryParams: {
          count: criticalDisputes.length,
          exposure: this.formatNumber(Math.round(criticalDisputes.reduce((sum, dispute) => sum + dispute.amount, 0) * 900), lang)
        },
        affectedCount: criticalDisputes.length,
        actionLabelKey: 'DASHBOARD.ACTIONS.OPEN_DISPUTES',
        route: '/disputes'
      });
    }

    if (supplyBlocked > 0) {
      alerts.push({
        id: 'supply-backlog',
        severity: 'warning',
        titleKey: 'DASHBOARD.ALERTS.SUPPLY_BACKLOG.TITLE',
        summaryKey: 'DASHBOARD.ALERTS.SUPPLY_BACKLOG.SUMMARY',
        summaryParams: {
          count: supplyBlocked,
          vendor: selectedVendor ? this.getVendorName(selectedVendor, lang) : this.localizeWord('the active network', 'الشبكة الحالية', lang)
        },
        affectedCount: supplyBlocked,
        actionLabelKey: 'DASHBOARD.ACTIONS.OPEN_SUPPLY',
        route: selectedVendor ? `/vendors/${selectedVendor.id}` : '/vendors'
      });
    }

    if (!this.authService.hasApiSession) {
      alerts.push({
        id: 'snapshot-mode',
        severity: 'info',
        titleKey: 'DASHBOARD.ALERTS.SNAPSHOT_MODE.TITLE',
        summaryKey: 'DASHBOARD.ALERTS.SNAPSHOT_MODE.SUMMARY',
        affectedCount: 1,
        actionLabelKey: 'DASHBOARD.ACTIONS.REFRESH',
        route: '/dashboard'
      });
    }

    return alerts.slice(0, 4);
  }

  private buildInsights(
    filtered: DashboardSourceSnapshot,
    regionAggregations: RegionAggregation[],
    vendorLeaderboard: DashboardLeaderboardRow[],
    lang: 'ar' | 'en'
  ): DashboardInsight[] {
    const insights: DashboardInsight[] = [];
    const mostPressuredRegion = regionAggregations[0];
    const leadingVendor = vendorLeaderboard[0];
    const lowestDriverReadiness = this.findLowestDriverReadinessRegion(filtered.drivers, lang);

    if (mostPressuredRegion) {
      const dropPercent = Math.min(26, 12 + Math.round(mostPressuredRegion.score * 1.8));
      insights.push({
        id: 'orders-drop-region',
        type: 'critical',
        messageKey: 'DASHBOARD.INSIGHTS.ORDER_DROP',
        messageParams: {
          region: mostPressuredRegion.regionLabel,
          drop: dropPercent,
          paymentIssues: mostPressuredRegion.paymentIssues
        },
        actionLabelKey: 'DASHBOARD.ACTIONS.OPEN_OPERATIONS',
        route: '/orders',
        supportingMetric: `${mostPressuredRegion.lateOrders} late`
      });
    }

    if (leadingVendor) {
      insights.push({
        id: 'vendor-complaint-share',
        type: 'warning',
        messageKey: 'DASHBOARD.INSIGHTS.VENDOR_PRESSURE',
        messageParams: {
          vendor: leadingVendor.title,
          complaintsShare: Math.max(18, Math.round(leadingVendor.progress)),
          gmvShare: Math.max(11, Math.round(Number(leadingVendor.secondaryValue.replace('%', '')) || 11))
        },
        actionLabelKey: 'DASHBOARD.ACTIONS.REVIEW_VENDOR',
        route: leadingVendor.route,
        supportingMetric: leadingVendor.metricValue
      });
    }

    if (lowestDriverReadiness) {
      insights.push({
        id: 'driver-readiness-region',
        type: 'warning',
        messageKey: 'DASHBOARD.INSIGHTS.DRIVER_READINESS',
        messageParams: {
          region: lowestDriverReadiness.regionLabel,
          readiness: lowestDriverReadiness.readiness,
          dispatches: lowestDriverReadiness.atRiskDispatches
        },
        actionLabelKey: 'DASHBOARD.ACTIONS.OPEN_DRIVERS',
        route: '/drivers',
        supportingMetric: `${lowestDriverReadiness.atRiskDispatches} at-risk`
      });
    }

    return insights;
  }

  private buildLiveQueues(filtered: DashboardSourceSnapshot): DashboardOperationalQueue[] {
    const prepQueue = filtered.orders.filter((order) => order.workflowStage === 'PREPARATION').length;
    const dispatchQueue = filtered.orders.filter((order) => order.workflowStage === 'DISPATCH').length;
    const lateOrders = filtered.orders.filter((order) => order.isLate).length;
    const paymentReview = filtered.orders.filter((order) =>
      order.paymentStatus === 'FAILED' || order.paymentStatus === 'PENDING' || order.paymentStatus === 'COD_PENDING'
    ).length;

    return [
      {
        id: 'preparation',
        labelKey: 'DASHBOARD.QUEUES.PREPARATION',
        count: prepQueue,
        delta: `+${Math.max(6, prepQueue * 2)}`,
        tone: prepQueue > 0 ? 'warning' : 'success',
        helperKey: 'DASHBOARD.QUEUE_HELPERS.PREPARATION',
        route: '/orders'
      },
      {
        id: 'dispatch',
        labelKey: 'DASHBOARD.QUEUES.DISPATCH',
        count: dispatchQueue,
        delta: `+${Math.max(4, dispatchQueue)}`,
        tone: dispatchQueue > 0 ? 'info' : 'neutral',
        helperKey: 'DASHBOARD.QUEUE_HELPERS.DISPATCH',
        route: '/orders'
      },
      {
        id: 'late-orders',
        labelKey: 'DASHBOARD.QUEUES.LATE_ORDERS',
        count: lateOrders,
        delta: `+${Math.max(3, lateOrders)}`,
        tone: lateOrders > 0 ? 'critical' : 'success',
        helperKey: 'DASHBOARD.QUEUE_HELPERS.LATE_ORDERS',
        route: '/orders'
      },
      {
        id: 'payment-review',
        labelKey: 'DASHBOARD.QUEUES.PAYMENT_REVIEW',
        count: paymentReview,
        delta: `+${Math.max(2, paymentReview)}`,
        tone: paymentReview > 0 ? 'critical' : 'success',
        helperKey: 'DASHBOARD.QUEUE_HELPERS.PAYMENT_REVIEW',
        route: '/orders'
      }
    ];
  }

  private buildRiskQueues(filtered: DashboardSourceSnapshot): DashboardOperationalQueue[] {
    const openDisputes = filtered.disputes.filter((dispute) => dispute.status !== 'resolved').length;
    const vendorBacklog = filtered.vendors.filter((vendor) =>
      vendor.reviewState === 'under_review'
      || vendor.reviewState === 'submitted'
      || vendor.reviewState === 'changes_requested'
      || vendor.reviewState === 'awaiting_submission'
    ).length;
    const customerReview = filtered.customers.filter((customer) =>
      customer.reviewState === 'flagged' || customer.reviewState === 'escalated'
    ).length;
    const driverHolds = filtered.drivers.filter((driver) =>
      driver.collectionPaymentStatus === 'critical'
      || driver.verificationStatus === 'Suspended'
      || driver.status === 'Suspended'
    ).length;

    return [
      {
        id: 'open-disputes',
        labelKey: 'DASHBOARD.RISK_QUEUES.OPEN_DISPUTES',
        count: openDisputes,
        delta: `+${Math.max(2, openDisputes)}`,
        tone: openDisputes > 0 ? 'critical' : 'success',
        helperKey: 'DASHBOARD.RISK_HELPERS.OPEN_DISPUTES',
        route: '/disputes'
      },
      {
        id: 'vendor-backlog',
        labelKey: 'DASHBOARD.RISK_QUEUES.VENDOR_BACKLOG',
        count: vendorBacklog,
        delta: `+${Math.max(2, vendorBacklog)}`,
        tone: vendorBacklog > 0 ? 'warning' : 'success',
        helperKey: 'DASHBOARD.RISK_HELPERS.VENDOR_BACKLOG',
        route: '/vendors'
      },
      {
        id: 'customer-review',
        labelKey: 'DASHBOARD.RISK_QUEUES.CUSTOMER_REVIEW',
        count: customerReview,
        delta: `+${Math.max(1, customerReview)}`,
        tone: customerReview > 0 ? 'warning' : 'success',
        helperKey: 'DASHBOARD.RISK_HELPERS.CUSTOMER_REVIEW',
        route: '/customers'
      },
      {
        id: 'driver-holds',
        labelKey: 'DASHBOARD.RISK_QUEUES.DRIVER_HOLDS',
        count: driverHolds,
        delta: `+${Math.max(2, driverHolds)}`,
        tone: driverHolds > 0 ? 'critical' : 'success',
        helperKey: 'DASHBOARD.RISK_HELPERS.DRIVER_HOLDS',
        route: '/drivers'
      }
    ];
  }

  private buildHourlyFunnel(
    filterState: DashboardFilterState,
    filtered: DashboardSourceSnapshot
  ): DashboardTrendSeries {
    const template = filterState.dateRange === 'month'
      ? MONTH_FUNNEL_TEMPLATE
      : filterState.dateRange === 'week'
        ? WEEK_FUNNEL_TEMPLATE
        : TODAY_FUNNEL_TEMPLATE;
    const volumeFactor = Math.max(0.28, this.resolveVolumeFactor(filtered.orders.length, filterState.dateRange));
    const failureBoost = filtered.orders.filter((order) => order.paymentStatus === 'FAILED' || order.hasActiveIssue).length;

    return {
      id: 'hourly-funnel',
      labelKey: 'DASHBOARD.CHARTS.ORDER_FUNNEL',
      comparisonMode: 'stacked',
      points: template.map((point) => {
        const segments = [
          { id: 'new', labelKey: 'DASHBOARD.CHART_SEGMENTS.NEW', value: this.scaleNumber(point.segments.new, volumeFactor, 4), tone: 'info' as const },
          { id: 'preparing', labelKey: 'DASHBOARD.CHART_SEGMENTS.PREPARING', value: this.scaleNumber(point.segments.preparing, volumeFactor, 4), tone: 'warning' as const },
          { id: 'dispatch', labelKey: 'DASHBOARD.CHART_SEGMENTS.DISPATCH', value: this.scaleNumber(point.segments.dispatch, volumeFactor, 3), tone: 'neutral' as const },
          { id: 'delivered', labelKey: 'DASHBOARD.CHART_SEGMENTS.DELIVERED', value: this.scaleNumber(point.segments.delivered, volumeFactor, 3), tone: 'success' as const },
          { id: 'failed', labelKey: 'DASHBOARD.CHART_SEGMENTS.FAILED', value: this.scaleNumber(point.segments.failed, volumeFactor, Math.max(1, failureBoost)), tone: 'critical' as const }
        ];

        return {
          label: point.label,
          value: segments.reduce((sum, segment) => sum + segment.value, 0),
          segments
        };
      })
    };
  }

  private buildRevenueTrend(
    filterState: DashboardFilterState,
    filtered: DashboardSourceSnapshot
  ): DashboardTrendSeries {
    const factor = Math.max(0.25, this.resolveVolumeFactor(filtered.orders.length, filterState.dateRange));
    const openExposure = filtered.disputes.filter((dispute) => dispute.status !== 'resolved').length;

    return {
      id: 'revenue-quality',
      labelKey: 'DASHBOARD.CHARTS.REVENUE_QUALITY',
      comparisonMode: 'dual',
      points: REVENUE_TREND_TEMPLATES[filterState.dateRange].map((point) => ({
        label: point.label,
        value: this.scaleNumber(point.value, factor, 8000),
        secondaryValue: this.scaleNumber(point.secondaryValue ?? 0, factor, openExposure * 1200)
      }))
    };
  }

  private buildVendorLeaderboard(
    filtered: DashboardSourceSnapshot,
    lang: 'ar' | 'en'
  ): DashboardLeaderboardRow[] {
    const disputesByOrderId = new Map(filtered.disputes.map((dispute) => [dispute.orderId, dispute]));
    const totalComplaints = Math.max(1, filtered.vendors.reduce((sum, vendor) => sum + (vendor.complaintsCount ?? 0), 0));
    const totalGmv = Math.max(1, filtered.orders.reduce((sum, order) => sum + order.total, 0));

    return filtered.vendors
      .map((vendor) => {
        const vendorOrders = filtered.orders.filter((order) => this.orderMatchesVendor(order, vendor));
        const vendorGmv = vendorOrders.reduce((sum, order) => sum + order.total, 0);
        const vendorDisputeExposure = vendorOrders.reduce((sum, order) => sum + (disputesByOrderId.get(order.id)?.amount ?? 0), 0);
        const complaintShare = ((vendor.complaintsCount ?? 0) / totalComplaints) * 100;
        const gmvShare = (vendorGmv / totalGmv) * 100;
        const pressureScore = vendorDisputeExposure * 12 + complaintShare * 4 + ((vendor.hasFraudFlag || vendor.isLowPerformance) ? 25 : 0);

        return {
          id: vendor.id,
          title: this.getVendorName(vendor, lang),
          subtitle: this.localizeVendorSubtitle(vendor, lang),
          metricValue: `${this.formatNumber(Math.round(vendorDisputeExposure * 900), lang)} SAR`,
          metricLabelKey: 'DASHBOARD.TABLES.VENDOR_DISPUTE_EXPOSURE',
          secondaryValue: `${Math.max(4, Math.round(gmvShare))}%`,
          secondaryLabelKey: 'DASHBOARD.TABLES.VENDOR_GMV_SHARE',
          progress: this.clampNumber(complaintShare * 4, 8, 96),
          tone: pressureScore > 120 ? 'critical' : pressureScore > 70 ? 'warning' : 'info',
          route: `/vendors/${vendor.id}`
        } satisfies DashboardLeaderboardRow;
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  }

  private buildAttentionItems(
    filtered: DashboardSourceSnapshot,
    lang: 'ar' | 'en'
  ): DashboardAttentionItem[] {
    const items: DashboardAttentionItem[] = [];

    filtered.orders
      .filter((order) => order.isLate || order.hasActiveIssue || order.paymentStatus === 'FAILED')
      .slice(0, 2)
      .forEach((order) => {
        items.push({
          id: `order-${order.id}`,
          entityLabelKey: 'DASHBOARD.ENTITY.ORDER',
          entityName: order.displayId,
          summary: order.alertLabel,
          owner: order.operationalCase?.queueLabel || this.localizeWord('Operations', 'العمليات', lang),
          priority: order.paymentStatus === 'FAILED' ? 'critical' : order.isLate ? 'warning' : 'info',
          route: `/orders/${order.id}`,
          ctaLabelKey: 'DASHBOARD.ACTIONS.OPEN_ORDER'
        });
      });

    const criticalDispute = filtered.disputes.find((dispute) => dispute.priority === 'critical' && dispute.status !== 'resolved');
    if (criticalDispute) {
      items.push({
        id: `dispute-${criticalDispute.id}`,
        entityLabelKey: 'DASHBOARD.ENTITY.DISPUTE',
        entityName: criticalDispute.id,
        summary: criticalDispute.reason,
        owner: criticalDispute.owner,
        priority: 'critical',
        route: '/disputes',
        ctaLabelKey: 'DASHBOARD.ACTIONS.OPEN_DISPUTES'
      });
    }

    const riskyVendor = filtered.vendors.find((vendor) => vendor.riskLevel === 'Critical' || vendor.hasFraudFlag);
    if (riskyVendor) {
      items.push({
        id: `vendor-${riskyVendor.id}`,
        entityLabelKey: 'DASHBOARD.ENTITY.VENDOR',
        entityName: this.getVendorName(riskyVendor, lang),
        summary: this.localizeWord('Review queue and payouts require manual decision.', 'طابور المراجعة والتحويلات يحتاج قرارًا يدويًا.', lang),
        owner: riskyVendor.assignedReviewer || this.localizeWord('Vendor Compliance Desk', 'مكتب امتثال التجار', lang),
        priority: 'warning',
        route: `/finances/refunds?entityType=vendor&entityId=${riskyVendor.id}`,
        ctaLabelKey: 'DASHBOARD.ACTIONS.REVIEW_VENDOR'
      });
    }

    const blockedDriver = filtered.drivers.find((driver) => this.getDriverReadiness(driver) === 'blocked');
    if (blockedDriver) {
      items.push({
        id: `driver-${blockedDriver.id}`,
        entityLabelKey: 'DASHBOARD.ENTITY.DRIVER',
        entityName: `${blockedDriver.firstName} ${blockedDriver.lastName}`,
        summary: this.localizeWord('Finance/compliance hold is blocking dispatch readiness.', 'تعليق مالي أو امتثال يمنع جاهزية الإسناد.', lang),
        owner: blockedDriver.city,
        priority: 'critical',
        route: `/finances/settlements?entityType=driver&entityId=${blockedDriver.id}`,
        ctaLabelKey: 'DASHBOARD.ACTIONS.OPEN_DRIVER'
      });
    }

    const escalatedCustomer = filtered.customers.find((customer) => customer.reviewState === 'escalated');
    if (escalatedCustomer) {
      items.push({
        id: `customer-${escalatedCustomer.id}`,
        entityLabelKey: 'DASHBOARD.ENTITY.CUSTOMER',
        entityName: escalatedCustomer.name,
        summary: escalatedCustomer.analysisSummary,
        owner: escalatedCustomer.accountTeam,
        priority: 'warning',
        route: `/customers/${escalatedCustomer.id}`,
        ctaLabelKey: 'DASHBOARD.ACTIONS.OPEN_CUSTOMER'
      });
    }

    return items.slice(0, 6);
  }

  private buildAuditItems(
    filtered: DashboardSourceSnapshot,
    lang: 'ar' | 'en'
  ): DashboardAuditItem[] {
    const reviewBacklog = filtered.vendors.filter((vendor) =>
      vendor.reviewState === 'under_review' || vendor.reviewState === 'submitted' || vendor.reviewState === 'changes_requested'
    ).length;
    const customerEscalations = filtered.customers.filter((customer) => customer.reviewState === 'escalated').length;
    const disputeOpen = filtered.disputes.filter((dispute) => dispute.status !== 'resolved').length;

    return [
      {
        id: 'system-mode',
        titleKey: 'DASHBOARD.AUDIT.SYSTEM_MODE',
        subtitleKey: this.authService.hasApiSession
          ? 'DASHBOARD.AUDIT.SYSTEM_MODE_LIVE'
          : 'DASHBOARD.AUDIT.SYSTEM_MODE_SNAPSHOT',
        tone: this.authService.hasApiSession ? 'success' : 'info',
        timeLabel: this.formatTimestamp(lang),
        route: '/dashboard'
      },
      {
        id: 'vendor-review',
        titleKey: 'DASHBOARD.AUDIT.VENDOR_REVIEW',
        subtitleKey: 'DASHBOARD.AUDIT.VENDOR_REVIEW_SUMMARY',
        subtitleParams: { count: reviewBacklog },
        tone: reviewBacklog > 0 ? 'warning' : 'success',
        timeLabel: this.localizeWord('7 min ago', 'منذ 7 دقائق', lang),
        route: '/vendors'
      },
      {
        id: 'dispute-pulse',
        titleKey: 'DASHBOARD.AUDIT.DISPUTE_PULSE',
        subtitleKey: 'DASHBOARD.AUDIT.DISPUTE_PULSE_SUMMARY',
        subtitleParams: { count: disputeOpen },
        tone: disputeOpen > 0 ? 'critical' : 'success',
        timeLabel: this.localizeWord('12 min ago', 'منذ 12 دقيقة', lang),
        route: '/disputes'
      },
      {
        id: 'customer-risk',
        titleKey: 'DASHBOARD.AUDIT.CUSTOMER_RISK',
        subtitleKey: 'DASHBOARD.AUDIT.CUSTOMER_RISK_SUMMARY',
        subtitleParams: { count: customerEscalations },
        tone: customerEscalations > 0 ? 'warning' : 'neutral',
        timeLabel: this.localizeWord('18 min ago', 'منذ 18 دقيقة', lang),
        route: '/customers'
      }
    ];
  }

  private buildVendorSupplyReadiness(vendors: VendorDetail[]): DashboardSupplyBucket[] {
    const total = Math.max(1, vendors.length);
    const verified = vendors.filter((vendor) => vendor.reviewState === 'verified').length;
    const review = vendors.filter((vendor) => vendor.reviewState === 'submitted' || vendor.reviewState === 'under_review').length;
    const blocked = vendors.filter((vendor) =>
      vendor.reviewState === 'changes_requested'
      || vendor.reviewState === 'awaiting_submission'
      || vendor.reviewState === 'suspended'
      || vendor.reviewState === 'rejected'
    ).length;

    return [
      { id: 'vendors-verified', labelKey: 'DASHBOARD.SUPPLY.VENDORS_VERIFIED', count: verified, share: (verified / total) * 100, tone: 'success' },
      { id: 'vendors-review', labelKey: 'DASHBOARD.SUPPLY.VENDORS_UNDER_REVIEW', count: review, share: (review / total) * 100, tone: 'warning' },
      { id: 'vendors-blocked', labelKey: 'DASHBOARD.SUPPLY.VENDORS_BLOCKED', count: blocked, share: (blocked / total) * 100, tone: 'critical' }
    ];
  }

  private buildDriverSupplyReadiness(drivers: Driver[]): DashboardSupplyBucket[] {
    const total = Math.max(1, drivers.length);
    const ready = drivers.filter((driver) => this.getDriverReadiness(driver) === 'ready').length;
    const limited = drivers.filter((driver) => this.getDriverReadiness(driver) === 'limited').length;
    const blocked = drivers.filter((driver) => this.getDriverReadiness(driver) === 'blocked').length;

    return [
      { id: 'drivers-ready', labelKey: 'DASHBOARD.SUPPLY.DRIVERS_READY', count: ready, share: (ready / total) * 100, tone: 'success' },
      { id: 'drivers-limited', labelKey: 'DASHBOARD.SUPPLY.DRIVERS_LIMITED', count: limited, share: (limited / total) * 100, tone: 'warning' },
      { id: 'drivers-blocked', labelKey: 'DASHBOARD.SUPPLY.DRIVERS_BLOCKED', count: blocked, share: (blocked / total) * 100, tone: 'critical' }
    ];
  }

  private buildCatalogPulse(filtered: DashboardSourceSnapshot): DashboardCatalogPulse {
    const categoryFrequency = new Map<string, number>();
    filtered.products.forEach((product) => {
      categoryFrequency.set(product.categoryId, (categoryFrequency.get(product.categoryId) || 0) + 1);
    });

    const sortedCategoryLoads = [...categoryFrequency.values()].sort((a, b) => b - a);
    const topThree = sortedCategoryLoads.slice(0, 3).reduce((sum, value) => sum + value, 0);
    const concentration = filtered.products.length ? Math.round((topThree / filtered.products.length) * 100) : 0;

    return {
      products: filtered.products.length,
      brands: filtered.brands.length,
      categories: filtered.categories.length,
      concentrationLabel: `${concentration}%`
    };
  }

  private buildRegionAggregations(
    orders: OrderDetail[],
    drivers: Driver[],
    lang: 'ar' | 'en'
  ): RegionAggregation[] {
    const orderMap = new Map<string, RegionAggregation>();

    orders.forEach((order) => {
      const regionKey = this.cityToRegionKey(order.city || '');
      const entry = orderMap.get(regionKey) ?? {
        regionKey,
        regionLabel: this.localizeRegion(regionKey, lang),
        lateOrders: 0,
        paymentIssues: 0,
        readyDrivers: 0,
        limitedDrivers: 0,
        blockedDrivers: 0,
        score: 0
      };

      if (order.isLate) {
        entry.lateOrders += 1;
      }

      if (order.paymentStatus === 'FAILED' || order.paymentStatus === 'PENDING' || order.paymentStatus === 'COD_PENDING') {
        entry.paymentIssues += 1;
      }

      orderMap.set(regionKey, entry);
    });

    drivers.forEach((driver) => {
      const regionKey = this.cityToRegionKey(driver.city);
      const entry = orderMap.get(regionKey) ?? {
        regionKey,
        regionLabel: this.localizeRegion(regionKey, lang),
        lateOrders: 0,
        paymentIssues: 0,
        readyDrivers: 0,
        limitedDrivers: 0,
        blockedDrivers: 0,
        score: 0
      };

      const readiness = this.getDriverReadiness(driver);
      if (readiness === 'ready') {
        entry.readyDrivers += 1;
      } else if (readiness === 'limited') {
        entry.limitedDrivers += 1;
      } else {
        entry.blockedDrivers += 1;
      }

      orderMap.set(regionKey, entry);
    });

    return [...orderMap.values()].map((entry) => ({
      ...entry,
      score: entry.lateOrders * 4 + entry.paymentIssues * 5 + entry.limitedDrivers * 2 + entry.blockedDrivers * 3
    }));
  }

  private buildRegionOptions(
    source: DashboardSourceSnapshot,
    lang: 'ar' | 'en'
  ): DashboardFilterOption[] {
    const regionCounts = new Map<string, number>();

    [...source.orders.map((order) => this.cityToRegionKey(order.city || '')), ...source.vendors.map((vendor) => this.cityToRegionKey(vendor.city || ''))]
      .forEach((regionKey) => regionCounts.set(regionKey, (regionCounts.get(regionKey) || 0) + 1));

    return [
      {
        value: 'all',
        label: this.localizeWord('All regions', 'كل المناطق', lang),
        count: source.orders.length
      },
      ...[...regionCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({
          value,
          label: this.localizeRegion(value, lang),
          count
        }))
    ];
  }

  private buildVendorOptions(vendors: VendorDetail[], lang: 'ar' | 'en'): DashboardFilterOption[] {
    return [
      {
        value: 'all',
        label: this.localizeWord('All vendors', 'كل التجار', lang),
        count: vendors.length
      },
      ...vendors.map((vendor) => ({
        value: vendor.id,
        label: this.getVendorName(vendor, lang),
        count: vendor.complaintsCount ?? 0
      }))
    ];
  }

  private findLowestDriverReadinessRegion(drivers: Driver[], lang: 'ar' | 'en'): { regionLabel: string; readiness: number; atRiskDispatches: number } | null {
    const totals = new Map<string, { ready: number; total: number }>();

    drivers.forEach((driver) => {
      const regionKey = this.cityToRegionKey(driver.city);
      const entry = totals.get(regionKey) ?? { ready: 0, total: 0 };
      entry.total += 1;
      if (this.getDriverReadiness(driver) === 'ready') {
        entry.ready += 1;
      }
      totals.set(regionKey, entry);
    });

    const ranked = [...totals.entries()]
      .map(([regionKey, value]) => {
        const readiness = value.total ? Math.round((value.ready / value.total) * 100) : 0;
        return {
          regionLabel: this.localizeRegion(regionKey, lang),
          readiness,
          atRiskDispatches: Math.max(7, Math.round((100 - readiness) * 0.75))
        };
      })
      .sort((a, b) => a.readiness - b.readiness);

    return ranked[0] ?? null;
  }

  private resolveScopeFactor(source: DashboardSourceSnapshot, filtered: DashboardSourceSnapshot): number {
    const orderShare = filtered.orders.length / Math.max(1, source.orders.length);
    const vendorShare = filtered.vendors.length / Math.max(1, source.vendors.length);
    const driverShare = filtered.drivers.length / Math.max(1, source.drivers.length);
    return Math.max(orderShare, vendorShare, driverShare) || 1;
  }

  private resolveVolumeFactor(orderCount: number, range: DashboardDateRange): number {
    const baseline = range === 'today' ? 6 : range === 'week' ? 18 : 42;
    return orderCount / baseline;
  }

  private resolveScopeLabel(
    filterState: DashboardFilterState,
    selectedVendor: VendorDetail | null,
    lang: 'ar' | 'en'
  ): string {
    if (selectedVendor) {
      return this.getVendorName(selectedVendor, lang);
    }

    if (filterState.region !== 'all') {
      return this.localizeRegion(filterState.region, lang);
    }

    return this.localizeWord('All network', 'كل الشبكة', lang);
  }

  private localizeRange(range: DashboardDateRange, lang: 'ar' | 'en'): string {
    const labels: Record<DashboardDateRange, { ar: string; en: string }> = {
      today: { ar: 'اليوم', en: 'Today' },
      week: { ar: '7 أيام', en: '7 Days' },
      month: { ar: '30 يومًا', en: '30 Days' }
    };

    return labels[range][lang];
  }

  private localizeRegion(regionKey: string, lang: 'ar' | 'en'): string {
    const labels: Record<string, { ar: string; en: string }> = {
      central: { ar: 'المنطقة الوسطى', en: 'Central Region' },
      western: { ar: 'المنطقة الغربية', en: 'Western Region' },
      eastern: { ar: 'المنطقة الشرقية', en: 'Eastern Region' },
      northern: { ar: 'المنطقة الشمالية', en: 'Northern Region' },
      southern: { ar: 'المنطقة الجنوبية', en: 'Southern Region' },
      other: { ar: 'مناطق أخرى', en: 'Other Regions' }
    };

    return (labels[regionKey] ?? labels['other'])[lang];
  }

  private localizeModeLabel(mode: 'live' | 'snapshot', lang: 'ar' | 'en'): string {
    return mode === 'live'
      ? this.localizeWord('Live data', 'بيانات مباشرة', lang)
      : this.localizeWord('Snapshot mode', 'وضع اللقطة المحلية', lang);
  }

  private localizeTrend(english: string, arabic: string, lang: 'ar' | 'en'): string {
    return lang === 'ar' ? arabic : english;
  }

  private localizeWord(english: string, arabic: string, lang: 'ar' | 'en'): string {
    return lang === 'ar' ? arabic : english;
  }

  private localizeVendorSubtitle(vendor: Vendor | VendorDetail, lang: 'ar' | 'en'): string {
    const city = vendor.city || this.localizeWord('Unknown city', 'مدينة غير محددة', lang);
    const type = vendor.businessType || this.localizeWord('Vendor', 'تاجر', lang);
    return `${type} · ${city}`;
  }

  private cityToRegionKey(city: string): string {
    const normalized = this.normalizeText(city);

    if (['الرياض', 'riyadh'].some((entry) => normalized.includes(entry))) {
      return 'central';
    }
    if (['جدة', 'مكة', 'المدينة', 'الطائف', 'jeddah', 'makkah', 'medina', 'taif'].some((entry) => normalized.includes(entry))) {
      return 'western';
    }
    if (['الدمام', 'الخبر', 'الشرقية', 'dammam', 'khobar'].some((entry) => normalized.includes(entry))) {
      return 'eastern';
    }
    if (['تبوك', 'حائل', 'tabuk', 'hail'].some((entry) => normalized.includes(entry))) {
      return 'northern';
    }
    if (['أبها', 'جازان', 'abha', 'jazan'].some((entry) => normalized.includes(entry))) {
      return 'southern';
    }

    return 'other';
  }

  private getDriverReadiness(driver: Driver): 'ready' | 'limited' | 'blocked' {
    if (
      driver.status === 'Suspended'
      || driver.verificationStatus === 'Suspended'
      || driver.collectionPaymentStatus === 'critical'
    ) {
      return 'blocked';
    }

    if (
      driver.status === 'Offline'
      || driver.verificationStatus === 'UnderReview'
      || driver.verificationStatus === 'Unverified'
      || driver.collectionPaymentStatus === 'warning'
    ) {
      return 'limited';
    }

    return 'ready';
  }

  private getVendorName(vendor: Vendor | VendorDetail, lang: 'ar' | 'en'): string {
    return lang === 'ar'
      ? vendor.businessNameAr || vendor.businessNameEn
      : vendor.businessNameEn || vendor.businessNameAr;
  }

  private getAtRiskOrders(orders: OrderDetail[]): OrderDetail[] {
    return orders.filter((order) =>
      order.isLate
      || order.hasActiveIssue
      || order.paymentStatus === 'FAILED'
      || order.paymentStatus === 'PENDING'
      || order.paymentStatus === 'COD_PENDING'
    );
  }

  private orderMatchesVendor(order: OrderDetail, vendor: Vendor | VendorDetail): boolean {
    const orderName = this.normalizeVendorName(order.merchantName);
    const vendorName = this.normalizeVendorName(vendor.businessNameAr);
    return orderName.includes(vendorName) || vendorName.includes(orderName);
  }

  private cityMatches(left: string | undefined, right: string | undefined): boolean {
    return this.normalizeText(left || '') === this.normalizeText(right || '');
  }

  private normalizeVendorName(value: string): string {
    return this.normalizeText(value)
      .replace(/ماركت|markets|market|hypermarket|هايبر/g, '')
      .replace(/\s+/g, '');
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .replace(/[\u064B-\u065F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private scaleNumber(value: number, factor: number, floor: number): number {
    return Math.max(floor, Math.round(value * factor));
  }

  private clampNumber(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private formatNumber(value: number, lang: 'ar' | 'en'): string {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      maximumFractionDigits: 0
    }).format(value);
  }

  private formatTimestamp(lang: 'ar' | 'en'): string {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
  }
}
