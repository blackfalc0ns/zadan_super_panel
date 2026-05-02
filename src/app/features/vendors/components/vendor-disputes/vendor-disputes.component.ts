import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { AppInputComponent } from '../../../../shared/components/ui/form-controls/input/input.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { SupportCaseRow } from '@disputes/models/disputes.models';
import { DisputesService } from '@disputes/services/disputes.api.service';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

interface KPI {
  id: string;
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
  icon: string;
}

interface DisputeRowViewModel {
  id: string;
  caseNumber: string;
  orderNumber: string;
  type: string;
  typeLabel: string;
  status: string;
  statusLabelKey: string;
  priority: string;
  priorityLabelKey: string;
  queue: string;
  queueLabel: string;
  createdDate: string;
  createdTime: string;
  sla: string;
}

@Component({
  selector: 'app-vendor-disputes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppInputComponent,
    SearchableSelectComponent,
    AppPaginationComponent,
    StatusPillComponent
  ],
  templateUrl: './vendor-disputes.component.html'
})
export class VendorDisputesComponent {
  vendorId = '';
  currentLang = 'ar';
  isRTL = true;
  searchQuery = '';
  selectedStatus = '';
  selectedPriority = '';
  isLoading = false;
  hasError = false;
  currentPage = 1;
  readonly pageSize = 12;
  totalItems = 0;
  disputesData: SupportCaseRow[] = [];
  kpis: KPI[] = [];

  readonly statusOptions: SearchableSelectOption<string>[] = this.buildStatusOptions();
  readonly priorityOptions: SearchableSelectOption<string>[] = this.buildPriorityOptions();

  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly disputesService: DisputesService,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';
    this.rebuildFilters();

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
        this.rebuildFilters();
        this.rebuildViewModel();
      });

    this.searchSubject
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadDisputes();
      });

    this.vendorDetailFacade.vendorId$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendorId) => {
        if (!vendorId) {
          return;
        }

        this.vendorId = vendorId;
        this.currentPage = 1;
        this.loadDisputes();
      });
  }

  get rows(): DisputeRowViewModel[] {
    return this.disputesData.map((item) => this.mapDispute(item));
  }

  get hasDisputes(): boolean {
    return this.rows.length > 0;
  }

  get hasActiveFilters(): boolean {
    return !!this.searchQuery.trim() || !!this.selectedStatus || !!this.selectedPriority;
  }

  get activeFilterCount(): number {
    let count = 0;

    if (this.searchQuery.trim()) {
      count += 1;
    }

    if (this.selectedStatus) {
      count += 1;
    }

    if (this.selectedPriority) {
      count += 1;
    }

    return count;
  }

  get showingCountLabel(): string {
    return `${this.formatNumber(this.rows.length)} / ${this.formatNumber(this.totalItems)}`;
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadDisputes();
  }

  onPriorityChange(): void {
    this.currentPage = 1;
    this.loadDisputes();
  }

  clearFilters(): void {
    if (!this.hasActiveFilters) {
      return;
    }

    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.currentPage = 1;
    this.loadDisputes();
  }

  onPageChange(page: number): void {
    if (page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.loadDisputes();
  }

  onViewDispute(disputeId: string): void {
    this.router.navigate(['/disputes'], {
      queryParams: { focus: disputeId }
    });
  }

  getStatusVariant(status: string): StatusPillVariant {
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'in_review':
      case 'review':
        return 'processing';
      default:
        return 'warning';
    }
  }

  getPriorityVariant(priority: string): StatusPillVariant {
    switch (priority.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'danger';
      case 'medium':
        return 'processing';
      default:
        return 'neutral';
    }
  }

  private loadDisputes(): void {
    if (!this.vendorId) {
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    this.disputesService.getDisputes(
      this.currentPage,
      this.pageSize,
      this.searchQuery,
      this.selectedStatus,
      this.selectedPriority,
      undefined,
      undefined,
      undefined,
      this.vendorId
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.disputesData = response.items ?? [];
          this.totalItems = response.totalCount ?? this.disputesData.length;
          this.rebuildViewModel();
          this.isLoading = false;
        },
        error: () => {
          this.disputesData = [];
          this.totalItems = 0;
          this.kpis = [];
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }

  private rebuildViewModel(): void {
    const total = this.disputesData.length;
    const open = this.disputesData.filter((item) => !['resolved', 'rejected'].includes(item.caseStatus.toLowerCase())).length;
    const resolved = this.disputesData.filter((item) => item.caseStatus.toLowerCase() === 'resolved').length;
    const rejected = this.disputesData.filter((item) => item.caseStatus.toLowerCase() === 'rejected').length;

    this.kpis = [
      {
        id: 'total',
        label: this.translate.instant('VENDOR_DISPUTES.KPI.TOTAL'),
        value: this.formatNumber(total),
        tone: 'primary',
        icon: 'gavel'
      },
      {
        id: 'open',
        label: this.translate.instant('VENDOR_DISPUTES.KPI.OPEN'),
        value: this.formatNumber(open),
        tone: 'warning',
        icon: 'pending_actions'
      },
      {
        id: 'resolved',
        label: this.translate.instant('VENDOR_DISPUTES.KPI.RESOLVED'),
        value: this.formatNumber(resolved),
        tone: 'success',
        icon: 'task_alt'
      },
      {
        id: 'rejected',
        label: this.translate.instant('VENDOR_DISPUTES.KPI.REJECTED'),
        value: this.formatNumber(rejected),
        tone: 'danger',
        icon: 'gpp_bad'
      }
    ];
  }

  private mapDispute(item: SupportCaseRow): DisputeRowViewModel {
    const createdAt = new Date(item.createdAt);

    return {
      id: item.id,
      caseNumber: this.formatCaseIdentifier(item.id),
      orderNumber: item.orderDisplayId || this.formatCaseIdentifier(item.orderId),
      type: item.type,
      typeLabel: this.translate.instant(this.getTypeLabelKey(item.type)),
      status: item.caseStatus || item.status,
      statusLabelKey: this.getStatusLabelKey(item.caseStatus || item.status),
      priority: item.priority,
      priorityLabelKey: this.getPriorityLabelKey(item.priority),
      queue: item.queue,
      queueLabel: this.humanizeLabel(item.queue),
      createdDate: createdAt.toLocaleDateString(this.currentLang === 'ar' ? 'ar-EG' : 'en-US'),
      createdTime: createdAt.toLocaleTimeString(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      sla: item.sla || this.translate.instant('VENDOR_DISPUTES.TABLE.NO_SLA')
    };
  }

  private getTypeLabelKey(type: string): string {
    switch (type.toLowerCase()) {
      case 'complaint':
        return 'VENDOR_DISPUTES.TYPE.COMPLAINT';
      case 'return_request':
      case 'returnrequest':
        return 'VENDOR_DISPUTES.TYPE.RETURN_REQUEST';
      case 'driver_report':
      case 'driverreport':
        return 'VENDOR_DISPUTES.TYPE.DRIVER_REPORT';
      case 'driver_dispute':
      case 'driverdispute':
        return 'VENDOR_DISPUTES.TYPE.DRIVER_DISPUTE';
      default:
        return 'VENDOR_DISPUTES.TYPE.OTHER';
    }
  }

  private getStatusLabelKey(status: string): string {
    switch (status.toLowerCase()) {
      case 'submitted':
      case 'open':
        return 'VENDOR_DISPUTES.STATUS.OPEN';
      case 'in_review':
      case 'review':
        return 'VENDOR_DISPUTES.STATUS.IN_REVIEW';
      case 'awaiting_customer_evidence':
      case 'merchant':
        return 'VENDOR_DISPUTES.STATUS.AWAITING_EVIDENCE';
      case 'approved':
        return 'VENDOR_DISPUTES.STATUS.APPROVED';
      case 'rejected':
        return 'VENDOR_DISPUTES.STATUS.REJECTED';
      case 'resolved':
        return 'VENDOR_DISPUTES.STATUS.RESOLVED';
      default:
        return 'VENDOR_DISPUTES.STATUS.OPEN';
    }
  }

  private getPriorityLabelKey(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'VENDOR_DISPUTES.PRIORITY.CRITICAL';
      case 'high':
        return 'VENDOR_DISPUTES.PRIORITY.HIGH';
      case 'medium':
        return 'VENDOR_DISPUTES.PRIORITY.MEDIUM';
      default:
        return 'VENDOR_DISPUTES.PRIORITY.LOW';
    }
  }

  private rebuildFilters(): void {
    this.statusOptions.splice(0, this.statusOptions.length, ...this.buildStatusOptions());
    this.priorityOptions.splice(0, this.priorityOptions.length, ...this.buildPriorityOptions());
  }

  private buildStatusOptions(): SearchableSelectOption<string>[] {
    return [
      { value: '', labelKey: 'VENDOR_DISPUTES.FILTERS.ALL_STATUSES' },
      { value: 'submitted', labelKey: 'VENDOR_DISPUTES.STATUS.OPEN' },
      { value: 'in_review', labelKey: 'VENDOR_DISPUTES.STATUS.IN_REVIEW' },
      { value: 'awaiting_customer_evidence', labelKey: 'VENDOR_DISPUTES.STATUS.AWAITING_EVIDENCE' },
      { value: 'resolved', labelKey: 'VENDOR_DISPUTES.STATUS.RESOLVED' },
      { value: 'rejected', labelKey: 'VENDOR_DISPUTES.STATUS.REJECTED' }
    ];
  }

  private buildPriorityOptions(): SearchableSelectOption<string>[] {
    return [
      { value: '', labelKey: 'VENDOR_DISPUTES.FILTERS.ALL_PRIORITIES' },
      { value: 'critical', labelKey: 'VENDOR_DISPUTES.PRIORITY.CRITICAL' },
      { value: 'high', labelKey: 'VENDOR_DISPUTES.PRIORITY.HIGH' },
      { value: 'medium', labelKey: 'VENDOR_DISPUTES.PRIORITY.MEDIUM' },
      { value: 'low', labelKey: 'VENDOR_DISPUTES.PRIORITY.LOW' }
    ];
  }

  private formatCaseIdentifier(value: string): string {
    return value.slice(0, 8).toUpperCase();
  }

  private humanizeLabel(value: string): string {
    if (!value?.trim()) {
      return this.translate.instant('VENDOR_DISPUTES.TABLE.UNASSIGNED_QUEUE');
    }

    return value
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }
}
