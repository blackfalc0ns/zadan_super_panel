import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import {
  SupportCaseRow,
  RequestInfoForm,
  RequestInfoTarget,
  RequestInfoType,
  SupportCaseWorkflowStatus,
  createDefaultSupportCaseRequestInfoForm,
  resolveSupportCaseRequestInfoTargets
} from '../../models/support-cases.models';

@Component({
  selector: 'app-support-case-request-info-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent, SearchableSelectComponent],
  templateUrl: './support-case-request-info-modal.component.html',
  styleUrl: './support-case-request-info-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportCaseRequestInfoModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isRtl = true;
  @Input() supportCase: SupportCaseRow | null = null;
  @Input() draft: RequestInfoForm | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<RequestInfoForm>();
  @Output() submitRequest = new EventEmitter<RequestInfoForm>();

  readonly requestInfoTypeOptions: Array<{ value: RequestInfoType; labelKey: string }> = [
    { value: 'invoice', labelKey: 'DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_INVOICE' },
    { value: 'photos', labelKey: 'DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_PHOTOS' },
    { value: 'statement', labelKey: 'DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_STATEMENT' },
    { value: 'proof', labelKey: 'DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_PROOF' }
  ];

  get requestInfoTargetOptions(): SearchableSelectOption<RequestInfoTarget>[] {
    const supportCase = this.supportCase;
    if (!supportCase) {
      return [];
    }

    return resolveSupportCaseRequestInfoTargets(supportCase).map((target) => ({
      value: target,
      label: this.getRequestInfoTargetLabel(target, supportCase)
    }));
  }

  form: RequestInfoForm = this.createEmptyForm();

  constructor(private readonly translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['supportCase']) && this.isOpen && this.supportCase) {
      this.form = this.draft ? { ...this.draft } : this.createDefaultForm(this.supportCase);
    }
  }

  get previewGreeting(): string {
    const labels: Record<RequestInfoTarget, string> = {
      customer: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.PREVIEW_GREETING_CUSTOMER'),
      vendor: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.PREVIEW_GREETING_MERCHANT'),
      driver: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.PREVIEW_GREETING_DRIVER')
    };

    return labels[this.form.target];
  }

  get dueDateLabel(): string {
    return this.formatDueDate(this.form.dueDate);
  }

  get previewBody(): string {
    const details = this.form.details.trim();

    if (details && this.supportCase) {
      return this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.PREVIEW_BODY_CUSTOM', {
        disputeId: this.supportCase.id,
        details,
        dueDate: this.dueDateLabel
      });
    }

    if (!this.supportCase) {
      return '';
    }

    return this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.PREVIEW_BODY', {
      disputeId: this.supportCase.id,
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

  getRequestInfoTargetLabel(target: RequestInfoTarget, supportCase: SupportCaseRow): string {
    switch (target) {
      case 'customer':
        return this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.RESPONDER_CUSTOMER', { name: supportCase.customerName });
      case 'vendor':
        return this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.RESPONDER_MERCHANT', { name: supportCase.merchantName });
      default:
        return this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.RESPONDER_DRIVER');
    }
  }

  getRequestInfoTypeLabel(type: RequestInfoType): string {
    const labels: Record<RequestInfoType, string> = {
      invoice: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_INVOICE'),
      photos: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_PHOTOS'),
      statement: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_STATEMENT'),
      proof: this.t('DISPUTES_DASHBOARD.REQUEST_INFO_MODAL.INFO_TYPE_PROOF')
    };

    return labels[type];
  }

  getStatusLabel(status: SupportCaseWorkflowStatus): string {
    const labels: Record<SupportCaseWorkflowStatus, string> = {
      submitted: this.t('DISPUTES_DASHBOARD.STATUS.OPEN'),
      in_review: this.t('DISPUTES_DASHBOARD.STATUS.REVIEW'),
      awaiting_customer_evidence: this.t('DISPUTES_DASHBOARD.STATUS.AWAITING_CUSTOMER'),
      approved: this.t('DISPUTES_DASHBOARD.STATUS.APPROVED'),
      rejected: this.t('DISPUTES_DASHBOARD.STATUS.REJECTED'),
      resolved: this.t('DISPUTES_DASHBOARD.STATUS.RESOLVED')
    };

    return labels[status];
  }

  private createDefaultForm(supportCase: SupportCaseRow): RequestInfoForm {
    return createDefaultSupportCaseRequestInfoForm(supportCase, this.getDefaultDueDate());
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
