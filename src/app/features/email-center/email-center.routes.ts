import { Routes } from '@angular/router';
import { apiSessionGuard } from '../../core/guards/api-session.guard';
import { HasPermissionGuard } from '../../core/guards/has-permission.guard';

export const EMAIL_CENTER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [apiSessionGuard, HasPermissionGuard],
    data: { permission: 'email_center.view' },
    loadComponent: () => import('./pages/email-center-hub.component').then((m) => m.EmailCenterHubComponent)
  },
  {
    path: 'history',
    canActivate: [apiSessionGuard, HasPermissionGuard],
    data: { permission: 'email_center.view' },
    loadComponent: () => import('./pages/email-center-history.component').then((m) => m.EmailCenterHistoryComponent)
  },
  {
    path: 'rules/:ruleId',
    canActivate: [apiSessionGuard, HasPermissionGuard],
    data: { permission: 'email_center.view' },
    loadComponent: () => import('./pages/email-center-rule-detail.component').then((m) => m.EmailCenterRuleDetailComponent)
  }
];
