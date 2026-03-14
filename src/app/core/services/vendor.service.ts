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
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedVendors>(this.apiUrl, { params });
  }

  getVendorById(id: string): Observable<VendorDetail> {
    return this.http.get<VendorDetail>(`${this.apiUrl}/${id}`);
  }

  updateVendorStatus(id: string, status: VendorStatus, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status, isActive });
  }
}
