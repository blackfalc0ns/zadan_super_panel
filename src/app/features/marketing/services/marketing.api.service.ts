import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '@core/services/auth.service';
import {
  CouponDiscountType,
  FeaturedPlacement,
  FeaturedPlacementPayload,
  FeaturedPlacementUpdatePayload,
  HomeContentSectionSetting,
  HomeContentSectionSettingPayload,
  HomeSectionThemeOption,
  HomeContentSectionType,
  MarketingBanner,
  MarketingBannerPayload,
  MarketingBannerUpdatePayload,
  MarketingCoupon,
  MarketingCouponPayload,
  MarketingCouponUpdatePayload,
  MarketingHomeSection,
  MarketingHomeSectionPayload,
  MarketingHomeSectionUpdatePayload,
  MasterProductLookupOption,
  PlatformContactSettings,
  PlatformContactSettingsPayload,
  PlatformLegalDocument,
  PlatformLegalDocumentPayload,
  PlatformLegalDocumentType,
  ProductCardPriceVisibilitySetting,
  VendorProductLookupOption
} from '@marketing/models/marketing.models';

@Injectable({
  providedIn: 'root'
})
export class MarketingApiService {
  private readonly apiUrl = `${environment.apiUrl}/admin/marketing`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  getBanners(): Observable<MarketingBanner[]> {
    return this.http.get<MarketingBanner[]>(`${this.apiUrl}/banners`, { headers: this.getHeaders() });
  }

  getBannerById(id: string): Observable<MarketingBanner> {
    return this.http.get<MarketingBanner>(`${this.apiUrl}/banners/${id}`, { headers: this.getHeaders() });
  }

  createBanner(payload: MarketingBannerPayload): Observable<MarketingBanner> {
    return this.http.post<MarketingBanner>(`${this.apiUrl}/banners`, payload, { headers: this.getHeaders() });
  }

  updateBanner(id: string, payload: MarketingBannerUpdatePayload): Observable<MarketingBanner> {
    return this.http.put<MarketingBanner>(`${this.apiUrl}/banners/${id}`, payload, { headers: this.getHeaders() });
  }

  activateBanner(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/banners/${id}/activate`, {}, { headers: this.getHeaders() });
  }

  deactivateBanner(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/banners/${id}/deactivate`, {}, { headers: this.getHeaders() });
  }

  deleteBanner(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/banners/${id}`, { headers: this.getHeaders() });
  }

  uploadBannerImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ url?: string; Url?: string }>(`${this.apiUrl}/banners/upload-image`, formData, {
      headers: this.getHeaders()
    }).pipe(
      map((response) => ({ url: response.url ?? response.Url ?? '' }))
    );
  }

  getFeaturedPlacements(): Observable<FeaturedPlacement[]> {
    return this.http.get<FeaturedPlacement[]>(`${this.apiUrl}/featured-products`, { headers: this.getHeaders() });
  }

  getFeaturedPlacementById(id: string): Observable<FeaturedPlacement> {
    return this.http.get<FeaturedPlacement>(`${this.apiUrl}/featured-products/${id}`, { headers: this.getHeaders() });
  }

  createFeaturedPlacement(payload: FeaturedPlacementPayload): Observable<FeaturedPlacement> {
    return this.http.post<FeaturedPlacement>(`${this.apiUrl}/featured-products`, payload, { headers: this.getHeaders() });
  }

  updateFeaturedPlacement(id: string, payload: FeaturedPlacementUpdatePayload): Observable<FeaturedPlacement> {
    return this.http.put<FeaturedPlacement>(`${this.apiUrl}/featured-products/${id}`, payload, { headers: this.getHeaders() });
  }

  activateFeaturedPlacement(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/featured-products/${id}/activate`, {}, { headers: this.getHeaders() });
  }

  deactivateFeaturedPlacement(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/featured-products/${id}/deactivate`, {}, { headers: this.getHeaders() });
  }

  deleteFeaturedPlacement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/featured-products/${id}`, { headers: this.getHeaders() });
  }

  lookupMasterProducts(search?: string): Observable<MasterProductLookupOption[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http.get<MasterProductLookupOption[]>(`${this.apiUrl}/featured-products/lookup/master-products${params}`, { headers: this.getHeaders() });
  }

  lookupVendorProducts(search?: string): Observable<VendorProductLookupOption[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http.get<VendorProductLookupOption[]>(`${this.apiUrl}/featured-products/lookup/vendor-products${params}`, { headers: this.getHeaders() });
  }

  getCoupons(): Observable<MarketingCoupon[]> {
    return this.http.get<MarketingCoupon[]>(`${this.apiUrl}/coupons`, { headers: this.getHeaders() });
  }

  getCouponById(id: string): Observable<MarketingCoupon> {
    return this.http.get<MarketingCoupon>(`${this.apiUrl}/coupons/${id}`, { headers: this.getHeaders() });
  }

  createCoupon(payload: MarketingCouponPayload): Observable<MarketingCoupon> {
    return this.http.post<MarketingCoupon>(`${this.apiUrl}/coupons`, this.normalizeCouponPayload(payload), {
      headers: this.getHeaders()
    });
  }

  updateCoupon(id: string, payload: MarketingCouponUpdatePayload): Observable<MarketingCoupon> {
    return this.http.put<MarketingCoupon>(`${this.apiUrl}/coupons/${id}`, this.normalizeCouponPayload(payload), {
      headers: this.getHeaders()
    });
  }

  activateCoupon(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/coupons/${id}/activate`, {}, { headers: this.getHeaders() });
  }

  deactivateCoupon(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/coupons/${id}/deactivate`, {}, { headers: this.getHeaders() });
  }

  deleteCoupon(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/coupons/${id}`, { headers: this.getHeaders() });
  }

  getHomeSections(): Observable<MarketingHomeSection[]> {
    return this.http.get<MarketingHomeSection[]>(`${this.apiUrl}/home-sections`, { headers: this.getHeaders() });
  }

  getHomeSectionById(id: string): Observable<MarketingHomeSection> {
    return this.http.get<MarketingHomeSection>(`${this.apiUrl}/home-sections/${id}`, { headers: this.getHeaders() });
  }

  createHomeSection(payload: MarketingHomeSectionPayload): Observable<MarketingHomeSection> {
    return this.http.post<MarketingHomeSection>(`${this.apiUrl}/home-sections`, payload, { headers: this.getHeaders() });
  }

  updateHomeSection(id: string, payload: MarketingHomeSectionUpdatePayload): Observable<MarketingHomeSection> {
    return this.http.put<MarketingHomeSection>(`${this.apiUrl}/home-sections/${id}`, payload, { headers: this.getHeaders() });
  }

  activateHomeSection(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/home-sections/${id}/activate`, {}, { headers: this.getHeaders() });
  }

  deactivateHomeSection(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/home-sections/${id}/deactivate`, {}, { headers: this.getHeaders() });
  }

  deleteHomeSection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/home-sections/${id}`, { headers: this.getHeaders() });
  }

  getHomeSectionThemes(): Observable<HomeSectionThemeOption[]> {
    return this.http.get<HomeSectionThemeOption[]>(`${this.apiUrl}/home-sections/themes`, { headers: this.getHeaders() });
  }

  getHomeContentSectionSettings(): Observable<HomeContentSectionSetting[]> {
    return this.http.get<HomeContentSectionSetting[]>(`${this.apiUrl}/home-content-sections`, { headers: this.getHeaders() });
  }

  getProductCardPriceVisibility(): Observable<ProductCardPriceVisibilitySetting> {
    return this.http.get<ProductCardPriceVisibilitySetting>(`${this.apiUrl}/product-card-price-visibility`, {
      headers: this.getHeaders()
    });
  }

  setProductCardPriceVisibility(showPriceOnCard: boolean): Observable<ProductCardPriceVisibilitySetting> {
    return this.http.patch<ProductCardPriceVisibilitySetting>(
      `${this.apiUrl}/product-card-price-visibility`,
      { showPriceOnCard },
      { headers: this.getHeaders() }
    );
  }

  updateSectionVisibility(
    sectionType: HomeContentSectionType,
    payload: HomeContentSectionSettingPayload
  ): Observable<HomeContentSectionSetting> {
    return this.http.put<HomeContentSectionSetting>(`${this.apiUrl}/home-content-sections/${sectionType}`, payload, {
      headers: this.getHeaders()
    });
  }

  activateSectionVisibility(sectionType: HomeContentSectionType): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/home-content-sections/${sectionType}/activate`, {}, {
      headers: this.getHeaders()
    });
  }

  deactivateSectionVisibility(sectionType: HomeContentSectionType): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/home-content-sections/${sectionType}/deactivate`, {}, {
      headers: this.getHeaders()
    });
  }

  getPlatformContact(): Observable<PlatformContactSettings> {
    return this.http.get<PlatformContactSettings>(`${this.apiUrl}/platform-contact`, {
      headers: this.getHeaders()
    });
  }

  upsertPlatformContact(payload: PlatformContactSettingsPayload): Observable<PlatformContactSettings> {
    return this.http.put<PlatformContactSettings>(`${this.apiUrl}/platform-contact`, payload, {
      headers: this.getHeaders()
    });
  }

  getLegalDocuments(): Observable<PlatformLegalDocument[]> {
    return this.http.get<PlatformLegalDocument[]>(`${this.apiUrl}/legal-documents`, {
      headers: this.getHeaders()
    });
  }

  getLegalDocument(documentType: PlatformLegalDocumentType): Observable<PlatformLegalDocument> {
    return this.http.get<PlatformLegalDocument>(`${this.apiUrl}/legal-documents/${documentType}`, {
      headers: this.getHeaders()
    });
  }

  upsertLegalDocument(
    documentType: PlatformLegalDocumentType,
    payload: PlatformLegalDocumentPayload
  ): Observable<PlatformLegalDocument> {
    return this.http.put<PlatformLegalDocument>(`${this.apiUrl}/legal-documents/${documentType}`, payload, {
      headers: this.getHeaders()
    });
  }

  private normalizeCouponPayload<T extends MarketingCouponPayload | MarketingCouponUpdatePayload>(payload: T): T {
    return {
      ...payload,
      code: payload.code.trim().toUpperCase(),
      title: payload.title.trim(),
      discountType: this.normalizeCouponDiscountType(payload.discountType)
    } as T;
  }

  private normalizeCouponDiscountType(discountType: CouponDiscountType | string): CouponDiscountType {
    return discountType === 'Percentage' ? 'Percentage' : 'Fixed';
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }
}
