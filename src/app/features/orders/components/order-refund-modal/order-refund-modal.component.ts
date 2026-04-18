import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { SearchableSelectComponent } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { OrderDetail, OrderRefundForm } from '../../models/orders.models';
import { getPaymentStatusLabel } from '../../data/orders.mock';

@Component({
  selector: 'app-order-refund-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent, SearchableSelectComponent],
  templateUrl: './order-refund-modal.component.html',
  styleUrl: './order-refund-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderRefundModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() order: OrderDetail | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<OrderRefundForm>();
  @Output() submitRefund = new EventEmitter<OrderRefundForm>();

  readonly reasonOptions: OrderRefundForm['reason'][] = ['delivery_delay', 'missing_item', 'quality_issue', 'other'];
  readonly refundMethodOptions: OrderRefundForm['refundMethod'][] = ['same_method', 'wallet', 'manual'];
  readonly costBearerOptions: OrderRefundForm['costBearer'][] = ['platform', 'merchant', 'shared'];

  form: OrderRefundForm = this.createEmptyForm();

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['order']) && this.isOpen && this.order) {
      this.form = this.createDefaultForm(this.order);
    }
  }

  get refundableAmount(): number {
    return Number.parseFloat(this.form.refundAmount || '0') || 0;
  }

  get discountAmount(): number {
    if (!this.order) {
      return 0;
    }

    const calculated = this.order.subtotal + this.order.deliveryFee + this.order.tax - this.order.total;
    return Number(calculated.toFixed(2));
  }

  get paymentStatusLabel(): string {
    return this.order ? getPaymentStatusLabel(this.order.paymentStatus) : '--';
  }

  get reasonSelectOptions() {
    return this.reasonOptions.map((reason) => ({
      value: reason,
      labelKey: 'ORDERS.DETAIL.REFUND_MODAL.REASONS.' + reason.toUpperCase()
    }));
  }

  get refundMethodSelectOptions() {
    return this.refundMethodOptions.map((method) => ({
      value: method,
      labelKey: 'ORDERS.DETAIL.REFUND_MODAL.METHODS.' + method.toUpperCase()
    }));
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onRefundTypeChange(refundType: OrderRefundForm['refundType']): void {
    if (!this.order) {
      return;
    }

    this.form.refundType = refundType;
    this.form.refundAmount = refundType === 'full'
      ? this.order.total.toFixed(2)
      : Math.max(this.order.total - this.order.deliveryFee, 0).toFixed(2);
  }

  getRefundTypeClasses(refundType: OrderRefundForm['refundType']): string {
    return this.form.refundType === refundType
      ? 'border-zadna-primary bg-zadna-primary/5 text-zadna-primary'
      : 'border-slate-200 text-slate-500 hover:bg-slate-50';
  }

  getCostBearerClasses(costBearer: OrderRefundForm['costBearer']): string {
    return this.form.costBearer === costBearer
      ? 'border-amber-300 bg-amber-50 text-amber-700'
      : 'border-slate-200 text-slate-500 hover:bg-slate-50';
  }

  onSaveDraft(): void {
    this.saveDraft.emit({ ...this.form });
  }

  onSubmit(): void {
    this.submitRefund.emit({ ...this.form });
  }

  private createDefaultForm(order: OrderDetail): OrderRefundForm {
    return {
      refundType: 'full',
      refundAmount: order.total.toFixed(2),
      reason: 'delivery_delay',
      refundMethod: 'same_method',
      costBearer: 'platform',
      internalNotes: '',
      customerMessage: '',
      notifyCustomerSms: true,
      notifyFinance: true
    };
  }

  private createEmptyForm(): OrderRefundForm {
    return {
      refundType: 'full',
      refundAmount: '0.00',
      reason: 'delivery_delay',
      refundMethod: 'same_method',
      costBearer: 'platform',
      internalNotes: '',
      customerMessage: '',
      notifyCustomerSms: true,
      notifyFinance: true
    };
  }
}
