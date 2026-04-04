import { Component } from '@angular/core';
import { FeaturePlaceholderPageComponent } from '@shared/components/ui/feature-placeholder-page/feature-placeholder-page.component';

@Component({
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
