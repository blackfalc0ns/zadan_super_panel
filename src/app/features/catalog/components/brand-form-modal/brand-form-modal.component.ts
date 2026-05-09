import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
  isUploadingLogo = false;
  isUploadingCover = false;
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
          categoryId: this.brand.categoryId ?? null,
          coverImageUrl: this.brand.coverImageUrl ?? ''
        });
      } else {
        this.form.reset({ isActive: true, categoryId: null, logoUrl: '', coverImageUrl: '' });
      }
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      nameAr: ['', [Validators.required, Validators.maxLength(100)]],
      nameEn: ['', [Validators.required, Validators.maxLength(100)]],
      logoUrl: [''],
      coverImageUrl: [''],
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

  onFileSelected(event: Event, field: 'logoUrl' | 'coverImageUrl'): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    this.setUploadingState(field, true);
    this.catalogService.uploadFile(file, 'brands').subscribe({
      next: (res) => {
        this.form.patchValue({ [field]: res.url });
        this.setUploadingState(field, false);
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.setUploadingState(field, false);
      }
    });
  }

  getAssetValue(field: 'logoUrl' | 'coverImageUrl'): string {
    return this.form.get(field)?.value || '';
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
    this.form.reset({ isActive: true, categoryId: null, logoUrl: '', coverImageUrl: '' });
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

  private setUploadingState(field: 'logoUrl' | 'coverImageUrl', isUploading: boolean): void {
    if (field === 'logoUrl') {
      this.isUploadingLogo = isUploading;
      return;
    }

    this.isUploadingCover = isUploading;
  }

  private flattenLeafCategories(categories: Category[]): Category[] {
    const subCategories: Category[] = [];

    for (const category of categories) {
      const children = category.subCategories ?? [];

      for (const child of children) {
        if (child.parentCategoryId) {
          subCategories.push(child);
        }
      }

      if (children.length > 0) {
        subCategories.push(...this.flattenLeafCategories(children));
      }
    }

    return subCategories;
  }
}
