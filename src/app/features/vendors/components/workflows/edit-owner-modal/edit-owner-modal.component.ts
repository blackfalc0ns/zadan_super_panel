import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class EditOwnerModalComponent {
  @Input() isOpen = false;
  @Input() ownerData: OwnerData = {
    fullName: 'عبدالله بن خالد بن عبدالعزيز',
    idNumber: '10****4321',
    nationality: 'MODALS.OWNER_EDIT.NATIONALITIES.SAUDI',
    email: 'info@moderntech.com',
    phone: '50 123 4567',
    phoneCode: '+966'
  };

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<OwnerData>();

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

  get isRTL(): boolean {
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';
    return lang.startsWith('ar');
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.save.emit(this.ownerData);
    this.onClose();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
