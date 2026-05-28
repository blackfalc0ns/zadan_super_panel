import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { SuperAdminDashboardService } from '@dashboard/services/dashboard.api.service';
import {
  DashboardDateRange,
  DashboardFilterState,
  DashboardQueue,
  DashboardSection,
  DashboardSnapshot,
  DashboardSupplyBucket,
  DashboardChartPoint
} from '../../models/dashboard.models';
import * as echarts from 'echarts/core';
import { EChartsOption } from 'echarts';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { provideEchartsCore, NgxEchartsDirective } from 'ngx-echarts';
import {
  DashboardHeaderComponent,
  DashboardKpiStripComponent,
  DashboardInsightsComponent,
  DashboardChartsComponent,
  DashboardOrdersWindowsComponent,
  DashboardAlertsPanelComponent,
  DashboardSectionsComponent,
  DashboardAuditFeedComponent,
  InsightPanel
} from '../../components';

echarts.use([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

type DashboardTabId = 'overview' | 'vendors' | 'drivers' | 'orders' | 'finance';

interface DashboardWindowTab {
  id: DashboardTabId;
  labelKey: string;
  icon: string;
  metric: string;
  helper: string;
  severity: DashboardSupplyBucket['severity'];
  signalCount: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DashboardHeaderComponent,
    DashboardKpiStripComponent,
    DashboardInsightsComponent,
    DashboardChartsComponent,
    DashboardOrdersWindowsComponent,
    DashboardAlertsPanelComponent,
    DashboardSectionsComponent,
    DashboardAuditFeedComponent,
    NgxEchartsDirective
  ],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  userName = 'Admin';
  currentLang: 'ar' | 'en' = 'ar';
  isRTL = true;
  isLoading = true;
  loadError = false;

  filterState: DashboardFilterState = {
    dateRange: 'today',
    region: 'all',
    vendorId: 'all',
    refreshMode: 'manual'
  };

  dashboard: DashboardSnapshot | null = null;
  activeTab: DashboardTabId = 'overview';
  private readonly dashboardTabIds: DashboardTabId[] = ['overview', 'vendors', 'drivers', 'orders', 'finance'];

  setActiveTab(tab: DashboardTabId): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
    this.cdr.markForCheck();
  }

  // Chart options
  ordersTrendOptions: EChartsOption = {};
  revenueTrendOptions: EChartsOption = {};
  ordersBarsOptions: EChartsOption = {};
  revenueBarsOptions: EChartsOption = {};
  regionPressureOptions: EChartsOption = {};
  queueMixOptions: EChartsOption = {};
  riskExceptionsOptions: EChartsOption = {};
  vendorReadinessOptions: EChartsOption = {};
  driverReadinessOptions: EChartsOption = {};
  vendorReadinessBarOptions: EChartsOption = {};
  driverReadinessBarOptions: EChartsOption = {};
  heroMicroChartOptions: Record<string, EChartsOption> = {};

  // Insight panels
  insightPanels: InsightPanel[] = [];

  // Filter options for header
  get dateRangeFilterOptions(): SearchableSelectOption[] {
    return (this.dashboard?.filterOptions.dateRanges ?? []).map((option) => ({
      value: option.value,
      label: this.getDateRangeLabel(option.value as DashboardDateRange)
    }));
  }

  get regionFilterOptions(): SearchableSelectOption[] {
    return (this.dashboard?.filterOptions.regions ?? []).map((option) => ({
      value: option.value,
      label: option.count ? `${option.label} (${option.count})` : option.label
    }));
  }

  get vendorFilterOptions(): SearchableSelectOption[] {
    return (this.dashboard?.filterOptions.vendors ?? []).map((option) => ({
      value: option.value,
      label: option.label
    }));
  }

  get primarySections(): DashboardSection[] {
    return this.dashboard?.sections.slice(0, 4) ?? [];
  }

  get secondarySections(): DashboardSection[] {
    return this.dashboard?.sections.slice(4) ?? [];
  }

  get vendorSections(): DashboardSection[] {
    return this.dashboard?.sections.filter(s => s.id.includes('vendor')) ?? [];
  }

  get driverSections(): DashboardSection[] {
    return this.dashboard?.sections.filter(s => s.id.includes('driver')) ?? [];
  }

  get orderSections(): DashboardSection[] {
    return this.dashboard?.sections.filter(s => ['order-ops', 'customer-support'].includes(s.id)) ?? [];
  }

  get financeSections(): DashboardSection[] {
    return this.dashboard?.sections.filter(s => ['finance-ops', 'access-security'].includes(s.id)) ?? [];
  }

  get dashboardTabs(): DashboardWindowTab[] {
    const vendorTotal = this.sumBuckets(this.dashboard?.charts.vendorReadiness ?? []);
    const driverTotal = this.sumBuckets(this.dashboard?.charts.driverReadiness ?? []);
    const liveQueueTotal = this.sumQueues(this.dashboard?.queues.live ?? []);
    const riskQueueTotal = this.sumQueues(this.dashboard?.queues.risk ?? []);
    const gmv = this.dashboard?.kpis.find(kpi => kpi.id === 'gmv');
    const disputeExposure = this.dashboard?.kpis.find(kpi => kpi.id === 'open-dispute-exposure');
    const ordersAtRisk = this.dashboard?.kpis.find(kpi => kpi.id === 'orders-at-risk');
    const vendorRiskSignals = this.countNonReadyBuckets(this.dashboard?.charts.vendorReadiness ?? []);
    const driverRiskSignals = this.countNonReadyBuckets(this.dashboard?.charts.driverReadiness ?? []);
    const operationsSignals = (this.dashboard?.alerts.length ?? 0) + (this.dashboard?.attentionItems.length ?? 0) + riskQueueTotal;

    return [
      {
        id: 'overview',
        labelKey: 'DASHBOARD.TABS.OVERVIEW',
        icon: 'dashboard',
        metric: `${this.dashboard?.kpis.length ?? 0}`,
        helper: this.dashboard?.lastUpdatedLabel ?? '',
        severity: this.dashboard?.systemMode === 'live' ? 'success' : 'info',
        signalCount: this.dashboard?.alerts.length ?? 0
      },
      {
        id: 'vendors',
        labelKey: 'DASHBOARD.TABS.VENDORS',
        icon: 'storefront',
        metric: vendorTotal.toLocaleString(),
        helper: this.formatSignalHelper(vendorRiskSignals),
        severity: this.resolveSupplySeverity(this.dashboard?.charts.vendorReadiness ?? []),
        signalCount: vendorRiskSignals
      },
      {
        id: 'drivers',
        labelKey: 'DASHBOARD.TABS.DRIVERS',
        icon: 'directions_car',
        metric: driverTotal.toLocaleString(),
        helper: this.formatSignalHelper(driverRiskSignals),
        severity: this.resolveSupplySeverity(this.dashboard?.charts.driverReadiness ?? []),
        signalCount: driverRiskSignals
      },
      {
        id: 'orders',
        labelKey: 'DASHBOARD.TABS.ORDERS',
        icon: 'shopping_bag',
        metric: ordersAtRisk?.value ?? (liveQueueTotal + riskQueueTotal).toLocaleString(),
        helper: `${liveQueueTotal.toLocaleString()} / ${riskQueueTotal.toLocaleString()}`,
        severity: this.resolveHighestSeverity([
          ...(this.dashboard?.alerts.map(alert => alert.severity) ?? []),
          ...(this.dashboard?.queues.risk.map(queue => queue.severity) ?? [])
        ]),
        signalCount: operationsSignals
      },
      {
        id: 'finance',
        labelKey: 'DASHBOARD.TABS.FINANCE',
        icon: 'account_balance_wallet',
        metric: disputeExposure?.value ?? gmv?.value ?? '0',
        helper: disputeExposure?.unitLabel ?? gmv?.unitLabel ?? '',
        severity: disputeExposure?.severity ?? gmv?.severity ?? 'neutral',
        signalCount: this.dashboard?.queues.risk.filter(queue => queue.count > 0).length ?? 0
      }
    ];
  }

  constructor(
    private readonly authService: AuthService,
    private readonly translate: TranslateService,
    private readonly dashboardService: SuperAdminDashboardService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentLang = (this.translate.currentLang || 'ar') as 'ar' | 'en';
    this.isRTL = this.currentLang === 'ar';

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const tab = params.get('tab');
        if (this.isDashboardTabId(tab)) {
          this.activeTab = tab;
          this.cdr.markForCheck();
        }
      });

    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.userName = user?.fullName || 'Admin';
        this.cdr.markForCheck();
      });

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang as 'ar' | 'en';
        this.isRTL = this.currentLang === 'ar';
        if (this.dashboard) {
          this.loadDashboard();
        }
        this.cdr.markForCheck();
      });

    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.loadError = false;
    this.cdr.markForCheck();

    this.dashboardService.getDashboardSnapshot(this.filterState, this.currentLang)
      .pipe(take(1))
      .subscribe({
        next: (dashboard) => {
          this.dashboard = dashboard;
          this.isLoading = false;
          this.buildCharts();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Superadmin dashboard failed to load.', error);
          this.loadError = true;
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  onFilterChanged(state: DashboardFilterState): void {
    this.filterState = state;
    this.loadDashboard();
  }

  refreshDashboard(): void {
    this.loadDashboard();
  }

  // ─── Chart Building ───────────────────────────────────────────────

  private buildCharts(): void {
    if (!this.dashboard) return;

    this.ordersTrendOptions = this.buildLineChart(this.dashboard.charts.ordersTrend, true);
    this.revenueTrendOptions = this.buildLineChart(this.dashboard.charts.revenueTrend, false);
    this.ordersBarsOptions = this.buildGroupedBarChart(this.dashboard.charts.ordersTrend);
    this.revenueBarsOptions = this.buildGroupedBarChart(this.dashboard.charts.revenueTrend);
    this.regionPressureOptions = this.buildRegionPressureChart();
    this.queueMixOptions = this.buildQueueMixChart();
    this.riskExceptionsOptions = this.buildRiskExceptionsChart();
    this.vendorReadinessOptions = this.buildReadinessChart('vendor');
    this.driverReadinessOptions = this.buildReadinessChart('driver');
    this.vendorReadinessBarOptions = this.buildReadinessBarChart('vendor');
    this.driverReadinessBarOptions = this.buildReadinessBarChart('driver');
    this.buildMicroCharts();
    this.buildInsightPanels();
  }

  private buildMicroCharts(): void {
    if (!this.dashboard) return;
    this.heroMicroChartOptions['gmv'] = this.buildSparkline(
      this.dashboard.charts.revenueTrend.series[0]?.points ?? [], '#10b981'
    );
    this.heroMicroChartOptions['completed-orders'] = this.buildSparkline(
      this.dashboard.charts.ordersTrend.series[0]?.points ?? [], '#3b82f6'
    );
  }

  private buildSparkline(points: DashboardChartPoint[], color: string): EChartsOption {
    return {
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      xAxis: { type: 'category', show: false, data: points.map(p => p.label) },
      yAxis: { type: 'value', show: false },
      tooltip: { show: false },
      series: [{
        type: 'line',
        data: points.map(p => p.value),
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color },
        itemStyle: { color },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${color}44` },
            { offset: 1, color: `${color}00` }
          ])
        }
      }]
    };
  }

  private buildInsightPanels(): void {
    if (!this.dashboard) return;

    const gmvKpi = this.dashboard.kpis.find(k => k.id === 'gmv');
    const onTimeKpi = this.dashboard.kpis.find(k => k.id === 'on-time-rate');
    const riskOrders = this.dashboard.kpis.find(k => k.id === 'orders-at-risk');

    this.insightPanels = [
      {
        id: 'revenue-insight',
        titleKey: 'DASHBOARD.INSIGHTS.REVENUE_TITLE',
        icon: 'trending_up',
        iconClass: 'text-emerald-500 bg-emerald-50',
        description: 'DASHBOARD.INSIGHTS.REVENUE_DESC',
        value: gmvKpi?.value ?? '0',
        trendLabel: gmvKpi?.trendLabel
      },
      {
        id: 'fulfillment-insight',
        titleKey: 'DASHBOARD.INSIGHTS.FULFILLMENT_TITLE',
        icon: 'local_shipping',
        iconClass: 'text-blue-500 bg-blue-50',
        description: 'DASHBOARD.INSIGHTS.FULFILLMENT_DESC',
        value: onTimeKpi?.value ?? '0%',
        trendLabel: riskOrders?.value ? `${riskOrders.value} طلبات في خطر` : undefined
      },
      {
        id: 'supply-insight',
        titleKey: 'DASHBOARD.INSIGHTS.SUPPLY_TITLE',
        icon: 'groups',
        iconClass: 'text-purple-500 bg-purple-50',
        description: 'DASHBOARD.INSIGHTS.SUPPLY_DESC',
        value: `${this.dashboard.charts.vendorReadiness.reduce((a, b) => a + b.count, 0)} تجار | ${this.dashboard.charts.driverReadiness.reduce((a, b) => a + b.count, 0)} سائقين`
      }
    ];
  }

  private buildLineChart(chart: DashboardSnapshot['charts']['ordersTrend'], filled: boolean): EChartsOption {
    const isRtl = this.isRTL;
    const categories = chart.series[0]?.points.map(p => p.label) ?? [];

    return {
      tooltip: {
        trigger: 'axis',
        textStyle: { fontFamily: 'Cairo, sans-serif', color: '#1e293b', fontSize: 11 }
      },
      legend: {
        bottom: 0,
        icon: 'circle',
        itemWidth: 8,
        textStyle: { fontFamily: 'Cairo, sans-serif', color: '#64748b', fontSize: 10 }
      },
      grid: {
        left: isRtl ? '4%' : '3%',
        right: isRtl ? '3%' : '4%',
        top: '10%',
        bottom: '16%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        inverse: isRtl,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        position: isRtl ? 'right' : 'left',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      series: chart.series.map(s => ({
        name: this.translate.instant(s.labelKey),
        type: 'line' as const,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5, color: s.color },
        itemStyle: { color: s.color },
        areaStyle: filled ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${s.color}40` },
            { offset: 1, color: `${s.color}05` }
          ])
        } : undefined,
        data: s.points.map(p => p.value)
      }))
    };
  }

  private buildGroupedBarChart(chart: DashboardSnapshot['charts']['ordersTrend']): EChartsOption {
    const isRtl = this.isRTL;
    const categories = chart.series[0]?.points.map(p => p.label) ?? [];

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        textStyle: { fontFamily: 'Cairo, sans-serif', color: '#1e293b', fontSize: 11 }
      },
      legend: {
        bottom: 0,
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 6,
        textStyle: { fontFamily: 'Cairo, sans-serif', color: '#64748b', fontSize: 10 }
      },
      grid: {
        left: isRtl ? '4%' : '3%',
        right: isRtl ? '3%' : '4%',
        top: '8%',
        bottom: '18%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        inverse: isRtl,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        position: isRtl ? 'right' : 'left',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      series: chart.series.map(s => ({
        name: this.translate.instant(s.labelKey),
        type: 'bar' as const,
        barMaxWidth: 14,
        itemStyle: { color: s.color, borderRadius: [4, 4, 0, 0] },
        emphasis: { focus: 'series' },
        data: s.points.map(p => p.value)
      }))
    };
  }

  private buildReadinessChart(type: 'vendor' | 'driver'): EChartsOption {
    const data: DashboardSupplyBucket[] = type === 'vendor'
      ? (this.dashboard?.charts.vendorReadiness ?? [])
      : (this.dashboard?.charts.driverReadiness ?? []);
    const name = type === 'vendor'
      ? this.translate.instant('DASHBOARD.SUPPLY.VENDOR_SPLIT')
      : this.translate.instant('DASHBOARD.SUPPLY.DRIVER_SPLIT');

    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        bottom: 0,
        icon: 'circle',
        itemWidth: 6,
        itemGap: 8,
        textStyle: { color: '#64748b', fontSize: 9 }
      },
      series: [{
        name,
        type: 'pie',
        radius: ['32%', '52%'],
        center: ['50%', '38%'],
        label: { show: false },
        labelLine: { show: false },
        data: data.map(b => ({
          value: b.count,
          name: this.translate.instant(b.labelKey),
          itemStyle: { color: b.color }
        }))
      }]
    };
  }

  private buildReadinessBarChart(type: 'vendor' | 'driver'): EChartsOption {
    const data: DashboardSupplyBucket[] = type === 'vendor'
      ? (this.dashboard?.charts.vendorReadiness ?? [])
      : (this.dashboard?.charts.driverReadiness ?? []);

    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '2%', right: '4%', top: '8%', bottom: '4%', containLabel: true },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map(bucket => this.translate.instant(bucket.labelKey)),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#475569', fontSize: 10, fontWeight: 700 }
      },
      series: [{
        type: 'bar',
        barMaxWidth: 12,
        data: data.map(bucket => ({
          value: bucket.count,
          itemStyle: { color: bucket.color, borderRadius: [0, 6, 6, 0] }
        }))
      }]
    };
  }

  private buildRegionPressureChart(): EChartsOption {
    const rows = this.dashboard?.charts.regionPressure ?? [];

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        textStyle: { fontFamily: 'Cairo, sans-serif', color: '#1e293b', fontSize: 11 }
      },
      legend: {
        bottom: 0,
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 6,
        textStyle: { fontFamily: 'Cairo, sans-serif', color: '#64748b', fontSize: 10 }
      },
      grid: { left: '2%', right: '4%', top: '6%', bottom: '18%', containLabel: true },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map(row => row.regionLabel),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#475569', fontSize: 10, fontWeight: 700 }
      },
      series: [
        {
          name: this.translate.instant('DASHBOARD.REGION_PRESSURE.LATE_ORDERS'),
          type: 'bar',
          stack: 'pressure',
          barMaxWidth: 14,
          itemStyle: { color: '#f43f5e' },
          data: rows.map(row => row.lateOrders)
        },
        {
          name: this.translate.instant('DASHBOARD.REGION_PRESSURE.PAYMENT_ISSUES'),
          type: 'bar',
          stack: 'pressure',
          barMaxWidth: 14,
          itemStyle: { color: '#f59e0b' },
          data: rows.map(row => row.paymentIssues)
        },
        {
          name: this.translate.instant('DASHBOARD.REGION_PRESSURE.DRIVER_GAP'),
          type: 'bar',
          stack: 'pressure',
          barMaxWidth: 14,
          itemStyle: { color: '#06b6d4', borderRadius: [0, 6, 6, 0] },
          data: rows.map(row => row.driverGap)
        }
      ]
    };
  }

  private buildQueueMixChart(): EChartsOption {
    const queues: DashboardQueue[] = [
      ...(this.dashboard?.queues.live ?? []),
      ...(this.dashboard?.queues.risk ?? [])
    ].filter(queue => queue.count > 0);

    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        bottom: 0,
        icon: 'circle',
        itemWidth: 7,
        itemGap: 8,
        textStyle: { color: '#64748b', fontSize: 9 }
      },
      series: [{
        type: 'pie',
        radius: ['34%', '58%'],
        center: ['50%', '40%'],
        label: { show: false },
        labelLine: { show: false },
        data: queues.map((queue, index) => ({
          value: queue.count,
          name: this.translate.instant(queue.labelKey),
          itemStyle: { color: this.getQueueColor(queue.severity, index) }
        }))
      }]
    };
  }

  private buildRiskExceptionsChart(): EChartsOption {
    const severities: DashboardSupplyBucket['severity'][] = ['critical', 'warning', 'info', 'neutral'];
    const createTotals = (): Record<DashboardSupplyBucket['severity'], number> => ({
      critical: 0,
      warning: 0,
      info: 0,
      success: 0,
      neutral: 0
    });
    const riskTotals = createTotals();
    const alertTotals = createTotals();
    const exceptionTotals = createTotals();
    const attentionTotals = createTotals();

    (this.dashboard?.queues.risk ?? []).forEach((queue) => {
      riskTotals[queue.severity] += queue.count;
    });
    (this.dashboard?.alerts ?? []).forEach((alert) => {
      alertTotals[alert.severity] += alert.count;
    });
    this.orderSections
      .flatMap((section) => section.exceptions)
      .forEach((exception) => {
        exceptionTotals[exception.severity] += 1;
      });
    (this.dashboard?.attentionItems ?? []).forEach((item) => {
      attentionTotals[item.priority] += 1;
    });

    const categories = severities.map((severity) => this.getSeverityLabel(severity));

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        textStyle: { fontFamily: 'Cairo, sans-serif', color: '#1e293b', fontSize: 11 }
      },
      legend: {
        bottom: 0,
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 6,
        textStyle: { fontFamily: 'Cairo, sans-serif', color: '#64748b', fontSize: 10 }
      },
      grid: {
        left: this.isRTL ? '4%' : '3%',
        right: this.isRTL ? '3%' : '4%',
        top: '7%',
        bottom: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        inverse: this.isRTL,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', fontSize: 10, fontWeight: 700 }
      },
      yAxis: {
        type: 'value',
        position: this.isRTL ? 'right' : 'left',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      series: [
        {
          name: this.translate.instant('DASHBOARD.RISK_QUEUES_TITLE'),
          type: 'bar',
          stack: 'signals',
          barMaxWidth: 18,
          itemStyle: { color: '#f43f5e', borderRadius: [4, 4, 0, 0] },
          data: severities.map((severity) => riskTotals[severity])
        },
        {
          name: this.translate.instant('DASHBOARD.ALERTS_PANEL.TITLE'),
          type: 'bar',
          stack: 'signals',
          barMaxWidth: 18,
          itemStyle: { color: '#fb7185' },
          data: severities.map((severity) => alertTotals[severity])
        },
        {
          name: this.translate.instant('DASHBOARD.WINDOW_EXCEPTIONS'),
          type: 'bar',
          stack: 'signals',
          barMaxWidth: 18,
          itemStyle: { color: '#f59e0b' },
          data: severities.map((severity) => exceptionTotals[severity])
        },
        {
          name: this.translate.instant('DASHBOARD.ATTENTION.TITLE'),
          type: 'bar',
          stack: 'signals',
          barMaxWidth: 18,
          itemStyle: { color: '#06b6d4' },
          data: severities.map((severity) => attentionTotals[severity])
        }
      ]
    };
  }

  getBucketToneClass(severity: DashboardSupplyBucket['severity']): string {
    const classes: Record<DashboardSupplyBucket['severity'], string> = {
      critical: 'bg-red-50 text-red-700 border-red-100',
      warning: 'bg-amber-50 text-amber-700 border-amber-100',
      info: 'bg-cyan-50 text-cyan-700 border-cyan-100',
      success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      neutral: 'bg-slate-50 text-slate-600 border-slate-200'
    };
    return classes[severity];
  }

  getSeverityColor(severity: DashboardSupplyBucket['severity']): string {
    const colors: Record<DashboardSupplyBucket['severity'], string> = {
      critical: '#dc2626',
      warning: '#d97706',
      info: '#0891b2',
      success: '#059669',
      neutral: '#64748b'
    };
    return colors[severity];
  }

  private getQueueColor(severity: DashboardQueue['severity'], index: number): string {
    const colorMap: Record<DashboardQueue['severity'], string[]> = {
      critical: ['#ef4444', '#f43f5e', '#dc2626'],
      warning: ['#f59e0b', '#f97316', '#d97706'],
      info: ['#06b6d4', '#0ea5e9', '#127c8c'],
      success: ['#10b981', '#22c55e', '#059669'],
      neutral: ['#94a3b8', '#64748b', '#475569']
    };
    const colors = colorMap[severity];
    return colors[index % colors.length];
  }

  private getSeverityLabel(severity: DashboardSupplyBucket['severity']): string {
    const labels: Record<DashboardSupplyBucket['severity'], { ar: string; en: string }> = {
      critical: { ar: 'حرجة', en: 'Critical' },
      warning: { ar: 'تحذير', en: 'Warning' },
      info: { ar: 'متابعة', en: 'Info' },
      success: { ar: 'مستقرة', en: 'Stable' },
      neutral: { ar: 'عادية', en: 'Neutral' }
    };
    return labels[severity][this.isRTL ? 'ar' : 'en'];
  }

  private sumBuckets(buckets: DashboardSupplyBucket[]): number {
    return buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  }

  private sumQueues(queues: DashboardQueue[]): number {
    return queues.reduce((sum, queue) => sum + queue.count, 0);
  }

  private countNonReadyBuckets(buckets: DashboardSupplyBucket[]): number {
    return buckets
      .filter(bucket => bucket.severity === 'critical' || bucket.severity === 'warning')
      .reduce((sum, bucket) => sum + bucket.count, 0);
  }

  private formatSignalHelper(count: number): string {
    return count > 0 ? count.toLocaleString() : '0';
  }

  private resolveSupplySeverity(buckets: DashboardSupplyBucket[]): DashboardSupplyBucket['severity'] {
    return this.resolveHighestSeverity(buckets.map(bucket => bucket.severity));
  }

  private resolveHighestSeverity(severities: DashboardSupplyBucket['severity'][]): DashboardSupplyBucket['severity'] {
    if (severities.includes('critical')) return 'critical';
    if (severities.includes('warning')) return 'warning';
    if (severities.includes('info')) return 'info';
    if (severities.includes('success')) return 'success';
    return 'neutral';
  }

  private isDashboardTabId(value: string | null): value is DashboardTabId {
    return this.dashboardTabIds.includes(value as DashboardTabId);
  }

  private getDateRangeLabel(value: DashboardDateRange): string {
    const key = value === 'today' ? 'DASHBOARD.TABS.DAY'
      : value === 'week' ? 'DASHBOARD.TABS.WEEK'
      : 'DASHBOARD.TABS.MONTH';
    return this.translate.instant(key);
  }
}
