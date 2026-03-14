import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/catalog.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private apiUrl = `${environment.apiUrl}/admin/catalog`;
  private filesUrl = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // --- Categories (Industry -> Sub-Category Tree) ---

  getCategories(parentId?: string, includeInactive: boolean = false): Observable<Category[]> {
    let params = new HttpParams().set('includeInactive', includeInactive.toString());
    if (parentId) {
      params = params.set('parentId', parentId);
    }
    return this.http.get<Category[]>(`${this.apiUrl}/categories`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  createCategory(payload: any): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, payload, { headers: this.getHeaders() });
  }

  updateCategory(id: string, payload: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/categories/${id}`, payload, { headers: this.getHeaders() });
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`, { headers: this.getHeaders() });
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`, { headers: this.getHeaders() });
  }

  // --- Master Products ---

  getProducts(page: number = 1, pageSize: number = 10, searchTerm?: string, categoryId?: string, brandId?: string): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    if (brandId) {
      params = params.set('brandId', brandId);
    }

    return this.http.get<any>(`${this.apiUrl}/products`, { headers: this.getHeaders(), params });
  }

  createProduct(payload: any): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/products`, payload, { headers: this.getHeaders() });
  }

  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  updateProduct(id: string, payload: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/products/${id}`, payload, { headers: this.getHeaders() });
  }

  // --- Brands ---

  getBrands(includeInactive: boolean = false): Observable<any[]> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<any[]>(`${this.apiUrl}/brands`, { headers: this.getHeaders(), params });
  }

  createBrand(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/brands`, payload, { headers: this.getHeaders() });
  }

  updateBrand(id: string, payload: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/brands/${id}`, payload, { headers: this.getHeaders() });
  }

  deleteBrand(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/brands/${id}`, { headers: this.getHeaders() });
  }

  // --- Units ---
  getUnits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/units`, { headers: this.getHeaders() });
  }


  // --- File Upload ---

  uploadFile(file: File, directory: string = 'catalog'): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', directory);
    return this.http.post<{ url: string }>(`${this.filesUrl}/upload`, formData, {
      headers: this.getHeaders()
    });
  }
}
