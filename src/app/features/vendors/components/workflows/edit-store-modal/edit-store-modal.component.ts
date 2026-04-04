import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface StoreData {
  storeName: string;
  activityType: string;
  city: string;
  nationalAddress: string;
  crNumber: string;
  registrationDate: string;
  description: string;
}

@Component({
  selector: 'app-edit-store-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './edit-store-modal.component.html'
})
export class EditStoreModalComponent {
  @Input() isOpen = false;
  @Input() storeData: StoreData = {
    storeName: 'متجر الأناقة العربية',
    activityType: 'fashion',
    city: 'الرياض',
    nationalAddress: '8228 طريق الملك فهد - حي العليا',
    crNumber: '1010123456',
    registrationDate: '15 مايو 2023',
    description: 'متجر متخصص في بيع الملابس العربية التقليدية والحديثة بجودة عالية وأسعار منافسة.'
  };

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<StoreData>();

  editReason = '';

  activityTypeOptions = [
    { value: 'fashion', label: 'MODALS.STORE_EDIT.ACTIVITY_OPTIONS.FASHION' },
    { value: 'electronics', label: 'MODALS.STORE_EDIT.ACTIVITY_OPTIONS.ELECTRONICS' },
    { value: 'food', label: 'MODALS.STORE_EDIT.ACTIVITY_OPTIONS.FOOD' },
    { value: 'home', label: 'MODALS.STORE_EDIT.ACTIVITY_OPTIONS.HOME' }
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
    this.save.emit(this.storeData);
    this.onClose();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
