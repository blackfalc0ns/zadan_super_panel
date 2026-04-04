import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { VendorDetail } from '@vendors/models/vendors.domain.models';
import { VendorService } from '@vendors/services/vendor.api.service';

@Injectable()
export class VendorDetailFacade {
  private readonly vendorIdSubject = new BehaviorSubject<string | null>(null);
  private readonly vendorSubject = new BehaviorSubject<VendorDetail | null>(null);
  private readonly isLoadingSubject = new BehaviorSubject(false);

  readonly vendorId$ = this.vendorIdSubject.asObservable();
  readonly vendor$ = this.vendorSubject.asObservable();
  readonly isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private readonly vendorService: VendorService) {}

  get vendorId(): string | null {
    return this.vendorIdSubject.value;
  }

  get vendor(): VendorDetail | null {
    return this.vendorSubject.value;
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
    this.vendorService
      .getVendorById(vendorId)
      .pipe(take(1))
      .subscribe((vendor) => {
        this.vendorSubject.next(vendor);
        this.isLoadingSubject.next(false);
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
    this.applyVendorMutation((vendorId) =>
      this.vendorService.approveVendorReview(vendorId, commissionRate ?? this.vendor?.commissionRate ?? 13)
    );
  }

  requestVendorDocuments(note?: string): void {
    this.applyVendorMutation((vendorId) =>
      this.vendorService.requestVendorDocuments(vendorId, note)
    );
  }

  suspendVendorAccount(reason?: string): void {
    this.applyVendorMutation((vendorId) =>
      this.vendorService.suspendVendorAccount(vendorId, reason)
    );
  }

  rejectVendorReview(reason?: string): void {
    this.applyVendorMutation((vendorId) =>
      this.vendorService.rejectVendorReview(vendorId, reason)
    );
  }

  addVendorReviewNote(
    message: string,
    authorName?: string,
    roleLabel?: string
  ): void {
    this.applyVendorMutation((vendorId) =>
      this.vendorService.addVendorReviewNote(vendorId, message, authorName, roleLabel)
    );
  }

  private applyVendorMutation(factory: (vendorId: string) => Observable<VendorDetail>): void {
    const vendorId = this.vendorId;

    if (!vendorId) {
      return;
    }

    factory(vendorId)
      .pipe(take(1))
      .subscribe((vendor) => this.vendorSubject.next(vendor));
  }
}
