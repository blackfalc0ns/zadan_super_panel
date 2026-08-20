import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeaturePlaceholderPageComponent } from '@shared/components/ui/feature-placeholder-page/feature-placeholder-page.component';

// TODO(super-panel): Wire BankAccountVerification to a real IBAN verification queue or remove this route from the screen map.
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-bank-account-verification',
  standalone: true,
  imports: [FeaturePlaceholderPageComponent],
  template: `
    <app-feature-placeholder-page
      title="Bank Account Verification"
      subtitle="Finance and vendor verification queue for pending bank records."
      eyebrow="Vendors"
      description="This route is reserved for the dedicated verification workflow described in the super admin screen map."
      [primaryRoute]="['/vendors']"
      primaryLabel="Back to Vendors">
    </app-feature-placeholder-page>
  `
})
export class BankAccountVerificationComponent {}
