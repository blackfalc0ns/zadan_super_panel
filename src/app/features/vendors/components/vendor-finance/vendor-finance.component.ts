import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, take } from 'rxjs';
import { FinanceService, VendorFinanceProfile } from '@finances/public-api';
import { CreateSettlementModalComponent, SettlementConfig } from '@vendors/components/workflows/create-settlement-modal/create-settlement-modal.component';
import { FinancialStatementConfig, FinancialStatementModalComponent } from '@vendors/components/workflows/financial-statement-modal/financial-statement-modal.component';
import { PayoutsReviewModalComponent } from '@vendors/components/workflows/payouts-review-modal/payouts-review-modal.component';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';

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
  statusClass: string;
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
  vendorId = 'VND-9928';
  vendorName = 'Vendor';
  currentLang = 'ar';
  isRTL = true;
  showFinancialStatementModal = false;
  showPayoutsReviewModal = false;
  showCreateSettlementModal = false;
  availableBalance = 0;
  profile: VendorFinanceProfile | null = null;
  private readonly destroyRef = inject(DestroyRef);

  kpis: KPI[] = [];

  financialSummary = {
    sales: '0',
    returns: '0',
    discounts: '0',
    commissions: '0',
    netTotal: '0'
  };

  bankInfo = {
    bankName: 'Al Rajhi Bank',
    iban: 'SA** **** **** 0000',
    paymentCycle: 'VENDOR_FINANCE.WEEKLY_CYCLE'
  };

  settlements: Settlement[] = [];

  alerts: Array<{ id: string; titleKey: string; descriptionKey: string; settlementId: string }> = [];

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly financeService: FinanceService,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';

        if (this.profile) {
          this.applyProfile(this.profile);
        }
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

  onSettlementCreated(config: SettlementConfig): void {
    this.showCreateSettlementModal = false;
    if (!this.profile) {
      return;
    }

    const settlementId = `STL-${Date.now().toString().slice(-6)}`;
    const nextProfile: VendorFinanceProfile = {
      ...this.profile,
      pendingBalance: this.profile.pendingBalance + config.netAmount,
      settlements: [
        {
          id: settlementId,
          settlementCode: settlementId,
          entityType: 'vendor',
          entityId: this.vendorId,
          entityName: this.profile.vendorName,
          period: `${config.periodFrom} - ${config.periodTo}`,
          periodFrom: config.periodFrom,
          periodTo: config.periodTo,
          ordersCount: 0,
          grossAmount: config.totalSales,
          deductions: config.returns + config.additionalFees,
          netAmount: config.netAmount,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        ...this.profile.settlements
      ]
    };

    this.applyProfile(nextProfile);
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
    this.showPayoutsReviewModal = false;
  }

  onSuspendPayment(_: string): void {
    this.showPayoutsReviewModal = false;
  }

  onEscalatePayment(_: string): void {
    this.showPayoutsReviewModal = false;
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
    this.financeService.getVendorFinanceProfile(this.vendorId).pipe(take(1)).subscribe((profile) => {
      this.applyProfile(profile);
    });
  }

  private applyProfile(profile: VendorFinanceProfile): void {
    this.profile = profile;
    this.vendorName = profile.vendorName;
    this.availableBalance = profile.availableBalance;
    this.kpis = [
      {
        id: 'total_sales',
        titleKey: 'VENDOR_FINANCE.KPI.TOTAL_SALES',
        value: this.formatNumber(profile.totalSales),
        unit: 'SAR',
        icon: 'point_of_sale',
        iconBgClass: 'bg-primary/10 text-primary',
        trend: `${this.formatNumber(profile.commissionRate)}%`,
        trendKey: 'FINANCES.PRICING.VENDOR_COMMISSION.DEFAULT_PERCENT',
        trendIcon: 'percent',
        trendClass: 'text-slate-500'
      },
      {
        id: 'net_sales',
        titleKey: 'VENDOR_FINANCE.KPI.NET_SALES',
        value: this.formatNumber(profile.netSales),
        unit: 'SAR',
        icon: 'account_balance_wallet',
        iconBgClass: 'bg-primary/10 text-primary',
        trend: this.formatNumber(profile.refundExposure),
        trendKey: 'FINANCES.REFUNDS.SUMMARY.TOTAL_EXPOSURE',
        trendIcon: 'undo',
        trendClass: profile.refundExposure > 0 ? 'text-red-600' : 'text-green-600'
      },
      {
        id: 'commissions',
        titleKey: 'VENDOR_FINANCE.KPI.TOTAL_COMMISSIONS',
        value: this.formatNumber(profile.totalCommissions),
        unit: 'SAR',
        icon: 'percent',
        iconBgClass: 'bg-orange-50 text-orange-500',
        trend: `${this.formatNumber(profile.commissionRate)}%`,
        trendKey: 'FINANCES.ENTITIES.VENDOR',
        trendIcon: 'trending_up',
        trendClass: 'text-slate-500'
      },
      {
        id: 'available',
        titleKey: 'VENDOR_FINANCE.KPI.AVAILABLE_BALANCE',
        value: this.formatNumber(profile.availableBalance),
        unit: 'SAR',
        icon: 'payments',
        iconBgClass: 'bg-green-50 text-green-500',
        trend: `${this.formatNumber(profile.disputeCount)}`,
        trendKey: 'FINANCES.REFUNDS.SUMMARY.TOTAL_CASES',
        trendIcon: 'gavel',
        trendClass: 'text-slate-500'
      },
      {
        id: 'pending',
        titleKey: 'VENDOR_FINANCE.KPI.PENDING_BALANCE',
        value: this.formatNumber(profile.pendingBalance),
        unit: 'SAR',
        icon: 'pending_actions',
        iconBgClass: 'bg-amber-50 text-amber-500',
        trend: `${profile.settlements.filter((item) => item.status !== 'paid').length}`,
        trendKey: 'FINANCES.STATUS.PENDING',
        trendIcon: 'schedule',
        trendClass: 'text-amber-600'
      },
      {
        id: 'last_payment',
        titleKey: 'VENDOR_FINANCE.KPI.LAST_PAYMENT',
        value: this.formatNumber(profile.lastPaymentAmount),
        unit: 'SAR',
        icon: 'history',
        iconBgClass: 'bg-primary/10 text-primary',
        trend: this.formatDate(profile.lastPaymentDate),
        trendKey: '',
        trendIcon: '',
        trendClass: 'text-gray-500'
      }
    ];
    this.financialSummary = {
      sales: this.formatNumber(profile.financialSummary.sales),
      returns: this.formatSignedNumber(profile.financialSummary.returns),
      discounts: this.formatSignedNumber(profile.financialSummary.discounts),
      commissions: this.formatSignedNumber(profile.financialSummary.commissions),
      netTotal: this.formatNumber(profile.financialSummary.netTotal)
    };
    this.bankInfo = profile.bankInfo;
    this.settlements = profile.settlements.slice(0, 6).map((settlement) => ({
      id: settlement.id,
      settlementId: settlement.settlementCode,
      period: settlement.period,
      total: this.formatNumber(settlement.grossAmount),
      net: this.formatNumber(settlement.netAmount),
      statusKey: settlement.status === 'paid' ? 'VENDOR_FINANCE.STATUS.COMPLETED' : 'VENDOR_FINANCE.STATUS.PENDING',
      statusClass: settlement.status === 'paid'
        ? 'bg-green-100 text-green-800 border-green-200'
        : 'bg-amber-100 text-amber-800 border-amber-200',
      date: this.formatDate(settlement.paidAt || settlement.createdAt)
    }));
    this.alerts = [
      ...(profile.pendingBalance > 0 ? [{
        id: 'pending-settlement',
        titleKey: 'FINANCES.ALERTS.SETTLEMENT_DUE',
        descriptionKey: 'FINANCES.ALERTS.SETTLEMENT_DUE_DESC',
        settlementId: this.settlements.find((item) => item.statusKey === 'VENDOR_FINANCE.STATUS.PENDING')?.settlementId ?? this.vendorId
      }] : []),
      ...(profile.refundExposure > 0 ? [{
        id: 'refund-exposure',
        titleKey: 'FINANCES.ALERTS.HIGH_DISPUTE_VENDOR',
        descriptionKey: 'FINANCES.ALERTS.HIGH_DISPUTE_VENDOR_DESC',
        settlementId: `${profile.disputeCount}`
      }] : [])
    ];
  }

  private buildStatementContent(config: FinancialStatementConfig): string {
    const profile = this.profile;
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
      `Total sales: ${profile?.totalSales ?? 0}`,
      `Net sales: ${profile?.netSales ?? 0}`,
      `Total commissions: ${profile?.totalCommissions ?? 0}`,
      `Available balance: ${profile?.availableBalance ?? 0}`,
      `Pending balance: ${profile?.pendingBalance ?? 0}`
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
