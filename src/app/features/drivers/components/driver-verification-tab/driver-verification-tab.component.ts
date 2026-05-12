import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StatusPillComponent } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { DriverDetailRecord, DriverDocumentRecord, DriverVerificationChecklistItem } from '../../models/drivers.models';
import { getDocumentStatusKey, getDocumentStatusVariant } from '../../utils/driver-ui.utils';

@Component({
  selector: 'app-driver-verification-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, StatusPillComponent, SectionHeaderComponent],
  templateUrl: './driver-verification-tab.component.html'
})
export class DriverVerificationTabComponent implements OnInit {
  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() reviewerDecisionNote = '';
  @Input() selectedRejectionReason = '';
  @Input() internalReviewNote = '';
  @Input() isRTL = true;

  @Output() reviewerDecisionNoteChange = new EventEmitter<string>();
  @Output() selectedRejectionReasonChange = new EventEmitter<string>();
  @Output() internalReviewNoteChange = new EventEmitter<string>();
  @Output() reviewActionRequested = new EventEmitter<'approve' | 'request-docs' | 'reject'>();
  @Output() documentApprovalRequested = new EventEmitter<DriverDocumentRecord>();
  @Output() documentRejectionRequested = new EventEmitter<{ document: DriverDocumentRecord; reason: string }>();

  selectedDocumentPreview: DriverDocumentRecord | null = null;
  workspaceWindow: 'operations' | 'review' = 'review';
  activeRailTab: 'checklist' | 'notes' = 'checklist';
  newNote = '';
  documentRejectReason = '';

  get documentGroups() {
    // Group documents into a single group for now to match vendor UI structure
    return [
      {
        title: 'DRIVERS.DETAIL.VERIFICATION.DOCUMENT_GROUPS.DRIVER_DOCUMENTS',
        documents: this.driver.documents
      }
    ];
  }

  get reviewCompletionPercent() {
    return this.driver.verification.progressPercentage || 0;
  }

  get validDocumentsCount() {
    return this.driver.documents.filter(d => d.status === 'valid').length;
  }

  get pendingDocumentsCount() {
    return this.driver.documents.filter(d => d.status === 'review').length;
  }

  get rejectedDocumentsCount() {
    return this.driver.documents.filter(d => d.status === 'rejected').length;
  }

  get expiringDocumentsCount() {
    return this.driver.documents.filter(d => d.status === 'expiring').length;
  }

  ngOnInit() {
    if (this.driver.documents && this.driver.documents.length > 0) {
      this.selectedDocumentPreview = this.driver.documents[0];
    }
  }

  setWorkspaceWindow(window: 'operations' | 'review') {
    this.workspaceWindow = window;
  }

  isWorkspaceWindowActive(window: 'operations' | 'review') {
    return this.workspaceWindow === window;
  }

  selectDocument(document: DriverDocumentRecord) {
    this.selectedDocumentPreview = document;
    this.documentRejectReason = '';
  }

  onAddNote() {
    if (!this.newNote.trim()) return;
    // In a real app, dispatch to backend
    this.newNote = '';
  }

  onReviewerDecisionNoteChange(value: string) {
    this.reviewerDecisionNote = value;
    this.reviewerDecisionNoteChange.emit(value);
  }

  onSelectedRejectionReasonChange(value: string) {
    this.selectedRejectionReason = value;
    this.selectedRejectionReasonChange.emit(value);
  }

  onInternalReviewNoteChange(value: string) {
    this.internalReviewNote = value;
    this.internalReviewNoteChange.emit(value);
  }

  requestReviewAction(action: 'approve' | 'request-docs' | 'reject') {
    this.reviewActionRequested.emit(action);
  }

  openDocumentPreview(document: DriverDocumentRecord) {
    if (this.hasDocumentFile(document)) {
      this.selectedDocumentPreview = document;
    }
  }

  closeDocumentPreview() {
    this.selectedDocumentPreview = null;
  }

  openDocumentInNewTab(document: DriverDocumentRecord) {
    const documentUrl = this.getDocumentUrl(document);
    if (!documentUrl || typeof window === 'undefined') {
      return;
    }

    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  }

  getDocumentPreviewTitle(): string {
    return this.selectedDocumentPreview?.title ?? '';
  }

  getDocumentUrl(document: DriverDocumentRecord | null): string {
    return document?.fileUrl || document?.imageUrl || '';
  }

  getDocumentUrls(document: DriverDocumentRecord | null): string[] {
    const urls = [
      document?.fileUrl,
      document?.imageUrl,
      document?.secondaryImageUrl
    ]
      .map((url) => url?.trim())
      .filter((url): url is string => Boolean(url));

    return [...new Set(urls)];
  }

  getDocumentImageLabel(document: DriverDocumentRecord, index: number): string {
    if (document.documentType === 'NationalId') {
      return index === 0
        ? 'DRIVERS.DETAIL.VERIFICATION.DOCUMENT_IMAGES.FRONT'
        : 'DRIVERS.DETAIL.VERIFICATION.DOCUMENT_IMAGES.BACK';
    }

    return 'DRIVERS.DETAIL.VERIFICATION.DOCUMENT_IMAGES.IMAGE';
  }

  hasDocumentFile(document: DriverDocumentRecord | null): boolean {
    return this.getDocumentUrls(document).length > 0;
  }

  isImageDocument(document: DriverDocumentRecord | null): boolean {
    const url = this.getDocumentUrls(document)[0]?.toLowerCase().split('?')[0] || '';
    const contentType = document?.contentType?.toLowerCase() || '';

    return contentType.startsWith('image/')
      || /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(url);
  }

  isPdfDocument(document: DriverDocumentRecord | null): boolean {
    const url = this.getDocumentUrls(document)[0]?.toLowerCase().split('?')[0] || '';
    const contentType = document?.contentType?.toLowerCase() || '';

    return contentType.includes('pdf') || url.endsWith('.pdf');
  }

  getDocumentTypeIcon(document: DriverDocumentRecord): string {
    if (!this.hasDocumentFile(document)) return 'upload_file';
    if (this.isPdfDocument(document)) return 'picture_as_pdf';
    if (this.isImageDocument(document)) return 'image';
    return 'description';
  }

  requiresReason(action: 'approve' | 'request-docs' | 'reject'): boolean {
    return action !== 'approve';
  }

  canSubmitAction(action: 'approve' | 'request-docs' | 'reject'): boolean {
    if (!this.requiresReason(action)) {
      return this.driver.verification.allRequiredDocumentsApproved !== false
        && this.driver.profileReadiness.isProfileComplete;
    }

    return Boolean(this.selectedRejectionReason.trim() || this.reviewerDecisionNote.trim() || this.internalReviewNote.trim());
  }

  canApproveSelectedDocument(): boolean {
    return Boolean(
      this.selectedDocumentPreview?.documentType
      && this.hasDocumentFile(this.selectedDocumentPreview)
      && this.hasRequiredExpiryDate(this.selectedDocumentPreview)
      && this.selectedDocumentPreview.status !== 'valid'
      && this.selectedDocumentPreview.status !== 'expiring'
    );
  }

  hasRequiredExpiryDate(document: DriverDocumentRecord | null): boolean {
    if (!document?.documentType) {
      return false;
    }

    const requiresExpiry = ['NationalId', 'DriverLicense', 'VehicleLicense'].includes(document.documentType);
    return !requiresExpiry || Boolean(document.expiryDateUtc);
  }

  canRejectSelectedDocument(): boolean {
    return Boolean(
      this.selectedDocumentPreview?.documentType
      && this.hasDocumentFile(this.selectedDocumentPreview)
      && this.documentRejectReason.trim()
    );
  }

  approveSelectedDocument() {
    if (this.selectedDocumentPreview) {
      this.documentApprovalRequested.emit(this.selectedDocumentPreview);
    }
  }

  rejectSelectedDocument() {
    if (this.selectedDocumentPreview && this.documentRejectReason.trim()) {
      this.documentRejectionRequested.emit({
        document: this.selectedDocumentPreview,
        reason: this.documentRejectReason.trim()
      });
    }
  }

  getVerificationRecommendationVariant() {
    const recommendation = this.driver.verification.recommendation;
    if (recommendation.endsWith('.ACCEPT')) return 'success';
    if (recommendation.endsWith('.CONDITIONAL')) return 'warning';
    return 'danger';
  }

  getPendingChecklistCount(): number {
    return this.driver.verification.checklist.filter((item: DriverVerificationChecklistItem) => !item.completed).length;
  }

  getCompletedChecklistCount(): number {
    return this.driver.verification.checklist.filter((item: DriverVerificationChecklistItem) => item.completed).length;
  }

  getCriticalChecklistCount(): number {
    return this.driver.verification.checklist.filter((item: DriverVerificationChecklistItem) => item.critical === true).length;
  }

  getChecklistItemStatusVariant(item: DriverVerificationChecklistItem): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
    if (item.completed) return 'success';
    if (item.critical) return 'danger';
    return 'neutral';
  }

  getChecklistItemStatusLabel(item: DriverVerificationChecklistItem): string {
    if (item.completed) return 'DRIVERS.DETAIL.VERIFICATION.STATUS_COMPLETED';
    if (item.critical) return 'DRIVERS.DETAIL.VERIFICATION.STATUS_REQUIRED';
    return 'DRIVERS.DETAIL.VERIFICATION.STATUS_NEEDS_REVIEW';
  }

  getDocumentStatusVariant(status: string) {
    return getDocumentStatusVariant(status as any);
  }

  getDocumentStatusKey(status: string) {
    return getDocumentStatusKey(status as any);
  }
}
