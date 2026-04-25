import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DriverStatus, VerificationStatus } from '@drivers/models/drivers.domain.models';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { DriverDetailRecord } from '../../models/drivers.models';
import {
  getDriverStatusKey,
  getVerificationKey,
  getVerificationVariant,
  getComplianceVariant
} from '../../utils/driver-ui.utils';

@Component({
  selector: 'app-driver-hero',
  standalone: true,
  imports: [CommonModule, TranslateModule, StatusPillComponent],
  templateUrl: './driver-hero.component.html'
})
export class DriverHeroComponent {
  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() isRTL = true;
  
  @Output() editDriverRequested = new EventEmitter<void>();
  @Output() openTasksRequested = new EventEmitter<void>();
  @Output() toggleSuspensionRequested = new EventEmitter<void>();

  get driverStatusLabel(): string {
    return getDriverStatusKey(this.driver.status);
  }

  get verificationLabel(): string {
    return getVerificationKey(this.driver.verificationStatus);
  }

  get verificationVariant(): ReturnType<typeof getVerificationVariant> {
    return getVerificationVariant(this.driver.verificationStatus);
  }

  get complianceVariant(): StatusPillVariant {
    return getComplianceVariant(this.driver.complianceStatusVariant);
  }
}
