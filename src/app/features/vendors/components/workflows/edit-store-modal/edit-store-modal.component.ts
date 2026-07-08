import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '../../../../catalog/services/catalog.api.service';
import { GeographyService, SaudiRegionDto, SaudiCityDto } from '../../../../../shared/services/geography.service';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../../shared/components/ui/form-controls/select/searchable-select.component';

export interface StoreData {
 businessNameAr: string;
 businessNameEn: string;
 businessType: string;
 contactEmail: string;
 contactPhone: string;
 descriptionAr: string;
 descriptionEn: string;
 logoUrl: string;
 commercialRegisterDocumentUrl: string;
 region: string;
 city: string;
 nationalAddress: string;
 commercialRegistrationNumber: string;
}

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-edit-store-modal',
 standalone: true,
 imports: [CommonModule, FormsModule, TranslateModule, SearchableSelectComponent],
 templateUrl: './edit-store-modal.component.html'
})
export class EditStoreModalComponent implements OnChanges {
 private readonly cdr = inject(ChangeDetectorRef);
 @Input() isOpen = false;
 @Input() isSaving = false;
 @Input() errorMessage = '';
 @Input() storeData: StoreData = {
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

 @Output() close = new EventEmitter<void>();
 @Output() save = new EventEmitter<StoreData>();

 isUploading: 'logo' | 'document' | null = null;

 businessTypeOptions: SearchableSelectOption[] = [
 { value: 'RETAIL', label: 'تجزئة - Retail' },
 { value: 'WHOLESALE', label: 'جملة - Wholesale' },
 { value: 'MANUFACTURER', label: 'تصنيع - Manufacturer' },
 { value: 'SERVICES', label: 'خدمات - Services' },
 { value: 'OTHER', label: 'أخرى - Other' }
 ];

 regionOptions: SearchableSelectOption[] = [];
 cityOptions: SearchableSelectOption[] = [];

 draftStoreData: StoreData = {
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

 constructor(
 private translate: TranslateService,
 private catalogService: CatalogService,
 private geographyService: GeographyService
 ) {
 this.loadRegions();
 }

 ngOnChanges(changes: SimpleChanges): void {
 if (changes['storeData']) {
 this.draftStoreData = {
 businessNameAr: this.storeData.businessNameAr || '',
 businessNameEn: this.storeData.businessNameEn || '',
 businessType: this.storeData.businessType || '',
 contactEmail: this.storeData.contactEmail || '',
 contactPhone: this.storeData.contactPhone || '',
 descriptionAr: this.storeData.descriptionAr || '',
 descriptionEn: this.storeData.descriptionEn || '',
 logoUrl: this.storeData.logoUrl || '',
 commercialRegisterDocumentUrl: this.storeData.commercialRegisterDocumentUrl || '',
 region: this.storeData.region || '',
 city: this.storeData.city || '',
 nationalAddress: this.storeData.nationalAddress || '',
 commercialRegistrationNumber: this.storeData.commercialRegistrationNumber || ''
 };

 if (this.draftStoreData.region) {
 this.loadCities(this.draftStoreData.region);
 }
 }
 }

 onRegionChange(value: string): void {
 this.draftStoreData.region = value;
 this.draftStoreData.city = '';
 this.cityOptions = [];
 if (value) {
 this.loadCities(value);
 }
 }

 get isRTL(): boolean {
 const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';
 return lang.startsWith('ar');
 }

 get validationMessage(): string {
 if (!this.draftStoreData.businessNameAr.trim()) {
 return this.text('الاسم التجاري بالعربية مطلوب.', 'Arabic business name is required.');
 }

 if (this.draftStoreData.businessNameAr.trim().length > 200) {
 return this.text('الاسم التجاري بالعربية لازم ما يتجاوز 200 حرف.', 'Arabic business name must not exceed 200 characters.');
 }

 if (!this.draftStoreData.businessNameEn.trim()) {
 return this.text('الاسم التجاري بالإنجليزية مطلوب.', 'English business name is required.');
 }

 if (this.draftStoreData.businessNameEn.trim().length > 200) {
 return this.text('الاسم التجاري بالإنجليزية لازم ما يتجاوز 200 حرف.', 'English business name must not exceed 200 characters.');
 }

 if (!this.draftStoreData.businessType.trim()) {
 return this.text('نوع النشاط مطلوب.', 'Business type is required.');
 }

 if (this.draftStoreData.businessType.trim().length > 100) {
 return this.text('نوع النشاط لازم ما يتجاوز 100 حرف.', 'Business type must not exceed 100 characters.');
 }

 if (!this.draftStoreData.contactEmail.trim()) {
 return this.text('بريد التواصل مطلوب.', 'Contact email is required.');
 }

 if (!this.isValidEmail(this.draftStoreData.contactEmail)) {
 return this.text('صيغة بريد التواصل غير صحيحة.', 'Contact email format is invalid.');
 }

 if (this.draftStoreData.contactEmail.trim().length > 256) {
 return this.text('بريد التواصل لازم ما يتجاوز 256 حرفًا.', 'Contact email must not exceed 256 characters.');
 }

 if (!this.draftStoreData.contactPhone.trim()) {
 return this.text('رقم التواصل مطلوب.', 'Contact phone is required.');
 }

 if (this.draftStoreData.contactPhone.trim().length > 20) {
 return this.text('رقم التواصل لازم ما يتجاوز 20 حرفًا.', 'Contact phone must not exceed 20 characters.');
 }

 if (this.draftStoreData.region.trim().length > 100) {
 return this.text('المنطقة لازم ما تتجاوز 100 حرف.', 'Region must not exceed 100 characters.');
 }

 if (this.draftStoreData.city.trim().length > 100) {
 return this.text('المدينة لازم ما تتجاوز 100 حرف.', 'City must not exceed 100 characters.');
 }

 if (this.draftStoreData.nationalAddress.trim().length > 500) {
 return this.text('العنوان الوطني لازم ما يتجاوز 500 حرف.', 'National address must not exceed 500 characters.');
 }

 if (this.draftStoreData.commercialRegistrationNumber.trim().length > 50) {
 return this.text('رقم السجل التجاري لازم ما يتجاوز 50 حرفًا.', 'Commercial registration number must not exceed 50 characters.');
 }

 return '';
 }

 get isFormValid(): boolean {
 return!this.validationMessage;
 }

 onClose(): void {
 if (this.isSaving) {
 return;
 }

 this.close.emit();
 }

 onSave(): void {
 if (!this.isFormValid || this.isSaving) {
 return;
 }

 this.save.emit({
 businessNameAr: this.draftStoreData.businessNameAr.trim(),
 businessNameEn: this.draftStoreData.businessNameEn.trim(),
 businessType: this.draftStoreData.businessType.trim(),
 contactEmail: this.draftStoreData.contactEmail.trim(),
 contactPhone: this.draftStoreData.contactPhone.trim(),
 descriptionAr: this.draftStoreData.descriptionAr.trim(),
 descriptionEn: this.draftStoreData.descriptionEn.trim(),
 logoUrl: this.draftStoreData.logoUrl.trim(),
 commercialRegisterDocumentUrl: this.draftStoreData.commercialRegisterDocumentUrl.trim(),
 region: this.draftStoreData.region.trim(),
 city: this.draftStoreData.city.trim(),
 nationalAddress: this.draftStoreData.nationalAddress.trim(),
 commercialRegistrationNumber: this.draftStoreData.commercialRegistrationNumber.trim()
 });
 }

 onBackdropClick(event: MouseEvent): void {
 if (!this.isSaving && event.target === event.currentTarget) {
 this.onClose();
 }
 }

 onLogoFileSelected(event: Event): void {
 const input = event.target as HTMLInputElement;
 const file = input.files?.[0];
 if (!file) return;

 this.isUploading = 'logo';
 this.catalogService.uploadFile(file, 'vendors/logos').subscribe({
 next: (result: { url: string }) => {
 this.cdr.markForCheck();
 this.draftStoreData.logoUrl = result.url;
 this.isUploading = null;
 },
 error: () => {
 this.cdr.markForCheck();
 this.isUploading = null;
 }
 });

 input.value = '';
 }

 onDocumentFileSelected(event: Event): void {
 const input = event.target as HTMLInputElement;
 const file = input.files?.[0];
 if (!file) return;

 this.isUploading = 'document';
 this.catalogService.uploadFile(file, 'vendors/documents').subscribe({
 next: (result: { url: string }) => {
 this.cdr.markForCheck();
 this.draftStoreData.commercialRegisterDocumentUrl = result.url;
 this.isUploading = null;
 },
 error: () => {
 this.cdr.markForCheck();
 this.isUploading = null;
 }
 });

 input.value = '';
 }

 private isValidEmail(value: string): boolean {
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
 }

 private loadRegions(): void {
 this.geographyService.getRegions().subscribe({
 next: (regions) => {
 this.cdr.markForCheck();
 this.regionOptions = regions.map((r) => ({
 value: r.code,
 label: `${r.nameAr} - ${r.nameEn}`
 }));
 }
 });
 }

 private loadCities(regionCode: string): void {
 this.geographyService.getCities(regionCode).subscribe({
 next: (cities) => {
 this.cdr.markForCheck();
 this.cityOptions = cities.map((c) => ({
 value: c.code,
 label: `${c.nameAr} - ${c.nameEn}`
 }));
 }
 });
 }

 private text(arabic: string, english: string): string {
 return this.isRTL ? arabic : english;
 }
}
