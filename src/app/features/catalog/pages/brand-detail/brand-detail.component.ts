import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DetailHeaderComponent } from '../../../../shared/components/ui/detail-header/detail-header.component';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { Brand } from '@catalog/models/catalog.domain.models';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';

@Component({
  selector: 'app-brand-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    DetailHeaderComponent,
    StatusPillComponent
  ],
  templateUrl: './brand-detail.component.html',
  styleUrl: './brand-detail.component.scss'
})
export class BrandDetailComponent implements OnInit {
  brand: Brand | null = null;
  products: any[] = [];
  isLoading = true;
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
    }
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
    this.catalogService.getBrands().subscribe({
      next: (brands) => {
        this.brand = brands.find((item) => item.id === id) || null;
        if (this.brand) {
          this.loadBrandProducts(id);
          return;
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading brand', err);
        this.isLoading = false;
      }
    });
  }

  loadBrandProducts(brandId: string): void {
    this.catalogService.getProducts(1, 100, undefined, undefined, brandId).subscribe({
      next: (res) => {
        this.products = res.data || res.items || res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products for brand', err);
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/catalog/brands']);
  }

  editBrand(): void {
    if (this.brand?.id) {
      this.router.navigate(['/catalog/brands/edit', this.brand.id]);
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

  getCoverImageUrl(): string | null {
    return this.brand?.coverImageUrl || this.brand?.logoUrl || null;
  }

  isUsingLogoAsCover(): boolean {
    return !!this.brand?.logoUrl && !this.brand?.coverImageUrl;
  }
}
