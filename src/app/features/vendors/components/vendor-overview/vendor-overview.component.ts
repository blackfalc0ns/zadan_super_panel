import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { AdminVendorOrderItem, VendorService } from '@vendors/services/vendor.api.service';
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
}

interface DocumentCard {
  id: string;
  titleKey: string;
  number: string;
  statusKey: string;
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

  vendorId = '';
  vendorName = '';
  vendorLocation = '';
  currentLang = 'ar';
  isRTL = true;
  mutationError = '';
  vendorDetail: VendorDetail | null = null;
  private readonly destroyRef = inject(DestroyRef);

  kpis: KPI[] = [];
  storeInfo = {
    category: '-',
    registrationDate: '-',
    phone: '-',
    email: '-'
  };

  documents: DocumentCard[] = [];
  recentOrders: Order[] = [];
  alerts: AlertCard[] = [];
  private ordersData: AdminVendorOrderItem[] = [];

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly vendorService: VendorService,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
        this.rebuildViewModel();
      });

    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
        if (!vendor) {
          return;
        }

        this.vendorDetail = vendor;
        this.vendorId = vendor.id;
        this.loadOrders();
        this.rebuildViewModel();
      });

    this.vendorDetailFacade.mutationError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => {
        this.mutationError = error ?? '';
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
    const explicitReviewer = this.vendorDetail?.approvedBy?.trim();
    if (explicitReviewer) {
      return explicitReviewer;
    }

    return this.vendorDetail?.reviewNotes?.find((note) => !!note.authorName?.trim())?.authorName?.trim() || '-';
  }

  get reviewSubmittedAt(): string {
    return this.formatDate(this.vendorDetail?.reviewSubmittedAtUtc || this.vendorDetail?.createdAtUtc || null);
  }

  get reviewBlockers(): VendorReviewDocument[] {
    return (this.vendorDetail?.reviewDocuments || []).filter((document) => document.status !== 'completed');
  }

  get canApproveVendor(): boolean {
    if (!this.vendorDetail) {
      return false;
    }

    return this.vendorDetail.status === 'Pending'
      && !this.vendorDetail.isLoginLocked
      && !this.vendorDetail.archivedAtUtc;
  }

  get canReactivateVendor(): boolean {
    if (!this.vendorDetail) {
      return false;
    }

    return this.vendorDetail.status === 'Suspended'
      && !this.vendorDetail.isLoginLocked
      && !this.vendorDetail.archivedAtUtc;
  }

  get primaryActionLabel(): string {
    if (this.canReactivateVendor) {
      return this.isRTL ? 'إعادة تفعيل الحساب' : 'Reactivate account';
    }

    return this.translate.instant('VENDOR_OVERVIEW.ACTIONS.APPROVE');
  }

  onApproveVendor(): void {
    if (!this.vendorDetail) {
      return;
    }

    this.vendorDetailFacade.clearMutationError();

    if (this.canReactivateVendor) {
      this.vendorDetailFacade.reactivateVendorAccount();
      return;
    }

    if (!this.canApproveVendor) {
      this.mutationError = this.isRTL
        ? 'لا يمكن الموافقة على هذا التاجر في حالته الحالية.'
        : 'This vendor cannot be approved in its current state.';
      return;
    }

    this.vendorDetailFacade.approveVendorReview(this.vendorDetail.commissionRate ?? 13);
  }

  onRequestDocuments(): void {
    if (!this.vendorDetail) {
      return;
    }

    this.vendorDetailFacade.clearMutationError();
    this.vendorDetailFacade.requestVendorDocuments();
  }

  onSuspendVendor(): void {
    if (!this.vendorDetail) {
      return;
    }

    this.vendorDetailFacade.clearMutationError();
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
    if (statusKey.includes('DELIVERED')) {
      return 'success';
    }

    if (statusKey.includes('PLACED') || statusKey.includes('PREPARING') || statusKey.includes('ONTHEWAY')) {
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

  private loadOrders(): void {
    this.vendorService.getVendorOrders(this.vendorId, 1, 5)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.ordersData = response.items ?? [];
          this.rebuildViewModel();
        },
        error: () => {
          this.ordersData = [];
          this.rebuildViewModel();
        }
      });
  }

  private rebuildViewModel(): void {
    const vendor = this.vendorDetail;
    if (!vendor) {
      return;
    }

    this.vendorName = this.getDisplayStoreName(vendor);
    this.vendorLocation = [vendor.city, vendor.region].filter(Boolean).join(this.isRTL ? '، ' : ', ');
    this.storeInfo = {
      category: this.getDisplayBusinessType(vendor.businessType),
      registrationDate: this.formatDate(vendor.createdAtUtc),
      phone: vendor.contactPhone,
      email: vendor.contactEmail
    };

    const totalOrders = this.ordersData.length;
    const totalRevenue = this.ordersData.reduce((sum, order) => sum + order.totalAmount, 0);
    const completedOrders = this.ordersData.filter((order) => order.status.toLowerCase() === 'delivered').length;
    const commission = vendor.commissionRate ?? 0;

    this.kpis = [
      {
        id: 'sales',
        titleKey: 'VENDOR_OVERVIEW.KPI.TOTAL_SALES',
        value: this.formatNumber(totalRevenue),
        unit: 'SAR',
        icon: 'payments',
        iconBgClass: 'bg-primary/10 text-primary',
        trend: `${commission}%`,
        trendKey: 'CATALOG.COMMISSION_RATE',
        trendIcon: 'percent',
        trendClass: 'text-slate-600'
      },
      {
        id: 'orders',
        titleKey: 'VENDOR_OVERVIEW.KPI.TOTAL_ORDERS',
        value: this.formatNumber(totalOrders),
        icon: 'shopping_cart',
        iconBgClass: 'bg-blue-50 text-blue-600',
        trend: `${completedOrders}`,
        trendKey: 'VENDOR_ORDERS.KPI.COMPLETED_ORDERS',
        trendIcon: 'check_circle',
        trendClass: 'text-green-600'
      },
      {
        id: 'returns',
        titleKey: 'VENDOR_OVERVIEW.KPI.RETURN_RATE',
        value: `${vendor.documentsCompleteness ?? 0}%`,
        icon: 'verified',
        iconBgClass: 'bg-orange-50 text-orange-600',
        trend: vendor.verificationStatus || '-',
        trendKey: 'VENDORS.PREVIEW.VERIFICATION_STATUS',
        trendIcon: 'shield',
        trendClass: 'text-orange-600'
      },
      {
        id: 'products',
        titleKey: 'VENDOR_OVERVIEW.KPI.ACTIVE_PRODUCTS',
        value: this.formatNumber(vendor.branchesCount),
        icon: 'storefront',
        iconBgClass: 'bg-purple-50 text-purple-600',
        trend: this.formatNumber(vendor.bankAccountsCount),
        trendKey: 'VENDOR_DETAIL.BANKING_DATA',
        trendIcon: 'account_balance',
        trendClass: 'text-green-600'
      }
    ];

    this.recentOrders = this.ordersData.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.customerName,
      amount: `${this.formatNumber(order.totalAmount)} SAR`,
      statusKey: this.mapOrderStatusKey(order.status)
    }));

    this.documents = vendor.reviewDocuments.slice(0, 3).map((document) => ({
      id: document.id,
      titleKey: document.titleKey,
      number: this.resolveDocumentNumber(vendor, document.type),
      statusKey: document.statusLabelKey
    }));

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

    this.alerts = [...documentAlerts, ...riskAlerts].slice(0, 3);
  }

  private getDisplayStoreName(vendor: VendorDetail): string {
    const preferred = this.currentLang === 'ar' ? vendor.businessNameAr : vendor.businessNameEn;
    const alternate = this.currentLang === 'ar' ? vendor.businessNameEn : vendor.businessNameAr;
    return preferred?.trim() || alternate?.trim() || vendor.ownerName?.trim() || vendor.contactEmail?.trim() || '-';
  }

  private getDisplayBusinessType(businessType?: string | null): string {
    const normalized = (businessType || '').trim();
    if (!normalized) {
      return '-';
    }

    const keyMap: Record<string, string> = {
      electronics: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.ELECTRONICS',
      food: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.FOOD',
      grocery: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.FOOD',
      fashion: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.FASHION',
      home: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.HOME'
    };

    const translatedKey = keyMap[normalized.toLowerCase()];
    if (translatedKey) {
      return this.translate.instant(translatedKey);
    }

    return normalized
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (value) => value.toUpperCase());
  }

  private resolveDocumentNumber(vendor: VendorDetail, type: VendorReviewDocument['type']): string {
    switch (type) {
      case 'commercial':
        return vendor.commercialRegistrationNumber;
      case 'tax':
        return vendor.taxId || '-';
      case 'identity':
        return vendor.idNumber || '-';
      case 'bank':
        return vendor.primaryBankAccount?.iban || '-';
      case 'license':
        return vendor.licenseNumber || '-';
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

  private formatNumber(value: number): string {
    return new Intl.NumberFormat(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  private mapOrderStatusKey(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'VENDOR_ORDERS.GENERAL_STATUS.COMPLETED';
      case 'cancelled':
        return 'VENDOR_ORDERS.GENERAL_STATUS.CANCELLED';
      case 'placed':
      case 'preparing':
      case 'ontheway':
        return 'VENDOR_ORDERS.GENERAL_STATUS.IN_PROGRESS';
      default:
        return 'VENDOR_ORDERS.GENERAL_STATUS.NEW';
    }
  }
}
