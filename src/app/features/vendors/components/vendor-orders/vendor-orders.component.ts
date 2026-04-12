import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { AdminVendorOrderItem, VendorService } from '@vendors/services/vendor.api.service';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

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

interface OrderRow {
  id: string;
  orderNumber: string;
  customer: string;
  customerLocation: string;
  date: string;
  time: string;
  amount: string;
  paymentStatusKey: string;
  shippingStatusKey: string;
  generalStatusKey: string;
}

@Component({
  selector: 'app-vendor-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, InlineBannerComponent, SectionHeaderComponent, StatusPillComponent],
  templateUrl: './vendor-orders.component.html'
})
export class VendorOrdersComponent {
  vendorId = '';
  currentLang = 'ar';
  isRTL = true;
  searchQuery = '';
  isLoading = false;
  private readonly destroyRef = inject(DestroyRef);

  ordersData: AdminVendorOrderItem[] = [];
  kpis: KPI[] = [];
  totalSales = '0';
  delayedOrders = 0;
  openDisputes = 0;
  cancellationRate = '0%';
  alerts: string[] = [];

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly vendorService: VendorService,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
        this.rebuildViewModel();
      });

    this.vendorDetailFacade.vendorId$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendorId) => {
        if (!vendorId) {
          return;
        }

        this.vendorId = vendorId;
        this.loadOrders();
      });
  }

  get filteredOrders(): OrderRow[] {
    const normalizedSearch = this.searchQuery.trim().toLowerCase();

    return this.mapOrders(this.ordersData).filter((order) => {
      if (!normalizedSearch) {
        return true;
      }

      return [
        order.orderNumber,
        order.customer,
        order.customerLocation
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }

  onExport(): void {
    const rows = this.filteredOrders.map((order) => [
      order.orderNumber,
      order.customer,
      order.customerLocation,
      order.date,
      order.time,
      order.amount
    ].join(','));

    const content = ['Order Number,Customer,Location,Date,Time,Amount', ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `vendor-orders-${this.vendorId}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  onViewOrder(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  getPaymentStatusVariant(statusKey: string): StatusPillVariant {
    if (statusKey.includes('PAID')) {
      return 'success';
    }

    if (statusKey.includes('INITIATED') || statusKey.includes('PENDING')) {
      return 'warning';
    }

    if (statusKey.includes('FAILED') || statusKey.includes('REFUND')) {
      return 'danger';
    }

    return 'neutral';
  }

  getShippingStatusVariant(statusKey: string): StatusPillVariant {
    if (statusKey.includes('DELIVERED')) {
      return 'success';
    }

    if (statusKey.includes('PLACED') || statusKey.includes('PREPARING') || statusKey.includes('ONTHEWAY')) {
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
    return this.getShippingStatusVariant(statusKey);
  }

  getAlertVariant(alertKey: string): 'warning' | 'error' | 'info' {
    if (alertKey.includes('NEW_DISPUTE') || alertKey.includes('CANCEL')) {
      return 'error';
    }

    if (alertKey.includes('SHIPPING_DELAY') || alertKey.includes('PAYMENT')) {
      return 'warning';
    }

    return 'info';
  }

  private loadOrders(): void {
    this.isLoading = true;
    this.vendorService.getVendorOrders(this.vendorId, 1, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.ordersData = response.items ?? [];
          this.rebuildViewModel();
          this.isLoading = false;
        },
        error: () => {
          this.ordersData = [];
          this.rebuildViewModel();
          this.isLoading = false;
        }
      });
  }

  private rebuildViewModel(): void {
    const totalOrders = this.ordersData.length;
    const completedOrders = this.ordersData.filter((order) => order.status.toLowerCase() === 'delivered').length;
    const cancelledOrders = this.ordersData.filter((order) => order.status.toLowerCase() === 'cancelled').length;
    const openOrders = this.ordersData.filter((order) => order.status.toLowerCase() !== 'delivered' && order.status.toLowerCase() !== 'cancelled').length;
    const paymentIssues = this.ordersData.filter((order) => order.paymentStatus.toLowerCase() !== 'paid').length;
    const totalSalesValue = this.ordersData.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrder = totalOrders > 0 ? totalSalesValue / totalOrders : 0;

    this.totalSales = this.formatNumber(totalSalesValue);
    this.delayedOrders = openOrders;
    this.openDisputes = paymentIssues;
    this.cancellationRate = totalOrders > 0 ? `${((cancelledOrders / totalOrders) * 100).toFixed(1)}%` : '0%';
    this.alerts = [
      ...(openOrders > 0 ? ['VENDOR_ORDERS.ALERTS.SHIPPING_DELAY'] : []),
      ...(paymentIssues > 0 ? ['VENDOR_ORDERS.ALERTS.NEW_DISPUTE'] : []),
      ...(cancelledOrders > 0 ? ['VENDOR_ORDERS.ALERTS.LOW_STOCK'] : [])
    ];

    this.kpis = [
      {
        id: 'total',
        titleKey: 'VENDOR_ORDERS.KPI.TOTAL_ORDERS',
        value: this.formatNumber(totalOrders),
        trend: `${completedOrders}`,
        trendKey: 'VENDOR_ORDERS.KPI.COMPLETED_ORDERS',
        icon: 'receipt_long',
        borderColor: 'border-l-primary',
        trendClass: 'text-green-600',
        trendIcon: 'check_circle'
      },
      {
        id: 'open',
        titleKey: 'VENDOR_ORDERS.KPI.OPEN_ORDERS',
        value: this.formatNumber(openOrders),
        trend: `${paymentIssues}`,
        trendKey: 'VENDOR_ORDERS.OPEN_DISPUTES',
        icon: 'pending_actions',
        borderColor: 'border-l-blue-500',
        trendClass: paymentIssues > 0 ? 'text-orange-600' : 'text-green-600',
        trendIcon: paymentIssues > 0 ? 'warning' : 'check_circle'
      },
      {
        id: 'completed',
        titleKey: 'VENDOR_ORDERS.KPI.COMPLETED_ORDERS',
        value: this.formatNumber(completedOrders),
        trend: `${totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%`,
        trendKey: 'COMMON.STATUS',
        icon: 'check_circle',
        borderColor: 'border-l-green-500',
        trendClass: 'text-green-600',
        trendIcon: 'arrow_upward'
      },
      {
        id: 'cancelled',
        titleKey: 'VENDOR_ORDERS.KPI.CANCELLED_ORDERS',
        value: this.formatNumber(cancelledOrders),
        trend: this.cancellationRate,
        trendKey: 'VENDOR_ORDERS.CANCELLATION_RATE',
        icon: 'cancel',
        borderColor: 'border-l-red-500',
        trendClass: 'text-red-600',
        trendIcon: 'arrow_downward'
      },
      {
        id: 'returned',
        titleKey: 'VENDOR_ORDERS.OPEN_DISPUTES',
        value: this.formatNumber(paymentIssues),
        trend: `${openOrders}`,
        trendKey: 'VENDOR_ORDERS.KPI.OPEN_ORDERS',
        icon: 'report_problem',
        borderColor: 'border-l-orange-500',
        trendClass: paymentIssues > 0 ? 'text-red-600' : 'text-green-600',
        trendIcon: paymentIssues > 0 ? 'warning' : 'check_circle'
      },
      {
        id: 'average',
        titleKey: 'VENDOR_ORDERS.KPI.AVERAGE_ORDER',
        value: `${this.formatNumber(averageOrder)} ${this.translate.instant('COMMON.CURRENCY_SAR')}`,
        trend: `${this.formatNumber(totalSalesValue)}`,
        trendKey: 'VENDOR_ORDERS.TOTAL_SALES',
        icon: 'payments',
        borderColor: 'border-l-purple-500',
        trendClass: 'text-green-600',
        trendIcon: 'arrow_upward'
      }
    ];
  }

  private mapOrders(orders: AdminVendorOrderItem[]): OrderRow[] {
    return orders.map((order) => {
      const placedAt = new Date(order.placedAtUtc);
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customerName,
        customerLocation: '-',
        date: placedAt.toLocaleDateString(this.currentLang === 'ar' ? 'ar-EG' : 'en-US'),
        time: placedAt.toLocaleTimeString(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        amount: this.formatNumber(order.totalAmount),
        paymentStatusKey: this.mapPaymentStatusKey(order.paymentStatus),
        shippingStatusKey: this.mapOrderStatusKey(order.status),
        generalStatusKey: this.mapOrderStatusKey(order.status)
      };
    });
  }

  private mapPaymentStatusKey(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'VENDOR_ORDERS.PAYMENT_STATUS.PAID';
      case 'refunded':
      case 'partiallyrefunded':
        return 'VENDOR_ORDERS.PAYMENT_STATUS.REFUNDED';
      default:
        return 'VENDOR_ORDERS.PAYMENT_STATUS.PENDING';
    }
  }

  private mapOrderStatusKey(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'VENDOR_ORDERS.GENERAL_STATUS.COMPLETED';
      case 'cancelled':
        return 'VENDOR_ORDERS.GENERAL_STATUS.CANCELLED';
      case 'placed':
      case 'preparing':
      case 'ontheway':
        return 'VENDOR_ORDERS.GENERAL_STATUS.IN_PROGRESS';
      default:
        return 'VENDOR_ORDERS.GENERAL_STATUS.NEW';
    }
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }
}
