import { Routes } from '@angular/router';
import { MarketingShellComponent } from './pages/shell/marketing-shell/marketing-shell.component';
import { HasPermissionGuard } from '../../core/guards/has-permission.guard';

export const MARKETING_ROUTES: Routes = [
  {
    path: '',
    component: MarketingShellComponent,
    canActivate: [HasPermissionGuard],
    data: { permission: 'marketing.view' },
    children: [
      { path: '', redirectTo: 'banners', pathMatch: 'full' },
      {
        path: 'coupons',
        canActivate: [HasPermissionGuard],
        data: { permission: 'marketing.view' },
        loadComponent: () => import('./pages/coupons/marketing-coupons.component').then((m) => m.MarketingCouponsComponent)
      },
      {
        path: 'banners',
        canActivate: [HasPermissionGuard],
        data: { permission: 'marketing.view' },
        loadComponent: () => import('./pages/banners/marketing-banners.component').then((m) => m.MarketingBannersComponent)
      },
      {
        path: 'featured-products',
        canActivate: [HasPermissionGuard],
        data: { permission: 'marketing.view' },
        loadComponent: () =>
          import('./pages/featured-products/marketing-featured-products.component').then(
            (m) => m.MarketingFeaturedProductsComponent
          )
      },
      {
        path: 'home-sections',
        canActivate: [HasPermissionGuard],
        data: { permission: 'marketing.view' },
        loadComponent: () =>
          import('./pages/home-sections/marketing-home-sections.component').then((m) => m.MarketingHomeSectionsComponent)
      },
      {
        path: 'home-visibility',
        canActivate: [HasPermissionGuard],
        data: { permission: 'marketing.manage_settings' },
        loadComponent: () =>
          import('./pages/home-visibility/marketing-home-visibility.component').then(
            (m) => m.MarketingHomeVisibilityComponent
          )
      }
    ]
  }
];
