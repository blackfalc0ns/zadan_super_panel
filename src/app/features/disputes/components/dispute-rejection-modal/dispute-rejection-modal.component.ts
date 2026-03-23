import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { DisputeRow, RejectionDecisionForm, RejectionReason } from '../../disputes.models';

@Component({
  selector: 'app-dispute-rejection-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent],
  templateUrl: './dispute-rejection-modal.component.html',
  styleUrl: './dispute-rejection-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisputeRejectionModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isRtl = true;
  @Input() dispute: DisputeRow | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<RejectionDecisionForm>();
  @Output() submitDecision = new EventEmitter<RejectionDecisionForm>();

  readonly reasonOptions: Array<{ value: RejectionReason; labelKey: string }> = [
    { value: 'policy', labelKey: 'DISPUTES_DASHBOARD.REJECTION_MODAL.OPTION_POLICY' },
    { value: 'evidence', labelKey: 'DISPUTES_DASHBOARD.REJECTION_MODAL.OPTION_EVIDENCE' },
    { value: 'delivered', labelKey: 'DISPUTES_DASHBOARD.REJECTION_MODAL.OPTION_DELIVERED' },
    { value: 'expired', labelKey: 'DISPUTES_DASHBOARD.REJECTION_MODAL.OPTION_EXPIRED' },
    { value: 'misuse', labelKey: 'DISPUTES_DASHBOARD.REJECTION_MODAL.OPTION_MISUSE' },
    { value: 'other', labelKey: 'DISPUTES_DASHBOARD.REJECTION_MODAL.OPTION_OTHER' }
  ];

  form: RejectionDecisionForm = this.createEmptyForm();

  constructor(private readonly translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['dispute']) && this.isOpen && this.dispute) {
      this.form = this.createDefaultForm(this.dispute);
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onSaveDraft(): void {
    this.saveDraft.emit({ ...this.form });
  }

  onSubmit(): void {
    this.submitDecision.emit({ ...this.form });
  }

  private createDefaultForm(dispute: DisputeRow): RejectionDecisionForm {
    return {
      reason: 'evidence',
      additionalExplanation: '',
      customerMessage: this.t('DISPUTES_DASHBOARD.REJECTION_MODAL.DEFAULT_CUSTOMER_MESSAGE', {
        orderId: dispute.orderId
      }),
      internalNotes: this.t('DISPUTES_DASHBOARD.REJECTION_MODAL.DEFAULT_INTERNAL_NOTE'),
      notifyEmail: true,
      notifySms: false
    };
  }

  private createEmptyForm(): RejectionDecisionForm {
    return {
      reason: 'evidence',
      additionalExplanation: '',
      customerMessage: '',
      internalNotes: '',
      notifyEmail: true,
      notifySms: false
    };
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }
}
