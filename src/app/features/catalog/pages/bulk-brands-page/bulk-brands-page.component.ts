import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription, interval, switchMap } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { AdminBrandBulkOperation, AdminBrandBulkOperationItem, BulkBrandDraft, Category } from '@catalog/models/catalog.domain.models';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';

type BulkRowFilter = 'all' | 'ready' | 'errors';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-bulk-brands-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule, AppPageHeaderComponent],
  templateUrl: './bulk-brands-page.component.html',
  styleUrls: ['./bulk-brands-page.component.scss']
})
export class BulkBrandsPageComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  categories: Category[] = [];
  leafCategories: Category[] = [];
  rows: BulkBrandDraft[] = [];
  submittedRowIds: string[] = [];
  operation: AdminBrandBulkOperation | null = null;
  resultItems: AdminBrandBulkOperationItem[] = [];
  isLoading = true;
  isSubmitting = false;
  isUploadingDefaultLogo = false;
  isUploadingDefaultCover = false;
  stage: 'review' | 'done' = 'review';
  processedRows = 0;
  succeededRows = 0;
  failedRows = 0;
  currentPage = 1;
  lastSuccessMessage = '';
  defaultCategorySearch = '';
  rowCategorySearch: Record<string, string> = {};
  openCategoryDropdown: 'defaults' | string | null = null;
  rowFilter: BulkRowFilter = 'all';
  rowSearch = '';
  defaultsExpanded = true;
  readonly pageSize = 25;
  readonly uploadingRowIds = new Set<string>();
  private pollingSubscription?: Subscription;

  defaults: Pick<BulkBrandDraft, 'categoryId' | 'categoryIds' | 'logoUrl' | 'coverImageUrl' | 'isActive'> = {
    categoryId: null,
    categoryIds: [],
    logoUrl: null,
    coverImageUrl: null,
    isActive: true
  };

  constructor(
    private readonly catalogService: CatalogService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  get currentLang(): string {
    return this.translate.currentLang || 'ar';
  }

  get filteredRows(): BulkBrandDraft[] {
    let list = this.rows;

    if (this.rowFilter === 'ready') {
      list = list.filter((row) => !this.getRowError(row));
    } else if (this.rowFilter === 'errors') {
      list = list.filter((row) => !!this.getRowError(row));
    }

    const query = this.rowSearch.trim().toLowerCase();
    if (query) {
      list = list.filter((row) =>
        (row.nameAr || '').toLowerCase().includes(query) ||
        (row.nameEn || '').toLowerCase().includes(query));
    }

    return list;
  }

  get pagedRows(): BulkBrandDraft[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  get selectedCount(): number {
    return this.rows.filter((row) => row.selected).length;
  }

  get allFilteredRowsSelected(): boolean {
    return this.filteredRows.length > 0 && this.filteredRows.every((row) => row.selected);
  }

  get invalidRowsCount(): number {
    return this.rows.filter((row) => !!this.getRowError(row)).length;
  }

  get submittableRows(): BulkBrandDraft[] {
    return this.rows.filter((row) => !this.getRowError(row));
  }

  get submitProgressPercent(): number {
    if (!this.submittedRowIds.length) {
      return 0;
    }

    return Math.min(100, Math.round((this.processedRows / this.submittedRowIds.length) * 100));
  }

  get resultMap(): Record<string, AdminBrandBulkOperationItem> {
    return this.resultItems.reduce<Record<string, AdminBrandBulkOperationItem>>((acc, item) => {
      const rowId = this.submittedRowIds[item.rowNumber - 1];
      if (rowId) {
        acc[rowId] = item;
      }
      return acc;
    }, {});
  }

  setRowFilter(filter: BulkRowFilter): void {
    this.rowFilter = filter;
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  onRowSearchChange(): void {
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  globalRowIndex(visibleIndex: number): number {
    return (this.currentPage - 1) * this.pageSize + visibleIndex + 1;
  }

  toggleAllFilteredRows(checked: boolean): void {
    const visibleIds = new Set(this.filteredRows.map((row) => row.rowId));
    this.rows.forEach((row) => {
      if (visibleIds.has(row.rowId)) {
        row.selected = checked;
      }
    });
    this.cdr.markForCheck();
  }
  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  submit(): void {
    if (!this.submittableRows.length || this.isSubmitting) {
      return;
    }

    this.stage = 'review';
    this.isSubmitting = true;
    this.lastSuccessMessage = '';
    this.operation = null;
    this.resultItems = [];
    this.processedRows = 0;
    this.succeededRows = 0;
    this.failedRows = 0;
    this.pollingSubscription?.unsubscribe();

    const payload = this.submittableRows.map((row) => ({
      ...row,
      categoryIds: [...this.getRowCategoryIds(row)],
      categoryId: this.getRowCategoryIds(row)[0] ?? null
    }));
    this.submittedRowIds = payload.map((row) => row.rowId);

    this.catalogService.createBrandsBulk(payload).subscribe({
      next: (operation) => {
        this.cdr.markForCheck();
        this.operation = operation;
        this.processedRows = operation.processedRows;
        this.succeededRows = operation.succeededRows;
        this.failedRows = operation.failedRows;
        this.startPolling(operation.id);
      },
      error: (error) => {
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || this.translate.instant('BRANDS.BULK_ERR_START_FAILED');
        this.isSubmitting = false;
        this.processedRows = payload.length;
        this.failedRows = payload.length;
        this.stage = 'done';
        this.resultItems = payload.map((row, index) => ({
          id: `failed-${index + 1}`,
          rowNumber: index + 1,
          nameAr: row.nameAr,
          nameEn: row.nameEn,
          logoUrl: row.logoUrl || null,
          coverImageUrl: row.coverImageUrl || null,
          categoryId: row.categoryId!,
          categoryIds: row.categoryIds,
          isActive: row.isActive,
          status: 'Failed',
          errorMessage,
          createdBrandId: null
        }));
      }
    });
  }

  onDefaultsLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.isUploadingDefaultLogo = true;
    this.catalogService.uploadFile(file, 'brands').subscribe({
      next: (result) => {
        this.cdr.markForCheck();
        this.defaults.logoUrl = result.url;
        this.isUploadingDefaultLogo = false;
        input.value = '';
      },
      error: () => {
        this.cdr.markForCheck();
        this.isUploadingDefaultLogo = false;
        input.value = '';
      }
    });
  }

  onDefaultsCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.isUploadingDefaultCover = true;
    this.catalogService.uploadFile(file, 'brands').subscribe({
      next: (result) => {
        this.cdr.markForCheck();
        this.defaults.coverImageUrl = result.url;
        this.isUploadingDefaultCover = false;
        input.value = '';
      },
      error: () => {
        this.cdr.markForCheck();
        this.isUploadingDefaultCover = false;
        input.value = '';
      }
    });
  }

  onRowLogoSelected(row: BulkBrandDraft, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.uploadingRowIds.add(row.rowId);
    this.catalogService.uploadFile(file, 'brands').subscribe({
      next: (result) => {
        this.cdr.markForCheck();
        row.logoUrl = result.url;
        this.uploadingRowIds.delete(row.rowId);
        input.value = '';
      },
      error: () => {
        this.cdr.markForCheck();
        this.uploadingRowIds.delete(row.rowId);
        input.value = '';
      }
    });
  }

  onRowCoverSelected(row: BulkBrandDraft, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.uploadingRowIds.add(row.rowId);
    this.catalogService.uploadFile(file, 'brands').subscribe({
      next: (result) => {
        this.cdr.markForCheck();
        row.coverImageUrl = result.url;
        this.uploadingRowIds.delete(row.rowId);
        input.value = '';
      },
      error: () => {
        this.cdr.markForCheck();
        this.uploadingRowIds.delete(row.rowId);
        input.value = '';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/catalog/brands']);
  }

  addRows(count: number): void {
    this.rows = [...this.rows, ...Array.from({ length: count }, () => this.createEmptyRow())];
    this.cdr.markForCheck();
  }

  duplicateRow(row: BulkBrandDraft): void {
    this.rows = [...this.rows, { ...row, categoryIds: [...this.getRowCategoryIds(row)], rowId: this.createRowId(), selected: false }];
    this.cdr.markForCheck();
  }

  duplicateSelectedRows(): void {
    const selected = this.rows.filter((row) => row.selected);
    if (!selected.length) return;
    this.rows = [...this.rows, ...selected.map((row) => ({ ...row, categoryIds: [...this.getRowCategoryIds(row)], rowId: this.createRowId(), selected: false }))];
    this.cdr.markForCheck();
  }

  removeRow(rowId: string): void {
    this.rows = this.rows.filter((row) => row.rowId !== rowId);
    delete this.rowCategorySearch[rowId];
    if (this.openCategoryDropdown === rowId) {
      this.openCategoryDropdown = null;
    }
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.cdr.markForCheck();
  }

  removeSelectedRows(): void {
    const removedRowIds = this.rows.filter((row) => row.selected).map((row) => row.rowId);
    this.rows = this.rows.filter((row) => !row.selected);
    removedRowIds.forEach((rowId) => delete this.rowCategorySearch[rowId]);
    if (this.openCategoryDropdown && removedRowIds.includes(this.openCategoryDropdown)) {
      this.openCategoryDropdown = null;
    }
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.cdr.markForCheck();
  }

  applyDefaultsToSelected(): void {
    this.rows.filter((row) => row.selected).forEach((row) => this.applyDefaults(row));
    this.cdr.markForCheck();
  }

  applyDefaultsToAll(): void {
    this.rows.forEach((row) => this.applyDefaults(row));
    this.cdr.markForCheck();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      this.cdr.markForCheck();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.cdr.markForCheck();
    }
  }

  getCategoryLabel(category: Category): string {
    return this.currentLang === 'ar' ? (category.nameAr || category.nameEn) : (category.nameEn || category.nameAr);
  }

  get selectedDefaultCategories(): Category[] {
    const selectedIds = new Set(this.getDefaultCategoryIds());
    return this.leafCategories.filter((category) => selectedIds.has(category.id));
  }

  getDefaultCategorySummary(): string {
    return this.getCategorySelectionSummary(this.selectedDefaultCategories);
  }

  toggleDefaultCategoryDropdown(): void {
    this.openCategoryDropdown = this.openCategoryDropdown === 'defaults' ? null : 'defaults';
  }

  isDefaultCategoryDropdownOpen(): boolean {
    return this.openCategoryDropdown === 'defaults';
  }

  getFilteredDefaultCategories(): Category[] {
    return this.filterCategories(this.defaultCategorySearch);
  }

  isDefaultCategorySelected(categoryId: string): boolean {
    return this.getDefaultCategoryIds().includes(categoryId);
  }

  toggleDefaultCategory(categoryId: string, checked: boolean): void {
    const selectedIds = new Set(this.getDefaultCategoryIds());
    if (checked) {
      selectedIds.add(categoryId);
    } else {
      selectedIds.delete(categoryId);
    }

    const nextIds = this.sortCategoryIds([...selectedIds]);
    this.defaults.categoryIds = nextIds;
    this.defaults.categoryId = nextIds[0] ?? null;
    this.cdr.markForCheck();
  }

  getSelectedCategories(row: BulkBrandDraft): Category[] {
    const selectedIds = new Set(this.getRowCategoryIds(row));
    return this.leafCategories.filter((category) => selectedIds.has(category.id));
  }

  getRowCategorySummary(row: BulkBrandDraft): string {
    return this.getCategorySelectionSummary(this.getSelectedCategories(row));
  }

  toggleRowCategoryDropdown(row: BulkBrandDraft): void {
    if (this.isSubmitting) {
      return;
    }

    this.rowCategorySearch[row.rowId] ??= '';
    this.openCategoryDropdown = this.openCategoryDropdown === row.rowId ? null : row.rowId;
  }

  isRowCategoryDropdownOpen(row: BulkBrandDraft): boolean {
    return this.openCategoryDropdown === row.rowId;
  }

  getFilteredRowCategories(row: BulkBrandDraft): Category[] {
    return this.filterCategories(this.rowCategorySearch[row.rowId] ?? '');
  }

  isRowCategorySelected(row: BulkBrandDraft, categoryId: string): boolean {
    return this.getRowCategoryIds(row).includes(categoryId);
  }

  toggleRowCategory(row: BulkBrandDraft, categoryId: string, checked: boolean): void {
    const selectedIds = new Set(this.getRowCategoryIds(row));
    if (checked) {
      selectedIds.add(categoryId);
    } else {
      selectedIds.delete(categoryId);
    }

    const nextIds = this.sortCategoryIds([...selectedIds]);
    row.categoryIds = nextIds;
    row.categoryId = nextIds[0] ?? null;
    this.cdr.markForCheck();
  }

  removeRowCategory(row: BulkBrandDraft, categoryId: string): void {
    this.toggleRowCategory(row, categoryId, false);
  }

  getRowError(row: BulkBrandDraft): string | null {
    if (!row.nameAr?.trim()) {
      return this.translate.instant('BRANDS.BULK_ERR_NAME_AR_REQUIRED');
    }

    if (!row.nameEn?.trim()) {
      return this.translate.instant('BRANDS.BULK_ERR_NAME_EN_REQUIRED');
    }

    if (!this.getRowCategoryIds(row).length) {
      return this.translate.instant('BRANDS.BULK_ERR_CATEGORY_REQUIRED');
    }

    if ((row.logoUrl || '').trim().length > 1000) {
      return this.translate.instant('BRANDS.BULK_ERR_LOGO_URL_LONG');
    }

    if ((row.coverImageUrl || '').trim().length > 1000) {
      return this.translate.instant('BRANDS.BULK_ERR_COVER_URL_LONG');
    }

    return null;
  }

  private loadCategories(): void {
    this.catalogService.getCategories(undefined, true).subscribe({
      next: (categories) => {
        this.cdr.markForCheck();
        this.categories = Array.isArray(categories) ? categories : [];
        this.leafCategories = this.flattenLeafCategories(this.categories);
        this.addRows(25);
        this.isLoading = false;
      },
      error: () => {
        this.cdr.markForCheck();
        this.categories = [];
        this.leafCategories = [];
        this.addRows(25);
        this.isLoading = false;
      }
    });
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

  private applyDefaults(row: BulkBrandDraft): void {
    row.categoryIds = [...this.getDefaultCategoryIds()];
    row.categoryId = row.categoryIds[0] ?? null;
    row.logoUrl = this.defaults.logoUrl;
    row.coverImageUrl = this.defaults.coverImageUrl;
    row.isActive = this.defaults.isActive;
  }

  private createEmptyRow(): BulkBrandDraft {
    return {
      rowId: this.createRowId(),
      nameAr: '',
      nameEn: '',
      categoryId: this.defaults.categoryId,
      categoryIds: [...this.getDefaultCategoryIds()],
      logoUrl: this.defaults.logoUrl,
      coverImageUrl: this.defaults.coverImageUrl,
      isActive: this.defaults.isActive,
      selected: false
    };
  }

  private createRowId(): string {
    return `brand-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private startPolling(operationId: string): void {
    this.pollingSubscription = interval(1200)
      .pipe(switchMap(() => this.catalogService.getBrandsBulkOperation(operationId)))
      .subscribe({
        next: (operation) => {
        this.cdr.markForCheck();
          this.operation = operation;
          this.processedRows = operation.processedRows;
          this.succeededRows = operation.succeededRows;
          this.failedRows = operation.failedRows;

          if (operation.status === 'Completed' || operation.status === 'CompletedWithErrors' || operation.status === 'Failed') {
            this.isSubmitting = false;
            this.pollingSubscription?.unsubscribe();

            if (operation.status === 'Completed') {
              this.resetDraftsAfterSuccess(operation);
              return;
            }

            this.stage = 'done';
            this.catalogService.getBrandsBulkOperationItems(operationId).subscribe({
              next: (items) => {
        this.cdr.markForCheck();
                this.resultItems = items;
              },
              error: () => {
        this.cdr.markForCheck();
                this.resultItems = [];
              }
            });
          }
        },
        error: () => {
        this.cdr.markForCheck();
          this.isSubmitting = false;
          this.stage = 'done';
          this.pollingSubscription?.unsubscribe();
        }
      });
  }

  private resetDraftsAfterSuccess(operation: AdminBrandBulkOperation): void {
    this.lastSuccessMessage = this.translate.instant('BRANDS.BULK_SUCCESS_CLEARED', {
      count: operation.succeededRows
    });
    this.stage = 'review';
    this.operation = null;
    this.resultItems = [];
    this.submittedRowIds = [];
    this.processedRows = 0;
    this.succeededRows = 0;
    this.failedRows = 0;
    this.currentPage = 1;
    this.defaults = {
      categoryId: null,
      categoryIds: [],
      logoUrl: null,
      coverImageUrl: null,
      isActive: true
    };
    this.rows = Array.from({ length: 25 }, () => this.createEmptyRow());
    this.cdr.markForCheck();
  }

  getStatusLabel(isActive: boolean): string {
    return isActive
      ? this.translate.instant('BRANDS.STATUS_ACTIVE')
      : this.translate.instant('BRANDS.BULK_STATUS_INACTIVE');
  }

  private getCategorySelectionSummary(categories: Category[]): string {
    if (!categories.length) {
      return this.translate.instant('BRANDS.BULK_SELECT_CATEGORIES');
    }

    if (categories.length === 1) {
      return this.getCategoryLabel(categories[0]);
    }

    return this.translate.instant('BRANDS.BULK_CATEGORIES_COUNT', { count: categories.length });
  }

  private filterCategories(searchTerm: string): Category[] {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
    if (!normalizedSearch) {
      return this.leafCategories;
    }

    return this.leafCategories.filter((category) => {
      const nameAr = (category.nameAr || '').toLocaleLowerCase();
      const nameEn = (category.nameEn || '').toLocaleLowerCase();
      return nameAr.includes(normalizedSearch) || nameEn.includes(normalizedSearch);
    });
  }

  private getDefaultCategoryIds(): string[] {
    return this.sortCategoryIds(this.defaults.categoryIds?.length ? this.defaults.categoryIds : (this.defaults.categoryId ? [this.defaults.categoryId] : []));
  }

  private getRowCategoryIds(row: BulkBrandDraft): string[] {
    return this.sortCategoryIds(row.categoryIds?.length ? row.categoryIds : (row.categoryId ? [row.categoryId] : []));
  }

  private sortCategoryIds(categoryIds: string[]): string[] {
    const selectedIds = new Set(categoryIds.filter(Boolean));
    return this.leafCategories
      .map((category) => category.id)
      .filter((categoryId) => selectedIds.has(categoryId));
  }
}

