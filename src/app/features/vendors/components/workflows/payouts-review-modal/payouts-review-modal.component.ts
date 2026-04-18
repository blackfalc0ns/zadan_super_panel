import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaymentDetail, PaymentDetailModalComponent } from '../payment-detail-modal/payment-detail-modal.component';
import { SearchableSelectComponent } from '../../../../../shared/components/ui/form-controls/select/searchable-select.component';

type PayoutBankCode = 'alrajhi' | 'alahli' | 'alinma' | 'wallet' | 'bank';

export interface PayoutTransaction {
  id: string;
  paymentNumber: string;
  date: string;
  time: string;
  createdAtUtc?: string;
  processedAtUtc?: string;
  amount: number;
  bankCode: PayoutBankCode;
  accountMask?: string;
  status: 'success' | 'failed' | 'pending' | 'reviewing';
  reference: string;
  failureReason?: string;
}

@Component({
  selector: 'app-payouts-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PaymentDetailModalComponent, SearchableSelectComponent],
  templateUrl: './payouts-review-modal.component.html',
  styleUrls: ['./payouts-review-modal.component.scss']
})
export class PayoutsReviewModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() availableBalance = 0;
  @Input() vendorName = '';
  @Input() beneficiaryName = '';
  @Input() iban = '';
  @Input() swiftCode = '';
  @Input() bankName = '';
  @Input() transactions: PayoutTransaction[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() retryPayment = new EventEmitter<string>();
  @Output() suspendPayment = new EventEmitter<string>();
  @Output() escalatePayment = new EventEmitter<string>();
  @Output() downloadReceipt = new EventEmitter<string>();
  @Output() viewActivityLog = new EventEmitter<string>();

  selectedTransaction: PayoutTransaction | null = null;
  showPaymentDetailModal = false;
  selectedPaymentDetail: PaymentDetail | null = null;

  filters = {
    reference: '',
    status: 'all',
    date: '',
    bank: 'all'
  };

  internalNotes = '';

  readonly statusOptions = [
    { value: 'all', labelKey: 'MODALS.PAYOUTS_REVIEW.ALL_STATUS' },
    { value: 'success', labelKey: 'MODALS.PAYOUTS_REVIEW.SUCCESS' },
    { value: 'pending', labelKey: 'MODALS.PAYOUTS_REVIEW.PENDING' },
    { value: 'failed', labelKey: 'MODALS.PAYOUTS_REVIEW.FAILED' },
    { value: 'reviewing', labelKey: 'MODALS.PAYOUTS_REVIEW.REVIEWING' }
  ];

  readonly bankOptions = [
    { value: 'all', labelKey: 'MODALS.PAYOUTS_REVIEW.ALL_BANKS' },
    { value: 'alrajhi', labelKey: 'MODALS.PAYOUTS_REVIEW.BANK_OPTIONS.ALRAJHI' },
    { value: 'alinma', labelKey: 'MODALS.PAYOUTS_REVIEW.BANK_OPTIONS.ALINMA' },
    { value: 'alahli', labelKey: 'MODALS.PAYOUTS_REVIEW.BANK_OPTIONS.ALAHLI' }
  ];

  constructor(private translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactions']) {
      const selectedId = this.selectedTransaction?.id ?? null;
      this.selectedTransaction = this.filteredTransactions.find((transaction) => transaction.id === selectedId)
        ?? this.filteredTransactions.find((transaction) => transaction.status === 'failed')
        ?? this.filteredTransactions[0]
        ?? null;

      if (this.showPaymentDetailModal && this.selectedTransaction) {
        this.selectedPaymentDetail = this.buildPaymentDetail(this.selectedTransaction);
      }
    }
  }

  get isRTL(): boolean {
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';
    return lang.startsWith('ar');
  }

  get filteredTransactions(): PayoutTransaction[] {
    return this.transactions.filter((transaction) => {
      const matchesReference = !this.filters.reference.trim()
        || transaction.reference.toLowerCase().includes(this.filters.reference.trim().toLowerCase())
        || transaction.paymentNumber.toLowerCase().includes(this.filters.reference.trim().toLowerCase());
      const matchesStatus = this.filters.status === 'all' || transaction.status === this.filters.status;
      const matchesDate = !this.filters.date || transaction.date === this.filters.date;
      const matchesBank = this.filters.bank === 'all' || transaction.bankCode === this.filters.bank;

      return matchesReference && matchesStatus && matchesDate && matchesBank;
    });
  }

  onClose() {
    this.close.emit();
  }

  selectTransaction(transaction: PayoutTransaction) {
    this.selectedTransaction = transaction;
  }

  viewTransactionDetails(transaction: PayoutTransaction) {
    this.selectedTransaction = transaction;
    this.selectedPaymentDetail = this.buildPaymentDetail(transaction);
    this.showPaymentDetailModal = true;
  }

  onRetryPayment() {
    if (this.selectedTransaction) {
      this.retryPayment.emit(this.selectedTransaction.id);
    }
  }

  onSuspendPayment() {
    if (this.selectedTransaction) {
      this.suspendPayment.emit(this.selectedTransaction.id);
    }
  }

  onEscalatePayment() {
    if (this.selectedTransaction) {
      this.escalatePayment.emit(this.selectedTransaction.id);
    }
  }

  onDownloadReceipt() {
    if (this.selectedTransaction) {
      this.downloadReceipt.emit(this.selectedTransaction.id);
    }
  }

  onViewActivityLog() {
    if (this.selectedTransaction) {
      this.viewActivityLog.emit(this.selectedTransaction.id);
    }
  }

  resetFilters() {
    this.filters = {
      reference: '',
      status: 'all',
      date: '',
      bank: 'all'
    };

    this.selectedTransaction = this.filteredTransactions[0] ?? null;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      success: 'bg-emerald-100 text-emerald-800 border-emerald-200/50',
      failed: 'bg-rose-100 text-rose-800 border-rose-200/50',
      pending: 'bg-amber-100 text-amber-800 border-amber-200/50',
      reviewing: 'bg-blue-100 text-blue-800 border-blue-200/50'
    };
    return classes[status] || '';
  }

  getRowClass(transaction: PayoutTransaction): string {
    if (this.selectedTransaction?.id === transaction.id) {
      return transaction.status === 'failed'
        ? 'bg-rose-50/40 ring-1 ring-inset ring-rose-200'
        : 'bg-blue-50/40 ring-1 ring-inset ring-blue-200';
    }
    return 'hover:bg-slate-50 transition-colors';
  }

  getStatusLabel(status: PayoutTransaction['status']): string {
    const keys: Record<PayoutTransaction['status'], string> = {
      success: 'MODALS.PAYOUTS_REVIEW.SUCCESS',
      failed: 'MODALS.PAYOUTS_REVIEW.FAILED',
      pending: 'MODALS.PAYOUTS_REVIEW.PENDING',
      reviewing: 'MODALS.PAYOUTS_REVIEW.REVIEWING'
    };

    return this.translate.instant(keys[status]);
  }

  getBankLabel(bankCode: PayoutBankCode): string {
    const keys: Record<PayoutBankCode, string> = {
      alrajhi: 'MODALS.PAYOUTS_REVIEW.BANK_OPTIONS.ALRAJHI',
      alahli: 'MODALS.PAYOUTS_REVIEW.BANK_OPTIONS.ALAHLI',
      alinma: 'MODALS.PAYOUTS_REVIEW.BANK_OPTIONS.ALINMA',
      wallet: 'MODALS.PAYOUTS_REVIEW.BANK_OPTIONS.WALLET',
      bank: ''
    };

    const translated = keys[bankCode] ? this.translate.instant(keys[bankCode]) : '';
    return translated || this.bankName || '-';
  }

  formatBankDestination(transaction: PayoutTransaction): string {
    const bankLabel = this.getBankLabel(transaction.bankCode);
    return transaction.accountMask ? `${bankLabel} - ${transaction.accountMask}` : bankLabel;
  }

  private buildPaymentDetail(transaction: PayoutTransaction): PaymentDetail {
    const createdAt = transaction.createdAtUtc
      ? new Date(transaction.createdAtUtc)
      : null;
    const processedAt = transaction.processedAtUtc
      ? new Date(transaction.processedAtUtc)
      : null;
    const createdLabel = createdAt
      ? `${transaction.date} - ${transaction.time}`
      : transaction.date;
    const processingLabel = transaction.status === 'pending' ? '-' : createdLabel;
    const completedLabel = processedAt
      ? processedAt.toLocaleString(this.isRTL ? 'ar-SA' : 'en-US')
      : '-';

    return {
      transactionId: transaction.paymentNumber,
      bankReference: transaction.reference,
      operationType: this.translate.instant('MODALS.PAYMENT_DETAIL.PAYOUT_OPERATION'),
      operationDate: transaction.date,
      amount: transaction.amount,
      status: transaction.status,
      statusLabel: this.getStatusLabel(transaction.status),
      statusCode: transaction.status === 'success' ? '200 OK' : undefined,
      lastUpdated: `${transaction.date} - ${transaction.time}`,
      vendorName: this.vendorName || '-',
      bankName: this.getBankLabel(transaction.bankCode),
      iban: this.iban || '-',
      beneficiaryName: this.beneficiaryName || this.vendorName || '-',
      swiftCode: this.swiftCode || '-',
      timeline: {
        created: createdLabel,
        processing: processingLabel,
        transferred: transaction.status === 'success' ? completedLabel : '-',
        confirmed: transaction.status === 'success' ? completedLabel : '-'
      },
      logs: [
        { type: 'debug', message: this.translate.instant('MODALS.PAYMENT_DETAIL.LOG_MESSAGES.API_INITIATED') },
        {
          type: transaction.status === 'failed' ? 'error' : transaction.status === 'success' ? 'success' : 'debug',
          message: `${this.translate.instant('MODALS.PAYOUTS_REVIEW.STATUS')}: ${this.getStatusLabel(transaction.status)}`
        }
      ],
      failureReason: transaction.failureReason
    };
  }
}
