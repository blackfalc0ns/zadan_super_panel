import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  VendorActivityLogEntry,
  VendorActivitySeverity,
  VendorDetail,
  VendorReviewNote
} from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  toneClass: string;
}

type SidePanel = 'notes' | 'timeline';

@Component({
  selector: 'app-vendor-activity-log',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './vendor-activity-log.component.html',
  styleUrls: ['./vendor-activity-log.component.scss']
})
export class VendorActivityLogComponent {
  currentLang = 'ar';
  filterDateFrom = '';
  filterDateTo = '';
  filterSeverity: 'all' | VendorActivitySeverity = 'all';
  filterType = 'all';
  isActivityLoading = false;
  isRTL = true;
  noteDraft = '';
  noteError = '';
  noteSubmitting = false;
  page = 1;
  pageSize = 12;
  selectedSidePanel: SidePanel = 'notes';
  activityError = '';
  vendorDetail: VendorDetail | null = null;
  timeline: TimelineEvent[] = [];
  totalActivityPages = 1;
  hasPreviousActivityPage = false;
  hasNextActivityPage = false;

  private readonly destroyRef = inject(DestroyRef);
  private lastVendorId: string | null = null;
  private activityEntries: VendorActivityLogEntry[] = [];
  private totalActivityCount = 0;

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
        this.timeline = this.vendorDetail ? this.buildTimeline(this.vendorDetail) : [];
      });

    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
        this.vendorDetail = vendor;
        this.timeline = vendor ? this.buildTimeline(vendor) : [];

        if (vendor?.id && vendor.id !== this.lastVendorId) {
          this.lastVendorId = vendor.id;
          this.page = 1;
          this.loadActivityLog();
        }
      });

    this.vendorDetailFacade.activityLog$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((page) => {
        this.activityEntries = page?.items ?? [];
        this.totalActivityCount = page?.totalCount ?? 0;
        this.totalActivityPages = page?.totalPages ?? 1;
        this.hasPreviousActivityPage = page?.hasPrevious ?? false;
        this.hasNextActivityPage = page?.hasNext ?? false;
      });

    this.vendorDetailFacade.isActivityLogLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => {
        this.isActivityLoading = loading;
      });

    this.vendorDetailFacade.activityLogError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => {
        this.activityError = error || '';
      });
  }

  get internalNotes(): VendorReviewNote[] {
    return this.vendorDetail?.reviewNotes ?? [];
  }

  get auditEntries(): VendorActivityLogEntry[] {
    return this.activityEntries;
  }

  get auditCount(): number {
    return this.totalActivityCount;
  }

  get criticalCount(): number {
    return this.auditEntries.filter((entry) => entry.severity === 'danger' || entry.severity === 'warning').length;
  }

  get lastActivityLabel(): string {
    const timestamp = this.auditEntries[0]?.createdAtUtc || this.vendorDetail?.updatedAtUtc || null;
    return timestamp ? this.formatDateTime(timestamp) : '-';
  }

  get notesCount(): number {
    return this.internalNotes.length;
  }

  get showingRangeLabel(): string {
    if (!this.auditCount) {
      return this.isRTL ? 'لا توجد أحداث مطابقة للفلاتر الحالية' : 'No audit events match the current filters';
    }

    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.auditCount);
    return this.isRTL
      ? `عرض ${start} - ${end} من ${this.auditCount}`
      : `Showing ${start}-${end} of ${this.auditCount}`;
  }

  get typeOptions(): string[] {
    const defaults = [
      'all',
      'note',
      'start-review',
      'request-documents',
      'approved',
      'rejected',
      'suspended',
      'reactivated',
      'locked',
      'login-unlocked',
      'archived',
      'profile-store-updated',
      'profile-owner-updated',
      'profile-contact-updated',
      'profile-legal-updated',
      'profile-banking-updated',
      'profile-hours-updated',
      'profile-operations-updated',
      'profile-notifications-updated',
      'vendor-document-reuploaded',
      'vendor-profile-submitted',
      'operations-settings-updated',
      'notification-settings-updated',
      'password-reset'
    ];

    const dynamic = this.auditEntries.map((entry) => entry.type);
    return Array.from(new Set([...defaults, ...dynamic]));
  }

  selectSidePanel(panel: SidePanel): void {
    this.selectedSidePanel = panel;
  }

  onApplyFilters(): void {
    this.page = 1;
    this.loadActivityLog();
  }

  onResetFilters(): void {
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.filterSeverity = 'all';
    this.filterType = 'all';
    this.page = 1;
    this.loadActivityLog();
  }

  onPreviousPage(): void {
    if (!this.hasPreviousActivityPage) {
      return;
    }

    this.page -= 1;
    this.loadActivityLog();
  }

  onNextPage(): void {
    if (!this.hasNextActivityPage) {
      return;
    }

    this.page += 1;
    this.loadActivityLog();
  }

  onAddNote(): void {
    const message = this.noteDraft.trim();
    if (!message) {
      this.noteError = this.isRTL ? 'اكتب ملاحظة داخلية أولًا.' : 'Write an internal note first.';
      return;
    }

    this.noteSubmitting = true;
    this.noteError = '';
    this.vendorDetailFacade.addVendorReviewNoteRequest(
      message,
      this.isRTL ? 'فريق التشغيل' : 'Operations Desk',
      'Operations Console'
    )
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.noteDraft = '';
          this.noteSubmitting = false;
          this.selectedSidePanel = 'notes';
        },
        error: () => {
          this.noteError = this.vendorDetailFacade.mutationError || (this.isRTL ? 'تعذر إضافة الملاحظة الآن.' : 'Unable to add the note right now.');
          this.noteSubmitting = false;
        }
      });
  }

  onExportLog(): void {
    const rows = this.auditEntries.map((entry) => [
      this.resolveTypeLabel(entry.type),
      this.resolveSeverityLabel(entry.severity),
      entry.actorName,
      entry.roleLabel,
      this.formatDateTime(entry.createdAtUtc),
      entry.message.replace(/,/g, ' ')
    ].join(','));

    const headers = [
      this.isRTL ? 'النوع' : 'Type',
      this.isRTL ? 'الشدة' : 'Severity',
      this.isRTL ? 'المنفذ' : 'Actor',
      this.isRTL ? 'الدور' : 'Role',
      this.isRTL ? 'التاريخ' : 'Timestamp',
      this.isRTL ? 'الوصف' : 'Description'
    ].join(',');

    const blob = new Blob([[headers, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `vendor-activity-${this.vendorDetail?.id || 'unknown'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  resolveSeverityBadge(severity: VendorActivitySeverity): string {
    switch (severity) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'warning':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'danger':
        return 'border-rose-200 bg-rose-50 text-rose-700';
      default:
        return 'border-primary/20 bg-primary/10 text-primary';
    }
  }

  resolveSeverityIcon(severity: VendorActivitySeverity): string {
    switch (severity) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'report';
      default:
        return 'info';
    }
  }

  resolveSeverityLabel(severity: VendorActivitySeverity): string {
    switch (severity) {
      case 'success':
        return this.isRTL ? 'ناجح' : 'Success';
      case 'warning':
        return this.isRTL ? 'تحذير' : 'Warning';
      case 'danger':
        return this.isRTL ? 'حرج' : 'Critical';
      default:
        return this.isRTL ? 'معلومات' : 'Info';
    }
  }

  resolveTypeLabel(type: string): string {
    const normalized = (type || '').trim().toLowerCase();

    switch (normalized) {
      case 'all':
        return this.isRTL ? 'كل الأحداث' : 'All events';
      case 'note':
        return this.isRTL ? 'ملاحظة داخلية' : 'Internal note';
      case 'start-review':
        return this.isRTL ? 'بدء المراجعة' : 'Review started';
      case 'request-documents':
        return this.isRTL ? 'طلب مستندات' : 'Documents requested';
      case 'approved':
        return this.isRTL ? 'اعتماد نهائي' : 'Vendor approved';
      case 'rejected':
        return this.isRTL ? 'رفض' : 'Vendor rejected';
      case 'suspended':
        return this.isRTL ? 'تعليق' : 'Account suspended';
      case 'reactivated':
        return this.isRTL ? 'إعادة تشغيل' : 'Account reactivated';
      case 'locked':
        return this.isRTL ? 'قفل الدخول' : 'Login locked';
      case 'login-unlocked':
        return this.isRTL ? 'فتح الدخول' : 'Login unlocked';
      case 'archived':
        return this.isRTL ? 'أرشفة' : 'Account archived';
      case 'profile-store-updated':
        return this.isRTL ? 'تحديث بيانات المتجر' : 'Store profile updated';
      case 'profile-owner-updated':
        return this.isRTL ? 'تحديث بيانات المالك' : 'Owner profile updated';
      case 'profile-contact-updated':
        return this.isRTL ? 'تحديث العنوان والتواصل' : 'Contact details updated';
      case 'profile-legal-updated':
        return this.isRTL ? 'تحديث البيانات القانونية' : 'Legal profile updated';
      case 'profile-banking-updated':
        return this.isRTL ? 'تحديث البيانات البنكية' : 'Banking profile updated';
      case 'profile-hours-updated':
        return this.isRTL ? 'تحديث ساعات العمل' : 'Operating hours updated';
      case 'profile-operations-updated':
        return this.isRTL ? 'تحديث إعدادات التشغيل' : 'Vendor operations updated';
      case 'profile-notifications-updated':
        return this.isRTL ? 'تحديث تفضيلات الإشعارات' : 'Vendor notification preferences updated';
      case 'vendor-document-reuploaded':
        return this.isRTL ? 'إعادة رفع مستند' : 'Document re-uploaded';
      case 'vendor-profile-submitted':
        return this.isRTL ? 'إرسال الملف للمراجعة' : 'Profile submitted for review';
      case 'operations-settings-updated':
        return this.isRTL ? 'تحديث إعدادات التشغيل' : 'Operations settings updated';
      case 'notification-settings-updated':
        return this.isRTL ? 'تحديث الإشعارات' : 'Notification settings updated';
      case 'password-reset':
        return this.isRTL ? 'إعادة تعيين كلمة المرور' : 'Password reset';
      default:
        return normalized || (this.isRTL ? 'حدث' : 'Event');
    }
  }

  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }

  localizeRoleLabel(roleLabel: string): string {
    if (!this.isRTL) {
      return roleLabel;
    }

    const map: Record<string, string> = {
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
      'Risk & Compliance Desk': 'مكتب المخاطر والامتثال',
      'Security Desk': 'مكتب الأمان',
      'Operations Reviewer': 'مراجع العمليات'
    };

    return map[roleLabel] || roleLabel;
  }

  localizeMessage(message: string): string {
    if (!this.isRTL) {
      return message;
    }

    const staticMap: Record<string, string> = {
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
      'Vendor submitted the profile and required documents for compliance review.': 'قام التاجر بإرسال الملف الشخصي والمستندات المطلوبة لمراجعة الامتثال.'
    };

    if (staticMap[message]) {
      return staticMap[message];
    }

    const docTypeAr = (type: string): string => {
      const map: Record<string, string> = { 'Commercial': 'السجل التجاري', 'Tax': 'الضريبة', 'License': 'الرخصة', 'Identity': 'الهوية', 'Bank': 'البنك' };
      return map[type] || type;
    };

    let match = message.match(/^Vendor approved with commission rate ([\d.]+)%\.$/);
    if (match) return `تمت الموافقة على التاجر بنسبة عمولة ${match[1]}%.`;

    match = message.match(/^(Commercial|Tax|License|Identity|Bank) document approved\.$/);
    if (match) return `تم قبول مستند ${docTypeAr(match[1])}.`;

    match = message.match(/^(Commercial|Tax|License|Identity|Bank) document rejected\. (.+)$/);
    if (match) return `تم رفض مستند ${docTypeAr(match[1])}. ${match[2]}`;

    match = message.match(/^Vendor re-uploaded document\(s\): (.+)\. They are back in the review queue\.$/);
    if (match) return `قام التاجر بإعادة رفع مستند(ات): ${match[1]}. تم إرجاعها لقائمة المراجعة.`;

    match = message.match(/^Operations settings updated\. Accept orders: (enabled|disabled), minimum order: (.+), preparation time: (.+) minutes\.$/);
    if (match) return `تم تحديث إعدادات التشغيل. قبول الطلبات: ${match[1] === 'enabled' ? 'مفعّل' : 'معطّل'}، الحد الأدنى: ${match[2] === 'not set' ? 'غير محدد' : match[2]}، وقت التحضير: ${match[3] === 'not set' ? 'غير محدد' : match[3]} دقيقة.`;

    match = message.match(/^Notification settings updated\. Email: (enabled|disabled), SMS: (enabled|disabled), new orders: (enabled|disabled), sound: (.+)\.$/);
    if (match) return `تم تحديث إعدادات الإشعارات. البريد: ${match[1] === 'enabled' ? 'مفعّل' : 'معطّل'}، الرسائل: ${match[2] === 'enabled' ? 'مفعّل' : 'معطّل'}، طلبات جديدة: ${match[3] === 'enabled' ? 'مفعّل' : 'معطّل'}، الصوت: ${match[4]}.`;

    return message;
  }

  detectTextDirection(text: string): string {
    if (!text) return this.isRTL ? 'rtl' : 'ltr';
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return arabicRegex.test(text.charAt(0)) ? 'rtl' : 'ltr';
  }

  private loadActivityLog(): void {
    this.vendorDetailFacade.loadVendorActivityLog({
      type: this.filterType === 'all' ? null : this.filterType,
      severity: this.filterSeverity === 'all' ? null : this.filterSeverity,
      dateFrom: this.filterDateFrom ? new Date(`${this.filterDateFrom}T00:00:00`).toISOString() : null,
      dateTo: this.filterDateTo ? new Date(`${this.filterDateTo}T23:59:59.999`).toISOString() : null,
      page: this.page,
      pageSize: this.pageSize
    });
  }

  private buildTimeline(vendor: VendorDetail): TimelineEvent[] {
    const timeline: TimelineEvent[] = [
      {
        id: 'created',
        title: this.isRTL ? 'إنشاء الحساب' : 'Account created',
        description: this.isRTL ? 'تم إنشاء سجل التاجر في النظام.' : 'The vendor account record was created in the system.',
        date: this.formatDate(vendor.createdAtUtc),
        icon: 'person_add',
        toneClass: 'bg-slate-400'
      }
    ];

    if (vendor.reviewSubmittedAtUtc) {
      timeline.unshift({
        id: 'submitted',
        title: this.isRTL ? 'رفع المستندات' : 'Documents submitted',
        description: this.isRTL ? 'تم استلام المستندات الأولية من التاجر.' : 'The initial vendor documents were submitted.',
        date: this.formatDate(vendor.reviewSubmittedAtUtc),
        icon: 'folder_open',
        toneClass: 'bg-primary'
      });
    }

    if (vendor.reviewStartedAtUtc) {
      timeline.unshift({
        id: 'review-started',
        title: this.isRTL ? 'بدء المراجعة' : 'Review started',
        description: this.isRTL ? 'دخل الحساب مسار مراجعة الامتثال الفعلية.' : 'The account entered the active compliance review workflow.',
        date: this.formatDate(vendor.reviewStartedAtUtc),
        icon: 'fact_check',
        toneClass: 'bg-primary'
      });
    }

    if (vendor.requestedChangesAtUtc) {
      timeline.unshift({
        id: 'changes-requested',
        title: this.isRTL ? 'طلب تعديلات' : 'Changes requested',
        description: this.isRTL ? 'تم طلب إعادة رفع أو تصحيح بعض البيانات.' : 'The vendor was asked to re-upload or correct specific data.',
        date: this.formatDate(vendor.requestedChangesAtUtc),
        icon: 'rule',
        toneClass: 'bg-amber-500'
      });
    }

    if (vendor.approvedAtUtc) {
      timeline.unshift({
        id: 'approved',
        title: this.isRTL ? 'اعتماد التاجر' : 'Vendor approved',
        description: this.isRTL ? 'تم اعتماد الحساب وتشغيله رسميًا.' : 'The account was approved and officially activated.',
        date: this.formatDate(vendor.approvedAtUtc),
        icon: 'verified',
        toneClass: 'bg-emerald-500'
      });
    }

    if (vendor.suspendedAtUtc) {
      timeline.unshift({
        id: 'suspended',
        title: this.isRTL ? 'تعليق الحساب' : 'Account suspended',
        description: vendor.suspensionReason || (this.isRTL ? 'تم تعليق التشغيل إداريًا.' : 'Operations were suspended administratively.'),
        date: this.formatDate(vendor.suspendedAtUtc),
        icon: 'pause_circle',
        toneClass: 'bg-rose-500'
      });
    }

    if (vendor.lockedAtUtc) {
      timeline.unshift({
        id: 'locked',
        title: this.isRTL ? 'قفل الدخول' : 'Login locked',
        description: vendor.lockReason || (this.isRTL ? 'تم قفل تسجيل الدخول لهذا الحساب.' : 'Login access was locked for this account.'),
        date: this.formatDate(vendor.lockedAtUtc),
        icon: 'lock',
        toneClass: 'bg-amber-600'
      });
    }

    if (vendor.archivedAtUtc) {
      timeline.unshift({
        id: 'archived',
        title: this.isRTL ? 'أرشفة الحساب' : 'Account archived',
        description: vendor.archiveReason || (this.isRTL ? 'تمت أرشفة الحساب نهائيًا.' : 'The account was archived permanently.'),
        date: this.formatDate(vendor.archivedAtUtc),
        icon: 'archive',
        toneClass: 'bg-slate-700'
      });
    }

    return timeline;
  }
}
