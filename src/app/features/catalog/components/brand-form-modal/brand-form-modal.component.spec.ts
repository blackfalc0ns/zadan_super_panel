import { FormBuilder } from '@angular/forms';
import { SimpleChange } from '@angular/core';
import { of } from 'rxjs';
import { BrandFormModalComponent } from './brand-form-modal.component';

describe('BrandFormModalComponent', () => {
  function createComponent() {
    const catalogService = {
      getCategories: jasmine.createSpy('getCategories').and.returnValue(of([])),
      uploadFile: jasmine.createSpy('uploadFile').and.returnValue(of({ url: 'https://cdn.test/cover.png' })),
      createBrand: jasmine.createSpy('createBrand').and.returnValue(of({})),
      updateBrand: jasmine.createSpy('updateBrand').and.returnValue(of(void 0))
    };

    const translate = { currentLang: 'ar' } as any;
    const component = new BrandFormModalComponent(new FormBuilder(), catalogService as any, translate);
    return { component, catalogService };
  }

  it('uploads the selected cover image into the coverImageUrl control', () => {
    const { component, catalogService } = createComponent();
    const file = new File(['cover'], 'cover.png', { type: 'image/png' });
    const event = { target: { files: [file] } } as unknown as Event;

    component.onFileSelected(event, 'coverImageUrl');

    expect(catalogService.uploadFile).toHaveBeenCalledWith(file, 'brands');
    expect(component.form.get('coverImageUrl')?.value).toBe('https://cdn.test/cover.png');
    expect(component.isUploadingCover).toBeFalse();
  });

  it('fills the form when an existing brand is opened for editing', () => {
    const { component } = createComponent();
    component.isOpen = true;
    component.mode = 'edit';
    component.brand = {
      id: 'brand-1',
      nameAr: 'المراعي',
      nameEn: 'Almarai',
      logoUrl: 'https://cdn.test/logo.png',
      coverImageUrl: 'https://cdn.test/cover.png',
      categoryId: 'category-1',
      isActive: true
    };

    component.ngOnChanges({
      isOpen: new SimpleChange(false, true, false),
      mode: new SimpleChange('create', 'edit', false),
      brand: new SimpleChange(null, component.brand, false)
    });

    expect(component.form.value).toEqual(jasmine.objectContaining({
      id: 'brand-1',
      nameAr: 'المراعي',
      nameEn: 'Almarai',
      logoUrl: 'https://cdn.test/logo.png',
      coverImageUrl: 'https://cdn.test/cover.png',
      categoryId: 'category-1',
      isActive: true
    }));
  });

  it('shows only final sub-categories in the linked sub-category dropdown', () => {
    const { component, catalogService } = createComponent();
    catalogService.getCategories.and.returnValue(of([
      {
        id: 'root',
        nameAr: 'Root',
        nameEn: 'Root',
        displayOrder: 1,
        isActive: true,
        subCategories: [
          {
            id: 'parent-sub',
            nameAr: 'Parent sub',
            nameEn: 'Parent sub',
            parentCategoryId: 'root',
            displayOrder: 1,
            isActive: true,
            subCategories: [
              {
                id: 'leaf-sub',
                nameAr: 'Leaf sub',
                nameEn: 'Leaf sub',
                parentCategoryId: 'parent-sub',
                displayOrder: 1,
                isActive: true
              }
            ]
          }
        ]
      }
    ]));

    component.ngOnInit();

    expect(component.leafCategories.map((category) => category.id)).toEqual(['leaf-sub']);
  });
});
