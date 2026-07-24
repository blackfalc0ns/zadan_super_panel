import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject, take } from 'rxjs';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { ExportService } from '../../../../shared/utils/export';
import { FinanceService } from '../../../finances/services/finance.service';
import {
  DriverDetailRecord,
  DriverFinanceEntry,
  DriverFinanceSettlementSummary,
  DriverFinanceWithdrawalSummary
} from '../../models/drivers.models';
import { DriverService } from '../../services/drivers.api.service';
import { getFinanceStatusVariant, getFinanceStatusKey } from '../../utils/driver-ui.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-driver-finance-tab',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    AppPaginationComponent
  ],
  templateUrl: './driver-finance-tab.component.html'
})
export class DriverFinanceTabComponent implements OnInit, OnChanges {
  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() isRTL = true;
  @Output() financeUpdated = new EventEmitter<void>();

  private readonly driversApi = inject(DriverService);
  private readonly financeService = inject(FinanceService);
  private readonly toastService = inject(ToastService);
  private readonly exportService = inject(ExportService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges$ = new Subject<string>();

  activeFilter = 'ALL';
  searchQuery = '';
  expandedRowId: string | null = null;

  ledgerEntries: DriverFinanceEntry[] = [];
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  isLedgerLoading = false;

  showSettleModal = false;
  settleAmount = 0;
  settleReference = '';
  settleNotes = '';
  isSettling = false;
  settleSuccess = false;
  settleError = false;

  ngOnInit(): void {
    this.searchChanges$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadLedgerEntries();
      });

    this.loadLedgerEntries();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['driver'] && !changes['driver'].firstChange) {
      this.currentPage = 1;
      this.loadLedgerEntries();
    }
  }

  get codOwedBalance(): number {
    return this.driver?.finance?.codOwedBalance ?? this.driver?.finance?.dueAmount ?? 0;
  }

  get codBlockThreshold(): number {
    return this.driver?.finance?.codBlockThresholdAmount ?? 0;
  }

  get codLimitProgress(): number {
    if (this.codBlockThreshold <= 0) {
      return 0;
    }
    return Math.min(100, (this.codOwedBalance / this.codBlockThreshold) * 100);
  }

  get isCodLimitExceeded(): boolean {
    return this.codBlockThreshold > 0 && this.codOwedBalance >= this.codBlockThreshold;
  }

  get recentSettlements(): DriverFinanceSettlementSummary[] {
    return this.driver?.finance?.recentSettlements ?? [];
  }

  get recentWithdrawals(): DriverFinanceWithdrawalSummary[] {
    return this.driver?.finance?.recentWithdrawals ?? [];
  }

  getFinanceStatusVariant(status: string) {
    return getFinanceStatusVariant(status as any);
  }

  getFinanceStatusKey(status: string) {
    return getFinanceStatusKey(status as any);
  }

  getSettlementStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
    switch ((status || '').toLowerCase()) {
      case 'paid':
      case 'settled':
      case 'completed':
      case 'processed':
        return 'success';
      case 'processing':
      case 'approved':
      case 'pending':
      case 'draft':
        return 'warning';
      case 'failed':
      case 'cancelled':
      case 'canceled':
      case 'rejected':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  getWithdrawalStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
    switch ((status || '').toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'success';
      case 'pending':
      case 'processing':
      case 'approved':
        return 'warning';
      case 'returned':
      case 'rejected':
      case 'cancelled':
      case 'canceled':
      case 'failed':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.expandedRowId = null;
    this.currentPage = 1;
    this.loadLedgerEntries();
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
    this.expandedRowId = null;
    this.searchChanges$.next(value);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.expandedRowId = null;
    this.loadLedgerEntries();
  }

  toggleRow(rowId: string) {
    this.expandedRowId = this.expandedRowId === rowId ? null : rowId;
  }

  getTransactionIcon(type: string): string {
    const typeUpper = type?.toUpperCase() || '';
    if (typeUpper.includes('TRANSFER') || typeUpper.includes('PAYOUT')) {
      return 'account_balance';
    }
    if (typeUpper.includes('CASH') || typeUpper.includes('COLLECTED') || typeUpper.includes('COD')) {
      return 'payments';
    }
    if (typeUpper.includes('DEBIT') || typeUpper.includes('DEDUCTION') || typeUpper.includes('HOLD')) {
      return 'vertical_align_bottom';
    }
    if (typeUpper.includes('REFUND') || typeUpper.includes('CREDIT') || typeUpper.includes('RELEASE') || typeUpper.includes('ADJUSTMENT')) {
      return 'vertical_align_top';
    }
    return 'receipt_long';
  }

  getTransactionColorClass(type: string): string {
    const typeUpper = type?.toUpperCase() || '';
    if (typeUpper.includes('TRANSFER') || typeUpper.includes('PAYOUT')) {
      return 'bg-purple-50 text-purple-600 border-purple-100/80 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30';
    }
    if (typeUpper.includes('CASH') || typeUpper.includes('COLLECTED') || typeUpper.includes('COD')) {
      return 'bg-emerald-50 text-emerald-600 border-emerald-100/80 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    }
    if (typeUpper.includes('DEBIT') || typeUpper.includes('DEDUCTION') || typeUpper.includes('HOLD')) {
      return 'bg-rose-50 text-rose-600 border-rose-100/80 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
    }
    return 'bg-blue-50 text-blue-600 border-blue-100/80 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
  }

  getTransactionTypeLabel(type: string): string {
    if (type?.startsWith('DRIVERS.DETAIL.FINANCE.')) {
      return type;
    }
    const typeUpper = type?.toUpperCase() || '';
    return `DRIVERS.DETAIL.FINANCE.BACKEND.TYPES.${typeUpper}`;
  }

  getMethodLabel(method: string): string {
    if (method?.startsWith('DRIVERS.DETAIL.FINANCE.') || method?.startsWith('COMMON.')) {
      return method;
    }
    const methodUpper = method?.toUpperCase() || '';
    return `DRIVERS.DETAIL.FINANCE.BACKEND.METHODS.${methodUpper}`;
  }

  isTranslationKey(value: string | undefined | null): boolean {
    return !!value && (value.startsWith('DRIVERS.') || value.startsWith('COMMON.') || value.startsWith('FINANCES.') || value.startsWith('VENDOR_FINANCE.'));
  }

  downloadReceipt(entry: DriverFinanceEntry): void {
    this.driversApi.exportFinanceEntryReceipt(this.driver.id, entry.id).subscribe({
      next: (blob) => {
        this.exportService.downloadServerFile(
          blob,
          this.exportService.fileName(`driver-receipt-${entry.reference || entry.id}`, 'pdf')
        );
        this.toastService.success(this.translate.instant('COMMON.EXPORT_SUCCESS'));
      },
      error: () => {
        this.toastService.error(this.translate.instant('COMMON.EXPORT_FAILED'));
      }
    });
  }

  downloadStatement(): void {
    if (!this.ledgerEntries.length) {
      this.toastService.warning(this.translate.instant('COMMON.EXPORT_EMPTY'));
      return;
    }

    this.driversApi.exportFinanceStatement(
      this.driver.id,
      this.activeFilter,
      this.searchQuery
    ).subscribe({
      next: (blob) => {
        this.exportService.downloadServerFile(
          blob,
          this.exportService.fileName(`driver-statement-${this.driver.id}`, 'pdf')
        );
        this.toastService.success(this.translate.instant('COMMON.EXPORT_SUCCESS'));
      },
      error: () => {
        this.toastService.error(this.translate.instant('COMMON.EXPORT_FAILED'));
      }
    });
  }

  openFinancialSettlements(): void {
    void this.router.navigate(['/finances/settlements'], {
      queryParams: { entityType: 'driver', entityId: this.driver.id }
    });
  }

  openWithdrawalsQueue(): void {
    void this.router.navigate(['/finances/withdrawals'], {
      queryParams: { driverId: this.driver.id }
    });
  }

  openSettlementDetail(settlementId: string): void {
    void this.router.navigate(['/finances/settlements'], {
      queryParams: { entityType: 'driver', entityId: this.driver.id, focus: settlementId }
    });
  }

  openSettleModal() {
    this.settleAmount = this.codOwedBalance;
    this.settleNotes = '';
    this.settleReference = '';
    this.showSettleModal = true;
    this.settleSuccess = false;
    this.settleError = false;
    this.isSettling = false;
  }

  closeSettleModal() {
    this.showSettleModal = false;
  }

  submitSettlement() {
    if (this.settleAmount <= 0 || !this.driver?.id) {
      return;
    }

    this.isSettling = true;
    this.settleError = false;
    this.cdr.markForCheck();

    const reference = this.settleReference?.trim()
      || this.settleNotes?.trim()
      || undefined;

    this.financeService.createCodRemittance({
      driverId: this.driver.id,
      amount: this.settleAmount,
      reference,
      idempotencyKey: `driver-finance-tab:${this.driver.id}:${Date.now()}`
    }).pipe(take(1)).subscribe({
      next: () => {
        this.isSettling = false;
        this.settleSuccess = true;
        this.currentPage = 1;
        this.loadLedgerEntries();
        this.financeUpdated.emit();
        this.toastService.success(
          this.translate.instant('FINANCES.COD.TOAST.SUCCESS_MESSAGE', { driver: this.driver.displayName ?? this.driver.id }),
          this.translate.instant('FINANCES.COD.TOAST.SUCCESS_TITLE')
        );
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSettling = false;
        this.settleError = true;
        this.toastService.error(
          this.translate.instant('FINANCES.COD.TOAST.ERROR_MESSAGE'),
          this.translate.instant('FINANCES.COD.TOAST.ERROR_TITLE')
        );
        this.cdr.markForCheck();
      }
    });
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  private loadLedgerEntries(): void {
    if (!this.driver?.id) {
      return;
    }

    this.isLedgerLoading = true;
    this.cdr.markForCheck();

    this.driversApi
      .getDriverFinanceEntries(
        this.driver.id,
        this.currentPage,
        this.pageSize,
        this.activeFilter,
        this.searchQuery
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.ledgerEntries = response.items;
          this.totalItems = response.totalCount;
          this.currentPage = response.pageNumber;
          this.pageSize = response.pageSize;
          this.isLedgerLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.ledgerEntries = [];
          this.totalItems = 0;
          this.isLedgerLoading = false;
          this.cdr.markForCheck();
        }
      });
  }
}
