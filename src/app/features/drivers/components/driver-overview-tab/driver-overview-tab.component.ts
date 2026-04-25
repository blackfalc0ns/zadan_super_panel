import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { KeyValueGridComponent } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { DriverDetailRecord } from '../../models/drivers.models';
import { getVehicleTypeKey } from '../../utils/driver-ui.utils';

@Component({
  selector: 'app-driver-overview-tab',
  standalone: true,
  imports: [CommonModule, TranslateModule, KeyValueGridComponent, SectionHeaderComponent],
  templateUrl: './driver-overview-tab.component.html'
})
export class DriverOverviewTabComponent {
  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() isRTL = true;
  @Output() tabChange = new EventEmitter<string>();

  get personalInfoItems() {
    return [
      { label: 'DRIVERS.DETAIL.OVERVIEW.FULL_NAME', value: `${this.driver.firstName} ${this.driver.lastName}` },
      { label: 'DRIVERS.DETAIL.OVERVIEW.PHONE_NUMBER', value: this.driver.phoneNumber, direction: 'ltr' as const },
      { label: 'DRIVERS.DETAIL.OVERVIEW.EMAIL', value: this.driver.email, direction: 'ltr' as const },
      { label: 'DRIVERS.DETAIL.OVERVIEW.CITY', value: this.driver.city },
      { label: 'DRIVERS.DETAIL.OVERVIEW.JOINED_AT', value: this.driver.joinedAt }
    ];
  }

  get vehicleInfoItems() {
    return [
      {
        label: 'DRIVERS.DETAIL.OVERVIEW.VEHICLE_TYPE',
        value: this.driver.vehicleType ? getVehicleTypeKey(this.driver.vehicleType) : 'COMMON.NOT_AVAILABLE',
        translateValue: true
      },
      {
        label: 'DRIVERS.DETAIL.OVERVIEW.LICENSE_NUMBER',
        value: this.driver.licenseNumber || 'COMMON.NOT_AVAILABLE',
        direction: 'ltr' as const,
        translateValue: !this.driver.licenseNumber
      },
      {
        label: 'DRIVERS.DETAIL.OVERVIEW.ZONE',
        value: this.driver.zoneName || this.driver.liveZone || 'COMMON.NOT_AVAILABLE',
        translateValue: !this.driver.zoneName && !this.driver.liveZone
      }
    ];
  }

  get hasSupportUpdateTimestamp(): boolean {
    return !!this.driver.support.lastUpdateLabel
      && !this.driver.support.lastUpdateLabel.startsWith('DRIVERS.')
      && !this.driver.support.lastUpdateLabel.startsWith('COMMON.');
  }
}
