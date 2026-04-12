import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { SuperAdminDashboardService } from '@dashboard/services/dashboard.api.service';
import {
  DashboardDateRange,
  DashboardFilterState,
  DashboardSeverity,
  DashboardSnapshot,
  DashboardTrendSegment,
  DashboardTrendPoint
} from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  userName = 'Admin';
  currentLang: 'ar' | 'en' = 'ar';
  isRTL = true;
  isLoading = true;
  dashboardSearch = '';

  filterState: DashboardFilterState = {
    dateRange: 'today',
    region: 'all',
    vendorId: 'all',
    refreshMode: 'manual'
  };

  dashboard: DashboardSnapshot | null = null;

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
        this.loadDashboard();
      });

    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardSnapshot(this.filterState, this.currentLang)
      .pipe(take(1))
      .subscribe((dashboard) => {
        this.dashboard = dashboard;
        this.isLoading = false;
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

  getSeverityPillVariant(severity: DashboardSeverity): 'processing' | 'success' | 'warning' | 'danger' | 'neutral' {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
        return 'processing';
      default:
        return 'neutral';
    }
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

  getKpiAccentClasses(severity: DashboardSeverity | undefined): string {
    const classes: Record<DashboardSeverity | 'default', string> = {
      critical: 'from-red-500/12 to-red-50/40 border-red-200/80',
      warning: 'from-amber-500/12 to-amber-50/40 border-amber-200/80',
      info: 'from-cyan-500/12 to-cyan-50/40 border-cyan-200/80',
      success: 'from-emerald-500/12 to-emerald-50/40 border-emerald-200/80',
      neutral: 'from-slate-500/10 to-slate-50/40 border-slate-200/80',
      default: 'from-slate-500/10 to-slate-50/40 border-slate-200/80'
    };

    return classes[severity ?? 'default'];
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

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'SA';
  }

  getOverviewConversionRate(): string {
    const values: Record<DashboardDateRange, string> = {
      today: '3.82%',
      week: '4.07%',
      month: '3.94%'
    };

    return values[this.filterState.dateRange];
  }

  getOverviewResponseTime(): string {
    const values: Record<DashboardDateRange, string> = {
      today: '142ms',
      week: '156ms',
      month: '163ms'
    };

    return values[this.filterState.dateRange];
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

  getSegmentClasses(severity: DashboardSeverity): string {
    const classes: Record<DashboardSeverity, string> = {
      critical: 'bg-red-400',
      warning: 'bg-amber-400',
      info: 'bg-cyan-400',
      success: 'bg-emerald-400',
      neutral: 'bg-slate-400'
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

  getRelativeValueWidth(value: number, values: number[]): number {
    const max = Math.max(...values, 1);
    if (value <= 0) {
      return 0;
    }

    return Math.max(10, Math.min(100, (value / max) * 100));
  }

  getProgressClasses(severity: DashboardSeverity): string {
    const classes: Record<DashboardSeverity, string> = {
      critical: 'bg-red-500',
      warning: 'bg-amber-500',
      info: 'bg-cyan-500',
      success: 'bg-emerald-500',
      neutral: 'bg-slate-400'
    };

    return classes[severity];
  }

  getMaxPointTotal(points: DashboardTrendPoint[]): number {
    return Math.max(
      ...points.map((point) =>
        point.segments?.reduce((sum, segment) => sum + segment.value, 0) ?? point.value
      ),
      1
    );
  }

  getLiveOrdersSummary(snapshot: DashboardSnapshot): number {
    return (snapshot.liveQueues[0]?.count ?? 0) + (snapshot.liveQueues[1]?.count ?? 0);
  }

  getRiskLoadSummary(snapshot: DashboardSnapshot): number {
    return (snapshot.riskQueues[0]?.count ?? 0) + (snapshot.riskQueues[3]?.count ?? 0);
  }

  getRelativePressureWidth(score: number, rows: Array<{ score: number }>): number {
    const max = Math.max(...rows.map((row) => row.score), 1);
    if (score <= 0) {
      return 0;
    }

    return Math.max(12, Math.min(100, (score / max) * 100));
  }

  getRegionPressureBarClasses(score: number, rows: Array<{ score: number }>): string {
    const width = this.getRelativePressureWidth(score, rows);

    if (width >= 75) {
      return 'from-red-500 to-orange-500';
    }

    if (width >= 45) {
      return 'from-amber-500 to-orange-400';
    }

    return 'from-cyan-500 to-zadna-primary';
  }

  getPressureLabel(score: number, rows: Array<{ score: number }>): string {
    const width = this.getRelativePressureWidth(score, rows);

    if (width >= 75) {
      return this.translate.instant('DASHBOARD.PRESSURE_LEVEL.HIGH');
    }

    if (width >= 45) {
      return this.translate.instant('DASHBOARD.PRESSURE_LEVEL.MEDIUM');
    }

    return this.translate.instant('DASHBOARD.PRESSURE_LEVEL.LOW');
  }

  getPressureTextClasses(score: number, rows: Array<{ score: number }>): string {
    const width = this.getRelativePressureWidth(score, rows);

    if (width >= 75) {
      return 'text-red-600';
    }

    if (width >= 45) {
      return 'text-amber-600';
    }

    return 'text-emerald-600';
  }

  getRegionShortCode(label: string): string {
    const normalized = label.toLowerCase();

    if (normalized.includes('central') || normalized.includes('الوسط')) {
      return 'CEN';
    }

    if (normalized.includes('western') || normalized.includes('الغرب')) {
      return 'WES';
    }

    if (normalized.includes('eastern') || normalized.includes('الشرق')) {
      return 'EST';
    }

    if (normalized.includes('northern') || normalized.includes('الشمال')) {
      return 'NOR';
    }

    if (normalized.includes('southern') || normalized.includes('الجنوب')) {
      return 'STH';
    }

    return label.replace(/[^A-Za-z\u0621-\u064A]/g, '').slice(0, 3).toUpperCase();
  }

  getPointTotal(point: DashboardTrendPoint): number {
    return point.segments?.reduce((sum, segment) => sum + segment.value, 0) ?? point.value;
  }

  getSeriesTotal(points: DashboardTrendPoint[]): number {
    return points.reduce((sum, point) => sum + this.getPointTotal(point), 0);
  }

  getSegmentSummaries(points: DashboardTrendPoint[]): Array<DashboardTrendSegment & { share: number }> {
    const totals = new Map<string, DashboardTrendSegment>();

    points.forEach((point) => {
      point.segments?.forEach((segment) => {
        const current = totals.get(segment.id);
        if (current) {
          current.value += segment.value;
          return;
        }

        totals.set(segment.id, { ...segment });
      });
    });

    const totalVolume = Math.max(
      1,
      [...totals.values()].reduce((sum, segment) => sum + segment.value, 0)
    );

    return [...totals.values()].map((segment) => ({
      ...segment,
      share: (segment.value / totalVolume) * 100
    }));
  }

  getAreaPath(points: DashboardTrendPoint[], key: 'value' | 'secondaryValue'): string {
    if (!points.length) {
      return '';
    }

    const linePath = this.getLinePath(points, key);
    const width = 100;
    const height = 100;
    const startX = points.length === 1 ? width / 2 : 0;
    const endX = points.length === 1 ? width / 2 : width;

    return `${linePath} L ${endX} ${height} L ${startX} ${height} Z`;
  }

  getSeriesValueTotal(points: DashboardTrendPoint[], key: 'value' | 'secondaryValue'): number {
    return points.reduce((sum, point) => sum + (key === 'secondaryValue' ? point.secondaryValue ?? 0 : point.value), 0);
  }

  getPeakPoint(points: DashboardTrendPoint[], key: 'value' | 'secondaryValue'): DashboardTrendPoint | null {
    if (!points.length) {
      return null;
    }

    return points.reduce((peak, point) => {
      const peakValue = key === 'secondaryValue' ? peak.secondaryValue ?? 0 : peak.value;
      const pointValue = key === 'secondaryValue' ? point.secondaryValue ?? 0 : point.value;
      return pointValue > peakValue ? point : peak;
    });
  }

  getRiskRatio(point: DashboardTrendPoint): number {
    const exposure = point.secondaryValue ?? 0;
    if (!point.value) {
      return 0;
    }

    return (exposure / point.value) * 100;
  }

  getRevenueBarWidth(point: DashboardTrendPoint, points: DashboardTrendPoint[], key: 'value' | 'secondaryValue'): number {
    const max = Math.max(
      ...points.map((item) => key === 'secondaryValue' ? item.secondaryValue ?? 0 : item.value),
      1
    );
    const value = key === 'secondaryValue' ? point.secondaryValue ?? 0 : point.value;
    return Math.max(value > 0 ? 10 : 0, (value / max) * 100);
  }

  getPointHeight(point: DashboardTrendPoint, points: DashboardTrendPoint[]): number {
    const max = Math.max(...points.map((item) => this.getPointTotal(item)), 1);
    return Math.max(16, (this.getPointTotal(point) / max) * 100);
  }

  getNetRevenueProjection(points: DashboardTrendPoint[]): number {
    return this.getSeriesValueTotal(points, 'value') - this.getSeriesValueTotal(points, 'secondaryValue');
  }

  getForecastAccuracy(points: DashboardTrendPoint[]): number {
    const total = this.getSeriesValueTotal(points, 'value');
    const exposure = this.getSeriesValueTotal(points, 'secondaryValue');
    const ratio = total > 0 ? exposure / total : 0;
    return Math.max(92, Math.min(99.4, 99.2 - ratio * 6.4));
  }

  getLinePath(points: DashboardTrendPoint[], key: 'value' | 'secondaryValue'): string {
    if (!points.length) {
      return '';
    }

    const width = 100;
    const height = 100;
    const values = points.map((point) => key === 'secondaryValue' ? point.secondaryValue ?? 0 : point.value);
    const max = Math.max(...values, 1);

    return values.map((value, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  trackByValue(_index: number, item: { value: string }): string {
    return item.value;
  }

  trackByLabel(_index: number, item: { label: string }): string {
    return item.label;
  }
}

