import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { AdminVendorOrderItem, VendorService } from '@vendors/services/vendor.api.service';
import { VendorDetail, VendorReviewDocument, VendorReviewDocumentStatus } from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

interface OverviewMetric {
 id: string;
 label: string;
 value: string;
 helper: string;
 icon: string;
 cardClass: string;
 iconClass: string;
 valueClass: string;
}

interface OverviewFact {
 id: string;
 label: string;
 value: string;
 icon: string;
 dir?: 'ltr' | 'rtl';
}

interface ReviewCheckpoint {
 id: string;
 label: string;
 hint: string;
 icon: string;
 state: 'done' | 'attention' | 'neutral';
}

interface OrderRow {
 id: string;
 orderNumber: string;
 customer: string;
 amount: string;
 status: string;
 statusKey: string;
}

interface DocumentCard {
 id: string;
 titleKey: string;
 number: string;
 status: VendorReviewDocumentStatus;
 statusKey: string;
 icon: string;
 iconBgClass: string;
}

interface AlertCard {
 id: string;
 titleKey: string;
 descriptionKey: string;
 icon: string;
 variant: 'warning' | 'error';
}

interface HealthIndicator {
 id: string;
 label: string;
 value: string;
 progress: number;
 barClass: string;
 valueClass: string;
}

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-vendor-overview',
 standalone: true,
 imports: [CommonModule, TranslateModule, InlineBannerComponent, SectionHeaderComponent, StatusPillComponent],
 templateUrl: './vendor-overview.component.html'
})
export class VendorOverviewComponent {
 private readonly cdr = inject(ChangeDetectorRef);
 vendorId = '';
 vendorName = '';
 vendorLocation = '';
 currentLang = 'ar';
 isRTL = true;
 mutationError = '';
 vendorDetail: VendorDetail | null = null;

 metrics: OverviewMetric[] = [];
 heroFacts: OverviewFact[] = [];
 storeFacts: OverviewFact[] = [];
 reviewChecklist: ReviewCheckpoint[] = [];
 healthIndicators: HealthIndicator[] = [];
 documents: DocumentCard[] = [];
 recentOrders: OrderRow[] = [];
 alerts: AlertCard[] = [];
 copiedFields = new Map<string, boolean>();

 private ordersData: AdminVendorOrderItem[] = [];
 private readonly destroyRef = inject(DestroyRef);

 copyToClipboard(fieldId: string, text: string): void {
 if (!text || text === '-') {
 return;
 }
 navigator.clipboard.writeText(text).then(() => {
 this.copiedFields.set(fieldId, true);
 this.cdr.markForCheck();
 setTimeout(() => {
 this.copiedFields.set(fieldId, false);
 this.cdr.markForCheck();
 }, 2000);
 }).catch(() => undefined);
 }

 constructor(
 private readonly translate: TranslateService,
 private readonly router: Router,
 private readonly vendorService: VendorService,
 private readonly vendorDetailFacade: VendorDetailFacade
 ) {
 this.currentLang = this.translate.currentLang || 'ar';
 this.isRTL = this.currentLang === 'ar';

 this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
 this.cdr.markForCheck();
 this.currentLang = event.lang;
 this.isRTL = event.lang === 'ar';
 this.rebuildViewModel();
 });

 this.vendorDetailFacade.vendor$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((vendor) => {
 this.cdr.markForCheck();
 if (!vendor) {
 return;
 }

 this.vendorDetail = vendor;
 this.vendorId = vendor.id;
 this.loadOrders();
 this.rebuildViewModel();
 });

 this.vendorDetailFacade.mutationError$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((error) => {
 this.cdr.markForCheck();
 this.mutationError = error ?? '';
 });
 }

 get reviewStateLabelKey(): string {
 const state = this.vendorDetail?.reviewState;
 const labelMap: Record<string, string> = {
 awaiting_submission: 'VENDOR_REVIEW.STATE.AWAITING_SUBMISSION',
 submitted: 'VENDOR_REVIEW.STATE.SUBMITTED',
 under_review: 'VENDOR_REVIEW.STATE.UNDER_REVIEW',
 changes_requested: 'VENDOR_REVIEW.STATE.CHANGES_REQUESTED',
 verified: 'VENDOR_REVIEW.STATE.VERIFIED',
 rejected: 'VENDOR_REVIEW.STATE.REJECTED',
 suspended: 'VENDOR_REVIEW.STATE.SUSPENDED'
 };

 return labelMap[state || ''] ?? 'VENDORS.STATUS.PENDING';
 }

 get reviewStateVariant(): StatusPillVariant {
 switch (this.vendorDetail?.reviewState) {
 case 'verified':
 return 'success';
 case 'changes_requested':
 return 'warning';
 case 'submitted':
 case 'under_review':
 return 'processing';
 case 'rejected':
 case 'suspended':
 return 'danger';
 default:
 return 'neutral';
 }
 }

 get reviewSummaryKey(): string {
 switch (this.vendorDetail?.reviewState) {
 case 'awaiting_submission':
 return 'VENDOR_REVIEW.SUMMARY.WAITING_VENDOR';
 case 'submitted':
 case 'under_review':
 return 'VENDOR_REVIEW.SUMMARY.READY_TO_VERIFY';
 case 'changes_requested':
 return 'VENDOR_REVIEW.SUMMARY.CHANGES_REQUIRED';
 case 'verified':
 return 'VENDOR_REVIEW.SUMMARY.VERIFIED_SUCCESS';
 case 'rejected':
 return 'VENDOR_REVIEW.SUMMARY.REJECTED';
 case 'suspended':
 return 'VENDOR_REVIEW.SUMMARY.SUSPENDED';
 default:
 return 'VENDOR_REVIEW.SUMMARY.WAITING_VENDOR';
 }
 }

 get assignedReviewer(): string {
 const explicitReviewer = this.vendorDetail?.approvedBy?.trim();
 if (explicitReviewer) {
 return explicitReviewer;
 }

 return this.vendorDetail?.reviewNotes?.find((note) =>!!note.authorName?.trim())?.authorName?.trim() || '-';
 }

 get reviewSubmittedAt(): string {
 return this.formatDate(this.vendorDetail?.reviewSubmittedAtUtc || this.vendorDetail?.createdAtUtc || null);
 }

 get reviewBlockers(): VendorReviewDocument[] {
 return (this.vendorDetail?.reviewDocuments || []).filter((document) => document.status!== 'completed');
 }

 get canApproveVendor(): boolean {
 if (!this.vendorDetail) {
 return false;
 }

 return this.vendorDetail.status === 'Pending'
 &&!!this.vendorDetail.readyForFinalApproval
 &&!this.vendorDetail.approvedAtUtc
 &&!this.vendorDetail.isLoginLocked
 &&!this.vendorDetail.archivedAtUtc;
 }

 get isCrExpired(): boolean {
 if (!this.vendorDetail?.commercialRegistrationExpiryDate) {
 return false;
 }
 const expiry = new Date(this.vendorDetail.commercialRegistrationExpiryDate);
 expiry.setHours(0, 0, 0, 0);
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 return expiry.getTime() < today.getTime();
 }

 get canReactivateVendor(): boolean {
 if (!this.vendorDetail) {
 return false;
 }

 return this.vendorDetail.status === 'Suspended'
 &&!this.isCrExpired
 &&!this.vendorDetail.isLoginLocked
 &&!this.vendorDetail.archivedAtUtc;
 }

 get canSuspendVendor(): boolean {
 if (!this.vendorDetail) {
 return false;
 }

 return this.vendorDetail.status === 'Active'
 &&!this.vendorDetail.archivedAtUtc
 &&!this.vendorDetail.isLoginLocked;
 }

 get primaryActionLabel(): string {
 if (this.canReactivateVendor) {
 return this.localize('إعادة تفعيل الحساب', 'Reactivate account');
 }

 return this.translate.instant('VENDOR_OVERVIEW.ACTIONS.APPROVE');
 }

 get executiveSummaryEyebrow(): string {
 return this.localize('ملخص تنفيذي', 'Executive summary');
 }

 get executiveSummaryText(): string {
 const location = this.vendorLocation || this.localize('الموقع غير محدد', 'Location not specified');
 return this.localize(
 `النشاط مسجل في ${location}. ${this.nextStepMessage}`,
 `This vendor operates in ${location}. ${this.nextStepMessage}`
 );
 }

 get currentStatusLabelKey(): string {
 const map: Record<string, string> = {
 Active: 'COMMON.ACTIVE',
 Pending: 'VENDORS.STATUS.PENDING',
 Suspended: 'VENDORS.STATUS.SUSPENDED',
 Rejected: 'VENDORS.STATUS.REJECTED'
 };

 return map[this.vendorDetail?.status ?? ''] ?? 'VENDORS.STATUS.PENDING';
 }

 get currentStatusVariant(): StatusPillVariant {
 switch (this.vendorDetail?.status) {
 case 'Active':
 return 'success';
 case 'Suspended':
 case 'Rejected':
 return 'danger';
 case 'Pending':
 return 'warning';
 default:
 return 'neutral';
 }
 }

 get verificationLabelKey(): string {
 const map: Record<string, string> = {
 Verified: 'VENDOR_DETAIL.STATUS_VERIFIED',
 Pending: 'VENDORS.STATUS.PENDING',
 Unverified: 'VENDOR_REVIEW.STATUS.UNVERIFIED'
 };

 return map[this.vendorDetail?.verificationStatus ?? ''] ?? 'VENDORS.STATUS.PENDING';
 }

 get verificationVariant(): StatusPillVariant {
 switch (this.vendorDetail?.verificationStatus) {
 case 'Verified':
 return 'success';
 case 'Pending':
 return 'processing';
 case 'Unverified':
 return 'warning';
 default:
 return 'neutral';
 }
 }

 get riskLabel(): string {
 return this.resolveRiskLabel();
 }

 get riskVariant(): StatusPillVariant {
 switch (this.resolveRiskLevel().toLowerCase()) {
 case 'low':
 return 'success';
 case 'medium':
 return 'warning';
 case 'high':
 case 'critical':
 return 'high-risk';
 default:
 return 'neutral';
 }
 }

 get documentsProgressValue(): number {
 if (typeof this.vendorDetail?.documentsCompleteness === 'number') {
 return this.clamp(this.vendorDetail.documentsCompleteness, 0, 100);
 }

 if (!this.vendorDetail?.reviewDocuments.length) {
 return 0;
 }

 const completedCount = this.vendorDetail.reviewDocuments.filter((item) => item.status === 'completed').length;
 return Math.round((completedCount / this.vendorDetail.reviewDocuments.length) * 100);
 }

 get completedDocumentsCount(): number {
 return this.vendorDetail?.reviewDocuments.filter((document) => document.status === 'completed').length ?? 0;
 }

 get accountHealthScore(): number {
 if (!this.vendorDetail) {
 return 0;
 }

 const docsScore = this.documentsProgressValue;
 const blockersScore = Math.max(0, 100 - (this.reviewBlockers.length * 24));
 const bankScore = this.resolveBankScore(this.vendorDetail.primaryBankAccount?.status || null, this.vendorDetail.bankAccountsCount);
 const riskScore = this.resolveRiskScore();
 const complaintsScore = Math.max(20, 100 - ((this.vendorDetail.complaintsCount ?? 0) * 10));

 return Math.round(
 (docsScore * 0.35)
 + (blockersScore * 0.2)
 + (bankScore * 0.2)
 + (riskScore * 0.15)
 + (complaintsScore * 0.1)
 );
 }

 get accountHealthLabel(): string {
 const score = this.accountHealthScore;

 if (score >= 85) {
 return this.localize('جاهزية قوية', 'Strong readiness');
 }

 if (score >= 70) {
 return this.localize('وضع مستقر', 'Stable status');
 }

 if (score >= 50) {
 return this.localize('يحتاج متابعة', 'Needs attention');
 }

 return this.localize('حالة حرجة', 'Critical state');
 }

 get accountHealthDescription(): string {
 if (this.canApproveVendor) {
 return this.localize('ما فيه عوائق رئيسية تمنع اتخاذ القرار الحين.', 'No major blockers are preventing a decision now.');
 }

 if (this.reviewBlockers.length > 0) {
 return this.localize('أغلق العناصر المعلّقة أولًا لتقليل التأخير في المراجعة.', 'Resolve pending blockers first to reduce review delays.');
 }

 return this.localize('الحساب منظم، لكنه يحتاج خطوة تشغيلية أخيرة قبل الإغلاق.', 'The account is organized, but still needs one operational step before closure.');
 }

 get nextStepTitle(): string {
 if (this.canApproveVendor) {
 return this.localize('الحساب جاهز للاعتماد', 'Ready for approval');
 }

 if (this.canReactivateVendor) {
 return this.localize('يمكن إعادة تفعيل الحساب', 'Ready for reactivation');
 }

 switch (this.vendorDetail?.reviewState) {
 case 'awaiting_submission':
 return this.localize('بانتظار استكمال الملف', 'Waiting for full submission');
 case 'submitted':
 case 'under_review':
 return this.reviewBlockers.length > 0
 ? this.localize('توجد عناصر تحتاج مراجعة', 'There are items pending review')
 : this.localize('الملف تحت التقييم النهائي', 'The file is in final review');
 case 'changes_requested':
 return this.localize('المطلوب متابعة التعديلات', 'Changes need follow-up');
 case 'verified':
 return this.localize('الحساب معتمد', 'Account verified');
 case 'rejected':
 return this.localize('رفضنا الملف', 'The file was rejected');
 case 'suspended':
 return this.localize('الحساب موقوف', 'Account is suspended');
 default:
 return this.localize('تحتاج الصورة الكاملة لمراجعة إضافية', 'The account needs another quick review');
 }
 }

 get nextStepMessage(): string {
 if (this.canApproveVendor) {
 return this.localize(
 'المستندات الأساسية مكتملة ويمكن للأدمن اعتماد التاجر من نفس الصفحة.',
 'Core documents are complete and the admin can approve the vendor directly from this page.'
 );
 }

 if (this.canReactivateVendor) {
 return this.localize(
 'الحساب موقوف لكن ما فيه قفل دخول أو أرشفة تمنع إعادة تفعيله.',
 'The account is suspended, but there is no login lock or archive flag blocking reactivation.'
 );
 }

 switch (this.vendorDetail?.reviewState) {
 case 'awaiting_submission':
 return this.localize(
 'التاجر لم يرفع كل ما يلزم بعد، والأولوية الحين هي طلب الاستكمال.',
 'The vendor has not uploaded everything yet, so the current priority is requesting completion.'
 );
 case 'submitted':
 case 'under_review':
 return this.reviewBlockers.length > 0
 ? this.localize(
 'هناك مستندات أو ملاحظات غير مكتملة، لذا الأفضل مراجعتها قبل اتخاذ القرار.',
 'Some documents or review notes are still incomplete, so they should be checked before deciding.'
 )
 : this.localize(
 'كل شيء شبه جاهز، ويكفي التحقق النهائي من المخاطر والحساب البنكي.',
 'Everything is nearly ready; only a final check on risk and bank readiness is needed.'
 );
 case 'changes_requested':
 return this.localize(
 'أرسلنا ملاحظات للتاجر، ولسه المتابعة مطلوبة قبل إعادة التقييم.',
 'Feedback has already been sent to the vendor, and follow-up is needed before reassessment.'
 );
 case 'verified':
 return this.localize(
 'الحساب في وضع جيد ويمكن استخدام الصفحة لمراقبة الطلبات والمستندات والحالة التشغيلية.',
 'The account is in a good state and this page can now be used to monitor orders, documents, and operations.'
 );
 case 'rejected':
 return this.localize(
 'رفضنا الملف، ويُفضّل مراجعة سبب القرار قبل أي خطوة لاحقة.',
 'The file was rejected, so the decision reason should be reviewed before taking any next step.'
 );
 case 'suspended':
 return this.localize(
 'الحساب موقوف الحين، لذلك راجع سبب الإيقاف قبل إعادة التفعيل أو التصعيد.',
 'The account is currently suspended, so review the suspension reason before reactivation or escalation.'
 );
 default:
 return this.localize(
 'الصفحة تعرض أهم النقاط التشغيلية والامتثالية لتسريع اتخاذ القرار.',
 'This page surfaces the key operational and compliance signals to help accelerate decisions.'
 );
 }
 }

 get reviewCenterTitle(): string {
 return this.localize('مركز القرار', 'Decision center');
 }

 get reviewCenterDescription(): string {
 return this.localize(
 'الحالة الحالية، العناصر المعلّقة، والخطوة التالية في مكان واحد.',
 'Current status, blockers, and the recommended next step in one place.'
 );
 }

 get actionCenterTitle(): string {
 return this.localize('الإجراءات الإدارية', 'Admin actions');
 }

 get actionCenterDescription(): string {
 return this.localize(
 'اختر الإجراء المناسب حسب جاهزية الملف بدل التنقل بين أكثر من تبويب.',
 'Choose the right action based on the account state without switching across tabs.'
 );
 }

 get emptyOrdersTitle(): string {
 return this.localize('ما فيه طلبات حديثة', 'No recent orders');
 }

 get emptyOrdersMessage(): string {
 return this.localize(
 'عند وصول طلبات جديدة لهذا التاجر بتظهر هنا مع الحالة والقيمة.',
 'Once new orders arrive for this vendor, they will appear here with status and amount.'
 );
 }

 get emptyAlertsTitle(): string {
 return this.localize('ما فيه تنبيهات حرجة الحين', 'No critical alerts right now');
 }

 get emptyAlertsMessage(): string {
 return this.localize(
 'هذا مؤشر جيد. ما زالت الصفحة تعرض المخاطر والمستندات المعلّقة إن ظهرت لاحقًا.',
 'This is a good sign. The page will still surface risk and pending documents if anything changes later.'
 );
 }

 get decisionReasonTitle(): string {
 return this.localize('ملاحظة قرار سابقة', 'Previous decision note');
 }

 get checklistTitle(): string {
 return this.localize('قائمة التحقق السريعة', 'Quick checklist');
 }

 get checklistMeta(): string {
 const doneCount = this.reviewChecklist.filter((item) => item.state === 'done').length;
 return `${this.formatNumber(doneCount)} / ${this.formatNumber(this.reviewChecklist.length)}`;
 }

 get documentsMeta(): string {
 const totalDocuments = this.vendorDetail?.reviewDocuments.length ?? 0;
 return `${this.formatNumber(this.completedDocumentsCount)} / ${this.formatNumber(totalDocuments)}`;
 }

 get alertsMeta(): string {
 return this.formatNumber(this.alerts.length);
 }

 get ordersMeta(): string {
 return this.localize(
 `${this.formatNumber(this.recentOrders.length)} طلبات معروضة`,
 `${this.formatNumber(this.recentOrders.length)} orders shown`
 );
 }

 get actionFailedTitle(): string {
 return this.localize('ما قدرنا تنفيذ الإجراء', 'Action failed');
 }

 onApproveVendor(): void {
 if (!this.vendorDetail) {
 return;
 }

 this.vendorDetailFacade.clearMutationError();

 if (this.canReactivateVendor) {
 this.vendorDetailFacade.reactivateVendorAccount();
 return;
 }

 if (!this.canApproveVendor) {
 this.mutationError = this.localize(
 'ما تقدر تعتمد هذا التاجر في حالته الحالية.',
 'This vendor cannot be approved in its current state.'
 );
 return;
 }

 this.vendorDetailFacade.approveVendorReview(this.vendorDetail.commissionRate ?? 13);
 }

 onRequestDocuments(): void {
 if (!this.vendorDetail) {
 return;
 }

 this.vendorDetailFacade.clearMutationError();
 this.vendorDetailFacade.requestVendorDocuments();
 }

 onSuspendVendor(): void {
 if (!this.vendorDetail ||!this.canSuspendVendor) {
 return;
 }

 this.vendorDetailFacade.clearMutationError();
 this.vendorDetailFacade.suspendVendorAccount();
 }

 onViewAllOrders(): void {
 void this.router.navigate(['/vendors', this.vendorId, 'orders']);
 }

 onViewAllDocuments(): void {
 void this.router.navigate(['/vendors', this.vendorId, 'compliance']);
 }

 onFilterOrders(): void {
 void this.router.navigate(['/vendors', this.vendorId, 'orders']);
 }

 onViewOrderDetails(orderId: string): void {
 void this.router.navigate(['/orders', orderId]);
 }

 onOpenCompliance(): void {
 void this.router.navigate(['/vendors', this.vendorId, 'compliance']);
 }

 onOpenVendorData(): void {
 void this.router.navigate(['/vendors', this.vendorId, 'data']);
 }

 getDocumentStatusVariant(status: VendorReviewDocumentStatus): StatusPillVariant {
 switch (status) {
 case 'completed':
 return 'success';
 case 'pending':
 return 'warning';
 case 'missing':
 return 'danger';
 default:
 return 'neutral';
 }
 }

 getOrderStatusVariant(status: string): StatusPillVariant {
 switch (status.toLowerCase()) {
 case 'delivered':
 return 'success';
 case 'placed':
 case 'preparing':
 case 'ontheway':
 return 'processing';
 case 'pending':
 return 'warning';
 case 'cancelled':
 return 'danger';
 default:
 return 'neutral';
 }
 }

 getCheckpointClasses(checkpoint: ReviewCheckpoint): string {
 const palette: Record<ReviewCheckpoint['state'], string> = {
 done: 'border-emerald-200 bg-emerald-50/80',
 attention: 'border-amber-200 bg-amber-50/80',
 neutral: 'border-slate-200 bg-slate-50/80'
 };

 return palette[checkpoint.state];
 }

 getCheckpointIconClasses(checkpoint: ReviewCheckpoint): string {
 const palette: Record<ReviewCheckpoint['state'], string> = {
 done: 'bg-emerald-100 text-emerald-700',
 attention: 'bg-amber-100 text-amber-700',
 neutral: 'bg-slate-200 text-slate-600'
 };

 return palette[checkpoint.state];
 }

 private loadOrders(): void {
 this.vendorService.getVendorOrders(this.vendorId, 1, 5).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
 next: (response) => {
 this.cdr.markForCheck();
 this.ordersData = response.items ?? [];
 this.rebuildViewModel();
 },
 error: () => {
 this.cdr.markForCheck();
 this.ordersData = [];
 this.rebuildViewModel();
 }
 });
 }

 private rebuildViewModel(): void {
 const vendor = this.vendorDetail;
 if (!vendor) {
 return;
 }

 this.vendorName = this.getDisplayStoreName(vendor);
 this.vendorLocation = [this.getLocalizedCity(vendor.city), this.getLocalizedRegion(vendor.region)].filter(Boolean).join(this.isRTL ? '، ' : ', ');

 this.heroFacts = [
 {
 id: 'location',
 label: this.localize('الموقع', 'Location'),
 value: this.vendorLocation || this.localize('غير محدد', 'Not specified'),
 icon: 'location_on'
 },
 {
 id: 'category',
 label: this.localize('نوع النشاط', 'Business type'),
 value: this.getDisplayBusinessType(vendor.businessType),
 icon: 'category'
 },
 {
 id: 'last-active',
 label: this.localize('آخر نشاط', 'Last active'),
 value: this.formatDate(vendor.lastActiveAtUtc || vendor.updatedAtUtc || vendor.createdAtUtc),
 icon: 'schedule'
 }
 ];

 this.storeFacts = [
 {
 id: 'owner',
 label: this.localize('المالك', 'Owner'),
 value: vendor.ownerName || '-',
 icon: 'person'
 },
 {
 id: 'phone',
 label: this.translate.instant('VENDOR_OVERVIEW.PHONE'),
 value: vendor.contactPhone || '-',
 icon: 'call',
 dir: 'ltr'
 },
 {
 id: 'email',
 label: this.translate.instant('VENDOR_OVERVIEW.EMAIL'),
 value: vendor.contactEmail || '-',
 icon: 'mail',
 dir: 'ltr'
 },
 {
 id: 'commercial-register',
 label: this.localize('السجل التجاري', 'Commercial registration'),
 value: vendor.commercialRegistrationNumber || '-',
 icon: 'badge',
 dir: 'ltr'
 },
 {
 id: 'vendor-id',
 label: this.localize('معرف التاجر', 'Vendor ID'),
 value: vendor.id,
 icon: 'fingerprint',
 dir: 'ltr'
 }
 ];

 this.metrics = [
 {
 id: 'docs',
 label: this.localize('اكتمال المستندات', 'Documents completion'),
 value: `${this.documentsProgressValue}%`,
 helper: this.reviewBlockers.length > 0
 ? this.localize(
 `${this.formatNumber(this.reviewBlockers.length)} عناصر تحتاج متابعة`,
 `${this.formatNumber(this.reviewBlockers.length)} items need attention`
 )
 : this.localize('كل المستندات الأساسية مكتملة', 'All required documents are complete'),
 icon: 'task_alt',
 cardClass: 'border-emerald-200 bg-emerald-50/80',
 iconClass: 'bg-white text-emerald-700',
 valueClass: 'text-emerald-700'
 },
 {
 id: 'branches',
 label: this.localize('الفروع المرتبطة', 'Linked branches'),
 value: this.formatNumber(vendor.branchesCount),
 helper: this.vendorLocation || this.localize('بدون موقع واضح', 'Location not specified'),
 icon: 'storefront',
 cardClass: 'border-sky-200 bg-sky-50/80',
 iconClass: 'bg-white text-sky-700',
 valueClass: 'text-sky-700'
 },
 {
 id: 'bank-accounts',
 label: this.localize('الحسابات البنكية', 'Bank accounts'),
 value: this.formatNumber(vendor.bankAccountsCount),
 helper: this.resolveBankLabel(vendor.primaryBankAccount?.status || null, vendor.bankAccountsCount),
 icon: 'account_balance',
 cardClass: 'border-violet-200 bg-violet-50/80',
 iconClass: 'bg-white text-violet-700',
 valueClass: 'text-violet-700'
 },
 {
 id: 'complaints',
 label: this.localize('الشكاوى المسجلة', 'Reported complaints'),
 value: this.formatNumber(vendor.complaintsCount ?? 0),
 helper: vendor.performanceRating
 ? this.localize(
 `تقييم الأداء ${this.formatNumber(vendor.performanceRating)} / 5`,
 `Performance rating ${this.formatNumber(vendor.performanceRating)} / 5`
 )
 : this.localize('ما فيه تقييم أداء واضح بعد', 'No performance rating recorded yet'),
 icon: 'sentiment_dissatisfied',
 cardClass: 'border-amber-200 bg-amber-50/80',
 iconClass: 'bg-white text-amber-700',
 valueClass: 'text-amber-700'
 }
 ];

 this.healthIndicators = [
 {
 id: 'documents',
 label: this.localize('المستندات', 'Documents'),
 value: `${this.documentsProgressValue}%`,
 progress: this.documentsProgressValue,
 barClass: 'bg-emerald-500',
 valueClass: 'text-emerald-700'
 },
 {
 id: 'banking',
 label: this.localize('الجاهزية البنكية', 'Banking readiness'),
 value: this.resolveBankLabel(vendor.primaryBankAccount?.status || null, vendor.bankAccountsCount),
 progress: this.resolveBankScore(vendor.primaryBankAccount?.status || null, vendor.bankAccountsCount),
 barClass: 'bg-violet-500',
 valueClass: 'text-violet-700'
 },
 {
 id: 'risk',
 label: this.localize('المخاطر', 'Risk'),
 value: this.riskLabel,
 progress: this.resolveRiskScore(),
 barClass: 'bg-amber-500',
 valueClass: 'text-amber-700'
 },
 {
 id: 'complaints',
 label: this.localize('الشكاوى', 'Complaints'),
 value: this.formatNumber(vendor.complaintsCount ?? 0),
 progress: Math.max(20, 100 - ((vendor.complaintsCount ?? 0) * 10)),
 barClass: 'bg-sky-500',
 valueClass: 'text-sky-700'
 }
 ];

 this.reviewChecklist = [
 {
 id: 'submission',
 label: this.localize('تم استلام الملف', 'Submission received'),
 hint: this.vendorDetail?.reviewState === 'awaiting_submission'
 ? this.localize('بانتظار رفع المستندات الأساسية', 'Waiting for the vendor to submit the core documents')
 : this.localize(`آخر إرسال ${this.reviewSubmittedAt}`, `Last submission ${this.reviewSubmittedAt}`),
 icon: 'upload_file',
 state: this.vendorDetail?.reviewState === 'awaiting_submission' ? 'attention' : 'done'
 },
 {
 id: 'documents',
 label: this.localize('مراجعة المستندات', 'Document review'),
 hint: this.reviewBlockers.length > 0
 ? this.localize(
 `${this.formatNumber(this.reviewBlockers.length)} مستندات أو عناصر غير مكتملة`,
 `${this.formatNumber(this.reviewBlockers.length)} items are still incomplete`
 )
 : this.localize('ما فيه مستندات معلّقة', 'No pending document blockers'),
 icon: 'description',
 state: this.reviewBlockers.length > 0 ? 'attention' : 'done'
 },
 {
 id: 'bank',
 label: this.localize('الحساب البنكي الأساسي', 'Primary bank account'),
 hint: this.resolveBankLabel(vendor.primaryBankAccount?.status || null, vendor.bankAccountsCount),
 icon: 'account_balance',
 state: this.resolveBankScore(vendor.primaryBankAccount?.status || null, vendor.bankAccountsCount) >= 70 ? 'done' : 'neutral'
 },
 {
 id: 'decision',
 label: this.localize('جاهزية القرار النهائي', 'Decision readiness'),
 hint: this.nextStepTitle,
 icon: 'fact_check',
 state: this.canApproveVendor || this.canReactivateVendor ? 'done' : 'neutral'
 }
 ];

 this.recentOrders = this.ordersData.map((order) => ({
 id: order.id,
 orderNumber: order.orderNumber,
 customer: order.customerName,
 amount: this.formatCurrency(order.totalAmount),
 status: order.status,
 statusKey: this.mapOrderStatusKey(order.status)
 }));

 this.documents = vendor.reviewDocuments.slice(0, 4).map((document) => ({
 id: document.id,
 titleKey: document.titleKey,
 number: this.resolveDocumentNumber(vendor, document.type),
 status: document.status,
 statusKey: document.statusLabelKey,
 icon: document.icon,
 iconBgClass: document.iconBgClass
 }));

 const documentAlerts = vendor.reviewDocuments.filter((document) => document.status!== 'completed').map((document) => ({
 id: `doc-${document.id}`,
 titleKey: document.titleKey,
 descriptionKey: document.descriptionKey,
 icon: document.icon,
 variant: document.status === 'missing' ? 'error' as const : 'warning' as const
 }));

 const riskAlerts = vendor.riskIndicators.map((indicator) => ({
 id: indicator.id,
 titleKey: indicator.titleKey,
 descriptionKey: indicator.descriptionKey,
 icon: indicator.icon,
 variant: indicator.severity === 'high' ? 'error' as const : 'warning' as const
 }));

 this.alerts = [...documentAlerts,...riskAlerts].slice(0, 4);
 }

 localize(ar: string, en: string): string {
 return this.currentLang === 'ar' ? ar : en;
 }

 private getLocalizedCity(city?: string | null): string {
 if (!city) {
 return '';
 }
 const clean = city.trim();
 const key = `COMMON.CITIES.${clean.toUpperCase()}`;
 const translated = this.translate.instant(key);
 return translated!== key ? translated : clean;
 }

 private getLocalizedRegion(region?: string | null): string {
 if (!region) {
 return '';
 }
 const clean = region.trim();
 const key = `COMMON.REGIONS.${clean.toUpperCase()}`;
 const translated = this.translate.instant(key);
 return translated!== key ? translated : clean;
 }

 private getDisplayStoreName(vendor: VendorDetail): string {
 const preferred = this.currentLang === 'ar' ? vendor.businessNameAr : vendor.businessNameEn;
 const alternate = this.currentLang === 'ar' ? vendor.businessNameEn : vendor.businessNameAr;
 return preferred?.trim() || alternate?.trim() || vendor.ownerName?.trim() || vendor.contactEmail?.trim() || '-';
 }

 private getDisplayBusinessType(businessType?: string | null): string {
 const normalized = (businessType || '').trim();
 if (!normalized) {
 return '-';
 }

 const keyMap: Record<string, string> = {
 electronics: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.ELECTRONICS',
 food: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.FOOD',
 grocery: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.FOOD',
 fashion: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.FASHION',
 home: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.HOME'
 };

 const translatedKey = keyMap[normalized.toLowerCase()];
 if (translatedKey) {
 return this.translate.instant(translatedKey);
 }

 return normalized.replace(/[_-]+/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase());
 }

 private resolveDocumentNumber(vendor: VendorDetail, type: VendorReviewDocument['type']): string {
 switch (type) {
 case 'commercial':
 return vendor.commercialRegistrationNumber;
 case 'tax':
 return vendor.taxId || '-';
 case 'identity':
 return vendor.idNumber || '-';
 case 'bank':
 return vendor.primaryBankAccount?.iban || '-';
 case 'license':
 return vendor.licenseNumber || '-';
 default:
 return '-';
 }
 }

 private resolveRiskLevel(): string {
 if (this.vendorDetail?.riskLevel) {
 return this.vendorDetail.riskLevel;
 }

 const highestSeverity = this.vendorDetail?.riskIndicators.some((indicator) => indicator.severity === 'high')
 ? 'High'
 : this.vendorDetail?.riskIndicators.some((indicator) => indicator.severity === 'medium')
 ? 'Medium'
 : this.vendorDetail?.riskIndicators.length
 ? 'Low'
 : 'Low';

 return highestSeverity;
 }

 private resolveRiskLabel(): string {
 switch (this.resolveRiskLevel().toLowerCase()) {
 case 'low':
 return this.localize('مخاطر منخفضة', 'Low risk');
 case 'medium':
 return this.localize('مخاطر متوسطة', 'Medium risk');
 case 'high':
 return this.localize('مخاطر مرتفعة', 'High risk');
 case 'critical':
 return this.localize('مخاطر حرجة', 'Critical risk');
 default:
 return this.localize('المخاطر غير واضحة', 'Risk not classified');
 }
 }

 private resolveRiskScore(): number {
 switch (this.resolveRiskLevel().toLowerCase()) {
 case 'low':
 return 90;
 case 'medium':
 return 65;
 case 'high':
 return 35;
 case 'critical':
 return 15;
 default:
 return 55;
 }
 }

 private resolveBankLabel(status: string | null, count: number): string {
 if (!count) {
 return this.localize('ما فيه حساب بنكي مضاف', 'No bank account added');
 }

 const normalized = (status || '').toLowerCase();
 if (normalized.includes('verified') || normalized.includes('active')) {
 return this.localize('جاهز للتحويل', 'Ready for payouts');
 }

 if (normalized.includes('pending') || normalized.includes('review')) {
 return this.localize('بانتظار التحقق', 'Pending verification');
 }

 if (normalized.includes('reject') || normalized.includes('block')) {
 return this.localize('يحتاج معالجة', 'Needs attention');
 }

 return this.localize('بحاجة لمراجعة سريعة', 'Needs a quick check');
 }

 private resolveBankScore(status: string | null, count: number): number {
 if (!count) {
 return 20;
 }

 const normalized = (status || '').toLowerCase();
 if (normalized.includes('verified') || normalized.includes('active')) {
 return 95;
 }

 if (normalized.includes('pending') || normalized.includes('review')) {
 return 60;
 }

 if (normalized.includes('reject') || normalized.includes('block')) {
 return 25;
 }

 return 50;
 }

 private formatDate(value: string | null): string {
 if (!value) {
 return '-';
 }

 return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { timeZone: 'Asia/Riyadh',
 day: '2-digit',
 month: 'short',
 year: 'numeric'
 }).format(new Date(value));
 }

 private formatCurrency(value: number): string {
 return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
 style: 'currency',
 currency: 'SAR',
 maximumFractionDigits: 0
 }).format(value);
 }

 private formatNumber(value: number): string {
 return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2
 }).format(value);
 }

 private mapOrderStatusKey(status: string): string {
 switch (status.toLowerCase()) {
 case 'delivered':
 return 'VENDOR_ORDERS.GENERAL_STATUS.COMPLETED';
 case 'cancelled':
 return 'VENDOR_ORDERS.GENERAL_STATUS.CANCELLED';
 case 'placed':
 case 'preparing':
 case 'ontheway':
 return 'VENDOR_ORDERS.GENERAL_STATUS.IN_PROGRESS';
 default:
 return 'VENDOR_ORDERS.GENERAL_STATUS.NEW';
 }
 }

 private clamp(value: number, min: number, max: number): number {
 return Math.min(max, Math.max(min, value));
 }
}
