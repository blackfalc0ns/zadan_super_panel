import { Routes } from '@angular/router';
import { VendorDetailShellComponent } from './pages/detail/vendor-detail-shell/vendor-detail-shell.component';
import { VendorDetailFacade } from './services/vendor-detail.facade';

export const VENDORS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list/vendors-list/vendors-list.component').then((m) => m.VendorsListComponent)
  },
  {
    path: ':id',
    component: VendorDetailShellComponent,
    providers: [VendorDetailFacade],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () => import('./components/vendor-overview/vendor-overview.component').then((m) => m.VendorOverviewComponent),
        data: { tabId: 'overview' }
      },
      {
        path: 'data',
        loadComponent: () => import('./pages/detail/vendor-detail/vendor-detail.component').then((m) => m.VendorDetailComponent),
        data: { tabId: 'data' }
      },
      {
        path: 'analytics',
        loadComponent: () => import('./components/vendor-analytics/vendor-analytics.component').then((m) => m.VendorAnalyticsComponent),
        data: { tabId: 'analytics' }
      },
      {
        path: 'products',
        loadComponent: () => import('./components/vendor-products/vendor-products.component').then((m) => m.VendorProductsComponent),
        data: { tabId: 'products' }
      },
      {
        path: 'orders',
        loadComponent: () => import('./components/vendor-orders/vendor-orders.component').then((m) => m.VendorOrdersComponent),
        data: { tabId: 'orders' }
      },
      {
        path: 'finance',
        loadComponent: () => import('./components/vendor-finance/vendor-finance.component').then((m) => m.VendorFinanceComponent),
        data: { tabId: 'finance' }
      },
      {
        path: 'compliance',
        loadComponent: () => import('./components/vendor-compliance/vendor-compliance.component').then((m) => m.VendorComplianceComponent),
        data: { tabId: 'compliance' }
      },
      {
        path: 'workspace',
        loadComponent: () => import('./components/vendor-workspace/vendor-workspace.component').then((m) => m.VendorWorkspaceComponent),
        data: { tabId: 'workspace' }
      },
      {
        path: 'logs',
        loadComponent: () => import('./components/vendor-activity-log/vendor-activity-log.component').then((m) => m.VendorActivityLogComponent),
        data: { tabId: 'logs' }
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/vendor-settings/vendor-settings.component').then((m) => m.VendorSettingsComponent),
        data: { tabId: 'settings' }
      }
    ]
  }
];
