import { Routes } from '@angular/router';
import { MarketingShellComponent } from './pages/shell/marketing-shell/marketing-shell.component';

export const MARKETING_ROUTES: Routes = [
  {
    path: '',
    component: MarketingShellComponent,
    children: [
      { path: '', redirectTo: 'banners', pathMatch: 'full' },
      {
        path: 'coupons',
        loadComponent: () => import('./pages/coupons/marketing-coupons.component').then((m) => m.MarketingCouponsComponent)
      },
      {
        path: 'banners',
        loadComponent: () => import('./pages/banners/marketing-banners.component').then((m) => m.MarketingBannersComponent)
      },
      {
        path: 'featured-products',
        loadComponent: () =>
          import('./pages/featured-products/marketing-featured-products.component').then(
            (m) => m.MarketingFeaturedProductsComponent
          )
      },
      {
        path: 'home-sections',
        loadComponent: () =>
          import('./pages/home-sections/marketing-home-sections.component').then((m) => m.MarketingHomeSectionsComponent)
      },
      {
        path: 'home-visibility',
        loadComponent: () =>
          import('./pages/home-visibility/marketing-home-visibility.component').then(
            (m) => m.MarketingHomeVisibilityComponent
          )
      }
    ]
  }
];
