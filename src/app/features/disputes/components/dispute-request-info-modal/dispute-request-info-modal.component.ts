import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { DisputeRow, DisputeStatus, RequestInfoForm, RequestInfoTarget, RequestInfoType } from '../../disputes.models';

@Component({
  selector: 'app-dispute-request-info-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent],
  templateUrl: './dispute-request-info-modal.component.html',
  styleUrl: './dispute-request-info-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisputeRequestInfoModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isRtl = true;
  @Input() dispute: DisputeRow | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<RequestInfoForm>();
  @Output() submitRequest = new EventEmitter<RequestInfoForm>();

  readonly requestInfoTypeOptions: Array<{ value: RequestInfoType; labelKey: string }> = [
    { value: 'invoice', labelKey: 'DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_INVOICE' },
    { value: 'photos', labelKey: 'DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_PHOTOS' },
    { value: 'statement', labelKey: 'DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_STATEMENT' },
    { value: 'proof', labelKey: 'DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_PROOF' }
  ];

  form: RequestInfoForm = this.createEmptyForm();

  constructor(private readonly translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['dispute']) && this.isOpen && this.dispute) {
      this.form = this.createDefaultForm(this.dispute);
    }
  }

  get previewGreeting(): string {
    return {
      customer: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.PREVIEW_GREETING_CUSTOMER'),
      merchant: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.PREVIEW_GREETING_MERCHANT'),
      internal: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.PREVIEW_GREETING_INTERNAL')
    }[this.form.target];
  }

  get dueDateLabel(): string {
    return this.formatDueDate(this.form.dueDate);
  }

  get previewBody(): string {
    const details = this.form.details.trim();

    if (details && this.dispute) {
      return this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.PREVIEW_BODY_CUSTOM', {
        disputeId: this.dispute.id,
        details,
        dueDate: this.dueDateLabel
      });
    }

    if (!this.dispute) {
      return '';
    }

    return this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.PREVIEW_BODY', {
      disputeId: this.dispute.id,
      infoType: this.getRequestInfoTypeLabel(this.form.infoType),
      dueDate: this.dueDateLabel
    });
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
    this.submitRequest.emit({ ...this.form });
  }

  getRequestInfoTargetLabel(target: RequestInfoTarget, dispute: DisputeRow): string {
    switch (target) {
      case 'customer':
        return this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.RESPONDER_CUSTOMER', { name: dispute.customerName });
      case 'merchant':
        return this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.RESPONDER_MERCHANT', { name: dispute.merchantName });
      default:
        return this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.RESPONDER_INTERNAL');
    }
  }

  getRequestInfoTypeLabel(type: RequestInfoType): string {
    return {
      invoice: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_INVOICE'),
      photos: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_PHOTOS'),
      statement: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_STATEMENT'),
      proof: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_PROOF')
    }[type];
  }

  getStatusLabel(status: DisputeStatus): string {
    return {
      open: this.t('DISPUTES_DASHBOARD.STATUS.OPEN'),
      review: this.t('DISPUTES_DASHBOARD.STATUS.REVIEW'),
      merchant: this.t('DISPUTES_DASHBOARD.STATUS.MERCHANT'),
      resolved: this.t('DISPUTES_DASHBOARD.STATUS.RESOLVED')
    }[status];
  }

  private createDefaultForm(dispute: DisputeRow): RequestInfoForm {
    return {
      target: dispute.status === 'merchant' ? 'merchant' : 'customer',
      infoType: 'invoice',
      title: '',
      details: '',
      dueDate: this.getDefaultDueDate(),
      priority: 'urgent',
      pauseSla: false,
      alertSupervisor: false,
      internalNotes: ''
    };
  }

  private createEmptyForm(): RequestInfoForm {
    return {
      target: 'customer',
      infoType: 'invoice',
      title: '',
      details: '',
      dueDate: '',
      priority: 'normal',
      pauseSla: false,
      alertSupervisor: false,
      internalNotes: ''
    };
  }

  private getDefaultDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 2);

    return date.toISOString().slice(0, 10);
  }

  private formatDueDate(dateValue: string): string {
    if (!dateValue) {
      return this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.NO_DUE_DATE');
    }

    const [year, month, day] = dateValue.split('-').map((value) => Number.parseInt(value, 10));
    const date = new Date(Date.UTC(year, month - 1, day));

    return new Intl.DateTimeFormat(this.isRtl ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(date);
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }
}
