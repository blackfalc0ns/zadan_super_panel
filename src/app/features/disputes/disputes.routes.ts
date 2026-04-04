import { Routes } from '@angular/router';

export const DISPUTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/disputes-dashboard/disputes-dashboard.component').then((m) => m.DisputesDashboardComponent)
  }
];
