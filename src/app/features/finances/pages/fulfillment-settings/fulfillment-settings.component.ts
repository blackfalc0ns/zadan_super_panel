import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PickupSettingsComponent } from '@orders/public-api';

@Component({
  selector: 'app-fulfillment-settings',
  standalone: true,
  imports: [PickupSettingsComponent],
  template: '<app-pickup-settings />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FulfillmentSettingsComponent {}
