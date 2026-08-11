import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { merge, of, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import {
  DashboardAlert,
  DashboardAttentionItem,
  DashboardFilterState,
  DashboardQueue,
  DashboardSection,
  DashboardSnapshot,
  SuperAdminDashboardService
} from '@dashboard/public-api';

type LiveOpsRefreshReason = 'initial' | 'auto' | 'manual' | 'external' | 'language';
type LiveOpsRefreshState = 'idle' | 'refreshing' | 'error';

interface LiveOpsHeroMetric {
  labelKey: string;
  value: string;
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  icon: string;
}

interface LiveOpsViewModel {
  snapshot: DashboardSnapshot;
  criticalAlerts: DashboardAlert[];
  liveQueues: DashboardQueue[];
  riskQueues: DashboardQueue[];
  attentionItems: DashboardAttentionItem[];
  highlightedSections: DashboardSection[];
  heroMetrics: LiveOpsHeroMetric[];
  totalSignals: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-live-ops',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, AppPageHeaderComponent],
  templateUrl: './live-ops.component.html',
  host: { class: 'block' }
})
export class LiveOpsComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly autoRefreshMs = 60000;

  currentLang: 'ar' | 'en' = 'ar';
  isRTL = true;
  isLoading = true;
  isRefreshing = false;
  isAutoRefreshing = false;
  loadError = false;
  refreshState: LiveOpsRefreshState = 'idle';
  viewModel: LiveOpsViewModel | null = null;

  readonly filterState: DashboardFilterState = {
    dateRange: 'today',
    region: 'all',
    vendorId: 'all',
    refreshMode: 'manual'
  };

  readonly skeletonHeroMetrics = [1, 2, 3, 4];
  readonly skeletonPanelRows = [1, 2, 3];
  readonly skeletonQueueRows = [1, 2];

  constructor(
    private readonly dashboardService: SuperAdminDashboardService,
    private readonly translate: TranslateService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentLang = (this.translate.currentLang || 'ar') as 'ar' | 'en';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
      this.cdr.markForCheck();
        this.currentLang = event.lang as 'ar' | 'en';
        this.isRTL = this.currentLang === 'ar';
        if (this.viewModel) {
          this.refreshNow('language');
        }
      });

    const refreshParam$ = this.route.queryParamMap.pipe(
      map((params) => params.get('liveOpsRefresh')),
      tap((value) => {
        if (value) {
          this.setRefreshingState('external');
        }
      })
    );

    merge(
      of<LiveOpsRefreshReason>('initial'),
      timer(this.autoRefreshMs, this.autoRefreshMs).pipe(map(() => 'auto' as LiveOpsRefreshReason)),
      refreshParam$.pipe(map((value) => (value ? 'external' : null)))
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((reason) => {
          if (!reason) {
            return of(null);
          }

          this.setRefreshingState(reason);
          return this.dashboardService.getDashboardSnapshot(this.filterState, this.currentLang).pipe(
            map((snapshot) => this.buildViewModel(snapshot)),
            tap((vm) => {
              this.cdr.markForCheck();
              this.viewModel = vm;
              this.isLoading = false;
              this.loadError = false;
              this.isRefreshing = false;
              this.isAutoRefreshing = false;
              this.refreshState = 'idle';
            }),
            catchError(() => {
              this.cdr.markForCheck();
              this.isLoading = false;
              this.isRefreshing = false;
              this.isAutoRefreshing = false;
              this.refreshState = 'error';
              this.loadError = !this.viewModel;
              return of(null);
            })
          );
        })
      )
      .subscribe();
  }

  refreshNow(reason: LiveOpsRefreshReason = 'manual'): void {
    this.setRefreshingState(reason);
    this.dashboardService.getDashboardSnapshot(this.filterState, this.currentLang)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (snapshot) => {
        this.cdr.markForCheck();
          this.viewModel = this.buildViewModel(snapshot);
          this.isLoading = false;
          this.loadError = false;
          this.isRefreshing = false;
          this.isAutoRefreshing = false;
          this.refreshState = 'idle';
        },
        error: () => {
        this.cdr.markForCheck();
          this.isLoading = false;
          this.isRefreshing = false;
          this.isAutoRefreshing = false;
          this.refreshState = 'error';
          this.loadError = !this.viewModel;
        }
      });
  }

  get navigateIcon(): string {
    return this.isRTL ? 'chevron_left' : 'chevron_right';
  }

  panelIconBoxClasses(variant: 'critical' | 'attention' | 'live' | 'risk' | 'sections'): string {
    const base = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset';
    switch (variant) {
      case 'critical':
        return `${base} bg-red-100 text-red-600 ring-red-200/70`;
      case 'attention':
        return `${base} bg-amber-100 text-amber-700 ring-amber-200/70`;
      case 'live':
        return `${base} bg-emerald-100 text-emerald-700 ring-emerald-200/70`;
      case 'risk':
        return `${base} bg-orange-100 text-orange-800 ring-orange-200/70`;
      default:
        return `${base} bg-slate-100 text-slate-600 ring-slate-200/80`;
    }
  }

  panelIconName(variant: 'critical' | 'attention' | 'live' | 'risk' | 'sections'): string {
    switch (variant) {
      case 'critical':
        return 'crisis_alert';
      case 'attention':
        return 'pending_actions';
      case 'live':
        return 'sensors';
      case 'risk':
        return 'shield';
      default:
        return 'space_dashboard';
    }
  }

  severityIconBoxClasses(severity: 'critical' | 'warning' | 'info' | 'success' | 'neutral'): string {
    const base = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1';
    switch (severity) {
      case 'critical':
        return `${base} bg-red-50 text-red-600 ring-red-100`;
      case 'warning':
        return `${base} bg-amber-50 text-amber-600 ring-amber-100`;
      case 'success':
        return `${base} bg-emerald-50 text-emerald-600 ring-emerald-100`;
      case 'info':
        return `${base} bg-sky-50 text-zadna-primary ring-sky-100`;
      default:
        return `${base} bg-slate-50 text-slate-500 ring-slate-100`;
    }
  }

  severityIconName(severity: 'critical' | 'warning' | 'info' | 'success' | 'neutral'): string {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'check_circle';
      case 'info':
        return 'info';
      default:
        return 'help';
    }
  }

  errorIconBoxClasses(): string {
    return 'flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100';
  }

  emptyIconBoxClasses(tone: 'success' | 'neutral' | 'muted'): string {
    const base = 'flex h-14 w-14 items-center justify-center rounded-2xl ring-1';
    switch (tone) {
      case 'success':
        return `${base} bg-emerald-50 text-emerald-500 ring-emerald-100`;
      case 'muted':
        return `${base} bg-slate-100 text-slate-400 ring-slate-200`;
      default:
        return `${base} bg-slate-50 text-slate-400 ring-slate-100`;
    }
  }

  countBadgeClasses(tone: 'critical' | 'attention' | 'live' | 'risk' | 'neutral'): string {
    const base = 'inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2 text-[11px] font-black leading-none';
    switch (tone) {
      case 'critical':
        return `${base} bg-red-100 text-red-700 ring-1 ring-red-200/80`;
      case 'attention':
        return `${base} bg-amber-100 text-amber-800 ring-1 ring-amber-200/80`;
      case 'live':
        return `${base} bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80`;
      case 'risk':
        return `${base} bg-orange-100 text-orange-800 ring-1 ring-orange-200/80`;
      default:
        return `${base} bg-slate-100 text-slate-700 ring-1 ring-slate-200/80`;
    }
  }

  get refreshStateLabel(): string {
    if (this.refreshState === 'error') {
      return 'LIVE_OPS_PAGE.STATUS.ERROR';
    }
    if (this.isAutoRefreshing) {
      return 'LIVE_OPS_PAGE.STATUS.AUTO_REFRESHING';
    }
    if (this.isRefreshing) {
      return 'LIVE_OPS_PAGE.STATUS.REFRESHING';
    }
    return 'LIVE_OPS_PAGE.STATUS.LIVE';
  }

  queueCount(queues: DashboardQueue[]): number {
    return queues.reduce((sum, queue) => sum + queue.count, 0);
  }

  statusPillClasses(): string {
    if (this.refreshState === 'error') {
      return 'border border-red-200 bg-red-50 text-red-700';
    }
    if (this.refreshState === 'idle' && !this.isRefreshing && !this.isAutoRefreshing) {
      return 'border border-emerald-200 bg-emerald-50 text-emerald-800';
    }
    return 'border border-slate-200 bg-white text-slate-600';
  }

  heroHeroMetricClasses(tone: LiveOpsHeroMetric['tone']): string {
    switch (tone) {
      case 'danger':
        return 'border-red-300/35 bg-red-500/20';
      case 'warning':
        return 'border-amber-300/35 bg-amber-500/20';
      case 'success':
        return 'border-emerald-300/35 bg-emerald-500/20';
      case 'info':
        return 'border-white/20 bg-white/10';
      default:
        return 'border-white/15 bg-white/10';
    }
  }

  queueCountClasses(isHot: boolean): string {
    return isHot
      ? 'text-red-700 ring-2 ring-red-200'
      : 'text-slate-800';
  }

  riskQueueClasses(severity: DashboardQueue['severity']): string {
    switch (severity) {
      case 'critical':
        return 'border-red-100 bg-red-50/40 hover:border-red-200';
      case 'warning':
        return 'border-amber-100 bg-amber-50/40 hover:border-amber-200';
      case 'success':
        return 'border-emerald-100 bg-emerald-50/40 hover:border-emerald-200';
      default:
        return 'border-slate-200 bg-slate-50/60 hover:border-zadna-primary/20';
    }
  }

  severityTextClass(severity: 'critical' | 'warning' | 'info' | 'success' | 'neutral'): string {
    switch (severity) {
      case 'critical':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      case 'success':
        return 'text-emerald-500';
      case 'info':
        return 'text-zadna-primary';
      default:
        return 'text-slate-400';
    }
  }

  displayText(value: string | null | undefined, params?: Record<string, string | number>): string {
    if (!value) {
      return '';
    }

    const translated = this.translate.instant(value, params);
    if (translated !== value) {
      return translated;
    }

    return this.dashboardService.localizeText(value, this.currentLang);
  }

  private setRefreshingState(reason: LiveOpsRefreshReason): void {
    if (reason === 'initial') {
      this.isLoading = true;
      this.loadError = false;
    }

    this.isRefreshing = reason === 'manual' || reason === 'external' || reason === 'language';
    this.isAutoRefreshing = reason === 'auto';
    if (reason !== 'initial') {
      this.refreshState = 'refreshing';
    }
    this.cdr.markForCheck();
  }

  private buildViewModel(snapshot: DashboardSnapshot): LiveOpsViewModel {
    const criticalAlerts = [...snapshot.alerts]
      .sort((a, b) => this.severityRank(b.severity) - this.severityRank(a.severity))
      .slice(0, 6);
    const highlightedSections = [...snapshot.sections]
      .sort((a, b) => this.severityRank(b.status.severity) - this.severityRank(a.status.severity))
      .slice(0, 4);
    const totalSignals =
      criticalAlerts.reduce((sum, alert) => sum + alert.count, 0) +
      this.queueCount(snapshot.queues.risk) +
      snapshot.attentionItems.length;

    return {
      snapshot,
      criticalAlerts,
      liveQueues: snapshot.queues.live,
      riskQueues: snapshot.queues.risk,
      attentionItems: snapshot.attentionItems.slice(0, 6),
      highlightedSections,
      totalSignals,
      heroMetrics: [
        {
          labelKey: 'LIVE_OPS_PAGE.HERO.METRICS.SYSTEM_MODE',
          value: snapshot.systemMode === 'live'
            ? this.translate.instant('LIVE_OPS_PAGE.SYSTEM_MODE.LIVE')
            : this.translate.instant('LIVE_OPS_PAGE.SYSTEM_MODE.SNAPSHOT'),
          tone: snapshot.systemMode === 'live' ? 'success' : 'info',
          icon: snapshot.systemMode === 'live' ? 'wifi_tethering' : 'schedule'
        },
        {
          labelKey: 'LIVE_OPS_PAGE.HERO.METRICS.CRITICAL_ALERTS',
          value: String(criticalAlerts.length),
          tone: criticalAlerts.length > 0 ? 'danger' : 'neutral',
          icon: 'error'
        },
        {
          labelKey: 'LIVE_OPS_PAGE.HERO.METRICS.RISK_LOAD',
          value: String(this.queueCount(snapshot.queues.risk)),
          tone: this.queueCount(snapshot.queues.risk) > 0 ? 'warning' : 'neutral',
          icon: 'monitoring'
        },
        {
          labelKey: 'LIVE_OPS_PAGE.HERO.METRICS.LIVE_LOAD',
          value: String(this.queueCount(snapshot.queues.live)),
          tone: this.queueCount(snapshot.queues.live) > 0 ? 'info' : 'neutral',
          icon: 'bolt'
        }
      ]
    };
  }

  private severityRank(severity: 'critical' | 'warning' | 'info' | 'success' | 'neutral'): number {
    switch (severity) {
      case 'critical':
        return 5;
      case 'warning':
        return 4;
      case 'info':
        return 3;
      case 'success':
        return 2;
      default:
        return 1;
    }
  }
}
