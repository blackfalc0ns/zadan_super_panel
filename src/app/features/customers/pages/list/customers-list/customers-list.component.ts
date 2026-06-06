import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomersService, CustomerFilters } from '@customers/services/customers.api.service';
import { DataTableComponent, TableColumn } from '../../../../../shared/components/ui/data-table/data-table.component';
import { KpiCardsComponent, KPICard } from '../../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPaginationComponent } from '../../../../../shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '../../../../../shared/components/ui/page-header/page-header.component';
import { AdvancedFilterPanelComponent, FilterField } from '../../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import { CustomerDetailRecord, CustomerSpendRange, CustomerStatus } from '../../../models/customers.models';

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
  page = 1;
  pageSize = 15;
  searchTerm = '';
  isFiltersExpanded = false;
  filters: CustomerFilters = {};

  customers: CustomerDetailRecord[] = [];

  // City options — will be derived from data
  cityOptions: Array<{ value: string; label: string }> = [];

  // Filter fields configuration (same pattern as vendors)
  filterFields: FilterField[] = [
    { key: 'status', label: 'CUSTOMERS.FILTERS.STATUS', type: 'select', color: '#10b981', options: [] },
    { key: 'city', label: 'CUSTOMERS.FILTERS.CITY', type: 'select', color: '#0ea5e9', options: [] },
    { key: 'hasOrders', label: 'CUSTOMERS.FILTERS.HAS_ORDERS', type: 'select', color: '#8b5cf6', options: [] },
    { key: 'isLocked', label: 'CUSTOMERS.FILTERS.ACCOUNT_LOCKED', type: 'select', color: '#ef4444', options: [] },
    { key: 'minSpent', label: 'CUSTOMERS.FILTERS.MIN_SPENT', type: 'select', color: '#f59e0b', options: [] },
    { key: 'maxSpent', label: 'CUSTOMERS.FILTERS.MAX_SPENT', type: 'select', color: '#6366f1', options: [] },
    { key: 'sortBy', label: 'CUSTOMERS.FILTERS.SORT_BY', type: 'select', color: '#64748b', options: [] }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'id', title: 'CUSTOMERS.TABLE.ID', width: '12%', align: 'left', type: 'custom' },
    { key: 'customer', title: 'CUSTOMERS.TABLE.CUSTOMER', width: '33%', align: 'left', type: 'custom' },
    { key: 'city', title: 'CUSTOMERS.TABLE.CITY', width: '11%', align: 'left', type: 'custom' },
    { key: 'lastOrder', title: 'CUSTOMERS.TABLE.LAST_ORDER', width: '20%', align: 'left', type: 'custom' },
    { key: 'status', title: 'CUSTOMERS.TABLE.STATUS', width: '12%', align: 'center', type: 'custom' },
    { key: 'value', title: 'CUSTOMERS.TABLE.VALUE', width: '8%', align: 'center', type: 'custom' }
  ];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    public readonly translate: TranslateService,
    private readonly customersService: CustomersService
  ) {
    this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
      this.initializeFilterOptions();
    });
  }

  ngOnInit(): void {
    this.initializeFilterOptions();
    const city = this.route.snapshot.queryParamMap.get('city');
    if (city) {
      this.filters = { ...this.filters, city };
      this.isFiltersExpanded = true;
      this.loadCustomers();
    }

    this.customersService.getCustomers().subscribe({
      next: (customers) => {
        this.cdr.markForCheck();
        this.customers = customers;
        this.updateCityOptions();
      },
      error: (error) => {
        this.cdr.markForCheck();
        console.error('Failed to load admin customers.', error);
        this.customers = [];
      }
    });
  }

  // ── Filter Options ──

  initializeFilterOptions(): void {
    this.filterFields.forEach((field) => {
      switch (field.key) {
        case 'status':
          field.options = [
            { value: 'Active', label: this.translate.instant('CUSTOMERS.STATUS.ACTIVE') },
            { value: 'Suspended', label: this.translate.instant('CUSTOMERS.STATUS.RESTRICTED') },
            { value: 'Banned', label: this.translate.instant('CUSTOMERS.STATUS.DORMANT') }
          ];
          break;
        case 'city':
          field.options = this.cityOptions;
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

  private updateCityOptions(): void {
    const cities = [...new Set(this.customers.map((c) => c.city).filter((c) => c && c !== '—'))];
    this.cityOptions = cities.map((city) => ({ value: city, label: city }));
    const cityField = this.filterFields.find((f) => f.key === 'city');
    if (cityField) {
      cityField.options = this.cityOptions;
    }
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

    this.customersService.loadWithFilters(this.searchTerm, backendFilters);
  }

  // ── Pagination ──

  get filteredCustomers(): CustomerDetailRecord[] {
    return this.customers;
  }

  get paginatedCustomers(): CustomerDetailRecord[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredCustomers.slice(start, start + this.pageSize);
  }

  get totalItems(): number {
    return this.filteredCustomers.length;
  }

  changePage(newPage: number): void {
    this.page = newPage;
  }

  openCustomerDetail(customer: CustomerDetailRecord): void {
    this.router.navigate(['/customers', customer.id]);
  }

  // ── KPI Cards ──

  get activeCustomersCount(): number {
    return this.customers.filter((customer) => customer.status === 'active').length;
  }

  get newCustomersCount(): number {
    return this.customers.filter((customer) => customer.segment === 'new').length;
  }

  get highRiskCount(): number {
    return this.customers.filter((customer) => customer.risk === 'high' || customer.risk === 'critical').length;
  }

  get complaintCustomersCount(): number {
    return this.customers.filter((customer) => customer.refundsCount > 0 || customer.disputesCount > 0).length;
  }

  get repeatRefundsCount(): number {
    return this.customers.filter((customer) => customer.refundsCount >= 3).length;
  }

  get activeCustomerRate(): number {
    if (this.customers.length === 0) {
      return 0;
    }

    return Math.round((this.activeCustomersCount / this.customers.length) * 100);
  }

  get complaintRate(): number {
    if (this.customers.length === 0) {
      return 0;
    }

    return Math.round((this.complaintCustomersCount / this.customers.length) * 100);
  }

  get kpiCards(): KPICard[] {
    return [
      {
        id: 'total',
        title: 'CUSTOMERS.KPI.TOTAL_CUSTOMERS',
        value: this.customers.length,
        icon: '<span class="material-symbols-outlined text-[20px]">group</span>',
        color: '#127c8c',
        trend: { value: '+12%', label: '+12%', isPositive: true }
      },
      {
        id: 'active',
        title: 'CUSTOMERS.KPI.ACTIVE_CUSTOMERS',
        value: this.activeCustomersCount,
        icon: '<span class="material-symbols-outlined text-[20px]">verified</span>',
        color: '#10b981',
        trend: { value: `${this.activeCustomerRate}%`, label: `${this.activeCustomerRate}%`, isPositive: true }
      },
      {
        id: 'new',
        title: 'CUSTOMERS.KPI.NEW_CUSTOMERS',
        value: this.newCustomersCount,
        icon: '<span class="material-symbols-outlined text-[20px]">person_add</span>',
        color: '#f59e0b',
        trend: { value: `+${this.newCustomersCount}`, label: `+${this.newCustomersCount}`, isPositive: true }
      },
      {
        id: 'high-risk',
        title: 'CUSTOMERS.KPI.HIGH_RISK',
        value: this.highRiskCount,
        icon: '<span class="material-symbols-outlined text-[20px]">error</span>',
        color: '#ef4444',
        trend: {
          value: this.translate.instant('CUSTOMERS.RISK_LEVEL.HIGH'),
          label: this.translate.instant('CUSTOMERS.RISK_LEVEL.HIGH'),
          isPositive: false
        }
      },
      {
        id: 'complaints',
        title: 'CUSTOMERS.KPI.COMPLAINT_CUSTOMERS',
        value: this.complaintCustomersCount,
        icon: '<span class="material-symbols-outlined text-[20px]">maps_ugc</span>',
        color: '#64748b',
        trend: {
          value: `-${Math.max(1, this.complaintRate)}%`,
          label: `-${Math.max(1, this.complaintRate)}%`,
          isPositive: false
        }
      },
      {
        id: 'refunds',
        title: 'CUSTOMERS.KPI.REPEAT_REFUNDS',
        value: this.repeatRefundsCount,
        icon: '<span class="material-symbols-outlined text-[20px]">history_edu</span>',
        color: '#f97316',
        trend: { value: `+${this.repeatRefundsCount}`, label: `+${this.repeatRefundsCount}`, isPositive: true }
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
