import { CommonModule } from '@angular/common';
import {
 ChangeDetectionStrategy,
 ChangeDetectorRef,
 Component,
 EventEmitter,
 Input,
 OnChanges,
 Output,
 SimpleChanges,
 inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaymentDetail, PaymentDetailModalComponent } from '../payment-detail-modal/payment-detail-modal.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { ExportService } from '../../../../../shared/utils/export';
import { ToastService } from '../../../../../shared/services/toast.service';
import { VendorService } from '@vendors/services/vendor.api.service';

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
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-payouts-review-modal',
 standalone: true,
 imports: [CommonModule, FormsModule, TranslateModule, PaymentDetailModalComponent, SearchableSelectComponent],
 templateUrl: './payouts-review-modal.component.html',
 styleUrls: ['./payouts-review-modal.component.scss']
})
export class PayoutsReviewModalComponent implements OnChanges {
 private readonly cdr = inject(ChangeDetectorRef);
 private readonly exportService = inject(ExportService);
 private readonly toastService = inject(ToastService);
 private readonly vendorService = inject(VendorService);

 @Input() isOpen = false;
 @Input() vendorId = '';
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
 status: 'all'
 };

 internalNotes = '';

 readonly statusOptions = [
 { value: 'all', labelKey: 'MODALS.PAYOUTS_REVIEW.ALL_STATUS' },
 { value: 'success', labelKey: 'MODALS.PAYOUTS_REVIEW.SUCCESS' },
 { value: 'pending', labelKey: 'MODALS.PAYOUTS_REVIEW.PENDING' },
 { value: 'failed', labelKey: 'MODALS.PAYOUTS_REVIEW.FAILED' },
 { value: 'reviewing', labelKey: 'MODALS.PAYOUTS_REVIEW.REVIEWING' }
 ];

 constructor(private readonly translate: TranslateService) {}

 ngOnChanges(changes: SimpleChanges): void {
 if (changes['transactions'] || changes['isOpen']) {
 this.syncSelection();
 if (this.showPaymentDetailModal && this.selectedTransaction) {
 this.selectedPaymentDetail = this.buildPaymentDetail(this.selectedTransaction);
 }
 this.cdr.markForCheck();
 }
 }

 get isRTL(): boolean {
 const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';
 return lang.startsWith('ar');
 }

 get statusSelectOptions(): SearchableSelectOption<string>[] {
 return this.statusOptions.map((option) => ({
 value: option.value,
 label: this.translate.instant(option.labelKey)
 }));
 }

 get filteredTransactions(): PayoutTransaction[] {
 const query = this.filters.reference.trim().toLowerCase();
 return this.transactions.filter((transaction) => {
 const matchesReference =!query
 || transaction.reference.toLowerCase().includes(query)
 || transaction.paymentNumber.toLowerCase().includes(query);
 const matchesStatus = this.filters.status === 'all' || transaction.status === this.filters.status;
 return matchesReference && matchesStatus;
 });
 }

 get stats(): { total: number; success: number; pending: number; failed: number } {
 return {
 total: this.transactions.length,
 success: this.transactions.filter((t) => t.status === 'success').length,
 pending: this.transactions.filter((t) => t.status === 'pending' || t.status === 'reviewing').length,
 failed: this.transactions.filter((t) => t.status === 'failed').length
 };
 }

 get resultsSummaryLabel(): string {
 const key = 'MODALS.PAYOUTS_REVIEW.SHOWING_COUNT';
 const translated = this.translate.instant(key, {
 shown: this.filteredTransactions.length,
 total: this.transactions.length
 });
 return translated === key
 ? `${this.filteredTransactions.length} / ${this.transactions.length}`
 : translated;
 }

 onClose(): void {
 this.close.emit();
 }

 selectTransaction(transaction: PayoutTransaction): void {
 this.selectedTransaction = transaction;
 this.cdr.markForCheck();
 }

 viewTransactionDetails(transaction: PayoutTransaction | null): void {
 if (!transaction) {
 return;
 }
 this.selectedTransaction = transaction;
 this.selectedPaymentDetail = this.buildPaymentDetail(transaction);
 this.showPaymentDetailModal = true;
 this.cdr.markForCheck();
 }

 onRetryPayment(): void {
 if (this.selectedTransaction) {
 this.retryPayment.emit(this.selectedTransaction.id);
 }
 }

 onSuspendPayment(): void {
 if (this.selectedTransaction) {
 this.suspendPayment.emit(this.selectedTransaction.id);
 }
 }

 onEscalatePayment(): void {
 if (this.selectedTransaction) {
 this.escalatePayment.emit(this.selectedTransaction.id);
 }
 }

 onDownloadReceipt(): void {
 if (!this.selectedTransaction) {
 return;
 }

 const tx = this.selectedTransaction;
 this.downloadReceipt.emit(tx.id);

 if (!this.vendorId) {
 this.toastService.error(this.translate.instant('COMMON.EXPORT_FAILED'));
 return;
 }

 this.vendorService.exportVendorPayoutReceipt(this.vendorId, tx.id).subscribe({
 next: (blob) => {
 this.exportService.downloadServerFile(
 blob,
 this.exportService.fileName(`payout-receipt-${tx.paymentNumber || tx.id}`, 'pdf')
 );
 this.toastService.success(this.translate.instant('COMMON.EXPORT_SUCCESS'));
 },
 error: () => {
 this.toastService.error(this.translate.instant('COMMON.EXPORT_FAILED'));
 }
 });
 }

 onViewActivityLog(): void {
 if (this.selectedTransaction) {
 this.viewActivityLog.emit(this.selectedTransaction.id);
 }
 }

 resetFilters(): void {
 this.filters = { reference: '', status: 'all' };
 this.syncSelection();
 this.cdr.markForCheck();
 }

 onFiltersChange(): void {
 this.syncSelection();
 this.cdr.markForCheck();
 }

 trackById(_: number, item: PayoutTransaction): string {
 return item.id;
 }

 formatCurrency(value: number): string {
 const formatted = new Intl.NumberFormat(this.isRTL ? 'ar-SA-u-nu-latn' : 'en-US', {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2
 }).format(value);
 return `${formatted} ${this.translate.instant('COMMON.CURRENCY_SAR')}`;
 }

 maskIban(value: string): string {
 const normalized = value.replace(/\s+/g, '');
 if (normalized.length <= 8) {
 return normalized;
 }
 return `•••• ${normalized.slice(-4)}`;
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
 if (bankCode === 'bank' && this.bankName) {
 return this.bankName;
 }

 const keys: Record<PayoutBankCode, string> = {
 alrajhi: 'MODALS.PAYOUTS_REVIEW.BANK_OPTIONS.ALRAJHI',
 alahli: 'MODALS.PAYOUTS_REVIEW.BANK_OPTIONS.ALAHLI',
 alinma: 'MODALS.PAYOUTS_REVIEW.BANK_OPTIONS.ALINMA',
 wallet: 'MODALS.PAYOUTS_REVIEW.BANK_OPTIONS.WALLET',
 bank: ''
 };

 const translated = keys[bankCode] ? this.translate.instant(keys[bankCode]) : '';
 return translated || this.bankName || '—';
 }

 formatBankDestination(transaction: PayoutTransaction): string {
 const bankLabel = this.getBankLabel(transaction.bankCode);
 return transaction.accountMask ? `${bankLabel} · ${transaction.accountMask}` : bankLabel;
 }

 private syncSelection(): void {
 const selectedId = this.selectedTransaction?.id ?? null;
 this.selectedTransaction = this.filteredTransactions.find((t) => t.id === selectedId)
 ?? this.filteredTransactions.find((t) => t.status === 'failed')
 ?? this.filteredTransactions[0]
 ?? null;
 }

 private buildPaymentDetail(transaction: PayoutTransaction): PaymentDetail {
 const createdAt = transaction.createdAtUtc ? new Date(transaction.createdAtUtc) : null;
 const processedAt = transaction.processedAtUtc ? new Date(transaction.processedAtUtc) : null;
 const createdLabel = createdAt ? `${transaction.date} - ${transaction.time}` : transaction.date;
 const processingLabel = transaction.status === 'pending' ? '-' : createdLabel;
 const completedLabel = processedAt
 ? processedAt.toLocaleString(this.isRTL ? 'ar-SA' : 'en-US', {
 timeZone: 'Asia/Riyadh'
 })
 : '-';

 const logs: PaymentDetail['logs'] = [];
 if (transaction.failureReason?.trim()) {
 logs.push({ type: 'error', message: transaction.failureReason.trim() });
 }

 return {
 transactionId: transaction.paymentNumber,
 bankReference: transaction.reference,
 operationType: this.translate.instant('MODALS.PAYMENT_DETAIL.PAYOUT_OPERATION'),
 operationDate: transaction.date,
 amount: transaction.amount,
 status: transaction.status,
 statusLabel: this.getStatusLabel(transaction.status),
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
 logs,
 failureReason: transaction.failureReason
 };
 }
}
