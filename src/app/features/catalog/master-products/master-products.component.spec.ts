import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterProductsComponent } from './master-products.component';

describe('MasterProductsComponent', () => {
  let component: MasterProductsComponent;
  let fixture: ComponentFixture<MasterProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
