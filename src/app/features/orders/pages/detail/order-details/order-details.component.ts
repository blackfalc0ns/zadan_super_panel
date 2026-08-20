import { Component, HostListener, NgZone, OnDestroy, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, interval, switchMap } from 'rxjs';
import { OrderCancellationModalComponent } from '../../../components/order-cancellation-modal/order-cancellation-modal.component';
import { OrderDriverAssignmentModalComponent } from '../../../components/order-driver-assignment-modal/order-driver-assignment-modal.component';
import { OrderDisputeModalComponent } from '../../../components/order-dispute-modal/order-dispute-modal.component';
import { OrderIssueFlagModalComponent } from '../../../components/order-issue-flag-modal/order-issue-flag-modal.component';
import { OrderRefundModalComponent } from '../../../components/order-refund-modal/order-refund-modal.component';
import { OrderStatusUpdateModalComponent } from '../../../components/order-status-update-modal/order-status-update-modal.component';
import { InlineBannerComponent } from '../../../../../shared/components/ui/inline-banner/inline-banner.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { SectionHeaderComponent } from '../../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import { OrderTrackingMapComponent } from '../../../components/order-tracking-map/order-tracking-map.component';
import { FinanceService, OrderFinancialBreakdown } from '@finances/public-api';
import { OrdersService } from '@orders/services/orders.api.service';
import { AccessService } from '../../../../../core/services/access.service';
import { environment } from '../../../../../../environments/environment';
import {
 OrderTrackingDriverLocation,
 OrderTrackingRealtimeService,
 OrderTrackingStatusChangedPayload
} from '@orders/services/order-tracking-realtime.service';
import {
 DriverAssignmentForm,
 OrderCancellationForm,
 OrderDetail,
 OrderDisputeForm,
 OrderFulfillmentStatus,
 OrderIssueFlagForm,
 OrderOperationalCase,
 OrderPaymentStatus,
 OrderResolutionState,
 OrderRefundForm,
 OrderStatus,
 OrderStatusUpdateForm,
 OrderTimelineItem,
 ConvertToDeliveryReason
} from '../../../models/orders.models';
import {
 getFulfillmentStatusKey,
 getOperationalCaseStatusKey,
 getOperationalCaseTypeKey,
 getOrderStatusKey,
 getPaymentStatusKey,
 getResolutionStateKey,
 getWorkflowStageKey
} from '../../../data/orders.mock';
import { resolveOrderTimelineStepIcon, resolveOrderTimelineTextKey } from '../../../utils/order-timeline-i18n';
import { ToastService } from '../../../../../shared/services/toast.service';
import { describeApiError } from '../../../../../shared/utils/api-error.util';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-order-details',
 standalone: true,
 imports: [
 CommonModule,
 FormsModule,
 TranslateModule,
 RouterModule,
 OrderStatusUpdateModalComponent,
 OrderDriverAssignmentModalComponent,
 OrderCancellationModalComponent,
 OrderRefundModalComponent,
 OrderDisputeModalComponent,
 OrderIssueFlagModalComponent,
 SectionHeaderComponent,
 StatusPillComponent,
 InlineBannerComponent,
 KeyValueGridComponent,
 OrderTrackingMapComponent
 ],
 templateUrl: './order-details.component.html',
 styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
 private readonly cdr = inject(ChangeDetectorRef);
 readonly orderId = signal<string | null>(null);
 readonly order = signal<OrderDetail | null>(null);
 readonly financialBreakdown = signal<OrderFinancialBreakdown | null>(null);
 // SignalR supplies immediate changes; this is only a resilience fallback.
 private readonly trackingPollIntervalMs = 30000;
 private pollSub: Subscription | null = null;
 private fragmentSub: Subscription | null = null;
 private driverLocationSub: Subscription | null = null;
 private statusChangeSub: Subscription | null = null;
 private countdownSub: Subscription | null = null;
 private langChangeSub: Subscription | null = null;
 private trackedOrderId: string | null = null;

 isLoading = false;
 errorMessage = '';
 showConvertModal = false;
 convertAddressId = '';
 isConvertingToDelivery = false;
 noShowRemainingMs = 0;

 isStatusModalOpen = false;
 isDriverAssignmentModalOpen = false;
 isCancellationModalOpen = false;
 isRefundModalOpen = false;
 isDisputeModalOpen = false;
 isIssueFlagModalOpen = false;
 isSubmittingDispute = false;
 isSubmittingDriverAssignment = false;
 isSubmittingCancellation = false;
 isSubmittingStatusUpdate = false;
 isSubmittingRefund = false;
 isSubmittingIssueFlag = false;
 isSubmittingOperationalCase = false;
 isRecomputingDispatch = false;
 disputeDraft: OrderDisputeForm | null = null;

 constructor(
 private readonly route: ActivatedRoute,
 private readonly ordersService: OrdersService,
 private readonly financeService: FinanceService,
 private readonly accessService: AccessService,
 private readonly orderTrackingRealtime: OrderTrackingRealtimeService,
 private readonly zone: NgZone,
 private readonly translate: TranslateService,
 private readonly toastService: ToastService
 ) {}

 get currentLang(): string {
 return this.translate.currentLang || 'ar';
 }

 ngOnInit(): void {
 const id = this.route.snapshot.paramMap.get('id');
 this.orderId.set(id);
 this.loadOrderDetails();

 this.langChangeSub = this.translate.onLangChange.subscribe(() => {
 this.cdr.markForCheck();
 });

 this.fragmentSub = this.route.fragment.subscribe((fragment) => {
 this.cdr.markForCheck();
 if (fragment === 'tracking') {
 this.scrollToTracking();
 }
 });
 }

 ngOnDestroy(): void {
 this.stopPolling();
 this.stopRealtimeTracking();
 this.stopCountdown();
 this.fragmentSub?.unsubscribe();
 this.langChangeSub?.unsubscribe();
 }

 get fulfillmentTypeLabel(): string {
 const currentOrder = this.order();
 const type = currentOrder?.fulfillmentType ?? this.normalizeFulfillmentType(this.financialBreakdown()?.fulfillmentType);
 if (!type) {
 return '';
 }

 return type === 'Pickup' ? 'ORDERS.FULFILLMENT_TYPE.PICKUP' : 'ORDERS.FULFILLMENT_TYPE.DELIVERY';
 }

 get pickupOtpStatusLabel(): string {
 const status = this.order()?.pickupOtpStatus;
 if (!status) {
 return 'ORDERS.PICKUP.OTP_STATUS.UNKNOWN';
 }

 return `ORDERS.PICKUP.OTP_STATUS.${status.toUpperCase()}`;
 }

 isPickupOrder(): boolean {
 const currentOrder = this.order();
 const type = currentOrder?.fulfillmentType ?? this.normalizeFulfillmentType(this.financialBreakdown()?.fulfillmentType);
 return type === 'Pickup';
 }

 canConvertToDelivery(): boolean {
 const currentOrder = this.order();
 if (!currentOrder || !this.isPickupOrder() || this.isOrderTerminal) {
 return false;
 }

 return currentOrder.paymentStatus === 'PAID';
 }

 openConvertModal(): void {
 const addresses = this.order()?.customerAddresses ?? [];
 this.convertAddressId = addresses[0]?.id ?? '';
 this.showConvertModal = true;
 }

 closeConvertModal(): void {
 if (this.isConvertingToDelivery) {
 return;
 }

 this.showConvertModal = false;
 }

 submitConvertToDelivery(): void {
 const id = this.orderId();
 if (!id || !this.convertAddressId.trim() || this.isConvertingToDelivery) {
 return;
 }

 this.isConvertingToDelivery = true;
 this.ordersService.convertToDelivery(id, this.convertAddressId.trim(), 'AdminOverride').subscribe({
 next: () => {
 this.isConvertingToDelivery = false;
 this.showConvertModal = false;
 this.loadOrderDetails();
 },
 error: (error) => {
 this.isConvertingToDelivery = false;
 this.showApiError(error, 'ORDERS.ERRORS.CONVERT_TO_DELIVERY');
 this.cdr.markForCheck();
 }
 });
 }

 formatCountdown(remainingMs: number): string {
 if (remainingMs <= 0) {
 return this.translate.instant('ORDERS.PICKUP.NO_SHOW_EXPIRED');
 }

 const totalSeconds = Math.ceil(remainingMs / 1000);
 const hours = Math.floor(totalSeconds / 3600);
 const minutes = Math.floor((totalSeconds % 3600) / 60);
 const seconds = totalSeconds % 60;

 if (hours > 0) {
 return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
 }

 return `${minutes}:${String(seconds).padStart(2, '0')}`;
 }

 get orderStatusLabel(): string {
 const currentOrder = this.order();
 return currentOrder ? getOrderStatusKey(currentOrder.status) : '';
 }

 get paymentStatusLabel(): string {
 const currentOrder = this.order();
 return currentOrder ? getPaymentStatusKey(currentOrder.paymentStatus) : '';
 }

 get fulfillmentStatusLabel(): string {
 const currentOrder = this.order();
 return currentOrder ? getFulfillmentStatusKey(currentOrder.fulfillmentStatus) : '';
 }

 get workflowStageLabel(): string {
 const currentOrder = this.order();
 return currentOrder ? getWorkflowStageKey(currentOrder.workflowStage) : '';
 }

 get resolutionStateLabel(): string {
 const currentOrder = this.order();
 return currentOrder ? getResolutionStateKey(currentOrder.resolutionState) : '';
 }

 getVehicleTypeLabel(label: string | undefined): string {
 if (!label) return '';
 if (/[\u0600-\u06FF]/.test(label)) {
 return label;
 }
 const cleanKey = label.trim().toUpperCase().replace(/\s+/g, '_');
 return `ORDERS.DETAIL.VEHICLE_TYPES.${cleanKey}`;
 }

 getCityLabel(city: string | undefined): string {
 if (!city) return '';
 if (/[\u0600-\u06FF]/.test(city)) {
 return city;
 }
 const cleanKey = city.trim().toUpperCase();
 return `COMMON.CITIES.${cleanKey}`;
 }

 get operationalCase(): OrderOperationalCase | null {
 return this.order()?.operationalCase || null;
 }

 get operationalCaseTypeLabel(): string {
 return this.operationalCase ? getOperationalCaseTypeKey(this.operationalCase.type) : '';
 }

 get operationalCaseStatusLabel(): string {
 return this.operationalCase ? getOperationalCaseStatusKey(this.operationalCase.status) : '';
 }

 get canResolveOperationalCase(): boolean {
 return this.operationalCase?.status === 'OPEN';
 }

 get canCloseOperationalCase(): boolean {
 return this.operationalCase?.status === 'RESOLVED';
 }

 get canReopenOperationalCase(): boolean {
 return this.operationalCase?.status === 'RESOLVED' || this.operationalCase?.status === 'CLOSED';
 }

 get canOpenIssueTools(): boolean {
 return!this.operationalCase || this.operationalCase.status === 'CLOSED';
 }

 get canEditOrders(): boolean {
 return this.accessService.hasPermission('orders.edit');
 }

 get canViewDisputesCenter(): boolean {
 return this.accessService.hasPermission('disputes.view');
 }

 get canEditDisputes(): boolean {
 return this.accessService.hasPermission('disputes.edit');
 }

 get canApproveDisputes(): boolean {
 return this.accessService.hasPermission('disputes.approve');
 }

 get canOpenRefund(): boolean {
 const currentOrder = this.order();

 if (!currentOrder) {
 return false;
 }

 const paymentBlocked = currentOrder.paymentStatus === 'FAILED' || currentOrder.paymentStatus === 'PENDING';
 return!paymentBlocked && this.canOpenIssueTools && this.canEditDisputes;
 }

 get canOpenIssueCase(): boolean {
 return this.canOpenIssueTools && this.canEditDisputes;
 }

 get canOpenDisputeCase(): boolean {
 return this.canEditDisputes && (!this.operationalCase || this.operationalCase.status === 'OPEN');
 }

 get canResolveOperationalCaseAction(): boolean {
 return this.canResolveOperationalCase && this.canApproveDisputes;
 }

 get canCloseOperationalCaseAction(): boolean {
 return this.canCloseOperationalCase && this.canApproveDisputes;
 }

 get canReopenOperationalCaseAction(): boolean {
 return this.canReopenOperationalCase && this.canApproveDisputes;
 }

 get supportCaseFocusId(): string | null {
 return this.operationalCase?.caseId ?? null;
 }

 get supportCenterQueryParams(): Record<string, string> {
 const currentOrder = this.order();

 if (this.supportCaseFocusId) {
 return { focus: this.supportCaseFocusId };
 }

 if (currentOrder?.id) {
 return { search: currentOrder.id };
 }

 return {};
 }

 get canRecomputeDispatch(): boolean {
 const currentOrder = this.order();

 return currentOrder?.fulfillmentStatus === 'READY_FOR_PICKUP'
 || currentOrder?.fulfillmentStatus === 'DRIVER_ASSIGNED';
 }

 get isOrderTerminal(): boolean {
 const currentOrder = this.order();
 return currentOrder ? this.isTerminalStatus(currentOrder.status) : false;
 }

 get paymentInfoItems(): KeyValueGridItem[] {
 const currentOrder = this.order();

 if (!currentOrder) {
 return [];
 }

 const feeLabel = this.isPickupOrder()
 ? 'ORDERS.DETAIL.PICKUP_FEE'
 : 'ORDERS.DETAIL.DELIVERY_FEE';

 return [
 { label: 'ORDERS.DETAIL.PAYMENT_METHOD', value: currentOrder.paymentMethodLabel },
 { label: 'ORDERS.DETAIL.TRANSACTION_REF', value: currentOrder.transactionRef, valueDir: 'ltr' },
 {
 label: 'ORDERS.DETAIL.PAYMENT_STATUS_LABEL',
 value: this.paymentStatusLabel,
 valueTone: this.getPaymentStatusTone(currentOrder.paymentStatus),
 translateValue: true
 },
 { label: 'ORDERS.DETAIL.ORDER_SUBTOTAL', value: this.formatCurrency(currentOrder.subtotal), valueDir: 'ltr' },
 { label: feeLabel, value: this.formatCurrency(currentOrder.deliveryFee), valueDir: 'ltr' },
 { label: 'ORDERS.DETAIL.TAX', value: this.formatCurrency(currentOrder.tax), valueDir: 'ltr' }
 ];
 }

 pricingModeLabel(mode: string | null | undefined): string {
 const normalized = (mode || 'UNKNOWN')
 .trim()
 .toUpperCase()
 .replace(/[-\s]+/g, '_');
 const key = `ORDERS.DETAIL.DELIVERY_BREAKDOWN_VALUES.${normalized}`;
 const translated = this.translate.instant(key);
 return translated === key ? 'ORDERS.DETAIL.DELIVERY_BREAKDOWN_VALUES.UNKNOWN' : key;
 }

 getDispatchReasonItem(reasonAr: string | undefined, reasonEn: string | undefined): { value: string; translate: boolean } | null {
 const value = this.resolveLocalizedLabel(reasonAr, reasonEn);
 if (!value) {
 return null;
 }

 return { value, translate: false };
 }

 resolveLocalizedLabel(labelAr?: string | null, labelEn?: string | null): string {
 const lang = (this.translate.currentLang || this.translate.defaultLang || 'ar').toLowerCase();
 const primary = lang.startsWith('ar') ? labelAr : labelEn;
 const fallback = lang.startsWith('ar') ? labelEn : labelAr;
 return (primary || fallback || '').trim();
 }

 timelineTitle(step: OrderTimelineItem): string {
 return this.translateTimelinePart(step.titleAr, step.titleEn);
 }

 timelineSubtitle(step: OrderTimelineItem): string {
 return this.translateTimelinePart(step.subtitleAr, step.subtitleEn);
 }

 private translateTimelinePart(labelAr?: string | null, labelEn?: string | null): string {
 const key = resolveOrderTimelineTextKey(labelAr) ?? resolveOrderTimelineTextKey(labelEn);
 if (key) {
 const translated = this.translate.instant(key);
 if (translated && translated !== key) {
 return translated;
 }
 }

 return this.resolveLocalizedLabel(labelAr, labelEn);
 }

 get deliveryInfoItems(): KeyValueGridItem[] {
 const currentOrder = this.order();

 if (!currentOrder) {
 return [];
 }

 return [
 { label: 'ORDERS.DETAIL.EXPECTED_TIME', value: currentOrder.expectedDeliveryWindow },
 {
 label: 'ORDERS.DETAIL.FULFILLMENT_STATUS',
 value: this.fulfillmentStatusLabel,
 valueTone: this.getFulfillmentStatusTone(currentOrder.fulfillmentStatus),
 translateValue: true
 },...(currentOrder.dispatchState
 ? [{
 label: 'ORDERS.DETAIL.DISPATCH_STATE',
 value: 'ORDERS.DETAIL.DISPATCH_STATE_VALUES.' + currentOrder.dispatchState,
 translateValue: true
 }]
 : []),...(currentOrder.dispatchReasonAr || currentOrder.dispatchReasonEn
 ? (() => {
 const item = this.getDispatchReasonItem(currentOrder.dispatchReasonAr, currentOrder.dispatchReasonEn);
 return item ? [{ 
 label: 'ORDERS.DETAIL.DISPATCH_NOTE', 
 value: item.value, 
 translateValue: item.translate
 }] : [];
 })()
 : []),
 { label: 'ORDERS.DETAIL.LAST_UPDATED', value: currentOrder.lastUpdatedAt },
 { label: 'ORDERS.DETAIL.SLA_LABEL', value: `${currentOrder.slaScore || 0}%`, valueDir: 'ltr', valueTone: currentOrder.isLate ? 'warning' : 'accent' }
 ];
 }

 loadOrderDetails(): void {
 const id = this.orderId();

 if (!id) {
 this.errorMessage = 'ORDERS.ERRORS.INVALID_ID';
 return;
 }

 this.isLoading = true;
 this.errorMessage = '';
 this.financialBreakdown.set(null);

 this.ordersService.getOrderById(id).subscribe({
 next: (order) => {
 this.cdr.markForCheck();
 this.setOrder(order);
 this.loadFinancialBreakdown(id);
 this.isLoading = false;
 this.scrollToTrackingIfRequested();
 },
 error: (error) => {
 this.cdr.markForCheck();
 console.error('Failed to load order details', error);
 this.errorMessage = 'ORDERS.ERRORS.LOAD_DETAIL';
 this.order.set(null);
 this.financialBreakdown.set(null);
 this.isLoading = false;
 this.stopPolling();
 }
 });
 }

 scrollToSection(sectionId: string): void {
 setTimeout(() => {
 document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
 });
 }

 scrollToTracking(): void {
 this.scrollToSection('tracking');
 }

 timelineStepIcon(step: OrderTimelineItem): string {
 return resolveOrderTimelineStepIcon(step.titleAr, step.titleEn, step.subtitleAr, step.subtitleEn);
 }

 timelineStepIconFilled(step: OrderTimelineItem): boolean {
 return step.status === 'COMPLETED';
 }

 getOrderStatusVariant(status: OrderStatus): StatusPillVariant {
 const variants: Record<OrderStatus, StatusPillVariant> = {
 NEW: 'info',
 PENDING: 'warning',
 IN_PROGRESS: 'processing',
 OUT_FOR_DELIVERY: 'processing',
 DELIVERED: 'success',
 COMPLETED: 'success',
 CANCELLED: 'danger'
 };

 return variants[status];
 }

 getPaymentStatusVariant(status: OrderPaymentStatus): StatusPillVariant {
 const variants: Record<OrderPaymentStatus, StatusPillVariant> = {
 PENDING: 'warning',
 PAID: 'success',
 FAILED: 'danger',
 REFUNDED: 'info',
 PARTIALLY_REFUNDED: 'warning',
 COD_PENDING: 'paused',
 SETTLED: 'success'
 };

 return variants[status];
 }

 getFulfillmentStatusVariant(status: OrderFulfillmentStatus): StatusPillVariant {
 const variants: Record<OrderFulfillmentStatus, StatusPillVariant> = {
 QUEUED: 'neutral',
 PREPARING: 'warning',
 READY_FOR_PICKUP: 'info',
 DRIVER_ASSIGNED: 'processing',
 PICKED_UP: 'processing',
 ON_ROUTE: 'processing',
 DELIVERED: 'success',
 FAILED: 'danger',
 CANCELLED: 'danger'
 };

 return variants[status];
 }

 getResolutionStateVariant(state: OrderResolutionState): StatusPillVariant {
 const variants: Record<OrderResolutionState, StatusPillVariant> = {
 ACTION_REQUIRED: 'danger',
 MONITORING: 'warning',
 RESOLVED: 'success'
 };

 return variants[state];
 }

 getOperationalCaseStatusVariant(status: OrderOperationalCase['status']): StatusPillVariant {
 const variants: Record<OrderOperationalCase['status'], StatusPillVariant> = {
 OPEN: 'danger',
 RESOLVED: 'warning',
 CLOSED: 'success'
 };

 return variants[status];
 }

 getActivityDotClass(tone?: string): string {
 switch (tone) {
 case 'payment':
 return 'bg-blue-500';
 case 'issue':
 return 'bg-red-500';
 case 'note':
 return 'bg-amber-500';
 default:
 return 'bg-zadna-primary';
 }
 }

 openStatusModal(): void {
 this.isStatusModalOpen = true;
 }

 openDriverAssignmentModal(): void {
 this.isDriverAssignmentModalOpen = true;
 }

 openCancellationModal(): void {
 this.isCancellationModalOpen = true;
 }

 openRefundModal(): void {
 if (!this.canOpenRefund) {
 return;
 }

 this.isRefundModalOpen = true;
 }

 openDisputeModal(): void {
 if (!this.canOpenDisputeCase) {
 return;
 }

 const currentOrder = this.order();
 this.disputeDraft = currentOrder ? this.loadDisputeDraft(currentOrder.id) : null;
 this.isDisputeModalOpen = true;
 }

 openIssueFlagModal(): void {
 if (!this.canOpenIssueCase) {
 return;
 }

 this.isIssueFlagModalOpen = true;
 }

 closeStatusModal(): void {
 if (this.isSubmittingStatusUpdate) {
 return;
 }

 this.isStatusModalOpen = false;
 }

 closeDriverAssignmentModal(): void {
 if (this.isSubmittingDriverAssignment) {
 return;
 }

 this.isDriverAssignmentModalOpen = false;
 }

 closeCancellationModal(): void {
 if (this.isSubmittingCancellation) {
 return;
 }

 this.isCancellationModalOpen = false;
 }

 closeRefundModal(): void {
 if (this.isSubmittingRefund) {
 return;
 }

 this.isRefundModalOpen = false;
 }

 closeDisputeModal(): void {
 if (this.isSubmittingDispute) {
 return;
 }

 this.isDisputeModalOpen = false;
 }

 closeIssueFlagModal(): void {
 if (this.isSubmittingIssueFlag) {
 return;
 }

 this.isIssueFlagModalOpen = false;
 }

 resolveOperationalCase(): void {
 if (!this.canResolveOperationalCaseAction) {
 return;
 }

 const id = this.orderId();

 if (!id || this.isSubmittingOperationalCase) {
 return;
 }

 this.isSubmittingOperationalCase = true;
 this.cdr.markForCheck();

 this.ordersService.resolveOperationalCase(id).subscribe({
 next: (order) => {
 this.isSubmittingOperationalCase = false;
 this.cdr.markForCheck();
 this.setOrder(order);
 },
 error: () => {
 this.isSubmittingOperationalCase = false;
 this.cdr.markForCheck();
 }
 });
 }

 closeOperationalCase(): void {
 if (!this.canCloseOperationalCaseAction) {
 return;
 }

 const id = this.orderId();

 if (!id || this.isSubmittingOperationalCase) {
 return;
 }

 this.isSubmittingOperationalCase = true;
 this.cdr.markForCheck();

 this.ordersService.closeOperationalCase(id).subscribe({
 next: (order) => {
 this.isSubmittingOperationalCase = false;
 this.cdr.markForCheck();
 this.setOrder(order);
 },
 error: () => {
 this.isSubmittingOperationalCase = false;
 this.cdr.markForCheck();
 }
 });
 }

 reopenOperationalCase(): void {
 if (!this.canReopenOperationalCaseAction) {
 return;
 }

 const id = this.orderId();

 if (!id || this.isSubmittingOperationalCase) {
 return;
 }

 this.isSubmittingOperationalCase = true;
 this.cdr.markForCheck();

 this.ordersService.reopenOperationalCase(id).subscribe({
 next: (order) => {
 this.isSubmittingOperationalCase = false;
 this.cdr.markForCheck();
 this.setOrder(order);
 },
 error: () => {
 this.isSubmittingOperationalCase = false;
 this.cdr.markForCheck();
 }
 });
 }

 submitStatusUpdate(form: OrderStatusUpdateForm): void {
 const id = this.orderId();

 if (!id || this.isSubmittingStatusUpdate) {
 return;
 }

 this.isSubmittingStatusUpdate = true;
 this.cdr.markForCheck();

 this.ordersService.updateOrderStatus(id, form).subscribe({
 next: (order) => {
 this.isSubmittingStatusUpdate = false;
 this.cdr.markForCheck();
 this.setOrder(order);
 this.loadFinancialBreakdown(id);
 this.closeStatusModal();
 },
 error: (error) => {
 this.isSubmittingStatusUpdate = false;
 this.showApiError(error, 'ORDERS.ERRORS.UPDATE_STATUS');
 this.cdr.markForCheck();
 }
 });
 }

 submitDriverAssignment(form: DriverAssignmentForm): void {
 const id = this.orderId();

 if (!id || this.isSubmittingDriverAssignment) {
 return;
 }

 this.isSubmittingDriverAssignment = true;
 this.cdr.markForCheck();

 this.ordersService.assignDriver(id, form).subscribe({
 next: (order) => {
 this.isSubmittingDriverAssignment = false;
 this.cdr.markForCheck();
 this.setOrder(order);
 this.loadFinancialBreakdown(id);
 this.closeDriverAssignmentModal();
 },
 error: (error) => {
 this.isSubmittingDriverAssignment = false;
 this.showApiError(error, 'ORDERS.ERRORS.ASSIGN_DRIVER');
 this.cdr.markForCheck();
 }
 });
 }

 recomputeDispatch(): void {
 const id = this.orderId();

 if (!id || this.isRecomputingDispatch) {
 return;
 }

 this.isRecomputingDispatch = true;
 this.cdr.markForCheck();

 this.ordersService.recomputeDispatch(id).subscribe({
 next: (order) => {
 this.isRecomputingDispatch = false;
 this.cdr.markForCheck();
 this.setOrder(order);
 this.loadFinancialBreakdown(id);
 },
 error: (error) => {
 this.isRecomputingDispatch = false;
 this.showApiError(error, 'ORDERS.ERRORS.RECOMPUTE_DISPATCH');
 this.cdr.markForCheck();
 }
 });
 }

 submitCancellation(form: OrderCancellationForm): void {
 const id = this.orderId();

 if (!id || this.isSubmittingCancellation) {
 return;
 }

 this.isSubmittingCancellation = true;
 this.cdr.markForCheck();

 this.ordersService.cancelOrder(id, form).subscribe({
 next: (order) => {
 this.isSubmittingCancellation = false;
 this.cdr.markForCheck();
 this.setOrder(order);
 this.loadFinancialBreakdown(id);
 this.closeCancellationModal();
 },
 error: (error) => {
 this.isSubmittingCancellation = false;
 this.showApiError(error, 'ORDERS.ERRORS.CANCEL_ORDER');
 this.cdr.markForCheck();
 }
 });
 }

 saveRefundDraft(form: OrderRefundForm): void {
 void form;
 this.closeRefundModal();
 }

 submitRefund(form: OrderRefundForm): void {
 const id = this.orderId();

 if (!id || this.isSubmittingRefund) {
 return;
 }

 this.isSubmittingRefund = true;
 this.cdr.markForCheck();

 this.ordersService.createRefund(id, form).subscribe({
 next: (order) => {
 this.isSubmittingRefund = false;
 this.cdr.markForCheck();
 this.setOrder(order);
 this.loadFinancialBreakdown(id);
 this.closeRefundModal();
 },
 error: () => {
 this.isSubmittingRefund = false;
 this.cdr.markForCheck();
 }
 });
 }

 saveDisputeDraft(form: OrderDisputeForm): void {
 const id = this.orderId();
 if (id) {
 localStorage.setItem(this.disputeDraftStorageKey(id), JSON.stringify(form));
 this.disputeDraft = form;
 }

 this.closeDisputeModal();
 }

 submitDispute(form: OrderDisputeForm): void {
 const id = this.orderId();

 if (!id || this.isSubmittingDispute) {
 return;
 }

 this.isSubmittingDispute = true;
 this.cdr.markForCheck();

 this.ordersService.openDispute(id, form).subscribe({
 next: (order) => {
 this.isSubmittingDispute = false;
 this.cdr.markForCheck();
 localStorage.removeItem(this.disputeDraftStorageKey(id));
 this.disputeDraft = null;
 this.setOrder(order);
 this.loadFinancialBreakdown(id);
 this.closeDisputeModal();
 },
 error: (error) => {
 this.isSubmittingDispute = false;
 this.cdr.markForCheck();
 console.error('Failed to submit dispute', error);
 }
 });
 }

 saveIssueNote(form: OrderIssueFlagForm): void {
 const id = this.orderId();

 if (!id || this.isSubmittingIssueFlag) {
 return;
 }

 this.isSubmittingIssueFlag = true;
 this.cdr.markForCheck();

 this.ordersService.flagIssue(id, {
 ...form,
 showInOperationsCenter: false,
 notifyAssignedTeam: false
 }).subscribe({
 next: (order) => {
 this.isSubmittingIssueFlag = false;
 this.cdr.markForCheck();
 this.setOrder(order);
 this.loadFinancialBreakdown(id);
 this.closeIssueFlagModal();
 },
 error: () => {
 this.isSubmittingIssueFlag = false;
 this.cdr.markForCheck();
 }
 });
 }

 submitIssueFlag(form: OrderIssueFlagForm): void {
 const id = this.orderId();

 if (!id || this.isSubmittingIssueFlag) {
 return;
 }

 this.isSubmittingIssueFlag = true;
 this.cdr.markForCheck();

 this.ordersService.flagIssue(id, form).subscribe({
 next: (order) => {
 this.isSubmittingIssueFlag = false;
 this.cdr.markForCheck();
 this.setOrder(order);
 this.loadFinancialBreakdown(id);
 this.closeIssueFlagModal();
 },
 error: () => {
 this.isSubmittingIssueFlag = false;
 this.cdr.markForCheck();
 }
 });
 }

 @HostListener('document:keydown.escape')
 onEscape(): void {
 if (this.isIssueFlagModalOpen) {
 this.closeIssueFlagModal();
 return;
 }

 if (this.isDisputeModalOpen) {
 this.closeDisputeModal();
 return;
 }

 if (this.isRefundModalOpen) {
 this.closeRefundModal();
 return;
 }

 if (this.isCancellationModalOpen) {
 this.closeCancellationModal();
 return;
 }

 if (this.isDriverAssignmentModalOpen) {
 this.closeDriverAssignmentModal();
 return;
 }

 if (this.isStatusModalOpen) {
 this.closeStatusModal();
 }
 }

 private getPaymentStatusTone(status: OrderPaymentStatus): KeyValueGridItem['valueTone'] {
 switch (status) {
 case 'FAILED':
 return 'danger';
 case 'PENDING':
 case 'COD_PENDING':
 case 'PARTIALLY_REFUNDED':
 return 'warning';
 case 'PAID':
 case 'SETTLED':
 return 'accent';
 default:
 return 'muted';
 }
 }

 private getFulfillmentStatusTone(status: OrderFulfillmentStatus): KeyValueGridItem['valueTone'] {
 switch (status) {
 case 'FAILED':
 case 'CANCELLED':
 return 'danger';
 case 'PREPARING':
 case 'READY_FOR_PICKUP':
 return 'warning';
 case 'ON_ROUTE':
 case 'DRIVER_ASSIGNED':
 case 'PICKED_UP':
 return 'accent';
 default:
 return 'default';
 }
 }

 private formatCurrency(value: number): string {
 const amount = new Intl.NumberFormat('en-US', {
 minimumFractionDigits: 2,
 maximumFractionDigits: 2
 }).format(value);
 const currency = this.translate.instant('COMMON.CURRENCY_SAR');
 return `${amount} ${currency}`;
 }

 formatDistance(value: number | undefined | null): string {
 if (value === undefined || value === null) return `0.00 ${this.currentLang === 'ar' ? 'كم' : 'km'}`;
 return `${value.toFixed(2)} ${this.currentLang === 'ar' ? 'كم' : 'km'}`;
 }

 formatDateTime(value: string | null | undefined): string {
 if (!value) return '';
 const parsed = new Date(value);
 if (Number.isNaN(parsed.getTime())) {
 return value;
 }

 return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', { timeZone: 'Asia/Riyadh',
 year: 'numeric',
 month: '2-digit',
 day: '2-digit',
 hour: '2-digit',
 minute: '2-digit',
 hour12: true
 }).format(parsed);
 }

 getDeliverySourceLabel(source: string | undefined | null): string {
 if (!source) return 'ORDERS.DETAIL.PRICING_SOURCES.UNKNOWN';
 const clean = source.trim().toUpperCase().replace(/\s+/g, '_');
 return `ORDERS.DETAIL.PRICING_SOURCES.${clean}`;
 }

 resolveProductImageUrl(path: string | undefined): string {
 if (!path) return '';
 if (path.startsWith('http')) return path;
 const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
 return `${baseUrl}/${path.replace(/^\//, '')}`;
 }

 private setOrder(order: OrderDetail): void {
 this.order.set(order);
 this.refreshCountdowns();
 this.startCountdownIfNeeded();
 this.startPollingIfNeeded();
 if (order.fulfillmentType !== 'Pickup') {
 this.startRealtimeTracking(order.id);
 } else {
 this.stopRealtimeTracking();
 }
 }

 private startRealtimeTracking(orderId: string): void {
 if (this.trackedOrderId === orderId) {
 return;
 }

 this.stopRealtimeTracking();
 this.trackedOrderId = orderId;

 this.driverLocationSub = this.orderTrackingRealtime.driverLocations().subscribe((payload) => this.applyRealtimeDriverLocation(payload));

 this.statusChangeSub = this.orderTrackingRealtime.statusChanges().subscribe((payload) => this.applyRealtimeStatusChange(payload));

 void this.orderTrackingRealtime.subscribe(orderId).catch((error) => {
 console.warn('Admin order tracking subscription failed.', error);
 });
 }

 private stopRealtimeTracking(): void {
 this.driverLocationSub?.unsubscribe();
 this.driverLocationSub = null;
 this.statusChangeSub?.unsubscribe();
 this.statusChangeSub = null;

 if (this.trackedOrderId) {
 void this.orderTrackingRealtime.unsubscribe(this.trackedOrderId);
 this.trackedOrderId = null;
 }
 }

 private applyRealtimeDriverLocation(payload: OrderTrackingDriverLocation): void {
 const current = this.order();
 if (!current || payload.orderId!== current.id) {
 return;
 }

 // SignalR callbacks fire outside Angular's NgZone when the SDK is loaded
 // dynamically from a CDN, so explicit re-entry is required for the signal
 // update to trigger change detection on the tracking map.
 this.zone.run(() => {
 const stillCurrent = this.order();
 if (!stillCurrent || payload.orderId!== stillCurrent.id) {
 return;
 }
 this.order.set({...stillCurrent,
 driverLiveLocation: {
 latitude: Number(payload.latitude),
 longitude: Number(payload.longitude),
 accuracyMeters: payload.accuracyMeters ?? undefined,
 recordedAtUtc: payload.recordedAtUtc
 }
 });
 });
 }

 private applyRealtimeStatusChange(payload: OrderTrackingStatusChangedPayload): void {
 const current = this.order();
 if (!current || payload.orderId!== current.id) {
 return;
 }

 this.zone.run(() => {
 // Pull a fresh snapshot so derived state (timeline, payments, etc.) is in sync.
 this.loadOrderDetails();
 });
 }

 private startPollingIfNeeded(): void {
 this.stopPolling();

 const currentOrder = this.order();
 if (!currentOrder || this.isTerminalStatus(currentOrder.status)) {
 return;
 }

 const orderId = currentOrder.id;
 this.pollSub = interval(this.trackingPollIntervalMs).pipe(
 switchMap(() => this.ordersService.getOrderById(orderId))
 ).subscribe({
 next: (updatedOrder) => {
 this.cdr.markForCheck();
 this.order.set(updatedOrder);

 if (this.isTerminalStatus(updatedOrder.status)) {
 this.stopPolling();
 }
 },
 error: () => this.stopPolling()
 });
 }

 private stopPolling(): void {
 this.pollSub?.unsubscribe();
 this.pollSub = null;
 }

 private isTerminalStatus(status: OrderStatus): boolean {
 return status === 'DELIVERED' || status === 'COMPLETED' || status === 'CANCELLED';
 }

 private scrollToTrackingIfRequested(): void {
 if (this.route.snapshot.fragment === 'tracking') {
 this.scrollToTracking();
 }
 }

 private loadFinancialBreakdown(orderId: string): void {
 this.financeService.getOrderFinancialBreakdown(orderId).subscribe((breakdown) => {
 this.cdr.markForCheck();
 this.financialBreakdown.set(breakdown);

 const current = this.order();
 if (current && !current.fulfillmentType && breakdown?.fulfillmentType) {
 const normalized = this.normalizeFulfillmentType(breakdown.fulfillmentType);
 if (normalized) {
 this.order.set({ ...current, fulfillmentType: normalized });
 }
 }
 });
 }

 private normalizeFulfillmentType(value: string | null | undefined): 'Delivery' | 'Pickup' | undefined {
 if (!value?.trim()) {
 return undefined;
 }

 return value.trim().toLowerCase() === 'pickup' ? 'Pickup' : 'Delivery';
 }

 private refreshCountdowns(): void {
 const currentOrder = this.order();
 const now = Date.now();
 this.noShowRemainingMs = currentOrder?.pickupNoShowDeadlineUtc
 ? Math.max(0, new Date(currentOrder.pickupNoShowDeadlineUtc).getTime() - now)
 : 0;
 }

 private startCountdownIfNeeded(): void {
 this.stopCountdown();
 if (!this.order()?.pickupNoShowDeadlineUtc) {
 return;
 }

 this.refreshCountdowns();
 this.countdownSub = interval(1000).subscribe(() => {
 this.zone.run(() => {
 this.refreshCountdowns();
 this.cdr.markForCheck();
 if (this.noShowRemainingMs <= 0) {
 this.stopCountdown();
 }
 });
 });
 }

 private stopCountdown(): void {
 this.countdownSub?.unsubscribe();
 this.countdownSub = null;
 }

 private loadDisputeDraft(orderId: string): OrderDisputeForm | null {
 const raw = localStorage.getItem(this.disputeDraftStorageKey(orderId));
 if (!raw) {
 return null;
 }

 try {
 return JSON.parse(raw) as OrderDisputeForm;
 } catch {
 localStorage.removeItem(this.disputeDraftStorageKey(orderId));
 return null;
 }
 }

 private disputeDraftStorageKey(orderId: string): string {
 return `zadana:orders:${orderId}:dispute-draft`;
 }

 private showApiError(error: unknown, fallbackKey: string): void {
 this.toastService.error(
 describeApiError(error, this.translate, { fallbackKey, codePrefix: 'ORDERS.API_ERROR_CODES' })
 );
 }
}


