import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';

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
  statusClass: string;
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
  vendorId = 'VND-9928';
  currentLang = 'ar';
  isRTL = true;
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  selectAll = false;
  private readonly destroyRef = inject(DestroyRef);

  products: Product[] = [
    {
      id: 'PRD-24001',
      nameAr: 'Ø³Ø§Ø¹Ø© Ø°ÙƒÙŠØ© Ø§Ø¨Ù„ ÙˆØ§ØªØ´ Ø³ÙŠØ±ÙŠØ² 8',
      nameEn: 'Apple Watch Series 8',
      variant: 'Ø£Ø³ÙˆØ¯, 45mm',
      sku: 'AW-S8-45-BLK',
      category: 'Ø³Ø§Ø¹Ø§Øª Ø°ÙƒÙŠØ©',
      categoryId: 'CAT-ELECTRONICS',
      price: '1,599',
      stock: 45,
      stockPercentage: 75,
      stockStatus: 'high',
      status: 'active',
      statusKey: 'VENDOR_PRODUCTS.STATUS.ACTIVE',
      statusClass: 'bg-green-50 text-green-700 border-green-200',
      imageUrl: 'https://via.placeholder.com/40',
      selected: false
    },
    {
      id: 'PRD-24002',
      nameAr: 'Ø³Ù…Ø§Ø¹Ø§Øª Ø±Ø£Ø³ Ù„Ø§Ø³Ù„ÙƒÙŠØ© Ø³ÙˆÙ†ÙŠ',
      nameEn: 'Sony WH-1000XM4',
      variant: 'ÙØ¶ÙŠ, Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø¶ÙˆØ¶Ø§Ø¡',
      sku: 'SN-WHXM4-SLV',
      category: 'ØµÙˆØªÙŠØ§Øª',
      categoryId: 'CAT-AUDIO',
      price: '1,249',
      stock: 3,
      stockPercentage: 10,
      stockStatus: 'low',
      status: 'active',
      statusKey: 'VENDOR_PRODUCTS.STATUS.ACTIVE',
      statusClass: 'bg-green-50 text-green-700 border-green-200',
      imageUrl: 'https://via.placeholder.com/40',
      selected: false
    },
    {
      id: 'PRD-24003',
      nameAr: 'Ø¹Ø¯Ø³Ø© ÙƒØ§Ù†ÙˆÙ† 50mm',
      nameEn: 'Canon 50mm f/1.8',
      variant: 'Ø£Ø³ÙˆØ¯, STM',
      sku: 'CN-50F18-STM',
      category: 'ØªØµÙˆÙŠØ±',
      categoryId: 'CAT-CAMERAS',
      price: '499',
      stock: 0,
      stockPercentage: 0,
      stockStatus: 'out',
      status: 'out_of_stock',
      statusKey: 'VENDOR_PRODUCTS.STATUS.OUT_OF_STOCK',
      statusClass: 'bg-red-50 text-red-700 border-red-200',
      imageUrl: 'https://via.placeholder.com/40',
      selected: false
    },
    {
      id: 'PRD-24004',
      nameAr: 'Ù†Ø¸Ø§Ø±Ø© ÙˆØ§Ù‚Ø¹ Ø§ÙØªØ±Ø§Ø¶ÙŠ Quest 2',
      nameEn: 'Meta Quest 2',
      variant: 'Ø£Ø¨ÙŠØ¶, 128GB',
      sku: 'MQ-2-128-WHT',
      category: 'Ø£Ù„Ø¹Ø§Ø¨',
      categoryId: 'CAT-GAMING',
      price: '1,899',
      stock: 12,
      stockPercentage: 30,
      stockStatus: 'high',
      status: 'under_review',
      statusKey: 'VENDOR_PRODUCTS.STATUS.UNDER_REVIEW',
      statusClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      imageUrl: 'https://via.placeholder.com/40',
      selected: false
    }
  ];

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
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
        if (vendorId) {
          this.vendorId = vendorId;
        }
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
}
