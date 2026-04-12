import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '@core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { provideAppTesting } from '../../../testing/testing.providers';
import { MarketingApiService } from './marketing.api.service';

describe('MarketingApiService', () => {
  let service: MarketingApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...provideAppTesting(),
        {
          provide: AuthService,
          useValue: {
            getToken: () => 'test-admin-token'
          }
        }
      ]
    });

    service = TestBed.inject(MarketingApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('adds the admin bearer token when loading banners', () => {
    service.getBanners().subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/admin/marketing/banners`);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-admin-token');
    request.flush([]);
  });

  it('posts featured placement payloads to the featured products endpoint', () => {
    service.createFeaturedPlacement({
      placementType: 'VendorProduct',
      vendorProductId: 'vendor-id',
      masterProductId: null,
      displayOrder: 3,
      startsAtUtc: null,
      endsAtUtc: null,
      note: 'Seasonal slot'
    }).subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/admin/marketing/featured-products`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(jasmine.objectContaining({
      placementType: 'VendorProduct',
      vendorProductId: 'vendor-id',
      displayOrder: 3
    }));
    request.flush({});
  });

  it('patches section visibility using the section type route segment', () => {
    service.activateSectionVisibility('FeaturedProducts').subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/admin/marketing/home-content-sections/FeaturedProducts/activate`);
    expect(request.request.method).toBe('PATCH');
    request.flush({});
  });

  it('uploads banner images using multipart form data', () => {
    const file = new File(['banner'], 'banner.png', { type: 'image/png' });

    service.uploadBannerImage(file).subscribe((response) => {
      expect(response.url).toBe('https://ik.imagekit.io/test/banner.png');
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/admin/marketing/banners/upload-image`);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-admin-token');
    expect(request.request.body instanceof FormData).toBeTrue();
    request.flush({ url: 'https://ik.imagekit.io/test/banner.png' });
  });
});
