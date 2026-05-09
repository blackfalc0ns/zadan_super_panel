import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { AccessService } from '@core/services/access.service';
import { describeApiError } from '@marketing/utils/marketing-date.utils';
import { KpiCardsComponent, KPICard } from '@shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { SearchableSelectComponent, SearchableSelectOption } from '@shared/components/ui/form-controls/select/searchable-select.component';
import { StatusPillComponent, StatusPillVariant } from '@shared/components/ui/status-pill/status-pill.component';
import { ToastService } from '@shared/services/toast.service';
import { Subject, catchError, debounceTime, finalize, of, switchMap } from 'rxjs';
import {
  EmailAutomationState,
  EmailBranchOption,
  EmailBranchScopeMode,
  EmailCenterKpiSnapshot,
  EmailDispatchFilters,
  EmailDispatchLog,
  EmailDispatchStatus,
  EmailPreviewLocale,
  EmailRecipientTargetId,
  EmailResolvedRecipients,
  EmailScopeOption,
  EmailSenderProfile,
  EmailSenderProfileStatus,
  EmailTestSendResult,
  EmailWorkflowRule
} from '../models/email-center.models';
import { EmailCenterApiService } from '../services/email-center.service';

type EmailAudienceFilter = 'all' | DirectoryAudienceType;
type RecipientChannel = 'to' | 'cc' | 'bcc';

const EMPTY_KPI: EmailCenterKpiSnapshot = {
  totalRules: 0,
  enabledRules: 0,
  senderProfiles: 0,
  directoryDrivenRules: 0,
  audienceCoverage: 0
};

const EMPTY_RECIPIENTS: EmailResolvedRecipients = {
  to: [],
  cc: [],
  bcc: [],
  warnings: []
};

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
  vendorOptions: EmailScopeOption[] = [];
  branchDirectory: EmailBranchOption[] = [];
  dispatches: EmailDispatchLog[] = [];
  resolvedRecipients: EmailResolvedRecipients = { ...EMPTY_RECIPIENTS };
  kpiSnapshot: EmailCenterKpiSnapshot = { ...EMPTY_KPI };
  selectedRuleId = '';
  selectedAudience: EmailAudienceFilter = 'all';
  previewLocale: EmailPreviewLocale = 'en';
  isLoading = true;
  isSaving = false;
  isResolvingRecipients = false;
  isTestingSend = false;
  isHistoryLoading = false;
  pageError = '';
  lastTestSendResult: EmailTestSendResult | null = null;
  recipientEditor = {
    staticTo: '',
    staticCc: '',
    staticBcc: '',
    fallbackTo: '',
    fallbackCc: '',
    fallbackBcc: ''
  };

  historyFilters: EmailDispatchFilters = {
    ruleId: null,
    source: null,
    status: null,
    dateFrom: null,
    dateTo: null
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

  private readonly destroyRef = inject(DestroyRef);
  private readonly resolvePreview$ = new Subject<void>();
  private routeVendorId: string | null = null;
  private routeEntityId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly accessService: AccessService,
    private readonly toastService: ToastService,
    private readonly emailCenterApi: EmailCenterApiService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.selectedAudience = this.normalizeAudience(params.get('audience'));
        this.routeVendorId = params.get('vendor');
        this.routeEntityId = params.get('entityId');

        if (this.rules.length > 0) {
          this.applyRouteContext();
        }
      });

    this.resolvePreview$
      .pipe(
        debounceTime(350),
        switchMap(() => {
          const rule = this.selectedRule;
          if (!rule) {
            return of({ ...EMPTY_RECIPIENTS });
          }

          this.isResolvingRecipients = true;
          return this.emailCenterApi.resolveRecipients(this.buildRuleDraft(rule)).pipe(
            catchError((error) =>
              of({
                ...EMPTY_RECIPIENTS,
                warnings: [describeApiError(error)]
              })
            ),
            finalize(() => {
              this.isResolvingRecipients = false;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((resolved) => {
        this.resolvedRecipients = resolved;
      });

    this.loadOverview();
  }

  get kpiCards(): KPICard[] {
    return [
      {
        id: 'total-rules',
        title: 'EMAIL_CENTER.KPI.TOTAL_RULES',
        value: this.kpiSnapshot.totalRules,
        icon: '<span class="material-symbols-outlined text-[20px]">notifications_active</span>',
        color: '#127c8c'
      },
      {
        id: 'enabled-rules',
        title: 'EMAIL_CENTER.KPI.ENABLED',
        value: this.kpiSnapshot.enabledRules,
        icon: '<span class="material-symbols-outlined text-[20px]">toggle_on</span>',
        color: '#10b981'
      },
      {
        id: 'sender-profiles',
        title: 'EMAIL_CENTER.KPI.SENDER_PROFILES',
        value: this.kpiSnapshot.senderProfiles,
        icon: '<span class="material-symbols-outlined text-[20px]">alternate_email</span>',
        color: '#2563eb'
      },
      {
        id: 'directory-rules',
        title: 'EMAIL_CENTER.KPI.DIRECTORY_DRIVEN',
        value: this.kpiSnapshot.directoryDrivenRules,
        icon: '<span class="material-symbols-outlined text-[20px]">hub</span>',
        color: '#f59e0b'
      },
      {
        id: 'audience-coverage',
        title: 'EMAIL_CENTER.KPI.AUDIENCE_COVERAGE',
        value: this.kpiSnapshot.audienceCoverage,
        icon: '<span class="material-symbols-outlined text-[20px]">groups</span>',
        color: '#0f766e'
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

  get availableRecipientTargets(): Array<{ id: EmailRecipientTargetId; labelKey: string }> {
    return this.selectedRule ? RECIPIENT_OPTIONS[this.selectedRule.audienceType] : [];
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

  get branchOptions(): EmailBranchOption[] {
    const vendorId = this.selectedRule?.entityScope.vendorId;
    return vendorId ? this.branchDirectory.filter((branch) => branch.vendorId === vendorId) : [];
  }

  get canEdit(): boolean {
    return this.accessService.hasPermission('email_center.edit');
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
    return this.senderProfiles.map((profile) => ({
      value: profile.id,
      label: profile.name
    }));
  }

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

  openAccessDirectory(): void {
    this.router.navigate(['/admin-users'], {
      queryParams: this.selectedAudience === 'all' ? {} : { audience: this.selectedAudience }
    });
  }

  setAudience(audience: EmailAudienceFilter): void {
    this.selectedAudience = audience;
    this.ensureSelectedRule();
    this.syncRecipientsFromSelectedRule();
    this.historyFilters.ruleId = this.selectedRuleId || null;
    this.scheduleRecipientResolution();
    this.loadDispatchHistory();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { audience: audience === 'all' ? null : audience },
      queryParamsHandling: 'merge'
    });
  }

  selectRule(id: string): void {
    this.selectedRuleId = id;
    this.syncRecipientsFromSelectedRule();
    this.historyFilters.ruleId = id;
    this.lastTestSendResult = null;
    this.scheduleRecipientResolution();
    this.loadDispatchHistory();
  }

  saveSelectedRule(): void {
    if (!this.canEdit || !this.selectedRule) {
      return;
    }

    const draft = this.buildRuleDraft(this.selectedRule);
    this.isSaving = true;

    this.emailCenterApi.updateRule(draft)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (saved) => {
          this.replaceRule(saved);
          this.kpiSnapshot = this.recalculateKpiSnapshot();
          this.syncRecipientsFromSelectedRule();
          this.scheduleRecipientResolution();
          this.loadDispatchHistory();
          this.toastService.success('تم حفظ إعدادات القاعدة وربطها بالباك اند.', 'مركز البريد');
        },
        error: (error) => {
          this.toastService.error(describeApiError(error), 'مركز البريد');
        }
      });
  }

  testSendSelectedRule(): void {
    if (!this.canEdit || !this.selectedRule) {
      return;
    }

    const draft = this.buildRuleDraft(this.selectedRule);
    this.isTestingSend = true;

    this.emailCenterApi.testSend(draft)
      .pipe(
        finalize(() => {
          this.isTestingSend = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (result) => {
          this.lastTestSendResult = result;
          this.updateRuleLastDispatch(this.selectedRuleId, {
            status: result.status,
            source: 'test_send',
            createdAtUtc: result.createdAtUtc,
            failureReason: result.failureReason
          });
          this.loadDispatchHistory();

          if (result.status === 'sent') {
            this.toastService.success('تم تنفيذ Test Send وتسجيله في السجل.', 'مركز البريد');
          } else if (result.status === 'skipped') {
            this.toastService.warning(result.failureReason ?? 'تم تسجيل العملية بدون إرسال فعلي.', 'مركز البريد');
          } else {
            this.toastService.error(result.failureReason ?? 'فشل Test Send.', 'مركز البريد');
          }
        },
        error: (error) => {
          this.toastService.error(describeApiError(error), 'مركز البريد');
        }
      });
  }

  setPreviewLocale(locale: EmailPreviewLocale): void {
    this.previewLocale = locale;
  }

  onRuleDraftChanged(): void {
    this.scheduleRecipientResolution();
  }

  onRecipientEditorChanged(): void {
    this.syncDraftRouteFromEditor();
    this.scheduleRecipientResolution();
  }

  onVendorChange(vendorId: string | null): void {
    if (!this.canEdit || !this.selectedRule) {
      return;
    }

    this.selectedRule.entityScope.vendorId = vendorId || null;
    if (!vendorId) {
      this.selectedRule.entityScope.branchId = null;
    }

    this.scheduleRecipientResolution();
  }

  onBranchScopeModeChange(branchScopeMode: EmailBranchScopeMode): void {
    if (!this.canEdit || !this.selectedRule) {
      return;
    }

    this.selectedRule.branchScopeMode = branchScopeMode;
    if (branchScopeMode !== 'specific_branch') {
      this.selectedRule.entityScope.branchId = null;
    }

    this.scheduleRecipientResolution();
  }

  onHistoryFiltersChanged(): void {
    this.loadDispatchHistory();
  }

  clearHistoryFilters(): void {
    this.historyFilters = {
      ruleId: this.selectedRuleId || null,
      source: null,
      status: null,
      dateFrom: null,
      dateTo: null
    };
    this.loadDispatchHistory();
  }

  hasRecipientTarget(channel: RecipientChannel, targetId: EmailRecipientTargetId): boolean {
    return Boolean(this.selectedRule?.recipientTargets[channel].includes(targetId));
  }

  toggleRecipientTarget(channel: RecipientChannel, targetId: EmailRecipientTargetId, enabled: boolean): void {
    if (!this.canEdit || !this.selectedRule) {
      return;
    }

    const current = new Set(this.selectedRule.recipientTargets[channel]);
    if (enabled) {
      current.add(targetId);
    } else {
      current.delete(targetId);
    }

    this.selectedRule.recipientTargets[channel] = [...current];
    this.scheduleRecipientResolution();
  }

  hasPersonaTarget(personaType: DirectoryPersonaType): boolean {
    return Boolean(this.selectedRule?.personaTargets.includes(personaType));
  }

  togglePersonaTarget(personaType: DirectoryPersonaType, enabled: boolean): void {
    if (!this.canEdit || !this.selectedRule) {
      return;
    }

    const current = new Set(this.selectedRule.personaTargets);
    if (enabled) {
      current.add(personaType);
    } else {
      current.delete(personaType);
    }

    this.selectedRule.personaTargets = [...current];
    this.scheduleRecipientResolution();
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

  getDispatchSourceLabelKey(source: string): string {
    return `EMAIL_CENTER.SOURCES.${source.toUpperCase()}`;
  }

  getDispatchRecipientCount(dispatch: EmailDispatchLog): number {
    return dispatch.to.length + dispatch.cc.length + dispatch.bcc.length;
  }

  getLastDispatchLabelKey(rule: EmailWorkflowRule): string {
    return rule.lastDispatch
      ? this.getDispatchStatusLabelKey(rule.lastDispatch.status)
      : 'EMAIL_CENTER.HISTORY.NO_DISPATCH';
  }

  private loadOverview(): void {
    this.isLoading = true;
    this.pageError = '';

    this.emailCenterApi.getOverview()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (overview) => {
          this.senderProfiles = overview.senderProfiles;
          this.rules = overview.rules;
          this.vendorOptions = overview.vendors;
          this.branchDirectory = overview.branches;
          this.kpiSnapshot = overview.kpi;
          this.ensureSelectedRule();
          this.applyRouteContext();
          this.historyFilters.ruleId = this.selectedRuleId || null;
          this.syncRecipientsFromSelectedRule();
          this.scheduleRecipientResolution();
          this.loadDispatchHistory();
        },
        error: (error) => {
          this.pageError = describeApiError(error);
        }
      });
  }

  private loadDispatchHistory(): void {
    this.isHistoryLoading = true;

    this.emailCenterApi.getDispatches(this.historyFilters)
      .pipe(
        finalize(() => {
          this.isHistoryLoading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (dispatches) => {
          this.dispatches = dispatches;
        },
        error: (error) => {
          this.dispatches = [];
          this.toastService.error(describeApiError(error), 'سجل البريد');
        }
      });
  }

  private applyRouteContext(): void {
    this.ensureSelectedRule();
    this.applyQueryScope(this.routeVendorId, this.routeEntityId);
    this.syncRecipientsFromSelectedRule();
  }

  private applyQueryScope(vendorId: string | null, entityId: string | null): void {
    const current = this.rules.find((rule) => this.selectedRuleId ? rule.id === this.selectedRuleId : true) ?? this.rules[0];

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

  private syncDraftRouteFromEditor(): void {
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
  }

  private scheduleRecipientResolution(): void {
    this.resolvePreview$.next();
  }

  private buildRuleDraft(rule: EmailWorkflowRule): EmailWorkflowRule {
    this.syncDraftRouteFromEditor();
    return this.clone(rule);
  }

  private replaceRule(rule: EmailWorkflowRule): void {
    this.rules = this.rules.map((entry) => entry.id === rule.id ? rule : entry);
    this.selectedRuleId = rule.id;
  }

  private updateRuleLastDispatch(ruleId: string, lastDispatch: EmailWorkflowRule['lastDispatch']): void {
    this.rules = this.rules.map((rule) => rule.id === ruleId ? { ...rule, lastDispatch } : rule);
  }

  private recalculateKpiSnapshot(): EmailCenterKpiSnapshot {
    const enabledRules = this.rules.filter((rule) => rule.enabled);
    return {
      totalRules: this.rules.length,
      enabledRules: enabledRules.length,
      senderProfiles: this.senderProfiles.length,
      directoryDrivenRules: this.rules.filter((rule) =>
        rule.recipientTargets.to.length > 0 ||
        rule.recipientTargets.cc.length > 0 ||
        rule.recipientTargets.bcc.length > 0
      ).length,
      audienceCoverage: new Set(enabledRules.map((rule) => rule.audienceType)).size
    };
  }

  private normalizeAudience(value: string | null): EmailAudienceFilter {
    if (value === 'super_admin' || value === 'vendor_network' || value === 'drivers' || value === 'customers') {
      return value;
    }

    return 'all';
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

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
