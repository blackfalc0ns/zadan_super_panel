import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  imports: [CommonModule, FormsModule, TranslateModule],
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
    'MODALS.OWNER_EDIT.NATIONALITIES.SAUDI',
    'MODALS.OWNER_EDIT.NATIONALITIES.KUWAITI',
    'MODALS.OWNER_EDIT.NATIONALITIES.EMIRATI',
    'MODALS.OWNER_EDIT.NATIONALITIES.BAHRAINI',
    'MODALS.OWNER_EDIT.NATIONALITIES.OMANI',
    'MODALS.OWNER_EDIT.NATIONALITIES.QATARI'
  ];
  phoneCodeOptions = ['+966', '+971', '+965', '+973', '+968', '+974'];
  reasonOptions = [
    'MODALS.OWNER_EDIT.REASONS.ROUTINE_UPDATE',
    'MODALS.OWNER_EDIT.REASONS.CLIENT_REQUEST',
    'MODALS.OWNER_EDIT.REASONS.TYPO_FIX',
    'MODALS.OWNER_EDIT.REASONS.CONTACT_UPDATE'
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
