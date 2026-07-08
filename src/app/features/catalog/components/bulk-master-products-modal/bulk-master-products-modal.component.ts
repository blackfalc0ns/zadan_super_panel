import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, forkJoin, interval, switchMap } from 'rxjs';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import {
 AdminMasterProductBulkOperation,
 AdminMasterProductBulkOperationItem,
 Brand,
 BulkMasterProductDraft,
 CatalogUnit,
 Category,
 MasterProduct
} from '../../models/catalog.domain.models';
import { CatalogService } from '../../services/catalog.api.service';

type BulkStage = 'review' | 'submitting' | 'done';
type BulkRowFilter = 'all' | 'ready' | 'errors';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-bulk-master-products-modal',
 standalone: true,
 imports: [CommonModule, FormsModule, TranslateModule, SearchableSelectComponent],
 templateUrl: './bulk-master-products-modal.component.html',
 styleUrls: ['./bulk-master-products-modal.component.scss']
})
export class BulkMasterProductsModalComponent implements OnInit, OnDestroy {
 private readonly cdr = inject(ChangeDetectorRef);
 @Input() categories: Category[] = [];
 @Input() brands: Brand[] = [];
 @Input() units: CatalogUnit[] = [];
 @Input() currentLang = 'ar';
 @Input() embedded = true;
 @Output() close = new EventEmitter<void>();
 @Output() completed = new EventEmitter<void>();

 rows: BulkMasterProductDraft[] = [];
 submittedRowIds: string[] = [];
 stage: BulkStage = 'review';
 submitError = '';
 operation: AdminMasterProductBulkOperation | null = null;
 resultItems: AdminMasterProductBulkOperationItem[] = [];
 pollSub?: Subscription;
 currentPage = 1;
 readonly pageSize = 25;
 rowFilter: BulkRowFilter = 'all';
 rowSearch = '';
 defaultsExpanded = true;
 readonly statusOptions: MasterProduct['status'][] = ['Draft', 'Active', 'Inactive', 'Discontinued'];
 isUploadingDefaultImages = false;
 readonly uploadingRowIds = new Set<string>();

 defaults: Pick<BulkMasterProductDraft, 'categoryId' | 'brandId' | 'unitId' | 'packageTypeId' | 'measurementValue' | 'measurementUnitId' | 'variantGroupId' | 'status' | 'images'> = {
 categoryId: null,
 brandId: null,
 unitId: null,
 packageTypeId: null,
 measurementValue: null,
 measurementUnitId: null,
 variantGroupId: null,
 status: 'Draft',
 images: []
 };

 constructor(private readonly catalogService: CatalogService) {}

 ngOnInit(): void {
 this.addRows(25);
 }

 ngOnDestroy(): void {
 this.pollSub?.unsubscribe();
 }

 get leafCategories(): Category[] {
 return this.flattenCategories(this.categories).filter((category) =>!category.subCategories?.length &&!!category.parentCategoryId);
 }

 get filteredRows(): BulkMasterProductDraft[] {
 let list = this.rows;

 if (this.rowFilter === 'ready') {
 list = list.filter((row) =>!this.validateRow(row));
 } else if (this.rowFilter === 'errors') {
 list = list.filter((row) =>!!this.validateRow(row));
 }

 const query = this.rowSearch.trim().toLowerCase();
 if (query) {
 list = list.filter((row) =>
 (row.nameAr || '').toLowerCase().includes(query) ||
 (row.nameEn || '').toLowerCase().includes(query));
 }

 return list;
 }

 get pagedRows(): BulkMasterProductDraft[] {
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
 return this.rows.filter((row) =>!!this.validateRow(row)).length;
 }

 get submittableRows(): BulkMasterProductDraft[] {
 return this.rows.filter((row) =>!this.validateRow(row));
 }

 get submitProgressPercent(): number {
 if (!this.operation?.totalRows) {
 return 0;
 }

 return Math.min(100, Math.round((this.operation.processedRows / this.operation.totalRows) * 100));
 }

 get resultMap(): Record<string, AdminMasterProductBulkOperationItem> {
 return this.resultItems.reduce<Record<string, AdminMasterProductBulkOperationItem>>((acc, item) => {
 const rowId = this.submittedRowIds[item.rowNumber - 1];
 if (rowId) {
 acc[rowId] = item;
 }
 return acc;
 }, {});
 }

 get leafCategoryOptions(): SearchableSelectOption<string | null>[] {
 return [
 { value: null, labelKey: 'MASTER_PRODUCTS.SELECT_CATEGORY_PLACEHOLDER' },...this.leafCategories.map((category) => ({
 value: category.id,
 label: this.getCategoryLabel(category.id)
 }))
 ];
 }

 get packageTypeOptions(): SearchableSelectOption<string | null>[] {
 return [
 { value: null, labelKey: 'MASTER_PRODUCTS.STANDARD_UNIT' },...this.units.filter((unit) => unit.kind === 'Packaging').map((unit) => ({
 value: unit.id,
 label: this.currentLang === 'ar' ? unit.nameAr : unit.nameEn
 }))
 ];
 }

 get measurementUnitOptions(): SearchableSelectOption<string | null>[] {
 return [
 { value: null, labelKey: 'MASTER_PRODUCTS.STANDARD_UNIT' },...this.units.filter((unit) => unit.kind === 'Measurement').map((unit) => ({
 value: unit.id,
 label: this.currentLang === 'ar' ? unit.nameAr : unit.nameEn
 }))
 ];
 }

 get statusSelectOptions(): SearchableSelectOption<MasterProduct['status']>[] {
 return this.statusOptions.map((status) => ({
 value: status,
 label: this.getStatusLabel(status)
 }));
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

 onClose(): void {
 this.close.emit();
 }

 emitCompleted(): void {
 this.completed.emit();
 }

 addRows(count: number): void {
 const nextRows = Array.from({ length: count }, () => this.createEmptyRow());
 this.rows = [...this.rows,...nextRows];
 this.cdr.markForCheck();
 }

 duplicateRow(row: BulkMasterProductDraft): void {
 const duplicated = {...row, rowId: this.createRowId(), selected: false };
 this.rows = [...this.rows, duplicated];
 this.cdr.markForCheck();
 }

 duplicateSelectedRows(): void {
 const selected = this.rows.filter((row) => row.selected);
 if (!selected.length) return;
 this.rows = [...this.rows,...selected.map((row) => ({...row, rowId: this.createRowId(), selected: false }))];
 this.cdr.markForCheck();
 }

 removeRow(rowId: string): void {
 this.rows = this.rows.filter((row) => row.rowId!== rowId);
 if (this.currentPage > this.totalPages) {
 this.currentPage = this.totalPages;
 }
 this.cdr.markForCheck();
 }

 removeSelectedRows(): void {
 this.rows = this.rows.filter((row) =>!row.selected);
 if (this.currentPage > this.totalPages) {
 this.currentPage = this.totalPages;
 }
 this.cdr.markForCheck();
 }

 toggleAllRows(checked: boolean): void {
 this.rows.forEach((row) => row.selected = checked);
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

 applyDefaults(row: BulkMasterProductDraft): void {
 row.categoryId = this.defaults.categoryId;
 row.brandId = this.defaults.brandId;
 row.unitId = this.defaults.unitId;
 row.packageTypeId = this.defaults.packageTypeId;
 row.measurementValue = this.defaults.measurementValue;
 row.measurementUnitId = this.defaults.measurementUnitId;
 row.variantGroupId = this.defaults.variantGroupId;
 row.status = this.defaults.status;
 row.images = (this.defaults.images || []).map((image) => ({...image }));
 this.ensureBrandMatchesCategory(row);
 }

 generateSlugsForSelected(): void {
 this.rows.filter((row) => row.selected).forEach((row) => {
 row.slug = this.generateSlug(row.nameEn || row.nameAr || `product-${row.rowId}`);
 });
 this.cdr.markForCheck();
 }

 generateBarcodesForSelected(): void {
 this.rows.filter((row) => row.selected &&!row.barcode).forEach((row) => {
 row.barcode = this.generateBarcode();
 });
 this.cdr.markForCheck();
 }

 ensureGeneratedValues(row: BulkMasterProductDraft): void {
 if (!row.slug) {
 row.slug = this.generateSlug(row.nameEn || row.nameAr || `product-${row.rowId}`);
 }

 if (!row.barcode) {
 row.barcode = this.generateBarcode();
 }
 }

 getRowError(row: BulkMasterProductDraft): string | null {
 return this.validateRow(row);
 }

 validateRow(row: BulkMasterProductDraft): string | null {
 if (!row.nameAr?.trim()) {
 return this.currentLang === 'ar' ? 'الاسم العربي مطلوب.' : 'Arabic name is required.';
 }

 if (!row.nameEn?.trim()) {
 return this.currentLang === 'ar' ? 'الاسم الإنجليزي مطلوب.' : 'English name is required.';
 }

 if (!row.categoryId) {
 return this.currentLang === 'ar' ? 'التصنيف مطلوب.' : 'Category is required.';
 }

 if ((row.slug || '').trim().length > 250) {
 return this.currentLang === 'ar' ? 'قيمة slug لازم ما تتجاوز 250 حرفًا.' : 'Slug must not exceed 250 characters.';
 }

 if ((row.barcode || '').trim().length > 100) {
 return this.currentLang === 'ar' ? 'الباركود لازم ما يتجاوز 100 حرف.' : 'Barcode must not exceed 100 characters.';
 }

 const hasMeasurementValue = row.measurementValue!== null && row.measurementValue!== undefined && `${row.measurementValue}`.trim()!== '';
 const hasMeasurementUnit =!!row.measurementUnitId;
 if (hasMeasurementValue!== hasMeasurementUnit) {
 return this.currentLang === 'ar' ? 'الحجم ووحدة القياس لازم يتسجلوا معًا.' : 'Measurement value and unit must be provided together.';
 }

 return null;
 }

 submit(): void {
 if (!this.submittableRows.length) {
 return;
 }

 const payload = this.submittableRows.map((row) => {
 this.ensureGeneratedValues(row);
 return row;
 });

 this.submittedRowIds = payload.map((row) => row.rowId);
 this.stage = 'submitting';
 this.submitError = '';
 this.catalogService.createProductsBulk(payload).subscribe({
 next: (operation) => {
 this.cdr.markForCheck();
 this.operation = operation;
 this.startPolling(operation.id);
 },
 error: (error: HttpErrorResponse) => {
 this.cdr.markForCheck();
 this.submitError = this.resolveSubmitError(error);
 this.stage = 'review';
 }
 });
 }

 private resolveSubmitError(error: HttpErrorResponse): string {
 if (error.status === 401 || error.status === 403) {
 return this.currentLang === 'ar'
 ? 'انتهت الجلسة أو ما عندك صلاحية الإضافة الجماعية. سجل الدخول مرة ثانية ثم أعد المحاولة.'
 : 'Your session expired or you do not have permission for bulk creation. Sign in again and retry.';
 }

 const detail = error.error?.detail || error.error?.title || error.message;
 return detail || (this.currentLang === 'ar'
 ? 'ما قدرنا نرسل المنتجات الحين. راجع البيانات وجرّب مرة ثانية.'
 : 'Could not submit products right now. Review the data and try again.');
 }

 onDefaultImagesSelected(event: Event): void {
 const input = event.target as HTMLInputElement;
 const files = Array.from(input.files ?? []);
 if (!files.length) {
 return;
 }

 this.isUploadingDefaultImages = true;
 forkJoin(files.map((file) => this.catalogService.uploadFile(file, 'products'))).subscribe({
 next: (results) => {
 this.cdr.markForCheck();
 this.defaults.images = this.mapUploadedImages(results.map((result) => result.url));
 this.isUploadingDefaultImages = false;
 input.value = '';
 },
 error: () => {
 this.cdr.markForCheck();
 this.isUploadingDefaultImages = false;
 input.value = '';
 }
 });
 }

 onRowImagesSelected(row: BulkMasterProductDraft, event: Event): void {
 const input = event.target as HTMLInputElement;
 const files = Array.from(input.files ?? []);
 if (!files.length) {
 return;
 }

 this.uploadingRowIds.add(row.rowId);
 forkJoin(files.map((file) => this.catalogService.uploadFile(file, 'products'))).subscribe({
 next: (results) => {
 this.cdr.markForCheck();
 row.images = this.mapUploadedImages(results.map((result) => result.url));
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

 removeDefaultImage(index: number): void {
 this.defaults.images = (this.defaults.images || []).filter((_, imageIndex) => imageIndex!== index).map((image, imageIndex) => ({...image, displayOrder: imageIndex + 1, isPrimary: imageIndex === 0 }));
 }

 removeRowImage(row: BulkMasterProductDraft, index: number): void {
 row.images = (row.images || []).filter((_, imageIndex) => imageIndex!== index).map((image, imageIndex) => ({...image, displayOrder: imageIndex + 1, isPrimary: imageIndex === 0 }));
 }

 startPolling(operationId: string): void {
 this.pollSub?.unsubscribe();
 this.pollSub = interval(2000).pipe(switchMap(() => this.catalogService.getProductsBulkOperation(operationId))).subscribe({
 next: (operation) => {
 this.cdr.markForCheck();
 this.operation = operation;
 if (operation.status!== 'Pending' && operation.status!== 'Processing') {
 this.catalogService.getProductsBulkOperationItems(operationId).subscribe({
 next: (items) => {
 this.cdr.markForCheck();
 this.resultItems = items;
 this.stage = 'done';
 this.pollSub?.unsubscribe();
 }
 });
 }
 }
 });
 }

 copyErrors(): void {
 const text = this.buildErrorText();
 if (text) {
 navigator.clipboard?.writeText(text);
 }
 }

 downloadErrors(): void {
 const text = this.buildErrorText();
 if (!text) return;

 const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
 const url = URL.createObjectURL(blob);
 const anchor = document.createElement('a');
 anchor.href = url;
 anchor.download = 'bulk-master-product-errors.txt';
 anchor.click();
 URL.revokeObjectURL(url);
 }

 nextPage(): void {
 if (this.currentPage < this.totalPages) {
 this.currentPage += 1;
 }
 }

 previousPage(): void {
 if (this.currentPage > 1) {
 this.currentPage -= 1;
 }
 }

 getCategoryLabel(categoryId: string): string {
 const category = this.flattenCategories(this.categories).find((item) => item.id === categoryId);
 if (!category) return categoryId;
 return this.currentLang === 'ar' ? (category.nameAr || category.nameEn) : (category.nameEn || category.nameAr);
 }

 onDefaultsCategoryChanged(categoryId: string | null): void {
 this.defaults.categoryId = categoryId;
 const availableBrands = this.getAvailableBrandsForCategory(categoryId);
 const isCurrentBrandValid = availableBrands.some((brand) => brand.id === this.defaults.brandId);

 if (!isCurrentBrandValid) {
 this.defaults.brandId = null;
 }
 }

 onRowCategoryChanged(row: BulkMasterProductDraft, categoryId: string | null): void {
 row.categoryId = categoryId;
 this.ensureBrandMatchesCategory(row);
 }

 getAvailableBrandsForCategory(categoryId: string | null | undefined): Brand[] {
 if (!categoryId) {
 return [];
 }

 const ancestorIds = this.getAncestorCategoryIds(categoryId);
 const matchIds = new Set([categoryId,...ancestorIds]);

 return this.brands.filter((brand) => {
 const brandCategoryIds = brand.categoryIds?.length ? brand.categoryIds : (brand.categoryId ? [brand.categoryId] : []);
 return brandCategoryIds.some((brandCategoryId) => matchIds.has(brandCategoryId));
 });
 }

 getBrandOptionsForCategory(categoryId: string | null | undefined): SearchableSelectOption<string | null>[] {
 return [
 { value: null, labelKey: 'MASTER_PRODUCTS.GENERIC_WHITE_LABEL' },...this.getAvailableBrandsForCategory(categoryId).map((brand) => ({
 value: brand.id,
 label: this.currentLang === 'ar' ? (brand.nameAr || brand.nameEn) : (brand.nameEn || brand.nameAr)
 }))
 ];
 }

 getStatusLabel(status: MasterProduct['status']): string {
 if (this.currentLang!== 'ar') {
 return status;
 }

 switch (status) {
 case 'Draft':
 return 'مسودة';
 case 'Active':
 return 'نشط';
 case 'Inactive':
 return 'غير نشط';
 case 'Discontinued':
 return 'متوقف';
 default:
 return status;
 }
 }

 private createEmptyRow(): BulkMasterProductDraft {
 return {
 rowId: this.createRowId(),
 nameAr: '',
 nameEn: '',
 slug: null,
 barcode: null,
 categoryId: this.defaults.categoryId,
 brandId: this.defaults.brandId,
 unitId: this.defaults.unitId,
 packageTypeId: this.defaults.packageTypeId,
 measurementValue: this.defaults.measurementValue,
 measurementUnitId: this.defaults.measurementUnitId,
 variantGroupId: this.defaults.variantGroupId,
 status: this.defaults.status,
 descriptionAr: null,
 descriptionEn: null,
 images: (this.defaults.images || []).map((image) => ({...image })),
 selected: false
 };
 }

 private createRowId(): string {
 return `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
 }

 private flattenCategories(categories: Category[]): Category[] {
 return categories.flatMap((category) => [category,...this.flattenCategories(category.subCategories ?? [])]);
 }

 private ensureBrandMatchesCategory(row: BulkMasterProductDraft): void {
 const availableBrands = this.getAvailableBrandsForCategory(row.categoryId);
 const isBrandValid = availableBrands.some((brand) => brand.id === row.brandId);

 if (!isBrandValid) {
 row.brandId = null;
 }
 }

 private getAncestorCategoryIds(categoryId: string): string[] {
 const ancestors: string[] = [];
 const categoryMap = this.buildCategoryMap();

 let currentId: string | null | undefined = categoryId;
 const visited = new Set<string>();

 while (currentId &&!visited.has(currentId)) {
 visited.add(currentId);
 const category = categoryMap.get(currentId);
 if (category?.parentCategoryId) {
 ancestors.push(category.parentCategoryId);
 currentId = category.parentCategoryId;
 } else {
 break;
 }
 }

 return ancestors;
 }

 private buildCategoryMap(): Map<string, Category> {
 return this.flattenCategories(this.categories).reduce((map, category) => {
 map.set(category.id, category);
 return map;
 }, new Map<string, Category>());
 }

 private generateSlug(value: string): string {
 return value.toLowerCase().trim().replace(/[^\u0600-\u06FFa-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
 }

 private generateBarcode(): string {
 return `MP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
 }

 private buildErrorText(): string {
 return this.resultItems.filter((item) =>!!item.errorMessage).map((item) => `#${item.rowNumber} ${item.nameAr || item.nameEn}: ${item.errorMessage}`).join('\n');
 }

 private mapUploadedImages(urls: string[]): NonNullable<BulkMasterProductDraft['images']> {
 return urls.map((url, index) => ({
 url,
 altText: null,
 displayOrder: index + 1,
 isPrimary: index === 0
 }));
 }
}

