import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '../../../../core/services/catalog.service';
import { MasterProduct } from '../../../../core/models/catalog.model';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppBadgeComponent } from '../../../../shared/components/ui/badge/badge.component';
import { DetailHeaderComponent } from '../../../../shared/components/ui/detail-header/detail-header.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { DataTableComponent, TableColumn } from '../../../../shared/components/ui/data-table/data-table.component';

interface ProductVendorSnapshot {
  nameAr: string;
  nameEn: string;
  quantity: number;
  ratio: number;
  price: number;
  colorClass: string;
  timeKey: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    AppButtonComponent,
    AppBadgeComponent,
    DetailHeaderComponent,
    KeyValueGridComponent,
    SectionHeaderComponent,
    StatusPillComponent,
    DataTableComponent
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
  readonly vendorSnapshots: ProductVendorSnapshot[] = [
    { nameAr: 'مؤسسة الأمين للتجارة', nameEn: 'Alameen Trading Est.', quantity: 850, ratio: 85, price: 120, colorClass: 'bg-emerald-500', timeKey: 'PRODUCTS.DETAIL.TIME_TWO_HOURS_AGO' },
    { nameAr: 'تجارة الجود المريح', nameEn: 'Aljood Comfort Trading', quantity: 420, ratio: 42, price: 125, colorClass: 'bg-red-500', timeKey: 'PRODUCTS.DETAIL.TIME_YESTERDAY' },
    { nameAr: 'تجارة الجملة الحديثة', nameEn: 'Modern Wholesale Trading', quantity: 150, ratio: 15, price: 118, colorClass: 'bg-blue-500', timeKey: 'PRODUCTS.DETAIL.TIME_THREE_DAYS_AGO' },
    { nameAr: 'مؤسسة الوداد', nameEn: 'Alwidad Est.', quantity: 950, ratio: 95, price: 122, colorClass: 'bg-purple-500', timeKey: 'PRODUCTS.DETAIL.TIME_TODAY' },
    { nameAr: 'تجارة الوحدة الحديثة', nameEn: 'Modern Unity Trading', quantity: 600, ratio: 60, price: 120, colorClass: 'bg-pink-500', timeKey: 'PRODUCTS.DETAIL.TIME_WEEK_AGO' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    public translate: TranslateService
  ) {}

  get activeLang(): string {
    return this.translate.currentLang || 'ar';
  }

  readonly vendorTableColumns: TableColumn[] = [
    { key: 'vendor', title: 'PRODUCTS.DETAIL.VENDOR_NAME', type: 'custom', align: 'left', width: '34%' },
    { key: 'quantity', title: 'PRODUCTS.DETAIL.AVAILABLE_QTY', type: 'custom', align: 'center', width: '26%' },
    { key: 'price', title: 'PRODUCTS.DETAIL.UNIT_PRICE', type: 'custom', align: 'center', width: '20%' },
    { key: 'time', title: 'PRODUCTS.DETAIL.LAST_UPDATE', type: 'custom', align: 'center', width: '20%' }
  ];

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
      return this.buildPlaceholderImage(this.activeLang === 'ar' ? 'لا توجد صورة' : 'No Image');
    }
    const selectedImage = this.product.images[this.selectedImageIndex];
    if (selectedImage?.url) {
      return selectedImage.url;
    }
    return this.product.images[0]?.url || this.buildPlaceholderImage(this.activeLang === 'ar' ? 'لا توجد صورة' : 'No Image');
  }

  goBack(): void {
    this.router.navigate(['/catalog/products']);
  }

  editProduct(): void {
    if (this.product?.id) {
      this.router.navigate(['/catalog/products/edit', this.product.id]);
    }
  }

  get detailItems(): KeyValueGridItem[] {
    if (!this.product) {
      return [];
    }

    const notSpecified = this.translate.instant('PRODUCTS.DETAIL.NOT_SPECIFIED');

    return [
      {
        label: 'PRODUCTS.DETAIL.BARCODE',
        value: this.product.barcode || notSpecified,
        translateValue: false,
        valueDir: this.product.barcode ? 'ltr' : 'auto'
      },
      {
        label: 'PRODUCTS.DETAIL.UNIT',
        value: this.unitName || this.product.unitOfMeasureId || notSpecified,
        translateValue: false
      },
      {
        label: 'PRODUCTS.DETAIL.CATEGORY',
        value: this.categoryName || this.product.categoryId || notSpecified,
        translateValue: false
      },
      {
        label: 'PRODUCTS.DETAIL.BRAND',
        value: this.brandName || this.product.brandId || notSpecified,
        translateValue: false
      }
    ];
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
      Active: 'PRODUCTS.DETAIL.STATUS_ACTIVE',
      Draft: 'PRODUCTS.DETAIL.STATUS_DRAFT',
      Inactive: 'PRODUCTS.DETAIL.STATUS_INACTIVE',
      Discontinued: 'PRODUCTS.DETAIL.STATUS_INACTIVE'
    };

    return labels[status || ''] || status || '-';
  }

  getVendorName(vendor: ProductVendorSnapshot): string {
    return this.activeLang === 'ar' ? vendor.nameAr : vendor.nameEn;
  }

  getVendorRatioWidth(vendor: ProductVendorSnapshot): string {
    return `${Math.max(0, Math.min(100, vendor.ratio))}%`;
  }

  private buildPlaceholderImage(label: string): string {
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%23999" text-anchor="middle" dominant-baseline="middle"%3E${encodeURIComponent(label)}%3C/text%3E%3C/svg%3E`;
  }
}
