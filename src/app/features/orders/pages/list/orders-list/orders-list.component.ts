import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';
import { AppPaginationComponent } from '../../../../../shared/components/ui/pagination/pagination.component';
import { KpiCardsComponent, KPICard } from '../../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { DataTableComponent, TableAction, TableColumn } from '../../../../../shared/components/ui/data-table/data-table.component';
import { AppPageHeaderComponent } from '../../../../../shared/components/ui/page-header/page-header.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import { OrdersService } from '@orders/services/orders.api.service';
import {
  OrderFulfillmentStatus,
  OrderListItem,
  OrderPaymentStatus,
  OrderQueueView,
  OrderResolutionState,
  OrderStatus,
  OrderWorkflowStage,
  OrdersSummary
} from '../../../models/orders.models';
import {
  getFulfillmentStatusKey,
  getOrderStatusKey,
  getPaymentStatusKey,
  getResolutionStateKey,
  getWorkflowStageKey
} from '../../../data/orders.mock';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule,
    AppPaginationComponent,
    KpiCardsComponent,
    DataTableComponent,
    AppPageHeaderComponent,
    SearchableSelectComponent,
    StatusPillComponent
  ],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit {
  readonly tableColumns: TableColumn[] = [
    { key: 'reference', title: 'ORDERS.TABLE.ID', width: '14%', align: 'left', type: 'custom' },
    { key: 'customer', title: 'ORDERS.TABLE.CUSTOMER', width: '18%', align: 'left', type: 'custom' },
    { key: 'statuses', title: 'ORDERS.TABLE.STATUSES', width: '28%', align: 'left', type: 'custom' },
    { key: 'workflow', title: 'ORDERS.TABLE.WORKFLOW', width: '20%', align: 'left', type: 'custom' },
    { key: 'updated', title: 'ORDERS.TABLE.UPDATED', width: '14%', align: 'left', type: 'custom' },
    { key: 'total', title: 'ORDERS.TABLE.TOTAL', width: '12%', align: 'center', type: 'custom' },
    { key: 'actions', title: 'ORDERS.TABLE.ACTIONS', width: '8%', align: 'center', type: 'actions' }
  ];

  readonly tableActions: TableAction[] = [
    { id: 'view', label: 'ORDERS_LIST.TABLE.VIEW', icon: 'visibility' }
  ];

  readonly orderStatusOptions: Array<{ value: OrderStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'ORDERS.FILTERS.ORDER_STATUS_ALL' },
    { value: 'NEW', label: 'ORDERS.STATUS.NEW' },
    { value: 'PENDING', label: 'ORDERS.STATUS.PENDING' },
    { value: 'IN_PROGRESS', label: 'ORDERS.STATUS.IN_PROGRESS' },
    { value: 'OUT_FOR_DELIVERY', label: 'ORDERS.STATUS.OUT_FOR_DELIVERY' },
    { value: 'DELIVERED', label: 'ORDERS.STATUS.DELIVERED' },
    { value: 'COMPLETED', label: 'ORDERS.STATUS.COMPLETED' },
    { value: 'CANCELLED', label: 'ORDERS.STATUS.CANCELLED' }
  ];

  readonly paymentStatusOptions: Array<{ value: OrderPaymentStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'ORDERS.FILTERS.PAYMENT_STATUS_ALL' },
    { value: 'PENDING', label: 'ORDERS.PAYMENT_STATUS.PENDING' },
    { value: 'PAID', label: 'ORDERS.PAYMENT_STATUS.PAID' },
    { value: 'FAILED', label: 'ORDERS.PAYMENT_STATUS.FAILED' },
    { value: 'REFUNDED', label: 'ORDERS.PAYMENT_STATUS.REFUNDED' },
    { value: 'PARTIALLY_REFUNDED', label: 'ORDERS.PAYMENT_STATUS.PARTIALLY_REFUNDED' },
    { value: 'COD_PENDING', label: 'ORDERS.PAYMENT_STATUS.COD_PENDING' },
    { value: 'SETTLED', label: 'ORDERS.PAYMENT_STATUS.SETTLED' }
  ];

  readonly fulfillmentStatusOptions: Array<{ value: OrderFulfillmentStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'ORDERS.FILTERS.FULFILLMENT_STATUS_ALL' },
    { value: 'QUEUED', label: 'ORDERS.FULFILLMENT_STATUS.QUEUED' },
    { value: 'PREPARING', label: 'ORDERS.FULFILLMENT_STATUS.PREPARING' },
    { value: 'READY_FOR_PICKUP', label: 'ORDERS.FULFILLMENT_STATUS.READY_FOR_PICKUP' },
    { value: 'DRIVER_ASSIGNED', label: 'ORDERS.FULFILLMENT_STATUS.DRIVER_ASSIGNED' },
    { value: 'PICKED_UP', label: 'ORDERS.FULFILLMENT_STATUS.PICKED_UP' },
    { value: 'ON_ROUTE', label: 'ORDERS.FULFILLMENT_STATUS.ON_ROUTE' },
    { value: 'DELIVERED', label: 'ORDERS.FULFILLMENT_STATUS.DELIVERED' },
    { value: 'FAILED', label: 'ORDERS.FULFILLMENT_STATUS.FAILED' },
    { value: 'CANCELLED', label: 'ORDERS.FULFILLMENT_STATUS.CANCELLED' }
  ];

  readonly queueViewOptions: Array<{ value: OrderQueueView; label: string }> = [
    { value: 'ALL', label: 'ORDERS.QUEUE_VIEW.ALL' },
    { value: 'ACTIVE', label: 'ORDERS.QUEUE_VIEW.ACTIVE' },
    { value: 'LATE', label: 'ORDERS.QUEUE_VIEW.LATE' },
    { value: 'PAYMENT_ISSUES', label: 'ORDERS.QUEUE_VIEW.PAYMENT_ISSUES' },
    { value: 'REFUNDS', label: 'ORDERS.QUEUE_VIEW.REFUNDS' }
  ];

  orders: OrderListItem[] = [];
  kpiCards: KPICard[] = [];
  isLoading = false;
  errorMessage = '';

  searchTerm = '';
  orderStatusFilter: OrderStatus | 'ALL' = 'ALL';
  paymentStatusFilter: OrderPaymentStatus | 'ALL' = 'ALL';
  fulfillmentStatusFilter: OrderFulfillmentStatus | 'ALL' = 'ALL';
  queueView: OrderQueueView = 'ALL';

  page = 1;
  pageSize = 8;
  totalItems = 0;

  get orderStatusFilterOptions(): SearchableSelectOption[] {
    return this.orderStatusOptions.map((option) => ({ value: option.value, labelKey: option.label }));
  }

  get paymentStatusFilterOptions(): SearchableSelectOption[] {
    return this.paymentStatusOptions.map((option) => ({ value: option.value, labelKey: option.label }));
  }

  get fulfillmentStatusFilterOptions(): SearchableSelectOption[] {
    return this.fulfillmentStatusOptions.map((option) => ({ value: option.value, labelKey: option.label }));
  }

  constructor(
    private readonly router: Router,
    private readonly ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ordersService.getOrders({
      page: this.page,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm,
      status: this.orderStatusFilter,
      paymentStatus: this.paymentStatusFilter,
      fulfillmentStatus: this.fulfillmentStatusFilter,
      queueView: this.queueView
    }).subscribe({
      next: (response) => {
        this.orders = response.items;
        this.totalItems = response.totalCount;
        this.kpiCards = this.buildKpiCards(response.summary);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load orders', error);
        this.errorMessage = 'ORDERS.ERRORS.LOAD_LIST';
        this.orders = [];
        this.kpiCards = this.buildKpiCards({
          total: 0,
          active: 0,
          late: 0,
          paymentIssues: 0,
          refunds: 0
        });
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

  onFiltersChange(): void {
    this.page = 1;
    this.loadOrders();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.orderStatusFilter = 'ALL';
    this.paymentStatusFilter = 'ALL';
    this.fulfillmentStatusFilter = 'ALL';
    this.queueView = 'ALL';
    this.page = 1;
    this.loadOrders();
  }

  onKpiCardClick(card: KPICard): void {
    this.queueView = (card.id.toUpperCase() as OrderQueueView);
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

  private buildKpiCards(summary: OrdersSummary): KPICard[] {
    return [
      {
        id: 'ALL',
        title: 'ORDERS.KPI.TOTAL',
        value: summary.total,
        color: '#127c8c',
        icon: '<span class="material-symbols-outlined text-[20px]">shopping_bag</span>',
        clickable: true
      },
      {
        id: 'ACTIVE',
        title: 'ORDERS.KPI.ACTIVE',
        value: summary.active,
        color: '#0f766e',
        icon: '<span class="material-symbols-outlined text-[20px]">rocket_launch</span>',
        clickable: true
      },
      {
        id: 'LATE',
        title: 'ORDERS.KPI.LATE',
        value: summary.late,
        color: '#f97316',
        icon: '<span class="material-symbols-outlined text-[20px]">warning</span>',
        clickable: true
      },
      {
        id: 'PAYMENT_ISSUES',
        title: 'ORDERS.KPI.PAYMENT_ISSUES',
        value: summary.paymentIssues,
        color: '#dc2626',
        icon: '<span class="material-symbols-outlined text-[20px]">credit_card_off</span>',
        clickable: true
      },
      {
        id: 'REFUNDS',
        title: 'ORDERS.KPI.REFUNDS',
        value: summary.refunds,
        color: '#7c3aed',
        icon: '<span class="material-symbols-outlined text-[20px]">reply</span>',
        clickable: true
      }
    ];
  }
}


