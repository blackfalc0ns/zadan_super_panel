import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { AdminVendorOrderItem, AdminVendorProductItem, VendorService } from '@vendors/services/vendor.api.service';
import { VendorDetail } from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

interface AnalyticsMetric {
  titleKey: string;
  value: string;
  hintKey: string;
}

@Component({
  selector: 'app-vendor-analytics',
  standalone: true,
  imports: [CommonModule, TranslateModule, InlineBannerComponent, SectionHeaderComponent],
  templateUrl: './vendor-analytics.component.html'
})
export class VendorAnalyticsComponent {
  currentLang = 'ar';
  isRTL = true;
  private readonly destroyRef = inject(DestroyRef);

  vendorDetail: VendorDetail | null = null;
  orders: AdminVendorOrderItem[] = [];
  products: AdminVendorProductItem[] = [];
  metrics: AnalyticsMetric[] = [];

  constructor(
    private readonly translate: TranslateService,
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
        this.rebuildMetrics();
      });

    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
        if (!vendor) {
          return;
        }

        this.vendorDetail = vendor;
        this.loadData(vendor.id);
        this.rebuildMetrics();
      });
  }

  private loadData(vendorId: string): void {
    this.vendorService.getVendorOrders(vendorId, 1, 200)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.orders = response.items ?? [];
          this.rebuildMetrics();
        },
        error: () => {
          this.orders = [];
          this.rebuildMetrics();
        }
      });

    this.vendorService.getVendorProducts(vendorId, 1, 200)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.products = response.items ?? [];
          this.rebuildMetrics();
        },
        error: () => {
          this.products = [];
          this.rebuildMetrics();
        }
      });
  }

  private rebuildMetrics(): void {
    const totalOrders = this.orders.length;
    const cancelledOrders = this.orders.filter((order) => order.status.toLowerCase() === 'cancelled').length;
    const completedOrders = this.orders.filter((order) => order.status.toLowerCase() === 'delivered').length;
    const totalRevenue = this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const activeProducts = this.products.filter((product) => product.isAvailable).length;
    const lowStockProducts = this.products.filter((product) => product.stockQuantity > 0 && product.stockQuantity <= 5).length;
    const outOfStockProducts = this.products.filter((product) => product.stockQuantity <= 0).length;

    this.metrics = [
      {
        titleKey: 'VENDOR_ANALYTICS.METRICS.TOTAL_ORDERS',
        value: this.formatNumber(totalOrders),
        hintKey: 'VENDOR_ANALYTICS.METRICS.TOTAL_ORDERS_HINT'
      },
      {
        titleKey: 'VENDOR_ANALYTICS.METRICS.CANCELLATION_RATE',
        value: totalOrders > 0 ? `${((cancelledOrders / totalOrders) * 100).toFixed(1)}%` : '0%',
        hintKey: 'VENDOR_ANALYTICS.METRICS.CANCELLATION_RATE_HINT'
      },
      {
        titleKey: 'VENDOR_ANALYTICS.METRICS.AVERAGE_ORDER_VALUE',
        value: `${this.formatNumber(averageOrderValue)} ${this.translate.instant('COMMON.CURRENCY_SAR')}`,
        hintKey: 'VENDOR_ANALYTICS.METRICS.AVERAGE_ORDER_VALUE_HINT'
      },
      {
        titleKey: 'VENDOR_ANALYTICS.METRICS.COMPLETED_ORDERS',
        value: this.formatNumber(completedOrders),
        hintKey: 'VENDOR_ANALYTICS.METRICS.COMPLETED_ORDERS_HINT'
      },
      {
        titleKey: 'VENDOR_ANALYTICS.METRICS.AVAILABLE_PRODUCTS',
        value: this.formatNumber(activeProducts),
        hintKey: 'VENDOR_ANALYTICS.METRICS.AVAILABLE_PRODUCTS_HINT'
      },
      {
        titleKey: 'VENDOR_ANALYTICS.METRICS.LOW_STOCK_PRODUCTS',
        value: this.formatNumber(lowStockProducts + outOfStockProducts),
        hintKey: 'VENDOR_ANALYTICS.METRICS.LOW_STOCK_PRODUCTS_HINT'
      }
    ];
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }
}
