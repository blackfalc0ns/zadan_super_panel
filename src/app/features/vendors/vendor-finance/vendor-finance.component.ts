import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { FinancialStatementModalComponent, FinancialStatementConfig } from '../../../shared/components/ui/financial-statement-modal/financial-statement-modal.component';
import { PayoutsReviewModalComponent } from '../../../shared/components/ui/payouts-review-modal/payouts-review-modal.component';
import { CreateSettlementModalComponent, SettlementConfig } from '../../../shared/components/ui/create-settlement-modal/create-settlement-modal.component';

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

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  statusKey: string;
  statusClass: string;
}

@Component({
  selector: 'app-vendor-finance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, FinancialStatementModalComponent, PayoutsReviewModalComponent, CreateSettlementModalComponent],
  templateUrl: './vendor-finance.component.html'
})
export class VendorFinanceComponent {
  @Output() tabChange = new EventEmitter<string>();
  
  vendorId: string = 'VND-9928';
  currentLang: string = 'ar';
  isRTL: boolean = true;
  showFinancialStatementModal = false;
  showPayoutsReviewModal = false;
  showCreateSettlementModal = false;

  kpis: KPI[] = [
    {
      id: 'total_sales',
      titleKey: 'VENDOR_FINANCE.KPI.TOTAL_SALES',
      value: '15,000',
      unit: 'SAR',
      icon: 'point_of_sale',
      iconBgClass: 'bg-primary/10 text-primary',
      trend: '+5%',
      trendKey: 'VENDOR_FINANCE.KPI.FROM_LAST_MONTH',
      trendIcon: 'trending_up',
      trendClass: 'text-green-600'
    },
    {
      id: 'net_sales',
      titleKey: 'VENDOR_FINANCE.KPI.NET_SALES',
      value: '14,250',
      unit: 'SAR',
      icon: 'account_balance_wallet',
      iconBgClass: 'bg-primary/10 text-primary',
      trend: '+3%',
      trendKey: 'VENDOR_FINANCE.KPI.INCREASE',
      trendIcon: 'trending_up',
      trendClass: 'text-green-600'
    },
    {
      id: 'commissions',
      titleKey: 'VENDOR_FINANCE.KPI.TOTAL_COMMISSIONS',
      value: '750',
      unit: 'SAR',
      icon: 'percent',
      iconBgClass: 'bg-orange-50 text-orange-500',
      trend: '-2%',
      trendKey: 'VENDOR_FINANCE.KPI.DECREASE',
      trendIcon: 'trending_down',
      trendClass: 'text-red-600'
    },
    {
      id: 'available',
      titleKey: 'VENDOR_FINANCE.KPI.AVAILABLE_BALANCE',
      value: '5,000',
      unit: 'SAR',
      icon: 'payments',
      iconBgClass: 'bg-green-50 text-green-500',
      trend: '+10%',
      trendKey: 'VENDOR_FINANCE.KPI.INCREASE',
      trendIcon: 'trending_up',
      trendClass: 'text-green-600'
    },
    {
      id: 'pending',
      titleKey: 'VENDOR_FINANCE.KPI.PENDING_BALANCE',
      value: '2,000',
      unit: 'SAR',
      icon: 'pending_actions',
      iconBgClass: 'bg-amber-50 text-amber-500',
      trend: '-1%',
      trendKey: 'VENDOR_FINANCE.KPI.DECREASE',
      trendIcon: 'trending_down',
      trendClass: 'text-red-600'
    },
    {
      id: 'last_payment',
      titleKey: 'VENDOR_FINANCE.KPI.LAST_PAYMENT',
      value: '1,000',
      unit: 'SAR',
      icon: 'history',
      iconBgClass: 'bg-primary/10 text-primary',
      trend: '12 مايو 2024',
      trendKey: '',
      trendIcon: '',
      trendClass: 'text-gray-500'
    }
  ];

  financialSummary = {
    sales: '20,000',
    returns: '-1,000',
    discounts: '-500',
    commissions: '-1,000',
    netTotal: '17,500'
  };

  bankInfo = {
    bankName: 'Al Rajhi Bank',
    iban: 'SA** **** **** 1234',
    paymentCycle: 'VENDOR_FINANCE.WEEKLY_CYCLE'
  };

  settlements: Settlement[] = [
    {
      id: '1',
      settlementId: 'SET-001',
      period: 'Jan 2024',
      total: '5,000',
      net: '4,750',
      statusKey: 'VENDOR_FINANCE.STATUS.COMPLETED',
      statusClass: 'bg-green-100 text-green-800 border-green-200',
      date: '2024-01-31'
    },
    {
      id: '2',
      settlementId: 'SET-002',
      period: 'Feb 2024',
      total: '6,000',
      net: '5,700',
      statusKey: 'VENDOR_FINANCE.STATUS.COMPLETED',
      statusClass: 'bg-green-100 text-green-800 border-green-200',
      date: '2024-02-28'
    },
    {
      id: '3',
      settlementId: 'SET-003',
      period: 'Mar 2024',
      total: '4,000',
      net: '3,800',
      statusKey: 'VENDOR_FINANCE.STATUS.PENDING',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      date: '2024-03-31'
    },
    {
      id: '4',
      settlementId: 'SET-004',
      period: 'Apr 2024',
      total: '7,000',
      net: '6,650',
      statusKey: 'VENDOR_FINANCE.STATUS.PENDING',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      date: '2024-04-30'
    }
  ];

  invoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-293',
      date: '10 مايو',
      amount: '1,200',
      statusKey: 'VENDOR_FINANCE.INVOICE_STATUS.PAID',
      statusClass: 'bg-green-100 text-green-700'
    },
    {
      id: '2',
      invoiceNumber: 'INV-294',
      date: '12 مايو',
      amount: '850',
      statusKey: 'VENDOR_FINANCE.INVOICE_STATUS.PENDING',
      statusClass: 'bg-amber-100 text-amber-700'
    }
  ];

  alerts = [
    {
      id: '1',
      titleKey: 'VENDOR_FINANCE.ALERTS.PENDING_PAYMENT',
      descriptionKey: 'VENDOR_FINANCE.ALERTS.PENDING_PAYMENT_DESC',
      settlementId: 'SET-003'
    }
  ];

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';
    
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === 'ar';
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.vendorId = params['id'];
      }
    });
  }

  onCreateSettlement() {
    console.log('Create settlement');
    this.showCreateSettlementModal = true;
  }

  onSettlementCreated(config: SettlementConfig) {
    console.log('Settlement created:', config);
    this.showCreateSettlementModal = false;
    // Here you would call your API to create the settlement
  }

  onSettlementDraftSaved(config: SettlementConfig) {
    console.log('Settlement draft saved:', config);
    this.showCreateSettlementModal = false;
    // Here you would call your API to save the draft
  }

  onDownloadStatement() {
    console.log('Download financial statement');
    this.showFinancialStatementModal = true;
  }

  onStatementDownload(config: FinancialStatementConfig) {
    console.log('Downloading statement with config:', config);
    // Here you would call your API to generate and download the statement
    this.showFinancialStatementModal = false;
  }

  onStatementPreview(config: FinancialStatementConfig) {
    console.log('Previewing statement with config:', config);
    // Here you would call your API to preview the statement
  }

  onReviewPayments() {
    console.log('Review payments');
    this.showPayoutsReviewModal = true;
  }

  onRetryPayment(transactionId: string) {
    console.log('Retry payment:', transactionId);
    // Here you would call your API to retry the payment
  }

  onSuspendPayment(transactionId: string) {
    console.log('Suspend payment:', transactionId);
    // Here you would call your API to suspend the payment
  }

  onEscalatePayment(transactionId: string) {
    console.log('Escalate payment:', transactionId);
    // Here you would call your API to escalate the payment
  }

  onViewMoreSettlements() {
    console.log('View more settlements');
  }

  onViewAllInvoices() {
    console.log('View all invoices');
  }

  onFilterSettlements() {
    console.log('Filter settlements');
  }

  onSettlementOptions() {
    console.log('Settlement options');
  }
}
