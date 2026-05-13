import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminNotification, AdminNotificationFilters, AdminNotificationsService } from '../../../../core/services/admin-notifications.service';

interface NotificationFilterTab {
  label: string;
  category?: string;
  priority?: string;
  isRead?: boolean;
}

@Component({
  selector: 'app-notifications-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-5 pb-8">
      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-[22px] font-black text-slate-950">Notification Center</h1>
            <p class="mt-1 text-[13px] font-semibold text-slate-500">Live admin inbox for approvals, disputes, refunds, settlements, and critical operations.</p>
          </div>

          <button type="button" (click)="markAllRead()"
            class="h-10 rounded-xl bg-zadna-primary px-4 text-[12px] font-black text-white shadow-lg shadow-zadna-primary/20 hover:brightness-110 transition">
            Mark all read
          </button>
        </div>

        <div class="mt-5 flex gap-2 overflow-x-auto pb-1">
          <button *ngFor="let tab of tabs" type="button" (click)="selectTab(tab)"
            class="shrink-0 rounded-full border px-4 py-2 text-[11px] font-black transition"
            [class.bg-zadna-primary]="selectedTab === tab"
            [class.text-white]="selectedTab === tab"
            [class.border-zadna-primary]="selectedTab === tab"
            [class.bg-white]="selectedTab !== tab"
            [class.text-slate-600]="selectedTab !== tab"
            [class.border-slate-200]="selectedTab !== tab">
            {{ tab.label }}
          </button>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div *ngIf="loading" class="p-8 text-center text-[13px] font-bold text-slate-500">Loading notifications...</div>

        <button *ngFor="let notification of notifications; trackBy: trackByNotificationId" type="button"
          (click)="open(notification)"
          class="w-full border-b border-slate-100 px-5 py-4 text-start hover:bg-slate-50 transition flex gap-4">
          <span class="mt-2 h-3 w-3 rounded-full shrink-0"
            [class.bg-zadna-accent]="!notification.isRead"
            [class.bg-slate-200]="notification.isRead"></span>

          <span class="min-w-0 flex-1">
            <span class="flex flex-wrap items-center gap-2">
              <span class="text-[14px] font-black text-slate-950">{{ displayTitle(notification) }}</span>
              <span class="rounded-full border px-2 py-0.5 text-[10px] font-black uppercase" [ngClass]="priorityClasses(notification.priority)">
                {{ notification.priority || 'normal' }}
              </span>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600 uppercase">
                {{ notification.category || 'system' }}
              </span>
            </span>
            <span class="mt-1 block text-[13px] font-semibold text-slate-500">{{ displayBody(notification) }}</span>
            <span class="mt-2 block text-[11px] font-bold text-slate-400">{{ notification.createdAtUtc | date:'medium' }}</span>
          </span>
        </button>

        <div *ngIf="!loading && notifications.length === 0" class="p-10 text-center">
          <p class="text-[14px] font-black text-slate-800">No notifications found</p>
          <p class="mt-1 text-[12px] font-semibold text-slate-500">This view will fill as operational events arrive.</p>
        </div>

        <div *ngIf="hasMore" class="p-4 text-center">
          <button type="button" (click)="loadMore()"
            class="rounded-xl border border-slate-200 bg-white px-5 py-2 text-[12px] font-black text-slate-700 hover:bg-slate-50 transition">
            Load more
          </button>
        </div>
      </section>
    </div>
  `
})
export class NotificationsCenterComponent implements OnInit {
  readonly tabs: NotificationFilterTab[] = [
    { label: 'All' },
    { label: 'Unread', isRead: false },
    { label: 'Urgent', priority: 'critical' },
    { label: 'Drivers', category: 'drivers' },
    { label: 'Vendors', category: 'vendors' },
    { label: 'Disputes', category: 'disputes' },
    { label: 'Finance', category: 'refunds' },
    { label: 'System', category: 'system' }
  ];

  selectedTab = this.tabs[0];
  notifications: AdminNotification[] = [];
  loading = false;
  hasMore = false;
  private page = 1;
  private readonly perPage = 20;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly notificationsService: AdminNotificationsService,
    private readonly router: Router
  ) {}

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
    return notification.titleAr || notification.titleEn;
  }

  displayBody(notification: AdminNotification): string {
    return notification.bodyAr || notification.bodyEn;
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
          this.notifications = append ? [...this.notifications, ...response.items] : response.items;
          this.hasMore = response.hasMore;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }
}
