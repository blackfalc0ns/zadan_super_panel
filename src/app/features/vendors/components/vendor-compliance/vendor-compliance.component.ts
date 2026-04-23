import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import {
  VendorDetail,
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
  selector: 'app-vendor-compliance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, StatusPillComponent],
  templateUrl: './vendor-compliance.component.html'
})
export class VendorComplianceComponent {
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
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
      });

    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
        if (!vendor) {
          return;
        }

        this.vendorId = vendor.id;
        this.vendorDetail = vendor;

        if (!this.selectedDocumentId && vendor.reviewDocuments.length > 0) {
          this.selectedDocumentId = this.sortedReviewDocuments[0]?.id ?? null;
        }

        this.documentRejectReason = this.selectedDocument?.reviewDecision === 'rejected'
          ? (this.selectedDocument.rejectionReason ?? '')
          : '';
      });

    this.vendorDetailFacade.mutationError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => {
        this.mutationError = message ?? '';
      });
  }

  get reviewDocuments(): VendorReviewDocument[] {
    return this.vendorDetail?.reviewDocuments ?? [];
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

  get safePreviewUrl(): SafeResourceUrl | null {
    if (!this.selectedDocument?.fileUrl) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(this.selectedDocument.fileUrl);
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

  get canReactivateVendor(): boolean {
    if (!this.vendorDetail) {
      return false;
    }

    return this.vendorDetail.status === VendorStatus.Suspended
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
    if (this.isVendorAlreadyApproved) {
      return this.localize('الاعتماد تم بالفعل، لذلك هذه الشاشة مخصصة الآن للمتابعة التشغيلية والأرشفة.', 'Approval is already complete, so this workspace now serves operational follow-up and record keeping.');
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

  setWorkspaceWindow(window: ComplianceWorkspaceWindow): void {
    this.activeWorkspaceWindow = window;
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
          this.documentRejectReason = '';
          this.isSubmittingDocumentDecision = false;
        },
        error: () => {
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
          this.actionReason = reason;
          this.isSubmittingDocumentDecision = false;
        },
        error: () => {
          this.isSubmittingDocumentDecision = false;
        }
      });
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

    const confirmed = window.confirm(this.localize(
      'تم إقفال جميع المستندات المطلوبة. هل تريد اعتماد التاجر نهائيًا الآن؟',
      'All required documents are closed. Do you want to approve this vendor now?'
    ));

    if (!confirmed) {
      return;
    }

    this.vendorDetailFacade.clearMutationError();
    this.vendorDetailFacade.approveVendorReview(this.vendorDetail.commissionRate ?? 13);
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

    const confirmed = window.confirm(this.localize(
      'سيعود الحساب إلى حالة نشطة مباشرة. هل تريد متابعة إعادة التشغيل؟',
      'The account will return directly to active status. Do you want to continue?'
    ));

    if (!confirmed) {
      return;
    }

    this.vendorDetailFacade.clearMutationError();
    this.vendorDetailFacade.reactivateVendorAccount();
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

    const confirmed = window.confirm(this.localize(
      'سيتم رفض ملف التاجر قبل التشغيل ولن يستخدم هذا الإجراء كبديل للتعليق. هل تريد المتابعة؟',
      'The vendor onboarding file will be rejected before activation. Do you want to continue?'
    ));

    if (!confirmed) {
      return;
    }

    this.vendorDetailFacade.clearMutationError();
    this.vendorDetailFacade.rejectVendorReview(reason);
  }

  onAddNote(): void {
    if (!this.newNote.trim()) {
      return;
    }

    this.vendorDetailFacade.clearMutationError();
    this.vendorDetailFacade.addVendorReviewNote(this.newNote.trim());
    this.newNote = '';
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
          { label: this.localize('الجنسية', 'Nationality'), value: vendor.nationality || '—' },
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
          { label: this.localize('المدينة', 'City'), value: vendor.city || '—' },
          { label: this.localize('المنطقة', 'Region'), value: vendor.region || '—' }
        ];
      default:
        return [];
    }
  }

  formatNoteTimestamp(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }

    return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-EG' : 'en-US').format(value);
  }

  trackByDocument = (_: number, document: VendorReviewDocument) => document.id;
  trackByGroup = (_: number, group: ComplianceDocumentGroup) => group.id;
  trackByNote = (_: number, note: VendorReviewNote) => note.id;
  trackByRisk = (_: number, risk: VendorRiskIndicator) => risk.id;

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

  private localize(ar: string, en: string): string {
    return this.isRTL ? ar : en;
  }
}
