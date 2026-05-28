import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '../../../../catalog/services/catalog.api.service';
import { SearchableSelectComponent } from '../../../../../shared/components/ui/form-controls/select/searchable-select.component';

export interface LegalBankData {
  commercialRegistrationNumber: string;
  commercialRegistrationExpiryDate: string;
  taxId: string;
  licenseNumber: string;
  bankName: string;
  accountHolderName: string;
  iban: string;
  swiftCode: string;
  commercialRegisterDocumentUrl: string;
  taxDocumentUrl: string;
  licenseDocumentUrl: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-edit-legal-bank-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SearchableSelectComponent],
  templateUrl: './edit-legal-bank-modal.component.html'
})
export class EditLegalBankModalComponent implements OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() errorMessage = '';
  @Input() legalBankData: LegalBankData = {
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

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<LegalBankData>();

  isUploading: 'cr' | 'tax' | 'license' | null = null;

  bankOptions = [
    { value: 'الراجحي', label: 'مصرف الراجحي - Al Rajhi Bank' },
    { value: 'الأهلي', label: 'البنك الأهلي السعودي - SNB' },
    { value: 'الإنماء', label: 'مصرف الإنماء - Alinma Bank' },
    { value: 'الرياض', label: 'بنك الرياض - Riyad Bank' },
    { value: 'ساب', label: 'بنك ساب - SABB' },
    { value: 'الفرنسي', label: 'البنك السعودي الفرنسي - Banque Saudi Fransi' },
    { value: 'العربي', label: 'البنك العربي الوطني - ANB' },
    { value: 'البلاد', label: 'بنك البلاد - Bank Albilad' },
    { value: 'الجزيرة', label: 'بنك الجزيرة - Bank AlJazira' },
    { value: 'الاستثمار', label: 'البنك السعودي للاستثمار - SAIB' }
  ];

  draftLegalBankData: LegalBankData = {
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

  constructor(
    private translate: TranslateService,
    private catalogService: CatalogService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['legalBankData']) {
      this.draftLegalBankData = {
        commercialRegistrationNumber: this.legalBankData.commercialRegistrationNumber || '',
        commercialRegistrationExpiryDate: this.toDateInputValue(this.legalBankData.commercialRegistrationExpiryDate),
        taxId: this.legalBankData.taxId || '',
        licenseNumber: this.legalBankData.licenseNumber || '',
        bankName: this.legalBankData.bankName || '',
        accountHolderName: this.legalBankData.accountHolderName || '',
        iban: this.formatIbanForDisplay(this.legalBankData.iban || ''),
        swiftCode: this.legalBankData.swiftCode || '',
        commercialRegisterDocumentUrl: this.legalBankData.commercialRegisterDocumentUrl || '',
        taxDocumentUrl: this.legalBankData.taxDocumentUrl || '',
        licenseDocumentUrl: this.legalBankData.licenseDocumentUrl || ''
      };
    }
  }

  get isRTL(): boolean {
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';
    return lang.startsWith('ar');
  }

  get validationMessage(): string {
    if (!this.draftLegalBankData.commercialRegistrationNumber.trim()) {
      return this.text('رقم السجل التجاري مطلوب.', 'Commercial registration number is required.');
    }

    if (this.draftLegalBankData.commercialRegistrationNumber.trim().length > 50) {
      return this.text('رقم السجل التجاري يجب ألا يتجاوز 50 حرفًا.', 'Commercial registration number must not exceed 50 characters.');
    }

    if (this.draftLegalBankData.taxId.trim().length > 50) {
      return this.text('الرقم الضريبي يجب ألا يتجاوز 50 حرفًا.', 'Tax ID must not exceed 50 characters.');
    }

    if (this.draftLegalBankData.licenseNumber.trim().length > 100) {
      return this.text('رقم الرخصة يجب ألا يتجاوز 100 حرف.', 'License number must not exceed 100 characters.');
    }

    if (!this.draftLegalBankData.bankName.trim()) {
      return this.text('اسم البنك مطلوب.', 'Bank name is required.');
    }

    if (this.draftLegalBankData.bankName.trim().length > 200) {
      return this.text('اسم البنك يجب ألا يتجاوز 200 حرف.', 'Bank name must not exceed 200 characters.');
    }

    if (!this.draftLegalBankData.accountHolderName.trim()) {
      return this.text('اسم صاحب الحساب مطلوب.', 'Account holder name is required.');
    }

    if (this.draftLegalBankData.accountHolderName.trim().length > 200) {
      return this.text('اسم صاحب الحساب يجب ألا يتجاوز 200 حرف.', 'Account holder name must not exceed 200 characters.');
    }

    const normalizedIban = this.normalizeIban(this.draftLegalBankData.iban);
    if (!normalizedIban) {
      return this.text('رقم IBAN مطلوب.', 'IBAN is required.');
    }

    if (normalizedIban.length > 34) {
      return this.text('رقم IBAN يجب ألا يتجاوز 34 حرفًا.', 'IBAN must not exceed 34 characters.');
    }

    if (this.draftLegalBankData.swiftCode.trim().length > 11) {
      return this.text('رمز SWIFT يجب ألا يتجاوز 11 حرفًا.', 'SWIFT code must not exceed 11 characters.');
    }

    return '';
  }

  get isFormValid(): boolean {
    return !this.validationMessage;
  }

  onClose(): void {
    if (!this.isSaving) {
      this.close.emit();
    }
  }

  onSave(): void {
    if (!this.isFormValid || this.isSaving) {
      return;
    }

    this.save.emit({
      ...this.draftLegalBankData,
      commercialRegistrationNumber: this.draftLegalBankData.commercialRegistrationNumber.trim(),
      commercialRegistrationExpiryDate: this.draftLegalBankData.commercialRegistrationExpiryDate.trim(),
      taxId: this.draftLegalBankData.taxId.trim(),
      licenseNumber: this.draftLegalBankData.licenseNumber.trim(),
      bankName: this.draftLegalBankData.bankName.trim(),
      accountHolderName: this.draftLegalBankData.accountHolderName.trim(),
      iban: this.normalizeIban(this.draftLegalBankData.iban),
      swiftCode: this.draftLegalBankData.swiftCode.trim(),
      commercialRegisterDocumentUrl: this.draftLegalBankData.commercialRegisterDocumentUrl.trim(),
      taxDocumentUrl: this.draftLegalBankData.taxDocumentUrl.trim(),
      licenseDocumentUrl: this.draftLegalBankData.licenseDocumentUrl.trim()
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if (!this.isSaving && event.target === event.currentTarget) {
      this.onClose();
    }
  }

  copyIban(): void {
    navigator.clipboard.writeText(this.normalizeIban(this.draftLegalBankData.iban));
  }

  onCrFileSelected(event: Event): void {
    this.uploadFile(event, 'cr', (url) => this.draftLegalBankData.commercialRegisterDocumentUrl = url);
  }

  onTaxFileSelected(event: Event): void {
    this.uploadFile(event, 'tax', (url) => this.draftLegalBankData.taxDocumentUrl = url);
  }

  onLicenseFileSelected(event: Event): void {
    this.uploadFile(event, 'license', (url) => this.draftLegalBankData.licenseDocumentUrl = url);
  }

  private uploadFile(event: Event, type: 'cr' | 'tax' | 'license', onSuccess: (url: string) => void): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploading = type;
    this.catalogService.uploadFile(file, 'vendors/documents').subscribe({
      next: (result: { url: string }) => {
        this.cdr.markForCheck();
        onSuccess(result.url);
        this.isUploading = null;
      },
      error: () => {
        this.cdr.markForCheck();
        this.isUploading = null;
      }
    });

    input.value = '';
  }

  private normalizeIban(value: string): string {
    const sanitized = (value || '').replace(/\s+/g, '').toUpperCase();
    if (!sanitized) {
      return '';
    }

    return sanitized.startsWith('SA') ? sanitized : `SA${sanitized}`;
  }

  private toDateInputValue(value?: string | null): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
  }

  private formatIbanForDisplay(iban: string): string {
    return (iban || '').replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
  }

  private text(arabic: string, english: string): string {
    return this.isRTL ? arabic : english;
  }
}
