import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterProductFormComponent } from './master-product-form.component';

describe('MasterProductFormComponent', () => {
  let component: MasterProductFormComponent;
  let fixture: ComponentFixture<MasterProductFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterProductFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
