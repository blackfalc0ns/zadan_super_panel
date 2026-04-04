import { Component, Input, Output, EventEmitter } from '@angular/core';
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
export class EditLegalBankModalComponent {
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

  get isRTL(): boolean {
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';
    return lang.startsWith('ar');
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.save.emit(this.legalBankData);
    this.onClose();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  copyIban() {
    const fullIban = 'SA' + this.legalBankData.iban.replace(/\s/g, '');
    navigator.clipboard.writeText(fullIban);
    // Ideally add a toast here via a service
  }
}
