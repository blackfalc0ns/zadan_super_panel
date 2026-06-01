import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { CreateSettlementModalComponent, SettlementConfig } from '@vendors/components/workflows/create-settlement-modal/create-settlement-modal.component';
import { PayoutsReviewModalComponent, PayoutTransaction } from '@vendors/components/workflows/payouts-review-modal/payouts-review-modal.component';
import { VendorDetail, VendorFinancialLifecycleMode } from '@vendors/models/vendors.domain.models';
import {
  AdminVendorOrderItem,
  AdminVendorPayoutItem,
  AdminVendorSettlementItem,
  VendorService
} from '@vendors/services/vendor.api.service';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

interface FinanceHeroMetric {
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
  icon: string;
}

interface FinanceSummaryCard {
  id: string;
  label: string;
  value: string;
  hint: string;
  variant: StatusPillVariant;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-vendor-finance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SearchableSelectComponent,
    AppButtonComponent,
    StatusPillComponent,
    CreateSettlementModalComponent,
    PayoutsReviewModalComponent
  ],
  templateUrl: './vendor-finance.component.html'
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

  orders: AdminVendorOrderItem[] = [];
  settlements: AdminVendorSettlementItem[] = [];
  payouts: AdminVendorPayoutItem[] = [];

  selectedLifecycleMode: VendorFinancialLifecycleMode = 'weekly';
  showCreateSettlementModal = false;
  showPayoutsReviewModal = false;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly translate: TranslateService,
    private readonly vendorService: VendorService,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang.startsWith('ar');

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
      this.cdr.markForCheck();
        this.currentLang = event.lang;
        this.isRTL = event.lang.startsWith('ar');
      });
  }

  ngOnInit(): void {
    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
      this.cdr.markForCheck();
        if (!vendor) {
          return;
        }

        this.vendorDetail = vendor;
        this.vendorName = vendor.businessNameAr || vendor.businessNameEn || vendor.ownerName || 'Vendor';
        this.selectedLifecycleMode = this.resolveLifecycleMode(vendor);
      });

    this.vendorDetailFacade.mutationError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => {
      this.cdr.markForCheck();
        this.mutationError = error ?? '';
      });

    this.vendorDetailFacade.vendorId$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendorId) => {
      this.cdr.markForCheck();
        if (!vendorId) {
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
        disabled: !this.hasPrimaryBankAccount
      },
      { value: 'weekly', label: this.text('تسوية مجمعة أسبوعية', 'Weekly batch settlement') },
      { value: 'biweekly', label: this.text('تسوية مجمعة نصف شهرية', 'Biweekly batch settlement') },
      { value: 'monthly', label: this.text('تسوية مجمعة شهرية', 'Monthly batch settlement') }
    ];
  }

  get hasPrimaryBankAccount(): boolean {
    return !!this.vendorDetail?.primaryBankAccount?.id;
  }

  get isDirectMode(): boolean {
    return this.selectedLifecycleMode === 'per_order_direct_payout';
  }

  get deliveredOrders(): AdminVendorOrderItem[] {
    return this.orders.filter((order) => order.status.toLowerCase() === 'delivered');
  }

  get settledSourceOrderIds(): Set<string> {
    return new Set(
      this.settlements
        .map((item) => item.sourceOrderId)
        .filter((value): value is string => !!value)
    );
  }

  get deliveredOrdersAwaitingPayout(): AdminVendorOrderItem[] {
    return this.deliveredOrders.filter((order) => !this.settledSourceOrderIds.has(order.id));
  }

  get directSettlements(): AdminVendorSettlementItem[] {
    return this.settlements.filter((item) => item.origin.toLowerCase() === 'directperorder');
  }

  get batchSettlements(): AdminVendorSettlementItem[] {
    return this.settlements.filter((item) => item.origin.toLowerCase() !== 'directperorder');
  }

  get directPayouts(): AdminVendorPayoutItem[] {
    return this.payouts.filter((item) => item.origin.toLowerCase() === 'directperorder');
  }

  get failedPayouts(): AdminVendorPayoutItem[] {
    return this.payouts.filter((item) => {
      const status = item.status.toLowerCase();
      return status === 'failed' || status === 'cancelled';
    });
  }

  get latestPayout(): AdminVendorPayoutItem | null {
    return this.payouts[0] ?? null;
  }

  get latestDirectPayout(): AdminVendorPayoutItem | null {
    return this.directPayouts[0] ?? null;
  }

  get availableBalance(): number {
    return this.payouts
      .filter((item) => item.status.toLowerCase() === 'paid')
      .reduce((sum, item) => sum + item.amount, 0);
  }

  get pendingBalance(): number {
    const ordersBalance = this.deliveredOrdersAwaitingPayout
      .reduce((sum, order) => sum + Math.max(order.totalAmount - order.commissionAmount, 0), 0);

    const pendingSettlementsBalance = this.settlements
      .filter((s) => {
        const status = s.status.toLowerCase();
        return status !== 'settled' && status !== 'paidout' && status !== 'rejected' && status !== 'failed' && status !== 'reversed';
      })
      .reduce((sum, s) => sum + s.netAmount, 0);

    return ordersBalance + pendingSettlementsBalance;
  }

  get pendingGrossAmount(): number {
    return this.deliveredOrdersAwaitingPayout
      .reduce((sum, order) => sum + order.totalAmount, 0);
  }

  get pendingCommissionAmount(): number {
    return this.deliveredOrdersAwaitingPayout
      .reduce((sum, order) => sum + order.commissionAmount, 0);
  }

  get heroMetrics(): FinanceHeroMetric[] {
    return [
      {
        label: this.text('الوضع المالي الحالي', 'Current finance mode'),
        value: this.getLifecycleModeLabel(this.selectedLifecycleMode),
        tone: 'primary',
        icon: 'account_balance_wallet'
      },
      {
        label: this.isDirectMode
          ? this.text('آخر تحويل مباشر', 'Last direct payout')
          : this.text('آخر تحويل مجمع', 'Last batch payout'),
        value: this.latestPayout
          ? this.formatDate(this.latestPayout.processedAtUtc || this.latestPayout.createdAtUtc)
          : this.emptyValue(),
        tone: 'success',
        icon: 'payments'
      },
      {
        label: this.text('طلبات مسلمة تنتظر التحويل', 'Delivered orders awaiting payout'),
        value: this.formatNumber(this.deliveredOrdersAwaitingPayout.length),
        tone: 'warning',
        icon: 'schedule_send'
      },
      {
        label: this.text('تحويلات فاشلة تحتاج مراجعة', 'Failed payouts requiring review'),
        value: this.formatNumber(this.failedPayouts.length),
        tone: 'danger',
        icon: 'error'
      }
    ];
  }

  get summaryCards(): FinanceSummaryCard[] {
    return [
      {
        id: 'available',
        label: this.text('إجمالي المدفوع للتاجر', 'Total paid to vendor'),
        value: this.formatCurrency(this.availableBalance),
        hint: this.text('تحويلات مكتملة فعليًا إلى الحساب البنكي', 'Successfully completed bank transfers'),
        variant: 'success'
      },
      {
        id: 'pending',
        label: this.text('رصيد بانتظار الإنشاء أو التحويل', 'Balance awaiting creation or payout'),
        value: this.formatCurrency(this.pendingBalance),
        hint: this.text('طلبات مسلمة لم تتحول بعد إلى payout', 'Delivered orders not yet converted into payouts'),
        variant: 'warning'
      },
      {
        id: 'direct',
        label: this.text('طلبات سُويت تلقائيًا', 'Automatically settled orders'),
        value: this.formatNumber(this.directSettlements.length),
        hint: this.text('تم إنشاء تسوية وتحويل مباشر لها تلقائيًا', 'Auto-created settlement and direct payout flow'),
        variant: 'primary'
      },
      {
        id: 'manual',
        label: this.text('تسويات مجمعة', 'Batch settlements'),
        value: this.formatNumber(this.batchSettlements.length),
        hint: this.text('تسويات يدوية أو مجمعة على دورة السداد', 'Manual or grouped settlement cycles'),
        variant: 'neutral'
      }
    ];
  }

  get payoutTransactions(): PayoutTransaction[] {
    return this.payouts.map((item) => {
      const eventDate = item.processedAtUtc || item.createdAtUtc;
      let datePart = '—';
      let timePart = '—';
      try {
        if (eventDate) {
          const d = new Date(eventDate);
          if (!isNaN(d.getTime())) {
            datePart = d.toISOString().slice(0, 10);
            timePart = d.toLocaleTimeString(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        }
      } catch {
        // Fallback to defaults
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

    this.vendorDetailFacade.updateVendorFinanceSettingsRequest(payload)
      .pipe(take(1))
      .subscribe({
        next: (vendor) => {
        this.cdr.markForCheck();
          this.vendorDetail = vendor;
          this.selectedLifecycleMode = this.resolveLifecycleMode(vendor);
          this.modeSuccess = this.text('تم تحديث دورة الحياة المالية بنجاح.', 'Financial lifecycle updated successfully.');
          this.isSavingMode = false;
        },
        error: () => {
        this.cdr.markForCheck();
          this.modeError = this.vendorDetailFacade.mutationError || this.text('تعذر تحديث دورة الحياة المالية الآن.', 'Unable to update the finance lifecycle right now.');
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
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
        this.cdr.markForCheck();
          this.showCreateSettlementModal = false;
          this.loadFinanceData();
        },
        error: () => {
        this.cdr.markForCheck();
          this.showCreateSettlementModal = false;
        }
      });
  }

  onRetryPayment(payoutId: string): void {
    if (!this.vendorId) {
      return;
    }

    this.vendorService.retryVendorPayout(this.vendorId, payoutId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.loadFinanceData(), error: () => undefined });
  }

  onSuspendPayment(payoutId: string): void {
    if (!this.vendorId) {
      return;
    }

    this.vendorService.suspendVendorPayout(this.vendorId, payoutId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.loadFinanceData(), error: () => undefined });
  }

  onEscalatePayment(payoutId: string): void {
    if (!this.vendorId) {
      return;
    }

    this.vendorService.escalateVendorPayout(this.vendorId, payoutId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.loadFinanceData(), error: () => undefined });
  }

  getLifecycleBadgeVariant(mode: VendorFinancialLifecycleMode): StatusPillVariant {
    return mode === 'per_order_direct_payout' ? 'success' : 'processing';
  }

  getPayoutStatusVariant(status: string): StatusPillVariant {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'processing':
        return 'processing';
      case 'failed':
      case 'cancelled':
        return 'danger';
      default:
        return 'warning';
    }
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  private loadFinanceData(): void {
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      orders: this.vendorService.getVendorOrders(this.vendorId, { page: 1, pageSize: 200 }),
      settlements: this.vendorService.getVendorSettlements(this.vendorId, 1, 100),
      payouts: this.vendorService.getVendorPayouts(this.vendorId, 1, 100)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ orders, settlements, payouts }) => {
        this.cdr.markForCheck();
          this.orders = orders.items ?? [];
          this.settlements = settlements.items ?? [];
          this.payouts = payouts.items ?? [];
          this.isLoading = false;
        },
        error: () => {
        this.cdr.markForCheck();
          this.orders = [];
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

  private mapPayoutStatus(status: string): 'success' | 'failed' | 'pending' | 'reviewing' {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'failed':
      case 'cancelled':
        return 'failed';
      case 'processing':
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
    const formatted = new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
    return this.isRTL ? `${formatted} ر.س` : `SAR ${formatted}`;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
      maximumFractionDigits: 0
    }).format(value);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(value));
  }

  private text(arabic: string, english: string): string {
    return this.isRTL ? arabic : english;
  }

  private emptyValue(): string {
    return this.text('غير متوفر', 'Not available');
  }
}
