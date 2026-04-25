import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { KpiCardsComponent, KPICard } from '../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { DriverDetailRecord } from '../../models/drivers.models';

@Component({
  selector: 'app-driver-performance-tab',
  standalone: true,
  imports: [CommonModule, TranslateModule, KpiCardsComponent, SectionHeaderComponent],
  templateUrl: './driver-performance-tab.component.html'
})
export class DriverPerformanceTabComponent {
  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() isRTL = true;
  protected readonly Math = Math;

  get performanceKpis(): KPICard[] {
    return this.driver.performanceSnapshot.metricCards.map((metric: any) => {
      const isPositive = metric.deltaLabel?.startsWith('+');
      return {
        id: metric.id,
        title: metric.title,
        value: metric.value,
        icon: '<span class="material-symbols-outlined">analytics</span>',
        color: metric.tone === 'success' ? '#10b981' : metric.tone === 'danger' ? '#ef4444' : '#64748b',
        trend: metric.deltaLabel ? {
          value: metric.deltaLabel.replace(/[+-]/g, ''),
          isPositive: isPositive
        } : undefined
      };
    });
  }
}
