import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MasterProductsComponent } from './master-products.component';
import { provideAppTesting } from '../../../../testing/testing.providers';

describe('MasterProductsComponent', () => {
  let component: MasterProductsComponent;
  let fixture: ComponentFixture<MasterProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterProductsComponent],
      providers: [...provideAppTesting()]
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
