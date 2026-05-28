import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { FinanceKPI } from '../../models/finance.models';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-finance-kpi-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, AppCardComponent],
  template: `
    <app-card
      variant="default"
      rounded="2xl"
      padding="none"
      [hover]="true"
      [customClass]="getCardClasses()"
      (click)="onCardClick()">
      <div class="relative overflow-hidden p-4">
        <div class="absolute inset-x-0 top-0 h-1.5" [ngClass]="getAccentStripClass()"></div>
        <div class="absolute -right-8 top-4 h-24 w-24 rounded-full blur-3xl" [ngClass]="getGlowClass()"></div>

        <div class="relative z-10">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105"
                  [ngClass]="getIconBgClass()">
                  <span class="material-symbols-outlined text-[18px]">{{ kpi.icon }}</span>
                </div>
                <div class="min-w-0">
                  <p class="truncate text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                    {{ kpi.labelKey | translate }}
                  </p>
                  <p class="mt-0.5 text-[11px] font-semibold text-slate-400">
                    {{ getTrendNarrative() | translate }}
                  </p>
                </div>
              </div>

              <div class="mt-4 flex items-end gap-2">
                <span class="text-[1.5rem] font-black tracking-tight text-slate-950 tabular-nums sm:text-[1.7rem]">
                  {{ getDisplayValue() }}
                </span>
                <span *ngIf="kpi.currency" class="pb-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  {{ 'FINANCES.CURRENCY' | translate }}
                </span>
              </div>

              <div class="mt-3 flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black"
                  [ngClass]="getTrendBadgeClass()">
                  <span class="material-symbols-outlined text-[14px]">
                    {{ kpi.trend === 'up' ? 'trending_up' : kpi.trend === 'down' ? 'trending_down' : 'remove' }}
                  </span>
                  {{ formatTrendPercent(kpi.trendPercent) }}
                </span>

                <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  {{ kpi.severity ?? 'neutral' }}
                </span>
              </div>
            </div>

            <div class="flex min-h-[80px] flex-col items-end justify-between">
              <div *ngIf="kpi.sparkline?.length" class="h-10 w-20 opacity-90">
                <svg viewBox="0 0 100 40" preserveAspectRatio="none" class="h-full w-full">
                  <defs>
                    <linearGradient [attr.id]="gradientId" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" [attr.stop-color]="getSparklineColor()" stop-opacity="0.30"></stop>
                      <stop offset="100%" [attr.stop-color]="getSparklineColor()" stop-opacity="0"></stop>
                    </linearGradient>
                  </defs>
                  <path [attr.d]="getAreaPath(kpi.sparkline!)" [attr.fill]="'url(#' + gradientId + ')'"></path>
                  <path
                    [attr.d]="getLinePath(kpi.sparkline!)"
                    fill="none"
                    [attr.stroke]="getSparklineColor()"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round">
                  </path>
                  <circle
                    [attr.cx]="getLastX(kpi.sparkline!)"
                    [attr.cy]="getLastY(kpi.sparkline!)"
                    r="3.2"
                    [attr.fill]="getSparklineColor()">
                  </circle>
                </svg>
              </div>

              <div
                *ngIf="kpi.clickRoute"
                class="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                {{ 'FINANCES.ACTIONS.OPEN' | translate }}
                <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-card>
  `
})
export class FinanceKpiCardComponent {
  private readonly translate = inject(TranslateService);

  @Input() kpi!: FinanceKPI;
  @Output() cardClick = new EventEmitter<FinanceKPI>();

  get gradientId(): string {
    return `finance-gradient-${this.kpi?.id ?? 'metric'}`;
  }

  onCardClick(): void {
    this.cardClick.emit(this.kpi);
  }

  getDisplayValue(): string {
    if (this.kpi.formattedValue.endsWith('%')) {
      return `${this.formatNumber(this.kpi.value, 1)}%`;
    }

    if (!Number.isFinite(this.kpi.value)) {
      return this.kpi.formattedValue;
    }

    return this.formatNumber(this.kpi.value);
  }

  formatTrendPercent(value: number): string {
    return `${this.formatNumber(value, 1)}%`;
  }

  getCardClasses(): string {
    return 'group cursor-pointer border border-slate-200/90 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]';
  }

  getAccentStripClass(): string {
    switch (this.kpi.severity) {
      case 'success': return 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-500';
      case 'warning': return 'bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500';
      case 'danger': return 'bg-gradient-to-r from-rose-400 via-red-500 to-orange-500';
      default: return 'bg-gradient-to-r from-slate-900 via-cyan-700 to-cyan-500';
    }
  }

  getGlowClass(): string {
    switch (this.kpi.severity) {
      case 'success': return 'bg-emerald-300/20';
      case 'warning': return 'bg-amber-300/25';
      case 'danger': return 'bg-red-300/20';
      default: return 'bg-cyan-300/20';
    }
  }

  getIconBgClass(): string {
    switch (this.kpi.severity) {
      case 'success': return 'bg-emerald-50 text-emerald-700';
      case 'warning': return 'bg-amber-50 text-amber-700';
      case 'danger': return 'bg-red-50 text-red-700';
      default: return 'bg-slate-950 text-white';
    }
  }

  getTrendBadgeClass(): string {
    if (this.kpi.severity === 'danger' && this.kpi.trend === 'up') return 'bg-red-50 text-red-700';
    if (this.kpi.severity === 'warning' && this.kpi.trend === 'up') return 'bg-amber-50 text-amber-700';
    if (this.kpi.trend === 'up') return 'bg-emerald-50 text-emerald-700';
    if (this.kpi.trend === 'down') return 'bg-red-50 text-red-700';
    return 'bg-slate-100 text-slate-600';
  }

  getTrendNarrative(): string {
    if (this.kpi.trend === 'up') {
      return 'FINANCES.NARRATIVES.IMPROVING';
    }

    if (this.kpi.trend === 'down') {
      return 'FINANCES.NARRATIVES.ATTENTION';
    }

    return 'FINANCES.NARRATIVES.STEADY';
  }

  getSparklineColor(): string {
    switch (this.kpi.severity) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      default: return '#0f172a';
    }
  }

  getLinePath(data: number[]): string {
    if (!data.length) return '';
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    return data.map((value, index) => {
      const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
      const y = 40 - ((value - min) / range) * 35;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  getAreaPath(data: number[]): string {
    if (!data.length) return '';
    const line = this.getLinePath(data);
    return `${line} L 100 40 L 0 40 Z`;
  }

  getLastX(data: number[]): number {
    return data.length > 1 ? 100 : 50;
  }

  getLastY(data: number[]): number {
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    const last = data[data.length - 1];
    return 40 - ((last - min) / range) * 35;
  }

  private formatNumber(value: number, maximumFractionDigits?: number): string {
    const hasFraction = value % 1 !== 0;
    return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
      minimumFractionDigits: hasFraction ? 1 : 0,
      maximumFractionDigits: maximumFractionDigits ?? (hasFraction ? 1 : 0)
    });
  }
}
