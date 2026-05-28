import { Routes } from '@angular/router';
import { HasPermissionGuard } from '../../core/guards/has-permission.guard';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [HasPermissionGuard],
    data: { permission: 'customers.view' },
    loadComponent: () => import('./pages/list/customers-list/customers-list.component').then((m) => m.CustomersListComponent)
  },
  {
    path: ':id',
    canActivate: [HasPermissionGuard],
    data: { permission: 'customers.view' },
    loadComponent: () => import('./pages/detail/customer-detail/customer-detail.component').then((m) => m.CustomerDetailComponent)
  }
];
