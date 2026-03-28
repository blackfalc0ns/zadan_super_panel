import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { VendorFinanceProfile } from '../../finances/models/finance.models';
import { FinanceService } from '../../finances/services/finance.service';
import { CreateSettlementModalComponent, SettlementConfig } from '../../../shared/components/ui/create-settlement-modal/create-settlement-modal.component';
import { FinancialStatementConfig, FinancialStatementModalComponent } from '../../../shared/components/ui/financial-statement-modal/financial-statement-modal.component';
import { InlineBannerComponent } from '../../../shared/components/ui/inline-banner/inline-banner.component';
import { PayoutsReviewModalComponent } from '../../../shared/components/ui/payouts-review-modal/payouts-review-modal.component';
import { SectionHeaderComponent } from '../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../shared/components/ui/status-pill/status-pill.component';

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
  @Output() tabChange = new EventEmitter<string>();

  vendorId = 'VND-9928';
  vendorName = 'Vendor';
  currentLang = 'ar';
  isRTL = true;
  showFinancialStatementModal = false;
  showPayoutsReviewModal = false;
  showCreateSettlementModal = false;
  availableBalance = 0;
  profile: VendorFinanceProfile | null = null;

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
    private readonly route: ActivatedRoute,
    private readonly financeService: FinanceService
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === 'ar';
      this.loadData();
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.vendorId = params['id'];
      }
      this.loadData();
    });
  }

  onCreateSettlement(): void {
    this.showCreateSettlementModal = true;
  }

  onSettlementCreated(config: SettlementConfig): void {
    console.log('Settlement created:', config);
    this.showCreateSettlementModal = false;
  }

  onSettlementDraftSaved(config: SettlementConfig): void {
    console.log('Settlement draft saved:', config);
    this.showCreateSettlementModal = false;
  }

  onDownloadStatement(): void {
    this.showFinancialStatementModal = true;
  }

  onStatementDownload(config: FinancialStatementConfig): void {
    console.log('Downloading statement with config:', config);
    this.showFinancialStatementModal = false;
  }

  onStatementPreview(config: FinancialStatementConfig): void {
    console.log('Previewing statement with config:', config);
  }

  onReviewPayments(): void {
    this.showPayoutsReviewModal = true;
  }

  onRetryPayment(transactionId: string): void {
    console.log('Retry payment:', transactionId);
  }

  onSuspendPayment(transactionId: string): void {
    console.log('Suspend payment:', transactionId);
  }

  onEscalatePayment(transactionId: string): void {
    console.log('Escalate payment:', transactionId);
  }

  onViewMoreSettlements(): void {
    console.log('View more settlements');
  }

  onViewAllInvoices(): void {
    console.log('View all invoices');
  }

  onFilterSettlements(): void {
    console.log('Filter settlements');
  }

  onSettlementOptions(): void {
    console.log('Settlement options');
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
    });
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
