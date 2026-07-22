import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { DashboardKpiCard, DashboardSeverity } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard-kpi-strip',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgxEchartsDirective],
  templateUrl: './dashboard-kpi-strip.component.html',
  styles: [':host { display: block; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardKpiStripComponent {
  @Input() kpis: DashboardKpiCard[] = [];
  @Input() microChartOptions: Record<string, EChartsOption> = {};

  getKpiCardBorderClass(severity: DashboardSeverity): string {
    const map: Record<DashboardSeverity, string> = {
      critical: 'border-l-red-400',
      warning: 'border-l-amber-400',
      info: 'border-l-cyan-400',
      success: 'border-l-emerald-400',
      neutral: 'border-l-slate-200'
    };
    return map[severity];
  }

  getTrendClasses(direction: 'up' | 'down' | 'flat'): string {
    if (direction === 'up') return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (direction === 'down') return 'text-red-600 bg-red-50 border-red-100';
    return 'text-slate-500 bg-slate-100 border-slate-200';
  }
}
