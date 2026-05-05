import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { SuperAdminDashboardService } from '@dashboard/services/dashboard.api.service';
import {
  DashboardDateRange,
  DashboardFilterState,
  DashboardQueue,
  DashboardSection,
  DashboardSeverity,
  DashboardSnapshot,
  DashboardSupplyBucket,
  DashboardChartPoint
} from '../../models/dashboard.models';
import * as echarts from 'echarts/core';
import { EChartsOption } from 'echarts';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

echarts.use([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    SearchableSelectComponent,
    NgxEchartsDirective
  ],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
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

  activeTab: string = 'overview';

  dashboard: DashboardSnapshot | null = null;
  ordersTrendOptions: EChartsOption = {};
  revenueTrendOptions: EChartsOption = {};
  vendorReadinessOptions: EChartsOption = {};
  driverReadinessOptions: EChartsOption = {};
  sectionChartOptions: Record<string, EChartsOption> = {};
  sectionOpenState: Record<string, boolean> = {};

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

  constructor(
    private readonly authService: AuthService,
    private readonly translate: TranslateService,
    private readonly dashboardService: SuperAdminDashboardService
  ) {}

  ngOnInit(): void {
    this.currentLang = (this.translate.currentLang || 'ar') as 'ar' | 'en';
    this.isRTL = this.currentLang === 'ar';

    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.userName = user?.fullName || 'Admin';
      });

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang as 'ar' | 'en';
        this.isRTL = this.currentLang === 'ar';
        if (this.dashboard) {
          this.loadDashboard();
        }
      });

    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.loadError = false;

    this.dashboardService.getDashboardSnapshot(this.filterState, this.currentLang)
      .pipe(take(1))
      .subscribe({
        next: (dashboard) => {
          this.dashboard = dashboard;
          this.syncSectionState();
          this.isLoading = false;
          this.buildCharts();
        },
        error: (error) => {
          console.error('Superadmin dashboard failed to load.', error);
          this.loadError = true;
          this.isLoading = false;
        }
      });
  }

  onFilterChange(): void {
    this.loadDashboard();
  }

  refreshDashboard(): void {
    this.loadDashboard();
  }

  setDateRange(range: DashboardDateRange): void {
    if (this.filterState.dateRange === range) {
      return;
    }

    this.filterState = {
      ...this.filterState,
      dateRange: range
    };
    this.loadDashboard();
  }

  getSeverityCardClasses(severity: DashboardSeverity): string {
    const classes: Record<DashboardSeverity, string> = {
      critical: 'border-red-200 bg-red-50/80',
      warning: 'border-amber-200 bg-amber-50/80',
      info: 'border-cyan-200 bg-cyan-50/80',
      success: 'border-emerald-200 bg-emerald-50/80',
      neutral: 'border-slate-200 bg-white'
    };

    return classes[severity];
  }

  getSectionSurfaceClasses(severity: DashboardSeverity): string {
    const classes: Record<DashboardSeverity, string> = {
      critical: 'border-red-200 bg-red-50/60',
      warning: 'border-amber-200 bg-amber-50/60',
      info: 'border-cyan-200 bg-cyan-50/60',
      success: 'border-emerald-200 bg-emerald-50/60',
      neutral: 'border-slate-200 bg-slate-50/70'
    };

    return classes[severity];
  }

  getTrendClasses(direction: 'up' | 'down' | 'flat'): string {
    if (direction === 'up') {
      return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    }

    if (direction === 'down') {
      return 'text-red-600 bg-red-50 border-red-100';
    }

    return 'text-slate-500 bg-slate-100 border-slate-200';
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'SA';
  }

  getAlertIcon(severity: DashboardSeverity): string {
    const icons: Record<DashboardSeverity, string> = {
      critical: 'priority_high',
      warning: 'warning',
      info: 'info',
      success: 'task_alt',
      neutral: 'notifications'
    };

    return icons[severity];
  }

  getQueueToneClasses(severity: DashboardSeverity): string {
    const classes: Record<DashboardSeverity, string> = {
      critical: 'border-red-200 bg-red-50/70',
      warning: 'border-amber-200 bg-amber-50/70',
      info: 'border-cyan-200 bg-cyan-50/70',
      success: 'border-emerald-200 bg-emerald-50/70',
      neutral: 'border-slate-200 bg-white'
    };

    return classes[severity];
  }

  getPriorityBadgeClasses(severity: DashboardSeverity): string {
    const classes: Record<DashboardSeverity, string> = {
      critical: 'bg-red-50 text-red-700 border border-red-100',
      warning: 'bg-amber-50 text-amber-700 border border-amber-100',
      info: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
      success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      neutral: 'bg-slate-100 text-slate-700 border border-slate-200'
    };

    return classes[severity];
  }

  getStatToneClasses(severity: DashboardSeverity): string {
    const classes: Record<DashboardSeverity, string> = {
      critical: 'border-red-200 bg-white text-red-700',
      warning: 'border-amber-200 bg-white text-amber-700',
      info: 'border-cyan-200 bg-white text-cyan-700',
      success: 'border-emerald-200 bg-white text-emerald-700',
      neutral: 'border-slate-200 bg-white text-slate-700'
    };

    return classes[severity];
  }

  getRegionPressureTone(score: number): string {
    if (score >= 15) {
      return 'bg-red-500';
    }

    if (score >= 8) {
      return 'bg-amber-500';
    }

    return 'bg-cyan-600';
  }

  getRegionPressureWidth(score: number): number {
    const maxScore = Math.max(...(this.dashboard?.charts.regionPressure.map((row) => row.score) ?? [1]));
    return Math.max(12, Math.round((score / Math.max(maxScore, 1)) * 100));
  }

  toggleSection(sectionId: string): void {
    this.sectionOpenState[sectionId] = !this.sectionOpenState[sectionId];
  }

  isSectionOpen(sectionId: string): boolean {
    return this.sectionOpenState[sectionId] ?? true;
  }

  get primarySections(): DashboardSection[] {
    return this.dashboard?.sections.slice(0, 4) ?? [];
  }

  get secondarySections(): DashboardSection[] {
    return this.dashboard?.sections.slice(4) ?? [];
  }

  formatRelativeTime(value: string): string {
    const timestamp = new Date(value).getTime();
    const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
    
    if (this.currentLang === 'ar') {
      if (minutes < 1) return 'الآن';
      if (minutes === 1) return 'منذ دقيقة';
      if (minutes === 2) return 'منذ دقيقتين';
      if (minutes >= 3 && minutes <= 10) return `منذ ${minutes} دقائق`;
      if (minutes < 60) return `منذ ${minutes} دقيقة`;
      
      const hours = Math.floor(minutes / 60);
      if (hours === 1) return 'منذ ساعة';
      if (hours === 2) return 'منذ ساعتين';
      if (hours >= 3 && hours <= 10) return `منذ ${hours} ساعات`;
      if (hours < 24) return `منذ ${hours} ساعة`;
      
      return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' }).format(new Date(value));
    } else {
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes} min ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hr ago`;
      return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(new Date(value));
    }
  }

  getQueueTotal(queues: DashboardQueue[]): number {
    return queues.reduce((sum, queue) => sum + queue.count, 0);
  }

  getTopKpiValue(index: number): string {
    return this.dashboard?.kpis[index]?.value ?? '0';
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  trackByRegion(_index: number, item: { regionKey: string }): string {
    return item.regionKey;
  }

  heroMicroChartOptions: Record<string, EChartsOption> = {};
  insightPanels: {
    id: string;
    titleKey: string;
    icon: string;
    iconClass: string;
    description: string;
    value: string;
    trendLabel?: string;
  }[] = [];

  private buildCharts(): void {
    if (!this.dashboard) {
      return;
    }

    this.ordersTrendOptions = this.buildLineChart(this.dashboard.charts.ordersTrend, true);
    this.revenueTrendOptions = this.buildLineChart(this.dashboard.charts.revenueTrend, false);
    this.vendorReadinessOptions = this.buildReadinessChart('vendor');
    this.driverReadinessOptions = this.buildReadinessChart('driver');
    this.sectionChartOptions = Object.fromEntries(
      (this.dashboard.sections ?? []).map((section) => [section.id, this.buildSectionChart(section)])
    );

    this.buildMicroCharts();
    this.buildInsightPanels();
  }

  private buildMicroCharts(): void {
    if (!this.dashboard) return;
    
    // Build Sparklines for time-series KPIs
    const gmvColor = '#10b981'; // emerald
    const ordersColor = '#3b82f6'; // blue
    
    this.heroMicroChartOptions['gmv'] = this.buildSparkline(this.dashboard.charts.revenueTrend.series[0]?.points ?? [], gmvColor);
    this.heroMicroChartOptions['completed-orders'] = this.buildSparkline(this.dashboard.charts.ordersTrend.series[0]?.points ?? [], ordersColor);
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
    
    // Extract some key values for the insight texts
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
        trendLabel: riskOrders?.value ? `Risk: ${riskOrders.value}` : undefined
      },
      {
        id: 'supply-insight',
        titleKey: 'DASHBOARD.INSIGHTS.SUPPLY_TITLE',
        icon: 'groups',
        iconClass: 'text-purple-500 bg-purple-50',
        description: 'DASHBOARD.INSIGHTS.SUPPLY_DESC',
        value: `${this.dashboard.charts.vendorReadiness.reduce((a, b) => a + b.count, 0)} V | ${this.dashboard.charts.driverReadiness.reduce((a, b) => a + b.count, 0)} D`
      }
    ];
  }

  private buildLineChart(chart: DashboardSnapshot['charts']['ordersTrend'], filled: boolean): EChartsOption {
    const isRtl = this.isRTL;
    const categories = chart.series[0]?.points.map((point) => point.label) ?? [];

    return {
      tooltip: {
        trigger: 'axis',
        className: '!rounded-xl !shadow-lg !border-none !bg-white/95 !backdrop-blur-md',
        textStyle: { fontFamily: 'inherit', color: '#1e293b' }
      },
      legend: {
        bottom: 0,
        icon: 'circle',
        textStyle: { fontFamily: 'inherit', color: '#64748b', fontSize: 11, fontWeight: 700 }
      },
      grid: {
        left: isRtl ? '4%' : '3%',
        right: isRtl ? '3%' : '4%',
        top: '8%',
        bottom: '14%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        inverse: isRtl,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#94a3b8', fontSize: 11, fontWeight: 700 }
      },
      yAxis: {
        type: 'value',
        position: isRtl ? 'right' : 'left',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#94a3b8', fontSize: 11, fontWeight: 700 }
      },
      series: chart.series.map((series) => ({
        name: this.translate.instant(series.labelKey),
        type: 'line',
        smooth: true,
        showSymbol: false,
        symbol: 'none',
        lineStyle: { width: 3, color: series.color },
        itemStyle: { color: series.color },
        areaStyle: filled ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${series.color}55` },
            { offset: 1, color: `${series.color}05` }
          ])
        } : undefined,
        data: series.points.map((point) => point.value)
      }))
    };
  }

  private buildReadinessChart(type: 'vendor' | 'driver'): EChartsOption {
    const data = type === 'vendor' ? (this.dashboard?.charts.vendorReadiness ?? []) : (this.dashboard?.charts.driverReadiness ?? []);
    const name = type === 'vendor' ? this.translate.instant('DASHBOARD.SUPPLY.VENDOR_SPLIT') : this.translate.instant('DASHBOARD.SUPPLY.DRIVER_SPLIT');

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        bottom: 0,
        icon: 'circle',
        itemGap: 10,
        itemWidth: 8,
        textStyle: { color: '#64748b', fontSize: 10, fontWeight: 700 }
      },
      series: [
        {
          name,
          type: 'pie',
          radius: ['35%', '55%'],
          center: ['50%', '35%'],
          label: { show: false },
          labelLine: { show: false },
          data: this.mapReadinessSeries(data)
        }
      ]
    };
  }

  private buildSectionChart(section: DashboardSection): EChartsOption {
    const statData = section.stats.slice(0, 4);

    if (statData.length > 0) {
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: {
          left: '4%',
          right: '4%',
          top: '8%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          inverse: this.isRTL,
          data: statData.map((item) => this.translate.instant(item.labelKey)),
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            color: '#64748b',
            fontSize: 10,
            interval: 0,
            rotate: statData.length > 3 ? 15 : 0
          }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
          axisLabel: { color: '#94a3b8', fontSize: 10 }
        },
        series: [
          {
            type: 'bar',
            barWidth: 18,
            data: statData.map((item) => ({
              value: item.value,
              itemStyle: {
                color: this.resolveSeverityColor(item.tone),
                borderRadius: [10, 10, 0, 0]
              }
            }))
          }
        ]
      };
    }

    const exceptionBuckets = ['critical', 'warning', 'info', 'success', 'neutral']
      .map((severity) => ({
        severity: severity as DashboardSeverity,
        count: section.exceptions.filter((item) => item.severity === severity).length
      }))
      .filter((bucket) => bucket.count > 0);

    return {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: 0,
        icon: 'circle',
        textStyle: { color: '#64748b', fontSize: 10, fontWeight: 700 }
      },
      series: [
        {
          type: 'pie',
          radius: ['42%', '66%'],
          center: ['50%', '42%'],
          label: { show: false },
          labelLine: { show: false },
          data: exceptionBuckets.map((bucket) => ({
            value: bucket.count,
            name: this.translate.instant(`DASHBOARD.SEVERITY.${bucket.severity.toUpperCase()}`),
            itemStyle: { color: this.resolveSeverityColor(bucket.severity) }
          }))
        }
      ]
    };
  }

  private mapReadinessSeries(buckets: DashboardSupplyBucket[]): Array<{ value: number; name: string; itemStyle: { color: string } }> {
    return buckets.map((bucket) => ({
      value: bucket.count,
      name: this.translate.instant(bucket.labelKey),
      itemStyle: { color: bucket.color }
    }));
  }

  private getDateRangeLabel(value: DashboardDateRange): string {
    const key = value === 'today'
      ? 'DASHBOARD.TABS.DAY'
      : value === 'week'
        ? 'DASHBOARD.TABS.WEEK'
        : 'DASHBOARD.TABS.MONTH';
    return this.translate.instant(key);
  }

  private resolveSeverityColor(severity: DashboardSeverity): string {
    const colors: Record<DashboardSeverity, string> = {
      critical: '#ef4444',
      warning: '#f59e0b',
      info: '#127c8c',
      success: '#10b981',
      neutral: '#64748b'
    };

    return colors[severity];
  }

  private syncSectionState(): void {
    for (const section of this.dashboard?.sections ?? []) {
      this.sectionOpenState[section.id] ??= true;
    }
  }
}
