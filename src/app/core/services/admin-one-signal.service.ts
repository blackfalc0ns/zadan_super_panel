import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { distinctUntilChanged } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminNotificationSoundService } from './admin-notification-sound.service';
import { AuthService } from './auth.service';

type OneSignalSdk = {
  init(options: Record<string, unknown>): Promise<void>;
  login(externalId: string): Promise<void>;
  Notifications?: {
    isPushSupported?: () => boolean;
    requestPermission?: () => Promise<boolean>;
    permission?: boolean;
  };
  User?: {
    PushSubscription?: {
      id?: string | null;
      token?: string | null;
      optedIn?: boolean;
      optIn?: () => Promise<void>;
      addEventListener?: (event: 'change', listener: () => void) => void;
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
  private sdkInitialized = false;
  private initializedForUserId: string | null = null;
  private lastRegisteredSubscriptionId: string | null = null;
  private scriptPromise?: Promise<void>;

  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpClient,
    private readonly notificationSoundService: AdminNotificationSoundService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  start(): void {
    if (!environment.oneSignalAdminAppId) {
      return;
    }

    this.authService.currentUser$
      .pipe(distinctUntilChanged((previous, current) => previous?.id === current?.id))
      .subscribe((user) => {
        if (!user?.id || !this.authService.hasApiSession) {
          this.initializedForUserId = null;
          return;
        }

        void this.initialize(user.id, false).catch((error) => this.logLoadFailure(error));
      });
  }

  requestPermissionAndRegister(): void {
    if (!environment.oneSignalAdminAppId) {
      return;
    }

    const userId = this.authService.currentUserValue?.id;
    if (!userId || !this.authService.hasApiSession) {
      return;
    }

    void this.initialize(userId, true).catch((error) => this.logLoadFailure(error));
  }

  updateLocaleAndReRegister(): void {
    if (!environment.oneSignalAdminAppId) return;
    const userId = this.authService.currentUserValue?.id;
    if (!userId || !this.authService.hasApiSession) return;
    
    this.lastRegisteredSubscriptionId = null;
    void this.runWhenReady((oneSignal) => {
      this.registerDevice(oneSignal, userId);
    });
  }

  private async initialize(userId: string, requestPermission: boolean): Promise<void> {
    await this.runWhenReady(async (oneSignal) => {
      if (!this.sdkInitialized) {
        await oneSignal.init({
          appId: environment.oneSignalAdminAppId,
          allowLocalhostAsSecureOrigin: environment.oneSignalAllowLocalhost,
          serviceWorkerPath: 'OneSignalSDKWorker.js',
          serviceWorkerParam: { scope: '/' }
        });

        this.sdkInitialized = true;
        oneSignal.User?.PushSubscription?.addEventListener?.('change', () => {
          const currentUserId = this.authService.currentUserValue?.id;
          if (currentUserId && this.authService.hasApiSession) {
            this.registerDevice(oneSignal, currentUserId);
          }
        });
      }

      if (oneSignal.Notifications?.isPushSupported?.() === false) {
        return;
      }

      if (this.initializedForUserId !== userId) {
        await oneSignal.login(userId);
        this.initializedForUserId = userId;
        this.lastRegisteredSubscriptionId = null;
        this.logStatus('OneSignal admin user logged in.', oneSignal);
      }

      const browserPermission = this.document.defaultView?.Notification?.permission;
      const canRequestPermission = requestPermission && browserPermission === 'default' && !oneSignal.Notifications?.permission;

      if (canRequestPermission) {
        try {
          await oneSignal.Notifications?.requestPermission?.();
          this.logStatus('OneSignal admin permission requested.', oneSignal);
        } catch (error) {
          this.logPermissionFailure('permission request', error, oneSignal);
          return;
        }
      }

      if (browserPermission === 'denied') {
        return;
      }

      if (requestPermission || oneSignal.Notifications?.permission || browserPermission === 'granted') {
        try {
          await oneSignal.User?.PushSubscription?.optIn?.();
          this.logStatus('OneSignal admin opt-in attempted.', oneSignal);
        } catch (error) {
          this.logPermissionFailure('opt-in', error, oneSignal);
          return;
        }
      }

      this.initializedForUserId = userId;
      this.registerDevice(oneSignal, userId);
    });
  }

  private registerDevice(oneSignal: OneSignalSdk, userId: string): void {
    const subscription = oneSignal.User?.PushSubscription;
    const subscriptionId = subscription?.id ?? subscription?.token ?? null;

    if (!subscriptionId) {
      this.logStatus('OneSignal admin subscription is not ready yet.', oneSignal);
      return;
    }

    if (this.lastRegisteredSubscriptionId === subscriptionId && subscription?.optedIn !== false) {
      return;
    }

    this.lastRegisteredSubscriptionId = subscriptionId;

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
      accountPushEnabled: true,
      adminDriversPushEnabled: true,
      adminVendorsPushEnabled: true,
      adminCatalogPushEnabled: true,
      adminDisputesPushEnabled: true,
      adminRefundsPushEnabled: true,
      adminSettlementsPushEnabled: true,
      adminSupportPushEnabled: true,
      adminSystemPushEnabled: true,
      notificationSound: this.notificationSoundService.getCurrentSound()
    }).subscribe({
      next: () => this.logStatus('OneSignal admin device registered with API.', oneSignal),
      error: () => {
        this.lastRegisteredSubscriptionId = null;
        this.logStatus('OneSignal admin device registration failed.', oneSignal);
      }
    });
  }

  private logStatus(message: string, oneSignal: OneSignalSdk): void {
    if (environment.production) {
      return;
    }

    const subscription = oneSignal.User?.PushSubscription;
    console.info('[AdminOneSignal]', message, {
      permission: oneSignal.Notifications?.permission,
      subscriptionId: subscription?.id ?? null,
      token: subscription?.token ? 'available' : null,
      optedIn: subscription?.optedIn ?? null
    });
  }

  private async runWhenReady(callback: (oneSignal: OneSignalSdk) => void | Promise<void>): Promise<void> {
    const view = this.document.defaultView;
    if (!view) return;

    view.OneSignalDeferred = view.OneSignalDeferred || [];
    view.OneSignalDeferred.push(callback);

    await this.loadScript();
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

  private logLoadFailure(error: unknown): void {
    if (environment.production) {
      return;
    }

    console.warn(
      '[AdminOneSignal] OneSignal SDK could not be loaded. Check browser extensions/ad blockers and allow cdn.onesignal.com for localhost:4300.',
      error
    );
  }

  private logPermissionFailure(step: string, error: unknown, oneSignal: OneSignalSdk): void {
    if (environment.production) {
      return;
    }

    console.warn(`[AdminOneSignal] OneSignal ${step} failed.`, {
      error,
      permission: oneSignal.Notifications?.permission,
      subscriptionId: oneSignal.User?.PushSubscription?.id ?? null,
      optedIn: oneSignal.User?.PushSubscription?.optedIn ?? null
    });
  }
}
