import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderCancellationModalComponent } from '../components/order-cancellation-modal/order-cancellation-modal.component';
import { OrderDriverAssignmentModalComponent } from '../components/order-driver-assignment-modal/order-driver-assignment-modal.component';
import { OrderDisputeModalComponent } from '../components/order-dispute-modal/order-dispute-modal.component';
import { OrderIssueFlagModalComponent } from '../components/order-issue-flag-modal/order-issue-flag-modal.component';
import { OrderRefundModalComponent } from '../components/order-refund-modal/order-refund-modal.component';
import { OrderStatusUpdateModalComponent } from '../components/order-status-update-modal/order-status-update-modal.component';
import { InlineBannerComponent } from '../../../shared/components/ui/inline-banner/inline-banner.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { SectionHeaderComponent } from '../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../shared/components/ui/status-pill/status-pill.component';
import { DriverAssignmentForm, DriverCandidate, OrderCancellationForm, OrderDetail, OrderDisputeForm, OrderIssueFlagForm, OrderRefundForm, OrderStatusUpdateForm } from '../orders.models';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    OrderStatusUpdateModalComponent,
    OrderDriverAssignmentModalComponent,
    OrderCancellationModalComponent,
    OrderRefundModalComponent,
    OrderDisputeModalComponent,
    OrderIssueFlagModalComponent,
    SectionHeaderComponent,
    StatusPillComponent,
    InlineBannerComponent,
    KeyValueGridComponent
  ],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  orderId = signal<string | null>(null);
  order = signal<OrderDetail | null>(null);
  isStatusModalOpen = false;
  isDriverAssignmentModalOpen = false;
  isCancellationModalOpen = false;
  isRefundModalOpen = false;
  isDisputeModalOpen = false;
  isIssueFlagModalOpen = false;
  driverCandidates: DriverCandidate[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.orderId.set(id);
    this.loadOrderDetails();
  }

  loadOrderDetails(): void {
    this.order.set({
      id: this.orderId() || '#ZD-94821',
      customerName: 'سارة علي حسن',
      customerPhone: '055-123-XXXX',
      customerAddress: 'شارع الثمامة، حي العليا',
      merchantName: 'لولو هايبر ماركت',
      merchantBranch: 'الياسمين',
      merchantLocation: 'الرياض، حي الياسمين',
      driverName: 'أحمد منصور',
      driverPhone: '050-XXXX-XXX',
      city: 'الرياض',
      district: 'العليا',
      slaScore: 98,
      date: '2023-10-25',
      time: '10:45 AM',
      status: 'OUT_FOR_DELIVERY',
      total: 480.00,
      subtotal: 404.35,
      deliveryFee: 15.00,
      tax: 60.65,
      items: [
        { name: 'حليب طازج كامل الدسم', brand: 'المراعي', quantity: '2 لتر', price: 12.00, total: 24.00, icon: 'local_drink', sku: 'SKU-782910' },
        { name: 'بيض عضوي فاخر', brand: 'مزارع الرياض', quantity: 'طبق 30 حبة', price: 45.00, total: 45.00, icon: 'egg_alt', sku: 'SKU-992817' },
        { name: 'قهوة اسبريسو مطحونة', brand: 'بارنيز', quantity: '250 جرام', price: 38.00, total: 38.00, icon: 'coffee', sku: 'SKU-102933' }
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

    this.driverCandidates = [
      {
        id: 'driver-1',
        name: 'أحمد منصور',
        code: '#DRV-7721',
        phone: '050-111-2211',
        city: 'الرياض',
        area: 'العليا',
        status: 'AVAILABLE',
        distanceKm: 1.2,
        activeOrders: 0,
        rating: 4.8,
        rejectionRate: 2,
        lastActivity: 'الآن',
        initials: 'أم',
        avatarTone: 'from-teal-500 to-cyan-500',
        verified: true
      },
      {
        id: 'driver-2',
        name: 'خالد العتيبي',
        code: '#DRV-8842',
        phone: '050-111-2299',
        city: 'الرياض',
        area: 'الياسمين',
        status: 'DELIVERING',
        distanceKm: 3.5,
        activeOrders: 2,
        rating: 4.5,
        rejectionRate: 5,
        lastActivity: 'قبل 10 دقائق',
        initials: 'خع',
        avatarTone: 'from-amber-500 to-orange-500',
        verified: true
      },
      {
        id: 'driver-3',
        name: 'فهد سليمان',
        code: '#DRV-1109',
        phone: '050-111-3322',
        city: 'الرياض',
        area: 'الملقا',
        status: 'AVAILABLE',
        distanceKm: 0.8,
        activeOrders: 1,
        rating: 3.2,
        rejectionRate: 15,
        lastActivity: 'الآن',
        initials: 'فس',
        avatarTone: 'from-rose-500 to-pink-500',
        lowPerformance: true,
        verified: true
      }
    ];
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      COMPLETED: 'text-emerald-500 bg-emerald-50 border-emerald-100',
      DELIVERED: 'text-emerald-500 bg-emerald-50 border-emerald-100',
      IN_PROGRESS: 'text-amber-500 bg-amber-50 border-amber-100',
      OUT_FOR_DELIVERY: 'text-blue-500 bg-blue-50 border-blue-100',
      NEW: 'text-blue-500 bg-blue-50 border-blue-100',
      CANCELLED: 'text-red-500 bg-red-50 border-red-100'
    };

    return map[status] || 'text-slate-400 bg-slate-50 border-slate-100';
  }

  get orderStatusVariant(): StatusPillVariant {
    const currentStatus = this.order()?.status;
    const map: Record<string, StatusPillVariant> = {
      COMPLETED: 'success',
      DELIVERED: 'success',
      IN_PROGRESS: 'warning',
      OUT_FOR_DELIVERY: 'processing',
      NEW: 'info',
      CANCELLED: 'danger'
    };

    return map[currentStatus || ''] || 'neutral';
  }

  get paymentInfoItems(): KeyValueGridItem[] {
    const currentOrder = this.order();

    if (!currentOrder) {
      return [];
    }

    return [
      {
        label: 'ORDERS.DETAIL.PAYMENT_METHOD',
        value: 'ORDERS.DETAIL.MADA',
        translateValue: true
      },
      {
        label: 'ORDERS.DETAIL.TRANSACTION_REF',
        value: '#TRX-8271039',
        valueDir: 'ltr'
      },
      {
        label: 'ORDERS.DETAIL.ORDER_SUBTOTAL',
        value: this.formatCurrency(currentOrder.subtotal),
        valueDir: 'ltr'
      },
      {
        label: 'ORDERS.DETAIL.DELIVERY_FEE',
        value: this.formatCurrency(currentOrder.deliveryFee),
        valueDir: 'ltr'
      },
      {
        label: 'ORDERS.DETAIL.TAX',
        value: this.formatCurrency(currentOrder.tax),
        valueDir: 'ltr'
      }
    ];
  }

  get deliveryInfoItems(): KeyValueGridItem[] {
    const currentOrder = this.order();

    if (!currentOrder) {
      return [];
    }

    return [
      {
        label: 'ORDERS.DETAIL.EXPECTED_TIME',
        value: currentOrder.time,
        valueDir: 'ltr',
        valueTone: 'warning'
      },
      {
        label: 'ORDERS.DETAIL.HOUSING_TYPE',
        value: 'ORDERS.DETAIL.APARTMENT',
        translateValue: true
      }
    ];
  }

  openStatusModal(): void {
    this.isStatusModalOpen = true;
  }

  openDriverAssignmentModal(): void {
    this.isDriverAssignmentModalOpen = true;
  }

  openCancellationModal(): void {
    this.isCancellationModalOpen = true;
  }

  openRefundModal(): void {
    this.isRefundModalOpen = true;
  }

  openDisputeModal(): void {
    this.isDisputeModalOpen = true;
  }

  openIssueFlagModal(): void {
    this.isIssueFlagModalOpen = true;
  }

  closeStatusModal(): void {
    this.isStatusModalOpen = false;
  }

  closeDriverAssignmentModal(): void {
    this.isDriverAssignmentModalOpen = false;
  }

  closeCancellationModal(): void {
    this.isCancellationModalOpen = false;
  }

  closeRefundModal(): void {
    this.isRefundModalOpen = false;
  }

  closeDisputeModal(): void {
    this.isDisputeModalOpen = false;
  }

  closeIssueFlagModal(): void {
    this.isIssueFlagModalOpen = false;
  }

  submitStatusUpdate(form: OrderStatusUpdateForm): void {
    const currentOrder = this.order();

    if (!currentOrder) {
      return;
    }

    this.order.set({
      ...currentOrder,
      status: form.newStatus,
      time: form.expectedDeliveryTime ? this.formatTime(form.expectedDeliveryTime) : currentOrder.time,
      activities: form.addInternalLog
        ? [
            {
              titleKey: 'ORDERS.DETAIL.LOG_STATUS_MANUAL_UPDATE',
              actorKey: 'ORDERS.DETAIL.SYSTEM_AUTO',
              time: this.formatTime(form.expectedDeliveryTime || new Date().toISOString())
            },
            ...currentOrder.activities
          ]
        : currentOrder.activities
    });

    this.closeStatusModal();
  }

  submitDriverAssignment(form: DriverAssignmentForm): void {
    const currentOrder = this.order();
    const selectedDriver = this.driverCandidates.find((driver) => driver.id === form.selectedDriverId);

    if (!currentOrder || !selectedDriver) {
      return;
    }

    this.order.set({
      ...currentOrder,
      driverName: selectedDriver.name,
      driverPhone: selectedDriver.phone,
      activities: [
        {
          titleKey: 'ORDERS.DETAIL.LOG_DRIVER_REASSIGNED',
          actorKey: 'ORDERS.DETAIL.SYSTEM_AUTO',
          time: this.formatTime(new Date().toISOString())
        },
        ...currentOrder.activities
      ]
    });

    this.closeDriverAssignmentModal();
  }

  submitCancellation(form: OrderCancellationForm): void {
    const currentOrder = this.order();

    if (!currentOrder) {
      return;
    }

    this.order.set({
      ...currentOrder,
      status: 'CANCELLED',
      activities: [
        {
          titleKey: 'ORDERS.DETAIL.LOG_ORDER_CANCELLED',
          actorKey: 'ORDERS.DETAIL.SYSTEM_AUTO',
          time: this.formatTime(new Date().toISOString())
        },
        ...currentOrder.activities
      ]
    });

    this.closeCancellationModal();
  }

  saveRefundDraft(form: OrderRefundForm): void {
    void form;
    this.addActivity('ORDERS.DETAIL.LOG_REFUND_DRAFT');
    this.closeRefundModal();
  }

  submitRefund(form: OrderRefundForm): void {
    void form;
    this.addActivity('ORDERS.DETAIL.LOG_REFUND_OPENED');
    this.closeRefundModal();
  }

  saveDisputeDraft(form: OrderDisputeForm): void {
    void form;
    this.addActivity('ORDERS.DETAIL.LOG_DISPUTE_DRAFT');
    this.closeDisputeModal();
  }

  submitDispute(form: OrderDisputeForm): void {
    void form;
    this.addActivity('ORDERS.DETAIL.LOG_DISPUTE_OPENED');
    this.closeDisputeModal();
  }

  saveIssueNote(form: OrderIssueFlagForm): void {
    void form;
    this.addActivity('ORDERS.DETAIL.LOG_ISSUE_NOTE_SAVED');
    this.closeIssueFlagModal();
  }

  submitIssueFlag(form: OrderIssueFlagForm): void {
    void form;
    this.addActivity('ORDERS.DETAIL.LOG_ISSUE_FLAGGED');
    this.closeIssueFlagModal();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isIssueFlagModalOpen) {
      this.closeIssueFlagModal();
      return;
    }

    if (this.isDisputeModalOpen) {
      this.closeDisputeModal();
      return;
    }

    if (this.isRefundModalOpen) {
      this.closeRefundModal();
      return;
    }

    if (this.isCancellationModalOpen) {
      this.closeCancellationModal();
      return;
    }

    if (this.isDriverAssignmentModalOpen) {
      this.closeDriverAssignmentModal();
      return;
    }

    if (this.isStatusModalOpen) {
      this.closeStatusModal();
    }
  }

  private addActivity(titleKey: string): void {
    const currentOrder = this.order();

    if (!currentOrder) {
      return;
    }

    this.order.set({
      ...currentOrder,
      activities: [
        {
          titleKey,
          actorKey: 'ORDERS.DETAIL.SYSTEM_AUTO',
          time: this.formatTime(new Date().toISOString())
        },
        ...currentOrder.activities
      ]
    });
  }

  private formatTime(dateValue: string): string {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return '--:--';
    }

    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  private formatCurrency(value: number): string {
    return `${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)} SAR`;
  }
}
