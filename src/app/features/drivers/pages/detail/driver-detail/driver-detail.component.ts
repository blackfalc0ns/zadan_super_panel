import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';

import {
 AdminDriverNotificationResponse,
 DriverService
} from '@drivers/services/drivers.api.service';
import {
 AccessApprovalRequestDto,
 AccessApprovalReviewFieldDto,
 AdminAccessApiService
} from '../../../../../core/services/admin-access-api.service';
import {
 DriverDetailRecord,
 DriverDocumentRecord,
 DriverIncidentRecord,
 DriverTaskAssignment,
 DriverWorkflowActionId
} from '@drivers/models/drivers.models';
import { DriverLifecycleTabId, DriverPreviewType } from '@drivers/models/driver-view.types';
import { DriverDetailViewComponent } from '@drivers/components/driver-detail-view/driver-detail-view.component';
import { ToastService } from '@shared/services/toast.service';
import { describeApiError } from '@shared/utils/api-error.util';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-driver-detail',
 standalone: true,
 imports: [CommonModule, RouterModule, TranslateModule, FormsModule, DriverDetailViewComponent],
 templateUrl: './driver-detail.component.html'
})
export class DriverDetailComponent implements OnInit, OnDestroy {
 private readonly cdr = inject(ChangeDetectorRef);
 driverId: string | null = null;
 driver: DriverDetailRecord | null = null;
 driverApprovals: AccessApprovalRequestDto[] = [];
 selectedApproval: AccessApprovalRequestDto | null = null;
 isLoading = true;
 isMutating = false;
 isApprovalsLoading = false;
 isApprovalDeciding = false;
 isSendingTestNotification = false;
 error: string | null = null;
 activeTab: DriverLifecycleTabId = 'overview';
 quickNote = '';
 reviewerDecisionNote = '';
 internalReviewNote = '';
 selectedRejectionReason = '';
 approvalDecisionNote = '';
 showTestNotificationComposer = false;
 testNotificationTitle = '';
 testNotificationBody = '';
 testNotificationTargetUrl = '/notifications';
 testNotificationType = 'driver_test';
 testNotificationSendPush = true;
 previewType: DriverPreviewType | null = null;
 selectedTask: DriverTaskAssignment | null = null;
 selectedIncident: DriverIncidentRecord | null = null;

 private destroy$ = new Subject<void>();

 constructor(
 private readonly route: ActivatedRoute,
 private readonly router: Router,
 private readonly driverService: DriverService,
 private readonly adminAccessApiService: AdminAccessApiService,
 private readonly translate: TranslateService,
 private readonly toastService: ToastService
 ) {}

 get isRTL(): boolean {
 return this.translate.currentLang!== 'en';
 }

 get selectedApprovalChangedFields(): AccessApprovalReviewFieldDto[] {
 return this.selectedApproval?.reviewDetails?.fields.filter((field) => field.isChanged) ?? [];
 }

 get selectedApprovalUnchangedFields(): AccessApprovalReviewFieldDto[] {
 return this.selectedApproval?.reviewDetails?.fields.filter((field) =>!field.isChanged) ?? [];
 }

 ngOnInit(): void {
 // Read initial tab from query params synchronously to avoid flash of default tab
 const initialTab = this.route.snapshot.queryParamMap.get('tab') as DriverLifecycleTabId;
 if (initialTab) {
 this.activeTab = initialTab;
 }

 this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
 this.cdr.markForCheck();
 this.driverId = params.get('id');
 if (this.driverId) {
 this.loadDriver(this.driverId);
 } else {
 this.error = this.t('DRIVERS.DETAIL.MESSAGES.INVALID_DRIVER_ID');
 this.isLoading = false;
 }
 });

 this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
 this.cdr.markForCheck();
 const tab = params.get('tab') as DriverLifecycleTabId;
 if (tab) {
 this.activeTab = tab;
 }
 });
 }

 ngOnDestroy(): void {
 this.destroy$.next();
 this.destroy$.complete();
 }

 loadDriver(id: string, showLoading = true): void {
 if (showLoading) {
 this.isLoading = true;
 }
 this.error = null;

 this.driverService.getDriverDetailRecordById(id).pipe(
 takeUntil(this.destroy$)
 ).subscribe({
 next: (data) => {
 this.cdr.markForCheck();
 if (data) {
 this.driver = data;
 this.loadDriverApprovals(id);
 } else {
 this.driver = null;
 this.driverApprovals = [];
 this.error = this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_NOT_FOUND');
 }
 this.isLoading = false;
 },
 error: (err) => {
 this.cdr.markForCheck();
 console.error('Failed to load driver', err);
 this.driver = null;
 this.driverApprovals = [];
 this.error = this.t('DRIVERS.DETAIL.MESSAGES.LOAD_DETAILS_FAILED');
 this.isLoading = false;
 }
 });
 }

 setTab(tab: DriverLifecycleTabId): void {
 this.activeTab = tab;
 // Update URL query param without blocking - use replaceUrl to avoid history entries
 this.router.navigate([], {
 relativeTo: this.route,
 queryParams: { tab },
 queryParamsHandling: 'merge',
 replaceUrl: true
 }).catch(() => {
 // Navigation might fail silently - tab is already set above
 });
 }

 goBack(): void {
 this.router.navigate(['/drivers']);
 }

 openTaskPreview(task: DriverTaskAssignment): void {
 this.selectedTask = task;
 this.selectedIncident = null;
 this.previewType = 'task';
 }

 openIncidentPreview(incident: DriverIncidentRecord): void {
 this.selectedIncident = incident;
 this.selectedTask = null;
 this.previewType = 'incident';
 }

 closePreview(): void {
 this.previewType = null;
 this.selectedTask = null;
 this.selectedIncident = null;
 }

 loadDriverApprovals(driverId = this.driverId): void {
 if (!driverId) {
 this.driverApprovals = [];
 return;
 }

 this.isApprovalsLoading = true;
 this.adminAccessApiService.getApprovals({ status: 'Pending', pageSize: 100 }).pipe(
 takeUntil(this.destroy$),
 finalize(() => {
 this.isApprovalsLoading = false;
 })
 ).subscribe({
 next: (approvals) => {
 this.cdr.markForCheck();
 this.driverApprovals = approvals.filter((approval) => this.isApprovalForDriver(approval, driverId));
 },
 error: (err) => {
 this.cdr.markForCheck();
 console.error('Failed to load driver approvals', err);
 this.driverApprovals = [];
 }
 });
 }

 openApprovalReview(approval: AccessApprovalRequestDto): void {
 this.selectedApproval = approval;
 this.approvalDecisionNote = '';
 }

 closeApprovalReview(): void {
 if (this.isApprovalDeciding) {
 return;
 }

 this.selectedApproval = null;
 this.approvalDecisionNote = '';
 }

 approveSelectedApproval(): void {
 if (!this.selectedApproval || this.isApprovalDeciding) {
 return;
 }

 this.decideSelectedApproval(
 () => this.adminAccessApiService.approveApproval(this.selectedApproval!.id, this.approvalDecisionNote),
 this.isRTL ? 'اعتمدنا تعديل المندوب وطبقناه' : 'Driver change approved and applied'
 );
 }

 rejectSelectedApproval(): void {
 if (!this.selectedApproval || this.isApprovalDeciding) {
 return;
 }

 this.decideSelectedApproval(
 () => this.adminAccessApiService.rejectApproval(this.selectedApproval!.id, this.approvalDecisionNote),
 this.isRTL ? 'رفضنا تعديل المندوب' : 'Driver change rejected'
 );
 }

 getApprovalActionLabel(action: string): string {
 const labels: Record<string, { ar: string; en: string }> = {
 'driver.profile.personal': { ar: 'تعديل البيانات الشخصية', en: 'Personal data change' },
 'driver.profile.vehicle': { ar: 'تعديل الهوية والمركبة', en: 'Identity and vehicle change' },
 'driver.profile.documents': { ar: 'تعديل المستندات', en: 'Documents change' },
 'driver.payout_method.create': { ar: 'إضافة طريقة سحب', en: 'Create payout method' },
 'driver.payout_method.update': { ar: 'تعديل طريقة سحب', en: 'Update payout method' },
 'driver.payout_method.make_primary': { ar: 'تعيين طريقة السحب الأساسية', en: 'Set primary payout method' },
 'driver.payout_method.delete': { ar: 'حذف طريقة سحب', en: 'Delete payout method' }
 };

 const label = labels[action];
 return label ? (this.isRTL ? label.ar : label.en) : action;
 }

 getApprovalFieldLabel(field: AccessApprovalReviewFieldDto): string {
 return this.isRTL ? field.labelAr : field.labelEn;
 }

 getApprovalChangedCount(approval: AccessApprovalRequestDto): number {
 return approval.reviewDetails?.fields.filter((field) => field.isChanged).length ?? 0;
 }

 formatApprovalValue(value: unknown): string {
 if (value === null || value === undefined || value === '') {
 return '-';
 }

 if (typeof value === 'boolean') {
 return value ? (this.isRTL ? 'نعم' : 'Yes') : (this.isRTL ? 'لا' : 'No');
 }

 if (typeof value === 'object') {
 return JSON.stringify(value);
 }

 return String(value);
 }

 isApprovalUrl(value: unknown): value is string {
 return typeof value === 'string' && /^https?:\/\//i.test(value);
 }

 trackApproval(_: number, approval: AccessApprovalRequestDto): string {
 return approval.id;
 }

 trackApprovalField(_: number, field: AccessApprovalReviewFieldDto): string {
 return field.key;
 }

 addQuickNote(): void {
 if (!this.driverId || this.isMutating) {
 return;
 }

 const message = this.quickNote.trim();
 if (!message) {
 this.toastService.warning(this.t('DRIVERS.DETAIL.MESSAGES.WRITE_NOTE_FIRST'));
 return;
 }

 this.runMutation(
 () => this.driverService.addDriverNote(this.driverId!, message),
 this.t('DRIVERS.DETAIL.MESSAGES.NOTE_ADDED'),
 () => {
 this.quickNote = '';
 }
 );
 }

 requestReviewAction(action: 'approve' | 'request-docs' | 'reject'): void {
 if (!this.driverId || this.isMutating) {
 return;
 }

 if (action === 'approve' && this.driver) {
 const approvalBlockerMessage = this.buildApprovalBlockerMessage(this.driver);
 if (approvalBlockerMessage) {
 this.toastService.warning(approvalBlockerMessage);
 return;
 }
 }

 this.runMutation(
 () => this.driverService.reviewDriver(this.driverId!, action, this.composeReviewNote()),
 this.getReviewSuccessMessage(action)
 );
 }

 approveDocument(document: DriverDocumentRecord): void {
 if (!this.driverId || this.isMutating ||!document.documentType) {
 return;
 }

 this.runMutation(
 () => this.driverService.approveDriverDocument(this.driverId!, document.documentType!),
 this.t('DRIVERS.DETAIL.MESSAGES.DOCUMENT_APPROVED')
 );
 }

 rejectDocument(event: { document: DriverDocumentRecord; reason: string }): void {
 if (!this.driverId || this.isMutating ||!event.document.documentType) {
 return;
 }

 this.runMutation(
 () => this.driverService.rejectDriverDocument(this.driverId!, event.document.documentType!, event.reason),
 this.t('DRIVERS.DETAIL.MESSAGES.DOCUMENT_REJECTED')
 );
 }

 toggleSuspension(): void {
 if (!this.driverId ||!this.driver || this.isMutating) {
 return;
 }

 if (this.driver.status === 'Suspended' || this.driver.status === 'Banned') {
 this.runMutation(
 () => this.driver!.status === 'Banned'
 ? this.driverService.unbanDriver(this.driverId!)
 : this.driverService.reactivateDriver(this.driverId!),
 this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_REACTIVATED')
 );
 return;
 }

 this.runMutation(
 () => this.driverService.suspendDriver(this.driverId!, this.composeReviewNote()),
 this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_SUSPENDED')
 );
 }

 banDriver(): void {
 if (!this.driverId ||!this.driver || this.isMutating) {
 return;
 }

 if (this.driver.status === 'Banned') {
 this.runMutation(
 () => this.driverService.unbanDriver(this.driverId!),
 this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_REACTIVATED')
 );
 return;
 }

 this.runMutation(
 () => this.driverService.banDriver(this.driverId!, this.composeReviewNote()),
 this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_BANNED')
 );
 }

 clearDriverRestrictions(): void {
 if (!this.driverId ||!this.driver || this.isMutating) {
 return;
 }

 this.runMutation(
 () => this.driverService.clearDriverRestrictions(this.driverId!, this.composeReviewNote()),
 this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_RESTRICTIONS_CLEARED')
 );
 }

 updateDriverProfile(details: any): void {
 if (!this.driverId || this.isMutating) {
 return;
 }

 if (!details?.region?.trim() ||!details?.city?.trim()) {
 this.toastService.error(this.t('DRIVERS.DETAIL.MESSAGES.SERVICE_AREA_REQUIRED'));
 return;
 }

 this.runMutation(
 () => this.driverService.updateDriverProfile(this.driverId!, details),
 this.t('DRIVERS.DETAIL.MESSAGES.PROFILE_UPDATED')
 );
 }

 toggleLoginLock(): void {
 if (!this.driverId ||!this.driver || this.isMutating) {
 return;
 }

 const isLocked = this.driver.isLoginLocked;
 this.runMutation(
 () => isLocked
 ? this.driverService.unlockDriverLogin(this.driverId!)
 : this.driverService.lockDriverLogin(this.driverId!, this.composeReviewNote()),
 this.getLoginLockSuccessMessage(isLocked ? 'unlock' : 'lock')
 );
 }

 updateLocationAccess(action: 'block' | 'unblock'): void {
 if (!this.driverId ||!this.driver || this.isMutating) {
 return;
 }

 this.runMutation(
 () => action === 'unblock'
 ? this.driverService.unblockDriverLocationUpdates(this.driverId!)
 : this.driverService.blockDriverLocationUpdates(this.driverId!),
 this.getLocationAccessSuccessMessage(action)
 );
 }

 executeWorkflowAction(actionId: DriverWorkflowActionId): void {
 if (this.isMutating) {
 return;
 }

 switch (actionId) {
 case 'APPROVE_VERIFICATION':
 this.requestReviewAction('approve');
 break;
 case 'REQUEST_DOCUMENTS':
 this.requestReviewAction('request-docs');
 break;
 case 'REJECT_VERIFICATION':
 this.requestReviewAction('reject');
 break;
 case 'SUSPEND_DRIVER':
 case 'REACTIVATE_DRIVER':
 this.toggleSuspension();
 break;
 case 'BAN_DRIVER':
 case 'UNBAN_DRIVER':
 this.banDriver();
 break;
 case 'CLEAR_DRIVER_RESTRICTIONS':
 this.clearDriverRestrictions();
 break;
 default:
 this.openWorkflowContext(actionId);
 break;
 }
 }

 sendTestNotification(): void {
 if (!this.driverId ||!this.driver || this.isSendingTestNotification) {
 return;
 }

 this.isSendingTestNotification = true;
 const driver = this.driver;
 const displayName = `${driver.firstName} ${driver.lastName}`.trim();

 this.driverService.sendTestNotification(this.driverId, {
 titleAr: 'إشعار تجريبي من الأدمن',
 titleEn: this.testNotificationTitle.trim() || 'Admin mobile test notification',
 bodyAr: `هذا إشعار تجريبي للمندوب ${displayName || driver.driverId} للتأكد من وصول إشعارات تطبيق المندوب.`,
 bodyEn: this.testNotificationBody.trim() || `This is a test mobile notification for ${displayName || driver.driverId}.`,
 type: this.testNotificationType.trim() || 'driver_test',
 targetUrl: this.testNotificationTargetUrl.trim() || null,
 sendPush: this.testNotificationSendPush
 }).pipe(
 takeUntil(this.destroy$),
 finalize(() => {
 this.isSendingTestNotification = false;
 })
 ).subscribe({
 next: (response) => {
 this.cdr.markForCheck();
 this.showNotificationResult(response);
 },
 error: (err) => {
 this.cdr.markForCheck();
 console.error('Driver test notification failed', err);
 this.toastService.error(
 describeApiError(err, this.translate, { fallbackKey: 'DRIVERS.DETAIL.MESSAGES.TEST_NOTIFICATION_FAILED' }),
 this.t('DRIVERS.DETAIL.TEST_NOTIFICATION.TOAST_TITLE')
 );
 }
 });
 }

 toggleTestNotificationComposer(): void {
 this.showTestNotificationComposer =!this.showTestNotificationComposer;
 }

 private runMutation(
 requestFactory: () => ReturnType<DriverService['addDriverNote']>,
 successMessage: string,
 afterSuccess?: () => void
 ): void {
 if (!this.driverId) {
 return;
 }

 this.isMutating = true;
 requestFactory().pipe(
 takeUntil(this.destroy$),
 finalize(() => {
 this.isMutating = false;
 })
 ).subscribe({
 next: () => {
 this.cdr.markForCheck();
 afterSuccess?.();
 this.toastService.success(successMessage);
 this.loadDriver(this.driverId!, false);
 },
 error: (err) => {
 this.cdr.markForCheck();
 console.error('Driver mutation failed', err);
 this.toastService.error(
 describeApiError(err, this.translate, { fallbackKey: 'DRIVERS.DETAIL.MESSAGES.ACTION_FAILED' })
 );
 }
 });
 }

 private composeReviewNote(): string | undefined {
 const parts = [
 this.selectedRejectionReason,
 this.reviewerDecisionNote,
 this.internalReviewNote
 ].map((item) => item.trim()).filter(Boolean);

 return parts.length ? parts.join('\n') : undefined;
 }

 private openWorkflowContext(actionId: DriverWorkflowActionId): void {
 const action = this.driver?.workflow.actions.find((item) => item.id === actionId);
 if (action?.targetTab) {
 this.activeTab = action.targetTab;
 }

 this.toastService.info(this.t('DRIVERS.DETAIL.MESSAGES.OPENED_RELATED_SECTION'));
 }

 private getReviewSuccessMessage(action: 'approve' | 'request-docs' | 'reject'): string {
 switch (action) {
 case 'approve':
 return this.t('DRIVERS.DETAIL.MESSAGES.VERIFICATION_APPROVED');
 case 'request-docs':
 return this.t('DRIVERS.DETAIL.MESSAGES.DOCUMENT_REQUEST_SUBMITTED');
 case 'reject':
 return this.t('DRIVERS.DETAIL.MESSAGES.VERIFICATION_REJECTED');
 }
 }

 private getLocationAccessSuccessMessage(action: 'block' | 'unblock'): string {
 return this.t(action === 'unblock'
 ? 'DRIVERS.DETAIL.MESSAGES.LOCATION_UPDATES_UNBLOCKED'
 : 'DRIVERS.DETAIL.MESSAGES.LOCATION_UPDATES_BLOCKED');
 }

 private getLoginLockSuccessMessage(action: 'lock' | 'unlock'): string {
 return this.t(action === 'unlock'
 ? 'DRIVERS.DETAIL.MESSAGES.LOGIN_UNLOCKED'
 : 'DRIVERS.DETAIL.MESSAGES.LOGIN_LOCKED');
 }

 private t(key: string): string {
 return this.translate.instant(key);
 }

 private decideSelectedApproval(
 requestFactory: () => ReturnType<AdminAccessApiService['approveApproval']>,
 successMessage: string
 ): void {
 if (!this.selectedApproval ||!this.driverId) {
 return;
 }

 this.isApprovalDeciding = true;
 requestFactory().pipe(
 takeUntil(this.destroy$),
 finalize(() => {
 this.isApprovalDeciding = false;
 })
 ).subscribe({
 next: () => {
 this.cdr.markForCheck();
 this.toastService.success(successMessage);
 this.selectedApproval = null;
 this.approvalDecisionNote = '';
 this.loadDriver(this.driverId!, false);
 this.loadDriverApprovals(this.driverId!);
 },
 error: (err) => {
 this.cdr.markForCheck();
 console.error('Driver approval decision failed', err);
 this.toastService.error(describeApiError(err, this.translate));
 }
 });
 }

 private isApprovalForDriver(approval: AccessApprovalRequestDto, driverId: string): boolean {
 if (!approval.action.startsWith('driver.')) {
 return false;
 }

 if (approval.reviewDetails?.entityType === 'driver' && approval.reviewDetails.entityId === driverId) {
 return true;
 }

 try {
 const payload = JSON.parse(approval.payloadJson || '{}') as { driverId?: string };
 return payload.driverId === driverId;
 } catch {
 return false;
 }
 }

 private buildApprovalBlockerMessage(driver: DriverDetailRecord): string | null {
 const invalidDocuments = driver.documents.filter((document) => document.status!== 'valid').map((document) => this.t(document.title));

 const incompleteChecklist = driver.verification.checklist.filter((item) =>!item.completed).map((item) => this.t(item.label));

 if (!invalidDocuments.length && driver.profileReadiness.isProfileComplete) {
 return null;
 }

 const pendingApprovalsSummary = this.driverApprovals.length > 0
 ? (this.isRTL
 ? `فيه ${this.driverApprovals.length} تعديل معلق لازم تعتمده من قسم "تعديلات معلقة" قبل اعتماد الحساب. `
 : `${this.driverApprovals.length} pending profile change(s) must be approved in the pending changes section before final approval. `)
 : '';

 const documentSummary = invalidDocuments.length
 ? `${this.t('DRIVERS.DETAIL.MESSAGES.APPROVAL_BLOCKED_DOCUMENTS')} ${invalidDocuments.join('، ')}.`
 : '';

 const checklistSummary = incompleteChecklist.length
 ? `${this.t('DRIVERS.DETAIL.MESSAGES.APPROVAL_BLOCKED_REQUIREMENTS')} ${incompleteChecklist.join('، ')}.`
 : '';

 return [
 this.t('DRIVERS.DETAIL.MESSAGES.APPROVAL_BLOCKED'),
 pendingApprovalsSummary,
 documentSummary,
 checklistSummary
 ].filter(Boolean).join(' ');
 }

 private showNotificationResult(response: AdminDriverNotificationResponse): void {
 const title = this.t('DRIVERS.DETAIL.TEST_NOTIFICATION.TOAST_TITLE');
 const pushReason = this.describePushReason(response.pushReason);

 if (response.pushSent) {
 this.toastService.success(
 this.t('DRIVERS.DETAIL.MESSAGES.TEST_NOTIFICATION_PUSH_SENT'),
 title
 );
 return;
 }

 if (response.pushSkipped) {
 this.toastService.warning(
 pushReason || this.t('DRIVERS.DETAIL.MESSAGES.TEST_NOTIFICATION_INBOX_ONLY'),
 title
 );
 return;
 }

 this.toastService.warning(
 pushReason || this.t('DRIVERS.DETAIL.MESSAGES.TEST_NOTIFICATION_UNCONFIRMED'),
 title
 );
 }

 private describePushReason(reason?: string | null): string {
 const normalizedReason = reason?.trim();
 if (!normalizedReason) {
 return '';
 }

 if (
 normalizedReason.includes('Driver OneSignal AppId or RestApiKey is not configured')
 || normalizedReason.includes('OneSignal AppId or RestApiKey is not configured')
 ) {
 return this.t('DRIVERS.DETAIL.MESSAGES.TEST_NOTIFICATION_PUSH_CONFIG_MISSING');
 }

 if (
 normalizedReason.includes('No active push-enabled devices')
 || normalizedReason.includes('No eligible OneSignal recipients')
 ) {
 return this.t('DRIVERS.DETAIL.MESSAGES.TEST_NOTIFICATION_NO_PUSH_DEVICE');
 }

 return normalizedReason;
 }

}
