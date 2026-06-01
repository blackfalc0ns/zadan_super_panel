import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StatusPillComponent, StatusPillVariant } from '@shared/components/ui/status-pill/status-pill.component';
import {
  DIRECTORY_PANEL_LABELS,
  DirectoryPanelScope
} from '@admin-users/public-api';
import {
  EmailAutomationState,
  EmailDispatchStatus,
  EmailWorkflowRule
} from '../../models/email-center.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-email-rules-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, StatusPillComponent],
  templateUrl: './email-rules-list.component.html'
})
export class EmailRulesListComponent {
  @Input() rules: EmailWorkflowRule[] = [];
  @Input() selectedRuleId = '';
  @Output() ruleSelected = new EventEmitter<string>();

  selectRule(id: string): void {
    this.ruleSelected.emit(id);
  }

  getPanelLabelKey(panelScope: DirectoryPanelScope): string {
    return DIRECTORY_PANEL_LABELS[panelScope];
  }

  getAutomationVariant(state: EmailAutomationState): StatusPillVariant {
    return state === 'live' ? 'success' : 'neutral';
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

  getLastDispatchLabelKey(rule: EmailWorkflowRule): string {
    return rule.lastDispatch
      ? this.getDispatchStatusLabelKey(rule.lastDispatch.status)
      : 'EMAIL_CENTER.HISTORY.NO_DISPATCH';
  }
}
