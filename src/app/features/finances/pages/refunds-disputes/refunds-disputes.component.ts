import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-refunds-disputes',
  standalone: true,
  template: ''
})
export class RefundsDisputesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const entityType = params.get('entityType');
    const entityId = params.get('entityId');
    const orderId = params.get('orderId');
    const focus = params.get('focus');

    const queryParams: Record<string, string> = {
      type: 'return_request'
    };

    if (orderId?.trim()) {
      queryParams['search'] = orderId.trim();
    }

    if (focus?.trim()) {
      queryParams['focus'] = focus.trim();
    }

    if (entityType === 'vendor' && entityId?.trim()) {
      queryParams['vendorId'] = entityId.trim();
    }

    if (entityType === 'driver' && entityId?.trim()) {
      queryParams['driverId'] = entityId.trim();
    }

    void this.router.navigate(['/disputes'], {
      queryParams,
      replaceUrl: true
    });
  }
}
