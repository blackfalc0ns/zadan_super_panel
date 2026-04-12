import { Routes } from '@angular/router';

export const ADMIN_USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list/admin-users-list.component').then((m) => m.AdminUsersListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/detail/admin-user-detail.component').then((m) => m.AdminUserDetailComponent)
  }
];
