import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VendorDetailComponent } from './vendor-detail.component';
import { provideAppTesting } from '../../../../../testing/testing.providers';
import { VendorDetailFacade } from '../../../services/vendor-detail.facade';

describe('VendorDetailComponent', () => {
  let component: VendorDetailComponent;
  let fixture: ComponentFixture<VendorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorDetailComponent],
      providers: [...provideAppTesting({ params: { id: 'vendor-1' } }), VendorDetailFacade]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

