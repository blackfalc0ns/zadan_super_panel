import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StatusPillComponent } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { GeographyService } from '../../../../shared/services/geography.service';
import { DriverDetailRecord, DriverDocumentRecord, DriverVerificationChecklistItem } from '../../models/drivers.models';
import { getDocumentStatusKey, getDocumentStatusVariant } from '../../utils/driver-ui.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-driver-verification-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, StatusPillComponent, SectionHeaderComponent],
  templateUrl: './driver-verification-tab.component.html'
})
export class DriverVerificationTabComponent implements OnInit, OnChanges {
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
  @Output() updateProfileRequested = new EventEmitter<any>();

  private readonly geographyService = inject(GeographyService);

  selectedDocumentPreview: DriverDocumentRecord | null = null;
  workspaceWindow: 'operations' | 'review' = 'review';
  activeRailTab: 'checklist' | 'notes' | 'edit-profile' = 'checklist';
  newNote = '';
  documentRejectReason = '';
  zoomScale = 1;
  rotationAngle = 0;

  regions: any[] = [];
  cities: any[] = [];
  editForm = {
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    vehicleType: '',
    nationalId: '',
    licenseNumber: '',
    vehicleLicenseNumber: '',
    nationalIdExpiryDate: '',
    driverLicenseExpiryDate: '',
    vehicleLicenseExpiryDate: '',
    region: '',
    city: ''
  };

  get documentGroups() {
    // Group documents into a single group for now to match vendor UI structure
    if (!this._cachedDocumentGroups || this._cachedDocumentGroups[0]?.documents !== this.driver.documents) {
      this._cachedDocumentGroups = [
        {
          title: 'DRIVERS.DETAIL.VERIFICATION.DOCUMENT_GROUPS.DRIVER_DOCUMENTS',
          documents: this.driver.documents
        }
      ];
    }
    return this._cachedDocumentGroups;
  }
  private _cachedDocumentGroups: { title: string; documents: DriverDocumentRecord[] }[] | null = null;

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
    this.initEditForm();
    this.geographyService.getRegions().subscribe({
      next: (regs) => {
        this.regions = regs;
        if (this.editForm.region) {
          this.loadCities(this.editForm.region);
        }
      },
      error: (err) => console.error('Failed to load regions', err)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['driver'] && !changes['driver'].firstChange) {
      this.initEditForm();
    }
  }

  initEditForm() {
    if (!this.driver) return;
    const nationalIdDoc = this.driver.documents?.find(d => d.documentType === 'NationalId');
    const driverLicenseDoc = this.driver.documents?.find(d => d.documentType === 'DriverLicense');
    const vehicleLicenseDoc = this.driver.documents?.find(d => d.documentType === 'VehicleLicense');

    this.editForm = {
      fullName: this.driver.displayName || '',
      email: this.driver.email || '',
      phoneNumber: this.driver.phoneNumber || '',
      address: this.driver.address || '',
      vehicleType: this.driver.vehicleType || '',
      nationalId: this.driver.nationalId || nationalIdDoc?.numberValue || '',
      licenseNumber: this.driver.licenseNumber || driverLicenseDoc?.numberValue || '',
      vehicleLicenseNumber: this.driver.vehicleLicenseNumber || vehicleLicenseDoc?.numberValue || '',
      nationalIdExpiryDate: this.formatDateForInput(this.driver.nationalIdExpiryDate || nationalIdDoc?.expiryDateUtc),
      driverLicenseExpiryDate: this.formatDateForInput(this.driver.driverLicenseExpiryDate || driverLicenseDoc?.expiryDateUtc),
      vehicleLicenseExpiryDate: this.formatDateForInput(this.driver.vehicleLicenseExpiryDate || vehicleLicenseDoc?.expiryDateUtc),
      region: this.driver.operations?.region || '',
      city: this.driver.city || ''
    };

    if (this.editForm.region) {
      this.loadCities(this.editForm.region);
    }
  }

  formatDateForInput(dateStr: any): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().substring(0, 10);
    } catch {
      return '';
    }
  }

  onRegionChange(regionCode: string) {
    this.editForm.city = '';
    this.cities = [];
    if (regionCode) {
      this.loadCities(regionCode);
    }
  }

  loadCities(regionCode: string) {
    this.geographyService.getCities(regionCode).subscribe({
      next: (cts) => {
        this.cities = cts;
      },
      error: (err) => console.error('Failed to load cities', err)
    });
  }

  saveProfile() {
    this.updateProfileRequested.emit(this.editForm);
  }

  trackByDocumentId(index: number, document: DriverDocumentRecord): string {
    return document.id;
  }

  setWorkspaceWindow(window: 'operations' | 'review') {
    this.workspaceWindow = window;
  }

  isWorkspaceWindowActive(window: 'operations' | 'review') {
    return this.workspaceWindow === window;
  }

  zoomIn() {
    if (this.zoomScale < 3) {
      this.zoomScale = Math.min(3, this.zoomScale + 0.2);
    }
  }

  zoomOut() {
    if (this.zoomScale > 0.5) {
      this.zoomScale = Math.max(0.5, this.zoomScale - 0.2);
    }
  }

  rotateRight() {
    this.rotationAngle = (this.rotationAngle + 90) % 360;
  }

  resetTransforms() {
    this.zoomScale = 1;
    this.rotationAngle = 0;
  }

  selectDocument(selectedDoc: DriverDocumentRecord) {
    this.selectedDocumentPreview = selectedDoc;
    this.documentRejectReason = '';
    this.resetTransforms();

    // On smaller screens the preview panel is below the document list,
    // scroll it into view so the user sees the change.
    setTimeout(() => {
      const previewEl = document.getElementById('document-preview-panel');
      if (previewEl) {
        previewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
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

  getDocumentCardClasses(document: DriverDocumentRecord): string {
    if (this.selectedDocumentPreview?.id === document.id) {
      return 'border-primary bg-primary/[0.03] shadow-md ring-2 ring-primary/10';
    }

    switch (document.status) {
      case 'review':
        return 'border-amber-200 bg-amber-50/35 hover:border-amber-300 hover:bg-amber-50/60 hover:shadow-sm';
      case 'valid':
        return 'border-emerald-200 bg-emerald-50/25 hover:border-emerald-300 hover:bg-emerald-50/45 hover:shadow-sm';
      case 'expiring':
        return 'border-orange-200 bg-orange-50/25 hover:border-orange-300 hover:bg-orange-50/45 hover:shadow-sm';
      case 'rejected':
        return 'border-rose-200 bg-rose-50/35 hover:border-rose-300 hover:bg-rose-50/60 hover:shadow-sm';
      default:
        return 'border-slate-150 bg-white hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-sm';
    }
  }

  getDocumentLifecycleBadgeClasses(document: DriverDocumentRecord): string {
    switch (document.status) {
      case 'review':
        return 'border-amber-200 bg-amber-100 text-amber-800';
      case 'valid':
        return 'border-emerald-200 bg-emerald-100 text-emerald-800';
      case 'expiring':
        return 'border-orange-200 bg-orange-100 text-orange-800';
      case 'rejected':
        return 'border-rose-200 bg-rose-100 text-rose-800';
      default:
        return 'border-slate-200 bg-slate-100 text-slate-700';
    }
  }

  getDocumentLifecycleIcon(document: DriverDocumentRecord): string {
    switch (document.status) {
      case 'review':
        return 'hourglass_top';
      case 'valid':
        return 'verified';
      case 'expiring':
        return 'event_busy';
      case 'rejected':
        return 'cancel';
      default:
        return 'info';
    }
  }

  getDocumentLifecycleLabel(document: DriverDocumentRecord): string {
    switch (document.status) {
      case 'review':
        return this.isRTL ? 'محدث وتحت المراجعة' : 'Updated, under review';
      case 'valid':
        return this.isRTL ? 'مقبول' : 'Accepted';
      case 'expiring':
        return this.isRTL ? 'مقبول وقرب الانتهاء' : 'Accepted, expiring soon';
      case 'rejected':
        return this.isRTL ? 'مرفوض' : 'Rejected';
      default:
        return this.isRTL ? 'غير محدد' : 'Unknown';
    }
  }

  getDocumentLifecycleHint(document: DriverDocumentRecord): string {
    switch (document.status) {
      case 'review':
        return this.isRTL
          ? 'الملف الجديد محفوظ كمراجعة ولن يعتمد قبل موافقة الأدمن.'
          : 'The new file is pending admin approval before it becomes active.';
      case 'valid':
        return this.isRTL
          ? 'الملف معتمد ويمكن الاعتماد عليه في قبول المندوب.'
          : 'This file is approved and can be used for driver approval.';
      case 'expiring':
        return this.isRTL
          ? 'الملف معتمد حاليا لكنه يحتاج متابعة لقرب تاريخ الانتهاء.'
          : 'This file is approved but needs follow-up because it expires soon.';
      case 'rejected':
        return this.isRTL
          ? 'الملف مرفوض ويجب رفع نسخة جديدة بعد معالجة سبب الرفض.'
          : 'This file was rejected; a corrected copy is required.';
      default:
        return this.isRTL ? 'حالة الملف غير واضحة.' : 'The document state is not clear.';
    }
  }

  getDocumentReviewMeta(document: DriverDocumentRecord): string {
    const parts = [
      document.reviewedBy,
      document.reviewedAt
    ].filter(Boolean);

    return parts.join(' - ');
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
