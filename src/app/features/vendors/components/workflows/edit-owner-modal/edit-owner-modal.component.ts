import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SearchableSelectComponent } from '../../../../../shared/components/ui/form-controls/select/searchable-select.component';

export interface OwnerData {
  fullName: string;
  idNumber: string;
  nationality: string;
  email: string;
  phone: string;
  phoneCode: string;
}

@Component({
  selector: 'app-edit-owner-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SearchableSelectComponent],
  templateUrl: './edit-owner-modal.component.html',
  styles: [`
    .modal-backdrop {
      backdrop-filter: blur(8px);
    }
  `]
})
export class EditOwnerModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() ownerData: OwnerData = {
    fullName: '',
    idNumber: '',
    nationality: 'MODALS.OWNER_EDIT.NATIONALITIES.SAUDI',
    email: '',
    phone: '',
    phoneCode: '+966'
  };

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<OwnerData>();

  draftOwnerData: OwnerData = {
    fullName: '',
    idNumber: '',
    nationality: 'MODALS.OWNER_EDIT.NATIONALITIES.SAUDI',
    email: '',
    phone: '',
    phoneCode: '+966'
  };

  editReason = '';
  adminNotes = '';

  nationalityOptions = [
    { value: 'MODALS.OWNER_EDIT.NATIONALITIES.SAUDI', labelKey: 'MODALS.OWNER_EDIT.NATIONALITIES.SAUDI' },
    { value: 'MODALS.OWNER_EDIT.NATIONALITIES.KUWAITI', labelKey: 'MODALS.OWNER_EDIT.NATIONALITIES.KUWAITI' },
    { value: 'MODALS.OWNER_EDIT.NATIONALITIES.EMIRATI', labelKey: 'MODALS.OWNER_EDIT.NATIONALITIES.EMIRATI' },
    { value: 'MODALS.OWNER_EDIT.NATIONALITIES.BAHRAINI', labelKey: 'MODALS.OWNER_EDIT.NATIONALITIES.BAHRAINI' },
    { value: 'MODALS.OWNER_EDIT.NATIONALITIES.OMANI', labelKey: 'MODALS.OWNER_EDIT.NATIONALITIES.OMANI' },
    { value: 'MODALS.OWNER_EDIT.NATIONALITIES.QATARI', labelKey: 'MODALS.OWNER_EDIT.NATIONALITIES.QATARI' }
  ];
  phoneCodeOptions = ['+966', '+971', '+965', '+973', '+968', '+974'].map((code) => ({ value: code, label: code }));
  reasonOptions = [
    { value: 'MODALS.OWNER_EDIT.REASONS.ROUTINE_UPDATE', labelKey: 'MODALS.OWNER_EDIT.REASONS.ROUTINE_UPDATE' },
    { value: 'MODALS.OWNER_EDIT.REASONS.CLIENT_REQUEST', labelKey: 'MODALS.OWNER_EDIT.REASONS.CLIENT_REQUEST' },
    { value: 'MODALS.OWNER_EDIT.REASONS.TYPO_FIX', labelKey: 'MODALS.OWNER_EDIT.REASONS.TYPO_FIX' },
    { value: 'MODALS.OWNER_EDIT.REASONS.CONTACT_UPDATE', labelKey: 'MODALS.OWNER_EDIT.REASONS.CONTACT_UPDATE' }
  ];

  constructor(private translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ownerData']) {
      this.draftOwnerData = {
        fullName: this.ownerData.fullName || '',
        idNumber: this.ownerData.idNumber || '',
        nationality: this.ownerData.nationality || 'MODALS.OWNER_EDIT.NATIONALITIES.SAUDI',
        email: this.ownerData.email || '',
        phone: this.ownerData.phone || '',
        phoneCode: this.ownerData.phoneCode || '+966'
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
    this.save.emit(this.draftOwnerData);
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
