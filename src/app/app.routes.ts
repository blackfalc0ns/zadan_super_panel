import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { authChildGuard, authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { HasPermissionGuard } from './core/guards/has-permission.guard';

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
    path: 'unauthorized',
    canActivate: [authGuard],
    loadComponent: () => import('./core/pages/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        canActivate: [HasPermissionGuard],
        data: { permission: 'dashboard.view' },
        loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
      },
      {
        path: 'vendors',
        canActivate: [HasPermissionGuard],
        data: { permission: 'vendors.view' },
        loadChildren: () => import('./features/vendors/vendors.routes').then((m) => m.VENDORS_ROUTES)
      },
      {
        path: 'catalog',
        canActivate: [HasPermissionGuard],
        data: { permission: 'catalog.view' },
        loadChildren: () => import('./features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES)
      },
      {
        path: 'orders',
        canActivate: [HasPermissionGuard],
        data: { permission: 'orders.view' },
        loadChildren: () => import('./features/orders/orders.routes').then((m) => m.ORDERS_ROUTES)
      },
      {
        path: 'customers',
        canActivate: [HasPermissionGuard],
        data: { permission: 'customers.view' },
        loadChildren: () => import('./features/customers/customers.routes').then((m) => m.CUSTOMERS_ROUTES)
      },
      {
        path: 'drivers',
        canActivate: [HasPermissionGuard],
        data: { permission: 'drivers.view' },
        loadChildren: () => import('./features/drivers/drivers.routes').then((m) => m.DRIVERS_ROUTES)
      },
      {
        path: 'support',
        canActivate: [HasPermissionGuard],
        data: { anyPermissions: ['orders.view', 'disputes.view', 'vendors.view'] },
        loadChildren: () => import('./features/support/support.routes').then((m) => m.SUPPORT_ROUTES)
      },
      {
        path: 'disputes',
        canActivate: [HasPermissionGuard],
        data: { permission: 'disputes.view' },
        loadChildren: () => import('./features/disputes/disputes.routes').then((m) => m.DISPUTES_ROUTES)
      },
      {
        path: 'finances',
        canActivate: [HasPermissionGuard],
        data: { permission: 'finances.view' },
        loadChildren: () => import('./features/finances/finances.routes').then((m) => m.FINANCES_ROUTES)
      },
      {
        path: 'marketing',
        canActivate: [HasPermissionGuard],
        data: { permission: 'marketing.view' },
        loadChildren: () => import('./features/marketing/marketing.routes').then((m) => m.MARKETING_ROUTES)
      },
      {
        path: 'notifications',
        canActivate: [HasPermissionGuard],
        data: { permission: 'admin_notifications.view' },
        loadChildren: () => import('./features/notifications/notifications.routes').then((m) => m.NOTIFICATIONS_ROUTES)
      },
      {
        path: 'admin-users',
        canActivate: [HasPermissionGuard],
        data: { permission: 'users_access.view' },
        loadChildren: () => import('./features/admin-users/admin-users.routes').then((m) => m.ADMIN_USERS_ROUTES)
      },
      {
        path: 'profile',
        canActivate: [HasPermissionGuard],
        data: { permission: 'admin_account.view' },
        loadComponent: () => import('./features/profile/pages/admin-profile/admin-profile.component').then((m) => m.AdminProfileComponent)
      },
      {
        path: 'live-ops',
        canActivate: [HasPermissionGuard],
        data: { permission: 'system.view' },
        loadComponent: () => import('./features/live-ops/pages/live-ops.component').then((m) => m.LiveOpsComponent)
      },
      {
        path: 'system-logs',
        canActivate: [HasPermissionGuard],
        data: { permission: 'system.view' },
        loadComponent: () => import('./features/system-logs/pages/system-logs.component').then((m) => m.SystemLogsComponent)
      },
      {
        path: 'email-center',
        canActivate: [HasPermissionGuard],
        data: { permission: 'email_center.view' },
        loadChildren: () => import('./features/email-center/email-center.routes').then((m) => m.EMAIL_CENTER_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
