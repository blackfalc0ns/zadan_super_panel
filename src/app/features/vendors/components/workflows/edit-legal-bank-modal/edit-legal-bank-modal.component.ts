import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface LegalBankData {
  commercialRegister: string;
  taxNumber: string;
  expiryDate: string;
  bankName: string;
  paymentCycle: string;
  iban: string;
}

@Component({
  selector: 'app-edit-legal-bank-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './edit-legal-bank-modal.component.html'
})
export class EditLegalBankModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() legalBankData: LegalBankData = {
    commercialRegister: '',
    taxNumber: '',
    expiryDate: '',
    bankName: '',
    paymentCycle: '',
    iban: ''
  };

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<LegalBankData>();

  draftLegalBankData: LegalBankData = {
    commercialRegister: '',
    taxNumber: '',
    expiryDate: '',
    bankName: '',
    paymentCycle: '',
    iban: ''
  };

  bankOptions = [
    { value: 'alrajhi', label: 'MODALS.LEGAL_BANK_EDIT.BANKS.ALRAJHI' },
    { value: 'alahli', label: 'MODALS.LEGAL_BANK_EDIT.BANKS.ALAHLI' },
    { value: 'inma', label: 'MODALS.LEGAL_BANK_EDIT.BANKS.INMA' },
    { value: 'alinma', label: 'MODALS.LEGAL_BANK_EDIT.BANKS.ALINMA' }
  ];

  paymentCycleOptions = [
    { value: 'weekly' },
    { value: 'biweekly' },
    { value: 'monthly' }
  ];

  constructor(private translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['legalBankData']) {
      this.draftLegalBankData = {
        commercialRegister: this.legalBankData.commercialRegister || '',
        taxNumber: this.legalBankData.taxNumber || '',
        expiryDate: this.legalBankData.expiryDate || '',
        bankName: this.legalBankData.bankName || '',
        paymentCycle: this.legalBankData.paymentCycle || '',
        iban: this.legalBankData.iban || ''
      };
    }
  }

  get isRTL(): boolean {
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';
    return lang.startsWith('ar');
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.save.emit({
      ...this.draftLegalBankData,
      iban: this.normalizeIban(this.draftLegalBankData.iban)
    });
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  copyIban() {
    navigator.clipboard.writeText(this.normalizeIban(this.draftLegalBankData.iban));
    // Ideally add a toast here via a service
  }

  private normalizeIban(value: string): string {
    const sanitized = (value || '').replace(/\s+/g, '').toUpperCase();
    if (!sanitized) {
      return '';
    }

    return sanitized.startsWith('SA') ? sanitized : `SA${sanitized}`;
  }
}
