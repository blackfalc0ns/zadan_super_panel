import { Routes } from '@angular/router';
import { HasPermissionGuard } from '../../core/guards/has-permission.guard';

export const ADMIN_USERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [HasPermissionGuard],
    data: { permission: 'users_access.view' },
    loadComponent: () => import('./pages/list/admin-users-list.component').then((m) => m.AdminUsersListComponent)
  },
  {
    path: 'roles',
    canActivate: [HasPermissionGuard],
    data: { permission: 'users_access.manage_settings' },
    loadComponent: () => import('./pages/roles/roles-management.component').then((m) => m.RolesManagementComponent)
  },
  {
    path: ':id',
    canActivate: [HasPermissionGuard],
    data: { permission: 'users_access.view' },
    loadComponent: () => import('./pages/detail/admin-user-detail.component').then((m) => m.AdminUserDetailComponent)
  }
];
