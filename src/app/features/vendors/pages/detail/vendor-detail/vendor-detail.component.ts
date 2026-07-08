import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CrViewerModalComponent, CommercialRegisterData } from '@vendors/components/workflows/cr-viewer-modal/cr-viewer-modal.component';
import { EditLegalBankModalComponent, LegalBankData } from '@vendors/components/workflows/edit-legal-bank-modal/edit-legal-bank-modal.component';
import { EditOwnerModalComponent, OwnerData } from '@vendors/components/workflows/edit-owner-modal/edit-owner-modal.component';
import { EditStoreModalComponent, StoreData } from '@vendors/components/workflows/edit-store-modal/edit-store-modal.component';
import { VendorDetail } from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';
import { ToastService } from '@shared/services/toast.service';

type FieldDirection = 'rtl' | 'ltr' | 'auto';
type FeedbackTone = 'success' | 'error';

interface InfoRow {
 labelAr: string;
 labelEn: string;
 value: string;
 direction?: FieldDirection;
 missing?: boolean;
 compact?: boolean;
 localizeDigits?: boolean;
}

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-vendor-detail',
 standalone: true,
 imports: [
 CommonModule,
 TranslateModule,
 EditOwnerModalComponent,
 EditLegalBankModalComponent,
 EditStoreModalComponent,
 CrViewerModalComponent
 ],
 templateUrl: './vendor-detail.component.html',
 styleUrl: './vendor-detail.component.scss'
})
export class VendorDetailComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 currentLang = 'ar';
 isRTL = true;
 vendorId = '';
 vendorDetail: VendorDetail | null = null;

 showEditOwnerModal = false;
 showEditLegalBankModal = false;
 showEditStoreModal = false;
 showCrViewerModal = false;
 isMutating = false;
 modalError = '';

 feedbackMessage = '';
 feedbackTone: FeedbackTone = 'success';

 storeIdentityRows: InfoRow[] = [];
 ownerRecordRows: InfoRow[] = [];
 legalBankingRows: InfoRow[] = [];
 operationalSnapshotRows: InfoRow[] = [];

 storeDescription = '';
 legalDocumentUrl = '';
 storeIdentityMissing = 0;
 ownerRecordMissing = 0;
 legalBankingMissing = 0;

 private readonly destroyRef = inject(DestroyRef);

 ownerData: OwnerData = {
 ownerName: '',
 ownerEmail: '',
 ownerPhone: '',
 idNumber: '',
 nationality: ''
 };

 legalBankData: LegalBankData = {
 commercialRegistrationNumber: '',
 commercialRegistrationExpiryDate: '',
 taxId: '',
 licenseNumber: '',
 bankName: '',
 accountHolderName: '',
 iban: '',
 swiftCode: '',
 commercialRegisterDocumentUrl: '',
 taxDocumentUrl: '',
 licenseDocumentUrl: ''
 };

 storeDataModal: StoreData = {
 businessNameAr: '',
 businessNameEn: '',
 businessType: '',
 contactEmail: '',
 contactPhone: '',
 descriptionAr: '',
 descriptionEn: '',
 logoUrl: '',
 commercialRegisterDocumentUrl: '',
 region: '',
 city: '',
 nationalAddress: '',
 commercialRegistrationNumber: ''
 };

 crData: CommercialRegisterData = {
 crNumber: '',
 establishmentName: '',
 entityType: '',
 expiryDate: '',
 issueDate: '',
 mainActivity: '',
 dataSource: 'API',
 verifiedBy: '',
 internalReference: '',
 isExpiringSoon: false,
 capital: '',
 headquarters: '',
 ownerName: '',
 ownerIdNumber: ''
 };

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

 if (this.vendorDetail) {
 this.applyVendorDetail(this.vendorDetail);
 }
 });
 }

 ngOnInit(): void {
 this.vendorDetailFacade.isLoading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isLoading) => {
 this.cdr.markForCheck();
 this.isMutating = isLoading;
 });

 this.vendorDetailFacade.vendor$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((vendor) => {
 this.cdr.markForCheck();
 if (!vendor) {
 return;
 }

 this.vendorId = vendor.id;
 this.applyVendorDetail(vendor);
 });
 }

 onEditClick(section: 'store' | 'owner' | 'legal_bank'): void {
 this.clearFeedback();
 this.modalError = '';

 if (section === 'owner') {
 this.showEditOwnerModal = true;
 return;
 }

 if (section === 'legal_bank') {
 this.showEditLegalBankModal = true;
 return;
 }

 this.showEditStoreModal = true;
 }

 onSaveOwnerData(data: OwnerData): void {
 this.clearFeedback();
 this.modalError = '';

 this.vendorDetailFacade.updateVendorOwnerRequest(this.buildOwnerPayload(data)).pipe(take(1)).subscribe({
 next: () => {
 this.cdr.markForCheck();
 this.showEditOwnerModal = false;
 this.modalError = '';
 const message = this.text('تم تحديث بيانات المالك بنجاح.', 'Owner record updated successfully.');
 this.setFeedback(message, 'success');
 this.toastService.success(message, this.text('بيانات التاجر', 'Vendor profile'));
 },
 error: () => {
 this.cdr.markForCheck();
 this.modalError = this.vendorDetailFacade.mutationError || this.text('ما قدرنا حفظ بيانات المالك الحين.', 'Unable to save owner data right now.');
 this.setFeedback(this.modalError, 'error');
 this.toastService.error(this.modalError, this.text('بيانات التاجر', 'Vendor profile'));
 }
 });
 }

 onSaveLegalBankData(data: LegalBankData): void {
 this.clearFeedback();
 this.modalError = '';

 this.vendorDetailFacade.updateVendorLegalBankingRequest(this.buildLegalBankingPayload(data)).pipe(take(1)).subscribe({
 next: () => {
 this.cdr.markForCheck();
 this.showEditLegalBankModal = false;
 this.modalError = '';
 const message = this.text('تم تحديث البيانات القانونية والبنكية بنجاح.', 'Legal and banking data updated successfully.');
 this.setFeedback(message, 'success');
 this.toastService.success(message, this.text('بيانات التاجر', 'Vendor profile'));
 },
 error: () => {
 this.cdr.markForCheck();
 this.modalError = this.vendorDetailFacade.mutationError || this.text('ما قدرنا حفظ البيانات القانونية والبنكية الحين.', 'Unable to save legal and banking data right now.');
 this.setFeedback(this.modalError, 'error');
 this.toastService.error(this.modalError, this.text('بيانات التاجر', 'Vendor profile'));
 }
 });
 }

 onSaveStoreData(data: StoreData): void {
 this.clearFeedback();
 this.modalError = '';

 this.vendorDetailFacade.updateVendorStoreRequest(this.buildStorePayload(data)).pipe(take(1)).subscribe({
 next: () => {
 this.cdr.markForCheck();
 this.showEditStoreModal = false;
 this.modalError = '';
 const message = this.text('تم تحديث هوية المتجر بنجاح.', 'Store identity updated successfully.');
 this.setFeedback(message, 'success');
 this.toastService.success(message, this.text('بيانات التاجر', 'Vendor profile'));
 },
 error: () => {
 this.cdr.markForCheck();
 this.modalError = this.vendorDetailFacade.mutationError || this.text('ما قدرنا حفظ بيانات المتجر الحين.', 'Unable to save store data right now.');
 this.setFeedback(this.modalError, 'error');
 this.toastService.error(this.modalError, this.text('بيانات التاجر', 'Vendor profile'));
 }
 });
 }

 onViewCrClick(): void {
 this.showCrViewerModal = true;
 }

 onCrAccept(): void {
 this.showCrViewerModal = false;
 }

 onCrDownload(): void {
 this.downloadTextFile(
 `commercial-register-${this.vendorId}.txt`,
 [
 `CR Number: ${this.crData.crNumber}`,
 `Establishment: ${this.crData.establishmentName}`,
 `Issue Date: ${this.crData.issueDate}`,
 `Expiry Date: ${this.crData.expiryDate}`
 ].join('\n')
 );
 }

 onCrVerifySource(): void {
 const reference = this.crData.internalReference || this.crData.crNumber;
 void navigator.clipboard?.writeText(reference);
 }

 getDisplayStoreName(vendor: VendorDetail | null = this.vendorDetail): string {
 if (!vendor) {
 return this.emptyValue();
 }

 const preferred = this.currentLang === 'ar' ? vendor.businessNameAr : vendor.businessNameEn;
 const alternate = this.currentLang === 'ar' ? vendor.businessNameEn : vendor.businessNameAr;
 return preferred?.trim() || alternate?.trim() || vendor.ownerName?.trim() || vendor.contactEmail?.trim() || this.emptyValue();
 }

 getDisplayBusinessType(businessType?: string | null): string {
 const normalized = (businessType || '').trim();
 if (!normalized) {
 return this.emptyValue();
 }

 const keyMap: Record<string, string> = {
 electronics: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.ELECTRONICS',
 food: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.FOOD',
 grocery: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.FOOD',
 fashion: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.FASHION',
 home: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.HOME'
 };

 const translatedKey = keyMap[normalized.toLowerCase()];
 if (translatedKey) {
 return this.translate.instant(translatedKey);
 }

 return normalized.replace(/[_-]+/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase());
 }

 getLocalizedSectionTitle(titleAr: string, titleEn: string): string {
 return this.text(titleAr, titleEn);
 }

 getLocalizedValue(row: InfoRow): string {
 return row.value;
 }

 getRowDir(row: InfoRow): 'rtl' | 'ltr' | 'auto' {
 if (row.direction === 'auto') {
 return 'auto';
 }
 if (row.direction === 'ltr') {
 return 'ltr';
 }
 return this.isRTL ? 'rtl' : 'ltr';
 }

 getRowValueAlignClass(row: InfoRow): string {
 return row.direction === 'ltr' ? 'text-end' : 'text-start';
 }

 getSectionStateLabel(missingCount: number): string {
 if (missingCount <= 0) {
 return this.text('مكتمل', 'Complete');
 }

 return this.isRTL ? `${missingCount} ناقصة` : `${missingCount} missing`;
 }

 getSectionStateClass(missingCount: number): string {
 return missingCount <= 0 ? 'section-state--complete' : 'section-state--attention';
 }

 trackRow(index: number): number {
 return index;
 }

 private applyVendorDetail(vendor: VendorDetail): void {
 this.vendorDetail = vendor;

 this.ownerData = {
 ownerName: vendor.ownerName || '',
 ownerEmail: vendor.ownerEmail || '',
 ownerPhone: vendor.ownerPhone || vendor.contactPhone || '',
 idNumber: vendor.idNumber || '',
 nationality: vendor.nationality || ''
 };

 this.legalBankData = {
 commercialRegistrationNumber: vendor.commercialRegistrationNumber || '',
 commercialRegistrationExpiryDate: vendor.commercialRegistrationExpiryDate || '',
 taxId: vendor.taxId || '',
 licenseNumber: vendor.licenseNumber || '',
 bankName: vendor.primaryBankAccount?.bankName || '',
 accountHolderName: vendor.primaryBankAccount?.accountHolderName || vendor.ownerName || '',
 iban: this.formatIbanForDisplay(vendor.primaryBankAccount?.iban || ''),
 swiftCode: vendor.primaryBankAccount?.swiftCode || '',
 commercialRegisterDocumentUrl: vendor.commercialRegisterDocumentUrl || '',
 taxDocumentUrl: vendor.taxDocumentUrl || '',
 licenseDocumentUrl: vendor.licenseDocumentUrl || ''
 };

 this.storeDataModal = {
 businessNameAr: vendor.businessNameAr || '',
 businessNameEn: vendor.businessNameEn || '',
 businessType: vendor.businessType || '',
 contactEmail: vendor.contactEmail || '',
 contactPhone: vendor.contactPhone || '',
 descriptionAr: vendor.descriptionAr || '',
 descriptionEn: vendor.descriptionEn || '',
 logoUrl: vendor.logoUrl || '',
 commercialRegisterDocumentUrl: vendor.commercialRegisterDocumentUrl || '',
 region: vendor.region || '',
 city: vendor.city || '',
 nationalAddress: vendor.nationalAddress || '',
 commercialRegistrationNumber: vendor.commercialRegistrationNumber || ''
 };

 this.storeDescription = this.getDisplayDescription(vendor);
 this.legalDocumentUrl = vendor.commercialRegisterDocumentUrl || '';

 this.storeIdentityRows = this.buildStoreIdentityRows(vendor);
 this.ownerRecordRows = this.buildOwnerRecordRows(vendor);
 this.legalBankingRows = this.buildLegalBankingRows(vendor);
 this.operationalSnapshotRows = this.buildOperationalSnapshotRows(vendor);

 this.storeIdentityMissing = this.countMissing(this.storeIdentityRows);
 this.ownerRecordMissing = this.countMissing(this.ownerRecordRows);
 this.legalBankingMissing = this.countMissing(this.legalBankingRows);

 const storeName = this.getDisplayStoreName(vendor);
 this.crData = {
 crNumber: vendor.commercialRegistrationNumber || '',
 establishmentName: storeName,
 entityType: vendor.businessType || '',
 expiryDate: vendor.commercialRegistrationExpiryDate || '',
 issueDate: vendor.createdAtUtc || '',
 mainActivity: vendor.businessType || '',
 dataSource: 'API',
 verifiedBy: vendor.approvedBy || '',
 internalReference: vendor.id,
 isExpiringSoon: this.isExpiringSoon(vendor.commercialRegistrationExpiryDate),
 capital: '',
 headquarters: [vendor.city, vendor.region, vendor.nationalAddress].filter(Boolean).join(' - '),
 ownerName: vendor.ownerName || '',
 ownerIdNumber: vendor.idNumber || ''
 };
 }

 private buildStoreIdentityRows(vendor: VendorDetail): InfoRow[] {
 return [
 this.row('الاسم التجاري', 'Commercial name', this.getDisplayStoreName(vendor)),
 this.row('النشاط', 'Business type', this.getDisplayBusinessType(vendor.businessType)),
 this.row('بريد التواصل', 'Contact email', vendor.contactEmail, 'ltr'),
 this.row('رقم التواصل', 'Contact phone', vendor.contactPhone, 'ltr'),
 this.row('المدينة', 'City', this.getLocalizedCity(vendor.city)),
 this.row('المنطقة', 'Region', this.getLocalizedRegion(vendor.region)),
 this.row('العنوان الوطني', 'National address', vendor.nationalAddress)
 ];
 }

 private buildOwnerRecordRows(vendor: VendorDetail): InfoRow[] {
 return [
 this.row('اسم المالك', 'Owner name', vendor.ownerName),
 this.row('البريد الإلكتروني', 'Email', vendor.ownerEmail, 'ltr'),
 this.row('رقم الجوال', 'Phone', vendor.ownerPhone, 'ltr'),
 this.row('رقم الهوية', 'ID number', vendor.idNumber, 'ltr'),
 this.row('الجنسية', 'Nationality', this.getLocalizedNationality(vendor.nationality))
 ];
 }

 private buildLegalBankingRows(vendor: VendorDetail): InfoRow[] {
 return [
 this.row('السجل التجاري', 'Commercial registration', vendor.commercialRegistrationNumber, 'ltr'),
 this.row('تاريخ الانتهاء', 'Expiry date', this.formatDateValue(vendor.commercialRegistrationExpiryDate), 'rtl', false, true),
 this.row('الرقم الضريبي', 'Tax ID', vendor.taxId, 'ltr'),
 this.row('رقم الرخصة', 'License number', vendor.licenseNumber, 'ltr'),
 this.row('اسم البنك', 'Bank name', vendor.primaryBankAccount?.bankName, 'auto'),
 this.row('اسم صاحب الحساب', 'Account holder', vendor.primaryBankAccount?.accountHolderName, 'auto'),
 this.row('IBAN', 'IBAN', this.formatIbanForDisplay(vendor.primaryBankAccount?.iban || ''), 'ltr'),
 this.row('SWIFT', 'SWIFT', vendor.primaryBankAccount?.swiftCode, 'ltr')
 ];
 }

 private buildOperationalSnapshotRows(vendor: VendorDetail): InfoRow[] {
 return [
 this.row('حالة الحساب', 'Account status', this.getAccountStatusLabel(vendor.status)),
 this.row('حالة التحقق', 'Verification', this.getVerificationLabel(vendor.verificationStatus || '')),
 this.row('اكتمال المستندات', 'Documents completion', this.formatCompletion(vendor.documentsCompleteness), 'ltr', false, true),
 this.row('عدد الفروع', 'Branches count', this.formatCount(vendor.branchesCount), 'ltr', true, true),
 this.row('عدد الحسابات البنكية', 'Bank accounts', this.formatCount(vendor.bankAccountsCount), 'ltr', true, true),
 this.row('آخر تحديث', 'Last update', this.formatDateValue(this.resolveLastUpdate(vendor)), 'ltr', false, true),
 this.row('تاريخ الإنشاء', 'Created at', this.formatDateValue(vendor.createdAtUtc), 'ltr', false, true)
 ];
 }

 private row(
 labelAr: string,
 labelEn: string,
 value?: string | number | null,
 direction: FieldDirection = 'rtl',
 compact = false,
 localizeDigits = false
 ): InfoRow {
 const normalized = typeof value === 'number' ? String(value) : (value || '').trim();
 return {
 labelAr,
 labelEn,
 value: normalized || this.emptyValue(),
 direction,
 missing:!normalized,
 compact,
 localizeDigits
 };
 }

 private countMissing(rows: InfoRow[]): number {
 return rows.filter((row) => row.missing).length;
 }


 private buildOwnerPayload(data: OwnerData): {
 ownerName: string;
 ownerEmail: string;
 ownerPhone: string;
 idNumber?: string | null;
 nationality?: string | null;
 } {
 return {
 ownerName: data.ownerName.trim(),
 ownerEmail: data.ownerEmail.trim(),
 ownerPhone: data.ownerPhone.trim(),
 idNumber: this.nullIfEmpty(data.idNumber),
 nationality: this.nullIfEmpty(data.nationality)
 };
 }

 private buildLegalBankingPayload(data: LegalBankData): {
 commercialRegistrationNumber: string;
 commercialRegistrationExpiryDate?: string | null;
 taxId?: string | null;
 licenseNumber?: string | null;
 bankName: string;
 accountHolderName: string;
 iban: string;
 swiftCode?: string | null;
 payoutCycle?: string | null;
 commercialRegisterDocumentUrl?: string | null;
 taxDocumentUrl?: string | null;
 licenseDocumentUrl?: string | null;
 } {
 return {
 commercialRegistrationNumber: data.commercialRegistrationNumber.trim(),
 commercialRegistrationExpiryDate: this.nullIfEmpty(data.commercialRegistrationExpiryDate),
 taxId: this.nullIfEmpty(data.taxId),
 licenseNumber: this.nullIfEmpty(data.licenseNumber),
 bankName: data.bankName.trim(),
 accountHolderName: data.accountHolderName.trim(),
 iban: this.normalizeIban(data.iban),
 swiftCode: this.nullIfEmpty(data.swiftCode),
 payoutCycle: this.vendorDetail?.payoutCycle ?? null,
 commercialRegisterDocumentUrl: this.nullIfEmpty(data.commercialRegisterDocumentUrl),
 taxDocumentUrl: this.nullIfEmpty(data.taxDocumentUrl),
 licenseDocumentUrl: this.nullIfEmpty(data.licenseDocumentUrl)
 };
 }

 private buildStorePayload(data: StoreData): {
 businessNameAr: string;
 businessNameEn: string;
 businessType: string;
 contactEmail: string;
 contactPhone: string;
 descriptionAr?: string | null;
 descriptionEn?: string | null;
 logoUrl?: string | null;
 commercialRegisterDocumentUrl?: string | null;
 region?: string | null;
 city?: string | null;
 nationalAddress?: string | null;
 commercialRegistrationNumber?: string | null;
 } {
 return {
 businessNameAr: data.businessNameAr.trim(),
 businessNameEn: data.businessNameEn.trim(),
 businessType: data.businessType.trim(),
 contactEmail: data.contactEmail.trim(),
 contactPhone: data.contactPhone.trim(),
 descriptionAr: this.nullIfEmpty(data.descriptionAr),
 descriptionEn: this.nullIfEmpty(data.descriptionEn),
 logoUrl: this.nullIfEmpty(data.logoUrl),
 commercialRegisterDocumentUrl: this.nullIfEmpty(data.commercialRegisterDocumentUrl),
 region: this.nullIfEmpty(data.region),
 city: this.nullIfEmpty(data.city),
 nationalAddress: this.nullIfEmpty(data.nationalAddress),
 commercialRegistrationNumber: this.nullIfEmpty(data.commercialRegistrationNumber)
 };
 }

 private getDisplayDescription(vendor: VendorDetail): string {
 const preferred = this.currentLang === 'ar' ? vendor.descriptionAr : vendor.descriptionEn;
 const alternate = this.currentLang === 'ar' ? vendor.descriptionEn : vendor.descriptionAr;
 return preferred?.trim() || alternate?.trim() || this.text('ما فيه وصف تشغيلي متاح لهذا التاجر.', 'No operational description is available for this vendor.');
 }

 private getAccountStatusLabel(status?: string | null): string {
 const map: Record<string, string> = {
 Active: this.text('نشط', 'Active'),
 Pending: this.text('تحت المراجعة', 'Pending review'),
 Suspended: this.text('معلق', 'Suspended'),
 Rejected: this.text('مرفوض', 'Rejected')
 };

 return map[status || ''] || this.emptyValue();
 }

 private getVerificationLabel(verificationStatus: string): string {
 const map: Record<string, string> = {
 Verified: this.text('موثق', 'Verified'),
 Pending: this.text('قيد التحقق', 'Pending'),
 Unverified: this.text('غير موثق', 'Unverified')
 };

 return map[verificationStatus] || this.emptyValue();
 }

 private formatCompletion(value?: number | null): string {
 if (value === null || value === undefined) {
 return this.emptyValue();
 }

 const formatted = new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US').format(value);
 return `${formatted}%`;
 }

 private formatCount(value?: number | null): string {
 if (value === null || value === undefined) {
 return this.emptyValue();
 }

 return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US').format(value);
 }

 private resolveLastUpdate(vendor: VendorDetail): string {
 return vendor.updatedAtUtc
 || vendor.reviewCompletedAtUtc
 || vendor.requestedChangesAtUtc
 || vendor.reviewStartedAtUtc
 || vendor.createdAtUtc
 || '';
 }

 private formatDateValue(value?: string | null): string {
 if (!value) {
 return this.emptyValue();
 }

 const date = new Date(value);
 if (Number.isNaN(date.getTime())) {
 return value;
 }

 return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { timeZone: 'Asia/Riyadh',
 year: 'numeric',
 month: 'short',
 day: 'numeric'
 }).format(date);
 }

 private formatIbanForDisplay(iban: string): string {
 return (iban || '').replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
 }

 private normalizeIban(iban: string): string {
 const sanitized = (iban || '').replace(/\s+/g, '').toUpperCase();
 if (!sanitized) {
 return '';
 }

 return sanitized.startsWith('SA') ? sanitized : `SA${sanitized}`;
 }

 private nullIfEmpty(value?: string | null): string | null {
 const normalized = (value || '').trim();
 return normalized ? normalized : null;
 }

 private isExpiringSoon(value?: string | null): boolean {
 if (!value) {
 return false;
 }

 const expiry = new Date(value);
 const diff = expiry.getTime() - Date.now();
 return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 30;
 }

 private setFeedback(message: string, tone: FeedbackTone): void {
 this.feedbackMessage = message;
 this.feedbackTone = tone;
 }

 private clearFeedback(): void {
 this.feedbackMessage = '';
 }

 private text(arabic: string, english: string): string {
 return this.isRTL ? arabic : english;
 }

 private toArabicDigits(value: string): string {
 const arabicDigits = ['\u0660', '\u0661', '\u0662', '\u0663', '\u0664', '\u0665', '\u0666', '\u0667', '\u0668', '\u0669'];
 return value.replace(/\d/g, (digit) => arabicDigits[Number(digit)]);
 }

 private getLocalizedCity(city?: string | null): string {
 if (!city) {
 return this.emptyValue();
 }
 const clean = city.trim();
 const key = `COMMON.CITIES.${clean.toUpperCase()}`;
 const translated = this.translate.instant(key);
 return translated!== key ? translated : clean;
 }

 private getLocalizedRegion(region?: string | null): string {
 if (!region) {
 return this.emptyValue();
 }
 const clean = region.trim();
 const key = `COMMON.REGIONS.${clean.toUpperCase()}`;
 const translated = this.translate.instant(key);
 return translated!== key ? translated : clean;
 }

 private getLocalizedNationality(nationality?: string | null): string {
 if (!nationality) {
 return this.emptyValue();
 }
 const clean = nationality.trim();
 const key = `MODALS.OWNER_EDIT.NATIONALITIES.${clean.toUpperCase()}`;
 const translated = this.translate.instant(key);
 return translated!== key ? translated : clean;
 }

 private emptyValue(): string {
 return this.text('غير متوفر', 'Not available');
 }

 private downloadTextFile(fileName: string, content: string): void {
 const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
 const objectUrl = URL.createObjectURL(blob);
 const link = document.createElement('a');

 link.href = objectUrl;
 link.download = fileName;
 link.click();

 URL.revokeObjectURL(objectUrl);
 }
}
