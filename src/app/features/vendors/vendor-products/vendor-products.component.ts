import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  variant: string;
  sku: string;
  category: string;
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
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './vendor-products.component.html'
})
export class VendorProductsComponent {
  vendorId: string = 'VND-9928';
  currentLang: string = 'ar';
  isRTL: boolean = true;

  // Summary stats
  totalProducts: number = 1245;
  outOfStock: number = 23;
  underReview: number = 5;
  totalInventoryValue: string = '342,500';

  // Filters
  searchQuery: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';
  selectAll: boolean = false;

  products: Product[] = [
    {
      id: '1',
      nameAr: 'ساعة ذكية ابل واتش سيريز 8',
      nameEn: 'Apple Watch Series 8',
      variant: 'أسود, 45mm',
      sku: 'AW-S8-45-BLK',
      category: 'ساعات ذكية',
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
      id: '2',
      nameAr: 'سماعات رأس لاسلكية سوني',
      nameEn: 'Sony WH-1000XM4',
      variant: 'فضي, إلغاء الضوضاء',
      sku: 'SN-WHXM4-SLV',
      category: 'صوتيات',
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
      id: '3',
      nameAr: 'عدسة كانون 50mm',
      nameEn: 'Canon 50mm f/1.8',
      variant: 'أسود, STM',
      sku: 'CN-50F18-STM',
      category: 'تصوير',
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
      id: '4',
      nameAr: 'نظارة واقع افتراضي Quest 2',
      nameEn: 'Meta Quest 2',
      variant: 'أبيض, 128GB',
      sku: 'MQ-2-128-WHT',
      category: 'ألعاب',
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
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';
    
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === 'ar';
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.vendorId = params['id'];
      }
    });
  }

  onSelectAll() {
    this.products.forEach(p => p.selected = this.selectAll);
  }

  onProductSelect() {
    this.selectAll = this.products.every(p => p.selected);
  }

  onAddProduct() {
    console.log('Add new product');
  }

  onEditVendorData() {
    console.log('Edit vendor data');
  }

  onViewProduct(productId: string) {
    console.log('View product:', productId);
  }

  onEditProduct(productId: string) {
    console.log('Edit product:', productId);
  }

  onDeleteProduct(productId: string) {
    console.log('Delete product:', productId);
  }

  onFilterProducts() {
    console.log('Filter products');
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
}
