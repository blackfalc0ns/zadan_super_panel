import { Routes } from '@angular/router';
import { HasPermissionGuard } from '../../core/guards/has-permission.guard';

export const DRIVERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [HasPermissionGuard],
    data: { permission: 'drivers.view' },
    loadComponent: () => import('./pages/list/drivers-list/drivers-list.component').then((m) => m.DriversListComponent)
  },
  {
    path: ':id',
    canActivate: [HasPermissionGuard],
    data: { permission: 'drivers.view' },
    loadComponent: () => import('./pages/detail/driver-detail/driver-detail.component').then((m) => m.DriverDetailComponent)
  }
];
