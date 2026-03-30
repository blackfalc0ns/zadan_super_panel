import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { DisputeRow, RefundDecisionForm } from '../../models/disputes.models';

@Component({
  selector: 'app-dispute-approval-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent],
  templateUrl: './dispute-approval-modal.component.html',
  styleUrl: './dispute-approval-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisputeApprovalModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() dispute: DisputeRow | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<RefundDecisionForm>();
  @Output() submitDecision = new EventEmitter<RefundDecisionForm>();

  readonly nonRefundableDeliveryFee = 35;
  form: RefundDecisionForm = this.createEmptyForm();

  constructor(private readonly translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['dispute']) && this.isOpen && this.dispute) {
      this.form = this.createDefaultForm(this.dispute);
    }
  }

  get refundAmountValue(): number {
    return Number.parseFloat(this.form.refundAmount || '0') || 0;
  }

  get netDecisionValue(): number {
    return Math.max(this.refundAmountValue - this.nonRefundableDeliveryFee, 0);
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

  onSaveDraft(): void {
    this.saveDraft.emit({ ...this.form });
  }

  onSubmit(): void {
    this.submitDecision.emit({ ...this.form });
  }

  private createDefaultForm(dispute: DisputeRow): RefundDecisionForm {
    return {
      refundType: dispute.amount > 450 ? 'partial' : 'full',
      refundAmount: this.getSuggestedRefundAmount(dispute),
      refundMethod: 'same_method',
      approvalReason: this.t('DISPUTES_DASHBOARD.MODAL.DEFAULT_APPROVAL_REASON'),
      costBearer: 'shared',
      internalNotes: '',
      customerMessage: this.t('DISPUTES_DASHBOARD.MODAL.DEFAULT_CUSTOMER_MESSAGE'),
      notifyCustomer: true,
      notifyFinance: true
    };
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
