import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  SupportCaseRow,
  EscalationDecisionForm,
  RefundDecisionForm,
  RejectionDecisionForm,
  RequestInfoForm,
  TimelineItem,
  AdminOrderCaseStats
} from '../models/disputes.models';

interface AdminOrderCaseStatsResponse {
  totalOpen: number;
  slaBreachedCount: number;
  avgResolutionHours: number;
  byStatus: Array<{ label: string; count: number }>;
  byPriority: Array<{ label: string; count: number }>;
  byQueue: Array<{ label: string; count: number }>;
  byType: Array<{ label: string; count: number }>;
}

interface AdminOrderSupportCasesResponse {
  items: AdminOrderSupportCaseResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface AdminOrderSupportCaseResponse {
  id: string;
  orderId?: string | null;
  orderDisplayId: string;
  customerName: string;
  customerEmail: string;
  merchantName: string;
  type: string;
  typeLabel?: string | null;
  reason: string;
  reasonCode?: string | null;
  amount: number;
  caseStatus: SupportCaseRow['caseStatus'];
  caseStatusLabel?: string | null;
  status: SupportCaseRow['status'];
  statusLabel?: string | null;
  priority: SupportCaseRow['priority'];
  priorityLabel?: string | null;
  owner: string;
  queue: string;
  queueLabel?: string | null;
  risk: SupportCaseRow['risk'];
  createdAt: string;
  sla: string;
  note: string;
  paymentMethod: SupportCaseRow['paymentMethod'];
  paymentMask: string;
  customerSummary: string;
  merchantSummary: string;
  compensationType?: SupportCaseRow['compensationType'];
  settlementStatus?: SupportCaseRow['settlementStatus'];
  vendorRecoveryStatus?: SupportCaseRow['vendorRecoveryStatus'];
  vendorRecoveredAmount?: number;
  vendorOutstandingAmount?: number;
  couponCode?: string | null;
  couponExpiresAtUtc?: string | null;
  couponRedeemed?: boolean;
  evidence: Array<{
    fileName: string;
    fileUrl: string;
  }>;
  timeline: TimelineItem[];
  initiatorRole: string;
  initiatorRoleLabel?: string | null;
  waitingOnRole?: string;
  waitingOnRoleLabel?: string | null;
  participants?: Array<{
    role: string;
    roleLabel?: string | null;
    isInitiator: boolean;
    isAwaitingResponse: boolean;
    hasMessages: boolean;
  }>;
  allowedActions?: string[];
  messages?: Array<{
    id: string;
    action: string;
    messageType: string;
    messageTypeLabel?: string | null;
    title: string;
    localizedTitle?: string | null;
    body: string | null;
    localizedBody?: string | null;
    authorRole: string;
    authorRoleLabel?: string | null;
    visibleTo: string[];
    isInternalOnly: boolean;
    createdAt: string;
    attachments: Array<{
      fileName: string;
      fileUrl: string;
    }>;
  }>;
  vendorResponse?: string;
  driverResponse?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DisputesService {
  private readonly apiUrl = `${environment.apiUrl}/admin/order-cases`;
  private readonly disputesCache = new Map<string, SupportCaseRow>();

  constructor(
    private readonly http: HttpClient,
    private readonly translate: TranslateService
  ) {}

  getDisputes(
    page = 1,
    pageSize = 8,
    search?: string,
    status?: string,
    priority?: string,
    queue?: string,
    type?: string,
    initiatorRole?: string,
    vendorId?: string,
    driverId?: string
  ): Observable<{ items: SupportCaseRow[]; totalCount: number }> {
    let params = new HttpParams()
      .set('page', String(Math.max(1, page)))
      .set('pageSize', String(Math.max(1, pageSize)));

    if (search) params = params.set('search', search);
    if (status && status !== 'all') params = params.set('status', status);
    if (priority && priority !== 'all') params = params.set('priority', priority);
    if (queue) params = params.set('queue', queue);
    if (type) params = params.set('type', type);
    if (initiatorRole && initiatorRole !== 'all') params = params.set('initiatorRole', initiatorRole);
    if (vendorId) params = params.set('vendorId', vendorId);
    if (driverId) params = params.set('driverId', driverId);

    return this.http.get<AdminOrderSupportCasesResponse>(this.apiUrl, { params }).pipe(
      map((response) => {
        const items = response.items.map((item) => this.mapDispute(item));
        this.replaceCache(items);
        return { items, totalCount: response.totalCount };
      }),
      catchError((error) => throwError(() => error))
    );
  }

  getStats(): Observable<AdminOrderCaseStats> {
    return this.http.get<AdminOrderCaseStatsResponse>(`${this.apiUrl}/stats`).pipe(
      map((response) => ({
        totalOpen: response.totalOpen ?? 0,
        slaBreachedCount: response.slaBreachedCount ?? 0,
        avgResolutionHours: response.avgResolutionHours ?? 0,
        byStatus: response.byStatus ?? [],
        byPriority: response.byPriority ?? [],
        byQueue: response.byQueue ?? [],
        byType: response.byType ?? []
      })),
      catchError((error) => throwError(() => error))
    );
  }

  assignCase(id: string): Observable<SupportCaseRow> {
    return this.http.post<AdminOrderSupportCaseResponse>(`${this.apiUrl}/${this.normalizeId(id)}/assign`, {}).pipe(
      map((response) => this.mapDispute(response)),
      tap((item) => this.upsertCache(item))
    );
  }

  addNote(id: string, note: string): Observable<SupportCaseRow> {
    return this.http.post<AdminOrderSupportCaseResponse>(`${this.apiUrl}/${this.normalizeId(id)}/note`, { note }).pipe(
      map((response) => this.mapDispute(response)),
      tap((item) => this.upsertCache(item))
    );
  }

  approveReturnRequest(id: string, form: RefundDecisionForm): Observable<SupportCaseRow> {
    return this.http.post<AdminOrderSupportCaseResponse>(`${this.apiUrl}/${this.normalizeId(id)}/approve`, {
      refundAmount: Number.parseFloat(form.refundAmount || '0') || undefined,
      refundMethod: form.refundMethod,
      costBearer: form.costBearer,
      decisionNotes: this.buildNoteLines([
        form.approvalReason,
        form.internalNotes
      ]),
      customerVisibleNote: form.customerMessage || undefined
    }).pipe(
      map((response) => this.mapDispute(response)),
      tap((item) => this.upsertCache(item))
    );
  }

  approveComplaint(id: string, internalNotes?: string, customerMessage?: string): Observable<SupportCaseRow> {
    return this.http.post<AdminOrderSupportCaseResponse>(`${this.apiUrl}/${this.normalizeId(id)}/approve`, {
      decisionNotes: internalNotes,
      customerVisibleNote: customerMessage || undefined
    }).pipe(
      map((response) => this.mapDispute(response)),
      tap((item) => this.upsertCache(item))
    );
  }

  resolveCase(id: string, note?: string): Observable<SupportCaseRow> {
    return this.http.post<AdminOrderSupportCaseResponse>(`${this.apiUrl}/${this.normalizeId(id)}/resolve`, {
      note: note || undefined
    }).pipe(
      map((response) => this.mapDispute(response)),
      tap((item) => this.upsertCache(item))
    );
  }

  reopenCase(id: string, note?: string): Observable<SupportCaseRow> {
    return this.http.post<AdminOrderSupportCaseResponse>(`${this.apiUrl}/${this.normalizeId(id)}/reopen`, {
      note: note || undefined
    }).pipe(
      map((response) => this.mapDispute(response)),
      tap((item) => this.upsertCache(item))
    );
  }

  rejectCase(id: string, form: RejectionDecisionForm): Observable<SupportCaseRow> {
    return this.http.post<AdminOrderSupportCaseResponse>(`${this.apiUrl}/${this.normalizeId(id)}/reject`, {
      decisionNotes: this.buildNoteLines([
        `Reason: ${form.reason}`,
        form.additionalExplanation,
        form.internalNotes
      ]),
      customerVisibleNote: form.customerMessage || undefined
    }).pipe(
      map((response) => this.mapDispute(response)),
      tap((item) => this.upsertCache(item))
    );
  }

  requestEvidence(id: string, form: RequestInfoForm): Observable<SupportCaseRow> {
    return this.http.post<AdminOrderSupportCaseResponse>(`${this.apiUrl}/${this.normalizeId(id)}/request-evidence`, {
      note: this.buildNoteLines([
        form.title,
        form.details,
        form.internalNotes
      ]),
      customerVisibleNote: this.buildNoteLines([
        form.title,
        form.details
      ]),
      targetRole: form.target,
      slaDueAtUtc: this.toSlaDueAtUtc(form.dueDate)
    }).pipe(
      map((response) => this.mapDispute(response)),
      tap((item) => this.upsertCache(item))
    );
  }

  addPublicMessage(id: string, message: string, audience: string): Observable<SupportCaseRow> {
    return this.http.post<AdminOrderSupportCaseResponse>(`${this.apiUrl}/${this.normalizeId(id)}/messages`, {
      message,
      audience
    }).pipe(
      map((response) => this.mapDispute(response)),
      tap((item) => this.upsertCache(item))
    );
  }

  escalateCase(id: string, form: EscalationDecisionForm): Observable<SupportCaseRow> {
    return this.http.post<AdminOrderSupportCaseResponse>(`${this.apiUrl}/${this.normalizeId(id)}/escalate`, {
      queue: form.target,
      priority: form.markHighRisk ? 'critical' : form.priority,
      note: this.buildNoteLines([
        `Escalation reason: ${form.reason}`,
        form.detailedExplanation,
        form.reviewedSummary ? `Reviewed summary: ${form.reviewedSummary}` : undefined,
        form.requestedAction ? `Requested action: ${form.requestedAction}` : undefined,
        form.notifyEscalatedTeam ? 'Notify escalated team: yes' : undefined,
        form.notifyCurrentReviewer ? 'Notify current reviewer: yes' : undefined
      ]),
      customerVisibleNote: form.addTrackingNote
        ? this.buildNoteLines([
            'Your case has been escalated for specialist review.',
            form.requestedAction ? `Next step: ${form.requestedAction}` : undefined
          ])
        : undefined,
      notifyEscalatedTeam: form.notifyEscalatedTeam,
      notifyCurrentReviewer: form.notifyCurrentReviewer,
      slaDueAtUtc: form.responseDeadline ? new Date(form.responseDeadline).toISOString() : undefined
    }).pipe(
      map((response) => this.mapDispute(response)),
      tap((item) => this.upsertCache(item))
    );
  }

  getDisputesSnapshot(): SupportCaseRow[] {
    return [...this.disputesCache.values()].map((item) => ({
      ...item,
      evidence: item.evidence.map((evidence) => ({ ...evidence })),
      timeline: item.timeline.map((timelineItem) => ({ ...timelineItem })),
      workflowContext: item.workflowContext ? { ...item.workflowContext } : undefined
    }));
  }

  getDisputeById(id: string | null): SupportCaseRow | undefined {
    if (!id) {
      return undefined;
    }

    const normalizedId = this.normalizeId(id);
    return this.getDisputesSnapshot().find((item) => this.normalizeId(item.id) === normalizedId);
  }

  findPrimaryDisputeByOrderId(orderId: string | null | undefined): SupportCaseRow | undefined {
    if (!orderId) {
      return undefined;
    }

    const normalizedOrderId = this.normalizeId(orderId);
    return this.getDisputesSnapshot().find((item) => item.orderId && this.normalizeId(item.orderId) === normalizedOrderId);
  }

  private mapDispute(item: AdminOrderSupportCaseResponse): SupportCaseRow {
    const normalizedSettlementStatus = item.couponRedeemed
      ? 'coupon_redeemed'
      : item.settlementStatus ?? null;
    const hasCompletedSettlement =
      normalizedSettlementStatus === 'coupon_redeemed'
      || normalizedSettlementStatus === 'cash_refunded';
    const effectiveCaseStatus = hasCompletedSettlement
      ? 'resolved'
      : (item.caseStatus || 'submitted');
    const effectiveCaseStatusLabel = hasCompletedSettlement
      ? (item.caseStatusLabel ?? item.statusLabel ?? null)
      : (item.caseStatusLabel ?? null);

    return {
      id: item.id,
      orderId: item.orderId ?? null,
      orderDisplayId: this.resolveOrderDisplayLabel(item.orderDisplayId),
      customerName: item.customerName,
      customerEmail: item.customerEmail,
      customerInitials: this.buildInitials(item.customerName),
      merchantName: item.merchantName,
      type: item.type || 'complaint',
      typeLabel: item.typeLabel ?? null,
      reason: item.reason || item.reasonCode || '',
      amount: item.amount,
      caseStatus: effectiveCaseStatus,
      caseStatusLabel: effectiveCaseStatusLabel,
      status: hasCompletedSettlement ? 'resolved' : (item.status || 'open'),
      statusLabel: hasCompletedSettlement ? (item.statusLabel ?? item.caseStatusLabel ?? null) : (item.statusLabel ?? null),
      priority: item.priority || 'medium',
      priorityLabel: item.priorityLabel ?? null,
      owner: this.resolveOwnerLabel(item.owner),
      queue: item.queue || 'General',
      queueLabel: item.queueLabel ?? null,
      risk: item.risk || 'low',
      createdAt: item.createdAt,
      sla: item.sla,
      note: item.note,
      paymentMethod: item.paymentMethod || 'card',
      paymentMask: item.paymentMask,
      customerSummary: item.customerSummary,
      merchantSummary: item.merchantSummary,
      compensationType: item.compensationType ?? null,
      settlementStatus: normalizedSettlementStatus,
      vendorRecoveryStatus: item.vendorRecoveryStatus ?? null,
      vendorRecoveredAmount: item.vendorRecoveredAmount ?? 0,
      vendorOutstandingAmount: item.vendorOutstandingAmount ?? 0,
      couponCode: item.couponCode ?? null,
      couponExpiresAtUtc: item.couponExpiresAtUtc ?? null,
      couponRedeemed: item.couponRedeemed ?? false,
      evidence: item.evidence ? item.evidence.map((evidenceItem) => this.mapEvidence(evidenceItem)) : [],
      timeline: item.timeline ? item.timeline.map((timelineItem) => ({ ...timelineItem })) : [],
      initiatorRole: item.initiatorRole || 'customer',
      initiatorRoleLabel: item.initiatorRoleLabel ?? null,
      waitingOnRole: item.waitingOnRole,
      waitingOnRoleLabel: item.waitingOnRoleLabel ?? null,
      participants: item.participants ? item.participants.map((participant) => ({ ...participant })) : [],
      allowedActions: item.allowedActions ? [...item.allowedActions] : [],
      messages: item.messages ? item.messages.map((message) => ({
        ...message,
        title: message.localizedTitle || message.title,
        body: message.localizedBody || message.body,
        visibleTo: [...message.visibleTo],
        attachments: message.attachments.map((attachment) => ({ ...attachment }))
      })) : [],
      vendorResponse: item.vendorResponse,
      driverResponse: item.driverResponse
    };
  }

  private mapEvidence(item: { fileName: string; fileUrl: string }): SupportCaseRow['evidence'][number] {
    const normalizedName = `${item.fileName} ${item.fileUrl}`.toLowerCase();
    const isPdf = normalizedName.includes('.pdf');

    return {
      type: isPdf ? 'pdf' : 'image',
      label: item.fileName,
      preview: isPdf ? undefined : item.fileUrl,
      fileUrl: item.fileUrl
    };
  }

  private buildInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('');
  }

  private replaceCache(items: SupportCaseRow[]): void {
    this.disputesCache.clear();
    items.forEach((item) => this.disputesCache.set(item.id, item));
  }

  private upsertCache(item: SupportCaseRow): void {
    this.disputesCache.set(item.id, item);
  }

  private buildNoteLines(lines: Array<string | null | undefined>): string | undefined {
    const value = lines
      .map((line) => line?.trim())
      .filter((line): line is string => Boolean(line))
      .join('\n');

    return value || undefined;
  }

  private toSlaDueAtUtc(dateValue: string): string | undefined {
    if (!dateValue) {
      return undefined;
    }

    return new Date(`${dateValue}T23:59:59Z`).toISOString();
  }

  private normalizeId(value: string): string {
    return value.trim().toLowerCase();
  }

  private resolveOrderDisplayLabel(displayId?: string | null): string {
    const value = displayId?.trim() ?? '';
    if (!value) {
      return '';
    }

    if (value.startsWith('driver-account:')) {
      return this.translate.instant('DISPUTES_DASHBOARD.TABLE.DRIVER_ACCOUNT');
    }

    if (this.isGuid(value)) {
      return '';
    }

    return value;
  }

  private isGuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
  }

  private resolveOwnerLabel(owner?: string | null): string {
    const value = owner?.trim() ?? '';
    if (!value) {
      return this.translate.instant('DISPUTES_DASHBOARD.TABLE.UNASSIGNED');
    }

    if (value === 'Assigned admin') {
      return this.translate.instant('DISPUTES_DASHBOARD.TABLE.ASSIGNED_ADMIN');
    }

    return value;
  }

}
