import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { DetailTabNavItem, DetailTabsNavComponent } from '@shared/components/ui/detail-tabs-nav/detail-tabs-nav.component';

@Component({
  selector: 'app-marketing-tabs-inline',
  standalone: true,
  imports: [CommonModule, DetailTabsNavComponent],
  template: `
    <div class="w-full min-w-0">
      <app-detail-tabs-nav [tabs]="tabs" [activeTab]="activeTabId"></app-detail-tabs-nav>
    </div>
  `
})
export class MarketingTabsInlineComponent {
  private readonly destroyRef = inject(DestroyRef);

  private currentUrl = '';

  readonly tabs: DetailTabNavItem[] = [
    { id: 'banners', labelKey: 'MARKETING.TABS.BANNERS', route: '/marketing/banners', icon: 'ad' },
    { id: 'featured-products', labelKey: 'MARKETING.TABS.FEATURED_PRODUCTS', route: '/marketing/featured-products', icon: 'star' },
    { id: 'home-sections', labelKey: 'MARKETING.TABS.HOME_SECTIONS', route: '/marketing/home-sections', icon: 'grid_view' },
    { id: 'home-visibility', labelKey: 'MARKETING.TABS.HOME_VISIBILITY', route: '/marketing/home-visibility', icon: 'visibility' }
  ];

  constructor(private readonly router: Router) {
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        const navigation = event as NavigationEnd;
        this.currentUrl = navigation.urlAfterRedirects || navigation.url;
      });
  }

  get activeTabId(): string {
    return this.tabs.find((tab) => this.currentUrl.includes(tab.route ?? ''))?.id ?? 'banners';
  }
}
