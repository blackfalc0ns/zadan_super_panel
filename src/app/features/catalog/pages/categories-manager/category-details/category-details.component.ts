import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, map, Subject, takeUntil } from 'rxjs';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { Brand, Category, MasterProduct } from '@catalog/models/catalog.domain.models';
import { AppPaginationComponent } from '../../../../../shared/components/ui/pagination/pagination.component';
import { DetailHeaderComponent } from '../../../../../shared/components/ui/detail-header/detail-header.component';
import { SectionHeaderComponent } from '../../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import { CategoryFormModalComponent } from '../../../components/category-form-modal/category-form-modal.component';
import { DeleteConfirmationModalComponent } from '../../../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-category-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    CategoryFormModalComponent,
    DeleteConfirmationModalComponent,
    AppPaginationComponent,
    DetailHeaderComponent,
    SectionHeaderComponent,
    StatusPillComponent
  ],

  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss']
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {
  category: Category | null = null;
  relatedProducts: MasterProduct[] = [];
  relatedBrands: Brand[] = [];
  isLoading = true;
  activeLang = 'ar';
  isEditModalOpen = false;
  isCreateModalOpen = false;
  isDeleteModalOpen = false;
  isDeleting = false;
  viewMode: 'grid' | 'table' = 'table';
  breadcrumbs: { label: string; action?: () => void }[] = [];

  // Pagination
  pageNumber = 1;
  pageSize = 6;

  private destroy$ = new Subject<void>();
  private activeCategoryId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private translate: TranslateService,
    private location: Location
  ) {
    this.activeLang = this.translate.currentLang || 'ar';
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.activeLang = event.lang;
        this.setupBreadcrumbs();
      });
  }

  ngOnInit(): void {
    this.setupBreadcrumbs();
    this.route.paramMap
      .pipe(
        map(params => params.get('id')),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(id => {
        if (id) {
          this.loadCategory(id);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: this.translate.instant('SIDEBAR.CATALOG'), action: () => this.onBack() },
      { label: this.translate.instant('CATEGORIES.MENU.CATEGORIES'), action: () => this.onBack() },
      { label: this.translate.instant('COMMON.DETAILS') }
    ];
  }

  getActionButtonLabel(): string {
    return this.translate.instant('COMMON.EDIT');
  }

  getGridViewLabel(): string {
    return this.translate.instant('CATEGORIES.DETAILS.GRID_VIEW');
  }

  getTableViewLabel(): string {
    return this.translate.instant('CATEGORIES.DETAILS.TABLE_VIEW');
  }

  getBreadcrumbs() {
    return [
      { label: 'SIDEBAR.CATALOG', url: '/catalog' },
      { label: 'CATEGORIES.MENU.CATEGORIES', url: '/catalog/categories' },
      { label: 'COMMON.DETAILS' }
    ];
  }

  getLevelNameKey(depth: number): string {
    if (depth === 0) return 'CATEGORIES.INDUSTRY';
    if (depth === 1) return 'CATEGORIES.SUB_INDUSTRY';
    if (depth === 2) return 'CATEGORIES.CATEGORY';
    if (depth === 3) return 'CATEGORIES.SUB_CATEGORY';
    return 'CATEGORIES.ITEM';
  }

  getLocalizedCategoryName(category: Category | null = this.category): string {
    if (!category) return '';
    return this.activeLang === 'ar' ? (category.nameAr || category.nameEn) : (category.nameEn || category.nameAr);
  }

  getSecondaryCategoryName(category: Category | null = this.category): string {
    if (!category) return '';
    return this.activeLang === 'ar' ? (category.nameEn || category.nameAr) : (category.nameAr || category.nameEn);
  }

  getLocalizedParentName(): string {
    if (!this.category) return '';
    return this.activeLang === 'ar'
      ? (this.category.parentNameAr || this.category.parentNameEn || '')
      : (this.category.parentNameEn || this.category.parentNameAr || '');
  }

  getCategoryInitials(category: Category | null = this.category): string {
    const name = this.getLocalizedCategoryName(category).trim();
    return name ? name.slice(0, 2).toUpperCase() : 'CA';
  }

  getHierarchyProgress(): number {
    const level = this.category?.level ?? 0;
    return Math.min(100, Math.max(12, ((level + 1) / 4) * 100));
  }

  getSystemId(category: Category | null = this.category): string {
    if (!category?.id) return '-';
    return category.id.length > 16 ? `${category.id.slice(0, 8)}...${category.id.slice(-4)}` : category.id;
  }

  loadCategory(id: string): void {
    this.activeCategoryId = id;
    this.isLoading = true;
    this.pageNumber = 1;
    this.relatedProducts = [];
    this.relatedBrands = [];
    this.catalogService.getCategoryById(id).subscribe({
      next: (data) => {
        if (this.activeCategoryId !== id) {
          return;
        }

        this.category = data;
        this.loadRelatedBrands(id);
        this.loadCategoryProducts(id);
        this.isLoading = false;
      },
      error: (err) => {
        if (this.activeCategoryId !== id) {
          return;
        }

        console.error('Failed to load category:', err);
        this.category = null;
        this.relatedProducts = [];
        this.relatedBrands = [];
        this.isLoading = false;
      }
    });
  }

  loadRelatedBrands(categoryId: string): void {
    this.catalogService.searchBrands({
      pagination: {
        pageNumber: 1,
        pageSize: 24
      },
      filters: {
        categoryId
      }
    }).subscribe({
      next: (response) => {
        if (this.activeCategoryId !== categoryId) {
          return;
        }

        this.relatedBrands = response.items ?? [];
      },
      error: (err) => {
        if (this.activeCategoryId !== categoryId) {
          return;
        }

        console.error('Failed to load related brands:', err);
        this.relatedBrands = [];
      }
    });
  }

  loadCategoryProducts(categoryId: string): void {
    this.catalogService.getProducts(1, 12, undefined, categoryId).subscribe({
      next: (response) => {
        if (this.activeCategoryId !== categoryId) {
          return;
        }

        const items = Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : [];
        this.relatedProducts = items;
      },
      error: (err) => {
        if (this.activeCategoryId !== categoryId) {
          return;
        }

        console.error('Failed to load category products:', err);
        this.relatedProducts = [];
      }
    });
  }

  getNextLevelNameKey(): string {
    const depth = this.category?.level || 0;
    return this.getLevelNameKey(depth + 1);
  }

  getNextLevelCount(): number {
    return this.category?.subCategories?.length || 0;
  }

  get paginatedSubCategories(): any[] {
    if (!this.category?.subCategories) return [];
    const start = (this.pageNumber - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.category.subCategories.slice(start, end);
  }

  get totalSubCategories(): number {
    return this.category?.subCategories?.length || 0;
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
  }

  onBack(): void {
    this.location.back();
  }

  onEdit(): void {
    this.isEditModalOpen = true;
  }

  onDelete(): void {
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (!this.category) return;
    this.isDeleting = true;
    this.catalogService.deleteCategory(this.category.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.isDeleteModalOpen = false;
        this.onBack();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.isDeleting = false;
      }
    });
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
  }

  handleSaved(): void {
    if (this.category) {
      this.loadCategory(this.category.id);
    }
  }

  onSubNavigate(id: string): void {
    this.router.navigate(['/catalog/categories', id]);
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  canCreateProduct(): boolean {
    return (this.category?.level ?? 0) >= 3;
  }

  onCreateProduct(): void {
    if (this.category) {
      this.router.navigate(['/catalog/products/create'], { queryParams: { categoryId: this.category.id } });
    }
  }

  getCategoryStatusVariant(isActive?: boolean): StatusPillVariant {
    return isActive ? 'success' : 'paused';
  }

  getLocalizedBrandName(brand: Brand): string {
    return this.activeLang === 'ar' ? (brand.nameAr || brand.nameEn) : (brand.nameEn || brand.nameAr);
  }

  getLocalizedProductName(product: MasterProduct): string {
    return this.activeLang === 'ar' ? (product.nameAr || product.nameEn) : (product.nameEn || product.nameAr);
  }

  getProductImage(product: MasterProduct): string | null {
    return product.images?.find((image) => image.isPrimary)?.url || product.images?.[0]?.url || null;
  }

  getProductStatusVariant(status: MasterProduct['status']): StatusPillVariant {
    if (status === 'Active') return 'success';
    if (status === 'Draft') return 'warning';
    if (status === 'Discontinued') return 'danger';
    return 'paused';
  }
}



