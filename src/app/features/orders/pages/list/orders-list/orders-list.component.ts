import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';
import { AppPaginationComponent } from '../../../../../shared/components/ui/pagination/pagination.component';
import { DataTableComponent, TableAction, TableColumn } from '../../../../../shared/components/ui/data-table/data-table.component';
import { AppPageHeaderComponent } from '../../../../../shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import { AdvancedFilterPanelComponent, FilterField } from '../../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { OrdersService } from '@orders/services/orders.api.service';
import {
  OrderFulfillmentStatus,
  OrderListItem,
  OrderPaymentStatus,
  OrderQueueView,
  OrderResolutionState,
  OrderStatus,
  OrderWorkflowStage,
  OrdersSummary,
  OrderFilterOptions,
  FilterOptionItem
} from '../../../models/orders.models';
import {
  getFulfillmentStatusKey,
  getOrderStatusKey,
  getPaymentStatusKey,
  getResolutionStateKey,
  getWorkflowStageKey
} from '../../../data/orders.mock';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule,
    AppPaginationComponent,
    DataTableComponent,
    AppPageHeaderComponent,
    StatusPillComponent,
    AdvancedFilterPanelComponent
  ],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private filterOptionsRaw: OrderFilterOptions | null = null;
  private langChangeSub?: { unsubscribe(): void };
  readonly tableColumns: TableColumn[] = [
    { key: 'reference', title: 'ORDERS.TABLE.ID', width: '13%', align: 'left', type: 'custom' },
    { key: 'customer', title: 'ORDERS.TABLE.CUSTOMER', width: '15%', align: 'left', type: 'custom' },
    { key: 'statuses', title: 'ORDERS.TABLE.STATUSES', width: '26%', align: 'left', type: 'custom' },
    { key: 'workflow', title: 'ORDERS.TABLE.WORKFLOW', width: '18%', align: 'left', type: 'custom' },
    { key: 'updated', title: 'ORDERS.TABLE.UPDATED', width: '12%', align: 'left', type: 'custom' },
    { key: 'total', title: 'ORDERS.TABLE.TOTAL', width: '10%', align: 'center', type: 'custom' },
    { key: 'actions', title: 'ORDERS.TABLE.ACTIONS', width: '6%', align: 'center', type: 'actions' }
  ];

  readonly tableActions: TableAction[] = [
    { id: 'view', label: 'ORDERS_LIST.TABLE.VIEW', icon: 'visibility' }
  ];

  orders: OrderListItem[] = [];
  isLoading = false;
  errorMessage = '';
  isFiltersExpanded = false;

  searchTerm = '';
  orderStatusFilter: string | null = null;
  paymentStatusFilter: string | null = null;
  fulfillmentStatusFilter: string | null = null;
  queueView: OrderQueueView = 'ALL';

  panelFilters: Record<string, string | null | undefined> = {};

  filterFields: FilterField[] = [
    { key: 'status', label: 'ORDERS.FILTERS.ORDER_STATUS', type: 'select', color: '#127c8c', localizeOptions: false, options: [] },
    { key: 'paymentStatus', label: 'ORDERS.FILTERS.PAYMENT_STATUS', type: 'select', color: '#0f766e', localizeOptions: false, options: [] },
    { key: 'fulfillmentStatus', label: 'ORDERS.FILTERS.FULFILLMENT_STATUS', type: 'select', color: '#2563eb', localizeOptions: false, options: [] },
    { key: 'queueView', label: 'ORDERS.CURRENT_VIEW', type: 'select', color: '#7c3aed', localizeOptions: false, options: [] }
  ];

  page = 1;
  pageSize = 8;
  totalItems = 0;

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.orderStatusFilter || this.paymentStatusFilter || this.fulfillmentStatusFilter || (this.queueView && this.queueView !== 'ALL'));
  }

  constructor(
    private readonly router: Router,
    private readonly ordersService: OrdersService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.applyFilterOptionLabels();
      this.cdr.markForCheck();
    });

    this.loadFilterOptions();
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.langChangeSub?.unsubscribe();
  }

  loadFilterOptions(): void {
    this.ordersService.getFilterOptions().subscribe({
      next: (options: OrderFilterOptions) => {
        this.filterOptionsRaw = options;
        this.applyFilterOptionLabels();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to load filter options', err);
      }
    });
  }

  private applyFilterOptionLabels(): void {
    if (!this.filterOptionsRaw) {
      return;
    }

    const options = this.filterOptionsRaw;
    const statusField = this.filterFields.find(f => f.key === 'status');
    const paymentField = this.filterFields.find(f => f.key === 'paymentStatus');
    const fulfillmentField = this.filterFields.find(f => f.key === 'fulfillmentStatus');
    const queueField = this.filterFields.find(f => f.key === 'queueView');

    if (statusField) {
      statusField.options = this.mapFilterOptions(options.orderStatuses);
      statusField.placeholder = 'ORDERS.FILTERS.ORDER_STATUS_ALL';
    }
    if (paymentField) {
      paymentField.options = this.mapFilterOptions(options.paymentStatuses);
      paymentField.placeholder = 'ORDERS.FILTERS.PAYMENT_STATUS_ALL';
    }
    if (fulfillmentField) {
      fulfillmentField.options = this.mapFilterOptions(options.fulfillmentStatuses);
      fulfillmentField.placeholder = 'ORDERS.FILTERS.FULFILLMENT_STATUS_ALL';
    }
    if (queueField) {
      queueField.options = this.mapFilterOptions(options.queueViews);
      queueField.placeholder = 'ORDERS.QUEUE_VIEW.ALL';
    }
  }

  private mapFilterOptions(items: FilterOptionItem[]) {
    return items.map((item) => ({
      value: item.value,
      label: this.resolveFilterLabel(item)
    }));
  }

  private resolveFilterLabel(item: FilterOptionItem): string {
    const lang = (this.translate.currentLang || this.translate.defaultLang || 'ar').toLowerCase();
    return lang.startsWith('ar') ? item.labelAr : item.labelEn;
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ordersService.getOrders({
      page: this.page,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm,
      status: (this.orderStatusFilter as OrderStatus) || 'ALL',
      paymentStatus: (this.paymentStatusFilter as OrderPaymentStatus) || 'ALL',
      fulfillmentStatus: (this.fulfillmentStatusFilter as OrderFulfillmentStatus) || 'ALL',
      queueView: this.queueView
    }).subscribe({
      next: (response) => {
        this.cdr.markForCheck();
        this.orders = response.items;
        this.totalItems = response.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        this.cdr.markForCheck();
        console.error('Failed to load orders', error);
        this.errorMessage = 'ORDERS.ERRORS.LOAD_LIST';
        this.orders = [];
        this.isLoading = false;
      }
    });
  }

  changePage(newPage: number): void {
    this.page = newPage;
    this.loadOrders();
  }

  onSearchChange(): void {
    this.page = 1;
    this.loadOrders();
  }

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  onFiltersChange(filters: Record<string, unknown>): void {
    this.orderStatusFilter = this.toNullableString(filters['status']);
    this.paymentStatusFilter = this.toNullableString(filters['paymentStatus']);
    this.fulfillmentStatusFilter = this.toNullableString(filters['fulfillmentStatus']);
    this.queueView = (this.toNullableString(filters['queueView']) as OrderQueueView) || 'ALL';
    this.syncPanelFilters();
    this.page = 1;
    this.loadOrders();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.orderStatusFilter = null;
    this.paymentStatusFilter = null;
    this.fulfillmentStatusFilter = null;
    this.queueView = 'ALL';
    this.syncPanelFilters();
    this.page = 1;
    this.loadOrders();
  }

  openOrderDetails(order: OrderListItem): void {
    this.router.navigate(['/orders', order.id]);
  }

  onTableRowClick(order: OrderListItem): void {
    this.openOrderDetails(order);
  }

  onTableAction(event: { action: TableAction; item: OrderListItem }): void {
    if (event.action.id === 'view') {
      this.openOrderDetails(event.item);
    }
  }

  getOrderStatusKey(status: OrderStatus): string {
    return getOrderStatusKey(status);
  }

  getPaymentStatusKey(status: OrderPaymentStatus): string {
    return getPaymentStatusKey(status);
  }

  getFulfillmentStatusKey(status: OrderFulfillmentStatus): string {
    return getFulfillmentStatusKey(status);
  }

  getWorkflowStageKey(stage: OrderWorkflowStage): string {
    return getWorkflowStageKey(stage);
  }

  getResolutionStateKey(state: OrderResolutionState): string {
    return getResolutionStateKey(state);
  }

  getOrderStatusVariant(status: OrderStatus): StatusPillVariant {
    const variants: Record<OrderStatus, StatusPillVariant> = {
      NEW: 'info',
      PENDING: 'warning',
      IN_PROGRESS: 'processing',
      OUT_FOR_DELIVERY: 'processing',
      DELIVERED: 'success',
      COMPLETED: 'success',
      CANCELLED: 'danger'
    };

    return variants[status];
  }

  getPaymentStatusVariant(status: OrderPaymentStatus): StatusPillVariant {
    const variants: Record<OrderPaymentStatus, StatusPillVariant> = {
      PENDING: 'warning',
      PAID: 'success',
      FAILED: 'danger',
      REFUNDED: 'info',
      PARTIALLY_REFUNDED: 'warning',
      COD_PENDING: 'paused',
      SETTLED: 'success'
    };

    return variants[status];
  }

  getFulfillmentStatusVariant(status: OrderFulfillmentStatus): StatusPillVariant {
    const variants: Record<OrderFulfillmentStatus, StatusPillVariant> = {
      QUEUED: 'neutral',
      PREPARING: 'warning',
      READY_FOR_PICKUP: 'info',
      DRIVER_ASSIGNED: 'processing',
      PICKED_UP: 'processing',
      ON_ROUTE: 'processing',
      DELIVERED: 'success',
      FAILED: 'danger',
      CANCELLED: 'danger'
    };

    return variants[status];
  }

  getResolutionStateVariant(state: OrderResolutionState): StatusPillVariant {
    const variants: Record<OrderResolutionState, StatusPillVariant> = {
      ACTION_REQUIRED: 'danger',
      MONITORING: 'warning',
      RESOLVED: 'success'
    };

    return variants[state];
  }

  private syncPanelFilters(): void {
    this.panelFilters = {
      status: this.orderStatusFilter,
      paymentStatus: this.paymentStatusFilter,
      fulfillmentStatus: this.fulfillmentStatusFilter,
      queueView: this.queueView === 'ALL' ? null : this.queueView
    };
  }

  private toNullableString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
  }
}
