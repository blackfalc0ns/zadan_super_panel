import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vendor-analytics',
  standalone: true,
  imports: [CommonModule, TranslateModule],
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

  metrics = [
    { title: 'معدل الإلغاء', value: '2.1%', trend: '-0.5%', trendIcon: 'trending_down', trendColor: 'text-red-500' },
    { title: 'معدل الاسترجاع', value: '1.5%', trend: '-0.2%', trendIcon: 'trending_down', trendColor: 'text-red-500' },
    { title: 'متوسط قيمة الطلب', value: 'SAR 150', trend: '+5%', trendIcon: 'trending_up', trendColor: 'text-green-500' },
    { title: 'سرعة التجهيز', value: '1.2 يوم', trend: '+0.1 يوم', trendIcon: 'schedule', trendColor: 'text-blue-500' },
    { title: 'التسليم في الوقت', value: '98%', trend: '+1%', trendIcon: 'trending_up', trendColor: 'text-green-500' },
    { title: 'تقييم العملاء', value: '4.8', trend: '+0.1', trendIcon: 'star', trendColor: 'text-yellow-500' }
  ];

  bestSellers = [
    { name: 'ساعة ذكية الإصدار الأخير', sales: '120 طلب', price: 'SAR 24,000', image: 'watch' },
    { name: 'سماعات رأس لاسلكية', sales: '85 طلب', price: 'SAR 12,750', image: 'headphones' },
    { name: 'شاحن لاسلكي سريع', sales: '60 طلب', price: 'SAR 5,400', image: 'charger' }
  ];
}
