import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppInputComponent } from '../../../../shared/components/ui/form-controls/input/input.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { AdminVendorOrderItem, VendorService } from '@vendors/services/vendor.api.service';
import { AdminVendorOrderStats } from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';
import { ExportService } from '../../../../shared/utils/export';
import { ToastService } from '../../../../shared/services/toast.service';

interface KPI {
 id: string;
 label: string;
 value: string;
 tone: 'primary' | 'success' | 'warning' | 'danger';
 icon: string;
}

interface OrderRow {
 id: string;
 orderNumber: string;
 customer: string;
 date: string;
 time: string;
 amount: string;
 itemsCount: string;
 paymentStatusRaw: string;
 orderStatusRaw: string;
 paymentStatus: string;
 orderStatus: string;
 paymentStatusKey: string;
 orderStatusKey: string;
}

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-vendor-orders',
 standalone: true,
 imports: [
 CommonModule,
 FormsModule,
 TranslateModule,
 AppInputComponent,
 SearchableSelectComponent,
 AppPaginationComponent,
 StatusPillComponent
 ],
 templateUrl: './vendor-orders.component.html'
})
export class VendorOrdersComponent {
 private readonly cdr = inject(ChangeDetectorRef);
 vendorId = '';
 currentLang = 'ar';
 isRTL = true;
 searchQuery = '';
 selectedStatus = '';
 selectedPaymentStatus = '';
 isLoading = false;
 hasError = false;
 currentPage = 1;
 readonly pageSize = 12;
 totalItems = 0;
 ordersData: AdminVendorOrderItem[] = [];
 orderStats: AdminVendorOrderStats | null = null;
 kpis: KPI[] = [];

 readonly statusOptions: SearchableSelectOption<string>[] = this.buildStatusOptions();
 readonly paymentStatusOptions: SearchableSelectOption<string>[] = this.buildPaymentStatusOptions();

 private readonly destroyRef = inject(DestroyRef);
 private readonly searchSubject = new Subject<string>();
 private readonly exportService = inject(ExportService);
 private readonly toastService = inject(ToastService);

 constructor(
 private readonly translate: TranslateService,
 private readonly router: Router,
 private readonly vendorService: VendorService,
 private readonly vendorDetailFacade: VendorDetailFacade
 ) {
 this.currentLang = this.translate.currentLang || 'ar';
 this.isRTL = this.currentLang === 'ar';
 this.rebuildFilters();

 this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
 this.cdr.markForCheck();
 this.currentLang = event.lang;
 this.isRTL = event.lang === 'ar';
 this.rebuildFilters();
 this.rebuildViewModel();
 });

 this.searchSubject.pipe(
 debounceTime(250),
 distinctUntilChanged(),
 takeUntilDestroyed(this.destroyRef)
 ).subscribe(() => {
 this.cdr.markForCheck();
 this.currentPage = 1;
 this.loadOrders();
 });

 this.vendorDetailFacade.vendorId$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((vendorId) => {
 this.cdr.markForCheck();
 if (!vendorId) {
 return;
 }

 this.vendorId = vendorId;
 this.currentPage = 1;
 this.loadOrderStats();
 this.loadOrders();
 });
 }

 get rows(): OrderRow[] {
 return this.ordersData.map((order) => this.mapOrder(order));
 }

 get hasOrders(): boolean {
 return this.rows.length > 0;
 }

 get hasActiveFilters(): boolean {
 return!!this.searchQuery.trim() ||!!this.selectedStatus ||!!this.selectedPaymentStatus;
 }

 get activeFilterCount(): number {
 let count = 0;

 if (this.searchQuery.trim()) {
 count += 1;
 }

 if (this.selectedStatus) {
 count += 1;
 }

 if (this.selectedPaymentStatus) {
 count += 1;
 }

 return count;
 }

 get showingCountLabel(): string {
 return `${this.formatNumber(this.rows.length)} / ${this.formatNumber(this.totalItems)}`;
 }

 onSearchChange(): void {
 this.searchSubject.next(this.searchQuery);
 }

 onStatusChange(): void {
 this.currentPage = 1;
 this.loadOrders();
 }

 onPaymentStatusChange(): void {
 this.currentPage = 1;
 this.loadOrders();
 }

 clearFilters(): void {
 if (!this.hasActiveFilters) {
 return;
 }

 this.searchQuery = '';
 this.selectedStatus = '';
 this.selectedPaymentStatus = '';
 this.currentPage = 1;
 this.loadOrders();
 }

 onPageChange(page: number): void {
 if (page === this.currentPage) {
 return;
 }

 this.currentPage = page;
 this.loadOrders();
 }

 onViewOrder(orderId: string): void {
 this.router.navigate(['/orders', orderId]);
 }

 onExport(): void {
 if (!this.rows.length) {
 this.toastService.warning(this.translate.instant('COMMON.EXPORT_EMPTY'));
 return;
 }

 if (!this.vendorId) {
 this.toastService.error(this.translate.instant('COMMON.EXPORT_FAILED'));
 return;
 }

 this.vendorService.exportVendorOrders(this.vendorId, {
 search: this.searchQuery || undefined,
 status: this.selectedStatus || undefined,
 paymentStatus: this.selectedPaymentStatus || undefined
 }).subscribe({
 next: (blob) => {
 this.exportService.downloadServerFile(
 blob,
 this.exportService.fileName(`vendor-orders-${this.vendorId}`, 'xlsx')
 );
 this.toastService.success(this.translate.instant('COMMON.EXPORT_SUCCESS'));
 },
 error: () => {
 this.toastService.error(this.translate.instant('COMMON.EXPORT_FAILED'));
 }
 });
 }

 getPaymentStatusVariant(status: string): StatusPillVariant {
 switch (status.toLowerCase()) {
 case 'paid':
 return 'success';
 case 'refunded':
 return 'processing';
 case 'failed':
 return 'danger';
 default:
 return 'warning';
 }
 }

 getOrderStatusVariant(status: string): StatusPillVariant {
 switch (status.toLowerCase()) {
 case 'delivered':
 return 'success';
 case 'cancelled':
 case 'vendorrejected':
 case 'deliveryfailed':
 return 'danger';
 case 'ontheway':
 case 'preparing':
 case 'accepted':
 case 'readyforpickup':
 return 'processing';
 default:
 return 'warning';
 }
 }

 private loadOrderStats(): void {
 if (!this.vendorId) {
 return;
 }

 this.vendorService.getVendorOrderStats(this.vendorId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
 next: (stats) => {
 this.cdr.markForCheck();
 this.orderStats = stats;
 this.rebuildViewModel();
 },
 error: () => {
 this.cdr.markForCheck();
 this.orderStats = null;
 this.rebuildViewModel();
 }
 });
 }

 private loadOrders(): void {
 this.isLoading = true;
 this.hasError = false;

 this.vendorService.getVendorOrders(this.vendorId, {
 page: this.currentPage,
 pageSize: this.pageSize,
 search: this.searchQuery,
 status: this.selectedStatus,
 paymentStatus: this.selectedPaymentStatus
 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
 next: (response) => {
 this.cdr.markForCheck();
 this.ordersData = response.items ?? [];
 this.totalItems = response.totalCount ?? this.ordersData.length;
 this.rebuildViewModel();
 this.isLoading = false;
 },
 error: () => {
 this.cdr.markForCheck();
 this.ordersData = [];
 this.totalItems = 0;
 this.kpis = [];
 this.hasError = true;
 this.isLoading = false;
 }
 });
 }

 private rebuildViewModel(): void {
 const stats = this.orderStats;
 const totalOrders = stats?.totalOrders ?? this.ordersData.length;
 const completedOrders = stats?.completedOrders ?? this.ordersData.filter((order) => order.status.toLowerCase() === 'delivered').length;
 const cancelledOrders = stats?.cancelledOrders ?? this.ordersData.filter((order) => ['cancelled', 'vendorrejected', 'deliveryfailed'].includes(order.status.toLowerCase())).length;
 const openOrders = stats?.openOrders ?? this.ordersData.filter((order) =>!['delivered', 'cancelled', 'vendorrejected', 'deliveryfailed'].includes(order.status.toLowerCase())).length;
 const paidOrders = stats?.paidOrders ?? this.ordersData.filter((order) => order.paymentStatus.toLowerCase() === 'paid').length;
 const totalSalesValue = stats?.totalSalesValue ?? this.ordersData.reduce((sum, order) => sum + order.totalAmount, 0);
 const averageOrder = stats?.averageOrderValue ?? (totalOrders > 0 ? totalSalesValue / totalOrders : 0);

 this.kpis = [
 {
 id: 'total',
 label: this.translate.instant('VENDOR_ORDERS.KPI.TOTAL_ORDERS'),
 value: this.formatNumber(totalOrders),
 tone: 'primary',
 icon: 'receipt_long'
 },
 {
 id: 'open',
 label: this.translate.instant('VENDOR_ORDERS.KPI.OPEN_ORDERS'),
 value: this.formatNumber(openOrders),
 tone: 'warning',
 icon: 'pending_actions'
 },
 {
 id: 'completed',
 label: this.translate.instant('VENDOR_ORDERS.KPI.COMPLETED_ORDERS'),
 value: this.formatNumber(completedOrders),
 tone: 'success',
 icon: 'task_alt'
 },
 {
 id: 'cancelled',
 label: this.translate.instant('VENDOR_ORDERS.KPI.CANCELLED_ORDERS'),
 value: this.formatNumber(cancelledOrders),
 tone: 'danger',
 icon: 'cancel'
 },
 {
 id: 'paid',
 label: this.translate.instant('VENDOR_ORDERS.TOTAL_SALES'),
 value: `${this.formatNumber(totalSalesValue)} ${this.translate.instant('COMMON.CURRENCY_SAR')}`,
 tone: 'primary',
 icon: 'payments'
 },
 {
 id: 'average',
 label: this.translate.instant('VENDOR_ORDERS.KPI.AVERAGE_ORDER'),
 value: `${this.formatNumber(averageOrder)} ${this.translate.instant('COMMON.CURRENCY_SAR')}`,
 tone: paidOrders > 0 ? 'success' : 'warning',
 icon: 'monitoring'
 }
 ];
 }

 private mapOrder(order: AdminVendorOrderItem): OrderRow {
 const placedAt = new Date(order.placedAtUtc);

 return {
 id: order.id,
 orderNumber: order.orderNumber,
 customer: order.customerName,
 date: placedAt.toLocaleDateString(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
 timeZone: 'Asia/Riyadh'
 }),
 time: placedAt.toLocaleTimeString(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { timeZone: 'Asia/Riyadh',
 hour: '2-digit',
 minute: '2-digit'
 }),
 amount: this.formatNumber(order.totalAmount),
 itemsCount: this.formatNumber(order.itemsCount),
 paymentStatusRaw: order.paymentStatus,
 orderStatusRaw: order.status,
 paymentStatus: this.translate.instant(this.mapPaymentStatusKey(order.paymentStatus)),
 orderStatus: this.translate.instant(this.mapOrderStatusKey(order.status)),
 paymentStatusKey: this.mapPaymentStatusKey(order.paymentStatus),
 orderStatusKey: this.mapOrderStatusKey(order.status)
 };
 }

 private mapPaymentStatusKey(status: string): string {
 switch (status.toLowerCase()) {
 case 'paid':
 return 'VENDOR_ORDERS.PAYMENT_STATUS.PAID';
 case 'refunded':
 case 'partiallyrefunded':
 return 'VENDOR_ORDERS.PAYMENT_STATUS.REFUNDED';
 case 'failed':
 return 'VENDOR_ORDERS.PAYMENT_STATUS.FAILED';
 default:
 return 'VENDOR_ORDERS.PAYMENT_STATUS.PENDING';
 }
 }

 private mapOrderStatusKey(status: string): string {
 switch (status.toLowerCase()) {
 case 'delivered':
 return 'VENDOR_ORDERS.GENERAL_STATUS.COMPLETED';
 case 'cancelled':
 case 'vendorrejected':
 case 'deliveryfailed':
 return 'VENDOR_ORDERS.GENERAL_STATUS.CANCELLED';
 case 'placed':
 case 'accepted':
 case 'preparing':
 case 'readyforpickup':
 case 'ontheway':
 case 'pickedup':
 return 'VENDOR_ORDERS.GENERAL_STATUS.IN_PROGRESS';
 default:
 return 'VENDOR_ORDERS.GENERAL_STATUS.NEW';
 }
 }

 private rebuildFilters(): void {
 this.statusOptions.splice(0, this.statusOptions.length,...this.buildStatusOptions());
 this.paymentStatusOptions.splice(0, this.paymentStatusOptions.length,...this.buildPaymentStatusOptions());
 }

 private buildStatusOptions(): SearchableSelectOption<string>[] {
 return [
 { value: '', labelKey: 'VENDOR_ORDERS.FILTERS.ALL_STATUSES' },
 { value: 'Placed', labelKey: 'VENDOR_ORDERS.GENERAL_STATUS.NEW' },
 { value: 'Preparing', labelKey: 'VENDOR_ORDERS.FILTERS.PREPARING' },
 { value: 'OnTheWay', labelKey: 'VENDOR_ORDERS.FILTERS.ON_THE_WAY' },
 { value: 'Delivered', labelKey: 'VENDOR_ORDERS.FILTERS.DELIVERED' },
 { value: 'Cancelled', labelKey: 'VENDOR_ORDERS.GENERAL_STATUS.CANCELLED' }
 ];
 }

 private buildPaymentStatusOptions(): SearchableSelectOption<string>[] {
 return [
 { value: '', labelKey: 'VENDOR_ORDERS.FILTERS.ALL_PAYMENT_STATES' },
 { value: 'Paid', labelKey: 'VENDOR_ORDERS.PAYMENT_STATUS.PAID' },
 { value: 'Pending', labelKey: 'VENDOR_ORDERS.PAYMENT_STATUS.PENDING' },
 { value: 'Refunded', labelKey: 'VENDOR_ORDERS.PAYMENT_STATUS.REFUNDED' },
 { value: 'Failed', labelKey: 'VENDOR_ORDERS.PAYMENT_STATUS.FAILED' }
 ];
 }

 private formatNumber(value: number): string {
 return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2
 }).format(value);
 }
}
