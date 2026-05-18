import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { authChildGuard, authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'change-temporary-password',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/pages/change-temporary-password/change-temporary-password.component').then((m) => m.ChangeTemporaryPasswordComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES) },
      { path: 'vendors', loadChildren: () => import('./features/vendors/vendors.routes').then((m) => m.VENDORS_ROUTES) },
      { path: 'catalog', loadChildren: () => import('./features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES) },
      { path: 'orders', loadChildren: () => import('./features/orders/orders.routes').then((m) => m.ORDERS_ROUTES) },
      { path: 'customers', loadChildren: () => import('./features/customers/customers.routes').then((m) => m.CUSTOMERS_ROUTES) },
      { path: 'drivers', loadChildren: () => import('./features/drivers/drivers.routes').then((m) => m.DRIVERS_ROUTES) },
      { path: 'disputes', loadChildren: () => import('./features/disputes/disputes.routes').then((m) => m.DISPUTES_ROUTES) },
      { path: 'finances', loadChildren: () => import('./features/finances/finances.routes').then((m) => m.FINANCES_ROUTES) },
      { path: 'marketing', loadChildren: () => import('./features/marketing/marketing.routes').then((m) => m.MARKETING_ROUTES) },
      { path: 'notifications', loadChildren: () => import('./features/notifications/notifications.routes').then((m) => m.NOTIFICATIONS_ROUTES) },
      { path: 'admin-users', loadChildren: () => import('./features/admin-users/admin-users.routes').then((m) => m.ADMIN_USERS_ROUTES) },
      { path: 'profile', loadComponent: () => import('./features/profile/pages/admin-profile/admin-profile.component').then((m) => m.AdminProfileComponent) },
      { path: 'live-ops', loadComponent: () => import('./features/live-ops/pages/live-ops.component').then((m) => m.LiveOpsComponent) },
      { path: 'system-logs', loadComponent: () => import('./features/system-logs/pages/system-logs.component').then((m) => m.SystemLogsComponent) },
      { path: 'email-center', loadChildren: () => import('./features/email-center/email-center.routes').then((m) => m.EMAIL_CENTER_ROUTES) }
    ]
  },
  { path: '**', redirectTo: '' }
];

