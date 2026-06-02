import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VendorDetailHeaderComponent } from '@vendors/components/sections/vendor-detail-header/vendor-detail-header.component';
import {
  VendorWorkspaceSkeletonComponent,
  VendorWorkspaceSkeletonVariant
} from '@vendors/components/vendor-workspace-skeleton/vendor-workspace-skeleton.component';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';
import {
  DEFAULT_VENDOR_DETAIL_TAB,
  getLegacyVendorDetailTab,
  getVendorRouteChildTab,
  VendorDetailTabId
} from '@vendors/utils/vendor-route.utils';

const TABLE_SKELETON_TABS = new Set<VendorDetailTabId>([
  'products',
  'orders',
  'disputes',
  'finance',
  'logs'
]);

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-vendor-detail-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    VendorDetailHeaderComponent,
    VendorWorkspaceSkeletonComponent,
    TranslateModule
  ],
  templateUrl: './vendor-detail-shell.component.html'
})
export class VendorDetailShellComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  activeTab = DEFAULT_VENDOR_DETAIL_TAB;
  isWorkspaceLoading = true;
  workspaceLoadError: string | null = null;
  skeletonVariant: VendorWorkspaceSkeletonVariant = 'default';
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {}

  ngOnInit(): void {
    this.syncActiveTab();
    this.updateSkeletonVariant();

    this.vendorDetailFacade.isVendorWorkspaceLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => {
        this.isWorkspaceLoading = loading;
        this.cdr.markForCheck();
      });

    this.vendorDetailFacade.mutationError$
      .pipe(
        map((error) => error?.trim() || null),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((error) => {
        this.workspaceLoadError = error;
        this.cdr.markForCheck();
      });

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.cdr.markForCheck();
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
      .subscribe(() => {
        this.cdr.markForCheck();
        this.syncActiveTab();
        this.updateSkeletonVariant();
      });
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
    this.updateSkeletonVariant();
  }

  private updateSkeletonVariant(): void {
    if (this.activeTab === 'compliance') {
      this.skeletonVariant = 'split';
      return;
    }

    if (TABLE_SKELETON_TABS.has(this.activeTab)) {
      this.skeletonVariant = 'table';
      return;
    }

    this.skeletonVariant = 'default';
  }
}
