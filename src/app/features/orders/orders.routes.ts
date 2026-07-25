import { Routes } from '@angular/router';
import { OrdersListComponent } from './pages/list/orders-list/orders-list.component';
import { OrderDetailsComponent } from './pages/detail/order-details/order-details.component';
import { HasPermissionGuard } from '../../core/guards/has-permission.guard';

export const ORDERS_ROUTES: Routes = [
    {
        path: '',
        component: OrdersListComponent,
        canActivate: [HasPermissionGuard],
        data: { permission: 'orders.view' }
    },
    {
        path: 'settings/pickup',
        canActivate: [HasPermissionGuard],
        data: { permission: 'orders.view' },
        loadComponent: () => import('./pages/pickup-settings/pickup-settings.component').then(m => m.PickupSettingsComponent)
    },
    {
        path: ':id',
        component: OrderDetailsComponent,
        canActivate: [HasPermissionGuard],
        data: { permission: 'orders.view' }
    }
];
