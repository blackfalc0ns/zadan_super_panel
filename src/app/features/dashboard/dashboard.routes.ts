import { Routes } from '@angular/router';
import { HasPermissionGuard } from '../../core/guards/has-permission.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    canActivate: [HasPermissionGuard],
    data: { permission: 'dashboard.view' },
    loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  }
];
