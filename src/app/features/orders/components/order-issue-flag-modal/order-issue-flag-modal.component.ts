import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { OrderDetail, OrderIssueFlagForm } from '../../orders.models';

type IssueOption = { value: OrderIssueFlagForm['issueType'] };

@Component({
  selector: 'app-order-issue-flag-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent],
  templateUrl: './order-issue-flag-modal.component.html',
  styleUrl: './order-issue-flag-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderIssueFlagModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() order: OrderDetail | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saveNote = new EventEmitter<OrderIssueFlagForm>();
  @Output() submitIssue = new EventEmitter<OrderIssueFlagForm>();

  readonly issueOptions: IssueOption[] = [
    { value: 'prep_delay' },
    { value: 'delivery_delay' },
    { value: 'payment_issue' },
    { value: 'communication_issue' },
    { value: 'driver_unavailable' },
    { value: 'address_issue' },
    { value: 'fraud_suspicion' },
    { value: 'other' }
  ];

  readonly priorityOptions: OrderIssueFlagForm['priority'][] = ['low', 'medium', 'high', 'critical'];
  readonly teamOptions: OrderIssueFlagForm['assignedTeam'][] = ['operations', 'finance', 'compliance'];

  form: OrderIssueFlagForm = this.createEmptyForm();

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['order']) && this.isOpen) {
      this.form = this.createDefaultForm();
    }
  }

  get latestActivityTime(): string {
    return this.order?.activities[0]?.time || this.order?.time || '--:--';
  }

  get isSlaWarning(): boolean {
    return (this.order?.slaScore ?? 100) < 99;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  getIssueClasses(issueType: OrderIssueFlagForm['issueType']): string {
    if (this.form.issueType === issueType) {
      return 'border-teal-600 bg-teal-50 text-teal-700 shadow-sm';
    }

    return 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
  }

  getPriorityClasses(priority: OrderIssueFlagForm['priority']): string {
    if (this.form.priority !== priority) {
      return 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50';
    }

    const selectedClasses: Record<OrderIssueFlagForm['priority'], string> = {
      low: 'border border-slate-200 bg-slate-100 text-slate-700',
      medium: 'border border-amber-300 bg-amber-100 text-amber-800 ring-2 ring-amber-300 ring-offset-2 ring-offset-white',
      high: 'border border-slate-200 bg-white text-slate-900',
      critical: 'border border-red-200 bg-red-100 text-red-600'
    };

    return selectedClasses[priority];
  }

  onSaveNote(): void {
    this.saveNote.emit({ ...this.form });
  }

  onSubmit(): void {
    this.submitIssue.emit({ ...this.form });
  }

  private createDefaultForm(): OrderIssueFlagForm {
    return {
      issueType: 'delivery_delay',
      priority: 'medium',
      requiredAction: '',
      assignedTeam: 'operations',
      followUpDate: '',
      showInOperationsCenter: false,
      notifyAssignedTeam: true,
      highRiskAlert: false
    };
  }

  private createEmptyForm(): OrderIssueFlagForm {
    return {
      issueType: 'prep_delay',
      priority: 'medium',
      requiredAction: '',
      assignedTeam: 'operations',
      followUpDate: '',
      showInOperationsCenter: false,
      notifyAssignedTeam: true,
      highRiskAlert: false
    };
  }
}
