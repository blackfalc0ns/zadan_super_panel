import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, switchMap } from 'rxjs';
import {
 AdminCustomerNotificationResponse,
 CustomersService
} from '@customers/services/customers.api.service';
import { ToastService } from '@shared/services/toast.service';
import { describeApiError } from '@shared/utils/api-error.util';
import { DataTableComponent, TableColumn } from '../../../../../shared/components/ui/data-table/data-table.component';
import { InlineBannerComponent } from '../../../../../shared/components/ui/inline-banner/inline-banner.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { KpiCardsComponent, KPICard } from '../../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPageHeaderComponent } from '../../../../../shared/components/ui/page-header/page-header.component';
import { SectionHeaderComponent } from '../../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import {
 CustomerDetailRecord,
 CustomerLifecycleStage,
 CustomerRecentOrder,
 CustomerWorkflowAction,
 CustomerWorkflowActionId
} from '../../../models/customers.models';

type CustomerDetailTabId = 'overview' | 'workflow';

const WORKFLOW_STATE_KEYS: Record<NonNullable<CustomerDetailRecord['workflow']>['state'], string> = {
 healthy: 'CUSTOMERS.DETAIL.WORKFLOW.STATE.HEALTHY',
 monitoring: 'CUSTOMERS.DETAIL.WORKFLOW.STATE.MONITORING',
 retention: 'CUSTOMERS.DETAIL.WORKFLOW.STATE.RETENTION',
 under_review: 'CUSTOMERS.DETAIL.WORKFLOW.STATE.UNDER_REVIEW',
 suspended: 'CUSTOMERS.DETAIL.WORKFLOW.STATE.SUSPENDED'
};

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-customer-detail',
 standalone: true,
 imports: [
 CommonModule,
 FormsModule,
 TranslateModule,
 AppPageHeaderComponent,
 KpiCardsComponent,
 SectionHeaderComponent,
 StatusPillComponent,
 KeyValueGridComponent,
 DataTableComponent,
 InlineBannerComponent
 ],
 templateUrl: './customer-detail.component.html',
 styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 @ViewChild('quickNoteInput') quickNoteInput?: ElementRef<HTMLInputElement>;

 customer: CustomerDetailRecord | null = null;
 currentTab: CustomerDetailTabId = 'overview';
 quickNote = '';
 isSendingTestNotification = false;
 copiedFields = new Map<string, boolean>();

 copyToClipboard(fieldId: string, text: string): void {
 if (!text) return;
 navigator.clipboard.writeText(text).then(() => {
 this.copiedFields.set(fieldId, true);
 this.cdr.markForCheck();
 setTimeout(() => {
 this.copiedFields.set(fieldId, false);
 this.cdr.markForCheck();
 }, 2000);
 }).catch(err => {
 console.error('Failed to copy to clipboard', err);
 });
 }

 getCustomerInitials(name?: string): string {
 if (!name) return '';
 const parts = name.trim().split(/\s+/);
 if (parts.length === 0) return '';
 const first = parts[0][0] || '';
 const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
 return `${first} ${last}`.trim().toUpperCase();
 }

 readonly recentOrdersColumns: TableColumn[] = [
 { key: 'id', title: 'CUSTOMERS.DETAIL.ORDERS_TABLE.ORDER_ID', width: '26%', align: 'left', type: 'custom' },
 { key: 'date', title: 'CUSTOMERS.DETAIL.ORDERS_TABLE.DATE', width: '22%', align: 'left', type: 'custom' },
 { key: 'total', title: 'CUSTOMERS.DETAIL.ORDERS_TABLE.AMOUNT', width: '22%', align: 'left', type: 'custom' },
 { key: 'status', title: 'CUSTOMERS.DETAIL.ORDERS_TABLE.STATUS', width: '22%', align: 'left', type: 'custom' },
 { key: 'open', title: '', width: '8%', align: 'center', type: 'custom' }
 ];

 constructor(
 private readonly route: ActivatedRoute,
 private readonly router: Router,
 private readonly translate: TranslateService,
 private readonly customersService: CustomersService,
 private readonly toastService: ToastService
 ) {}

 ngOnInit(): void {
 this.route.queryParamMap.subscribe((params) => {
 this.cdr.markForCheck();
 this.currentTab = this.normalizeTab(params.get('tab'));
 });

 this.route.paramMap.pipe(
 switchMap((params) => this.customersService.getCustomerById(params.get('id')))
 ).subscribe({
 next: (customer) => {
 this.cdr.markForCheck();
 this.customer = customer ?? null;
 },
 error: (error) => {
 this.cdr.markForCheck();
 console.error('Failed to load admin customer detail.', error);
 this.customer = null;
 }
 });
 }

 get kpiCards(): KPICard[] {
 if (!this.customer) {
 return [];
 }

 return [
 {
 id: 'orders',
 title: 'CUSTOMERS.DETAIL.METRICS.TOTAL_ORDERS',
 value: this.customer.totalOrders,
 icon: '<span class="material-symbols-outlined text-[20px]">shopping_bag</span>',
 color: '#127c8c'
 },
 {
 id: 'spent',
 title: 'CUSTOMERS.DETAIL.METRICS.TOTAL_SPENT',
 value: `${this.customer.totalSpent.toLocaleString('en-US')} ${this.translate.instant('COMMON.CURRENCY_SAR')}`,
 icon: '<span class="material-symbols-outlined text-[20px]">payments</span>',
 color: '#0f766e'
 },
 {
 id: 'last-order',
 title: 'CUSTOMERS.DETAIL.METRICS.LAST_ORDER',
 value: this.customer.lastOrderAt,
 icon: '<span class="material-symbols-outlined text-[20px]">schedule</span>',
 color: '#64748b'
 },
 {
 id: 'complaints',
 title: 'CUSTOMERS.DETAIL.METRICS.COMPLAINTS',
 value: this.customer.disputesCount,
 icon: '<span class="material-symbols-outlined text-[20px]">support_agent</span>',
 color: '#f59e0b'
 },
 {
 id: 'refunds',
 title: 'CUSTOMERS.DETAIL.METRICS.REFUNDS',
 value: this.customer.refundsCount,
 icon: '<span class="material-symbols-outlined text-[20px]">keyboard_return</span>',
 color: '#ef4444'
 },
 {
 id: 'risk-score',
 title: 'CUSTOMERS.DETAIL.METRICS.RISK_SCORE',
 value: `${this.customer.riskScore}%`,
 icon: '<span class="material-symbols-outlined text-[20px]">verified_user</span>',
 color: '#127c8c',
 trend: {
 value: this.translate.instant(this.customer.riskSummary),
 label: this.translate.instant(this.customer.riskSummary),
 isPositive: this.customer.risk === 'low' || this.customer.risk === 'medium'
 }
 }
 ];
 }

 get profileItems(): KeyValueGridItem[] {
 if (!this.customer) {
 return [];
 }

 return [
 {
 label: 'CUSTOMERS.DETAIL.PROFILE_FIELDS.FULL_NAME',
 value: this.customer.name,
 translateValue: false
 },
 {
 label: 'CUSTOMERS.DETAIL.PROFILE_FIELDS.PHONE',
 value: this.customer.phone,
 translateValue: false,
 valueDir: 'ltr'
 },
 {
 label: 'CUSTOMERS.DETAIL.PROFILE_FIELDS.EMAIL',
 value: this.customer.email,
 translateValue: false,
 valueDir: 'ltr'
 },
 {
 label: 'CUSTOMERS.DETAIL.PROFILE_FIELDS.CITY',
 value: this.resolveCityLabel(this.customer),
 translateValue: false
 },
 {
 label: 'CUSTOMERS.DETAIL.PROFILE_FIELDS.LANGUAGE',
 value: this.getPreferredLanguageKey(),
 translateValue: true
 },
 {
 label: 'CUSTOMERS.DETAIL.PROFILE_FIELDS.LAST_SEEN',
 value: this.getLastSeenValue(),
 translateValue: this.shouldTranslateLastSeenValue()
 }
 ];
 }

 get behaviorItems(): KeyValueGridItem[] {
 if (!this.customer) {
 return [];
 }

 return [
 {
 label: 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.REFUND_RISK',
 value: this.customer.riskSummary,
 translateValue: true,
 valueTone: this.customer.risk === 'critical' || this.customer.risk === 'high' ? 'danger' : 'accent'
 },
 {
 label: 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.SUSPICIOUS_LOGINS',
 value: this.getSuspiciousLoginsKey(),
 translateValue: true
 },
 {
 label: 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.PAYMENT_FAILURES',
 value: this.customer.repeatedPaymentFailureRate,
 translateValue: false,
 valueDir: 'ltr'
 },
 {
 label: 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.COMPLAINT_FREQUENCY',
 value: this.getComplaintFrequencyKey(),
 translateValue: true
 }
 ];
 }

 get statusVariant(): StatusPillVariant {
 if (!this.customer) {
 return 'neutral';
 }

 const map: Record<string, StatusPillVariant> = {
 active: 'success',
 low_activity: 'warning',
 restricted: 'paused',
 dormant: 'neutral'
 };

 return map[this.customer.status] ?? 'neutral';
 }

 get riskVariant(): StatusPillVariant {
 if (!this.customer) {
 return 'neutral';
 }

 if (this.customer.risk === 'critical' || this.customer.risk === 'high') {
 return 'high-risk';
 }

 if (this.customer.risk === 'medium') {
 return 'warning';
 }

 return 'success';
 }

 get verificationVariant(): StatusPillVariant {
 return this.customer?.isVerified ? 'success' : 'warning';
 }

 get recentOrders(): CustomerRecentOrder[] {
 return this.customer?.recentOrders ?? [];
 }

 get workflowActions(): CustomerWorkflowAction[] {
 return this.customer?.workflow.actions ?? [];
 }

 get lifecycleStages(): CustomerLifecycleStage[] {
 return this.customer?.lifecycle ?? [];
 }

 get hasReviewFlag(): boolean {
 return this.customer?.reviewState!== 'none';
 }

 get reviewBannerTitleKey(): string {
 return this.customer?.reviewState === 'escalated'
 ? 'CUSTOMERS.DETAIL.REVIEW_FLAG_ESCALATED_TITLE'
 : 'CUSTOMERS.DETAIL.REVIEW_FLAG_TITLE';
 }

 get reviewBannerMessageKey(): string {
 return this.customer?.reviewState === 'escalated'
 ? 'CUSTOMERS.DETAIL.REVIEW_FLAG_ESCALATED_MESSAGE'
 : 'CUSTOMERS.DETAIL.REVIEW_FLAG_MESSAGE';
 }

 get workflowStateLabelKey(): string {
 return this.customer ? WORKFLOW_STATE_KEYS[this.customer.workflow.state] : '';
 }

 get workflowStateVariant(): StatusPillVariant {
 if (!this.customer) {
 return 'neutral';
 }

 const map: Record<CustomerDetailRecord['workflow']['state'], StatusPillVariant> = {
 healthy: 'success',
 monitoring: 'warning',
 retention: 'info',
 under_review: 'paused',
 suspended: 'danger'
 };

 return map[this.customer.workflow.state];
 }

 get reviewActionLabelKey(): string {
 if (!this.customer) {
 return 'CUSTOMERS.DETAIL.ACTION_FLAG_REVIEW';
 }

 if (this.customer.reviewState === 'flagged') {
 return 'CUSTOMERS.DETAIL.ACTION_ESCALATE_REVIEW';
 }

 if (this.customer.reviewState === 'escalated') {
 return 'CUSTOMERS.DETAIL.ACTION_CLEAR_REVIEW';
 }

 return 'CUSTOMERS.DETAIL.ACTION_FLAG_REVIEW';
 }

 get reviewActionIcon(): string {
 if (!this.customer) {
 return 'flag';
 }

 if (this.customer.reviewState === 'flagged') {
 return 'gpp_maybe';
 }

 if (this.customer.reviewState === 'escalated') {
 return 'task_alt';
 }

 return 'flag';
 }

 get accountActionLabelKey(): string {
 return this.customer?.accountState === 'suspended'
 ? 'CUSTOMERS.DETAIL.ACTION_REACTIVATE_ACCOUNT'
 : 'CUSTOMERS.DETAIL.ACTION_SUSPEND_ACCOUNT';
 }

 get accountActionIcon(): string {
 return this.customer?.accountState === 'suspended' ? 'restart_alt' : 'block';
 }

 setTab(tab: CustomerDetailTabId): void {
 if (this.currentTab === tab) {
 return;
 }

 this.currentTab = tab;
 this.router.navigate([], {
 relativeTo: this.route,
 queryParams: { tab: tab === 'overview' ? null : tab },
 queryParamsHandling: 'merge'
 });
 }

 openOrdersList(): void {
 this.router.navigate(['/orders']);
 }

 openCasesList(): void {
 this.router.navigate(['/disputes']);
 }

 openAccessProfile(): void {
 if (!this.customer) {
 return;
 }

 this.router.navigate(['/admin-users', `customer-${this.customer.id}`]);
 }

 handleReviewAction(): void {
 if (!this.customer) {
 return;
 }

 const nextCustomer =
 this.customer.reviewState === 'none'
 ? this.customersService.flagForReview(this.customer.id)
 : this.customer.reviewState === 'flagged'
 ? this.customersService.escalateReview(this.customer.id)
 : this.customersService.clearReview(this.customer.id);

 if (nextCustomer) {
 this.customer = nextCustomer;
 this.toastService.success(
 this.translate.currentLang === 'ar' ? 'تم تحديث حالة المراجعة بنجاح' : 'Review status updated successfully',
 this.translate.currentLang === 'ar' ? 'إجراءات الأدمن' : 'Admin Actions'
 );
 }
 }

 handleAccountAction(): void {
 if (!this.customer) {
 return;
 }

 const nextCustomer =
 this.customer.accountState === 'suspended'
 ? this.customersService.reactivateAccount(this.customer.id)
 : this.customersService.suspendAccount(this.customer.id);

 if (nextCustomer) {
 this.customer = nextCustomer;
 this.toastService.success(
 this.translate.currentLang === 'ar' ? 'تم تحديث حالة الحساب بنجاح' : 'Account status updated successfully',
 this.translate.currentLang === 'ar' ? 'إجراءات الأدمن' : 'Admin Actions'
 );
 }
 }

 handleWorkflowAction(actionId: CustomerWorkflowActionId): void {
 switch (actionId) {
 case 'open_orders':
 this.openOrdersList();
 return;
 case 'open_support':
 this.openCasesList();
 return;
 case 'flag_review':
 case 'escalate_review':
 case 'clear_review':
 this.handleReviewAction();
 return;
 case 'suspend_account':
 case 'reactivate_account':
 this.handleAccountAction();
 return;
 default:
 return;
 }
 }

 focusQuickNote(): void {
 setTimeout(() => {
 this.quickNoteInput?.nativeElement.focus();
 });
 }

 addQuickNote(): void {
 const note = this.quickNote.trim();

 if (!note ||!this.customer) {
 this.focusQuickNote();
 return;
 }

 const nextCustomer = this.customersService.addInternalNote(this.customer.id, note);
 if (nextCustomer) {
 this.customer = nextCustomer;
 this.toastService.success(
 this.translate.currentLang === 'ar' ? 'تم حفظ الملاحظة الداخلية بنجاح' : 'Internal note saved successfully',
 this.translate.currentLang === 'ar' ? 'إجراءات الأدمن' : 'Admin Actions'
 );
 }
 this.quickNote = '';
 }

 sendTestMobileNotification(): void {
 if (!this.customer || this.isSendingTestNotification) {
 return;
 }

 const customer = this.customer;
 this.isSendingTestNotification = true;

 this.customersService.sendTestMobileNotification(customer.id, {
 titleAr: 'إشعار تجريبي من لوحة التحكم',
 titleEn: 'Admin mobile test notification',
 bodyAr: `هذا إشعار تجريبي للتأكد من وصول إشعارات الموبايل إلى العميل ${customer.name}.`,
 bodyEn: `This is a test mobile notification for ${customer.name}.`,
 type: 'customer_test',
 sendPush: true
 }).pipe(
 finalize(() => {
 this.isSendingTestNotification = false;
 })
 ).subscribe({
 next: (response) => {
 this.cdr.markForCheck();
 this.showNotificationResult(response);
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.toastService.error(
 describeApiError(error, this.translate, { fallbackKey: 'COMMON.API_ERRORS.UNKNOWN' }),
 'إشعارات العميل'
 );
 }
 });
 }

 openOrder(order: CustomerRecentOrder): void {
 this.router.navigate(['/orders', order.id]);
 }

 getOrderStatusVariant(status: CustomerRecentOrder['status']): StatusPillVariant {
 const map: Record<CustomerRecentOrder['status'], StatusPillVariant> = {
 DELIVERED: 'success',
 REFUNDED: 'danger',
 PROCESSING: 'warning'
 };

 return map[status];
 }

 getOrderStatusLabel(status: CustomerRecentOrder['status']): string {
 return `CUSTOMERS.DETAIL.ORDER_STATUS.${status}`;
 }

 getWorkflowActionClasses(action: CustomerWorkflowAction): string {
 const base =
 'flex h-full min-h-[4.85rem] flex-col justify-between rounded-[1rem] border px-4 py-3 transition-all shadow-sm';

 switch (action.tone) {
 case 'primary':
 return `${base} border-zadna-primary/10 bg-gradient-to-br from-zadna-primary to-teal-700 text-white shadow-zadna-primary/20 hover:from-teal-700 hover:to-teal-800`;
 case 'warning':
 return `${base} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`;
 case 'danger':
 return `${base} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`;
 case 'success':
 return `${base} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`;
 default:
 return `${base} border-slate-200 bg-white text-slate-700 hover:border-zadna-primary/20 hover:text-zadna-primary`;
 }
 }

 getWorkflowActionRunClasses(action: CustomerWorkflowAction): string {
 const base =
 'inline-flex h-9 items-center justify-center rounded-lg border px-3 text-[11px] font-black transition-all';

 switch (action.tone) {
 case 'primary':
 return `${base} border-zadna-primary/10 bg-zadna-primary text-white hover:bg-teal-700`;
 case 'warning':
 return `${base} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`;
 case 'danger':
 return `${base} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`;
 case 'success':
 return `${base} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`;
 default:
 return `${base} border-slate-200 bg-white text-slate-700 hover:border-zadna-primary/20 hover:text-zadna-primary`;
 }
 }

 getLifecycleCardClasses(stage: CustomerLifecycleStage): string {
 const base = 'rounded-[1rem] border px-4 py-3 transition-all';

 switch (stage.tone) {
 case 'success':
 return `${base} border-emerald-100 bg-emerald-50/80`;
 case 'warning':
 return `${base} border-amber-100 bg-amber-50/80`;
 case 'danger':
 return `${base} border-red-100 bg-red-50/80`;
 case 'info':
 return `${base} border-cyan-100 bg-cyan-50/80`;
 default:
 return `${base} border-slate-200 bg-slate-50/80`;
 }
 }

 getLifecycleValueClasses(stage: CustomerLifecycleStage): string {
 switch (stage.tone) {
 case 'success':
 return 'text-emerald-700';
 case 'warning':
 return 'text-amber-700';
 case 'danger':
 return 'text-red-700';
 case 'info':
 return 'text-cyan-700';
 default:
 return 'text-slate-700';
 }
 }

 getNoteCardClasses(note: NonNullable<CustomerDetailRecord['internalNotes']>[number]): string {
 const base = 'rounded-2xl border p-4';

 switch (note.tone) {
 case 'danger':
 return `${base} border-red-100 bg-red-50/70`;
 case 'warning':
 return `${base} border-amber-100 bg-amber-50/70`;
 case 'success':
 return `${base} border-emerald-100 bg-emerald-50/70`;
 case 'info':
 return `${base} border-cyan-100 bg-cyan-50/60`;
 default:
 return `${base} border-slate-200/70 bg-slate-50`;
 }
 }

 private showNotificationResult(response: AdminCustomerNotificationResponse): void {
 if (response.pushSent) {
 this.toastService.success(
 'تم إرسال إشعار الموبايل التجريبي بنجاح.',
 'إشعارات العميل'
 );
 return;
 }

 if (response.pushSkipped) {
 this.toastService.warning(
 response.pushReason ?? 'تم إنشاء إشعار داخلي فقط بدون Push.',
 'إشعارات العميل'
 );
 return;
 }

 this.toastService.warning(
 response.pushReason ?? 'تم تنفيذ الطلب لكن لم يتم تأكيد إرسال Push.',
 'إشعارات العميل'
 );
 }

 private normalizeTab(value: string | null): CustomerDetailTabId {
 return value === 'workflow' ? 'workflow' : 'overview';
 }

 private getPreferredLanguageKey(): string {
 return this.customer?.preferredLanguage === 'en'
 ? 'CUSTOMERS.DETAIL.PROFILE_FIELDS.LANGUAGE_VALUES.ENGLISH'
 : 'CUSTOMERS.DETAIL.PROFILE_FIELDS.LANGUAGE_VALUES.ARABIC';
 }

 private getLastSeenValue(): string {
 if (!this.customer) {
 return 'CUSTOMERS.PRESENCE.ONLINE_NOW';
 }

 return this.customer.isOnlineNow
 ? 'CUSTOMERS.PRESENCE.ONLINE_NOW'
 : this.customer.lastSeenAt;
 }

 private shouldTranslateLastSeenValue(): boolean {
 return this.customer?.isOnlineNow ?? true;
 }

 resolveCityLabel(customer: CustomerDetailRecord): string {
 const lang = (this.translate.currentLang || this.translate.defaultLang || 'ar').toLowerCase();
 const primary = lang.startsWith('ar') ? customer.cityAr : customer.cityEn;
 const fallback = lang.startsWith('ar') ? customer.cityEn : customer.cityAr;
 return (primary || fallback || customer.city || '—').trim();
 }

 private getSuspiciousLoginsKey(): string {
 if (!this.customer) {
 return 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.SUSPICIOUS_LOGIN_VALUES.NONE';
 }

 if (this.customer.trustState === 'blocked') {
 return 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.SUSPICIOUS_LOGIN_VALUES.FIVE_RECENT';
 }

 if (this.customer.trustState === 'watch') {
 return 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.SUSPICIOUS_LOGIN_VALUES.TWO_RECENT';
 }

 return 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.SUSPICIOUS_LOGIN_VALUES.NONE';
 }

 private getComplaintFrequencyKey(): string {
 if (!this.customer) {
 return 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.COMPLAINT_FREQUENCY_VALUES.LOW';
 }

 if (this.customer.disputesCount >= 3 || this.customer.refundsCount >= 4) {
 return 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.COMPLAINT_FREQUENCY_VALUES.HIGH';
 }

 if (this.customer.disputesCount > 0 || this.customer.refundsCount > 1) {
 return 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.COMPLAINT_FREQUENCY_VALUES.MEDIUM';
 }

 return 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.COMPLAINT_FREQUENCY_VALUES.LOW';
 }

 getLastSupportContactKey(): string {
 if (!this.customer) {
 return 'CUSTOMERS.DETAIL.SUPPORT.LAST_CONTACT_VALUES.NONE';
 }

 if (this.customer.disputesCount >= 3) {
 return 'CUSTOMERS.DETAIL.SUPPORT.LAST_CONTACT_VALUES.RECENT';
 }

 if (this.customer.disputesCount > 0 || this.customer.refundsCount > 1) {
 return 'CUSTOMERS.DETAIL.SUPPORT.LAST_CONTACT_VALUES.STALE';
 }

 return 'CUSTOMERS.DETAIL.SUPPORT.LAST_CONTACT_VALUES.NONE';
 }
}


