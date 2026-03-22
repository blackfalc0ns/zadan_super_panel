# أمثلة الاستخدام للـ Mobile Components

## مثال 1: استخدام Mobile Vendor Cards في صفحة جديدة

```typescript
// في any-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileVendorCardsComponent, VendorCardData } from '../shared/components/ui';

@Component({
  selector: 'app-any-page',
  standalone: true,
  imports: [CommonModule, MobileVendorCardsComponent],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">قائمة الموردين</h1>
      
      <app-mobile-vendor-cards
        [vendors]="vendors"
        [selectedVendorIds]="selectedIds"
        [isLoading]="isLoading"
        [showError]="showError"
        [activeLang]="'ar'"
        (cardClick)="handleCardClick($event)"
        (selectionChange)="handleSelection($event)"
        (quickApprove)="handleApprove($event)"
        (requestDocuments)="handleDocuments($event)">
      </app-mobile-vendor-cards>
    </div>
  `
})
export class AnyPageComponent {
  vendors: VendorCardData[] = [
    {
      id: '1',
      businessNameAr: 'شركة التجارة الحديثة',
      businessNameEn: 'Modern Trade Company',
      contactEmail: 'info@modern-trade.com',
      status: 'Active',
      documentsCompleteness: 85,
      riskLevel: 'Low',
      commissionRate: 5,
      commissionType: 'Percentage',
      alerts: []
    }
  ];
  
  selectedIds: string[] = [];
  isLoading = false;
  showError = false;

  handleCardClick(vendor: VendorCardData) {
    console.log('Card clicked:', vendor);
  }

  handleSelection(event: { vendorId: string; selected: boolean }) {
    if (event.selected) {
      this.selectedIds = [...this.selectedIds, event.vendorId];
    } else {
      this.selectedIds = this.selectedIds.filter(id => id !== event.vendorId);
    }
  }

  handleApprove(event: { vendor: VendorCardData; event: Event }) {
    console.log('Approve vendor:', event.vendor);
  }

  handleDocuments(event: { vendor: VendorCardData; event: Event }) {
    console.log('Request documents:', event.vendor);
  }
}
```

## مثال 2: استخدام Mobile Product Card منفرد

```typescript
// في product-preview.component.ts
import { Component, Input } from '@angular/core';
import { MobileProductCardComponent, ProductCardData } from '../shared/components/ui';

@Component({
  selector: 'app-product-preview',
  standalone: true,
  imports: [MobileProductCardComponent],
  template: `
    <div class="max-w-sm mx-auto">
      <app-mobile-product-card
        [product]="product"
        [isSelected]="false"
        [activeLang]="'ar'"
        (cardClick)="onProductClick($event)"
        (edit)="onProductEdit($event)">
      </app-mobile-product-card>
    </div>
  `
})
export class ProductPreviewComponent {
  @Input() product: ProductCardData = {
    id: '1',
    nameAr: 'هاتف ذكي',
    nameEn: 'Smartphone',
    sku: 'PHONE-001',
    status: 'Active',
    price: 1500,
    currency: 'ر.س',
    category: 'إلكترونيات',
    brand: 'سامسونج',
    stock: 25,
    rating: 4.5,
    reviewsCount: 120
  };

  onProductClick(product: ProductCardData) {
    console.log('Product clicked:', product);
  }

  onProductEdit(event: { product: ProductCardData; event: Event }) {
    console.log('Edit product:', event.product);
  }
}
```

## مثال 3: إنشاء Mobile Card مخصص للطلبات

```typescript
// mobile-order-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OrderCardData {
  id: string;
  orderNumber: string;
  customerName: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  currency: string;
  createdAt: string;
  itemsCount: number;
}

@Component({
  selector: 'app-mobile-order-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div (click)="onCardClick()"
         class="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
      
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <h3 class="text-sm font-bold text-slate-900">
            طلب #{{ order.orderNumber }}
          </h3>
          <p class="text-xs text-slate-500">
            {{ order.customerName }}
          </p>
        </div>
        
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
             [ngClass]="getStatusClasses()">
          <span class="w-1 h-1 rounded-full" [ngClass]="getStatusDotClasses()"></span>
          {{ getStatusLabel() }}
        </div>
      </div>

      <!-- Details -->
      <div class="space-y-2 mb-4">
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500">المبلغ الإجمالي</span>
          <span class="text-xs font-bold text-zadna-primary">
            {{ order.total }} {{ order.currency }}
          </span>
        </div>
        
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500">عدد المنتجات</span>
          <span class="text-xs font-medium text-slate-700">
            {{ order.itemsCount }} منتج
          </span>
        </div>
        
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500">تاريخ الطلب</span>
          <span class="text-xs font-medium text-slate-700">
            {{ order.createdAt | date:'short' }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 pt-3 border-t border-slate-100" (click)="$event.stopPropagation()">
        <button (click)="onViewDetails($event)"
                class="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium hover:bg-blue-500 hover:text-white transition-all">
          عرض التفاصيل
        </button>
        
        <button *ngIf="order.status === 'Pending'" 
                (click)="onProcess($event)"
                class="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-500 hover:text-white transition-all">
          معالجة
        </button>
      </div>
    </div>
  `
})
export class MobileOrderCardComponent {
  @Input() order!: OrderCardData;
  
  @Output() cardClick = new EventEmitter<OrderCardData>();
  @Output() viewDetails = new EventEmitter<{ order: OrderCardData; event: Event }>();
  @Output() process = new EventEmitter<{ order: OrderCardData; event: Event }>();

  onCardClick(): void {
    this.cardClick.emit(this.order);
  }

  onViewDetails(event: Event): void {
    this.viewDetails.emit({ order: this.order, event });
  }

  onProcess(event: Event): void {
    this.process.emit({ order: this.order, event });
  }

  getStatusLabel(): string {
    const statusLabels = {
      'Pending': 'في الانتظار',
      'Processing': 'قيد المعالجة',
      'Shipped': 'تم الشحن',
      'Delivered': 'تم التسليم',
      'Cancelled': 'ملغي'
    };
    return statusLabels[this.order.status] || this.order.status;
  }

  getStatusClasses(): string {
    const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold';
    
    switch (this.order.status) {
      case 'Delivered':
        return `${baseClasses} bg-emerald-50 text-emerald-600`;
      case 'Shipped':
        return `${baseClasses} bg-blue-50 text-blue-600`;
      case 'Processing':
        return `${baseClasses} bg-amber-50 text-amber-600`;
      case 'Pending':
        return `${baseClasses} bg-slate-50 text-slate-600`;
      case 'Cancelled':
        return `${baseClasses} bg-red-50 text-red-600`;
      default:
        return `${baseClasses} bg-slate-50 text-slate-600`;
    }
  }

  getStatusDotClasses(): string {
    switch (this.order.status) {
      case 'Delivered':
        return 'bg-emerald-500';
      case 'Shipped':
        return 'bg-blue-500';
      case 'Processing':
        return 'bg-amber-500';
      case 'Pending':
        return 'bg-slate-500';
      case 'Cancelled':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  }
}
```

## مثال 4: استخدام الـ Components مع Service

```typescript
// vendor-cards.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { VendorCardData } from '../shared/components/ui';

@Injectable({
  providedIn: 'root'
})
export class VendorCardsService {
  
  getVendorCards(): Observable<VendorCardData[]> {
    // في التطبيق الحقيقي، هذا سيكون HTTP call
    const mockData: VendorCardData[] = [
      {
        id: '1',
        businessNameAr: 'شركة الأغذية المتميزة',
        businessNameEn: 'Premium Foods Company',
        contactEmail: 'contact@premium-foods.com',
        status: 'Active',
        documentsCompleteness: 95,
        riskLevel: 'Low',
        commissionRate: 3.5,
        commissionType: 'Percentage',
        alerts: []
      },
      {
        id: '2',
        businessNameAr: 'متجر الإلكترونيات الحديث',
        businessNameEn: 'Modern Electronics Store',
        contactEmail: 'info@modern-electronics.com',
        status: 'Pending',
        documentsCompleteness: 60,
        riskLevel: 'Medium',
        commissionRate: 5,
        commissionType: 'Percentage',
        alerts: ['مستندات ناقصة', 'مراجعة امتثال معلقة']
      }
    ];
    
    return of(mockData);
  }
}
```

```typescript
// vendor-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { MobileVendorCardsComponent, VendorCardData } from '../shared/components/ui';
import { VendorCardsService } from './vendor-cards.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [MobileVendorCardsComponent],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">لوحة تحكم الموردين</h1>
      
      <app-mobile-vendor-cards
        [vendors]="vendors"
        [selectedVendorIds]="selectedVendorIds"
        [isLoading]="isLoading"
        [showError]="showError"
        [errorMessage]="errorMessage"
        [activeLang]="'ar'"
        (cardClick)="handleCardClick($event)"
        (selectionChange)="handleSelectionChange($event)"
        (quickApprove)="handleQuickApprove($event)"
        (requestDocuments)="handleRequestDocuments($event)"
        (retry)="loadVendors()"
        (refresh)="loadVendors()">
      </app-mobile-vendor-cards>
    </div>
  `
})
export class VendorDashboardComponent implements OnInit {
  vendors: VendorCardData[] = [];
  selectedVendorIds: string[] = [];
  isLoading = false;
  showError = false;
  errorMessage = '';

  constructor(private vendorCardsService: VendorCardsService) {}

  ngOnInit() {
    this.loadVendors();
  }

  loadVendors() {
    this.isLoading = true;
    this.showError = false;
    
    this.vendorCardsService.getVendorCards().subscribe({
      next: (vendors) => {
        this.vendors = vendors;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vendors:', error);
        this.showError = true;
        this.errorMessage = 'فشل في تحميل بيانات الموردين';
        this.isLoading = false;
      }
    });
  }

  handleCardClick(vendor: VendorCardData) {
    console.log('Vendor selected:', vendor);
    // Navigate to vendor details or open modal
  }

  handleSelectionChange(event: { vendorId: string; selected: boolean }) {
    if (event.selected) {
      this.selectedVendorIds = [...this.selectedVendorIds, event.vendorId];
    } else {
      this.selectedVendorIds = this.selectedVendorIds.filter(id => id !== event.vendorId);
    }
  }

  handleQuickApprove(event: { vendor: VendorCardData; event: Event }) {
    console.log('Quick approve:', event.vendor);
    // Implement approval logic
  }

  handleRequestDocuments(event: { vendor: VendorCardData; event: Event }) {
    console.log('Request documents:', event.vendor);
    // Implement document request logic
  }
}
```

هذه الأمثلة توضح كيفية استخدام الـ Mobile Components في سيناريوهات مختلفة وكيفية تخصيصها حسب الحاجة.


---

## مثال 8: استخدام Delete Confirmation Modal

### في أي صفحة تحتاج تأكيد حذف

```typescript
// في your-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteConfirmationModalComponent } from '../shared/components/ui/delete-confirmation-modal/delete-confirmation-modal.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-your-page',
  standalone: true,
  imports: [CommonModule, DeleteConfirmationModalComponent, TranslateModule],
  template: `
    <div class="p-4">
      <!-- قائمة العناصر -->
      <div *ngFor="let item of items" class="flex items-center justify-between p-4 bg-white rounded-lg mb-2">
        <span>{{ item.name }}</span>
        <button (click)="openDeleteModal(item)" 
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
          حذف
        </button>
      </div>

      <!-- Modal التأكيد -->
      <app-delete-confirmation-modal
          [isOpen]="isDeleteModalOpen"
          [title]="translate.currentLang === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'"
          [message]="translate.currentLang === 'ar' ? 'هل أنت متأكد من حذف هذا العنصر؟' : 'Are you sure?'"
          [itemName]="itemToDelete?.name"
          [confirmText]="translate.currentLang === 'ar' ? 'حذف' : 'Delete'"
          [cancelText]="translate.currentLang === 'ar' ? 'إلغاء' : 'Cancel'"
          [isDeleting]="isDeleting"
          (confirm)="confirmDelete()"
          (cancel)="cancelDelete()">
      </app-delete-confirmation-modal>
    </div>
  `
})
export class YourPageComponent {
  items = [
    { id: '1', name: 'عنصر 1' },
    { id: '2', name: 'عنصر 2' }
  ];

  isDeleteModalOpen = false;
  itemToDelete: any = null;
  isDeleting = false;

  constructor(public translate: TranslateService, private yourService: YourService) {}

  openDeleteModal(item: any) {
    this.itemToDelete = item;
    this.isDeleteModalOpen = true;
  }

  confirmDelete() {
    if (!this.itemToDelete) return;
    
    this.isDeleting = true;
    
    this.yourService.delete(this.itemToDelete.id).subscribe({
      next: () => {
        // نجح الحذف
        this.isDeleting = false;
        this.isDeleteModalOpen = false;
        this.itemToDelete = null;
        
        // تحديث القائمة
        this.items = this.items.filter(i => i.id !== this.itemToDelete.id);
      },
      error: (err) => {
        // فشل الحذف
        console.error('Delete failed', err);
        this.isDeleting = false;
        alert('فشل الحذف');
      }
    });
  }

  cancelDelete() {
    this.isDeleteModalOpen = false;
    this.itemToDelete = null;
    this.isDeleting = false;
  }
}
```

### مثال متقدم: حذف مع رسالة نجاح

```typescript
import { Component } from '@angular/core';
import { DeleteConfirmationModalComponent } from '../shared/components/ui/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [DeleteConfirmationModalComponent],
  template: `
    <!-- Product List -->
    <div *ngFor="let product of products">
      <button (click)="openDeleteModal(product)">حذف</button>
    </div>

    <!-- Delete Modal -->
    <app-delete-confirmation-modal
        [isOpen]="isDeleteModalOpen"
        [title]="'تأكيد حذف المنتج'"
        [message]="'سيتم حذف المنتج وجميع بياناته المرتبطة بشكل نهائي'"
        [itemName]="productToDelete ? (translate.currentLang === 'ar' ? productToDelete.nameAr : productToDelete.nameEn) : ''"
        [confirmText]="'حذف المنتج'"
        [cancelText]="'إلغاء'"
        [isDeleting]="isDeleting"
        (confirm)="confirmDelete()"
        (cancel)="cancelDelete()">
    </app-delete-confirmation-modal>

    <!-- Success Toast (optional) -->
    <div *ngIf="showSuccessToast" 
         class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
      تم حذف المنتج بنجاح
    </div>
  `
})
export class ProductsPageComponent {
  products: any[] = [];
  isDeleteModalOpen = false;
  productToDelete: any = null;
  isDeleting = false;
  showSuccessToast = false;

  constructor(
    private catalogService: CatalogService,
    public translate: TranslateService
  ) {}

  openDeleteModal(product: any) {
    this.productToDelete = product;
    this.isDeleteModalOpen = true;
  }

  confirmDelete() {
    if (!this.productToDelete) return;
    
    this.isDeleting = true;
    
    this.catalogService.deleteProduct(this.productToDelete.id).subscribe({
      next: () => {
        // إغلاق الـ modal
        this.isDeleting = false;
        this.isDeleteModalOpen = false;
        
        // إظهار رسالة النجاح
        this.showSuccessToast = true;
        setTimeout(() => this.showSuccessToast = false, 3000);
        
        // تحديث القائمة
        this.loadProducts();
        
        // إعادة تعيين
        this.productToDelete = null;
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.isDeleting = false;
        
        // إظهار رسالة خطأ
        const errorMsg = this.translate.currentLang === 'ar' 
          ? 'فشل حذف المنتج. حاول مرة أخرى.' 
          : 'Failed to delete product. Try again.';
        alert(errorMsg);
      }
    });
  }

  cancelDelete() {
    this.isDeleteModalOpen = false;
    this.productToDelete = null;
    this.isDeleting = false;
  }

  loadProducts() {
    // إعادة تحميل المنتجات
    this.catalogService.getProducts().subscribe(products => {
      this.products = products;
    });
  }
}
```

### Props المتاحة للـ Delete Modal

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `isOpen` | `boolean` | ✅ | `false` | حالة فتح/إغلاق النافذة |
| `title` | `string` | ❌ | `'تأكيد الحذف'` | عنوان النافذة |
| `message` | `string` | ❌ | `'هل أنت متأكد...'` | رسالة التأكيد |
| `itemName` | `string?` | ❌ | `undefined` | اسم العنصر المراد حذفه |
| `confirmText` | `string` | ❌ | `'حذف'` | نص زر التأكيد |
| `cancelText` | `string` | ❌ | `'إلغاء'` | نص زر الإلغاء |
| `isDeleting` | `boolean` | ❌ | `false` | حالة التحميل |

### Events المتاحة

| Event | Payload | Description |
|-------|---------|-------------|
| `confirm` | `void` | يُطلق عند الضغط على زر التأكيد |
| `cancel` | `void` | يُطلق عند الضغط على زر الإلغاء أو الخلفية |

---
