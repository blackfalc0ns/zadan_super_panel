import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '../../../../core/services/catalog.service';
import { Category } from '../../../../core/models/catalog.model';

import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppInputComponent } from '../../../../shared/components/ui/form-controls/input.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppTextareaComponent } from '../../../../shared/components/ui/form-controls/textarea.component';

@Component({
    selector: 'app-category-form-modal',
    standalone: true,
    imports: [
        CommonModule, 
        ReactiveFormsModule, 
        TranslateModule,
        AppButtonComponent,
        AppInputComponent,
        AppCardComponent,
        AppTextareaComponent
    ],
    templateUrl: './category-form-modal.component.html',
    styleUrl: './category-form-modal.component.scss'
})
export class CategoryFormModalComponent implements OnChanges {
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

    constructor(
        private fb: FormBuilder, 
        private catalogService: CatalogService,
        public translate: TranslateService
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
        this.form.reset({
            displayOrder: 1,
            isActive: true,
            parentCategoryId: this.parentCategory ? this.parentCategory.id : null
        });
    }

    private autoCalculateOrder() {
        const parentId = this.parentCategory?.id || undefined;
        this.catalogService.getCategories(parentId).subscribe(categories => {
            if (categories && categories.length > 0) {
                const maxOrder = Math.max(...categories.map(c => c.displayOrder || 0));
                this.form.patchValue({ displayOrder: maxOrder + 1 });
            } else {
                this.form.patchValue({ displayOrder: 1 });
            }
        });
    }

    onSubmit() {
        if (this.form.valid) {
            this.isSaving = true;
            const data = this.form.value;
            
            if (this.mode === 'create') {
                this.catalogService.createCategory(data).subscribe({
                    next: (result: Category) => {
                        this.isSaving = false;
                        this.saved.emit(result);
                        this.onClose();
                    },
                    error: (err: any) => {
                        console.error('Create failed:', err);
                        this.isSaving = false;
                    }
                });
            } else {
                this.catalogService.updateCategory(data.id, data).subscribe({
                    next: () => {
                        this.isSaving = false;
                        this.saved.emit(data as Category);
                        this.onClose();
                    },
                    error: (err: any) => {
                        console.error('Update failed:', err);
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
        this.catalogService.uploadFile(file, 'categories').subscribe({
            next: (res) => {
                this.form.patchValue({ imageUrl: res.url });
                this.isUploading = false;
            },
            error: (err) => {
                console.error('Upload failed:', err);
                this.isUploading = false;
            }
        });
    }
}
