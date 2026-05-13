import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { AppButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { AppInputComponent } from '../../../../../shared/components/ui/form-controls/input/input.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { AppTextareaComponent } from '../../../../../shared/components/ui/form-controls/textarea/textarea.component';
import { AppBadgeComponent } from '../../../../../shared/components/ui/badge/badge.component';
import { DetailHeaderComponent } from '../../../../../shared/components/ui/detail-header/detail-header.component';
import { SectionHeaderComponent } from '../../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import { Brand, Category } from '@catalog/models/catalog.domain.models';

@Component({
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
    StatusPillComponent
  ],

  templateUrl: './master-product-form.component.html',
  styleUrl: './master-product-form.component.scss'
})
export class MasterProductFormComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  isLoading = false;
  isUploading = false;
  activeLang = 'ar';
  availableCategories: any[] = [];
  allFlatCategories: any[] = [];
  availableBrands: Brand[] = [];
  allBrands: Brand[] = [];
  availableUnits: any[] = [];
  breadcrumbs: { label: string; action?: () => void }[] = [];
  private langSub?: Subscription;

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
      this.activeLang = event.lang;
    });
    this.initForm();
  }

  ngOnInit(): void {
    this.setupBreadcrumbs();
    this.loadCategories();
    this.loadBrands();
    this.loadUnits();
    this.watchCategoryChanges();

    // Check for id in route params for editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }

    // Check for categoryId in query params
    const catId = this.route.snapshot.queryParamMap.get('categoryId');
    if (catId && !id) {
      this.productForm.patchValue({ categoryId: catId });
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
    this.isLoading = true;
    this.catalogService.getProductById(id).subscribe({
      next: (product) => {
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
          status: product.status,
          primaryImageUrl: product.images?.find((img: any) => img.isPrimary)?.url
        });
        this.filterBrandsByCategory(product.categoryId);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load product', err);
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.catalogService.uploadFile(file, 'products').subscribe({
        next: (res) => {
          this.productForm.patchValue({ primaryImageUrl: res.url });
          this.isUploading = false;
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.isUploading = false;
        }
      });
    }
  }

  removeImage(): void {
    this.productForm.patchValue({ primaryImageUrl: null });
  }

  loadCategories(): void {
    this.catalogService.getCategories(undefined, true).subscribe({
      next: (cats) => {
        this.allFlatCategories = this.flattenAllCategories(cats);
        this.availableCategories = this.allFlatCategories.filter(c => c.isLeaf);
        
        // Re-apply categoryId from query params if available after list loads
        const catId = this.route.snapshot.queryParamMap.get('categoryId');
        if (catId && this.availableCategories.some(c => c.id === catId)) {
          this.productForm.patchValue({ categoryId: catId });
        }
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.availableCategories = [];
        this.allFlatCategories = [];
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
    this.catalogService.getBrands(true, false).subscribe({
      next: (brands) => {
        this.allBrands = brands ?? [];
        this.filterBrandsByCategory(this.productForm.get('categoryId')?.value || null);
      },
      error: (err) => {
        console.error('Failed to load brands', err);
        this.allBrands = [];
        this.availableBrands = [];
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
    this.catalogService.getUnits().subscribe({
      next: (units) => this.availableUnits = units,
      error: () => this.availableUnits = [] // Ignore if endpoint not yet deployed
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
    return this.hasControlValue('categoryId');
  }

  get completionPercent(): number {
    let score = 0;

    if (this.hasControlValue('nameAr')) score += 18;
    if (this.hasControlValue('nameEn')) score += 18;
    if (this.hasControlValue('slug')) score += 14;
    if (this.hasControlValue('categoryId')) score += 30;
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
    return !!control && control.invalid && control.touched;
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

  get unitOptions(): SearchableSelectOption<string | null>[] {
    return [
      { value: null, labelKey: 'MASTER_PRODUCTS.STANDARD_UNIT' },
      ...this.availableUnits.map((unit) => ({
        value: unit.id,
        label: this.activeLang === 'ar' ? unit.nameAr : unit.nameEn
      }))
    ];
  }

  private hasControlValue(fieldName: string): boolean {
    const value = this.productForm.get(fieldName)?.value;
    return value !== undefined && value !== null && String(value).trim().length > 0;
  }

  onCancel(): void {
    this.location.back();
  }


  generateQRCode(): void {
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.productForm.patchValue({ barcode: 'ZD-' + random });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const val = this.productForm.value;
    
    // Prepare exact payload for Create/Update Command
    const payload = {
      id: val.id,
      nameAr: val.nameAr,
      nameEn: val.nameEn,
      slug: val.slug,
      descriptionAr: val.descriptionAr,
      descriptionEn: val.descriptionEn,
      barcode: val.barcode,
      categoryId: val.categoryId,
      brandId: val.brandId || null,
      unitId: val.unitId || null,
      status: val.status,
      images: val.primaryImageUrl ? [{ url: val.primaryImageUrl, isPrimary: true, displayOrder: 1 }] : [] 
    };

    if (val.id) {
      this.catalogService.updateProduct(val.id, payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/catalog/products']);
        },
        error: (err: any) => {
          console.error('Update failed', err);
          this.isLoading = false;
        }
      });
    } else {
      this.catalogService.createProduct(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/catalog/products']);
        },
        error: (err: any) => {
          console.error('Save failed', err);
          this.isLoading = false;
        }
      });
    }
  }
}




