import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowLinkCard, WorkflowLinksService, VendorWorkflowSnapshot } from '../../../core/services/workflow-links.service';
import { InlineBannerComponent } from '../../../shared/components/ui/inline-banner/inline-banner.component';
import { SectionHeaderComponent } from '../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../shared/components/ui/status-pill/status-pill.component';
import { WorkflowLinksPanelComponent } from '../../../shared/components/ui/workflow-links-panel/workflow-links-panel.component';

interface KPI {
  id: string;
  titleKey: string;
  value: string;
  unit?: string;
  icon: string;
  iconBgClass: string;
  trend: string;
  trendKey: string;
  trendIcon: string;
  trendClass: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  amount: string;
  statusKey: string;
  statusClass: string;
}

interface Document {
  id: string;
  titleKey: string;
  number: string;
  statusKey: string;
  statusClass: string;
}

interface Alert {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  bgClass: string;
  borderClass: string;
  iconClass: string;
  titleClass: string;
  descClass: string;
}

@Component({
  selector: 'app-vendor-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule, InlineBannerComponent, SectionHeaderComponent, StatusPillComponent, WorkflowLinksPanelComponent],
  templateUrl: './vendor-overview.component.html'
})
export class VendorOverviewComponent {
  @Output() tabChange = new EventEmitter<string>();
  
  vendorId: string = 'VND-9928';
  vendorName: string = 'متجر التقنية الحديثة';
  vendorLocation: string = 'الرياض، المملكة العربية السعودية';
  currentLang: string = 'ar';
  isRTL: boolean = true;
  workflowSnapshot: VendorWorkflowSnapshot | null = null;
  workflowLinks: WorkflowLinkCard[] = [];

  kpis: KPI[] = [
    {
      id: 'sales',
      titleKey: 'VENDOR_OVERVIEW.KPI.TOTAL_SALES',
      value: '45,000',
      unit: 'SAR',
      icon: 'payments',
      iconBgClass: 'bg-primary/10 text-primary',
      trend: '+12%',
      trendKey: 'VENDOR_OVERVIEW.KPI.FROM_LAST_MONTH',
      trendIcon: 'trending_up',
      trendClass: 'text-green-600'
    },
    {
      id: 'orders',
      titleKey: 'VENDOR_OVERVIEW.KPI.TOTAL_ORDERS',
      value: '1,250',
      icon: 'shopping_cart',
      iconBgClass: 'bg-blue-50 text-blue-600',
      trend: '+5%',
      trendKey: 'VENDOR_OVERVIEW.KPI.FROM_LAST_MONTH',
      trendIcon: 'trending_up',
      trendClass: 'text-green-600'
    },
    {
      id: 'returns',
      titleKey: 'VENDOR_OVERVIEW.KPI.RETURN_RATE',
      value: '2.4%',
      icon: 'assignment_return',
      iconBgClass: 'bg-orange-50 text-orange-600',
      trend: '-0.5%',
      trendKey: 'VENDOR_OVERVIEW.KPI.IMPROVEMENT',
      trendIcon: 'trending_down',
      trendClass: 'text-red-500'
    },
    {
      id: 'products',
      titleKey: 'VENDOR_OVERVIEW.KPI.ACTIVE_PRODUCTS',
      value: '340',
      icon: 'inventory_2',
      iconBgClass: 'bg-purple-50 text-purple-600',
      trend: '+10',
      trendKey: 'VENDOR_OVERVIEW.KPI.NEW_PRODUCTS',
      trendIcon: 'trending_up',
      trendClass: 'text-green-600'
    }
  ];

  storeInfo = {
    category: 'إلكترونيات وتقنية',
    registrationDate: '15 May 2023',
    phone: '+966 50 123 4567',
    email: 'contact@moderntech.sa'
  };

  documents: Document[] = [
    {
      id: 'cr',
      titleKey: 'VENDOR_OVERVIEW.DOCS.COMMERCIAL_REG',
      number: 'CR-1010123456',
      statusKey: 'VENDOR_OVERVIEW.STATUS.VERIFIED',
      statusClass: 'bg-green-50 text-green-700'
    },
    {
      id: 'tax',
      titleKey: 'VENDOR_OVERVIEW.DOCS.TAX_CERT',
      number: 'VAT-3001234567',
      statusKey: 'VENDOR_OVERVIEW.STATUS.VERIFIED',
      statusClass: 'bg-green-50 text-green-700'
    },
    {
      id: 'id',
      titleKey: 'VENDOR_OVERVIEW.DOCS.OWNER_ID',
      number: 'ID-10*******34',
      statusKey: 'VENDOR_OVERVIEW.STATUS.UNDER_REVIEW',
      statusClass: 'bg-yellow-50 text-yellow-700'
    }
  ];

  recentOrders: Order[] = [
    {
      id: '1',
      orderNumber: '#ORD-8821',
      customer: 'أحمد عبدالله',
      amount: '1,250 SAR',
      statusKey: 'VENDOR_OVERVIEW.ORDER_STATUS.PROCESSING',
      statusClass: 'bg-blue-50 text-blue-700'
    },
    {
      id: '2',
      orderNumber: '#ORD-8820',
      customer: 'سارة محمد',
      amount: '450 SAR',
      statusKey: 'VENDOR_OVERVIEW.ORDER_STATUS.COMPLETED',
      statusClass: 'bg-green-50 text-green-700'
    },
    {
      id: '3',
      orderNumber: '#ORD-8819',
      customer: 'خالد الدوسري',
      amount: '3,800 SAR',
      statusKey: 'VENDOR_OVERVIEW.ORDER_STATUS.PENDING_PAYMENT',
      statusClass: 'bg-orange-50 text-orange-700'
    },
    {
      id: '4',
      orderNumber: '#ORD-8818',
      customer: 'فهد العنزي',
      amount: '120 SAR',
      statusKey: 'VENDOR_OVERVIEW.ORDER_STATUS.CANCELLED',
      statusClass: 'bg-gray-100 text-gray-700'
    },
    {
      id: '5',
      orderNumber: '#ORD-8817',
      customer: 'نورة السالم',
      amount: '890 SAR',
      statusKey: 'VENDOR_OVERVIEW.ORDER_STATUS.COMPLETED',
      statusClass: 'bg-green-50 text-green-700'
    }
  ];

  alerts: Alert[] = [
    {
      id: '1',
      titleKey: 'VENDOR_OVERVIEW.ALERTS.BANK_NOT_VERIFIED',
      descriptionKey: 'VENDOR_OVERVIEW.ALERTS.BANK_NOT_VERIFIED_DESC',
      icon: 'error',
      bgClass: 'bg-red-50',
      borderClass: 'border-red-100',
      iconClass: 'text-red-500',
      titleClass: 'text-red-800',
      descClass: 'text-red-600'
    },
    {
      id: '2',
      titleKey: 'VENDOR_OVERVIEW.ALERTS.OWNER_ID_UPDATE',
      descriptionKey: 'VENDOR_OVERVIEW.ALERTS.OWNER_ID_UPDATE_DESC',
      icon: 'info',
      bgClass: 'bg-yellow-50',
      borderClass: 'border-yellow-100',
      iconClass: 'text-yellow-600',
      titleClass: 'text-yellow-800',
      descClass: 'text-yellow-700'
    }
  ];

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private workflowLinksService: WorkflowLinksService
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';
    
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === 'ar';
      this.syncVendorContext();
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.vendorId = params['id'];
      }

      this.syncVendorContext();
    });

    this.syncVendorContext();
  }

  onApproveVendor() {
    console.log('Approve vendor:', this.vendorId);
  }

  onRequestDocuments() {
    console.log('Request additional documents');
  }

  onSuspendVendor() {
    console.log('Suspend vendor temporarily');
  }

  onViewAllOrders() {
    // Navigate to vendor detail page with orders tab
    this.router.navigate(['/vendors', this.vendorId], { 
      queryParams: { tab: 'orders' } 
    });
  }

  onViewAllDocuments() {
    console.log('View all documents');
  }

  onFilterOrders() {
    console.log('Filter orders');
  }

  onViewOrderDetails(orderId: string) {
    this.router.navigate(['/orders', orderId]);
  }

  onNavigateToDetails() {
    this.router.navigate(['/vendors', this.vendorId]);
  }

  getDocumentStatusVariant(statusKey: string): StatusPillVariant {
    if (statusKey.includes('VERIFIED')) {
      return 'success';
    }

    if (statusKey.includes('UNDER_REVIEW')) {
      return 'warning';
    }

    return 'neutral';
  }

  getOrderStatusVariant(statusKey: string): StatusPillVariant {
    if (statusKey.includes('COMPLETED')) {
      return 'success';
    }

    if (statusKey.includes('PROCESSING')) {
      return 'processing';
    }

    if (statusKey.includes('PENDING')) {
      return 'warning';
    }

    if (statusKey.includes('CANCELLED')) {
      return 'danger';
    }

    return 'neutral';
  }

  getAlertVariant(alertId: string): 'warning' | 'error' {
    return alertId === '1' ? 'error' : 'warning';
  }

  private syncVendorContext(): void {
    const snapshot = this.workflowLinksService.getVendorSnapshot(this.vendorId);
    this.workflowSnapshot = snapshot;
    this.workflowLinks = this.workflowLinksService.getVendorWorkflowLinks(this.vendorId);
    this.vendorName = snapshot.displayName;
    this.vendorLocation = snapshot.location;
    this.storeInfo = {
      ...this.storeInfo,
      category: snapshot.category,
      phone: snapshot.phone,
      email: snapshot.email
    };
    this.recentOrders = snapshot.linkedOrders.map((order) => ({
      id: order.id,
      orderNumber: order.displayId,
      customer: order.customerName,
      amount: `${order.total.toFixed(0)} SAR`,
      statusKey: this.mapOrderStatusKey(order.status),
      statusClass: this.mapOrderStatusClass(order.status)
    }));
  }

  private mapOrderStatusKey(status: string): string {
    const map: Record<string, string> = {
      IN_PROGRESS: 'VENDOR_OVERVIEW.ORDER_STATUS.PROCESSING',
      OUT_FOR_DELIVERY: 'VENDOR_OVERVIEW.ORDER_STATUS.PROCESSING',
      COMPLETED: 'VENDOR_OVERVIEW.ORDER_STATUS.COMPLETED',
      DELIVERED: 'VENDOR_OVERVIEW.ORDER_STATUS.COMPLETED',
      CANCELLED: 'VENDOR_OVERVIEW.ORDER_STATUS.CANCELLED',
      PENDING: 'VENDOR_OVERVIEW.ORDER_STATUS.PENDING_PAYMENT'
    };

    return map[status] ?? 'VENDOR_OVERVIEW.ORDER_STATUS.PROCESSING';
  }

  private mapOrderStatusClass(status: string): string {
    const map: Record<string, string> = {
      IN_PROGRESS: 'bg-blue-50 text-blue-700',
      OUT_FOR_DELIVERY: 'bg-blue-50 text-blue-700',
      COMPLETED: 'bg-green-50 text-green-700',
      DELIVERED: 'bg-green-50 text-green-700',
      CANCELLED: 'bg-gray-100 text-gray-700',
      PENDING: 'bg-orange-50 text-orange-700'
    };

    return map[status] ?? 'bg-slate-100 text-slate-700';
  }
}
