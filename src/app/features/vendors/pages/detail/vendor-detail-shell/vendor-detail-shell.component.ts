import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VendorDetailHeaderComponent } from '@vendors/components/sections/vendor-detail-header/vendor-detail-header.component';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';
import {
  DEFAULT_VENDOR_DETAIL_TAB,
  getLegacyVendorDetailTab,
  getVendorRouteChildTab
} from '@vendors/utils/vendor-route.utils';

@Component({
  selector: 'app-vendor-detail-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, VendorDetailHeaderComponent],
  template: `
    <app-vendor-detail-header
      [activeTab]="activeTab"
      (tabChanged)="onTabChange($event)">
    </app-vendor-detail-header>

    <router-outlet></router-outlet>
  `
})
export class VendorDetailShellComponent implements OnInit {
  activeTab = DEFAULT_VENDOR_DETAIL_TAB;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {}

  ngOnInit(): void {
    this.syncActiveTab();

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const vendorId = params.get('id');

        if (vendorId) {
          this.vendorDetailFacade.loadVendor(vendorId);
        }
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.syncActiveTab());
  }

  onTabChange(tabId: string): void {
    this.router.navigate([tabId], { relativeTo: this.route });
  }

  private syncActiveTab(): void {
    const currentChildTab = getVendorRouteChildTab(this.route);
    const legacyTab = getLegacyVendorDetailTab(this.route.snapshot.queryParamMap.get('tab'));

    if (!currentChildTab && legacyTab) {
      this.activeTab = legacyTab;
      void this.router.navigate([legacyTab], {
        relativeTo: this.route,
        queryParams: { tab: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
      return;
    }

    this.activeTab = currentChildTab ?? DEFAULT_VENDOR_DETAIL_TAB;
  }
}
