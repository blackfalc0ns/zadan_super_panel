import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { distinctUntilChanged } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

type OneSignalSdk = {
  init(options: Record<string, unknown>): Promise<void>;
  login(externalId: string): Promise<void>;
  User?: {
    PushSubscription?: {
      id?: string | null;
      token?: string | null;
      optedIn?: boolean;
      optIn?: () => Promise<void>;
    };
  };
};

declare global {
  interface Window {
    OneSignalDeferred?: Array<(oneSignal: OneSignalSdk) => void | Promise<void>>;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminOneSignalService {
  private static readonly scriptId = 'admin-onesignal-web-sdk';
  private static readonly scriptUrl = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
  private readonly devicesUrl = `${environment.apiUrl}/admin/notifications/devices`;
  private initializedForUserId: string | null = null;
  private scriptPromise?: Promise<void>;

  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpClient,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  start(): void {
    if (environment.skipAuthForDevelopment || !environment.oneSignalAdminAppId) {
      return;
    }

    this.authService.currentUser$
      .pipe(distinctUntilChanged((previous, current) => previous?.id === current?.id))
      .subscribe((user) => {
        if (!user?.id || !this.authService.hasApiSession) {
          this.initializedForUserId = null;
          return;
        }

        void this.initialize(user.id);
      });
  }

  private async initialize(userId: string): Promise<void> {
    if (this.initializedForUserId === userId) {
      return;
    }

    const view = this.document.defaultView;
    if (!view) return;

    view.OneSignalDeferred = view.OneSignalDeferred || [];
    view.OneSignalDeferred.push(async (oneSignal) => {
      await oneSignal.init({
        appId: environment.oneSignalAdminAppId,
        allowLocalhostAsSecureOrigin: environment.oneSignalAllowLocalhost,
        serviceWorkerPath: 'OneSignalSDKWorker.js',
        serviceWorkerParam: { scope: '/' }
      });

      await oneSignal.login(userId);
      await oneSignal.User?.PushSubscription?.optIn?.();
      this.initializedForUserId = userId;
      this.registerDevice(oneSignal, userId);
    });

    await this.loadScript();
  }

  private registerDevice(oneSignal: OneSignalSdk, userId: string): void {
    const subscription = oneSignal.User?.PushSubscription;
    const subscriptionId = subscription?.id ?? subscription?.token ?? userId;

    if (!subscriptionId) {
      return;
    }

    this.http.post(`${this.devicesUrl}/register`, {
      deviceToken: subscriptionId,
      platform: 'web',
      deviceId: `admin-web-${userId}`,
      deviceName: this.document.defaultView?.navigator.userAgent?.slice(0, 120) ?? 'Admin browser',
      appVersion: 'superadmin-panel',
      locale: this.document.documentElement.lang || 'ar',
      notificationsEnabled: subscription?.optedIn ?? true,
      dispatchPushEnabled: true,
      assignmentPushEnabled: true,
      supportPushEnabled: true,
      walletPushEnabled: true,
      accountPushEnabled: true
    }).subscribe({ error: () => undefined });
  }

  private loadScript(): Promise<void> {
    if (this.scriptPromise) return this.scriptPromise;

    this.scriptPromise = new Promise<void>((resolve, reject) => {
      const existingScript = this.document.getElementById(AdminOneSignalService.scriptId);
      if (existingScript) {
        resolve();
        return;
      }

      const script = this.document.createElement('script');
      script.id = AdminOneSignalService.scriptId;
      script.src = AdminOneSignalService.scriptUrl;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('OneSignal SDK failed to load.'));
      this.document.head.appendChild(script);
    });

    return this.scriptPromise;
  }
}
