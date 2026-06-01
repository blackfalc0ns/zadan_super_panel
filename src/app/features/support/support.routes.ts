import { Routes } from '@angular/router';
import { HasPermissionGuard } from '../../core/guards/has-permission.guard';

export const SUPPORT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [HasPermissionGuard],
    data: {
      anyPermissions: ['orders.view', 'disputes.view', 'vendors.view']
    },
    loadComponent: () => import('./pages/admin-support-center/admin-support-center.component').then((m) => m.AdminSupportCenterComponent)
  }
];
