import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { AppButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { AppInputComponent } from '../../../../../shared/components/ui/form-controls/input/input.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { AppTextareaComponent } from '../../../../../shared/components/ui/form-controls/textarea/textarea.component';
import { AppBadgeComponent } from '../../../../../shared/components/ui/badge/badge.component';
import { DetailHeaderComponent } from '../../../../../shared/components/ui/detail-header/detail-header.component';
import { SectionHeaderComponent } from '../../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import { VariantCardComponent } from './components/variant-card/variant-card.component';
import { Brand, CatalogUnit, Category, MasterProduct } from '@catalog/models/catalog.domain.models';
import { DeleteConfirmationModalComponent } from '@shared/components/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-master-product-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TranslateModule, 
    RouterModule,
    AppButtonComponent,
    AppInputComponent,
    SearchableSelectComponent,
    AppTextareaComponent,
    AppBadgeComponent,
    DetailHeaderComponent,
    SectionHeaderComponent,
    StatusPillComponent,
    VariantCardComponent,
    DeleteConfirmationModalComponent
  ],

  templateUrl: './master-product-form.component.html',
  styleUrl: './master-product-form.component.scss'
})
export class MasterProductFormComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  productForm!: FormGroup;
  isLoading = false;
  isInitialFormLoading = false;
  isUploading = false;
  hasSubmitted = false;
  activeLang = 'ar';
  availableCategories: any[] = [];
  allFlatCategories: any[] = [];
  availableBrands: Brand[] = [];
  allBrands: Brand[] = [];
  availableUnits: CatalogUnit[] = [];
  linkedVariantSource: MasterProduct | null = null;
  variantGroupSeedId: string | null = null;
  breadcrumbs: { label: string; action?: () => void }[] = [];
  deletingVariantIndexes = new Set<number>();
  private langSub?: Subscription;
  private shouldGateInitialForm = false;
  private pendingInitialFormLoads = 0;

  // Custom delete modal states for variants
  isDeleteModalOpen = false;
  variantIndexToDelete: number | null = null;
  isDeletingVariant = false;
  deleteVariantErrorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private catalogService: CatalogService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public translate: TranslateService
  ) {
    this.activeLang = this.translate.currentLang || 'ar';
    this.langSub = this.translate.onLangChange.subscribe(event => {
      this.cdr.markForCheck();
      this.activeLang = event.lang;
    });
    this.initForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const variantFrom = this.route.snapshot.queryParamMap.get('variantFrom');

    this.shouldGateInitialForm = !!id || !!variantFrom;
    this.isInitialFormLoading = this.shouldGateInitialForm;
    this.setupBreadcrumbs();
    this.loadCategories();
    this.loadBrands();
    this.loadUnits();
    this.watchCategoryChanges();

    // Check for id in route params for editing
    if (id) {
      this.loadProduct(id);
    }

    // Check for categoryId in query params
    const catId = this.route.snapshot.queryParamMap.get('categoryId');
    if (catId && !id) {
      this.productForm.patchValue({ categoryId: catId });
    }

    if (variantFrom && !id) {
      this.loadVariantSource(variantFrom);
    }

    if (!id && !variantFrom) {
      this.ensurePrimaryBarcode();
    }
  }

  setupBreadcrumbs(): void {
    const isEdit = !!this.route.snapshot.paramMap.get('id');
    this.breadcrumbs = [
      { label: this.translate.instant('SIDEBAR.CATALOG'), action: () => this.onCancel() },
      { label: this.translate.instant('SIDEBAR.MASTER_PRODUCTS'), action: () => this.onCancel() },
      { label: isEdit ? this.translate.instant('MASTER_PRODUCTS.EDIT_TITLE') : this.translate.instant('MASTER_PRODUCTS.ADD_TITLE') }
    ];
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      id: [null],
      nameAr: ['', [Validators.required]],
      nameEn: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      descriptionAr: [''],
      descriptionEn: [''],
      barcode: [''],
      categoryId: ['', [Validators.required]],
      brandId: [null],
      unitId: [null],
      packageTypeId: [null],
      measurementValue: [null],
      measurementUnitId: [null],
      variantGroupId: [null],
      additionalVariants: this.fb.array([]),
      primaryImageUrl: [null],
      status: ['Draft'] // Status is visual, backend defaults to Draft initially
    });

    // Auto-generate slug from English name (preferred) or Arabic name
    const updateSlug = () => {
      const slugControl = this.productForm.get('slug');
      // Update only if the user hasn't manually edited the slug field yet
      if (!slugControl?.dirty) {
        const nameEn = this.productForm.get('nameEn')?.value;
        const nameAr = this.productForm.get('nameAr')?.value;
        
        let sourceStr = '';
        if (nameEn && typeof nameEn === 'string' && nameEn.trim() !== '') {
            sourceStr = nameEn;
        } else if (nameAr && typeof nameAr === 'string' && nameAr.trim() !== '') {
            sourceStr = nameAr;
        }

        if (sourceStr) {
            const generatedSlug = sourceStr
              .toLowerCase()
              .trim()
              .replace(/[^\u0600-\u06FFa-z0-9]+/g, '-')
              .replace(/(^-|-$)+/g, '');
              
            slugControl?.setValue(generatedSlug, { emitEvent: false });
        } else {
            slugControl?.setValue('', { emitEvent: false });
        }
      }
    };

    this.productForm.get('nameEn')?.valueChanges.subscribe(() => updateSlug());
    this.productForm.get('nameAr')?.valueChanges.subscribe(() => updateSlug());
  }

  private watchCategoryChanges(): void {
    this.productForm.get('categoryId')?.valueChanges.subscribe((categoryId: string | null) => {
      this.cdr.markForCheck();
      this.filterBrandsByCategory(categoryId);
    });
  }

  generateSlug(force: boolean = false): void {
    const slugControl = this.productForm.get('slug');
    if (!force && slugControl?.dirty && slugControl?.value) return;

    const nameEn = this.productForm.get('nameEn')?.value;
    const nameAr = this.productForm.get('nameAr')?.value;
    
    let sourceStr = '';
    if (nameEn && typeof nameEn === 'string' && nameEn.trim() !== '') {
        sourceStr = nameEn;
    } else if (nameAr && typeof nameAr === 'string' && nameAr.trim() !== '') {
        sourceStr = nameAr;
    }

    if (sourceStr) {
        const generatedSlug = sourceStr
          .toLowerCase()
          .trim()
          .replace(/[^\u0600-\u06FFa-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
          
        slugControl?.setValue(generatedSlug);
        slugControl?.markAsDirty();
    }
  }

  loadProduct(id: string): void {
    this.beginInitialFormLoad();
    this.isLoading = true;
    this.catalogService.getProductById(id).subscribe({
      next: async (product) => {
        try {
          this.productForm.patchValue({
            id: product.id,
            nameAr: product.nameAr || '',
            nameEn: product.nameEn || '',
            slug: product.slug || '',
            descriptionAr: product.descriptionAr || '',
            descriptionEn: product.descriptionEn || '',
            barcode: product.barcode || '',
            categoryId: product.categoryId,
            brandId: product.brandId,
            unitId: product.unitOfMeasureId,
            packageTypeId: product.packageTypeId || null,
            measurementValue: product.measurementValue ?? null,
            measurementUnitId: product.measurementUnitId || product.unitOfMeasureId || null,
            variantGroupId: product.variantGroupId || null,
            status: product.status,
            primaryImageUrl: product.images?.find((img: any) => img.isPrimary)?.url
          });
          this.variantGroupSeedId = product.variantGroupId || product.id || null;
          this.filterBrandsByCategory(product.categoryId);
          await this.loadExistingVariants(product);
        } finally {
          this.isLoading = false;
          this.completeInitialFormLoad();
        }
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to load product', err);
        this.isLoading = false;
        this.completeInitialFormLoad();
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.catalogService.uploadFile(file, 'products').subscribe({
        next: (res) => {
        this.cdr.markForCheck();
          this.productForm.patchValue({ primaryImageUrl: res.url });
          this.isUploading = false;
        },
        error: (err) => {
        this.cdr.markForCheck();
          console.error('Upload failed', err);
          this.isUploading = false;
        }
      });
    }
  }

  onAdditionalVariantFileSelected(index: number, event: any): void {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const group = this.additionalVariants.at(index) as FormGroup | null;
    if (!group) {
      return;
    }

    this.isUploading = true;
    this.catalogService.uploadFile(file, 'products').subscribe({
      next: (res) => {
        this.cdr.markForCheck();
        group.patchValue({ imageUrl: res.url });
        this.isUploading = false;
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Variant upload failed', err);
        this.isUploading = false;
      }
    });
  }

  removeImage(): void {
    this.productForm.patchValue({ primaryImageUrl: null });
  }

  removeAdditionalVariantImage(index: number): void {
    const group = this.additionalVariants.at(index) as FormGroup | null;
    group?.patchValue({ imageUrl: null });
  }

  loadCategories(): void {
    this.beginInitialFormLoad();
    this.catalogService.getCategories(undefined, true).subscribe({
      next: (cats) => {
        this.cdr.markForCheck();
        this.allFlatCategories = this.flattenAllCategories(cats);
        this.availableCategories = this.allFlatCategories.filter(c => c.isLeaf);
        
        // Re-apply categoryId from query params if available after list loads
        const catId = this.route.snapshot.queryParamMap.get('categoryId');
        if (catId && this.availableCategories.some(c => c.id === catId)) {
          this.productForm.patchValue({ categoryId: catId });
        }
        this.completeInitialFormLoad();
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to load categories', err);
        this.availableCategories = [];
        this.allFlatCategories = [];
        this.completeInitialFormLoad();
      }
    });
  }

  private flattenAllCategories(categories: any[], pathAr: string = '', pathEn: string = '', level: number = 0, parentId: string | null = null): any[] {
    let result: any[] = [];
    categories.forEach(cat => {
      const separator = ' \u00BB ';
      const currentPathAr = pathAr ? `${pathAr}${separator}${cat.nameAr}` : cat.nameAr;
      const currentPathEn = pathEn ? `${pathEn}${separator}${cat.nameEn}` : cat.nameEn;
      const hasChildren = cat.subCategories && cat.subCategories.length > 0;
      const isLeaf = level === 3;

      result.push({
        id: cat.id,
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        parentCategoryId: parentId || cat.parentCategoryId || null,
        displayNameAr: currentPathAr,
        displayNameEn: currentPathEn,
        level: level,
        isLeaf: isLeaf
      });

      if (hasChildren) {
        result = result.concat(this.flattenAllCategories(cat.subCategories, currentPathAr, currentPathEn, level + 1, cat.id));
      }
    });
    return result;
  }

  loadBrands(): void {
    this.beginInitialFormLoad();
    this.catalogService.getBrands(true, false).subscribe({
      next: (brands) => {
        this.cdr.markForCheck();
        this.allBrands = brands ?? [];
        this.filterBrandsByCategory(this.productForm.get('categoryId')?.value || null);
        this.completeInitialFormLoad();
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to load brands', err);
        this.allBrands = [];
        this.availableBrands = [];
        this.completeInitialFormLoad();
      }
    });
  }

  private filterBrandsByCategory(categoryId: string | null): void {
    if (!categoryId) {
      this.availableBrands = [];
      this.productForm.patchValue({ brandId: null }, { emitEvent: false });
      return;
    }

    const selectedBrandId = this.productForm.get('brandId')?.value;

    if (this.allBrands.length === 0) {
      this.availableBrands = [];
      return;
    }

    // Get the selected category and all its ancestor IDs
    const ancestorIds = this.getAncestorCategoryIds(categoryId);
    const matchIds = new Set([categoryId, ...ancestorIds]);

    // Show brands that are linked to the selected category or any of its ancestors
    this.availableBrands = this.allBrands.filter((brand) => {
      const brandCategoryIds = brand.categoryIds?.length ? brand.categoryIds : (brand.categoryId ? [brand.categoryId] : []);
      return brandCategoryIds.some((brandCategoryId) => matchIds.has(brandCategoryId));
    });

    const selectedBrandIsValid = this.availableBrands.some((brand) => brand.id === selectedBrandId);

    if (!selectedBrandIsValid && selectedBrandId) {
      const selectedBrand = this.allBrands.find((brand) => brand.id === selectedBrandId);
      if (selectedBrand) {
        this.availableBrands = [selectedBrand, ...this.availableBrands];
        return;
      }
    }

    if (!selectedBrandIsValid) {
      this.productForm.patchValue({ brandId: null }, { emitEvent: false });
    }
  }

  private getAncestorCategoryIds(categoryId: string): string[] {
    const ancestors: string[] = [];
    const categoryMap = this.buildCategoryMap(this.availableCategories);

    let currentId: string | null | undefined = categoryId;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const cat = categoryMap.get(currentId);
      if (cat?.parentCategoryId) {
        ancestors.push(cat.parentCategoryId);
        currentId = cat.parentCategoryId;
      } else {
        break;
      }
    }

    return ancestors;
  }

  private buildCategoryMap(categories: any[]): Map<string, any> {
    const map = new Map<string, any>();
    for (const cat of this.allFlatCategories) {
      map.set(cat.id, cat);
    }
    return map;
  }

  loadUnits(): void {
    this.beginInitialFormLoad();
    this.catalogService.getUnits().subscribe({
      next: (units) => {
        this.cdr.markForCheck();
        this.availableUnits = units;
        this.completeInitialFormLoad();
      },
      error: () => {
        this.cdr.markForCheck();
        this.availableUnits = []; // Ignore if endpoint not yet deployed
        this.completeInitialFormLoad();
      }
    });
  }

  setStatus(status: string): void {
    this.productForm.patchValue({ status });
  }

  get publishingStatusVariant(): StatusPillVariant {
    return this.productForm.get('status')?.value === 'Active' ? 'success' : 'warning';
  }

  get publishingStatusLabel(): string {
    return this.productForm.get('status')?.value === 'Active'
      ? 'MASTER_PRODUCTS.STATUS_ACTIVE'
      : 'MASTER_PRODUCTS.STATUS_DRAFT';
  }

  get coreInfoComplete(): boolean {
    return ['nameAr', 'nameEn', 'slug'].every((field) => this.hasControlValue(field));
  }

  get classificationComplete(): boolean {
    return this.hasControlValue('categoryId') && this.hasMeasurementSelectionConsistency;
  }

  get hasMeasurementSelectionConsistency(): boolean {
    const measurementValue = this.productForm.get('measurementValue')?.value;
    const measurementUnitId = this.productForm.get('measurementUnitId')?.value;
    const hasValue = measurementValue !== null && measurementValue !== undefined && `${measurementValue}`.trim() !== '';
    const hasUnit = !!measurementUnitId;
    return hasValue === hasUnit;
  }

  get completionPercent(): number {
    let score = 0;

    if (this.hasControlValue('nameAr')) score += 18;
    if (this.hasControlValue('nameEn')) score += 18;
    if (this.hasControlValue('slug')) score += 14;
    if (this.hasControlValue('categoryId')) score += 30;
    if (this.hasMeasurementSelectionConsistency) score += 10;
    if (this.hasControlValue('barcode')) score += 10;
    if (this.hasControlValue('primaryImageUrl')) score += 10;

    return Math.min(100, score);
  }

  get selectedCategoryLabel(): string {
    const categoryId = this.productForm.get('categoryId')?.value;
    const category = this.availableCategories.find((item) => item.id === categoryId);

    if (!category) {
      return '';
    }

    return this.activeLang === 'ar'
      ? category.displayNameAr || category.nameAr || ''
      : category.displayNameEn || category.nameEn || '';
  }

  isFieldTouched(fieldName: string): boolean {
    return this.productForm.get(fieldName)?.touched || false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.productForm.get(fieldName);
    return !!control && control.invalid && (control.touched || this.hasSubmitted);
  }

  get missingRequiredFields(): Array<{ key: string; label: string }> {
    const labels: Record<string, { ar: string; en: string }> = {
      nameAr: { ar: 'اسم المنتج بالعربية', en: 'Arabic product name' },
      nameEn: { ar: 'اسم المنتج بالإنجليزية', en: 'English product name' },
      slug: { ar: 'معرّف المنتج', en: 'Product slug' },
      categoryId: { ar: 'التصنيف', en: 'Category' }
    };

    return Object.entries(labels)
      .filter(([key]) => this.productForm.get(key)?.invalid)
      .map(([key, value]) => ({
        key,
        label: this.activeLang === 'ar' ? value.ar : value.en
      }));
  }

  get shouldShowValidationSummary(): boolean {
    return this.hasSubmitted && this.productForm.invalid && this.missingRequiredFields.length > 0;
  }

  get categoryOptions(): SearchableSelectOption<string>[] {
    return this.availableCategories.map((cat) => ({
      value: cat.id,
      label: this.activeLang === 'ar' ? cat.displayNameAr : cat.displayNameEn
    }));
  }

  get brandOptions(): SearchableSelectOption<string | null>[] {
    return [
      { value: null, labelKey: 'MASTER_PRODUCTS.GENERIC_WHITE_LABEL' },
      ...this.availableBrands.map((brand) => ({
        value: brand.id,
        label: this.activeLang === 'ar' ? brand.nameAr : brand.nameEn
      }))
    ];
  }

  get packageTypeOptions(): SearchableSelectOption<string | null>[] {
    return [
      { value: null, labelKey: 'MASTER_PRODUCTS.STANDARD_UNIT' },
      ...this.availableUnits
        .filter((unit) => unit.kind === 'Packaging')
        .map((unit) => ({
          value: unit.id,
          label: this.activeLang === 'ar' ? unit.nameAr : unit.nameEn
        }))
    ];
  }

  get measurementUnitOptions(): SearchableSelectOption<string | null>[] {
    return [
      { value: null, labelKey: 'MASTER_PRODUCTS.STANDARD_UNIT' },
      ...this.availableUnits
        .filter((unit) => unit.kind === 'Measurement')
        .map((unit) => ({
        value: unit.id,
        label: this.activeLang === 'ar' ? unit.nameAr : unit.nameEn
        }))
    ];
  }

  get displaySizePreview(): string {
    const packageType = this.availableUnits.find((unit) => unit.id === this.productForm.get('packageTypeId')?.value);
    const measurementUnit = this.availableUnits.find((unit) => unit.id === this.productForm.get('measurementUnitId')?.value);
    const measurementValue = this.productForm.get('measurementValue')?.value;
    const packageLabel = packageType ? (this.activeLang === 'ar' ? packageType.nameAr : packageType.nameEn) : '';
    const measurementLabel = measurementUnit ? (this.activeLang === 'ar' ? measurementUnit.nameAr : measurementUnit.nameEn) : '';
    const valueLabel = measurementValue !== null && measurementValue !== undefined && `${measurementValue}`.trim() !== ''
      ? `${measurementValue}`
      : '';

    return [packageLabel, valueLabel, measurementLabel].filter(Boolean).join(' ').trim();
  }

  get isCreatingVariant(): boolean {
    return !this.productForm.get('id')?.value && !!this.linkedVariantSource && !!this.productForm.get('variantGroupId')?.value;
  }

  get linkedVariantSourceName(): string {
    if (!this.linkedVariantSource) {
      return '';
    }

    return this.activeLang === 'ar'
      ? (this.linkedVariantSource.nameAr || this.linkedVariantSource.nameEn || '')
      : (this.linkedVariantSource.nameEn || this.linkedVariantSource.nameAr || '');
  }

  get linkedVariantGroupDisplay(): string {
    const value = this.productForm.get('variantGroupId')?.value;
    return typeof value === 'string' ? value : '';
  }

  get canCreateAnotherVariant(): boolean {
    return !!this.getVariantSourceProductId();
  }

  get additionalVariants(): FormArray {
    return this.productForm.get('additionalVariants') as FormArray;
  }

  get hasAdditionalVariants(): boolean {
    return this.additionalVariants.length > 0;
  }

  /** FormGroup representing the primary variant (the main product itself) for use in variant-card */
  get primaryVariantGroup(): FormGroup {
    return this.productForm as FormGroup;
  }

  /** Handles image upload for the primary variant card */
  onPrimaryVariantImageUpload(event: Event): void {
    this.onFileSelected(event);
  }

  /** Handles image removal for the primary variant card */
  onPrimaryVariantImageRemove(): void {
    this.removeImage();
  }

  private hasControlValue(fieldName: string): boolean {
    const value = this.productForm.get(fieldName)?.value;
    return value !== undefined && value !== null && String(value).trim().length > 0;
  }

  onCancel(): void {
    this.location.back();
  }


  generateQRCode(): void {
    this.productForm.patchValue({ barcode: this.createBarcodeValue() });
  }

  clearVariantLink(): void {
    this.linkedVariantSource = null;
    this.variantGroupSeedId = null;
    this.productForm.patchValue({
      variantGroupId: null
    });
  }

  createAnotherVariant(): void {
    this.addAdditionalVariant();
  }

  onSubmit(): void {
    this.hasSubmitted = true;

    const measurementValue = this.productForm.get('measurementValue')?.value;
    const measurementUnitId = this.productForm.get('measurementUnitId')?.value;
    const hasMeasurementValue = measurementValue !== null && measurementValue !== undefined && `${measurementValue}`.trim() !== '';
    const hasMeasurementUnit = !!measurementUnitId;

    if (hasMeasurementValue !== hasMeasurementUnit) {
      this.productForm.get('measurementValue')?.markAsTouched();
      this.productForm.get('measurementUnitId')?.markAsTouched();
    }

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.scrollToFirstInvalidField();
      return;
    }

    if (hasMeasurementValue !== hasMeasurementUnit) {
      this.scrollToField('measurementUnitId');
      return;
    }

    if (!this.validateAdditionalVariants()) {
      return;
    }

    void this.saveProductWithAdditionalVariants();
  }

  scrollToField(fieldName: string): void {
    const fieldElement = document.querySelector<HTMLElement>(`[data-product-field="${fieldName}"]`);
    fieldElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const focusTarget = fieldElement?.matches('input, textarea, button')
      ? fieldElement
      : fieldElement?.querySelector<HTMLElement>('input, textarea, button');
    focusTarget?.focus();
  }

  private scrollToFirstInvalidField(): void {
    const firstInvalidField = this.missingRequiredFields[0]?.key;
    if (!firstInvalidField) {
      return;
    }

    setTimeout(() => {
      this.scrollToField(firstInvalidField);
    });
  }

  private getVariantSourceProductId(): string | null {
    if (this.linkedVariantSource?.id) {
      return this.linkedVariantSource.id;
    }

    const currentProductId = this.productForm.get('id')?.value;
    return typeof currentProductId === 'string' && currentProductId.trim().length > 0
      ? currentProductId
      : null;
  }

  addAdditionalVariant(): void {
    this.additionalVariants.push(this.createAdditionalVariantGroup());
  }

  removeAdditionalVariant(index: number): void {
    this.additionalVariants.removeAt(index);
  }

  handleVariantRemove(index: number): void {
    const group = this.additionalVariants.at(index) as FormGroup | null;
    const variantId = group?.get('id')?.value;

    if (!variantId) {
      this.removeAdditionalVariant(index);
      return;
    }

    this.variantIndexToDelete = index;
    this.isDeleteModalOpen = true;
    this.deleteVariantErrorMessage = null;
    this.isDeletingVariant = false;
  }

  confirmDeleteVariant(): void {
    if (this.variantIndexToDelete === null) return;

    const index = this.variantIndexToDelete;
    const group = this.additionalVariants.at(index) as FormGroup | null;
    const variantId = group?.get('id')?.value;

    if (!variantId) {
      this.removeAdditionalVariant(index);
      this.isDeleteModalOpen = false;
      this.variantIndexToDelete = null;
      return;
    }

    this.isDeletingVariant = true;
    this.deleteVariantErrorMessage = null;
    this.deletingVariantIndexes.add(index);

    this.catalogService.deleteProduct(variantId).subscribe({
      next: () => {
        this.cdr.markForCheck();
        this.isDeletingVariant = false;
        this.isDeleteModalOpen = false;
        this.deletingVariantIndexes.delete(index);
        this.removeAdditionalVariant(index);
        this.variantIndexToDelete = null;
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to delete variant', err);
        this.isDeletingVariant = false;
        this.deletingVariantIndexes.delete(index);
        this.deleteVariantErrorMessage = this.activeLang === 'ar'
          ? 'تعذر حذف هذا الحجم حاليا.'
          : 'Unable to delete this size right now.';
      }
    });
  }

  cancelDeleteVariant(): void {
    this.isDeleteModalOpen = false;
    this.variantIndexToDelete = null;
    this.deleteVariantErrorMessage = null;
    this.isDeletingVariant = false;
  }

  getAdditionalVariantDisplayPreview(index: number): string {
    const group = this.additionalVariants.at(index) as FormGroup | null;
    if (!group) {
      return '';
    }

    return this.buildDisplaySizePreview(
      group.get('packageTypeId')?.value,
      group.get('measurementValue')?.value,
      group.get('measurementUnitId')?.value
    );
  }

  private createAdditionalVariantGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      packageTypeId: [this.productForm.get('packageTypeId')?.value || null],
      measurementValue: [null],
      measurementUnitId: [this.productForm.get('measurementUnitId')?.value || null],
      barcode: [''],
      slug: [''],
      imageUrl: [null]
    });
  }

  private validateAdditionalVariants(): boolean {
    for (let index = 0; index < this.additionalVariants.length; index += 1) {
      const group = this.additionalVariants.at(index) as FormGroup;
      const measurementValue = group.get('measurementValue')?.value;
      const measurementUnitId = group.get('measurementUnitId')?.value;
      const hasValue = measurementValue !== null && measurementValue !== undefined && `${measurementValue}`.trim() !== '';
      const hasUnit = !!measurementUnitId;

      if (hasValue !== hasUnit) {
        group.get('measurementValue')?.markAsTouched();
        group.get('measurementUnitId')?.markAsTouched();
        this.scrollToField(`additionalVariant-${index}`);
        return false;
      }
    }

    return true;
  }

  private buildDisplaySizePreview(packageTypeId: string | null, measurementValue: unknown, measurementUnitId: string | null): string {
    const packageType = this.availableUnits.find((unit) => unit.id === packageTypeId);
    const measurementUnit = this.availableUnits.find((unit) => unit.id === measurementUnitId);
    const packageLabel = packageType ? (this.activeLang === 'ar' ? packageType.nameAr : packageType.nameEn) : '';
    const measurementLabel = measurementUnit ? (this.activeLang === 'ar' ? measurementUnit.nameAr : measurementUnit.nameEn) : '';
    const valueLabel = measurementValue !== null && measurementValue !== undefined && `${measurementValue}`.trim() !== ''
      ? `${measurementValue}`
      : '';

    return [packageLabel, valueLabel, measurementLabel].filter(Boolean).join(' ').trim();
  }

  private buildMainProductPayload(formValue: any, hasMeasurementValue: boolean) {
    const effectiveSlug = this.buildPrimaryProductSlug(formValue);
    const barcode = this.normalizeOptionalText(formValue.barcode) ?? this.createBarcodeValue();

    return {
      id: formValue.id,
      nameAr: formValue.nameAr,
      nameEn: formValue.nameEn,
      slug: effectiveSlug,
      descriptionAr: formValue.descriptionAr,
      descriptionEn: formValue.descriptionEn,
      barcode,
      categoryId: formValue.categoryId,
      brandId: formValue.brandId || null,
      unitId: formValue.measurementUnitId || formValue.unitId || null,
      packageTypeId: formValue.packageTypeId || null,
      measurementValue: hasMeasurementValue ? Number(formValue.measurementValue) : null,
      measurementUnitId: formValue.measurementUnitId || null,
      variantGroupId: formValue.variantGroupId || null,
      status: formValue.status,
      images: formValue.primaryImageUrl ? [{ url: formValue.primaryImageUrl, isPrimary: true, displayOrder: 1 }] : []
    };
  }

  private buildAdditionalVariantPayload(formValue: any, variant: any, variantGroupId: string, index: number) {
    const measurementValue = variant.measurementValue;
    const hasMeasurementValue = measurementValue !== null && measurementValue !== undefined && `${measurementValue}`.trim() !== '';
    const generatedSlug = this.buildVariantSlug(
      formValue.slug,
      variant.slug,
      this.buildDisplaySizePreview(variant.packageTypeId || null, measurementValue, variant.measurementUnitId || null),
      index
    );

    return {
      id: variant.id || undefined,
      nameAr: formValue.nameAr,
      nameEn: formValue.nameEn,
      slug: generatedSlug,
      descriptionAr: formValue.descriptionAr,
      descriptionEn: formValue.descriptionEn,
      barcode: this.normalizeOptionalText(variant.barcode) ?? this.createBarcodeValue(),
      categoryId: formValue.categoryId,
      brandId: formValue.brandId || null,
      unitId: variant.measurementUnitId || null,
      packageTypeId: variant.packageTypeId || null,
      measurementValue: hasMeasurementValue ? Number(measurementValue) : null,
      measurementUnitId: variant.measurementUnitId || null,
      variantGroupId,
      status: formValue.status,
      images: variant.imageUrl ? [{ url: variant.imageUrl, isPrimary: true, displayOrder: 1 }] : []
    };
  }

  private buildVariantSlug(baseSlug: string, customSlug: string, sizeLabel: string, index: number): string {
    if (customSlug && customSlug.trim().length > 0) {
      return customSlug.trim();
    }

    const suffixSource = sizeLabel || `variant-${index + 1}`;
    const suffix = suffixSource
      .toLowerCase()
      .trim()
      .replace(/[^\u0600-\u06FFa-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    return suffix ? `${baseSlug}-${suffix}` : `${baseSlug}-variant-${index + 1}`;
  }

  private normalizeOptionalText(value: unknown): string | null {
    if (typeof value !== 'string') {
      return value ? String(value) : null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private createBarcodeValue(): string {
    const token = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

    return `ZD-${token}`;
  }

  private ensurePrimaryBarcode(): void {
    if (!this.normalizeOptionalText(this.productForm.get('barcode')?.value)) {
      this.generateQRCode();
    }
  }

  private buildPrimaryProductSlug(formValue: any): string {
    const currentSlug = typeof formValue.slug === 'string' ? formValue.slug.trim() : '';
    const linkedSourceSlug = this.linkedVariantSource?.slug?.trim();

    if (formValue.id || !this.linkedVariantSource || !linkedSourceSlug) {
      return currentSlug;
    }

    if (currentSlug && currentSlug !== linkedSourceSlug) {
      return currentSlug;
    }

    return this.buildVariantSlug(
      linkedSourceSlug,
      '',
      this.buildDisplaySizePreview(
        formValue.packageTypeId || null,
        formValue.measurementValue,
        formValue.measurementUnitId || null
      ),
      0
    );
  }

  private async saveProductWithAdditionalVariants(): Promise<void> {
    this.isLoading = true;

    try {
      const formValue = this.productForm.getRawValue();
      const hasMeasurementValue = formValue.measurementValue !== null
        && formValue.measurementValue !== undefined
        && `${formValue.measurementValue}`.trim() !== '';
      const payload = this.buildMainProductPayload(formValue, hasMeasurementValue);

      let variantGroupId = formValue.variantGroupId || null;

      if (formValue.id) {
        await firstValueFrom(this.catalogService.updateProduct(formValue.id, payload));
        variantGroupId = variantGroupId || formValue.id;
      } else {
        const createdProductId = await firstValueFrom(this.catalogService.createProduct(payload));
        variantGroupId = variantGroupId || (typeof createdProductId === 'string' ? createdProductId : null);
      }

      for (let index = 0; index < this.additionalVariants.length; index += 1) {
        const additionalVariant = this.additionalVariants.at(index)?.value;
        if (!additionalVariant || !variantGroupId) {
          continue;
        }

        const additionalPayload = this.buildAdditionalVariantPayload(formValue, additionalVariant, variantGroupId, index);
        if (additionalVariant.id) {
          await firstValueFrom(this.catalogService.updateProduct(additionalVariant.id, additionalPayload));
        } else {
          await firstValueFrom(this.catalogService.createProduct(additionalPayload));
        }
      }

      this.isLoading = false;
      this.router.navigate(['/catalog/products']);
    } catch (err) {
      console.error('Save failed', {
        error: err,
        payload: this.productForm.getRawValue()
      });
      this.isLoading = false;
    }
  }

  private loadVariantSource(productId: string): void {
    this.beginInitialFormLoad();
    this.isLoading = true;
    this.catalogService.getProductById(productId).subscribe({
      next: (product) => {
        this.cdr.markForCheck();
        try {
          this.linkedVariantSource = product;
          this.variantGroupSeedId = product.variantGroupId || product.id || null;
          this.productForm.patchValue({
            nameAr: product.nameAr || '',
            nameEn: product.nameEn || '',
            slug: '',
            descriptionAr: product.descriptionAr || '',
            descriptionEn: product.descriptionEn || '',
            barcode: '',
            categoryId: product.categoryId,
            brandId: product.brandId || null,
            packageTypeId: product.packageTypeId || null,
            measurementValue: null,
            measurementUnitId: product.measurementUnitId || product.unitOfMeasureId || null,
            unitId: product.measurementUnitId || product.unitOfMeasureId || null,
            variantGroupId: this.variantGroupSeedId,
            primaryImageUrl: product.images?.find((img: any) => img.isPrimary)?.url || null,
            status: 'Draft'
          });
          this.productForm.get('slug')?.markAsPristine();
          this.generateSlug(true);
          this.ensurePrimaryBarcode();
          this.filterBrandsByCategory(product.categoryId);
        } finally {
          this.isLoading = false;
          this.completeInitialFormLoad();
        }
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to load variant source product', err);
        this.isLoading = false;
        this.completeInitialFormLoad();
      }
    });
  }

  private beginInitialFormLoad(): void {
    if (!this.shouldGateInitialForm) {
      return;
    }

    this.pendingInitialFormLoads += 1;
    this.isInitialFormLoading = true;
  }

  private completeInitialFormLoad(): void {
    if (!this.shouldGateInitialForm) {
      return;
    }

    this.pendingInitialFormLoads = Math.max(0, this.pendingInitialFormLoads - 1);
    this.isInitialFormLoading = this.pendingInitialFormLoads > 0;
  }

  private async loadExistingVariants(product: MasterProduct): Promise<void> {
    this.additionalVariants.clear();

    const variantsToLoad = (product.variants ?? []).filter((variant) => variant.id && variant.id !== product.id);
    if (variantsToLoad.length === 0) {
      return;
    }

    try {
      const variantProducts = await Promise.all(
        variantsToLoad.map((variant) => firstValueFrom(this.catalogService.getProductById(variant.id)))
      );

      for (const variantProduct of variantProducts) {
        this.additionalVariants.push(this.createAdditionalVariantGroupFromProduct(variantProduct));
      }
    } catch (err) {
      console.error('Failed to load existing variants', err);
    }
  }

  private createAdditionalVariantGroupFromProduct(product: MasterProduct): FormGroup {
    return this.fb.group({
      id: [product.id],
      packageTypeId: [product.packageTypeId || null],
      measurementValue: [product.measurementValue ?? null],
      measurementUnitId: [product.measurementUnitId || product.unitOfMeasureId || null],
      barcode: [product.barcode || ''],
      slug: [product.slug || ''],
      imageUrl: [product.images?.find((img: any) => img.isPrimary)?.url || null]
    });
  }
}




