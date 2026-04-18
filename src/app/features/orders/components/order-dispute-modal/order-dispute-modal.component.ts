import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { SearchableSelectComponent } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { OrderDetail, OrderDisputeForm } from '../../models/orders.models';
import { getPaymentStatusLabel } from '../../data/orders.mock';

type DisputeTypeOption = { value: OrderDisputeForm['disputeType']; icon: string };

@Component({
  selector: 'app-order-dispute-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent, SearchableSelectComponent],
  templateUrl: './order-dispute-modal.component.html',
  styleUrl: './order-dispute-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDisputeModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() order: OrderDetail | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<OrderDisputeForm>();
  @Output() submitDispute = new EventEmitter<OrderDisputeForm>();

  readonly disputeTypeOptions: DisputeTypeOption[] = [
    { value: 'payment_issue', icon: 'payments' },
    { value: 'quality_issue', icon: 'high_quality' },
    { value: 'not_received', icon: 'package_2' },
    { value: 'missing_item', icon: 'inventory_2' },
    { value: 'customer_rejected', icon: 'person_off' },
    { value: 'delivery_failure', icon: 'local_shipping' },
    { value: 'fraud', icon: 'report' },
    { value: 'other', icon: 'more_horiz' }
  ];

  readonly priorityOptions: OrderDisputeForm['priority'][] = ['low', 'medium', 'high', 'critical'];
  readonly routeOptions: OrderDisputeForm['routeTo'][] = ['operations', 'finance', 'risk', 'support', 'legal'];

  form: OrderDisputeForm = this.createEmptyForm();

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['order']) && this.isOpen && this.order) {
      this.form = this.createDefaultForm();
    }
  }

  get paymentStatusLabel(): string {
    return this.order ? getPaymentStatusLabel(this.order.paymentStatus) : '--';
  }

  get routeSelectOptions() {
    return this.routeOptions.map((route) => ({
      value: route,
      labelKey: 'ORDERS.DETAIL.DISPUTE_MODAL.ROUTES.' + route.toUpperCase()
    }));
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  getTypeCardClasses(type: OrderDisputeForm['disputeType']): string {
    if (this.form.disputeType === type) {
      return 'border-zadna-primary bg-zadna-primary/10 text-zadna-primary ring-1 ring-zadna-primary';
    }

    if (type === 'fraud') {
      return 'border-slate-200 text-slate-700 hover:border-red-300 hover:bg-red-50/60';
    }

    return 'border-slate-200 text-slate-700 hover:border-zadna-primary hover:bg-zadna-primary/5';
  }

  getTypeIconClasses(type: OrderDisputeForm['disputeType']): string {
    return type === 'fraud' && this.form.disputeType !== type ? 'text-red-500' : '';
  }

  getPriorityButtonClasses(priority: OrderDisputeForm['priority']): string {
    if (this.form.priority !== priority) {
      return 'border-slate-200 text-slate-500 hover:bg-slate-50';
    }

    const selectedClasses: Record<OrderDisputeForm['priority'], string> = {
      low: 'border-slate-300 bg-slate-100 text-slate-700',
      medium: 'border-teal-200 bg-teal-50 text-teal-700',
      high: 'border-amber-300 bg-amber-50 text-amber-700',
      critical: 'border-red-300 bg-red-50 text-red-600'
    };

    return selectedClasses[priority];
  }

  onSaveDraft(): void {
    this.saveDraft.emit({ ...this.form });
  }

  onSubmit(): void {
    this.submitDispute.emit({ ...this.form });
  }

  private createDefaultForm(): OrderDisputeForm {
    return {
      disputeType: 'quality_issue',
      priority: 'high',
      routeTo: 'operations',
      description: '',
      internalNotes: '',
      notifyReviewer: true,
      addToLog: true,
      markHighRisk: false,
      notifyStakeholders: true
    };
  }

  private createEmptyForm(): OrderDisputeForm {
    return {
      disputeType: 'payment_issue',
      priority: 'medium',
      routeTo: 'operations',
      description: '',
      internalNotes: '',
      notifyReviewer: true,
      addToLog: true,
      markHighRisk: false,
      notifyStakeholders: true
    };
  }
}
