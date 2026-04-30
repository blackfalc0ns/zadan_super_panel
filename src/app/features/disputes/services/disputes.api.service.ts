import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  DisputeRow,
  RefundDecisionForm,
  RejectionDecisionForm,
  RequestInfoForm,
  TimelineItem
} from '../models/disputes.models';

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
  orderId: string;
  orderDisplayId: string;
  customerName: string;
  customerEmail: string;
  merchantName: string;
  type: string;
  reason: string;
  amount: number;
  status: DisputeRow['status'];
  priority: DisputeRow['priority'];
  owner: string;
  queue: string;
  risk: DisputeRow['risk'];
  createdAt: string;
  sla: string;
  note: string;
  paymentMask: string;
  customerSummary: string;
  merchantSummary: string;
  evidence: Array<{
    fileName: string;
    fileUrl: string;
  }>;
  timeline: TimelineItem[];
}

@Injectable({
  providedIn: 'root'
})
export class DisputesService {
  private readonly apiUrl = `${environment.apiUrl}/admin/order-cases`;
  private readonly disputesCache = new Map<string, DisputeRow>();

  constructor(private readonly http: HttpClient) {}

  getDisputes(pageSize = 200): Observable<DisputeRow[]> {
    const params = new HttpParams()
      .set('page', '1')
      .set('pageSize', String(Math.max(1, pageSize)));

    return this.http.get<AdminOrderSupportCasesResponse>(this.apiUrl, { params }).pipe(
      map((response) => response.items.map((item) => this.mapDispute(item))),
      tap((items) => this.replaceCache(items)),
      catchError((error) => {
        console.error('Failed to load support cases queue.', error);
        return of(this.getDisputesSnapshot());
      })
    );
  }

  approveCase(id: string, form: RefundDecisionForm): Observable<DisputeRow> {
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

  rejectCase(id: string, form: RejectionDecisionForm): Observable<DisputeRow> {
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

  requestEvidence(id: string, form: RequestInfoForm): Observable<DisputeRow> {
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
      slaDueAtUtc: this.toSlaDueAtUtc(form.dueDate)
    }).pipe(
      map((response) => this.mapDispute(response)),
      tap((item) => this.upsertCache(item))
    );
  }

  getDisputesSnapshot(): DisputeRow[] {
    return [...this.disputesCache.values()].map((item) => ({
      ...item,
      evidence: item.evidence.map((evidence) => ({ ...evidence })),
      timeline: item.timeline.map((timelineItem) => ({ ...timelineItem })),
      workflowContext: item.workflowContext ? { ...item.workflowContext } : undefined
    }));
  }

  getDisputeById(id: string | null): DisputeRow | undefined {
    if (!id) {
      return undefined;
    }

    const normalizedId = this.normalizeId(id);
    return this.getDisputesSnapshot().find((item) => this.normalizeId(item.id) === normalizedId);
  }

  findPrimaryDisputeByOrderId(orderId: string | null | undefined): DisputeRow | undefined {
    if (!orderId) {
      return undefined;
    }

    const normalizedOrderId = this.normalizeId(orderId);
    return this.getDisputesSnapshot().find((item) => this.normalizeId(item.orderId) === normalizedOrderId);
  }

  private mapDispute(item: AdminOrderSupportCaseResponse): DisputeRow {
    return {
      id: item.id,
      orderId: item.orderId,
      customerName: item.customerName,
      customerEmail: item.customerEmail,
      customerInitials: this.buildInitials(item.customerName),
      merchantName: item.merchantName,
      type: item.type,
      reason: item.reason,
      amount: item.amount,
      status: item.status,
      priority: item.priority,
      owner: item.owner,
      risk: item.risk,
      createdAt: item.createdAt,
      sla: item.sla,
      note: item.note,
      paymentMask: item.paymentMask,
      customerSummary: item.customerSummary,
      merchantSummary: item.merchantSummary,
      evidence: item.evidence.map((evidenceItem) => this.mapEvidence(evidenceItem)),
      timeline: item.timeline.map((timelineItem) => ({ ...timelineItem }))
    };
  }

  private mapEvidence(item: { fileName: string; fileUrl: string }): DisputeRow['evidence'][number] {
    const normalizedName = `${item.fileName} ${item.fileUrl}`.toLowerCase();
    const isPdf = normalizedName.includes('.pdf');

    return {
      type: isPdf ? 'pdf' : 'image',
      label: item.fileName,
      preview: isPdf ? undefined : item.fileUrl
    };
  }

  private buildInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('');
  }

  private replaceCache(items: DisputeRow[]): void {
    this.disputesCache.clear();
    items.forEach((item) => this.disputesCache.set(item.id, item));
  }

  private upsertCache(item: DisputeRow): void {
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
}
