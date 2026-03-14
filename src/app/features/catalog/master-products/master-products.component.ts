import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '../../../core/services/catalog.service';
import { MasterProduct, Category } from '../../../core/models/catalog.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AppBadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { AppCardComponent } from '../../../shared/components/ui/card/card.component';
import { AppPaginationComponent } from '../../../shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';
import { AppInputComponent } from '../../../shared/components/ui/form-controls/input.component';

@Component({
  selector: 'app-master-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule,
    AppButtonComponent,
    AppInputComponent,
    AppBadgeComponent,
    AppCardComponent,
    AppPaginationComponent
  ],
  templateUrl: './master-products.component.html',
  styleUrl: './master-products.component.scss',
  styles: [`
    table {
      border-collapse: separate !important;
      border-spacing: 0 !important;
      table-layout: fixed !important;
    }
    
    thead th {
      position: sticky;
      top: 0;
      background: white;
      z-index: 10;
    }
    
    tbody tr {
      background: rgba(255, 255, 255, 0.5);
    }
    
    tbody tr:hover {
      background: white;
    }
    
    td, th {
      vertical-align: middle !important;
      text-align: center !important;
    }
    
    td:first-child, th:first-child {
      text-align: center !important;
    }
    
    td:nth-child(3), th:nth-child(3) {
      text-align: start !important;
    }
  `]
})
export class MasterProductsComponent implements OnInit {
  isLoading = false;
  products: MasterProduct[] = [];

  // Pagination & Filtering
  page = 1;
  pageSize = 8;
  totalItems = 0;
  searchTerm = '';
  searchSubject = new Subject<string>();
  categoryId: string | null = null;
  categories: Category[] = [];

  // Dropdown States
  isCategoryDropdownOpen = false;

  // View Mode
  viewMode: 'table' | 'bento' = 'bento';

  constructor(
    private route: ActivatedRoute,
    private catalogService: CatalogService,
    public translate: TranslateService
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((term: string) => {
      this.searchTerm = term;
      this.page = 1;
      this.loadProducts();
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['categoryId'] || null;
      this.loadProducts();
    });
  }

  loadCategories() {
    this.catalogService.getCategories().subscribe({
      next: (res: any) => {
        const items = res.items || res || [];
        if (items.length === 0) {
          this.categories = [
            { id: 'cat-food', nameEn: 'Food & Beverage', nameAr: 'المواد الغذائية', parentCategoryId: null, displayOrder: 1, isActive: true },
            { id: 'cat-oil', nameEn: 'Oils & Fats', nameAr: 'الزيوت والدهون', parentCategoryId: 'cat-food', parentNameEn: 'Food & Beverage', displayOrder: 1, isActive: true },
            { id: 'cat-grains', nameEn: 'Grains & Pulses', nameAr: 'الحبوب والبقوليات', parentCategoryId: 'cat-food', parentNameEn: 'Food & Beverage', displayOrder: 2, isActive: true },
            { id: 'cat-sweets', nameEn: 'Sweets & Honey', nameAr: 'الحلويات والعسل', parentCategoryId: 'cat-food', parentNameEn: 'Food & Beverage', displayOrder: 3, isActive: true },
            { id: 'cat-fashion', nameEn: 'Fashion', nameAr: 'الأزياء', parentCategoryId: null, displayOrder: 2, isActive: true },
            { id: 'cat-men', nameEn: 'Men Wear', nameAr: 'ملابس رجالي', parentCategoryId: 'cat-fashion', parentNameEn: 'Fashion', displayOrder: 1, isActive: true }
          ];
        } else {
          this.categories = items;
        }
      }
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.catalogService.getProducts(this.page, this.pageSize, this.searchTerm, this.categoryId || undefined).subscribe({
      next: (res: any) => {
        const items = res.items || [];

        // Use Mock Data if backend returns empty list (Visual Verification Mode for Unified Product Bank)
        if (items.length === 0 && !this.searchTerm) {
          const allMock: MasterProduct[] = [
            { id: 'p1', nameEn: 'Premium Organic Olive Oil', nameAr: 'زيت زيتون عضوي فاخر', barcode: '6221234567890', categoryId: 'cat-oil', status: 'Active', images: [{ masterProductId: 'p1', imageBankId: 'im1', displayOrder: 1, isPrimary: true, url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800' }] },
            { id: 'p2', nameEn: 'Egyptian Long Grain Rice', nameAr: 'أرز مصري طويل الحبة', barcode: '6229876543210', categoryId: 'cat-grains', status: 'Active', images: [{ masterProductId: 'p2', imageBankId: 'im3', displayOrder: 1, isPrimary: true, url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800' }] },
            { id: 'p3', nameEn: 'Natural Pure Honey', nameAr: 'عسل نحل طبيعي نقي', barcode: '6225544332211', categoryId: 'cat-sweets', status: 'Draft', images: [{ masterProductId: 'p3', imageBankId: 'im4', displayOrder: 1, isPrimary: true, url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800' }] },
            { id: 'p4', nameEn: 'Handmade Pasta Rigatoni', nameAr: 'باستا ريجاتوني يدوية', barcode: '6220011223344', categoryId: 'cat-grains', status: 'Active', images: [{ masterProductId: 'p6', imageBankId: 'im7', displayOrder: 1, isPrimary: true, url: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800' }] },
            { id: 'p5', nameEn: 'Premium Cotton T-Shirt', nameAr: 'تيشيرت قطن فاخر', barcode: 'TS-9988-X', categoryId: 'cat-men', status: 'Active', images: [{ masterProductId: 'p5', imageBankId: 'im8', displayOrder: 1, isPrimary: true, url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800' }] },
            { id: 'p6', nameEn: 'Organic Dried Figs', nameAr: 'تين مجفف عضوي', barcode: '6226677889900', categoryId: 'cat-sweets', status: 'Active', images: [{ masterProductId: 'p6', imageBankId: 'im9', displayOrder: 1, isPrimary: true, url: 'https://images.unsplash.com/photo-1596461404969-9ae70685763a?q=80&w=800' }] },
            { id: 'p7', nameEn: 'Cold Pressed Sunflower Oil', nameAr: 'زيت عباد شمس معصور على البارد', barcode: 'SUN-7722', categoryId: 'cat-oil', status: 'Inactive', images: [{ masterProductId: 'p7', imageBankId: 'im10', displayOrder: 1, isPrimary: true, url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800' }] },
            { id: 'p8', nameEn: 'Artisanal Sourdough Crackers', nameAr: 'مقرمشات العجين المخمر الحرفية', barcode: '622883311', categoryId: 'cat-grains', status: 'Active', images: [{ masterProductId: 'p8', imageBankId: 'im11', displayOrder: 1, isPrimary: true, url: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?q=80&w=800' }] },
            { id: 'p9', nameEn: 'Fresh Organic Milk', nameAr: 'حليب عضوي طازج', barcode: '62211223344', categoryId: 'cat-food', status: 'Active', images: [{ masterProductId: 'p9', imageBankId: 'im12', displayOrder: 1, isPrimary: true, url: 'https://images.unsplash.com/photo-1550583724-125581976703?q=80&w=800' }] },
            { id: 'p10', nameEn: 'Whole Grain Bread', nameAr: 'خبز الحبوب الكاملة', barcode: '62255667788', categoryId: 'cat-food', status: 'Active', images: [{ masterProductId: 'p10', imageBankId: 'im13', displayOrder: 1, isPrimary: true, url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800' }] },
            { id: 'p11', nameEn: 'Natural Fruit Mix', nameAr: 'مزيج فواكه طبيعي', barcode: '62299887766', categoryId: 'cat-sweets', status: 'Active', images: [{ masterProductId: 'p11', imageBankId: 'im14', displayOrder: 1, isPrimary: true, url: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?q=80&w=800' }] },
            { id: 'p12', nameEn: 'Premium Coffee Beans', nameAr: 'حبوب بن فاخرة', barcode: '62200998877', categoryId: 'cat-food', status: 'Active', images: [{ masterProductId: 'p12', imageBankId: 'im15', displayOrder: 1, isPrimary: true, url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800' }] }
          ];
          this.totalItems = allMock.length;
          const start = (this.page - 1) * this.pageSize;
          this.products = allMock.slice(start, start + this.pageSize);
        } else {
          this.products = items;
          this.totalItems = res.totalCount || 0;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  getCategoryName(categoryId: string | undefined): string {
    if (!categoryId) return '';
    const cat = this.categories.find(c => c.id === categoryId);
    if (!cat) return '';
    const name = this.translate.currentLang === 'ar' ? cat.nameAr : cat.nameEn;
    return name || cat.nameEn || cat.nameAr || '';
  }

  getParentCategoryName(categoryId: string | undefined): string {
    if (!categoryId) return '';
    const cat = this.categories.find(c => c.id === categoryId);
    if (!cat) return '';

    // If it has a parentCategoryId, try to find the actual parent object
    if (cat.parentCategoryId) {
      const parent = this.categories.find(c => c.id === cat.parentCategoryId);
      if (parent) {
        const pName = this.translate.currentLang === 'ar' ? parent.nameAr : parent.nameEn;
        return pName || parent.nameEn || parent.nameAr || '';
      }
    }

    // Fallback to denormalized parent names on the category object itself
    const fallbackName = this.translate.currentLang === 'ar' ? cat.parentNameAr : cat.parentNameEn;
    return fallbackName || cat.parentNameEn || cat.parentNameAr || '';
  }

  getPrimaryImage(product: MasterProduct): string {
    return product.images?.find(i => i.isPrimary)?.url || 'assets/images/placeholder-product.png';
  }

  onSearch(event: any) {
    this.searchSubject.next(event.target.value);
  }

  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  filterByCategory(id: string | null) {
    this.categoryId = id;
    this.page = 1;
    this.loadProducts();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  setViewMode(mode: any) {
    const view = mode as 'table' | 'bento';
    this.viewMode = view;
    this.pageSize = view === 'bento' ? 8 : 10;
    this.page = 1;
    this.loadProducts();
  }
}
