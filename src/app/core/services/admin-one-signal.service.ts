import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { distinctUntilChanged, filter, firstValueFrom, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminNotificationSoundService } from './admin-notification-sound.service';
import { AuthService } from './auth.service';

type OneSignalInitOptions = {
  appId: string;
  allowLocalhostAsSecureOrigin?: boolean;
  serviceWorkerPath?: string;
  serviceWorkerUpdaterPath?: string;
  serviceWorkerParam?: {
    scope: string;
  };
};

type OneSignalSdk = {
  init(options: OneSignalInitOptions): Promise<void>;
  login(externalId: string): Promise<void>;
  logout(): Promise<void>;
  Notifications?: {
    permission?: boolean;
    isPushSupported?: () => boolean;
    requestPermission?: () => Promise<boolean | void>;
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
  private static readonly browserDeviceIdKey = 'admin_onesignal_browser_device_id';
  private static readonly promptPrefix = 'admin_onesignal_prompted_';
  private static readonly subscriptionReadyAttempts = 20;
  private static readonly subscriptionReadyDelayMs = 750;

  private readonly devicesUrl = `${environment.apiUrl}/admin/notifications/devices`;
  private sdkPromise?: Promise<OneSignalSdk | null>;
  private sdkInitialized = false;
  private lastExternalId: string | null = null;
  private lastRegisteredSubscriptionState: string | null = null;
  private started = false;
  private sdkUnavailableLogged = false;

  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpClient,
    private readonly notificationSoundService: AdminNotificationSoundService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  start(): void {
    if (this.started || !this.isEnabled()) {
      return;
    }

    this.started = true;

    this.authService.currentUser$
      .pipe(
        distinctUntilChanged((previous, current) => previous?.id === current?.id),
        filter((user) => !!user?.id)
      )
      .subscribe((user) => {
        void this.syncUser(user!.id);
      });
  }

  requestPermissionAndRegister(): void {
    if (!this.isEnabled()) {
      return;
    }

    const userId = this.authService.currentUserValue?.id;
    if (!userId || !this.authService.hasApiSession) {
      return;
    }

    localStorage.removeItem(`${AdminOneSignalService.promptPrefix}${userId}`);
    this.lastRegisteredSubscriptionState = null;
    void this.syncUser(userId, true);
  }

  updateLocaleAndReRegister(): void {
    if (!this.isEnabled()) {
      return;
    }

    const userId = this.authService.currentUserValue?.id;
    if (!userId || !this.authService.hasApiSession) {
      return;
    }

    this.lastRegisteredSubscriptionState = null;
    void this.syncUser(userId);
  }

  private isEnabled(): boolean {
    const appId = environment.oneSignal?.appId || environment.oneSignalAdminAppId;
    return environment.oneSignal?.enabled !== false && !!appId;
  }

  private resolveAppId(): string {
    return environment.oneSignal?.appId || environment.oneSignalAdminAppId || '';
  }

  private async syncUser(userId: string, forcePrompt = false): Promise<void> {
    await this.waitForApiSession();

    const oneSignal = await this.loadSdk();
    if (!oneSignal) {
      return;
    }

    if (this.lastExternalId !== userId) {
      await oneSignal.login(userId);
      this.lastExternalId = userId;
      this.lastRegisteredSubscriptionState = null;
      this.logStatus('OneSignal admin user logged in.', oneSignal);
    }

    if (forcePrompt || environment.oneSignal?.autoPrompt) {
      await this.promptForPermissionOnce(userId, forcePrompt);
    }

    if (this.resolveBrowserNotificationPermission() === 'granted') {
      try {
        await oneSignal.User?.PushSubscription?.optIn?.();
      } catch (error) {
        if (!this.isBenignPushRegistrationError(error)) {
          this.logPermissionFailure('opt-in', error, oneSignal);
        }
      }
    }

    await this.waitForActiveSubscription(oneSignal, userId);
  }

  private async waitForApiSession(): Promise<void> {
    if (this.authService.hasApiSession || this.authService.isDevelopmentBypassActive) {
      return;
    }

    await firstValueFrom(
      this.authService.currentUser$.pipe(
        filter(() => this.authService.hasApiSession || this.authService.isDevelopmentBypassActive),
        take(1)
      )
    ).catch(() => undefined);
  }

  private async promptForPermissionOnce(externalId: string, forcePrompt = false): Promise<void> {
    const storageKey = `${AdminOneSignalService.promptPrefix}${externalId}`;
    if (!forcePrompt) {
      const existingState = localStorage.getItem(storageKey);
      if (existingState === 'granted' || existingState === 'denied') {
        return;
      }
    }

    const oneSignal = await this.loadSdk();
    if (!oneSignal) {
      return;
    }

    if (oneSignal.Notifications?.isPushSupported?.() === false) {
      localStorage.setItem(storageKey, 'skipped');
      return;
    }

    if (oneSignal.Notifications?.permission || this.resolveBrowserNotificationPermission() === 'granted') {
      localStorage.setItem(storageKey, 'granted');
      return;
    }

    if (this.resolveBrowserNotificationPermission() === 'denied') {
      localStorage.setItem(storageKey, 'denied');
      return;
    }

    try {
      await oneSignal.Notifications?.requestPermission?.();
    } catch (error) {
      if (!this.isBenignPushRegistrationError(error)) {
        this.logPermissionFailure('permission request', error, oneSignal);
      }
    }

    const browserPermission = this.resolveBrowserNotificationPermission();
    if (browserPermission === 'granted' || browserPermission === 'denied') {
      localStorage.setItem(storageKey, browserPermission);
    }
  }

  private async loadSdk(): Promise<OneSignalSdk | null> {
    if (!this.isEnabled()) {
      return null;
    }

    if (this.sdkPromise) {
      return this.sdkPromise;
    }

    this.sdkPromise = new Promise<OneSignalSdk | null>((resolve) => {
      const view = this.document.defaultView;
      if (!view) {
        resolve(null);
        return;
      }

      view.OneSignalDeferred = view.OneSignalDeferred || [];
      const completeInit = () => {
        view.OneSignalDeferred!.push(async (oneSignal) => {
          try {
            if (!this.sdkInitialized) {
              await oneSignal.init({
                appId: this.resolveAppId(),
                allowLocalhostAsSecureOrigin: environment.oneSignalAllowLocalhost || this.isLocalhost(),
                serviceWorkerPath: 'OneSignalSDKWorker.js',
                serviceWorkerUpdaterPath: 'OneSignalSDKUpdaterWorker.js',
                serviceWorkerParam: {
                  scope: '/'
                }
              });

              this.sdkInitialized = true;
              oneSignal.User?.PushSubscription?.addEventListener?.('change', () => {
                const currentUserId = this.authService.currentUserValue?.id;
                if (currentUserId && this.authService.hasApiSession) {
                  void this.registerCurrentSubscription(oneSignal, currentUserId);
                }
              });
            }

            resolve(oneSignal);
          } catch (error) {
            this.reportSdkUnavailable('OneSignal admin initialization failed.', error);
            resolve(null);
          }
        });
      };

      const existingScript = this.document.getElementById(AdminOneSignalService.scriptId);
      if (existingScript) {
        completeInit();
        return;
      }

      const script = this.document.createElement('script');
      script.id = AdminOneSignalService.scriptId;
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      script.onload = () => completeInit();
      script.onerror = () => {
        this.reportSdkUnavailable('OneSignal admin SDK could not be loaded.');
        resolve(null);
      };
      this.document.head.appendChild(script);
    });

    return this.sdkPromise;
  }

  private async registerCurrentSubscription(oneSignal: OneSignalSdk, userId: string): Promise<boolean> {
    if (!this.authService.hasApiSession && !this.authService.isDevelopmentBypassActive) {
      return false;
    }

    const subscription = oneSignal.User?.PushSubscription;
    const subscriptionId = subscription?.id?.trim() || null;
    const browserPermission = this.resolveBrowserNotificationPermission();
    const canReceivePush = browserPermission === 'granted' && !!subscriptionId;

    if (!subscriptionId) {
      this.logStatus('OneSignal admin subscription is not ready yet.', oneSignal);
      return false;
    }

    const registrationState = `${subscriptionId}:${canReceivePush}`;
    if (this.lastRegisteredSubscriptionState === registrationState) {
      return canReceivePush;
    }

    try {
      await firstValueFrom(this.http.post(`${this.devicesUrl}/register`, {
        deviceToken: subscriptionId,
        oneSignalSubscriptionId: subscriptionId,
        platform: 'web',
        deviceId: this.getBrowserDeviceId(),
        deviceName: this.document.defaultView?.navigator.userAgent?.slice(0, 120) ?? 'Admin browser',
        appVersion: 'superadmin-panel',
        locale: this.document.documentElement.lang || localStorage.getItem('lang') || 'ar',
        notificationsEnabled: canReceivePush,
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
      }));

      this.lastRegisteredSubscriptionState = registrationState;
      this.logStatus('OneSignal admin device registered with API.', oneSignal);
      return canReceivePush;
    } catch (error) {
      this.lastRegisteredSubscriptionState = null;
      console.warn('[AdminOneSignal] Device registration failed.', error);
      return false;
    }
  }

  private async waitForActiveSubscription(oneSignal: OneSignalSdk, userId: string): Promise<boolean> {
    for (let attempt = 0; attempt < AdminOneSignalService.subscriptionReadyAttempts; attempt += 1) {
      if (await this.registerCurrentSubscription(oneSignal, userId)) {
        return true;
      }

      if (this.resolveBrowserNotificationPermission() !== 'granted') {
        return false;
      }

      await this.delay(AdminOneSignalService.subscriptionReadyDelayMs);
    }

    console.warn('[AdminOneSignal] Subscription did not become active after opt-in.');
    return false;
  }

  private getBrowserDeviceId(): string {
    const existing = localStorage.getItem(AdminOneSignalService.browserDeviceIdKey);
    if (existing) {
      return existing;
    }

    const generated = this.document.defaultView?.crypto?.randomUUID?.()
      ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const deviceId = `admin-web-${generated}`;
    localStorage.setItem(AdminOneSignalService.browserDeviceIdKey, deviceId);
    return deviceId;
  }

  private resolveBrowserNotificationPermission(): NotificationPermission | null {
    const view = this.document.defaultView;
    if (!view || !('Notification' in view)) {
      return null;
    }

    return view.Notification.permission;
  }

  private isLocalhost(): boolean {
    const hostname = this.document.defaultView?.location.hostname ?? '';
    return hostname === 'localhost' || hostname === '127.0.0.1';
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  private reportSdkUnavailable(message: string, error?: unknown): void {
    if (this.sdkUnavailableLogged) {
      return;
    }

    this.sdkUnavailableLogged = true;
    console.warn(`[AdminOneSignal] ${message}`, error);
  }

  private logStatus(message: string, oneSignal: OneSignalSdk): void {
    if (environment.production) {
      return;
    }

    const subscription = oneSignal.User?.PushSubscription;
    console.info('[AdminOneSignal]', message, {
      permission: oneSignal.Notifications?.permission,
      subscriptionId: subscription?.id ?? null,
      optedIn: subscription?.optedIn ?? null
    });
  }

  private logPermissionFailure(step: string, error: unknown, oneSignal: OneSignalSdk): void {
    if (this.isBenignPushRegistrationError(error)) {
      return;
    }

    console.warn(`[AdminOneSignal] OneSignal ${step} failed.`, {
      error,
      permission: oneSignal.Notifications?.permission,
      subscriptionId: oneSignal.User?.PushSubscription?.id ?? null,
      optedIn: oneSignal.User?.PushSubscription?.optedIn ?? null
    });
  }

  private isBenignPushRegistrationError(error: unknown): boolean {
    if (!error) {
      return false;
    }

    const name = error instanceof Error ? error.name : '';
    const message = error instanceof Error ? error.message : String(error);
    const combined = `${name} ${message}`.toLowerCase();

    return combined.includes('aborterror')
      || combined.includes('push service error')
      || combined.includes('registration failed');
  }
}
