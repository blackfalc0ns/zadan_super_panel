import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { ToastService } from '@shared/services/toast.service';
import { CreateSettlementModalComponent, SettlementConfig } from '@vendors/components/workflows/create-settlement-modal/create-settlement-modal.component';
import { PayoutsReviewModalComponent, PayoutTransaction } from '@vendors/components/workflows/payouts-review-modal/payouts-review-modal.component';
import { VendorDetail, VendorFinancialLifecycleMode } from '@vendors/models/vendors.domain.models';
import {
 AdminVendorFinanceSummary,
 AdminVendorPayoutItem,
 AdminVendorSettlementItem,
 VendorService
} from '@vendors/services/vendor.api.service';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-vendor-finance',
 standalone: true,
 imports: [
 CommonModule,
 FormsModule,
 TranslateModule,
 SearchableSelectComponent,
 CreateSettlementModalComponent,
 PayoutsReviewModalComponent
 ],
 templateUrl: './vendor-finance.component.html',
 styleUrls: ['./vendor-finance.component.scss']
})
export class VendorFinanceComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 vendorId = '';
 vendorName = '';
 vendorDetail: VendorDetail | null = null;
 currentLang = 'ar';
 isRTL = true;

 isLoading = true;
 hasError = false;
 isSavingMode = false;
 mutationError = '';
 modeError = '';
 modeSuccess = '';

 financeSummary: AdminVendorFinanceSummary | null = null;
 settlements: AdminVendorSettlementItem[] = [];
 payouts: AdminVendorPayoutItem[] = [];

 selectedLifecycleMode: VendorFinancialLifecycleMode = 'weekly';
 showCreateSettlementModal = false;
 showPayoutsReviewModal = false;

 private readonly destroyRef = inject(DestroyRef);

 constructor(
 private readonly translate: TranslateService,
 private readonly vendorService: VendorService,
 private readonly vendorDetailFacade: VendorDetailFacade,
 private readonly toastService: ToastService
 ) {
 this.currentLang = this.translate.currentLang || 'ar';
 this.isRTL = this.currentLang.startsWith('ar');

 this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
 this.cdr.markForCheck();
 this.currentLang = event.lang;
 this.isRTL = event.lang.startsWith('ar');
 });
 }

 ngOnInit(): void {
 this.vendorDetailFacade.vendor$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((vendor) => {
 this.cdr.markForCheck();
 if (!vendor) {
 return;
 }

 const vendorChanged = vendor.id!== this.vendorId;
 this.vendorDetail = vendor;
 this.vendorName = vendor.businessNameAr || vendor.businessNameEn || vendor.ownerName || 'Vendor';
 this.selectedLifecycleMode = this.resolveLifecycleMode(vendor);

 if (vendorChanged) {
 this.vendorId = vendor.id;
 this.loadFinanceData();
 }
 });

 this.vendorDetailFacade.mutationError$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((error) => {
 this.cdr.markForCheck();
 this.mutationError = error ?? '';
 });

 this.vendorDetailFacade.vendorId$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((vendorId) => {
 this.cdr.markForCheck();
 if (!vendorId || vendorId === this.vendorId) {
 return;
 }

 this.vendorId = vendorId;
 this.loadFinanceData();
 });
 }

 get lifecycleOptions(): SearchableSelectOption<VendorFinancialLifecycleMode>[] {
 return [
 {
 value: 'per_order_direct_payout',
 label: this.text('لكل طلب - تحويل مباشر بعد التسليم', 'Per order direct payout after delivery'),
 disabled:!this.hasPrimaryBankAccount
 },
 { value: 'weekly', label: this.text('تسوية مجمعة أسبوعية', 'Weekly batch settlement') },
 { value: 'biweekly', label: this.text('تسوية مجمعة نصف شهرية', 'Biweekly batch settlement') },
 { value: 'monthly', label: this.text('تسوية مجمعة شهرية', 'Monthly batch settlement') }
 ];
 }

 get hasPrimaryBankAccount(): boolean {
 return!!this.vendorDetail?.primaryBankAccount?.id;
 }

 get isDirectMode(): boolean {
 return this.selectedLifecycleMode === 'per_order_direct_payout';
 }

 get availableBalance(): number {
 return this.financeSummary?.availableBalance ?? 0;
 }

 get pendingBalance(): number {
 return (this.financeSummary?.pendingSettlement ?? 0) + (this.financeSummary?.pendingOrdersNet ?? 0);
 }

 get pendingGrossAmount(): number {
 return this.financeSummary?.pendingOrdersGross ?? 0;
 }

 get pendingCommissionAmount(): number {
 return this.financeSummary?.pendingOrdersCommission ?? 0;
 }

 get totalPaidOut(): number {
 return this.financeSummary?.totalPaidOut ?? 0;
 }

 get holdAmount(): number {
 return this.financeSummary?.holdAmount ?? 0;
 }

 get pendingOrdersCount(): number {
 return this.financeSummary?.pendingOrdersCount ?? 0;
 }

 get failedPayoutsCount(): number {
 return this.financeSummary?.failedPayoutsCount ?? 0;
 }

 get latestPayoutLabel(): string {
 const at = this.financeSummary?.latestPayoutAtUtc;
 return at ? this.formatDate(at) : this.emptyValue();
 }

 get latestPayoutNumber(): string {
 return this.financeSummary?.latestPayoutNumber || this.payouts[0]?.payoutNumber || this.emptyValue();
 }

 get payoutTransactions(): PayoutTransaction[] {
 return this.payouts.map((item) => {
 const eventDate = item.processedAtUtc || item.createdAtUtc;
 let datePart = '—';
 let timePart = '—';

 if (eventDate) {
 const date = new Date(eventDate);
 if (!Number.isNaN(date.getTime())) {
 datePart = date.toISOString().slice(0, 10);
 timePart = date.toLocaleTimeString(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { timeZone: 'Asia/Riyadh',
 hour: '2-digit',
 minute: '2-digit'
 });
 }
 }

 return {
 id: item.id,
 paymentNumber: item.payoutNumber,
 date: datePart,
 time: timePart,
 createdAtUtc: item.createdAtUtc,
 processedAtUtc: item.processedAtUtc ?? undefined,
 amount: item.amount,
 bankCode: 'bank',
 accountMask: this.maskIban(item.iban),
 status: this.mapPayoutStatus(item.status),
 reference: item.transferReference || item.payoutNumber
 };
 });
 }

 onLifecycleModeChange(value: VendorFinancialLifecycleMode): void {
 this.selectedLifecycleMode = value;
 this.modeError = '';
 this.modeSuccess = '';
 }

 saveLifecycleMode(): void {
 if (!this.vendorId || this.isSavingMode) {
 return;
 }

 const payload = {
 financialLifecycleMode: this.selectedLifecycleMode,
 payoutCycle: this.isDirectMode ? null : this.selectedLifecycleMode
 };

 this.isSavingMode = true;
 this.modeError = '';
 this.modeSuccess = '';

 this.vendorDetailFacade.updateVendorFinanceSettingsRequest(payload).pipe(take(1)).subscribe({
 next: (vendor) => {
 this.cdr.markForCheck();
 this.vendorDetail = vendor;
 this.selectedLifecycleMode = this.resolveLifecycleMode(vendor);
 this.modeSuccess = this.text('حدّثنا دورة الحياة المالية بنجاح.', 'Financial lifecycle updated successfully.');
 this.toastService.success(this.modeSuccess, this.text('المالية', 'Finance'));
 this.isSavingMode = false;
 },
 error: () => {
 this.cdr.markForCheck();
 this.modeError = this.vendorDetailFacade.mutationError || this.text('ما قدرنا نحدّث دورة الحياة المالية الحين.', 'Unable to update the lifecycle right now.');
 this.toastService.error(this.modeError, this.text('المالية', 'Finance'));
 this.isSavingMode = false;
 }
 });
 }

 onCreateSettlement(): void {
 this.showCreateSettlementModal = true;
 }

 onSettlementCreated(config: SettlementConfig): void {
 if (!this.vendorId) {
 this.showCreateSettlementModal = false;
 return;
 }

 this.vendorService.createVendorSettlement(this.vendorId, {
 grossAmount: config.totalSales,
 commissionAmount: config.additionalFees,
 netAmount: config.netAmount
 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
 next: () => {
 this.cdr.markForCheck();
 this.showCreateSettlementModal = false;
 this.toastService.success(
 this.text('أنشأنا التسوية بنجاح.', 'Settlement created successfully.'),
 this.text('المالية', 'Finance')
 );
 this.loadFinanceData();
 },
 error: () => {
 this.cdr.markForCheck();
 this.showCreateSettlementModal = false;
 this.toastService.error(
 this.text('ما قدرنا ننشئ التسوية الحين.', 'Unable to create the settlement right now.'),
 this.text('المالية', 'Finance')
 );
 }
 });
 }

 onRetryPayment(payoutId: string): void {
 if (!this.vendorId) {
 return;
 }

 this.vendorService.retryVendorPayout(this.vendorId, payoutId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
 next: () => {
 this.toastService.success(
 this.text('رجّعنا محاولة الدفعة بنجاح.', 'Payout retry triggered successfully.'),
 this.text('المالية', 'Finance')
 );
 this.loadFinanceData();
 },
 error: () => {
 this.toastService.error(
 this.text('ما قدرنا نعيد محاولة الدفعة الحين.', 'Unable to retry the payout right now.'),
 this.text('المالية', 'Finance')
 );
 }
 });
 }

 onSuspendPayment(payoutId: string): void {
 if (!this.vendorId) {
 return;
 }

 this.vendorService.suspendVendorPayout(this.vendorId, payoutId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
 next: () => {
 this.toastService.success(
 this.text('علّقنا الدفعة بنجاح.', 'Payout suspended successfully.'),
 this.text('المالية', 'Finance')
 );
 this.loadFinanceData();
 },
 error: () => {
 this.toastService.error(
 this.text('ما قدرنا تعليق الدفعة الحين.', 'Unable to suspend the payout right now.'),
 this.text('المالية', 'Finance')
 );
 }
 });
 }

 onEscalatePayment(payoutId: string): void {
 if (!this.vendorId) {
 return;
 }

 this.vendorService.escalateVendorPayout(this.vendorId, payoutId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
 next: () => {
 this.toastService.success(
 this.text('صعّدنا الدفعة بنجاح.', 'Payout escalated successfully.'),
 this.text('المالية', 'Finance')
 );
 this.loadFinanceData();
 },
 error: () => {
 this.toastService.error(
 this.text('ما قدرنا تصعيد الدفعة الحين.', 'Unable to escalate the payout right now.'),
 this.text('المالية', 'Finance')
 );
 }
 });
 }

 loadFinanceDataRetry(): void {
 this.loadFinanceData();
 }

 getLifecycleModeLabel(mode: VendorFinancialLifecycleMode): string {
 switch (mode) {
 case 'per_order_direct_payout':
 return this.text('تحويل مباشر لكل طلب', 'Per order direct payout');
 case 'biweekly':
 return this.text('تسوية نصف شهرية', 'Biweekly settlement');
 case 'monthly':
 return this.text('تسوية شهرية', 'Monthly settlement');
 default:
 return this.text('تسوية أسبوعية', 'Weekly settlement');
 }
 }

 getPayoutStatusVariant(status: string): StatusPillVariant {
 switch (status.toLowerCase()) {
 case 'paid':
 return 'success';
 case 'processing':
 case 'queued':
 return 'processing';
 case 'failed':
 case 'cancelled':
 return 'danger';
 default:
 return 'warning';
 }
 }

 getSettlementStatusVariant(status: string): StatusPillVariant {
 const normalized = status.toLowerCase();
 if (normalized.includes('paid') || normalized.includes('settled')) {
 return 'success';
 }
 if (normalized.includes('fail') || normalized.includes('reject')) {
 return 'danger';
 }
 if (normalized.includes('process') || normalized.includes('review') || normalized.includes('hold')) {
 return 'processing';
 }
 return 'warning';
 }

 isDirectSettlement(origin: string): boolean {
 return origin.toLowerCase().includes('direct');
 }

 trackById(_: number, item: { id: string }): string {
 return item.id;
 }

 private loadFinanceData(): void {
 if (!this.vendorId) {
 return;
 }

 this.isLoading = true;
 this.hasError = false;

 forkJoin({
 summary: this.vendorService.getVendorFinanceSummary(this.vendorId),
 settlements: this.vendorService.getVendorSettlements(this.vendorId, 1, 12),
 payouts: this.vendorService.getVendorPayouts(this.vendorId, 1, 12)
 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
 next: ({ summary, settlements, payouts }) => {
 this.cdr.markForCheck();
 this.financeSummary = summary;
 this.settlements = settlements.items ?? [];
 this.payouts = payouts.items ?? [];
 this.isLoading = false;
 },
 error: () => {
 this.cdr.markForCheck();
 this.financeSummary = null;
 this.settlements = [];
 this.payouts = [];
 this.isLoading = false;
 this.hasError = true;
 }
 });
 }

 private resolveLifecycleMode(vendor: VendorDetail): VendorFinancialLifecycleMode {
 const explicitMode = (vendor.financialLifecycleMode || '').trim().toLowerCase();
 if (explicitMode === 'perorderdirectpayout' || explicitMode === 'per_order_direct_payout') {
 return 'per_order_direct_payout';
 }
 if (explicitMode === 'biweekly') {
 return 'biweekly';
 }
 if (explicitMode === 'monthly') {
 return 'monthly';
 }

 const legacy = (vendor.payoutCycle || '').trim().toLowerCase();
 if (legacy === 'biweekly') {
 return 'biweekly';
 }
 if (legacy === 'monthly') {
 return 'monthly';
 }

 return 'weekly';
 }

 private mapPayoutStatus(status: string): 'success' | 'failed' | 'pending' | 'reviewing' {
 switch (status.toLowerCase()) {
 case 'paid':
 return 'success';
 case 'failed':
 case 'cancelled':
 return 'failed';
 case 'processing':
 case 'queued':
 return 'reviewing';
 default:
 return 'pending';
 }
 }

 private maskIban(iban?: string | null): string | undefined {
 const normalized = (iban || '').replace(/\s+/g, '');
 return normalized ? `**** ${normalized.slice(-4)}` : undefined;
 }

 formatCurrency(value: number): string {
 return `${this.formatAmount(value)} ${this.translate.instant('COMMON.CURRENCY_SAR')}`;
 }

 formatAmount(value: number): string {
 return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2
 }).format(value);
 }

 formatLedgerId(value: string): string {
 const normalized = (value || '').trim();
 if (normalized.length <= 14) {
 return normalized;
 }
 return `${normalized.slice(0, 8)}…${normalized.slice(-4)}`;
 }

 formatNumber(value: number): string {
 return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
 maximumFractionDigits: 0
 }).format(value);
 }

 formatDate(value: string): string {
 return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { timeZone: 'Asia/Riyadh',
 year: 'numeric',
 month: 'short',
 day: 'numeric'
 }).format(new Date(value));
 }

 formatDateShort(value: string): string {
 return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { timeZone: 'Asia/Riyadh',
 month: 'short',
 day: 'numeric'
 }).format(new Date(value));
 }

 formatStatusLabel(status: string): string {
 const key = this.normalizeStatusKey(status);
 const labels: Record<string, { ar: string; en: string }> = {
 paid: { ar: 'مدفوع', en: 'Paid' },
 settled: { ar: 'مسوّى', en: 'Settled' },
 paid_out: { ar: 'مصروف', en: 'Paid out' },
 processing: { ar: 'تحت المعالجة', en: 'Processing' },
 queued: { ar: 'بالانتظار', en: 'Queued' },
 pending: { ar: 'معلق', en: 'Pending' },
 pending_review: { ar: 'مراجعة', en: 'In review' },
 approved: { ar: 'معتمد', en: 'Approved' },
 on_hold: { ar: 'محجوز', en: 'On hold' },
 payout_failed: { ar: 'فشل الصرف', en: 'Payout failed' },
 failed: { ar: 'فاشل', en: 'Failed' },
 cancelled: { ar: 'ملغى', en: 'Cancelled' },
 reversed: { ar: 'معكوس', en: 'Reversed' },
 rejected: { ar: 'مرفوض', en: 'Rejected' },
 disputed: { ar: 'نزاع', en: 'Disputed' },
 draft: { ar: 'مسودة', en: 'Draft' },
 open: { ar: 'مفتوح', en: 'Open' },
 closed: { ar: 'مغلق', en: 'Closed' }
 };

 const match = labels[key];
 if (match) {
 return this.isRTL ? match.ar : match.en;
 }

 return this.text('غير معروف', 'Unknown');
 }

 private normalizeStatusKey(status: string): string {
 return (status || '').trim().replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase().replace(/[\s-]+/g, '_');
 }

 private text(arabic: string, english: string): string {
 return this.isRTL ? arabic : english;
 }

 private emptyValue(): string {
 return this.text('غير متوفر', 'Not available');
 }
}
