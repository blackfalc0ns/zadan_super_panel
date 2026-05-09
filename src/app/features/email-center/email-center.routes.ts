import { Routes } from '@angular/router';
import { apiSessionGuard } from '../../core/guards/api-session.guard';
import { HasPermissionGuard } from '../../core/guards/has-permission.guard';

export const EMAIL_CENTER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [apiSessionGuard, HasPermissionGuard],
    data: {
      permission: 'email_center.view'
    },
    loadComponent: () => import('./pages/email-center.component').then((m) => m.EmailCenterComponent)
  }
];
