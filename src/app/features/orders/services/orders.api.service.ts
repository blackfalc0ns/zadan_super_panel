import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import {
  DriverAssignmentForm,
  DriverCandidate,
  OrderActivity,
  OrderCancellationForm,
  OrderCancellationSummary,
  OrderDetail,
  OrderDispatchState,
  OrderDisputeForm,
  OrderFulfillmentStatus,
  OrderIssueFlagForm,
  OrderListItem,
  OrderListQuery,
  OrderOperationalCase,
  OrderPaymentStatus,
  OrderRefundForm,
  OrdersSummary,
  OrderStatus,
  OrderStatusUpdateForm,
  OrderTimelineItem,
  OrderWorkflowStage,
  OrderResolutionState,
  PaginatedOrdersResponse
} from '../models/orders.models';

interface AdminOrdersListResponse {
  items: AdminOrderListItemResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  summary: OrdersSummary;
}

interface AdminOrderListItemResponse {
  id: string;
  displayId: string;
  customerName: string;
  customerPhone: string;
  merchantName: string;
  merchantBranch: string;
  date: string;
  time: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  dispatchState?: OrderDispatchState;
  dispatchReason?: string;
  paymentMethodLabel: string;
  lastUpdatedAtUtc: string;
  total: number;
  isLate: boolean;
  hasActiveIssue: boolean;
  cancellationReason?: string | null;
  operationalCase: OrderOperationalCase | null;
}

interface AdminOrderDetailResponse extends AdminOrderListItemResponse {
  customerEmail: string;
  customerAddress: string;
  merchantLocation: string;
  driverId?: string | null;
  driverName: string;
  driverPhone: string;
  driverVehicleLabel: string;
  driverPlateNumber: string;
  city: string;
  district: string;
  slaScore: number;
  expectedDeliveryWindow: string;
  transactionRef: string;
  paymentStatusNote: string;
  fulfillmentStatusNote: string;
  dispatchState?: OrderDispatchState;
  dispatchReason?: string;
  supportSummary: string;
  alertLabel: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  items: Array<{
    name: string;
    brand: string;
    quantity: string;
    price: number;
    total: number;
    icon: string;
    sku: string;
  }>;
  timeline: OrderTimelineItem[];
  activities: OrderActivity[];
  driverCandidates: DriverCandidate[];
  candidateScoreBreakdown?: string[];
  cancellationSummary: OrderCancellationSummary | null;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly apiUrl = `${environment.apiUrl}/admin/orders`;
  private ordersCache = new Map<string, OrderDetail>();

  constructor(private readonly http: HttpClient) {}

  getOrders(query: OrderListQuery): Observable<PaginatedOrdersResponse> {
    let params = new HttpParams()
      .set('page', String(Math.max(1, query.page || 1)))
      .set('pageSize', String(Math.max(1, query.pageSize || 10)));

    if (query.searchTerm?.trim()) {
      params = params.set('search', query.searchTerm.trim());
    }

    if (query.status && query.status !== 'ALL') {
      params = params.set('status', query.status);
    }

    if (query.paymentStatus && query.paymentStatus !== 'ALL') {
      params = params.set('paymentStatus', query.paymentStatus);
    }

    if (query.fulfillmentStatus && query.fulfillmentStatus !== 'ALL') {
      params = params.set('fulfillmentStatus', query.fulfillmentStatus);
    }

    if (query.queueView && query.queueView !== 'ALL') {
      params = params.set('queueView', query.queueView);
    }

    return this.http.get<AdminOrdersListResponse>(this.apiUrl, { params }).pipe(
      map((response) => ({
        items: response.items.map((item) => this.mapListItem(item)),
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPreviousPage: response.hasPreviousPage,
        hasNextPage: response.hasNextPage,
        summary: response.summary
      })),
      tap((response) => response.items.forEach((item) => this.upsertCache(this.toDetailStub(item))))
    );
  }

  getOrderById(id: string): Observable<OrderDetail> {
    return this.http.get<AdminOrderDetailResponse>(`${this.apiUrl}/${this.normalizeOrderId(id)}`).pipe(
      map((response) => this.mapDetail(response)),
      tap((order) => this.upsertCache(order))
    );
  }

  getLiveSnapshot(pageSize = 60): Observable<OrderDetail[]> {
    return this.getOrders({
      page: 1,
      pageSize,
      status: 'ALL',
      paymentStatus: 'ALL',
      fulfillmentStatus: 'ALL',
      queueView: 'ALL'
    }).pipe(
      map((response) => response.items),
      map((items) => items.map((item) => item.id)),
      map((ids) => ids.slice(0, pageSize)),
      map((ids) => ids.map((id) =>
        this.getOrderById(id).pipe(catchError(() => of(this.getOrderSnapshotById(id) ?? this.buildEmptyOrder(id)))))),
      switchMap((requests) => requests.length ? forkJoin(requests) : of([]))
    );
  }

  getOrdersSnapshot(): OrderDetail[] {
    return [...this.ordersCache.values()].map((order) => this.clone(order));
  }

  getOrderSnapshotById(id: string): OrderDetail | undefined {
    const order = this.ordersCache.get(this.normalizeOrderId(id));
    return order ? this.clone(order) : undefined;
  }

  updateOrderStatus(id: string, form: OrderStatusUpdateForm): Observable<OrderDetail> {
    return this.http.post<AdminOrderDetailResponse>(`${this.apiUrl}/${this.normalizeOrderId(id)}/status`, form).pipe(
      map((response) => this.mapDetail(response)),
      tap((order) => this.upsertCache(order))
    );
  }

  assignDriver(id: string, form: DriverAssignmentForm): Observable<OrderDetail> {
    return this.http.post<AdminOrderDetailResponse>(`${this.apiUrl}/${this.normalizeOrderId(id)}/assign-driver`, form).pipe(
      map((response) => this.mapDetail(response)),
      tap((order) => this.upsertCache(order))
    );
  }

  recomputeDispatch(id: string): Observable<OrderDetail> {
    return this.http.post<AdminOrderDetailResponse>(`${this.apiUrl}/${this.normalizeOrderId(id)}/dispatch/recompute`, {}).pipe(
      map((response) => this.mapDetail(response)),
      tap((order) => this.upsertCache(order))
    );
  }

  cancelOrder(id: string, form: OrderCancellationForm): Observable<OrderDetail> {
    return this.http.post<AdminOrderDetailResponse>(`${this.apiUrl}/${this.normalizeOrderId(id)}/cancel`, form).pipe(
      map((response) => this.mapDetail(response)),
      tap((order) => this.upsertCache(order))
    );
  }

  createRefund(id: string, form: OrderRefundForm): Observable<OrderDetail> {
    return this.http.post<AdminOrderDetailResponse>(`${this.apiUrl}/${this.normalizeOrderId(id)}/refund`, form).pipe(
      map((response) => this.mapDetail(response)),
      tap((order) => this.upsertCache(order))
    );
  }

  openDispute(id: string, form: OrderDisputeForm): Observable<OrderDetail> {
    return this.http.post<AdminOrderDetailResponse>(`${this.apiUrl}/${this.normalizeOrderId(id)}/dispute`, form).pipe(
      map((response) => this.mapDetail(response)),
      tap((order) => this.upsertCache(order))
    );
  }

  flagIssue(id: string, form: OrderIssueFlagForm): Observable<OrderDetail> {
    return this.http.post<AdminOrderDetailResponse>(`${this.apiUrl}/${this.normalizeOrderId(id)}/issue-flag`, form).pipe(
      map((response) => this.mapDetail(response)),
      tap((order) => this.upsertCache(order))
    );
  }

  resolveOperationalCase(id: string): Observable<OrderDetail> {
    return this.http.post<AdminOrderDetailResponse>(`${this.apiUrl}/${this.normalizeOrderId(id)}/resolve-operational-case`, {}).pipe(
      map((response) => this.mapDetail(response)),
      tap((order) => this.upsertCache(order))
    );
  }

  closeOperationalCase(id: string): Observable<OrderDetail> {
    return this.http.post<AdminOrderDetailResponse>(`${this.apiUrl}/${this.normalizeOrderId(id)}/close-operational-case`, {}).pipe(
      map((response) => this.mapDetail(response)),
      tap((order) => this.upsertCache(order))
    );
  }

  reopenOperationalCase(id: string): Observable<OrderDetail> {
    return this.http.post<AdminOrderDetailResponse>(`${this.apiUrl}/${this.normalizeOrderId(id)}/reopen-operational-case`, {}).pipe(
      map((response) => this.mapDetail(response)),
      tap((order) => this.upsertCache(order))
    );
  }

  private mapListItem(item: AdminOrderListItemResponse): OrderListItem {
    return {
      id: item.id,
      displayId: item.displayId,
      customerName: item.customerName,
      customerPhone: item.customerPhone,
      merchantName: item.merchantName,
      merchantBranch: item.merchantBranch,
      date: item.date,
      time: item.time,
      status: item.status,
      paymentStatus: item.paymentStatus,
      fulfillmentStatus: item.fulfillmentStatus,
      dispatchState: item.dispatchState,
      dispatchReason: item.dispatchReason,
      paymentMethodLabel: item.paymentMethodLabel,
      workflowStage: this.deriveWorkflowStage(item.status, item.paymentStatus, item.fulfillmentStatus, item.hasActiveIssue, item.operationalCase),
      nextActionLabel: this.deriveNextAction(item.status, item.paymentStatus, item.fulfillmentStatus, item.operationalCase, item.cancellationReason),
      resolutionState: this.deriveResolutionState(item.status, item.isLate, item.hasActiveIssue, item.paymentStatus, item.fulfillmentStatus, item.operationalCase),
      operationalCase: item.operationalCase,
      lastUpdatedAt: this.formatDateTime(item.lastUpdatedAtUtc),
      total: item.total,
      isLate: item.isLate,
      hasActiveIssue: item.hasActiveIssue,
      cancellationReason: item.cancellationReason ?? null
    };
  }

  private mapDetail(item: AdminOrderDetailResponse): OrderDetail {
    const listItem = this.mapListItem(item);

    return {
      ...listItem,
      customerEmail: item.customerEmail,
      customerAddress: item.customerAddress,
      merchantLocation: item.merchantLocation,
      driverName: item.driverName,
      driverPhone: item.driverPhone,
      driverVehicleLabel: item.driverVehicleLabel,
      driverPlateNumber: item.driverPlateNumber,
      city: item.city,
      district: item.district,
      slaScore: item.slaScore,
      expectedDeliveryWindow: item.expectedDeliveryWindow,
      transactionRef: item.transactionRef,
      paymentStatusNote: item.paymentStatusNote,
      fulfillmentStatusNote: item.fulfillmentStatusNote,
      dispatchState: item.dispatchState,
      dispatchReason: item.dispatchReason,
      supportSummary: item.supportSummary,
      alertLabel: item.alertLabel,
      subtotal: item.subtotal,
      deliveryFee: item.deliveryFee,
      tax: item.tax,
      items: item.items,
      timeline: item.timeline,
      activities: item.activities,
      driverCandidates: item.driverCandidates,
      candidateScoreBreakdown: item.candidateScoreBreakdown ?? [],
      cancellationSummary: item.cancellationSummary
    };
  }

  private toDetailStub(item: OrderListItem): OrderDetail {
    return {
      ...item,
      customerEmail: '',
      customerAddress: '',
      merchantLocation: item.merchantBranch,
      driverName: '',
      driverPhone: '',
      driverVehicleLabel: '',
      driverPlateNumber: '',
      city: '',
      district: '',
      slaScore: item.isLate ? 55 : 92,
      expectedDeliveryWindow: item.time,
      transactionRef: item.displayId.replace('#', ''),
      paymentStatusNote: '',
      fulfillmentStatusNote: '',
      dispatchState: item.dispatchState,
      dispatchReason: item.dispatchReason,
      supportSummary: item.hasActiveIssue ? 'Order needs operational review.' : 'No active support case.',
      alertLabel: item.operationalCase?.title || (item.isLate ? 'Order is running behind SLA' : 'Order flow is healthy'),
      subtotal: item.total,
      deliveryFee: 0,
      tax: 0,
      items: [],
      timeline: this.buildFallbackTimeline(item),
      activities: [],
      driverCandidates: [],
      candidateScoreBreakdown: [],
      cancellationSummary: null
    };
  }

  private buildFallbackTimeline(item: OrderListItem): OrderTimelineItem[] {
    return [
      { title: 'تم إنشاء الطلب', subtitle: item.customerName, time: item.time, status: 'COMPLETED', current: false },
      { title: 'الدفع', subtitle: item.paymentMethodLabel, time: item.time, status: item.paymentStatus === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED', current: item.paymentStatus === 'PENDING' },
      { title: 'التنفيذ', subtitle: item.fulfillmentStatus, time: item.lastUpdatedAt, status: item.status === 'CANCELLED' ? 'PENDING' : 'IN_PROGRESS', current: item.status !== 'COMPLETED' && item.status !== 'CANCELLED' },
      { title: 'الإغلاق', subtitle: item.status === 'CANCELLED' ? 'ملغي' : 'بانتظار الإغلاق', time: item.lastUpdatedAt, status: item.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING', current: false }
    ];
  }

  private deriveWorkflowStage(
    status: OrderStatus,
    paymentStatus: OrderPaymentStatus,
    fulfillmentStatus: OrderFulfillmentStatus,
    hasActiveIssue: boolean,
    operationalCase: OrderOperationalCase | null
  ): OrderWorkflowStage {
    if (operationalCase && operationalCase.status !== 'CLOSED') {
      return operationalCase.type === 'REFUND' ? 'REFUND_REVIEW' : 'ISSUE_REVIEW';
    }
    if (status === 'COMPLETED') {
      return 'CLOSED';
    }
    if (status === 'CANCELLED') {
      return paymentStatus === 'REFUNDED' || paymentStatus === 'PARTIALLY_REFUNDED' ? 'REFUND_REVIEW' : 'CANCELLED';
    }
    if (paymentStatus === 'FAILED' || paymentStatus === 'PENDING' || paymentStatus === 'COD_PENDING') {
      return 'PAYMENT_REVIEW';
    }
    if (paymentStatus === 'REFUNDED' || paymentStatus === 'PARTIALLY_REFUNDED') {
      return 'REFUND_REVIEW';
    }
    if (fulfillmentStatus === 'FAILED' || hasActiveIssue) {
      return 'ISSUE_REVIEW';
    }
    if (fulfillmentStatus === 'QUEUED' || fulfillmentStatus === 'PREPARING' || fulfillmentStatus === 'READY_FOR_PICKUP') {
      return 'PREPARATION';
    }
    if (fulfillmentStatus === 'DRIVER_ASSIGNED' || fulfillmentStatus === 'PICKED_UP' || fulfillmentStatus === 'ON_ROUTE') {
      return 'DISPATCH';
    }
    return status === 'DELIVERED' ? 'READY_TO_CLOSE' : 'PREPARATION';
  }

  private deriveResolutionState(
    status: OrderStatus,
    isLate: boolean,
    hasActiveIssue: boolean,
    paymentStatus: OrderPaymentStatus,
    fulfillmentStatus: OrderFulfillmentStatus,
    operationalCase: OrderOperationalCase | null
  ): OrderResolutionState {
    if (operationalCase?.status === 'OPEN') {
      return 'ACTION_REQUIRED';
    }
    if (operationalCase?.status === 'RESOLVED') {
      return 'MONITORING';
    }
    if (status === 'COMPLETED' || (status === 'CANCELLED' && !hasActiveIssue)) {
      return 'RESOLVED';
    }
    if (hasActiveIssue || isLate || paymentStatus === 'FAILED' || paymentStatus === 'PENDING' || paymentStatus === 'COD_PENDING' || fulfillmentStatus === 'FAILED') {
      return 'ACTION_REQUIRED';
    }
    return 'MONITORING';
  }

  private deriveNextAction(
    status: OrderStatus,
    paymentStatus: OrderPaymentStatus,
    fulfillmentStatus: OrderFulfillmentStatus,
    operationalCase: OrderOperationalCase | null,
    cancellationReason?: string | null
  ): string {
    if (operationalCase?.status === 'OPEN') {
      return operationalCase.type === 'REFUND'
        ? 'ORDERS.WORKFLOW.NEXT_ACTIONS.REVIEW_REFUND'
        : operationalCase.type === 'DISPUTE'
          ? 'ORDERS.WORKFLOW.NEXT_ACTIONS.REVIEW_DISPUTE'
          : 'ORDERS.WORKFLOW.NEXT_ACTIONS.REVIEW_ISSUE';
    }
    if (operationalCase?.status === 'RESOLVED') {
      return 'ORDERS.WORKFLOW.NEXT_ACTIONS.CLOSE_OPERATIONAL_CASE';
    }
    if (status === 'COMPLETED') {
      return 'ORDERS.WORKFLOW.NEXT_ACTIONS.NO_OPEN_ACTION';
    }
    if (status === 'CANCELLED') {
      return cancellationReason
        ? 'ORDERS.WORKFLOW.NEXT_ACTIONS.DOCUMENT_CANCELLATION_CLOSURE'
        : 'ORDERS.WORKFLOW.NEXT_ACTIONS.COMPLETE_REFUND_REVIEW';
    }
    if (paymentStatus === 'FAILED' || paymentStatus === 'PENDING') {
      return 'ORDERS.WORKFLOW.NEXT_ACTIONS.REVIEW_PAYMENT';
    }
    if (paymentStatus === 'COD_PENDING') {
      return status === 'DELIVERED' || fulfillmentStatus === 'DELIVERED'
        ? 'ORDERS.WORKFLOW.NEXT_ACTIONS.CONFIRM_COD_COLLECTION'
        : 'ORDERS.WORKFLOW.NEXT_ACTIONS.MONITOR_COD_DELIVERY';
    }
    if (paymentStatus === 'REFUNDED' || paymentStatus === 'PARTIALLY_REFUNDED') {
      return 'ORDERS.WORKFLOW.NEXT_ACTIONS.COMPLETE_REFUND_REVIEW';
    }
    if (fulfillmentStatus === 'QUEUED' || fulfillmentStatus === 'PREPARING') {
      return 'ORDERS.WORKFLOW.NEXT_ACTIONS.MONITOR_PREPARATION';
    }
    if (fulfillmentStatus === 'READY_FOR_PICKUP') {
      return 'ORDERS.WORKFLOW.NEXT_ACTIONS.ASSIGN_DRIVER';
    }
    if (fulfillmentStatus === 'DRIVER_ASSIGNED' || fulfillmentStatus === 'PICKED_UP' || fulfillmentStatus === 'ON_ROUTE') {
      return 'ORDERS.WORKFLOW.NEXT_ACTIONS.MONITOR_DELIVERY';
    }
    return status === 'DELIVERED'
      ? 'ORDERS.WORKFLOW.NEXT_ACTIONS.CLOSE_ORDER'
      : 'ORDERS.WORKFLOW.NEXT_ACTIONS.NO_OPEN_ACTION';
  }

  private upsertCache(order: OrderDetail): void {
    this.ordersCache.set(this.normalizeOrderId(order.id), this.clone(order));
  }

  private normalizeOrderId(id: string): string {
    return id.replace('#', '').trim();
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }

  private formatDateTime(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(parsed);
  }

  private buildEmptyOrder(id: string): OrderDetail {
    return this.toDetailStub({
      id,
      displayId: `#${id}`,
      customerName: '',
      customerPhone: '',
      merchantName: '',
      merchantBranch: '',
      date: '',
      time: '',
      status: 'NEW',
      paymentStatus: 'PENDING',
      fulfillmentStatus: 'QUEUED',
      paymentMethodLabel: '',
      workflowStage: 'PAYMENT_REVIEW',
      nextActionLabel: 'ORDERS.WORKFLOW.NEXT_ACTIONS.REVIEW_PAYMENT',
      resolutionState: 'MONITORING',
      operationalCase: null,
      lastUpdatedAt: '',
      total: 0,
      isLate: false,
      hasActiveIssue: false,
      cancellationReason: null
    });
  }
}
