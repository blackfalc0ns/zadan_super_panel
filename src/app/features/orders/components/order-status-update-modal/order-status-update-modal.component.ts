import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { OrderDetail, OrderStatus, OrderStatusUpdateForm } from '../../orders.models';

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

  readonly statusOptions: OrderStatus[] = ['NEW', 'IN_PROGRESS', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'PENDING'];
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
