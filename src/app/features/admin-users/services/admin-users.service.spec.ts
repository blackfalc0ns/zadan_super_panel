import { TestBed } from '@angular/core/testing';
import { provideAppTesting } from '../../../testing/testing.providers';
import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  let service: AdminUsersService;

  beforeEach(() => {
    localStorage.removeItem('superadmin.access-directory.v4');
    localStorage.removeItem('superadmin.access-directory.v3');
    localStorage.removeItem('superadmin.access-directory.v2');
    localStorage.removeItem('superadmin.admin-users.v1');
    TestBed.configureTestingModule({
      providers: [...provideAppTesting()]
    });
    service = TestBed.inject(AdminUsersService);
  });

  it('starts with an empty directory when storage is empty', () => {
    expect(service.getUsers()).toEqual([]);
  });

  it('ignores legacy local admin records instead of reseeding them', () => {
    TestBed.resetTestingModule();
    localStorage.removeItem('superadmin.access-directory.v4');
    localStorage.removeItem('superadmin.access-directory.v3');
    localStorage.setItem(
      'superadmin.admin-users.v1',
      JSON.stringify([
        {
          id: 'legacy-admin-001',
          fullName: 'Legacy Admin',
          email: 'legacy.admin@zadana.sa'
        }
      ])
    );

    TestBed.configureTestingModule({
      providers: [...provideAppTesting()]
    });

    const reloaded = TestBed.inject(AdminUsersService);

    expect(reloaded.getUsers()).toEqual([]);
    expect(localStorage.getItem('superadmin.access-directory.v4')).toBe('[]');
  });

  it('creates and persists a draft identity with the selected persona', () => {
    const draft = service.createDraftUser('vendor_branch_manager');

    expect(service.getUserById(draft.id)?.inviteState).toBe('draft');
    expect(service.getUserById(draft.id)?.personaType).toBe('vendor_branch_manager');
  });

  it('applies granted and revoked overrides on top of the preset', () => {
    const draft = service.createDraftUser('super_admin_staff');
    const updated = service.saveUser({
      ...draft,
      grantedPermissions: ['email_center.edit'],
      revokedPermissions: ['vendors.export']
    });
    const permissions = service.getEffectivePermissions(updated);

    expect(permissions).toContain('email_center.edit');
    expect(permissions).not.toContain('vendors.export');
  });

  it('suspends and reactivates a user', () => {
    const draft = service.createDraftUser('super_admin_staff');

    service.suspendUser(draft.id);
    expect(service.getUserById(draft.id)?.status).toBe('suspended');

    service.reactivateUser(draft.id);
    expect(service.getUserById(draft.id)?.status).toBe('invited');
  });
});
