import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  DIRECTORY_AUDIENCE_LABELS,
  DIRECTORY_PANEL_LABELS,
  DIRECTORY_PERSONA_LABELS,
  DirectoryAudienceType,
  DirectoryPanelScope,
  DirectoryPersonaType
} from '@admin-users/public-api';
import { AdminUsersService } from '@admin-users/public-api';
import { AccessService } from '@core/services/access.service';
import { KpiCardsComponent, KPICard } from '@shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { SearchableSelectComponent, SearchableSelectOption } from '@shared/components/ui/form-controls/select/searchable-select.component';
import { StatusPillComponent, StatusPillVariant } from '@shared/components/ui/status-pill/status-pill.component';
import {
  EmailBranchScopeMode,
  EmailPreviewLocale,
  EmailRecipientTargetId,
  EmailResolvedRecipients,
  EmailSenderProfile,
  EmailSenderProfileStatus,
  EmailWorkflowRule
} from '../models/email-center.models';
import { EmailCenterService } from '../services/email-center.service';

type EmailAudienceFilter = 'all' | DirectoryAudienceType;
type RecipientChannel = 'to' | 'cc' | 'bcc';

@Component({
  selector: 'app-email-center',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppPageHeaderComponent,
    KpiCardsComponent,
    SearchableSelectComponent,
    StatusPillComponent
  ],
  templateUrl: './email-center.component.html',
  styleUrl: './email-center.component.scss'
})
export class EmailCenterComponent implements OnInit {
  senderProfiles: EmailSenderProfile[] = [];
  rules: EmailWorkflowRule[] = [];
  selectedRuleId = '';
  selectedAudience: EmailAudienceFilter = 'all';
  previewLocale: EmailPreviewLocale = 'en';
  recipientEditor = {
    staticTo: '',
    staticCc: '',
    staticBcc: '',
    fallbackTo: '',
    fallbackCc: '',
    fallbackBcc: ''
  };

  readonly audienceTabs: Array<{ value: EmailAudienceFilter; labelKey: string }> = [
    { value: 'all', labelKey: 'EMAIL_CENTER.AUDIENCE.ALL' },
    ...Object.entries(DIRECTORY_AUDIENCE_LABELS).map(([value, labelKey]) => ({
      value: value as DirectoryAudienceType,
      labelKey
    }))
  ];

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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly accessService: AccessService,
    private readonly adminUsersService: AdminUsersService,
    private readonly emailCenterService: EmailCenterService
  ) {}

  ngOnInit(): void {
    this.senderProfiles = this.emailCenterService.getSenderProfiles();
    this.rules = this.emailCenterService.getRules();

    this.route.queryParamMap.subscribe((params) => {
      this.selectedAudience = this.normalizeAudience(params.get('audience'));

      const vendorId = params.get('vendor');
      const entityId = params.get('entityId');
      if (vendorId || entityId) {
        this.applyQueryScope(vendorId, entityId);
      }

      this.ensureSelectedRule();
      this.syncRecipientsFromSelectedRule();
    });
  }

  get kpiCards(): KPICard[] {
    const snapshot = this.emailCenterService.getKpiSnapshot();

    return [
      {
        id: 'total-rules',
        title: 'EMAIL_CENTER.KPI.TOTAL_RULES',
        value: snapshot.totalRules,
        icon: '<span class="material-symbols-outlined text-[20px]">notifications_active</span>',
        color: '#127c8c'
      },
      {
        id: 'enabled-rules',
        title: 'EMAIL_CENTER.KPI.ENABLED',
        value: snapshot.enabledRules,
        icon: '<span class="material-symbols-outlined text-[20px]">toggle_on</span>',
        color: '#10b981'
      },
      {
        id: 'sender-profiles',
        title: 'EMAIL_CENTER.KPI.SENDER_PROFILES',
        value: snapshot.senderProfiles,
        icon: '<span class="material-symbols-outlined text-[20px]">alternate_email</span>',
        color: '#2563eb'
      },
      {
        id: 'directory-rules',
        title: 'EMAIL_CENTER.KPI.DIRECTORY_DRIVEN',
        value: snapshot.directoryDrivenRules,
        icon: '<span class="material-symbols-outlined text-[20px]">hub</span>',
        color: '#f59e0b'
      },
      {
        id: 'audience-coverage',
        title: 'EMAIL_CENTER.KPI.AUDIENCE_COVERAGE',
        value: snapshot.audienceCoverage,
        icon: '<span class="material-symbols-outlined text-[20px]">groups</span>',
        color: '#7c3aed'
      }
    ];
  }

  get filteredRules(): EmailWorkflowRule[] {
    return this.selectedAudience === 'all'
      ? this.rules
      : this.rules.filter((rule) => rule.audienceType === this.selectedAudience);
  }

  get selectedRule(): EmailWorkflowRule | undefined {
    return this.rules.find((rule) => rule.id === this.selectedRuleId);
  }

  get resolvedRecipients(): EmailResolvedRecipients {
    return this.selectedRule
      ? this.emailCenterService.resolveRuleRecipients(this.selectedRule)
      : { to: [], cc: [], bcc: [] };
  }

  get availableRecipientTargets(): Array<{ id: string; labelKey: string }> {
    return this.adminUsersService.getRecipientTargetOptions(this.selectedRule?.audienceType);
  }

  get availablePersonaOptions(): Array<{ value: DirectoryPersonaType; labelKey: string }> {
    if (!this.selectedRule) {
      return [];
    }

    return Object.entries(DIRECTORY_PERSONA_LABELS)
      .filter(([persona]) => this.mapPersonaToAudience(persona as DirectoryPersonaType) === this.selectedRule?.audienceType)
      .map(([value, labelKey]) => ({
        value: value as DirectoryPersonaType,
        labelKey
      }));
  }

  get canEdit(): boolean {
    return this.accessService.hasPermission('email_center.edit');
  }

  get vendorOptions(): Array<{ id: string; name: string }> {
    return this.adminUsersService.getVendorOptions().map((vendor) => ({ id: vendor.id, name: vendor.name }));
  }

  get branchOptions(): Array<{ id: string; name: string }> {
    return this.adminUsersService
      .getBranchOptions(this.selectedRule?.entityScope.vendorId ?? null)
      .map((branch) => ({ id: branch.id, name: branch.name }));
  }

  openAccessDirectory(): void {
    this.router.navigate(['/admin-users'], {
      queryParams: this.selectedAudience === 'all' ? {} : { audience: this.selectedAudience }
    });
  }

  setAudience(audience: EmailAudienceFilter): void {
    this.selectedAudience = audience;
    this.ensureSelectedRule();
    this.syncRecipientsFromSelectedRule();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { audience: audience === 'all' ? null : audience },
      queryParamsHandling: 'merge'
    });
  }

  selectRule(id: string): void {
    this.selectedRuleId = id;
    this.syncRecipientsFromSelectedRule();
  }

  saveSelectedRule(): void {
    if (!this.canEdit) {
      return;
    }

    const rule = this.selectedRule;
    if (!rule) {
      return;
    }

    rule.route.staticTo = this.parseRecipients(this.recipientEditor.staticTo);
    rule.route.staticCc = this.parseRecipients(this.recipientEditor.staticCc);
    rule.route.staticBcc = this.parseRecipients(this.recipientEditor.staticBcc);
    rule.route.fallbackTo = this.parseRecipients(this.recipientEditor.fallbackTo);
    rule.route.fallbackCc = this.parseRecipients(this.recipientEditor.fallbackCc);
    rule.route.fallbackBcc = this.parseRecipients(this.recipientEditor.fallbackBcc);

    const saved = this.emailCenterService.saveRule(rule);
    this.rules = this.rules.map((entry) => entry.id === saved.id ? saved : entry);
    this.selectedRuleId = saved.id;
    this.syncRecipientsFromSelectedRule();
  }

  setPreviewLocale(locale: EmailPreviewLocale): void {
    this.previewLocale = locale;
  }

  getSenderProfileName(id: string): string {
    return this.senderProfiles.find((profile) => profile.id === id)?.name ?? '-';
  }

  getSenderProfileVariant(status: EmailSenderProfileStatus): StatusPillVariant {
    const variants: Record<EmailSenderProfileStatus, StatusPillVariant> = {
      primary: 'success',
      secondary: 'info',
      backup: 'warning'
    };

    return variants[status];
  }

  getPanelLabelKey(panelScope: DirectoryPanelScope): string {
    return DIRECTORY_PANEL_LABELS[panelScope];
  }

  hasRecipientTarget(channel: RecipientChannel, targetId: string): boolean {
    return Boolean(this.selectedRule?.recipientTargets[channel].includes(targetId as EmailRecipientTargetId));
  }

  toggleRecipientTarget(channel: RecipientChannel, targetId: string, enabled: boolean): void {
    if (!this.canEdit) {
      return;
    }

    const rule = this.selectedRule;
    if (!rule) {
      return;
    }

    const current = new Set(rule.recipientTargets[channel]);
    if (enabled) {
      current.add(targetId as EmailRecipientTargetId);
    } else {
      current.delete(targetId as EmailRecipientTargetId);
    }

    rule.recipientTargets[channel] = [...current];
  }

  hasPersonaTarget(personaType: DirectoryPersonaType): boolean {
    return Boolean(this.selectedRule?.personaTargets.includes(personaType));
  }

  togglePersonaTarget(personaType: DirectoryPersonaType, enabled: boolean): void {
    if (!this.canEdit) {
      return;
    }

    const rule = this.selectedRule;
    if (!rule) {
      return;
    }

    const current = new Set(rule.personaTargets);
    if (enabled) {
      current.add(personaType);
    } else {
      current.delete(personaType);
    }

    rule.personaTargets = [...current];
  }

  onVendorChange(vendorId: string): void {
    if (!this.canEdit) {
      return;
    }

    const rule = this.selectedRule;
    if (!rule) {
      return;
    }

    rule.entityScope.vendorId = vendorId || null;
    if (!vendorId) {
      rule.entityScope.branchId = null;
    }
  }

  onBranchScopeModeChange(branchScopeMode: EmailBranchScopeMode): void {
    if (!this.canEdit) {
      return;
    }

    const rule = this.selectedRule;
    if (!rule) {
      return;
    }

    rule.branchScopeMode = branchScopeMode;
    if (branchScopeMode !== 'specific_branch') {
      rule.entityScope.branchId = null;
    }
  }

  private applyQueryScope(vendorId: string | null, entityId: string | null): void {
    const current = this.rules.find((rule) => this.selectedRuleId ? rule.id === this.selectedRuleId : true)
      ?? this.rules[0];

    if (!current) {
      return;
    }

    if (vendorId) {
      current.entityScope.vendorId = vendorId;
    }

    if (entityId) {
      current.entityScope.entityId = entityId;
    }
  }

  private ensureSelectedRule(): void {
    if (this.filteredRules.some((rule) => rule.id === this.selectedRuleId)) {
      return;
    }

    this.selectedRuleId = this.filteredRules[0]?.id ?? '';
  }

  private syncRecipientsFromSelectedRule(): void {
    const rule = this.selectedRule;
    this.recipientEditor = {
      staticTo: rule?.route.staticTo.join(', ') ?? '',
      staticCc: rule?.route.staticCc.join(', ') ?? '',
      staticBcc: rule?.route.staticBcc.join(', ') ?? '',
      fallbackTo: rule?.route.fallbackTo.join(', ') ?? '',
      fallbackCc: rule?.route.fallbackCc.join(', ') ?? '',
      fallbackBcc: rule?.route.fallbackBcc.join(', ') ?? ''
    };
  }

  private normalizeAudience(value: string | null): EmailAudienceFilter {
    if (value === 'super_admin' || value === 'vendor_network' || value === 'drivers' || value === 'customers') {
      return value;
    }

    return 'all';
  }

  private parseRecipients(value: string): string[] {
    return value
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
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

  get mappedVendorOptions(): any[] {
    return [
      {value: null, labelKey: 'EMAIL_CENTER.FILTERS.ALL_VENDORS'},
      ...this.vendorOptions.map((x: any) => ({value: x.id, label: x.name}))
    ];
  }
  get mappedBranchOptions(): any[] {
    return [
      {value: null, labelKey: 'EMAIL_CENTER.FILTERS.ALL_BRANCHES'},
      ...this.branchOptions.map((x: any) => ({value: x.id, label: x.name}))
    ];
  }

  get enabledOptions(): SearchableSelectOption<boolean>[] {
    return [
      { value: true, labelKey: 'EMAIL_CENTER.WORKFLOWS.ENABLED' },
      { value: false, labelKey: 'EMAIL_CENTER.WORKFLOWS.DISABLED' }
    ];
  }

  get senderProfileOptions(): SearchableSelectOption<string>[] {
    return this.senderProfiles.map((profile) => ({
      value: profile.id,
      label: profile.name
    }));
  }
}
