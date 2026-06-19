import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { Brand, Category } from '@catalog/models/catalog.domain.models';
import { ToastService } from '@shared/services/toast.service';
import { buildSafeApiErrorLog, describeApiError } from '@shared/utils/api-error.util';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppInputComponent } from '../../../../shared/components/ui/form-controls/input/input.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { UploadProgressComponent } from '../../../../shared/components/ui/upload-progress/upload-progress.component';
import { ImageUploadPhase } from '../../../../shared/utils/image-upload-optimizer';

interface BrandCategoryOption extends Category {
  displayNameAr: string;
  displayNameEn: string;
  level: number;
  isLeaf: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-brand-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    AppButtonComponent,
    AppInputComponent,
    SearchableSelectComponent,
    ModalShellComponent,
    UploadProgressComponent
  ],
  templateUrl: './brand-form-modal.component.html',
  styleUrl: './brand-form-modal.component.scss'
})
export class BrandFormModalComponent implements OnInit, OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);
  @Input() isOpen = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() brand: Brand | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  isSaving = false;
  isUploadingLogo = false;
  isUploadingCover = false;
  logoUploadProgress = 0;
  coverUploadProgress = 0;
  logoUploadPhase: ImageUploadPhase = 'preparing';
  coverUploadPhase: ImageUploadPhase = 'preparing';
  activeInputLang: 'ar' | 'en' = 'ar';
  leafCategories: BrandCategoryOption[] = [];
  categorySearch = '';
  saveErrorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private catalogService: CatalogService,
    public translate: TranslateService,
    private toastService: ToastService
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
      categoryId: [null],
      categoryIds: [[], [Validators.required, Validators.minLength(1)]],
      isActive: [true]
    });
  }

  loadLeafCategories(): void {
    this.catalogService.getCategories(undefined, true).subscribe({
      next: (categories) => {
        this.cdr.markForCheck();
        this.leafCategories = this.flattenAllCategories(categories ?? []).filter((category) => category.isLeaf);
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to load brand categories', buildSafeApiErrorLog(err));
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
    this.setUploadProgress(field, 0, 'preparing');
    this.catalogService.uploadFile(file, 'brands', (progress) => {
      this.setUploadProgress(field, progress.percent, progress.phase);
      this.cdr.markForCheck();
    }).subscribe({
      next: (res) => {
        this.cdr.markForCheck();
        this.form.patchValue({ [field]: res.url });
        this.setUploadingState(field, false);
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Brand asset upload failed', buildSafeApiErrorLog(err));
        const message = describeApiError(err, this.translate, { fallbackKey: 'BRANDS.UPLOAD_FAILED', codePrefix: 'BRANDS.ERROR_CODES' });
        this.saveErrorMessage = message;
        this.toastService.error(message, this.translate.instant('BRANDS.TOAST_TITLE'));
        this.setUploadingState(field, false);
      }
    });
  }

  getAssetValue(field: 'logoUrl' | 'coverImageUrl'): string {
    return this.form.get(field)?.value || '';
  }

  onSubmit(): void {
    if (this.isSaving || this.isUploadingLogo || this.isUploadingCover) {
      return;
    }

    this.saveErrorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const categoryIds = this.getSelectedCategoryIds();
    const payload = {
      ...this.form.value,
      categoryIds,
      categoryId: categoryIds[0] ?? null
    };
    const successKey = this.mode === 'create' ? 'BRANDS.SAVE_CREATED' : 'BRANDS.SAVE_UPDATED';

    if (this.mode === 'create') {
      this.catalogService.createBrand(payload).subscribe({
        next: () => {
        this.cdr.markForCheck();
          this.isSaving = false;
          this.toastService.success(
            this.translate.instant(successKey),
            this.translate.instant('BRANDS.TOAST_TITLE')
          );
          this.saved.emit();
          this.onClose();
        },
        error: (err: unknown) => {
        this.cdr.markForCheck();
          console.error('Brand create failed', buildSafeApiErrorLog(err));
          this.saveErrorMessage = describeApiError(err, this.translate, { fallbackKey: 'BRANDS.SAVE_FAILED', codePrefix: 'BRANDS.ERROR_CODES' });
          this.toastService.error(this.saveErrorMessage, this.translate.instant('BRANDS.TOAST_TITLE'));
          this.isSaving = false;
        }
      });
      return;
    }

    this.catalogService.updateBrand(payload.id, payload).subscribe({
      next: () => {
        this.cdr.markForCheck();
        this.isSaving = false;
        this.toastService.success(
          this.translate.instant(successKey),
          this.translate.instant('BRANDS.TOAST_TITLE')
        );
        this.saved.emit();
        this.onClose();
      },
      error: (err: unknown) => {
        this.cdr.markForCheck();
        console.error('Brand update failed', buildSafeApiErrorLog(err));
        this.saveErrorMessage = describeApiError(err, this.translate, { fallbackKey: 'BRANDS.SAVE_FAILED', codePrefix: 'BRANDS.ERROR_CODES' });
        this.toastService.error(this.saveErrorMessage, this.translate.instant('BRANDS.TOAST_TITLE'));
        this.isSaving = false;
      }
    });
  }

  onClose(): void {
    this.categorySearch = '';
    this.saveErrorMessage = null;
    this.isSaving = false;
    this.form.reset({ isActive: true, categoryId: null, categoryIds: [], logoUrl: '', coverImageUrl: '' });
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

  get selectedCategories(): BrandCategoryOption[] {
    const selectedIds = new Set(this.getSelectedCategoryIds());
    return this.leafCategories.filter((category) => selectedIds.has(category.id));
  }

  get filteredLeafCategories(): BrandCategoryOption[] {
    const search = this.categorySearch.trim().toLocaleLowerCase();
    if (!search) {
      return this.leafCategories;
    }

    return this.leafCategories.filter((category) => {
      const nameAr = (category.displayNameAr || category.nameAr || '').toLocaleLowerCase();
      const nameEn = (category.displayNameEn || category.nameEn || '').toLocaleLowerCase();
      return nameAr.includes(search) || nameEn.includes(search);
    });
  }

  isCategorySelected(categoryId: string): boolean {
    return this.getSelectedCategoryIds().includes(categoryId);
  }

  toggleCategory(categoryId: string, checked: boolean): void {
    const selectedIds = new Set(this.getSelectedCategoryIds());

    if (checked) {
      selectedIds.add(categoryId);
    } else {
      selectedIds.delete(categoryId);
    }

    const nextIds = this.leafCategories
      .map((category) => category.id)
      .filter((id) => selectedIds.has(id));

    this.form.patchValue({
      categoryIds: nextIds,
      categoryId: nextIds[0] ?? null
    });
    this.form.get('categoryIds')?.markAsTouched();
  }

  removeCategory(categoryId: string): void {
    this.toggleCategory(categoryId, false);
  }

  private getSelectedCategoryIds(): string[] {
    const value = this.form.get('categoryIds')?.value;
    return Array.isArray(value)
      ? value.map((item) => String(item)).filter(Boolean)
      : [];
  }

  private setUploadingState(field: 'logoUrl' | 'coverImageUrl', isUploading: boolean): void {
    if (field === 'logoUrl') {
      this.isUploadingLogo = isUploading;
      return;
    }

    this.isUploadingCover = isUploading;
  }

  private setUploadProgress(
    field: 'logoUrl' | 'coverImageUrl',
    percent: number,
    phase: ImageUploadPhase
  ): void {
    if (field === 'logoUrl') {
      this.logoUploadProgress = percent;
      this.logoUploadPhase = phase;
      return;
    }

    this.coverUploadProgress = percent;
    this.coverUploadPhase = phase;
  }

  private syncFormWithInputs(): void {
    if (!this.isOpen) {
      return;
    }

    this.categorySearch = '';
    this.saveErrorMessage = null;
    this.isSaving = false;

    if (this.mode === 'edit' && this.brand) {
      this.form.reset({
        id: this.brand.id ?? null,
        nameAr: this.brand.nameAr ?? '',
        nameEn: this.brand.nameEn ?? '',
        logoUrl: this.brand.logoUrl ?? '',
        coverImageUrl: this.brand.coverImageUrl ?? '',
        categoryId: this.brand.categoryId ?? null,
        categoryIds: this.brand.categoryIds?.length ? this.brand.categoryIds : (this.brand.categoryId ? [this.brand.categoryId] : []),
        isActive: this.brand.isActive ?? true
      });
      return;
    }

    this.form.reset({ isActive: true, categoryId: null, categoryIds: [], logoUrl: '', coverImageUrl: '' });
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
