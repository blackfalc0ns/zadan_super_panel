import { Component, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ToastContainerComponent } from '../../shared/components/ui/toast-container/toast-container.component';
import { AdminNotificationRealtimeService } from '../services/admin-notification-realtime.service';
import { AdminNotification, AdminNotificationsService } from '../services/admin-notifications.service';
import { AdminNotificationSoundService } from '../services/admin-notification-sound.service';
import { AdminOneSignalService } from '../services/admin-one-signal.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    SidebarComponent,
    HeaderComponent,
    UserProfileComponent,
    ToastContainerComponent
  ],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  userName = 'Admin';
  currentLang = 'ar';
  isSidebarOpen = false;
  isSidebarCollapsed = false;
  isNotificationsPanelOpen = false;
  recentNotifications: AdminNotification[] = [];
  unreadNotificationCount = 0;
  private readonly destroyRef = inject(DestroyRef);
  private notificationPermissionPromptArmed = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private adminRealtimeService: AdminNotificationRealtimeService,
    private adminNotificationsService: AdminNotificationsService,
    private adminNotificationSoundService: AdminNotificationSoundService,
    private adminOneSignalService: AdminOneSignalService
  ) {
    this.currentLang = this.translate.currentLang || 'ar';

    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
      this.cdr.markForCheck();
        this.userName = user?.fullName || 'Admin';
      });

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event: LangChangeEvent) => {
      this.cdr.markForCheck();
        this.currentLang = event.lang;
      });

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
      this.cdr.markForCheck();
        this.isSidebarOpen = false;
      });

    this.adminNotificationsService.refreshRecent()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.adminNotificationsService.getPreferences()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((preferences) => {
      this.cdr.markForCheck();
        if (preferences.webDeviceCount > 0) {
          this.adminNotificationSoundService.setSound(preferences.sound);
        }
      });

    this.adminNotificationsService.recent$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((notifications) => {
      this.cdr.markForCheck();
        this.recentNotifications = notifications;
      });

    this.adminNotificationsService.unreadCount$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((count) => {
      this.cdr.markForCheck();
        this.unreadNotificationCount = count;
      });

    this.armDesktopNotificationPermission();
    this.adminRealtimeService.startMonitoring();
    this.adminOneSignalService.start();

    this.adminRealtimeService.getNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((notification) => {
      this.cdr.markForCheck();
        this.adminNotificationsService.mergeRealtimeNotification(notification);
        const title = this.adminNotificationsService.getLocalizedTitle(notification, this.currentLang);
        const body = this.adminNotificationsService.getLocalizedBody(notification, this.currentLang);
        this.adminNotificationSoundService.playCurrent();
        this.showDesktopNotification(notification, title, body);
      });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSidebarCollapse() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  switchLanguage() {
    const nextLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.translate.use(nextLang);
  }

  toggleNotificationsPanel(): void {
    this.isNotificationsPanelOpen = !this.isNotificationsPanelOpen;
    if (this.isNotificationsPanelOpen) {
      this.adminNotificationsService.refreshRecent()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  closeNotificationsPanel(): void {
    this.isNotificationsPanelOpen = false;
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
      this.cdr.markForCheck();
        this.isNotificationsPanelOpen = false;
        void this.router.navigateByUrl(targetUrl);
      });
  }

  openNotificationCenter(): void {
    this.isNotificationsPanelOpen = false;
    void this.router.navigateByUrl('/notifications');
  }

  displayNotificationTitle(notification: AdminNotification): string {
    return this.adminNotificationsService.getLocalizedTitle(notification, this.currentLang);
  }

  displayNotificationBody(notification: AdminNotification): string {
    return this.adminNotificationsService.getLocalizedBody(notification, this.currentLang);
  }

  notificationPriorityLabel(priority?: string | null): string {
    return this.adminNotificationsService.getPriorityLabel(priority, this.currentLang);
  }

  notificationPriorityClasses(priority?: string | null): string {
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

  logout() {
    // Always clear local session and navigate immediately.
    // The server-side logout (revoke refresh token) runs in the background.
    this.authService.forceLogout();
    this.router.navigate(['/login']);

    // Fire-and-forget: tell the server to revoke the refresh token cookie.
    if (!this.authService.isDevelopmentBypassActive) {
      this.authService.logout().subscribe();
    }
  }

  private armDesktopNotificationPermission(): void {
    if (this.notificationPermissionPromptArmed) {
      return;
    }

    this.notificationPermissionPromptArmed = true;
    const requestPermission = async () => {
      if ('Notification' in window && Notification.permission === 'denied') {
        window.removeEventListener('pointerdown', requestPermission);
        window.removeEventListener('keydown', requestPermission);
        return;
      }

      this.adminOneSignalService.requestPermissionAndRegister();
      window.removeEventListener('pointerdown', requestPermission);
      window.removeEventListener('keydown', requestPermission);
    };

    window.addEventListener('pointerdown', requestPermission, { once: true });
    window.addEventListener('keydown', requestPermission, { once: true });
  }

  private showDesktopNotification(notification: AdminNotification, title: string, body: string): void {
    if (!('Notification' in window)) {
      return;
    }

    const show = () => {
      if (Notification.permission !== 'granted') {
        return;
      }

      try {
        const desktopNotification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: false,
          tag: notification.id,
          silent: false
        });

        desktopNotification.onclick = () => {
          window.focus();
          const targetUrl = this.adminNotificationsService.resolveTargetUrl(notification);
          void this.router.navigateByUrl(targetUrl);
          desktopNotification.close();
        };
      } catch {
        // Desktop notifications can be blocked by browser or OS settings.
      }
    };

    if (Notification.permission === 'default') {
      void Notification.requestPermission().then(show);
      return;
    }

    show();
  }
}
