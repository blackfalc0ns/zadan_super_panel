import { Component, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ToastService } from '../../shared/services/toast.service';
import { ToastContainerComponent } from '../../shared/components/ui/toast-container/toast-container.component';
import { AdminNotificationRealtimeService } from '../services/admin-notification-realtime.service';
import { AdminNotification, AdminNotificationsService } from '../services/admin-notifications.service';
import { AdminNotificationSoundService } from '../services/admin-notification-sound.service';
import { AdminOneSignalService } from '../services/admin-one-signal.service';
import { filter, interval } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  private readonly document = inject(DOCUMENT);
  currentLang = 'ar';
  isSidebarOpen = false;
  isSidebarCollapsed = false;
  isNotificationsPanelOpen = false;
  private isLoggingOut = false;
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
    private adminOneSignalService: AdminOneSignalService,
    private toastService: ToastService
  ) {
    this.currentLang = this.translate.currentLang || 'ar';

    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
      this.cdr.markForCheck();
        this.redirectToLoginIfSessionEnded();
      });

    this.authService.validateActiveSession();

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event: LangChangeEvent) => {
        this.cdr.markForCheck();
        this.currentLang = event.lang;
        this.document.documentElement.lang = event.lang;
        this.document.documentElement.dir = event.lang === 'ar' ? 'rtl' : 'ltr';
        this.adminOneSignalService.updateLocaleAndReRegister();
      });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.isSidebarOpen = false;
        this.cdr.markForCheck();
      });

    this.adminNotificationsService.refreshRecent()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    if (!environment.realtimeEnabled) {
      interval(60000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.adminNotificationsService.refreshRecent()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
        });
    }

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
        this.adminNotificationSoundService.playCurrent();
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
    this.isLoggingOut = true;
    this.isSidebarOpen = false;
    this.isNotificationsPanelOpen = false;

    // Always clear local session and navigate immediately.
    // The server-side logout (revoke refresh token) runs in the background.
    this.authService.forceLogout();
    void this.router.navigate(['/login'], { replaceUrl: true }).finally(() => {
      this.isLoggingOut = false;
    });

    // Fire-and-forget: tell the server to revoke the refresh token cookie.
    if (!this.authService.isDevelopmentBypassActive) {
      this.authService.logout().subscribe();
    }
  }

  private redirectToLoginIfSessionEnded(): void {
    if (this.isLoggingOut || this.authService.isAuthenticated) {
      return;
    }

    const currentUrl = this.router.url || '/';
    if (currentUrl.startsWith('/login')) {
      return;
    }

    const queryParams: Record<string, string> = { returnUrl: currentUrl };
    if (this.authService.requiresFreshLogin) {
      queryParams['reason'] = 'session-expired';
    }

    void this.router.navigate(['/login'], { queryParams, replaceUrl: true });
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

}
