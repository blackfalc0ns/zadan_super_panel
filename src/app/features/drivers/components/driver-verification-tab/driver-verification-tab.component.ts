import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StatusPillComponent } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { DriverDetailRecord, DriverVerificationChecklistItem } from '../../models/drivers.models';
import { getDocumentStatusKey, getDocumentStatusVariant } from '../../utils/driver-ui.utils';

@Component({
  selector: 'app-driver-verification-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, StatusPillComponent, SectionHeaderComponent],
  templateUrl: './driver-verification-tab.component.html'
})
export class DriverVerificationTabComponent {
  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() reviewerDecisionNote = '';
  @Input() selectedRejectionReason = '';
  @Input() internalReviewNote = '';
  @Input() isRTL = true;

  @Output() reviewerDecisionNoteChange = new EventEmitter<string>();
  @Output() selectedRejectionReasonChange = new EventEmitter<string>();
  @Output() internalReviewNoteChange = new EventEmitter<string>();

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
