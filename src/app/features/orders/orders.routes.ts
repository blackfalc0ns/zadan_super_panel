import { Routes } from '@angular/router';
import { OrdersListComponent } from './pages/list/orders-list/orders-list.component';
import { OrderDetailsComponent } from './pages/detail/order-details/order-details.component';

export const ORDERS_ROUTES: Routes = [
    {
        path: '',
        component: OrdersListComponent,
        title: 'الطلبات | إدارة العمليات'
    },
    {
        path: ':id',
        component: OrderDetailsComponent,
        title: 'تفاصيل الطلب | إدارة العمليات'
    }
];

