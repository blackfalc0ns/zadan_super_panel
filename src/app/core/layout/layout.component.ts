import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ToastContainerComponent } from '../../shared/components/ui/toast-container/toast-container.component';
import { environment } from '../../../environments/environment';
import { AdminNotificationRealtimeService } from '../services/admin-notification-realtime.service';
import { AdminNotificationsService } from '../services/admin-notifications.service';
import { AdminOneSignalService } from '../services/admin-one-signal.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
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
  userName = 'Admin';
  currentLang = 'ar';
  isSidebarOpen = false;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private adminRealtimeService: AdminNotificationRealtimeService,
    private adminNotificationsService: AdminNotificationsService,
    private adminOneSignalService: AdminOneSignalService,
    private toastService: ToastService
  ) {
    this.currentLang = this.translate.currentLang || 'ar';

    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.userName = user?.fullName || 'Admin';
      });

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event: LangChangeEvent) => {
        this.currentLang = event.lang;
      });

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isSidebarOpen = false;
      });

    this.adminNotificationsService.refreshRecent()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.adminRealtimeService.startMonitoring();
    this.adminOneSignalService.start();

    this.adminRealtimeService.getNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((notification) => {
        this.adminNotificationsService.mergeRealtimeNotification(notification);
        this.toastService.info(
          this.currentLang === 'ar' ? notification.bodyAr : notification.bodyEn,
          this.currentLang === 'ar' ? notification.titleAr : notification.titleEn,
          { duration: 7000 }
        );
      });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  switchLanguage() {
    const nextLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.translate.use(nextLang);
  }

  logout() {
    if (environment.skipAuthForDevelopment) {
      this.authService.forceLogout();
      this.router.navigate(['/login']);
      return;
    }

    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login'])
    });
  }
}
