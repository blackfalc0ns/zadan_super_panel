import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminNotification, AdminNotificationsService } from '../../../services/admin-notifications.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
    @Input() currentLang: string = 'ar';
    @Input() isSidebarOpen: boolean = false;
    @Input() unreadNotificationCount: number = 0;
    @Output() languageSwitch = new EventEmitter<void>();
    @Output() toggleSidebar = new EventEmitter<void>();
    @Output() toggleNotificationsPanel = new EventEmitter<void>();
    notifications: AdminNotification[] = [];
    isNotificationsOpen = false;
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private readonly adminNotificationsService: AdminNotificationsService,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        this.adminNotificationsService.unreadCount$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((count) => {
                this.unreadNotificationCount = count;
            });

        this.adminNotificationsService.recent$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((notifications) => {
                this.notifications = notifications;
            });

        this.adminNotificationsService.refreshRecent()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
    }

    onLanguageSwitch() {
        this.languageSwitch.emit();
    }

    onToggleSidebar() {
        this.toggleSidebar.emit();
    }

    reload() {
        window.location.reload();
    }

    toggleNotifications(): void {
        this.isNotificationsOpen = !this.isNotificationsOpen;
        this.toggleNotificationsPanel.emit();
    }

    markAllNotificationsRead(): void {
        this.adminNotificationsService.markAllAsRead()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
    }

    openNotification(notification: AdminNotification): void {
        const targetUrl = this.adminNotificationsService.resolveTargetUrl(notification);
        this.adminNotificationsService.markAsRead(notification.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.isNotificationsOpen = false;
                void this.router.navigateByUrl(targetUrl);
            });
    }

    openNotificationCenter(): void {
        this.isNotificationsOpen = false;
        void this.router.navigateByUrl('/notifications');
    }

    displayTitle(notification: AdminNotification): string {
        return this.adminNotificationsService.getLocalizedTitle(notification, this.currentLang);
    }

    displayBody(notification: AdminNotification): string {
        return this.adminNotificationsService.getLocalizedBody(notification, this.currentLang);
    }

    priorityLabel(priority?: string | null): string {
        return this.adminNotificationsService.getPriorityLabel(priority, this.currentLang);
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
}
