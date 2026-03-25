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
  VendorStatus,
  VerificationStatus
} from '../models/vendor';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private readonly apiUrl = `${environment.apiUrl}/admin/vendors`;
  private readonly mockVendors = this.buildMockVendors();

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
      return of(this.buildMockPaginatedVendors(pageNumber, pageSize, search, status));
    }

    let params = new HttpParams()
      .set('page', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedVendors | Vendor[]>(this.apiUrl, { params }).pipe(
      map((response) => this.normalizeVendorResponse(response, pageNumber, pageSize, search, status)),
      catchError((error) => {
        console.warn('Vendor API failed, using local fallback data.', error);
        return of(this.buildMockPaginatedVendors(pageNumber, pageSize, search, status));
      })
    );
  }

  getVendorById(id: string): Observable<VendorDetail> {
    if (!this.authService.isAuthenticated) {
      return of(this.buildMockVendorDetail(id));
    }

    return this.http.get<VendorDetail>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(this.buildMockVendorDetail(id)))
    );
  }

  approveVendor(id: string, commissionRate: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/approve`, { commissionRate });
  }

  rejectVendor(id: string, reason: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  suspendVendor(id: string, reason: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/suspend`, { reason });
  }

  private normalizeVendorResponse(
    response: PaginatedVendors | Vendor[] | null | undefined,
    pageNumber: number,
    pageSize: number,
    search?: string,
    status?: VendorStatus
  ): PaginatedVendors {
    if (Array.isArray(response)) {
      return this.paginateVendors(response, pageNumber, pageSize, search, status);
    }

    if (response && Array.isArray(response.items)) {
      const totalCount = response.totalCount ?? response.items.length;
      const totalPages = response.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));
      const safePage = response.pageNumber ?? Math.min(Math.max(1, pageNumber), totalPages);

      return {
        ...response,
        totalCount,
        totalPages,
        pageNumber: safePage,
        hasPreviousPage: response.hasPreviousPage ?? safePage > 1,
        hasNextPage: response.hasNextPage ?? safePage < totalPages
      };
    }

    return this.buildMockPaginatedVendors(pageNumber, pageSize, search, status);
  }

  private buildMockPaginatedVendors(
    pageNumber: number,
    pageSize: number,
    search?: string,
    status?: VendorStatus
  ): PaginatedVendors {
    return this.paginateVendors(this.mockVendors, pageNumber, pageSize, search, status);
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
        vendor.contactPhone
      ].some((value) => (value || '').toLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesSearch;
    });

    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(Math.max(1, pageNumber), totalPages);
    const startIndex = (safePage - 1) * pageSize;

    return {
      items: filtered.slice(startIndex, startIndex + pageSize),
      pageNumber: safePage,
      totalPages,
      totalCount,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages
    };
  }

  private buildMockVendorDetail(id: string): VendorDetail {
    const vendor = this.mockVendors.find((item) => item.id === id) ?? this.mockVendors[0];

    return {
      id: vendor.id,
      businessNameAr: vendor.businessNameAr,
      businessNameEn: vendor.businessNameEn,
      businessType: vendor.businessType,
      commercialRegistrationNumber: `CR-${vendor.id.replace(/\D+/g, '').padStart(10, '0')}`,
      taxId: `3${vendor.id.replace(/\D+/g, '').padStart(14, '0')}`,
      contactEmail: vendor.contactEmail,
      contactPhone: vendor.contactPhone,
      commissionRate: vendor.commissionRate,
      status: vendor.status,
      rejectionReason: vendor.status === 'Rejected' ? 'Compliance review rejected the latest submission.' : null,
      logoUrl: null,
      commercialRegisterDocumentUrl: null,
      approvedAtUtc: vendor.status === 'Active' ? '2026-03-01T10:30:00Z' : null,
      approvedBy: vendor.status === 'Active' ? 'Vendor Ops Desk' : null,
      createdAtUtc: vendor.createdAtUtc,
      ownerName: vendor.ownerName,
      ownerEmail: vendor.contactEmail,
      ownerPhone: vendor.contactPhone,
      branchesCount: vendor.status === 'Active' ? 3 : 1,
      bankAccountsCount: 1
    };
  }

  private buildMockVendors(): Vendor[] {
    const seeds = [
      { id: 'VND-24001', ar: 'لولو هايبر ماركت', en: 'LuLu Hypermarket', type: 'Hypermarket', owner: 'Mahmoud Karim', city: 'الرياض', region: 'Central' },
      { id: 'VND-24002', ar: 'بنده', en: 'Panda', type: 'Supermarket', owner: 'Rami Tarek', city: 'الرياض', region: 'Central' },
      { id: 'VND-24003', ar: 'العثيم', en: 'Othaim Markets', type: 'Supermarket', owner: 'Nawaf Salem', city: 'جدة', region: 'Western' },
      { id: 'VND-24004', ar: 'كارفور', en: 'Carrefour', type: 'Hypermarket', owner: 'Khaled Sami', city: 'الرياض', region: 'Central' },
      { id: 'VND-24005', ar: 'دانوب', en: 'Danube', type: 'Supermarket', owner: 'Ayman Fathi', city: 'الرياض', region: 'Central' },
      { id: 'VND-24006', ar: 'تميمي', en: 'Tamimi Markets', type: 'Supermarket', owner: 'Hany Adel', city: 'الرياض', region: 'Central' },
      { id: 'VND-24007', ar: 'مطاعم الرومانسية', en: 'Al Romansiah Restaurants', type: 'Restaurant', owner: 'Saad Fahmy', city: 'الرياض', region: 'Central' },
      { id: 'VND-24008', ar: 'هرفي - العليا', en: 'Herfy - Olaya', type: 'Restaurant', owner: 'Mazen Ibrahim', city: 'الرياض', region: 'Central' },
      { id: 'VND-24009', ar: 'ماكدونالدز', en: "McDonald's", type: 'Restaurant', owner: 'Tariq Nabil', city: 'جدة', region: 'Western' },
      { id: 'VND-24010', ar: 'Barns', en: 'Barns', type: 'Cafe', owner: 'Amr Hossam', city: 'الخبر', region: 'Eastern' },
      { id: 'VND-24011', ar: 'برغرايززر', en: 'Burgerizzr', type: 'Restaurant', owner: 'Yousef Adel', city: 'الدمام', region: 'Eastern' },
      { id: 'VND-9928', ar: 'متجر التقنية الحديثة', en: 'Modern Tech Store', type: 'Electronics', owner: 'Abdullah Khaled', city: 'الرياض', region: 'Central' }
    ];

    return seeds.map((seed, index) => ({
      id: seed.id,
      businessNameAr: seed.ar,
      businessNameEn: seed.en,
      businessType: seed.type,
      status: (['Active', 'Pending', 'Suspended', 'Active'][index % 4]) as VendorStatus,
      ownerName: seed.owner,
      contactPhone: `+966 50 000 ${String(index + 101).padStart(3, '0')}`,
      createdAtUtc: `2025-${String((index % 9) + 1).padStart(2, '0')}-15T08:00:00Z`,
      contactEmail: `${seed.id.toLowerCase()}@zadana-vendors.sa`,
      commissionRate: 12 + (index % 5),
      city: seed.city,
      region: seed.region,
      onboardingStage: (['Approved', 'UnderReview', 'DocumentsPending', 'Approved'][index % 4]) as OnboardingStage,
      verificationStatus: (['Verified', 'Pending', 'Unverified', 'Verified'][index % 4]) as VerificationStatus,
      documentsStatus: (['Complete', 'Incomplete', 'Missing', 'Complete'][index % 4]) as DocumentsStatus,
      riskLevel: (['Low', 'Medium', 'High', 'Critical'][index % 4]) as RiskLevel,
      payoutStatus: (['Active', 'Pending', 'Blocked'][index % 3]) as PayoutStatus,
      lastActiveAtUtc: `2026-03-${String((index % 20) + 1).padStart(2, '0')}T12:30:00Z`,
      performanceRating: 3.7 + ((index % 3) * 0.4),
      documentsCompleteness: 100 - ((index % 5) * 12),
      hasKYC: index % 4 !== 2,
      hasPendingCompliance: index % 4 === 1,
      hasFraudFlag: index % 6 === 0,
      complaintsCount: index % 5,
      isLowPerformance: index % 7 === 0
    }));
  }
}
