import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardSeriesChart } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard-charts',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgxEchartsDirective],
  templateUrl: './dashboard-charts.component.html',
  styles: [':host { display: block; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardChartsComponent {
  @Input() ordersTrend!: DashboardSeriesChart;
  @Input() revenueTrend!: DashboardSeriesChart;
  @Input() ordersTrendOptions: EChartsOption = {};
  @Input() revenueTrendOptions: EChartsOption = {};
  @Input() ordersBarsOptions: EChartsOption = {};
  @Input() revenueBarsOptions: EChartsOption = {};
  @Input() vendorReadinessOptions: EChartsOption = {};
  @Input() driverReadinessOptions: EChartsOption = {};
  @Input() vendorReadinessBarOptions: EChartsOption = {};
  @Input() driverReadinessBarOptions: EChartsOption = {};
}
