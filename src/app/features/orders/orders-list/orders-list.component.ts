import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Router } from '@angular/router';
import { AppPaginationComponent } from '../../../shared/components/ui/pagination/pagination.component';
import { KpiCardsComponent, KPICard } from '../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/ui/data-table/data-table.component';
import { AppPageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../shared/components/ui/status-pill/status-pill.component';

interface OrderItem {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  status: string;
  total: number;
  merchantNameKey?: string;
  merchantBranchKey?: string;
}

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    AppPaginationComponent,
    KpiCardsComponent,
    DataTableComponent,
    AppPageHeaderComponent,
    StatusPillComponent
  ],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit {
  
  // Quick View Drawer State
  isDrawerOpen = signal(false);
  selectedOrder = signal<OrderItem | null>(null);

  // Pagination State
  page = 1;
  pageSize = 15;
  totalItems = 1284;

  kpiCards: KPICard[] = [
    { id: 'total', title: 'ORDERS.KPI.TOTAL', value: '1,284', color: '#127c8c', icon: '<span class="material-symbols-outlined text-[20px]">shopping_bag</span>', clickable: false },
    { id: 'new', title: 'ORDERS.KPI.NEW', value: '142', color: '#3b82f6', icon: '<span class="material-symbols-outlined text-[20px]">fiber_new</span>', clickable: true },
    { id: 'progress', title: 'ORDERS.KPI.IN_PROGRESS', value: '318', color: '#f59e0b', icon: '<span class="material-symbols-outlined text-[20px]">clock_loader_40</span>', clickable: true },
    { id: 'late', title: 'ORDERS.KPI.LATE', value: '24', color: '#f97316', icon: '<span class="material-symbols-outlined text-[20px]">warning</span>', clickable: true },
    { id: 'cancelled', title: 'ORDERS.KPI.CANCELLED', value: '12', color: '#ef4444', icon: '<span class="material-symbols-outlined text-[20px]">cancel</span>', clickable: true },
    { id: 'issues', title: 'ORDERS.KPI.PAYMENT_ISSUES', value: '07', color: '#e11d48', icon: '<span class="material-symbols-outlined text-[20px]">error</span>', clickable: true }
  ];

  tableColumns: TableColumn[] = [
    { key: 'id', title: 'ORDERS.TABLE.ID', width: '15%', align: 'left', type: 'custom' },
    { key: 'customer', title: 'ORDERS.TABLE.CUSTOMER', width: '25%', align: 'left', type: 'custom' },
    { key: 'date', title: 'ORDERS.TABLE.DATE_TIME', width: '20%', align: 'left', type: 'custom' },
    { key: 'status', title: 'ORDERS.TABLE.STATUS', width: '15%', align: 'center', type: 'custom' },
    { key: 'total', title: 'ORDERS.TABLE.TOTAL', width: '15%', align: 'center', type: 'custom' },
    { key: 'actions', title: 'ORDERS.TABLE.ACTIONS', width: '10%', align: 'center', type: 'actions' }
  ];
  
  tableActions: TableAction[] = [
    { id: 'view', label: 'ORDERS_LIST.TABLE.VIEW', icon: 'visibility' }
  ];

  orders: OrderItem[] = [
    { id: '#ZD-94821', customerName: 'سارة علي', customerPhone: '055-123-XXXX', date: '2023-10-25', time: '10:45 AM', status: 'COMPLETED', total: 450.00, merchantNameKey: 'ORDERS.DETAIL.MOCK_MERCHANT', merchantBranchKey: 'ORDERS.DETAIL.BRANCH_YASMINE' },
    { id: '#ZD-94820', customerName: 'محمد جاسم', customerPhone: '050-998-XXXX', date: '2023-10-25', time: '09:12 AM', status: 'IN_PROGRESS', total: 120.50, merchantNameKey: 'ORDERS.DETAIL.MOCK_MERCHANT_PANDA', merchantBranchKey: 'ORDERS.DETAIL.BRANCH_NAKHEEL' },
    { id: '#ZD-94819', customerName: 'نوف الخليج', customerPhone: '054-554-XXXX', date: '2023-10-24', time: '11:30 PM', status: 'NEW', total: 85.00, merchantNameKey: 'ORDERS.DETAIL.MOCK_MERCHANT_OTHIM', merchantBranchKey: 'ORDERS.DETAIL.BRANCH_RAWDA' },
    { id: '#ZD-94818', customerName: 'أحمد فهد', customerPhone: '056-222-XXXX', date: '2023-10-24', time: '08:15 PM', status: 'CANCELLED', total: 340.00, merchantNameKey: 'ORDERS.DETAIL.MOCK_MERCHANT_CARREFOUR', merchantBranchKey: 'ORDERS.DETAIL.BRANCH_SAHARA' },
    { id: '#ZD-94817', customerName: 'شركة الوادي', customerPhone: '059-333-XXXX', date: '2023-10-24', time: '02:00 PM', status: 'DELIVERED', total: 1250.00, merchantNameKey: 'ORDERS.DETAIL.MOCK_MERCHANT_DANUBE', merchantBranchKey: 'ORDERS.DETAIL.BRANCH_HITTIN' },
  ];

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  changePage(newPage: number) {
    this.page = newPage;
  }

  openOrderDetails(order: OrderItem) {
    this.router.navigate(['/orders', order.id.replace('#', '')]);
  }

  onTableRowClick(order: any) {
    this.openOrderDetails(order);
  }

  onTableAction(event: { action: TableAction, item: any }) {
    if (event.action.id === 'view') {
        this.openOrderDetails(event.item);
    }
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
    this.selectedOrder.set(null);
  }

  getOrderStatusVariant(status: string): StatusPillVariant {
    const variants: Record<string, StatusPillVariant> = {
      NEW: 'info',
      IN_PROGRESS: 'processing',
      COMPLETED: 'success',
      DELIVERED: 'success',
      CANCELLED: 'danger'
    };

    return variants[status] ?? 'neutral';
  }
}
