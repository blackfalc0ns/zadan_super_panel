import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '../../../core/services/catalog.service';
import { MasterProduct } from '../../../core/models/catalog.model';
import { AppButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AppBadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { DetailHeaderComponent } from '../../../shared/components/ui/detail-header/detail-header.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    AppButtonComponent,
    AppBadgeComponent,
    DetailHeaderComponent
  ],
  templateUrl: './product-detail.component.html',
  styles: []
})
export class ProductDetailComponent implements OnInit {
  product: MasterProduct | null = null;
  isLoading = true;
  selectedImageIndex = 0;
  categoryName: string = '';
  brandName: string = '';
  unitName: string = '';
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
      this.loadProduct(id);
    }
  }

  setupBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: this.translate.instant('SIDEBAR.CATALOG'), action: () => this.goBack() },
      { label: this.translate.instant('PRODUCTS.TITLE'), action: () => this.goBack() },
      { label: this.translate.instant('PRODUCTS.DETAIL.TITLE') }
    ];
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.catalogService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loadCategoryAndBrand();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading product', err);
        this.isLoading = false;
      }
    });
  }

  loadCategoryAndBrand(): void {
    if (this.product?.categoryId) {
      this.catalogService.getCategoryById(this.product.categoryId).subscribe({
        next: (category) => {
          this.categoryName = this.activeLang === 'ar' ? category.nameAr : category.nameEn;
        },
        error: (err) => console.error('Error loading category', err)
      });
    }

    if (this.product?.brandId) {
      this.catalogService.getBrands().subscribe({
        next: (brands) => {
          const brand = brands.find(b => b.id === this.product?.brandId);
          if (brand) {
            this.brandName = this.activeLang === 'ar' ? brand.nameAr : brand.nameEn;
          }
        },
        error: (err) => console.error('Error loading brands', err)
      });
    }

    if (this.product?.unitOfMeasureId) {
      this.catalogService.getUnits().subscribe({
        next: (units) => {
          const unit = units.find(u => u.id === this.product?.unitOfMeasureId);
          if (unit) {
            this.unitName = this.activeLang === 'ar' ? unit.nameAr : unit.nameEn;
          }
        },
        error: (err) => console.error('Error loading units', err)
      });
    }
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  getMainImage(): string {
    if (!this.product?.images || this.product.images.length === 0) {
      return 'assets/images/placeholder-product.png';
    }
    const selectedImage = this.product.images[this.selectedImageIndex];
    if (selectedImage?.url) {
      return selectedImage.url;
    }
    return this.product.images[0]?.url || 'assets/images/placeholder-product.png';
  }

  goBack(): void {
    this.router.navigate(['/catalog/products']);
  }

  editProduct(): void {
    if (this.product?.id) {
      this.router.navigate(['/catalog/products/edit', this.product.id]);
    }
  }
}
