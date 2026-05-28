import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { merge, of, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { SuperAdminDashboardService } from '@dashboard/services/dashboard.api.service';
import {
  DashboardAlert,
  DashboardAttentionItem,
  DashboardFilterState,
  DashboardQueue,
  DashboardSection,
  DashboardSnapshot
} from '../../dashboard/models/dashboard.models';

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
  template: `
    <div class="min-h-full bg-slate-50/70 pb-10" [attr.dir]="isRTL ? 'rtl' : 'ltr'">
      <app-page-header
        [title]="'LIVE_OPS_PAGE.TITLE'"
        [subtitle]="'LIVE_OPS_PAGE.SUBTITLE'"
        [showBack]="true"
        [backUrl]="'/dashboard'"
        [showToolbar]="true"
        [breadcrumbs]="[
          { label: 'SIDEBAR.HOME', url: '/dashboard' },
          { label: 'LIVE_OPS_PAGE.BREADCRUMB' }
        ]">
        <span title-prefix class="material-symbols-outlined text-[28px] text-zadna-primary">monitor_heart</span>

        <div actions class="flex items-center gap-3">
          <a routerLink="/system-logs"
             class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-[12px] font-black text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-zadna-primary/30 hover:text-zadna-primary hover:shadow-md">
            <span class="material-symbols-outlined text-[18px]">terminal</span>
            {{ 'SIDEBAR.SYSTEM_LOGS' | translate }}
          </a>
          <div class="hidden sm:flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-[11px] font-black text-slate-600 shadow-sm">
            <span class="h-2.5 w-2.5 rounded-full" [ngClass]="refreshState === 'error' ? 'bg-red-400' : (isAutoRefreshing ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300')"></span>
                    <span>{{ displayText(refreshStateLabel) }}</span>
          </div>
          <button
            type="button"
            (click)="refreshNow()"
            [disabled]="isLoading"
            class="inline-flex items-center gap-2 rounded-2xl bg-zadna-primary px-5 py-3 text-[12px] font-black text-white shadow-lg shadow-zadna-primary/20 transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60 disabled:hover:translate-y-0">
            <span class="material-symbols-outlined text-[18px]" [class.opacity-40]="isRefreshing">refresh</span>
            {{ 'LIVE_OPS_PAGE.ACTIONS.REFRESH' | translate }}
          </button>
        </div>
      </app-page-header>

      <div class="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-5 lg:px-8">
        <ng-container *ngIf="!isLoading && !loadError && viewModel as vm; else stateTpl">
          <section class="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-[0_10px_40px_-16px_rgba(15,23,42,0.18)] backdrop-blur-xl">
            <div class="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div class="max-w-3xl">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-zadna-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zadna-primary">
                  <span class="material-symbols-outlined text-[16px]">bolt</span>
                  {{ 'LIVE_OPS_PAGE.HERO.BADGE' | translate }}
                </div>
                <h1 class="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                  {{ 'LIVE_OPS_PAGE.HERO.TITLE' | translate }}
                </h1>
                <p class="mt-3 max-w-2xl text-[14px] font-bold leading-7 text-slate-500">
                  {{ 'LIVE_OPS_PAGE.HERO.DESCRIPTION' | translate }}
                </p>

                <div class="mt-6 flex flex-wrap items-center gap-3">
                  <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[12px] font-black text-slate-700">
                    <span class="material-symbols-outlined text-[18px] text-zadna-primary">schedule</span>
                    {{ vm.snapshot.lastUpdatedLabel }}
                  </span>
                  <span class="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-[12px] font-black text-red-700">
                    <span class="material-symbols-outlined text-[18px]">warning</span>
                    {{ 'LIVE_OPS_PAGE.HERO.SIGNALS' | translate:{ count: vm.totalSignals } }}
                  </span>
                </div>
              </div>

              <div class="grid w-full gap-3 sm:grid-cols-2 xl:w-[28rem]">
                <article *ngFor="let metric of vm.heroMetrics"
                  class="rounded-[1.5rem] border p-4"
                  [ngClass]="heroMetricClasses(metric.tone)">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">{{ displayText(metric.labelKey) }}</p>
                      <p class="mt-2 text-2xl font-black tracking-tight">{{ metric.value }}</p>
                    </div>
                    <span class="material-symbols-outlined text-[24px] opacity-80">{{ metric.icon }}</span>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <div class="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section class="rounded-[2rem] border border-slate-200/70 bg-white/85 p-5 shadow-[0_8px_32px_-18px_rgba(15,23,42,0.22)]">
              <div class="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">{{ 'LIVE_OPS_PAGE.CRITICAL.BADGE' | translate }}</p>
                  <h2 class="mt-2 text-xl font-black text-slate-950">{{ 'LIVE_OPS_PAGE.CRITICAL.TITLE' | translate }}</h2>
                </div>
                <span class="rounded-full bg-red-50 px-3 py-1 text-[11px] font-black text-red-600">{{ vm.criticalAlerts.length }}</span>
              </div>

              <div class="space-y-3" *ngIf="vm.criticalAlerts.length > 0; else emptyCriticalTpl">
                <a *ngFor="let alert of vm.criticalAlerts"
                  [routerLink]="alert.route"
                  class="group block rounded-[1.5rem] border border-slate-200 bg-white p-4 transition hover:border-red-200 hover:bg-red-50/30">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-[18px]" [ngClass]="severityTextClass(alert.severity)">emergency_home</span>
                        <h3 class="truncate text-[13px] font-black text-slate-900 group-hover:text-zadna-primary">{{ displayText(alert.titleKey) }}</h3>
                      </div>
                      <p class="mt-2 text-[12px] font-semibold leading-6 text-slate-500">{{ displayText(alert.summaryKey, alert.summaryParams) }}</p>
                    </div>
                    <span class="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-black text-red-600">{{ alert.count }}</span>
                  </div>
                </a>
              </div>
            </section>

            <section class="rounded-[2rem] border border-slate-200/70 bg-white/85 p-5 shadow-[0_8px_32px_-18px_rgba(15,23,42,0.22)]">
              <div class="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-500">{{ 'LIVE_OPS_PAGE.ATTENTION.BADGE' | translate }}</p>
                  <h2 class="mt-2 text-xl font-black text-slate-950">{{ 'LIVE_OPS_PAGE.ATTENTION.TITLE' | translate }}</h2>
                </div>
                <span class="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-600">{{ vm.attentionItems.length }}</span>
              </div>

              <div class="space-y-3" *ngIf="vm.attentionItems.length > 0; else emptyAttentionTpl">
                <article *ngFor="let item of vm.attentionItems" class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-[18px]" [ngClass]="severityTextClass(item.priority)">assignment_late</span>
                        <p class="truncate text-[13px] font-black text-slate-900">{{ displayText(item.entityLabelKey) }} #{{ item.entityName }}</p>
                      </div>
                      <p class="mt-2 text-[12px] font-semibold leading-6 text-slate-500">{{ item.summary }}</p>
                      <p class="mt-2 text-[11px] font-black text-slate-400">{{ item.owner }}</p>
                    </div>
                    <a [routerLink]="item.route" class="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-zadna-primary/20 hover:text-zadna-primary">
                      {{ displayText(item.actionLabelKey) }}
                      <span class="material-symbols-outlined text-[16px]">arrow_outward</span>
                    </a>
                  </div>
                </article>
              </div>
            </section>
          </div>

          <div class="grid grid-cols-1 gap-6 2xl:grid-cols-[0.95fr_0.95fr_1.1fr]">
            <section class="rounded-[2rem] border border-slate-200/70 bg-white/85 p-5 shadow-[0_8px_32px_-18px_rgba(15,23,42,0.22)]">
              <div class="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-zadna-primary">{{ 'LIVE_OPS_PAGE.LIVE.BADGE' | translate }}</p>
                  <h2 class="mt-2 text-xl font-black text-slate-950">{{ 'LIVE_OPS_PAGE.LIVE.TITLE' | translate }}</h2>
                </div>
                <span class="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-600">{{ queueCount(vm.liveQueues) }}</span>
              </div>

              <div class="space-y-3" *ngIf="vm.liveQueues.length > 0; else emptyLiveTpl">
                <a *ngFor="let queue of vm.liveQueues"
                  [routerLink]="queue.route"
                  class="flex items-center justify-between gap-4 rounded-[1.4rem] border border-slate-200 bg-slate-50/60 p-4 transition hover:border-zadna-primary/20 hover:bg-zadna-primary/5">
                  <div class="min-w-0">
                    <p class="truncate text-[13px] font-black text-slate-900">{{ displayText(queue.labelKey) }}</p>
                    <p class="mt-1 text-[11px] font-bold text-slate-500">{{ displayText(queue.helperKey) }}</p>
                  </div>
                  <div class="flex items-center gap-3 shrink-0">
                    <span class="rounded-xl bg-white px-3 py-2 text-[12px] font-black text-slate-800 shadow-sm">{{ queue.count }}</span>
                    <span class="material-symbols-outlined text-[18px] text-slate-300">arrow_forward</span>
                  </div>
                </a>
              </div>
            </section>

            <section class="rounded-[2rem] border border-slate-200/70 bg-white/85 p-5 shadow-[0_8px_32px_-18px_rgba(15,23,42,0.22)]">
              <div class="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">{{ 'LIVE_OPS_PAGE.RISK.BADGE' | translate }}</p>
                  <h2 class="mt-2 text-xl font-black text-slate-950">{{ 'LIVE_OPS_PAGE.RISK.TITLE' | translate }}</h2>
                </div>
                <span class="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-600">{{ queueCount(vm.riskQueues) }}</span>
              </div>

              <div class="space-y-3" *ngIf="vm.riskQueues.length > 0; else emptyRiskTpl">
                <a *ngFor="let queue of vm.riskQueues"
                  [routerLink]="queue.route"
                  class="flex items-center justify-between gap-4 rounded-[1.4rem] border p-4 transition"
                  [ngClass]="riskQueueClasses(queue.severity)">
                  <div class="min-w-0">
                    <p class="truncate text-[13px] font-black text-slate-900">{{ displayText(queue.labelKey) }}</p>
                    <p class="mt-1 text-[11px] font-bold text-slate-500">{{ displayText(queue.helperKey) }}</p>
                  </div>
                  <div class="flex items-center gap-3 shrink-0">
                    <span class="rounded-xl bg-white px-3 py-2 text-[12px] font-black text-slate-800 shadow-sm">{{ queue.count }}</span>
                    <span class="material-symbols-outlined text-[18px] text-slate-300">arrow_forward</span>
                  </div>
                </a>
              </div>
            </section>

            <section class="rounded-[2rem] border border-slate-200/70 bg-white/85 p-5 shadow-[0_8px_32px_-18px_rgba(15,23,42,0.22)] flex flex-col min-h-0">
              <div class="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{{ 'LIVE_OPS_PAGE.SECTIONS.BADGE' | translate }}</p>
                  <h2 class="mt-2 text-xl font-black text-slate-950">{{ 'LIVE_OPS_PAGE.SECTIONS.TITLE' | translate }}</h2>
                </div>
                <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-600">{{ vm.highlightedSections.length }}</span>
              </div>

              <div class="space-y-3 overflow-y-auto pe-1 min-h-0 max-h-[30rem]" *ngIf="vm.highlightedSections.length > 0; else emptySectionsTpl">
                <article *ngFor="let section of vm.highlightedSections" class="rounded-[1.2rem] border border-slate-200 bg-slate-50/60 p-3.5">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-[13px] font-black text-slate-900">{{ displayText(section.titleKey) }}</p>
                      <p class="mt-1 text-[11px] font-semibold leading-6 text-slate-500">{{ displayText(section.descriptionKey) }}</p>
                    </div>
                    <a [routerLink]="section.route" class="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-zadna-primary/20 hover:text-zadna-primary">
                      {{ 'COMMON.OPEN' | translate }}
                    </a>
                  </div>

                  <div class="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2" *ngIf="section.stats.length > 0">
                    <div *ngFor="let stat of section.stats.slice(0, 4)" class="rounded-xl border border-white/70 bg-white px-3 py-2.5">
                      <p class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{{ displayText(stat.labelKey) }}</p>
                      <p class="mt-2 text-[15px] font-black text-slate-900">{{ stat.displayValue }}</p>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </ng-container>
      </div>

      <ng-template #emptyCriticalTpl>
        <div class="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center text-[12px] font-bold text-slate-400">
          {{ 'LIVE_OPS_PAGE.EMPTY.CRITICAL' | translate }}
        </div>
      </ng-template>

      <ng-template #emptyAttentionTpl>
        <div class="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center text-[12px] font-bold text-slate-400">
          {{ 'LIVE_OPS_PAGE.EMPTY.ATTENTION' | translate }}
        </div>
      </ng-template>

      <ng-template #emptyLiveTpl>
        <div class="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center text-[12px] font-bold text-slate-400">
          {{ 'LIVE_OPS_PAGE.EMPTY.LIVE' | translate }}
        </div>
      </ng-template>

      <ng-template #emptyRiskTpl>
        <div class="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center text-[12px] font-bold text-slate-400">
          {{ 'LIVE_OPS_PAGE.EMPTY.RISK' | translate }}
        </div>
      </ng-template>

      <ng-template #emptySectionsTpl>
        <div class="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center text-[12px] font-bold text-slate-400">
          {{ 'LIVE_OPS_PAGE.EMPTY.SECTIONS' | translate }}
        </div>
      </ng-template>

      <ng-template #stateTpl>
        <div class="flex min-h-[65vh] flex-col items-center justify-center gap-4 px-4">
          <div *ngIf="isLoading" class="w-full max-w-5xl space-y-4">
            <div class="admin-skeleton-detail">
              <div class="admin-skeleton-detail-hero">
                <div class="space-y-3">
                  <span class="admin-skeleton admin-skeleton-line lg w-1/3"></span>
                  <span class="admin-skeleton admin-skeleton-line w-2/3"></span>
                </div>
                <span class="admin-skeleton admin-skeleton-chip"></span>
              </div>
              <div class="admin-skeleton-detail-grid">
                <div *ngFor="let item of [1,2,3,4]" class="admin-skeleton-card space-y-3">
                  <span class="admin-skeleton admin-skeleton-line sm w-1/2"></span>
                  <span class="admin-skeleton admin-skeleton-line lg w-3/4"></span>
                </div>
              </div>
            </div>
            <div class="admin-skeleton-table" style="--skeleton-columns: 4">
              <div *ngFor="let item of [1,2,3]" class="admin-skeleton-table-row">
                <span class="admin-skeleton admin-skeleton-line lg w-4/5"></span>
                <span class="admin-skeleton admin-skeleton-chip"></span>
                <span class="admin-skeleton admin-skeleton-line w-2/3"></span>
                <span class="admin-skeleton admin-skeleton-chip"></span>
              </div>
            </div>
          </div>
          <div *ngIf="loadError" class="flex max-w-md flex-col items-center gap-3 rounded-[2rem] border border-red-100 bg-white px-8 py-10 text-center shadow-sm">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <span class="material-symbols-outlined text-[28px]">error</span>
            </div>
            <h3 class="text-lg font-black text-slate-900">{{ 'LIVE_OPS_PAGE.ERROR.TITLE' | translate }}</h3>
            <p class="text-[13px] font-bold leading-6 text-slate-500">{{ 'LIVE_OPS_PAGE.ERROR.SUBTITLE' | translate }}</p>
            <button type="button" (click)="refreshNow()" class="rounded-2xl bg-slate-900 px-5 py-3 text-[12px] font-black text-white transition hover:bg-slate-800">
              {{ 'COMMON.RETRY' | translate }}
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `
})
export class LiveOpsComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly autoRefreshMs = 30000;

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
              this.viewModel = vm;
              this.isLoading = false;
              this.loadError = false;
              this.isRefreshing = false;
              this.isAutoRefreshing = false;
              this.refreshState = 'idle';
            }),
            catchError(() => {
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

  heroMetricClasses(tone: LiveOpsHeroMetric['tone']): string {
    switch (tone) {
      case 'danger':
        return 'border-red-100 bg-red-50/70 text-red-700';
      case 'warning':
        return 'border-amber-100 bg-amber-50/70 text-amber-700';
      case 'success':
        return 'border-emerald-100 bg-emerald-50/70 text-emerald-700';
      case 'info':
        return 'border-zadna-primary/15 bg-zadna-primary/5 text-zadna-primary';
      default:
        return 'border-slate-200 bg-slate-50/70 text-slate-700';
    }
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
