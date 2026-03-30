import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VendorComplianceComponent } from './vendor-compliance.component';
import { provideAppTesting } from '../../../../testing/testing.providers';

describe('VendorComplianceComponent', () => {
  let component: VendorComplianceComponent;
  let fixture: ComponentFixture<VendorComplianceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorComplianceComponent],
      providers: [...provideAppTesting({ params: { id: 'vendor-1' } })]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
