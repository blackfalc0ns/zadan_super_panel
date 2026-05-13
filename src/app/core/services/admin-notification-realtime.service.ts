import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminNotification } from './admin-notifications.service';
import { AuthService } from './auth.service';

interface SignalRHubConnection {
  state: number | string;
  start(): Promise<void>;
  stop(): Promise<void>;
  on(methodName: string, newMethod: (payload: AdminNotification) => void): void;
  onreconnecting?(callback: (error?: Error) => void): void;
  onreconnected?(callback: (connectionId?: string) => void): void;
  onclose(callback: (error?: Error) => void): void;
}

interface SignalRHubConnectionBuilder {
  withUrl(url: string, options: { accessTokenFactory: () => string }): SignalRHubConnectionBuilder;
  withAutomaticReconnect(): SignalRHubConnectionBuilder;
  configureLogging(level: number): SignalRHubConnectionBuilder;
  build(): SignalRHubConnection;
}

interface SignalRBrowserSdk {
  HubConnectionBuilder: new () => SignalRHubConnectionBuilder;
  HubConnectionState: {
    Connected: number | string;
    Connecting: number | string;
    Reconnecting: number | string;
  };
  LogLevel: {
    Information: number;
    Warning: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationRealtimeService {
  private static readonly signalRScriptId = 'admin-notification-signalr-sdk';
  private static readonly signalRScriptUrl = 'https://cdn.jsdelivr.net/npm/@microsoft/signalr@8.0.7/dist/browser/signalr.min.js';
  private readonly hubUrl = `${environment.apiUrl.replace(/\/api\/?$/, '')}/hubs/notifications`;
  private readonly notificationsSubject = new Subject<AdminNotification>();
  private readonly stateSubject = new BehaviorSubject<'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error'>('idle');
  private monitoringStarted = false;
  private reconnecting = false;
  private hubConnection?: SignalRHubConnection;
  private signalRSdkPromise?: Promise<SignalRBrowserSdk | null>;

  constructor(
    private readonly authService: AuthService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  startMonitoring(): void {
    if (this.monitoringStarted || environment.skipAuthForDevelopment) {
      return;
    }

    this.monitoringStarted = true;
    this.authService.currentUser$
      .pipe(distinctUntilChanged((previous, current) => previous?.id === current?.id))
      .subscribe((user) => {
        if (!user?.id || !this.authService.hasApiSession) {
          this.stateSubject.next('idle');
          void this.disconnect();
          return;
        }

        void this.ensureConnection();
      });
  }

  getNotifications(): Observable<AdminNotification> {
    return this.notificationsSubject.asObservable();
  }

  getState(): Observable<'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error'> {
    return this.stateSubject.asObservable();
  }

  private async ensureConnection(): Promise<void> {
    const token = this.authService.getToken();
    if (!token) return;

    const signalR = await this.loadSignalRSdk();
    if (!signalR) {
      this.stateSubject.next('error');
      return;
    }

    if (this.hubConnection?.state === signalR.HubConnectionState.Connected ||
        this.hubConnection?.state === signalR.HubConnectionState.Connecting ||
        this.hubConnection?.state === signalR.HubConnectionState.Reconnecting) {
      return;
    }

    if (!this.hubConnection) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, { accessTokenFactory: () => this.authService.getToken() ?? '' })
        .withAutomaticReconnect()
        .configureLogging(environment.production ? signalR.LogLevel.Warning : signalR.LogLevel.Information)
        .build();

      this.hubConnection.on('ReceiveNotification', (payload: AdminNotification) => {
        this.notificationsSubject.next(payload);
      });

      this.hubConnection.onreconnecting?.(() => this.stateSubject.next('reconnecting'));
      this.hubConnection.onreconnected?.(() => this.stateSubject.next('connected'));
      this.hubConnection.onclose(() => {
        this.stateSubject.next('error');
        void this.reconnectWithBackoff();
      });
    }

    try {
      this.stateSubject.next('connecting');
      await this.hubConnection.start();
      this.stateSubject.next('connected');
    } catch (error) {
      console.error('Admin notification SignalR connection failed.', error);
      this.stateSubject.next('error');
      void this.reconnectWithBackoff();
    }
  }

  private async reconnectWithBackoff(): Promise<void> {
    if (this.reconnecting || !this.authService.hasApiSession) return;
    this.reconnecting = true;
    this.stateSubject.next('reconnecting');
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await this.ensureConnection();
    } finally {
      this.reconnecting = false;
    }
  }

  private async disconnect(): Promise<void> {
    if (!this.hubConnection) return;
    try {
      await this.hubConnection.stop();
    } catch (error) {
      console.error('Admin notification SignalR disconnection failed.', error);
    }
  }

  private async loadSignalRSdk(): Promise<SignalRBrowserSdk | null> {
    if (this.signalRSdkPromise) return this.signalRSdkPromise;

    this.signalRSdkPromise = new Promise<SignalRBrowserSdk | null>((resolve) => {
      const view = this.document.defaultView as (Window & { signalR?: SignalRBrowserSdk }) | null;
      if (!view) {
        resolve(null);
        return;
      }

      if (view.signalR) {
        resolve(view.signalR);
        return;
      }

      const existingScript = this.document.getElementById(AdminNotificationRealtimeService.signalRScriptId) as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(view.signalR ?? null), { once: true });
        existingScript.addEventListener('error', () => {
          this.signalRSdkPromise = undefined;
          resolve(null);
        }, { once: true });
        return;
      }

      const script = this.document.createElement('script');
      script.id = AdminNotificationRealtimeService.signalRScriptId;
      script.src = AdminNotificationRealtimeService.signalRScriptUrl;
      script.defer = true;
      script.onload = () => resolve(view.signalR ?? null);
      script.onerror = () => {
        this.signalRSdkPromise = undefined;
        resolve(null);
      };
      this.document.head.appendChild(script);
    });

    return this.signalRSdkPromise;
  }
}
