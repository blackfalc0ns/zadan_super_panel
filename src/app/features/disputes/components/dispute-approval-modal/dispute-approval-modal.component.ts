import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { DisputeRow, RefundDecisionForm, createDefaultRefundDecisionForm } from '../../models/disputes.models';

@Component({
  selector: 'app-dispute-approval-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent, SearchableSelectComponent],
  templateUrl: './dispute-approval-modal.component.html',
  styleUrl: './dispute-approval-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisputeApprovalModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() dispute: DisputeRow | null = null;
  @Input() draft: RefundDecisionForm | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<RefundDecisionForm>();
  @Output() submitDecision = new EventEmitter<RefundDecisionForm>();

  readonly nonRefundableDeliveryFee = 35;
  form: RefundDecisionForm = this.createEmptyForm();

  readonly refundTypeOptions: SearchableSelectOption<RefundDecisionForm['refundType']>[] = [
    { value: 'full', labelKey: 'DISPUTES_DASHBOARD.MODAL.REFUND_TYPE_FULL' },
    { value: 'partial', labelKey: 'DISPUTES_DASHBOARD.MODAL.REFUND_TYPE_PARTIAL' }
  ];

  readonly onlineRefundMethodOptions: SearchableSelectOption<RefundDecisionForm['refundMethod']>[] = [
    { value: 'same_method', labelKey: 'DISPUTES_DASHBOARD.MODAL.REFUND_METHOD_SAME' },
  ];

  readonly codRefundMethodOptions: SearchableSelectOption<RefundDecisionForm['refundMethod']>[] = [
    { value: 'coupon', label: 'Compensation coupon' }
  ];

  readonly costBearerOptions: SearchableSelectOption<RefundDecisionForm['costBearer']>[] = [
    { value: 'vendor', labelKey: 'DISPUTES_DASHBOARD.MODAL.COST_BEARER_VENDOR' },
    { value: 'platform', labelKey: 'DISPUTES_DASHBOARD.MODAL.COST_BEARER_PLATFORM' },
    { value: 'shared', labelKey: 'DISPUTES_DASHBOARD.MODAL.COST_BEARER_SHARED' }
  ];

  constructor(private readonly translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['dispute']) && this.isOpen && this.dispute) {
      this.form = this.draft ? { ...this.draft } : this.createDefaultForm(this.dispute);
    }
  }

  get refundAmountValue(): number {
    return Number.parseFloat(this.form.refundAmount || '0') || 0;
  }

  get netDecisionValue(): number {
    return Math.max(this.refundAmountValue - this.nonRefundableDeliveryFee, 0);
  }

  get refundMethodOptions(): SearchableSelectOption<RefundDecisionForm['refundMethod']>[] {
    return this.isCashOnDelivery ? this.codRefundMethodOptions : this.onlineRefundMethodOptions;
  }

  get isCashOnDelivery(): boolean {
    return this.dispute?.paymentMethod === 'cash';
  }

  get refundMethodHint(): string {
    return this.isCashOnDelivery
      ? 'Cash on delivery orders are approved as customer-specific compensation coupons.'
      : 'Online-paid orders are refunded back to the original payment method.';
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onRefundTypeChange(refundType: RefundDecisionForm['refundType']): void {
    if (!this.dispute) {
      return;
    }

    this.form.refundType = refundType;
    this.form.refundAmount = refundType === 'full' ? this.dispute.amount.toFixed(2) : this.getSuggestedRefundAmount(this.dispute);
  }

  onRefundMethodChange(refundMethod: RefundDecisionForm['refundMethod']): void {
    this.form.refundMethod = refundMethod;
  }

  onSaveDraft(): void {
    this.saveDraft.emit({ ...this.form });
  }

  onSubmit(): void {
    this.submitDecision.emit({ ...this.form });
  }

  private createDefaultForm(dispute: DisputeRow): RefundDecisionForm {
    return createDefaultRefundDecisionForm(
      dispute,
      this.t('DISPUTES_DASHBOARD.MODAL.DEFAULT_APPROVAL_REASON'),
      this.t('DISPUTES_DASHBOARD.MODAL.DEFAULT_CUSTOMER_MESSAGE')
    );
  }

  private createEmptyForm(): RefundDecisionForm {
    return {
      refundType: 'full',
      refundAmount: '0.00',
      refundMethod: 'same_method',
      approvalReason: '',
      costBearer: 'shared',
      internalNotes: '',
      customerMessage: '',
      notifyCustomer: true,
      notifyFinance: true
    };
  }

  private getSuggestedRefundAmount(dispute: DisputeRow): string {
    return Math.min(dispute.amount, 450).toFixed(2);
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }
}
