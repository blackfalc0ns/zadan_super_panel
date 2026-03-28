import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, finalize, of, switchMap, timer } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { FinanceDashboardSnapshot, FinanceDashboardAlert, FinancePeriod, ChartDataPoint } from '../../models/finance.models';
import { FinanceKpiCardComponent } from '../../components/finance-kpi-card/finance-kpi-card.component';
import { FinanceKPI } from '../../models/finance.models';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { StatusPillComponent } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { FINANCE_ENTITY_LABEL_KEYS, FINANCE_MONTH_LABEL_KEYS, getFinanceLocale } from '../../utils/finance-i18n.utils';

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, FinanceKpiCardComponent, AppCardComponent, AppButtonComponent, SectionHeaderComponent, InlineBannerComponent, StatusPillComponent],
  template: `
    <div class="flex flex-col gap-6 animate-in fade-in duration-700">

      <!-- Period Selector -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1 bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
          <button *ngFor="let p of periods"
                  (click)="setPeriod(p.value)"
                  class="px-4 py-1.5 rounded-xl text-[10px] font-black transition-all duration-200"
                  [ngClass]="currentPeriod === p.value
                    ? 'bg-zadna-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'">
            {{ p.labelKey | translate }}
          </button>
        </div>
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {{ 'FINANCES.LAST_UPDATED' | translate }}: {{ 'FINANCES.TIME.JUST_NOW' | translate }}
        </span>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div *ngFor="let _ of [1,2,3,4,5,6]"
             class="h-36 bg-slate-100 rounded-2xl animate-pulse"></div>
      </div>

      <div *ngIf="!isLoading && loadError"
           class="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
        <div>
          <p class="text-sm font-black">{{ 'FINANCES.DASHBOARD.LOAD_ERROR_TITLE' | translate }}</p>
          <p class="text-xs font-medium text-amber-800/80">{{ 'FINANCES.DASHBOARD.LOAD_ERROR_MESSAGE' | translate }}</p>
        </div>
        <app-button
          variant="outline"
          size="sm"
          customClass="shrink-0 !rounded-xl !border-amber-300 !bg-white !text-amber-900 hover:!bg-amber-100"
          (btnClick)="loadData()"
        >
          {{ 'FINANCES.DASHBOARD.RETRY' | translate }}
        </app-button>
      </div>

      <!-- KPI Cards -->
      <div *ngIf="!isLoading && snapshot" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 stagger-rows">
        <app-finance-kpi-card [kpi]="snapshot.gmv"                (cardClick)="onKpiClick($event)" class="stagger-1"></app-finance-kpi-card>
        <app-finance-kpi-card [kpi]="snapshot.netRevenue"         (cardClick)="onKpiClick($event)" class="stagger-2"></app-finance-kpi-card>
        <app-finance-kpi-card [kpi]="snapshot.vendorCommissions"  (cardClick)="onKpiClick($event)" class="stagger-3"></app-finance-kpi-card>
        <app-finance-kpi-card [kpi]="snapshot.driverPayouts"      (cardClick)="onKpiClick($event)" class="stagger-4"></app-finance-kpi-card>
        <app-finance-kpi-card [kpi]="snapshot.refundRatio"        (cardClick)="onKpiClick($event)" class="stagger-5"></app-finance-kpi-card>
        <app-finance-kpi-card [kpi]="snapshot.disputeExposure"    (cardClick)="onKpiClick($event)" class="stagger-6"></app-finance-kpi-card>
      </div>

      <!-- Main Grid -->
      <div *ngIf="!isLoading && snapshot" class="grid grid-cols-1 xl:grid-cols-12 gap-6">

        <!-- GMV Trend Chart (col 8) -->
        <app-card class="xl:col-span-8" variant="default" rounded="2xl" padding="md" customClass="border-slate-200/70 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <app-section-header
              [compact]="true"
              icon="monitoring"
              title="FINANCES.CHART.GMV_VS_REVENUE"
              description="FINANCES.CHART.LAST_7_MONTHS">
            </app-section-header>
            <div class="flex items-center gap-4 text-[10px] font-bold">
              <span class="flex items-center gap-1.5 text-zadna-primary">
                <span class="w-3 h-0.5 bg-zadna-primary rounded-full inline-block"></span> {{ 'FINANCES.CHART.SERIES_GMV' | translate }}
              </span>
              <span class="flex items-center gap-1.5 text-emerald-500">
                <span class="w-3 h-0.5 bg-emerald-500 rounded-full inline-block"></span> {{ 'FINANCES.CHART.SERIES_NET_REVENUE' | translate }}
              </span>
            </div>
          </div>

          <!-- Chart Area -->
          <div class="relative h-48">
            <svg viewBox="0 0 700 160" preserveAspectRatio="none" class="w-full h-full">
              <defs>
                <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#127C8C" stop-opacity="0.15"/>
                  <stop offset="100%" stop-color="#127C8C" stop-opacity="0"/>
                </linearGradient>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10b981" stop-opacity="0.15"/>
                  <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <!-- GMV Area -->
              <path [attr.d]="getChartAreaPath(snapshot!.gmvTrend, 'value')" fill="url(#gmvGrad)"/>
              <!-- Revenue Area -->
              <path [attr.d]="getChartAreaPath(snapshot!.gmvTrend, 'secondaryValue')" fill="url(#revenueGrad)"/>
              <!-- GMV Line -->
              <path [attr.d]="getChartLinePath(snapshot!.gmvTrend, 'value')" fill="none" stroke="#127C8C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- Revenue Line -->
              <path [attr.d]="getChartLinePath(snapshot!.gmvTrend, 'secondaryValue')" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- Data Points for GMV -->
              <g *ngFor="let point of snapshot!.gmvTrend; let i = index">
                <circle [attr.cx]="getX(i, snapshot!.gmvTrend.length)" [attr.cy]="getY(point.value, snapshot!.gmvTrend, 'value')" r="3.5" fill="#127C8C"/>
                <!-- Label -->
                <text [attr.x]="getX(i, snapshot!.gmvTrend.length)" y="155" text-anchor="middle" font-size="9" fill="#94a3b8" font-weight="700">{{ getMonthLabelKey(point.label) | translate }}</text>
              </g>
            </svg>
          </div>
        </app-card>

        <!-- Revenue Composition (col 4) -->
        <app-card class="xl:col-span-4" variant="default" rounded="2xl" padding="md" customClass="border-slate-200/70 shadow-sm">
          <div class="mb-5">
            <app-section-header
              [compact]="true"
              icon="pie_chart"
              title="FINANCES.CHART.COMPOSITION"
              description="FINANCES.CHART.REVENUE_BREAKDOWN">
            </app-section-header>
          </div>

          <!-- Stacked horizontal bar -->
          <div class="h-4 rounded-full overflow-hidden flex mb-6" *ngIf="snapshot!.revenueComposition.length">
            <div *ngFor="let seg of snapshot!.revenueComposition"
                 [style.width.%]="seg.percent"
                 [style.background-color]="seg.color"
                 class="h-full transition-all duration-700 first:rounded-s-full last:rounded-e-full"
                 [title]="seg.labelKey + ': ' + seg.percent + '%'">
            </div>
          </div>

          <!-- Legend -->
          <div class="flex flex-col gap-3">
            <div *ngFor="let seg of snapshot!.revenueComposition"
                 class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" [style.background-color]="seg.color"></span>
                <span class="text-[10px] font-bold text-slate-600">{{ seg.labelKey | translate }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black text-slate-800 tabular-nums">{{ formatNumber(seg.amount) }}</span>
                <span class="text-[9px] font-black text-slate-400 w-8 text-end">{{ seg.percent }}%</span>
              </div>
            </div>
          </div>
        </app-card>

        <!-- Refund Trend (col 4) -->
        <app-card class="xl:col-span-4" variant="default" rounded="2xl" padding="md" customClass="border-slate-200/70 shadow-sm">
          <div class="flex items-center justify-between mb-5">
            <app-section-header
              [compact]="true"
              tone="warning"
              icon="undo"
              title="FINANCES.CHART.REFUND_TREND"
              description="FINANCES.CHART.REFUND_RATE">
            </app-section-header>
            <app-status-pill
              [label]="formatPercent(snapshot!.refundRatio.value)"
              [shouldTranslate]="false"
              [showDot]="false"
              variant="warning"
              size="sm">
            </app-status-pill>
          </div>

          <div class="h-28">
            <svg viewBox="0 0 400 80" preserveAspectRatio="none" class="w-full h-full">
              <defs>
                <linearGradient id="refundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.2"/>
                  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path [attr.d]="getRefundAreaPath()" fill="url(#refundGrad)"/>
              <path [attr.d]="getRefundLinePath()" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <g *ngFor="let pt of snapshot!.refundTrend; let i = index">
                <circle [attr.cx]="getX(i, snapshot!.refundTrend.length)" [attr.cy]="getRefundY(pt.value)" r="3" fill="#f59e0b"/>
              </g>
            </svg>
          </div>

          <!-- Month Labels -->
          <div class="flex justify-between mt-1">
            <span *ngFor="let pt of snapshot!.refundTrend" class="text-[9px] font-bold text-slate-400">{{ getMonthLabelKey(pt.label) | translate }}</span>
          </div>
        </app-card>

        <!-- Alerts Panel (col 8) -->
        <app-card class="xl:col-span-8" variant="default" rounded="2xl" padding="none" customClass="border-slate-200/70 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <app-section-header
              [compact]="true"
              tone="danger"
              icon="warning"
              title="FINANCES.ALERTS.TITLE">
              <app-status-pill
                meta
                [label]="formatNumber(snapshot!.alerts.length)"
                [shouldTranslate]="false"
                [showDot]="false"
                variant="danger"
                size="sm">
              </app-status-pill>
            </app-section-header>
            <app-button variant="ghost" size="xs" customClass="!rounded-xl !text-zadna-primary">
              {{ 'FINANCES.ACTIONS.VIEW_ALL' | translate }}
            </app-button>
          </div>

          <div class="space-y-3 p-6">
            <app-inline-banner
              *ngFor="let alert of snapshot!.alerts"
              [title]="alert.titleKey"
              [message]="alert.descriptionKey"
              [variant]="getAlertBannerVariant(alert.severity)"
              [icon]="getAlertIcon(alert.severity)"
              [compact]="true">
              <div class="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-black text-current/80">
                <span>{{ formatTime(alert.timestamp) }}</span>
                <span *ngIf="alert.entityName">{{ getEntityLabelKey(alert.entityType) | translate }}: {{ alert.entityName }}</span>
                <span *ngIf="alert.amount">{{ formatNumber(alert.amount) }} SAR</span>
              </div>
              <app-button
                actions
                *ngIf="alert.actionRoute"
                variant="ghost"
                size="xs"
                customClass="!rounded-xl !bg-white/70"
                (btnClick)="onAlertAction(alert)">
                {{ 'FINANCES.COMMON.VIEW' | translate }}
              </app-button>
            </app-inline-banner>

            <div *ngIf="!snapshot!.alerts.length" class="px-6 py-8 text-center">
              <p class="text-sm font-black text-slate-700">{{ 'FINANCES.DASHBOARD.NO_ALERTS_TITLE' | translate }}</p>
              <p class="mt-1 text-xs font-medium text-slate-500">{{ 'FINANCES.DASHBOARD.NO_ALERTS_MESSAGE' | translate }}</p>
            </div>
          </div>
        </app-card>

      </div>
    </div>
  `
})
export class FinanceDashboardComponent implements OnInit {
  private financeService = inject(FinanceService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  snapshot: FinanceDashboardSnapshot | null = null;
  isLoading = true;
  loadError = false;
  currentPeriod: FinancePeriod = 'month';

  periods = [
    { labelKey: 'FINANCES.PERIODS.TODAY', value: 'today' as FinancePeriod },
    { labelKey: 'FINANCES.PERIODS.WEEK', value: 'week' as FinancePeriod },
    { labelKey: 'FINANCES.PERIODS.MONTH', value: 'month' as FinancePeriod },
    { labelKey: 'FINANCES.PERIODS.QUARTER', value: 'quarter' as FinancePeriod }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.loadError = false;
    this.snapshot = null;

    timer(0).pipe(
      switchMap(() => this.financeService.getDashboardSnapshot(this.currentPeriod)),
      catchError((error) => {
        console.error('Finance dashboard failed to load.', error);
        this.loadError = true;
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe((data) => {
      this.snapshot = data;
    });
  }

  setPeriod(period: FinancePeriod): void {
    this.currentPeriod = period;
    this.loadData();
  }

  onKpiClick(kpi: FinanceKPI): void {
    if (kpi.clickRoute) this.router.navigateByUrl(kpi.clickRoute);
  }

  onAlertAction(alert: FinanceDashboardAlert): void {
    if (alert.actionRoute) this.router.navigateByUrl(alert.actionRoute);
  }

  // Chart helpers
  getX(index: number, total: number): number {
    return total <= 1 ? 350 : (index / (total - 1)) * 700;
  }

  getY(value: number, data: ChartDataPoint[], key: 'value' | 'secondaryValue'): number {
    const values = data.map(d => key === 'value' ? d.value : (d.secondaryValue ?? 0));
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    return 140 - ((value - min) / range) * 130;
  }

  getChartLinePath(data: ChartDataPoint[], key: 'value' | 'secondaryValue'): string {
    if (!data.length) return '';
    const values = data.map(d => key === 'value' ? d.value : (d.secondaryValue ?? 0));
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    return values.map((v, i) => {
      const x = this.getX(i, data.length);
      const y = 140 - ((v - min) / range) * 130;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  getChartAreaPath(data: ChartDataPoint[], key: 'value' | 'secondaryValue'): string {
    const line = this.getChartLinePath(data, key);
    if (!line) return '';
    return `${line} L 700 160 L 0 160 Z`;
  }

  getRefundLinePath(): string {
    if (!this.snapshot?.refundTrend.length) return '';
    const data = this.snapshot.refundTrend;
    const max = Math.max(...data.map(d => d.value), 1);
    return data.map((d, i) => {
      const x = data.length <= 1 ? 200 : (i / (data.length - 1)) * 400;
      const y = 70 - (d.value / max) * 60;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  getRefundAreaPath(): string {
    const line = this.getRefundLinePath();
    if (!line) return '';
    return `${line} L 400 80 L 0 80 Z`;
  }

  getRefundY(value: number): number {
    if (!this.snapshot) return 40;
    const max = Math.max(...this.snapshot.refundTrend.map(d => d.value), 1);
    return 70 - (value / max) * 60;
  }

  getAlertBannerVariant(severity: string): 'info' | 'warning' | 'error' | 'critical' {
    if (severity === 'critical') return 'critical';
    if (severity === 'warning') return 'warning';
    if (severity === 'error') return 'error';
    return 'info';
  }

  getAlertIconBg(severity: string): string {
    if (severity === 'critical') return 'bg-red-50';
    if (severity === 'warning') return 'bg-amber-50';
    return 'bg-blue-50';
  }

  getAlertIconColor(severity: string): string {
    if (severity === 'critical') return 'text-red-500';
    if (severity === 'warning') return 'text-amber-500';
    return 'text-blue-500';
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
    return FINANCE_MONTH_LABEL_KEYS[label] ?? label;
  }

  formatNumber(value: number, maximumFractionDigits = 0): string {
    return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
      minimumFractionDigits: maximumFractionDigits,
      maximumFractionDigits
    });
  }

  formatPercent(value: number): string {
    return `${this.formatNumber(value, 1)}%`;
  }

  formatTime(ts: string): string {
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return this.translate.instant('FINANCES.TIME.JUST_NOW');
    if (diff < 60) return this.translate.instant('FINANCES.TIME.MINUTES_AGO', { count: diff });
    if (diff < 1440) return this.translate.instant('FINANCES.TIME.HOURS_AGO', { count: Math.floor(diff / 60) });
    return d.toLocaleDateString(getFinanceLocale(this.translate.currentLang), { calendar: 'gregory' });
  }
}
