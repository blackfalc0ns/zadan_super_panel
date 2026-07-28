import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import {
  AdminSupportPriority,
  AdminSupportStatus,
  AdminVendorSupportFilters,
  AdminVendorSupportTicket,
  AdminVendorSupportTicketStats,
  AdminVendorSupportTicketsResponse
} from '../models/admin-support.models';

@Injectable({
  providedIn: 'root'
})
export class AdminVendorSupportService {
  private readonly apiUrl = `${environment.apiUrl}/admin/vendor-support-tickets`;
  private readonly cache = new Map<string, AdminVendorSupportTicket>();

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  getStats(): Observable<AdminVendorSupportTicketStats> {
    if (this.shouldUseLocalFallback()) {
      return of({ totalOpen: 0, waitingVendor: 0, resolved: 0 });
    }

    return this.http.get<AdminVendorSupportTicketStats>(`${this.apiUrl}/stats`).pipe(
      catchError(() => of({ totalOpen: 0, waitingVendor: 0, resolved: 0 }))
    );
  }

  getTickets(filters: AdminVendorSupportFilters = {}): Observable<AdminVendorSupportTicketsResponse> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.max(1, filters.pageSize ?? 20);

    if (this.shouldUseLocalFallback()) {
      return of({ items: [], page, pageSize, total: 0 });
    }

    let params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));

    if (filters.status && filters.status !== 'all') params = params.set('status', filters.status);
    if (filters.priority && filters.priority !== 'all') params = params.set('priority', filters.priority);
    if (filters.category && filters.category !== 'all') params = params.set('category', filters.category);
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());

    return this.http.get<AdminVendorSupportTicketsResponse>(this.apiUrl, { params }).pipe(
      map((response) => ({
        ...response,
        items: (response.items ?? []).map((ticket) => this.normalizeTicket(ticket, false))
      })),
      tap((response) => response.items.forEach((ticket) => this.cache.set(ticket.id, ticket))),
      catchError(() => of({ items: [], page, pageSize, total: 0 }))
    );
  }

  getTicket(ticketId: string): Observable<AdminVendorSupportTicket | null> {
    if (this.shouldUseLocalFallback()) {
      return of(this.cache.get(ticketId) ?? null);
    }

    return this.http.get<AdminVendorSupportTicket>(`${this.apiUrl}/${ticketId}`).pipe(
      map((ticket) => this.normalizeTicket(ticket, true)),
      tap((ticket) => this.cache.set(ticket.id, ticket)),
      catchError(() => of(null))
    );
  }

  assignToMe(ticketId: string): Observable<AdminVendorSupportTicket> {
    return this.http.post<AdminVendorSupportTicket>(`${this.apiUrl}/${ticketId}/assign`, {}).pipe(
      map((ticket) => this.normalizeTicket(ticket, true)),
      tap((ticket) => this.cache.set(ticket.id, ticket))
    );
  }

  sendMessage(ticketId: string, message: string): Observable<AdminVendorSupportTicket> {
    return this.http.post<AdminVendorSupportTicket>(`${this.apiUrl}/${ticketId}/messages`, {
      message: message.trim()
    }).pipe(
      map((ticket) => this.normalizeTicket(ticket, true)),
      tap((ticket) => this.cache.set(ticket.id, ticket))
    );
  }

  updateStatus(ticketId: string, status: AdminSupportStatus, message?: string): Observable<AdminVendorSupportTicket> {
    return this.http.post<AdminVendorSupportTicket>(`${this.apiUrl}/${ticketId}/status`, {
      status,
      message: message?.trim() || undefined
    }).pipe(
      map((ticket) => this.normalizeTicket(ticket, true)),
      tap((ticket) => this.cache.set(ticket.id, ticket))
    );
  }

  private normalizeTicket(ticket: AdminVendorSupportTicket, includeMessages: boolean): AdminVendorSupportTicket {
    return {
      ...ticket,
      subject: this.normalizeText(ticket.subject),
      summary: this.normalizeText(ticket.summary ?? ticket.subject),
      category: ticket.category || 'general',
      priority: this.normalizePriority(ticket.priority),
      status: this.normalizeStatus(ticket.status),
      firstResponseHours: Number(ticket.firstResponseHours || 0),
      assignedAgentName: ticket.assignedAgentName || 'Support Queue',
      assignedAgentRole: this.normalizeText(ticket.assignedAgentRole),
      tags: (ticket.tags ?? []).map((tag) => ({ ...tag })),
      messages: includeMessages
        ? (ticket.messages ?? []).map((message) => ({
            ...message,
            role: this.normalizeText(message.role),
            message: this.normalizeText(message.message)
          }))
        : [],
      orderId: ticket.orderId ?? null,
      orderNumber: ticket.orderNumber ?? null,
      linkedRoute: ticket.linkedRoute ?? null
    };
  }

  private normalizeText(value?: Partial<{ ar: string; en: string }> | null): { ar: string; en: string } {
    return {
      ar: value?.ar || value?.en || '',
      en: value?.en || value?.ar || ''
    };
  }

  private normalizeStatus(status?: string | null): AdminSupportStatus {
    const normalized = (status ?? '').trim().toLowerCase();
    if (normalized === 'inprogress') return 'in_progress';
    if (normalized === 'waitingvendor') return 'waiting_vendor';
    if (['in_progress', 'waiting_vendor', 'resolved'].includes(normalized)) {
      return normalized as AdminSupportStatus;
    }

    return 'open';
  }

  private normalizePriority(priority?: string | null): AdminSupportPriority {
    const normalized = (priority ?? '').trim().toLowerCase();
    if (['low', 'high', 'urgent'].includes(normalized)) {
      return normalized as AdminSupportPriority;
    }

    return 'medium';
  }

  private shouldUseLocalFallback(): boolean {
    return environment.skipAuthForDevelopment && !this.authService.hasApiSession;
  }
}
