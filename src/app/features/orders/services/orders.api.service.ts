import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import {
 CustomerAddressOption,
 DriverAssignmentForm,
 DriverCandidate,
 OrderActivity,
 OrderCancellationForm,
 OrderCancellationSummary,
 OrderDetail,
 OrderDispatchState,
 OrderDisputeAttachment,
 OrderDisputeForm,
 OrderFilterOptions,
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
 PaginatedOrdersResponse,
 OrderDeliveryBreakdown,
 OrderFulfillmentType,
 PickupBranchInfo,
 PickupOtpStatus,
 ConvertToDeliveryReason
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
 dispatchReasonAr?: string;
 dispatchReasonEn?: string;
 paymentMethodLabel: string;
 lastUpdatedAtUtc: string;
 total: number;
 isLate: boolean;
 hasActiveIssue: boolean;
 cancellationReason?: string | null;
 operationalCase: OrderOperationalCase | null;
}

interface AdminOrderDetailResponse extends AdminOrderListItemResponse {
 fulfillmentType?: string;
 pickupOtpStatus?: string;
 pickupOtpFailedAttempts?: number;
 pickupOtpLockedUntilUtc?: string | null;
 pickupNoShowDeadlineUtc?: string | null;
 pickupBranch?: { name?: string; address?: string; hoursToday?: string } | null;
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
 dispatchReasonAr?: string;
 dispatchReasonEn?: string;
 supportSummary: string;
 alertLabel: string;
 subtotal: number;
 deliveryFee: number;
 tax: number;
 items: Array<{
 name: string;
 nameAr?: string;
 nameEn?: string;
 brand: string;
 quantity: string;
 price: number;
 total: number;
 icon: string;
 sku: string;
 imageUrl?: string | null;
 variantDisplaySize?: string | null;
 packageTypeName?: string | null;
 measurementValue?: number | null;
 measurementUnitName?: string | null;
 }>;
 timeline: OrderTimelineItem[];
 activities: OrderActivity[];
 driverCandidates: DriverCandidate[];
 candidateScoreBreakdown?: string[];
 cancellationSummary: OrderCancellationSummary | null;
 customerGeo?: { latitude: number; longitude: number } | null;
 merchantGeo?: { latitude: number; longitude: number } | null;
 driverLiveLocation?: { latitude: number; longitude: number; accuracyMeters?: number; recordedAtUtc?: string } | null;
 deliveryBreakdown?: OrderDeliveryBreakdown;
}

@Injectable({
 providedIn: 'root'
})
export class OrdersService {
 private readonly apiUrl = `${environment.apiUrl}/admin/orders`;
 private readonly filesUrl = `${environment.apiUrl}/files`;
 private ordersCache = new Map<string, OrderDetail>();

 constructor(private readonly http: HttpClient) {}

 getFilterOptions(): Observable<OrderFilterOptions> {
 return this.http.get<OrderFilterOptions>(`${this.apiUrl}/filter-options`);
 }

 getOrders(query: OrderListQuery): Observable<PaginatedOrdersResponse> {
 let params = new HttpParams().set('page', String(Math.max(1, query.page || 1))).set('pageSize', String(Math.max(1, query.pageSize || 10)));

 if (query.searchTerm?.trim()) {
 params = params.set('search', query.searchTerm.trim());
 }

 if (query.status && query.status!== 'ALL') {
 params = params.set('status', query.status);
 }

 if (query.paymentStatus && query.paymentStatus!== 'ALL') {
 params = params.set('paymentStatus', query.paymentStatus);
 }

 if (query.fulfillmentStatus && query.fulfillmentStatus!== 'ALL') {
 params = params.set('fulfillmentStatus', query.fulfillmentStatus);
 }

 if (query.queueView && query.queueView!== 'ALL') {
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

 uploadDisputeEvidence(file: File): Observable<OrderDisputeAttachment> {
 const formData = new FormData();
 formData.append('file', file);
 formData.append('directory', 'uploads/orders/disputes/evidence');

 return this.http.post<{ url?: string; Url?: string }>(`${this.filesUrl}/upload`, formData).pipe(
 map((response) => {
 const fileUrl = (response.url ?? response.Url ?? '').trim();
 if (!fileUrl || fileUrl.startsWith('blob:')) {
 throw new Error('Dispute evidence upload did not return a valid URL.');
 }

 return {
 fileName: file.name,
 fileUrl
 };
 })
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

 convertToDelivery(
 id: string,
 customerAddressId: string,
 reason: ConvertToDeliveryReason = 'AdminOverride'
 ): Observable<{ orderId: string; converted: boolean; status: string; message: string; paymentSessionUrl?: string | null }> {
 return this.http.post<{
 orderId: string;
 converted: boolean;
 status: string;
 message: string;
 paymentSessionUrl?: string | null;
 }>(`${this.apiUrl}/${this.normalizeOrderId(id)}/convert-to-delivery`, { customerAddressId, reason });
 }

 private mapListItem(item: AdminOrderListItemResponse): OrderListItem {
 return {
 id: item.id,
 displayId: item.displayId,
 customerName: this.fixEncoding(item.customerName),
 customerPhone: item.customerPhone,
 merchantName: this.fixEncoding(item.merchantName),
 merchantBranch: this.fixEncoding(item.merchantBranch),
 date: item.date,
 time: item.time,
 status: item.status,
 paymentStatus: item.paymentStatus,
 fulfillmentStatus: item.fulfillmentStatus,
 fulfillmentType: this.mapFulfillmentType((item as AdminOrderDetailResponse).fulfillmentType),
 dispatchState: item.dispatchState,
 dispatchReasonAr: this.fixEncoding(item.dispatchReasonAr),
 dispatchReasonEn: this.fixEncoding(item.dispatchReasonEn),
 paymentMethodLabel: this.fixEncoding(item.paymentMethodLabel),
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
 const raw = item as AdminOrderDetailResponse & Record<string, unknown>;

 return {...listItem,
 fulfillmentType: this.mapFulfillmentType(item.fulfillmentType ?? raw['fulfillmentType'] ?? raw['FulfillmentType']),
 pickupOtpStatus: this.mapPickupOtpStatus(
 item.pickupOtpStatus ?? raw['pickupOtpStatus'] ?? raw['PickupOtpStatus'] ?? raw['customerPickupOtpStatus'] ?? raw['CustomerPickupOtpStatus'],
 item.pickupOtpLockedUntilUtc ?? raw['pickupOtpLockedUntilUtc'] ?? raw['PickupOtpLockedUntilUtc']
 ),
 pickupOtpFailedAttempts: Number(item.pickupOtpFailedAttempts ?? raw['pickupOtpFailedAttempts'] ?? raw['PickupOtpFailedAttempts'] ?? 0) || undefined,
 pickupOtpLockedUntilUtc: this.toOptionalUtcString(item.pickupOtpLockedUntilUtc ?? raw['pickupOtpLockedUntilUtc'] ?? raw['PickupOtpLockedUntilUtc']),
 pickupNoShowDeadlineUtc: this.toOptionalUtcString(item.pickupNoShowDeadlineUtc ?? raw['pickupNoShowDeadlineUtc'] ?? raw['PickupNoShowDeadlineUtc']),
 pickupBranch: this.mapPickupBranch(item.pickupBranch ?? raw['pickupBranch'] ?? raw['PickupBranch']),
 customerAddresses: this.mapCustomerAddresses(raw['customerAddresses'] ?? raw['CustomerAddresses']),
 customerEmail: item.customerEmail,
 customerAddress: this.fixEncoding(item.customerAddress),
 merchantLocation: this.fixEncoding(item.merchantLocation),
 driverName: this.fixEncoding(item.driverName),
 driverPhone: item.driverPhone,
 driverVehicleLabel: this.fixEncoding(item.driverVehicleLabel),
 driverPlateNumber: item.driverPlateNumber,
 city: this.fixEncoding(item.city),
 district: this.fixEncoding(item.district),
 slaScore: item.slaScore,
 expectedDeliveryWindow: item.expectedDeliveryWindow,
 transactionRef: item.transactionRef,
 paymentStatusNote: this.fixEncoding(item.paymentStatusNote),
 fulfillmentStatusNote: this.fixEncoding(item.fulfillmentStatusNote),
 dispatchState: item.dispatchState,
 dispatchReasonAr: this.fixEncoding(item.dispatchReasonAr),
 dispatchReasonEn: this.fixEncoding(item.dispatchReasonEn),
 supportSummary: this.fixEncoding(item.supportSummary),
 alertLabel: this.fixEncoding(item.alertLabel),
 subtotal: item.subtotal,
 deliveryFee: item.deliveryFee,
 tax: item.tax,
 items: item.items.map((orderItem) => ({...orderItem,
 name: this.fixEncoding(orderItem.name),
 nameAr: this.fixEncoding(orderItem.nameAr),
 nameEn: this.fixEncoding(orderItem.nameEn),
 brand: this.fixEncoding(orderItem.brand),
 imageUrl: orderItem.imageUrl ?? undefined,
 variantDisplaySize: this.fixEncoding(orderItem.variantDisplaySize ?? undefined),
 packageTypeName: this.fixEncoding(orderItem.packageTypeName ?? undefined),
 measurementValue: orderItem.measurementValue ?? undefined,
 measurementUnitName: this.fixEncoding(orderItem.measurementUnitName ?? undefined)
 })),
 timeline: item.timeline.map((step) => ({
 titleAr: this.fixEncoding(step.titleAr),
 titleEn: this.fixEncoding(step.titleEn),
 subtitleAr: this.fixEncoding(step.subtitleAr),
 subtitleEn: this.fixEncoding(step.subtitleEn),
 time: step.time,
 status: step.status,
 current: step.current
 })),
 activities: item.activities,
 driverCandidates: item.driverCandidates,
 candidateScoreBreakdown: item.candidateScoreBreakdown ?? [],
 cancellationSummary: item.cancellationSummary,
 customerGeo: item.customerGeo ?? null,
 merchantGeo: item.merchantGeo ?? null,
 driverLiveLocation: item.driverLiveLocation ?? null,
 deliveryBreakdown: item.deliveryBreakdown
 };
 }

 private toDetailStub(item: OrderListItem): OrderDetail {
 return {...item,
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
 dispatchReasonAr: item.dispatchReasonAr,
 dispatchReasonEn: item.dispatchReasonEn,
 supportSummary: item.hasActiveIssue ? 'الطلب بحاجة إلى مراجعة تشغيلية.' : 'ما فيه حالة دعم نشطة.',
 alertLabel: item.operationalCase?.title || (item.isLate ? 'الطلب متأخر عن وقت التسليم' : 'مسار الطلب سليم'),
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
 const closureSubtitleKey = item.status === 'CANCELLED'
 ? 'ORDERS.DETAIL.TIMELINE_STEPS.TITLES.CANCELLED'
 : 'ORDERS.DETAIL.TIMELINE_STEPS.SUBTITLES.AWAITING_CLOSURE';

 return [
 {
 titleAr: 'ORDERS.DETAIL.TIMELINE_STEPS.TITLES.ORDER_CREATED',
 titleEn: 'ORDERS.DETAIL.TIMELINE_STEPS.TITLES.ORDER_CREATED',
 subtitleAr: item.customerName,
 subtitleEn: item.customerName,
 time: item.time,
 status: 'COMPLETED',
 current: false
 },
 {
 titleAr: 'ORDERS.DETAIL.TIMELINE_STEPS.TITLES.PAYMENT',
 titleEn: 'ORDERS.DETAIL.TIMELINE_STEPS.TITLES.PAYMENT',
 subtitleAr: item.paymentMethodLabel,
 subtitleEn: item.paymentMethodLabel,
 time: item.time,
 status: item.paymentStatus === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED',
 current: item.paymentStatus === 'PENDING'
 },
 {
 titleAr: 'ORDERS.DETAIL.TIMELINE_STEPS.TITLES.FULFILLMENT',
 titleEn: 'ORDERS.DETAIL.TIMELINE_STEPS.TITLES.FULFILLMENT',
 subtitleAr: `ORDERS.FULFILLMENT_STATUS.${item.fulfillmentStatus}`,
 subtitleEn: `ORDERS.FULFILLMENT_STATUS.${item.fulfillmentStatus}`,
 time: item.lastUpdatedAt,
 status: item.status === 'CANCELLED' ? 'PENDING' : 'IN_PROGRESS',
 current: item.status!== 'COMPLETED' && item.status!== 'CANCELLED'
 },
 {
 titleAr: 'ORDERS.DETAIL.TIMELINE_STEPS.TITLES.CLOSURE',
 titleEn: 'ORDERS.DETAIL.TIMELINE_STEPS.TITLES.CLOSURE',
 subtitleAr: closureSubtitleKey,
 subtitleEn: closureSubtitleKey,
 time: item.lastUpdatedAt,
 status: item.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
 current: false
 }
 ];
 }

 private deriveWorkflowStage(
 status: OrderStatus,
 paymentStatus: OrderPaymentStatus,
 fulfillmentStatus: OrderFulfillmentStatus,
 hasActiveIssue: boolean,
 operationalCase: OrderOperationalCase | null
 ): OrderWorkflowStage {
 if (operationalCase && operationalCase.status!== 'CLOSED') {
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
 if (status === 'COMPLETED' || (status === 'CANCELLED' &&!hasActiveIssue)) {
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
 return 'ORDERS.WORKFLOW.NEXT_ACTIONS.FOLLOW_PREPARATION';
 }
 if (fulfillmentStatus === 'READY_FOR_PICKUP') {
 return 'ORDERS.WORKFLOW.NEXT_ACTIONS.ASSIGN_OR_START_PICKUP';
 }
 if (fulfillmentStatus === 'DRIVER_ASSIGNED' || fulfillmentStatus === 'PICKED_UP' || fulfillmentStatus === 'ON_ROUTE') {
 return 'ORDERS.WORKFLOW.NEXT_ACTIONS.MONITOR_DELIVERY';
 }
 return status === 'DELIVERED'
 ? 'ORDERS.WORKFLOW.NEXT_ACTIONS.CLOSE_AFTER_CONFIRMATION'
 : 'ORDERS.WORKFLOW.NEXT_ACTIONS.NO_OPEN_ACTION';
 }

 private upsertCache(order: OrderDetail): void {
 this.ordersCache.set(this.normalizeOrderId(order.id), this.clone(order));
 }

 private mapFulfillmentType(value: unknown): OrderFulfillmentType | undefined {
 if (value === null || value === undefined || value === '') {
 return undefined;
 }

 return String(value).trim().toLowerCase() === 'pickup' ? 'Pickup' : 'Delivery';
 }

 private mapPickupOtpStatus(value: unknown, lockedUntil: unknown): PickupOtpStatus | undefined {
 if (lockedUntil) {
 const lockMs = new Date(String(lockedUntil)).getTime();
 if (!Number.isNaN(lockMs) && lockMs > Date.now()) {
 return 'locked';
 }
 }

 if (value === null || value === undefined || value === '') {
 return undefined;
 }

 const normalized = String(value).trim().toLowerCase();
 if (normalized === 'verified' || normalized === 'pending' || normalized === 'not_available' || normalized === 'not_applicable') {
 return normalized as PickupOtpStatus;
 }

 return undefined;
 }

 private mapPickupBranch(value: unknown): PickupBranchInfo | undefined {
 const raw = value as { name?: string; address?: string; hoursToday?: string; Name?: string; Address?: string; HoursToday?: string } | null | undefined;
 if (!raw) {
 return undefined;
 }

 const name = String(raw.name ?? raw.Name ?? '').trim();
 const address = String(raw.address ?? raw.Address ?? '').trim();
 if (!name && !address) {
 return undefined;
 }

 return {
 name,
 address,
 hoursToday: (raw.hoursToday ?? raw.HoursToday) ? String(raw.hoursToday ?? raw.HoursToday) : undefined
 };
 }

 private mapCustomerAddresses(value: unknown): CustomerAddressOption[] {
 if (!Array.isArray(value)) {
 return [];
 }

 return value
 .map((entry) => {
 const item = entry as {
 id?: string;
 Id?: string;
 label?: string;
 Label?: string;
 addressText?: string;
 AddressText?: string;
 };
 const id = String(item.id ?? item.Id ?? '').trim();
 if (!id) {
 return null;
 }

 return {
 id,
 label: String(item.label ?? item.Label ?? 'Address'),
 addressText: String(item.addressText ?? item.AddressText ?? '')
 };
 })
 .filter((item): item is CustomerAddressOption => item !== null);
 }

 private toOptionalUtcString(value: unknown): string | undefined {
 if (value === null || value === undefined || value === '') {
 return undefined;
 }

 return String(value);
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

 return new Intl.DateTimeFormat('ar-SA', { timeZone: 'Asia/Riyadh',
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

 private fixEncoding(text: string | null | undefined): string {
 if (!text) return '';
 try {
 if (/[\u0080-\u00FF]/.test(text)) {
 const bytes = new Uint8Array(text.length);
 for (let i = 0; i < text.length; i++) {
 bytes[i] = text.charCodeAt(i);
 }
 return new TextDecoder('utf-8').decode(bytes);
 }
 return text;
 } catch {
 return text;
 }
 }
}
