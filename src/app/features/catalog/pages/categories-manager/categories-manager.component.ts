import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { CatalogSearchRequest, Category, CategorySearchFilters } from '@catalog/models/catalog.domain.models';
import { CategoryFormModalComponent } from '../../components/category-form-modal/category-form-modal.component';
import { DeleteConfirmationModalComponent } from '../../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { CatalogRequestCenterModalComponent } from '../../components/catalog-request-center-modal/catalog-request-center-modal.component';
import { AdvancedFilterPanelComponent, FilterField } from '../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-categories-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule,
    CategoryFormModalComponent,
    DeleteConfirmationModalComponent,
    AppPaginationComponent,
    StatusPillComponent,
    AppButtonComponent,
    AppPageHeaderComponent,
    CatalogRequestCenterModalComponent,
    AdvancedFilterPanelComponent
  ],
  templateUrl: './categories-manager.component.html',
  styleUrl: './categories-manager.component.scss'
})
export class CategoriesManagerComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  isLoading = true;
  currentItems: Category[] = [];
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  statusFilter: boolean | null = null;
  childrenFilter: boolean | null = null;
  isFiltersExpanded = false;
  panelFilters: Record<string, string | null | undefined> = {};

  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  modalLevelKey = '';
  categoryForm: Partial<Category> | null = null;
  isDeleteModalOpen = false;
  isDeleting = false;
  itemToDelete: Category | null = null;
  parentCategoryForModal: { id: string | null, nameAr: string, nameEn: string } | null = null;
  isCategoryRequestsModalOpen = false;
  pendingCategoryRequestCount = 0;
  initialCategoryRequestId: string | null = null;
  Math = Math;

  readonly filterFields: FilterField[] = [
    { key: 'statusFilter', label: 'COMMON.STATUS', type: 'select', color: '#2563eb', options: [] },
    { key: 'childrenFilter', label: 'CATEGORIES.DETAILS.BRANCH_NODES', type: 'select', color: '#0f766e', options: [] }
  ];

  get activeLang(): string {
    return this.translate.currentLang || 'ar';
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.statusFilter != null || this.childrenFilter != null);
  }

  get activeFiltersCount(): number {
    return [this.searchTerm, this.statusFilter, this.childrenFilter].filter((value) => value !== null && value !== '').length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  constructor(
    private readonly route: ActivatedRoute,
    private catalogService: CatalogService,
    public translate: TranslateService,
    private router: Router
  ) {
    this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
      this.initializeFilterOptions();
    });
  }

  ngOnInit() {
    this.initializeFilterOptions();
    this.loadPendingCategoryRequestCount();
    this.route.queryParams.subscribe((params) => {
      this.cdr.markForCheck();
      this.searchTerm = params['search'] || '';
      this.currentPage = 1;
      this.syncPanelFilters();
      this.loadHierarchy();

      if (params['requests'] === '1') {
        this.isCategoryRequestsModalOpen = true;
        this.initialCategoryRequestId = params['requestId'] || null;
      }
    });
  }

  loadPendingCategoryRequestCount(): void {
    this.catalogService.getPendingCatalogRequestCount('category').subscribe({
      next: (count) => {
        this.cdr.markForCheck();
        this.pendingCategoryRequestCount = count;
      }
    });
  }

  onCategoryRequestsModalClose(): void {
    this.isCategoryRequestsModalOpen = false;
    this.initialCategoryRequestId = null;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { requests: null, requestId: null },
      queryParamsHandling: 'merge'
    });
  }

  onCategoryRequestsRefreshed(): void {
    this.loadPendingCategoryRequestCount();
    this.loadHierarchy();
  }

  loadHierarchy() {
    this.isLoading = true;
    this.catalogService.searchCategories(this.buildSearchRequest()).subscribe({
      next: (response) => {
        this.cdr.markForCheck();
        this.currentItems = response.items ?? [];
        this.totalItems = response.totalCount ?? this.currentItems.length;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.cdr.markForCheck();
        console.error(err);
        this.currentItems = [];
        this.totalItems = 0;
        this.isLoading = false;
      }
    });
  }

  initializeFilterOptions(): void {
    const statusField = this.filterFields.find((field) => field.key === 'statusFilter');
    const childrenField = this.filterFields.find((field) => field.key === 'childrenFilter');

    if (statusField) {
      statusField.options = [
        { value: 'true', label: 'CATEGORIES.STATUS_ACTIVE' },
        { value: 'false', label: 'CATEGORIES.STATUS_DISABLED' }
      ];
      statusField.placeholder = 'COMMON.ALL';
    }

    if (childrenField) {
      childrenField.options = [
        { value: 'true', label: 'CATEGORIES.WITH_CHILDREN' },
        { value: 'false', label: 'CATEGORIES.WITHOUT_CHILDREN' }
      ];
      childrenField.placeholder = 'COMMON.ALL';
    }
  }

  get paginatedItems(): Category[] {
    return this.currentItems;
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadHierarchy();
  }

  onSearchTermChange(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.loadHierarchy();
  }

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  onFiltersChange(filters: Record<string, unknown>): void {
    this.statusFilter = this.toNullableBoolean(filters['statusFilter']);
    this.childrenFilter = this.toNullableBoolean(filters['childrenFilter']);
    this.currentPage = 1;
    this.syncPanelFilters();
    this.loadHierarchy();
  }

  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = null;
    this.childrenFilter = null;
    this.currentPage = 1;
    this.syncPanelFilters();
    this.loadHierarchy();
  }

  getLevelNameKey(level: number = 0): string {
    if (level === 0) return 'CATEGORIES.INDUSTRY';
    if (level === 1) return 'CATEGORIES.SUB_INDUSTRY';
    if (level === 2) return 'CATEGORIES.CATEGORY';
    if (level === 3) return 'CATEGORIES.SUB_CATEGORY';
    return 'CATEGORIES.ITEM';
  }

  getActivityName(category: Category): string {
    if (this.activeLang === 'ar') {
      return category.activityNameAr || category.parentNameAr || category.nameAr;
    }

    return category.activityNameEn || category.parentNameEn || category.nameEn;
  }

  getLocalizedCategoryName(category: Category): string {
    return this.activeLang === 'ar' ? (category.nameAr || category.nameEn) : (category.nameEn || category.nameAr);
  }

  getSecondaryCategoryName(category: Category): string {
    return this.activeLang === 'ar' ? (category.nameEn || category.nameAr) : (category.nameAr || category.nameEn);
  }

  getCategoryInitials(category: Category): string {
    const name = this.getLocalizedCategoryName(category).trim();
    return name ? name.slice(0, 2).toUpperCase() : 'CA';
  }

  getChildrenCount(category: Category): number {
    return category.subCategories?.length ?? 0;
  }

  getProductsCount(category: Category): number {
    return category.masterProductsCount ?? 0;
  }

  getBrandsCount(category: Category): number {
    return category.brandsCount ?? 0;
  }

  getHierarchyWidth(category: Category): number {
    return Math.min(100, Math.max(8, this.getChildrenCount(category) * 12));
  }

  selectItem(item: Category) {
    this.router.navigate(['/catalog/categories', item.id]);
  }

  openCreateModal(parent?: any) {
    this.modalMode = 'create';
    const activeParent = parent ?? null;
    const nextLevel = activeParent ? (activeParent.level ?? 0) + 1 : 0;
    this.modalLevelKey = this.getLevelNameKey(nextLevel);

    this.parentCategoryForModal = activeParent ? {
      id: activeParent.id,
      nameAr: activeParent.nameAr,
      nameEn: activeParent.nameEn
    } : null;

    this.isModalOpen = true;
  }

  openEditModal(category: any, event: Event) {
    event.stopPropagation();
    this.modalMode = 'edit';
    this.modalLevelKey = this.getLevelNameKey(category?.level ?? 0);
    this.categoryForm = { ...category };
    this.isModalOpen = true;
  }

  closeCategoryModal() {
    this.isModalOpen = false;
    this.categoryForm = null;
  }

  handleSaved() {
    this.loadHierarchy();
  }

  onCreateProduct(category: Category) {
    this.router.navigate(['/catalog/products/create'], { queryParams: { categoryId: category.id } });
  }

  viewDetails(category: Category, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/catalog/categories', category.id]);
  }

  openDeleteModal(category: Category, event: Event) {
    event.stopPropagation();
    this.itemToDelete = category;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.itemToDelete = null;
  }

  confirmDelete() {
    if (!this.itemToDelete) return;

    this.isDeleting = true;
    this.catalogService.deleteCategory(this.itemToDelete.id).subscribe({
      next: () => {
        this.cdr.markForCheck();
        this.isDeleting = false;
        this.closeDeleteModal();
        this.loadHierarchy();
      },
      error: (err: any) => {
        this.cdr.markForCheck();
        console.error('Deletion failed:', err);
        this.isDeleting = false;
      }
    });
  }

  getCategoryStatusVariant(isActive: boolean): StatusPillVariant {
    return isActive ? 'success' : 'paused';
  }

  private syncPanelFilters(): void {
    this.panelFilters = {
      statusFilter: this.statusFilter == null ? null : String(this.statusFilter),
      childrenFilter: this.childrenFilter == null ? null : String(this.childrenFilter)
    };
  }

  private buildSearchRequest(): CatalogSearchRequest<CategorySearchFilters> {
    return {
      pagination: {
        pageNumber: this.currentPage,
        pageSize: this.pageSize
      },
      search: this.searchTerm.trim() || undefined,
      filters: {
        level: 0,
        isActive: this.statusFilter,
        hasChildren: this.childrenFilter
      }
    };
  }

  private toNullableBoolean(value: unknown): boolean | null {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return null;
  }

  private toNullableNumber(value: unknown): number | null {
    if (typeof value === 'string' && value.trim() !== '') return Number(value);
    if (typeof value === 'number') return value;
    return null;
  }
}
