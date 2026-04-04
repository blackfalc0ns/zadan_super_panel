import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { VendorDetail, VendorReviewDocument } from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

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

interface DocumentCard {
  id: string;
  titleKey: string;
  number: string;
  statusKey: string;
  statusClass: string;
}

interface AlertCard {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  variant: 'warning' | 'error';
}

@Component({
  selector: 'app-vendor-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule, InlineBannerComponent, SectionHeaderComponent, StatusPillComponent],
  templateUrl: './vendor-overview.component.html'
})
export class VendorOverviewComponent {
  @Output() tabChange = new EventEmitter<string>();

  vendorId = 'VND-9928';
  vendorName = '';
  vendorLocation = '';
  currentLang = 'ar';
  isRTL = true;
  vendorDetail: VendorDetail | null = null;
  private readonly destroyRef = inject(DestroyRef);

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
    category: '-',
    registrationDate: '-',
    phone: '-',
    email: '-'
  };

  documents: DocumentCard[] = [];
  recentOrders: Order[] = [];
  alerts: AlertCard[] = [];

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
        if (this.vendorDetail) {
          this.applyVendorDetail(this.vendorDetail);
        }
      });

    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
        if (!vendor) {
          return;
        }

        this.applyVendorDetail(vendor);
      });
  }

  get reviewStateLabelKey(): string {
    const state = this.vendorDetail?.reviewState;
    const labelMap: Record<string, string> = {
      awaiting_submission: 'VENDOR_REVIEW.STATE.AWAITING_SUBMISSION',
      submitted: 'VENDOR_REVIEW.STATE.SUBMITTED',
      under_review: 'VENDOR_REVIEW.STATE.UNDER_REVIEW',
      changes_requested: 'VENDOR_REVIEW.STATE.CHANGES_REQUESTED',
      verified: 'VENDOR_REVIEW.STATE.VERIFIED',
      rejected: 'VENDOR_REVIEW.STATE.REJECTED',
      suspended: 'VENDOR_REVIEW.STATE.SUSPENDED'
    };

    return labelMap[state || ''] ?? 'VENDORS.STATUS.PENDING';
  }

  get reviewStateVariant(): StatusPillVariant {
    switch (this.vendorDetail?.reviewState) {
      case 'verified':
        return 'success';
      case 'changes_requested':
        return 'warning';
      case 'submitted':
      case 'under_review':
        return 'processing';
      case 'rejected':
      case 'suspended':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  get reviewSummaryKey(): string {
    switch (this.vendorDetail?.reviewState) {
      case 'awaiting_submission':
        return 'VENDOR_REVIEW.SUMMARY.WAITING_VENDOR';
      case 'submitted':
      case 'under_review':
        return 'VENDOR_REVIEW.SUMMARY.READY_TO_VERIFY';
      case 'changes_requested':
        return 'VENDOR_REVIEW.SUMMARY.CHANGES_REQUIRED';
      case 'verified':
        return 'VENDOR_REVIEW.SUMMARY.VERIFIED_SUCCESS';
      case 'rejected':
        return 'VENDOR_REVIEW.SUMMARY.REJECTED';
      case 'suspended':
        return 'VENDOR_REVIEW.SUMMARY.SUSPENDED';
      default:
        return 'VENDOR_REVIEW.SUMMARY.WAITING_VENDOR';
    }
  }

  get assignedReviewer(): string {
    return this.vendorDetail?.assignedReviewer || '-';
  }

  get reviewSubmittedAt(): string {
    return this.formatDate(this.vendorDetail?.reviewSubmittedAtUtc || this.vendorDetail?.createdAtUtc || null);
  }

  get reviewBlockers(): VendorReviewDocument[] {
    return (this.vendorDetail?.reviewDocuments || []).filter((document) => document.status !== 'completed');
  }

  onApproveVendor(): void {
    if (!this.vendorDetail) {
      return;
    }

    this.vendorDetailFacade.approveVendorReview(this.vendorDetail.commissionRate ?? 13);
  }

  onRequestDocuments(): void {
    if (!this.vendorDetail) {
      return;
    }

    this.vendorDetailFacade.requestVendorDocuments();
  }

  onSuspendVendor(): void {
    if (!this.vendorDetail) {
      return;
    }

    this.vendorDetailFacade.suspendVendorAccount();
  }

  onViewAllOrders(): void {
    this.router.navigate(['/vendors', this.vendorId, 'orders']);
  }

  onViewAllDocuments(): void {
    this.tabChange.emit('compliance');
  }

  onFilterOrders(): void {
    this.tabChange.emit('orders');
  }

  onViewOrderDetails(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  onNavigateToDetails(): void {
    this.router.navigate(['/vendors', this.vendorId, 'overview']);
  }

  getDocumentStatusVariant(statusKey: string): StatusPillVariant {
    if (statusKey.includes('VERIFIED') || statusKey.includes('COMPLETED')) {
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

  private applyVendorDetail(vendor: VendorDetail): void {
    this.vendorDetail = vendor;
    this.vendorId = vendor.id;
    this.vendorName = this.currentLang === 'ar' ? vendor.businessNameAr : vendor.businessNameEn;
    this.vendorLocation = vendor.city ? `${vendor.city}${this.isRTL ? 'Ã˜Å’' : ','} Saudi Arabia` : '';
    this.storeInfo = {
      category: vendor.businessType,
      registrationDate: this.formatDate(vendor.createdAtUtc),
      phone: vendor.contactPhone,
      email: vendor.contactEmail
    };
    this.recentOrders = this.buildRecentOrders(vendor);
    this.documents = this.mapDocuments(vendor);
    this.alerts = this.mapAlerts(vendor);
  }

  private buildRecentOrders(vendor: VendorDetail): Order[] {
    const baseNumber = Number(vendor.id.replace(/\D/g, '').slice(-3) || '100');
    const statuses = [
      'VENDOR_OVERVIEW.ORDER_STATUS.PROCESSING',
      'VENDOR_OVERVIEW.ORDER_STATUS.COMPLETED',
      'VENDOR_OVERVIEW.ORDER_STATUS.PENDING_PAYMENT'
    ];
    const classes = [
      'bg-blue-50 text-blue-700',
      'bg-green-50 text-green-700',
      'bg-orange-50 text-orange-700'
    ];
    const customers = this.currentLang === 'ar'
      ? ['Ã˜Â£Ã˜Â­Ã™â€¦Ã˜Â¯ Ã˜Â¹Ã˜Â¨Ã˜Â¯Ã˜Â§Ã™â€žÃ™â€žÃ™â€¡', 'Ã˜Â³Ã˜Â§Ã˜Â±Ã˜Â© Ã™â€¦Ã˜Â­Ã™â€¦Ã˜Â¯', 'Ã˜Â®Ã˜Â§Ã™â€žÃ˜Â¯ Ã˜Â§Ã™â€žÃ˜Â¯Ã™Ë†Ã˜Â³Ã˜Â±Ã™Å ']
      : ['Ahmed Abdullah', 'Sarah Mohammed', 'Khaled Al-Dosari'];

    return customers.map((customer, index) => ({
      id: `V-${vendor.id}-${index + 1}`,
      orderNumber: `#ORD-${baseNumber + index + 1200}`,
      customer,
      amount: `${(index + 1) * 450} SAR`,
      statusKey: statuses[index % statuses.length],
      statusClass: classes[index % classes.length]
    }));
  }

  private mapDocuments(vendor: VendorDetail): DocumentCard[] {
    return vendor.reviewDocuments.slice(0, 3).map((document) => ({
      id: document.id,
      titleKey: document.titleKey,
      number: this.resolveDocumentNumber(vendor, document.type),
      statusKey: document.statusLabelKey,
      statusClass: document.status === 'completed'
        ? 'bg-green-50 text-green-700'
        : document.status === 'pending'
          ? 'bg-yellow-50 text-yellow-700'
          : 'bg-slate-100 text-slate-600'
    }));
  }

  private mapAlerts(vendor: VendorDetail): AlertCard[] {
    const documentAlerts = vendor.reviewDocuments
      .filter((document) => document.status !== 'completed')
      .map((document) => ({
        id: `doc-${document.id}`,
        titleKey: document.titleKey,
        descriptionKey: document.descriptionKey,
        icon: document.icon,
        variant: document.status === 'missing' ? 'error' as const : 'warning' as const
      }));

    const riskAlerts = vendor.riskIndicators.map((indicator) => ({
      id: indicator.id,
      titleKey: indicator.titleKey,
      descriptionKey: indicator.descriptionKey,
      icon: indicator.icon,
      variant: indicator.severity === 'high' ? 'error' as const : 'warning' as const
    }));

    return [...documentAlerts, ...riskAlerts].slice(0, 3);
  }

  private resolveDocumentNumber(vendor: VendorDetail, type: VendorReviewDocument['type']): string {
    switch (type) {
      case 'commercial':
        return vendor.commercialRegistrationNumber;
      case 'tax':
        return vendor.taxId || '-';
      case 'identity':
        return 'ID-10*******34';
      case 'bank':
        return 'IBAN-***4321';
      case 'license':
        return 'LIC-77821';
      default:
        return '-';
    }
  }

  private formatDate(value: string | null): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }
}
