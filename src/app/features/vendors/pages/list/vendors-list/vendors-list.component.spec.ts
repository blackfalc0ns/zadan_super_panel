import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VendorsListComponent } from './vendors-list.component';
import { provideAppTesting } from '../../../../../testing/testing.providers';

describe('VendorsListComponent', () => {
  let component: VendorsListComponent;
  let fixture: ComponentFixture<VendorsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorsListComponent],
      providers: [...provideAppTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

