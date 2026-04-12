import { Routes } from '@angular/router';

export const EMAIL_CENTER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/email-center.component').then((m) => m.EmailCenterComponent)
  }
];
