import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface PaymentDetail {
  transactionId: string;
  bankReference: string;
  operationType: string;
  operationDate: string;
  amount: number;
  status: 'success' | 'failed' | 'pending' | 'reviewing';
  statusLabel: string;
  statusCode?: string;
  lastUpdated: string;
  
  // Recipient Info
  vendorName: string;
  bankName: string;
  iban: string;
  beneficiaryName: string;
  swiftCode: string;
  
  // Timeline
  timeline: {
    created: string;
    processing: string;
    transferred: string;
    confirmed: string;
  };
  
  // Technical logs
  logs: {
    type: 'success' | 'error' | 'debug';
    message: string;
  }[];
  
  failureReason?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-payment-detail-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './payment-detail-modal.component.html',
  styleUrls: ['./payment-detail-modal.component.scss']
})
export class PaymentDetailModalComponent {
  @Input() isOpen = false;
  @Input() paymentDetail: PaymentDetail | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() downloadReceipt = new EventEmitter<string>();
  @Output() retryPayment = new EventEmitter<string>();
  @Output() viewActivityLog = new EventEmitter<string>();

  constructor(private translate: TranslateService) {}

  get isRTL(): boolean {
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';
    return lang.startsWith('ar');
  }

  onClose() {
    this.close.emit();
  }

  onDownloadReceipt() {
    if (this.paymentDetail) {
      this.downloadReceipt.emit(this.paymentDetail.transactionId);
    }
  }

  onRetryPayment() {
    if (this.paymentDetail) {
      this.retryPayment.emit(this.paymentDetail.transactionId);
    }
  }

  onViewActivityLog() {
    if (this.paymentDetail) {
      this.viewActivityLog.emit(this.paymentDetail.transactionId);
    }
  }

  copyToClipboard(text: string) {
    void navigator.clipboard.writeText(text);
  }

  getStatusClass(): string {
    if (!this.paymentDetail) return '';
    
    const classes: { [key: string]: string } = {
      success: 'bg-emerald-100 border-emerald-200 text-emerald-800',
      failed: 'bg-rose-100 border-rose-200 text-rose-800',
      pending: 'bg-amber-100 border-amber-200 text-amber-800',
      reviewing: 'bg-blue-100 border-blue-200 text-blue-800'
    };
    return classes[this.paymentDetail.status] || '';
  }

  getStatusIconClass(): string {
    if (!this.paymentDetail) return '';
    
    const classes: { [key: string]: string } = {
      success: 'bg-emerald-500/20 text-emerald-600',
      failed: 'bg-rose-500/20 text-rose-600',
      pending: 'bg-amber-500/20 text-amber-600',
      reviewing: 'bg-blue-500/20 text-blue-600'
    };
    return classes[this.paymentDetail.status] || '';
  }

  getLogTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      success: 'text-emerald-500',
      error: 'text-rose-500',
      debug: 'text-slate-500'
    };
    return classes[type] || '';
  }

  getLogTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      success: 'MODALS.PAYMENT_DETAIL.LOG_TYPES.SUCCESS',
      error: 'MODALS.PAYMENT_DETAIL.LOG_TYPES.ERROR',
      debug: 'MODALS.PAYMENT_DETAIL.LOG_TYPES.DEBUG'
    };

    return labels[type] ? this.translate.instant(labels[type]) : '';
  }
}
