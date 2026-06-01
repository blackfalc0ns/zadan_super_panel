import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { DriverDetailRecord } from '../../models/drivers.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-driver-performance-tab',
  standalone: true,
  imports: [CommonModule, TranslateModule, SectionHeaderComponent],
  templateUrl: './driver-performance-tab.component.html'
})
export class DriverPerformanceTabComponent {
  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() isRTL = true;
  protected readonly Math = Math;

  getMetricIcon(id: string): string {
    const key = id?.toLowerCase() || '';
    if (key.includes('acceptance') || key.includes('accept')) {
      return 'thumb_up';
    }
    if (key.includes('cancellation') || key.includes('cancel')) {
      return 'cancel';
    }
    if (key.includes('rating') || key.includes('star')) {
      return 'star';
    }
    if (key.includes('ontime') || key.includes('time') || key.includes('delay')) {
      return 'timer';
    }
    return 'analytics';
  }

  getBenchmarkMax(regionValue: any): number {
    const val = typeof regionValue === 'number' ? regionValue : parseFloat(regionValue || '0');
    return Math.max(100, (isNaN(val) ? 0 : val) * 1.2);
  }

  getDriverWidth(driverValue: any, regionValue: any): number {
    const dVal = typeof driverValue === 'number' ? driverValue : parseFloat(driverValue || '0');
    const max = this.getBenchmarkMax(regionValue);
    const validDVal = isNaN(dVal) ? 0 : dVal;
    return Math.min(100, Math.max(0, (validDVal / max) * 100));
  }

  getRegionMarkerPosition(regionValue: any): number {
    const rVal = typeof regionValue === 'number' ? regionValue : parseFloat(regionValue || '0');
    const max = this.getBenchmarkMax(regionValue);
    const validRVal = isNaN(rVal) ? 0 : rVal;
    return Math.min(100, Math.max(0, (validRVal / max) * 100));
  }
}
