import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
    { path: 'login', redirectTo: 'dashboard', pathMatch: 'full' },
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'drivers', loadComponent: () => import('./features/drivers/drivers-list/drivers-list.component').then(m => m.DriversListComponent) },
            { path: 'drivers/:id', loadComponent: () => import('./features/drivers/driver-detail/driver-detail.component').then(m => m.DriverDetailComponent) },
            { path: 'vendors', loadComponent: () => import('./features/vendors/vendors-list/vendors-list.component').then(m => m.VendorsListComponent) },
            { path: 'customers', loadComponent: () => import('./features/customers/customers-list/customers-list.component').then(m => m.CustomersListComponent) },
            { path: 'customers/:id', loadComponent: () => import('./features/customers/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent) },
            { path: 'vendors/:id', loadComponent: () => import('./features/vendors/vendor-detail/vendor-detail.component').then(m => m.VendorDetailComponent) },
            { path: 'catalog', loadChildren: () => import('./features/catalog/catalog.module').then(m => m.CatalogModule) },
            { path: 'disputes', loadComponent: () => import('./features/disputes/disputes-dashboard/disputes-dashboard.component').then(m => m.DisputesDashboardComponent) },
            { path: 'orders', loadChildren: () => import('./features/orders/orders.routes').then(m => m.ORDERS_ROUTES) },
            { path: 'finances', loadChildren: () => import('./features/finances/finances.routes').then(m => m.FINANCES_ROUTES) },
        ]
    },
    { path: '**', redirectTo: '' }
];
