import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import type { EChartsOption } from 'echarts';
import { NgxEchartsDirective } from 'ngx-echarts';

@Component({
  selector: 'app-dashboard-orders-windows',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgxEchartsDirective],
  templateUrl: './dashboard-orders-windows.component.html',
  styleUrl: './dashboard-orders-windows.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardOrdersWindowsComponent {
  @Input() regionPressureOptions: EChartsOption = {};
  @Input() queueMixOptions: EChartsOption = {};
  @Input() riskExceptionsOptions: EChartsOption = {};
}
