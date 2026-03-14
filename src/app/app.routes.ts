import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { LayoutComponent } from './core/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'vendors', loadComponent: () => import('./features/vendors/vendors-list/vendors-list.component').then(m => m.VendorsListComponent) },
            { path: 'vendors/:id', loadComponent: () => import('./features/vendors/vendor-detail/vendor-detail.component').then(m => m.VendorDetailComponent) },
            { path: 'catalog', loadChildren: () => import('./features/catalog/catalog.module').then(m => m.CatalogModule) },
        ]
    },
    { path: '**', redirectTo: '' }
];
