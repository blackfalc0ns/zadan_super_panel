import { Routes } from '@angular/router';
import { HasPermissionGuard } from '../../core/guards/has-permission.guard';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [HasPermissionGuard],
    data: { permission: 'admin_notifications.view' },
    loadComponent: () => import('./pages/notifications-center/notifications-center.component').then((m) => m.NotificationsCenterComponent)
  }
];
