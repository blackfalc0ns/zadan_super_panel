import { Component } from '@angular/core';
import { FeaturePlaceholderPageComponent } from '@shared/components/ui/feature-placeholder-page/feature-placeholder-page.component';

@Component({
  selector: 'app-vendors-applications',
  standalone: true,
  imports: [FeaturePlaceholderPageComponent],
  template: `
    <app-feature-placeholder-page
      title="Vendor Applications"
      subtitle="Pending review queue, document checks, and approval workflows."
      eyebrow="Vendors"
      description="This screen now has a dedicated route so the vendor module can grow independently from the list and detail flows."
      [primaryRoute]="['/vendors']"
      primaryLabel="Back to Vendors">
    </app-feature-placeholder-page>
  `
})
export class VendorsApplicationsComponent {}
