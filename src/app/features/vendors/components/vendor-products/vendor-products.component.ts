import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppInputComponent } from '../../../../shared/components/ui/form-controls/input/input.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { AdminVendorProductItem, VendorService } from '@vendors/services/vendor.api.service';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

interface Product {
  id: string;
  masterProductId: string;
  nameAr: string;
  nameEn: string;
  variant: string;
  sku: string;
  price: number;
  stock: number;
  stockPercentage: number;
  stockStatus: 'high' | 'low' | 'out';
  status: 'active' | 'out_of_stock' | 'under_review';
  statusKey: string;
  imageUrl: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-vendor-products',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, StatusPillComponent, AppButtonComponent, AppInputComponent, SearchableSelectComponent, AppPaginationComponent],
  templateUrl: './vendor-products.component.html'
})
export class VendorProductsComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  vendorId = '';
  currentLang = 'ar';
  isRTL = true;
  searchQuery = '';
  selectedStatus = '';
  isLoading = false;
  hasError = false;
  currentPage = 1;
  readonly pageSize = 12;
  totalItems = 0;
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  products: Product[] = [];

  readonly statusOptions: SearchableSelectOption<string>[] = [
    { value: '', labelKey: 'VENDOR_PRODUCTS.PRODUCT_STATUS' },
    { value: 'active', labelKey: 'VENDOR_PRODUCTS.STATUS.ACTIVE' },
    { value: 'under_review', labelKey: 'VENDOR_PRODUCTS.STATUS.UNDER_REVIEW' },
    { value: 'out_of_stock', labelKey: 'VENDOR_PRODUCTS.STATUS.OUT_OF_STOCK' }
  ];

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly vendorService: VendorService,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
      this.cdr.markForCheck();
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
      });

    this.searchSubject
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
      this.cdr.markForCheck();
        this.currentPage = 1;
        this.loadProducts();
      });

    this.vendorDetailFacade.vendorId$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendorId) => {
      this.cdr.markForCheck();
        if (!vendorId) {
          return;
        }

        this.vendorId = vendorId;
        this.currentPage = 1;
        this.loadProducts();
      });
  }

  get totalProducts(): number {
    return this.totalItems;
  }

  get filteredProducts(): Product[] {
    return this.products;
  }

  get activeProducts(): number {
    return this.products.filter((product) => product.status === 'active').length;
  }

  get outOfStock(): number {
    return this.products.filter((product) => product.status === 'out_of_stock').length;
  }

  get lowStockProducts(): number {
    return this.products.filter((product) => product.stockStatus === 'low').length;
  }

  get totalInventoryValue(): number {
    return this.products.reduce((sum, product) => sum + product.price * product.stock, 0);
  }

  get hasProducts(): boolean {
    return this.products.length > 0;
  }

  get showingCountLabel(): string {
    return `${this.formatNumber(this.products.length)} / ${this.formatNumber(this.totalProducts)}`;
  }

  get hasActiveFilters(): boolean {
    return !!this.searchQuery.trim() || !!this.selectedStatus;
  }

  get activeFilterCount(): number {
    let count = 0;

    if (this.searchQuery.trim()) {
      count += 1;
    }

    if (this.selectedStatus) {
      count += 1;
    }

    return count;
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onViewProduct(productId: string): void {
    this.router.navigate(['/catalog/products/view', productId]);
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    if (!this.searchQuery && !this.selectedStatus) {
      return;
    }

    this.searchQuery = '';
    this.selectedStatus = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    if (page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.loadProducts();
  }

  getStockColorClass(status: string): string {
    switch (status) {
      case 'high': return 'text-gray-600';
      case 'low': return 'text-orange-600';
      case 'out': return 'text-red-500';
      default: return 'text-gray-600';
    }
  }

  getStockBarClass(status: string): string {
    switch (status) {
      case 'high': return 'bg-primary';
      case 'low': return 'bg-orange-500';
      case 'out': return 'bg-red-500';
      default: return 'bg-primary';
    }
  }

  getProductStatusVariant(status: Product['status']): StatusPillVariant {
    switch (status) {
      case 'active':
        return 'success';
      case 'under_review':
        return 'warning';
      case 'out_of_stock':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.hasError = false;

    this.vendorService.getVendorProducts(this.vendorId, {
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchQuery,
      status: this.selectedStatus
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
        this.cdr.markForCheck();
          this.products = (response.items ?? []).map((product) => this.mapProduct(product));
          this.totalItems = response.totalCount ?? this.products.length;
          this.isLoading = false;
        },
        error: () => {
        this.cdr.markForCheck();
          this.products = [];
          this.totalItems = 0;
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }

  private mapProduct(product: AdminVendorProductItem): Product {
    const primaryImage = product.masterProduct.images.find((image) => image.isPrimary)?.url
      || product.masterProduct.images[0]?.url
      || '';
    const normalizedStatus = this.normalizeProductStatus(product);

    return {
      id: product.id,
      masterProductId: product.masterProductId,
      nameAr: product.masterProduct.nameAr,
      nameEn: product.masterProduct.nameEn,
      variant: product.masterProduct.barcode || product.masterProduct.slug,
      sku: product.masterProduct.barcode?.trim() || product.masterProduct.slug?.trim() || '—',
      price: product.sellingPrice,
      stock: product.stockQuantity,
      stockPercentage: Math.max(0, Math.min(100, product.stockQuantity >= 20 ? 100 : (product.stockQuantity / 20) * 100)),
      stockStatus: product.stockQuantity <= 0 ? 'out' : product.stockQuantity <= 5 ? 'low' : 'high',
      status: normalizedStatus,
      statusKey: normalizedStatus === 'active'
        ? 'VENDOR_PRODUCTS.STATUS.ACTIVE'
        : normalizedStatus === 'under_review'
          ? 'VENDOR_PRODUCTS.STATUS.UNDER_REVIEW'
          : 'VENDOR_PRODUCTS.STATUS.OUT_OF_STOCK',
      imageUrl: primaryImage
    };
  }

  private normalizeProductStatus(product: AdminVendorProductItem): Product['status'] {
    if (!product.isAvailable || product.stockQuantity <= 0 || product.status.toLowerCase().includes('inactive')) {
      return 'out_of_stock';
    }

    if (product.status.toLowerCase().includes('review') || product.status.toLowerCase().includes('pending')) {
      return 'under_review';
    }

    return 'active';
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      maximumFractionDigits: 0
    }).format(value);
  }

  formatCurrency(value: number): string {
    return `${this.formatNumber(value)} ${this.translate.instant('COMMON.CURRENCY_SAR')}`;
  }
}
