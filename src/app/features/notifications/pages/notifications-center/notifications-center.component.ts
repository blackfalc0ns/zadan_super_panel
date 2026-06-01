import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminNotification, AdminNotificationFilters, AdminNotificationsService } from '../../../../core/services/admin-notifications.service';

interface NotificationFilterTab {
  labelKey: string;
  category?: string;
  priority?: string;
  isRead?: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-notifications-center',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="px-4 md:px-10 pt-4 md:pt-6 pb-8 max-w-[120rem] mx-auto w-full space-y-5" [attr.dir]="isRTL ? 'rtl' : 'ltr'">
      <ng-container *ngIf="initialLoading; else notificationsContent">
        <section class="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_80px_-56px_rgba(15,23,42,0.42)]">
          <div class="p-5 sm:p-6">
            <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex items-start gap-3">
                <span class="admin-skeleton admin-skeleton-avatar"></span>
                <div class="space-y-3">
                  <span class="admin-skeleton admin-skeleton-line lg w-64"></span>
                  <span class="admin-skeleton admin-skeleton-line w-96 max-w-full"></span>
                </div>
              </div>
              <span class="admin-skeleton admin-skeleton-line h-11 w-40 rounded-2xl"></span>
            </div>

            <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article *ngFor="let item of [1,2,3,4]" class="admin-skeleton-card min-h-[5.75rem] space-y-3">
                <span class="admin-skeleton admin-skeleton-line sm w-32"></span>
                <div class="flex items-end justify-between gap-3">
                  <span class="admin-skeleton admin-skeleton-line lg w-16"></span>
                  <span class="admin-skeleton admin-skeleton-chip"></span>
                </div>
              </article>
            </div>

            <div class="mt-5 flex gap-2 overflow-hidden">
              <span *ngFor="let item of [1,2,3,4,5,6,7]" class="admin-skeleton admin-skeleton-chip"></span>
            </div>
          </div>
        </section>

        <section class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_22px_70px_-52px_rgba(15,23,42,0.7)]">
          <div class="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
            <span class="admin-skeleton admin-skeleton-line lg w-44"></span>
            <span class="admin-skeleton admin-skeleton-line mt-3 w-80 max-w-full"></span>
          </div>
          <div class="space-y-3 p-3 sm:p-4">
            <div *ngFor="let item of [1,2,3,4,5]" class="admin-skeleton-card">
              <div class="flex items-start gap-4">
                <span class="admin-skeleton admin-skeleton-avatar"></span>
                <div class="min-w-0 flex-1 space-y-3">
                  <span class="admin-skeleton admin-skeleton-line lg w-2/3"></span>
                  <span class="admin-skeleton admin-skeleton-line w-full"></span>
                  <span class="admin-skeleton admin-skeleton-line sm w-1/3"></span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ng-container>

      <ng-template #notificationsContent>
      <section *ngIf="requiresApiSession" class="rounded-[24px] border border-[#ffd9a3] bg-gradient-to-r from-[#fff7e8] to-white p-5 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff0d1] text-[#d26a00]">
            <span class="material-symbols-outlined text-[22px]">lock</span>
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="text-[15px] font-black text-slate-900">{{ 'NOTIFICATIONS_CENTER.AUTH_REQUIRED.TITLE' | translate }}</h2>
            <p class="mt-1 text-[13px] font-semibold leading-6 text-slate-600">{{ 'NOTIFICATIONS_CENTER.AUTH_REQUIRED.MESSAGE' | translate }}</p>
          </div>
        </div>
      </section>

      <section class="overflow-hidden rounded-[28px] border border-[#bde8e8]/80 bg-gradient-to-br from-white via-[#eafbfb]/80 to-[#fff5e4]/90 shadow-[0_24px_80px_-48px_rgba(8,127,144,0.42)]">
        <div class="relative p-5 sm:p-6">
          <div class="pointer-events-none absolute inset-y-0 end-0 hidden w-56 bg-[radial-gradient(circle_at_center,_rgba(8,127,144,0.16),_transparent_68%)] sm:block"></div>
          <div class="pointer-events-none absolute -bottom-16 start-16 hidden h-40 w-40 rounded-full bg-[#f58b00]/10 blur-3xl lg:block"></div>
          <div class="relative flex flex-col gap-5">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex items-start gap-3">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#087f90] to-[#006878] text-white shadow-lg shadow-[#087f90]/25">
                  <span class="material-symbols-outlined text-[22px]">notifications_active</span>
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <h1 class="text-[24px] font-black tracking-tight text-slate-950">{{ 'NOTIFICATIONS_CENTER.TITLE' | translate }}</h1>
                    <span class="rounded-full border border-[#ffd8a3] bg-white/90 px-3 py-1 text-[11px] font-black text-[#d26a00] shadow-sm">
                      {{ unreadCount }} {{ 'NOTIFICATIONS_CENTER.UNREAD_PILL' | translate }}
                    </span>
                  </div>
                  <p class="mt-1 max-w-3xl text-[13px] font-semibold leading-6 text-slate-600">{{ 'NOTIFICATIONS_CENTER.SUBTITLE' | translate }}</p>
                </div>
              </div>

              <button
                type="button"
                (click)="markAllRead()"
                [disabled]="unreadCount === 0"
                class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#087f90] to-[#006878] px-5 text-[12px] font-black text-white shadow-lg shadow-[#087f90]/25 transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
                <span class="material-symbols-outlined text-[18px]">done_all</span>
                {{ 'NOTIFICATIONS_CENTER.MARK_ALL_READ' | translate }}
              </button>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article class="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm shadow-[#087f90]/10 backdrop-blur">
                <p class="text-[11px] font-black uppercase tracking-[0.16em] text-[#087f90]/70">{{ 'NOTIFICATIONS_CENTER.STATS.TOTAL' | translate }}</p>
                <div class="mt-3 flex items-end justify-between gap-3">
                  <strong class="text-[28px] font-black leading-none text-slate-950">{{ notifications.length }}</strong>
                  <span class="rounded-xl bg-[#e7f7f7] px-2.5 py-1 text-[11px] font-black text-[#087f90]">{{ 'NOTIFICATIONS_CENTER.STATS.VISIBLE' | translate }}</span>
                </div>
              </article>

              <article class="rounded-2xl border border-[#ffd9a3] bg-gradient-to-br from-[#fff4df] to-white p-4 shadow-sm shadow-[#f58b00]/10">
                <p class="text-[11px] font-black uppercase tracking-[0.16em] text-[#d26a00]/75">{{ 'NOTIFICATIONS_CENTER.STATS.UNREAD' | translate }}</p>
                <div class="mt-3 flex items-end justify-between gap-3">
                  <strong class="text-[28px] font-black leading-none text-slate-950">{{ unreadCount }}</strong>
                  <span class="rounded-xl bg-white px-2.5 py-1 text-[11px] font-black text-[#d26a00] shadow-sm">{{ 'NOTIFICATIONS_CENTER.NEW_BADGE' | translate }}</span>
                </div>
              </article>

              <article class="rounded-2xl border border-[#ffd08a] bg-gradient-to-br from-[#fff0d1] to-white p-4 shadow-sm shadow-[#f58b00]/10">
                <p class="text-[11px] font-black uppercase tracking-[0.16em] text-[#c75d00]">{{ 'NOTIFICATIONS_CENTER.STATS.URGENT' | translate }}</p>
                <div class="mt-3 flex items-end justify-between gap-3">
                  <strong class="text-[28px] font-black leading-none text-slate-950">{{ urgentCount }}</strong>
                  <span class="rounded-xl bg-white px-2.5 py-1 text-[11px] font-black text-[#c75d00] shadow-sm">{{ 'NOTIFICATIONS_CENTER.TABS.URGENT' | translate }}</span>
                </div>
              </article>

              <article class="rounded-2xl border border-[#bde8e8] bg-gradient-to-br from-[#eafbfb] to-white p-4 shadow-sm shadow-[#087f90]/10">
                <p class="text-[11px] font-black uppercase tracking-[0.16em] text-[#087f90]">{{ 'NOTIFICATIONS_CENTER.STATS.FILTER' | translate }}</p>
                <div class="mt-3 flex items-end justify-between gap-3">
                  <strong class="text-[20px] font-black leading-tight text-slate-950">{{ selectedTab.labelKey | translate }}</strong>
                  <span class="rounded-xl bg-white px-2.5 py-1 text-[11px] font-black text-[#087f90] shadow-sm">{{ 'NOTIFICATIONS_CENTER.STATS.ACTIVE' | translate }}</span>
                </div>
              </article>
            </div>

            <div class="flex gap-2 overflow-x-auto pb-1">
              <button *ngFor="let tab of tabs" type="button" (click)="selectTab(tab)"
                class="shrink-0 rounded-full border px-4 py-2 text-[11px] font-black transition"
                [ngClass]="selectedTab === tab
                  ? 'border-[#087f90] bg-[#087f90] text-white shadow-lg shadow-[#087f90]/15'
                  : 'border-white bg-white/90 text-slate-600 hover:border-[#9ddada] hover:bg-[#f2fbfb] hover:text-[#087f90]'">
                {{ tab.labelKey | translate }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="overflow-hidden rounded-[28px] border border-[#d7eeee] bg-white shadow-[0_22px_70px_-52px_rgba(8,127,144,0.55)]">
        <div class="border-b border-[#e3f4f4] bg-gradient-to-r from-[#f3fbfb] to-white px-5 py-4">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-[15px] font-black text-slate-900">{{ 'NOTIFICATIONS_CENTER.LIST_TITLE' | translate }}</h2>
              <p class="text-[12px] font-semibold text-slate-500">{{ 'NOTIFICATIONS_CENTER.LIST_SUBTITLE' | translate }}</p>
            </div>
            <span class="inline-flex items-center gap-2 rounded-full border border-[#bde8e8] bg-white px-3 py-1.5 text-[11px] font-black text-[#087f90]">
              <span class="material-symbols-outlined text-[16px] text-[#087f90]/70">tune</span>
              {{ notifications.length }} {{ 'NOTIFICATIONS_CENTER.RESULTS_LABEL' | translate }}
            </span>
          </div>
        </div>

        <div *ngIf="loading" class="space-y-3 p-3 sm:p-4">
          <div *ngFor="let item of [1,2,3,4]" class="admin-skeleton-card">
            <div class="flex items-start gap-4">
              <span class="admin-skeleton admin-skeleton-avatar"></span>
              <div class="min-w-0 flex-1 space-y-3">
                <span class="admin-skeleton admin-skeleton-line lg w-2/3"></span>
                <span class="admin-skeleton admin-skeleton-line w-full"></span>
                <span class="admin-skeleton admin-skeleton-line sm w-1/3"></span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && notifications.length > 0" class="space-y-3 p-3 sm:p-4">
          <button *ngFor="let notification of notifications; trackBy: trackByNotificationId" type="button"
            (click)="open(notification)"
            class="group flex w-full items-start gap-4 rounded-2xl border border-[#dcefee] bg-white px-4 py-4 text-start transition hover:-translate-y-0.5 hover:border-[#9ddada] hover:bg-[#f6fcfc] hover:shadow-lg hover:shadow-[#087f90]/10">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-[18px]"
              [ngClass]="categoryTone(notification.category)">
              <span class="material-symbols-outlined">{{ categoryIcon(notification.category) }}</span>
            </span>

            <span class="min-w-0 flex-1">
              <span class="flex flex-wrap items-center gap-2">
                <span class="text-[14px] font-black leading-6 text-slate-950">{{ displayTitle(notification) }}</span>
                <span *ngIf="!notification.isRead" class="rounded-full bg-[#fff0d1] px-2 py-0.5 text-[10px] font-black text-[#d26a00]">
                  {{ 'NOTIFICATIONS_CENTER.NEW_BADGE' | translate }}
                </span>
                <span class="rounded-full border px-2 py-0.5 text-[10px] font-black uppercase" [ngClass]="priorityClasses(notification.priority)">
                  {{ priorityLabel(notification.priority) }}
                </span>
                <span class="rounded-full bg-[#eafbfb] px-2 py-0.5 text-[10px] font-black text-[#087f90] uppercase">
                  {{ categoryLabel(notification.category) }}
                </span>
              </span>

              <span class="mt-1.5 block text-[13px] font-semibold leading-6 text-slate-500">{{ displayBody(notification) }}</span>

              <span class="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-400">
                <span class="inline-flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px]">schedule</span>
                  {{ notification.createdAtUtc | date:'medium' }}
                </span>
                <span *ngIf="notification.referenceId" class="inline-flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px]">tag</span>
                  #{{ notification.referenceId }}
                </span>
              </span>
            </span>

            <span class="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#d7eeee] bg-[#f3fbfb] text-[#087f90]/60 transition group-hover:border-[#9ddada] group-hover:bg-white group-hover:text-[#087f90]">
              <span class="material-symbols-outlined text-[18px]">{{ isRTL ? 'arrow_back' : 'arrow_forward' }}</span>
            </span>
          </button>
        </div>

        <div *ngIf="!loading && notifications.length === 0" class="p-12 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#eafbfb] text-[#087f90]">
            <span class="material-symbols-outlined text-[28px]">notifications_none</span>
          </div>
          <p class="mt-4 text-[16px] font-black text-slate-800">{{ 'NOTIFICATIONS_CENTER.EMPTY_TITLE' | translate }}</p>
          <p class="mt-2 text-[13px] font-semibold leading-6 text-slate-500">{{ 'NOTIFICATIONS_CENTER.EMPTY_MESSAGE' | translate }}</p>
        </div>

        <div *ngIf="hasMore && !loading" class="border-t border-slate-100 p-4 text-center">
          <button type="button" (click)="loadMore()"
            class="inline-flex items-center gap-2 rounded-2xl border border-[#bde8e8] bg-white px-5 py-2.5 text-[12px] font-black text-[#087f90] transition hover:bg-[#f2fbfb]">
            <span class="material-symbols-outlined text-[17px]">expand_more</span>
            {{ 'NOTIFICATIONS_CENTER.LOAD_MORE' | translate }}
          </button>
        </div>
      </section>
      </ng-template>
    </div>
  `
})
export class NotificationsCenterComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  readonly tabs: NotificationFilterTab[] = [
    { labelKey: 'NOTIFICATIONS_CENTER.TABS.ALL' },
    { labelKey: 'NOTIFICATIONS_CENTER.TABS.UNREAD', isRead: false },
    { labelKey: 'NOTIFICATIONS_CENTER.TABS.URGENT', priority: 'critical' },
    { labelKey: 'NOTIFICATIONS_CENTER.TABS.DRIVERS', category: 'drivers' },
    { labelKey: 'NOTIFICATIONS_CENTER.TABS.VENDORS', category: 'vendors' },
    { labelKey: 'NOTIFICATIONS_CENTER.TABS.CATALOG', category: 'catalog' },
    { labelKey: 'NOTIFICATIONS_CENTER.TABS.DISPUTES', category: 'disputes' },
    { labelKey: 'NOTIFICATIONS_CENTER.TABS.REFUNDS', category: 'refunds' },
    { labelKey: 'NOTIFICATIONS_CENTER.TABS.SETTLEMENTS', category: 'settlements' },
    { labelKey: 'NOTIFICATIONS_CENTER.TABS.SUPPORT', category: 'support' },
    { labelKey: 'NOTIFICATIONS_CENTER.TABS.SYSTEM', category: 'system' }
  ];

  selectedTab = this.tabs[0];
  notifications: AdminNotification[] = [];
  loading = false;
  hasMore = false;
  private page = 1;
  private readonly perPage = 20;
  private readonly destroyRef = inject(DestroyRef);
  private notificationsLoadedOnce = false;

  constructor(
    private readonly notificationsService: AdminNotificationsService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  get isRTL(): boolean {
    return (this.translate.currentLang || 'ar').startsWith('ar');
  }

  get requiresApiSession(): boolean {
    return this.notificationsService.requiresApiSession;
  }

  get initialLoading(): boolean {
    return !this.notificationsLoadedOnce;
  }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead).length;
  }

  get urgentCount(): number {
    return this.notifications.filter((notification) => (notification.priority ?? '').toLowerCase() === 'critical').length;
  }

  ngOnInit(): void {
    this.load();
  }

  selectTab(tab: NotificationFilterTab): void {
    this.selectedTab = tab;
    this.page = 1;
    this.notifications = [];
    this.load();
  }

  loadMore(): void {
    this.page++;
    this.load(true);
  }

  markAllRead(): void {
    this.notificationsService.markAllAsRead()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
      this.cdr.markForCheck();
        this.notifications = this.notifications.map((item) => ({ ...item, isRead: true }));
      });
  }

  open(notification: AdminNotification): void {
    const targetUrl = this.notificationsService.resolveTargetUrl(notification);
    this.notificationsService.markAsRead(notification.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.router.navigateByUrl(targetUrl));
  }

  displayTitle(notification: AdminNotification): string {
    return this.notificationsService.getLocalizedTitle(notification, this.translate.currentLang || 'ar');
  }

  displayBody(notification: AdminNotification): string {
    return this.notificationsService.getLocalizedBody(notification, this.translate.currentLang || 'ar');
  }

  priorityLabel(priority?: string | null): string {
    return this.notificationsService.getPriorityLabel(priority, this.translate.currentLang || 'ar');
  }

  categoryLabel(category?: string | null): string {
    return this.notificationsService.getCategoryLabel(category, this.translate.currentLang || 'ar');
  }

  priorityClasses(priority?: string | null): string {
    switch ((priority ?? '').toLowerCase()) {
      case 'critical':
        return 'bg-[#fff0d1] text-[#c75d00] border-[#ffd08a]';
      case 'high':
        return 'bg-[#fff7e8] text-[#d26a00] border-[#ffd9a3]';
      case 'low':
        return 'bg-slate-50 text-slate-500 border-slate-100';
      default:
        return 'bg-[#eafbfb] text-[#087f90] border-[#bde8e8]';
    }
  }

  categoryIcon(category?: string | null): string {
    switch ((category ?? '').toLowerCase()) {
      case 'drivers':
      case 'delivery':
        return 'delivery_dining';
      case 'vendors':
        return 'storefront';
      case 'catalog':
        return 'inventory_2';
      case 'disputes':
        return 'gavel';
      case 'refunds':
        return 'replay';
      case 'settlements':
        return 'account_balance_wallet';
      case 'support':
        return 'support_agent';
      default:
        return 'campaign';
    }
  }

  categoryTone(category?: string | null): string {
    switch ((category ?? '').toLowerCase()) {
      case 'drivers':
      case 'delivery':
        return 'border-[#bde8e8] bg-[#eafbfb] text-[#087f90]';
      case 'vendors':
        return 'border-[#a9dede] bg-[#eefafa] text-[#006878]';
      case 'catalog':
        return 'border-[#bde8e8] bg-white text-[#087f90]';
      case 'disputes':
        return 'border-[#ffd08a] bg-[#fff0d1] text-[#c75d00]';
      case 'refunds':
        return 'border-[#ffd9a3] bg-[#fff7e8] text-[#d26a00]';
      case 'settlements':
        return 'border-[#bde8e8] bg-[#f3fbfb] text-[#087f90]';
      case 'support':
        return 'border-[#ffd9a3] bg-white text-[#d26a00]';
      default:
        return 'border-[#d7eeee] bg-[#f8fdfd] text-[#006878]';
    }
  }

  trackByNotificationId(index: number, notification: AdminNotification): string {
    return notification.id || index.toString();
  }

  private load(append = false): void {
    this.loading = true;
    const filters: AdminNotificationFilters = {
      page: this.page,
      perPage: this.perPage,
      category: this.selectedTab.category,
      priority: this.selectedTab.priority,
      isRead: this.selectedTab.isRead
    };

    this.notificationsService.list(filters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
        this.cdr.markForCheck();
          this.notifications = this.uniqueNotifications(append ? [...this.notifications, ...response.items] : response.items);
          this.hasMore = response.hasMore;
          this.notificationsLoadedOnce = true;
          this.loading = false;
        },
        error: () => {
        this.cdr.markForCheck();
          this.notificationsLoadedOnce = true;
          this.loading = false;
        }
      });
  }

  private uniqueNotifications(notifications: AdminNotification[]): AdminNotification[] {
    const seen = new Set<string>();
    return notifications.filter((notification) => {
      const key = notification.id || [
        notification.type ?? '',
        notification.referenceId ?? '',
        notification.createdAtUtc ?? ''
      ].join('|');

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }
}
