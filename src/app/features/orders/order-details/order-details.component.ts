import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderCancellationModalComponent } from '../components/order-cancellation-modal/order-cancellation-modal.component';
import { OrderDriverAssignmentModalComponent } from '../components/order-driver-assignment-modal/order-driver-assignment-modal.component';
import { OrderDisputeModalComponent } from '../components/order-dispute-modal/order-dispute-modal.component';
import { OrderIssueFlagModalComponent } from '../components/order-issue-flag-modal/order-issue-flag-modal.component';
import { OrderRefundModalComponent } from '../components/order-refund-modal/order-refund-modal.component';
import { OrderStatusUpdateModalComponent } from '../components/order-status-update-modal/order-status-update-modal.component';
import { InlineBannerComponent } from '../../../shared/components/ui/inline-banner/inline-banner.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { SectionHeaderComponent } from '../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../shared/components/ui/status-pill/status-pill.component';
import { OrdersService } from '../../../core/services/orders.service';
import { WorkflowLinkCard, WorkflowLinksService } from '../../../core/services/workflow-links.service';
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
} from '../orders.models';
import {
  getFulfillmentStatusKey,
  getOperationalCaseStatusKey,
  getOperationalCaseTypeKey,
  getOrderStatusKey,
  getPaymentStatusKey,
  getResolutionStateKey,
  getWorkflowStageKey
} from '../orders.mock';
import { WorkflowLinksPanelComponent } from '../../../shared/components/ui/workflow-links-panel/workflow-links-panel.component';

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
    WorkflowLinksPanelComponent
  ],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  readonly orderId = signal<string | null>(null);
  readonly order = signal<OrderDetail | null>(null);

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
    private readonly workflowLinks: WorkflowLinksService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.orderId.set(id);
    this.loadOrderDetails();
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

  get canOpenRefund(): boolean {
    const currentOrder = this.order();

    if (!currentOrder) {
      return false;
    }

    const paymentBlocked = currentOrder.paymentStatus === 'FAILED' || currentOrder.paymentStatus === 'PENDING';
    return !paymentBlocked && this.canOpenIssueTools;
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
      { label: 'ORDERS.DETAIL.LAST_UPDATED', value: currentOrder.lastUpdatedAt },
      { label: 'ORDERS.DETAIL.SLA_LABEL', value: `${currentOrder.slaScore || 0}%`, valueDir: 'ltr', valueTone: currentOrder.isLate ? 'warning' : 'accent' }
    ];
  }

  get linkedWorkflowCards(): WorkflowLinkCard[] {
    return this.workflowLinks.getOrderWorkflowLinks(this.order());
  }

  loadOrderDetails(): void {
    const id = this.orderId();

    if (!id) {
      this.errorMessage = 'ORDERS.ERRORS.INVALID_ID';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.ordersService.getOrderById(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load order details', error);
        this.errorMessage = 'ORDERS.ERRORS.LOAD_DETAIL';
        this.order.set(null);
        this.isLoading = false;
      }
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
    this.isRefundModalOpen = true;
  }

  openDisputeModal(): void {
    this.isDisputeModalOpen = true;
  }

  openIssueFlagModal(): void {
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
    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.resolveOperationalCase(id).subscribe({
      next: (order) => this.order.set(order)
    });
  }

  closeOperationalCase(): void {
    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.closeOperationalCase(id).subscribe({
      next: (order) => this.order.set(order)
    });
  }

  reopenOperationalCase(): void {
    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.reopenOperationalCase(id).subscribe({
      next: (order) => this.order.set(order)
    });
  }

  submitStatusUpdate(form: OrderStatusUpdateForm): void {
    const id = this.orderId();

    if (!id) {
      return;
    }

    this.ordersService.updateOrderStatus(id, form).subscribe({
      next: (order) => {
        this.order.set(order);
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
        this.order.set(order);
        this.closeDriverAssignmentModal();
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
        this.order.set(order);
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
        this.order.set(order);
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
        this.order.set(order);
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
        this.order.set(order);
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
}
