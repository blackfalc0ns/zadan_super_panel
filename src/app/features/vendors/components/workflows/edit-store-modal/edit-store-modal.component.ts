import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SearchableSelectComponent } from '../../../../../shared/components/ui/form-controls/select/searchable-select.component';

export interface StoreData {
  businessNameAr: string;
  businessNameEn: string;
  activityType: string;
  region: string;
  city: string;
  nationalAddress: string;
  commercialRegistrationNumber: string;
  registrationDate: string;
  descriptionAr: string;
  descriptionEn: string;
}

@Component({
  selector: 'app-edit-store-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SearchableSelectComponent],
  templateUrl: './edit-store-modal.component.html'
})
export class EditStoreModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() storeData: StoreData = {
    businessNameAr: '',
    businessNameEn: '',
    activityType: 'fashion',
    region: '',
    city: '',
    nationalAddress: '',
    commercialRegistrationNumber: '',
    registrationDate: '',
    descriptionAr: '',
    descriptionEn: ''
  };

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<StoreData>();

  draftStoreData: StoreData = {
    businessNameAr: '',
    businessNameEn: '',
    activityType: 'fashion',
    region: '',
    city: '',
    nationalAddress: '',
    commercialRegistrationNumber: '',
    registrationDate: '',
    descriptionAr: '',
    descriptionEn: ''
  };

  editReason = '';

  activityTypeOptions = [
    { value: 'fashion', labelKey: 'MODALS.STORE_EDIT.ACTIVITY_OPTIONS.FASHION' },
    { value: 'electronics', labelKey: 'MODALS.STORE_EDIT.ACTIVITY_OPTIONS.ELECTRONICS' },
    { value: 'food', labelKey: 'MODALS.STORE_EDIT.ACTIVITY_OPTIONS.FOOD' },
    { value: 'home', labelKey: 'MODALS.STORE_EDIT.ACTIVITY_OPTIONS.HOME' }
  ];

  constructor(private translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['storeData']) {
      this.draftStoreData = {
        businessNameAr: this.storeData.businessNameAr || '',
        businessNameEn: this.storeData.businessNameEn || '',
        activityType: this.storeData.activityType || 'fashion',
        region: this.storeData.region || '',
        city: this.storeData.city || '',
        nationalAddress: this.storeData.nationalAddress || '',
        commercialRegistrationNumber: this.storeData.commercialRegistrationNumber || '',
        registrationDate: this.storeData.registrationDate || '',
        descriptionAr: this.storeData.descriptionAr || '',
        descriptionEn: this.storeData.descriptionEn || ''
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
    this.save.emit(this.draftStoreData);
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
