import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { FinanceKPI } from '../../models/finance.models';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';

@Component({
  selector: 'app-finance-kpi-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, AppCardComponent],
  template: `
    <app-card
      variant="default"
      rounded="xl"
      padding="none"
      [hover]="true"
      [customClass]="getCardClasses()"
      (click)="onCardClick()"
    >
      <div class="relative p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                 [ngClass]="getIconBgClass()">
                <span class="material-symbols-outlined text-[16px]">{{ kpi.icon }}</span>
              </div>
              <p class="min-w-0 truncate text-xs font-semibold text-slate-500">
                {{ kpi.labelKey | translate }}
              </p>
            </div>

            <div class="mt-4 flex items-baseline gap-1.5">
              <span class="text-2xl font-black text-slate-900 tabular-nums">{{ getDisplayValue() }}</span>
              <span *ngIf="kpi.currency" class="text-xs font-medium text-slate-400">{{ kpi.currency }}</span>
            </div>

            <div *ngIf="kpi.trendPercent !== undefined" class="mt-3">
              <span
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black"
                [ngClass]="getTrendBadgeClass()">
                <span class="material-symbols-outlined text-[12px]">
                  {{ kpi.trend === 'up' ? 'trending_up' : kpi.trend === 'down' ? 'trending_down' : 'remove' }}
                </span>
                {{ formatTrendPercent(kpi.trendPercent) }}
              </span>
            </div>
          </div>

          <div class="flex flex-col items-end gap-3">
            <div *ngIf="kpi.sparkline?.length" class="h-12 w-24">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" class="h-full w-full" [attr.aria-label]="kpi.labelKey | translate">
                <path [attr.d]="getAreaPath(kpi.sparkline!)" [ngClass]="getSparklineFillClass()" opacity="0.12"/>
                <path [attr.d]="getLinePath(kpi.sparkline!)" fill="none" [ngClass]="getSparklineStrokeClass()" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <circle [attr.cx]="getLastX(kpi.sparkline!)" [attr.cy]="getLastY(kpi.sparkline!)" r="2.5" [ngClass]="getSparklineDotClass()"/>
              </svg>
            </div>

            <div *ngIf="kpi.clickRoute"
                 class="opacity-50 transition-opacity duration-300 group-hover:opacity-100">
              <span class="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    </app-card>
  `
})
export class FinanceKpiCardComponent {
  private translate = inject(TranslateService);
  @Input() kpi!: FinanceKPI;
  @Output() cardClick = new EventEmitter<FinanceKPI>();

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
    const base = 'group cursor-pointer border border-slate-200 bg-white shadow-sm transition-colors hover:border-zadna-primary/30';
    switch (this.kpi.severity) {
      case 'success': return `${base} hover:border-emerald-200`;
      case 'warning': return `${base} hover:border-amber-200`;
      case 'danger': return `${base} hover:border-red-200`;
      default: return base;
    }
  }

  getIconBgClass(): string {
    switch (this.kpi.severity) {
      case 'success': return 'bg-emerald-50 text-emerald-600';
      case 'warning': return 'bg-amber-50 text-amber-600';
      case 'danger':  return 'bg-red-50 text-red-600';
      default:        return 'bg-zadna-primary/10 text-zadna-primary';
    }
  }

  getTrendBadgeClass(): string {
    if (this.kpi.severity === 'danger' && this.kpi.trend === 'up') return 'bg-red-50 text-red-600';
    if (this.kpi.severity === 'warning' && this.kpi.trend === 'up') return 'bg-amber-50 text-amber-700';
    if (this.kpi.trend === 'up') return 'bg-emerald-50 text-emerald-600';
    if (this.kpi.trend === 'down') return 'bg-red-50 text-red-600';
    return 'bg-slate-100 text-slate-500';
  }

  getSparklineFillClass(): string {
    switch (this.kpi.severity) {
      case 'success': return 'fill-emerald-500';
      case 'warning': return 'fill-amber-500';
      case 'danger':  return 'fill-red-500';
      default:        return 'fill-zadna-primary';
    }
  }

  getSparklineStrokeClass(): string {
    switch (this.kpi.severity) {
      case 'success': return 'stroke-emerald-500';
      case 'warning': return 'stroke-amber-500';
      case 'danger':  return 'stroke-red-500';
      default:        return 'stroke-zadna-primary';
    }
  }

  getSparklineDotClass(): string {
    switch (this.kpi.severity) {
      case 'success': return 'fill-emerald-500';
      case 'warning': return 'fill-amber-500';
      case 'danger':  return 'fill-red-500';
      default:        return 'fill-zadna-primary';
    }
  }

  getLinePath(data: number[]): string {
    if (!data.length) return '';
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 40 - ((v - min) / range) * 35;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
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
