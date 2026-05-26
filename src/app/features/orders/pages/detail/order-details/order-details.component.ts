import { Component, HostListener, NgZone, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
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
  OrderStatusUpdateForm
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

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
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
  readonly orderId = signal<string | null>(null);
  readonly order = signal<OrderDetail | null>(null);
  readonly financialBreakdown = signal<OrderFinancialBreakdown | null>(null);
  private readonly trackingPollIntervalMs = 5000;
  private pollSub: Subscription | null = null;
  private fragmentSub: Subscription | null = null;
  private driverLocationSub: Subscription | null = null;
  private statusChangeSub: Subscription | null = null;
  private trackedOrderId: string | null = null;

  isLoading = false;
  errorMessage = '';

  isStatusModalOpen = false;
  isDriverAssignmentModalOpen = false;
  isCancellationModalOpen = false;
  isRefundModalOpen = false;
  isDisputeModalOpen = false;
  isIssueFlagModalOpen = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ordersService: OrdersService,
    private readonly financeService: FinanceService,
    private readonly accessService: AccessService,
    private readonly orderTrackingRealtime: OrderTrackingRealtimeService,
    private readonly zone: NgZone
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.orderId.set(id);
    this.loadOrderDetails();

    this.fragmentSub = this.route.fragment.subscribe((fragment) => {
      if (fragment === 'tracking') {
        this.scrollToTracking();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.stopRealtimeTracking();
    this.fragmentSub?.unsubscribe();
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
    return !this.operationalCase || this.operationalCase.status === 'CLOSED';
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
    return !paymentBlocked && this.canOpenIssueTools && this.canEditDisputes;
  }

  get canOpenIssueCase(): boolean {
    return this.canOpenIssueTools && this.canEditDisputes;
  }

  get canOpenDisputeCase(): boolean {
    return this.canOpenIssueTools && this.canEditDisputes;
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
      { label: 'ORDERS.DETAIL.DELIVERY_FEE', value: this.formatCurrency(currentOrder.deliveryFee), valueDir: 'ltr' },
      { label: 'ORDERS.DETAIL.TAX', value: this.formatCurrency(currentOrder.tax), valueDir: 'ltr' }
    ];
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
      },
      ...(currentOrder.dispatchState
        ? [{ label: 'ORDERS.DETAIL.DISPATCH_STATE', value: currentOrder.dispatchState, valueDir: 'ltr' as const }]
        : []),
      ...(currentOrder.dispatchReason
        ? [{ label: 'ORDERS.DETAIL.DISPATCH_NOTE', value: currentOrder.dispatchReason }]
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
        this.setOrder(order);
        this.loadFinancialBreakdown(id);
        this.isLoading = false;
        this.scrollToTrackingIfRequested();
      },
      error: (error) => {
        console.error('Failed to load order details', error);
        this.errorMessage = 'ORDERS.ERRORS.LOAD_DETAIL';
        this.order.set(null);
        this.financialBreakdown.set(null);
        this.isLoading = false;
        this.stopPolling();
      }
    });
  }

  scrollToTracking(): void {
    setTimeout(() => {
      document.getElementById('tracking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
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

    this.isDisputeModalOpen = true;
  }

  openIssueFlagModal(): void {
    if (!this.canOpenIssueCase) {
      return;
    }

    this.isIssueFlagModalOpen = true;
  }

  closeStatusModal(): void {
    this.isStatusModalOpen = false;
  }

  closeDriverAssignmentModal(): void {
    this.isDriverAssignmentModalOpen = false;
  }

  closeCancellationModal(): void {
    this.isCancellationModalOpen = false;
  }

  closeRefundModal(): void {
    this.isRefundModalOpen = false;
  }

  closeDisputeModal(): void {
    this.isDisputeModalOpen = false;
  }

  closeIssueFlagModal(): void {
    this.isIssueFlagModalOpen = false;
  }

  resolveOperationalCase(): void {
    if (!this.canResolveOperationalCaseAction) {
      return;
    }

    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.resolveOperationalCase(id).subscribe({
      next: (order) => this.setOrder(order)
    });
  }

  closeOperationalCase(): void {
    if (!this.canCloseOperationalCaseAction) {
      return;
    }

    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.closeOperationalCase(id).subscribe({
      next: (order) => this.setOrder(order)
    });
  }

  reopenOperationalCase(): void {
    if (!this.canReopenOperationalCaseAction) {
      return;
    }

    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.reopenOperationalCase(id).subscribe({
      next: (order) => this.setOrder(order)
    });
  }

  submitStatusUpdate(form: OrderStatusUpdateForm): void {
    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.updateOrderStatus(id, form).subscribe({
      next: (order) => {
        this.setOrder(order);
        this.loadFinancialBreakdown(id);
        this.closeStatusModal();
      }
    });
  }

  submitDriverAssignment(form: DriverAssignmentForm): void {
    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.assignDriver(id, form).subscribe({
      next: (order) => {
        this.setOrder(order);
        this.loadFinancialBreakdown(id);
        this.closeDriverAssignmentModal();
      }
    });
  }

  recomputeDispatch(): void {
    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.recomputeDispatch(id).subscribe({
      next: (order) => {
        this.setOrder(order);
        this.loadFinancialBreakdown(id);
      }
    });
  }

  submitCancellation(form: OrderCancellationForm): void {
    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.cancelOrder(id, form).subscribe({
      next: (order) => {
        this.setOrder(order);
        this.loadFinancialBreakdown(id);
        this.closeCancellationModal();
      }
    });
  }

  saveRefundDraft(form: OrderRefundForm): void {
    void form;
    this.closeRefundModal();
  }

  submitRefund(form: OrderRefundForm): void {
    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.createRefund(id, form).subscribe({
      next: (order) => {
        this.setOrder(order);
        this.loadFinancialBreakdown(id);
        this.closeRefundModal();
      }
    });
  }

  saveDisputeDraft(form: OrderDisputeForm): void {
    void form;
    this.closeDisputeModal();
  }

  submitDispute(form: OrderDisputeForm): void {
    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.openDispute(id, form).subscribe({
      next: (order) => {
        this.setOrder(order);
        this.loadFinancialBreakdown(id);
        this.closeDisputeModal();
      }
    });
  }

  saveIssueNote(form: OrderIssueFlagForm): void {
    void form;
    this.closeIssueFlagModal();
  }

  submitIssueFlag(form: OrderIssueFlagForm): void {
    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.flagIssue(id, form).subscribe({
      next: (order) => {
        this.setOrder(order);
        this.loadFinancialBreakdown(id);
        this.closeIssueFlagModal();
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
    return `${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)} SAR`;
  }

  resolveProductImageUrl(path: string | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}/${path.replace(/^\//, '')}`;
  }

  private setOrder(order: OrderDetail): void {
    this.order.set(order);
    this.startPollingIfNeeded();
    this.startRealtimeTracking(order.id);
  }

  private startRealtimeTracking(orderId: string): void {
    if (this.trackedOrderId === orderId) {
      return;
    }

    this.stopRealtimeTracking();
    this.trackedOrderId = orderId;

    this.driverLocationSub = this.orderTrackingRealtime
      .driverLocations()
      .subscribe((payload) => this.applyRealtimeDriverLocation(payload));

    this.statusChangeSub = this.orderTrackingRealtime
      .statusChanges()
      .subscribe((payload) => this.applyRealtimeStatusChange(payload));

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
    console.log('[OrderTracking][component] applyRealtimeDriverLocation called', {
      payloadOrderId: payload.orderId,
      currentOrderId: current?.id,
      match: payload.orderId === current?.id
    });
    if (!current || payload.orderId !== current.id) {
      return;
    }

    // SignalR callbacks fire outside Angular's NgZone when the SDK is loaded
    // dynamically from a CDN, so explicit re-entry is required for the signal
    // update to trigger change detection on the tracking map.
    this.zone.run(() => {
      const stillCurrent = this.order();
      if (!stillCurrent || payload.orderId !== stillCurrent.id) {
        return;
      }
      this.order.set({
        ...stillCurrent,
        driverLiveLocation: {
          latitude: Number(payload.latitude),
          longitude: Number(payload.longitude),
          accuracyMeters: payload.accuracyMeters ?? undefined,
          recordedAtUtc: payload.recordedAtUtc
        }
      });
      console.log('[OrderTracking][component] driverLiveLocation updated to', this.order()?.driverLiveLocation);
    });
  }

  private applyRealtimeStatusChange(payload: OrderTrackingStatusChangedPayload): void {
    const current = this.order();
    if (!current || payload.orderId !== current.id) {
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
      this.financialBreakdown.set(breakdown);
    });
  }
}


