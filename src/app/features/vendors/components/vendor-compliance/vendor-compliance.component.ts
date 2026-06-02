import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { concat, of, Observable } from 'rxjs';
import { switchMap, toArray } from 'rxjs/operators';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { DeleteConfirmationModalComponent } from '@shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import {
  VendorDetail,
  VendorProfileReviewItem,
  VendorReviewDecision,
  VendorReviewDocument,
  VendorReviewNote,
  VendorRiskIndicator,
  VendorStatus
} from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

interface ComplianceMetricCard {
  id: string;
  label: string;
  value: string;
  hint: string;
  variant: StatusPillVariant;
}

interface PreviewRow {
  label: string;
  value: string;
  direction?: 'rtl' | 'ltr';
}

interface ComplianceDocumentGroup {
  id: string;
  title: string;
  hint: string;
  accentClass: string;
  documents: VendorReviewDocument[];
}

type ComplianceRailTab = 'timeline' | 'risks';
type ComplianceWorkspaceWindow = 'operations' | 'review';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-vendor-compliance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, StatusPillComponent, DeleteConfirmationModalComponent],
  templateUrl: './vendor-compliance.component.html',
  styleUrls: ['./vendor-compliance.component.scss']
})
export class VendorComplianceComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  vendorId = '';
  currentLang = 'ar';
  isRTL = true;
  newNote = '';
  actionReason = '';
  documentRejectReason = '';
  mutationError = '';
  vendorDetail: VendorDetail | null = null;
  selectedDocumentId: string | null = null;
  activeRailTab: ComplianceRailTab = 'timeline';
  activeWorkspaceWindow: ComplianceWorkspaceWindow = 'review';
  isSubmittingDocumentDecision = false;
  selectedProfileReviewCode: string | null = null;
  profileRejectReason = '';

  // Custom confirm modal states
  isConfirmModalOpen = false;
  confirmModalType: 'danger' | 'warning' | 'success' | 'info' = 'warning';
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalConfirmText = '';
  confirmModalCancelText = '';
  confirmAction: (() => void) | null = null;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly translate: TranslateService,
    private readonly vendorDetailFacade: VendorDetailFacade,
    private readonly sanitizer: DomSanitizer
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
      this.cdr.markForCheck();
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
      });

    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
      this.cdr.markForCheck();
        if (!vendor) {
          return;
        }

        this.vendorId = vendor.id;
        this.vendorDetail = vendor;

        if (!this.selectedDocumentId && vendor.reviewDocuments.length > 0) {
          this.selectedDocumentId = this.sortedReviewDocuments[0]?.id ?? null;
        }

        if (!this.selectedProfileReviewCode && this.profileReviewItems.length > 0) {
          this.selectedProfileReviewCode = this.profileReviewItems[0].code;
        }

        this.documentRejectReason = this.selectedDocument?.reviewDecision === 'rejected'
          ? (this.selectedDocument.rejectionReason ?? '')
          : '';
        this.profileRejectReason = this.selectedProfileReviewItem?.decisionNote ?? '';
      });

    this.vendorDetailFacade.mutationError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => {
      this.cdr.markForCheck();
        this.mutationError = message ?? '';
      });
  }

  get vendorDisplayName(): string {
    const vendor = this.vendorDetail;
    if (!vendor) {
      return '';
    }
    return vendor.businessNameAr || vendor.businessNameEn || vendor.ownerName || '';
  }

  get reviewDocuments(): VendorReviewDocument[] {
    return this.vendorDetail?.reviewDocuments ?? [];
  }

  get profileReviewItems(): VendorProfileReviewItem[] {
    return (this.vendorDetail?.reviewItems ?? [])
      .filter((item) => item.targetType === 'field' || item.code === 'step5.logo');
  }

  get sortedProfileReviewItems(): VendorProfileReviewItem[] {
    return [...this.profileReviewItems].sort((left, right) => {
      if (left.status === 'changes_requested' && right.status !== 'changes_requested') {
        return -1;
      }

      if (right.status === 'changes_requested' && left.status !== 'changes_requested') {
        return 1;
      }

      if (left.step !== right.step) {
        return left.step - right.step;
      }

      return left.code.localeCompare(right.code);
    });
  }

  get selectedProfileReviewItem(): VendorProfileReviewItem | null {
    if (!this.selectedProfileReviewCode) {
      return this.sortedProfileReviewItems[0] ?? null;
    }

    return this.profileReviewItems.find((item) => item.code === this.selectedProfileReviewCode) ?? this.sortedProfileReviewItems[0] ?? null;
  }

  get sortedReviewDocuments(): VendorReviewDocument[] {
    return [...this.reviewDocuments].sort((left, right) => this.getDocumentRank(left) - this.getDocumentRank(right));
  }

  get selectedDocument(): VendorReviewDocument | null {
    if (!this.selectedDocumentId) {
      return this.sortedReviewDocuments[0] ?? null;
    }

    return this.reviewDocuments.find((document) => document.id === this.selectedDocumentId) ?? this.sortedReviewDocuments[0] ?? null;
  }

  get uploadedFileDocuments(): VendorReviewDocument[] {
    return this.sortedReviewDocuments.filter((document) => !!document.fileUrl);
  }

  /**
   * Safe iframe URL for the selected compliance document. We only trust:
   *  - Absolute https URLs (e.g. CDN/blob storage links).
   *  - blob: and data:application/pdf URLs created locally.
   *
   * Anything else (javascript:, vbscript:, http on a non-local host, etc.) is
   * rejected to prevent rendering attacker-controlled content inside the
   * compliance preview iframe.
   */
  get safePreviewUrl(): SafeResourceUrl | null {
    const fileUrl = this.selectedDocument?.fileUrl;
    if (!fileUrl) {
      return null;
    }

    if (!this.isAllowedDocumentUrl(fileUrl)) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
  }

  private isAllowedDocumentUrl(value: string): boolean {
    const trimmed = (value ?? '').trim();
    if (!trimmed) {
      return false;
    }

    if (trimmed.startsWith('blob:') || trimmed.startsWith('data:application/pdf') || trimmed.startsWith('data:image/')) {
      return true;
    }

    try {
      const base = typeof window !== 'undefined' ? window.location.origin : 'https://zadana.local';
      const url = new URL(trimmed, base);
      return url.protocol === 'https:' || (url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1'));
    } catch {
      return false;
    }
  }

  get complianceNotes(): VendorReviewNote[] {
    return this.vendorDetail?.reviewNotes ?? [];
  }

  get riskIndicators(): VendorRiskIndicator[] {
    return this.vendorDetail?.riskIndicators ?? [];
  }

  get requiredDocuments(): VendorReviewDocument[] {
    return this.reviewDocuments.filter((document) => document.isRequired);
  }

  get documentsApprovedCount(): number {
    return this.reviewDocuments.filter((document) => document.reviewDecision === 'approved').length;
  }

  get documentsRejectedCount(): number {
    return this.reviewDocuments.filter((document) => document.reviewDecision === 'rejected').length;
  }

  get documentsPendingCount(): number {
    return this.reviewDocuments.filter((document) => document.reviewDecision === 'pending').length;
  }

  get uploadedDocumentsCount(): number {
    return this.reviewDocuments.filter((document) => document.isUploaded).length;
  }

  get pendingRequiredDocumentsCount(): number {
    return this.requiredDocuments.filter((document) => !document.isUploaded || document.reviewDecision !== 'approved').length;
  }

  get totalPendingItemsCount(): number {
    const docs = this.reviewDocuments.filter((d) => d.isUploaded && d.reviewDecision === 'pending').length;
    const fields = this.profileReviewItems.filter((f) => f.status === 'submitted').length;
    return docs + fields;
  }

  get rejectedProfileItemsCount(): number {
    return this.profileReviewItems.filter((item) => item.status === 'changes_requested').length;
  }

  get requiredDocumentsApprovedCount(): number {
    return this.requiredDocuments.filter((document) => document.isUploaded && document.reviewDecision === 'approved').length;
  }

  get reviewCompletionPercent(): number {
    if (!this.requiredDocuments.length) {
      return 0;
    }

    const approvedRequiredCount = this.requiredDocuments.filter((document) => document.isUploaded && document.reviewDecision === 'approved').length;
    return Math.round((approvedRequiredCount / this.requiredDocuments.length) * 100);
  }

  get complianceReadyForFinalApproval(): boolean {
    if (typeof this.vendorDetail?.readyForFinalApproval === 'boolean') {
      return this.vendorDetail.readyForFinalApproval;
    }

    return this.requiredDocuments.length > 0
      && this.requiredDocuments.every((document) => document.isUploaded && document.reviewDecision === 'approved');
  }

  get isVendorAlreadyApproved(): boolean {
    return this.vendorDetail?.status === VendorStatus.Active && !!this.vendorDetail?.approvedAtUtc;
  }

  get canStartReview(): boolean {
    if (!this.vendorDetail) {
      return false;
    }

    return this.vendorDetail.status === VendorStatus.Pending
      && !this.vendorDetail.archivedAtUtc
      && !this.vendorDetail.isLoginLocked
      && (this.vendorDetail.reviewState === 'submitted'
        || this.vendorDetail.reviewState === 'awaiting_submission'
        || this.vendorDetail.reviewState === 'changes_requested');
  }

  get canApproveVendor(): boolean {
    if (!this.vendorDetail) {
      return false;
    }

    return this.vendorDetail.status === VendorStatus.Pending
      && this.complianceReadyForFinalApproval
      && !this.vendorDetail.approvedAtUtc
      && !this.vendorDetail.archivedAtUtc
      && !this.vendorDetail.isLoginLocked
      && this.vendorDetail.reviewState !== 'rejected'
      && this.vendorDetail.reviewState !== 'suspended';
  }

  get canRejectVendor(): boolean {
    if (!this.vendorDetail) {
      return false;
    }

    return this.vendorDetail.status === VendorStatus.Pending
      && !this.vendorDetail.approvedAtUtc
      && !this.vendorDetail.archivedAtUtc
      && !this.vendorDetail.isLoginLocked
      && this.vendorDetail.reviewState !== 'rejected';
  }

  get canSuspendVendor(): boolean {
    if (!this.vendorDetail) {
      return false;
    }

    return this.vendorDetail.status === VendorStatus.Active
      && !this.vendorDetail.archivedAtUtc
      && !this.vendorDetail.isLoginLocked;
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

    return this.vendorDetail.status === VendorStatus.Suspended
      && !this.isCrExpired
      && !this.vendorDetail.archivedAtUtc
      && !this.vendorDetail.isLoginLocked;
  }

  get canRequestDocuments(): boolean {
    if (!this.vendorDetail) {
      return false;
    }

    return this.vendorDetail.status === VendorStatus.Pending
      && !this.vendorDetail.archivedAtUtc
      && !this.vendorDetail.isLoginLocked
      && this.vendorDetail.reviewState !== 'rejected';
  }

  get hasActionRailCommands(): boolean {
    return this.canStartReview
      || this.canApproveVendor
      || this.canRejectVendor
      || this.canSuspendVendor
      || this.canReactivateVendor
      || this.canRequestDocuments;
  }

  isWorkspaceWindowActive(window: ComplianceWorkspaceWindow): boolean {
    return this.activeWorkspaceWindow === window;
  }

  get selectedDocumentStructuredRows(): PreviewRow[] {
    return this.getStructuredPreviewRows(this.selectedDocument);
  }

  get accountStatusLabel(): string {
    switch (this.vendorDetail?.status) {
      case VendorStatus.Active:
        return this.localize('حساب نشط', 'Active account');
      case VendorStatus.Suspended:
        return this.localize('حساب معلق', 'Suspended account');
      case VendorStatus.Rejected:
        return this.localize('تاجر مرفوض', 'Rejected vendor');
      default:
        return this.localize('قبل التشغيل', 'Pre-activation');
    }
  }

  get accountStatusVariant(): StatusPillVariant {
    switch (this.vendorDetail?.status) {
      case VendorStatus.Active:
        return 'success';
      case VendorStatus.Suspended:
      case VendorStatus.Rejected:
        return 'danger';
      default:
        return 'warning';
    }
  }

  get reviewStateLabel(): string {
    switch (this.vendorDetail?.reviewState) {
      case 'verified':
        return this.localize('جاهز للاعتماد النهائي', 'Ready for final approval');
      case 'changes_requested':
        return this.localize('بانتظار إعادة رفع', 'Waiting for re-upload');
      case 'under_review':
        return this.localize('تحت المراجعة', 'Under review');
      case 'rejected':
        return this.localize('مرفوض', 'Rejected');
      case 'suspended':
        return this.localize('معلق', 'Suspended');
      case 'awaiting_submission':
        return this.localize('بانتظار الاستكمال', 'Awaiting submission');
      default:
        return this.localize('تم الاستلام', 'Submitted');
    }
  }

  get reviewStateVariant(): StatusPillVariant {
    switch (this.vendorDetail?.reviewState) {
      case 'verified':
        return 'success';
      case 'changes_requested':
        return 'warning';
      case 'under_review':
        return 'processing';
      case 'rejected':
      case 'suspended':
        return 'danger';
      default:
        return 'info';
    }
  }

  get lastReviewerName(): string {
    return this.reviewDocuments
      .filter((document) => !!document.reviewedBy)
      .sort((left, right) => (right.reviewedAtUtc || '').localeCompare(left.reviewedAtUtc || ''))[0]?.reviewedBy
      || this.complianceNotes.find((note) => !!note.authorName)?.authorName
      || this.localize('غير محدد', 'Unassigned');
  }

  get operationsHeadline(): string {
    if (this.isCrExpired) {
      return this.localize('السجل التجاري منتهي الصلاحية', 'Commercial Registration is expired');
    }

    if (this.canApproveVendor) {
      return this.localize('الملف جاهز للاعتماد النهائي', 'The file is ready for final approval');
    }

    if (this.canReactivateVendor) {
      return this.localize('الحساب جاهز لإعادة التشغيل', 'The account is ready for reactivation');
    }

    if (this.canSuspendVendor) {
      return this.localize('الحساب يعمل حاليًا ويمكن تعليقه إذا لزم الأمر', 'The account is live and can be suspended if needed');
    }

    if (this.vendorDetail?.status === VendorStatus.Rejected) {
      return this.localize('تم إغلاق ملف الاعتماد بالرفض', 'The onboarding file was closed as rejected');
    }

    return this.localize('راجع المستندات المطلوبة ثم اتخذ القرار المناسب', 'Review the required documents, then take the appropriate decision');
  }

  get operationsHint(): string {
    if (this.isVendorAlreadyApproved && !this.isCrExpired) {
      return this.localize('الاعتماد تم بالفعل، لذلك هذه الشاشة مخصصة الآن للمتابعة التشغيلية والأرشفة.', 'Approval is already complete, so this workspace now serves operational follow-up and record keeping.');
    }

    if (this.isCrExpired) {
      return this.localize(
        'الحساب موقوف تلقائيًا بسبب انتهاء صلاحية السجل التجاري. يجب تحديث تاريخ انتهاء السجل التجاري ورفع مستند ساري المفعول أولاً لإعادة تنشيط الحساب.',
        'The account is automatically suspended because the Commercial Registration has expired. The CR expiry date must be updated and a valid document uploaded first to reactivate the account.'
      );
    }

    if (this.canApproveVendor) {
      return this.localize('كل المستندات الرسمية المطلوبة أغلقت بنجاح ويمكن اعتماد التاجر من هذه الشاشة.', 'All required official documents are closed, and the vendor can be approved from this workspace.');
    }

    if (this.pendingRequiredDocumentsCount > 0) {
      return this.localize(
        `${this.formatNumber(this.pendingRequiredDocumentsCount)} مستندات مطلوبة ما زالت مفتوحة قبل الاعتماد.`,
        `${this.formatNumber(this.pendingRequiredDocumentsCount)} required documents are still open before approval.`
      );
    }

    if (this.canReactivateVendor) {
      return this.localize('الحساب موقوف تشغيليًا، ويمكن إعادته إلى حالة نشطة مباشرة.', 'The account is operationally suspended and can be restored directly to active.');
    }

    if (this.canSuspendVendor) {
      return this.localize('إذا ظهرت مخاطرة تشغيلية، استخدم التعليق بدل الرفض النهائي.', 'If an operational risk appears, suspend the account instead of rejecting it.');
    }

    return this.localize('اتبع مسار المراجعة الظاهر في العمود الجانبي وفق حالة الحساب الحالية.', 'Follow the operating path shown in the side rail based on the current account state.');
  }

  get operationsBlockedMessage(): string {
    if (!this.vendorDetail) {
      return '';
    }

    if (this.isCrExpired) {
      return this.localize(
        'لا يمكن إعادة تفعيل الحساب لأن السجل التجاري منتهي الصلاحية. يرجى مراجعة وتعديل بيانات السجل أولاً.',
        'Cannot reactivate the account because the Commercial Registration is expired. Please review and update the CR details first.'
      );
    }

    if (this.isVendorAlreadyApproved) {
      return this.localize('التاجر معتمد بالفعل، لذلك تم إخفاء إجراء الاعتماد النهائي.', 'This vendor is already approved, so final approval is hidden.');
    }

    if (this.vendorDetail.status === VendorStatus.Suspended) {
      return this.localize('الحساب معلق حاليًا. استخدم إعادة التشغيل بدل الاعتماد أو الرفض.', 'The account is currently suspended. Use reactivation instead of approval or rejection.');
    }

    if (this.vendorDetail.status === VendorStatus.Rejected) {
      return this.localize('ملف التاجر مرفوض بالفعل، ولا توجد إجراءات تشغيل إضافية من هذه الشاشة.', 'The vendor file is already rejected, and no further account actions are available here.');
    }

    if (!this.complianceReadyForFinalApproval) {
      return this.localize('الاعتماد النهائي سيظهر بعد اعتماد كل المستندات المطلوبة فقط.', 'Final approval becomes available only after all required documents are approved.');
    }

    return this.localize('الإجراء غير متاح في الحالة الحالية.', 'This action is not available in the current state.');
  }

  get actionReasonLabel(): string {
    if (this.canSuspendVendor) {
      return this.localize('سبب التعليق', 'Suspension reason');
    }

    if (this.canRejectVendor) {
      return this.localize('سبب الرفض أو طلب الإعادة', 'Rejection or re-upload reason');
    }

    return this.localize('ملاحظة تشغيلية', 'Operational note');
  }

  get actionReasonPlaceholder(): string {
    if (this.canSuspendVendor) {
      return this.localize('اكتب سببًا واضحًا لتعليق الحساب يظهر في السجل التشغيلي...', 'Write a clear suspension reason that will appear in the operating timeline...');
    }

    return this.localize('اكتب سبب الرفض أو ما الذي يجب على التاجر تعديله قبل إعادة الرفع...', 'Explain what must be fixed before the vendor re-uploads or before the file is rejected...');
  }

  get complianceMetricCards(): ComplianceMetricCard[] {
    return [
      {
        id: 'approved',
        label: this.localize('مستندات مغلقة', 'Closed documents'),
        value: this.formatNumber(this.documentsApprovedCount),
        hint: this.localize('عناصر تم اعتمادها ضمن الملف الحالي', 'Items approved in the current packet'),
        variant: 'success'
      },
      {
        id: 'pending',
        label: this.localize('قرارات مفتوحة', 'Open decisions'),
        value: this.formatNumber(this.documentsPendingCount),
        hint: this.localize('ملفات ما زالت بانتظار الحسم', 'Files still waiting for a decision'),
        variant: 'warning'
      },
      {
        id: 'rejected',
        label: this.localize('مرفوض ويحتاج إعادة رفع', 'Rejected and needs re-upload'),
        value: this.formatNumber(this.documentsRejectedCount),
        hint: this.localize('عناصر تحتاج تصحيحًا من التاجر', 'Items that need correction from the vendor'),
        variant: 'danger'
      }
    ];
  }

  get documentGroups(): ComplianceDocumentGroup[] {
    const groups: Array<Omit<ComplianceDocumentGroup, 'documents'> & { types: VendorReviewDocument['type'][] }> = [
      {
        id: 'official',
        title: this.localize('المستندات الرسمية الأساسية', 'Official compliance documents'),
        hint: this.localize('السجل التجاري والضريبة والرخصة هي أساس قرار الاعتماد النهائي.', 'Commercial, tax, and license files drive the final approval decision.'),
        accentClass: 'border-sky-200 bg-sky-50/70 text-sky-700',
        types: ['commercial', 'tax', 'license']
      },
      {
        id: 'owner',
        title: this.localize('بيانات المالك والهوية', 'Owner and identity data'),
        hint: this.localize('بيانات مرجعية للتأكد من هوية صاحب النشاط.', 'Reference data used to validate the business owner identity.'),
        accentClass: 'border-violet-200 bg-violet-50/70 text-violet-700',
        types: ['identity']
      },
      {
        id: 'financial',
        title: this.localize('البيانات البنكية', 'Banking data'),
        hint: this.localize('مرجع التحويلات والحساب المستفيد المستخدم للتسوية.', 'Reference banking data used for payout and settlement.'),
        accentClass: 'border-emerald-200 bg-emerald-50/70 text-emerald-700',
        types: ['bank']
      }
    ];

    return groups
      .map((group) => ({
        id: group.id,
        title: group.title,
        hint: group.hint,
        accentClass: group.accentClass,
        documents: this.sortedReviewDocuments.filter((document) => group.types.includes(document.type))
      }))
      .filter((group) => group.documents.length > 0);
  }

  getGroupApprovedCount(group: ComplianceDocumentGroup): number {
    return group.documents.filter((document) => document.reviewDecision === 'approved').length;
  }

  getGroupOpenCount(group: ComplianceDocumentGroup): number {
    return group.documents.filter((document) => document.reviewDecision === 'pending').length;
  }

  getGroupRejectedCount(group: ComplianceDocumentGroup): number {
    return group.documents.filter((document) => document.reviewDecision === 'rejected').length;
  }

  selectDocument(document: VendorReviewDocument): void {
    this.selectedDocumentId = document.id;
    this.documentRejectReason = document.rejectionReason ?? '';
  }

  selectProfileReviewItem(item: VendorProfileReviewItem): void {
    this.selectedProfileReviewCode = item.code;
    this.profileRejectReason = item.decisionNote ?? '';
  }

  setWorkspaceWindow(window: ComplianceWorkspaceWindow): void {
    this.activeWorkspaceWindow = window;
    this.cdr.markForCheck();
  }

  onApproveAllPending(): void {
    const docsToApprove = this.reviewDocuments.filter((d) => d.isUploaded && d.reviewDecision === 'pending');
    const fieldsToApprove = this.profileReviewItems.filter((f) => f.status === 'submitted');

    if (docsToApprove.length === 0 && fieldsToApprove.length === 0) {
      return;
    }

    const title = this.localize('اعتماد جميع العناصر المعلقة', 'Approve All Pending Items');
    const message = this.localize(
      `هل تريد اعتماد جميع العناصر المعلقة دفعة واحدة؟ (${docsToApprove.length} مستندات، و ${fieldsToApprove.length} حقول بيانات)`,
      `Do you want to approve all pending items in bulk? (${docsToApprove.length} documents, and ${fieldsToApprove.length} profile fields)`
    );
    const confirmText = this.localize('موافق، اعتماد الكل', 'Yes, Approve All');
    const cancelText = this.localize('إلغاء', 'Cancel');

    this.openConfirmModal(title, message, confirmText, cancelText, 'success', () => {
      this.vendorDetailFacade.clearMutationError();
      this.isSubmittingDocumentDecision = true;
      this.cdr.markForCheck();

      const fieldsObs$: Observable<any> = fieldsToApprove.length > 0
        ? this.vendorDetailFacade.reviewVendorProfileFieldsRequest(
            fieldsToApprove.map((f) => ({ code: f.code, decision: 'approved' }))
          )
        : of(null);

      fieldsObs$.pipe(
        switchMap(() => {
          if (docsToApprove.length === 0) {
            return of([]);
          }
          const docRequests = docsToApprove.map((doc) =>
            this.vendorDetailFacade.approveVendorDocumentRequest(doc.id)
          );
          return concat(...docRequests).pipe(toArray());
        })
      ).subscribe({
        next: () => {
          this.isSubmittingDocumentDecision = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isSubmittingDocumentDecision = false;
          this.cdr.markForCheck();
        }
      });
    });
  }

  onApproveDocument(document: VendorReviewDocument): void {
    if (this.isSubmittingDocumentDecision || !document.isUploaded || document.reviewDecision === 'approved') {
      return;
    }

    this.vendorDetailFacade.clearMutationError();
    this.isSubmittingDocumentDecision = true;
    this.vendorDetailFacade.approveVendorDocumentRequest(document.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
        this.cdr.markForCheck();
          this.documentRejectReason = '';
          this.isSubmittingDocumentDecision = false;
        },
        error: () => {
        this.cdr.markForCheck();
          this.isSubmittingDocumentDecision = false;
        }
      });
  }

  onRejectDocument(document: VendorReviewDocument): void {
    if (this.isSubmittingDocumentDecision || !document.isUploaded) {
      return;
    }

    const reason = this.documentRejectReason.trim();
    if (!reason) {
      this.mutationError = this.localize('أدخل سببًا واضحًا قبل رفض المستند.', 'Enter a clear reason before rejecting the document.');
      return;
    }

    this.vendorDetailFacade.clearMutationError();
    this.isSubmittingDocumentDecision = true;
    this.vendorDetailFacade.rejectVendorDocumentRequest(document.id, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
        this.cdr.markForCheck();
          this.actionReason = reason;
          this.isSubmittingDocumentDecision = false;
        },
        error: () => {
        this.cdr.markForCheck();
          this.isSubmittingDocumentDecision = false;
        }
      });
  }

  onApproveProfileItem(item: VendorProfileReviewItem): void {
    this.vendorDetailFacade.clearMutationError();
    this.vendorDetailFacade.reviewVendorProfileFieldsRequest([
      { code: item.code, decision: 'approved' }
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
        this.cdr.markForCheck();
          this.profileRejectReason = '';
        }
      });
  }

  onRejectProfileItem(item: VendorProfileReviewItem): void {
    const reason = this.profileRejectReason.trim();
    if (!reason) {
      this.mutationError = this.localize('أدخل سببًا واضحًا قبل رفض الحقل.', 'Enter a clear reason before rejecting the field.');
      return;
    }

    this.vendorDetailFacade.clearMutationError();
    this.vendorDetailFacade.reviewVendorProfileFieldsRequest([
      { code: item.code, decision: 'rejected', reason }
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onOpenDocumentFile(document: VendorReviewDocument): void {
    if (!document.fileUrl) {
      return;
    }

    window.open(document.fileUrl, '_blank', 'noopener,noreferrer');
  }

  onStartReview(): void {
    if (!this.canStartReview) {
      this.mutationError = this.operationsBlockedMessage;
      return;
    }

    this.vendorDetailFacade.clearMutationError();
    this.vendorDetailFacade.startVendorReview();
  }

  onApproveVendor(): void {
    if (!this.vendorDetail || !this.canApproveVendor) {
      this.mutationError = this.operationsBlockedMessage;
      return;
    }

    const title = this.localize('اعتماد التاجر', 'Approve Vendor');
    const message = this.localize(
      'تم إقفال جميع المستندات المطلوبة. هل تريد اعتماد التاجر نهائيًا الآن؟',
      'All required documents are closed. Do you want to approve this vendor now?'
    );
    const confirmText = this.localize('موافق', 'Approve');
    const cancelText = this.localize('إلغاء', 'Cancel');

    this.openConfirmModal(title, message, confirmText, cancelText, 'success', () => {
      this.vendorDetailFacade.clearMutationError();
      this.vendorDetailFacade.approveVendorReview(this.vendorDetail!.commissionRate ?? 13);
    });
  }

  onRequestDocuments(): void {
    if (!this.canRequestDocuments) {
      this.mutationError = this.operationsBlockedMessage;
      return;
    }

    const note = this.buildRequestDocumentsNote();
    this.vendorDetailFacade.clearMutationError();
    this.vendorDetailFacade.requestVendorDocuments(note);
  }

  onSuspendAccount(): void {
    if (!this.canSuspendVendor) {
      this.mutationError = this.operationsBlockedMessage;
      return;
    }

    const reason = this.actionReason.trim();
    if (!reason) {
      this.mutationError = this.localize('أدخل سببًا واضحًا قبل تعليق الحساب.', 'Enter a clear reason before suspending the account.');
      return;
    }

    this.vendorDetailFacade.clearMutationError();
    this.vendorDetailFacade.suspendVendorAccount(reason);
  }

  onReactivateAccount(): void {
    if (!this.canReactivateVendor) {
      this.mutationError = this.operationsBlockedMessage;
      return;
    }

    const title = this.localize('إعادة التشغيل', 'Reactivate Account');
    const message = this.localize(
      'سيعود الحساب إلى حالة نشطة مباشرة. هل تريد متابعة إعادة التشغيل؟',
      'The account will return directly to active status. Do you want to continue?'
    );
    const confirmText = this.localize('تأكيد إعادة التشغيل', 'Reactivate');
    const cancelText = this.localize('إلغاء', 'Cancel');

    this.openConfirmModal(title, message, confirmText, cancelText, 'info', () => {
      this.vendorDetailFacade.clearMutationError();
      this.vendorDetailFacade.reactivateVendorAccount();
    });
  }

  onRejectVendor(): void {
    if (!this.canRejectVendor) {
      this.mutationError = this.operationsBlockedMessage;
      return;
    }

    const reason = this.actionReason.trim();
    if (!reason) {
      this.mutationError = this.localize('أدخل سبب رفض واضح قبل إغلاق الملف.', 'Enter a clear rejection reason before closing the file.');
      return;
    }

    const title = this.localize('رفض التاجر', 'Reject Vendor');
    const message = this.localize(
      'سيتم رفض ملف التاجر قبل التشغيل ولن يستخدم هذا الإجراء كبديل للتعليق. هل تريد المتابعة؟',
      'The vendor onboarding file will be rejected before activation. Do you want to continue?'
    );
    const confirmText = this.localize('رفض التاجر', 'Reject');
    const cancelText = this.localize('إلغاء', 'Cancel');

    this.openConfirmModal(title, message, confirmText, cancelText, 'danger', () => {
      this.vendorDetailFacade.clearMutationError();
      this.vendorDetailFacade.rejectVendorReview(reason);
    });
  }

  openConfirmModal(
    title: string,
    message: string,
    confirmText: string,
    cancelText: string,
    type: 'danger' | 'warning' | 'success' | 'info',
    action: () => void
  ): void {
    this.confirmModalTitle = title;
    this.confirmModalMessage = message;
    this.confirmModalConfirmText = confirmText;
    this.confirmModalCancelText = cancelText;
    this.confirmModalType = type;
    this.confirmAction = action;
    this.isConfirmModalOpen = true;
  }

  executeConfirmAction(): void {
    if (this.confirmAction) {
      this.confirmAction();
    }
    this.isConfirmModalOpen = false;
    this.confirmAction = null;
  }

  cancelConfirmAction(): void {
    this.isConfirmModalOpen = false;
    this.confirmAction = null;
  }

  onAddNote(): void {
    if (!this.newNote.trim()) {
      return;
    }

    this.vendorDetailFacade.clearMutationError();
    this.vendorDetailFacade.addVendorReviewNote(this.newNote.trim());
    this.newNote = '';
  }

  getIndicatorTitle(indicator: VendorRiskIndicator): string {
    if (this.currentLang === 'ar' && indicator.titleAr) return indicator.titleAr;
    if (this.currentLang === 'en' && indicator.titleEn) return indicator.titleEn;
    return this.translate.instant(indicator.titleKey);
  }

  getIndicatorDescription(indicator: VendorRiskIndicator): string {
    if (this.currentLang === 'ar' && indicator.descriptionAr) return indicator.descriptionAr;
    if (this.currentLang === 'en' && indicator.descriptionEn) return indicator.descriptionEn;
    return this.translate.instant(indicator.descriptionKey);
  }

  getDecisionVariant(decision: VendorReviewDecision): StatusPillVariant {
    switch (decision) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'warning';
    }
  }

  getDecisionLabel(decision: VendorReviewDecision): string {
    switch (decision) {
      case 'approved':
        return this.localize('مقبول', 'Approved');
      case 'rejected':
        return this.localize('مرفوض', 'Rejected');
      default:
        return this.localize('بانتظار القرار', 'Pending decision');
    }
  }

  getUploadStatusVariant(status: VendorReviewDocument['status']): StatusPillVariant {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  getUploadStatusLabel(document: VendorReviewDocument): string {
    if (!document.isUploaded) {
      return this.localize('غير مرفوع', 'Not uploaded');
    }

    if (document.previewKind === 'structured' && !document.fileUrl) {
      return this.localize('بيانات بدون ملف', 'Data without file');
    }

    return this.localize('مرفوع', 'Uploaded');
  }

  formatExpiryDateOnly(dateVal: string | Date | null | undefined): string {
    if (!dateVal) return '—';
    try {
      const date = new Date(dateVal);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}/${m}/${d}`;
    } catch {
      return String(dateVal);
    }
  }

  getDocumentDescription(document: VendorReviewDocument): string {
    const vendor = this.vendorDetail;
    if (!vendor) {
      return '';
    }

    switch (document.type) {
      case 'identity':
        if (vendor.idNumber) {
          return this.localize(
            `رقم الهوية: ${vendor.idNumber} | ${this.getLocalizedNationality(vendor.nationality)}`,
            `ID: ${vendor.idNumber} | ${this.getLocalizedNationality(vendor.nationality)}`
          );
        }
        return this.localize('تم التحقق آلياً عبر نفاذ', 'Verified automatically via Nafath');

      case 'commercial':
        if (vendor.commercialRegistrationExpiryDate) {
          const dateStr = this.formatExpiryDateOnly(vendor.commercialRegistrationExpiryDate);
          if (this.isCrExpired) {
            return this.localize(
              `منتهي الصلاحية (${dateStr})`,
              `Expired (${dateStr})`
            );
          } else {
            return this.localize(
              `ساري حتى ${dateStr}`,
              `Valid until ${dateStr}`
            );
          }
        }
        if (vendor.commercialRegistrationNumber) {
          return this.localize(
            `رقم السجل: ${vendor.commercialRegistrationNumber}`,
            `CR Number: ${vendor.commercialRegistrationNumber}`
          );
        }
        return this.localize('لا يوجد بيانات سجل مسجلة', 'No commercial registration data registered');

      case 'tax':
        if (vendor.taxId) {
          return this.localize(
            `الرقم الضريبي: ${vendor.taxId}`,
            `Tax ID: ${vendor.taxId}`
          );
        }
        return this.localize('لا يوجد رقم ضريبي مسجل', 'No tax ID registered');

      case 'bank':
        if (vendor.primaryBankAccount?.iban) {
          const bankName = vendor.primaryBankAccount.bankName || '';
          const iban = vendor.primaryBankAccount.iban;
          const maskedIban = iban.length > 8 
            ? iban.substring(0, 4) + '...' + iban.substring(iban.length - 4) 
            : iban;
          return bankName 
            ? `${bankName} | SA ${maskedIban.replace(/^SA/i, '').trim()}`
            : iban;
        }
        return this.localize('لم يتم تحديد الحساب البنكي', 'No bank account specified');

      case 'license':
        if (vendor.licenseNumber) {
          return this.localize(
            `رقم الرخصة: ${vendor.licenseNumber}`,
            `License: ${vendor.licenseNumber}`
          );
        }
        return this.localize('بانتظار الرفع من التاجر', 'Awaiting upload from the vendor');

      default:
        return document.descriptionKey ? this.localize(document.descriptionKey, document.descriptionKey) : '';
    }
  }

  getDocumentQueueSummary(document: VendorReviewDocument): string {
    if (!document.isUploaded) {
      return this.localize('ناقص ويحتاج رفعًا من التاجر.', 'Missing and requires vendor upload.');
    }

    if (document.reviewDecision === 'rejected') {
      return this.localize('مرفوض ويحتاج تصحيحًا قبل إعادة الرفع.', 'Rejected and needs correction before re-upload.');
    }

    if (document.reviewDecision === 'approved') {
      return this.localize('أغلق بنجاح ضمن ملف الامتثال الحالي.', 'Closed successfully in the current compliance packet.');
    }

    return this.localize('مرفوع وينتظر قرار المراجع.', 'Uploaded and waiting for the reviewer decision.');
  }

  getDocumentMetaLabel(document: VendorReviewDocument): string {
    switch (document.type) {
      case 'commercial':
        return this.localize('السجل التجاري', 'Commercial registration');
      case 'tax':
        return this.localize('الشهادة الضريبية', 'Tax certificate');
      case 'license':
        return this.localize('الرخصة التشغيلية', 'Operating license');
      case 'identity':
        return this.localize('بيانات الهوية', 'Identity data');
      default:
        return this.localize('بيانات بنكية', 'Banking data');
    }
  }

  getProfileItemLabelByCode(code: string): string {
    const labels: Record<string, { ar: string; en: string }> = {
      'step1.businessNameAr': { ar: 'اسم المتجر بالعربية', en: 'Store name (AR)' },
      'step1.businessNameEn': { ar: 'اسم المتجر بالإنجليزية', en: 'Store name (EN)' },
      'step1.businessType': { ar: 'نوع النشاط', en: 'Business type' },
      'step1.contactPhone': { ar: 'هاتف المتجر', en: 'Store phone' },
      'step1.description': { ar: 'وصف المتجر', en: 'Store description' },
      'step1.ownerName': { ar: 'اسم المالك', en: 'Owner name' },
      'step1.ownerEmail': { ar: 'بريد المالك', en: 'Owner email' },
      'step1.ownerPhone': { ar: 'جوال المالك', en: 'Owner phone' },
      'step2.region': { ar: 'المنطقة', en: 'Region' },
      'step2.city': { ar: 'المدينة', en: 'City' },
      'step2.nationalAddress': { ar: 'العنوان الوطني', en: 'National address' },
      'step2.branchLatitude': { ar: 'خط العرض', en: 'Latitude' },
      'step2.branchLongitude': { ar: 'خط الطول', en: 'Longitude' },
      'step3.idNumber': { ar: 'رقم الهوية', en: 'ID number' },
      'step3.nationality': { ar: 'الجنسية', en: 'Nationality' },
      'step3.commercialRegistrationNumber': { ar: 'رقم السجل', en: 'CR number' },
      'step3.expiryDate': { ar: 'تاريخ الانتهاء', en: 'Expiry date' },
      'step3.taxId': { ar: 'الرقم الضريبي', en: 'Tax ID' },
      'step3.licenseNumber': { ar: 'رقم الرخصة', en: 'License number' },
      'step4.bankName': { ar: 'اسم البنك', en: 'Bank name' },
      'step4.paymentCycle': { ar: 'دورة التسوية', en: 'Payment cycle' },
      'step4.iban': { ar: 'الآيبان', en: 'IBAN' },
      'step4.swiftCode': { ar: 'سويفت', en: 'SWIFT code' },
      'step5.logo': { ar: 'شعار المتجر', en: 'Store logo' }
    };

    const label = labels[code];
    return label ? this.localize(label.ar, label.en) : code;
  }

  getProfileItemLabel(item: VendorProfileReviewItem): string {
    return this.getProfileItemLabelByCode(item.code);
  }

  getProfileItemValue(item: VendorProfileReviewItem): string {
    const vendor = this.vendorDetail;
    if (!vendor) {
      return '—';
    }

    const valueMap: Record<string, string | number | null | undefined> = {
      'step1.businessNameAr': vendor.businessNameAr,
      'step1.businessNameEn': vendor.businessNameEn,
      'step1.businessType': vendor.businessType,
      'step1.contactPhone': vendor.contactPhone,
      'step1.description': vendor.descriptionAr || vendor.descriptionEn,
      'step1.ownerName': vendor.ownerName,
      'step1.ownerEmail': vendor.ownerEmail,
      'step1.ownerPhone': vendor.ownerPhone,
      'step2.region': vendor.region,
      'step2.city': vendor.city,
      'step2.nationalAddress': vendor.nationalAddress,
      'step2.branchLatitude': vendor.primaryBranchLatitude,
      'step2.branchLongitude': vendor.primaryBranchLongitude,
      'step3.idNumber': vendor.idNumber,
      'step3.nationality': vendor.nationality,
      'step3.commercialRegistrationNumber': vendor.commercialRegistrationNumber,
      'step3.expiryDate': vendor.commercialRegistrationExpiryDate,
      'step3.taxId': vendor.taxId,
      'step3.licenseNumber': vendor.licenseNumber,
      'step4.bankName': vendor.primaryBankAccount?.bankName,
      'step4.paymentCycle': vendor.payoutCycle,
      'step4.iban': vendor.primaryBankAccount?.iban,
      'step4.swiftCode': vendor.primaryBankAccount?.swiftCode,
      'step5.logo': vendor.logoUrl
    };

    const value = valueMap[item.code];
    return value == null || value === '' ? '—' : String(value);
  }

  getProfileItemDecisionVariant(item: VendorProfileReviewItem): StatusPillVariant {
    switch (item.status) {
      case 'approved':
        return 'success';
      case 'changes_requested':
        return 'danger';
      case 'pending_vendor':
        return 'neutral';
      default:
        return 'warning';
    }
  }

  getProfileItemDecisionLabel(item: VendorProfileReviewItem): string {
    switch (item.status) {
      case 'approved':
        return this.localize('مقبول', 'Approved');
      case 'changes_requested':
        return this.localize('مرفوض', 'Rejected');
      case 'pending_vendor':
        return this.localize('ناقص', 'Missing');
      default:
        return this.localize('مرسل', 'Submitted');
    }
  }

  getDocumentFileName(document: VendorReviewDocument | null): string {
    if (!document?.fileUrl) {
      return this.localize('لا يوجد ملف فعلي', 'No physical file');
    }

    try {
      const normalized = document.fileUrl.split('?')[0].split('#')[0];
      return decodeURIComponent(normalized.substring(normalized.lastIndexOf('/') + 1)) || normalized;
    } catch {
      return document.fileUrl;
    }
  }

  getPreviewKindLabel(document: VendorReviewDocument): string {
    switch (document.previewKind) {
      case 'pdf':
        return 'PDF';
      case 'image':
        return this.localize('صورة', 'Image');
      case 'structured':
        return this.localize('بيانات تشغيلية', 'Structured data');
      default:
        return this.localize('غير متاح', 'Unavailable');
    }
  }

  getStructuredPreviewRows(document: VendorReviewDocument | null): PreviewRow[] {
    const vendor = this.vendorDetail;
    if (!vendor || !document) {
      return [];
    }

    switch (document.type) {
      case 'identity':
        return [
          { label: this.localize('اسم المالك', 'Owner name'), value: vendor.ownerName || '—' },
          { label: this.localize('رقم الهوية', 'Identity number'), value: vendor.idNumber || '—', direction: 'ltr' },
          { label: this.localize('الجنسية', 'Nationality'), value: this.getLocalizedNationality(vendor.nationality) },
          { label: this.localize('جوال المالك', 'Owner phone'), value: vendor.ownerPhone || '—', direction: 'ltr' }
        ];
      case 'commercial':
        return [
          { label: this.localize('رقم السجل', 'Commercial number'), value: vendor.commercialRegistrationNumber || '—', direction: 'ltr' },
          { label: this.localize('اسم المنشأة', 'Business name'), value: this.isRTL ? vendor.businessNameAr : vendor.businessNameEn },
          { label: this.localize('نوع النشاط', 'Business type'), value: vendor.businessType || '—' },
          { label: this.localize('تاريخ الانتهاء', 'Expiry date'), value: vendor.commercialRegistrationExpiryDate || '—', direction: 'ltr' }
        ];
      case 'tax':
        return [
          { label: this.localize('الرقم الضريبي', 'Tax ID'), value: vendor.taxId || '—', direction: 'ltr' },
          { label: this.localize('البريد المرتبط', 'Linked email'), value: vendor.contactEmail || '—', direction: 'ltr' }
        ];
      case 'bank':
        return [
          { label: this.localize('اسم البنك', 'Bank name'), value: vendor.primaryBankAccount?.bankName || '—' },
          { label: this.localize('اسم المستفيد', 'Account holder'), value: vendor.primaryBankAccount?.accountHolderName || '—' },
          { label: this.localize('IBAN', 'IBAN'), value: vendor.primaryBankAccount?.iban || '—', direction: 'ltr' },
          { label: this.localize('SWIFT', 'SWIFT'), value: vendor.primaryBankAccount?.swiftCode || '—', direction: 'ltr' }
        ];
      case 'license':
        return [
          { label: this.localize('رقم الرخصة', 'License number'), value: vendor.licenseNumber || '—', direction: 'ltr' },
          { label: this.localize('المدينة', 'City'), value: this.getLocalizedCity(vendor.city) },
          { label: this.localize('المنطقة', 'Region'), value: this.getLocalizedRegion(vendor.region) }
        ];
      default:
        return [];
    }
  }

  formatNoteTimestamp(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }

    return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  localizeNoteMessage(message: string | undefined): string {
    if (!message) return '';
    const cleanMsg = message.trim();

    const enToAr: Record<string, string> = {
      'Vendor review started.': 'بدأت مراجعة التاجر.',
      'Vendor account reactivated and returned to active status.': 'تم إعادة تفعيل حساب التاجر وإرجاعه للحالة النشطة.',
      'Vendor login was unlocked and account access was restored.': 'تم فتح دخول التاجر واستعادة الوصول للحساب.',
      'Vendor password was reset by an administrator and all active sessions were revoked.': 'تمت إعادة تعيين كلمة مرور التاجر بواسطة المسؤول وتم إلغاء جميع الجلسات النشطة.',
      'Please re-upload the required legal documents and confirm the latest vendor information.': 'يرجى إعادة رفع المستندات القانونية المطلوبة وتأكيد أحدث بيانات التاجر.',
      'Vendor updated banking and payout setup from Vendor Portal.': 'قام التاجر بتحديث بيانات الحساب البنكي والتسويات من بوابة التاجر.',
      'Vendor updated store profile details from Vendor Portal.': 'قام التاجر بتحديث بيانات المتجر من بوابة التاجر.',
      'Vendor updated address and contact location details from Vendor Portal.': 'قام التاجر بتحديث بيانات العنوان والموقع من بوابة التاجر.',
      'Vendor updated operating hours from Vendor Portal.': 'قام التاجر بتحديث ساعات العمل من بوابة التاجر.',
      'Vendor updated owner information from Vendor Portal.': 'قام التاجر بتحديث بيانات المالك من بوابة التاجر.',
      'Vendor updated notification preferences from Vendor Portal.': 'قام التاجر بتحديث تفضيلات الإشعارات من بوابة التاجر.',
      'Vendor updated operational settings from Vendor Portal.': 'قام التاجر بتحديث إعدادات التشغيل من بوابة التاجر.',
      'Vendor updated legal and compliance information from Vendor Portal.': 'قام التاجر بتحديث البيانات القانونية والامتثال من بوابة التاجر.',
      'Vendor submitted the profile and required documents for compliance review.': 'قام التاجر بإرسال الملف الشخصي والمستندات المطلوبة لمراجعة الامتثال.',
      'Vendor updated banking and payout setup from Vendor Portal. ': 'قام التاجر بتحديث بيانات الحساب البنكي والتسويات من بوابة التاجر.',
      'Vendor updated store profile details from Vendor Portal. ': 'قام التاجر بتحديث بيانات المتجر من بوابة التاجر.',
      'Vendor updated address and contact location details from Vendor Portal. ': 'قام التاجر بتحديث بيانات العنوان والموقع من بوابة التاجر.',
      'Vendor updated operating hours from Vendor Portal. ': 'قام التاجر بتحديث ساعات العمل من بوابة التاجر.',
      'Vendor updated owner information from Vendor Portal. ': 'قام التاجر بتحديث بيانات المالك من بوابة التاجر.',
      'Vendor updated notification preferences from Vendor Portal. ': 'قام التاجر بتحديث تفضيلات الإشعارات من بوابة التاجر.',
      'Vendor updated operational settings from Vendor Portal. ': 'قام التاجر بتحديث إعدادات التشغيل من بوابة التاجر.',
      'Vendor updated legal and compliance information from Vendor Portal. ': 'قام التاجر بتحديث البيانات القانونية والامتثال من بوابة التاجر.',
      'Vendor submitted the profile and required documents for compliance review. ': 'قام التاجر بإرسال الملف الشخصي والمستندات المطلوبة لمراجعة الامتثال.'
    };

    const arToEnSpecial: Record<string, string> = {
      'قام التاجر بتحديث بيانات الحساب البنكي والتسويات من بوابة التاجر.': 'Vendor updated banking and payout setup from Vendor Portal.',
      'قام التاجر بتحديث بيانات المتجر من بوابة التاجر.': 'Vendor updated store profile details from Vendor Portal.',
      'قام التاجر بتحديث ساعات العمل من بوابة التاجر.': 'Vendor updated operating hours from Vendor Portal.',
      'قام التاجر بتحديث البيانات القانونية والامتثال من بوابة التاجر.': 'Vendor updated legal and compliance information from Vendor Portal.',
      'قام التاجر بتحديث تفضيلات الإشعارات من بوابة التاجر.': 'Vendor updated notification preferences from Vendor Portal.',
      'قام التاجر بتحديث إعدادات التشغيل من بوابة التاجر.': 'Vendor updated operational settings from Vendor Portal.',
      'قام التاجر بتحديث بيانات العنوان والموقع من بوابة التاجر.': 'Vendor updated address and contact location details from Vendor Portal.',
      'قام التاجر بتحديث بيانات المالك من بوابة التاجر.': 'Vendor updated owner information from Vendor Portal.'
    };

    const arToEn: Record<string, string> = { ...arToEnSpecial };
    for (const key of Object.keys(enToAr)) {
      arToEn[enToAr[key].trim()] = key;
    }

    const docTypes: Record<string, string> = {
      Commercial: 'السجل التجاري',
      Tax: 'الضريبة',
      License: 'الرخصة',
      Identity: 'الهوية',
      Bank: 'البنك'
    };

    const docTypesReverse: Record<string, string> = {};
    for (const key of Object.keys(docTypes)) {
      docTypesReverse[docTypes[key]] = key;
    }

    // Check for dynamic profile field reviews (e.g. "تم قبول العنصر step1.businessNameAr.", "Accepted field step1.businessNameAr.")
    const fieldMatch = cleanMsg.match(/^(Accepted field|Rejected field|تم قبول العنصر|تم رفض العنصر)\s+([a-zA-Z0-9_.]+)(?:\.|\b)(.*)$/);
    if (fieldMatch) {
      const actionRaw = fieldMatch[1];
      const fieldCode = fieldMatch[2];
      const reasonRaw = fieldMatch[3] ? fieldMatch[3].trim() : '';
      
      const isApproved = actionRaw.includes('Accepted') || actionRaw.includes('قبول');
      const fieldLabel = this.getProfileItemLabelByCode(fieldCode);

      if (this.isRTL) {
        if (isApproved) {
          return `تم قبول العنصر ${fieldLabel}.`;
        } else {
          return `تم رفض العنصر ${fieldLabel}.${reasonRaw ? ' ' + reasonRaw : ''}`;
        }
      } else {
        if (isApproved) {
          return `Accepted field ${fieldLabel}.`;
        } else {
          return `Rejected field ${fieldLabel}.${reasonRaw ? ' ' + reasonRaw : ''}`;
        }
      }
    }

    if (this.isRTL) {
      if (enToAr[cleanMsg]) return enToAr[cleanMsg];

      let m = cleanMsg.match(/^Vendor approved with commission rate ([\d.]+)%\.$/);
      if (m) return `تمت الموافقة على التاجر بنسبة عمولة ${m[1]}%.`;

      m = cleanMsg.match(/^(Commercial|Tax|License|Identity|Bank) document approved\.$/);
      if (m) return `تم قبول مستند ${docTypes[m[1]] || m[1]}.`;

      m = cleanMsg.match(/^(Commercial|Tax|License|Identity|Bank) document rejected\. (.+)$/);
      if (m) return `تم رفض مستند ${docTypes[m[1]] || m[1]}. ${m[2]}`;

      m = cleanMsg.match(/^Vendor re-uploaded document\(s\): (.+)\. They are back in the review queue\.$/);
      if (m) return `قام التاجر بإعادة رفع مستند(ات): ${m[1]}. تم إرجاعها لقائمة المراجعة.`;

      return cleanMsg;
    } else {
      if (arToEn[cleanMsg]) return arToEn[cleanMsg];

      let m = cleanMsg.match(/^تمت الموافقة على التاجر بنسبة عمولة ([\d.]+)%\.$/);
      if (m) return `Vendor approved with commission rate ${m[1]}%.`;

      m = cleanMsg.match(/^تم قبول مستند (السجل التجاري|الضريبة|الرخصة|الهوية|البنك)\.$/);
      if (m) return `${docTypesReverse[m[1]] || m[1]} document approved.`;

      m = cleanMsg.match(/^تم رفض مستند (السجل التجاري|الضريبة|الرخصة|الهوية|البنك)\. (.+)$/);
      if (m) return `${docTypesReverse[m[1]] || m[1]} document rejected. ${m[2]}`;

      m = cleanMsg.match(/^قام التاجر بإعادة رفع مستند\(ات\): (.+)\. تم إرجاعها لقائمة المراجعة\.$/);
      if (m) return `Vendor re-uploaded document(s): ${m[1]}. They are back in the review queue.`;

      return cleanMsg;
    }
  }

  localizeRoleLabel(roleLabel: string): string {
    if (!roleLabel) return '';
    const cleanLabel = roleLabel.trim();

    const enToAr: Record<string, string> = {
      'Compliance Review': 'مراجعة الامتثال',
      'Document Review': 'مراجعة المستندات',
      'Risk & Compliance': 'المخاطر والامتثال',
      'Security Review': 'مراجعة أمنية',
      'Security Control': 'التحكم الأمني',
      'Admin Action': 'إجراء إداري',
      'Admin': 'المسؤول',
      'Vendor Portal': 'بوابة التاجر',
      'Vendor Review': 'مراجعة التاجر',
      'Operations Console': 'لوحة التشغيل',
      'Vendor Compliance Desk': 'مكتب امتثال التاجر',
      'Operations Reviewer': 'مراجع العمليات',
      'Risk Team': 'فريق المخاطر',
      'Review Team': 'فريق المراجعة'
    };

    const arToEn: Record<string, string> = {};
    for (const key of Object.keys(enToAr)) {
      arToEn[enToAr[key]] = key;
    }

    if (this.isRTL) {
      return enToAr[cleanLabel] || cleanLabel;
    } else {
      return arToEn[cleanLabel] || cleanLabel;
    }
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US').format(value);
  }

  trackByDocument = (_: number, document: VendorReviewDocument) => document.id;
  trackByGroup = (_: number, group: ComplianceDocumentGroup) => group.id;
  trackByNote = (_: number, note: VendorReviewNote) => note.id;
  trackByRisk = (_: number, risk: VendorRiskIndicator) => risk.id;
  trackByProfileItem = (_: number, item: VendorProfileReviewItem) => item.code;

  private buildRequestDocumentsNote(): string {
    const selectedDocumentLabel = this.selectedDocument ? this.getDocumentMetaLabel(this.selectedDocument) : this.localize('المستند المطلوب', 'the required document');
    const reason = this.actionReason.trim() || this.documentRejectReason.trim();

    if (reason) {
      return this.localize(
        `يرجى إعادة رفع ${selectedDocumentLabel} بعد معالجة الملاحظة التالية: ${reason}`,
        `Please re-upload ${selectedDocumentLabel} after addressing this note: ${reason}`
      );
    }

    return this.localize(
      `يرجى استكمال أو إعادة رفع ${selectedDocumentLabel} مع التأكد من مطابقة البيانات الحالية.`,
      `Please complete or re-upload ${selectedDocumentLabel} and make sure it matches the latest submitted data.`
    );
  }

  private getDocumentRank(document: VendorReviewDocument): number {
    if (document.reviewDecision === 'rejected') {
      return 0;
    }

    if (document.isUploaded && document.reviewDecision === 'pending') {
      return 1;
    }

    if (!document.isUploaded) {
      return 2;
    }

    return 3;
  }

  private getLocalizedCity(city?: string | null): string {
    if (!city) {
      return '—';
    }
    const clean = city.trim();
    const key = `COMMON.CITIES.${clean.toUpperCase()}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : clean;
  }

  private getLocalizedRegion(region?: string | null): string {
    if (!region) {
      return '—';
    }
    const clean = region.trim();
    const key = `COMMON.REGIONS.${clean.toUpperCase()}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : clean;
  }

  private getLocalizedNationality(nationality?: string | null): string {
    if (!nationality) {
      return '—';
    }
    const clean = nationality.trim();
    const key = `MODALS.OWNER_EDIT.NATIONALITIES.${clean.toUpperCase()}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : clean;
  }

  private localize(ar: string, en: string): string {
    return this.isRTL ? ar : en;
  }
}
