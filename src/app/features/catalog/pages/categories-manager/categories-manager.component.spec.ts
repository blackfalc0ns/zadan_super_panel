import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoriesManagerComponent } from './categories-manager.component';
import { provideAppTesting } from '../../../../testing/testing.providers';

describe('CategoriesManagerComponent', () => {
  let component: CategoriesManagerComponent;
  let fixture: ComponentFixture<CategoriesManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesManagerComponent],
      providers: [...provideAppTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
