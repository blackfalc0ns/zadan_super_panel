import { Routes } from '@angular/router';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list/customers-list/customers-list.component').then((m) => m.CustomersListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/detail/customer-detail/customer-detail.component').then((m) => m.CustomerDetailComponent)
  }
];
