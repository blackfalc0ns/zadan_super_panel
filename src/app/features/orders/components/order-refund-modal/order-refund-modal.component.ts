import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() isOpen = false;
  @Input() order: OrderDetail | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<OrderRefundForm>();
  @Output() submitRefund = new EventEmitter<OrderRefundForm>();

  readonly reasonOptions: OrderRefundForm['reason'][] = ['delivery_delay', 'missing_item', 'quality_issue', 'other'];
  readonly refundMethodOptions: OrderRefundForm['refundMethod'][] = ['same_method', 'wallet', 'manual'];
  readonly costBearerOptions: OrderRefundForm['costBearer'][] = ['platform', 'merchant', 'shared'];
  readonly refundTypeOptions: OrderRefundForm['refundType'][] = ['products', 'full', 'custom'];

  form: OrderRefundForm = this.createEmptyForm();

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['order']) && this.isOpen && this.order) {
      this.form = this.createDefaultForm(this.order);
      this.cdr.markForCheck();
    }
  }

  get refundableAmount(): number {
    return Number.parseFloat(this.form.refundAmount || '0') || 0;
  }

  get productSubtotal(): number {
    return this.order?.subtotal ?? 0;
  }

  get orderTotal(): number {
    return this.order?.total ?? 0;
  }

  get isAmountEditable(): boolean {
    return this.form.refundType === 'custom';
  }

  get maxCustomRefund(): number {
    return this.productSubtotal;
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

  onRefundTypeChange(refundType: OrderRefundForm['refundType']): void {
    if (!this.order) {
      return;
    }

    this.form.refundType = refundType;

    switch (refundType) {
      case 'products':
        this.form.refundAmount = this.productSubtotal.toFixed(2);
        break;
      case 'full':
        this.form.refundAmount = this.orderTotal.toFixed(2);
        break;
      case 'custom':
        break;
    }

    this.cdr.markForCheck();
  }

  getRefundTypeClasses(refundType: OrderRefundForm['refundType']): string {
    const selected = this.form.refundType === refundType;
    const base = 'flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-all min-h-[4.5rem]';

    if (!selected) {
      return `${base} border-slate-200 bg-white text-slate-500 hover:border-zadna-primary/30 hover:bg-zadna-primary/5`;
    }

    if (refundType === 'products') {
      return `${base} border-zadna-primary bg-zadna-primary/10 text-zadna-primary shadow-sm shadow-zadna-primary/10`;
    }

    if (refundType === 'full') {
      return `${base} border-slate-700 bg-slate-800 text-white shadow-md`;
    }

    return `${base} border-amber-300 bg-amber-50 text-amber-800`;
  }

  getCostBearerClasses(costBearer: OrderRefundForm['costBearer']): string {
    return this.form.costBearer === costBearer
      ? 'border-amber-300 bg-amber-50 text-amber-700'
      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50';
  }

  onSaveDraft(): void {
    this.saveDraft.emit(this.buildSubmitForm());
  }

  onSubmit(): void {
    this.submitRefund.emit(this.buildSubmitForm());
  }

  private buildSubmitForm(): OrderRefundForm {
    const amount = this.clampRefundAmount(this.refundableAmount);
    return {
      ...this.form,
      refundAmount: amount.toFixed(2)
    };
  }

  private clampRefundAmount(amount: number): number {
    if (this.form.refundType === 'products') {
      return Math.min(amount, this.productSubtotal);
    }

    if (this.form.refundType === 'custom') {
      return Math.min(Math.max(amount, 0), this.productSubtotal);
    }

    return Math.min(amount, this.orderTotal);
  }

  private createDefaultForm(order: OrderDetail): OrderRefundForm {
    return {
      refundType: 'products',
      refundAmount: order.subtotal.toFixed(2),
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
      refundType: 'products',
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
