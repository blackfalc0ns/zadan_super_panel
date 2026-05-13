import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminBrandBulkOperation,
  AdminBrandBulkOperationItem,
  AdminMasterProductBulkOperation,
  AdminMasterProductBulkOperationItem,
  BrandSearchFacets,
  BrandSearchFilters,
  Brand,
  BulkBrandDraft,
  BulkMasterProductDraft,
  CatalogUnit,
  CatalogSearchRequest,
  CatalogSearchResponse,
  Category,
  CategorySearchFacets,
  CategorySearchFilters,
  MasterProduct,
  MasterProductImage,
  ProductSearchFacets,
  ProductSearchFilters,
  ProductRequest,
  ProductRequestStatus
} from '@catalog/models/catalog.domain.models';
import { AuthService } from '@core/services/auth.service';

export interface ProductVendorSnapshotDto {
  vendorId: string;
  nameAr: string;
  nameEn: string;
  quantity: number;
  price: number;
  updatedAtUtc: string;
}

interface CatalogProductRecord extends MasterProduct {
  slug?: string;
  unitId?: string | null;
}

interface CatalogCategoryPayload {
  nameAr: string;
  nameEn: string;
  imageUrl?: string;
  parentCategoryId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

interface CatalogProductPayload {
  id?: string;
  nameAr?: string;
  nameEn?: string;
  slug?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  barcode?: string;
  categoryId?: string;
  brandId?: string | null;
  unitId?: string | null;
  unitOfMeasureId?: string | null;
  status?: MasterProduct['status'];
  images?: Array<{
    masterProductId?: string;
    imageBankId?: string;
    url?: string;
    isPrimary: boolean;
    displayOrder: number;
  }>;
}

interface CatalogBrandPayload {
  nameAr: string;
  nameEn: string;
  logoUrl?: string;
  coverImageUrl?: string;
  categoryId?: string | null;
  categoryIds?: string[];
  isActive?: boolean;
}

export interface CatalogPaginatedProducts {
  items: MasterProduct[];
  data?: MasterProduct[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductSearchResult extends CatalogSearchResponse<MasterProduct, ProductSearchFilters, ProductSearchFacets> {}
export interface CategorySearchResult extends CatalogSearchResponse<Category, CategorySearchFilters, CategorySearchFacets> {}
export interface BrandSearchResult extends CatalogSearchResponse<Brand, BrandSearchFilters, BrandSearchFacets> {}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private readonly apiUrl = `${environment.apiUrl}/admin/catalog`;
  private readonly filesUrl = `${environment.apiUrl}/files`;
  private readonly fallbackWarnings = new Set<string>();
  private unauthorizedReadToken: string | null = null;

  private readonly fallbackCategories = this.buildMockCategories();
  private readonly fallbackProducts = this.buildMockProducts();
  private readonly fallbackBrands = this.buildMockBrands();
  private readonly fallbackUnits = this.buildMockUnits();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  getCategories(parentId?: string, includeInactive: boolean = false, allowFallback: boolean = true): Observable<Category[]> {
    const fallback = this.getFallbackCategories(parentId, includeInactive);

    if (allowFallback && this.shouldUseLocalReadFallback()) {
      return of(fallback);
    }

    const params = new HttpParams().set('includeInactive', includeInactive.toString());

    return this.http.get<unknown>(`${this.apiUrl}/categories`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map((response) => this.normalizeCategoriesResponse(response, parentId, includeInactive, fallback)),
      catchError((error) => allowFallback
        ? this.handleReadFallback('Catalog categories', fallback, error)
        : throwError(() => error))
    );
  }

  createCategory(payload: CatalogCategoryPayload): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, payload, { headers: this.getHeaders() });
  }

  updateCategory(id: string, payload: CatalogCategoryPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/categories/${id}`, payload, { headers: this.getHeaders() });
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<unknown>(`${this.apiUrl}/categories/${id}`, { headers: this.getHeaders() }).pipe(
      map((response) => {
        const category = this.normalizeSingleCategory(response);
        if (!category) {
          throw new Error(`Catalog category ${id} was not found.`);
        }

        return category;
      })
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`, { headers: this.getHeaders() });
  }

  getProducts(
    page: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
    categoryId?: string,
    brandId?: string,
    status?: string
  ): Observable<CatalogPaginatedProducts> {
    const fallback = this.buildFallbackPaginatedProducts(page, pageSize, searchTerm, categoryId, brandId, status);

    if (this.shouldUseLocalReadFallback()) {
      return of(fallback);
    }

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
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<unknown>(`${this.apiUrl}/products`, { headers: this.getHeaders(), params }).pipe(
      map((response) => this.normalizeProductsResponse(response, page, pageSize, searchTerm, categoryId, brandId, status)),
      catchError((error) => this.handleReadFallback('Catalog products', fallback, error))
    );
  }

  searchProducts(request: CatalogSearchRequest<ProductSearchFilters>, allowFallback: boolean = true): Observable<ProductSearchResult> {
    const fallback = this.buildFallbackProductSearchResponse(request);

    if (allowFallback && this.shouldUseLocalReadFallback()) {
      return of(fallback);
    }

    return this.http.post<unknown>(`${this.apiUrl}/products/search`, request, { headers: this.getHeaders() }).pipe(
      map((response) => this.normalizeProductSearchResponse(response, request, fallback)),
      catchError((error) => allowFallback
        ? this.handleReadFallback('Catalog products search', fallback, error)
        : throwError(() => error))
    );
  }

  createProduct(payload: CatalogProductPayload): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/products`, payload, { headers: this.getHeaders() });
  }

  createProductsBulk(items: BulkMasterProductDraft[]): Observable<AdminMasterProductBulkOperation> {
    const payload = {
      idempotencyKey: this.generateIdempotencyKey('admin-master-bulk'),
      items: items.map((item) => ({
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        slug: item.slug || null,
        barcode: item.barcode || null,
        categoryId: item.categoryId,
        brandId: item.brandId || null,
        unitId: item.unitId || null,
        status: item.status,
        descriptionAr: item.descriptionAr || null,
        descriptionEn: item.descriptionEn || null,
        images: (item.images || []).map((image) => ({
          url: image.url,
          altText: image.altText || null,
          displayOrder: image.displayOrder,
          isPrimary: image.isPrimary
        }))
      }))
    };

    return this.http.post<AdminMasterProductBulkOperation>(`${this.apiUrl}/products/bulk`, payload, { headers: this.getHeaders() });
  }

  getProductsBulkOperation(operationId: string): Observable<AdminMasterProductBulkOperation> {
    return this.http.get<AdminMasterProductBulkOperation>(`${this.apiUrl}/products/bulk/${operationId}`, { headers: this.getHeaders() });
  }

  getProductsBulkOperationItems(operationId: string): Observable<AdminMasterProductBulkOperationItem[]> {
    return this.http.get<AdminMasterProductBulkOperationItem[]>(`${this.apiUrl}/products/bulk/${operationId}/items`, { headers: this.getHeaders() });
  }

  getProductById(id: string): Observable<CatalogProductRecord> {
    return this.http.get<unknown>(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() }).pipe(
      map((response) => {
        const product = this.normalizeSingleProduct(response);
        if (!product) {
          throw new Error(`Catalog product ${id} was not found.`);
        }

        return product;
      })
    );
  }

  getProductVendors(productId: string, page: number = 1, pageSize: number = 10): Observable<{ items: ProductVendorSnapshotDto[], totalCount: number }> {
    const params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<{ items: ProductVendorSnapshotDto[], totalCount: number }>(`${this.apiUrl}/products/${productId}/vendors`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError((error) => {
        console.warn('Fallback: returning empty vendors list due to error', error);
        return of({ items: [], totalCount: 0 });
      })
    );
  }

  updateProduct(id: string, payload: CatalogProductPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/products/${id}`, payload, { headers: this.getHeaders() });
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  getBrands(includeInactive: boolean = false, allowFallback: boolean = true): Observable<Brand[]> {
    const fallback = this.getFallbackBrands(includeInactive);

    if (allowFallback && this.shouldUseLocalReadFallback()) {
      return of(fallback);
    }

    const params = new HttpParams().set('includeInactive', includeInactive.toString());

    return this.http.get<unknown>(`${this.apiUrl}/brands`, { headers: this.getHeaders(), params }).pipe(
      map((response) => this.normalizeBrandsResponse(response, includeInactive, fallback)),
      catchError((error) => allowFallback
        ? this.handleReadFallback('Catalog brands', fallback, error)
        : throwError(() => error))
    );
  }

  getBrandById(id: string, allowFallback: boolean = true): Observable<Brand> {
    const fallback = this.findFallbackBrandById(id);

    if (allowFallback && this.shouldUseLocalReadFallback() && fallback) {
      return of(fallback);
    }

    return this.getBrands(true, false).pipe(
      map((brands) => {
        const brand = brands.find((item) => item.id === id);
        if (!brand) {
          throw new Error(`Catalog brand ${id} was not found.`);
        }

        return brand;
      }),
      catchError((error) => allowFallback && fallback
        ? this.handleReadFallback('Catalog brand detail', fallback, error)
        : throwError(() => error))
    );
  }

  searchCategories(request: CatalogSearchRequest<CategorySearchFilters>): Observable<CategorySearchResult> {
    const fallback = this.buildFallbackCategorySearchResponse(request);

    if (this.shouldUseLocalReadFallback()) {
      return of(fallback);
    }

    return this.http.post<unknown>(`${this.apiUrl}/categories/search`, request, { headers: this.getHeaders() }).pipe(
      map((response) => this.normalizeCategorySearchResponse(response, request, fallback)),
      catchError((error) => this.handleReadFallback('Catalog categories search', fallback, error))
    );
  }

  searchBrands(request: CatalogSearchRequest<BrandSearchFilters>): Observable<BrandSearchResult> {
    const fallback = this.buildFallbackBrandSearchResponse(request);

    if (this.shouldUseLocalReadFallback()) {
      return of(fallback);
    }

    return this.http.post<unknown>(`${this.apiUrl}/brands/search`, request, { headers: this.getHeaders() }).pipe(
      map((response) => this.normalizeBrandSearchResponse(response, request, fallback)),
      catchError((error) => this.handleReadFallback('Catalog brands search', fallback, error))
    );
  }

  createBrand(payload: CatalogBrandPayload): Observable<Brand> {
    return this.http.post<Brand>(`${this.apiUrl}/brands`, payload, { headers: this.getHeaders() });
  }

  createBrandsBulk(items: BulkBrandDraft[]): Observable<AdminBrandBulkOperation> {
    const payload = {
      idempotencyKey: this.generateIdempotencyKey('admin-brand-bulk'),
      items: items.map((item) => ({
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        logoUrl: item.logoUrl || null,
        coverImageUrl: item.coverImageUrl || null,
        categoryId: item.categoryId,
        categoryIds: item.categoryIds?.length ? item.categoryIds : (item.categoryId ? [item.categoryId] : []),
        isActive: item.isActive
      }))
    };

    return this.http.post<AdminBrandBulkOperation>(`${this.apiUrl}/brands/bulk`, payload, { headers: this.getHeaders() });
  }

  getBrandsBulkOperation(operationId: string): Observable<AdminBrandBulkOperation> {
    return this.http.get<AdminBrandBulkOperation>(`${this.apiUrl}/brands/bulk/${operationId}`, { headers: this.getHeaders() });
  }

  getBrandsBulkOperationItems(operationId: string): Observable<AdminBrandBulkOperationItem[]> {
    return this.http.get<AdminBrandBulkOperationItem[]>(`${this.apiUrl}/brands/bulk/${operationId}/items`, { headers: this.getHeaders() });
  }

  updateBrand(id: string, payload: CatalogBrandPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/brands/${id}`, payload, { headers: this.getHeaders() });
  }

  deleteBrand(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/brands/${id}`, { headers: this.getHeaders() });
  }

  getUnits(): Observable<CatalogUnit[]> {
    const fallback = this.fallbackUnits.map((unit) => ({ ...unit }));

    if (this.shouldUseLocalReadFallback()) {
      return of(fallback);
    }

    return this.http.get<unknown>(`${this.apiUrl}/units`, { headers: this.getHeaders() }).pipe(
      map((response) => this.normalizeUnitsResponse(response, fallback)),
      catchError((error) => this.handleReadFallback('Catalog units', fallback, error))
    );
  }

  getProductRequests(status?: ProductRequestStatus): Observable<ProductRequest[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<any>(`${this.apiUrl}/request-center`, {
      headers: this.getHeaders(),
      params: params.set('type', 'product')
    }).pipe(
      map((response) => this.extractArray<any>(response).map((item) => this.mapCatalogRequest(item)))
    );
  }

  getProductRequestById(id: string): Observable<ProductRequest> {
    return this.http.get<any>(`${this.apiUrl}/request-center/${id}`, {
      headers: this.getHeaders(),
      params: new HttpParams().set('type', 'product')
    }).pipe(
      map((response) => this.mapCatalogRequest(this.extractEntity<any>(response) ?? response))
    );
  }

  reviewProductRequest(id: string, status: 'Approved' | 'Rejected', notes?: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/product-requests/${id}/review`, {
      isApproved: status === 'Approved',
      rejectionReason: notes ?? null
    }, {
      headers: this.getHeaders()
    });
  }

  getCatalogRequests(params?: {
    type?: 'all' | 'product' | 'brand' | 'category';
    status?: 'all' | ProductRequestStatus;
    vendorId?: string;
  }): Observable<ProductRequest[]> {
    let httpParams = new HttpParams();
    if (params?.type && params.type !== 'all') httpParams = httpParams.set('type', params.type);
    if (params?.status && params.status !== 'all') httpParams = httpParams.set('status', params.status);
    if (params?.vendorId) httpParams = httpParams.set('vendorId', params.vendorId);

    return this.http.get<any>(`${this.apiUrl}/request-center`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      map((response) => this.extractArray<any>(response).map((item) => this.mapCatalogRequest(item)))
    );
  }

  getCatalogRequestById(id: string, type: 'product' | 'brand' | 'category'): Observable<ProductRequest> {
    return this.http.get<any>(`${this.apiUrl}/request-center/${id}`, {
      headers: this.getHeaders(),
      params: new HttpParams().set('type', type)
    }).pipe(
      map((response) => this.mapCatalogRequest(this.extractEntity<any>(response) ?? response))
    );
  }

  reviewBrandRequest(id: string, status: 'Approved' | 'Rejected', notes?: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/brand-requests/${id}/review`, {
      isApproved: status === 'Approved',
      rejectionReason: notes ?? null
    }, {
      headers: this.getHeaders()
    });
  }

  reviewCategoryRequest(
    id: string,
    status: 'Approved' | 'Rejected',
    notes?: string,
    approvedTargetLevel?: string | null,
    approvedParentCategoryId?: string | null
  ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/category-requests/${id}/review`, {
      isApproved: status === 'Approved',
      rejectionReason: notes ?? null,
      approvedTargetLevel: approvedTargetLevel ?? null,
      approvedParentCategoryId: approvedParentCategoryId ?? null
    }, {
      headers: this.getHeaders()
    });
  }

  getCategoryPath(categoryId: string, lang: 'ar' | 'en' = 'ar'): string {
    const path: string[] = [];
    let currentId: string | null = categoryId;
    
    // We search through all categories (flattened or recursive)
    const allCategories = this.flattenCategories(this.fallbackCategories);
    
    while (currentId) {
      const category = allCategories.find(c => c.id === currentId);
      if (category) {
        path.unshift(lang === 'ar' ? category.nameAr : category.nameEn);
        currentId = category.parentCategoryId || null;
      } else {
        currentId = null;
      }
    }
    
    return path.join(' > ');
  }

  private buildMockProductRequests(): ProductRequest[] {
    return [];
  }

  private mapCatalogRequest(item: any): ProductRequest {
    return {
      id: item.id,
      requestType: item.requestType,
      suggestedNameAr: item.nameAr,
      suggestedNameEn: item.nameEn,
      suggestedCategoryId: item.categoryId || null,
      suggestedBrandId: item.brandId || undefined,
      suggestedBrandName: item.brandNameAr || undefined,
      suggestedBrandNameEn: item.brandNameEn || undefined,
      suggestedDescriptionAr: item.descriptionAr || undefined,
      suggestedDescriptionEn: item.descriptionEn || undefined,
      imageUrl: item.imageUrl || undefined,
      parentCategoryNameAr: item.parentCategoryNameAr || undefined,
      parentCategoryNameEn: item.parentCategoryNameEn || undefined,
      requestKind: item.requestKind || undefined,
      requestedLevelKey: item.requestedLevelKey || undefined,
      requestedPathAr: item.requestedPathAr || undefined,
      requestedPathEn: item.requestedPathEn || undefined,
      approvedPathAr: item.approvedPathAr || undefined,
      approvedPathEn: item.approvedPathEn || undefined,
      displayOrder: item.displayOrder ?? null,
      unitNameAr: item.unitNameAr || undefined,
      unitNameEn: item.unitNameEn || undefined,
      status: item.status,
      adminNotes: item.rejectionReason || undefined,
      reviewedBy: item.reviewedBy || undefined,
      reviewedAtUtc: item.reviewedAtUtc || undefined,
      vendorId: item.vendorId,
      vendorName: item.vendorName,
      createdAtUtc: item.createdAtUtc,
      categoryPathAr: item.requestedPathAr || item.approvedPathAr || item.categoryNameAr || item.parentCategoryNameAr || undefined,
      categoryPathEn: item.requestedPathEn || item.approvedPathEn || item.categoryNameEn || item.parentCategoryNameEn || undefined
    };
  }

  private generateIdempotencyKey(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  uploadFile(file: File, directory: string = 'catalog'): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', this.resolveUploadDirectory(directory));

    return this.http.post<{ url?: string; Url?: string }>(`${this.filesUrl}/upload`, formData, {
      headers: this.getHeaders()
    }).pipe(
      map((response) => {
        const url = (response.url ?? response.Url ?? '').trim();
        if (!url || url.startsWith('blob:')) {
          throw new Error('Catalog file upload did not return a valid cloud URL.');
        }

        return { url };
      })
    );
  }

  private resolveUploadDirectory(directory: string): string {
    const normalized = (directory || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
    const aliases: Record<string, string> = {
      catalog: 'uploads/catalog/products',
      brands: 'uploads/catalog/brands',
      products: 'uploads/catalog/products',
      categories: 'uploads/catalog/categories',
      'brand-requests': 'uploads/catalog/brand-requests',
      'category-requests': 'uploads/catalog/category-requests'
    };

    return aliases[normalized] ?? normalized;
  }

  private shouldUseLocalReadFallback(): boolean {
    if (!this.authService.hasApiSession) {
      this.resetReadFallbackState();
      return true;
    }

    const token = this.authService.getToken();
    if (this.unauthorizedReadToken && this.unauthorizedReadToken !== token) {
      this.resetReadFallbackState();
    }

    return this.unauthorizedReadToken !== null;
  }

  private handleReadFallback<T>(context: string, fallback: T, error: unknown): Observable<T> {
    const unauthorized = this.isUnauthorizedError(error);
    if (unauthorized) {
      this.unauthorizedReadToken = this.authService.getToken();
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

  private normalizeCategoriesResponse(
    response: unknown,
    parentId: string | undefined,
    includeInactive: boolean,
    fallback: Category[]
  ): Category[] {
    const source = this.extractArray<Category>(response).map((category, index) =>
      this.normalizeCategory(category, index, null, 0)
    );

    if (!source.length) {
      return fallback;
    }

    const prepared = includeInactive ? source : this.filterInactiveCategories(source);
    const resolved = parentId ? this.getCategoriesForParent(prepared, parentId) : prepared;

    return resolved.length ? resolved : fallback;
  }

  private normalizeSingleCategory(response: unknown): Category | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    const category = this.extractEntity<Category>(response);
    return category ? this.normalizeCategory(category, 0, null, category.level ?? 0) : null;
  }

  private normalizeProductsResponse(
    response: unknown,
    page: number,
    pageSize: number,
    searchTerm?: string,
    categoryId?: string,
    brandId?: string,
    status?: string
  ): CatalogPaginatedProducts {
    const items = this.extractArray<CatalogProductRecord>(response).map((product) => this.normalizeProduct(product));

    if (items.length === 0) {
      return this.buildFallbackPaginatedProducts(page, pageSize, searchTerm, categoryId, brandId, status);
    }

    const totalCount = this.extractNumber(response, ['totalCount', 'count', 'total', 'totalItems']) ?? items.length;
    const totalPages = this.extractNumber(response, ['totalPages']) ?? Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = this.extractNumber(response, ['pageNumber', 'page']) ?? Math.min(Math.max(1, page), totalPages);

    return {
      ...(typeof response === 'object' && response !== null ? response : {}),
      items,
      data: items,
      totalCount,
      totalPages,
      pageNumber: safePage,
      pageSize,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages
    };
  }

  private normalizeSingleProduct(response: unknown): CatalogProductRecord | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    const product = this.extractEntity<CatalogProductRecord>(response);
    return product ? this.normalizeProduct(product) : null;
  }

  private normalizeBrandsResponse(
    response: unknown,
    includeInactive: boolean,
    fallback: Brand[]
  ): Brand[] {
    const brands = this.extractArray<Brand>(response).map((brand, index) => this.normalizeBrand(brand, index));

    if (!brands.length) {
      return fallback;
    }

    return includeInactive ? brands : brands.filter((brand) => brand.isActive);
  }

  private normalizeSingleBrand(response: unknown): Brand | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    const brand = this.extractEntity<Brand>(response);
    return brand ? this.normalizeBrand(brand, 0) : null;
  }

  private normalizeProductSearchResponse(
    response: unknown,
    request: CatalogSearchRequest<ProductSearchFilters>,
    fallback: ProductSearchResult
  ): ProductSearchResult {
    const items = this.extractArray<CatalogProductRecord>(response).map((product) => this.normalizeProduct(product));
    if (!items.length) {
      return fallback;
    }

    return {
      items,
      totalCount: this.extractNumber(response, ['totalCount', 'count', 'total']) ?? items.length,
      totalPages: this.extractNumber(response, ['totalPages']) ?? fallback.totalPages,
      pageNumber: this.extractNumber(response, ['pageNumber', 'page']) ?? request.pagination?.pageNumber ?? 1,
      pageSize: this.extractNumber(response, ['pageSize']) ?? request.pagination?.pageSize ?? fallback.pageSize,
      appliedFilters: this.extractObject<ProductSearchFilters>(response, ['appliedFilters']) ?? request.filters ?? {},
      availableSorts: this.extractArray<{ field: string; direction: 'asc' | 'desc'; label?: string }>(this.extractNestedValue(response, ['availableSorts']))
        .map((item) => ({ field: item.field, direction: item.direction, label: item.label })),
      facets: this.extractObject<ProductSearchFacets>(response, ['facets']) ?? fallback.facets
    };
  }

  private normalizeCategorySearchResponse(
    response: unknown,
    request: CatalogSearchRequest<CategorySearchFilters>,
    fallback: CategorySearchResult
  ): CategorySearchResult {
    const items = this.extractArray<Category>(response).map((category, index) =>
      this.normalizeCategory(category, index, null, category.level ?? 0)
    );
    if (!items.length) {
      return fallback;
    }

    return {
      items,
      totalCount: this.extractNumber(response, ['totalCount', 'count', 'total']) ?? items.length,
      totalPages: this.extractNumber(response, ['totalPages']) ?? fallback.totalPages,
      pageNumber: this.extractNumber(response, ['pageNumber', 'page']) ?? request.pagination?.pageNumber ?? 1,
      pageSize: this.extractNumber(response, ['pageSize']) ?? request.pagination?.pageSize ?? fallback.pageSize,
      appliedFilters: this.extractObject<CategorySearchFilters>(response, ['appliedFilters']) ?? request.filters ?? {},
      availableSorts: this.extractArray<{ field: string; direction: 'asc' | 'desc'; label?: string }>(this.extractNestedValue(response, ['availableSorts']))
        .map((item) => ({ field: item.field, direction: item.direction, label: item.label })),
      facets: this.extractObject<CategorySearchFacets>(response, ['facets']) ?? fallback.facets
    };
  }

  private normalizeBrandSearchResponse(
    response: unknown,
    request: CatalogSearchRequest<BrandSearchFilters>,
    fallback: BrandSearchResult
  ): BrandSearchResult {
    const items = this.extractArray<Brand>(response).map((brand, index) => this.normalizeBrand(brand, index));
    if (!items.length) {
      return fallback;
    }

    return {
      items,
      totalCount: this.extractNumber(response, ['totalCount', 'count', 'total']) ?? items.length,
      totalPages: this.extractNumber(response, ['totalPages']) ?? fallback.totalPages,
      pageNumber: this.extractNumber(response, ['pageNumber', 'page']) ?? request.pagination?.pageNumber ?? 1,
      pageSize: this.extractNumber(response, ['pageSize']) ?? request.pagination?.pageSize ?? fallback.pageSize,
      appliedFilters: this.extractObject<BrandSearchFilters>(response, ['appliedFilters']) ?? request.filters ?? {},
      availableSorts: this.extractArray<{ field: string; direction: 'asc' | 'desc'; label?: string }>(this.extractNestedValue(response, ['availableSorts']))
        .map((item) => ({ field: item.field, direction: item.direction, label: item.label })),
      facets: this.extractObject<BrandSearchFacets>(response, ['facets']) ?? fallback.facets
    };
  }

  private normalizeUnitsResponse(response: unknown, fallback: CatalogUnit[]): CatalogUnit[] {
    const units = this.extractArray<CatalogUnit>(response).map((unit, index) => ({
      id: unit.id || `UNIT-${index + 1}`,
      nameAr: unit.nameAr || unit.nameEn || `وحدة ${index + 1}`,
      nameEn: unit.nameEn || unit.nameAr || `Unit ${index + 1}`,
      isActive: unit.isActive ?? true
    }));

    return units.length ? units : fallback;
  }

  private extractEntity<T>(response: unknown): T | null {
    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const entity = candidate['data'] ?? candidate['item'] ?? candidate['result'];

      if (entity && !Array.isArray(entity) && typeof entity === 'object') {
        return entity as T;
      }

      if (!Array.isArray(response)) {
        return response as T;
      }
    }

    return null;
  }

  private extractArray<T>(response: unknown): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    if (response && typeof response === 'object') {
      const candidate = response as Record<string, unknown>;
      const arrays = [candidate['items'], candidate['data'], candidate['results'], candidate['value']];

      for (const value of arrays) {
        if (Array.isArray(value)) {
          return value as T[];
        }
      }

      if (candidate['data'] && typeof candidate['data'] === 'object') {
        const nested = candidate['data'] as Record<string, unknown>;
        if (Array.isArray(nested['items'])) {
          return nested['items'] as T[];
        }
      }
    }

    return [];
  }

  private extractObject<T>(response: unknown, keys: string[]): T | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    const candidate = response as Record<string, unknown>;
    for (const key of keys) {
      const value = candidate[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as T;
      }
    }

    if (candidate['data'] && typeof candidate['data'] === 'object') {
      const nested = candidate['data'] as Record<string, unknown>;
      for (const key of keys) {
        const value = nested[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return value as T;
        }
      }
    }

    return null;
  }

  private extractNestedValue(response: unknown, keys: string[]): unknown {
    if (!response || typeof response !== 'object') {
      return null;
    }

    const candidate = response as Record<string, unknown>;
    for (const key of keys) {
      if (key in candidate) {
        return candidate[key];
      }
    }

    if (candidate['data'] && typeof candidate['data'] === 'object') {
      const nested = candidate['data'] as Record<string, unknown>;
      for (const key of keys) {
        if (key in nested) {
          return nested[key];
        }
      }
    }

    return null;
  }

  private extractNumber(response: unknown, keys: string[]): number | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    const candidate = response as Record<string, unknown>;

    for (const key of keys) {
      const value = candidate[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
    }

    if (candidate['data'] && typeof candidate['data'] === 'object') {
      const nested = candidate['data'] as Record<string, unknown>;
      for (const key of keys) {
        const value = nested[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
          return value;
        }
      }
    }

    return null;
  }

  private getFallbackCategories(parentId?: string, includeInactive: boolean = false): Category[] {
    const prepared = this.decorateCategories(this.cloneCategories(this.fallbackCategories), null, 0);
    const filtered = includeInactive ? prepared : this.filterInactiveCategories(prepared);

    if (!parentId) {
      return filtered;
    }

    return this.getCategoriesForParent(filtered, parentId);
  }

  private getCategoriesForParent(categories: Category[], parentId: string): Category[] {
    const directChildren = this.getDirectChildren(categories, parentId);

    if (directChildren.length > 0) {
      return directChildren;
    }

    return this.flattenCategories(categories).filter((category) => category.parentCategoryId === parentId);
  }

  private getFallbackBrands(includeInactive: boolean = false): Brand[] {
    const brands = this.fallbackBrands.map((brand) => ({ ...brand }));
    return includeInactive ? brands : brands.filter((brand) => brand.isActive);
  }

  private buildFallbackPaginatedProducts(
    page: number,
    pageSize: number,
    searchTerm?: string,
    categoryId?: string,
    brandId?: string,
    status?: string
  ): CatalogPaginatedProducts {
    const filtered = this.fallbackProducts.filter((product) => {
      const normalizedQuery = searchTerm?.trim().toLowerCase() || '';
      const searchMatch = !normalizedQuery || [
        product.id,
        product.nameAr,
        product.nameEn,
        product.barcode,
        product.slug,
        product.descriptionAr,
        product.descriptionEn
      ].some((value) => (value || '').toLowerCase().includes(normalizedQuery));

      const categoryIds = categoryId ? this.collectCategoryBranchIds(categoryId) : null;
      const categoryMatch = !categoryIds || categoryIds.has(product.categoryId);
      const brandMatch = !brandId || product.brandId === brandId;
      const statusMatch = !status || product.status === status;

      return searchMatch && categoryMatch && brandMatch && statusMatch;
    });

    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const items = filtered
      .slice(startIndex, startIndex + pageSize)
      .map((product) => this.cloneProduct(product));

    return {
      items,
      data: items,
      totalCount,
      totalPages,
      pageNumber: safePage,
      pageSize,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages
    };
  }

  private buildFallbackProductSearchResponse(request: CatalogSearchRequest<ProductSearchFilters>): ProductSearchResult {
    const pageNumber = Math.max(1, request.pagination?.pageNumber ?? 1);
    const pageSize = Math.max(1, request.pagination?.pageSize ?? 10);
    const filters = request.filters ?? {};
    const filtered = this.applyProductSearchFilters(this.fallbackProducts, request.search, filters);
    const sorted = this.sortFallbackProducts(filtered, request.sort);
    const totalCount = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const items = sorted
      .slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
      .map((product) => this.cloneProduct(product));

    return {
      items,
      totalCount,
      totalPages,
      pageNumber,
      pageSize,
      appliedFilters: { ...filters },
      availableSorts: this.getFallbackProductSorts(),
      facets: {
        statuses: this.buildCountFacets(
          filtered,
          (product) => product.status,
          (status) => this.getProductStatusFacetLabels(status)
        ),
        brands: this.buildCountFacets(
          filtered.filter((product) => !!product.brandId),
          (product) => product.brandId!,
          (brandId) => {
            const brand = this.fallbackBrands.find((item) => item.id === brandId);
            return { ar: brand?.nameAr || brandId, en: brand?.nameEn || brandId };
          }
        ),
        categories: this.buildCountFacets(
          filtered,
          (product) => product.categoryId,
          (categoryId) => {
            const category = this.findFallbackCategoryById(categoryId);
            return { ar: category?.nameAr || categoryId, en: category?.nameEn || categoryId };
          }
        )
      }
    };
  }

  private buildFallbackCategorySearchResponse(request: CatalogSearchRequest<CategorySearchFilters>): CategorySearchResult {
    const pageNumber = Math.max(1, request.pagination?.pageNumber ?? 1);
    const pageSize = Math.max(1, request.pagination?.pageSize ?? 10);
    const filters = request.filters ?? {};
    const prepared = this.flattenCategories(this.getFallbackCategories(undefined, true));
    const filtered = prepared.filter((category) => {
      const matchesSearch = !request.search || [category.nameAr, category.nameEn].some((value) =>
        (value || '').toLowerCase().includes(request.search!.trim().toLowerCase())
      );
      const matchesParent = !filters.parentCategoryId || category.parentCategoryId === filters.parentCategoryId;
      const matchesLevel = filters.level == null || category.level === filters.level;
      const matchesActive = filters.isActive == null || category.isActive === filters.isActive;
      const hasChildren = !!category.subCategories?.length;
      const matchesChildren = filters.hasChildren == null || hasChildren === filters.hasChildren;
      const matchesCreatedFrom = !filters.createdAtFrom || this.isOnOrAfter(category.createdAtUtc, filters.createdAtFrom);
      const matchesCreatedTo = !filters.createdAtTo || this.isOnOrBefore(category.createdAtUtc, filters.createdAtTo);

      return matchesSearch && matchesParent && matchesLevel && matchesActive && matchesChildren && matchesCreatedFrom && matchesCreatedTo;
    });

    const sorted = this.sortFallbackCategories(filtered, request.sort);
    const totalCount = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      items: sorted.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map((category) => ({ ...category, subCategories: undefined })),
      totalCount,
      totalPages,
      pageNumber,
      pageSize,
      appliedFilters: { ...filters },
      availableSorts: [
        { field: 'displayOrder', direction: 'asc', label: 'Display order' },
        { field: 'createdAtUtc', direction: 'desc', label: 'Newest created' },
        { field: 'nameAr', direction: 'asc', label: 'Arabic name' },
        { field: 'nameEn', direction: 'asc', label: 'English name' }
      ],
      facets: {
        levels: this.buildCountFacets(
          filtered,
          (category) => String(category.level ?? 0),
          (level) => ({ ar: `المستوى ${level}`, en: `Level ${level}` })
        ),
        activeCount: filtered.filter((category) => category.isActive).length,
        inactiveCount: filtered.filter((category) => !category.isActive).length,
        withChildrenCount: filtered.filter((category) => !!category.subCategories?.length).length
      }
    };
  }

  private buildFallbackBrandSearchResponse(request: CatalogSearchRequest<BrandSearchFilters>): BrandSearchResult {
    const pageNumber = Math.max(1, request.pagination?.pageNumber ?? 1);
    const pageSize = Math.max(1, request.pagination?.pageSize ?? 10);
    const filters = request.filters ?? {};
    const filtered = this.fallbackBrands.filter((brand) => {
      const matchesSearch = !request.search || [brand.nameAr, brand.nameEn].some((value) =>
        (value || '').toLowerCase().includes(request.search!.trim().toLowerCase())
      );
      const matchesActive = filters.isActive == null || brand.isActive === filters.isActive;
      const hasProducts = (brand.masterProductsCount ?? 0) > 0;
      const matchesProducts = filters.hasProducts == null || hasProducts === filters.hasProducts;
      const matchesCreatedFrom = !filters.createdAtFrom || this.isOnOrAfter(brand.createdAtUtc, filters.createdAtFrom);
      const matchesCreatedTo = !filters.createdAtTo || this.isOnOrBefore(brand.createdAtUtc, filters.createdAtTo);

      return matchesSearch && matchesActive && matchesProducts && matchesCreatedFrom && matchesCreatedTo;
    });

    const sorted = this.sortFallbackBrands(filtered, request.sort);
    const totalCount = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      items: sorted.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map((brand) => ({ ...brand })),
      totalCount,
      totalPages,
      pageNumber,
      pageSize,
      appliedFilters: { ...filters },
      availableSorts: [
        { field: 'nameEn', direction: 'asc', label: 'English name' },
        { field: 'nameAr', direction: 'asc', label: 'Arabic name' },
        { field: 'createdAtUtc', direction: 'desc', label: 'Newest created' },
        { field: 'masterProductsCount', direction: 'desc', label: 'Most products' }
      ],
      facets: {
        activeCount: filtered.filter((brand) => brand.isActive).length,
        inactiveCount: filtered.filter((brand) => !brand.isActive).length,
        withProductsCount: filtered.filter((brand) => (brand.masterProductsCount ?? 0) > 0).length
      }
    };
  }

  private applyProductSearchFilters(
    products: CatalogProductRecord[],
    search: string | undefined,
    filters: ProductSearchFilters
  ): CatalogProductRecord[] {
    const normalizedSearch = search?.trim().toLowerCase() || '';

    return products.filter((product) => {
      const matchesSearch = !normalizedSearch || [
        product.id,
        product.nameAr,
        product.nameEn,
        product.barcode,
        product.slug,
        product.descriptionAr,
        product.descriptionEn
      ].some((value) => (value || '').toLowerCase().includes(normalizedSearch));

      const matchesSubcategory = !filters.subcategoryIds?.length || filters.subcategoryIds.includes(product.categoryId);
      const matchesBrand = !filters.brandIds?.length || (!!product.brandId && filters.brandIds.includes(product.brandId));
      const matchesStatus = !filters.statuses?.length || filters.statuses.includes(product.status);
      const matchesHasBrand = filters.hasBrand == null || (!!product.brandId === filters.hasBrand);

      const brand = product.brandId ? this.fallbackBrands.find((item) => item.id === product.brandId) : null;
      const matchesActiveBrand = filters.isActiveBrand == null || (!!brand && brand.isActive === filters.isActiveBrand);
      return matchesSearch
        && matchesSubcategory
        && matchesBrand
        && matchesStatus
        && matchesHasBrand
        && matchesActiveBrand;
    });
  }

  private sortFallbackProducts(products: CatalogProductRecord[], sort?: { field: string; direction: 'asc' | 'desc' }): CatalogProductRecord[] {
    const items = [...products];
    const field = sort?.field || 'updatedAtUtc';
    const direction = sort?.direction || 'desc';

    return items.sort((left, right) => {
      const leftValue = this.getProductSortValue(left, field);
      const rightValue = this.getProductSortValue(right, field);
      const result = leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
      return direction === 'desc' ? result * -1 : result;
    });
  }

  private sortFallbackCategories(categories: Category[], sort?: { field: string; direction: 'asc' | 'desc' }): Category[] {
    const items = [...categories];
    const field = sort?.field || 'displayOrder';
    const direction = sort?.direction || 'asc';

    return items.sort((left, right) => {
      const leftValue = this.getCategorySortValue(left, field);
      const rightValue = this.getCategorySortValue(right, field);
      const result = leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
      return direction === 'desc' ? result * -1 : result;
    });
  }

  private sortFallbackBrands(brands: Brand[], sort?: { field: string; direction: 'asc' | 'desc' }): Brand[] {
    const items = [...brands];
    const field = sort?.field || 'nameEn';
    const direction = sort?.direction || 'asc';

    return items.sort((left, right) => {
      const leftValue = this.getBrandSortValue(left, field);
      const rightValue = this.getBrandSortValue(right, field);
      const result = leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
      return direction === 'desc' ? result * -1 : result;
    });
  }

  private getProductSortValue(product: CatalogProductRecord, field: string): string | number {
    switch (field) {
      case 'createdAtUtc':
        return product.createdAtUtc || '';
      case 'nameAr':
        return product.nameAr || '';
      case 'nameEn':
        return product.nameEn || '';
      case 'status':
        return product.status || '';
      case 'updatedAtUtc':
      default:
        return product.updatedAtUtc || '';
    }
  }

  private getCategorySortValue(category: Category, field: string): string | number {
    switch (field) {
      case 'createdAtUtc':
        return category.createdAtUtc || '';
      case 'nameAr':
        return category.nameAr || '';
      case 'nameEn':
        return category.nameEn || '';
      case 'displayOrder':
      default:
        return category.displayOrder ?? 0;
    }
  }

  private getBrandSortValue(brand: Brand, field: string): string | number {
    switch (field) {
      case 'createdAtUtc':
        return brand.createdAtUtc || '';
      case 'nameAr':
        return brand.nameAr || '';
      case 'masterProductsCount':
        return brand.masterProductsCount ?? 0;
      case 'nameEn':
      default:
        return brand.nameEn || '';
    }
  }

  private buildCountFacets<T>(
    items: T[],
    keySelector: (item: T) => string,
    labelsSelector: (key: string) => { ar: string; en: string }
  ) {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      const key = keySelector(item);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return Array.from(counts.entries()).map(([key, count]) => {
      const labels = labelsSelector(key);
      return {
        key,
        labelAr: labels.ar,
        labelEn: labels.en,
        count
      };
    });
  }

  private isOnOrAfter(value: string | undefined, threshold: string): boolean {
    if (!value) {
      return false;
    }

    return new Date(value).getTime() >= new Date(threshold).getTime();
  }

  private isOnOrBefore(value: string | undefined, threshold: string): boolean {
    if (!value) {
      return false;
    }

    const thresholdDate = new Date(threshold);
    if (/^\d{4}-\d{2}-\d{2}$/.test(threshold)) {
      thresholdDate.setHours(23, 59, 59, 999);
    }

    return new Date(value).getTime() <= thresholdDate.getTime();
  }

  private getFallbackProductSorts() {
    return [
      { field: 'updatedAtUtc', direction: 'desc' as const, label: 'Newest updated' },
      { field: 'createdAtUtc', direction: 'desc' as const, label: 'Newest created' },
      { field: 'nameAr', direction: 'asc' as const, label: 'Arabic name' },
      { field: 'nameEn', direction: 'asc' as const, label: 'English name' },
      { field: 'status', direction: 'asc' as const, label: 'Status' }
    ];
  }

  private getProductStatusFacetLabels(status: string) {
    const labels: Record<string, { ar: string; en: string }> = {
      Active: { ar: 'نشط', en: 'Active' },
      Draft: { ar: 'مسودة', en: 'Draft' },
      Inactive: { ar: 'غير نشط', en: 'Inactive' },
      Discontinued: { ar: 'متوقف', en: 'Discontinued' }
    };

    return labels[status] ?? { ar: status, en: status };
  }

  private findFallbackProductById(id: string): CatalogProductRecord | null {
    const product = this.fallbackProducts.find((item) => item.id === id);
    return product ? this.cloneProduct(product) : null;
  }

  private findFallbackCategoryById(id: string): Category | null {
    return this.findCategoryById(this.getFallbackCategories(undefined, true), id);
  }

  private collectCategoryBranchIds(categoryId: string): Set<string> {
    const category = this.findFallbackCategoryById(categoryId);

    if (!category) {
      return new Set([categoryId]);
    }

    const ids = new Set<string>();
    const visit = (current: Category) => {
      ids.add(current.id);
      (current.subCategories ?? []).forEach(visit);
    };

    visit(category);

    return ids;
  }

  private decorateCategories(categories: Category[], parent: Category | null, level: number): Category[] {
    return categories.map((category, index) => {
      const decoratedBase: Category = {
        ...category,
        parentCategoryId: parent?.id ?? category.parentCategoryId ?? null,
        parentNameAr: parent?.nameAr ?? category.parentNameAr,
        parentNameEn: parent?.nameEn ?? category.parentNameEn,
        displayOrder: category.displayOrder ?? index + 1,
        level,
        isActive: category.isActive ?? true
      };

      const subCategories = this.decorateCategories(category.subCategories ?? [], decoratedBase, level + 1);
      const categoryIds = new Set<string>([decoratedBase.id, ...this.flattenCategories(subCategories).map((item) => item.id)]);
      const masterProductsCount = this.fallbackProducts.filter((product) => categoryIds.has(product.categoryId)).length;

      return {
        ...decoratedBase,
        masterProductsCount,
        subCategories
      };
    });
  }

  private filterInactiveCategories(categories: Category[]): Category[] {
    return categories
      .filter((category) => category.isActive)
      .map((category) => ({
        ...category,
        subCategories: this.filterInactiveCategories(category.subCategories ?? [])
      }));
  }

  private normalizeCategory(category: Category, index: number, parent: Category | null, level: number): Category {
    const createdAtUtc = category.createdAtUtc || new Date(Date.UTC(2025, 0, index + 1)).toISOString();
    const updatedAtUtc = category.updatedAtUtc || createdAtUtc;

    const base: Category = {
      ...category,
      id: category.id || `CAT-${level}-${index + 1}`,
      nameAr: category.nameAr || category.nameEn || `تصنيف ${index + 1}`,
      nameEn: category.nameEn || category.nameAr || `Category ${index + 1}`,
      displayOrder: category.displayOrder ?? index + 1,
      parentCategoryId: category.parentCategoryId ?? parent?.id ?? null,
      parentNameAr: category.parentNameAr ?? parent?.nameAr,
      parentNameEn: category.parentNameEn ?? parent?.nameEn,
      isActive: category.isActive ?? true,
      level,
      createdAtUtc,
      updatedAtUtc
    };

    const subCategories = (category.subCategories ?? []).map((item, childIndex) =>
      this.normalizeCategory(item, childIndex, base, level + 1)
    );

    return {
      ...base,
      subCategories
    };
  }

  private normalizeProduct(product: CatalogProductRecord): CatalogProductRecord {
    const raw = product as CatalogProductRecord & Record<string, unknown>;
    const stringValue = (...keys: string[]): string | undefined => {
      for (const key of keys) {
        const value = raw[key];
        if (typeof value === 'string' && value.trim().length > 0) {
          return value.trim();
        }
      }

      return undefined;
    };
    const createdAtUtc = product.createdAtUtc || this.buildFallbackTimestampFromSeed(product.id || product.nameEn || product.nameAr || 'product', 0);
    const updatedAtUtc = product.updatedAtUtc || this.buildFallbackTimestampFromSeed(product.id || product.nameEn || product.nameAr || 'product', 21);

    return {
      ...product,
      id: product.id || `PRD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      nameAr: product.nameAr || product.nameEn || 'منتج',
      nameEn: product.nameEn || product.nameAr || 'Product',
      descriptionAr: product.descriptionAr || '',
      descriptionEn: product.descriptionEn || '',
      categoryId: stringValue('categoryId', 'CategoryId', 'category_id') || product.categoryId,
      brandId: stringValue('brandId', 'BrandId', 'brand_id'),
      brandNameAr: stringValue('brandNameAr', 'BrandNameAr', 'brand_name_ar'),
      brandNameEn: stringValue('brandNameEn', 'BrandNameEn', 'brand_name_en'),
      unitOfMeasureId: stringValue('unitOfMeasureId', 'UnitOfMeasureId', 'unitId', 'UnitId') || undefined,
      unitNameAr: stringValue('unitNameAr', 'UnitNameAr', 'unit_name_ar'),
      unitNameEn: stringValue('unitNameEn', 'UnitNameEn', 'unit_name_en'),
      status: product.status || 'Draft',
      slug: product.slug || this.buildSlug(product.nameEn || product.nameAr || product.id || 'product'),
      images: this.normalizeImages(product),
      createdAtUtc,
      updatedAtUtc
    };
  }

  private normalizeImages(product: CatalogProductRecord): MasterProductImage[] {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map((image, index) => ({
        masterProductId: image.masterProductId || product.id,
        imageBankId: image.imageBankId || `${product.id}-image-${index + 1}`,
        displayOrder: image.displayOrder ?? index + 1,
        isPrimary: image.isPrimary ?? index === 0,
        url: image.url || this.buildPlaceholderAsset(product.nameEn || product.nameAr || 'Product', 'e2f3f5')
      }));
    }

    return [{
      masterProductId: product.id,
      imageBankId: `${product.id}-image-1`,
      displayOrder: 1,
      isPrimary: true,
      url: this.buildPlaceholderAsset(product.nameEn || product.nameAr || 'Product', 'e2f3f5')
    }];
  }

  private normalizeBrand(brand: Brand, index: number): Brand {
    const raw = brand as Brand & Record<string, unknown>;
    const stringValue = (...keys: string[]): string | undefined => {
      for (const key of keys) {
        const value = raw[key];
        if (typeof value === 'string' && value.trim().length > 0) {
          return value.trim();
        }
      }

      return undefined;
    };
    const nullableStringValue = (...keys: string[]): string | null => stringValue(...keys) ?? null;
    const booleanValue = (...keys: string[]): boolean | undefined => {
      for (const key of keys) {
        const value = raw[key];
        if (typeof value === 'boolean') {
          return value;
        }

        if (typeof value === 'string') {
          const normalized = value.trim().toLowerCase();
          if (normalized === 'true') {
            return true;
          }

          if (normalized === 'false') {
            return false;
          }
        }
      }

      return undefined;
    };
    const numberValue = (...keys: string[]): number | undefined => {
      for (const key of keys) {
        const value = raw[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
          return value;
        }

        if (typeof value === 'string' && value.trim().length > 0) {
          const parsed = Number(value);
          if (Number.isFinite(parsed)) {
            return parsed;
          }
        }
      }

      return undefined;
    };

    const id = stringValue('id', 'Id') || `BRD-${index + 1}`;
    const nameAr = stringValue('nameAr', 'name_ar', 'NameAr', 'arabicName', 'arabic_name', 'ArabicName', 'name', 'Name')
      || stringValue('nameEn', 'name_en', 'NameEn', 'englishName', 'english_name', 'EnglishName')
      || `علامة ${index + 1}`;
    const nameEn = stringValue('nameEn', 'name_en', 'NameEn', 'englishName', 'english_name', 'EnglishName')
      || stringValue('nameAr', 'name_ar', 'NameAr', 'arabicName', 'arabic_name', 'ArabicName', 'name', 'Name')
      || `Brand ${index + 1}`;
    const relatedProductsCount = (this.fallbackProducts ?? []).filter((product) => product.brandId === id).length;
    const createdAtUtc = stringValue('createdAtUtc', 'created_at_utc', 'CreatedAtUtc', 'createdAt', 'created_at', 'CreatedAt')
      || new Date(Date.UTC(2025, 1, index + 1)).toISOString();
    const updatedAtUtc = stringValue('updatedAtUtc', 'updated_at_utc', 'UpdatedAtUtc', 'updatedAt', 'updated_at', 'UpdatedAt')
      || createdAtUtc;
    const normalizedCategoryId = nullableStringValue('categoryId', 'category_id', 'CategoryId')
      || (this.fallbackProducts ?? []).find((product) => product.brandId === id)?.categoryId
      || null;
    const rawCategoryIds = this.extractStringArray(
      raw['categoryIds']
      ?? raw['CategoryIds']
      ?? raw['category_ids']
    );
    const normalizedCategoryIds = rawCategoryIds.length ? rawCategoryIds : (normalizedCategoryId ? [normalizedCategoryId] : []);
    const normalizedCategories = this.normalizeBrandCategories(
      raw['categories'] ?? raw['Categories'],
      normalizedCategoryIds
    );
    const normalizedCategory = normalizedCategoryId ? this.findFallbackCategoryById(normalizedCategoryId) : null;
    const logoUrl = stringValue('logoUrl', 'logo_url', 'LogoUrl', 'logo', 'Logo')
      || this.buildPlaceholderAsset(nameEn || nameAr || 'Brand', 'f3f4f6');
    const coverImageUrl = stringValue('coverImageUrl', 'cover_image_url', 'CoverImageUrl', 'coverImage', 'cover_image', 'CoverImage');

    return {
      ...brand,
      id,
      nameAr,
      nameEn,
      categoryId: normalizedCategoryId,
      categoryIds: normalizedCategoryIds,
      categories: normalizedCategories,
      categoryNameAr: stringValue('categoryNameAr', 'category_name_ar', 'CategoryNameAr') || normalizedCategory?.nameAr,
      categoryNameEn: stringValue('categoryNameEn', 'category_name_en', 'CategoryNameEn') || normalizedCategory?.nameEn,
      isActive: booleanValue('isActive', 'is_active', 'IsActive') ?? true,
      masterProductsCount: numberValue('masterProductsCount', 'master_products_count', 'MasterProductsCount', 'productCount', 'product_count', 'ProductCount') ?? relatedProductsCount,
      logoUrl,
      coverImageUrl: coverImageUrl || undefined,
      createdAtUtc,
      updatedAtUtc
    };
  }

  private normalizeLegacyBrand(brand: Brand, index: number): Brand {
    const relatedProductsCount = (this.fallbackProducts ?? []).filter((product) => product.brandId === brand.id).length;
    const createdAtUtc = brand.createdAtUtc || new Date(Date.UTC(2025, 1, index + 1)).toISOString();
    const updatedAtUtc = brand.updatedAtUtc || createdAtUtc;
    const normalizedCategoryId = brand.categoryId
      || (this.fallbackProducts ?? []).find((product) => product.brandId === brand.id)?.categoryId
      || null;
    const normalizedCategory = normalizedCategoryId ? this.findFallbackCategoryById(normalizedCategoryId) : null;
    const normalizedCategoryIds = brand.categoryIds?.length ? brand.categoryIds : (normalizedCategoryId ? [normalizedCategoryId] : []);

    return {
      ...brand,
      id: brand.id || `BRD-${index + 1}`,
      nameAr: brand.nameAr || brand.nameEn || `علامة ${index + 1}`,
      nameEn: brand.nameEn || brand.nameAr || `Brand ${index + 1}`,
      categoryId: normalizedCategoryId,
      categoryIds: normalizedCategoryIds,
      categories: brand.categories?.length ? brand.categories : this.normalizeBrandCategories(null, normalizedCategoryIds),
      categoryNameAr: brand.categoryNameAr || normalizedCategory?.nameAr,
      categoryNameEn: brand.categoryNameEn || normalizedCategory?.nameEn,
      isActive: brand.isActive ?? true,
      masterProductsCount: brand.masterProductsCount ?? relatedProductsCount,
      logoUrl: brand.logoUrl || this.buildPlaceholderAsset(brand.nameEn || brand.nameAr || 'Brand', 'f3f4f6'),
      coverImageUrl: brand.coverImageUrl || undefined,
      createdAtUtc,
      updatedAtUtc
    };
  }

  private normalizeBrandCategories(value: unknown, fallbackCategoryIds: string[]): Brand['categories'] {
    const rawCategories = this.extractArray<Record<string, unknown>>(value)
      .map((category) => ({
        categoryId: String(category['categoryId'] ?? category['CategoryId'] ?? category['category_id'] ?? '').trim(),
        categoryNameAr: (category['categoryNameAr'] ?? category['CategoryNameAr'] ?? category['category_name_ar']) as string | null | undefined,
        categoryNameEn: (category['categoryNameEn'] ?? category['CategoryNameEn'] ?? category['category_name_en']) as string | null | undefined
      }))
      .filter((category) => !!category.categoryId);

    if (rawCategories.length) {
      return rawCategories;
    }

    return fallbackCategoryIds.map((categoryId) => {
      const category = this.findFallbackCategoryById(categoryId);
      return {
        categoryId,
        categoryNameAr: category?.nameAr,
        categoryNameEn: category?.nameEn
      };
    });
  }

  private extractStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => typeof item === 'string' ? item : String(item ?? ''))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private cloneCategories(categories: Category[]): Category[] {
    return categories.map((category) => ({
      ...category,
      subCategories: this.cloneCategories(category.subCategories ?? [])
    }));
  }

  private cloneProduct(product: CatalogProductRecord): CatalogProductRecord {
    return {
      ...product,
      images: this.normalizeImages(product).map((image) => ({ ...image }))
    };
  }

  private flattenCategories(categories: Category[]): Category[] {
    return categories.flatMap((category) => [
      category,
      ...this.flattenCategories(category.subCategories ?? [])
    ]);
  }

  private findCategoryById(categories: Category[], categoryId: string): Category | null {
    for (const category of categories) {
      if (category.id === categoryId) {
        return category;
      }

      if (category.subCategories?.length) {
        const nested = this.findCategoryById(category.subCategories, categoryId);
        if (nested) {
          return nested;
        }
      }
    }

    return null;
  }

  private findFallbackBrandById(brandId: string): Brand | null {
    return this.fallbackBrands.find((brand) => brand.id === brandId) ?? null;
  }

  private getDirectChildren(categories: Category[], parentId: string): Category[] {
    for (const category of categories) {
      if (category.id === parentId) {
        return category.subCategories ?? [];
      }

      if (category.subCategories?.length) {
        const nested = this.getDirectChildren(category.subCategories, parentId);
        if (nested.length > 0) {
          return nested;
        }
      }
    }

    return [];
  }

  private buildSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\u0600-\u06FFa-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  private buildFallbackTimestampFromSeed(seed: string, dayOffset: number): string {
    const hash = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);
    const day = (hash % 24) + 1 + dayOffset;
    return new Date(Date.UTC(2025, 0, day)).toISOString();
  }

  private buildPlaceholderAsset(label: string, background: string): string {
    const safeLabel = encodeURIComponent(label);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320'%3E%3Crect width='480' height='320' rx='32' fill='%23${background}'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='26' fill='%230f172a' text-anchor='middle' dominant-baseline='middle'%3E${safeLabel}%3C/text%3E%3C/svg%3E`;
  }

  private buildMockCategories(): Category[] {
    return [];
  }

  private buildMockBrands(): Brand[] {
    return [];
  }

  private buildMockUnits(): CatalogUnit[] {
    return [];
  }

  private buildMockProducts(): CatalogProductRecord[] {
    return [];
  }
}
