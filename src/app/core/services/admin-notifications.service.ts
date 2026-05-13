import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type AdminNotificationPriority = 'low' | 'normal' | 'high' | 'critical' | string;
export type AdminNotificationCategory =
  | 'drivers'
  | 'vendors'
  | 'disputes'
  | 'refunds'
  | 'settlements'
  | 'support'
  | 'system'
  | string;

export interface AdminNotification {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  type?: string | null;
  category?: AdminNotificationCategory | null;
  priority?: AdminNotificationPriority | null;
  referenceId?: string | null;
  data?: string | null;
  dataObject?: Record<string, unknown> | null;
  isRead: boolean;
  createdAtUtc?: string | null;
}

export interface AdminNotificationListResponse {
  items: AdminNotification[];
  page: number;
  perPage: number;
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

export interface AdminNotificationFilters {
  page?: number;
  perPage?: number;
  type?: string | null;
  category?: string | null;
  priority?: string | null;
  isRead?: boolean | null;
  fromUtc?: string | null;
  toUtc?: string | null;
}

interface AdminUnreadCountResponse {
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationsService {
  private readonly apiUrl = `${environment.apiUrl}/admin/notifications`;
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  private readonly recentSubject = new BehaviorSubject<AdminNotification[]>([]);

  readonly unreadCount$ = this.unreadCountSubject.asObservable();
  readonly recent$ = this.recentSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  list(filters: AdminNotificationFilters = {}): Observable<AdminNotificationListResponse> {
    if (environment.skipAuthForDevelopment) {
      const demo = this.getDevelopmentNotifications();
      return of({
        items: demo,
        page: filters.page ?? 1,
        perPage: filters.perPage ?? 20,
        total: demo.length,
        unreadCount: demo.filter((item) => !item.isRead).length,
        hasMore: false
      });
    }

    let params = new HttpParams()
      .set('page', String(filters.page ?? 1))
      .set('per_page', String(filters.perPage ?? 20));

    if (filters.type) params = params.set('type', filters.type);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.priority) params = params.set('priority', filters.priority);
    if (filters.isRead !== undefined && filters.isRead !== null) params = params.set('is_read', String(filters.isRead));
    if (filters.fromUtc) params = params.set('from_utc', filters.fromUtc);
    if (filters.toUtc) params = params.set('to_utc', filters.toUtc);

    return this.http.get<AdminNotificationListResponse>(this.apiUrl, { params });
  }

  refreshRecent(): Observable<AdminNotificationListResponse> {
    return this.list({ page: 1, perPage: 8 }).pipe(
      tap((response) => {
        this.recentSubject.next(response.items);
        this.unreadCountSubject.next(Math.max(0, response.unreadCount || 0));
      }),
      catchError(() => of({
        items: [],
        page: 1,
        perPage: 8,
        total: 0,
        unreadCount: 0,
        hasMore: false
      }))
    );
  }

  getUnreadCount(): Observable<number> {
    if (environment.skipAuthForDevelopment) {
      const count = this.getDevelopmentNotifications().filter((item) => !item.isRead).length;
      this.unreadCountSubject.next(count);
      return of(count);
    }

    return this.http.get<AdminUnreadCountResponse>(`${this.apiUrl}/unread-count`).pipe(
      map((response) => Math.max(0, response.count || 0)),
      tap((count) => this.unreadCountSubject.next(count)),
      catchError(() => of(0))
    );
  }

  markAsRead(id: string): Observable<void> {
    if (environment.skipAuthForDevelopment) {
      this.markLocalRead(id);
      return of(void 0);
    }

    return this.http.post<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => this.markLocalRead(id))
    );
  }

  markAllAsRead(): Observable<void> {
    if (environment.skipAuthForDevelopment) {
      this.recentSubject.next(this.recentSubject.value.map((item) => ({ ...item, isRead: true })));
      this.unreadCountSubject.next(0);
      return of(void 0);
    }

    return this.http.post<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.recentSubject.next(this.recentSubject.value.map((item) => ({ ...item, isRead: true })));
        this.unreadCountSubject.next(0);
      })
    );
  }

  mergeRealtimeNotification(notification: AdminNotification): void {
    const existing = this.recentSubject.value.filter((item) => item.id !== notification.id);
    this.recentSubject.next([notification, ...existing].slice(0, 8));
    this.unreadCountSubject.next(this.unreadCountSubject.value + (notification.isRead ? 0 : 1));
  }

  resolveTargetUrl(notification: AdminNotification): string {
    const raw = notification.dataObject?.['targetUrl'];
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim();
    }

    if (notification.category === 'drivers' && notification.referenceId) return `/drivers/${notification.referenceId}`;
    if (notification.category === 'vendors' && notification.referenceId) return `/vendors/${notification.referenceId}`;
    if (notification.category === 'refunds') return '/finances/refunds';
    if (notification.category === 'settlements') return '/finances/settlements';
    if (notification.category === 'disputes' || notification.category === 'support') return '/disputes';
    return '/notifications';
  }

  private markLocalRead(id: string): void {
    const updated = this.recentSubject.value.map((item) => item.id === id ? { ...item, isRead: true } : item);
    this.recentSubject.next(updated);
    this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
  }

  private getDevelopmentNotifications(): AdminNotification[] {
    return [
      {
        id: 'dev-critical-support',
        titleAr: 'Critical support case',
        titleEn: 'Critical support case',
        bodyAr: 'A high priority dispute is waiting for review.',
        bodyEn: 'A high priority dispute is waiting for review.',
        type: 'support.critical_created',
        category: 'support',
        priority: 'critical',
        referenceId: null,
        dataObject: { targetUrl: '/disputes' },
        isRead: false,
        createdAtUtc: new Date().toISOString()
      }
    ];
  }
}
