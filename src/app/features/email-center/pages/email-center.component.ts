import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AccessService } from '@core/services/access.service';
import { KpiCardsComponent, KPICard } from '@shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { ToastService } from '@shared/services/toast.service';
import { buildSafeApiErrorLog, describeApiError } from '@shared/utils/api-error.util';
import { Subject, catchError, debounceTime, finalize, of, switchMap } from 'rxjs';
import {
 DIRECTORY_AUDIENCE_LABELS,
 DirectoryAudienceType
} from '@admin-users/public-api';
import {
 EmailAutomationState,
 EmailBranchOption,
 EmailBranchScopeMode,
 EmailCenterKpiSnapshot,
 EmailDispatchFilters,
 EmailDispatchLog,
 EmailResolvedRecipients,
 EmailScopeOption,
 EmailSenderProfile,
 EmailTestSendResult,
 EmailWorkflowRule
} from '../models/email-center.models';
import { EmailCenterApiService } from '../services/email-center.service';
import { EmailSenderProfilesComponent } from '../components/email-sender-profiles/email-sender-profiles.component';
import { EmailRulesListComponent } from '../components/email-rules-list/email-rules-list.component';
import { EmailRuleConfigComponent } from '../components/email-rule-config/email-rule-config.component';

type EmailAudienceFilter = 'all' | DirectoryAudienceType;

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

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-email-center',
 standalone: true,
 imports: [
 CommonModule,
 TranslateModule,
 AppPageHeaderComponent,
 KpiCardsComponent,
 EmailSenderProfilesComponent,
 EmailRulesListComponent,
 EmailRuleConfigComponent
 ],
 templateUrl: './email-center.component.html',
 styleUrl: './email-center.component.scss'
})
export class EmailCenterComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 private readonly translate = inject(TranslateService);
 senderProfiles: EmailSenderProfile[] = [];
 rules: EmailWorkflowRule[] = [];
 vendorOptions: EmailScopeOption[] = [];
 branchDirectory: EmailBranchOption[] = [];
 dispatches: EmailDispatchLog[] = [];
 resolvedRecipients: EmailResolvedRecipients = {...EMPTY_RECIPIENTS };
 kpiSnapshot: EmailCenterKpiSnapshot = {...EMPTY_KPI };
 selectedRuleId = '';
 selectedAudience: EmailAudienceFilter = 'all';
 isLoading = true;
 isSaving = false;
 isResolvingRecipients = false;
 isTestingSend = false;
 isHistoryLoading = false;
 pageError = '';
 lastTestSendResult: EmailTestSendResult | null = null;

 historyFilters: EmailDispatchFilters = {
 ruleId: null,
 source: null,
 status: null,
 dateFrom: null,
 dateTo: null
 };

 readonly audienceTabs: Array<{ value: EmailAudienceFilter; labelKey: string }> = [
 { value: 'all', labelKey: 'EMAIL_CENTER.AUDIENCE.ALL' },...Object.entries(DIRECTORY_AUDIENCE_LABELS).map(([value, labelKey]) => ({
 value: value as DirectoryAudienceType,
 labelKey
 }))
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
 this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
 this.cdr.markForCheck();
 this.selectedAudience = this.normalizeAudience(params.get('audience'));
 this.routeVendorId = params.get('vendor');
 this.routeEntityId = params.get('entityId');

 if (this.rules.length > 0) {
 this.applyRouteContext();
 }
 });

 this.resolvePreview$.pipe(
 debounceTime(350),
 switchMap(() => {
 const rule = this.selectedRule;
 if (!rule) {
 return of({...EMPTY_RECIPIENTS });
 }

 this.isResolvingRecipients = true;
 this.cdr.markForCheck();
 return this.emailCenterApi.resolveRecipients(rule).pipe(
 catchError((error) =>
 of({...EMPTY_RECIPIENTS,
 warnings: [describeApiError(error, this.translate, { fallbackKey: 'COMMON.API_ERRORS.UNKNOWN' })]
 })
 ),
 finalize(() => {
 this.isResolvingRecipients = false;
 this.cdr.markForCheck();
 })
 );
 }),
 takeUntilDestroyed(this.destroyRef)
 ).subscribe((resolved) => {
 this.cdr.markForCheck();
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

 get canEdit(): boolean {
 return this.accessService.hasPermission('email_center.edit');
 }

 openAccessDirectory(): void {
 this.router.navigate(['/admin-users'], {
 queryParams: this.selectedAudience === 'all' ? {} : { audience: this.selectedAudience }
 });
 }

 setAudience(audience: EmailAudienceFilter): void {
 this.selectedAudience = audience;
 this.ensureSelectedRule();
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
 this.historyFilters.ruleId = id;
 this.lastTestSendResult = null;
 this.scheduleRecipientResolution();
 this.loadDispatchHistory();
 }

 saveSelectedRule(): void {
 if (!this.canEdit ||!this.selectedRule) {
 return;
 }

 this.isSaving = true;

 this.emailCenterApi.updateRule(this.selectedRule).pipe(
 finalize(() => {
 this.isSaving = false;
 this.cdr.markForCheck();
 }),
 takeUntilDestroyed(this.destroyRef)
 ).subscribe({
 next: (saved) => {
 this.cdr.markForCheck();
 this.replaceRule(saved);
 this.kpiSnapshot = this.recalculateKpiSnapshot();
 this.scheduleRecipientResolution();
 this.loadDispatchHistory();
 this.toastService.success(
 this.translate.instant('EMAIL_CENTER.MESSAGES.SAVE_SUCCESS'),
 this.translate.instant('EMAIL_CENTER.TITLE')
 );
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.toastService.error(
 describeApiError(error, this.translate, { fallbackKey: 'COMMON.API_ERRORS.UNKNOWN' }),
 this.translate.instant('EMAIL_CENTER.TITLE')
 );
 }
 });
 }

 testSendSelectedRule(): void {
 if (!this.canEdit ||!this.selectedRule) {
 return;
 }

 this.isTestingSend = true;

 this.emailCenterApi.testSend(this.selectedRule).pipe(
 finalize(() => {
 this.isTestingSend = false;
 this.cdr.markForCheck();
 }),
 takeUntilDestroyed(this.destroyRef)
 ).subscribe({
 next: (result) => {
 this.cdr.markForCheck();
 this.lastTestSendResult = result;
 this.updateRuleLastDispatch(this.selectedRuleId, {
 status: result.status,
 source: 'test_send',
 createdAtUtc: result.createdAtUtc,
 failureReason: result.failureReason
 });
 this.loadDispatchHistory();

 const title = this.translate.instant('EMAIL_CENTER.TITLE');
 if (result.status === 'sent') {
 this.toastService.success(
 this.translate.instant('EMAIL_CENTER.MESSAGES.TEST_SEND_SUCCESS'),
 title
 );
 } else if (result.status === 'skipped') {
 this.toastService.warning(
 result.failureReason ?? 'تم تسجيل العملية بدون إرسال فعلي.',
 title
 );
 } else {
 this.toastService.error(
 result.failureReason ?? 'فشل Test Send.',
 title
 );
 }
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.toastService.error(
 describeApiError(error, this.translate, { fallbackKey: 'COMMON.API_ERRORS.UNKNOWN' }),
 this.translate.instant('EMAIL_CENTER.TITLE')
 );
 }
 });
 }

 onRuleDraftChanged(): void {
 this.scheduleRecipientResolution();
 }

 onVendorChange(vendorId: string | null): void {
 if (!this.canEdit ||!this.selectedRule) {
 return;
 }

 this.selectedRule.entityScope.vendorId = vendorId || null;
 if (!vendorId) {
 this.selectedRule.entityScope.branchId = null;
 }

 this.scheduleRecipientResolution();
 }

 onBranchScopeModeChange(branchScopeMode: EmailBranchScopeMode): void {
 if (!this.canEdit ||!this.selectedRule) {
 return;
 }

 this.ruleBranchScopeModeSync(branchScopeMode);
 this.scheduleRecipientResolution();
 }

 onHistoryFiltersChange(filters: EmailDispatchFilters): void {
 this.historyFilters = filters;
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

 private loadOverview(): void {
 this.isLoading = true;
 this.pageError = '';

 this.emailCenterApi.getOverview().pipe(
 finalize(() => {
 this.isLoading = false;
 this.cdr.markForCheck();
 }),
 takeUntilDestroyed(this.destroyRef)
 ).subscribe({
 next: (overview) => {
 this.cdr.markForCheck();
 this.senderProfiles = overview.senderProfiles;
 this.rules = overview.rules;
 this.vendorOptions = overview.vendors;
 this.branchDirectory = overview.branches;
 this.kpiSnapshot = overview.kpi;
 this.ensureSelectedRule();
 this.applyRouteContext();
 this.historyFilters.ruleId = this.selectedRuleId || null;
 this.scheduleRecipientResolution();
 this.loadDispatchHistory();
 },
 error: (error) => {
 this.cdr.markForCheck();
 console.error('Failed to load email center overview', buildSafeApiErrorLog(error));
 this.pageError = describeApiError(error, this.translate, {
 fallbackKey: 'COMMON.API_ERRORS.UNKNOWN'
 });
 }
 });
 }

 private loadDispatchHistory(): void {
 this.isHistoryLoading = true;

 this.emailCenterApi.getDispatches(this.historyFilters).pipe(
 finalize(() => {
 this.isHistoryLoading = false;
 this.cdr.markForCheck();
 }),
 takeUntilDestroyed(this.destroyRef)
 ).subscribe({
 next: (dispatches) => {
 this.cdr.markForCheck();
 this.dispatches = dispatches;
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.dispatches = [];
 this.toastService.error(
 describeApiError(error, this.translate, { fallbackKey: 'COMMON.API_ERRORS.UNKNOWN' }),
 this.translate.instant('EMAIL_CENTER.HISTORY.BADGE')
 );
 }
 });
 }

 private applyRouteContext(): void {
 this.ensureSelectedRule();
 this.applyQueryScope(this.routeVendorId, this.routeEntityId);
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

 private scheduleRecipientResolution(): void {
 this.resolvePreview$.next();
 }

 private replaceRule(rule: EmailWorkflowRule): void {
 this.rules = this.rules.map((entry) => entry.id === rule.id ? rule : entry);
 this.selectedRuleId = rule.id;
 }

 private updateRuleLastDispatch(ruleId: string, lastDispatch: EmailWorkflowRule['lastDispatch']): void {
 this.rules = this.rules.map((rule) => rule.id === ruleId ? {...rule, lastDispatch } : rule);
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

 private ruleBranchScopeModeSync(branchScopeMode: EmailBranchScopeMode): void {
 if (!this.selectedRule) return;
 this.selectedRule.branchScopeMode = branchScopeMode;
 if (branchScopeMode!== 'specific_branch') {
 this.selectedRule.entityScope.branchId = null;
 }
 }
}
