import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CatalogService } from '../../../../core/services/catalog.service';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppInputComponent } from '../../../../shared/components/ui/form-controls/input.component';
import { AppTextareaComponent } from '../../../../shared/components/ui/form-controls/textarea.component';
import { AppBadgeComponent } from '../../../../shared/components/ui/badge/badge.component';
import { DetailHeaderComponent } from '../../../../shared/components/ui/detail-header/detail-header.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { Category } from '../../../../core/models/catalog.model';

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
  availableBrands: any[] = [];
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
        this.availableCategories = this.flattenCategories(cats);
        
        // Re-apply categoryId from query params if available after list loads
        const catId = this.route.snapshot.queryParamMap.get('categoryId');
        if (catId && this.availableCategories.some(c => c.id === catId)) {
          this.productForm.patchValue({ categoryId: catId });
        }
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.availableCategories = [];
      }
    });
  }

  private flattenCategories(categories: any[], pathAr: string = '', pathEn: string = '', level: number = 0): any[] {
    let result: any[] = [];
    categories.forEach(cat => {
      const separator = ' » ';
      const currentPathAr = pathAr ? `${pathAr}${separator}${cat.nameAr}` : cat.nameAr;
      const currentPathEn = pathEn ? `${pathEn}${separator}${cat.nameEn}` : cat.nameEn;
      
      // Specifically target Level 3 (Sub-Category) as requested
      const isTargetLevel = level === 3;

      if (isTargetLevel) {
        result.push({
          id: cat.id,
          nameAr: cat.nameAr,
          nameEn: cat.nameEn,
          displayNameAr: currentPathAr,
          displayNameEn: currentPathEn,
          level: level
        });
      }

      // Always explore children if they exist to find level 3 nodes
      if (cat.subCategories && cat.subCategories.length > 0) {
        result = result.concat(this.flattenCategories(cat.subCategories, currentPathAr, currentPathEn, level + 1));
      }
    });
    return result;
  }

  loadBrands(): void {
    this.catalogService.getBrands().subscribe(brands => {
      this.availableBrands = brands;
    });
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
      brandId: val.brandId,
      unitId: val.unitId,
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
