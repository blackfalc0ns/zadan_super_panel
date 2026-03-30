import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { authChildGuard, authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        canActivateChild: [authChildGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'drivers', loadComponent: () => import('./features/drivers/pages/list/drivers-list/drivers-list.component').then(m => m.DriversListComponent) },
            { path: 'drivers/:id', loadComponent: () => import('./features/drivers/pages/detail/driver-detail/driver-detail.component').then(m => m.DriverDetailComponent) },
            { path: 'vendors', loadComponent: () => import('./features/vendors/pages/list/vendors-list/vendors-list.component').then(m => m.VendorsListComponent) },
            { path: 'customers', loadComponent: () => import('./features/customers/pages/list/customers-list/customers-list.component').then(m => m.CustomersListComponent) },
            { path: 'customers/:id', loadComponent: () => import('./features/customers/pages/detail/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent) },
            { path: 'vendors/:id', loadComponent: () => import('./features/vendors/pages/detail/vendor-detail/vendor-detail.component').then(m => m.VendorDetailComponent) },
            { path: 'catalog', loadChildren: () => import('./features/catalog/catalog.routes').then(m => m.CATALOG_ROUTES) },
            { path: 'disputes', loadComponent: () => import('./features/disputes/pages/dashboard/disputes-dashboard/disputes-dashboard.component').then(m => m.DisputesDashboardComponent) },
            { path: 'orders', loadChildren: () => import('./features/orders/orders.routes').then(m => m.ORDERS_ROUTES) },
            { path: 'finances', loadChildren: () => import('./features/finances/finances.routes').then(m => m.FINANCES_ROUTES) },
        ]
    },
    { path: '**', redirectTo: '' }
];

