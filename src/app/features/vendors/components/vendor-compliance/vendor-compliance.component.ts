import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { VendorDetail, VendorReviewDocument, VendorReviewNote, VendorRiskIndicator } from '../../../../core/models/vendor';
import { VendorService } from '../../../../core/services/vendor.service';

@Component({
  selector: 'app-vendor-compliance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, InlineBannerComponent, SectionHeaderComponent, StatusPillComponent],
  templateUrl: './vendor-compliance.component.html'
})
export class VendorComplianceComponent {
  vendorId = 'VND-9928';
  currentLang = 'ar';
  isRTL = true;
  newNote = '';
  vendorDetail: VendorDetail | null = null;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private vendorService: VendorService
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
      });

    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        if (params['id']) {
          this.vendorId = params['id'];
        }

        this.loadVendor();
      });
  }

  get verificationItems(): VendorReviewDocument[] {
    return this.vendorDetail?.reviewDocuments || [];
  }

  get riskIndicators(): VendorRiskIndicator[] {
    return this.vendorDetail?.riskIndicators || [];
  }

  get complianceNotes(): VendorReviewNote[] {
    return this.vendorDetail?.reviewNotes || [];
  }

  get verificationCompletedCount(): number {
    return this.verificationItems.filter((item) => item.status === 'completed').length;
  }

  get blockingDocuments(): VendorReviewDocument[] {
    return this.verificationItems.filter((item) => item.status !== 'completed');
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

  get lastReviewerName(): string {
    return this.vendorDetail?.assignedReviewer || '-';
  }

  get lastReviewerInitials(): string {
    return this.getInitials(this.lastReviewerName);
  }

  onApproveVendor() {
    if (!this.vendorDetail) {
      return;
    }

    this.vendorService
      .approveVendorReview(this.vendorDetail.id, this.vendorDetail.commissionRate ?? 13)
      .subscribe((vendor) => this.vendorDetail = vendor);
  }

  onRequestDocuments() {
    if (!this.vendorDetail) {
      return;
    }

    this.vendorService
      .requestVendorDocuments(this.vendorDetail.id)
      .subscribe((vendor) => this.vendorDetail = vendor);
  }

  onSuspendAccount() {
    if (!this.vendorDetail) {
      return;
    }

    this.vendorService
      .suspendVendorAccount(this.vendorDetail.id)
      .subscribe((vendor) => this.vendorDetail = vendor);
  }

  onRejectVendor() {
    if (!this.vendorDetail) {
      return;
    }

    this.vendorService
      .rejectVendorReview(this.vendorDetail.id)
      .subscribe((vendor) => this.vendorDetail = vendor);
  }

  onAddNote() {
    if (!this.vendorDetail || !this.newNote.trim()) {
      return;
    }

    this.vendorService
      .addVendorReviewNote(this.vendorDetail.id, this.newNote.trim())
      .subscribe((vendor) => {
        this.vendorDetail = vendor;
        this.newNote = '';
      });
  }

  getVerificationStatusVariant(status: VendorReviewDocument['status']): StatusPillVariant {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'missing':
        return 'neutral';
      default:
        return 'neutral';
    }
  }

  getRiskSeverityVariant(severity: VendorRiskIndicator['severity']): StatusPillVariant {
    switch (severity) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'neutral';
      default:
        return 'neutral';
    }
  }

  getRiskCardClasses(severity: VendorRiskIndicator['severity']): string {
    switch (severity) {
      case 'high':
        return 'border-red-100 bg-red-50/50';
      case 'medium':
        return 'border-orange-100 bg-orange-50/50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  }

  getRiskIconClasses(severity: VendorRiskIndicator['severity']): string {
    switch (severity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      default:
        return 'bg-slate-500';
    }
  }

  getNoteAvatarClasses(note: VendorReviewNote): string {
    switch (note.tone) {
      case 'success':
        return 'bg-emerald-100 text-emerald-700';
      case 'warning':
        return 'bg-amber-100 text-amber-700';
      case 'danger':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-primary/20 text-primary';
    }
  }

  getAuthorInitials(name: string): string {
    return this.getInitials(name);
  }

  formatNoteTimestamp(value: string): string {
    return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  private loadVendor(): void {
    this.vendorService.getVendorById(this.vendorId).subscribe((vendor) => {
      this.vendorDetail = vendor;
    });
  }

  private getInitials(name: string): string {
    const words = name.split(' ').filter(Boolean);
    if (words.length === 0 || name === '-') {
      return this.isRTL ? 'Ù….Ø±' : 'R.V';
    }

    return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('.');
  }
}
