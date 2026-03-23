import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InlineBannerComponent } from '../../../shared/components/ui/inline-banner/inline-banner.component';
import { SectionHeaderComponent } from '../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../shared/components/ui/status-pill/status-pill.component';

interface KPI {
  id: string;
  titleKey: string;
  value: string;
  trend: string;
  trendKey: string;
  icon: string;
  borderColor: string;
  trendClass: string;
  trendIcon: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  customerLocation: string;
  date: string;
  time: string;
  amount: string;
  paymentStatusKey: string;
  paymentStatusClass: string;
  shippingStatusKey: string;
  shippingStatusClass: string;
  generalStatusKey: string;
  generalStatusClass: string;
}

@Component({
  selector: 'app-vendor-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, InlineBannerComponent, SectionHeaderComponent, StatusPillComponent],
  templateUrl: './vendor-orders.component.html'
})
export class VendorOrdersComponent {
  vendorId: string = 'VND-9928';
  currentLang: string = 'ar';
  isRTL: boolean = true;

  searchQuery: string = '';

  // KPIs
  kpis: KPI[] = [
    {
      id: 'total',
      titleKey: 'VENDOR_ORDERS.KPI.TOTAL_ORDERS',
      value: '15,420',
      trend: '5%',
      trendKey: 'VENDOR_ORDERS.KPI.INCREASE',
      icon: 'receipt_long',
      borderColor: 'border-l-primary',
      trendClass: 'text-green-600',
      trendIcon: 'arrow_upward'
    },
    {
      id: 'open',
      titleKey: 'VENDOR_ORDERS.KPI.OPEN_ORDERS',
      value: '1,230',
      trend: '2%',
      trendKey: 'VENDOR_ORDERS.KPI.INCREASE',
      icon: 'pending_actions',
      borderColor: 'border-l-blue-500',
      trendClass: 'text-green-600',
      trendIcon: 'arrow_upward'
    },
    {
      id: 'completed',
      titleKey: 'VENDOR_ORDERS.KPI.COMPLETED_ORDERS',
      value: '13,850',
      trend: '1%',
      trendKey: 'VENDOR_ORDERS.KPI.INCREASE',
      icon: 'check_circle',
      borderColor: 'border-l-green-500',
      trendClass: 'text-green-600',
      trendIcon: 'arrow_upward'
    },
    {
      id: 'cancelled',
      titleKey: 'VENDOR_ORDERS.KPI.CANCELLED_ORDERS',
      value: '240',
      trend: '1%',
      trendKey: 'VENDOR_ORDERS.KPI.DECREASE',
      icon: 'cancel',
      borderColor: 'border-l-red-500',
      trendClass: 'text-red-600',
      trendIcon: 'arrow_downward'
    },
    {
      id: 'returned',
      titleKey: 'VENDOR_ORDERS.KPI.RETURNED_ORDERS',
      value: '100',
      trend: '0.5%',
      trendKey: 'VENDOR_ORDERS.KPI.DECREASE',
      icon: 'keyboard_return',
      borderColor: 'border-l-orange-500',
      trendClass: 'text-red-600',
      trendIcon: 'arrow_downward'
    },
    {
      id: 'average',
      titleKey: 'VENDOR_ORDERS.KPI.AVERAGE_ORDER',
      value: '250 ر.س',
      trend: '10%',
      trendKey: 'VENDOR_ORDERS.KPI.INCREASE',
      icon: 'payments',
      borderColor: 'border-l-purple-500',
      trendClass: 'text-green-600',
      trendIcon: 'arrow_upward'
    }
  ];

  // Summary stats
  totalSales: string = '3,850,000';
  delayedOrders: number = 45;
  openDisputes: number = 12;
  cancellationRate: string = '1.5%';

  // Orders
  orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-1001',
      customer: 'أحمد محمود',
      customerLocation: 'الرياض',
      date: '2023-10-25',
      time: '14:30',
      amount: '500',
      paymentStatusKey: 'VENDOR_ORDERS.PAYMENT_STATUS.PAID',
      paymentStatusClass: 'bg-green-100 text-green-700',
      shippingStatusKey: 'VENDOR_ORDERS.SHIPPING_STATUS.PENDING',
      shippingStatusClass: 'bg-yellow-100 text-yellow-700',
      generalStatusKey: 'VENDOR_ORDERS.GENERAL_STATUS.NEW',
      generalStatusClass: 'bg-blue-100 text-blue-700'
    },
    {
      id: '2',
      orderNumber: 'ORD-1002',
      customer: 'فاطمة علي',
      customerLocation: 'جدة',
      date: '2023-10-24',
      time: '09:15',
      amount: '1200',
      paymentStatusKey: 'VENDOR_ORDERS.PAYMENT_STATUS.PENDING',
      paymentStatusClass: 'bg-yellow-100 text-yellow-700',
      shippingStatusKey: 'VENDOR_ORDERS.SHIPPING_STATUS.IN_PROGRESS',
      shippingStatusClass: 'bg-blue-100 text-blue-700',
      generalStatusKey: 'VENDOR_ORDERS.GENERAL_STATUS.IN_PROGRESS',
      generalStatusClass: 'bg-blue-100 text-blue-700'
    },
    {
      id: '3',
      orderNumber: 'ORD-1003',
      customer: 'محمد خالد',
      customerLocation: 'الدمام',
      date: '2023-10-23',
      time: '18:45',
      amount: '350',
      paymentStatusKey: 'VENDOR_ORDERS.PAYMENT_STATUS.PAID',
      paymentStatusClass: 'bg-green-100 text-green-700',
      shippingStatusKey: 'VENDOR_ORDERS.SHIPPING_STATUS.COMPLETED',
      shippingStatusClass: 'bg-green-100 text-green-700',
      generalStatusKey: 'VENDOR_ORDERS.GENERAL_STATUS.COMPLETED',
      generalStatusClass: 'bg-green-100 text-green-700'
    },
    {
      id: '4',
      orderNumber: 'ORD-1004',
      customer: 'سارة عبد الله',
      customerLocation: 'مكة',
      date: '2023-10-22',
      time: '11:20',
      amount: '800',
      paymentStatusKey: 'VENDOR_ORDERS.PAYMENT_STATUS.REFUNDED',
      paymentStatusClass: 'bg-orange-100 text-orange-700',
      shippingStatusKey: 'VENDOR_ORDERS.SHIPPING_STATUS.CANCELLED',
      shippingStatusClass: 'bg-red-100 text-red-700',
      generalStatusKey: 'VENDOR_ORDERS.GENERAL_STATUS.CANCELLED',
      generalStatusClass: 'bg-red-100 text-red-700'
    }
  ];

  // Alerts
  alerts: string[] = [
    'VENDOR_ORDERS.ALERTS.SHIPPING_DELAY',
    'VENDOR_ORDERS.ALERTS.LOW_STOCK',
    'VENDOR_ORDERS.ALERTS.NEW_DISPUTE'
  ];

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';
    
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === 'ar';
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.vendorId = params['id'];
      }
    });
  }

  onSearch() {
    console.log('Search:', this.searchQuery);
  }

  onFilter() {
    console.log('Open filters');
  }

  onDateRange() {
    console.log('Open date range picker');
  }

  onBulkActions() {
    console.log('Open bulk actions');
  }

  onExport() {
    console.log('Export orders');
  }

  onViewOrder(orderId: string) {
    // Navigate to order detail page (to be created)
    // For now, you can create the route: /orders/:id
    this.router.navigate(['/orders', orderId]);
  }

  onEditOrder(orderId: string) {
    // Navigate to order edit page (to be created)
    // For now, you can create the route: /orders/:id/edit
    this.router.navigate(['/orders', orderId, 'edit']);
  }

  getPaymentStatusVariant(statusKey: string): StatusPillVariant {
    if (statusKey.includes('PAID')) {
      return 'success';
    }

    if (statusKey.includes('PENDING')) {
      return 'warning';
    }

    if (statusKey.includes('REFUNDED')) {
      return 'info';
    }

    return 'neutral';
  }

  getShippingStatusVariant(statusKey: string): StatusPillVariant {
    if (statusKey.includes('COMPLETED')) {
      return 'success';
    }

    if (statusKey.includes('IN_PROGRESS')) {
      return 'processing';
    }

    if (statusKey.includes('PENDING')) {
      return 'warning';
    }

    if (statusKey.includes('CANCELLED')) {
      return 'danger';
    }

    return 'neutral';
  }

  getGeneralStatusVariant(statusKey: string): StatusPillVariant {
    if (statusKey.includes('COMPLETED')) {
      return 'success';
    }

    if (statusKey.includes('IN_PROGRESS')) {
      return 'processing';
    }

    if (statusKey.includes('NEW')) {
      return 'info';
    }

    if (statusKey.includes('CANCELLED')) {
      return 'danger';
    }

    return 'neutral';
  }

  getAlertVariant(alertKey: string): 'warning' | 'error' | 'info' {
    if (alertKey.includes('NEW_DISPUTE')) {
      return 'error';
    }

    if (alertKey.includes('SHIPPING_DELAY')) {
      return 'warning';
    }

    return 'info';
  }
}
