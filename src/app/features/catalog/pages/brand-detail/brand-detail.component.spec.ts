import { BrandDetailComponent } from './brand-detail.component';

describe('BrandDetailComponent', () => {
  function createComponent() {
    return new BrandDetailComponent(
      { snapshot: { paramMap: { get: () => null } } } as any,
      {} as any,
      {} as any,
      { currentLang: 'ar', instant: () => '' } as any
    );
  }

  it('prefers coverImageUrl when available', () => {
    const component = createComponent();
    component.brand = {
      id: '1',
      nameAr: 'المراعي',
      nameEn: 'Almarai',
      logoUrl: 'https://cdn.test/logo.png',
      coverImageUrl: 'https://cdn.test/cover.png',
      isActive: true
    };

    expect(component.getCoverImageUrl()).toBe('https://cdn.test/cover.png');
    expect(component.isUsingLogoAsCover()).toBeFalse();
  });

  it('falls back to logoUrl when coverImageUrl is missing', () => {
    const component = createComponent();
    component.brand = {
      id: '1',
      nameAr: 'المراعي',
      nameEn: 'Almarai',
      logoUrl: 'https://cdn.test/logo.png',
      isActive: true
    };

    expect(component.getCoverImageUrl()).toBe('https://cdn.test/logo.png');
    expect(component.isUsingLogoAsCover()).toBeTrue();
  });
});
