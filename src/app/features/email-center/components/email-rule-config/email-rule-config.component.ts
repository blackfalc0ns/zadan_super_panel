import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SearchableSelectComponent, SearchableSelectOption } from '@shared/components/ui/form-controls/select/searchable-select.component';
import { StatusPillComponent, StatusPillVariant } from '@shared/components/ui/status-pill/status-pill.component';
import {
  DIRECTORY_PERSONA_LABELS,
  DIRECTORY_PANEL_LABELS,
  DirectoryAudienceType,
  DirectoryPanelScope,
  DirectoryPersonaType
} from '@admin-users/public-api';
import {
  EmailAutomationState,
  EmailBranchOption,
  EmailBranchScopeMode,
  EmailRecipientTargetId,
  EmailResolvedRecipients,
  EmailScopeOption,
  EmailSenderProfile,
  EmailSenderProfileStatus,
  EmailTestSendResult,
  EmailWorkflowRule
} from '../../models/email-center.models';
import { EmailTemplatePanelComponent } from '../email-template-panel/email-template-panel.component';

type RecipientChannel = 'to' | 'cc' | 'bcc';

const RECIPIENT_OPTIONS: Record<DirectoryAudienceType, Array<{ id: EmailRecipientTargetId; labelKey: string }>> = {
  super_admin: [
    { id: 'primary_account_email', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.PRIMARY_ACCOUNT_EMAIL' },
    { id: 'assigned_super_admin_manager', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.ASSIGNED_SUPER_ADMIN_MANAGER' }
  ],
  vendor_network: [
    { id: 'primary_account_email', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.PRIMARY_ACCOUNT_EMAIL' },
    { id: 'vendor_owner', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.VENDOR_OWNER' },
    { id: 'vendor_company_manager', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.VENDOR_COMPANY_MANAGER' },
    { id: 'branch_manager', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.BRANCH_MANAGER' },
    { id: 'branch_staff', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.BRANCH_STAFF' },
    { id: 'vendor_finance', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.VENDOR_FINANCE' },
    { id: 'vendor_support', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.VENDOR_SUPPORT' },
    { id: 'assigned_super_admin_manager', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.ASSIGNED_SUPER_ADMIN_MANAGER' }
  ],
  drivers: [
    { id: 'driver_account', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.DRIVER_ACCOUNT' },
    { id: 'assigned_super_admin_manager', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.ASSIGNED_SUPER_ADMIN_MANAGER' }
  ],
  customers: [
    { id: 'customer_account', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.CUSTOMER_ACCOUNT' },
    { id: 'assigned_super_admin_manager', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.ASSIGNED_SUPER_ADMIN_MANAGER' }
  ]
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-email-rule-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SearchableSelectComponent,
    StatusPillComponent,
    EmailTemplatePanelComponent
  ],
  templateUrl: './email-rule-config.component.html',
  styleUrl: './email-rule-config.component.scss'
})
export class EmailRuleConfigComponent implements OnChanges {
  private readonly translate = inject(TranslateService);

  @Input() rule!: EmailWorkflowRule;
  @Input() senderProfiles: EmailSenderProfile[] = [];
  @Input() vendorOptions: EmailScopeOption[] = [];
  @Input() branchDirectory: EmailBranchOption[] = [];
  @Input() resolvedRecipients!: EmailResolvedRecipients;
  @Input() lastTestSendResult: EmailTestSendResult | null = null;
  @Input() canEdit = false;
  @Input() isSaving = false;
  @Input() isTestingSend = false;
  @Input() isResolvingRecipients = false;

  @Output() save = new EventEmitter<void>();
  @Output() testSend = new EventEmitter<void>();
  @Output() draftChange = new EventEmitter<void>();
  @Output() vendorChange = new EventEmitter<string | null>();
  @Output() branchScopeModeChange = new EventEmitter<EmailBranchScopeMode>();

  activeTab: 'routing' | 'template' | 'delivery' = 'routing';
  recipientEditor = {
    staticTo: '',
    staticCc: '',
    staticBcc: '',
    fallbackTo: '',
    fallbackCc: '',
    fallbackBcc: ''
  };

  readonly branchScopeOptions: Array<{ value: EmailBranchScopeMode; labelKey: string }> = [
    { value: 'all_branches', labelKey: 'EMAIL_CENTER.BRANCH_SCOPE.ALL_BRANCHES' },
    { value: 'assigned_branch', labelKey: 'EMAIL_CENTER.BRANCH_SCOPE.ASSIGNED_BRANCH' },
    { value: 'specific_branch', labelKey: 'EMAIL_CENTER.BRANCH_SCOPE.SPECIFIC_BRANCH' }
  ];

  readonly recipientChannels: Array<{ value: RecipientChannel; labelKey: string }> = [
    { value: 'to', labelKey: 'EMAIL_CENTER.FIELDS.DIRECTORY_TO' },
    { value: 'cc', labelKey: 'EMAIL_CENTER.FIELDS.DIRECTORY_CC' },
    { value: 'bcc', labelKey: 'EMAIL_CENTER.FIELDS.DIRECTORY_BCC' }
  ];

  get availableRecipientTargets(): Array<{ id: EmailRecipientTargetId; labelKey: string }> {
    return this.rule ? RECIPIENT_OPTIONS[this.rule.audienceType] : [];
  }

  get availablePersonaOptions(): Array<{ value: DirectoryPersonaType; labelKey: string }> {
    if (!this.rule) {
      return [];
    }

    return Object.entries(DIRECTORY_PERSONA_LABELS)
      .filter(([persona]) => this.mapPersonaToAudience(persona as DirectoryPersonaType) === this.rule.audienceType)
      .map(([value, labelKey]) => ({
        value: value as DirectoryPersonaType,
        labelKey
      }));
  }

  get branchOptions(): EmailBranchOption[] {
    const vendorId = this.rule?.entityScope.vendorId;
    return vendorId ? this.branchDirectory.filter((branch) => branch.vendorId === vendorId) : [];
  }

  get mappedVendorOptions(): SearchableSelectOption<string | null>[] {
    return [
      { value: null, labelKey: 'EMAIL_CENTER.FILTERS.ALL_VENDORS' },
      ...this.vendorOptions.map((vendor) => ({ value: vendor.id, label: vendor.name }))
    ];
  }

  get mappedBranchOptions(): SearchableSelectOption<string | null>[] {
    return [
      { value: null, labelKey: 'EMAIL_CENTER.FILTERS.ALL_BRANCHES' },
      ...this.branchOptions.map((branch) => ({ value: branch.id, label: branch.name }))
    ];
  }

  get enabledOptions(): SearchableSelectOption<boolean>[] {
    return [
      { value: true, labelKey: 'EMAIL_CENTER.WORKFLOWS.ENABLED' },
      { value: false, labelKey: 'EMAIL_CENTER.WORKFLOWS.DISABLED' }
    ];
  }

  get senderProfileOptions(): SearchableSelectOption<string>[] {
    return this.senderProfiles.map((profile) => {
      const key = `EMAIL_CENTER.PROFILES.${profile.id.toUpperCase().replace(/-/g, '_')}_NAME`;
      return {
        value: profile.id,
        labelKey: key,
        label: profile.name
      };
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rule'] && this.rule) {
      this.syncRecipientsFromRule();
    }
  }

  setTab(tab: 'routing' | 'template' | 'delivery'): void {
    this.activeTab = tab;
  }

  onRuleDraftChanged(): void {
    this.draftChange.emit();
  }

  onRecipientEditorChanged(): void {
    this.syncDraftRouteFromEditor();
    this.draftChange.emit();
  }

  onVendorChange(vendorId: string | null): void {
    this.vendorChange.emit(vendorId);
  }

  onBranchScopeModeChange(branchScopeMode: EmailBranchScopeMode): void {
    this.branchScopeModeChange.emit(branchScopeMode);
  }

  hasRecipientTarget(channel: RecipientChannel, targetId: EmailRecipientTargetId): boolean {
    return Boolean(this.rule?.recipientTargets[channel].includes(targetId));
  }

  toggleRecipientTarget(channel: RecipientChannel, targetId: EmailRecipientTargetId, enabled: boolean): void {
    if (!this.canEdit || !this.rule) {
      return;
    }

    const current = new Set(this.rule.recipientTargets[channel]);
    if (enabled) {
      current.add(targetId);
    } else {
      current.delete(targetId);
    }

    this.rule.recipientTargets[channel] = [...current];
    this.draftChange.emit();
  }

  hasPersonaTarget(personaType: DirectoryPersonaType): boolean {
    return Boolean(this.rule?.personaTargets.includes(personaType));
  }

  togglePersonaTarget(personaType: DirectoryPersonaType, enabled: boolean): void {
    if (!this.canEdit || !this.rule) {
      return;
    }

    const current = new Set(this.rule.personaTargets);
    if (enabled) {
      current.add(personaType);
    } else {
      current.delete(personaType);
    }

    this.rule.personaTargets = [...current];
    this.draftChange.emit();
  }

  getSenderProfileName(id: string): string {
    const profile = this.senderProfiles.find((p) => p.id === id);
    if (!profile) return '-';
    const key = `EMAIL_CENTER.PROFILES.${profile.id.toUpperCase().replace(/-/g, '_')}_NAME`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : profile.name;
  }

  getPanelLabelKey(panelScope: DirectoryPanelScope): string {
    return DIRECTORY_PANEL_LABELS[panelScope];
  }

  getAutomationVariant(state: EmailAutomationState): StatusPillVariant {
    return state === 'live' ? 'success' : 'neutral';
  }

  getDispatchStatusVariant(status: string): StatusPillVariant {
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

  getDispatchStatusLabelKey(status: string): string {
    return `EMAIL_CENTER.DISPATCH_STATUS.${status.toUpperCase()}`;
  }

  getLastDispatchLabelKey(rule: EmailWorkflowRule): string {
    return rule.lastDispatch
      ? this.getDispatchStatusLabelKey(rule.lastDispatch.status)
      : 'EMAIL_CENTER.HISTORY.NO_DISPATCH';
  }

  private syncRecipientsFromRule(): void {
    this.recipientEditor = {
      staticTo: this.rule.route.staticTo.join(', '),
      staticCc: this.rule.route.staticCc.join(', '),
      staticBcc: this.rule.route.staticBcc.join(', '),
      fallbackTo: this.rule.route.fallbackTo.join(', '),
      fallbackCc: this.rule.route.fallbackCc.join(', '),
      fallbackBcc: this.rule.route.fallbackBcc.join(', ')
    };
  }

  private syncDraftRouteFromEditor(): void {
    if (!this.rule) {
      return;
    }

    this.rule.route.staticTo = this.parseRecipients(this.recipientEditor.staticTo);
    this.rule.route.staticCc = this.parseRecipients(this.recipientEditor.staticCc);
    this.rule.route.staticBcc = this.parseRecipients(this.recipientEditor.staticBcc);
    this.rule.route.fallbackTo = this.parseRecipients(this.recipientEditor.fallbackTo);
    this.rule.route.fallbackCc = this.parseRecipients(this.recipientEditor.fallbackCc);
    this.rule.route.fallbackBcc = this.parseRecipients(this.recipientEditor.fallbackBcc);
  }

  private parseRecipients(value: string): string[] {
    return [...new Set(
      value
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean)
    )];
  }

  private mapPersonaToAudience(personaType: DirectoryPersonaType): DirectoryAudienceType {
    switch (personaType) {
      case 'super_admin_manager':
      case 'super_admin_staff':
        return 'super_admin';
      case 'vendor_owner':
      case 'vendor_company_manager':
      case 'vendor_branch_manager':
      case 'vendor_branch_employee':
      case 'vendor_finance':
      case 'vendor_support':
        return 'vendor_network';
      case 'driver':
        return 'drivers';
      case 'customer':
      default:
        return 'customers';
    }
  }
}
