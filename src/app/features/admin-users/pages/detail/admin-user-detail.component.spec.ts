import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAppTesting } from '../../../../testing/testing.providers';
import { AdminUserDetailComponent } from './admin-user-detail.component';

describe('AdminUserDetailComponent', () => {
  describe('operational identity', () => {
    let component: AdminUserDetailComponent;
    let fixture: ComponentFixture<AdminUserDetailComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [AdminUserDetailComponent],
        providers: [...provideAppTesting({ params: { id: 'admin-001' } })]
      }).compileComponents();

      fixture = TestBed.createComponent(AdminUserDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
      expect(component.isOperationalIdentity).toBeTrue();
    });
  });

  describe('external identity', () => {
    let component: AdminUserDetailComponent;
    let fixture: ComponentFixture<AdminUserDetailComponent>;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [AdminUserDetailComponent],
        providers: [...provideAppTesting({ params: { id: 'customer-CUS-44012' } })]
      }).compileComponents();

      fixture = TestBed.createComponent(AdminUserDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('renders external identities without the operational permission matrix state', () => {
      expect(component.user?.identityKind).toBe('external');
      expect(component.isOperationalIdentity).toBeFalse();
      expect(component.featureToggleDefinitions.length).toBeGreaterThan(0);
    });
  });
});
