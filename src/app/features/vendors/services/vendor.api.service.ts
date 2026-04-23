import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '@core/services/auth.service';
import {
  DocumentsStatus,
  OnboardingStage,
  PaginatedVendors,
  PayoutStatus,
  RiskLevel,
  Vendor,
  VendorDetail,
  VendorKPIs,
  VendorReviewDocument,
  VendorReviewNote,
  VendorReviewState,
  VendorRiskIndicator,
  VendorStatus,
  VerificationStatus
} from '@vendors/models/vendors.domain.models';

interface VendorSeed {
  id: string;
  businessNameAr: string;
  businessNameEn: string;
  businessType: string;
  ownerName: string;
  city: string;
  region: string;
  createdAtUtc: string;
  reviewState: VendorReviewState;
  riskLevel: RiskLevel;
  payoutStatus: PayoutStatus;
  complaintsCount: number;
  hasFraudFlag: boolean;
  isLowPerformance: boolean;
  performanceRating: number;
  assignedReviewer?: string | null;
  reviewSubmittedAtUtc?: string | null;
  commissionRate?: number;
}

interface AdminVendorListItemDto {
  id: string;
  businessNameAr: string;
  businessNameEn: string;
  businessType: string;
  status: string;
  ownerName: string;
  contactPhone: string;
  createdAtUtc: string;
  contactEmail?: string | null;
  commissionRate?: number | null;
  city?: string | null;
  region?: string | null;
  accountStatus?: string | null;
  isLoginLocked?: boolean;
  lockedAtUtc?: string | null;
  archivedAtUtc?: string | null;
}

interface AdminVendorDetailDto extends AdminVendorListItemDto {
  commercialRegistrationNumber?: string | null;
  commercialRegistrationExpiryDate?: string | null;
  taxId?: string | null;
  licenseNumber?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  nationalAddress?: string | null;
  suspendedAtUtc?: string | null;
  rejectionReason?: string | null;
  suspensionReason?: string | null;
  lockReason?: string | null;
  archiveReason?: string | null;
  logoUrl?: string | null;
  commercialRegisterDocumentUrl?: string | null;
  taxDocumentUrl?: string | null;
  licenseDocumentUrl?: string | null;
  approvedAtUtc?: string | null;
  approvedByName?: string | null;
  updatedAtUtc?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  idNumber?: string | null;
  nationality?: string | null;
  payoutCycle?: string | null;
  financialLifecycleMode?: string | null;
  operationsSettings?: {
    acceptOrders: boolean;
    minimumOrderAmount?: number | null;
    preparationTimeMinutes?: number | null;
  } | null;
  notificationSettings?: {
    emailNotificationsEnabled: boolean;
    smsNotificationsEnabled: boolean;
    newOrdersNotificationsEnabled: boolean;
  } | null;
  reviewStartedAtUtc?: string | null;
  reviewCompletedAtUtc?: string | null;
  requestedChangesAtUtc?: string | null;
  reviewDecisionReason?: string | null;
  readyForFinalApproval?: boolean | null;
  reviewNotes?: Array<{
    id: string;
    authorName: string;
    roleLabel: string;
    createdAtUtc: string;
    message?: string | null;
    messageKey?: string | null;
    tone: 'info' | 'success' | 'warning' | 'danger' | string;
    isSystem?: boolean;
  }> | null;
  reviewDocuments?: Array<{
    id: string;
    type: VendorReviewDocument['type'] | string;
    titleKey: string;
    descriptionKey: string;
    icon: string;
    status: VendorReviewDocument['status'] | string;
    statusLabelKey: string;
    iconBgClass: string;
    isRequired: boolean;
    isUploaded: boolean;
    previewKind: VendorReviewDocument['previewKind'] | string;
    fileUrl?: string | null;
    reviewDecision: VendorReviewDocument['reviewDecision'] | string;
    rejectionReason?: string | null;
    reviewedAtUtc?: string | null;
    reviewedByName?: string | null;
  }> | null;
  primaryBankAccount?: VendorDetail['primaryBankAccount'];
  operatingHours?: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
  }> | null;
  branchesCount?: number | null;
  bankAccountsCount?: number | null;
}

interface ApiPaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface AdminVendorOrderItem {
  id: string;
  orderNumber: string;
  vendorId: string;
  customerId: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  commissionAmount: number;
  totalAmount: number;
  itemsCount: number;
  placedAtUtc: string;
}

export interface AdminVendorProductItem {
  id: string;
  vendorId: string;
  masterProductId: string;
  sellingPrice: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  isAvailable: boolean;
  status: string;
  masterProduct: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    barcode?: string | null;
    categoryId: string;
    brandId?: string | null;
    unitOfMeasureId?: string | null;
    status: string;
    images: Array<{
      url: string;
      altText?: string | null;
      displayOrder: number;
      isPrimary: boolean;
    }>;
  };
}

export type AdminVendorAnalyticsRange = '7d' | '30d' | '90d';

export interface AdminVendorAnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  completionRate: number;
  cancellationRate: number;
  availableProducts: number;
  lowStockProducts: number;
}

export interface AdminVendorAnalyticsTrendPoint {
  date: string;
  ordersCount: number;
  revenue: number;
}

export interface AdminVendorAnalyticsStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface AdminVendorAnalyticsProductHealth {
  available: number;
  lowStock: number;
  outOfStock: number;
  inactive: number;
}

export interface AdminVendorAnalyticsTopProduct {
  vendorProductId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
  ordersCount: number;
}

export interface AdminVendorAnalyticsMeta {
  range: AdminVendorAnalyticsRange;
  fromUtc: string;
  toUtc: string;
  generatedAtUtc: string;
}

export interface AdminVendorAnalyticsDto {
  summary: AdminVendorAnalyticsSummary;
  salesTrend: AdminVendorAnalyticsTrendPoint[];
  orderStatusBreakdown: AdminVendorAnalyticsStatusBreakdown[];
  productHealth: AdminVendorAnalyticsProductHealth;
  topProducts: AdminVendorAnalyticsTopProduct[];
  meta: AdminVendorAnalyticsMeta;
}

export interface AdminVendorSettlementItem {
  id: string;
  settlementNumber: string;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  origin: string;
  status: string;
  createdAtUtc: string;
  processedAtUtc?: string | null;
  payoutsCount: number;
  ordersCount: number;
  sourceOrderId?: string | null;
  sourceOrderNumber?: string | null;
}

export interface AdminVendorPayoutItem {
  id: string;
  settlementId: string;
  payoutNumber: string;
  amount: number;
  origin: string;
  status: string;
  transferReference?: string | null;
  createdAtUtc: string;
  processedAtUtc?: string | null;
  sourceOrderId?: string | null;
  sourceOrderNumber?: string | null;
  vendorBankAccountId?: string | null;
  bankName?: string | null;
  accountHolderName?: string | null;
  iban?: string | null;
  swiftCode?: string | null;
}

export interface AdminSendVendorNotificationRequest {
  titleAr?: string | null;
  titleEn?: string | null;
  bodyAr?: string | null;
  bodyEn?: string | null;
  type?: string | null;
  referenceId?: string | null;
  data?: string | null;
  targetUrl?: string | null;
  sendPush?: boolean;
}

export interface AdminVendorNotificationResponse {
  message: string;
  vendorId: string;
  userId: string;
  externalId: string;
  type: string;
  inboxRequested: boolean;
  pushAttempted: boolean;
  pushSent: boolean;
  pushSkipped: boolean;
  pushStatusCode?: number | null;
  providerNotificationId?: string | null;
  pushReason?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private readonly apiUrl = `${environment.apiUrl}/admin/vendors`;
  private readonly vendorStore = this.buildMockVendorStore();
  private readonly apiVendorStore = new Map<string, VendorDetail>();
  private readonly fallbackWarnings = new Set<string>();
  private unauthorizedReadToken: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getVendors(
    pageNumber: number = 1,
    pageSize: number = 10,
    search?: string,
    status?: VendorStatus
  ): Observable<PaginatedVendors> {
    const fallback = this.buildLocalPaginatedVendors(pageNumber, pageSize, search, status);

    let params = new HttpParams()
      .set('page', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedVendors | AdminVendorListItemDto[]>(this.apiUrl, { params }).pipe(
      map((response) => this.normalizeVendorResponse(response, pageNumber, pageSize, search, status)),
      catchError((error) => this.handleReadFallback('Vendor list', fallback, error))
    );
  }

  getVendorById(id: string): Observable<VendorDetail> {
    const fallback = this.getFallbackVendorDetail(id);

    return this.http.get<AdminVendorDetailDto>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        const mappedVendor = this.mapApiVendorDetail(response, fallback);
        this.rememberVendorDetail(mappedVendor);
        return mappedVendor;
      }),
      catchError((error) => this.handleReadFallback('Vendor detail', this.clone(fallback), error))
    );
  }

  getVendorSnapshotById(id: string): VendorDetail | undefined {
    const vendor = this.apiVendorStore.get(id) ?? this.findVendor(id);
    return vendor ? this.clone(vendor) : undefined;
  }

  getVendorsSnapshot(): VendorDetail[] {
    if (this.apiVendorStore.size > 0) {
      return Array.from(this.apiVendorStore.values()).map((vendor) => this.clone(vendor));
    }

    return this.vendorStore.map((vendor) => this.clone(vendor));
  }

  getVendorKPIs(): Observable<VendorKPIs> {
    if (this.shouldUseLocalReadFallback()) {
      return of(this.buildVendorKPIs(this.vendorStore));
    }

    return this.http.get<PaginatedVendors | AdminVendorListItemDto[]>(this.apiUrl, {
      params: new HttpParams().set('page', '1').set('pageSize', '250')
    }).pipe(
      map((response) => this.normalizeVendorResponse(response, 1, 250)),
      map((response) => this.buildVendorKPIsFromSummaries(response.items ?? [])),
      catchError((error) => this.handleReadFallback('Vendor KPIs', this.buildVendorKPIs(this.vendorStore), error))
    );
  }

  getVendorOrders(
    vendorId: string,
    pageOrOptions: number | {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
      paymentStatus?: string;
    } = 1,
    pageSize: number = 10
  ): Observable<ApiPaginatedResponse<AdminVendorOrderItem>> {
    const options = typeof pageOrOptions === 'number'
      ? { page: pageOrOptions, pageSize }
      : pageOrOptions;

    const page = options.page ?? 1;
    const size = options.pageSize ?? 10;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', size.toString());

    if (options.search?.trim()) {
      params = params.set('search', options.search.trim());
    }

    if (options.status?.trim()) {
      params = params.set('status', options.status.trim());
    }

    if (options.paymentStatus?.trim()) {
      params = params.set('paymentStatus', options.paymentStatus.trim());
    }

    return this.http.get<ApiPaginatedResponse<AdminVendorOrderItem>>(`${this.apiUrl}/${vendorId}/orders`, {
      params
    });
  }

  getVendorProducts(
    vendorId: string,
    options?: {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
    }
  ): Observable<ApiPaginatedResponse<AdminVendorProductItem>> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (options?.search?.trim()) {
      params = params.set('search', options.search.trim());
    }

    if (options?.status?.trim()) {
      params = params.set('status', options.status.trim());
    }

    return this.http.get<ApiPaginatedResponse<AdminVendorProductItem>>(`${this.apiUrl}/${vendorId}/products`, {
      params
    });
  }

  getVendorAnalytics(vendorId: string, range: AdminVendorAnalyticsRange = '30d'): Observable<AdminVendorAnalyticsDto> {
    return this.http.get<AdminVendorAnalyticsDto>(`${this.apiUrl}/${vendorId}/analytics`, {
      params: new HttpParams().set('range', range)
    });
  }

  getVendorSettlements(vendorId: string, page: number = 1, pageSize: number = 20): Observable<ApiPaginatedResponse<AdminVendorSettlementItem>> {
    return this.http.get<ApiPaginatedResponse<AdminVendorSettlementItem>>(`${this.apiUrl}/${vendorId}/settlements`, {
      params: new HttpParams()
        .set('page', page.toString())
        .set('pageSize', pageSize.toString())
    });
  }

  getVendorPayouts(vendorId: string, page: number = 1, pageSize: number = 20): Observable<ApiPaginatedResponse<AdminVendorPayoutItem>> {
    return this.http.get<ApiPaginatedResponse<AdminVendorPayoutItem>>(`${this.apiUrl}/${vendorId}/payouts`, {
      params: new HttpParams()
        .set('page', page.toString())
        .set('pageSize', pageSize.toString())
    });
  }

  createVendorSettlement(
    vendorId: string,
    payload: {
      grossAmount: number;
      commissionAmount: number;
      netAmount: number;
    }
  ): Observable<{ settlementId: string }> {
    return this.http.post<{ settlementId: string }>(`${this.apiUrl}/${vendorId}/settlements`, payload);
  }

  updateVendorFinanceSettings(
    id: string,
    payload: {
      financialLifecycleMode: string;
      payoutCycle?: string | null;
    }
  ): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.put<VendorDetail>(`${this.apiUrl}/${id}/finance-settings`, payload)
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.financialLifecycleMode = payload.financialLifecycleMode;
        vendor.payoutCycle = payload.financialLifecycleMode === 'per_order_direct_payout'
          ? null
          : payload.payoutCycle ?? vendor.payoutCycle ?? null;
      }),
      id
    );
  }

  retryVendorPayout(vendorId: string, payoutId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${vendorId}/payouts/${payoutId}/retry`, {});
  }

  suspendVendorPayout(vendorId: string, payoutId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${vendorId}/payouts/${payoutId}/suspend`, {});
  }

  escalateVendorPayout(vendorId: string, payoutId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${vendorId}/payouts/${payoutId}/escalate`, {});
  }

  sendVendorNotificationTest(
    vendorId: string,
    payload: AdminSendVendorNotificationRequest = {}
  ): Observable<AdminVendorNotificationResponse> {
    return this.http.post<AdminVendorNotificationResponse>(`${this.apiUrl}/${vendorId}/notifications/test`, payload);
  }

  private shouldUseLocalReadFallback(): boolean {
    if (!environment.skipAuthForDevelopment) {
      return false;
    }

    const token = this.authService.getToken() ?? '__guest__';
    if (this.unauthorizedReadToken && this.unauthorizedReadToken !== token) {
      this.resetReadFallbackState();
    }

    return this.unauthorizedReadToken !== null;
  }

  private handleReadFallback<T>(context: string, fallback: T, error: unknown): Observable<T> {
    if (!environment.skipAuthForDevelopment) {
      return throwError(() => error);
    }

    const unauthorized = this.isUnauthorizedError(error);
    if (unauthorized) {
      this.unauthorizedReadToken = this.authService.getToken() ?? '__guest__';
    }

    if (!this.fallbackWarnings.has(context)) {
      this.fallbackWarnings.add(context);
      console.warn(
        unauthorized
          ? `${context} API returned 401/403, using local fallback data until authentication is refreshed.`
          : `${context} API failed, using local fallback data.`,
        error
      );
    }

    return of(fallback);
  }

  private resetReadFallbackState(): void {
    this.unauthorizedReadToken = null;
    this.fallbackWarnings.clear();
  }

  private isUnauthorizedError(error: unknown): boolean {
    return error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403);
  }

  approveVendor(id: string, commissionRate: number): Observable<{ message: string }> {
    const request$ = this.canUseApiMutations()
      ? this.http.post(`${this.apiUrl}/${id}/approve`, { commissionRate })
      : null;

    return this.executeApiMessage(
      request$,
      () => this.applyApproval(id, commissionRate),
      'Vendor account approved successfully.'
    );
  }

  rejectVendor(id: string, reason: string): Observable<{ message: string }> {
    const request$ = this.canUseApiMutations()
      ? this.http.post(`${this.apiUrl}/${id}/reject`, { reason })
      : null;

    return this.executeApiMessage(
      request$,
      () => this.applyRejection(id, reason),
      'Vendor account rejected.'
    );
  }

  suspendVendor(id: string, reason: string): Observable<{ message: string }> {
    const request$ = this.canUseApiMutations()
      ? this.http.post(`${this.apiUrl}/${id}/suspend`, { reason })
      : null;

    return this.executeApiMessage(
      request$,
      () => this.applySuspension(id, reason),
      'Vendor account suspended.'
    );
  }

  approveVendorReview(id: string, commissionRate: number = 13): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.post(`${this.apiUrl}/${id}/approve`, { commissionRate })
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.applyApproval(id, commissionRate)
    );
  }

  requestVendorDocuments(
    id: string,
    note: string = 'Please re-upload the missing documents and confirm the latest business details.'
  ): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.post<VendorDetail>(`${this.apiUrl}/${id}/request-documents`, { note })
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.reviewState = 'changes_requested';
        vendor.assignedReviewer = vendor.assignedReviewer || 'Vendor Compliance Desk';
        vendor.requestedChangesAtUtc = this.timestamp();
        vendor.reviewDecisionReason = note;
        vendor.reviewCompletedAtUtc = null;
        this.markDocumentForReupload(vendor.reviewDocuments);
        this.pushSystemNote(vendor, {
          authorName: 'Vendor Compliance Desk',
          roleLabel: 'Compliance Review',
          messageKey: 'VENDOR_REVIEW.NOTES.CHANGES_REQUESTED',
          tone: 'warning'
        });
      }),
      id
    );
  }

  startVendorReview(id: string): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.post<VendorDetail>(`${this.apiUrl}/${id}/start-review`, {})
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.reviewState = 'under_review';
        vendor.assignedReviewer = vendor.assignedReviewer || 'Vendor Compliance Desk';
        vendor.reviewStartedAtUtc = vendor.reviewStartedAtUtc || this.timestamp();
        vendor.reviewSubmittedAtUtc = vendor.reviewSubmittedAtUtc || this.timestamp();
        vendor.reviewCompletedAtUtc = null;
        this.markPendingDocuments(vendor.reviewDocuments);
        this.pushSystemNote(vendor, {
          authorName: 'Vendor Compliance Desk',
          roleLabel: 'Compliance Review',
          messageKey: 'VENDOR_REVIEW.NOTES.UNDER_REVIEW',
          tone: 'info'
        });
      }),
      id
    );
  }

  rejectVendorReview(
    id: string,
    reason: string = 'Submitted data did not pass compliance review.'
  ): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.post(`${this.apiUrl}/${id}/reject`, { reason })
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.applyRejection(id, reason)
    );
  }

  suspendVendorAccount(
    id: string,
    reason: string = 'The account was suspended pending a manual compliance decision.'
  ): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.post(`${this.apiUrl}/${id}/suspend`, { reason })
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.applySuspension(id, reason)
    );
  }

  reactivateVendorAccount(id: string): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.post(`${this.apiUrl}/${id}/reactivate`, {})
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.applyReactivation(id),
      id
    );
  }

  lockVendorLogin(id: string, reason: string): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.post(`${this.apiUrl}/${id}/lock-login`, { reason })
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.isLoginLocked = true;
        vendor.lockedAtUtc = this.timestamp();
        vendor.lockReason = reason;
        if (vendor.status === VendorStatus.Active) {
          vendor.status = VendorStatus.Suspended;
        }
      }),
      id
    );
  }

  unlockVendorLogin(id: string): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.post(`${this.apiUrl}/${id}/unlock-login`, {})
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.isLoginLocked = false;
        vendor.lockedAtUtc = null;
        vendor.lockReason = null;
        if (vendor.status === VendorStatus.Suspended
          && !vendor.archivedAtUtc
          && !vendor.suspensionReason
          && !vendor.rejectionReason) {
          vendor.status = VendorStatus.Active;
        }
      }),
      id
    );
  }

  archiveVendorAccount(id: string, reason: string): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.post(`${this.apiUrl}/${id}/archive`, { reason })
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.archivedAtUtc = this.timestamp();
        vendor.archiveReason = reason;
        vendor.status = VendorStatus.Suspended;
      }),
      id
    );
  }

  resetVendorPassword(id: string, newPassword: string): Observable<{ message: string }> {
    const request$ = this.canUseApiMutations()
      ? this.http.post(`${this.apiUrl}/${id}/reset-password`, { newPassword })
      : null;

    return this.executeApiMessage(
      request$,
      () => this.findVendorOrFallback(id),
      'Vendor password reset successfully.'
    );
  }

  updateVendorStore(
    id: string,
    payload: {
      businessNameAr: string;
      businessNameEn: string;
      businessType: string;
      contactEmail: string;
      contactPhone: string;
      descriptionAr?: string | null;
      descriptionEn?: string | null;
      logoUrl?: string | null;
      commercialRegisterDocumentUrl?: string | null;
      region?: string | null;
      city?: string | null;
      nationalAddress?: string | null;
      commercialRegistrationNumber?: string | null;
    }
  ): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.put<VendorDetail>(`${this.apiUrl}/${id}/store`, payload)
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.businessNameAr = payload.businessNameAr;
        vendor.businessNameEn = payload.businessNameEn;
        vendor.businessType = payload.businessType;
        vendor.contactEmail = payload.contactEmail;
        vendor.contactPhone = payload.contactPhone;
        vendor.region = payload.region ?? vendor.region;
        vendor.city = payload.city ?? vendor.city;
        vendor.nationalAddress = payload.nationalAddress ?? vendor.nationalAddress;
        vendor.commercialRegistrationNumber = payload.commercialRegistrationNumber ?? vendor.commercialRegistrationNumber;
        vendor.logoUrl = payload.logoUrl ?? vendor.logoUrl;
        vendor.commercialRegisterDocumentUrl = payload.commercialRegisterDocumentUrl ?? vendor.commercialRegisterDocumentUrl;
      }),
      id
    );
  }

  updateVendorContact(
    id: string,
    payload: {
      region: string;
      city: string;
      nationalAddress: string;
    }
  ): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.put<VendorDetail>(`${this.apiUrl}/${id}/contact`, payload)
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.region = payload.region;
        vendor.city = payload.city;
        vendor.nationalAddress = payload.nationalAddress;
      }),
      id
    );
  }

  updateVendorOwner(
    id: string,
    payload: {
      ownerName: string;
      ownerEmail: string;
      ownerPhone: string;
      idNumber?: string | null;
      nationality?: string | null;
    }
  ): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.put<VendorDetail>(`${this.apiUrl}/${id}/owner`, payload)
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.ownerName = payload.ownerName;
        vendor.ownerEmail = payload.ownerEmail;
        vendor.ownerPhone = payload.ownerPhone;
        vendor.idNumber = payload.idNumber ?? vendor.idNumber;
        vendor.nationality = payload.nationality ?? vendor.nationality;
      }),
      id
    );
  }

  updateVendorLegalBanking(
    id: string,
    payload: {
      commercialRegistrationNumber: string;
      commercialRegistrationExpiryDate?: string | null;
      taxId?: string | null;
      licenseNumber?: string | null;
      bankName: string;
      accountHolderName: string;
      iban: string;
      swiftCode?: string | null;
      commercialRegisterDocumentUrl?: string | null;
      taxDocumentUrl?: string | null;
      licenseDocumentUrl?: string | null;
    }
  ): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.put<VendorDetail>(`${this.apiUrl}/${id}/legal-banking`, payload)
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.commercialRegistrationNumber = payload.commercialRegistrationNumber;
        vendor.commercialRegistrationExpiryDate = payload.commercialRegistrationExpiryDate ?? vendor.commercialRegistrationExpiryDate;
        vendor.taxId = payload.taxId ?? vendor.taxId;
        vendor.licenseNumber = payload.licenseNumber ?? vendor.licenseNumber;
        vendor.commercialRegisterDocumentUrl = payload.commercialRegisterDocumentUrl ?? vendor.commercialRegisterDocumentUrl;
        vendor.taxDocumentUrl = payload.taxDocumentUrl ?? vendor.taxDocumentUrl;
        vendor.licenseDocumentUrl = payload.licenseDocumentUrl ?? vendor.licenseDocumentUrl;
        vendor.primaryBankAccount = {
          id: vendor.primaryBankAccount?.id || 'draft-primary-bank-account',
          bankName: payload.bankName,
          accountHolderName: payload.accountHolderName,
          iban: payload.iban,
          swiftCode: payload.swiftCode ?? vendor.primaryBankAccount?.swiftCode ?? null,
          isPrimary: true,
          status: vendor.primaryBankAccount?.status || 'PendingVerification',
          rejectionReason: null,
          verifiedAtUtc: null
        };
      }),
      id
    );
  }

  approveVendorDocument(id: string, documentId: string): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.post<VendorDetail>(`${this.apiUrl}/${id}/documents/${documentId}/approve`, {})
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        const target = vendor.reviewDocuments.find((document) => document.id === documentId);
        if (!target) {
          return;
        }

        target.reviewDecision = 'approved';
        target.rejectionReason = null;
        target.reviewedAtUtc = this.timestamp();
        target.reviewedBy = 'Vendor Compliance Desk';
      }),
      id
    );
  }

  rejectVendorDocument(id: string, documentId: string, reason: string): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.post<VendorDetail>(`${this.apiUrl}/${id}/documents/${documentId}/reject`, { reason })
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        const target = vendor.reviewDocuments.find((document) => document.id === documentId);
        if (!target) {
          return;
        }

        target.reviewDecision = 'rejected';
        target.rejectionReason = reason;
        target.reviewedAtUtc = this.timestamp();
        target.reviewedBy = 'Vendor Compliance Desk';
        vendor.requestedChangesAtUtc = this.timestamp();
        vendor.reviewDecisionReason = reason;

        this.pushSystemNote(vendor, {
          authorName: 'Vendor Compliance Desk',
          roleLabel: 'Document Review',
          message: reason,
          tone: 'warning'
        });
      }),
      id
    );
  }

  updateVendorHours(
    id: string,
    payload: {
      hours: Array<{
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
        isOpen: boolean;
      }>;
    }
  ): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.put<VendorDetail>(`${this.apiUrl}/${id}/hours`, payload)
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.operatingHours = payload.hours.map((hour) => ({ ...hour }));
      }),
      id
    );
  }

  updateVendorOperationsSettings(
    id: string,
    payload: {
      acceptOrders: boolean;
      minimumOrderAmount?: number | null;
      preparationTimeMinutes?: number | null;
    }
  ): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.put<VendorDetail>(`${this.apiUrl}/${id}/operations-settings`, payload)
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.operationsSettings = {
          acceptOrders: payload.acceptOrders,
          minimumOrderAmount: payload.minimumOrderAmount ?? null,
          preparationTimeMinutes: payload.preparationTimeMinutes ?? null
        };
      }),
      id
    );
  }

  updateVendorNotificationSettings(
    id: string,
    payload: {
      emailNotificationsEnabled: boolean;
      smsNotificationsEnabled: boolean;
      newOrdersNotificationsEnabled: boolean;
    }
  ): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.put<VendorDetail>(`${this.apiUrl}/${id}/notification-settings`, payload)
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.notificationSettings = {
          emailNotificationsEnabled: payload.emailNotificationsEnabled,
          smsNotificationsEnabled: payload.smsNotificationsEnabled,
          newOrdersNotificationsEnabled: payload.newOrdersNotificationsEnabled
        };
      }),
      id
    );
  }

  addVendorReviewNote(
    id: string,
    message: string,
    authorName: string = 'Operations Reviewer',
    roleLabel: string = 'Vendor Review'
  ): Observable<VendorDetail> {
    const request$ = this.canUseApiMutations()
      ? this.http.post<VendorDetail>(`${this.apiUrl}/${id}/review-notes`, {
          message,
          authorName,
          roleLabel
        })
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.updateVendor(id, (vendor) => {
        vendor.reviewNotes = [
          {
            id: this.nextNoteId(vendor.reviewNotes),
            authorName,
            roleLabel,
            createdAtUtc: this.timestamp(),
            message,
            tone: 'info'
          },
          ...vendor.reviewNotes
        ];
      }),
      id
    );
  }

  private executeApiMessage(
    request$: Observable<unknown> | null,
    localMutation: () => VendorDetail,
    successMessage: string
  ): Observable<{ message: string }> {
    if (!request$) {
      localMutation();
      return of({ message: successMessage });
    }

    return request$.pipe(
      map(() => {
        localMutation();
        return { message: successMessage };
      })
    );
  }

  private executeVendorMutation(
    request$: Observable<unknown> | null,
    localMutation: () => VendorDetail,
    vendorId?: string
  ): Observable<VendorDetail> {
    if (!request$) {
      return of(localMutation());
    }

    return request$.pipe(
      switchMap(() => vendorId ? this.getVendorById(vendorId) : of(localMutation()))
    );
  }

  private canUseApiMutations(): boolean {
    return this.authService.hasApiSession || !environment.skipAuthForDevelopment;
  }

  private normalizeVendorResponse(
    response: PaginatedVendors | AdminVendorListItemDto[] | null | undefined,
    pageNumber: number,
    pageSize: number,
    search?: string,
    status?: VendorStatus
  ): PaginatedVendors {
    if (Array.isArray(response)) {
      const enriched = response.map((vendor) => this.mapApiVendorSummary(vendor));
      enriched.forEach((vendor) => this.rememberVendorSummary(vendor));
      return this.paginateVendors(enriched, pageNumber, pageSize, search, status);
    }

    if (response && Array.isArray(response.items)) {
      const items = response.items.map((vendor) => this.mapApiVendorSummary(vendor as AdminVendorListItemDto));
      items.forEach((vendor) => this.rememberVendorSummary(vendor));
      const totalCount = response.totalCount ?? items.length;
      const totalPages = response.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));
      const safePage = response.pageNumber ?? Math.min(Math.max(1, pageNumber), totalPages);

      return {
        items,
        totalCount,
        totalPages,
        pageNumber: safePage,
        hasPreviousPage: response.hasPreviousPage ?? safePage > 1,
        hasNextPage: response.hasNextPage ?? safePage < totalPages
      };
    }

    return this.buildLocalPaginatedVendors(pageNumber, pageSize, search, status);
  }

  private buildLocalPaginatedVendors(
    pageNumber: number,
    pageSize: number,
    search?: string,
    status?: VendorStatus
  ): PaginatedVendors {
    const summaries = this.vendorStore.map((vendor) => this.toVendorSummary(vendor));
    return this.paginateVendors(summaries, pageNumber, pageSize, search, status);
  }

  private paginateVendors(
    vendors: Vendor[],
    pageNumber: number,
    pageSize: number,
    search?: string,
    status?: VendorStatus
  ): PaginatedVendors {
    const normalizedSearch = search?.trim().toLowerCase() || '';

    const filtered = vendors.filter((vendor) => {
      const matchesStatus = !status || vendor.status === status;
      const matchesSearch = !normalizedSearch || [
        vendor.id,
        vendor.businessNameAr,
        vendor.businessNameEn,
        vendor.ownerName,
        vendor.contactEmail,
        vendor.contactPhone,
        vendor.assignedReviewer || ''
      ].some((value) => (value || '').toLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesSearch;
    });

    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(Math.max(1, pageNumber), totalPages);
    const startIndex = (safePage - 1) * pageSize;

    return {
      items: filtered.slice(startIndex, startIndex + pageSize).map((vendor) => this.clone(vendor)),
      pageNumber: safePage,
      totalPages,
      totalCount,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages
    };
  }

  private buildVendorKPIs(vendors: VendorDetail[]): VendorKPIs {
    return {
      pendingApproval: vendors.filter((vendor) => vendor.reviewState === 'submitted' || vendor.reviewState === 'under_review').length,
      missingDocuments: vendors.filter((vendor) => vendor.reviewState === 'awaiting_submission' || vendor.reviewState === 'changes_requested').length,
      highRisk: vendors.filter((vendor) => vendor.riskLevel === RiskLevel.High || vendor.riskLevel === RiskLevel.Critical).length,
      payoutBlocked: vendors.filter((vendor) => vendor.payoutStatus === PayoutStatus.Blocked).length,
      suspended: vendors.filter((vendor) => vendor.status === VendorStatus.Suspended).length
    };
  }

  private buildVendorKPIsFromSummaries(vendors: Vendor[]): VendorKPIs {
    return {
      pendingApproval: vendors.filter((vendor) => vendor.status === VendorStatus.Pending).length,
      missingDocuments: vendors.filter((vendor) => (vendor.documentsCompleteness ?? 0) < 100).length,
      highRisk: vendors.filter((vendor) => vendor.riskLevel === RiskLevel.High || vendor.riskLevel === RiskLevel.Critical).length,
      payoutBlocked: vendors.filter((vendor) => vendor.payoutStatus === PayoutStatus.Blocked).length,
      suspended: vendors.filter((vendor) => vendor.status === VendorStatus.Suspended).length
    };
  }

  private mapApiVendorSummary(apiVendor: AdminVendorListItemDto): Vendor {
    const businessNameAr = apiVendor.businessNameAr?.trim() || apiVendor.businessNameEn?.trim() || '';
    const businessNameEn = apiVendor.businessNameEn?.trim() || apiVendor.businessNameAr?.trim() || '';
    const businessType = apiVendor.businessType?.trim() || 'Retail';
    const ownerName = apiVendor.ownerName?.trim() || apiVendor.contactEmail?.trim() || 'Vendor';
    const contactPhone = apiVendor.contactPhone?.trim() || '';
    const status = this.normalizeStatus(apiVendor.status);
    const accountStatus = apiVendor.accountStatus || (status === VendorStatus.Active ? 'Active' : 'Pending');
    const isLocked = apiVendor.isLoginLocked ?? false;

    return this.clone({
      id: apiVendor.id,
      businessNameAr,
      businessNameEn,
      businessType,
      status,
      accountStatus,
      isLoginLocked: isLocked,
      lockedAtUtc: apiVendor.lockedAtUtc ?? null,
      archivedAtUtc: apiVendor.archivedAtUtc ?? null,
      suspendedAtUtc: status === VendorStatus.Suspended ? (apiVendor.lockedAtUtc ?? null) : null,
      ownerName,
      contactPhone,
      createdAtUtc: apiVendor.createdAtUtc,
      contactEmail: apiVendor.contactEmail ?? '',
      commissionRate: apiVendor.commissionRate ?? null,
      city: apiVendor.city ?? undefined,
      region: apiVendor.region ?? undefined,
      onboardingStage: this.resolveOnboardingStage(status),
      verificationStatus: this.resolveVerificationStatus(status),
      documentsStatus: this.resolveDocumentsStatusFromStatus(status),
      riskLevel: this.resolveRiskLevel(status, accountStatus, isLocked),
      payoutStatus: status === VendorStatus.Active ? PayoutStatus.Active : PayoutStatus.Pending,
      documentsCompleteness: this.resolveDocumentsCompleteness(status),
      hasKYC: status === VendorStatus.Active,
      hasPendingCompliance: status === VendorStatus.Pending,
      hasFraudFlag: false,
      complaintsCount: 0,
      isLowPerformance: false,
      reviewState: this.resolveReviewState(status, isLocked, apiVendor.archivedAtUtc),
      assignedReviewer: null,
      reviewSubmittedAtUtc: status === VendorStatus.Pending ? apiVendor.createdAtUtc : null,
      reviewUpdatedAtUtc: apiVendor.lockedAtUtc ?? apiVendor.archivedAtUtc ?? apiVendor.createdAtUtc
    });
  }

  private mapApiVendorDetail(apiVendor: AdminVendorDetailDto, fallback?: VendorDetail): VendorDetail {
    const summary = this.mapApiVendorSummary(apiVendor);
    const base = fallback ?? this.createVendorDetailFromSummary(summary);
    const primaryBankAccount = apiVendor.primaryBankAccount
      ? {
          ...apiVendor.primaryBankAccount,
          id: apiVendor.primaryBankAccount.id || 'primary-bank'
        }
      : base.primaryBankAccount ?? null;

    const vendor = this.clone({
      ...base,
      ...summary,
      commercialRegistrationNumber: apiVendor.commercialRegistrationNumber ?? base.commercialRegistrationNumber,
      commercialRegistrationExpiryDate: apiVendor.commercialRegistrationExpiryDate ?? base.commercialRegistrationExpiryDate ?? null,
      taxId: apiVendor.taxId ?? base.taxId ?? null,
      licenseNumber: apiVendor.licenseNumber ?? base.licenseNumber ?? null,
      descriptionAr: apiVendor.descriptionAr ?? base.descriptionAr ?? null,
      descriptionEn: apiVendor.descriptionEn ?? base.descriptionEn ?? null,
      nationalAddress: apiVendor.nationalAddress ?? base.nationalAddress ?? null,
      suspendedAtUtc: apiVendor.suspendedAtUtc ?? base.suspendedAtUtc ?? null,
      rejectionReason: apiVendor.rejectionReason ?? base.rejectionReason ?? null,
      suspensionReason: apiVendor.suspensionReason ?? base.suspensionReason ?? null,
      lockReason: apiVendor.lockReason ?? base.lockReason ?? null,
      archiveReason: apiVendor.archiveReason ?? base.archiveReason ?? null,
      logoUrl: apiVendor.logoUrl ?? base.logoUrl ?? null,
      commercialRegisterDocumentUrl: apiVendor.commercialRegisterDocumentUrl ?? base.commercialRegisterDocumentUrl ?? null,
      taxDocumentUrl: apiVendor.taxDocumentUrl ?? base.taxDocumentUrl ?? null,
      licenseDocumentUrl: apiVendor.licenseDocumentUrl ?? base.licenseDocumentUrl ?? null,
      approvedAtUtc: apiVendor.approvedAtUtc ?? base.approvedAtUtc ?? null,
      approvedBy: apiVendor.approvedByName ?? base.approvedBy ?? null,
      updatedAtUtc: apiVendor.updatedAtUtc ?? base.updatedAtUtc ?? summary.reviewUpdatedAtUtc ?? null,
      ownerEmail: apiVendor.ownerEmail ?? base.ownerEmail ?? '',
      ownerPhone: apiVendor.ownerPhone ?? base.ownerPhone ?? apiVendor.contactPhone,
      idNumber: apiVendor.idNumber ?? base.idNumber ?? null,
      nationality: apiVendor.nationality ?? base.nationality ?? null,
      payoutCycle: apiVendor.payoutCycle ?? base.payoutCycle ?? null,
      financialLifecycleMode: apiVendor.financialLifecycleMode ?? base.financialLifecycleMode ?? null,
      operationsSettings: apiVendor.operationsSettings
        ? {
            acceptOrders: apiVendor.operationsSettings.acceptOrders,
            minimumOrderAmount: apiVendor.operationsSettings.minimumOrderAmount ?? null,
            preparationTimeMinutes: apiVendor.operationsSettings.preparationTimeMinutes ?? null
          }
        : base.operationsSettings ?? null,
      notificationSettings: apiVendor.notificationSettings
        ? {
            emailNotificationsEnabled: apiVendor.notificationSettings.emailNotificationsEnabled,
            smsNotificationsEnabled: apiVendor.notificationSettings.smsNotificationsEnabled,
            newOrdersNotificationsEnabled: apiVendor.notificationSettings.newOrdersNotificationsEnabled
          }
        : base.notificationSettings ?? null,
      operatingHours: apiVendor.operatingHours?.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isOpen: hour.isOpen
      })) ?? base.operatingHours ?? [],
      reviewStartedAtUtc: apiVendor.reviewStartedAtUtc ?? base.reviewStartedAtUtc ?? null,
      reviewCompletedAtUtc: apiVendor.reviewCompletedAtUtc ?? base.reviewCompletedAtUtc ?? null,
      requestedChangesAtUtc: apiVendor.requestedChangesAtUtc ?? base.requestedChangesAtUtc ?? null,
      reviewDecisionReason: apiVendor.reviewDecisionReason ?? base.reviewDecisionReason ?? null,
      readyForFinalApproval: apiVendor.readyForFinalApproval ?? base.readyForFinalApproval ?? false,
      primaryBankAccount,
      branchesCount: apiVendor.branchesCount ?? base.branchesCount ?? 0,
      bankAccountsCount: apiVendor.bankAccountsCount ?? base.bankAccountsCount ?? (primaryBankAccount ? 1 : 0),
      reviewDocuments: this.buildReviewDocumentsFromApi(apiVendor, base),
      reviewNotes: (apiVendor.reviewNotes?.map((note) => ({
        id: note.id,
        authorName: note.authorName,
        roleLabel: note.roleLabel,
        createdAtUtc: note.createdAtUtc,
        message: note.message ?? undefined,
        messageKey: note.messageKey ?? undefined,
        tone: this.normalizeReviewTone(note.tone),
        isSystem: note.isSystem ?? false
      })) ?? base.reviewNotes ?? []),
      riskIndicators: base.riskIndicators ?? []
    });

    vendor.reviewState = this.resolveDetailReviewState(vendor);
    vendor.reviewUpdatedAtUtc = vendor.updatedAtUtc
      ?? vendor.requestedChangesAtUtc
      ?? vendor.reviewCompletedAtUtc
      ?? vendor.reviewStartedAtUtc
      ?? summary.reviewUpdatedAtUtc
      ?? vendor.createdAtUtc;
    vendor.riskIndicators = this.buildRiskIndicators(vendor);
    return vendor;
  }

  private rememberVendorSummary(summary: Vendor): void {
    const currentVendor = this.apiVendorStore.get(summary.id);
    if (currentVendor) {
      this.apiVendorStore.set(summary.id, this.clone({
        ...currentVendor,
        ...summary
      }));
      return;
    }

    this.apiVendorStore.set(summary.id, this.createVendorDetailFromSummary(summary));
  }

  private rememberVendorDetail(vendor: VendorDetail): void {
    this.apiVendorStore.set(vendor.id, this.clone(vendor));
  }

  private getFallbackVendorDetail(id: string): VendorDetail {
    return this.getVendorSnapshotById(id) ?? this.clone(this.findVendorOrFallback(id));
  }

  private createVendorDetailFromSummary(summary: Vendor): VendorDetail {
    const localVendor = this.findVendor(summary.id);
    const base = localVendor ? this.clone(localVendor) : this.clone(this.vendorStore[0]);

    return this.clone({
      ...base,
      ...summary,
      commercialRegistrationNumber: localVendor?.commercialRegistrationNumber ?? '',
      commercialRegistrationExpiryDate: localVendor?.commercialRegistrationExpiryDate ?? null,
      taxId: localVendor?.taxId ?? null,
      licenseNumber: localVendor?.licenseNumber ?? null,
      descriptionAr: localVendor?.descriptionAr ?? null,
      descriptionEn: localVendor?.descriptionEn ?? null,
      nationalAddress: localVendor?.nationalAddress ?? null,
      rejectionReason: localVendor?.rejectionReason ?? null,
      logoUrl: localVendor?.logoUrl ?? null,
      commercialRegisterDocumentUrl: localVendor?.commercialRegisterDocumentUrl ?? null,
      taxDocumentUrl: localVendor?.taxDocumentUrl ?? null,
      licenseDocumentUrl: localVendor?.licenseDocumentUrl ?? null,
      approvedAtUtc: localVendor?.approvedAtUtc ?? null,
      approvedBy: localVendor?.approvedBy ?? null,
      updatedAtUtc: summary.reviewUpdatedAtUtc ?? localVendor?.reviewUpdatedAtUtc ?? null,
      ownerEmail: localVendor?.ownerEmail ?? summary.contactEmail,
      ownerPhone: localVendor?.ownerPhone ?? summary.contactPhone,
      financialLifecycleMode: localVendor?.financialLifecycleMode ?? null,
      operationsSettings: localVendor?.operationsSettings ?? {
        acceptOrders: true,
        minimumOrderAmount: null,
        preparationTimeMinutes: null
      },
      notificationSettings: localVendor?.notificationSettings ?? {
        emailNotificationsEnabled: true,
        smsNotificationsEnabled: false,
        newOrdersNotificationsEnabled: true
      },
      operatingHours: localVendor?.operatingHours ?? [],
      branchesCount: localVendor?.branchesCount ?? 0,
      bankAccountsCount: localVendor?.bankAccountsCount ?? 0,
      reviewStartedAtUtc: localVendor?.reviewStartedAtUtc ?? null,
      reviewCompletedAtUtc: localVendor?.reviewCompletedAtUtc ?? null,
      requestedChangesAtUtc: localVendor?.requestedChangesAtUtc ?? null,
      reviewDecisionReason: localVendor?.reviewDecisionReason ?? null,
      primaryBankAccount: localVendor?.primaryBankAccount ?? null,
      reviewDocuments: localVendor?.reviewDocuments ?? this.buildReviewDocuments(summary.reviewState ?? 'submitted'),
      reviewNotes: localVendor?.reviewNotes ?? [],
      riskIndicators: localVendor?.riskIndicators ?? []
    });
  }

  private buildReviewDocumentsFromApi(apiVendor: AdminVendorDetailDto, fallback: VendorDetail): VendorReviewDocument[] {
    if (apiVendor.reviewDocuments?.length) {
      return apiVendor.reviewDocuments.map((document) => ({
        id: document.id,
        type: this.normalizeDocumentType(document.type),
        titleKey: document.titleKey,
        descriptionKey: document.descriptionKey,
        icon: document.icon,
        status: this.normalizeDocumentStatus(document.status),
        statusLabelKey: document.statusLabelKey,
        iconBgClass: document.iconBgClass,
        isRequired: document.isRequired,
        isUploaded: document.isUploaded,
        previewKind: this.normalizePreviewKind(document.previewKind),
        fileUrl: document.fileUrl ?? null,
        reviewDecision: this.normalizeReviewDecision(document.reviewDecision),
        rejectionReason: document.rejectionReason ?? null,
        reviewedAtUtc: document.reviewedAtUtc ?? null,
        reviewedBy: document.reviewedByName ?? null
      }));
    }

    const documents = this.buildReviewDocuments(this.resolveReviewState(
      this.normalizeStatus(apiVendor.status),
      apiVendor.isLoginLocked ?? false,
      apiVendor.archivedAtUtc ?? null
    ));

    if (
      apiVendor.idNumber
      || apiVendor.ownerName
      || apiVendor.ownerEmail
      || apiVendor.ownerPhone
      || apiVendor.commercialRegisterDocumentUrl
      || apiVendor.taxDocumentUrl
      || apiVendor.licenseDocumentUrl
      || apiVendor.commercialRegistrationNumber
      || apiVendor.taxId
      || apiVendor.licenseNumber
      || apiVendor.primaryBankAccount?.iban
    ) {
      return documents.map((document) => {
        if (document.type === 'identity' && (apiVendor.idNumber || apiVendor.ownerName || apiVendor.ownerEmail || apiVendor.ownerPhone)) {
          return this.applyDocumentStatus(document, 'completed');
        }

        if (document.type === 'commercial' && (apiVendor.commercialRegisterDocumentUrl || apiVendor.commercialRegistrationNumber)) {
          const completed = this.applyDocumentStatus(document, 'completed');
          return {
            ...completed,
            fileUrl: apiVendor.commercialRegisterDocumentUrl ?? completed.fileUrl ?? null,
            previewKind: apiVendor.commercialRegisterDocumentUrl ? 'pdf' : 'structured'
          };
        }

        if (document.type === 'tax' && (apiVendor.taxDocumentUrl || apiVendor.taxId)) {
          const completed = this.applyDocumentStatus(document, 'completed');
          return {
            ...completed,
            fileUrl: apiVendor.taxDocumentUrl ?? null,
            previewKind: apiVendor.taxDocumentUrl ? 'pdf' : 'structured'
          };
        }

        if (document.type === 'license' && (apiVendor.licenseDocumentUrl || apiVendor.licenseNumber)) {
          const completed = this.applyDocumentStatus(document, 'completed');
          return {
            ...completed,
            fileUrl: apiVendor.licenseDocumentUrl ?? null,
            previewKind: apiVendor.licenseDocumentUrl ? 'pdf' : 'structured'
          };
        }

        if (document.type === 'bank' && apiVendor.primaryBankAccount?.iban) {
          return this.applyDocumentStatus(document, 'completed');
        }

        return document;
      });
    }

    return fallback.reviewDocuments;
  }

  private normalizeStatus(status?: string | null): VendorStatus {
    switch ((status || '').toLowerCase()) {
      case 'active':
        return VendorStatus.Active;
      case 'rejected':
        return VendorStatus.Rejected;
      case 'suspended':
      case 'inactive':
      case 'archived':
        return VendorStatus.Suspended;
      case 'pendingreview':
      case 'pending_review':
      case 'pending':
      default:
        return VendorStatus.Pending;
    }
  }

  private normalizeReviewTone(tone?: string | null): 'info' | 'success' | 'warning' | 'danger' {
    switch ((tone || '').toLowerCase()) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'danger':
      case 'error':
        return 'danger';
      default:
        return 'info';
    }
  }

  private resolveReviewState(status: VendorStatus, isLoginLocked: boolean, archivedAtUtc?: string | null): VendorReviewState {
    if (archivedAtUtc || isLoginLocked || status === VendorStatus.Suspended) {
      return 'suspended';
    }

    if (status === VendorStatus.Active) {
      return 'verified';
    }

    if (status === VendorStatus.Rejected) {
      return 'rejected';
    }

    return 'submitted';
  }

  private resolveDetailReviewState(vendor: VendorDetail): VendorReviewState {
    if (vendor.archivedAtUtc || vendor.isLoginLocked || vendor.status === VendorStatus.Suspended) {
      return 'suspended';
    }

    if (vendor.status === VendorStatus.Active) {
      return 'verified';
    }

    if (vendor.status === VendorStatus.Rejected) {
      return 'rejected';
    }

    const requiredDocuments = this.getRequiredReviewDocuments(vendor.reviewDocuments);
    const hasRejectedRequiredDocument = requiredDocuments.some((document) => document.reviewDecision === 'rejected');
    const hasMissingRequiredDocument = requiredDocuments.some((document) => !document.isUploaded);

    if (hasRejectedRequiredDocument || vendor.requestedChangesAtUtc) {
      return 'changes_requested';
    }

    if (hasMissingRequiredDocument) {
      return vendor.reviewStartedAtUtc ? 'changes_requested' : 'awaiting_submission';
    }

    if (vendor.reviewStartedAtUtc) {
      return 'under_review';
    }

    return 'submitted';
  }

  private resolveOnboardingStage(status: VendorStatus): OnboardingStage {
    if (status === VendorStatus.Active) {
      return OnboardingStage.Approved;
    }

    if (status === VendorStatus.Pending) {
      return OnboardingStage.UnderReview;
    }

    return OnboardingStage.DocumentsPending;
  }

  private resolveVerificationStatus(status: VendorStatus): VerificationStatus {
    if (status === VendorStatus.Active) {
      return VerificationStatus.Verified;
    }

    if (status === VendorStatus.Pending) {
      return VerificationStatus.Pending;
    }

    return VerificationStatus.Unverified;
  }

  private resolveDocumentsStatusFromStatus(status: VendorStatus): DocumentsStatus {
    if (status === VendorStatus.Active) {
      return DocumentsStatus.Complete;
    }

    if (status === VendorStatus.Pending) {
      return DocumentsStatus.Incomplete;
    }

    return DocumentsStatus.Missing;
  }

  private resolveDocumentsCompleteness(status: VendorStatus): number {
    switch (status) {
      case VendorStatus.Active:
        return 100;
      case VendorStatus.Pending:
        return 70;
      case VendorStatus.Rejected:
        return 45;
      case VendorStatus.Suspended:
        return 100;
      default:
        return 0;
    }
  }

  private resolveRiskLevel(status: VendorStatus, accountStatus?: string | null, isLoginLocked?: boolean): RiskLevel {
    if (isLoginLocked || status === VendorStatus.Suspended) {
      return RiskLevel.High;
    }

    if ((accountStatus || '').toLowerCase() === 'inactive') {
      return RiskLevel.Medium;
    }

    return status === VendorStatus.Pending ? RiskLevel.Medium : RiskLevel.Low;
  }

  private applyApproval(id: string, commissionRate: number): VendorDetail {
    return this.updateVendor(id, (vendor) => {
      if (vendor.status === VendorStatus.Active) {
        throw new Error('التاجر معتمد بالفعل.|Vendor is already approved.');
      }

      if (vendor.status !== VendorStatus.Pending || !vendor.readyForFinalApproval) {
        throw new Error('لا يمكن اعتماد التاجر قبل إقفال المستندات المطلوبة.|Vendor cannot be approved before the required documents are closed.');
      }

      vendor.status = VendorStatus.Active;
      vendor.reviewState = 'verified';
      vendor.commissionRate = commissionRate;
      vendor.assignedReviewer = vendor.assignedReviewer || 'Vendor Compliance Desk';
      vendor.approvedAtUtc = this.timestamp();
      vendor.approvedBy = vendor.assignedReviewer;
      vendor.reviewCompletedAtUtc = this.timestamp();
      vendor.reviewDecisionReason = null;
      vendor.rejectionReason = null;
      vendor.requestedChangesAtUtc = null;
      vendor.reviewDocuments = vendor.reviewDocuments.map((document) => ({
        ...document,
        status: 'completed',
        statusLabelKey: 'COMPLIANCE.STATUS.COMPLETED',
        iconBgClass: 'bg-teal-50 text-teal-500'
      }));
      this.pushSystemNote(vendor, {
        authorName: vendor.assignedReviewer,
        roleLabel: 'Compliance Review',
        messageKey: 'VENDOR_REVIEW.NOTES.APPROVED',
        tone: 'success'
      });
    });
  }

  private applyRejection(id: string, reason: string): VendorDetail {
    return this.updateVendor(id, (vendor) => {
      const normalizedReason = reason.trim();
      if (!normalizedReason) {
        throw new Error('يجب إدخال سبب رفض واضح.|A clear rejection reason is required.');
      }

      if (vendor.status === VendorStatus.Active || vendor.status === VendorStatus.Suspended) {
        throw new Error('لا يمكن رفض تاجر معتمد أو معلق. استخدم التعليق لإيقاف الحساب التشغيلي.|Approved or suspended vendors cannot be rejected. Use suspension for operational shutdown.');
      }

      if (vendor.status !== VendorStatus.Pending) {
        throw new Error(`لا يمكن رفض التاجر بينما حالته الحالية هي ${vendor.status}.|Vendor cannot be rejected while its current status is ${vendor.status}.`);
      }

      vendor.status = VendorStatus.Rejected;
      vendor.reviewState = 'rejected';
      vendor.rejectionReason = normalizedReason;
      vendor.reviewDecisionReason = normalizedReason;
      vendor.reviewCompletedAtUtc = this.timestamp();
      vendor.approvedAtUtc = null;
      vendor.approvedBy = null;
      vendor.suspensionReason = null;
      vendor.suspendedAtUtc = null;
      this.markDocumentForReupload(vendor.reviewDocuments);
      this.pushSystemNote(vendor, {
        authorName: 'Vendor Compliance Desk',
        roleLabel: 'Compliance Review',
        messageKey: 'VENDOR_REVIEW.NOTES.REJECTED',
        tone: 'danger'
      });
    });
  }

  private applySuspension(id: string, reason: string): VendorDetail {
    return this.updateVendor(id, (vendor) => {
      const normalizedReason = reason.trim();
      if (!normalizedReason) {
        throw new Error('يجب إدخال سبب تعليق واضح.|A clear suspension reason is required.');
      }

      if (vendor.status !== VendorStatus.Active) {
        throw new Error(`لا يمكن تعليق الحساب بينما حالته الحالية هي ${vendor.status}.|Vendor cannot be suspended while its current status is ${vendor.status}.`);
      }

      vendor.status = VendorStatus.Suspended;
      vendor.reviewState = 'suspended';
      vendor.accountStatus = 'Inactive';
      vendor.reviewDecisionReason = normalizedReason;
      vendor.suspensionReason = normalizedReason;
      vendor.rejectionReason = null;
      vendor.suspendedAtUtc = this.timestamp();
      vendor.payoutStatus = PayoutStatus.Blocked;
      vendor.assignedReviewer = vendor.assignedReviewer || 'Risk & Compliance Desk';
      vendor.reviewCompletedAtUtc = this.timestamp();
      this.pushSystemNote(vendor, {
        authorName: vendor.assignedReviewer,
        roleLabel: 'Risk & Compliance',
        messageKey: 'VENDOR_REVIEW.NOTES.SUSPENDED',
        tone: 'danger'
      });
    });
  }

  private applyReactivation(id: string): VendorDetail {
    return this.updateVendor(id, (vendor) => {
      if (vendor.status !== VendorStatus.Suspended) {
        throw new Error(`لا يمكن تشغيل الحساب إلا إذا كان معلقًا. الحالة الحالية هي ${vendor.status}.|Vendor can only be reactivated when it is suspended. Current status is ${vendor.status}.`);
      }

      vendor.status = VendorStatus.Active;
      vendor.accountStatus = 'Active';
      vendor.reviewState = 'verified';
      vendor.reviewDecisionReason = null;
      vendor.suspensionReason = null;
      vendor.suspendedAtUtc = null;
      vendor.lockReason = null;
      vendor.lockedAtUtc = null;
      vendor.isLoginLocked = false;
      vendor.archiveReason = null;
      vendor.archivedAtUtc = null;
      vendor.payoutStatus = PayoutStatus.Active;
      vendor.reviewCompletedAtUtc = this.timestamp();
      this.pushSystemNote(vendor, {
        authorName: vendor.assignedReviewer || 'Risk & Compliance Desk',
        roleLabel: 'Risk & Compliance',
        message: 'Vendor account reactivated and restored to active status.',
        messageKey: undefined,
        tone: 'success'
      });
    });
  }

  private updateVendor(id: string, mutate: (vendor: VendorDetail) => void): VendorDetail {
    const vendor = this.findVendorOrFallback(id);
    mutate(vendor);
    this.reconcileVendorState(vendor);
    return this.clone(vendor);
  }

  private reconcileVendorState(vendor: VendorDetail): void {
    const requiredDocuments = this.getRequiredReviewDocuments(vendor.reviewDocuments);
    const uploadedDocuments = requiredDocuments.filter((document) => document.isUploaded).length;
    const pendingDocuments = requiredDocuments.filter((document) => document.status === 'pending').length;
    const missingDocuments = requiredDocuments.filter((document) => document.status === 'missing').length;
    const requiredCount = requiredDocuments.length;

    vendor.documentsCompleteness = requiredCount === 0 ? 100 : Math.round((uploadedDocuments / requiredCount) * 100);
    vendor.documentsStatus = this.resolveDocumentsStatus(uploadedDocuments, missingDocuments);
    vendor.hasKYC = vendor.reviewDocuments.some((document) => document.type === 'identity' && document.status !== 'missing');
    vendor.readyForFinalApproval = requiredCount > 0
      && requiredDocuments.every((document) => document.isUploaded && document.reviewDecision === 'approved');
    vendor.reviewUpdatedAtUtc = this.timestamp();

    switch (vendor.reviewState) {
      case 'awaiting_submission':
        vendor.status = VendorStatus.Pending;
        vendor.onboardingStage = OnboardingStage.DocumentsPending;
        vendor.verificationStatus = VerificationStatus.Unverified;
        vendor.approvedAtUtc = null;
        vendor.approvedBy = null;
        break;
      case 'submitted':
        vendor.status = VendorStatus.Pending;
        vendor.onboardingStage = OnboardingStage.UnderReview;
        vendor.verificationStatus = VerificationStatus.Pending;
        vendor.reviewSubmittedAtUtc = vendor.reviewSubmittedAtUtc || this.timestamp();
        break;
      case 'under_review':
        vendor.status = VendorStatus.Pending;
        vendor.onboardingStage = OnboardingStage.UnderReview;
        vendor.verificationStatus = VerificationStatus.Pending;
        vendor.reviewStartedAtUtc = vendor.reviewStartedAtUtc || this.timestamp();
        vendor.reviewSubmittedAtUtc = vendor.reviewSubmittedAtUtc || vendor.reviewStartedAtUtc;
        this.markPendingDocuments(vendor.reviewDocuments);
        break;
      case 'changes_requested':
        vendor.status = VendorStatus.Pending;
        vendor.onboardingStage = OnboardingStage.DocumentsPending;
        vendor.verificationStatus = VerificationStatus.Unverified;
        vendor.approvedAtUtc = null;
        vendor.approvedBy = null;
        break;
      case 'verified':
        vendor.status = VendorStatus.Active;
        vendor.onboardingStage = OnboardingStage.Approved;
        vendor.verificationStatus = VerificationStatus.Verified;
        vendor.documentsStatus = DocumentsStatus.Complete;
        vendor.documentsCompleteness = 100;
        vendor.approvedAtUtc = vendor.approvedAtUtc || this.timestamp();
        vendor.approvedBy = vendor.approvedBy || vendor.assignedReviewer || 'Vendor Compliance Desk';
        vendor.hasPendingCompliance = false;
        break;
      case 'rejected':
        vendor.status = VendorStatus.Rejected;
        vendor.onboardingStage = OnboardingStage.UnderReview;
        vendor.verificationStatus = VerificationStatus.Unverified;
        vendor.approvedAtUtc = null;
        vendor.approvedBy = null;
        vendor.hasPendingCompliance = false;
        break;
      case 'suspended':
        vendor.status = VendorStatus.Suspended;
        vendor.onboardingStage = vendor.approvedAtUtc ? OnboardingStage.Approved : OnboardingStage.UnderReview;
        vendor.verificationStatus = vendor.approvedAtUtc ? VerificationStatus.Verified : VerificationStatus.Pending;
        vendor.payoutStatus = PayoutStatus.Blocked;
        vendor.hasPendingCompliance = true;
        break;
    }

    if (pendingDocuments > 0 && vendor.reviewState !== 'verified' && vendor.reviewState !== 'rejected') {
      vendor.verificationStatus = VerificationStatus.Pending;
    }

    vendor.reviewState = this.resolveDetailReviewState(vendor);
    vendor.hasPendingCompliance = vendor.reviewState === 'submitted'
      || vendor.reviewState === 'under_review'
      || vendor.reviewState === 'changes_requested'
      || vendor.reviewState === 'awaiting_submission';
    vendor.riskIndicators = this.buildRiskIndicators(vendor);
  }

  private resolveDocumentsStatus(uploadedDocuments: number, missingDocuments: number): DocumentsStatus {
    if (uploadedDocuments === 0) {
      return DocumentsStatus.Missing;
    }

    if (missingDocuments > 0) {
      return DocumentsStatus.Incomplete;
    }

    return DocumentsStatus.Complete;
  }

  private markPendingDocuments(documents: VendorReviewDocument[]): void {
    documents.forEach((document) => {
      if (document.status !== 'missing' && document.status !== 'completed') {
        document.status = 'pending';
        document.statusLabelKey = 'COMPLIANCE.STATUS.UNDER_REVIEW';
        document.iconBgClass = 'bg-orange-50 text-orange-500';
      }
    });
  }

  private markDocumentForReupload(documents: VendorReviewDocument[]): void {
    const target = documents.find((document) => document.type === 'license')
      || documents.find((document) => document.type === 'tax')
      || documents.find((document) => document.status === 'pending')
      || documents[documents.length - 1];

    if (!target) {
      return;
    }

    target.status = 'missing';
    target.statusLabelKey = 'COMPLIANCE.STATUS.MISSING';
    target.iconBgClass = 'bg-slate-100 text-slate-500';
  }

  private pushSystemNote(
    vendor: VendorDetail,
    note: Pick<VendorReviewNote, 'authorName' | 'roleLabel' | 'tone'> & {
      messageKey?: string;
      message?: string;
    }
  ): void {
    vendor.reviewNotes = [
      {
        id: this.nextNoteId(vendor.reviewNotes),
        authorName: note.authorName,
        roleLabel: note.roleLabel,
        createdAtUtc: this.timestamp(),
        message: note.message,
        messageKey: note.messageKey,
        tone: note.tone,
        isSystem: true
      },
      ...vendor.reviewNotes
    ];
  }

  private nextNoteId(notes: VendorReviewNote[]): string {
    return `note-${notes.length + 1}`;
  }

  private toVendorSummary(vendor: VendorDetail): Vendor {
    return this.clone({
      id: vendor.id,
      businessNameAr: vendor.businessNameAr,
      businessNameEn: vendor.businessNameEn,
      businessType: vendor.businessType,
      status: vendor.status,
      accountStatus: vendor.accountStatus,
      isLoginLocked: vendor.isLoginLocked,
      lockedAtUtc: vendor.lockedAtUtc,
      archivedAtUtc: vendor.archivedAtUtc,
      suspendedAtUtc: vendor.suspendedAtUtc,
      suspensionReason: vendor.suspensionReason,
      lockReason: vendor.lockReason,
      archiveReason: vendor.archiveReason,
      ownerName: vendor.ownerName,
      contactPhone: vendor.contactPhone,
      createdAtUtc: vendor.createdAtUtc,
      contactEmail: vendor.contactEmail,
      commissionRate: vendor.commissionRate,
      city: vendor.city,
      region: vendor.region,
      onboardingStage: vendor.onboardingStage,
      verificationStatus: vendor.verificationStatus,
      documentsStatus: vendor.documentsStatus,
      riskLevel: vendor.riskLevel,
      payoutStatus: vendor.payoutStatus,
      lastActiveAtUtc: vendor.lastActiveAtUtc,
      performanceRating: vendor.performanceRating,
      documentsCompleteness: vendor.documentsCompleteness,
      hasKYC: vendor.hasKYC,
      hasPendingCompliance: vendor.hasPendingCompliance,
      hasFraudFlag: vendor.hasFraudFlag,
      complaintsCount: vendor.complaintsCount,
      isLowPerformance: vendor.isLowPerformance,
      reviewState: vendor.reviewState,
      assignedReviewer: vendor.assignedReviewer,
      reviewSubmittedAtUtc: vendor.reviewSubmittedAtUtc,
      reviewUpdatedAtUtc: vendor.reviewUpdatedAtUtc
    });
  }

  private findVendor(id: string): VendorDetail | undefined {
    return this.vendorStore.find((vendor) => vendor.id === id);
  }

  private findVendorOrFallback(id: string): VendorDetail {
    return this.findVendor(id) ?? this.vendorStore[0];
  }

  private buildMockVendorStore(): VendorDetail[] {
    const seeds: VendorSeed[] = [
      {
        id: 'VND-24001',
        businessNameAr: 'لولو هايبر ماركت',
        businessNameEn: 'LuLu Hypermarket',
        businessType: 'Hypermarket',
        ownerName: 'Mahmoud Karim',
        city: 'الرياض',
        region: 'Central',
        createdAtUtc: '2025-01-15T08:00:00Z',
        reviewState: 'verified',
        riskLevel: RiskLevel.Low,
        payoutStatus: PayoutStatus.Active,
        complaintsCount: 1,
        hasFraudFlag: false,
        isLowPerformance: false,
        performanceRating: 4.6,
        assignedReviewer: 'Noura Al-Harbi',
        reviewSubmittedAtUtc: '2026-03-02T10:30:00Z',
        commissionRate: 12
      },
      {
        id: 'VND-24002',
        businessNameAr: 'بنده',
        businessNameEn: 'Panda',
        businessType: 'Supermarket',
        ownerName: 'Rami Tarek',
        city: 'الرياض',
        region: 'Central',
        createdAtUtc: '2025-02-10T09:15:00Z',
        reviewState: 'under_review',
        riskLevel: RiskLevel.Medium,
        payoutStatus: PayoutStatus.Pending,
        complaintsCount: 2,
        hasFraudFlag: false,
        isLowPerformance: false,
        performanceRating: 4.1,
        assignedReviewer: 'Noura Al-Harbi',
        reviewSubmittedAtUtc: '2026-03-20T08:20:00Z',
        commissionRate: 13
      },
      {
        id: 'VND-24003',
        businessNameAr: 'العثيم',
        businessNameEn: 'Othaim Markets',
        businessType: 'Supermarket',
        ownerName: 'Nawaf Salem',
        city: 'جدة',
        region: 'Western',
        createdAtUtc: '2025-03-18T11:00:00Z',
        reviewState: 'changes_requested',
        riskLevel: RiskLevel.Medium,
        payoutStatus: PayoutStatus.Pending,
        complaintsCount: 3,
        hasFraudFlag: false,
        isLowPerformance: true,
        performanceRating: 3.8,
        assignedReviewer: 'Majed Al-Qahtani',
        reviewSubmittedAtUtc: '2026-03-18T11:40:00Z',
        commissionRate: 12
      },
      {
        id: 'VND-24004',
        businessNameAr: 'كارفور',
        businessNameEn: 'Carrefour',
        businessType: 'Hypermarket',
        ownerName: 'Khaled Sami',
        city: 'الرياض',
        region: 'Central',
        createdAtUtc: '2025-04-22T08:40:00Z',
        reviewState: 'submitted',
        riskLevel: RiskLevel.Low,
        payoutStatus: PayoutStatus.Pending,
        complaintsCount: 0,
        hasFraudFlag: false,
        isLowPerformance: false,
        performanceRating: 4.4,
        assignedReviewer: null,
        reviewSubmittedAtUtc: '2026-03-24T09:00:00Z',
        commissionRate: 14
      },
      {
        id: 'VND-24005',
        businessNameAr: 'دانوب',
        businessNameEn: 'Danube',
        businessType: 'Supermarket',
        ownerName: 'Ayman Fathi',
        city: 'الرياض',
        region: 'Central',
        createdAtUtc: '2025-05-11T07:10:00Z',
        reviewState: 'awaiting_submission',
        riskLevel: RiskLevel.Low,
        payoutStatus: PayoutStatus.Pending,
        complaintsCount: 0,
        hasFraudFlag: false,
        isLowPerformance: false,
        performanceRating: 4.3,
        assignedReviewer: null,
        reviewSubmittedAtUtc: null,
        commissionRate: 12
      },
      {
        id: 'VND-24006',
        businessNameAr: 'تميمي ماركت',
        businessNameEn: 'Tamimi Markets',
        businessType: 'Supermarket',
        ownerName: 'Hany Adel',
        city: 'الرياض',
        region: 'Central',
        createdAtUtc: '2025-06-02T13:00:00Z',
        reviewState: 'verified',
        riskLevel: RiskLevel.Low,
        payoutStatus: PayoutStatus.Active,
        complaintsCount: 1,
        hasFraudFlag: false,
        isLowPerformance: false,
        performanceRating: 4.7,
        assignedReviewer: 'Amal Al-Mutairi',
        reviewSubmittedAtUtc: '2026-03-01T12:10:00Z',
        commissionRate: 11
      },
      {
        id: 'VND-24007',
        businessNameAr: 'مطاعم الرومانسية',
        businessNameEn: 'Al Romansiah Restaurants',
        businessType: 'Restaurant',
        ownerName: 'Saad Fahmy',
        city: 'الرياض',
        region: 'Central',
        createdAtUtc: '2025-07-12T09:40:00Z',
        reviewState: 'suspended',
        riskLevel: RiskLevel.High,
        payoutStatus: PayoutStatus.Blocked,
        complaintsCount: 5,
        hasFraudFlag: true,
        isLowPerformance: true,
        performanceRating: 3.2,
        assignedReviewer: 'Risk & Compliance Desk',
        reviewSubmittedAtUtc: '2026-03-10T15:25:00Z',
        commissionRate: 14
      },
      {
        id: 'VND-24008',
        businessNameAr: 'هرفي العليا',
        businessNameEn: 'Herfy - Olaya',
        businessType: 'Restaurant',
        ownerName: 'Mazen Ibrahim',
        city: 'الرياض',
        region: 'Central',
        createdAtUtc: '2025-08-21T10:05:00Z',
        reviewState: 'rejected',
        riskLevel: RiskLevel.High,
        payoutStatus: PayoutStatus.Blocked,
        complaintsCount: 4,
        hasFraudFlag: false,
        isLowPerformance: true,
        performanceRating: 3.5,
        assignedReviewer: 'Majed Al-Qahtani',
        reviewSubmittedAtUtc: '2026-03-12T13:45:00Z',
        commissionRate: 12
      },
      {
        id: 'VND-24009',
        businessNameAr: 'ماكدونالدز',
        businessNameEn: "McDonald's",
        businessType: 'Restaurant',
        ownerName: 'Tariq Nabil',
        city: 'جدة',
        region: 'Western',
        createdAtUtc: '2025-09-09T08:20:00Z',
        reviewState: 'under_review',
        riskLevel: RiskLevel.Critical,
        payoutStatus: PayoutStatus.Blocked,
        complaintsCount: 6,
        hasFraudFlag: true,
        isLowPerformance: true,
        performanceRating: 3.1,
        assignedReviewer: 'Risk & Compliance Desk',
        reviewSubmittedAtUtc: '2026-03-22T14:00:00Z',
        commissionRate: 13
      },
      {
        id: 'VND-24010',
        businessNameAr: 'Barns',
        businessNameEn: 'Barns',
        businessType: 'Cafe',
        ownerName: 'Amr Hossam',
        city: 'الخبر',
        region: 'Eastern',
        createdAtUtc: '2025-10-05T11:30:00Z',
        reviewState: 'submitted',
        riskLevel: RiskLevel.Low,
        payoutStatus: PayoutStatus.Pending,
        complaintsCount: 1,
        hasFraudFlag: false,
        isLowPerformance: false,
        performanceRating: 4.2,
        assignedReviewer: null,
        reviewSubmittedAtUtc: '2026-03-25T10:10:00Z',
        commissionRate: 12
      },
      {
        id: 'VND-24011',
        businessNameAr: 'برغرايززر',
        businessNameEn: 'Burgerizzr',
        businessType: 'Restaurant',
        ownerName: 'Yousef Adel',
        city: 'الدمام',
        region: 'Eastern',
        createdAtUtc: '2025-11-08T09:55:00Z',
        reviewState: 'changes_requested',
        riskLevel: RiskLevel.Medium,
        payoutStatus: PayoutStatus.Pending,
        complaintsCount: 2,
        hasFraudFlag: false,
        isLowPerformance: false,
        performanceRating: 3.9,
        assignedReviewer: 'Amal Al-Mutairi',
        reviewSubmittedAtUtc: '2026-03-19T09:05:00Z',
        commissionRate: 12
      },
      {
        id: 'VND-9928',
        businessNameAr: 'متجر التقنية الحديثة',
        businessNameEn: 'Modern Tech Store',
        businessType: 'Electronics',
        ownerName: 'Abdullah Khaled',
        city: 'الرياض',
        region: 'Central',
        createdAtUtc: '2025-12-03T07:35:00Z',
        reviewState: 'under_review',
        riskLevel: RiskLevel.Medium,
        payoutStatus: PayoutStatus.Pending,
        complaintsCount: 2,
        hasFraudFlag: false,
        isLowPerformance: false,
        performanceRating: 4.0,
        assignedReviewer: 'Noura Al-Harbi',
        reviewSubmittedAtUtc: '2026-03-24T08:50:00Z',
        commissionRate: 13
      }
    ];

    return seeds.map((seed, index) => {
      const documents = this.buildReviewDocuments(seed.reviewState);
      const vendor: VendorDetail = {
        id: seed.id,
        businessNameAr: seed.businessNameAr,
        businessNameEn: seed.businessNameEn,
        businessType: seed.businessType,
        status: VendorStatus.Pending,
        ownerName: seed.ownerName,
        contactPhone: `+966 50 000 ${String(index + 101).padStart(3, '0')}`,
        createdAtUtc: seed.createdAtUtc,
        contactEmail: `${seed.id.toLowerCase()}@zadana-vendors.sa`,
        commissionRate: seed.commissionRate ?? 12,
        city: seed.city,
        region: seed.region,
        onboardingStage: OnboardingStage.New,
        verificationStatus: VerificationStatus.Unverified,
        documentsStatus: DocumentsStatus.Incomplete,
        riskLevel: seed.riskLevel,
        payoutStatus: seed.payoutStatus,
        lastActiveAtUtc: `2026-03-${String((index % 20) + 1).padStart(2, '0')}T12:30:00Z`,
        performanceRating: seed.performanceRating,
        documentsCompleteness: 0,
        hasKYC: false,
        hasPendingCompliance: false,
        hasFraudFlag: seed.hasFraudFlag,
        complaintsCount: seed.complaintsCount,
        isLowPerformance: seed.isLowPerformance,
        reviewState: seed.reviewState,
        assignedReviewer: seed.assignedReviewer ?? null,
        reviewSubmittedAtUtc: seed.reviewSubmittedAtUtc ?? null,
        reviewUpdatedAtUtc: seed.reviewSubmittedAtUtc ?? seed.createdAtUtc,
        commercialRegistrationNumber: `CR-${seed.id.replace(/\D+/g, '').padStart(10, '0')}`,
        taxId: `3${seed.id.replace(/\D+/g, '').padStart(14, '0')}`,
        rejectionReason: seed.reviewState === 'rejected'
          ? 'Submitted data did not pass the latest compliance review.'
          : null,
        logoUrl: null,
        commercialRegisterDocumentUrl: null,
        approvedAtUtc: seed.reviewState === 'verified' ? '2026-03-01T10:30:00Z' : null,
        approvedBy: seed.reviewState === 'verified' ? seed.assignedReviewer || 'Vendor Ops Desk' : null,
        ownerEmail: `${seed.ownerName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@zadana.sa`,
        ownerPhone: `+966 55 000 ${String(index + 201).padStart(3, '0')}`,
        branchesCount: seed.reviewState === 'verified' || seed.reviewState === 'suspended' ? 3 : 1,
        bankAccountsCount: 1,
        reviewStartedAtUtc: seed.reviewState === 'under_review' || seed.reviewState === 'suspended'
          ? seed.reviewSubmittedAtUtc ?? '2026-03-20T08:20:00Z'
          : null,
        reviewCompletedAtUtc: seed.reviewState === 'verified' || seed.reviewState === 'rejected'
          ? '2026-03-25T11:15:00Z'
          : null,
        requestedChangesAtUtc: seed.reviewState === 'changes_requested'
          ? '2026-03-23T10:45:00Z'
          : null,
        reviewDecisionReason: seed.reviewState === 'changes_requested'
          ? 'Need a clearer municipal license and a matching tax certificate.'
          : seed.reviewState === 'suspended'
            ? 'Payouts are frozen until compliance closes the flagged cancellation pattern.'
            : null,
        reviewDocuments: documents,
        reviewNotes: this.buildReviewNotes(seed),
        riskIndicators: []
      };

      this.reconcileVendorState(vendor);
      return vendor;
    });
  }

  private buildReviewDocuments(reviewState: VendorReviewState): VendorReviewDocument[] {
    const documents: VendorReviewDocument[] = [
      this.createReviewDocument('identity', 'badge'),
      this.createReviewDocument('commercial', 'storefront'),
      this.createReviewDocument('tax', 'receipt_long'),
      this.createReviewDocument('bank', 'account_balance'),
      this.createReviewDocument('license', 'verified')
    ];

    const statusMap: Record<VendorReviewState, Record<VendorReviewDocument['type'], VendorReviewDocument['status']>> = {
      awaiting_submission: {
        identity: 'completed',
        commercial: 'completed',
        tax: 'missing',
        bank: 'pending',
        license: 'missing'
      },
      submitted: {
        identity: 'pending',
        commercial: 'completed',
        tax: 'pending',
        bank: 'completed',
        license: 'pending'
      },
      under_review: {
        identity: 'completed',
        commercial: 'completed',
        tax: 'pending',
        bank: 'completed',
        license: 'pending'
      },
      changes_requested: {
        identity: 'completed',
        commercial: 'completed',
        tax: 'missing',
        bank: 'completed',
        license: 'missing'
      },
      verified: {
        identity: 'completed',
        commercial: 'completed',
        tax: 'completed',
        bank: 'completed',
        license: 'completed'
      },
      rejected: {
        identity: 'completed',
        commercial: 'completed',
        tax: 'missing',
        bank: 'pending',
        license: 'missing'
      },
      suspended: {
        identity: 'completed',
        commercial: 'completed',
        tax: 'completed',
        bank: 'completed',
        license: 'completed'
      }
    };

    return documents.map((document) => this.applyDocumentStatus(document, statusMap[reviewState][document.type]));
  }

  private createReviewDocument(
    type: VendorReviewDocument['type'],
    icon: string
  ): VendorReviewDocument {
    const mapping: Record<VendorReviewDocument['type'], { titleKey: string; descriptionKey: string }> = {
      identity: {
        titleKey: 'COMPLIANCE.VERIFICATION.IDENTITY',
        descriptionKey: 'COMPLIANCE.VERIFICATION.IDENTITY_DESC'
      },
      commercial: {
        titleKey: 'COMPLIANCE.VERIFICATION.COMMERCIAL_REG',
        descriptionKey: 'COMPLIANCE.VERIFICATION.COMMERCIAL_DESC'
      },
      tax: {
        titleKey: 'COMPLIANCE.VERIFICATION.TAX_CERT',
        descriptionKey: 'COMPLIANCE.VERIFICATION.TAX_DESC'
      },
      bank: {
        titleKey: 'COMPLIANCE.VERIFICATION.BANK_ACCOUNT',
        descriptionKey: 'COMPLIANCE.VERIFICATION.BANK_DESC'
      },
      license: {
        titleKey: 'COMPLIANCE.VERIFICATION.MUNICIPAL_LICENSE',
        descriptionKey: 'COMPLIANCE.VERIFICATION.LICENSE_DESC'
      }
    };

    return {
      id: type,
      type,
      titleKey: mapping[type].titleKey,
      descriptionKey: mapping[type].descriptionKey,
      icon,
      status: 'missing',
      statusLabelKey: 'COMPLIANCE.STATUS.MISSING',
      iconBgClass: 'bg-slate-100 text-slate-500',
      isRequired: this.isRequiredReviewDocument(type),
      isUploaded: false,
      previewKind: 'unavailable',
      fileUrl: null,
      reviewDecision: 'pending',
      rejectionReason: null,
      reviewedAtUtc: null,
      reviewedBy: null
    };
  }

  private applyDocumentStatus(
    document: VendorReviewDocument,
    status: VendorReviewDocument['status']
  ): VendorReviewDocument {
    if (status === 'completed') {
      return {
        ...document,
        status,
        statusLabelKey: 'COMPLIANCE.STATUS.COMPLETED',
        iconBgClass: 'bg-teal-50 text-teal-500',
        isUploaded: true,
        previewKind: document.previewKind === 'unavailable' ? 'structured' : document.previewKind
      };
    }

    if (status === 'pending') {
      return {
        ...document,
        status,
        statusLabelKey: 'COMPLIANCE.STATUS.UNDER_REVIEW',
        iconBgClass: 'bg-orange-50 text-orange-500',
        isUploaded: true,
        previewKind: document.previewKind === 'unavailable' ? 'structured' : document.previewKind
      };
    }

    return {
      ...document,
      status,
      statusLabelKey: 'COMPLIANCE.STATUS.MISSING',
      iconBgClass: 'bg-slate-100 text-slate-500',
      isUploaded: false,
      previewKind: 'unavailable'
    };
  }

  private isRequiredReviewDocument(type: VendorReviewDocument['type']): boolean {
    return type === 'commercial' || type === 'tax' || type === 'license';
  }

  private getRequiredReviewDocuments(documents: VendorReviewDocument[]): VendorReviewDocument[] {
    return documents.filter((document) => document.isRequired);
  }

  private normalizeDocumentType(type?: string | null): VendorReviewDocument['type'] {
    const normalized = (type || '').toLowerCase();

    switch (normalized) {
      case 'identity':
      case 'commercial':
      case 'tax':
      case 'bank':
      case 'license':
        return normalized as VendorReviewDocument['type'];
      default:
        return 'commercial';
    }
  }

  private normalizeDocumentStatus(status?: string | null): VendorReviewDocument['status'] {
    const normalized = (status || '').toLowerCase();

    switch (normalized) {
      case 'completed':
      case 'pending':
      case 'missing':
        return normalized as VendorReviewDocument['status'];
      default:
        return 'missing';
    }
  }

  private normalizePreviewKind(kind?: string | null): VendorReviewDocument['previewKind'] {
    const normalized = (kind || '').toLowerCase();

    switch (normalized) {
      case 'pdf':
      case 'image':
      case 'structured':
      case 'unavailable':
        return normalized as VendorReviewDocument['previewKind'];
      default:
        return 'unavailable';
    }
  }

  private normalizeReviewDecision(decision?: string | null): VendorReviewDocument['reviewDecision'] {
    const normalized = (decision || '').toLowerCase();

    switch (normalized) {
      case 'approved':
      case 'rejected':
      case 'pending':
        return normalized as VendorReviewDocument['reviewDecision'];
      default:
        return 'pending';
    }
  }

  private buildReviewNotes(seed: VendorSeed): VendorReviewNote[] {
    const notes: VendorReviewNote[] = [];

    if (seed.reviewState === 'submitted' || seed.reviewState === 'under_review') {
      notes.push({
        id: 'note-1',
        authorName: seed.assignedReviewer || 'Vendor Intake Queue',
        roleLabel: 'Compliance Review',
        createdAtUtc: seed.reviewSubmittedAtUtc || seed.createdAtUtc,
        messageKey: 'VENDOR_REVIEW.NOTES.SUBMITTED',
        tone: 'info',
        isSystem: true
      });
    }

    if (seed.reviewState === 'changes_requested') {
      notes.push({
        id: 'note-1',
        authorName: seed.assignedReviewer || 'Vendor Compliance Desk',
        roleLabel: 'Compliance Review',
        createdAtUtc: '2026-03-23T10:45:00Z',
        messageKey: 'VENDOR_REVIEW.NOTES.CHANGES_REQUESTED',
        tone: 'warning',
        isSystem: true
      });
    }

    if (seed.reviewState === 'verified') {
      notes.push({
        id: 'note-1',
        authorName: seed.assignedReviewer || 'Vendor Compliance Desk',
        roleLabel: 'Compliance Review',
        createdAtUtc: '2026-03-25T11:15:00Z',
        messageKey: 'VENDOR_REVIEW.NOTES.APPROVED',
        tone: 'success',
        isSystem: true
      });
    }

    if (seed.reviewState === 'rejected') {
      notes.push({
        id: 'note-1',
        authorName: seed.assignedReviewer || 'Vendor Compliance Desk',
        roleLabel: 'Compliance Review',
        createdAtUtc: '2026-03-25T12:10:00Z',
        messageKey: 'VENDOR_REVIEW.NOTES.REJECTED',
        tone: 'danger',
        isSystem: true
      });
    }

    if (seed.reviewState === 'suspended') {
      notes.push({
        id: 'note-1',
        authorName: seed.assignedReviewer || 'Risk & Compliance Desk',
        roleLabel: 'Risk & Compliance',
        createdAtUtc: '2026-03-24T15:20:00Z',
        messageKey: 'VENDOR_REVIEW.NOTES.SUSPENDED',
        tone: 'danger',
        isSystem: true
      });
    }

    notes.push({
      id: `note-${notes.length + 1}`,
      authorName: 'Sarah Fahad',
      roleLabel: 'Risk Team',
      createdAtUtc: '2026-03-22T14:15:00Z',
      messageKey: 'COMPLIANCE.NOTES.MESSAGES.CANCELLATION_FOLLOWUP',
      tone: 'warning',
      isSystem: true
    });

    if (seed.reviewState !== 'verified' && seed.reviewState !== 'suspended') {
      notes.push({
        id: `note-${notes.length + 1}`,
        authorName: 'Abdullah Mohammed',
        roleLabel: 'Review Team',
        createdAtUtc: '2026-03-22T10:30:00Z',
        messageKey: 'COMPLIANCE.NOTES.MESSAGES.TAX_CERTIFICATE_BLUR',
        tone: 'info',
        isSystem: true
      });
    }

    return notes.sort((left, right) => right.createdAtUtc.localeCompare(left.createdAtUtc));
  }

  private buildRiskIndicators(vendor: VendorDetail): VendorRiskIndicator[] {
    const indicators: VendorRiskIndicator[] = [];

    if (vendor.riskLevel === RiskLevel.High || vendor.riskLevel === RiskLevel.Critical || vendor.hasFraudFlag) {
      indicators.push({
        id: 'cancellation',
        titleKey: 'COMPLIANCE.RISK.HIGH_CANCELLATION',
        descriptionKey: 'COMPLIANCE.RISK.HIGH_CANCELLATION_DESC',
        severity: vendor.riskLevel === RiskLevel.Critical ? 'high' : 'medium',
        severityLabelKey: vendor.riskLevel === RiskLevel.Critical ? 'COMPLIANCE.SEVERITY.HIGH' : 'COMPLIANCE.SEVERITY.MEDIUM',
        icon: 'error'
      });
    }

    if (vendor.reviewState === 'changes_requested' || vendor.reviewState === 'awaiting_submission') {
      indicators.push({
        id: 'address',
        titleKey: 'COMPLIANCE.RISK.ADDRESS_MISMATCH',
        descriptionKey: 'COMPLIANCE.RISK.ADDRESS_MISMATCH_DESC',
        severity: 'medium',
        severityLabelKey: 'COMPLIANCE.SEVERITY.MEDIUM',
        icon: 'report_problem'
      });
    }

    indicators.push({
      id: 'iban',
      titleKey: 'COMPLIANCE.RISK.IBAN_CHANGES',
      descriptionKey: 'COMPLIANCE.RISK.IBAN_CHANGES_DESC',
      severity: vendor.payoutStatus === PayoutStatus.Blocked ? 'high' : 'low',
      severityLabelKey: vendor.payoutStatus === PayoutStatus.Blocked ? 'COMPLIANCE.SEVERITY.HIGH' : 'COMPLIANCE.SEVERITY.LOW',
      icon: 'info'
    });

    return indicators;
  }

  private timestamp(): string {
    return new Date().toISOString();
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
