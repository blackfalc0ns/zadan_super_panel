import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SearchableSelectComponent } from '../../../../../shared/components/ui/form-controls/select/searchable-select.component';

export interface OwnerData {
 ownerName: string;
 ownerEmail: string;
 ownerPhone: string;
 idNumber: string;
 nationality: string;
}

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-edit-owner-modal',
 standalone: true,
 imports: [CommonModule, FormsModule, TranslateModule, SearchableSelectComponent],
 templateUrl: './edit-owner-modal.component.html',
 styles: [`.modal-backdrop {
 backdrop-filter: blur(8px);
 }
 `]
})
export class EditOwnerModalComponent implements OnChanges {
 @Input() isOpen = false;
 @Input() isSaving = false;
 @Input() errorMessage = '';
 @Input() ownerData: OwnerData = {
 ownerName: '',
 ownerEmail: '',
 ownerPhone: '',
 idNumber: '',
 nationality: ''
 };

 @Output() close = new EventEmitter<void>();
 @Output() save = new EventEmitter<OwnerData>();

 draftOwnerData: OwnerData = {
 ownerName: '',
 ownerEmail: '',
 ownerPhone: '',
 idNumber: '',
 nationality: ''
 };

 nationalityOptions = [
 { value: 'Saudi', label: 'سعودي - Saudi' },
 { value: 'Kuwaiti', label: 'كويتي - Kuwaiti' },
 { value: 'Emirati', label: 'إماراتي - Emirati' },
 { value: 'Bahraini', label: 'بحريني - Bahraini' },
 { value: 'Omani', label: 'عماني - Omani' },
 { value: 'Qatari', label: 'قطري - Qatari' },
 { value: 'Egyptian', label: 'مصري - Egyptian' },
 { value: 'Jordanian', label: 'أردني - Jordanian' },
 { value: 'Syrian', label: 'سوري - Syrian' },
 { value: 'Yemeni', label: 'يمني - Yemeni' },
 { value: 'Pakistani', label: 'باكستاني - Pakistani' },
 { value: 'Indian', label: 'هندي - Indian' },
 { value: 'Other', label: 'أخرى - Other' }
 ];

 constructor(private translate: TranslateService) {}

 ngOnChanges(changes: SimpleChanges): void {
 if (changes['ownerData']) {
 this.draftOwnerData = {
 ownerName: this.ownerData.ownerName || '',
 ownerEmail: this.ownerData.ownerEmail || '',
 ownerPhone: this.ownerData.ownerPhone || '',
 idNumber: this.ownerData.idNumber || '',
 nationality: this.normalizeNationality(this.ownerData.nationality || '')
 };
 }
 }

 get isRTL(): boolean {
 const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';
 return lang.startsWith('ar');
 }

 get validationMessage(): string {
 if (!this.draftOwnerData.ownerName.trim()) {
 return this.text('اسم المالك مطلوب.', 'Owner name is required.');
 }

 if (!this.draftOwnerData.ownerEmail.trim()) {
 return this.text('البريد الإلكتروني مطلوب.', 'Owner email is required.');
 }

 if (!this.isValidEmail(this.draftOwnerData.ownerEmail)) {
 return this.text('صيغة البريد الإلكتروني غير صحيحة.', 'Owner email format is invalid.');
 }

 if (!this.draftOwnerData.ownerPhone.trim()) {
 return this.text('رقم الجوال مطلوب.', 'Owner phone is required.');
 }

 if (this.draftOwnerData.ownerPhone.trim().length > 20) {
 return this.text('رقم الجوال لازم ما يتجاوز 20 حرفًا.', 'Owner phone must not exceed 20 characters.');
 }

 if (this.draftOwnerData.idNumber.trim().length > 50) {
 return this.text('رقم الهوية لازم ما يتجاوز 50 حرفًا.', 'ID number must not exceed 50 characters.');
 }

 if (this.draftOwnerData.nationality.trim().length > 100) {
 return this.text('الجنسية لازم ما تتجاوز 100 حرف.', 'Nationality must not exceed 100 characters.');
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
 ownerName: this.draftOwnerData.ownerName.trim(),
 ownerEmail: this.draftOwnerData.ownerEmail.trim(),
 ownerPhone: this.draftOwnerData.ownerPhone.trim(),
 idNumber: this.draftOwnerData.idNumber.trim(),
 nationality: this.draftOwnerData.nationality.trim()
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

 private normalizeNationality(value: string): string {
 if (!value) return '';
 const lower = value.trim().toLowerCase();
 const match = this.nationalityOptions.find(
 (opt) => opt.value.toLowerCase() === lower
 );
 return match ? match.value : value;
 }

 private text(arabic: string, english: string): string {
 return this.isRTL ? arabic : english;
 }
}
