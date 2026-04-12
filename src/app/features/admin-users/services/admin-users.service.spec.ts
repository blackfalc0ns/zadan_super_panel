import { TestBed } from '@angular/core/testing';
import { provideAppTesting } from '../../../testing/testing.providers';
import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  let service: AdminUsersService;

  beforeEach(() => {
    localStorage.removeItem('superadmin.access-directory.v2');
    localStorage.removeItem('superadmin.admin-users.v1');
    TestBed.configureTestingModule({
      providers: [...provideAppTesting()]
    });
    service = TestBed.inject(AdminUsersService);
  });

  it('loads seed identities for operational and external personas when storage is empty', () => {
    const users = service.getUsers();

    expect(users.length).toBeGreaterThan(0);
    expect(users.some((user) => user.source === 'vendor')).toBeTrue();
    expect(users.some((user) => user.source === 'driver')).toBeTrue();
    expect(users.some((user) => user.source === 'customer')).toBeTrue();
  });

  it('migrates legacy admin records and keeps them in the unified directory', () => {
    TestBed.resetTestingModule();
    localStorage.removeItem('superadmin.access-directory.v2');
    localStorage.setItem(
      'superadmin.admin-users.v1',
      JSON.stringify([
        {
          id: 'legacy-admin-001',
          fullName: 'Legacy Admin',
          email: 'legacy.admin@zadana.sa',
          phone: '+966500000000',
          department: 'HQ Operations',
          team: 'Core Ops',
          rolePresetId: 'super_admin',
          accessLevel: 'full',
          status: 'active',
          inviteState: 'accepted',
          grantedPermissions: [],
          revokedPermissions: [],
          security: {
            mfaEnabled: true,
            lastLoginAt: '2026-03-30 10:00 AM',
            invitedBy: 'Root',
            invitedAt: '2026-03-01 09:00 AM',
            acceptedAt: '2026-03-01 09:15 AM'
          },
          avatarHue: '#127c8c'
        }
      ])
    );

    TestBed.configureTestingModule({
      providers: [...provideAppTesting()]
    });

    const reloaded = TestBed.inject(AdminUsersService);
    const migrated = reloaded.getUserById('legacy-admin-001');

    expect(migrated).toBeTruthy();
    expect(migrated?.personaType).toBe('super_admin_manager');
    expect(migrated?.panelScope).toBe('super_admin_panel');
  });

  it('creates and persists a draft identity with the selected persona', () => {
    const draft = service.createDraftUser('vendor_branch_manager');

    expect(service.getUserById(draft.id)?.inviteState).toBe('draft');
    expect(service.getUserById(draft.id)?.personaType).toBe('vendor_branch_manager');
  });

  it('applies granted and revoked overrides on top of the preset', () => {
    const user = service.getUserById('admin-002');
    const permissions = user ? service.getEffectivePermissions(user) : [];

    expect(permissions).toContain('email_center.edit');
    expect(permissions).not.toContain('vendors.export');
  });

  it('resolves branch-scoped vendor recipients from the unified directory', () => {
    const branchManager = service.getUsers().find((user) => user.personaType === 'vendor_branch_manager');

    expect(branchManager).toBeTruthy();

    const recipients = service.resolveRecipientTargetEmails({
      targetIds: ['branch_manager'],
      audienceType: 'vendor_network',
      panelScope: 'vendor_panel',
      vendorId: branchManager?.assignment.vendorId ?? null,
      branchId: branchManager?.assignment.branchId ?? null,
      personaTypes: ['vendor_branch_manager']
    });

    expect(recipients).toContain(branchManager?.communication.primaryEmail ?? '');
  });

  it('keeps external customer identities outside the admin permission matrix', () => {
    const customerIdentity = service.getUserById('customer-CUS-44012');

    expect(customerIdentity?.identityKind).toBe('external');
    expect(customerIdentity ? service.getEffectivePermissions(customerIdentity) : []).toEqual([]);
  });

  it('suspends and reactivates a user', () => {
    service.suspendUser('admin-001');
    expect(service.getUserById('admin-001')?.status).toBe('suspended');

    service.reactivateUser('admin-001');
    expect(service.getUserById('admin-001')?.status).toBe('active');
  });
});
