import { Injectable, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, catchError, finalize, interval, map, take, tap, throwError } from 'rxjs';
import { VendorActivityLogFilters, VendorActivityLogPage, VendorDetail } from '@vendors/models/vendors.domain.models';
import {
  AdminSendVendorNotificationRequest,
  AdminVendorNotificationResponse,
  VendorService
} from '@vendors/services/vendor.api.service';

@Injectable()
export class VendorDetailFacade implements OnDestroy {
  private readonly vendorIdSubject = new BehaviorSubject<string | null>(null);
  private readonly vendorSubject = new BehaviorSubject<VendorDetail | null>(null);
  private readonly activityLogSubject = new BehaviorSubject<VendorActivityLogPage | null>(null);
  private readonly isLoadingSubject = new BehaviorSubject(false);
  private readonly isActivityLogLoadingSubject = new BehaviorSubject(false);
  private readonly mutationErrorSubject = new BehaviorSubject<string | null>(null);
  private readonly activityLogErrorSubject = new BehaviorSubject<string | null>(null);
  private activityLogFilters: VendorActivityLogFilters = { page: 1, pageSize: 20 };
  private liveRefreshSubscription?: Subscription;

  readonly vendorId$ = this.vendorIdSubject.asObservable();
  readonly vendor$ = this.vendorSubject.asObservable();
  readonly activityLog$ = this.activityLogSubject.asObservable();
  readonly isLoading$ = this.isLoadingSubject.asObservable();
  readonly isActivityLogLoading$ = this.isActivityLogLoadingSubject.asObservable();
  readonly mutationError$ = this.mutationErrorSubject.asObservable();
  readonly activityLogError$ = this.activityLogErrorSubject.asObservable();

  constructor(private readonly vendorService: VendorService) {}

  ngOnDestroy(): void {
    this.liveRefreshSubscription?.unsubscribe();
  }

  get vendorId(): string | null {
    return this.vendorIdSubject.value;
  }

  get vendor(): VendorDetail | null {
    return this.vendorSubject.value;
  }

  get mutationError(): string | null {
    return this.mutationErrorSubject.value;
  }

  get activityLog(): VendorActivityLogPage | null {
    return this.activityLogSubject.value;
  }

  get activityLogError(): string | null {
    return this.activityLogErrorSubject.value;
  }

  loadVendor(vendorId: string): void {
    if (this.vendorId === vendorId && this.vendor) {
      this.ensureLiveRefresh();
      return;
    }

    this.vendorIdSubject.next(vendorId);
    this.refreshVendor();
    this.refreshVendorActivityLog();
    this.ensureLiveRefresh();
  }

  refreshVendor(): void {
    const vendorId = this.vendorId;

    if (!vendorId) {
      return;
    }

    this.isLoadingSubject.next(true);
    this.mutationErrorSubject.next(null);
    this.vendorService
      .getVendorById(vendorId)
      .pipe(take(1))
      .subscribe({
        next: (vendor) => {
          this.vendorSubject.next(vendor);
          this.isLoadingSubject.next(false);
        },
        error: (error) => {
          this.mutationErrorSubject.next(this.resolveErrorMessage(error));
          this.isLoadingSubject.next(false);
        }
      });
  }

  loadVendorActivityLog(filters: VendorActivityLogFilters = {}): void {
    this.activityLogFilters = {
      ...this.activityLogFilters,
      ...filters
    };

    this.refreshVendorActivityLog();
  }

  refreshVendorActivityLog(): void {
    const vendorId = this.vendorId;

    if (!vendorId) {
      return;
    }

    this.isActivityLogLoadingSubject.next(true);
    this.activityLogErrorSubject.next(null);
    this.vendorService
      .getVendorActivityLog(vendorId, this.activityLogFilters)
      .pipe(take(1))
      .subscribe({
        next: (activityLog) => {
          this.activityLogSubject.next(activityLog);
          this.isActivityLogLoadingSubject.next(false);
        },
        error: (error) => {
          this.activityLogErrorSubject.next(this.resolveErrorMessage(error));
          this.isActivityLogLoadingSubject.next(false);
        }
      });
  }

  private ensureLiveRefresh(): void {
    if (this.liveRefreshSubscription) {
      return;
    }

    this.liveRefreshSubscription = interval(15000).subscribe(() => {
      const vendorId = this.vendorId;

      if (!vendorId) {
        return;
      }

      this.vendorService
        .getVendorById(vendorId)
        .pipe(take(1))
        .subscribe({
          next: (vendor) => this.vendorSubject.next(vendor),
          error: () => undefined
        });

      this.vendorService
        .getVendorActivityLog(vendorId, this.activityLogFilters)
        .pipe(take(1))
        .subscribe({
          next: (activityLog) => this.activityLogSubject.next(activityLog),
          error: () => undefined
        });
    });
  }

  updateVendorLocally(patch: Partial<VendorDetail>): void {
    if (!this.vendor) {
      return;
    }

    this.vendorSubject.next({
      ...this.vendor,
      ...patch
    });
  }

  approveVendorReview(commissionRate?: number): void {
    this.subscribeSilently(this.approveVendorReviewRequest(commissionRate));
  }

  approveVendorReviewRequest(commissionRate?: number): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) =>
      this.vendorService.approveVendorReview(vendorId, commissionRate ?? this.vendor?.commissionRate ?? 13)
    );
  }

  updateVendorStore(payload: {
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
  }): void {
    this.subscribeSilently(this.updateVendorStoreRequest(payload));
  }

  updateVendorStoreRequest(payload: {
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
  }): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.updateVendorStore(vendorId, payload));
  }

  updateVendorOwner(payload: {
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    idNumber?: string | null;
    nationality?: string | null;
  }): void {
    this.subscribeSilently(this.updateVendorOwnerRequest(payload));
  }

  updateVendorOwnerRequest(payload: {
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    idNumber?: string | null;
    nationality?: string | null;
  }): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.updateVendorOwner(vendorId, payload));
  }

  updateVendorLegalBanking(payload: {
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
  }): void {
    this.subscribeSilently(this.updateVendorLegalBankingRequest(payload));
  }

  updateVendorLegalBankingRequest(payload: {
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
  }): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.updateVendorLegalBanking(vendorId, payload));
  }

  updateVendorFinanceSettingsRequest(payload: {
    financialLifecycleMode: string;
    payoutCycle?: string | null;
  }): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.updateVendorFinanceSettings(vendorId, payload));
  }

  updateVendorContactRequest(payload: {
    region: string;
    city: string;
    nationalAddress: string;
  }): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.updateVendorContact(vendorId, payload));
  }

  updateVendorHoursRequest(payload: {
    hours: Array<{
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isOpen: boolean;
    }>;
  }): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.updateVendorHours(vendorId, payload));
  }

  updateVendorOperationsSettingsRequest(payload: {
    acceptOrders: boolean;
    minimumOrderAmount?: number | null;
    preparationTimeMinutes?: number | null;
  }): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.updateVendorOperationsSettings(vendorId, payload));
  }

  updateVendorNotificationSettingsRequest(payload: {
    emailNotificationsEnabled: boolean;
    smsNotificationsEnabled: boolean;
    newOrdersNotificationsEnabled: boolean;
  }): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.updateVendorNotificationSettings(vendorId, payload));
  }

  requestVendorDocuments(note?: string): void {
    this.subscribeSilently(this.requestVendorDocumentsRequest(note));
  }

  requestVendorDocumentsRequest(note?: string): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) =>
      this.vendorService.requestVendorDocuments(vendorId, note)
    );
  }

  approveVendorDocument(documentId: string): void {
    this.subscribeSilently(this.approveVendorDocumentRequest(documentId));
  }

  approveVendorDocumentRequest(documentId: string): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.approveVendorDocument(vendorId, documentId));
  }

  rejectVendorDocument(documentId: string, reason: string): void {
    this.subscribeSilently(this.rejectVendorDocumentRequest(documentId, reason));
  }

  rejectVendorDocumentRequest(documentId: string, reason: string): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.rejectVendorDocument(vendorId, documentId, reason));
  }

  reviewVendorProfileFieldsRequest(
    items: Array<{ code: string; decision: 'approved' | 'rejected'; reason?: string | null }>
  ): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.reviewVendorProfileFields(vendorId, items));
  }

  startVendorReview(): void {
    this.subscribeSilently(this.startVendorReviewRequest());
  }

  startVendorReviewRequest(): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) =>
      this.vendorService.startVendorReview(vendorId)
    );
  }

  suspendVendorAccount(reason?: string): void {
    this.subscribeSilently(this.suspendVendorAccountRequest(reason));
  }

  suspendVendorAccountRequest(reason?: string): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) =>
      this.vendorService.suspendVendorAccount(vendorId, reason)
    );
  }

  reactivateVendorAccount(): void {
    this.subscribeSilently(this.reactivateVendorAccountRequest());
  }

  reactivateVendorAccountRequest(): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.reactivateVendorAccount(vendorId));
  }

  lockVendorLogin(reason: string): void {
    this.subscribeSilently(this.lockVendorLoginRequest(reason));
  }

  lockVendorLoginRequest(reason: string): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.lockVendorLogin(vendorId, reason));
  }

  unlockVendorLogin(): void {
    this.subscribeSilently(this.unlockVendorLoginRequest());
  }

  unlockVendorLoginRequest(): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.unlockVendorLogin(vendorId));
  }

  archiveVendorAccount(reason: string): void {
    this.subscribeSilently(this.archiveVendorAccountRequest(reason));
  }

  archiveVendorAccountRequest(reason: string): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) => this.vendorService.archiveVendorAccount(vendorId, reason));
  }

  resetVendorPassword(newPassword: string): void {
    this.subscribeSilently(this.resetVendorPasswordRequest(newPassword));
  }

  resetVendorPasswordRequest(newPassword: string): Observable<void> {
    const vendorId = this.vendorId;

    if (!vendorId) {
      return throwError(() => new Error('Vendor is not loaded.'));
    }

    this.isLoadingSubject.next(true);
    this.mutationErrorSubject.next(null);

    return this.vendorService.resetVendorPassword(vendorId, newPassword).pipe(
      take(1),
      tap(() => this.refreshVendorActivityLog()),
      map(() => void 0),
      catchError((error) => {
        this.mutationErrorSubject.next(this.resolveErrorMessage(error));
        return throwError(() => error);
      }),
      finalize(() => {
        this.isLoadingSubject.next(false);
      })
    );
  }

  rejectVendorReview(reason?: string): void {
    this.subscribeSilently(this.rejectVendorReviewRequest(reason));
  }

  rejectVendorReviewRequest(reason?: string): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) =>
      this.vendorService.rejectVendorReview(vendorId, reason)
    );
  }

  addVendorReviewNote(
    message: string,
    authorName?: string,
    roleLabel?: string
  ): void {
    this.subscribeSilently(this.addVendorReviewNoteRequest(message, authorName, roleLabel));
  }

  addVendorReviewNoteRequest(
    message: string,
    authorName?: string,
    roleLabel?: string
  ): Observable<VendorDetail> {
    return this.trackVendorMutation((vendorId) =>
      this.vendorService.addVendorReviewNote(vendorId, message, authorName, roleLabel)
    );
  }

  sendVendorNotificationTestRequest(
    payload: AdminSendVendorNotificationRequest = {}
  ): Observable<AdminVendorNotificationResponse> {
    return this.sendVendorMessageRequest(payload, true);
  }

  sendVendorMessageRequest(
    payload: AdminSendVendorNotificationRequest = {},
    useTestEndpoint = false
  ): Observable<AdminVendorNotificationResponse> {
    const vendorId = this.vendorId;

    if (!vendorId) {
      return throwError(() => new Error('Vendor is not loaded.'));
    }

    this.mutationErrorSubject.next(null);

    const request$ = useTestEndpoint
      ? this.vendorService.sendVendorNotificationTest(vendorId, payload)
      : this.vendorService.sendVendorMessage(vendorId, payload);

    return request$.pipe(
      take(1),
      tap(() => this.refreshVendorActivityLog()),
      catchError((error) => {
        this.mutationErrorSubject.next(this.resolveErrorMessage(error));
        return throwError(() => error);
      })
    );
  }

  clearMutationError(): void {
    this.mutationErrorSubject.next(null);
  }

  private trackVendorMutation(factory: (vendorId: string) => Observable<VendorDetail>): Observable<VendorDetail> {
    const vendorId = this.vendorId;

    if (!vendorId) {
      return throwError(() => new Error('Vendor is not loaded.'));
    }

    this.isLoadingSubject.next(true);
    this.mutationErrorSubject.next(null);

    return factory(vendorId).pipe(
      take(1),
      tap((vendor) => {
        this.vendorSubject.next(vendor);
        this.refreshVendorActivityLog();
      }),
      catchError((error) => {
        this.mutationErrorSubject.next(this.resolveErrorMessage(error));
        return throwError(() => error);
      }),
      finalize(() => {
        this.isLoadingSubject.next(false);
      })
    );
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail ?? error.error?.title ?? error.error?.message;
      if (typeof detail === 'string' && detail.trim()) {
        return this.resolveLocalizedMessage(detail.trim());
      }

      if (typeof error.message === 'string' && error.message.trim()) {
        return this.resolveLocalizedMessage(error.message.trim());
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return this.resolveLocalizedMessage(error.message.trim());
    }

    return 'Unable to complete the request right now.';
  }

  private resolveLocalizedMessage(message: string): string {
    if (!message.includes('|')) {
      return message;
    }

    const currentLang = (localStorage.getItem('lang') || localStorage.getItem('vendor_lang') || 'ar').toLowerCase();
    const parts = message.split('|').map((item) => item.trim()).filter(Boolean);
    if (parts.length < 2) {
      return message;
    }

    return currentLang.startsWith('ar') ? parts[0] : parts[1];
  }

  private subscribeSilently<T>(request$: Observable<T>): void {
    request$.subscribe({
      error: () => undefined
    });
  }
}
