import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { CatalogService } from '../../../../../core/services/catalog.service';
import { Category, MasterProduct } from '../../../../../core/models/catalog.model';
import { AppButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { AppBadgeComponent } from '../../../../../shared/components/ui/badge/badge.component';
import { AppPaginationComponent } from '../../../../../shared/components/ui/pagination/pagination.component';
import { AppCardComponent } from '../../../../../shared/components/ui/card/card.component';
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
    AppButtonComponent,
    AppBadgeComponent,
    AppCardComponent,
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
      });
  }

  ngOnInit(): void {
    this.setupBreadcrumbs();
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params['id'];
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

  loadCategory(id: string): void {
    this.isLoading = true;
    this.catalogService.getCategoryById(id).subscribe({
      next: (data) => {
        this.category = data;
        this.loadCategoryProducts(id);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load category:', err);
        this.relatedProducts = [];
        this.isLoading = false;
      }
    });
  }

  loadCategoryProducts(categoryId: string): void {
    this.catalogService.getProducts(1, 6, undefined, categoryId).subscribe({
      next: (response) => {
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

  onCreateProduct(): void {
    if (this.category) {
      this.router.navigate(['/catalog/products/create'], { queryParams: { categoryId: this.category.id } });
    }
  }

  getCategoryStatusVariant(isActive?: boolean): StatusPillVariant {
    return isActive ? 'success' : 'neutral';
  }
}

