import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { Category, MasterProduct } from '@catalog/models/catalog.domain.models';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppBadgeComponent } from '../../../../shared/components/ui/badge/badge.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { AppInputComponent } from '../../../../shared/components/ui/form-controls/input/input.component';
import { DeleteConfirmationModalComponent } from '../../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';

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
    AppPaginationComponent,
    DeleteConfirmationModalComponent,
    AppPageHeaderComponent,
    StatusPillComponent
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
  page = 1;
  pageSize = 8;
  totalItems = 0;
  searchTerm = '';
  searchSubject = new Subject<string>();
  categoryId: string | null = null;
  brandId: string | null = null;
  categories: Category[] = [];
  isCategoryDropdownOpen = false;
  viewMode: 'table' | 'bento' = 'bento';
  
  // Delete modal state
  isDeleteModalOpen = false;
  productToDelete: MasterProduct | null = null;
  isDeleting = false;

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
      this.brandId = params['brandId'] || null;
      this.searchTerm = params['search'] || '';
      this.page = 1;
      this.loadProducts();
    });
  }

  loadCategories() {
    this.catalogService.getCategories().subscribe({
      next: (res: Category[]) => {
        this.categories = Array.isArray(res) ? res : [];
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.categories = [];
      }
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.catalogService.getProducts(
      this.page,
      this.pageSize,
      this.searchTerm || undefined,
      this.categoryId || undefined,
      this.brandId || undefined
    ).subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res?.items) ? res.items : [];
        this.totalItems = typeof res?.totalCount === 'number' ? res.totalCount : this.products.length;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.products = [];
        this.totalItems = 0;
        this.isLoading = false;
      }
    });
  }

  getCategoryName(categoryId: string | undefined): string {
    if (!categoryId) return '';
    const category = this.findCategoryById(this.categories, categoryId);
    if (!category) return '';
    return this.translate.currentLang === 'ar'
      ? (category.nameAr || category.nameEn || '')
      : (category.nameEn || category.nameAr || '');
  }

  getParentCategoryName(categoryId: string | undefined): string {
    if (!categoryId) return '';

    const category = this.findCategoryById(this.categories, categoryId);
    if (!category?.parentCategoryId) return '';

    const parent = this.findCategoryById(this.categories, category.parentCategoryId);
    if (!parent) return '';

    return this.translate.currentLang === 'ar'
      ? (parent.nameAr || parent.nameEn || '')
      : (parent.nameEn || parent.nameAr || '');
  }

  getPrimaryImage(product: MasterProduct): string {
    return product.images?.find(i => i.isPrimary)?.url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%23999" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
  }

  onSearch(event: any) {
    this.searchSubject.next(event.target.value);
  }

  onSearchTermChange(term: string) {
    this.currentPageReset();
    this.searchSubject.next(term);
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

  private currentPageReset(): void {
    this.page = 1;
  }

  private findCategoryById(categories: Category[], categoryId: string): Category | null {
    for (const category of categories) {
      if (category.id === categoryId) {
        return category;
      }

      if (category.subCategories?.length) {
        const nested = this.findCategoryById(category.subCategories, categoryId);
        if (nested) {
          return nested;
        }
      }
    }

    return null;
  }

  deleteProduct(productId: string, event: Event) {
    event.stopPropagation();
    
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    
    this.productToDelete = product;
    this.isDeleteModalOpen = true;
  }

  confirmDelete() {
    if (!this.productToDelete) return;
    
    this.isDeleting = true;
    
    this.catalogService.deleteProduct(this.productToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteModal();
        this.loadProducts();
      },
      error: (err) => {
        console.error('Failed to delete product', err);
        this.isDeleting = false;
        alert(this.translate.currentLang === 'ar' 
          ? 'فشل حذف المنتج' 
          : 'Failed to delete product');
      }
    });
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.productToDelete = null;
    this.isDeleting = false;
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
      Active: 'MASTER_PRODUCTS.STATUS_ACTIVE',
      Draft: 'MASTER_PRODUCTS.STATUS_DRAFT',
      Inactive: 'MASTER_PRODUCTS.STATUS_INACTIVE',
      Discontinued: 'MASTER_PRODUCTS.STATUS_INACTIVE'
    };

    return labels[status || ''] || status || '-';
  }
}


