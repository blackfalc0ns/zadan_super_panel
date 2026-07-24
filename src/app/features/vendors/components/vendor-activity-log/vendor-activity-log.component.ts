import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from '@shared/services/toast.service';
import { ExportService } from '@shared/utils/export';
import {
 VendorActivityLogEntry,
 VendorActivitySeverity,
 VendorDetail,
 VendorReviewNote
} from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';
import { VendorService } from '@vendors/services/vendor.api.service';

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
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-vendor-activity-log',
 standalone: true,
 imports: [CommonModule, FormsModule, TranslateModule],
 templateUrl: './vendor-activity-log.component.html',
 styleUrls: ['./vendor-activity-log.component.scss']
})
export class VendorActivityLogComponent {
 private readonly cdr = inject(ChangeDetectorRef);
 private readonly elementRef = inject(ElementRef);
 openDropdown: 'type' | 'severity' | null = null;
 currentLang = 'ar';
 filterDateFrom = '';
 filterDateTo = '';
 filterSeverity: 'all' | VendorActivitySeverity = 'all';
 filterType = 'all';
 severityOptions: VendorActivitySeverity[] = ['info', 'success', 'warning', 'danger'];
 isActivityLoading = false;
 isRTL = true;
 noteDraft = '';
 noteError = '';
 noteSubmitting = false;
 page = 1;
 pageSize = 12;
 selectedSidePanel: SidePanel = 'notes';
 vendorDetail: VendorDetail | null = null;
 timeline: TimelineEvent[] = [];
 totalActivityPages = 1;
 hasPreviousActivityPage = false;
 hasNextActivityPage = false;

 private readonly destroyRef = inject(DestroyRef);
 private readonly exportService = inject(ExportService);
 private readonly vendorService = inject(VendorService);
 private lastVendorId: string | null = null;
 private activityEntries: VendorActivityLogEntry[] = [];
 private totalActivityCount = 0;

 constructor(
 private readonly translate: TranslateService,
 private readonly vendorDetailFacade: VendorDetailFacade,
 private readonly toastService: ToastService
 ) {
 this.currentLang = this.translate.currentLang || 'ar';
 this.isRTL = this.currentLang === 'ar';

 this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
 this.cdr.markForCheck();
 this.currentLang = event.lang;
 this.isRTL = event.lang === 'ar';
 this.timeline = this.vendorDetail ? this.buildTimeline(this.vendorDetail) : [];
 });

 this.vendorDetailFacade.vendor$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((vendor) => {
 this.cdr.markForCheck();
 this.vendorDetail = vendor;
 this.timeline = vendor ? this.buildTimeline(vendor) : [];

 if (vendor?.id && vendor.id!== this.lastVendorId) {
 this.lastVendorId = vendor.id;
 this.page = 1;
 this.loadActivityLog();
 }
 });

 this.vendorDetailFacade.activityLog$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((page) => {
 this.cdr.markForCheck();
 this.activityEntries = page?.items ?? [];
 this.totalActivityCount = page?.totalCount ?? 0;
 this.totalActivityPages = page?.totalPages ?? 1;
 this.hasPreviousActivityPage = page?.hasPrevious ?? false;
 this.hasNextActivityPage = page?.hasNext ?? false;
 });

 this.vendorDetailFacade.isActivityLogLoading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((loading) => {
 this.cdr.markForCheck();
 this.isActivityLoading = loading;
 });

 this.vendorDetailFacade.activityLogError$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((error) => {
 if (error) {
 this.toastService.error(error, this.isRTL ? 'سجل النشاط' : 'Activity log');
 }
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
 return this.isRTL ? 'ما فيه أحداث مطابقة للفلاتر الحالية' : 'No audit events match the current filters';
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
 return Array.from(new Set([...defaults,...dynamic]));
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
 this.openDropdown = null;
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
 this.vendorDetailFacade.addVendorReviewNoteRequest(message).pipe(take(1)).subscribe({
 next: () => {
 this.cdr.markForCheck();
 this.noteDraft = '';
 this.noteSubmitting = false;
 this.selectedSidePanel = 'notes';
 this.toastService.success(
 this.isRTL ? 'أضفنا الملاحظة الداخلية بنجاح.' : 'Internal note added successfully.',
 this.isRTL ? 'سجل النشاط' : 'Activity log'
 );
 },
 error: () => {
 this.cdr.markForCheck();
 this.noteError = this.vendorDetailFacade.mutationError || (this.isRTL ? 'ما قدرنا نضيف الملاحظة الحين.' : 'Unable to add the note right now.');
 this.toastService.error(
 this.noteError,
 this.isRTL ? 'سجل النشاط' : 'Activity log'
 );
 this.noteSubmitting = false;
 }
 });
 }

 onExportLog(): void {
 if (!this.auditEntries.length) {
 this.toastService.warning(this.translate.instant('COMMON.EXPORT_EMPTY'));
 return;
 }

 const vendorId = this.vendorDetail?.id;
 if (!vendorId) {
 this.toastService.error(this.translate.instant('COMMON.EXPORT_FAILED'));
 return;
 }

 this.vendorService.exportVendorActivity(vendorId, {
 type: this.filterType !== 'all' ? this.filterType : undefined,
 severity: this.filterSeverity !== 'all' ? this.filterSeverity : undefined,
 dateFrom: this.filterDateFrom || undefined,
 dateTo: this.filterDateTo || undefined
 }).subscribe({
 next: (blob) => {
 this.exportService.downloadServerFile(
 blob,
 this.exportService.fileName(`vendor-activity-${vendorId}`, 'xlsx')
 );
 this.toastService.success(this.translate.instant('COMMON.EXPORT_SUCCESS'));
 },
 error: () => {
 this.toastService.error(this.translate.instant('COMMON.EXPORT_FAILED'));
 }
 });
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
 return this.isRTL ? 'إعادة ضبط كلمة المرور' : 'Password reset';
 case 'document-approved':
 return this.isRTL ? 'مستند معتمد' : 'Document approved';
 case 'document-rejected':
 return this.isRTL ? 'مستند مرفوض' : 'Document rejected';
 case 'profile-field-approved':
 return this.isRTL ? 'اعتماد حقل بالملف' : 'Profile field approved';
 case 'profile-field-rejected':
 return this.isRTL ? 'رفض حقل بالملف' : 'Profile field rejected';
 default:
 return normalized || (this.isRTL ? 'حدث' : 'Event');
 }
 }

 formatDateTime(value: string): string {
 return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { timeZone: 'Asia/Riyadh',
 day: '2-digit',
 month: 'short',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 }).format(new Date(value));
 }

 formatDate(value: string): string {
 return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { timeZone: 'Asia/Riyadh',
 day: '2-digit',
 month: 'short',
 year: 'numeric'
 }).format(new Date(value));
 }

 localizeRoleLabel(roleLabel: string): string {
 if (!roleLabel) return '';

 const enToAr: Record<string, string> = {
 'Compliance Review': 'مراجعة الامتثال',
 'Document Review': 'مراجعة المستندات',
 'Risk & Compliance': 'المخاطر والامتثال',
 'Security Review': 'مراجعة أمنية',
 'Security Control': 'التحكم الأمني',
 'Admin Action': 'إجراء إداري',
 'Admin': 'المشرف',
 'Vendor Portal': 'بوابة التاجر',
 'Vendor Review': 'مراجعة التاجر',
 'Operations Console': 'لوحة التشغيل',
 'Vendor Compliance Desk': 'مكتب امتثال التاجر',
 'Risk & Compliance Desk': 'مكتب المخاطر والامتثال',
 'Security Desk': 'مكتب الأمان',
 'Operations Reviewer': 'مراجع العمليات'
 };

 const arToEn: Record<string, string> = {
 'مراجعة الامتثال': 'Compliance Review',
 'مراجعة المستندات': 'Document Review',
 'المخاطر والامتثال': 'Risk & Compliance',
 'مراجعة أمنية': 'Security Review',
 'التحكم الأمني': 'Security Control',
 'إجراء إداري': 'Admin Action',
 'المشرف': 'Admin',
 'بوابة التاجر': 'Vendor Portal',
 'مراجعة التاجر': 'Vendor Review',
 'لوحة التشغيل': 'Operations Console',
 'مكتب امتثال التاجر': 'Vendor Compliance Desk',
 'مكتب المخاطر والامتثال': 'Risk & Compliance Desk',
 'مكتب الأمان': 'Security Desk',
 'مراجع العمليات': 'Operations Reviewer',
 'مراجعة بيانات التاجر': 'Vendor Profile Review'
 };

 if (this.isRTL) {
 return enToAr[roleLabel] || roleLabel;
 } else {
 return arToEn[roleLabel] || roleLabel;
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
 if (!label) return code;
 return this.isRTL ? label.ar : label.en;
 }

 localizeMessage(message: string): string {
 if (!message) return '';

 // Bilingual document type mapping
 const docTypeEnToAr: Record<string, string> = {
 'Commercial': 'السجل التجاري',
 'Tax': 'الضريبة',
 'License': 'الرخصة',
 'Identity': 'الهوية',
 'Bank': 'البنك'
 };

 const docTypeArToEn: Record<string, string> = {
 'السجل التجاري': 'Commercial',
 'الضريبة': 'Tax',
 'الرخصة': 'License',
 'الهوية': 'Identity',
 'البنك': 'Bank'
 };

 const translateDocTypesList = (text: string, toAr: boolean): string => {
 let result = text;
 const map = toAr ? docTypeEnToAr : docTypeArToEn;
 for (const [key, val] of Object.entries(map)) {
 result = result.replace(new RegExp(key, 'g'), val);
 }
 // Clean up delimiters
 if (!toAr) {
 result = result.replace(/،/g, ',');
 } else {
 result = result.replace(/,/g, '،');
 }
 return result;
 };

 if (this.isRTL) {
 // ENGLISH to ARABIC translations
 const englishToArabicMap: Record<string, string> = {
 'Vendor review started.': 'بدأت مراجعة التاجر.',
 'Vendor account reactivated and returned to active status.': 'أعدنا تفعيل حساب التاجر ورجعناه للحالة النشطة.',
 'Vendor login was unlocked and account access was restored.': 'فتحنا دخول التاجر ورجعنا الوصول للحساب.',
 'Vendor password was reset by an administrator and all active sessions were revoked.': 'أعادت الإدارة ضبط كلمة مرور التاجر وأنهت كل الجلسات النشطة.',
 'Please re-upload the required legal documents and confirm the latest vendor information.': 'أعد رفع المستندات القانونية المطلوبة وتأكيد أحدث بيانات التاجر.',
 'Vendor updated banking and payout setup from Vendor Portal.': 'حدّث التاجر بيانات الحساب البنكي والتسويات من بوابة التاجر.',
 'Vendor updated store profile details from Vendor Portal.': 'حدّث التاجر بيانات المتجر من بوابة التاجر.',
 'Vendor updated address and contact location details from Vendor Portal.': 'حدّث التاجر بيانات العنوان والموقع من بوابة التاجر.',
 'Vendor updated operating hours from Vendor Portal.': 'حدّث التاجر ساعات العمل من بوابة التاجر.',
 'Vendor updated owner information from Vendor Portal.': 'حدّث التاجر بيانات المالك من بوابة التاجر.',
 'Vendor updated notification preferences from Vendor Portal.': 'حدّث التاجر تفضيلات الإشعارات من بوابة التاجر.',
 'Vendor updated operational settings from Vendor Portal.': 'حدّث التاجر إعدادات التشغيل من بوابة التاجر.',
 'Vendor updated legal and compliance information from Vendor Portal.': 'حدّث التاجر البيانات القانونية والامتثال من بوابة التاجر.',
 'Vendor submitted the profile and required documents for compliance review.': 'أرسل التاجر الملف الشخصي والمستندات المطلوبة لمراجعة الامتثال.'
 };

 if (englishToArabicMap[message]) {
 return englishToArabicMap[message];
 }

 // Dynamic English templates -> Arabic
 let match = message.match(/^Vendor approved with commission rate ([\d.]+)%\.$/);
 if (match) return `اعتمدنا التاجر بنسبة عمولة ${match[1]}%.`;

 match = message.match(/^(Commercial|Tax|License|Identity|Bank) document approved\.$/);
 if (match) return `قبلنا مستند ${docTypeEnToAr[match[1]] || match[1]}.`;

 match = message.match(/^(Commercial|Tax|License|Identity|Bank) document rejected\. (.+)$/);
 if (match) return `رفضنا مستند ${docTypeEnToAr[match[1]] || match[1]}. ${match[2]}`;

 match = message.match(/^Vendor re-uploaded document\(s\): (.+)\. They are back in the review queue\.$/);
 if (match) {
 return `أعاد التاجر رفع مستند(ات): ${translateDocTypesList(match[1], true)}. رجّعناها لقائمة المراجعة.`;
 }

 match = message.match(/^Operations settings updated\. Accept orders: (enabled|disabled), minimum order: (.+), preparation time: (.+) minutes\.$/);
 if (match) {
 return `حدّثنا إعدادات التشغيل. قبول الطلبات: ${match[1] === 'enabled' ? 'مفعّل' : 'معطّل'}، الحد الأدنى للطلب: ${match[2] === 'not set' ? 'غير محدد' : match[2]}، وقت التحضير: ${match[3] === 'not set' ? 'غير حدد' : match[3]} دقيقة.`;
 }

 match = message.match(/^Notification settings updated\. Email: (enabled|disabled), SMS: (enabled|disabled), new orders: (enabled|disabled), sound: (.+)\.$/);
 if (match) {
 return `حدّثنا إعدادات الإشعارات. البريد: ${match[1] === 'enabled' ? 'مفعّل' : 'معطّل'}، الرسائل: ${match[2] === 'enabled' ? 'مفعّل' : 'معطّل'}، طلبات جديدة: ${match[3] === 'enabled' ? 'مفعّل' : 'معطّل'}، الصوت: ${match[4]}.`;
 }

 // Dynamic field logs -> Arabic
 match = message.match(/^تم (قبول|رفض) العنصر (.+)\. (.+)$/);
 if (match) {
 const decision = match[1];
 const fieldLabel = this.getProfileItemLabelByCode(match[2]);
 return `${decision === 'قبول' ? 'قبلنا' : 'رفضنا'} العنصر ${fieldLabel}. ${match[3]}`;
 }

 match = message.match(/^تم (قبول|رفض) العنصر (.+)\.$/);
 if (match) {
 const decision = match[1];
 const fieldLabel = this.getProfileItemLabelByCode(match[2]);
 return `${decision === 'قبول' ? 'قبلنا' : 'رفضنا'} العنصر ${fieldLabel}.`;
 }

 return message;
 } else {
 // ARABIC to ENGLISH translations
 const arabicToEnglishMap: Record<string, string> = {
 'بدأت مراجعة التاجر.': 'Vendor review started.',
 'أعدنا تفعيل حساب التاجر ورجعناه للحالة النشطة.': 'Vendor account reactivated and returned to active status.',
 'تم فتح دخول التاجر واستعادة الوصول للحساب.': 'Vendor login was unlocked and account access was restored.',
 'فتحنا دخول التاجر ورجعنا الوصول للحساب.': 'Vendor login was unlocked and account access was restored.',
 'أعادت الإدارة ضبط كلمة مرور التاجر وأنهت كل الجلسات النشطة.': 'Vendor password was reset by an administrator and all active sessions were revoked.',
 'أعد رفع المستندات القانونية المطلوبة وتأكيد أحدث بيانات التاجر.': 'Please re-upload the required legal documents and confirm the latest vendor information.',
 'حدّث التاجر بيانات الحساب البنكي والتسويات من بوابة التاجر.': 'Vendor updated banking and payout setup from Vendor Portal.',
 'حدّث التاجر بيانات المتجر من بوابة التاجر.': 'Vendor updated store profile details from Vendor Portal.',
 'حدّث التاجر بيانات العنوان والموقع من بوابة التاجر.': 'Vendor updated address and contact location details from Vendor Portal.',
 'حدّث التاجر ساعات العمل من بوابة التاجر.': 'Vendor updated operating hours from Vendor Portal.',
 'حدّث التاجر بيانات المالك من بوابة التاجر.': 'Vendor updated owner information from Vendor Portal.',
 'حدّث التاجر تفضيلات الإشعارات من بوابة التاجر.': 'Vendor updated notification preferences from Vendor Portal.',
 'حدّث التاجر إعدادات التشغيل من بوابة التاجر.': 'Vendor updated operational settings from Vendor Portal.',
 'حدّث التاجر البيانات القانونية والامتثال من بوابة التاجر.': 'Vendor updated legal and compliance information from Vendor Portal.',
 'أرسل التاجر الملف الشخصي والمستندات المطلوبة لمراجعة الامتثال.': 'Vendor submitted the profile and required documents for compliance review.'
 };

 if (arabicToEnglishMap[message]) {
 return arabicToEnglishMap[message];
 }

 // Dynamic Arabic templates -> English
 let match = message.match(/^تمت الموافقة على التاجر بنسبة عمولة ([\d.]+)%\.$/);
 if (match) return `Vendor approved with commission rate ${match[1]}%.`;

 match = message.match(/^قبلنا مستند (السجل التجاري|الضريبة|الرخصة|الهوية|البنك)\.$/);
 if (match) return `${docTypeArToEn[match[1]] || match[1]} document approved.`;

 match = message.match(/^رفضنا مستند (السجل التجاري|الضريبة|الرخصة|الهوية|البنك)\. (.+)$/);
 if (match) return `${docTypeArToEn[match[1]] || match[1]} document rejected. ${match[2]}`;

 match = message.match(/^أعاد التاجر رفع مستند\(ات\): (.+)\. رجّعناها لقائمة المراجعة\.$/);
 if (match) {
 return `Vendor re-uploaded document(s): ${translateDocTypesList(match[1], false)}. They are back in the review queue.`;
 }

 match = message.match(/^حدّثنا إعدادات التشغيل\. قبول الطلبات: (مفعّل|معطّل)، (الحد الأدنى للطلب|الحد الأدنى): (.+)، وقت التجهيز: (.+) دقيقة\.$/);
 if (match) {
 const acceptOrders = match[1] === 'مفعّل' ? 'enabled' : 'disabled';
 const minOrder = match[3] === 'غير محدد' ? 'not set' : match[3];
 const prepTime = match[4] === 'غير محدد' ? 'not set' : match[4];
 return `Operations settings updated. Accept orders: ${acceptOrders}, minimum order: ${minOrder}, preparation time: ${prepTime} minutes.`;
 }

 match = message.match(/^حدّثنا إعدادات الإشعارات\. البريد: (مفعّل|معطّل)، الرسائل: (مفعّل|معطّل)، طلبات جديدة: (مفعّل|معطّل)، الصوت: (.+)\.$/);
 if (match) {
 const email = match[1] === 'مفعّل' ? 'enabled' : 'disabled';
 const sms = match[2] === 'مفعّل' ? 'enabled' : 'disabled';
 const newOrders = match[3] === 'مفعّل' ? 'enabled' : 'disabled';
 return `Notification settings updated. Email: ${email}, SMS: ${sms}, new orders: ${newOrders}, sound: ${match[4]}.`;
 }

 match = message.match(/^تم (قبول|رفض) العنصر (.+)\. (.+)$/);
 if (match) {
 const decision = match[1] === 'قبول' ? 'approved' : 'rejected';
 const fieldLabel = this.getProfileItemLabelByCode(match[2]);
 return `Profile item ${fieldLabel} was ${decision}. Reason: ${match[3]}`;
 }

 match = message.match(/^تم (قبول|رفض) العنصر (.+)\.$/);
 if (match) {
 const decision = match[1] === 'قبول' ? 'approved' : 'rejected';
 const fieldLabel = this.getProfileItemLabelByCode(match[2]);
 return `Profile item ${fieldLabel} was ${decision}.`;
 }

 return message;
 }
 }

 detectTextDirection(text: string): string {
 if (!text) return this.isRTL ? 'rtl' : 'ltr';
 const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
 return arabicRegex.test(text.charAt(0)) ? 'rtl' : 'ltr';
 }

 toggleDropdown(dropdown: 'type' | 'severity'): void {
 this.openDropdown = this.openDropdown === dropdown ? null : dropdown;
 }

 isDropdownOpen(dropdown: 'type' | 'severity'): boolean {
 return this.openDropdown === dropdown;
 }

 selectType(type: string): void {
 this.filterType = type;
 this.openDropdown = null;
 }

 selectSeverity(severity: 'all' | VendorActivitySeverity): void {
 this.filterSeverity = severity;
 this.openDropdown = null;
 }

 @HostListener('document:click', ['$event'])
 onDocumentClick(event: MouseEvent): void {
 const target = event.target;
 if (!(target instanceof Node)) {
 return;
 }

 if (!this.elementRef.nativeElement.contains(target)) {
 this.openDropdown = null;
 }
 }

 @HostListener('document:keydown.escape')
 onEscape(): void {
 this.openDropdown = null;
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
 description: this.isRTL ? 'أنشأنا سجل التاجر في النظام.' : 'The vendor account record was created in the system.',
 date: this.formatDate(vendor.createdAtUtc),
 icon: 'person_add',
 toneClass: 'bg-slate-400'
 }
 ];

 if (vendor.reviewSubmittedAtUtc) {
 timeline.unshift({
 id: 'submitted',
 title: this.isRTL ? 'رفع المستندات' : 'Documents submitted',
 description: this.isRTL ? 'استلمنا المستندات الأولية من التاجر.' : 'The initial vendor documents were submitted.',
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
 description: this.isRTL ? 'طلبنا إعادة رفع أو تصحيح بعض البيانات.' : 'The vendor was asked to re-upload or correct specific data.',
 date: this.formatDate(vendor.requestedChangesAtUtc),
 icon: 'rule',
 toneClass: 'bg-amber-500'
 });
 }

 if (vendor.approvedAtUtc) {
 timeline.unshift({
 id: 'approved',
 title: this.isRTL ? 'اعتماد التاجر' : 'Vendor approved',
 description: this.isRTL ? 'اعتمدنا الحساب وشغّلناه رسميًا.' : 'The account was approved and officially activated.',
 date: this.formatDate(vendor.approvedAtUtc),
 icon: 'verified',
 toneClass: 'bg-emerald-500'
 });
 }

 if (vendor.suspendedAtUtc) {
 timeline.unshift({
 id: 'suspended',
 title: this.isRTL ? 'تعليق الحساب' : 'Account suspended',
 description: vendor.suspensionReason || (this.isRTL ? 'علّقنا التشغيل إداريًا.' : 'Operations were suspended administratively.'),
 date: this.formatDate(vendor.suspendedAtUtc),
 icon: 'pause_circle',
 toneClass: 'bg-rose-500'
 });
 }

 if (vendor.lockedAtUtc) {
 timeline.unshift({
 id: 'locked',
 title: this.isRTL ? 'قفل الدخول' : 'Login locked',
 description: vendor.lockReason || (this.isRTL ? 'قفلنا تسجيل الدخول لهذا الحساب.' : 'Login access was locked for this account.'),
 date: this.formatDate(vendor.lockedAtUtc),
 icon: 'lock',
 toneClass: 'bg-amber-600'
 });
 }

 if (vendor.archivedAtUtc) {
 timeline.unshift({
 id: 'archived',
 title: this.isRTL ? 'أرشفة الحساب' : 'Account archived',
 description: vendor.archiveReason || (this.isRTL ? 'أرشفنا الحساب نهائيًا.' : 'The account was archived permanently.'),
 date: this.formatDate(vendor.archivedAtUtc),
 icon: 'archive',
 toneClass: 'bg-slate-700'
 });
 }

 return timeline;
 }
}
