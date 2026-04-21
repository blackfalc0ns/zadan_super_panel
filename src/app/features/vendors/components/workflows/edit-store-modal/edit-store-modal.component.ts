import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  selector: 'app-edit-store-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './edit-store-modal.component.html'
})
export class EditStoreModalComponent implements OnChanges {
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

  constructor(private translate: TranslateService) {}

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
      return this.text('الاسم التجاري بالعربية يجب ألا يتجاوز 200 حرف.', 'Arabic business name must not exceed 200 characters.');
    }

    if (!this.draftStoreData.businessNameEn.trim()) {
      return this.text('الاسم التجاري بالإنجليزية مطلوب.', 'English business name is required.');
    }

    if (this.draftStoreData.businessNameEn.trim().length > 200) {
      return this.text('الاسم التجاري بالإنجليزية يجب ألا يتجاوز 200 حرف.', 'English business name must not exceed 200 characters.');
    }

    if (!this.draftStoreData.businessType.trim()) {
      return this.text('نوع النشاط مطلوب.', 'Business type is required.');
    }

    if (this.draftStoreData.businessType.trim().length > 100) {
      return this.text('نوع النشاط يجب ألا يتجاوز 100 حرف.', 'Business type must not exceed 100 characters.');
    }

    if (!this.draftStoreData.contactEmail.trim()) {
      return this.text('بريد التواصل مطلوب.', 'Contact email is required.');
    }

    if (!this.isValidEmail(this.draftStoreData.contactEmail)) {
      return this.text('صيغة بريد التواصل غير صحيحة.', 'Contact email format is invalid.');
    }

    if (this.draftStoreData.contactEmail.trim().length > 256) {
      return this.text('بريد التواصل يجب ألا يتجاوز 256 حرفًا.', 'Contact email must not exceed 256 characters.');
    }

    if (!this.draftStoreData.contactPhone.trim()) {
      return this.text('رقم التواصل مطلوب.', 'Contact phone is required.');
    }

    if (this.draftStoreData.contactPhone.trim().length > 20) {
      return this.text('رقم التواصل يجب ألا يتجاوز 20 حرفًا.', 'Contact phone must not exceed 20 characters.');
    }

    if (this.draftStoreData.region.trim().length > 100) {
      return this.text('المنطقة يجب ألا تتجاوز 100 حرف.', 'Region must not exceed 100 characters.');
    }

    if (this.draftStoreData.city.trim().length > 100) {
      return this.text('المدينة يجب ألا تتجاوز 100 حرف.', 'City must not exceed 100 characters.');
    }

    if (this.draftStoreData.nationalAddress.trim().length > 500) {
      return this.text('العنوان الوطني يجب ألا يتجاوز 500 حرف.', 'National address must not exceed 500 characters.');
    }

    if (this.draftStoreData.commercialRegistrationNumber.trim().length > 50) {
      return this.text('رقم السجل التجاري يجب ألا يتجاوز 50 حرفًا.', 'Commercial registration number must not exceed 50 characters.');
    }

    return '';
  }

  get isFormValid(): boolean {
    return !this.validationMessage;
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

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  private text(arabic: string, english: string): string {
    return this.isRTL ? arabic : english;
  }
}
