import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { Brand, BrandSearchFilters, CatalogSearchRequest, Category } from '@catalog/models/catalog.domain.models';
import { BrandFormModalComponent } from '../../../components/brand-form-modal/brand-form-modal.component';
import { AppButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { AppCardComponent } from '../../../../../shared/components/ui/card/card.component';
import { AppInputComponent } from '../../../../../shared/components/ui/form-controls/input/input.component';
import { AppPaginationComponent } from '../../../../../shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '../../../../../shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import { CatalogRequestCenterModalComponent } from '../../../components/catalog-request-center-modal/catalog-request-center-modal.component';
import { AdvancedFilterPanelComponent, FilterField } from '../../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';

@Component({
  selector: 'app-brand-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule,
    BrandFormModalComponent,
    AppButtonComponent,
    AppCardComponent,
    AppInputComponent,
    AppPaginationComponent,
    AppPageHeaderComponent,
    StatusPillComponent,
    CatalogRequestCenterModalComponent,
    AdvancedFilterPanelComponent
  ],
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.scss'
})
export class BrandListComponent implements OnInit {
  isLoading = false;
  brands: Brand[] = [];
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedBrand: Brand | null = null;
  searchTerm = '';
  searchSubject = new Subject<string>();
  isBrandRequestsModalOpen = false;
  leafCategories: Category[] = [];
  selectedCategoryId: string | null = null;
  statusFilter: boolean | null = null;
  productsFilter: boolean | null = null;
  isFiltersExpanded = false;
  panelFilters: Record<string, string | null | undefined> = {};

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  readonly filterFields: FilterField[] = [
    { key: 'categoryId', label: 'BRANDS.SUB_CATEGORY', type: 'select', color: '#127c8c', options: [] },
    { key: 'statusFilter', label: 'COMMON.STATUS', type: 'select', color: '#2563eb', options: [] },
    { key: 'productsFilter', label: 'BRANDS.DETAIL.RELATED_PRODUCTS', type: 'select', color: '#0f766e', options: [] }
  ];

  get activeLang(): string {
    return this.translate.currentLang || 'ar';
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedCategoryId || this.statusFilter != null || this.productsFilter != null);
  }

  constructor(
    private readonly route: ActivatedRoute,
    private catalogService: CatalogService,
    public translate: TranslateService
  ) {
    this.translate.onLangChange.subscribe(() => this.initializeFilterOptions());

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((term: string) => {
      this.searchTerm = term;
      this.currentPage = 1;
      this.loadBrands();
    });
  }

  ngOnInit(): void {
    this.loadLeafCategories();
    this.route.queryParams.subscribe((params) => {
      this.searchTerm = params['search'] || '';
      this.currentPage = 1;
      this.syncPanelFilters();
      this.loadBrands();
    });
  }

  loadBrands(): void {
    this.isLoading = true;
    this.catalogService.searchBrands(this.buildSearchRequest()).subscribe({
      next: (response) => {
        this.brands = response.items ?? [];
        this.totalItems = response.totalCount ?? this.brands.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load brands', err);
        this.brands = [];
        this.totalItems = 0;
        this.isLoading = false;
      }
    });
  }

  loadLeafCategories(): void {
    this.catalogService.getCategories(undefined, true).subscribe({
      next: (categories) => {
        this.leafCategories = this.flattenLeafCategories(categories ?? []);
        this.initializeFilterOptions();
      },
      error: (err) => {
        console.error('Failed to load brand filter categories', err);
        this.leafCategories = [];
        this.initializeFilterOptions();
      }
    });
  }

  initializeFilterOptions(): void {
    const categoryField = this.filterFields.find((field) => field.key === 'categoryId');
    const statusField = this.filterFields.find((field) => field.key === 'statusFilter');
    const productsField = this.filterFields.find((field) => field.key === 'productsFilter');

    if (categoryField) {
      categoryField.options = this.leafCategories.map((category) => ({
        value: category.id,
        label: this.getLocalizedFilterCategoryName(category)
      }));
      categoryField.placeholder = 'COMMON.ALL';
    }

    if (statusField) {
      statusField.options = [
        { value: 'true', label: 'BRANDS.STATUS_ACTIVE' },
        { value: 'false', label: 'BRANDS.STATUS_DISABLED' }
      ];
      statusField.placeholder = 'COMMON.ALL';
    }

    if (productsField) {
      productsField.options = [
        { value: 'true', label: 'BRANDS.WITH_PRODUCTS' },
        { value: 'false', label: 'BRANDS.WITHOUT_PRODUCTS' }
      ];
      productsField.placeholder = 'COMMON.ALL';
    }
  }

  changePage(newPage: number): void {
    this.currentPage = newPage;
    this.loadBrands();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchTermChange(term: string): void {
    this.searchSubject.next(term);
  }

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  onFiltersChange(filters: Record<string, unknown>): void {
    this.selectedCategoryId = this.toNullableString(filters['categoryId']);
    this.statusFilter = this.toNullableBoolean(filters['statusFilter']);
    this.productsFilter = this.toNullableBoolean(filters['productsFilter']);
    this.currentPage = 1;
    this.syncPanelFilters();
    this.loadBrands();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = null;
    this.statusFilter = null;
    this.productsFilter = null;
    this.currentPage = 1;
    this.syncPanelFilters();
    this.loadBrands();
  }

  openAddBrand(): void {
    this.modalMode = 'create';
    this.selectedBrand = null;
    this.isModalOpen = true;
  }

  editBrand(brand: Brand): void {
    this.modalMode = 'edit';
    this.selectedBrand = brand;
    this.isModalOpen = true;
  }

  deleteBrand(brand: Brand): void {
    this.catalogService.deleteBrand(brand.id).subscribe({
      next: () => this.loadBrands(),
      error: (err) => console.error('Failed to delete brand', err)
    });
  }

  getBrandStatusVariant(isActive: boolean): StatusPillVariant {
    return isActive ? 'success' : 'paused';
  }

  getLocalizedCategoryName(brand: Brand): string {
    if (brand.categories?.length) {
      return brand.categories
        .map((category) => this.activeLang === 'ar'
          ? (category.categoryNameAr || category.categoryNameEn || category.categoryId)
          : (category.categoryNameEn || category.categoryNameAr || category.categoryId))
        .join('، ');
    }

    return this.activeLang === 'ar'
      ? (brand.categoryNameAr || brand.categoryNameEn || '-')
      : (brand.categoryNameEn || brand.categoryNameAr || '-');
  }

  getLocalizedFilterCategoryName(category: Category): string {
    return this.activeLang === 'ar' ? category.nameAr : category.nameEn;
  }

  private syncPanelFilters(): void {
    this.panelFilters = {
      categoryId: this.selectedCategoryId,
      statusFilter: this.statusFilter == null ? null : String(this.statusFilter),
      productsFilter: this.productsFilter == null ? null : String(this.productsFilter)
    };
  }

  private buildSearchRequest(): CatalogSearchRequest<BrandSearchFilters> {
    return {
      pagination: {
        pageNumber: this.currentPage,
        pageSize: this.pageSize
      },
      search: this.searchTerm.trim() || undefined,
      filters: {
        categoryId: this.selectedCategoryId || null,
        isActive: this.statusFilter,
        hasProducts: this.productsFilter
      }
    };
  }

  private toNullableString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private toNullableBoolean(value: unknown): boolean | null {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return null;
  }

  private flattenLeafCategories(categories: Category[]): Category[] {
    const subCategories: Category[] = [];

    for (const category of categories) {
      const children = category.subCategories ?? [];

      for (const child of children) {
        if (child.parentCategoryId) {
          subCategories.push(child);
        }
      }

      if (children.length > 0) {
        subCategories.push(...this.flattenLeafCategories(children));
      }
    }

    return subCategories;
  }
}
