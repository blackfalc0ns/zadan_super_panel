import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomersService } from '../../../core/services/customers.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/ui/data-table/data-table.component';
import { KpiCardsComponent, KPICard } from '../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPaginationComponent } from '../../../shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../shared/components/ui/status-pill/status-pill.component';
import { CustomerDetailRecord, CustomerSpendRange, CustomerStatus } from '../customers.models';

@Component({
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
    StatusPillComponent
  ],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss'
})
export class CustomersListComponent implements OnInit {
  page = 1;
  pageSize = 15;
  searchTerm = '';
  cityFilter = 'all';
  statusFilter: 'all' | CustomerStatus = 'all';
  spendRangeFilter: CustomerSpendRange = 'all';

  customers: CustomerDetailRecord[] = [];

  readonly statusOptions: Array<{ value: 'all' | CustomerStatus; labelKey: string }> = [
    { value: 'all', labelKey: 'CUSTOMERS.FILTERS.ALL' },
    { value: 'active', labelKey: 'CUSTOMERS.STATUS.ACTIVE' },
    { value: 'low_activity', labelKey: 'CUSTOMERS.STATUS.LOW_ACTIVITY' },
    { value: 'restricted', labelKey: 'CUSTOMERS.STATUS.RESTRICTED' },
    { value: 'dormant', labelKey: 'CUSTOMERS.STATUS.DORMANT' }
  ];

  readonly spendingOptions: Array<{ value: CustomerSpendRange; labelKey: string }> = [
    { value: 'all', labelKey: 'CUSTOMERS.SPENDING.ALL' },
    { value: 'lt_1000', labelKey: 'CUSTOMERS.SPENDING.LT_1000' },
    { value: '1000_5000', labelKey: 'CUSTOMERS.SPENDING.BETWEEN_1000_5000' },
    { value: 'gt_5000', labelKey: 'CUSTOMERS.SPENDING.GT_5000' }
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
    public readonly translate: TranslateService,
    private readonly customersService: CustomersService
  ) {}

  ngOnInit(): void {
    this.customers = this.customersService.getCustomers();
  }

  get cityOptions(): string[] {
    return [...new Set(this.customers.map((customer) => customer.city))];
  }

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
    return Math.round((this.activeCustomersCount / this.customers.length) * 100);
  }

  get complaintRate(): number {
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

  get filteredCustomers(): CustomerDetailRecord[] {
    return this.customers.filter((customer) => {
      const search = this.searchTerm.trim().toLowerCase();
      const matchesSearch = !search || [
        customer.id,
        customer.name,
        customer.email,
        customer.phone,
        customer.city
      ].some((value) => value.toLowerCase().includes(search));

      const matchesCity = this.cityFilter === 'all' || customer.city === this.cityFilter;
      const matchesStatus = this.statusFilter === 'all' || customer.status === this.statusFilter;
      const matchesSpendRange = this.matchesSpendRange(customer.totalSpent);

      return matchesSearch && matchesCity && matchesStatus && matchesSpendRange;
    });
  }

  get paginatedCustomers(): CustomerDetailRecord[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredCustomers.slice(start, start + this.pageSize);
  }

  get totalFilteredItems(): number {
    return this.filteredCustomers.length;
  }

  get totalItems(): number {
    return this.totalFilteredItems;
  }

  get activeFilterCount(): number {
    return [
      this.cityFilter !== 'all',
      this.statusFilter !== 'all',
      this.spendRangeFilter !== 'all',
      this.searchTerm.trim().length > 0
    ].filter(Boolean).length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.cityFilter = 'all';
    this.statusFilter = 'all';
    this.spendRangeFilter = 'all';
    this.page = 1;
  }

  applyFilters(): void {
    this.page = 1;
  }

  changePage(newPage: number): void {
    this.page = newPage;
  }

  openCustomerDetail(customer: CustomerDetailRecord): void {
    this.router.navigate(['/customers', customer.id]);
  }

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

  matchesSpendRange(totalSpent: number): boolean {
    switch (this.spendRangeFilter) {
      case 'lt_1000':
        return totalSpent < 1000;
      case '1000_5000':
        return totalSpent >= 1000 && totalSpent <= 5000;
      case 'gt_5000':
        return totalSpent > 5000;
      default:
        return true;
    }
  }
}
