import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { Category } from '@catalog/models/catalog.domain.models';
import { ToastService } from '@shared/services/toast.service';
import { buildSafeApiErrorLog, describeApiError } from '@shared/utils/api-error.util';

import { AppInputComponent } from '../../../../shared/components/ui/form-controls/input/input.component';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-category-form-modal',
    standalone: true,
    imports: [
        CommonModule, 
        ReactiveFormsModule, 
        TranslateModule,
        AppInputComponent,
        ModalShellComponent
    ],
    templateUrl: './category-form-modal.component.html',
    styleUrl: './category-form-modal.component.scss'
})
export class CategoryFormModalComponent implements OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);
    @Input() isOpen = false;
    @Input() mode: 'create' | 'edit' = 'create';
    @Input() levelNameKey = '';
    @Input() initialData: Partial<Category> | null = null;
    @Input() parentCategory: { id: string | null, nameAr: string, nameEn: string } | null = null;
    
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<Category>();

    form: FormGroup;
    activeInputLang: 'ar' | 'en' = 'ar';
    isUploading = false;
    isSaving = false;
    saveErrorMessage: string | null = null;

    constructor(
        private fb: FormBuilder, 
        private catalogService: CatalogService,
        public translate: TranslateService,
        private toastService: ToastService
    ) {
        this.form = this.fb.group({
            id: [''],
            nameAr: ['', [Validators.required, Validators.minLength(2)]],
            nameEn: ['', [Validators.required, Validators.minLength(2)]],
            imageUrl: [''],
            parentCategoryId: [null],
            displayOrder: [1, [Validators.required, Validators.min(0)]],
            isActive: [true]
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.isOpen && (changes['isOpen'] || changes['initialData'] || changes['mode'])) {
            if (this.mode === 'edit' && this.initialData) {
                this.form.patchValue(this.initialData);
            } else if (this.mode === 'create') {
                this.resetForm();
                if (this.parentCategory) {
                    this.form.patchValue({ parentCategoryId: this.parentCategory.id });
                }
                this.autoCalculateOrder();
            }
        }

        if (changes['isOpen'] && !changes['isOpen'].currentValue) {
            this.resetForm();
        }
    }

    private resetForm() {
        this.saveErrorMessage = null;
        this.isSaving = false;
        this.form.reset({
            displayOrder: 1,
            isActive: true,
            parentCategoryId: this.parentCategory ? this.parentCategory.id : null
        });
    }

    private autoCalculateOrder() {
        const parentId = this.parentCategory?.id || undefined;
        this.catalogService.getCategories(parentId).subscribe(categories => {
      this.cdr.markForCheck();
            if (categories && categories.length > 0) {
                const maxOrder = Math.max(...categories.map(c => c.displayOrder || 0));
                this.form.patchValue({ displayOrder: maxOrder + 1 });
            } else {
                this.form.patchValue({ displayOrder: 1 });
            }
        });
    }

    onSubmit() {
        if (this.isSaving || this.isUploading) {
            return;
        }

        this.saveErrorMessage = null;

        if (this.form.valid) {
            this.isSaving = true;
            const data = this.form.value;
            const successKey = this.mode === 'create' ? 'CATEGORIES.SAVE_CREATED' : 'CATEGORIES.SAVE_UPDATED';
            
            if (this.mode === 'create') {
                this.catalogService.createCategory(data).subscribe({
                    next: (result: Category) => {
        this.cdr.markForCheck();
                        this.isSaving = false;
                        this.toastService.success(
                            this.translate.instant(successKey),
                            this.translate.instant('CATEGORIES.TOAST_TITLE')
                        );
                        this.saved.emit(result);
                        this.onClose();
                    },
                    error: (err: unknown) => {
        this.cdr.markForCheck();
                        console.error('Category create failed:', buildSafeApiErrorLog(err));
                        this.saveErrorMessage = describeApiError(err, this.translate, { fallbackKey: 'CATEGORIES.SAVE_FAILED', codePrefix: 'CATEGORIES.ERROR_CODES' });
                        this.toastService.error(this.saveErrorMessage, this.translate.instant('CATEGORIES.TOAST_TITLE'));
                        this.isSaving = false;
                    }
                });
            } else {
                this.catalogService.updateCategory(data.id, data).subscribe({
                    next: () => {
        this.cdr.markForCheck();
                        this.isSaving = false;
                        this.toastService.success(
                            this.translate.instant(successKey),
                            this.translate.instant('CATEGORIES.TOAST_TITLE')
                        );
                        this.saved.emit(data as Category);
                        this.onClose();
                    },
                    error: (err: unknown) => {
        this.cdr.markForCheck();
                        console.error('Category update failed:', buildSafeApiErrorLog(err));
                        this.saveErrorMessage = describeApiError(err, this.translate, { fallbackKey: 'CATEGORIES.SAVE_FAILED', codePrefix: 'CATEGORIES.ERROR_CODES' });
                        this.toastService.error(this.saveErrorMessage, this.translate.instant('CATEGORIES.TOAST_TITLE'));
                        this.isSaving = false;
                    }
                });
            }
        } else {
            this.form.markAllAsTouched();
            if (this.form.get('nameAr')?.invalid) {
                this.activeInputLang = 'ar';
            } else if (this.form.get('nameEn')?.invalid) {
                this.activeInputLang = 'en';
            }
        }
    }

    onClose() {
        this.close.emit();
    }

    setLang(lang: 'ar' | 'en') {
        this.activeInputLang = lang;
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        this.isUploading = true;
        this.catalogService.uploadFile(file, 'uploads/catalog/categories').subscribe({
            next: (res) => {
        this.cdr.markForCheck();
                this.form.patchValue({ imageUrl: res.url });
                this.isUploading = false;
            },
            error: (err) => {
        this.cdr.markForCheck();
                console.error('Category image upload failed:', buildSafeApiErrorLog(err));
                const message = describeApiError(err, this.translate, { fallbackKey: 'CATEGORIES.UPLOAD_FAILED', codePrefix: 'CATEGORIES.ERROR_CODES' });
                this.saveErrorMessage = message;
                this.toastService.error(message, this.translate.instant('CATEGORIES.TOAST_TITLE'));
                this.isUploading = false;
            }
        });
    }

}


