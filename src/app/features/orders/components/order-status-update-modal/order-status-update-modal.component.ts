import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { OrderDetail, OrderStatus, OrderStatusUpdateForm } from '../../orders.models';
import { getFulfillmentStatusKey, getPaymentStatusKey } from '../../orders.mock';

@Component({
  selector: 'app-order-status-update-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent],
  templateUrl: './order-status-update-modal.component.html',
  styleUrl: './order-status-update-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderStatusUpdateModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() order: OrderDetail | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() submitStatusUpdate = new EventEmitter<OrderStatusUpdateForm>();

  readonly statusOptions: OrderStatus[] = ['NEW', 'PENDING', 'IN_PROGRESS', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
  form: OrderStatusUpdateForm = this.createEmptyForm();

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['order']) && this.isOpen && this.order) {
      this.form = this.createDefaultForm(this.order);
    }
  }

  get paymentImpactKey(): string {
    switch (this.form.newStatus) {
      case 'CANCELLED':
        return 'ORDERS.DETAIL.STATUS_MODAL.IMPACT_PAYMENT_REVIEW';
      default:
        return 'ORDERS.DETAIL.STATUS_MODAL.IMPACT_PAYMENT_NONE';
    }
  }

  get driverImpactKey(): string {
    switch (this.form.newStatus) {
      case 'CANCELLED':
      case 'PENDING':
        return 'ORDERS.DETAIL.STATUS_MODAL.IMPACT_DRIVER_UNASSIGN';
      case 'OUT_FOR_DELIVERY':
        return 'ORDERS.DETAIL.STATUS_MODAL.IMPACT_DRIVER_ASSIGN';
      default:
        return 'ORDERS.DETAIL.STATUS_MODAL.IMPACT_DRIVER_REASSIGN';
    }
  }

  get customerNotificationKey(): string {
    switch (this.form.newStatus) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'ORDERS.DETAIL.STATUS_MODAL.IMPACT_NOTIFY_PUSH';
      case 'CANCELLED':
        return 'ORDERS.DETAIL.STATUS_MODAL.IMPACT_NOTIFY_SMS_EMAIL';
      default:
        return 'ORDERS.DETAIL.STATUS_MODAL.IMPACT_NOTIFY_SMS';
    }
  }

  get currentPaymentStatusKey(): string {
    return this.order ? getPaymentStatusKey(this.order.paymentStatus) : '';
  }

  get currentFulfillmentStatusKey(): string {
    return this.order ? getFulfillmentStatusKey(this.order.fulfillmentStatus) : '';
  }

  get availableStatusOptions(): OrderStatus[] {
    if (!this.order) {
      return this.statusOptions;
    }

    const matrix: Record<OrderStatus, OrderStatus[]> = {
      NEW: ['NEW', 'PENDING', 'IN_PROGRESS', 'CANCELLED'],
      PENDING: ['PENDING', 'IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['IN_PROGRESS', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      OUT_FOR_DELIVERY: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      DELIVERED: ['DELIVERED', 'COMPLETED'],
      COMPLETED: ['COMPLETED'],
      CANCELLED: ['CANCELLED']
    };

    const allowed = new Set(matrix[this.order.status]);

    if (
      this.order.paymentStatus === 'FAILED'
      || this.order.paymentStatus === 'PENDING'
      || this.order.paymentStatus === 'COD_PENDING'
    ) {
      allowed.delete('IN_PROGRESS');
      allowed.delete('OUT_FOR_DELIVERY');
      allowed.delete('DELIVERED');
      allowed.delete('COMPLETED');
    }

    if (this.order.status === 'PENDING' && this.order.fulfillmentStatus === 'QUEUED') {
      allowed.add('IN_PROGRESS');
    }

    return this.statusOptions.filter((status) => allowed.has(status));
  }

  get workflowGuardMessageKey(): string {
    if (!this.order) {
      return '';
    }

    if (
      this.order.paymentStatus === 'FAILED'
      || this.order.paymentStatus === 'PENDING'
      || this.order.paymentStatus === 'COD_PENDING'
    ) {
      return 'ORDERS.DETAIL.STATUS_MODAL.WORKFLOW_GUARDS.PAYMENT_BLOCKED';
    }

    if (this.order.fulfillmentStatus === 'FAILED') {
      return 'ORDERS.DETAIL.STATUS_MODAL.WORKFLOW_GUARDS.FULFILLMENT_FAILED';
    }

    if (this.order.status === 'DELIVERED') {
      return 'ORDERS.DETAIL.STATUS_MODAL.WORKFLOW_GUARDS.DELIVERED_READY_TO_CLOSE';
    }

    if (this.order.status === 'CANCELLED' || this.order.status === 'COMPLETED') {
      return 'ORDERS.DETAIL.STATUS_MODAL.WORKFLOW_GUARDS.CLOSED_STATE';
    }

    return 'ORDERS.DETAIL.STATUS_MODAL.WORKFLOW_GUARDS.DEFAULT';
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onSubmit(): void {
    this.submitStatusUpdate.emit({ ...this.form });
  }

  private createDefaultForm(order: OrderDetail): OrderStatusUpdateForm {
    return {
      newStatus: order.status,
      adminNotes: '',
      expectedDeliveryTime: this.getDefaultExpectedTime(),
      notifyCustomer: true,
      notifyMerchant: true,
      notifyDriver: false,
      addInternalLog: true
    };
  }

  private createEmptyForm(): OrderStatusUpdateForm {
    return {
      newStatus: 'NEW',
      adminNotes: '',
      expectedDeliveryTime: '',
      notifyCustomer: true,
      notifyMerchant: true,
      notifyDriver: false,
      addInternalLog: true
    };
  }

  private getDefaultExpectedTime(): string {
    const date = new Date();
    date.setHours(date.getHours() + 1, 0, 0, 0);

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
