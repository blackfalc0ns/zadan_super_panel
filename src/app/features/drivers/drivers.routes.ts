import { Routes } from '@angular/router';

export const DRIVERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list/drivers-list/drivers-list.component').then((m) => m.DriversListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/detail/driver-detail/driver-detail.component').then((m) => m.DriverDetailComponent)
  }
];
