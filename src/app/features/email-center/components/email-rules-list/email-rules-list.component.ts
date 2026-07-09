import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, StatusPillComponent],
  templateUrl: './email-rules-list.component.html',
  styleUrl: './email-rules-list.component.scss'
})
export class EmailRulesListComponent {
  @Input() rules: EmailWorkflowRule[] = [];
  @Input() selectedRuleId = '';
  @Input() mode: 'sidebar' | 'grid' = 'grid';

  searchTerm = '';

  get visibleRules(): EmailWorkflowRule[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) {
      return this.rules;
    }

    return this.rules.filter((rule) =>
      rule.id.toLowerCase().includes(query) ||
      rule.titleKey.toLowerCase().includes(query) ||
      rule.subtitleKey.toLowerCase().includes(query) ||
      rule.categoryKey.toLowerCase().includes(query)
    );
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
