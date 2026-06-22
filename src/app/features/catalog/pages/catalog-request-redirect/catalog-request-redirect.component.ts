import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogRequestType } from '@catalog/models/catalog.domain.models';
import { buildCatalogRequestManagementUrl } from '../../utils/catalog-request-navigation.util';

@Component({
  selector: 'app-catalog-request-redirect',
  standalone: true,
  template: ''
})
export class CatalogRequestRedirectComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const requestType = (this.route.snapshot.data['requestType'] as CatalogRequestType | undefined) ?? 'product';
    const requestId = this.route.snapshot.paramMap.get('id');
    const target = buildCatalogRequestManagementUrl(requestType, requestId);
    void this.router.navigateByUrl(target, { replaceUrl: true });
  }
}
