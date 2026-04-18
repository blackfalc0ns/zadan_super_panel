import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { Brand, Category } from '@catalog/models/catalog.domain.models';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppInputComponent } from '../../../../shared/components/ui/form-controls/input/input.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';

@Component({
  selector: 'app-brand-form-modal',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TranslateModule,
    AppButtonComponent,
    AppInputComponent,
    SearchableSelectComponent,
    ModalShellComponent
  ],
  templateUrl: './brand-form-modal.component.html',
  styleUrl: './brand-form-modal.component.scss'
})
export class BrandFormModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() brand: Brand | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  isSaving = false;
  isUploading = false;
  activeInputLang: 'ar' | 'en' = 'ar';
  leafCategories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private catalogService: CatalogService,
    public translate: TranslateService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadLeafCategories();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['brand']) {
      if (this.mode === 'edit' && this.brand) {
        this.form.patchValue({
          ...this.brand,
          categoryId: this.brand.categoryId ?? null
        });
      } else {
        this.form.reset({ isActive: true, categoryId: null });
      }
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      nameAr: ['', [Validators.required, Validators.maxLength(100)]],
      nameEn: ['', [Validators.required, Validators.maxLength(100)]],
      logoUrl: [''],
      categoryId: [null, [Validators.required]],
      isActive: [true]
    });
  }

  loadLeafCategories(): void {
    this.catalogService.getCategories(undefined, true).subscribe({
      next: (categories) => {
        this.leafCategories = this.flattenLeafCategories(categories ?? []);
      },
      error: (err) => {
        console.error('Failed to load brand categories', err);
        this.leafCategories = [];
      }
    });
  }

  setLang(lang: 'ar' | 'en'): void {
    this.activeInputLang = lang;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.catalogService.uploadFile(file, 'brands').subscribe({
        next: (res) => {
          this.form.patchValue({ logoUrl: res.url });
          this.isUploading = false;
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.isUploading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const payload = this.form.value;

    if (this.mode === 'create') {
      this.catalogService.createBrand(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.saved.emit();
          this.onClose();
        },
        error: (err: unknown) => {
          console.error('Save failed', err);
          this.isSaving = false;
        }
      });
      return;
    }

    this.catalogService.updateBrand(payload.id, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit();
        this.onClose();
      },
      error: (err: unknown) => {
        console.error('Save failed', err);
        this.isSaving = false;
      }
    });
  }

  onClose(): void {
    this.form.reset({ isActive: true, categoryId: null });
    this.close.emit();
  }

  getLocalizedCategoryName(category: Category): string {
    return this.translate.currentLang === 'ar' ? category.nameAr : category.nameEn;
  }

  get leafCategoryOptions(): SearchableSelectOption<string | null>[] {
    return [
      { value: null, labelKey: 'BRANDS.MODAL.SELECT_SUB_CATEGORY_PLACEHOLDER' },
      ...this.leafCategories.map((category) => ({
        value: category.id,
        label: this.getLocalizedCategoryName(category)
      }))
    ];
  }

  private flattenLeafCategories(categories: Category[]): Category[] {
    const subCategories: Category[] = [];

    for (const category of categories) {
      const children = category.subCategories ?? [];

      // Add children that are subcategories (have a parentCategoryId)
      for (const child of children) {
        if (child.parentCategoryId) {
          subCategories.push(child);
        }
      }

      // Recurse into children to find deeper subcategories
      if (children.length > 0) {
        subCategories.push(...this.flattenLeafCategories(children));
      }
    }

    return subCategories;
  }
}


