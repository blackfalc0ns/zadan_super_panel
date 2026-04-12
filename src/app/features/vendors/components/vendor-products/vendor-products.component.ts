import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { AdminVendorProductItem, VendorService } from '@vendors/services/vendor.api.service';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  variant: string;
  sku: string;
  category: string;
  categoryId: string;
  price: string;
  stock: number;
  stockPercentage: number;
  stockStatus: 'high' | 'low' | 'out';
  status: 'active' | 'out_of_stock' | 'under_review';
  statusKey: string;
  imageUrl: string;
  selected: boolean;
}

@Component({
  selector: 'app-vendor-products',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SectionHeaderComponent, StatusPillComponent],
  templateUrl: './vendor-products.component.html'
})
export class VendorProductsComponent {
  vendorId = '';
  currentLang = 'ar';
  isRTL = true;
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  selectAll = false;
  private readonly destroyRef = inject(DestroyRef);

  products: Product[] = [];

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
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
      });

    this.vendorDetailFacade.vendorId$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendorId) => {
        if (!vendorId) {
          return;
        }

        this.vendorId = vendorId;
        this.loadProducts();
      });
  }

  get filteredProducts(): Product[] {
    const normalizedSearch = this.searchQuery.trim().toLowerCase();

    return this.products.filter((product) => {
      const matchesSearch = !normalizedSearch || [
        product.nameAr,
        product.nameEn,
        product.sku,
        product.category
      ].some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesCategory = !this.selectedCategory || product.categoryId === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || product.status === this.selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  get totalProducts(): number {
    return this.products.length;
  }

  get outOfStock(): number {
    return this.products.filter((product) => product.status === 'out_of_stock').length;
  }

  get underReview(): number {
    return this.products.filter((product) => product.status === 'under_review').length;
  }

  get totalInventoryValue(): string {
    const total = this.products.reduce((sum, product) => sum + Number(product.price.replace(/,/g, '')) * product.stock, 0);
    return total.toLocaleString('en-US');
  }

  onSelectAll(): void {
    this.filteredProducts.forEach((product) => {
      product.selected = this.selectAll;
    });
  }

  onProductSelect(): void {
    this.selectAll = this.filteredProducts.length > 0 && this.filteredProducts.every((product) => product.selected);
  }

  onAddProduct(): void {
    this.router.navigate(['/catalog/products/create']);
  }

  onViewProduct(productId: string): void {
    this.router.navigate(['/catalog/products/view', productId]);
  }

  onEditProduct(productId: string): void {
    this.router.navigate(['/catalog/products/edit', productId]);
  }

  onDeleteProduct(productId: string): void {
    this.products = this.products.filter((product) => product.id !== productId);
    this.selectAll = false;
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
    this.vendorService.getVendorProducts(this.vendorId, 1, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.products = (response.items ?? []).map((product) => this.mapProduct(product));
          this.selectAll = false;
        },
        error: () => {
          this.products = [];
          this.selectAll = false;
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
      nameAr: product.masterProduct.nameAr,
      nameEn: product.masterProduct.nameEn,
      variant: product.masterProduct.barcode || product.masterProduct.slug,
      sku: product.masterProduct.barcode || product.id,
      category: product.masterProduct.status,
      categoryId: product.masterProduct.categoryId,
      price: product.sellingPrice.toLocaleString('en-US'),
      stock: product.stockQuantity,
      stockPercentage: Math.max(0, Math.min(100, product.stockQuantity)),
      stockStatus: product.stockQuantity <= 0 ? 'out' : product.stockQuantity <= 5 ? 'low' : 'high',
      status: normalizedStatus,
      statusKey: normalizedStatus === 'active'
        ? 'VENDOR_PRODUCTS.STATUS.ACTIVE'
        : normalizedStatus === 'under_review'
          ? 'VENDOR_PRODUCTS.STATUS.UNDER_REVIEW'
          : 'VENDOR_PRODUCTS.STATUS.OUT_OF_STOCK',
      imageUrl: primaryImage,
      selected: false
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
}
