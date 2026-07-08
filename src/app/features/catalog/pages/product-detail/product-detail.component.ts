import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { MasterProduct, MasterProductVariantOption } from '@catalog/models/catalog.domain.models';
import { Subject, takeUntil } from 'rxjs';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { DetailHeaderComponent } from '../../../../shared/components/ui/detail-header/detail-header.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { DataTableComponent, TableColumn } from '../../../../shared/components/ui/data-table/data-table.component';

interface ProductVendorSnapshot {
 nameAr: string;
 nameEn: string;
 quantity: number;
 ratio: number;
 price: number;
 colorClass: string;
 timeKey: string;
}

interface ProductSizeCard {
 id: string;
 label: string;
 size: string;
 subtitle: string;
 isCurrent: boolean;
 imageUrl: string | null;
 barcode: string | null;
 slug: string | null;
}

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-product-detail',
 standalone: true,
 imports: [
 CommonModule,
 RouterModule,
 TranslateModule,
 AppButtonComponent,
 DetailHeaderComponent,
 KeyValueGridComponent,
 SectionHeaderComponent,
 StatusPillComponent,
 DataTableComponent
 ],
 templateUrl: './product-detail.component.html',
 styles: []
})
export class ProductDetailComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 product: MasterProduct | null = null;
 isLoading = true;
 selectedImageIndex = 0;
 categoryName: string = '';
 brandName: string = '';
 unitName: string = '';
 breadcrumbs: { label: string; action?: () => void }[] = [];
 vendorSnapshots: ProductVendorSnapshot[] = [];
 /** Currently active variant ID — null means the loaded product itself is active */
 activeVariantId: string | null = null;
 private readonly destroy$ = new Subject<void>();

 constructor(
 private route: ActivatedRoute,
 private router: Router,
 private catalogService: CatalogService,
 public translate: TranslateService
 ) {}

 get activeLang(): string {
 return this.translate.currentLang || 'ar';
 }

 /** Returns the variant option object if a non-primary variant is selected, otherwise null */
 get activeVariant(): MasterProductVariantOption | null {
 if (!this.activeVariantId ||!this.product?.variants) {
 return null;
 }
 return this.product.variants.find(v => v.id === this.activeVariantId) ?? null;
 }

 /** Whether the currently displayed data is for the primary product (not a sibling variant) */
 get isShowingPrimary(): boolean {
 return!this.activeVariantId || this.activeVariantId === this.product?.id;
 }

 get displayName(): string {
 if (!this.product) {
 return '';
 }

 const variant = this.activeVariant;
 if (variant) {
 return this.activeLang === 'ar'
 ? (variant.nameAr || variant.nameEn || '')
 : (variant.nameEn || variant.nameAr || '');
 }

 return this.activeLang === 'ar'
 ? (this.product.nameAr || this.product.nameEn || '')
 : (this.product.nameEn || this.product.nameAr || '');
 }

 get secondaryName(): string {
 if (!this.product) {
 return '';
 }

 return this.activeLang === 'ar'
 ? (this.product.nameEn || this.product.nameAr || '')
 : (this.product.nameAr || this.product.nameEn || '');
 }

 get productDescription(): string {
 if (!this.product) {
 return '';
 }

 return this.activeLang === 'ar'
 ? (this.product.descriptionAr || this.product.descriptionEn || '')
 : (this.product.descriptionEn || this.product.descriptionAr || '');
 }

 get resolvedBrandName(): string {
 const fallback = this.translate.instant('PRODUCTS.DETAIL.NOT_SPECIFIED');
 if (!this.product) {
 return fallback;
 }

 return this.brandName
 || (this.activeLang === 'ar' ? this.product.brandNameAr : this.product.brandNameEn)
 || this.product.brandId
 || fallback;
 }

 get resolvedCategoryName(): string {
 const fallback = this.translate.instant('PRODUCTS.DETAIL.NOT_SPECIFIED');
 if (!this.product) {
 return fallback;
 }

 return this.categoryName
 || (this.activeLang === 'ar' ? this.product.categoryNameAr : this.product.categoryNameEn)
 || fallback;
 }

 get resolvedUnitName(): string {
 const fallback = this.translate.instant('PRODUCTS.DETAIL.NOT_SPECIFIED');
 if (!this.product) {
 return fallback;
 }

 return this.unitName
 || (this.activeLang === 'ar' ? this.product.unitNameAr : this.product.unitNameEn)
 || this.product.unitOfMeasureId
 || fallback;
 }

 get resolvedPackageTypeName(): string {
 const fallback = this.translate.instant('PRODUCTS.DETAIL.NOT_SPECIFIED');
 if (!this.product) {
 return fallback;
 }

 const variant = this.activeVariant;
 if (variant) {
 const name = this.activeLang === 'ar'
 ? (variant.packageTypeNameAr || variant.packageTypeNameEn || '')
 : (variant.packageTypeNameEn || variant.packageTypeNameAr || '');
 return name || fallback;
 }

 return (this.activeLang === 'ar'
 ? (this.product.packageTypeNameAr || this.product.packageTypeNameEn || '')
 : (this.product.packageTypeNameEn || this.product.packageTypeNameAr || '')) || fallback;
 }

 get resolvedMeasurementUnitName(): string {
 const fallback = this.translate.instant('PRODUCTS.DETAIL.NOT_SPECIFIED');
 if (!this.product) {
 return fallback;
 }

 const variant = this.activeVariant;
 if (variant) {
 const name = this.activeLang === 'ar'
 ? (variant.measurementUnitNameAr || variant.measurementUnitNameEn || '')
 : (variant.measurementUnitNameEn || variant.measurementUnitNameAr || '');
 return name || fallback;
 }

 return (this.activeLang === 'ar'
 ? (this.product.measurementUnitNameAr || this.product.measurementUnitNameEn || this.product.unitNameAr || this.product.unitNameEn || '')
 : (this.product.measurementUnitNameEn || this.product.measurementUnitNameAr || this.product.unitNameEn || this.product.unitNameAr || '')) || fallback;
 }

 get resolvedDisplaySize(): string {
 const fallback = this.translate.instant('PRODUCTS.DETAIL.NOT_SPECIFIED');
 if (!this.product) {
 return fallback;
 }

 const variant = this.activeVariant;
 if (variant) {
 const variantSize = this.activeLang === 'ar'
 ? (variant.displaySizeAr || variant.displaySizeEn || '')
 : (variant.displaySizeEn || variant.displaySizeAr || '');
 return variantSize.trim() || fallback;
 }

 const localizedDisplaySize = this.activeLang === 'ar'
 ? (this.product.displaySizeAr || this.product.displaySizeEn || '')
 : (this.product.displaySizeEn || this.product.displaySizeAr || '');

 if (localizedDisplaySize.trim()) {
 return localizedDisplaySize;
 }

 const measurementValue = this.product.measurementValue!== null && this.product.measurementValue!== undefined
 ? `${this.product.measurementValue}`
 : '';
 const measurementUnit = this.activeLang === 'ar'
 ? (this.product.measurementUnitNameAr || this.product.measurementUnitNameEn || '')
 : (this.product.measurementUnitNameEn || this.product.measurementUnitNameAr || '');

 return [measurementValue, measurementUnit].filter(Boolean).join(' ').trim() || fallback;
 }

 get displayBarcode(): string {
 const variant = this.activeVariant;
 if (variant?.barcode) {
 return variant.barcode;
 }
 return this.product?.barcode || this.translate.instant('PRODUCTS.DETAIL.NOT_SPECIFIED');
 }

 get linkedVariants(): MasterProductVariantOption[] {
 return this.product?.variants ?? [];
 }

 get hasLinkedVariants(): boolean {
 return this.linkedVariants.length > 1;
 }

 get sizeCards(): ProductSizeCard[] {
 if (!this.product) {
 return [];
 }

 const cards: ProductSizeCard[] = [];
 const currentActiveId = this.activeVariantId || this.product.id;

 // Primary card — the loaded product itself
 const primaryImageUrl = this.product.images?.find(img => img.isPrimary)?.url
 || this.product.images?.[0]?.url
 || null;

 const primaryDisplaySize = this.activeLang === 'ar'
 ? (this.product.displaySizeAr || this.product.displaySizeEn || '')
 : (this.product.displaySizeEn || this.product.displaySizeAr || '');

 cards.push({
 id: this.product.id,
 label: this.activeLang === 'ar'
 ? (this.product.nameAr || this.product.nameEn || '')
 : (this.product.nameEn || this.product.nameAr || ''),
 size: primaryDisplaySize.trim() || (this.product.measurementValue ? `${this.product.measurementValue}` : '—'),
 subtitle: this.activeLang === 'ar' ? 'الحجم الأساسي' : 'Primary size',
 isCurrent: currentActiveId === this.product.id,
 imageUrl: primaryImageUrl,
 barcode: this.product.barcode || null,
 slug: (this.product as any).slug || null
 });

 // Sibling variant cards
 for (const variant of this.linkedVariants) {
 if (!variant.id || variant.id === this.product.id) {
 continue;
 }

 cards.push({
 id: variant.id,
 label: this.getVariantLabel(variant),
 size: this.getVariantSize(variant),
 subtitle: this.activeLang === 'ar' ? 'حجم مرتبط' : 'Linked size',
 isCurrent: currentActiveId === variant.id,
 imageUrl: variant.imageUrl || null,
 barcode: variant.barcode || null,
 slug: variant.slug || null
 });
 }

 return cards;
 }

 get hasSizeCards(): boolean {
 return this.sizeCards.length > 0;
 }

 get imageCount(): number {
 return this.activeGalleryImages.length;
 }

 get vendorCount(): number {
 return this.vendorSnapshots.length;
 }

 get totalVendorStock(): number {
 return this.vendorSnapshots.reduce((total, vendor) => total + vendor.quantity, 0);
 }

 get minVendorPrice(): number | null {
 if (!this.vendorSnapshots.length) {
 return null;
 }

 return Math.min(...this.vendorSnapshots.map((vendor) => vendor.price));
 }

 readonly vendorTableColumns: TableColumn[] = [
 { key: 'vendor', title: 'PRODUCTS.DETAIL.VENDOR_NAME', type: 'custom', align: 'left', width: '34%' },
 { key: 'quantity', title: 'PRODUCTS.DETAIL.AVAILABLE_QTY', type: 'custom', align: 'center', width: '26%' },
 { key: 'price', title: 'PRODUCTS.DETAIL.UNIT_PRICE', type: 'custom', align: 'center', width: '20%' },
 { key: 'time', title: 'PRODUCTS.DETAIL.LAST_UPDATE', type: 'custom', align: 'center', width: '20%' }
 ];

 ngOnInit(): void {
 this.setupBreadcrumbs();
 this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
 this.cdr.markForCheck();
 const id = params.get('id');
 if (id) {
 this.loadProduct(id);
 }
 });
 }

 setupBreadcrumbs(): void {
 this.breadcrumbs = [
 { label: this.translate.instant('SIDEBAR.CATALOG'), action: () => this.goBack() },
 { label: this.translate.instant('PRODUCTS.TITLE'), action: () => this.goBack() },
 { label: this.translate.instant('PRODUCTS.DETAIL.TITLE') }
 ];
 }

 loadProduct(id: string): void {
 this.isLoading = true;
 this.selectedImageIndex = 0;
 this.activeVariantId = null;
 this.vendorSnapshots = [];
 this.categoryName = '';
 this.brandName = '';
 this.unitName = '';

 this.catalogService.getProductById(id).subscribe({
 next: (product) => {
 this.cdr.markForCheck();
 this.product = product;
 this.loadCategoryAndBrand();
 this.loadLinkedVendors(this.currentProductViewId);
 this.isLoading = false;
 },
 error: (err) => {
 this.cdr.markForCheck();
 console.error('Error loading product', err);
 this.product = null;
 this.isLoading = false;
 }
 });
 }

 loadLinkedVendors(id: string): void {
 this.catalogService.getProductVendors(id).subscribe({
 next: (res) => {
 this.cdr.markForCheck();
 const maxQty = Math.max(1,...res.items.map(i => i.quantity));
 const colors = [
 'bg-emerald-500', 'bg-red-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-amber-500'
 ];
 
 this.vendorSnapshots = res.items.map((item, index) => {
 return {
 nameAr: item.nameAr,
 nameEn: item.nameEn,
 quantity: item.quantity,
 ratio: (item.quantity / maxQty) * 100,
 price: item.price,
 colorClass: colors[index % colors.length],
 timeKey: this.formatTimeKey(item.updatedAtUtc)
 };
 });
 },
 error: (err) => console.error('Error loading product vendors', err)
 });
 }

 formatTimeKey(dateStr: string): string {
 const updatedAt = new Date(dateStr);
 const now = new Date();
 const diffHours = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
 
 if (diffHours < 24 && now.getDate() === updatedAt.getDate()) {
 return 'PRODUCTS.DETAIL.TIME_TODAY';
 } else if (diffHours < 48) {
 return 'PRODUCTS.DETAIL.TIME_YESTERDAY';
 } else {
 return 'PRODUCTS.DETAIL.TIME_WEEK_AGO';
 }
 }

 loadCategoryAndBrand(): void {
 if (this.product?.categoryId) {
 this.catalogService.getCategoryById(this.product.categoryId).subscribe({
 next: (category) => {
 this.cdr.markForCheck();
 this.categoryName = this.activeLang === 'ar' ? category.nameAr : category.nameEn;
 },
 error: (err) => console.error('Error loading category', err)
 });
 }

 if (this.product?.brandId) {
 this.catalogService.getBrands().subscribe({
 next: (brands) => {
 this.cdr.markForCheck();
 const brand = brands.find(b => b.id === this.product?.brandId);
 if (brand) {
 this.brandName = this.activeLang === 'ar' ? brand.nameAr : brand.nameEn;
 }
 },
 error: (err) => console.error('Error loading brands', err)
 });
 }

 if (this.product?.unitOfMeasureId) {
 this.catalogService.getUnits().subscribe({
 next: (units) => {
 this.cdr.markForCheck();
 const unit = units.find(u => u.id === this.product?.unitOfMeasureId);
 if (unit) {
 this.unitName = this.activeLang === 'ar' ? unit.nameAr : unit.nameEn;
 }
 },
 error: (err) => console.error('Error loading units', err)
 });
 }
 }

 selectImage(index: number): void {
 const maxIndex = Math.max(0, this.activeGalleryImages.length - 1);
 this.selectedImageIndex = Math.max(0, Math.min(index, maxIndex));
 }

 getMainImage(): string {
 const noImageLabel = 'No image';

 const images = this.activeGalleryImages;
 if (!images.length) {
 return this.buildPlaceholderImage(noImageLabel);
 }

 return images[this.selectedImageIndex] || images[0] || this.buildPlaceholderImage(noImageLabel);
 }

 goBack(): void {
 this.router.navigate(['/catalog/products']);
 }

 editProduct(): void {
 const editId = this.activeVariantId || this.product?.id;
 if (editId) {
 this.router.navigate(['/catalog/products/edit', editId]);
 }
 }

 openVariantDetails(variant: MasterProductVariantOption): void {
 if (!variant.id || variant.id === this.product?.id) {
 return;
 }

 this.router.navigate(['/catalog/products/view', variant.id]);
 }

 openSizeCard(id: string, isCurrent: boolean): void {
 if (!id) {
 return;
 }

 // Determine the currently active ID
 const currentActiveId = this.activeVariantId || this.product?.id;
 if (id === currentActiveId) {
 return; // Already showing this variant
 }

 // Instant switch — no reload, just change the active variant
 if (id === this.product?.id) {
 this.activeVariantId = null; // back to the primary product
 } else {
 this.activeVariantId = id;
 }
 this.selectedImageIndex = 0;
 this.loadLinkedVendors(this.currentProductViewId);
 }

 trackBySizeCard(index: number, card: ProductSizeCard): string {
 return card.id;
 }

 getVariantLabel(variant: MasterProductVariantOption): string {
 return this.activeLang === 'ar'
 ? (variant.nameAr || variant.nameEn || '')
 : (variant.nameEn || variant.nameAr || '');
 }

 getVariantSize(variant: MasterProductVariantOption): string {
 const fallback = this.translate.instant('PRODUCTS.DETAIL.NOT_SPECIFIED');
 return (this.activeLang === 'ar'
 ? (variant.displaySizeAr || variant.displaySizeEn || '')
 : (variant.displaySizeEn || variant.displaySizeAr || '')).trim() || fallback;
 }

 get detailItems(): KeyValueGridItem[] {
 if (!this.product) {
 return [];
 }

 const notSpecified = this.translate.instant('PRODUCTS.DETAIL.NOT_SPECIFIED');

 return [
 {
 label: 'PRODUCTS.DETAIL.BARCODE',
 value: this.product.barcode || notSpecified,
 translateValue: false,
 valueDir: this.product.barcode ? 'ltr' : 'auto'
 },
 {
 label: 'PRODUCTS.DETAIL.UNIT',
 value: this.resolvedUnitName || notSpecified,
 translateValue: false
 },
 {
 label: 'PRODUCTS.DETAIL.CATEGORY',
 value: this.resolvedCategoryName || notSpecified,
 translateValue: false
 },
 {
 label: 'PRODUCTS.DETAIL.BRAND',
 value: this.resolvedBrandName || notSpecified,
 translateValue: false
 }
 ];
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
 Active: 'PRODUCTS.DETAIL.STATUS_ACTIVE',
 Draft: 'PRODUCTS.DETAIL.STATUS_DRAFT',
 Inactive: 'PRODUCTS.DETAIL.STATUS_INACTIVE',
 Discontinued: 'MASTER_PRODUCTS.STATUS_DISCONTINUED'
 };

 return labels[status || ''] || status || '-';
 }

 getVendorName(vendor: ProductVendorSnapshot): string {
 return this.activeLang === 'ar' ? vendor.nameAr : vendor.nameEn;
 }

 getVendorRatioWidth(vendor: ProductVendorSnapshot): string {
 return `${Math.max(0, Math.min(100, vendor.ratio))}%`;
 }

 ngOnDestroy(): void {
 this.destroy$.next();
 this.destroy$.complete();
 }

 private buildPlaceholderImage(label: string): string {
 return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%23999" text-anchor="middle" dominant-baseline="middle"%3E${encodeURIComponent(label)}%3C/text%3E%3C/svg%3E`;
 }

 get currentProductViewId(): string {
 return this.activeVariantId || this.product?.id || '';
 }

 get activeGalleryImages(): string[] {
 const variant = this.activeVariant;
 if (variant?.images?.length) {
 return variant.images.filter(Boolean);
 }

 if (variant?.imageUrl) {
 return [variant.imageUrl];
 }

 return (this.product?.images ?? []).map((image) => image.url?.trim() || '').filter(Boolean);
 }
}

