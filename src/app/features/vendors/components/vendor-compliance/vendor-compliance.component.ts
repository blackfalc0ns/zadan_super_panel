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
  VendorRiskIndicator
} from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

interface ComplianceMetricCard {
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
  documentRejectReason = '';
  mutationError = '';
  vendorDetail: VendorDetail | null = null;
  selectedDocumentId: string | null = null;
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

        if (this.selectedDocument && this.selectedDocument.reviewDecision !== 'rejected') {
          this.documentRejectReason = '';
        } else if (this.selectedDocument?.rejectionReason) {
          this.documentRejectReason = this.selectedDocument.rejectionReason;
        }
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

  get uploadedFileDocuments(): VendorReviewDocument[] {
    return this.sortedReviewDocuments.filter((document) => !!document.fileUrl);
  }

  get selectedDocument(): VendorReviewDocument | null {
    if (!this.selectedDocumentId) {
      return this.sortedReviewDocuments[0] ?? null;
    }

    return this.reviewDocuments.find((document) => document.id === this.selectedDocumentId) ?? this.sortedReviewDocuments[0] ?? null;
  }

  get safePreviewUrl(): SafeResourceUrl | null {
    if (!this.selectedDocument?.fileUrl) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(this.selectedDocument.fileUrl);
  }

  get complianceNotes(): VendorReviewNote[] {
    return this.vendorDetail?.reviewNotes || [];
  }

  get riskIndicators(): VendorRiskIndicator[] {
    return this.vendorDetail?.riskIndicators || [];
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

  get requiredDocumentsCount(): number {
    return this.reviewDocuments.filter((document) => document.isRequired).length;
  }

  get complianceReadyForFinalApproval(): boolean {
    if (typeof this.vendorDetail?.readyForFinalApproval === 'boolean') {
      return this.vendorDetail.readyForFinalApproval;
    }

    const requiredDocuments = this.reviewDocuments.filter((document) => document.isRequired);
    return requiredDocuments.length > 0
      && requiredDocuments.every((document) => document.isUploaded && document.reviewDecision === 'approved');
  }

  get isVendorAlreadyApproved(): boolean {
    return this.vendorDetail?.status === 'Active' && !!this.vendorDetail?.approvedAtUtc;
  }

  get reviewStateLabel(): string {
    const state = this.vendorDetail?.reviewState;
    switch (state) {
      case 'verified':
        return this.localize('جاهز للاعتماد النهائي', 'Ready for final approval');
      case 'changes_requested':
        return this.localize('بانتظار إعادة رفع', 'Waiting for re-upload');
      case 'under_review':
        return this.localize('تحت المراجعة', 'Under review');
      case 'rejected':
        return this.localize('مرفوض', 'Rejected');
      case 'suspended':
        return this.localize('معلّق', 'Suspended');
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

  get canStartReview(): boolean {
    const reviewState = this.vendorDetail?.reviewState;
    return reviewState === 'submitted' || reviewState === 'awaiting_submission' || reviewState === 'changes_requested';
  }

  get lastReviewerName(): string {
    const documentReviewer = this.reviewDocuments
      .filter((document) => !!document.reviewedBy)
      .sort((left, right) => (right.reviewedAtUtc || '').localeCompare(left.reviewedAtUtc || ''))[0]?.reviewedBy;

    return documentReviewer
      || this.complianceNotes[0]?.authorName
      || this.localize('غير محدد', 'Unassigned');
  }

  get complianceMetricCards(): ComplianceMetricCard[] {
    return [
      {
        label: this.localize('مستندات معتمدة', 'Approved documents'),
        value: this.formatNumber(this.documentsApprovedCount),
        hint: this.localize('مستندات أغلقت مراجعتها بنجاح', 'Documents that passed review successfully'),
        variant: 'success'
      },
      {
        label: this.localize('مستندات مرفوضة', 'Rejected documents'),
        value: this.formatNumber(this.documentsRejectedCount),
        hint: this.localize('تحتاج إعادة رفع أو تصحيح', 'Need re-upload or correction'),
        variant: 'danger'
      },
      {
        label: this.localize('قيد القرار', 'Pending decisions'),
        value: this.formatNumber(this.documentsPendingCount),
        hint: this.localize('مرفوعة لكنها لم تُحسم بعد', 'Uploaded but not decided yet'),
        variant: 'warning'
      },
      {
        label: this.localize('المرفوع من المطلوب', 'Uploaded vs required'),
        value: `${this.formatNumber(this.uploadedDocumentsCount)} / ${this.formatNumber(this.requiredDocumentsCount)}`,
        hint: this.localize('تغطي المستندات المتوفرة ملف الاعتماد الحالي', 'Available documents covering the current review packet'),
        variant: 'processing'
      }
    ];
  }

  get reviewCompletionPercent(): number {
    if (!this.requiredDocumentsCount) {
      return 0;
    }

    return Math.round((this.documentsApprovedCount / this.requiredDocumentsCount) * 100);
  }

  get pendingRequiredDocumentsCount(): number {
    return this.reviewDocuments.filter((document) =>
      document.isRequired && (!document.isUploaded || document.reviewDecision !== 'approved')
    ).length;
  }

  get documentGroups(): ComplianceDocumentGroup[] {
    const groups: Array<Omit<ComplianceDocumentGroup, 'documents'> & { types: VendorReviewDocument['type'][] }> = [
      {
        id: 'official',
        title: this.localize('المستندات الرسمية الأساسية', 'Official compliance documents'),
        hint: this.localize('السجل التجاري والضريبة والرخصة هي ملفات القرار النهائي الأساسية.', 'Commercial, tax, and license files drive the final approval decision.'),
        accentClass: 'border-sky-200 bg-sky-50/70 text-sky-700',
        types: ['commercial', 'tax', 'license']
      },
      {
        id: 'owner',
        title: this.localize('بيانات المالك والهوية', 'Owner and identity data'),
        hint: this.localize('مرجع تشغيلي للتحقق من هوية صاحب النشاط وربطها بالمستندات الرسمية.', 'Structured owner data used to validate identity against official records.'),
        accentClass: 'border-violet-200 bg-violet-50/70 text-violet-700',
        types: ['identity']
      },
      {
        id: 'financial',
        title: this.localize('البيانات المالية والبنكية', 'Financial and banking data'),
        hint: this.localize('معلومات التحويل البنكي المرجعية للحساب المستفيد والـ IBAN.', 'Reference banking details used for payout and beneficiary validation.'),
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

  selectDocument(document: VendorReviewDocument): void {
    this.selectedDocumentId = document.id;
    this.documentRejectReason = document.rejectionReason ?? '';
  }

  onApproveDocument(document: VendorReviewDocument): void {
    if (this.isSubmittingDocumentDecision || !document.isUploaded) {
      return;
    }

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
    if (this.isSubmittingDocumentDecision || !document.isUploaded || !this.documentRejectReason.trim()) {
      return;
    }

    this.isSubmittingDocumentDecision = true;
    this.vendorDetailFacade.rejectVendorDocumentRequest(document.id, this.documentRejectReason.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
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
    if (!this.vendorDetail) {
      return;
    }

    this.vendorDetailFacade.startVendorReview();
  }

  onApproveVendor(): void {
    if (!this.vendorDetail || !this.complianceReadyForFinalApproval || this.isVendorAlreadyApproved) {
      return;
    }

    const isConfirmed = window.confirm(this.localize(
      'تمت مراجعة جميع المستندات المطلوبة. هل تريد اعتماد التاجر الآن؟',
      'All required documents are approved. Do you want to approve this vendor now?'
    ));

    if (!isConfirmed) {
      return;
    }

    this.vendorDetailFacade.approveVendorReview(this.vendorDetail.commissionRate ?? 13);
  }

  onRequestDocuments(): void {
    if (!this.vendorDetail) {
      return;
    }

    const note = this.selectedDocument?.reviewDecision === 'rejected' && this.documentRejectReason.trim()
      ? `${this.localize('برجاء إعادة رفع', 'Please re-upload')} ${this.getDocumentLabel(this.selectedDocument)}. ${this.documentRejectReason.trim()}`
      : undefined;

    this.vendorDetailFacade.requestVendorDocuments(note);
  }

  onSuspendAccount(): void {
    if (!this.vendorDetail) {
      return;
    }

    this.vendorDetailFacade.suspendVendorAccount();
  }

  onRejectVendor(): void {
    if (!this.vendorDetail) {
      return;
    }

    this.vendorDetailFacade.rejectVendorReview();
  }

  onAddNote(): void {
    if (!this.vendorDetail || !this.newNote.trim()) {
      return;
    }

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

  getDocumentMetaLabel(document: VendorReviewDocument): string {
    switch (document.type) {
      case 'commercial':
        return this.localize('ملف رسمي أساسي', 'Primary official file');
      case 'tax':
        return this.localize('شهادة ضريبية', 'Tax certificate');
      case 'license':
        return this.localize('رخصة تشغيل', 'Operating license');
      case 'identity':
        return this.localize('بيانات هوية', 'Identity data');
      default:
        return this.localize('بيانات بنكية', 'Banking data');
    }
  }

  getDocumentQueueSummary(document: VendorReviewDocument): string {
    if (!document.isUploaded) {
      return this.localize('ناقص ويحتاج رفع من التاجر', 'Missing and requires vendor upload');
    }

    if (document.reviewDecision === 'rejected') {
      return this.localize('مرفوض ويحتاج تصحيح قبل إعادة الرفع', 'Rejected and needs correction before re-upload');
    }

    if (document.reviewDecision === 'approved') {
      return this.localize('أغلق بنجاح ضمن ملف الامتثال', 'Closed successfully in the compliance packet');
    }

    return this.localize('مرفوع وينتظر قرار المراجع', 'Uploaded and waiting for reviewer decision');
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
          { label: this.localize('المنشأة', 'Business name'), value: this.isRTL ? vendor.businessNameAr : vendor.businessNameEn },
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

  private getDocumentLabel(document: VendorReviewDocument): string {
    switch (document.type) {
      case 'identity':
        return this.localize('الهوية', 'identity document');
      case 'commercial':
        return this.localize('السجل التجاري', 'commercial registration');
      case 'tax':
        return this.localize('المستند الضريبي', 'tax certificate');
      case 'bank':
        return this.localize('المستند البنكي', 'bank account document');
      default:
        return this.localize('الرخصة', 'license');
    }
  }

  private localize(ar: string, en: string): string {
    return this.isRTL ? ar : en;
  }
}
