import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InlineBannerComponent } from '../../../shared/components/ui/inline-banner/inline-banner.component';
import { SectionHeaderComponent } from '../../../shared/components/ui/section-header/section-header.component';

interface AnalyticsMetric {
  titleKey: string;
  value: string;
  trend: string;
  trendIcon: string;
  trendColor: string;
  valueSuffixKey?: string;
  trendSuffixKey?: string;
}

interface BestSeller {
  nameKey: string;
  salesKey: string;
  price: string;
  image: string;
}

@Component({
  selector: 'app-vendor-analytics',
  standalone: true,
  imports: [CommonModule, TranslateModule, InlineBannerComponent, SectionHeaderComponent],
  templateUrl: './vendor-analytics.component.html'
})
export class VendorAnalyticsComponent {
  currentLang: string = 'ar';
  isRTL: boolean = true;

  constructor(private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';
    
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === 'ar';
    });
  }

  metrics: AnalyticsMetric[] = [
    { titleKey: 'VENDOR_ANALYTICS.METRICS.CANCELLATION_RATE', value: '2.1%', trend: '-0.5%', trendIcon: 'trending_down', trendColor: 'text-red-500' },
    { titleKey: 'VENDOR_ANALYTICS.METRICS.RETURN_RATE', value: '1.5%', trend: '-0.2%', trendIcon: 'trending_down', trendColor: 'text-red-500' },
    { titleKey: 'VENDOR_ANALYTICS.METRICS.AVERAGE_ORDER_VALUE', value: 'SAR 150', trend: '+5%', trendIcon: 'trending_up', trendColor: 'text-green-500' },
    { titleKey: 'VENDOR_ANALYTICS.METRICS.PREPARATION_SPEED', value: '1.2', trend: '+0.1', trendIcon: 'schedule', trendColor: 'text-blue-500', valueSuffixKey: 'VENDOR_ANALYTICS.DAY', trendSuffixKey: 'VENDOR_ANALYTICS.DAY' },
    { titleKey: 'VENDOR_ANALYTICS.METRICS.ON_TIME_DELIVERY', value: '98%', trend: '+1%', trendIcon: 'trending_up', trendColor: 'text-green-500' },
    { titleKey: 'VENDOR_ANALYTICS.METRICS.CUSTOMER_RATING', value: '4.8', trend: '+0.1', trendIcon: 'star', trendColor: 'text-yellow-500' }
  ];

  bestSellers: BestSeller[] = [
    { nameKey: 'VENDOR_ANALYTICS.BEST_SELLERS.WATCH_NAME', salesKey: 'VENDOR_ANALYTICS.BEST_SELLERS.WATCH_SALES', price: 'SAR 24,000', image: 'watch' },
    { nameKey: 'VENDOR_ANALYTICS.BEST_SELLERS.HEADPHONES_NAME', salesKey: 'VENDOR_ANALYTICS.BEST_SELLERS.HEADPHONES_SALES', price: 'SAR 12,750', image: 'headphones' },
    { nameKey: 'VENDOR_ANALYTICS.BEST_SELLERS.CHARGER_NAME', salesKey: 'VENDOR_ANALYTICS.BEST_SELLERS.CHARGER_SALES', price: 'SAR 5,400', image: 'charger' }
  ];
}
