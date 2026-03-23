import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { OrderCancellationForm, OrderDetail } from '../../orders.models';

@Component({
  selector: 'app-order-cancellation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent],
  templateUrl: './order-cancellation-modal.component.html',
  styleUrl: './order-cancellation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderCancellationModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() order: OrderDetail | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() submitCancellation = new EventEmitter<OrderCancellationForm>();

  readonly reasonOptions: OrderCancellationForm['reason'][] = [
    'customer_request',
    'merchant_rejected',
    'out_of_stock',
    'payment_issue',
    'delivery_failed',
    'operational_issue',
    'fraud_suspected',
    'other'
  ];

  form: OrderCancellationForm = this.createEmptyForm();

  constructor(private readonly translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['order']) && this.isOpen) {
      this.form = this.createDefaultForm();
    }
  }

  get showDeliveryWarning(): boolean {
    return this.order?.status === 'OUT_FOR_DELIVERY';
  }

  get currentStatusLabel(): string {
    return this.translate.instant(`ORDERS.STATUS.${this.order?.status ?? 'NEW'}`);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onRefundTypeChange(refundType: OrderCancellationForm['refundType']): void {
    this.form.refundType = refundType;
  }

  onSubmit(): void {
    this.submitCancellation.emit({ ...this.form });
  }

  getRefundButtonClasses(refundType: OrderCancellationForm['refundType']): string {
    return this.form.refundType === refundType
      ? 'border-zadna-primary bg-zadna-primary/8 text-zadna-primary shadow-sm'
      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50';
  }

  private createDefaultForm(): OrderCancellationForm {
    return {
      reason: this.showDeliveryWarning ? 'delivery_failed' : 'customer_request',
      details: '',
      refundType: 'full',
      costBearer: 'platform',
      notifyCustomer: true,
      notifyMerchant: true,
      notifyDriver: false,
      customerMessage: '',
      internalNote: ''
    };
  }

  private createEmptyForm(): OrderCancellationForm {
    return {
      reason: 'customer_request',
      details: '',
      refundType: 'full',
      costBearer: 'platform',
      notifyCustomer: true,
      notifyMerchant: true,
      notifyDriver: false,
      customerMessage: '',
      internalNote: ''
    };
  }
}
