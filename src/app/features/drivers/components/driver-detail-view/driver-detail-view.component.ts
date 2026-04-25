import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { DetailTabsNavComponent, DetailTabNavItem } from '../../../../shared/components/ui/detail-tabs-nav/detail-tabs-nav.component';
import { QuickPreviewDrawerComponent, PreviewAction } from '../../../../shared/components/ui/quick-preview-drawer/quick-preview-drawer.component';
import { StatusPillComponent } from '../../../../shared/components/ui/status-pill/status-pill.component';

import { DriverHeroComponent } from '../driver-hero/driver-hero.component';
import { DriverCommandCenterComponent } from '../driver-command-center/driver-command-center.component';
import { DriverOverviewTabComponent } from '../driver-overview-tab/driver-overview-tab.component';
import { DriverOperationsTabComponent } from '../driver-operations-tab/driver-operations-tab.component';
import { DriverPerformanceTabComponent } from '../driver-performance-tab/driver-performance-tab.component';
import { DriverSupportTabComponent } from '../driver-support-tab/driver-support-tab.component';
import { DriverComplianceTabComponent } from '../driver-compliance-tab/driver-compliance-tab.component';
import { DriverFinanceTabComponent } from '../driver-finance-tab/driver-finance-tab.component';
import { DriverVerificationTabComponent } from '../driver-verification-tab/driver-verification-tab.component';

import { DriverLifecycleTabDefinition, DriverLifecycleTabId, DriverPreviewType } from '../../models/driver-view.types';
import {
  getIncidentSeverityVariant,
  getTaskStatusKey,
  getIncidentTypeKey,
  getIncidentSeverityKey
} from '../../utils/driver-ui.utils';
import {
  DriverDetailRecord,
  DriverIncidentRecord,
  DriverTaskAssignment,
  DriverWorkflowActionId
} from '../../models/drivers.models';

@Component({
  selector: 'app-driver-detail-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    DetailTabsNavComponent,
    QuickPreviewDrawerComponent,
    StatusPillComponent,
    DriverHeroComponent,
    DriverCommandCenterComponent,
    DriverOverviewTabComponent,
    DriverOperationsTabComponent,
    DriverPerformanceTabComponent,
    DriverSupportTabComponent,
    DriverComplianceTabComponent,
    DriverFinanceTabComponent,
    DriverVerificationTabComponent
  ],
  templateUrl: './driver-detail-view.component.html',
  styleUrls: ['./driver-detail-view.component.scss']
})
export class DriverDetailViewComponent {
  @Input() driverDetail: DriverDetailRecord | null = null;
  @Input() isLoading = false;
  @Input() currentTab: DriverLifecycleTabId = 'overview';
  @Input() quickNote = '';
  @Input() reviewerDecisionNote = '';
  @Input() selectedRejectionReason = '';
  @Input() internalReviewNote = '';
  @Input() mapPreviewUrl: SafeResourceUrl | null = null;
  @Input() previewType: DriverPreviewType | null = null;
  @Input() selectedTask: DriverTaskAssignment | null = null;
  @Input() selectedIncident: DriverIncidentRecord | null = null;
  @Input() isRTL = true;

  @Output() tabChange = new EventEmitter<DriverLifecycleTabId>();
  @Output() workflowActionRequested = new EventEmitter<DriverWorkflowActionId>();

  @Output() editDriverRequested = new EventEmitter<void>();
  @Output() openTasksRequested = new EventEmitter<void>();
  @Output() toggleSuspensionRequested = new EventEmitter<void>();

  @Output() quickNoteChange = new EventEmitter<string>();
  @Output() quickNoteAdded = new EventEmitter<void>();
  @Output() reviewerDecisionNoteChange = new EventEmitter<string>();
  @Output() internalReviewNoteChange = new EventEmitter<string>();
  @Output() selectedRejectionReasonChange = new EventEmitter<string>();

  @Output() taskPreviewRequested = new EventEmitter<DriverTaskAssignment>();
  @Output() incidentPreviewRequested = new EventEmitter<DriverIncidentRecord>();
  @Output() previewClosed = new EventEmitter<void>();
  @Output() previewActionClick = new EventEmitter<PreviewAction>();

  previewTitle = '';
  previewSubtitle = '';
  previewActions: PreviewAction[] = [];

  constructor() {}

  get driver(): DriverDetailRecord | null {
    return this.driverDetail;
  }

  get navItems(): DetailTabNavItem[] {
    if (!this.driverDetail) return [];
    
    // Build tabs based on the new design requirements
    return [
      { id: 'overview', labelKey: 'DRIVERS.DETAIL.TABS.OVERVIEW', icon: 'person' },
      { id: 'operations', labelKey: 'DRIVERS.DETAIL.TABS.OPERATIONS', icon: 'local_shipping' },
      { id: 'performance', labelKey: 'DRIVERS.DETAIL.TABS.PERFORMANCE', icon: 'trending_up' },
      { id: 'support', labelKey: 'DRIVERS.DETAIL.TABS.SUPPORT', icon: 'support_agent', count: this.driverDetail.support.openNotesCount + this.driverDetail.support.unresolvedCount, attention: this.driverDetail.support.unresolvedCount > 0 },
      { id: 'compliance', labelKey: 'DRIVERS.DETAIL.TABS.COMPLIANCE', icon: 'gavel', count: this.driverDetail.compliance.openCases, attention: this.driverDetail.compliance.criticalCases > 0 },
      { id: 'finance', labelKey: 'DRIVERS.DETAIL.TABS.FINANCE', icon: 'account_balance_wallet', attention: this.driverDetail.finance.dueAmount > 1000 },
      { id: 'verification', labelKey: 'DRIVERS.DETAIL.TABS.VERIFICATION', icon: 'verified_user', attention: this.driverDetail.verificationStatus !== 'Verified' }
    ];
  }

  onTabChange(tabId: string) {
    this.tabChange.emit(tabId as DriverLifecycleTabId);
  }

  // Preview Methods
  closePreview() {
    this.previewClosed.emit();
  }

  handlePreviewAction(action: PreviewAction) {
    this.previewActionClick.emit(action);
  }

  getTaskStatusLabel(status: string) { return getTaskStatusKey(status as any); }
  getIncidentTypeLabel(type: string) { return getIncidentTypeKey(type); }
  getIncidentSeverityLabel(severity: string) { return getIncidentSeverityKey(severity as any); }
  getIncidentSummary(summary: string) { return summary; }
  
  getIncidentSeverityVariant(severity: string) {
    return getIncidentSeverityVariant(severity as any);
  }
}
