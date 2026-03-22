import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

interface OrderDetail {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  merchantName: string;
  merchantBranch: string;
  merchantLocation: string;
  driverName: string;
  driverPhone: string;
  date: string;
  time: string;
  status: 'NEW' | 'IN_PROGRESS' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'COMPLETED' | 'PENDING';
  total: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  items: { name: string; brand: string; quantity: string; price: number; total: number; icon: string; sku: string }[];
  timeline: { titleKey: string; subtitleKey: string; time: string; status: string; current: boolean }[];
  activities: { titleKey: string; actorKey: string; time: string }[];
}

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  orderId = signal<string | null>(null);
  order = signal<OrderDetail | null>(null);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.orderId.set(id);
    this.loadOrderDetails();
  }

  loadOrderDetails() {
    // Mock data based on Stitch design
    this.order.set({
      id: this.orderId() || '#ZD-94821',
      customerName: 'سارة علي حسن',
      customerPhone: '055-123-XXXX',
      customerAddress: 'الرياض، حي الملقا، شارع الأمير محمد بن سعد، عمارة 42، الدور الثالث، شقة سكنية',
      merchantName: 'لولو هايبر ماركت',
      merchantBranch: 'الياسمين',
      merchantLocation: 'الرياض، حي الياسمين',
      driverName: 'أحمد المسئول',
      driverPhone: '050-XXXX-XXX',
      date: '2023-10-25',
      time: '10:45 AM',
      status: 'OUT_FOR_DELIVERY',
      total: 480.00,
      subtotal: 404.35,
      deliveryFee: 15.00,
      tax: 60.65,
      items: [
        { name: 'حليب طازج كامل الدسم', brand: 'المراعي', quantity: '2 لتر', price: 12.00, total: 24.00, icon: '🥛', sku: 'SKU-782910' },
        { name: 'بيض عضوي فاخر', brand: 'مزارع الرياض', quantity: 'طبق 30 حبة', price: 45.00, total: 45.00, icon: '🥚', sku: 'SKU-992817' },
        { name: 'قهوة اسبريسو مطحونة', brand: 'بارنيز', quantity: '250 جرام', price: 38.00, total: 38.00, icon: '☕', sku: 'SKU-102933' }
      ],
      timeline: [
        { titleKey: 'ORDERS.DETAIL.TIMELINE_CREATED', subtitleKey: 'ORDERS.DETAIL.WEB_CLIENT', time: '09:00 AM', status: 'COMPLETED', current: false },
        { titleKey: 'ORDERS.DETAIL.TIMELINE_PAYMENT', subtitleKey: 'ORDERS.DETAIL.MADA_GATEWAY', time: '09:16 AM', status: 'COMPLETED', current: false },
        { titleKey: 'ORDERS.DETAIL.TIMELINE_PREP', subtitleKey: 'ORDERS.DETAIL.MOCK_MERCHANT', time: '10:05 AM', status: 'COMPLETED', current: false },
        { titleKey: 'ORDERS.DETAIL.TIMELINE_DELIVERY', subtitleKey: 'ORDERS.DETAIL.MOCK_DRIVER', time: '10:20 AM', status: 'IN_PROGRESS', current: true },
        { titleKey: 'ORDERS.DETAIL.TIMELINE_COMPLETED', subtitleKey: 'ORDERS.DETAIL.AWAITING_CONFIRM', time: '--:--', status: 'PENDING', current: false }
      ],
      activities: [
        { titleKey: 'ORDERS.DETAIL.LOG_STATUS_OUT', actorKey: 'ORDERS.DETAIL.SYSTEM_AUTO', time: '10:20 AM' },
        { titleKey: 'ORDERS.DETAIL.LOG_PREP_COMPLETE', actorKey: 'ORDERS.DETAIL.MOCK_MERCHANT', time: '10:05 AM' },
        { titleKey: 'ORDERS.DETAIL.LOG_PAYMENT_OK', actorKey: 'ORDERS.DETAIL.MADA_GATEWAY', time: '09:16 AM' }
      ]
    });
  }

  getStatusClass(status: string): string {
    const map: any = {
      'COMPLETED': 'text-emerald-500 bg-emerald-50 border-emerald-100',
      'DELIVERED': 'text-emerald-500 bg-emerald-50 border-emerald-100',
      'IN_PROGRESS': 'text-amber-500 bg-amber-50 border-amber-100',
      'OUT_FOR_DELIVERY': 'text-blue-500 bg-blue-50 border-blue-100',
      'NEW': 'text-blue-500 bg-blue-50 border-blue-100',
      'CANCELLED': 'text-red-500 bg-red-50 border-red-100'
    };
    return map[status] || 'text-slate-400 bg-slate-50 border-slate-100';
  }
}
