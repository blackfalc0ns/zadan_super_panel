import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedVendors, VendorStatus, VendorDetail } from '../models/vendor';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private readonly apiUrl = `${environment.apiUrl}/admin/vendors`;

  constructor(private http: HttpClient) { }

  getVendors(pageNumber: number = 1, pageSize: number = 10, search?: string, status?: VendorStatus): Observable<PaginatedVendors> {
    let params = new HttpParams()
      .set('page', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    if (status) {
      params = params.set('status', status);
    }

    console.log('Fetching vendors with params:', params.toString());
    return this.http.get<PaginatedVendors>(this.apiUrl, { params });
  }

  getVendorById(id: string): Observable<VendorDetail> {
    return this.http.get<VendorDetail>(`${this.apiUrl}/${id}`);
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
}
