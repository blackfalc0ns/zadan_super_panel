import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomersService, CustomerFilterOptionItem, CustomerFilterOptions, CustomerFilters, CustomerStats } from '@customers/services/customers.api.service';
import { DataTableComponent, TableColumn } from '../../../../../shared/components/ui/data-table/data-table.component';
import { KpiCardsComponent, KPICard } from '../../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPaginationComponent } from '../../../../../shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '../../../../../shared/components/ui/page-header/page-header.component';
import { AdvancedFilterPanelComponent, FilterField } from '../../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import { CustomerDetailRecord, CustomerSpendRange, CustomerStatus } from '../../../models/customers.models';
import { ExportService } from '@shared/utils/export';
import { ToastService } from '@shared/services/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    DataTableComponent,
    KpiCardsComponent,
    AppPaginationComponent,
    AppPageHeaderComponent,
    AdvancedFilterPanelComponent,
    StatusPillComponent
  ],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss'
})
export class CustomersListComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  page = 1;
  pageSize = 15;
  searchTerm = '';
  isFiltersExpanded = false;
  isLoading = true;
  filters: CustomerFilters = {};
  serverTotalCount = 0;
  customerStats: CustomerStats | null = null;

  customers: CustomerDetailRecord[] = [];
  private filterOptionsRaw: CustomerFilterOptions | null = null;

  // Filter fields configuration (same pattern as vendors)
  filterFields: FilterField[] = [
    { key: 'status', label: 'CUSTOMERS.FILTERS.STATUS', type: 'select', color: '#10b981', options: [], placeholder: 'COMMON.ALL' },
    { key: 'city', label: 'CUSTOMERS.FILTERS.CITY', type: 'select', color: '#0ea5e9', options: [], localizeOptions: false, placeholder: 'COMMON.ALL' },
    { key: 'hasOrders', label: 'CUSTOMERS.FILTERS.HAS_ORDERS', type: 'select', color: '#8b5cf6', options: [], placeholder: 'COMMON.ALL' },
    { key: 'isLocked', label: 'CUSTOMERS.FILTERS.ACCOUNT_LOCKED', type: 'select', color: '#ef4444', options: [], placeholder: 'COMMON.ALL' },
    { key: 'minSpent', label: 'CUSTOMERS.FILTERS.MIN_SPENT', type: 'select', color: '#f59e0b', options: [], placeholder: 'COMMON.ALL' },
    { key: 'maxSpent', label: 'CUSTOMERS.FILTERS.MAX_SPENT', type: 'select', color: '#6366f1', options: [], placeholder: 'COMMON.ALL' },
    { key: 'sortBy', label: 'CUSTOMERS.FILTERS.SORT_BY', type: 'select', color: '#64748b', options: [], placeholder: 'COMMON.ALL' }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'id', title: 'CUSTOMERS.TABLE.ID', width: '12%', align: 'left', type: 'custom' },
    { key: 'customer', title: 'CUSTOMERS.TABLE.CUSTOMER', width: '33%', align: 'left', type: 'custom' },
    { key: 'city', title: 'CUSTOMERS.TABLE.CITY', width: '11%', align: 'left', type: 'custom' },
    { key: 'lastOrder', title: 'CUSTOMERS.TABLE.LAST_ORDER', width: '20%', align: 'left', type: 'custom' },
    { key: 'status', title: 'CUSTOMERS.TABLE.STATUS', width: '12%', align: 'center', type: 'custom' },
    { key: 'value', title: 'CUSTOMERS.TABLE.VALUE', width: '8%', align: 'center', type: 'custom' }
  ];

  private readonly exportService = inject(ExportService);
  private readonly toastService = inject(ToastService);

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    public readonly translate: TranslateService,
    private readonly customersService: CustomersService
  ) {
    this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
      this.applyFilterOptionLabels();
    });
  }

  ngOnInit(): void {
    this.customersService.customersLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isLoading) => {
        this.isLoading = isLoading;
        this.cdr.markForCheck();
      });

    this.loadFilterOptions();
    this.loadCustomerStats();
    const city = this.route.snapshot.queryParamMap.get('city');
    if (city) {
      this.filters = { ...this.filters, city };
      this.isFiltersExpanded = true;
    }

    this.customersService.customersTotal$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((total) => {
        this.serverTotalCount = total;
        this.cdr.markForCheck();
      });

    this.loadCustomers();

    this.customersService.getCustomers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((customers) => {
        this.cdr.markForCheck();
        this.customers = customers;
      });
  }

  private loadCustomerStats(): void {
    this.customersService.getStats().subscribe({
      next: (stats) => {
        this.customerStats = stats;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load customer stats.', error);
      }
    });
  }

  // ── Filter Options ──

  private loadFilterOptions(): void {
    this.customersService.getFilterOptions().subscribe({
      next: (options) => {
        this.cdr.markForCheck();
        this.filterOptionsRaw = options;
        this.applyFilterOptionLabels();
      },
      error: (error) => {
        console.error('Failed to load customer filter options.', error);
        this.initializeStaticFilterOptions();
      }
    });
  }

  private applyFilterOptionLabels(): void {
    if (this.filterOptionsRaw) {
      const statusField = this.filterFields.find((field) => field.key === 'status');
      const cityField = this.filterFields.find((field) => field.key === 'city');

      if (statusField) {
        statusField.options = this.mapFilterOptions(this.filterOptionsRaw.statuses);
      }

      if (cityField) {
        const lang = (this.translate.currentLang || this.translate.defaultLang || 'ar').toLowerCase();
        cityField.options = this.mapFilterOptions(this.filterOptionsRaw.cities)
          .sort((left, right) => left.label.localeCompare(right.label, lang.startsWith('ar') ? 'ar' : 'en'));
      }
    }

    this.initializeStaticFilterOptions();
  }

  private mapFilterOptions(items: CustomerFilterOptionItem[]) {
    return items.map((item) => ({
      value: item.value,
      label: this.resolveFilterLabel(item)
    }));
  }

  private resolveFilterLabel(item: CustomerFilterOptionItem): string {
    const lang = (this.translate.currentLang || this.translate.defaultLang || 'ar').toLowerCase();
    return lang.startsWith('ar') ? item.labelAr : item.labelEn;
  }

  initializeStaticFilterOptions(): void {
    this.filterFields.forEach((field) => {
      switch (field.key) {
        case 'status':
          if (!field.options?.length) {
            field.options = [
              { value: 'Active', label: this.translate.instant('CUSTOMERS.STATUS.ACTIVE') },
              { value: 'Suspended', label: this.translate.instant('CUSTOMERS.STATUS.RESTRICTED') },
              { value: 'Banned', label: this.translate.instant('CUSTOMERS.STATUS.DORMANT') }
            ];
          }
          break;
        case 'city':
          break;
        case 'hasOrders':
          field.options = [
            { value: 'true', label: this.translate.instant('CUSTOMERS.FILTERS.WITH_ORDERS') },
            { value: 'false', label: this.translate.instant('CUSTOMERS.FILTERS.NO_ORDERS') }
          ];
          break;
        case 'isLocked':
          field.options = [
            { value: 'true', label: this.translate.instant('CUSTOMERS.FILTERS.LOCKED') },
            { value: 'false', label: this.translate.instant('CUSTOMERS.FILTERS.UNLOCKED') }
          ];
          break;
        case 'minSpent':
          field.options = [
            { value: '0', label: '0+' },
            { value: '500', label: '500+' },
            { value: '1000', label: '1,000+' },
            { value: '5000', label: '5,000+' },
            { value: '10000', label: '10,000+' },
            { value: '20000', label: '20,000+' }
          ];
          break;
        case 'maxSpent':
          field.options = [
            { value: '1000', label: this.translate.instant('CUSTOMERS.FILTERS.UPTO') + ' 1,000' },
            { value: '5000', label: this.translate.instant('CUSTOMERS.FILTERS.UPTO') + ' 5,000' },
            { value: '10000', label: this.translate.instant('CUSTOMERS.FILTERS.UPTO') + ' 10,000' },
            { value: '50000', label: this.translate.instant('CUSTOMERS.FILTERS.UPTO') + ' 50,000' }
          ];
          break;
        case 'sortBy':
          field.options = [
            { value: 'created', label: this.translate.instant('CUSTOMERS.FILTERS.SORT_OLDEST') },
            { value: 'name', label: this.translate.instant('CUSTOMERS.FILTERS.SORT_NAME_ASC') },
            { value: 'name_desc', label: this.translate.instant('CUSTOMERS.FILTERS.SORT_NAME_DESC') },
            { value: 'last_login', label: this.translate.instant('CUSTOMERS.FILTERS.SORT_LAST_LOGIN') }
          ];
          break;
      }
    });
  }

  resolveCityLabel(customer: CustomerDetailRecord): string {
    const lang = (this.translate.currentLang || this.translate.defaultLang || 'ar').toLowerCase();
    const primary = lang.startsWith('ar') ? customer.cityAr : customer.cityEn;
    const fallback = lang.startsWith('ar') ? customer.cityEn : customer.cityAr;
    return (primary || fallback || customer.city || '—').trim();
  }

  // ── Filter Handlers (same pattern as vendors) ──

  get hasActiveFilters(): boolean {
    return Object.keys(this.filters).some((key) => {
      const value = this.filters[key];
      return value !== undefined && value !== null && value !== '';
    });
  }

  get activeFilterCount(): number {
    return Object.keys(this.filters).filter((key) => {
      const value = this.filters[key];
      return value !== undefined && value !== null && value !== '';
    }).length + (this.searchTerm.trim().length > 0 ? 1 : 0);
  }

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  onSearch(): void {
    this.page = 1;
    this.loadCustomers();
  }

  onExport(): void {
    if (!this.filteredCustomers.length) {
      this.toastService.warning(this.translate.instant('COMMON.EXPORT_EMPTY'));
      return;
    }

    this.customersService.exportCustomers(this.searchTerm, this.filters).subscribe({
      next: (blob) => {
        this.exportService.downloadServerFile(blob, this.exportService.fileName('customers', 'xlsx'));
        this.toastService.success(this.translate.instant('COMMON.EXPORT_SUCCESS'));
      },
      error: () => {
        this.toastService.error(this.translate.instant('COMMON.EXPORT_FAILED'));
      }
    });
  }

  onFiltersChange(newFilters: CustomerFilters): void {
    this.filters = { ...this.filters, ...newFilters };
    this.page = 1;
    this.loadCustomers();
  }

  onFilterReset(): void {
    this.filters = {};
    this.searchTerm = '';
    this.page = 1;
    this.loadCustomers();
  }

  onFilterSave(filters: CustomerFilters): void {
    // placeholder for saved filter presets
  }

  resetFilters(): void {
    this.filters = {};
    this.searchTerm = '';
    this.page = 1;
    this.loadCustomers();
  }

  private loadCustomers(): void {
    // Build the filters to send to backend
    const backendFilters: CustomerFilters = {};

    if (this.filters['status']) backendFilters.status = String(this.filters['status']);
    if (this.filters['city']) backendFilters.city = String(this.filters['city']);
    if (this.filters['isLocked'] != null) backendFilters.isLocked = String(this.filters['isLocked']) === 'true';
    if (this.filters['hasOrders'] != null) backendFilters.hasOrders = String(this.filters['hasOrders']) === 'true';
    if (this.filters['minSpent'] != null) backendFilters.minSpent = Number(this.filters['minSpent']);
    if (this.filters['maxSpent'] != null) backendFilters.maxSpent = Number(this.filters['maxSpent']);
    if (this.filters['sortBy']) backendFilters.sortBy = String(this.filters['sortBy']);

    this.customersService.loadWithFilters(this.searchTerm, backendFilters, this.page, this.pageSize);
  }

  // ── Pagination ──

  get filteredCustomers(): CustomerDetailRecord[] {
    return this.customers;
  }

  get paginatedCustomers(): CustomerDetailRecord[] {
    return this.filteredCustomers;
  }

  get totalItems(): number {
    return this.serverTotalCount;
  }

  changePage(newPage: number): void {
    this.page = newPage;
    this.loadCustomers();
  }

  openCustomerDetail(customer: CustomerDetailRecord): void {
    this.router.navigate(['/customers', customer.id]);
  }

  // ── KPI Cards ──

  private get activeCustomersCount(): number {
    return this.customers.filter((customer) => customer.status === 'active').length;
  }

  private get newCustomersCount(): number {
    return this.customers.filter((customer) => customer.segment === 'new').length;
  }

  private get highRiskCount(): number {
    return this.customers.filter((customer) => customer.risk === 'high' || customer.risk === 'critical').length;
  }

  private get complaintCustomersCount(): number {
    return this.customers.filter((customer) => customer.refundsCount > 0).length;
  }

  private get repeatRefundsCount(): number {
    return this.customers.filter((customer) => customer.refundsCount >= 3).length;
  }

  get kpiCards(): KPICard[] {
    const stats = this.customerStats;

    return [
      {
        id: 'total',
        title: 'CUSTOMERS.KPI.TOTAL_CUSTOMERS',
        value: stats?.totalCustomers ?? this.serverTotalCount,
        icon: '<span class="material-symbols-outlined text-[20px]">group</span>',
        color: '#127c8c'
      },
      {
        id: 'active',
        title: 'CUSTOMERS.KPI.ACTIVE_CUSTOMERS',
        value: stats?.activeCustomers ?? this.activeCustomersCount,
        icon: '<span class="material-symbols-outlined text-[20px]">verified</span>',
        color: '#10b981'
      },
      {
        id: 'new',
        title: 'CUSTOMERS.KPI.NEW_CUSTOMERS',
        value: stats?.newCustomers ?? this.newCustomersCount,
        icon: '<span class="material-symbols-outlined text-[20px]">person_add</span>',
        color: '#f59e0b'
      },
      {
        id: 'high-risk',
        title: 'CUSTOMERS.KPI.HIGH_RISK',
        value: stats?.highRiskCustomers ?? this.highRiskCount,
        icon: '<span class="material-symbols-outlined text-[20px]">error</span>',
        color: '#ef4444'
      },
      {
        id: 'complaints',
        title: 'CUSTOMERS.KPI.COMPLAINT_CUSTOMERS',
        value: stats?.complaintCustomers ?? this.complaintCustomersCount,
        icon: '<span class="material-symbols-outlined text-[20px]">maps_ugc</span>',
        color: '#64748b'
      },
      {
        id: 'refunds',
        title: 'CUSTOMERS.KPI.REPEAT_REFUNDS',
        value: stats?.repeatRefundCustomers ?? this.repeatRefundsCount,
        icon: '<span class="material-symbols-outlined text-[20px]">history_edu</span>',
        color: '#f97316'
      }
    ];
  }

  // ── RTL ──

  get isRTL(): boolean {
    return this.translate.currentLang === 'ar';
  }

  // ── Table Helpers ──

  getCustomerInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  getStatusLabel(status: CustomerStatus): string {
    return `CUSTOMERS.STATUS.${status.toUpperCase()}`;
  }

  getStatusVariant(status: CustomerStatus): StatusPillVariant {
    const map: Record<CustomerStatus, StatusPillVariant> = {
      active: 'success',
      low_activity: 'warning',
      restricted: 'paused',
      dormant: 'neutral'
    };

    return map[status];
  }

  getCustomerValueClasses(customer: CustomerDetailRecord): string {
    if (customer.totalSpent >= 20000) {
      return 'text-secondary';
    }

    return 'text-zadna-primary';
  }

  getAttentionIcon(customer: CustomerDetailRecord): string | null {
    if (customer.accountState === 'suspended') {
      return 'block';
    }

    if (customer.reviewState === 'escalated') {
      return 'gpp_bad';
    }

    if (customer.reviewState === 'flagged') {
      return 'flag';
    }

    if (customer.disputesCount >= 2 || customer.risk === 'critical') {
      return 'report';
    }

    if (customer.refundsCount >= 3) {
      return 'assignment_return';
    }

    return null;
  }

  getPresenceLabel(customer: CustomerDetailRecord): string {
    return customer.isOnlineNow
      ? this.translate.instant('CUSTOMERS.PRESENCE.ONLINE_NOW')
      : `${this.translate.instant('CUSTOMERS.DETAIL.PROFILE_FIELDS.LAST_SEEN')}: ${customer.lastSeenAt}`;
  }

  getPresenceClasses(customer: CustomerDetailRecord): string {
    return customer.isOnlineNow
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-slate-100 text-slate-500';
  }

  getPresenceDotClasses(customer: CustomerDetailRecord): string {
    return customer.isOnlineNow ? 'bg-emerald-500' : 'bg-slate-300';
  }
}
