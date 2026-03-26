import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Brand,
  Category,
  MasterProduct,
  MasterProductImage
} from '../models/catalog.model';
import { AuthService } from './auth.service';

interface CatalogUnit {
  id: string;
  nameAr: string;
  nameEn: string;
  isActive?: boolean;
}

interface CatalogProductRecord extends MasterProduct {
  slug?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private readonly apiUrl = `${environment.apiUrl}/admin/catalog`;
  private readonly filesUrl = `${environment.apiUrl}/files`;

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

  getCategories(parentId?: string, includeInactive: boolean = false): Observable<Category[]> {
    const fallback = this.getFallbackCategories(parentId, includeInactive);

    if (!this.authService.isAuthenticated) {
      return of(fallback);
    }

    const params = new HttpParams().set('includeInactive', includeInactive.toString());

    return this.http.get<unknown>(`${this.apiUrl}/categories`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map((response) => this.normalizeCategoriesResponse(response, parentId, includeInactive, fallback)),
      catchError((error) => {
        console.warn('Catalog categories API failed, using local fallback data.', error);
        return of(fallback);
      })
    );
  }

  createCategory(payload: any): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, payload, { headers: this.getHeaders() });
  }

  updateCategory(id: string, payload: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/categories/${id}`, payload, { headers: this.getHeaders() });
  }

  getCategoryById(id: string): Observable<Category> {
    const fallback = this.findFallbackCategoryById(id) ?? this.getFallbackCategories(undefined, true)[0];

    if (!this.authService.isAuthenticated) {
      return of(fallback);
    }

    return this.http.get<unknown>(`${this.apiUrl}/categories/${id}`, { headers: this.getHeaders() }).pipe(
      map((response) => this.normalizeSingleCategory(response) ?? fallback),
      catchError((error) => {
        console.warn(`Catalog category ${id} API failed, using local fallback data.`, error);
        return of(fallback);
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
    brandId?: string
  ): Observable<any> {
    const fallback = this.buildFallbackPaginatedProducts(page, pageSize, searchTerm, categoryId, brandId);

    if (!this.authService.isAuthenticated) {
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

    return this.http.get<unknown>(`${this.apiUrl}/products`, { headers: this.getHeaders(), params }).pipe(
      map((response) => this.normalizeProductsResponse(response, page, pageSize, searchTerm, categoryId, brandId)),
      catchError((error) => {
        console.warn('Catalog products API failed, using local fallback data.', error);
        return of(fallback);
      })
    );
  }

  createProduct(payload: any): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/products`, payload, { headers: this.getHeaders() });
  }

  getProductById(id: string): Observable<any> {
    const fallback = this.findFallbackProductById(id) ?? this.cloneProduct(this.fallbackProducts[0]);

    if (!this.authService.isAuthenticated) {
      return of(fallback);
    }

    return this.http.get<unknown>(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() }).pipe(
      map((response) => this.normalizeSingleProduct(response) ?? fallback),
      catchError((error) => {
        console.warn(`Catalog product ${id} API failed, using local fallback data.`, error);
        return of(fallback);
      })
    );
  }

  updateProduct(id: string, payload: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/products/${id}`, payload, { headers: this.getHeaders() });
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  getBrands(includeInactive: boolean = false): Observable<Brand[]> {
    const fallback = this.getFallbackBrands(includeInactive);

    if (!this.authService.isAuthenticated) {
      return of(fallback);
    }

    const params = new HttpParams().set('includeInactive', includeInactive.toString());

    return this.http.get<unknown>(`${this.apiUrl}/brands`, { headers: this.getHeaders(), params }).pipe(
      map((response) => this.normalizeBrandsResponse(response, includeInactive, fallback)),
      catchError((error) => {
        console.warn('Catalog brands API failed, using local fallback data.', error);
        return of(fallback);
      })
    );
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

  getUnits(): Observable<CatalogUnit[]> {
    const fallback = this.fallbackUnits.map((unit) => ({ ...unit }));

    if (!this.authService.isAuthenticated) {
      return of(fallback);
    }

    return this.http.get<unknown>(`${this.apiUrl}/units`, { headers: this.getHeaders() }).pipe(
      map((response) => this.normalizeUnitsResponse(response, fallback)),
      catchError((error) => {
        console.warn('Catalog units API failed, using local fallback data.', error);
        return of(fallback);
      })
    );
  }

  uploadFile(file: File, directory: string = 'catalog'): Observable<{ url: string }> {
    const localPreview = { url: this.createObjectUrl(file) };

    if (!this.authService.isAuthenticated) {
      return of(localPreview);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', directory);

    return this.http.post<{ url?: string; Url?: string }>(`${this.filesUrl}/upload`, formData, {
      headers: this.getHeaders()
    }).pipe(
      map((response) => ({ url: response.url ?? response.Url ?? localPreview.url })),
      catchError((error) => {
        console.warn('Catalog file upload API failed, using local preview URL.', error);
        return of(localPreview);
      })
    );
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
    brandId?: string
  ): any {
    const items = this.extractArray<CatalogProductRecord>(response).map((product) => this.normalizeProduct(product));

    if (items.length === 0) {
      return this.buildFallbackPaginatedProducts(page, pageSize, searchTerm, categoryId, brandId);
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
    brandId?: string
  ): any {
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

      return searchMatch && categoryMatch && brandMatch;
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
      level
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
    return {
      ...product,
      id: product.id || `PRD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      nameAr: product.nameAr || product.nameEn || 'منتج',
      nameEn: product.nameEn || product.nameAr || 'Product',
      descriptionAr: product.descriptionAr || '',
      descriptionEn: product.descriptionEn || '',
      categoryId: product.categoryId,
      brandId: product.brandId,
      unitOfMeasureId: product.unitOfMeasureId || (product as any).unitId,
      status: product.status || 'Draft',
      slug: product.slug || this.buildSlug(product.nameEn || product.nameAr || product.id || 'product'),
      images: this.normalizeImages(product)
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
    const relatedProductsCount = (this.fallbackProducts ?? []).filter((product) => product.brandId === brand.id).length;

    return {
      ...brand,
      id: brand.id || `BRD-${index + 1}`,
      nameAr: brand.nameAr || brand.nameEn || `علامة ${index + 1}`,
      nameEn: brand.nameEn || brand.nameAr || `Brand ${index + 1}`,
      isActive: brand.isActive ?? true,
      masterProductsCount: brand.masterProductsCount ?? relatedProductsCount,
      logoUrl: brand.logoUrl || this.buildPlaceholderAsset(brand.nameEn || brand.nameAr || 'Brand', 'f3f4f6')
    };
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

  private createObjectUrl(file: File): string {
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      return URL.createObjectURL(file);
    }

    return this.buildPlaceholderAsset(file.name || 'Upload', 'e2e8f0');
  }

  private buildSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\u0600-\u06FFa-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  private buildPlaceholderAsset(label: string, background: string): string {
    const safeLabel = encodeURIComponent(label);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320'%3E%3Crect width='480' height='320' rx='32' fill='%23${background}'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='26' fill='%230f172a' text-anchor='middle' dominant-baseline='middle'%3E${safeLabel}%3C/text%3E%3C/svg%3E`;
  }

  private buildMockCategories(): Category[] {
    return [
      {
        id: 'CAT-GROCERY',
        nameAr: 'البقالة',
        nameEn: 'Grocery',
        imageUrl: this.buildPlaceholderAsset('Grocery', 'dff6f8'),
        displayOrder: 1,
        isActive: true,
        subCategories: [
          {
            id: 'CAT-BEVERAGES',
            nameAr: 'المشروبات',
            nameEn: 'Beverages',
            imageUrl: this.buildPlaceholderAsset('Beverages', 'e8f7da'),
            parentCategoryId: 'CAT-GROCERY',
            displayOrder: 1,
            isActive: true,
            subCategories: [
              {
                id: 'CAT-HOT-DRINKS',
                nameAr: 'المشروبات الساخنة',
                nameEn: 'Hot Drinks',
                parentCategoryId: 'CAT-BEVERAGES',
                displayOrder: 1,
                isActive: true,
                subCategories: [
                  {
                    id: 'CAT-ARABIC-COFFEE',
                    nameAr: 'القهوة العربية',
                    nameEn: 'Arabic Coffee',
                    parentCategoryId: 'CAT-HOT-DRINKS',
                    displayOrder: 1,
                    isActive: true
                  },
                  {
                    id: 'CAT-BLACK-TEA',
                    nameAr: 'الشاي الأسود',
                    nameEn: 'Black Tea',
                    parentCategoryId: 'CAT-HOT-DRINKS',
                    displayOrder: 2,
                    isActive: true
                  }
                ]
              },
              {
                id: 'CAT-COLD-DRINKS',
                nameAr: 'المشروبات الباردة',
                nameEn: 'Cold Drinks',
                parentCategoryId: 'CAT-BEVERAGES',
                displayOrder: 2,
                isActive: true,
                subCategories: [
                  {
                    id: 'CAT-JUICES',
                    nameAr: 'العصائر',
                    nameEn: 'Juices',
                    parentCategoryId: 'CAT-COLD-DRINKS',
                    displayOrder: 1,
                    isActive: true
                  },
                  {
                    id: 'CAT-SPARKLING-WATER',
                    nameAr: 'المياه الغازية',
                    nameEn: 'Sparkling Water',
                    parentCategoryId: 'CAT-COLD-DRINKS',
                    displayOrder: 2,
                    isActive: true
                  }
                ]
              }
            ]
          },
          {
            id: 'CAT-PANTRY',
            nameAr: 'المؤن الأساسية',
            nameEn: 'Pantry Staples',
            imageUrl: this.buildPlaceholderAsset('Pantry', 'fff3d6'),
            parentCategoryId: 'CAT-GROCERY',
            displayOrder: 2,
            isActive: true,
            subCategories: [
              {
                id: 'CAT-GRAINS',
                nameAr: 'الحبوب',
                nameEn: 'Grains',
                parentCategoryId: 'CAT-PANTRY',
                displayOrder: 1,
                isActive: true,
                subCategories: [
                  {
                    id: 'CAT-BASMATI-RICE',
                    nameAr: 'أرز بسمتي',
                    nameEn: 'Basmati Rice',
                    parentCategoryId: 'CAT-GRAINS',
                    displayOrder: 1,
                    isActive: true
                  },
                  {
                    id: 'CAT-PASTA',
                    nameAr: 'المعكرونة',
                    nameEn: 'Pasta',
                    parentCategoryId: 'CAT-GRAINS',
                    displayOrder: 2,
                    isActive: true
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'CAT-FRESH',
        nameAr: 'الأغذية الطازجة',
        nameEn: 'Fresh Food',
        imageUrl: this.buildPlaceholderAsset('Fresh Food', 'fee2e2'),
        displayOrder: 2,
        isActive: true,
        subCategories: [
          {
            id: 'CAT-DAIRY-EGGS',
            nameAr: 'الألبان والبيض',
            nameEn: 'Dairy and Eggs',
            parentCategoryId: 'CAT-FRESH',
            displayOrder: 1,
            isActive: true,
            subCategories: [
              {
                id: 'CAT-DAIRY',
                nameAr: 'الألبان',
                nameEn: 'Dairy',
                parentCategoryId: 'CAT-DAIRY-EGGS',
                displayOrder: 1,
                isActive: true,
                subCategories: [
                  {
                    id: 'CAT-YOGURT',
                    nameAr: 'الزبادي',
                    nameEn: 'Yogurt',
                    parentCategoryId: 'CAT-DAIRY',
                    displayOrder: 1,
                    isActive: true
                  },
                  {
                    id: 'CAT-LABNEH',
                    nameAr: 'اللبنة',
                    nameEn: 'Labneh',
                    parentCategoryId: 'CAT-DAIRY',
                    displayOrder: 2,
                    isActive: true
                  }
                ]
              }
            ]
          },
          {
            id: 'CAT-PRODUCE',
            nameAr: 'الخضار والفواكه',
            nameEn: 'Produce',
            parentCategoryId: 'CAT-FRESH',
            displayOrder: 2,
            isActive: true,
            subCategories: [
              {
                id: 'CAT-FRUITS',
                nameAr: 'الفواكه الطازجة',
                nameEn: 'Fresh Fruits',
                parentCategoryId: 'CAT-PRODUCE',
                displayOrder: 1,
                isActive: true,
                subCategories: [
                  {
                    id: 'CAT-BANANAS',
                    nameAr: 'الموز',
                    nameEn: 'Bananas',
                    parentCategoryId: 'CAT-FRUITS',
                    displayOrder: 1,
                    isActive: true
                  },
                  {
                    id: 'CAT-CITRUS',
                    nameAr: 'الحمضيات',
                    nameEn: 'Citrus',
                    parentCategoryId: 'CAT-FRUITS',
                    displayOrder: 2,
                    isActive: false
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  private buildMockBrands(): Brand[] {
    return [
      {
        id: 'BRD-ALMARAI',
        nameAr: 'المراعي',
        nameEn: 'Almarai',
        logoUrl: this.buildPlaceholderAsset('Almarai', 'dbeafe'),
        isActive: true,
        createdAtUtc: '2025-08-01T09:00:00Z'
      },
      {
        id: 'BRD-NADEC',
        nameAr: 'نادك',
        nameEn: 'NADEC',
        logoUrl: this.buildPlaceholderAsset('NADEC', 'd1fae5'),
        isActive: true,
        createdAtUtc: '2025-08-04T09:00:00Z'
      },
      {
        id: 'BRD-NESTLE',
        nameAr: 'نستله',
        nameEn: 'Nestle',
        logoUrl: this.buildPlaceholderAsset('Nestle', 'fef3c7'),
        isActive: true,
        createdAtUtc: '2025-08-08T09:00:00Z'
      },
      {
        id: 'BRD-AMERICANA',
        nameAr: 'أمريكانا',
        nameEn: 'Americana',
        logoUrl: this.buildPlaceholderAsset('Americana', 'fee2e2'),
        isActive: true,
        createdAtUtc: '2025-08-11T09:00:00Z'
      },
      {
        id: 'BRD-PRIVATE',
        nameAr: 'منتجات مختارة',
        nameEn: 'Selected Goods',
        logoUrl: this.buildPlaceholderAsset('Selected Goods', 'ede9fe'),
        isActive: false,
        createdAtUtc: '2025-08-15T09:00:00Z'
      }
    ].map((brand, index) => this.normalizeBrand(brand, index));
  }

  private buildMockUnits(): CatalogUnit[] {
    return [
      { id: 'UNIT-PC', nameAr: 'قطعة', nameEn: 'Piece', isActive: true },
      { id: 'UNIT-BTL', nameAr: 'زجاجة', nameEn: 'Bottle', isActive: true },
      { id: 'UNIT-PCK', nameAr: 'عبوة', nameEn: 'Pack', isActive: true },
      { id: 'UNIT-KG', nameAr: 'كيلوجرام', nameEn: 'Kilogram', isActive: true },
      { id: 'UNIT-CUP', nameAr: 'كوب', nameEn: 'Cup', isActive: true }
    ];
  }

  private buildMockProducts(): CatalogProductRecord[] {
    const products: CatalogProductRecord[] = [
      {
        id: 'PRD-24001',
        nameAr: 'قهوة عربية فاخرة',
        nameEn: 'Premium Arabic Coffee',
        slug: 'premium-arabic-coffee',
        descriptionAr: 'خلطة محمصة مخصصة للتقديم السريع مع ثبات في الجودة.',
        descriptionEn: 'Signature roasted blend prepared for quick-commerce operations.',
        barcode: '628100000001',
        categoryId: 'CAT-ARABIC-COFFEE',
        brandId: 'BRD-PRIVATE',
        unitOfMeasureId: 'UNIT-PCK',
        status: 'Active',
        images: [{
          masterProductId: 'PRD-24001',
          imageBankId: 'PRD-24001-1',
          displayOrder: 1,
          isPrimary: true,
          url: this.buildPlaceholderAsset('Arabic Coffee', 'f5efe0')
        }]
      },
      {
        id: 'PRD-24002',
        nameAr: 'شاي أسود سيلاني',
        nameEn: 'Ceylon Black Tea',
        slug: 'ceylon-black-tea',
        descriptionAr: 'أكياس شاي مناسبة للطلبات المتكررة والبيع عالي الدوران.',
        descriptionEn: 'High-turnover tea bags suitable for routine replenishment.',
        barcode: '628100000002',
        categoryId: 'CAT-BLACK-TEA',
        brandId: 'BRD-NESTLE',
        unitOfMeasureId: 'UNIT-PCK',
        status: 'Active',
        images: [{
          masterProductId: 'PRD-24002',
          imageBankId: 'PRD-24002-1',
          displayOrder: 1,
          isPrimary: true,
          url: this.buildPlaceholderAsset('Black Tea', 'fef3c7')
        }]
      },
      {
        id: 'PRD-24003',
        nameAr: 'عصير برتقال 1 لتر',
        nameEn: 'Orange Juice 1L',
        slug: 'orange-juice-1l',
        descriptionAr: 'منتج أساسي في فئة العصائر مع معدل طلب يومي مرتفع.',
        descriptionEn: 'Core SKU in the juice segment with strong daily demand.',
        barcode: '628100000003',
        categoryId: 'CAT-JUICES',
        brandId: 'BRD-ALMARAI',
        unitOfMeasureId: 'UNIT-BTL',
        status: 'Active',
        images: [{
          masterProductId: 'PRD-24003',
          imageBankId: 'PRD-24003-1',
          displayOrder: 1,
          isPrimary: true,
          url: this.buildPlaceholderAsset('Orange Juice', 'fed7aa')
        }]
      },
      {
        id: 'PRD-24004',
        nameAr: 'مياه غازية ليمون',
        nameEn: 'Lemon Sparkling Water',
        slug: 'lemon-sparkling-water',
        descriptionAr: 'صنف موسمي مناسب للعروض والباقات السريعة.',
        descriptionEn: 'Seasonal sparkling SKU built for bundles and promotions.',
        barcode: '628100000004',
        categoryId: 'CAT-SPARKLING-WATER',
        brandId: 'BRD-AMERICANA',
        unitOfMeasureId: 'UNIT-BTL',
        status: 'Draft',
        images: [{
          masterProductId: 'PRD-24004',
          imageBankId: 'PRD-24004-1',
          displayOrder: 1,
          isPrimary: true,
          url: this.buildPlaceholderAsset('Sparkling Water', 'dbeafe')
        }]
      },
      {
        id: 'PRD-24005',
        nameAr: 'أرز بسمتي 5 كجم',
        nameEn: 'Basmati Rice 5kg',
        slug: 'basmati-rice-5kg',
        descriptionAr: 'حجم عائلي ضمن أكثر الأصناف استقرارًا في الطلب.',
        descriptionEn: 'Family-size staple with consistent recurring demand.',
        barcode: '628100000005',
        categoryId: 'CAT-BASMATI-RICE',
        brandId: 'BRD-PRIVATE',
        unitOfMeasureId: 'UNIT-KG',
        status: 'Active',
        images: [{
          masterProductId: 'PRD-24005',
          imageBankId: 'PRD-24005-1',
          displayOrder: 1,
          isPrimary: true,
          url: this.buildPlaceholderAsset('Basmati Rice', 'fef9c3')
        }]
      },
      {
        id: 'PRD-24006',
        nameAr: 'مكرونة بيني',
        nameEn: 'Penne Pasta',
        slug: 'penne-pasta',
        descriptionAr: 'عبوة تجارية مناسبة للطلبات المنزلية المتكررة.',
        descriptionEn: 'Retail-ready pasta pack for frequent household orders.',
        barcode: '628100000006',
        categoryId: 'CAT-PASTA',
        brandId: 'BRD-AMERICANA',
        unitOfMeasureId: 'UNIT-PCK',
        status: 'Active',
        images: [{
          masterProductId: 'PRD-24006',
          imageBankId: 'PRD-24006-1',
          displayOrder: 1,
          isPrimary: true,
          url: this.buildPlaceholderAsset('Pasta', 'fde68a')
        }]
      },
      {
        id: 'PRD-24007',
        nameAr: 'زبادي طبيعي',
        nameEn: 'Plain Yogurt',
        slug: 'plain-yogurt',
        descriptionAr: 'صنف سريع الدوران مع تغطية واسعة في المتاجر.',
        descriptionEn: 'Fast-moving dairy product with broad availability.',
        barcode: '628100000007',
        categoryId: 'CAT-YOGURT',
        brandId: 'BRD-ALMARAI',
        unitOfMeasureId: 'UNIT-CUP',
        status: 'Active',
        images: [{
          masterProductId: 'PRD-24007',
          imageBankId: 'PRD-24007-1',
          displayOrder: 1,
          isPrimary: true,
          url: this.buildPlaceholderAsset('Yogurt', 'd1fae5')
        }]
      },
      {
        id: 'PRD-24008',
        nameAr: 'لبنة كاملة الدسم',
        nameEn: 'Full Fat Labneh',
        slug: 'full-fat-labneh',
        descriptionAr: 'منتج بارد يحتاج التزام سلسلة تبريد وتشغيل منضبط.',
        descriptionEn: 'Chilled dairy SKU that depends on strict cold-chain handling.',
        barcode: '628100000008',
        categoryId: 'CAT-LABNEH',
        brandId: 'BRD-NADEC',
        unitOfMeasureId: 'UNIT-PCK',
        status: 'Inactive',
        images: [{
          masterProductId: 'PRD-24008',
          imageBankId: 'PRD-24008-1',
          displayOrder: 1,
          isPrimary: true,
          url: this.buildPlaceholderAsset('Labneh', 'e0f2fe')
        }]
      },
      {
        id: 'PRD-24009',
        nameAr: 'موز طازج',
        nameEn: 'Fresh Bananas',
        slug: 'fresh-bananas',
        descriptionAr: 'فاكهة يومية أساسية مع معدل ارتجاع منخفض.',
        descriptionEn: 'Daily fresh fruit SKU with low return rates.',
        barcode: '628100000009',
        categoryId: 'CAT-BANANAS',
        brandId: 'BRD-PRIVATE',
        unitOfMeasureId: 'UNIT-KG',
        status: 'Active',
        images: [{
          masterProductId: 'PRD-24009',
          imageBankId: 'PRD-24009-1',
          displayOrder: 1,
          isPrimary: true,
          url: this.buildPlaceholderAsset('Bananas', 'fef08a')
        }]
      },
      {
        id: 'PRD-24010',
        nameAr: 'برتقال فالنسيا',
        nameEn: 'Valencia Oranges',
        slug: 'valencia-oranges',
        descriptionAr: 'منتج موسمي متوقف مؤقتًا لحين توافر التوريد.',
        descriptionEn: 'Seasonal fresh item currently paused pending supply recovery.',
        barcode: '628100000010',
        categoryId: 'CAT-CITRUS',
        brandId: 'BRD-PRIVATE',
        unitOfMeasureId: 'UNIT-KG',
        status: 'Discontinued',
        images: [{
          masterProductId: 'PRD-24010',
          imageBankId: 'PRD-24010-1',
          displayOrder: 1,
          isPrimary: true,
          url: this.buildPlaceholderAsset('Oranges', 'fdba74')
        }]
      }
    ];

    return products.map((product) => this.normalizeProduct(product));
  }
}
