import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VendorDetail, VendorReviewNote } from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';

interface InternalNote {
  id: string;
  author: string;
  authorInitials: string;
  department: string;
  departmentColor: string;
  timestamp: string;
  message: string;
  avatarClass: string;
  avatarUrl?: string;
  borderColor: string;
}

interface ActivityLogEntry {
  id: string;
  actionKey: string;
  actionIcon: string;
  iconColor: string;
  executor: string;
  timestamp: string;
  description: string;
}

interface TimelineEvent {
  id: string;
  titleKey: string;
  descriptionKey: string;
  date: string;
  icon: string;
  bgColor: string;
}

@Component({
  selector: 'app-vendor-activity-log',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SectionHeaderComponent],
  templateUrl: './vendor-activity-log.component.html',
  styleUrls: ['./vendor-activity-log.component.scss']
})
export class VendorActivityLogComponent {
  vendorId = '';
  currentLang = 'ar';
  isRTL = true;
  showOnlyCritical = false;
  private readonly destroyRef = inject(DestroyRef);

  vendorDetail: VendorDetail | null = null;
  lastInteraction = '-';
  openNotes = 0;
  weeklyActivity = 0;
  weeklyGrowth = '0';
  internalNotes: InternalNote[] = [];
  activityLog: ActivityLogEntry[] = [];
  timeline: TimelineEvent[] = [];

  constructor(
    private readonly translate: TranslateService,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
        this.rebuildViewModel();
      });

    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
        if (!vendor) {
          return;
        }

        this.vendorDetail = vendor;
        this.vendorId = vendor.id;
        this.rebuildViewModel();
      });
  }

  get filteredActivityLog(): ActivityLogEntry[] {
    if (!this.showOnlyCritical) {
      return this.activityLog;
    }

    return this.activityLog.filter((entry) => entry.iconColor.includes('red') || entry.iconColor.includes('orange'));
  }

  onAddNote(): void {
    const vendor = this.vendorDetail;
    if (!vendor) {
      return;
    }

    this.vendorDetailFacade.addVendorReviewNote(
      this.translate.instant('ACTIVITY_LOG.NOTES.FOLLOW_UP_CREATED', { vendorId: vendor.id }),
      this.translate.instant('ACTIVITY_LOG.AUTHORS.OPERATIONS_TEAM'),
      this.translate.instant('COMPLIANCE.ROLES.OPERATIONS')
    );
  }

  onFilterLog(): void {
    this.showOnlyCritical = !this.showOnlyCritical;
  }

  onExportLog(): void {
    const rows = this.filteredActivityLog.map((entry) => [
      this.translate.instant(entry.actionKey),
      entry.executor,
      entry.timestamp,
      entry.description
    ].join(','));

    const headers = [
      this.translate.instant('ACTIVITY_LOG.EXPORT_HEADERS.ACTION'),
      this.translate.instant('ACTIVITY_LOG.EXPORT_HEADERS.EXECUTOR'),
      this.translate.instant('ACTIVITY_LOG.EXPORT_HEADERS.TIMESTAMP'),
      this.translate.instant('ACTIVITY_LOG.EXPORT_HEADERS.DESCRIPTION')
    ].join(',');

    const blob = new Blob([[headers, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `vendor-activity-${this.vendorId}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  private rebuildViewModel(): void {
    const vendor = this.vendorDetail;
    if (!vendor) {
      return;
    }

    const notes = vendor.reviewNotes ?? [];
    this.internalNotes = notes.map((note) => this.mapInternalNote(note));
    this.activityLog = notes.map((note) => this.mapActivityLogEntry(note));
    this.timeline = this.buildTimeline(vendor);
    this.openNotes = this.internalNotes.length;
    this.lastInteraction = notes.length > 0 ? this.formatTimestamp(notes[0].createdAtUtc) : '-';
    this.weeklyActivity = notes.filter((note) => this.isWithinLastDays(note.createdAtUtc, 7)).length;
    this.weeklyGrowth = `${this.weeklyActivity}`;
  }

  private mapInternalNote(note: VendorReviewNote): InternalNote {
    return {
      id: note.id,
      author: note.authorName,
      authorInitials: this.getInitials(note.authorName),
      department: this.localizeRoleLabel(note.roleLabel),
      departmentColor: this.getDepartmentColor(note.tone),
      timestamp: this.formatTimestamp(note.createdAtUtc),
      message: this.resolveNoteMessage(note),
      avatarClass: this.getAvatarClass(note.tone),
      borderColor: this.getBorderClass(note.tone)
    };
  }

  private mapActivityLogEntry(note: VendorReviewNote): ActivityLogEntry {
    return {
      id: note.id,
      actionKey: note.messageKey || 'ACTIVITY_LOG.ACTION.MANUAL_NOTE',
      actionIcon: this.getActionIcon(note.tone),
      iconColor: this.getIconColor(note.tone),
      executor: `${note.authorName} (${this.localizeRoleLabel(note.roleLabel)})`,
      timestamp: this.formatTimestamp(note.createdAtUtc),
      description: this.resolveNoteMessage(note)
    };
  }

  private buildTimeline(vendor: VendorDetail): TimelineEvent[] {
    const timeline: TimelineEvent[] = [
      {
        id: 'created',
        titleKey: 'ACTIVITY_LOG.TIMELINE.ACCOUNT_CREATION',
        descriptionKey: 'ACTIVITY_LOG.TIMELINE.ACCOUNT_CREATION_DESC',
        date: this.formatDate(vendor.createdAtUtc),
        icon: 'person_add',
        bgColor: 'bg-slate-300'
      }
    ];

    if (vendor.reviewSubmittedAtUtc) {
      timeline.unshift({
        id: 'submitted',
        titleKey: 'ACTIVITY_LOG.TIMELINE.DOCUMENTS_UPLOAD',
        descriptionKey: 'ACTIVITY_LOG.TIMELINE.DOCUMENTS_UPLOAD_DESC',
        date: this.formatDate(vendor.reviewSubmittedAtUtc),
        icon: 'folder_open',
        bgColor: 'bg-blue-500'
      });
    }

    if (vendor.reviewStartedAtUtc) {
      timeline.unshift({
        id: 'review-started',
        titleKey: 'VENDOR_REVIEW.STATE.UNDER_REVIEW',
        descriptionKey: 'VENDOR_REVIEW.SUMMARY.READY_TO_VERIFY',
        date: this.formatDate(vendor.reviewStartedAtUtc),
        icon: 'fact_check',
        bgColor: 'bg-blue-500'
      });
    }

    if (vendor.requestedChangesAtUtc) {
      timeline.unshift({
        id: 'changes-requested',
        titleKey: 'VENDOR_REVIEW.STATE.CHANGES_REQUESTED',
        descriptionKey: 'VENDOR_REVIEW.SUMMARY.CHANGES_REQUIRED',
        date: this.formatDate(vendor.requestedChangesAtUtc),
        icon: 'rule',
        bgColor: 'bg-orange-500'
      });
    }

    if (vendor.approvedAtUtc) {
      timeline.unshift({
        id: 'approved',
        titleKey: 'ACTIVITY_LOG.TIMELINE.COMPLIANCE_APPROVAL',
        descriptionKey: 'ACTIVITY_LOG.TIMELINE.COMPLIANCE_APPROVAL_DESC',
        date: this.formatDate(vendor.approvedAtUtc),
        icon: 'verified',
        bgColor: 'bg-primary'
      });
    }

    if (vendor.reviewState === 'rejected' && vendor.reviewCompletedAtUtc) {
      timeline.unshift({
        id: 'rejected',
        titleKey: 'VENDOR_REVIEW.STATE.REJECTED',
        descriptionKey: 'VENDOR_REVIEW.SUMMARY.REJECTED',
        date: this.formatDate(vendor.reviewCompletedAtUtc),
        icon: 'cancel',
        bgColor: 'bg-red-500'
      });
    }

    if (vendor.suspendedAtUtc) {
      timeline.unshift({
        id: 'suspended',
        titleKey: 'VENDOR_REVIEW.STATE.SUSPENDED',
        descriptionKey: 'VENDOR_REVIEW.SUMMARY.SUSPENDED',
        date: this.formatDate(vendor.suspendedAtUtc),
        icon: 'pause_circle',
        bgColor: 'bg-slate-500'
      });
    }

    if (vendor.lockedAtUtc) {
      timeline.unshift({
        id: 'login-locked',
        titleKey: 'VENDOR_SETTINGS.LOCK_LOGIN',
        descriptionKey: 'VENDOR_REVIEW.SUMMARY.SUSPENDED',
        date: this.formatDate(vendor.lockedAtUtc),
        icon: 'lock',
        bgColor: 'bg-amber-500'
      });
    }

    if (vendor.archivedAtUtc) {
      timeline.unshift({
        id: 'archived',
        titleKey: 'VENDOR_SETTINGS.ARCHIVE_ACCOUNT',
        descriptionKey: 'VENDOR_REVIEW.SUMMARY.SUSPENDED',
        date: this.formatDate(vendor.archivedAtUtc),
        icon: 'archive',
        bgColor: 'bg-slate-700'
      });
    }

    return timeline;
  }

  private getDepartmentColor(tone: VendorReviewNote['tone']): string {
    switch (tone) {
      case 'success':
        return 'bg-emerald-100 text-emerald-700';
      case 'warning':
        return 'bg-orange-100 text-orange-700';
      case 'danger':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }

  private getAvatarClass(tone: VendorReviewNote['tone']): string {
    switch (tone) {
      case 'success':
        return 'bg-emerald-200 text-emerald-700';
      case 'warning':
        return 'bg-orange-200 text-orange-700';
      case 'danger':
        return 'bg-red-200 text-red-700';
      default:
        return 'bg-blue-200 text-blue-700';
    }
  }

  private getBorderClass(tone: VendorReviewNote['tone']): string {
    switch (tone) {
      case 'success':
        return 'border-l-emerald-500';
      case 'warning':
        return 'border-l-accent-orange';
      case 'danger':
        return 'border-l-red-500';
      default:
        return 'border-l-primary';
    }
  }

  private getActionIcon(tone: VendorReviewNote['tone']): string {
    switch (tone) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'report';
      default:
        return 'edit_note';
    }
  }

  private getIconColor(tone: VendorReviewNote['tone']): string {
    switch (tone) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-orange-500';
      case 'danger':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  }

  private getInitials(name: string): string {
    const words = name.split(' ').filter(Boolean);
    if (words.length === 0 || name === '-') {
      return this.translate.instant('ACTIVITY_LOG.DEFAULT_INITIALS');
    }

    return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('.');
  }

  private resolveNoteMessage(note: VendorReviewNote): string {
    if (note.message?.trim()) {
      return note.message.trim();
    }

    if (note.messageKey) {
      const translated = this.translate.instant(note.messageKey);
      if (translated !== note.messageKey) {
        return translated;
      }
    }

    return '-';
  }

  private localizeRoleLabel(roleLabel: string): string {
    const key = `COMPLIANCE.ROLES.${roleLabel.toUpperCase().replace(/[^A-Z]+/g, '_')}`;
    const translated = this.translate.instant(key);
    return translated === key ? roleLabel : translated;
  }

  private isWithinLastDays(value: string, days: number): boolean {
    const targetDate = new Date(value).getTime();
    const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
    return targetDate >= threshold;
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }

  private formatTimestamp(value: string): string {
    return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }
}
