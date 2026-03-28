import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
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
} from '../models/vendor';

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

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private readonly apiUrl = `${environment.apiUrl}/admin/vendors`;
  private readonly vendorStore = this.buildMockVendorStore();

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
    if (!this.authService.isAuthenticated) {
      return of(this.buildLocalPaginatedVendors(pageNumber, pageSize, search, status));
    }

    let params = new HttpParams()
      .set('page', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedVendors | Vendor[]>(this.apiUrl, { params }).pipe(
      map((response) => this.normalizeVendorResponse(response, pageNumber, pageSize, search, status)),
      catchError((error) => {
        console.warn('Vendor API failed, using local fallback data.', error);
        return of(this.buildLocalPaginatedVendors(pageNumber, pageSize, search, status));
      })
    );
  }

  getVendorById(id: string): Observable<VendorDetail> {
    const localVendor = this.findVendorOrFallback(id);

    if (!this.authService.isAuthenticated) {
      return of(this.clone(localVendor));
    }

    return this.http.get<Partial<VendorDetail>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => this.mergeVendorDetail(localVendor, response)),
      catchError((error) => {
        console.warn('Vendor detail API failed, using local fallback data.', error);
        return of(this.clone(localVendor));
      })
    );
  }

  getVendorSnapshotById(id: string): VendorDetail | undefined {
    const vendor = this.findVendor(id);
    return vendor ? this.clone(vendor) : undefined;
  }

  getVendorsSnapshot(): VendorDetail[] {
    return this.vendorStore.map((vendor) => this.clone(vendor));
  }

  getVendorKPIs(): Observable<VendorKPIs> {
    return of(this.buildVendorKPIs(this.vendorStore));
  }

  approveVendor(id: string, commissionRate: number): Observable<{ message: string }> {
    const request$ = this.authService.isAuthenticated
      ? this.http.post(`${this.apiUrl}/${id}/approve`, { commissionRate })
      : null;

    return this.executeApiMessage(
      request$,
      () => this.applyApproval(id, commissionRate),
      'Vendor account approved successfully.'
    );
  }

  rejectVendor(id: string, reason: string): Observable<{ message: string }> {
    const request$ = this.authService.isAuthenticated
      ? this.http.post(`${this.apiUrl}/${id}/reject`, { reason })
      : null;

    return this.executeApiMessage(
      request$,
      () => this.applyRejection(id, reason),
      'Vendor account rejected.'
    );
  }

  suspendVendor(id: string, reason: string): Observable<{ message: string }> {
    const request$ = this.authService.isAuthenticated
      ? this.http.post(`${this.apiUrl}/${id}/suspend`, { reason })
      : null;

    return this.executeApiMessage(
      request$,
      () => this.applySuspension(id, reason),
      'Vendor account suspended.'
    );
  }

  approveVendorReview(id: string, commissionRate: number = 13): Observable<VendorDetail> {
    const request$ = this.authService.isAuthenticated
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
    return of(this.updateVendor(id, (vendor) => {
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
    }));
  }

  startVendorReview(id: string): Observable<VendorDetail> {
    return of(this.updateVendor(id, (vendor) => {
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
    }));
  }

  rejectVendorReview(
    id: string,
    reason: string = 'Submitted data did not pass compliance review.'
  ): Observable<VendorDetail> {
    const request$ = this.authService.isAuthenticated
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
    const request$ = this.authService.isAuthenticated
      ? this.http.post(`${this.apiUrl}/${id}/suspend`, { reason })
      : null;

    return this.executeVendorMutation(
      request$,
      () => this.applySuspension(id, reason)
    );
  }

  addVendorReviewNote(
    id: string,
    message: string,
    authorName: string = 'Operations Reviewer',
    roleLabel: string = 'Vendor Review'
  ): Observable<VendorDetail> {
    return of(this.updateVendor(id, (vendor) => {
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
    }));
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
      }),
      catchError((error) => {
        console.warn('Vendor mutation API failed, applying local fallback.', error);
        localMutation();
        return of({ message: successMessage });
      })
    );
  }

  private executeVendorMutation(
    request$: Observable<unknown> | null,
    localMutation: () => VendorDetail
  ): Observable<VendorDetail> {
    if (!request$) {
      return of(localMutation());
    }

    return request$.pipe(
      map(() => localMutation()),
      catchError((error) => {
        console.warn('Vendor mutation API failed, applying local fallback.', error);
        return of(localMutation());
      })
    );
  }

  private normalizeVendorResponse(
    response: PaginatedVendors | Vendor[] | null | undefined,
    pageNumber: number,
    pageSize: number,
    search?: string,
    status?: VendorStatus
  ): PaginatedVendors {
    if (Array.isArray(response)) {
      const enriched = response.map((vendor) => this.mergeVendorSummary(vendor));
      return this.paginateVendors(enriched, pageNumber, pageSize, search, status);
    }

    if (response && Array.isArray(response.items)) {
      const items = response.items.map((vendor) => this.mergeVendorSummary(vendor));
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

  private mergeVendorSummary(apiVendor: Vendor): Vendor {
    const localVendor = this.findVendor(apiVendor.id);
    const base = localVendor ? this.toVendorSummary(localVendor) : this.toVendorSummary(this.vendorStore[0]);
    return this.clone({
      ...base,
      ...apiVendor
    });
  }

  private mergeVendorDetail(base: VendorDetail, apiVendor: Partial<VendorDetail>): VendorDetail {
    return this.clone({
      ...base,
      ...apiVendor,
      reviewDocuments: base.reviewDocuments,
      reviewNotes: base.reviewNotes,
      riskIndicators: base.riskIndicators
    });
  }

  private applyApproval(id: string, commissionRate: number): VendorDetail {
    return this.updateVendor(id, (vendor) => {
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
      vendor.status = VendorStatus.Rejected;
      vendor.reviewState = 'rejected';
      vendor.rejectionReason = reason;
      vendor.reviewDecisionReason = reason;
      vendor.reviewCompletedAtUtc = this.timestamp();
      vendor.approvedAtUtc = null;
      vendor.approvedBy = null;
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
      vendor.status = VendorStatus.Suspended;
      vendor.reviewState = 'suspended';
      vendor.reviewDecisionReason = reason;
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

  private updateVendor(id: string, mutate: (vendor: VendorDetail) => void): VendorDetail {
    const vendor = this.findVendorOrFallback(id);
    mutate(vendor);
    this.reconcileVendorState(vendor);
    return this.clone(vendor);
  }

  private reconcileVendorState(vendor: VendorDetail): void {
    const uploadedDocuments = vendor.reviewDocuments.filter((document) => document.status !== 'missing').length;
    const pendingDocuments = vendor.reviewDocuments.filter((document) => document.status === 'pending').length;
    const missingDocuments = vendor.reviewDocuments.filter((document) => document.status === 'missing').length;

    vendor.documentsCompleteness = Math.round((uploadedDocuments / vendor.reviewDocuments.length) * 100);
    vendor.documentsStatus = this.resolveDocumentsStatus(uploadedDocuments, missingDocuments);
    vendor.hasKYC = vendor.reviewDocuments.some((document) => document.type === 'identity' && document.status !== 'missing');
    vendor.hasPendingCompliance = vendor.reviewState === 'submitted' || vendor.reviewState === 'under_review' || vendor.reviewState === 'changes_requested';
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
    note: Pick<VendorReviewNote, 'authorName' | 'roleLabel' | 'messageKey' | 'tone'>
  ): void {
    vendor.reviewNotes = [
      {
        id: this.nextNoteId(vendor.reviewNotes),
        authorName: note.authorName,
        roleLabel: note.roleLabel,
        createdAtUtc: this.timestamp(),
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
      iconBgClass: 'bg-slate-100 text-slate-500'
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
        iconBgClass: 'bg-teal-50 text-teal-500'
      };
    }

    if (status === 'pending') {
      return {
        ...document,
        status,
        statusLabelKey: 'COMPLIANCE.STATUS.UNDER_REVIEW',
        iconBgClass: 'bg-orange-50 text-orange-500'
      };
    }

    return {
      ...document,
      status,
      statusLabelKey: 'COMPLIANCE.STATUS.MISSING',
      iconBgClass: 'bg-slate-100 text-slate-500'
    };
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
