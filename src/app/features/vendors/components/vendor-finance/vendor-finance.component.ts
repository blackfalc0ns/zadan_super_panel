import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
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
import { VendorDetail, VendorFinancialLifecycleMode, VendorPayoutDay } from '@vendors/models/vendors.domain.models';
import {
 AdminVendorFinanceSummary,
 AdminVendorPayoutItem,
 AdminVendorSettlementItem,
 VendorService
} from '@vendors/services/vendor.api.service';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';
import { FinanceService } from '@finances/services/finance.service';
import {
 DEFAULT_SETTLEMENT_PAYOUT_DAYS,
 SETTLEMENT_PAYOUT_DAYS,
 SettlementProcessingMode,
 WalletsService
} from '@finances/services/wallets.service';

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
 private readonly router = inject(Router);
 vendorId = '';
 vendorName = '';
 vendorDetail: VendorDetail | null = null;
 currentLang = 'ar';
 isRTL = true;

 isLoading = true;
 hasError = false;
 isSavingMode = false;
 mutationError = '';

 financeSummary: AdminVendorFinanceSummary | null = null;
 settlements: AdminVendorSettlementItem[] = [];
 payouts: AdminVendorPayoutItem[] = [];

 selectedLifecycleMode: VendorFinancialLifecycleMode = 'weekly';
 selectedPayoutDay: VendorPayoutDay = 'Monday';
 showCreateSettlementModal = false;
 showPayoutsReviewModal = false;

 settlementProcessingMode: SettlementProcessingMode | null = null;
 isLoadingSettlementProcessingMode = true;
 settlementProcessingModeUnavailable = false;
 allowedPayoutDays: VendorPayoutDay[] = [...DEFAULT_SETTLEMENT_PAYOUT_DAYS];

 private readonly destroyRef = inject(DestroyRef);

 constructor(
 private readonly translate: TranslateService,
 private readonly vendorService: VendorService,
 private readonly vendorDetailFacade: VendorDetailFacade,
 private readonly toastService: ToastService,
 private readonly financeService: FinanceService,
 private readonly walletsService: WalletsService
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
 this.selectedPayoutDay = this.resolvePayoutDay(vendor.payoutDay);

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
 label: this.text('طلب بطلب — قريبًا', 'Per order direct payout — coming soon'),
 disabled: true
 },
 { value: 'weekly', label: this.text('تسوية مجمعة أسبوعية', 'Weekly batch settlement') },
 { value: 'biweekly', label: this.text('تسوية مجمعة نصف شهرية', 'Biweekly batch settlement') },
 { value: 'monthly', label: this.text('تسوية مجمعة شهرية', 'Monthly batch settlement') }
 ];
 }

 get payoutDayOptions(): SearchableSelectOption<VendorPayoutDay>[] {
 const availableDays = this.settlementProcessingModeUnavailable
 ? SETTLEMENT_PAYOUT_DAYS
 : this.allowedPayoutDays;

 return availableDays.map((day) => ({
 value: day,
 label: this.translate.instant(this.payoutDayTranslationKey(day))
 }));
 }

 get hasPrimaryBankAccount(): boolean {
 return!!this.vendorDetail?.primaryBankAccount?.id;
 }

 get isDirectMode(): boolean {
 return this.selectedLifecycleMode === 'per_order_direct_payout';
 }

 get isManualSettlementProcessing(): boolean {
 return this.settlementProcessingMode === 'Manual' && !this.settlementProcessingModeUnavailable;
 }

 get payoutDayLabel(): string {
 return this.translate.instant(this.payoutDayTranslationKey(this.selectedPayoutDay));
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
 }

 onPayoutDayChange(value: VendorPayoutDay): void {
 this.selectedPayoutDay = this.coercePayoutDay(value);
 }

  openFinancialSettlements(): void {
  if (!this.vendorId) {
  return;
  }

  void this.router.navigate(['/finances/settlements'], {
  queryParams: { entityType: 'vendor', entityId: this.vendorId }
  });
  }

  viewManualProof(item: AdminVendorPayoutItem): void {
  const attachmentId = item.manualConfirmation?.proofAttachmentId;
  if (!attachmentId) return;

  this.financeService.downloadManualPayoutProof(item.id, attachmentId).pipe(take(1)).subscribe({
  next: (file) => {
  const url = URL.createObjectURL(file);
  window.open(url, '_blank', 'noopener');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
  error: () => {
  this.toastService.error(
  this.translate.instant('VENDOR_FINANCE.WORKSPACE.MANUAL_CONFIRM.CONFIRM_ERROR'),
  this.text('Ø§Ù„Ù…Ø§Ù„ÙŠØ©', 'Finance')
  );
  }
  });
  }

 saveLifecycleMode(): void {
 if (!this.vendorId || this.isSavingMode) {
 return;
 }

 const payload = {
 financialLifecycleMode: this.selectedLifecycleMode,
 payoutCycle: this.isDirectMode ? null : this.selectedLifecycleMode,
 payoutDay: this.selectedPayoutDay
 };

 this.isSavingMode = true;

 this.vendorDetailFacade.updateVendorFinanceSettingsRequest(payload).pipe(take(1)).subscribe({
 next: (vendor) => {
 this.cdr.markForCheck();
 this.vendorDetail = vendor;
 this.selectedLifecycleMode = this.resolveLifecycleMode(vendor);
 this.selectedPayoutDay = this.resolvePayoutDay(vendor.payoutDay);
 this.toastService.success(
 this.text('حدّثنا دورة الحياة المالية بنجاح.', 'Financial lifecycle updated successfully.'),
 this.text('المالية', 'Finance')
 );
 this.isSavingMode = false;
 },
 error: () => {
 this.cdr.markForCheck();
 this.toastService.error(
 this.vendorDetailFacade.mutationError || this.text('ما قدرنا نحدّث دورة الحياة المالية الحين.', 'Unable to update the lifecycle right now.'),
 this.text('المالية', 'Finance')
 );
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
 this.loadSettlementProcessingMode();

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

 private loadSettlementProcessingMode(): void {
 this.isLoadingSettlementProcessingMode = true;
 this.settlementProcessingModeUnavailable = false;

 this.walletsService.getSettlementProcessingSettings().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
 next: (settings) => {
 this.cdr.markForCheck();
 this.settlementProcessingMode = settings.settlementProcessingMode;
 this.allowedPayoutDays = this.normalizeAllowedPayoutDays(settings.payoutDays);
 this.selectedPayoutDay = this.coercePayoutDay(this.selectedPayoutDay);
 this.isLoadingSettlementProcessingMode = false;
 },
 error: () => {
 this.cdr.markForCheck();
 this.settlementProcessingMode = null;
 this.allowedPayoutDays = [...SETTLEMENT_PAYOUT_DAYS];
 this.isLoadingSettlementProcessingMode = false;
 this.settlementProcessingModeUnavailable = true;
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

 private resolvePayoutDay(value?: string | null): VendorPayoutDay {
 const payoutDays: Record<string, VendorPayoutDay> = {
 sunday: 'Sunday',
 monday: 'Monday',
 tuesday: 'Tuesday',
 wednesday: 'Wednesday',
 thursday: 'Thursday',
 friday: 'Friday',
 saturday: 'Saturday'
 };

 return payoutDays[(value || '').trim().toLowerCase()] ?? 'Monday';
 }

 private coercePayoutDay(day: VendorPayoutDay): VendorPayoutDay {
 return this.allowedPayoutDays.includes(day)
 ? day
 : this.allowedPayoutDays[0] ?? 'Monday';
 }

 private normalizeAllowedPayoutDays(value?: readonly string[] | null): VendorPayoutDay[] {
 const selectedDays = new Set(
 (value ?? [])
 .map((day) => day?.trim().toLowerCase())
 .filter((day): day is string => Boolean(day))
 );
 const normalized = SETTLEMENT_PAYOUT_DAYS.filter((day) => selectedDays.has(day.toLowerCase()));
 return normalized.length ? [...normalized] : [...DEFAULT_SETTLEMENT_PAYOUT_DAYS];
 }

 payoutDayTranslationKey(day: VendorPayoutDay): string {
 return `VENDOR_FINANCE.WORKSPACE.PAYOUT_DAY_${day.toUpperCase()}`;
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
