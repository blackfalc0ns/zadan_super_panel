import { Routes } from '@angular/router';
import { OrdersListComponent } from './pages/list/orders-list/orders-list.component';
import { OrderDetailsComponent } from './pages/detail/order-details/order-details.component';

export const ORDERS_ROUTES: Routes = [
    {
        path: '',
        component: OrdersListComponent,
        title: 'Ø§Ù„Ø·Ù„Ø¨Ø§Øª | Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª'
    },
    {
        path: ':id',
        component: OrderDetailsComponent,
        title: 'ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨ | Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª'
    }
];

