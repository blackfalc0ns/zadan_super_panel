import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { CatalogService } from './catalog.api.service';
import { provideAppTesting } from '../../../testing/testing.providers';
import { environment } from '../../../../environments/environment';

describe('CatalogService', () => {
 let service: CatalogService;
 let httpMock: HttpTestingController;

 beforeEach(() => {
 TestBed.configureTestingModule({
 providers: [...provideAppTesting()]
 });
 service = TestBed.inject(CatalogService);
 httpMock = TestBed.inject(HttpTestingController);
 });

 afterEach(() => {
 httpMock.verify();
 });

 it('should be created', () => {
 expect(service).toBeTruthy();
 });

 it('uploads catalog files to the normalized cloud directory', () => {
 const file = new File(['brand'], 'brand.png', { type: 'image/png' });
 let uploadedUrl = '';

 service.uploadFile(file, 'brands').subscribe((response) => {
 uploadedUrl = response.url;
 });

 const request = httpMock.expectOne(`${environment.apiUrl}/files/upload`);
 expect(request.request.method).toBe('POST');
 expect(request.request.body instanceof FormData).toBeTrue();
 expect(request.request.body.get('directory')).toBe('uploads/catalog/brands');

 request.flush({ url: 'https://ik.imagekit.io/test/brand.png' });

 expect(uploadedUrl).toBe('https://ik.imagekit.io/test/brand.png');
 });

 it('does not fall back to a local blob URL when cloud upload fails', () => {
 const file = new File(['brand'], 'brand.png', { type: 'image/png' });
 let error: unknown;

 service.uploadFile(file, 'brands').subscribe({
 error: (uploadError) => {
 error = uploadError;
 }
 });

 const request = httpMock.expectOne(`${environment.apiUrl}/files/upload`);
 request.flush({ message: 'Upload failed' }, { status: 500, statusText: 'Server Error' });

 expect(error).toBeTruthy();
 });

 it('normalizes snake_case brand fields before the edit modal receives them', () => {
 const normalized = (service as any).normalizeBrand({
 id: 'brand-1',
 name_ar: 'المراعي',
 name_en: 'Almarai',
 logo_url: 'https://cdn.test/logo.png',
 cover_image_url: 'https://cdn.test/cover.png',
 category_id: 'category-1',
 is_active: true,
 product_count: 4
 }, 0);

 expect(normalized.nameAr).toBe('المراعي');
 expect(normalized.nameEn).toBe('Almarai');
 expect(normalized.logoUrl).toBe('https://cdn.test/logo.png');
 expect(normalized.coverImageUrl).toBe('https://cdn.test/cover.png');
 expect(normalized.categoryId).toBe('category-1');
 expect(normalized.isActive).toBeTrue();
 expect(normalized.masterProductsCount).toBe(4);
 });

 it('loads a single brand by id through the existing brands list endpoint', () => {
 let brandName = '';

 service.getBrandById('brand-1', false).subscribe((brand) => {
 brandName = brand.nameEn;
 });

 const request = httpMock.expectOne((req) =>
 req.url === `${environment.apiUrl}/admin/catalog/brands`
 && req.params.get('includeInactive') === 'true'
 );
 expect(request.request.method).toBe('GET');

 request.flush([{
 id: 'brand-1',
 nameAr: 'المراعي',
 nameEn: 'Almarai',
 logoUrl: 'https://cdn.test/logo.png',
 coverImageUrl: 'https://cdn.test/cover.png',
 categoryId: 'category-1',
 isActive: true,
 masterProductsCount: 4
 }]);

 expect(brandName).toBe('Almarai');
 });
});
