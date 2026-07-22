import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, finalize, forkJoin, interval, merge, of, switchMap, timer } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { FinanceDashboardSnapshot, FinanceDashboardAlert, FinancePeriod, ChartDataPoint, RevenueCompositionSegment } from '../../models/finance.models';
import { FinanceKpiCardComponent } from '../../components/finance-kpi-card/finance-kpi-card.component';
import { FinanceKPI } from '../../models/finance.models';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { StatusPillComponent } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { FINANCE_ENTITY_LABEL_KEYS, resolveFinanceMonthLabelKey, getFinanceLocale } from '../../utils/finance-i18n.utils';

// ECharts imports
import * as echarts from 'echarts/core';
import { EChartsOption } from 'echarts';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

echarts.use([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, FinanceKpiCardComponent, AppCardComponent, AppButtonComponent, SectionHeaderComponent, InlineBannerComponent, StatusPillComponent, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  template: `
    <div class="flex flex-col gap-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">

      <!-- Header & Period Selector -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">{{ 'FINANCES.DASHBOARD.TITLE' | translate }}</h1>
          <p class="mt-1 text-sm font-medium text-slate-500">{{ 'FINANCES.DASHBOARD.SUBTITLE' | translate }}</p>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <button *ngFor="let p of periods"
                    (click)="setPeriod(p.value)"
                    class="px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200"
                    [ngClass]="currentPeriod === p.value
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'">
              {{ p.labelKey | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div *ngFor="let _ of [1,2,3,4,5,6,7,8]"
             class="h-[140px] bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse"></div>
      </div>

      <div *ngIf="!isLoading && loadError"
           class="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">
        <div>
          <p class="text-base font-black">{{ 'FINANCES.DASHBOARD.LOAD_ERROR_TITLE' | translate }}</p>
          <p class="text-sm font-medium text-red-800/80 mt-1">{{ 'FINANCES.DASHBOARD.LOAD_ERROR_MESSAGE' | translate }}</p>
        </div>
        <app-button
          variant="outline"
          size="sm"
          customClass="!bg-white !border-red-200 !text-red-700 hover:!bg-red-100"
          (btnClick)="loadData()"
        >
          {{ 'FINANCES.DASHBOARD.RETRY' | translate }}
        </app-button>
      </div>

      <!-- KPI Grid (8 metrics) -->
      <div *ngIf="!isLoading && snapshot" class="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-rows">
        <app-finance-kpi-card [kpi]="snapshot.platformNetRevenue" (cardClick)="onKpiClick($event)" class="stagger-1"></app-finance-kpi-card>
        <app-finance-kpi-card [kpi]="snapshot.grossCollections"   (cardClick)="onKpiClick($event)" class="stagger-2"></app-finance-kpi-card>
        <app-finance-kpi-card [kpi]="snapshot.commissionRevenue"  (cardClick)="onKpiClick($event)" class="stagger-3"></app-finance-kpi-card>
        <app-finance-kpi-card [kpi]="snapshot.deliveryRevenue"    (cardClick)="onKpiClick($event)" class="stagger-4"></app-finance-kpi-card>
        
        <app-finance-kpi-card [kpi]="snapshot.codFeesCollected"   (cardClick)="onKpiClick($event)" class="stagger-5"></app-finance-kpi-card>
        <app-finance-kpi-card [kpi]="snapshot.vatCollected"       (cardClick)="onKpiClick($event)" class="stagger-6"></app-finance-kpi-card>
        <app-finance-kpi-card [kpi]="snapshot.driverPayouts"      (cardClick)="onKpiClick($event)" class="stagger-7"></app-finance-kpi-card>
        <app-finance-kpi-card [kpi]="snapshot.refundExposure"     (cardClick)="onKpiClick($event)" class="stagger-8"></app-finance-kpi-card>
      </div>

      <app-card *ngIf="!isLoading && statementSummary" variant="default" rounded="2xl" padding="md" customClass="bg-white border-slate-200 shadow-sm">
        <app-section-header
          [compact]="true"
          icon="summarize"
          title="FINANCES.STATEMENTS.TITLE"
          description="FINANCES.STATEMENTS.SUBTITLE">
        </app-section-header>
        <div class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ 'FINANCES.STATEMENTS.PERIOD' | translate }}</p>
            <p class="mt-1 text-sm font-black text-slate-800" dir="ltr">{{ statementSummary.periodLabel }}</p>
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ 'FINANCES.STATEMENTS.REVENUE' | translate }}</p>
            <p class="mt-1 text-lg font-black text-emerald-700 tabular-nums">{{ formatNumber(statementSummary.revenue) }}</p>
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ 'FINANCES.STATEMENTS.EXPENSES' | translate }}</p>
            <p class="mt-1 text-lg font-black text-rose-600 tabular-nums">{{ formatNumber(statementSummary.expenses) }}</p>
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ 'FINANCES.STATEMENTS.VAT_PAYABLE' | translate }}</p>
            <p class="mt-1 text-lg font-black text-slate-700 tabular-nums">{{ formatNumber(statementSummary.vatPayable) }}</p>
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ 'FINANCES.STATEMENTS.NET_INCOME' | translate }}</p>
            <p class="mt-1 text-lg font-black tabular-nums" [ngClass]="statementSummary.netIncome >= 0 ? 'text-emerald-700' : 'text-rose-600'">{{ formatNumber(statementSummary.netIncome) }}</p>
          </div>
        </div>
      </app-card>

      <!-- Main Charts Grid -->
      <div *ngIf="!isLoading && snapshot" class="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <!-- GMV Trend Chart (col span 2) -->
        <app-card class="xl:col-span-2 group" variant="default" rounded="2xl" padding="md" customClass="bg-white border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-full flex flex-col">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
            <app-section-header
              [compact]="true"
              icon="monitoring"
              title="FINANCES.CHART.GMV_VS_REVENUE"
              description="FINANCES.CHART.LAST_7_MONTHS">
            </app-section-header>
          </div>
          <div class="h-[320px] w-full flex-1">
            <div echarts [options]="gmvTrendOptions" class="h-full w-full"></div>
          </div>
        </app-card>

        <!-- Revenue Composition Donut -->
        <app-card class="xl:col-span-1 group" variant="default" rounded="2xl" padding="md" customClass="bg-white border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-full flex flex-col">
          <div class="mb-2">
            <app-section-header
              [compact]="true"
              icon="donut_large"
              title="FINANCES.CHART.COMPOSITION"
              description="FINANCES.CHART.REVENUE_BREAKDOWN">
            </app-section-header>
          </div>
          <div class="h-[320px] w-full flex-1">
            <div echarts [options]="revenueCompositionOptions" class="h-full w-full"></div>
          </div>
        </app-card>

        <!-- Refund Trend Area Chart -->
        <app-card class="xl:col-span-2 group" variant="default" rounded="2xl" padding="md" customClass="bg-white border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div class="flex items-center justify-between mb-2">
            <app-section-header
              [compact]="true"
              tone="warning"
              icon="undo"
              title="FINANCES.CHART.REFUND_TREND"
              description="FINANCES.CHART.REFUND_RATE">
            </app-section-header>
          </div>
          <div class="h-[250px] w-full">
            <div echarts [options]="refundTrendOptions" class="h-full w-full"></div>
          </div>
        </app-card>

        <!-- Alerts Panel -->
        <app-card class="xl:col-span-1 group flex flex-col" variant="default" rounded="2xl" padding="none" customClass="bg-white border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden h-[340px]">
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <app-section-header
              [compact]="true"
              tone="danger"
              icon="notifications_active"
              title="FINANCES.ALERTS.TITLE">
              <app-status-pill
                meta
                [label]="formatNumber(snapshot.alerts.length)"
                [shouldTranslate]="false"
                [showDot]="false"
                variant="danger"
                size="sm">
              </app-status-pill>
            </app-section-header>
            <app-button variant="ghost" size="xs" customClass="!rounded-lg text-slate-500 hover:text-slate-900">
              {{ 'FINANCES.ACTIONS.VIEW_ALL' | translate }}
            </app-button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <app-inline-banner
              *ngFor="let alert of snapshot.alerts"
              [title]="alert.titleKey"
              [message]="alert.descriptionKey"
              [variant]="getAlertBannerVariant(alert.severity)"
              [icon]="getAlertIcon(alert.severity)"
              [compact]="true">
              <div class="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-current/70">
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">schedule</span> {{ formatTime(alert.timestamp) }}</span>
                <span *ngIf="alert.entityName" class="flex items-center gap-1">
                  <span class="w-1 h-1 rounded-full bg-current opacity-50"></span>
                  {{ getEntityLabelKey(alert.entityType) | translate }}: {{ alert.entityName }}
                </span>
                <span *ngIf="alert.amount" class="flex items-center gap-1">
                  <span class="w-1 h-1 rounded-full bg-current opacity-50"></span>
                  {{ formatNumber(alert.amount) }} {{ 'FINANCES.CURRENCY' | translate }}
                </span>
              </div>
              <app-button
                actions
                *ngIf="alert.actionRoute"
                variant="outline"
                size="xs"
                customClass="!rounded-lg !bg-white/50 !border-current/20 hover:!bg-current/10"
                (btnClick)="onAlertAction(alert)">
                {{ 'FINANCES.COMMON.VIEW' | translate }}
              </app-button>
            </app-inline-banner>

            <div *ngIf="!snapshot.alerts.length" class="flex flex-col items-center justify-center h-full py-8 text-center opacity-60">
              <span class="material-symbols-outlined text-[48px] text-slate-300 mb-3">task_alt</span>
              <p class="text-sm font-bold text-slate-700">{{ 'FINANCES.DASHBOARD.NO_ALERTS_TITLE' | translate }}</p>
              <p class="mt-1 text-xs font-medium text-slate-500">{{ 'FINANCES.DASHBOARD.NO_ALERTS_MESSAGE' | translate }}</p>
            </div>
          </div>
        </app-card>

      </div>
    </div>
  `
})
export class FinanceDashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private financeService = inject(FinanceService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  snapshot: FinanceDashboardSnapshot | null = null;
  statementSummary: { revenue: number; expenses: number; vatPayable: number; netIncome: number; periodLabel: string } | null = null;
  isLoading = true;
  loadError = false;
  currentPeriod: FinancePeriod = 'month';

  // Chart Options
  gmvTrendOptions: EChartsOption = {};
  revenueCompositionOptions: EChartsOption = {};
  refundTrendOptions: EChartsOption = {};

  periods = [
    { labelKey: 'FINANCES.PERIODS.TODAY', value: 'today' as FinancePeriod },
    { labelKey: 'FINANCES.PERIODS.WEEK', value: 'week' as FinancePeriod },
    { labelKey: 'FINANCES.PERIODS.MONTH', value: 'month' as FinancePeriod },
    { labelKey: 'FINANCES.PERIODS.QUARTER', value: 'quarter' as FinancePeriod }
  ];

  ngOnInit(): void {
    this.loadData(true);
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.cdr.markForCheck();
      if (this.snapshot) {
        this.buildCharts();
      }
    });

    merge(timer(60_000), interval(60_000))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadData(false));
  }

  loadData(showLoading = true): void {
    if (showLoading) {
      this.isLoading = true;
      this.loadError = false;
      this.snapshot = null;
      this.statementSummary = null;
    }

    forkJoin({
      snapshot: this.financeService.getDashboardSnapshot(this.currentPeriod).pipe(
        catchError((error) => {
          console.error('Finance dashboard failed to load.', error);
          this.loadError = true;
          return of(null);
        })
      ),
      statement: this.financeService.getStatementSummary(this.currentPeriod).pipe(
        catchError(() => of(null))
      )
    }).pipe(
      finalize(() => {
        if (showLoading) {
          this.isLoading = false;
        }
      })
    ).subscribe(({ snapshot, statement }) => {
      this.cdr.markForCheck();
      this.snapshot = snapshot;
      this.statementSummary = statement;
      if (snapshot) {
        this.loadError = false;
        this.buildCharts();
      }
    });
  }

  setPeriod(period: FinancePeriod): void {
    this.currentPeriod = period;
    this.loadData(true);
  }

  onKpiClick(kpi: FinanceKPI): void {
    if (kpi.clickRoute) this.router.navigateByUrl(kpi.clickRoute);
  }

  onAlertAction(alert: FinanceDashboardAlert): void {
    if (alert.actionRoute) this.router.navigateByUrl(alert.actionRoute);
  }

  private buildCharts(): void {
    if (!this.snapshot) return;
    this.buildGmvTrendChart();
    this.buildRevenueCompositionChart();
    this.buildRefundTrendChart();
  }

  private buildGmvTrendChart(): void {
    const data = this.snapshot!.collectionTrend;
    const isRtl = this.translate.currentLang === 'ar';
    const xAxisLabels = data.map(d => this.translate.instant(this.getMonthLabelKey(d.label)));
    const gmvData = data.map(d => d.value);
    const revenueData = data.map(d => d.secondaryValue ?? 0);

    this.gmvTrendOptions = {
      tooltip: {
        trigger: 'axis',
        className: '!rounded-xl !shadow-lg !border-none !bg-white/95 !backdrop-blur-md',
        textStyle: { fontFamily: 'inherit', color: '#1e293b' }
      },
      legend: {
        data: [
          this.translate.instant('FINANCES.CHART.SERIES_GMV'),
          this.translate.instant('FINANCES.CHART.SERIES_NET_REVENUE')
        ],
        bottom: 0,
        icon: 'circle',
        textStyle: { fontFamily: 'inherit', color: '#64748b', fontSize: 12, fontWeight: 600 }
      },
      grid: {
        left: isRtl ? '3%' : '2%',
        right: isRtl ? '2%' : '3%',
        bottom: '12%',
        top: '8%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisLabels,
        inverse: isRtl,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#94a3b8', fontFamily: 'inherit', fontWeight: 600, fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        position: isRtl ? 'right' : 'left',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#94a3b8', fontFamily: 'inherit', fontWeight: 600, fontSize: 11 }
      },
      series: [
        {
          name: this.translate.instant('FINANCES.CHART.SERIES_GMV'),
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 3, color: '#1FA3B5' },
          itemStyle: { color: '#1FA3B5' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(31, 163, 181, 0.3)' },
              { offset: 1, color: 'rgba(31, 163, 181, 0.0)' }
            ])
          },
          data: gmvData
        },
        {
          name: this.translate.instant('FINANCES.CHART.SERIES_NET_REVENUE'),
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 3, color: '#10b981' },
          itemStyle: { color: '#10b981' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.0)' }
            ])
          },
          data: revenueData
        }
      ]
    };
  }

  private buildRevenueCompositionChart(): void {
    const data = this.snapshot!.revenueComposition;
    const currency = this.translate.instant('FINANCES.CURRENCY');
    const seriesName = this.translate.instant('FINANCES.CHART.COMPOSITION');
    
    const chartData = data.map(d => ({
      name: this.translate.instant(d.labelKey),
      value: d.amount,
      itemStyle: { color: d.color }
    }));

    this.revenueCompositionOptions = {
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const item = params as { name?: string; value?: number; percent?: number };
          return `${item.name ?? ''}: ${item.value ?? 0} ${currency} (${item.percent ?? 0}%)`;
        },
        className: '!rounded-xl !shadow-lg !border-none !bg-white/95 !backdrop-blur-md',
        textStyle: { fontFamily: 'inherit', color: '#1e293b', fontWeight: 'bold' }
      },
      legend: {
        bottom: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontFamily: 'inherit', color: '#64748b', fontSize: 11, fontWeight: 600 }
      },
      series: [
        {
          name: seriesName,
          type: 'pie',
          radius: ['55%', '80%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false },
          labelLine: { show: false },
          data: chartData
        }
      ]
    };
  }

  private buildRefundTrendChart(): void {
    const data = this.snapshot!.revenueTrend;
    const isRtl = this.translate.currentLang === 'ar';
    const xAxisLabels = data.map(d => this.translate.instant(this.getMonthLabelKey(d.label)));
    const trendData = data.map(d => d.value);
    const seriesName = this.translate.instant('FINANCES.CHART.REFUND_TREND');

    this.refundTrendOptions = {
      tooltip: {
        trigger: 'axis',
        className: '!rounded-xl !shadow-lg !border-none !bg-white/95 !backdrop-blur-md',
        textStyle: { fontFamily: 'inherit', color: '#1e293b' }
      },
      grid: {
        left: isRtl ? '3%' : '2%',
        right: isRtl ? '2%' : '3%',
        bottom: '10%',
        top: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisLabels,
        inverse: isRtl,
        axisLine: { show: false },
        axisLabel: { color: '#94a3b8', fontFamily: 'inherit', fontWeight: 600, fontSize: 10 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        position: isRtl ? 'right' : 'left',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#94a3b8', fontFamily: 'inherit', fontWeight: 600, fontSize: 10 }
      },
      series: [
        {
          name: seriesName,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 3, color: '#f59e0b' },
          itemStyle: { color: '#f59e0b', borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 158, 11, 0.2)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0.0)' }
            ])
          },
          data: trendData
        }
      ]
    };
  }

  getAlertBannerVariant(severity: string): 'info' | 'warning' | 'error' | 'critical' {
    if (severity === 'critical') return 'critical';
    if (severity === 'warning') return 'warning';
    if (severity === 'error') return 'error';
    return 'info';
  }

  getAlertIcon(severity: string): string {
    if (severity === 'critical') return 'priority_high';
    if (severity === 'warning') return 'warning';
    return 'info';
  }

  getEntityLabelKey(type: string): string {
    return FINANCE_ENTITY_LABEL_KEYS[type] ?? type;
  }

  getMonthLabelKey(label: string): string {
    return resolveFinanceMonthLabelKey(label);
  }

  formatNumber(value: number, maximumFractionDigits = 0): string {
    return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
      minimumFractionDigits: maximumFractionDigits,
      maximumFractionDigits
    });
  }

  formatTime(ts: string): string {
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return this.translate.instant('FINANCES.TIME.JUST_NOW');
    if (diff < 60) return this.translate.instant('FINANCES.TIME.MINUTES_AGO', { count: diff });
    if (diff < 1440) return this.translate.instant('FINANCES.TIME.HOURS_AGO', { count: Math.floor(diff / 60) });
    return d.toLocaleDateString(getFinanceLocale(this.translate.currentLang), { timeZone: 'Asia/Riyadh', calendar: 'gregory' });
  }
}
