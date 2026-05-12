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

interface BrandCategoryOption extends Category {
  displayNameAr: string;
  displayNameEn: string;
  level: number;
  isLeaf: boolean;
}

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
  leafCategories: BrandCategoryOption[] = [];

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
    if (changes['brand'] || changes['mode'] || changes['isOpen']) {
      this.syncFormWithInputs();
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
        this.leafCategories = this.flattenAllCategories(categories ?? []).filter((category) => category.isLeaf);
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

  getLocalizedCategoryName(category: BrandCategoryOption): string {
    return this.translate.currentLang === 'ar'
      ? category.displayNameAr || category.nameAr
      : category.displayNameEn || category.nameEn;
  }

  get leafCategoryOptions(): SearchableSelectOption<string>[] {
    return this.leafCategories.map((category) => ({
      value: category.id,
      label: this.getLocalizedCategoryName(category)
    }));
  }

  private setUploadingState(field: 'logoUrl' | 'coverImageUrl', isUploading: boolean): void {
    if (field === 'logoUrl') {
      this.isUploadingLogo = isUploading;
      return;
    }

    this.isUploadingCover = isUploading;
  }

  private syncFormWithInputs(): void {
    if (!this.isOpen) {
      return;
    }

    if (this.mode === 'edit' && this.brand) {
      this.form.reset({
        id: this.brand.id ?? null,
        nameAr: this.brand.nameAr ?? '',
        nameEn: this.brand.nameEn ?? '',
        logoUrl: this.brand.logoUrl ?? '',
        coverImageUrl: this.brand.coverImageUrl ?? '',
        categoryId: this.brand.categoryId ?? null,
        isActive: this.brand.isActive ?? true
      });
      return;
    }

    this.form.reset({ isActive: true, categoryId: null, logoUrl: '', coverImageUrl: '' });
  }

  private flattenAllCategories(
    categories: Category[],
    pathAr = '',
    pathEn = '',
    level = 0,
    parentId: string | null = null
  ): BrandCategoryOption[] {
    let result: BrandCategoryOption[] = [];

    for (const category of categories) {
      const children = category.subCategories ?? [];
      const separator = ' » ';
      const currentPathAr = pathAr ? `${pathAr}${separator}${category.nameAr}` : category.nameAr;
      const currentPathEn = pathEn ? `${pathEn}${separator}${category.nameEn}` : category.nameEn;

      result.push({
        ...category,
        parentCategoryId: parentId || category.parentCategoryId || null,
        displayNameAr: currentPathAr,
        displayNameEn: currentPathEn,
        level,
        isLeaf: level === 3
      });

      if (children.length > 0) {
        result = result.concat(this.flattenAllCategories(children, currentPathAr, currentPathEn, level + 1, category.id));
      }
    }

    return result;
  }
}
