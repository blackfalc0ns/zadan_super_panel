import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { SearchableSelectComponent } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import {
  DisputePriority,
  DisputeRow,
  EvidenceItem,
  EscalationDecisionForm,
  EscalationPriority,
  EscalationReason,
  EscalationTarget,
  SupportCaseWorkflowStatus,
  createDefaultEscalationDecisionForm
} from '../../models/disputes.models';

@Component({
  selector: 'app-dispute-escalation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent, SearchableSelectComponent],
  templateUrl: './dispute-escalation-modal.component.html',
  styleUrl: './dispute-escalation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisputeEscalationModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isRtl = true;
  @Input() dispute: DisputeRow | null = null;
  @Input() draft: EscalationDecisionForm | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<EscalationDecisionForm>();
  @Output() submitEscalation = new EventEmitter<EscalationDecisionForm>();

  readonly targetOptions: Array<{ value: EscalationTarget; labelKey: string }> = [
    { value: 'finance', labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.TARGET_FINANCE' },
    { value: 'legal', labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.TARGET_LEGAL' },
    { value: 'risk', labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.TARGET_RISK' },
    { value: 'operations', labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.TARGET_OPERATIONS' },
    { value: 'support', labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.TARGET_SUPPORT' },
    { value: 'driverops', labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.TARGET_DRIVER_OPS' }
  ];

  readonly priorityOptions: Array<{ value: EscalationPriority; labelKey: string; activeClass: string }> = [
    {
      value: 'medium',
      labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.PRIORITY_MEDIUM',
      activeClass: 'border-sky-200 bg-sky-50 text-sky-700'
    },
    {
      value: 'high',
      labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.PRIORITY_HIGH',
      activeClass: 'border-amber-200 bg-amber-50 text-amber-700'
    },
    {
      value: 'critical',
      labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.PRIORITY_CRITICAL',
      activeClass: 'border-red-200 bg-red-50 text-red-700'
    }
  ];

  readonly reasonOptions: Array<{ value: EscalationReason; labelKey: string }> = [
    { value: 'conflicting_evidence', labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.REASON_CONFLICTING_EVIDENCE' },
    { value: 'high_amount', labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.REASON_HIGH_AMOUNT' },
    { value: 'fraud', labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.REASON_FRAUD' },
    { value: 'legal_sensitivity', labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.REASON_LEGAL_SENSITIVITY' },
    { value: 'repeat_issues', labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.REASON_REPEAT_ISSUES' },
    { value: 'other', labelKey: 'DISPUTES_DASHBOARD.ESCALATION_MODAL.REASON_OTHER' }
  ];

  form: EscalationDecisionForm = this.createEmptyForm();
  private brokenEvidencePreviewKeys = new Set<string>();

  constructor(private readonly translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['dispute']) && this.isOpen && this.dispute) {
      this.form = this.draft ? { ...this.draft } : this.createDefaultForm(this.dispute);
      this.brokenEvidencePreviewKeys = new Set<string>();
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
    this.submitEscalation.emit({ ...this.form });
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

  getPriorityButtonClass(priority: EscalationPriority): string {
    const option = this.priorityOptions.find((item) => item.value === priority);

    return this.form.priority === priority
      ? option?.activeClass ?? 'border-zadna-primary bg-zadna-primary/10 text-zadna-primary'
      : 'border-slate-200 text-slate-600 hover:bg-slate-50';
  }

  getCurrentPriorityLabel(priority: DisputePriority): string {
    const labels: Record<DisputePriority, string> = {
      critical: this.t('DISPUTES_DASHBOARD.PRIORITY.CRITICAL'),
      high: this.t('DISPUTES_DASHBOARD.PRIORITY.HIGH'),
      medium: this.t('DISPUTES_DASHBOARD.PRIORITY.MEDIUM'),
      low: this.t('DISPUTES_DASHBOARD.PRIORITY.LOW')
    };

    return labels[priority];
  }

  isEvidencePreviewAvailable(file: EvidenceItem, index: number): boolean {
    return file.type === 'image' && !!file.preview && !this.brokenEvidencePreviewKeys.has(this.getEvidenceKey(file, index));
  }

  onEvidencePreviewError(file: EvidenceItem, index: number): void {
    this.brokenEvidencePreviewKeys = new Set<string>([
      ...this.brokenEvidencePreviewKeys,
      this.getEvidenceKey(file, index)
    ]);
  }

  getEvidenceIcon(file: EvidenceItem): string {
    return file.type === 'image' ? 'image' : 'description';
  }

  getEvidenceTypeToken(file: EvidenceItem): string {
    return file.type === 'image' ? 'IMG' : 'PDF';
  }

  trackEvidence(_: number, file: EvidenceItem): string {
    return `${file.type}-${file.label}`;
  }

  getEvidencePreviewItems(evidence: EvidenceItem[]): EvidenceItem[] {
    return evidence.slice(0, 2);
  }

  private createDefaultForm(dispute: DisputeRow): EscalationDecisionForm {
    return createDefaultEscalationDecisionForm(
      dispute,
      this.t('DISPUTES_DASHBOARD.ESCALATION_MODAL.DEFAULT_ACTION'),
      this.getDefaultDeadline()
    );
  }

  private createEmptyForm(): EscalationDecisionForm {
    return {
      target: 'operations',
      priority: 'medium',
      reason: 'other',
      detailedExplanation: '',
      reviewedSummary: '',
      requestedAction: '',
      responseDeadline: '',
      notifyEscalatedTeam: true,
      notifyCurrentReviewer: true,
      addTrackingNote: false,
      markHighRisk: false
    };
  }

  private getDefaultDeadline(): string {
    const date = new Date();
    date.setHours(date.getHours() + 6, 0, 0, 0);

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  private getEvidenceKey(file: EvidenceItem, index: number): string {
    return `${index}-${file.type}-${file.label}`;
  }
}
