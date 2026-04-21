import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, map, take, tap, throwError } from 'rxjs';
import { VendorDetail } from '@vendors/models/vendors.domain.models';
import {
  AdminSendVendorNotificationRequest,
  AdminVendorNotificationResponse,
  VendorService
} from '@vendors/services/vendor.api.service';

@Injectable()
export class VendorDetailFacade {
  private readonly vendorIdSubject = new BehaviorSubject<string | null>(null);
  private readonly vendorSubject = new BehaviorSubject<VendorDetail | null>(null);
  private readonly isLoadingSubject = new BehaviorSubject(false);
  private readonly mutationErrorSubject = new BehaviorSubject<string | null>(null);

  readonly vendorId$ = this.vendorIdSubject.asObservable();
  readonly vendor$ = this.vendorSubject.asObservable();
  readonly isLoading$ = this.isLoadingSubject.asObservable();
  readonly mutationError$ = this.mutationErrorSubject.asObservable();

  constructor(private readonly vendorService: VendorService) {}

  get vendorId(): string | null {
    return this.vendorIdSubject.value;
  }

  get vendor(): VendorDetail | null {
    return this.vendorSubject.value;
  }

  get mutationError(): string | null {
    return this.mutationErrorSubject.value;
  }

  loadVendor(vendorId: string): void {
    if (this.vendorId === vendorId && this.vendor) {
      return;
    }

    this.vendorIdSubject.next(vendorId);
    this.refreshVendor();
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
    const vendorId = this.vendorId;

    if (!vendorId) {
      return throwError(() => new Error('Vendor is not loaded.'));
    }

    this.mutationErrorSubject.next(null);

    return this.vendorService.sendVendorNotificationTest(vendorId, payload).pipe(
      take(1),
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
      tap((vendor) => this.vendorSubject.next(vendor)),
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
        return detail.trim();
      }

      if (typeof error.message === 'string' && error.message.trim()) {
        return error.message.trim();
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message.trim();
    }

    return 'Unable to complete the request right now.';
  }

  private subscribeSilently<T>(request$: Observable<T>): void {
    request$.subscribe({
      error: () => undefined
    });
  }
}
