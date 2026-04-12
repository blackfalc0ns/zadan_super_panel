import { Route } from '@angular/router';
import { routes } from './app.routes';
import { VENDORS_ROUTES } from './features/vendors/vendors.routes';
import { VendorDetailShellComponent } from './features/vendors/pages/detail/vendor-detail-shell/vendor-detail-shell.component';
import { DEFAULT_VENDOR_DETAIL_TAB, getLegacyVendorDetailTab } from './features/vendors/utils/vendor-route.utils';

function findRoute(routeList: Route[], path: string): Route | undefined {
  return routeList.find((route) => route.path === path);
}

describe('App Route Structure', () => {
  it('lazy loads each top-level business area from the layout shell', () => {
    const shellRoute = findRoute(routes, '');
    const childRoutes = shellRoute?.children ?? [];

    [
      'dashboard',
      'vendors',
      'catalog',
      'orders',
      'customers',
      'drivers',
      'disputes',
      'finances',
      'marketing',
      'admin-users',
      'email-center'
    ].forEach((path) => {
      const route = findRoute(childRoutes, path);

      expect(route).withContext(`Missing route for "${path}"`).toBeDefined();
      expect(route?.loadChildren).withContext(`"${path}" should use loadChildren`).toEqual(jasmine.any(Function));
    });
  });

  it('redirects the root shell to dashboard', () => {
    const shellRoute = findRoute(routes, '');
    const redirectRoute = findRoute(shellRoute?.children ?? [], '');

    expect(redirectRoute?.redirectTo).toBe('dashboard');
    expect(redirectRoute?.pathMatch).toBe('full');
  });
});

describe('Vendor Route Structure', () => {
  it('uses a dedicated vendor detail shell with tab child routes', () => {
    const detailRoute = findRoute(VENDORS_ROUTES, ':id');

    expect(detailRoute?.component).toBe(VendorDetailShellComponent);

    [
      'overview',
      'data',
      'analytics',
      'products',
      'orders',
      'finance',
      'compliance',
      'logs',
      'settings'
    ].forEach((path) => {
      const route = findRoute(detailRoute?.children ?? [], path);

      expect(route).withContext(`Missing vendor tab route "${path}"`).toBeDefined();
      expect(route?.loadComponent).withContext(`"${path}" should lazy load the tab component`).toEqual(jasmine.any(Function));
      expect(route?.data).toEqual(jasmine.objectContaining({ tabId: path }));
    });
  });

  it('normalizes legacy vendor tab query values to canonical child tabs', () => {
    expect(getLegacyVendorDetailTab('finance')).toBe('finance');
    expect(getLegacyVendorDetailTab('orders')).toBe('orders');
    expect(getLegacyVendorDetailTab('unknown')).toBe(DEFAULT_VENDOR_DETAIL_TAB);
  });
});
