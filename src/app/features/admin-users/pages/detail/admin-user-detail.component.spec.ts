import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAppTesting } from '../../../../testing/testing.providers';
import { AdminUsersService } from '../../services/admin-users.service';
import { AdminUserDetailComponent } from './admin-user-detail.component';

describe('AdminUserDetailComponent', () => {
  let component: AdminUserDetailComponent;
  let fixture: ComponentFixture<AdminUserDetailComponent>;
  let adminUsersService: AdminUsersService;

  beforeEach(async () => {
    localStorage.removeItem('superadmin.access-directory.v4');
    await TestBed.configureTestingModule({
      imports: [AdminUserDetailComponent],
      providers: [...provideAppTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUserDetailComponent);
    component = fixture.componentInstance;
    adminUsersService = TestBed.inject(AdminUsersService);
  });

  it('recognizes an operational admin identity', () => {
    component.user = adminUsersService.createDraftUser('super_admin_staff');

    expect(component).toBeTruthy();
    expect(component.isOperationalIdentity).toBeTrue();
  });

  it('represents an external identity without operational permissions', () => {
    const user = adminUsersService.createDraftUser('customer');
    component.user = user;
    component.featureToggleDefinitions = adminUsersService.getFeatureToggleDefinitions(user.personaType);

    expect(component.user.identityKind).toBe('external');
    expect(component.isOperationalIdentity).toBeFalse();
    expect(component.featureToggleDefinitions.length).toBeGreaterThan(0);
  });
});
