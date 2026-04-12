import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, forkJoin } from 'rxjs';
import { CreateSettlementModalComponent, SettlementConfig } from '@vendors/components/workflows/create-settlement-modal/create-settlement-modal.component';
import { FinancialStatementConfig, FinancialStatementModalComponent } from '@vendors/components/workflows/financial-statement-modal/financial-statement-modal.component';
import { PayoutTransaction, PayoutsReviewModalComponent } from '@vendors/components/workflows/payouts-review-modal/payouts-review-modal.component';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import {
  AdminVendorOrderItem,
  AdminVendorPayoutItem,
  AdminVendorSettlementItem,
  VendorService
} from '@vendors/services/vendor.api.service';
import { VendorDetail } from '@vendors/models/vendors.domain.models';

interface KPI {
  id: string;
  titleKey: string;
  value: string;
  unit?: string;
  icon: string;
  iconBgClass: string;
  trend: string;
  trendKey: string;
  trendIcon: string;
  trendClass: string;
}

interface Settlement {
  id: string;
  settlementId: string;
  period: string;
  total: string;
  net: string;
  statusKey: string;
  date: string;
}

@Component({
  selector: 'app-vendor-finance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    FinancialStatementModalComponent,
    PayoutsReviewModalComponent,
    CreateSettlementModalComponent,
    InlineBannerComponent,
    SectionHeaderComponent,
    StatusPillComponent
  ],
  templateUrl: './vendor-finance.component.html'
})
export class VendorFinanceComponent implements OnInit {
  vendorId = '';
  vendorName = 'Vendor';
  currentLang = 'ar';
  isRTL = true;
  showFinancialStatementModal = false;
  showPayoutsReviewModal = false;
  showCreateSettlementModal = false;
  availableBalance = 0;
  vendorDetail: VendorDetail | null = null;
  private readonly destroyRef = inject(DestroyRef);

  orders: AdminVendorOrderItem[] = [];
  settlementRecords: AdminVendorSettlementItem[] = [];
  payoutRecords: AdminVendorPayoutItem[] = [];
  kpis: KPI[] = [];

  financialSummary = {
    sales: '0',
    returns: '0',
    discounts: '0',
    commissions: '0',
    netTotal: '0'
  };

  bankInfo = {
    bankName: '-',
    iban: '-',
    paymentCycle: 'VENDOR_FINANCE.WEEKLY_CYCLE'
  };

  settlements: Settlement[] = [];
  alerts: Array<{ id: string; titleKey: string; descriptionKey: string; settlementId: string }> = [];
  payoutTransactions: PayoutTransaction[] = [];

  get settlementModalTotalSales(): number {
    return this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  }

  get settlementModalAdditionalFees(): number {
    return this.orders.reduce((sum, order) => sum + order.commissionAmount, 0);
  }

  get settlementModalBeneficiaryName(): string {
    return this.vendorDetail?.primaryBankAccount?.accountHolderName || this.vendorDetail?.ownerName || this.vendorName;
  }

  get settlementModalBankName(): string {
    return this.vendorDetail?.primaryBankAccount?.bankName || '';
  }

  get settlementModalBankIban(): string {
    return this.vendorDetail?.primaryBankAccount?.iban || '';
  }

  get settlementModalSwiftCode(): string {
    return this.vendorDetail?.primaryBankAccount?.swiftCode || '';
  }

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly vendorService: VendorService,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
        this.rebuildViewModel();
      });

    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
        if (!vendor) {
          return;
        }

        this.vendorDetail = vendor;
        this.vendorName = vendor.businessNameEn || vendor.businessNameAr;
        this.rebuildViewModel();
      });
  }

  ngOnInit(): void {
    this.vendorDetailFacade.vendorId$
      .pipe(
        filter((vendorId): vendorId is string => !!vendorId),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((vendorId) => {
        this.vendorId = vendorId;
        this.loadData();
      });
  }

  onCreateSettlement(): void {
    this.showCreateSettlementModal = true;
  }

  onSettlementCreated(_: SettlementConfig): void {
    if (!this.vendorId) {
      this.showCreateSettlementModal = false;
      return;
    }

    this.vendorService.createVendorSettlement(this.vendorId, {
      grossAmount: _.totalSales,
      commissionAmount: _.additionalFees,
      netAmount: _.netAmount
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showCreateSettlementModal = false;
          this.loadData();
        },
        error: () => {
          this.showCreateSettlementModal = false;
        }
      });
  }

  onSettlementDraftSaved(_: SettlementConfig): void {
    this.showCreateSettlementModal = false;
  }

  onDownloadStatement(): void {
    this.showFinancialStatementModal = true;
  }

  onStatementDownload(config: FinancialStatementConfig): void {
    this.showFinancialStatementModal = false;
    this.downloadTextFile(
      `vendor-statement-${this.vendorId}.${config.exportFormat === 'excel' ? 'csv' : config.exportFormat}`,
      this.buildStatementContent(config)
    );
  }

  onStatementPreview(config: FinancialStatementConfig): void {
    const previewWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!previewWindow) {
      return;
    }

    previewWindow.document.write(`
      <html>
        <head><title>Vendor Statement Preview</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h1>${this.vendorName}</h1>
          <pre style="white-space: pre-wrap;">${this.buildStatementContent(config)}</pre>
        </body>
      </html>
    `);
    previewWindow.document.close();
  }

  onReviewPayments(): void {
    this.showPayoutsReviewModal = true;
  }

  onRetryPayment(_: string): void {
    if (!this.vendorId) {
      return;
    }

    this.vendorService.retryVendorPayout(this.vendorId, _)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadData(),
        error: () => undefined
      });
  }

  onSuspendPayment(_: string): void {
    if (!this.vendorId) {
      return;
    }

    this.vendorService.suspendVendorPayout(this.vendorId, _)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadData(),
        error: () => undefined
      });
  }

  onEscalatePayment(_: string): void {
    if (!this.vendorId) {
      return;
    }

    this.vendorService.escalateVendorPayout(this.vendorId, _)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadData(),
        error: () => undefined
      });
  }

  onDownloadReceipt(payoutId: string): void {
    const payout = this.payoutRecords.find((item) => item.id === payoutId);
    if (!payout) {
      return;
    }

    this.downloadTextFile(
      `vendor-payout-${payout.payoutNumber}.txt`,
      [
        `Vendor: ${this.vendorName}`,
        `Vendor ID: ${this.vendorId}`,
        `Payout ID: ${payout.payoutNumber}`,
        `Settlement ID: ${payout.settlementId}`,
        `Status: ${payout.status}`,
        `Amount: ${payout.amount}`,
        `Bank: ${payout.bankName ?? '-'}`,
        `IBAN: ${payout.iban ?? '-'}`,
        `Transfer Reference: ${payout.transferReference ?? '-'}`,
        `Created At: ${payout.createdAtUtc}`,
        `Processed At: ${payout.processedAtUtc ?? '-'}`
      ].join('\n')
    );
  }

  onViewPaymentActivity(_: string): void {
    if (!this.vendorId) {
      return;
    }

    this.showPayoutsReviewModal = false;
    void this.router.navigate(['/vendors', this.vendorId, 'logs']);
  }

  onViewMoreSettlements(): void {
    this.router.navigate(['/finances/settlements'], {
      queryParams: { entityType: 'vendor', entityId: this.vendorId }
    });
  }

  onViewAllInvoices(): void {
    this.router.navigate(['/finances/ledger'], {
      queryParams: { entityType: 'vendor', entityId: this.vendorId }
    });
  }

  onFilterSettlements(): void {
    this.onViewMoreSettlements();
  }

  onSettlementOptions(): void {
    this.onViewMoreSettlements();
  }

  getSettlementStatusVariant(statusKey: string): StatusPillVariant {
    if (statusKey.includes('COMPLETED')) {
      return 'success';
    }

    if (statusKey.includes('PENDING')) {
      return 'warning';
    }

    return 'neutral';
  }

  private loadData(): void {
    forkJoin({
      orders: this.vendorService.getVendorOrders(this.vendorId, 1, 200),
      settlements: this.vendorService.getVendorSettlements(this.vendorId, 1, 100),
      payouts: this.vendorService.getVendorPayouts(this.vendorId, 1, 100)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ orders, settlements, payouts }) => {
          this.orders = orders.items ?? [];
          this.settlementRecords = settlements.items ?? [];
          this.payoutRecords = payouts.items ?? [];
          this.rebuildViewModel();
        },
        error: () => {
          this.orders = [];
          this.settlementRecords = [];
          this.payoutRecords = [];
          this.rebuildViewModel();
        }
      });
  }

  private rebuildViewModel(): void {
    const vendor = this.vendorDetail;
    const totalSales = this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalCommissions = this.orders.reduce((sum, order) => sum + order.commissionAmount, 0);
    const totalReturns = 0;
    const totalDiscounts = 0;
    const netSales = totalSales - totalCommissions;
    const pendingPayments = this.orders.filter((order) => order.paymentStatus.toLowerCase() !== 'paid').length;
    const lastOrder = this.orders[0];

    this.availableBalance = netSales;
    this.kpis = [
      {
        id: 'total_sales',
        titleKey: 'VENDOR_FINANCE.KPI.TOTAL_SALES',
        value: this.formatNumber(totalSales),
        unit: 'SAR',
        icon: 'point_of_sale',
        iconBgClass: 'bg-primary/10 text-primary',
        trend: `${vendor?.commissionRate ?? 0}%`,
        trendKey: 'FINANCES.PRICING.VENDOR_COMMISSION.DEFAULT_PERCENT',
        trendIcon: 'percent',
        trendClass: 'text-slate-500'
      },
      {
        id: 'net_sales',
        titleKey: 'VENDOR_FINANCE.KPI.NET_SALES',
        value: this.formatNumber(netSales),
        unit: 'SAR',
        icon: 'account_balance_wallet',
        iconBgClass: 'bg-primary/10 text-primary',
        trend: this.formatNumber(totalReturns),
        trendKey: 'FINANCES.REFUNDS.SUMMARY.TOTAL_EXPOSURE',
        trendIcon: 'undo',
        trendClass: totalReturns > 0 ? 'text-red-600' : 'text-green-600'
      },
      {
        id: 'commissions',
        titleKey: 'VENDOR_FINANCE.KPI.TOTAL_COMMISSIONS',
        value: this.formatNumber(totalCommissions),
        unit: 'SAR',
        icon: 'percent',
        iconBgClass: 'bg-orange-50 text-orange-500',
        trend: `${this.orders.length}`,
        trendKey: 'VENDOR_ORDERS.KPI.TOTAL_ORDERS',
        trendIcon: 'receipt_long',
        trendClass: 'text-slate-500'
      },
      {
        id: 'available',
        titleKey: 'VENDOR_FINANCE.KPI.AVAILABLE_BALANCE',
        value: this.formatNumber(netSales),
        unit: 'SAR',
        icon: 'payments',
        iconBgClass: 'bg-green-50 text-green-500',
        trend: `${pendingPayments}`,
        trendKey: 'FINANCES.STATUS.PENDING',
        trendIcon: 'schedule',
        trendClass: 'text-slate-500'
      },
      {
        id: 'pending',
        titleKey: 'VENDOR_FINANCE.KPI.PENDING_BALANCE',
        value: this.formatNumber(0),
        unit: 'SAR',
        icon: 'pending_actions',
        iconBgClass: 'bg-amber-50 text-amber-500',
        trend: `${pendingPayments}`,
        trendKey: 'FINANCES.STATUS.PENDING',
        trendIcon: 'schedule',
        trendClass: 'text-amber-600'
      },
      {
        id: 'last_payment',
        titleKey: 'VENDOR_FINANCE.KPI.LAST_PAYMENT',
        value: this.formatNumber(lastOrder?.totalAmount ?? 0),
        unit: 'SAR',
        icon: 'history',
        iconBgClass: 'bg-primary/10 text-primary',
        trend: lastOrder ? this.formatDate(lastOrder.placedAtUtc) : '-',
        trendKey: '',
        trendIcon: '',
        trendClass: 'text-gray-500'
      }
    ];

    this.financialSummary = {
      sales: this.formatNumber(totalSales),
      returns: this.formatSignedNumber(totalReturns),
      discounts: this.formatSignedNumber(totalDiscounts),
      commissions: this.formatSignedNumber(totalCommissions),
      netTotal: this.formatNumber(netSales)
    };

    this.bankInfo = {
      bankName: vendor?.primaryBankAccount?.bankName || '-',
      iban: vendor?.primaryBankAccount?.iban || '-',
      paymentCycle: vendor?.payoutCycle || 'VENDOR_FINANCE.WEEKLY_CYCLE'
    };

    this.settlements = this.settlementRecords.map((settlement) => ({
      id: settlement.id,
      settlementId: settlement.settlementNumber,
      period: this.formatDate(settlement.createdAtUtc),
      total: this.formatNumber(settlement.grossAmount),
      net: this.formatNumber(settlement.netAmount),
      statusKey: this.mapSettlementStatusKey(settlement.status),
      date: this.formatDate(settlement.processedAtUtc || settlement.createdAtUtc)
    }));

    this.payoutTransactions = this.payoutRecords.map((payout) => {
      const payoutDate = payout.processedAtUtc || payout.createdAtUtc;
      return {
        id: payout.id,
        paymentNumber: payout.payoutNumber,
        date: new Date(payoutDate).toISOString().slice(0, 10),
        time: new Date(payoutDate).toLocaleTimeString(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        createdAtUtc: payout.createdAtUtc,
        processedAtUtc: payout.processedAtUtc ?? undefined,
        amount: payout.amount,
        bankCode: 'bank',
        accountMask: this.maskIban(payout.iban),
        status: this.mapPayoutStatus(payout.status),
        reference: payout.transferReference || payout.payoutNumber
      };
    });

    this.alerts = [
      ...(pendingPayments > 0 ? [{
        id: 'pending-settlement',
        titleKey: 'FINANCES.ALERTS.SETTLEMENT_DUE',
        descriptionKey: 'FINANCES.ALERTS.SETTLEMENT_DUE_DESC',
        settlementId: this.vendorId
      }] : []),
      ...(this.payoutTransactions.some((item) => item.status === 'failed') ? [{
        id: 'failed-payout',
        titleKey: 'FINANCES.ALERTS.SETTLEMENT_DUE',
        descriptionKey: 'FINANCES.ALERTS.SETTLEMENT_DUE_DESC',
        settlementId: this.payoutTransactions.find((item) => item.status === 'failed')?.paymentNumber || this.vendorId
      }] : [])
    ];
  }

  private mapSettlementStatusKey(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'settled':
        return 'FINANCES.STATUS.COMPLETED';
      case 'processing':
        return 'FINANCES.STATUS.IN_PROGRESS';
      case 'failed':
        return 'FINANCES.STATUS.FAILED';
      default:
        return 'FINANCES.STATUS.PENDING';
    }
  }

  private mapPayoutStatus(status: string): 'success' | 'failed' | 'pending' | 'reviewing' {
    switch ((status || '').toLowerCase()) {
      case 'paid':
        return 'success';
      case 'failed':
        return 'failed';
      case 'processing':
        return 'reviewing';
      case 'cancelled':
        return 'failed';
      default:
        return 'pending';
    }
  }

  private maskIban(iban?: string | null): string | undefined {
    const normalized = (iban || '').replace(/\s+/g, '');
    if (!normalized) {
      return undefined;
    }

    return `**** ${normalized.slice(-4)}`;
  }

  private buildStatementContent(config: FinancialStatementConfig): string {
    const includedKeys = Object.entries(config.includedData)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key)
      .join(', ');

    return [
      `Vendor: ${this.vendorName}`,
      `Vendor ID: ${this.vendorId}`,
      `Statement type: ${config.statementType}`,
      `Date range: ${config.dateFrom.toISOString().slice(0, 10)} to ${config.dateTo.toISOString().slice(0, 10)}`,
      `Export format: ${config.exportFormat}`,
      `Included sections: ${includedKeys}`,
      '',
      `Total sales: ${this.financialSummary.sales}`,
      `Net sales: ${this.financialSummary.netTotal}`,
      `Total commissions: ${this.financialSummary.commissions}`,
      `Available balance: ${this.formatNumber(this.availableBalance)}`
    ].join('\n');
  }

  private downloadTextFile(fileName: string, content: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  private formatSignedNumber(value: number): string {
    const absolute = this.formatNumber(Math.abs(value));
    return value < 0 ? `-${absolute}` : absolute;
  }

  private formatDate(value: string): string {
    return new Date(value).toLocaleDateString(this.currentLang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-SA', {
      calendar: 'gregory'
    });
  }
}
