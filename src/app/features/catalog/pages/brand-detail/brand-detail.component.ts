import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { DetailHeaderComponent } from '../../../../shared/components/ui/detail-header/detail-header.component';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { Brand, MasterProduct } from '@catalog/models/catalog.domain.models';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { BrandFormModalComponent } from '../../components/brand-form-modal/brand-form-modal.component';

type BrandDetailProduct = MasterProduct & {
  categoryNameAr?: string;
  categoryNameEn?: string;
};

@Component({
  selector: 'app-brand-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    DetailHeaderComponent,
    StatusPillComponent,
    BrandFormModalComponent
  ],
  templateUrl: './brand-detail.component.html',
  styleUrl: './brand-detail.component.scss'
})
export class BrandDetailComponent implements OnInit {
  brand: Brand | null = null;
  products: BrandDetailProduct[] = [];
  isLoading = true;
  isEditModalOpen = false;
  breadcrumbs: { label: string; action?: () => void }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    public translate: TranslateService
  ) {}

  get activeLang(): string {
    return this.translate.currentLang || 'ar';
  }

  ngOnInit(): void {
    this.setupBreadcrumbs();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBrand(id);
      return;
    }

    this.isLoading = false;
  }

  setupBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: this.translate.instant('SIDEBAR.CATALOG'), action: () => this.goBack() },
      { label: this.translate.instant('BRANDS.TITLE'), action: () => this.goBack() },
      { label: this.translate.instant('BRANDS.DETAIL.TITLE') }
    ];
  }

  loadBrand(id: string): void {
    this.isLoading = true;
    this.brand = null;
    this.products = [];

    this.catalogService.getBrandById(id).pipe(
      switchMap((brand) =>
        forkJoin({
          brand: of(brand),
          products: this.catalogService.getProducts(1, 100, undefined, undefined, id).pipe(
            map((response) => (response.data || response.items || []) as BrandDetailProduct[]),
            catchError((error) => {
              console.error('Error loading products for brand', error);
              return of([]);
            })
          )
        })
      ),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: ({ brand, products }) => {
        this.brand = brand;
        this.products = products;
      },
      error: (err) => {
        console.error('Error loading brand', err);
        this.brand = null;
        this.products = [];
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/catalog/brands']);
  }

  editBrand(): void {
    this.isEditModalOpen = !!this.brand;
  }

  onEditModalClosed(): void {
    this.isEditModalOpen = false;
  }

  onBrandSaved(): void {
    const id = this.brand?.id;
    this.isEditModalOpen = false;
    if (id) {
      this.loadBrand(id);
    }
  }

  getBrandStatusVariant(isActive: boolean): StatusPillVariant {
    return isActive ? 'success' : 'paused';
  }

  getProductStatusVariant(status?: string): StatusPillVariant {
    const variants: Record<string, StatusPillVariant> = {
      Active: 'success',
      Draft: 'warning',
      Inactive: 'paused',
      Discontinued: 'danger'
    };

    return variants[status || ''] ?? 'neutral';
  }

  getProductStatusLabel(status?: string): string {
    const labels: Record<string, string> = {
      Active: 'BRANDS.DETAIL.STATUS_ACTIVE',
      Draft: 'BRANDS.DETAIL.STATUS_DRAFT',
      Inactive: 'BRANDS.DETAIL.STATUS_INACTIVE',
      Discontinued: 'BRANDS.DETAIL.STATUS_STOPPED'
    };

    return labels[status || ''] || status || '-';
  }

  getLocalizedCategoryName(): string {
    if (!this.brand) {
      return '-';
    }

    return this.activeLang === 'ar'
      ? (this.brand.categoryNameAr || this.brand.categoryNameEn || '-')
      : (this.brand.categoryNameEn || this.brand.categoryNameAr || '-');
  }

  getBrandDisplayName(): string {
    if (!this.brand) {
      return '';
    }

    return this.activeLang === 'ar'
      ? (this.brand.nameAr || this.brand.nameEn)
      : (this.brand.nameEn || this.brand.nameAr);
  }

  getBrandSecondaryName(): string {
    if (!this.brand) {
      return '';
    }

    return this.activeLang === 'ar'
      ? (this.brand.nameEn || this.brand.nameAr)
      : (this.brand.nameAr || this.brand.nameEn);
  }

  getProductDisplayName(product: BrandDetailProduct): string {
    return this.activeLang === 'ar'
      ? (product.nameAr || product.nameEn)
      : (product.nameEn || product.nameAr);
  }

  getProductCategoryName(product: BrandDetailProduct): string {
    return this.activeLang === 'ar'
      ? (product.categoryNameAr || product.categoryNameEn || '-')
      : (product.categoryNameEn || product.categoryNameAr || '-');
  }

  getProductsCount(): number {
    return this.brand?.masterProductsCount ?? this.products.length;
  }

  getBrandInitials(): string {
    const name = this.getBrandDisplayName() || 'B';
    return name.trim().slice(0, 2).toUpperCase();
  }

  getCoverImageUrl(): string | null {
    return this.brand?.coverImageUrl || this.brand?.logoUrl || null;
  }

  isUsingLogoAsCover(): boolean {
    return !!this.brand?.logoUrl && !this.brand?.coverImageUrl;
  }
}
