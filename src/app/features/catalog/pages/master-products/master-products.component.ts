import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { Brand, CatalogSearchRequest, CatalogUnit, Category, MasterProduct, ProductSearchFilters } from '@catalog/models/catalog.domain.models';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppBadgeComponent } from '../../../../shared/components/ui/badge/badge.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { DeleteConfirmationModalComponent } from '../../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { AdvancedFilterPanelComponent, FilterField } from '../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { CatalogRequestCenterModalComponent } from '../../components/catalog-request-center-modal/catalog-request-center-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-master-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule,
    AppButtonComponent,
    AppBadgeComponent,
    AppCardComponent,
    AppPaginationComponent,
    DeleteConfirmationModalComponent,
    AppPageHeaderComponent,
    StatusPillComponent,
    AdvancedFilterPanelComponent,
    CatalogRequestCenterModalComponent
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
  private readonly cdr = inject(ChangeDetectorRef);
  isLoading = false;
  products: MasterProduct[] = [];
  page = 1;
  pageSize = 8;
  totalItems = 0;
  searchTerm = '';
  searchSubject = new Subject<string>();
  categoryId: string | null = null;
  brandId: string | null = null;
  status: string | null = null;
  packageTypeId: string | null = null;
  measurementUnitId: string | null = null;
  measurementValue: number | null = null;
  hasBrand: boolean | null = null;
  isActiveBrand: boolean | null = null;
  sortSelection = 'updatedAtUtc:desc';
  categories: Category[] = [];
  brands: Brand[] = [];
  units: CatalogUnit[] = [];
  isFiltersExpanded = false;
  panelFilters: Record<string, string | null | undefined> = {};
  viewMode: 'table' | 'bento' = 'bento';
  isProductRequestsModalOpen = false;
  readonly statusOptions: Array<MasterProduct['status']> = ['Draft', 'Active', 'Inactive', 'Discontinued'];
  readonly filterFields: FilterField[] = [
    { key: 'categoryId', label: 'PRODUCTS.SUB_CATEGORY', type: 'select', color: '#127c8c', options: [] },
    { key: 'brandId', label: 'COMMON.BRAND', type: 'select', color: '#0f766e', options: [] },
    { key: 'status', label: 'PRODUCTS.STATUS', type: 'select', color: '#2563eb', options: [] },
    { key: 'packageTypeId', label: 'MASTER_PRODUCTS.PACKAGE_TYPE', type: 'select', color: '#0d9488', options: [] },
    { key: 'measurementUnitId', label: 'MASTER_PRODUCTS.MEASUREMENT_UNIT', type: 'select', color: '#0284c7', options: [] },
    { key: 'measurementValue', label: 'MASTER_PRODUCTS.SIZE_VALUE', type: 'select', color: '#7c3aed', options: [] },
    { key: 'hasBrand', label: 'MASTER_PRODUCTS.HAS_BRAND', type: 'select', color: '#7c3aed', options: [] },
    { key: 'isActiveBrand', label: 'MASTER_PRODUCTS.ACTIVE_BRAND', type: 'select', color: '#db2777', options: [] },
    { key: 'sortSelection', label: 'MASTER_PRODUCTS.SORT', type: 'select', color: '#ea580c', options: [] }
  ];
  
  // Delete modal state
  isDeleteModalOpen = false;
  productToDelete: MasterProduct | null = null;
  isDeleting = false;
  togglingPriceVisibilityIds = new Set<string>();
  selectedProductIds = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private catalogService: CatalogService,
    public translate: TranslateService
  ) {
    this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
      this.initializeFilterOptions();
    });

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((term: string) => {
      this.cdr.markForCheck();
      this.searchTerm = term;
      this.page = 1;
      this.loadProducts();
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadBrands();
    this.loadUnits();
    this.route.queryParams.subscribe(params => {
      this.cdr.markForCheck();
      this.categoryId = params['categoryId'] || null;
      this.brandId = params['brandId'] || null;
      this.status = params['status'] || null;
      this.searchTerm = params['search'] || '';
      this.packageTypeId = params['packageTypeId'] || null;
      this.measurementUnitId = params['measurementUnitId'] || null;
      this.measurementValue = this.toNullableNumber(params['measurementValue']);
      this.hasBrand = this.toNullableBoolean(params['hasBrand']);
      this.isActiveBrand = this.toNullableBoolean(params['isActiveBrand']);
      this.sortSelection = params['sortSelection'] || 'updatedAtUtc:desc';
      this.syncPanelFilters();
      this.page = 1;
      this.loadProducts();
    });
  }

  loadCategories() {
    this.catalogService.getCategories(undefined, false, false).subscribe({
      next: (res: Category[]) => {
        this.cdr.markForCheck();
        this.categories = Array.isArray(res) ? res : [];
        this.initializeFilterOptions();
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to load categories', err);
        this.categories = [];
        this.initializeFilterOptions();
      }
    });
  }

  loadBrands() {
    this.catalogService.getBrands(true, false).subscribe({
      next: (res: Brand[]) => {
        this.cdr.markForCheck();
        this.brands = Array.isArray(res) ? res : [];
        this.initializeFilterOptions();
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to load brands', err);
        this.brands = [];
        this.initializeFilterOptions();
      }
    });
  }

  loadUnits() {
    this.catalogService.getUnits().subscribe({
      next: (res) => {
        this.cdr.markForCheck();
        this.units = Array.isArray(res) ? res : [];
        this.initializeFilterOptions();
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to load units', err);
        this.units = [];
        this.initializeFilterOptions();
      }
    });
  }

  initializeFilterOptions(): void {
    const categoryField = this.filterFields.find((field) => field.key === 'categoryId');
    const brandField = this.filterFields.find((field) => field.key === 'brandId');
    const statusField = this.filterFields.find((field) => field.key === 'status');
    const packageTypeField = this.filterFields.find((field) => field.key === 'packageTypeId');
    const measurementUnitField = this.filterFields.find((field) => field.key === 'measurementUnitId');
    const measurementValueField = this.filterFields.find((field) => field.key === 'measurementValue');

    if (categoryField) {
      categoryField.options = this.getSelectableSubcategories().map((category) => ({
        value: category.id,
        label: this.getSubcategoryName(category.id) || this.getLocalizedCategoryName(category)
      }));
    }

    if (brandField) {
      brandField.options = this.brands.map((brand) => ({
        value: brand.id,
        label: this.translate.currentLang === 'ar'
          ? (brand.nameAr || brand.nameEn || brand.id)
          : (brand.nameEn || brand.nameAr || brand.id)
      }));
    }

    if (statusField) {
      statusField.options = this.statusOptions.map((status) => ({
        value: status,
        label: this.getProductStatusLabel(status)
      }));
    }

    if (packageTypeField) {
      packageTypeField.options = this.units
        .filter((unit) => unit.kind === 'Packaging')
        .map((unit) => ({
          value: unit.id,
          label: this.translate.currentLang === 'ar'
            ? (unit.nameAr || unit.nameEn || unit.id)
            : (unit.nameEn || unit.nameAr || unit.id)
        }));
      packageTypeField.placeholder = 'MASTER_PRODUCTS.PACKAGE_TYPE';
    }

    if (measurementUnitField) {
      measurementUnitField.options = this.units
        .filter((unit) => unit.kind === 'Measurement')
        .map((unit) => ({
          value: unit.id,
          label: this.translate.currentLang === 'ar'
            ? (unit.nameAr || unit.nameEn || unit.id)
            : (unit.nameEn || unit.nameAr || unit.id)
        }));
      measurementUnitField.placeholder = 'MASTER_PRODUCTS.MEASUREMENT_UNIT';
    }

    if (measurementValueField) {
      const values = Array.from(new Set(
        this.products
          .map((product) => product.measurementValue)
          .filter((value): value is number => typeof value === 'number')
      )).sort((left, right) => left - right);

      measurementValueField.options = values.map((value) => ({
        value: String(value),
        label: String(value)
      }));
      measurementValueField.placeholder = 'MASTER_PRODUCTS.SIZE_VALUE';
    }

    const hasBrandField = this.filterFields.find((field) => field.key === 'hasBrand');
    const isActiveBrandField = this.filterFields.find((field) => field.key === 'isActiveBrand');
    const sortField = this.filterFields.find((field) => field.key === 'sortSelection');

    if (hasBrandField) {
      hasBrandField.options = [
        { value: 'true', label: 'COMMON.YES' },
        { value: 'false', label: 'COMMON.NO' }
      ];
      hasBrandField.placeholder = 'COMMON.ALL';
    }

    if (isActiveBrandField) {
      isActiveBrandField.options = [
        { value: 'true', label: 'COMMON.YES' },
        { value: 'false', label: 'COMMON.NO' }
      ];
      isActiveBrandField.placeholder = 'COMMON.ALL';
    }

    if (sortField) {
      sortField.options = [
        { value: 'updatedAtUtc:desc', label: 'MASTER_PRODUCTS.SORT_NEWEST_UPDATED' },
        { value: 'createdAtUtc:desc', label: 'MASTER_PRODUCTS.SORT_NEWEST_CREATED' },
        { value: 'nameAr:asc', label: 'MASTER_PRODUCTS.SORT_NAME_AR' },
        { value: 'nameEn:asc', label: 'MASTER_PRODUCTS.SORT_NAME_EN' },
        { value: 'status:asc', label: 'MASTER_PRODUCTS.SORT_STATUS' }
      ];
      sortField.placeholder = 'MASTER_PRODUCTS.SORT';
    }
  }

  loadProducts() {
    this.isLoading = true;
    this.selectedProductIds.clear();
    this.catalogService.searchProducts(this.buildProductSearchRequest(), false).subscribe({
      next: (res) => {
        this.cdr.markForCheck();
        this.products = Array.isArray(res?.items) ? res.items : [];
        this.totalItems = typeof res?.totalCount === 'number' ? res.totalCount : this.products.length;
        this.initializeFilterOptions();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.cdr.markForCheck();
        console.error(err);
        this.products = [];
        this.totalItems = 0;
        this.categories = [];
        this.brands = [];
        this.isLoading = false;
      }
    });
  }

  getSubcategoryName(categoryId: string | undefined): string {
    if (!categoryId) return '';
    const category = this.findCategoryById(this.categories, categoryId);
    if (!category) return '';
    return this.getLocalizedCategoryName(category);
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

  getProductPackageTypeLabel(product: MasterProduct): string {
    return this.translate.currentLang === 'ar'
      ? (product.packageTypeNameAr || product.packageTypeNameEn || '')
      : (product.packageTypeNameEn || product.packageTypeNameAr || '');
  }

  getProductMeasurementUnitLabel(product: MasterProduct): string {
    return this.translate.currentLang === 'ar'
      ? (product.measurementUnitNameAr || product.measurementUnitNameEn || product.unitNameAr || product.unitNameEn || '')
      : (product.measurementUnitNameEn || product.measurementUnitNameAr || product.unitNameEn || product.unitNameAr || '');
  }

  getProductSizeSummary(product: MasterProduct): string {
    const displaySize = this.translate.currentLang === 'ar'
      ? (product.displaySizeAr || product.displaySizeEn || '')
      : (product.displaySizeEn || product.displaySizeAr || '');

    if (displaySize.trim()) {
      return displaySize;
    }

    const packageType = this.getProductPackageTypeLabel(product);
    const measurementValue = product.measurementValue !== null && product.measurementValue !== undefined
      ? `${product.measurementValue}`
      : '';
    const measurementUnit = this.getProductMeasurementUnitLabel(product);

    return [packageType, measurementValue, measurementUnit].filter(Boolean).join(' ').trim();
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
    this.syncPanelFilters();
    this.loadProducts();
  }

  filterByStatus(status: string | null) {
    this.status = status;
    this.page = 1;
    this.syncPanelFilters();
    this.loadProducts();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.categoryId ||
      this.brandId ||
      this.status ||
      this.packageTypeId ||
      this.measurementUnitId ||
      this.measurementValue != null ||
      this.hasBrand != null ||
      this.isActiveBrand != null
    );
  }

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  onFiltersChange(filters: Record<string, unknown>): void {
    this.categoryId = this.toNullableString(filters['categoryId']);
    this.brandId = this.toNullableString(filters['brandId']);
    this.status = this.toNullableString(filters['status']);
    this.packageTypeId = this.toNullableString(filters['packageTypeId']);
    this.measurementUnitId = this.toNullableString(filters['measurementUnitId']);
    this.measurementValue = this.toNullableNumber(filters['measurementValue']);
    this.hasBrand = this.toNullableBoolean(filters['hasBrand']);
    this.isActiveBrand = this.toNullableBoolean(filters['isActiveBrand']);
    this.sortSelection = this.toNullableString(filters['sortSelection']) || 'updatedAtUtc:desc';
    this.syncPanelFilters();
    this.page = 1;
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.categoryId = null;
    this.brandId = null;
    this.status = null;
    this.packageTypeId = null;
    this.measurementUnitId = null;
    this.measurementValue = null;
    this.hasBrand = null;
    this.isActiveBrand = null;
    this.sortSelection = 'updatedAtUtc:desc';
    this.syncPanelFilters();
    this.page = 1;
    this.loadProducts();
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

  private getSelectableSubcategories(): Category[] {
    const flattenedCategories = this.flattenCategories(this.categories);
    const leafSubcategories = flattenedCategories.filter((category) =>
      !!category.parentCategoryId && !(category.subCategories?.length)
    );

    if (leafSubcategories.length > 0) {
      return leafSubcategories;
    }

    return flattenedCategories.filter((category) => !!category.parentCategoryId);
  }

  private flattenCategories(categories: Category[]): Category[] {
    return categories.flatMap((category) => [
      category,
      ...this.flattenCategories(category.subCategories ?? [])
    ]);
  }

  private getLocalizedCategoryName(category: Category): string {
    return this.translate.currentLang === 'ar'
      ? (category.nameAr || category.nameEn || category.id)
      : (category.nameEn || category.nameAr || category.id);
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
    this.isDeleting = true;
    
    if (this.productToDelete) {
      this.catalogService.deleteProduct(this.productToDelete.id).subscribe({
        next: () => {
        this.cdr.markForCheck();
          this.isDeleting = false;
          this.closeDeleteModal();
          this.loadProducts();
        },
        error: (err) => {
        this.cdr.markForCheck();
          console.error('Failed to delete product', err);
          this.isDeleting = false;
          alert(this.translate.instant('MASTER_PRODUCTS.DELETE_FAILED'));
        }
      });
    } else if (this.selectedProductIds.size > 0) {
      const ids = Array.from(this.selectedProductIds);
      this.catalogService.bulkDeleteProducts(ids).subscribe({
        next: () => {
        this.cdr.markForCheck();
          this.isDeleting = false;
          this.selectedProductIds.clear();
          this.closeDeleteModal();
          this.loadProducts();
        },
        error: (err) => {
        this.cdr.markForCheck();
          console.error('Failed bulk delete products', err);
          this.isDeleting = false;
          alert(this.translate.instant('MASTER_PRODUCTS.DELETE_FAILED'));
        }
      });
    }
  }

  toggleProductSelection(productId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.selectedProductIds.has(productId)) {
      this.selectedProductIds.delete(productId);
    } else {
      this.selectedProductIds.add(productId);
    }
  }

  toggleAllSelection(): void {
    if (this.isAllSelected) {
      this.products.forEach(p => this.selectedProductIds.delete(p.id));
    } else {
      this.products.forEach(p => this.selectedProductIds.add(p.id));
    }
  }

  get isAllSelected(): boolean {
    return this.products.length > 0 && this.products.every(p => this.selectedProductIds.has(p.id));
  }

  deleteSelectedProducts(): void {
    if (this.selectedProductIds.size === 0) return;
    this.productToDelete = null;
    this.isDeleteModalOpen = true;
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
      Discontinued: 'MASTER_PRODUCTS.STATUS_DISCONTINUED'
    };

    return labels[status || ''] || status || '-';
  }

  createVariantQueryParams(product: MasterProduct): Record<string, string> {
    return { variantFrom: product.id };
  }

  isProductPriceVisible(product: MasterProduct): boolean {
    return product.showPriceOnCard !== false;
  }

  getPriceVisibilityLabel(product: MasterProduct): string {
    const isVisible = this.isProductPriceVisible(product);
    if (this.translate.currentLang === 'ar') {
      return isVisible ? 'إخفاء السعر من كارت العميل' : 'إظهار السعر في كارت العميل';
    }

    return isVisible ? 'Hide price on customer card' : 'Show price on customer card';
  }

  toggleProductPriceVisibility(product: MasterProduct, event: Event): void {
    event.stopPropagation();

    if (this.togglingPriceVisibilityIds.has(product.id)) {
      return;
    }

    const nextValue = !this.isProductPriceVisible(product);
    this.togglingPriceVisibilityIds.add(product.id);

    this.catalogService.setProductCardPriceVisibility(product.id, nextValue).subscribe({
      next: () => {
        this.cdr.markForCheck();
        const productGroupId = product.variantGroupId || product.id;
        this.products
          .filter(item => item.id === product.id || item.variantGroupId === productGroupId)
          .forEach(item => item.showPriceOnCard = nextValue);
        this.togglingPriceVisibilityIds.delete(product.id);
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to update product card price visibility', err);
        this.togglingPriceVisibilityIds.delete(product.id);
        alert(
          this.translate.currentLang === 'ar'
            ? 'تعذر تحديث ظهور السعر حالياً.'
            : 'Could not update price visibility right now.'
        );
      }
    });
  }

  private syncPanelFilters(): void {
    this.panelFilters = {
      categoryId: this.categoryId,
      brandId: this.brandId,
      status: this.status,
      packageTypeId: this.packageTypeId,
      measurementUnitId: this.measurementUnitId,
      measurementValue: this.measurementValue == null ? null : String(this.measurementValue),
      hasBrand: this.hasBrand == null ? null : String(this.hasBrand),
      isActiveBrand: this.isActiveBrand == null ? null : String(this.isActiveBrand),
      sortSelection: this.sortSelection
    };
  }

  private toNullableString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private toNullableBoolean(value: unknown): boolean | null {
    if (value === true || value === 'true') {
      return true;
    }

    if (value === false || value === 'false') {
      return false;
    }

    return null;
  }

  private toNullableNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private buildProductSearchRequest(): CatalogSearchRequest<ProductSearchFilters> {
    const [field, direction] = this.sortSelection.split(':');

    return {
      pagination: {
        pageNumber: this.page,
        pageSize: this.pageSize
      },
      sort: {
        field: field || 'updatedAtUtc',
        direction: direction === 'asc' ? 'asc' : 'desc'
      },
      search: this.searchTerm || undefined,
      filters: {
        subcategoryIds: this.categoryId ? [this.categoryId] : undefined,
        brandIds: this.brandId ? [this.brandId] : undefined,
        statuses: this.status ? [this.status as MasterProduct['status']] : undefined,
        packageTypeId: this.packageTypeId,
        measurementUnitId: this.measurementUnitId,
        measurementValue: this.measurementValue,
        hasBrand: this.hasBrand,
        isActiveBrand: this.isActiveBrand
      }
    };
  }
}


