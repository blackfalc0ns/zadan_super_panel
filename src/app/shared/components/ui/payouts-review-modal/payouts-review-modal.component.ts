import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentDetailModalComponent, PaymentDetail } from '../payment-detail-modal/payment-detail-modal.component';

export interface PayoutTransaction {
  id: string;
  paymentNumber: string;
  date: string;
  time: string;
  amount: number;
  bankDestination: string;
  status: 'success' | 'failed' | 'pending' | 'reviewing';
  statusLabel: string;
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

  transactions: PayoutTransaction[] = [
    {
      id: '1',
      paymentNumber: '#PAY-9821',
      date: '2023-11-05',
      time: '10:30 AM',
      amount: 5400,
      bankDestination: 'الراجحي - **** 1234',
      status: 'success',
      statusLabel: 'ناجحة',
      reference: 'TRX882910'
    },
    {
      id: '2',
      paymentNumber: '#PAY-9818',
      date: '2023-11-04',
      time: '03:45 PM',
      amount: 12500,
      bankDestination: 'الأهلي - **** 5566',
      status: 'failed',
      statusLabel: 'فاشلة',
      reference: 'TRX882905',
      failureReason: 'فشل في المصادقة البنكية (رمز: BANK_AUTH_01). العميل لم يكمل التحقق بنجاح من خلال تطبيق البنك.'
    },
    {
      id: '3',
      paymentNumber: '#PAY-9815',
      date: '2023-11-04',
      time: '11:20 AM',
      amount: 3200,
      bankDestination: 'الإنماء - **** 9911',
      status: 'pending',
      statusLabel: 'معلقة',
      reference: 'TRX882901'
    },
    {
      id: '4',
      paymentNumber: '#PAY-9810',
      date: '2023-11-03',
      time: '09:15 AM',
      amount: 22000,
      bankDestination: 'محفظة رقمية',
      status: 'reviewing',
      statusLabel: 'قيد المراجعة',
      reference: 'TRX882895'
    }
  ];

  constructor() {
    // Select the failed transaction by default
    this.selectedTransaction = this.transactions.find(t => t.status === 'failed') || null;
  }

  onClose() {
    this.close.emit();
  }

  selectTransaction(transaction: PayoutTransaction) {
    this.selectedTransaction = transaction;
  }

  viewTransactionDetails(transaction: PayoutTransaction) {
    // Convert PayoutTransaction to PaymentDetail
    this.selectedPaymentDetail = {
      transactionId: transaction.paymentNumber,
      bankReference: transaction.reference,
      operationType: 'Payout (تحويل صادر)',
      operationDate: transaction.date,
      amount: transaction.amount,
      status: transaction.status,
      statusLabel: transaction.statusLabel,
      statusCode: transaction.status === 'success' ? '200 OK' : undefined,
      lastUpdated: `${transaction.date} - ${transaction.time}`,
      
      vendorName: 'شركة المسارات السريعة للتجارة',
      bankName: transaction.bankDestination.split(' - ')[0] || 'مصرف الراجحي',
      iban: 'SA43 8000 0000 **** **** 4920',
      beneficiaryName: 'أحمد محمد عبد الله',
      swiftCode: 'ALRJSAXX',
      
      timeline: {
        created: '09:15 ص',
        processing: '09:20 ص',
        transferred: '10:15 ص',
        confirmed: '10:30 ص'
      },
      
      logs: [
        { type: 'success', message: 'API Call to SAMA Gateway initiated.' },
        { type: 'success', message: 'Response 200: Transaction verified.' },
        { type: 'debug', message: 'Retry count: 0 of 3' }
      ],
      
      failureReason: transaction.failureReason
    };
    
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
}
