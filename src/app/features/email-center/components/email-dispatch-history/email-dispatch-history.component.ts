import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SearchableSelectComponent, SearchableSelectOption } from '@shared/components/ui/form-controls/select/searchable-select.component';
import { StatusPillComponent, StatusPillVariant } from '@shared/components/ui/status-pill/status-pill.component';
import {
  EmailDispatchFilters,
  EmailDispatchLog,
  EmailDispatchStatus,
  EmailWorkflowRule
} from '../../models/email-center.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-email-dispatch-history',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SearchableSelectComponent, StatusPillComponent],
  templateUrl: './email-dispatch-history.component.html',
  styleUrl: './email-dispatch-history.component.scss'
})
export class EmailDispatchHistoryComponent {
  @Input() dispatches: EmailDispatchLog[] = [];
  @Input() rules: EmailWorkflowRule[] = [];
  @Input() isHistoryLoading = false;
  @Input() filters: EmailDispatchFilters = {
    ruleId: null,
    source: null,
    status: null,
    dateFrom: null,
    dateTo: null
  };

  @Output() filtersChange = new EventEmitter<EmailDispatchFilters>();
  @Output() clearFilters = new EventEmitter<void>();

  get historyRuleOptions(): SearchableSelectOption<string | null>[] {
    return [
      { value: null, labelKey: 'EMAIL_CENTER.HISTORY.ALL_RULES' },
      ...this.rules.map((rule) => ({
        value: rule.id,
        labelKey: rule.titleKey
      }))
    ];
  }

  get historySourceOptions(): SearchableSelectOption<string | null>[] {
    return [
      { value: null, labelKey: 'EMAIL_CENTER.HISTORY.ALL_SOURCES' },
      { value: 'test_send', labelKey: 'EMAIL_CENTER.SOURCES.TEST_SEND' },
      { value: 'system_event', labelKey: 'EMAIL_CENTER.SOURCES.SYSTEM_EVENT' },
      { value: 'vendor_automation_live', labelKey: 'EMAIL_CENTER.SOURCES.VENDOR_AUTOMATION_LIVE' },
      { value: 'vendor_automation_legacy', labelKey: 'EMAIL_CENTER.SOURCES.VENDOR_AUTOMATION_LEGACY' }
    ];
  }

  get historyStatusOptions(): SearchableSelectOption<string | null>[] {
    return [
      { value: null, labelKey: 'EMAIL_CENTER.HISTORY.ALL_STATUSES' },
      { value: 'sent', labelKey: 'EMAIL_CENTER.DISPATCH_STATUS.SENT' },
      { value: 'failed', labelKey: 'EMAIL_CENTER.DISPATCH_STATUS.FAILED' },
      { value: 'skipped', labelKey: 'EMAIL_CENTER.DISPATCH_STATUS.SKIPPED' }
    ];
  }

  onFilterChange(): void {
    this.filtersChange.emit(this.filters);
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }

  getDispatchStatusVariant(status: EmailDispatchStatus | string): StatusPillVariant {
    switch (status) {
      case 'sent':
        return 'success';
      case 'failed':
        return 'danger';
      case 'skipped':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  getDispatchStatusLabelKey(status: EmailDispatchStatus | string): string {
    return `EMAIL_CENTER.DISPATCH_STATUS.${status.toUpperCase()}`;
  }

  getDispatchSourceLabelKey(source: string): string {
    return `EMAIL_CENTER.SOURCES.${source.toUpperCase()}`;
  }

  getDispatchRecipientCount(dispatch: EmailDispatchLog): number {
    return dispatch.to.length + dispatch.cc.length + dispatch.bcc.length;
  }

  getDispatchRuleLabel(dispatch: EmailDispatchLog): string {
    const rule = this.rules.find((r) => r.id === dispatch.ruleId);
    return rule ? rule.titleKey : '';
  }
}
