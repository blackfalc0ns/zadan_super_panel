import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminNotification, AdminNotificationFilters, AdminNotificationPreferences, AdminNotificationsService } from '../../../../core/services/admin-notifications.service';
import { ADMIN_NOTIFICATION_SOUND_OPTIONS, AdminNotificationSound, AdminNotificationSoundService } from '../../../../core/services/admin-notification-sound.service';

interface NotificationFilterTab {
  labelKey: string;
  category?: string;
  priority?: string;
  isRead?: boolean;
}

@Component({
  selector: 'app-notifications-center',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="space-y-5 pb-8" [attr.dir]="isRTL ? 'rtl' : 'ltr'">
      <section *ngIf="requiresApiSession" class="rounded-[24px] border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-5 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <span class="material-symbols-outlined text-[22px]">lock</span>
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="text-[15px] font-black text-slate-900">{{ 'NOTIFICATIONS_CENTER.AUTH_REQUIRED.TITLE' | translate }}</h2>
            <p class="mt-1 text-[13px] font-semibold leading-6 text-slate-600">{{ 'NOTIFICATIONS_CENTER.AUTH_REQUIRED.MESSAGE' | translate }}</p>
          </div>
        </div>
      </section>

      <section class="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white via-rose-50/60 to-amber-50/70 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)]">
        <div class="relative p-5 sm:p-6">
          <div class="pointer-events-none absolute inset-y-0 end-0 hidden w-48 bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.12),_transparent_68%)] sm:block"></div>
          <div class="relative flex flex-col gap-5">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex items-start gap-3">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
                  <span class="material-symbols-outlined text-[22px]">notifications_active</span>
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <h1 class="text-[24px] font-black tracking-tight text-slate-950">{{ 'NOTIFICATIONS_CENTER.TITLE' | translate }}</h1>
                    <span class="rounded-full border border-rose-200 bg-white/90 px-3 py-1 text-[11px] font-black text-rose-600 shadow-sm">
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
                class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-[12px] font-black text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
                <span class="material-symbols-outlined text-[18px]">done_all</span>
                {{ 'NOTIFICATIONS_CENTER.MARK_ALL_READ' | translate }}
              </button>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article class="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm shadow-slate-200/60 backdrop-blur">
                <p class="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'NOTIFICATIONS_CENTER.STATS.TOTAL' | translate }}</p>
                <div class="mt-3 flex items-end justify-between gap-3">
                  <strong class="text-[28px] font-black leading-none text-slate-950">{{ notifications.length }}</strong>
                  <span class="rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">{{ 'NOTIFICATIONS_CENTER.STATS.VISIBLE' | translate }}</span>
                </div>
              </article>

              <article class="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-4 shadow-sm shadow-rose-100/70">
                <p class="text-[11px] font-black uppercase tracking-[0.16em] text-rose-400">{{ 'NOTIFICATIONS_CENTER.STATS.UNREAD' | translate }}</p>
                <div class="mt-3 flex items-end justify-between gap-3">
                  <strong class="text-[28px] font-black leading-none text-slate-950">{{ unreadCount }}</strong>
                  <span class="rounded-xl bg-white px-2.5 py-1 text-[11px] font-black text-rose-600 shadow-sm">{{ 'NOTIFICATIONS_CENTER.NEW_BADGE' | translate }}</span>
                </div>
              </article>

              <article class="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm shadow-amber-100/70">
                <p class="text-[11px] font-black uppercase tracking-[0.16em] text-amber-500">{{ 'NOTIFICATIONS_CENTER.STATS.URGENT' | translate }}</p>
                <div class="mt-3 flex items-end justify-between gap-3">
                  <strong class="text-[28px] font-black leading-none text-slate-950">{{ urgentCount }}</strong>
                  <span class="rounded-xl bg-white px-2.5 py-1 text-[11px] font-black text-amber-600 shadow-sm">{{ 'NOTIFICATIONS_CENTER.TABS.URGENT' | translate }}</span>
                </div>
              </article>

              <article class="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm shadow-emerald-100/70">
                <p class="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-500">{{ 'NOTIFICATIONS_CENTER.STATS.FILTER' | translate }}</p>
                <div class="mt-3 flex items-end justify-between gap-3">
                  <strong class="text-[20px] font-black leading-tight text-slate-950">{{ selectedTab.labelKey | translate }}</strong>
                  <span class="rounded-xl bg-white px-2.5 py-1 text-[11px] font-black text-emerald-600 shadow-sm">{{ 'NOTIFICATIONS_CENTER.STATS.ACTIVE' | translate }}</span>
                </div>
              </article>
            </div>

            <div class="flex gap-2 overflow-x-auto pb-1">
              <button *ngFor="let tab of tabs" type="button" (click)="selectTab(tab)"
                class="shrink-0 rounded-full border px-4 py-2 text-[11px] font-black transition"
                [ngClass]="selectedTab === tab
                  ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                  : 'border-white bg-white/90 text-slate-600 hover:border-slate-300 hover:bg-white'">
                {{ tab.labelKey | translate }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_22px_70px_-52px_rgba(15,23,42,0.7)]">
        <div class="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <div class="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-[15px] font-black text-slate-900">{{ 'NOTIFICATIONS_CENTER.SOUND.TITLE' | translate }}</h2>
              <p class="text-[12px] font-semibold text-slate-500">{{ 'NOTIFICATIONS_CENTER.SOUND.SUBTITLE' | translate }}</p>
            </div>

            <span class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black"
              [ngClass]="hasPersistentSoundPreference ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'">
              <span class="material-symbols-outlined text-[16px]">{{ hasPersistentSoundPreference ? 'cloud_done' : 'devices' }}</span>
              {{ (hasPersistentSoundPreference ? 'NOTIFICATIONS_CENTER.SOUND.STATUS_DEVICE' : 'NOTIFICATIONS_CENTER.SOUND.STATUS_LOCAL') | translate }}
            </span>
          </div>
        </div>

        <div class="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div class="space-y-3">
            <div *ngIf="preferencesLoading" class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500">
              <span class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
              {{ 'NOTIFICATIONS_CENTER.SOUND.LOADING' | translate }}
            </div>

            <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              <button
                *ngFor="let option of soundOptions"
                type="button"
                (click)="selectedSound = option.value"
                class="rounded-2xl border px-4 py-3 text-start transition"
                [ngClass]="selectedSound === option.value
                  ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'">
                <span class="block text-[11px] font-black uppercase tracking-[0.14em]" [ngClass]="selectedSound === option.value ? 'text-white/70' : 'text-slate-400'">
                  {{ 'NOTIFICATIONS_CENTER.SOUND.LABEL' | translate }}
                </span>
                <span class="mt-2 block text-[13px] font-black">{{ option.labelKey | translate }}</span>
              </button>
            </div>

            <p class="text-[12px] font-semibold leading-6"
              [ngClass]="hasPersistentSoundPreference ? 'text-slate-500' : 'text-amber-700'">
              {{ (hasPersistentSoundPreference ? 'NOTIFICATIONS_CENTER.SOUND.HINT_DEVICE' : 'NOTIFICATIONS_CENTER.SOUND.HINT_LOCAL') | translate }}
            </p>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              (click)="previewSound()"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-[12px] font-black text-slate-700 transition hover:bg-slate-50">
              <span class="material-symbols-outlined text-[18px]">play_circle</span>
              {{ 'NOTIFICATIONS_CENTER.SOUND.PREVIEW' | translate }}
            </button>

            <button
              type="button"
              (click)="saveSoundPreference()"
              [disabled]="soundSaving"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-[12px] font-black text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
              <span *ngIf="soundSaving" class="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white"></span>
              <span *ngIf="!soundSaving" class="material-symbols-outlined text-[18px]">music_note</span>
              {{ 'NOTIFICATIONS_CENTER.SOUND.SAVE' | translate }}
            </button>
          </div>
        </div>
      </section>

      <section class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_22px_70px_-52px_rgba(15,23,42,0.7)]">
        <div class="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-[15px] font-black text-slate-900">{{ 'NOTIFICATIONS_CENTER.LIST_TITLE' | translate }}</h2>
              <p class="text-[12px] font-semibold text-slate-500">{{ 'NOTIFICATIONS_CENTER.LIST_SUBTITLE' | translate }}</p>
            </div>
            <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-600">
              <span class="material-symbols-outlined text-[16px] text-slate-400">tune</span>
              {{ notifications.length }} {{ 'NOTIFICATIONS_CENTER.RESULTS_LABEL' | translate }}
            </span>
          </div>
        </div>

        <div *ngIf="loading" class="flex flex-col items-center gap-3 p-10 text-center">
          <span class="material-symbols-outlined text-[28px] text-slate-300">hourglass_top</span>
          <p class="text-[13px] font-bold text-slate-500">{{ 'NOTIFICATIONS_CENTER.LOADING' | translate }}</p>
        </div>

        <div *ngIf="!loading && notifications.length > 0" class="space-y-3 p-3 sm:p-4">
          <button *ngFor="let notification of notifications; trackBy: trackByNotificationId" type="button"
            (click)="open(notification)"
            class="group flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-start transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50/70 hover:shadow-lg hover:shadow-slate-200/40">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-[18px]"
              [ngClass]="categoryTone(notification.category)">
              <span class="material-symbols-outlined">{{ categoryIcon(notification.category) }}</span>
            </span>

            <span class="min-w-0 flex-1">
              <span class="flex flex-wrap items-center gap-2">
                <span class="text-[14px] font-black leading-6 text-slate-950">{{ displayTitle(notification) }}</span>
                <span *ngIf="!notification.isRead" class="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-700">
                  {{ 'NOTIFICATIONS_CENTER.NEW_BADGE' | translate }}
                </span>
                <span class="rounded-full border px-2 py-0.5 text-[10px] font-black uppercase" [ngClass]="priorityClasses(notification.priority)">
                  {{ priorityLabel(notification.priority) }}
                </span>
                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600 uppercase">
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

            <span class="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition group-hover:border-slate-300 group-hover:bg-white group-hover:text-slate-700">
              <span class="material-symbols-outlined text-[18px]">{{ isRTL ? 'arrow_back' : 'arrow_forward' }}</span>
            </span>
          </button>
        </div>

        <div *ngIf="!loading && notifications.length === 0" class="p-12 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <span class="material-symbols-outlined text-[28px]">notifications_none</span>
          </div>
          <p class="mt-4 text-[16px] font-black text-slate-800">{{ 'NOTIFICATIONS_CENTER.EMPTY_TITLE' | translate }}</p>
          <p class="mt-2 text-[13px] font-semibold leading-6 text-slate-500">{{ 'NOTIFICATIONS_CENTER.EMPTY_MESSAGE' | translate }}</p>
        </div>

        <div *ngIf="hasMore && !loading" class="border-t border-slate-100 p-4 text-center">
          <button type="button" (click)="loadMore()"
            class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-black text-slate-700 transition hover:bg-slate-50">
            <span class="material-symbols-outlined text-[17px]">expand_more</span>
            {{ 'NOTIFICATIONS_CENTER.LOAD_MORE' | translate }}
          </button>
        </div>
      </section>
    </div>
  `
})
export class NotificationsCenterComponent implements OnInit {
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
  readonly soundOptions = [...ADMIN_NOTIFICATION_SOUND_OPTIONS];
  notifications: AdminNotification[] = [];
  loading = false;
  preferencesLoading = false;
  selectedSound: AdminNotificationSound;
  soundSaving = false;
  hasMore = false;
  private page = 1;
  private readonly perPage = 20;
  private readonly destroyRef = inject(DestroyRef);
  private preferences: AdminNotificationPreferences | null = null;

  constructor(
    private readonly notificationsService: AdminNotificationsService,
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly notificationSoundService: AdminNotificationSoundService
  ) {
    this.selectedSound = this.notificationSoundService.getCurrentSound();
  }

  get isRTL(): boolean {
    return (this.translate.currentLang || 'ar').startsWith('ar');
  }

  get requiresApiSession(): boolean {
    return this.notificationsService.requiresApiSession;
  }

  get hasPersistentSoundPreference(): boolean {
    return (this.preferences?.webDeviceCount ?? 0) > 0;
  }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead).length;
  }

  get urgentCount(): number {
    return this.notifications.filter((notification) => (notification.priority ?? '').toLowerCase() === 'critical').length;
  }

  ngOnInit(): void {
    this.load();
    this.loadPreferences();
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
        return 'bg-red-50 text-red-700 border-red-100';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'low':
        return 'bg-slate-50 text-slate-500 border-slate-100';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  }

  categoryIcon(category?: string | null): string {
    switch ((category ?? '').toLowerCase()) {
      case 'drivers':
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
        return 'border-sky-100 bg-sky-50 text-sky-700';
      case 'vendors':
        return 'border-violet-100 bg-violet-50 text-violet-700';
      case 'catalog':
        return 'border-emerald-100 bg-emerald-50 text-emerald-700';
      case 'disputes':
        return 'border-red-100 bg-red-50 text-red-700';
      case 'refunds':
        return 'border-amber-100 bg-amber-50 text-amber-700';
      case 'settlements':
        return 'border-cyan-100 bg-cyan-50 text-cyan-700';
      case 'support':
        return 'border-orange-100 bg-orange-50 text-orange-700';
      default:
        return 'border-slate-100 bg-slate-50 text-slate-700';
    }
  }

  trackByNotificationId(index: number, notification: AdminNotification): string {
    return notification.id || index.toString();
  }

  previewSound(): void {
    this.notificationSoundService.preview(this.selectedSound);
  }

  saveSoundPreference(): void {
    this.notificationSoundService.setSound(this.selectedSound);

    if (!this.preferences || this.requiresApiSession) {
      return;
    }

    this.soundSaving = true;
    this.notificationsService.updatePreferences({
      ...this.preferences,
      sound: this.selectedSound
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (preferences) => {
          this.preferences = preferences;
          if (preferences.webDeviceCount > 0) {
            this.selectedSound = preferences.sound;
            this.notificationSoundService.setSound(preferences.sound);
          }
          this.soundSaving = false;
        },
        error: () => {
          this.soundSaving = false;
        }
      });
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
          this.notifications = this.uniqueNotifications(append ? [...this.notifications, ...response.items] : response.items);
          this.hasMore = response.hasMore;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  private loadPreferences(): void {
    this.preferencesLoading = true;
    this.notificationsService.getPreferences()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (preferences) => {
          this.preferences = preferences;
          if (preferences.webDeviceCount > 0) {
            this.selectedSound = preferences.sound;
            this.notificationSoundService.setSound(preferences.sound);
          } else {
            this.selectedSound = this.notificationSoundService.getCurrentSound();
          }
          this.preferencesLoading = false;
        },
        error: () => {
          this.preferencesLoading = false;
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
