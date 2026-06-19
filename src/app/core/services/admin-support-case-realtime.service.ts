import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

interface SignalRHubConnection {
  state: number | string;
  start(): Promise<void>;
  stop(): Promise<void>;
  on(methodName: string, newMethod: (payload: AdminNotificationPayload) => void): void;
  onreconnecting?(callback: (error?: Error) => void): void;
  onreconnected?(callback: (connectionId?: string) => void): void;
  onclose(callback: (error?: Error) => void): void;
}

interface SignalRHubConnectionBuilder {
  withUrl(url: string, options: {
    accessTokenFactory: () => string;
    transport?: number;
  }): SignalRHubConnectionBuilder;
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
  HttpTransportType: {
    LongPolling: number;
  };
}

interface AdminNotificationPayload {
  id: string;
  type?: string | null;
  referenceId?: string | null;
  data?: string | null;
  dataObject?: Record<string, unknown> | null;
  createdAtUtc?: string | null;
}

export interface AdminSupportCaseRealtimeEvent {
  caseId: string;
  orderId?: string;
  status?: string;
  type?: string;
  action?: string;
  targetUrl?: string;
}

declare global {
  interface Window {
    signalR?: SignalRBrowserSdk;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminSupportCaseRealtimeService {
  private static readonly signalRScriptId = 'admin-support-signalr-sdk';
  private static readonly signalRScriptUrl = 'https://cdn.jsdelivr.net/npm/@microsoft/signalr@8.0.7/dist/browser/signalr.min.js';
  private readonly hubUrl = `${environment.apiUrl.replace(/\/api\/?$/, '')}/hubs/notifications`;
  private readonly eventsSubject = new Subject<AdminSupportCaseRealtimeEvent>();
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
    if (this.monitoringStarted) {
      return;
    }

    this.monitoringStarted = true;
    this.authService.currentUser$
      .pipe(distinctUntilChanged((previous, current) => previous?.id === current?.id))
      .subscribe((user) => {
        if (!user?.id || !this.authService.hasApiSession || user.mustChangePassword) {
          this.stateSubject.next('idle');
          void this.disconnect();
          return;
        }

        void this.ensureConnection();
      });
  }

  getEvents(): Observable<AdminSupportCaseRealtimeEvent> {
    return this.eventsSubject.asObservable();
  }

  getState(): Observable<'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error'> {
    return this.stateSubject.asObservable();
  }

  private async ensureConnection(): Promise<void> {
    const token = this.authService.getToken();
    if (!token) {
      return;
    }

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
      const connectionOptions = {
        accessTokenFactory: () => this.authService.getToken() ?? '',
        ...(environment.production
          ? { transport: signalR.HttpTransportType.LongPolling }
          : {})
      };

      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, connectionOptions)
        .withAutomaticReconnect()
        .configureLogging(environment.production ? signalR.LogLevel.Warning : signalR.LogLevel.Information)
        .build();

      this.hubConnection.on('ReceiveNotification', (payload: AdminNotificationPayload) => {
        const event = this.mapSupportCaseEvent(payload);
        if (event) {
          this.eventsSubject.next(event);
        }
      });

      this.hubConnection.onreconnecting?.(() => {
        this.stateSubject.next('reconnecting');
      });

      this.hubConnection.onreconnected?.(() => {
        this.stateSubject.next('connected');
      });

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
      console.error('Admin support case SignalR connection failed.', error);
      this.stateSubject.next('error');
      void this.reconnectWithBackoff();
    }
  }

  private async reconnectWithBackoff(): Promise<void> {
    if (this.reconnecting || !this.authService.hasApiSession) {
      return;
    }

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
    if (!this.hubConnection) {
      return;
    }

    try {
      await this.hubConnection.stop();
    } catch (error) {
      console.error('Admin support case SignalR disconnection failed.', error);
    }
  }

  private mapSupportCaseEvent(payload: AdminNotificationPayload): AdminSupportCaseRealtimeEvent | null {
    const data = this.normalizeData(payload.dataObject, payload.data);
    const type = typeof payload.type === 'string' ? payload.type.toLowerCase() : '';
    const targetUrl = typeof data?.['targetUrl'] === 'string' ? data['targetUrl'] as string : undefined;
    const caseId = this.extractString(data?.['caseId']) ?? this.extractString(payload.referenceId);

    if (!caseId) {
      return null;
    }

    const isSupportCase = type.includes('support_case')
      || type.includes('dispute')
      || (targetUrl?.startsWith('/disputes') ?? false);

    if (!isSupportCase) {
      return null;
    }

    return {
      caseId,
      orderId: this.extractString(data?.['orderId']) ?? undefined,
      status: this.extractString(data?.['status']) ?? undefined,
      type: this.extractString(data?.['type']) ?? undefined,
      action: this.extractString(data?.['action']) ?? undefined,
      targetUrl
    };
  }

  private normalizeData(
    dataObject?: Record<string, unknown> | null,
    data?: string | null
  ): Record<string, unknown> | null {
    if (dataObject && typeof dataObject === 'object') {
      return dataObject;
    }

    if (!data?.trim()) {
      return null;
    }

    try {
      const parsed = JSON.parse(data);
      return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
    } catch {
      return null;
    }
  }

  private extractString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private async loadSignalRSdk(): Promise<SignalRBrowserSdk | null> {
    if (this.signalRSdkPromise) {
      return this.signalRSdkPromise;
    }

    this.signalRSdkPromise = new Promise<SignalRBrowserSdk | null>((resolve) => {
      const view = this.document.defaultView;
      if (!view) {
        resolve(null);
        return;
      }

      if (view.signalR) {
        resolve(view.signalR);
        return;
      }

      const existingScript = this.document.getElementById(AdminSupportCaseRealtimeService.signalRScriptId) as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(view.signalR ?? null), { once: true });
        existingScript.addEventListener('error', () => {
          this.signalRSdkPromise = undefined;
          resolve(null);
        }, { once: true });
        return;
      }

      const script = this.document.createElement('script');
      script.id = AdminSupportCaseRealtimeService.signalRScriptId;
      script.src = AdminSupportCaseRealtimeService.signalRScriptUrl;
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
