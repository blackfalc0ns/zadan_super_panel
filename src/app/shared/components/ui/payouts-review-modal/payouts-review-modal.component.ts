import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaymentDetailModalComponent, PaymentDetail } from '../payment-detail-modal/payment-detail-modal.component';

type PayoutBankCode = 'alrajhi' | 'alahli' | 'alinma' | 'wallet';

export interface PayoutTransaction {
  id: string;
  paymentNumber: string;
  date: string;
  time: string;
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
  imports: [CommonModule, FormsModule, TranslateModule, PaymentDetailModalComponent],
  templateUrl: './payouts-review-modal.component.html',
  styleUrls: ['./payouts-review-modal.component.scss']
})
export class PayoutsReviewModalComponent {
  @Input() isOpen = false;
  @Input() availableBalance = 45250;
  @Output() close = new EventEmitter<void>();
  @Output() retryPayment = new EventEmitter<string>();
  @Output() suspendPayment = new EventEmitter<string>();
  @Output() escalatePayment = new EventEmitter<string>();

  selectedTransaction: PayoutTransaction | null = null;
  showPaymentDetailModal = false;
  selectedPaymentDetail: PaymentDetail | null = null;
  
  // Filters
  filters = {
    reference: '',
    status: 'all',
    date: '',
    bank: 'all'
  };

  internalNotes = '';

  transactions: PayoutTransaction[] = [];

  constructor(private translate: TranslateService) {
    this.rebuildTransactions();
    this.translate.onLangChange.subscribe(() => this.rebuildTransactions());
  }

  onClose() {
    this.close.emit();
  }

  selectTransaction(transaction: PayoutTransaction) {
    this.selectedTransaction = transaction;
  }

  viewTransactionDetails(transaction: PayoutTransaction) {
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

  resetFilters() {
    this.filters = {
      reference: '',
      status: 'all',
      date: '',
      bank: 'all'
    };
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
      wallet: 'MODALS.PAYOUTS_REVIEW.BANK_OPTIONS.WALLET'
    };

    return this.translate.instant(keys[bankCode]);
  }

  formatBankDestination(transaction: PayoutTransaction): string {
    const bankLabel = this.getBankLabel(transaction.bankCode);
    return transaction.accountMask ? `${bankLabel} - ${transaction.accountMask}` : bankLabel;
  }

  private rebuildTransactions(): void {
    const selectedId = this.selectedTransaction?.id;

    this.transactions = [
      {
        id: '1',
        paymentNumber: '#PAY-9821',
        date: '2023-11-05',
        time: '10:30 AM',
        amount: 5400,
        bankCode: 'alrajhi',
        accountMask: '**** 1234',
        status: 'success',
        reference: 'TRX882910'
      },
      {
        id: '2',
        paymentNumber: '#PAY-9818',
        date: '2023-11-04',
        time: '03:45 PM',
        amount: 12500,
        bankCode: 'alahli',
        accountMask: '**** 5566',
        status: 'failed',
        reference: 'TRX882905',
        failureReason: this.translate.instant('MODALS.PAYOUTS_REVIEW.FAILURE_REASON_BANK_AUTH')
      },
      {
        id: '3',
        paymentNumber: '#PAY-9815',
        date: '2023-11-04',
        time: '11:20 AM',
        amount: 3200,
        bankCode: 'alinma',
        accountMask: '**** 9911',
        status: 'pending',
        reference: 'TRX882901'
      },
      {
        id: '4',
        paymentNumber: '#PAY-9810',
        date: '2023-11-03',
        time: '09:15 AM',
        amount: 22000,
        bankCode: 'wallet',
        status: 'reviewing',
        reference: 'TRX882895'
      }
    ];

    this.selectedTransaction = this.transactions.find(t => t.id === selectedId)
      || this.transactions.find(t => t.status === 'failed')
      || null;

    if (this.showPaymentDetailModal && this.selectedTransaction) {
      this.selectedPaymentDetail = this.buildPaymentDetail(this.selectedTransaction);
    }
  }

  private buildPaymentDetail(transaction: PayoutTransaction): PaymentDetail {
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
      vendorName: this.translate.instant('MODALS.PAYOUTS_REVIEW.MOCK_VENDOR_NAME'),
      bankName: this.getBankLabel(transaction.bankCode),
      iban: 'SA43 8000 0000 **** **** 4920',
      beneficiaryName: this.translate.instant('MODALS.PAYOUTS_REVIEW.MOCK_BENEFICIARY_NAME'),
      swiftCode: 'ALRJSAXX',
      timeline: {
        created: '09:15 AM',
        processing: '09:20 AM',
        transferred: '10:15 AM',
        confirmed: '10:30 AM'
      },
      logs: [
        { type: 'success', message: this.translate.instant('MODALS.PAYMENT_DETAIL.LOG_MESSAGES.API_INITIATED') },
        { type: 'success', message: this.translate.instant('MODALS.PAYMENT_DETAIL.LOG_MESSAGES.RESPONSE_VERIFIED') },
        { type: 'debug', message: this.translate.instant('MODALS.PAYMENT_DETAIL.LOG_MESSAGES.RETRY_COUNT') }
      ],
      failureReason: transaction.failureReason
    };
  }
}
