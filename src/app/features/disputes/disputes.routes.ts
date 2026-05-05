import { Routes } from '@angular/router';
import { HasPermissionGuard } from '../../core/guards/has-permission.guard';

export const DISPUTES_ROUTES: Routes = [
  {
    canActivate: [HasPermissionGuard],
    data: {
      permission: 'disputes.view'
    },
    path: '',
    loadComponent: () => import('./pages/dashboard/disputes-dashboard/disputes-dashboard.component').then((m) => m.DisputesDashboardComponent)
  }
];
