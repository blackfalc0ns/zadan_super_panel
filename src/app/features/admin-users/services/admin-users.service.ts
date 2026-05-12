import { Injectable } from '@angular/core';
import { CustomersService } from '@customers/public-api';
import type { CustomerDetailRecord } from '@customers/public-api';
import { DriverService, VerificationStatus } from '@drivers/public-api';
import type { Driver } from '@drivers/public-api';
import { VendorService } from '@vendors/public-api';
import type { VendorDetail } from '@vendors/public-api';
import {
  ADMIN_ROLE_PRESETS,
  AdminRolePreset,
  AdminRolePresetId,
  AdminUserRecord,
  AdminUsersKpiSnapshot,
  DIRECTORY_FEATURE_TOGGLES,
  DirectoryAudienceType,
  DirectoryCommunicationProfile,
  DirectoryEntitySource,
  DirectoryFeatureToggleDefinition,
  DirectoryFeatureToggleId,
  DirectoryIdentityKind,
  DirectoryIdentityRecord,
  DirectoryPanelScope,
  DirectoryPersonaType,
  DirectoryRolePresetId,
  PermissionGroup,
  PERMISSION_GROUPS,
  getAudienceTypeByPersona,
  getDefaultRolePresetForPersona,
  getFeatureToggleDefinitions,
  getIdentityKindByPersona,
  getPanelScopeByPersona,
  getRolePresetById
} from '../models/admin-users.models';

const STORAGE_KEY = 'superadmin.access-directory.v4';
const LEGACY_STORAGE_KEY = 'superadmin.admin-users.v1';

type LegacyAdminRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  team: string;
  rolePresetId: AdminRolePresetId;
  accessLevel: DirectoryIdentityRecord['accessLevel'];
  status: DirectoryIdentityRecord['status'];
  inviteState: DirectoryIdentityRecord['inviteState'];
  grantedPermissions: string[];
  revokedPermissions: string[];
  security: {
    mfaEnabled: boolean;
    lastLoginAt: string | null;
    invitedBy: string;
    invitedAt: string | null;
    acceptedAt: string | null;
  };
  avatarHue: string;
};

interface DirectoryVendorOption {
  id: string;
  name: string;
  region: string;
  city: string;
}

interface DirectoryBranchOption {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  region: string;
  city: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {
  private readonly users: AdminUserRecord[];

  constructor(
    private readonly customersService: CustomersService,
    private readonly driverService: DriverService,
    private readonly vendorService: VendorService
  ) {
    this.users = this.loadUsers();
  }

  getUsers(): AdminUserRecord[] {
    return this.clone(this.users);
  }

  getUserById(id: string | null): AdminUserRecord | undefined {
    const user = this.users.find((entry) => entry.id === id);
    return user ? this.clone(user) : undefined;
  }

  getUserBySourceAndEntity(source: DirectoryEntitySource, entityId: string | null): AdminUserRecord | undefined {
    const user = this.users.find((entry) => entry.source === source && entry.entityId === entityId);
    return user ? this.clone(user) : undefined;
  }

  getRolePresets(): AdminRolePreset[] {
    return this.clone(ADMIN_ROLE_PRESETS);
  }

  getAvailableRolePresets(identity: Pick<DirectoryIdentityRecord, 'panelScope' | 'identityKind'> | null = null): AdminRolePreset[] {
    if (!identity) {
      return this.getRolePresets();
    }

    return this.clone(ADMIN_ROLE_PRESETS.filter((preset) =>
      preset.panelScope === identity.panelScope && preset.identityKind === identity.identityKind
    ));
  }

  getPermissionGroups(panelScope?: DirectoryPanelScope, identityKind: DirectoryIdentityKind = 'operational'): PermissionGroup[] {
    return this.clone(PERMISSION_GROUPS.filter((group) =>
      group.identityKinds.includes(identityKind) && (!panelScope || group.panelScopes.includes(panelScope))
    ));
  }

  getFeatureToggleDefinitions(personaType: DirectoryPersonaType): DirectoryFeatureToggleDefinition[] {
    return this.clone(getFeatureToggleDefinitions(personaType));
  }

  getVendorOptions(): DirectoryVendorOption[] {
    const vendors = this.users
      .filter((user) => user.assignment.vendorId)
      .map((user) => ({
        id: user.assignment.vendorId!,
        name: user.assignment.vendorName,
        region: user.assignment.region,
        city: user.assignment.city
      }));

    return this.uniqueBy(vendors, (vendor) => vendor.id).sort((a, b) => a.name.localeCompare(b.name));
  }

  getBranchOptions(vendorId?: string | null): DirectoryBranchOption[] {
    const branches = this.users
      .filter((user) => user.assignment.branchId && (!vendorId || user.assignment.vendorId === vendorId))
      .map((user) => ({
        id: user.assignment.branchId!,
        vendorId: user.assignment.vendorId ?? '',
        vendorName: user.assignment.vendorName,
        name: user.assignment.branchName,
        region: user.assignment.region,
        city: user.assignment.city
      }));

    return this.uniqueBy(branches, (branch) => branch.id).sort((a, b) => a.name.localeCompare(b.name));
  }

  createDraftUser(personaType: DirectoryPersonaType = 'super_admin_staff'): AdminUserRecord {
    const draft = this.buildDraftIdentity(personaType);
    this.users.unshift(draft);
    this.persist();
    return this.clone(draft);
  }

  duplicateUser(id: string): AdminUserRecord | undefined {
    const existing = this.users.find((user) => user.id === id);
    if (!existing) {
      return undefined;
    }

    const duplicated = this.normalizeUser({
      ...this.clone(existing),
      id: `directory-${Date.now()}`,
      entityId: null,
      fullName: existing.fullName ? `${existing.fullName} Copy` : '',
      email: '',
      communication: {
        ...existing.communication,
        primaryEmail: '',
        notificationEmails: [],
        replyTo: '',
        escalationEmails: []
      },
      status: 'invited',
      inviteState: 'draft',
      security: {
        ...existing.security,
        mfaEnabled: false,
        lastLoginAt: null,
        invitedAt: this.createTimestamp(),
        acceptedAt: null,
        verificationState: existing.identityKind === 'external' ? 'pending' : 'not_required'
      }
    });

    this.users.unshift(duplicated);
    this.persist();
    return this.clone(duplicated);
  }

  saveUser(record: AdminUserRecord): AdminUserRecord {
    const normalized = this.normalizeUser(record);
    const existingIndex = this.users.findIndex((entry) => entry.id === normalized.id);

    if (existingIndex >= 0) {
      this.users[existingIndex] = normalized;
    } else {
      this.users.unshift(normalized);
    }

    this.persist();
    return this.clone(normalized);
  }

  suspendUser(id: string): AdminUserRecord | undefined {
    return this.patchUser(id, (user) => {
      user.status = 'suspended';
      user.security.verificationState = user.identityKind === 'external' ? 'suspended' : user.security.verificationState;
    });
  }

  reactivateUser(id: string): AdminUserRecord | undefined {
    return this.patchUser(id, (user) => {
      user.status = user.inviteState === 'accepted' ? 'active' : 'invited';
      if (user.identityKind === 'external' && user.security.verificationState === 'suspended') {
        user.security.verificationState = 'verified';
      }
    });
  }

  resendInvite(id: string): AdminUserRecord | undefined {
    return this.patchUser(id, (user) => {
      user.inviteState = 'pending';
      if (user.status !== 'suspended') {
        user.status = 'invited';
      }
      user.security.invitedAt = this.createTimestamp();
    });
  }

  resetUserToPreset(id: string): AdminUserRecord | undefined {
    return this.patchUser(id, (user) => {
      const preset = getRolePresetById(user.rolePresetId);
      user.grantedPermissions = [];
      user.revokedPermissions = [];
      user.accessLevel = preset.accessLevel;
      if (user.identityKind === 'external') {
        user.featureToggles = this.getDefaultFeatureToggles(user.personaType);
      }
    });
  }

  getEffectivePermissions(user: AdminUserRecord): string[] {
    const basePermissions = user.rolePermissions?.length
      ? user.rolePermissions
      : getRolePresetById(user.rolePresetId).permissions;
    const presetPermissions = new Set(basePermissions);
    user.grantedPermissions.forEach((permission) => presetPermissions.add(permission));
    user.revokedPermissions.forEach((permission) => presetPermissions.delete(permission));
    return [...presetPermissions].sort();
  }

  getCustomPermissionCount(user: AdminUserRecord): number {
    return this.unique(user.grantedPermissions).length + this.unique(user.revokedPermissions).length;
  }

  getKpiSnapshot(users: AdminUserRecord[] = this.users): AdminUsersKpiSnapshot {
    return {
      totalIdentities: users.length,
      operationalIdentities: users.filter((user) => user.identityKind === 'operational').length,
      vendorPanelIdentities: users.filter((user) => user.panelScope === 'vendor_panel').length,
      externalAccounts: users.filter((user) => user.identityKind === 'external').length,
      mfaGapIdentities: users.filter((user) => !user.security.mfaEnabled && user.identityKind === 'operational').length,
      customRoleIdentities: users.filter((user) => this.getCustomPermissionCount(user) > 0).length
    };
  }

  getRecipientTargetOptions(audienceType?: DirectoryAudienceType): Array<{ id: string; labelKey: string }> {
    const allTargets: Array<{ id: string; labelKey: string; audiences: DirectoryAudienceType[] }> = [
      { id: 'primary_account_email', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.PRIMARY_ACCOUNT_EMAIL', audiences: ['super_admin', 'vendor_network', 'drivers', 'customers'] },
      { id: 'vendor_owner', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.VENDOR_OWNER', audiences: ['vendor_network'] },
      { id: 'vendor_company_manager', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.VENDOR_COMPANY_MANAGER', audiences: ['vendor_network'] },
      { id: 'branch_manager', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.BRANCH_MANAGER', audiences: ['vendor_network'] },
      { id: 'branch_staff', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.BRANCH_STAFF', audiences: ['vendor_network'] },
      { id: 'vendor_finance', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.VENDOR_FINANCE', audiences: ['vendor_network'] },
      { id: 'vendor_support', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.VENDOR_SUPPORT', audiences: ['vendor_network'] },
      { id: 'assigned_super_admin_manager', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.ASSIGNED_SUPER_ADMIN_MANAGER', audiences: ['vendor_network', 'drivers', 'customers'] },
      { id: 'driver_account', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.DRIVER_ACCOUNT', audiences: ['drivers'] },
      { id: 'customer_account', labelKey: 'EMAIL_CENTER.RECIPIENT_TARGETS.CUSTOMER_ACCOUNT', audiences: ['customers'] }
    ];

    return allTargets
      .filter((target) => !audienceType || target.audiences.includes(audienceType))
      .map(({ id, labelKey }) => ({ id, labelKey }));
  }

  resolveRecipientTargetEmails(config: {
    targetIds: string[];
    audienceType?: DirectoryAudienceType;
    panelScope?: DirectoryPanelScope | null;
    entityId?: string | null;
    vendorId?: string | null;
    branchId?: string | null;
    personaTypes?: DirectoryPersonaType[];
  }): string[] {
    const scopedIdentities = this.users.filter((identity) => {
      const matchesAudience = !config.audienceType || identity.audienceType === config.audienceType;
      const matchesPanel = !config.panelScope || identity.panelScope === config.panelScope;
      const matchesEntity = !config.entityId || identity.entityId === config.entityId;
      const matchesVendor = !config.vendorId || identity.assignment.vendorId === config.vendorId;
      const matchesBranch = !config.branchId || identity.assignment.branchId === config.branchId;
      const matchesPersona = !config.personaTypes?.length || config.personaTypes.includes(identity.personaType);

      return matchesAudience && matchesPanel && matchesEntity && matchesVendor && matchesBranch && matchesPersona;
    });

    const relatedRegion = scopedIdentities.find((identity) => identity.assignment.region)?.assignment.region;
    const resolved = new Set<string>();

    config.targetIds.forEach((targetId) => {
      switch (targetId) {
        case 'primary_account_email':
          scopedIdentities.forEach((identity) => this.pushRecipient(resolved, identity.communication.primaryEmail));
          break;
        case 'vendor_owner':
          this.findRecipientsByPersona(scopedIdentities, ['vendor_owner']).forEach((identity) => this.pushRecipient(resolved, identity.communication.primaryEmail));
          break;
        case 'vendor_company_manager':
          this.findRecipientsByPersona(scopedIdentities, ['vendor_company_manager']).forEach((identity) => this.pushRecipient(resolved, identity.communication.primaryEmail));
          break;
        case 'branch_manager':
          this.findRecipientsByPersona(scopedIdentities, ['vendor_branch_manager']).forEach((identity) => this.pushRecipient(resolved, identity.communication.primaryEmail));
          break;
        case 'branch_staff':
          this.findRecipientsByPersona(scopedIdentities, ['vendor_branch_employee']).forEach((identity) => this.pushRecipient(resolved, identity.communication.primaryEmail));
          break;
        case 'vendor_finance':
          this.findRecipientsByPersona(scopedIdentities, ['vendor_finance']).forEach((identity) => this.pushRecipient(resolved, identity.communication.primaryEmail));
          break;
        case 'vendor_support':
          this.findRecipientsByPersona(scopedIdentities, ['vendor_support']).forEach((identity) => this.pushRecipient(resolved, identity.communication.primaryEmail));
          break;
        case 'assigned_super_admin_manager':
          this.users
            .filter((identity) => identity.personaType === 'super_admin_manager' && (!relatedRegion || !identity.assignment.region || identity.assignment.region === relatedRegion))
            .forEach((identity) => this.pushRecipient(resolved, identity.communication.primaryEmail));
          break;
        case 'driver_account':
          this.findRecipientsByPersona(scopedIdentities, ['driver']).forEach((identity) => this.pushRecipient(resolved, identity.communication.primaryEmail));
          break;
        case 'customer_account':
          this.findRecipientsByPersona(scopedIdentities, ['customer']).forEach((identity) => this.pushRecipient(resolved, identity.communication.primaryEmail));
          break;
        default:
          break;
      }
    });

    return [...resolved];
  }

  private patchUser(id: string, mutate: (user: AdminUserRecord) => void): AdminUserRecord | undefined {
    const index = this.users.findIndex((user) => user.id === id);
    if (index < 0) {
      return undefined;
    }

    const workingCopy = this.clone(this.users[index]);
    mutate(workingCopy);
    const normalized = this.normalizeUser(workingCopy);
    this.users[index] = normalized;
    this.persist();

    return this.clone(normalized);
  }

  private loadUsers(): AdminUserRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) {
          throw new Error('Invalid directory payload');
        }

        return parsed
          .filter((item): item is AdminUserRecord => typeof item === 'object' && item !== null && 'id' in item)
          .map((record) => this.normalizeUser(record));
      }

      localStorage.removeItem('superadmin.access-directory.v3');
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
  }

  private migrateLegacyUsers(): AdminUserRecord[] {
    return [];
  }

  private mergeWithSeedIdentities(migratedAdmins: AdminUserRecord[]): AdminUserRecord[] {
    const identities = [...migratedAdmins, ...this.createEntitySeedIdentities()];
    const deduped = this.uniqueBy(identities, (identity) => identity.id);

    return deduped
      .map((identity) => this.normalizeUser(identity))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  private createEntitySeedIdentities(): AdminUserRecord[] {
    const vendorIdentities = this.createVendorIdentities();
    const customerIdentities = this.createCustomerIdentities();
    const driverIdentities = this.createDriverIdentities();

    return [...vendorIdentities, ...customerIdentities, ...driverIdentities];
  }

  private createVendorIdentities(): AdminUserRecord[] {
    return this.vendorService.getVendorsSnapshot().flatMap((vendor, index) => {
      const operationalStatus = this.mapVendorStatus(vendor.status);
      const inviteState = operationalStatus === 'invited' ? 'pending' : 'accepted';
      const baseAssignment = {
        entityId: vendor.id,
        entitySource: 'vendor' as const,
        vendorId: vendor.id,
        vendorName: vendor.businessNameEn || vendor.businessNameAr,
        branchId: null,
        branchName: '',
        region: vendor.region ?? '',
        city: vendor.city ?? ''
      };
      const vendorName = vendor.businessNameEn || vendor.businessNameAr;
      const slug = this.slugify(vendorName) || `vendor-${index + 1}`;
      const branches = this.buildVendorBranches(vendor);

      const records: AdminUserRecord[] = [
        this.normalizeUser(this.buildIdentity({
          id: `vendor-owner-${vendor.id}`,
          source: 'vendor',
          entityId: vendor.id,
          fullName: vendor.ownerName,
          email: vendor.ownerEmail,
          phone: vendor.ownerPhone,
          department: 'Vendor Leadership',
          team: 'Vendor Owner',
          personaType: 'vendor_owner',
          rolePresetId: 'vendor_owner',
          status: operationalStatus,
          inviteState,
          avatarHue: '#0f766e',
          assignment: baseAssignment,
          communication: this.createCommunicationProfile({
            primaryEmail: vendor.ownerEmail,
            replyTo: vendor.contactEmail,
            escalationEmails: ['vendor.escalations@zadana.sa'],
            preferredLocale: 'bilingual',
            emailOptIn: {
              accessInvites: true,
              branchAlerts: true,
              supportEscalations: true,
              financeDigests: true
            }
          }),
          security: {
            mfaEnabled: true,
            lastLoginAt: operationalStatus === 'active' ? '2026-04-03 11:05 AM' : null,
            invitedBy: 'Marketplace Operations',
            invitedAt: '2026-02-11 09:20 AM',
            acceptedAt: operationalStatus === 'active' ? '2026-02-11 09:35 AM' : null,
            verificationState: 'verified'
          },
          entityPath: `/vendors/${vendor.id}`,
          tags: [vendor.reviewState ?? 'submitted', vendor.payoutStatus ?? 'Pending']
        })),
        this.normalizeUser(this.buildIdentity({
          id: `vendor-company-manager-${vendor.id}`,
          source: 'vendor',
          entityId: vendor.id,
          fullName: `${vendor.ownerName} Ops`,
          email: vendor.contactEmail,
          phone: vendor.contactPhone,
          department: 'Vendor Operations',
          team: 'Company Manager',
          personaType: 'vendor_company_manager',
          rolePresetId: 'vendor_company_manager',
          status: operationalStatus,
          inviteState,
          avatarHue: '#2563eb',
          assignment: baseAssignment,
          communication: this.createCommunicationProfile({
            primaryEmail: vendor.contactEmail,
            replyTo: vendor.contactEmail,
            escalationEmails: ['vendor.ops@zadana.sa'],
            preferredLocale: 'bilingual',
            emailOptIn: {
              accessInvites: true,
              branchAlerts: true,
              supportEscalations: true
            }
          }),
          security: {
            mfaEnabled: index % 2 === 0,
            lastLoginAt: operationalStatus === 'active' ? '2026-04-02 04:40 PM' : null,
            invitedBy: 'Vendor Success Hub',
            invitedAt: '2026-02-14 10:10 AM',
            acceptedAt: operationalStatus === 'active' ? '2026-02-14 10:55 AM' : null,
            verificationState: vendor.reviewState === 'verified' ? 'verified' : 'pending'
          },
          entityPath: `/vendors/${vendor.id}`,
          tags: [vendor.businessType, vendor.region ?? '']
        })),
        this.normalizeUser(this.buildIdentity({
          id: `vendor-finance-${vendor.id}`,
          source: 'vendor',
          entityId: vendor.id,
          fullName: `${vendorName} Finance Desk`,
          email: `finance@${slug}.vendors.zadana.sa`,
          phone: vendor.contactPhone,
          department: 'Vendor Finance',
          team: 'Finance Desk',
          personaType: 'vendor_finance',
          rolePresetId: 'vendor_finance_manager',
          status: operationalStatus === 'active' ? 'active' : 'invited',
          inviteState,
          avatarHue: '#0891b2',
          assignment: baseAssignment,
          communication: this.createCommunicationProfile({
            primaryEmail: `finance@${slug}.vendors.zadana.sa`,
            replyTo: vendor.contactEmail,
            escalationEmails: ['vendor.finance@zadana.sa'],
            preferredLocale: 'en',
            emailOptIn: {
              financeDigests: true,
              supportEscalations: true
            }
          }),
          security: {
            mfaEnabled: true,
            lastLoginAt: operationalStatus === 'active' ? '2026-04-01 09:50 AM' : null,
            invitedBy: 'Finance Control',
            invitedAt: '2026-02-18 11:10 AM',
            acceptedAt: operationalStatus === 'active' ? '2026-02-18 11:22 AM' : null,
            verificationState: 'verified'
          },
          entityPath: `/vendors/${vendor.id}`,
          tags: ['finance', vendor.payoutStatus ?? 'Pending']
        })),
        this.normalizeUser(this.buildIdentity({
          id: `vendor-support-${vendor.id}`,
          source: 'vendor',
          entityId: vendor.id,
          fullName: `${vendorName} Support Desk`,
          email: `support@${slug}.vendors.zadana.sa`,
          phone: vendor.contactPhone,
          department: 'Vendor Support',
          team: 'Support Desk',
          personaType: 'vendor_support',
          rolePresetId: 'vendor_support_manager',
          status: operationalStatus === 'active' ? 'active' : 'invited',
          inviteState,
          avatarHue: '#8b5cf6',
          assignment: baseAssignment,
          communication: this.createCommunicationProfile({
            primaryEmail: `support@${slug}.vendors.zadana.sa`,
            replyTo: vendor.contactEmail,
            escalationEmails: ['vendor.support@zadana.sa'],
            preferredLocale: 'bilingual',
            emailOptIn: {
              supportEscalations: true,
              branchAlerts: true
            }
          }),
          security: {
            mfaEnabled: index % 3 !== 0,
            lastLoginAt: operationalStatus === 'active' ? '2026-04-03 06:10 PM' : null,
            invitedBy: 'Vendor Support Governance',
            invitedAt: '2026-02-19 08:45 AM',
            acceptedAt: operationalStatus === 'active' ? '2026-02-19 09:15 AM' : null,
            verificationState: 'verified'
          },
          entityPath: `/vendors/${vendor.id}`,
          tags: ['support']
        }))
      ];

      branches.forEach((branch, branchIndex) => {
        records.push(this.normalizeUser(this.buildIdentity({
          id: `vendor-branch-manager-${vendor.id}-${branch.id}`,
          source: 'vendor',
          entityId: vendor.id,
          fullName: `${vendorName} ${branch.name} Manager`,
          email: `manager.${branch.id}@${slug}.vendors.zadana.sa`,
          phone: vendor.contactPhone,
          department: 'Branch Operations',
          team: 'Branch Manager',
          personaType: 'vendor_branch_manager',
          rolePresetId: 'vendor_branch_manager',
          status: operationalStatus === 'active' ? 'active' : 'invited',
          inviteState,
          avatarHue: '#14b8a6',
          assignment: {
            ...baseAssignment,
            branchId: branch.id,
            branchName: branch.name,
            region: branch.region,
            city: branch.city
          },
          communication: this.createCommunicationProfile({
            primaryEmail: `manager.${branch.id}@${slug}.vendors.zadana.sa`,
            replyTo: vendor.contactEmail,
            escalationEmails: [`ops.${branch.id}@${slug}.vendors.zadana.sa`],
            preferredLocale: 'bilingual',
            emailOptIn: {
              branchAlerts: true,
              supportEscalations: true
            }
          }),
          security: {
            mfaEnabled: branchIndex % 2 === 0,
            lastLoginAt: operationalStatus === 'active' ? '2026-04-03 03:05 PM' : null,
            invitedBy: 'Vendor Company Manager',
            invitedAt: '2026-02-21 12:05 PM',
            acceptedAt: operationalStatus === 'active' ? '2026-02-21 12:40 PM' : null,
            verificationState: 'verified'
          },
          entityPath: `/vendors/${vendor.id}`,
          tags: [branch.name, 'branch']
        })));

        records.push(this.normalizeUser(this.buildIdentity({
          id: `vendor-branch-employee-${vendor.id}-${branch.id}`,
          source: 'vendor',
          entityId: vendor.id,
          fullName: `${vendorName} ${branch.name} Staff`,
          email: `staff.${branch.id}@${slug}.vendors.zadana.sa`,
          phone: vendor.contactPhone,
          department: 'Branch Operations',
          team: 'Branch Staff',
          personaType: 'vendor_branch_employee',
          rolePresetId: 'vendor_branch_employee',
          status: operationalStatus === 'active' ? 'active' : 'invited',
          inviteState,
          avatarHue: '#f59e0b',
          assignment: {
            ...baseAssignment,
            branchId: branch.id,
            branchName: branch.name,
            region: branch.region,
            city: branch.city
          },
          communication: this.createCommunicationProfile({
            primaryEmail: `staff.${branch.id}@${slug}.vendors.zadana.sa`,
            replyTo: vendor.contactEmail,
            escalationEmails: [`manager.${branch.id}@${slug}.vendors.zadana.sa`],
            preferredLocale: 'bilingual',
            emailOptIn: {
              branchAlerts: true
            }
          }),
          security: {
            mfaEnabled: branchIndex % 2 !== 0,
            lastLoginAt: operationalStatus === 'active' ? '2026-04-02 10:25 AM' : null,
            invitedBy: 'Branch Manager',
            invitedAt: '2026-02-22 08:15 AM',
            acceptedAt: operationalStatus === 'active' ? '2026-02-22 08:37 AM' : null,
            verificationState: 'verified'
          },
          entityPath: `/vendors/${vendor.id}`,
          tags: [branch.name, 'branch']
        })));
      });

      return records;
    });
  }

  private createCustomerIdentities(): AdminUserRecord[] {
    return this.customersService.getCustomersSnapshot().slice(0, 16).map((customer, index) =>
      this.normalizeUser(this.buildIdentity({
        id: `customer-${customer.id}`,
        source: 'customer',
        entityId: customer.id,
        fullName: customer.name,
        email: customer.email,
        phone: customer.phone,
        department: customer.accountTeam,
        team: customer.accountManager,
        personaType: 'customer',
        rolePresetId: 'customer_account',
        status: this.mapCustomerStatus(customer),
        inviteState: 'accepted',
        avatarHue: index % 2 === 0 ? '#ec4899' : '#f43f5e',
        assignment: {
          entityId: customer.id,
          entitySource: 'customer',
          vendorId: null,
          vendorName: '',
          branchId: null,
          branchName: '',
          region: this.mapCityToRegion(customer.city),
          city: customer.city
        },
        communication: this.createCommunicationProfile({
          primaryEmail: customer.email,
          notificationEmails: [customer.email],
          replyTo: customer.email,
          escalationEmails: ['customer.health@zadana.sa'],
          preferredLocale: customer.preferredLanguage === 'en' ? 'en' : 'ar',
          emailOptIn: {
            marketingOptIn: customer.segment !== 'watchlist',
            orderIssueUpdates: true,
            supportEscalations: customer.reviewState === 'escalated' || customer.reviewState === 'flagged'
          }
        }),
        security: {
          mfaEnabled: Boolean(customer.isVerified),
          lastLoginAt: customer.lastSeenAt,
          invitedBy: customer.accountManager,
          invitedAt: customer.registrationDate,
          acceptedAt: customer.registrationDate,
          verificationState: customer.isVerified ? 'verified' : 'pending'
        },
        featureToggles: this.getDefaultFeatureToggles('customer', customer),
        entityPath: `/customers/${customer.id}`,
        tags: customer.watchFlags
      }))
    );
  }

  private createDriverIdentities(): AdminUserRecord[] {
    const driverIds = Array.from({ length: 18 }, (_, index) => `${index + 1}`);

    return driverIds
      .map((id) => this.driverService.getDriverSnapshotById(id))
      .filter((driver): driver is Driver => !!driver)
      .map((driver, index) => {
        const numericId = Number(driver.id);
        const displayName = `${driver.firstName} ${driver.lastName}`.trim();
        const email = `driver.${String(numericId).padStart(4, '0')}@zadana.sa`;

        return this.normalizeUser(this.buildIdentity({
          id: `driver-${driver.id}`,
          source: 'driver',
          entityId: driver.id,
          fullName: displayName,
          email,
          phone: driver.phoneNumber,
          department: 'Driver Operations',
          team: driver.status === 'Suspended' ? 'Recovery Queue' : 'Live Fleet',
          personaType: 'driver',
          rolePresetId: 'driver_account',
          status: this.mapDriverStatus(driver.status),
          inviteState: 'accepted',
          avatarHue: index % 2 === 0 ? '#0ea5e9' : '#0284c7',
          assignment: {
            entityId: driver.id,
            entitySource: 'driver',
            vendorId: null,
            vendorName: '',
            branchId: null,
            branchName: '',
            region: this.mapCityToRegion(driver.city),
            city: driver.city
          },
          communication: this.createCommunicationProfile({
            primaryEmail: email,
            notificationEmails: [email],
            replyTo: email,
            escalationEmails: ['driver.ops@zadana.sa'],
            preferredLocale: 'ar',
            emailOptIn: {
              dispatchNotifications: driver.status !== 'Suspended',
              complianceEmails: driver.verificationStatus !== VerificationStatus.Verified,
              financeDigests: driver.collectionPaymentStatus !== 'critical'
            }
          }),
          security: {
            mfaEnabled: driver.verificationStatus === VerificationStatus.Verified,
            lastLoginAt: this.createRelativeTimestamp(driver.lastSeenAt),
            invitedBy: 'Driver Onboarding',
            invitedAt: '2026-01-12 08:10 AM',
            acceptedAt: '2026-01-12 08:40 AM',
            verificationState: this.mapDriverVerificationState(driver.verificationStatus)
          },
          featureToggles: this.getDefaultFeatureToggles('driver', driver),
          entityPath: `/drivers/${driver.id}`,
          tags: driver.alerts ?? []
        }));
      });
  }

  private migrateLegacyRecord(record: LegacyAdminRecord): AdminUserRecord {
    const personaType: DirectoryPersonaType = record.rolePresetId === 'super_admin'
      ? 'super_admin_manager'
      : 'super_admin_staff';

    return this.normalizeUser({
      id: record.id,
      entityId: null,
      source: 'admin',
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      department: record.department,
      team: record.team,
      personaType,
      audienceType: 'super_admin',
      identityKind: 'operational',
      panelScope: 'super_admin_panel',
      rolePresetId: record.rolePresetId,
      roleDefinitionId: null,
      roleCode: record.rolePresetId,
      roleName: record.rolePresetId,
      rolePermissions: getRolePresetById(record.rolePresetId).permissions,
      accessLevel: record.accessLevel,
      status: record.status,
      inviteState: record.inviteState,
      mustChangePassword: false,
      grantedPermissions: record.grantedPermissions,
      revokedPermissions: record.revokedPermissions,
      security: {
        ...record.security,
        verificationState: 'not_required'
      },
      avatarHue: record.avatarHue,
      assignment: {
        entityId: null,
        entitySource: 'admin',
        vendorId: null,
        vendorName: '',
        branchId: null,
        branchName: '',
        region: 'HQ',
        city: 'Riyadh'
      },
      communication: this.createCommunicationProfile({
        primaryEmail: record.email,
        notificationEmails: [record.email],
        replyTo: record.email,
        escalationEmails: ['security@zadana.sa'],
        preferredLocale: 'bilingual',
        emailOptIn: {
          accessInvites: true,
          supportEscalations: true
        }
      }),
      featureToggles: [],
      entityPath: '/admin-users',
      tags: ['legacy-admin']
    });
  }

  private buildDraftIdentity(personaType: DirectoryPersonaType): AdminUserRecord {
    const preset = getRolePresetById(getDefaultRolePresetForPersona(personaType));
    const isVendorPersona = preset.panelScope === 'vendor_panel';

    return this.normalizeUser({
      id: `directory-${Date.now()}`,
      entityId: null,
      source: isVendorPersona ? 'vendor' : personaType === 'driver' ? 'driver' : personaType === 'customer' ? 'customer' : 'admin',
      fullName: '',
      email: '',
      phone: '',
      department: '',
      team: '',
      personaType,
      audienceType: getAudienceTypeByPersona(personaType),
      identityKind: getIdentityKindByPersona(personaType),
      panelScope: getPanelScopeByPersona(personaType),
      rolePresetId: preset.id,
      roleDefinitionId: null,
      roleCode: preset.id,
      roleName: preset.id,
      rolePermissions: preset.permissions,
      accessLevel: preset.accessLevel,
      status: 'invited',
      inviteState: 'draft',
      mustChangePassword: true,
      grantedPermissions: [],
      revokedPermissions: [],
      security: {
        mfaEnabled: false,
        lastLoginAt: null,
        invitedBy: 'Access Control Desk',
        invitedAt: this.createTimestamp(),
        acceptedAt: null,
        verificationState: preset.identityKind === 'external' ? 'pending' : 'not_required'
      },
      avatarHue: preset.accent,
      assignment: {
        entityId: null,
        entitySource: isVendorPersona ? 'vendor' : personaType === 'driver' ? 'driver' : personaType === 'customer' ? 'customer' : 'admin',
        vendorId: null,
        vendorName: '',
        branchId: null,
        branchName: '',
        region: '',
        city: ''
      },
      communication: this.createCommunicationProfile({
        primaryEmail: '',
        notificationEmails: [],
        replyTo: '',
        escalationEmails: [],
        preferredLocale: 'bilingual'
      }),
      featureToggles: this.getDefaultFeatureToggles(personaType),
      entityPath: this.getEntityPathByPersona(personaType),
      tags: ['draft']
    });
  }

  private normalizeUser(record: AdminUserRecord): AdminUserRecord {
    const personaAudience = getAudienceTypeByPersona(record.personaType);
    const panelScope = getPanelScopeByPersona(record.personaType);
    const identityKind = getIdentityKindByPersona(record.personaType);
    let preset = getRolePresetById(record.rolePresetId);

    if (preset.panelScope !== panelScope || preset.identityKind !== identityKind) {
      preset = getRolePresetById(getDefaultRolePresetForPersona(record.personaType));
    }

    const email = (record.email || record.communication?.primaryEmail || '').trim().toLowerCase();
    const notificationEmails = this.unique([
      ...(record.communication?.notificationEmails ?? []),
      ...(email ? [email] : [])
    ].map((value) => value.trim().toLowerCase()).filter(Boolean));
    const escalationEmails = this.unique((record.communication?.escalationEmails ?? [])
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean));
    const replyTo = (record.communication?.replyTo || email).trim().toLowerCase();

    const normalized: AdminUserRecord = {
      ...record,
      entityId: record.entityId ?? record.assignment?.entityId ?? null,
      fullName: record.fullName.trim(),
      email,
      phone: record.phone.trim(),
      department: record.department.trim(),
      team: record.team.trim(),
      audienceType: personaAudience,
      identityKind,
      panelScope,
      rolePresetId: preset.id,
      roleDefinitionId: record.roleDefinitionId ?? null,
      roleCode: record.roleCode?.trim() || record.rolePresetId,
      roleName: record.roleName?.trim() || preset.id,
      rolePermissions: this.unique(record.rolePermissions ?? preset.permissions),
      accessLevel: identityKind === 'external' ? preset.accessLevel : (record.accessLevel || preset.accessLevel),
      mustChangePassword: record.mustChangePassword ?? false,
      grantedPermissions: identityKind === 'external' ? [] : this.unique(record.grantedPermissions),
      revokedPermissions: identityKind === 'external' ? [] : this.unique(record.revokedPermissions),
      security: {
        ...record.security,
        invitedBy: record.security.invitedBy.trim() || 'Access Control Desk',
        verificationState: this.normalizeVerificationState(record.security.verificationState, identityKind)
      },
      assignment: this.normalizeAssignment(record.assignment, record.source, record.entityId),
      communication: {
        primaryEmail: email,
        notificationEmails,
        replyTo,
        escalationEmails,
        preferredLocale: record.communication?.preferredLocale ?? 'bilingual',
        emailOptIn: {
          accessInvites: Boolean(record.communication?.emailOptIn?.accessInvites),
          branchAlerts: Boolean(record.communication?.emailOptIn?.branchAlerts),
          dispatchNotifications: Boolean(record.communication?.emailOptIn?.dispatchNotifications),
          complianceEmails: Boolean(record.communication?.emailOptIn?.complianceEmails),
          financeDigests: Boolean(record.communication?.emailOptIn?.financeDigests),
          supportEscalations: Boolean(record.communication?.emailOptIn?.supportEscalations),
          orderIssueUpdates: Boolean(record.communication?.emailOptIn?.orderIssueUpdates),
          marketingOptIn: Boolean(record.communication?.emailOptIn?.marketingOptIn)
        }
      },
      featureToggles: this.unique(record.featureToggles).filter((toggle): toggle is DirectoryFeatureToggleId =>
        DIRECTORY_FEATURE_TOGGLES.some((item) => item.id === toggle)
      ),
      entityPath: record.entityPath || this.getEntityPathByPersona(record.personaType),
      tags: this.unique(record.tags ?? []),
      avatarHue: record.avatarHue || preset.accent
    };

    if (normalized.status === 'active') {
      normalized.inviteState = 'accepted';
      normalized.security.acceptedAt = normalized.security.acceptedAt ?? this.createTimestamp();
      normalized.security.lastLoginAt = normalized.security.lastLoginAt ?? this.createTimestamp();
    }

    if (normalized.status === 'invited' && normalized.inviteState === 'accepted') {
      normalized.status = 'active';
    }

    if (normalized.inviteState === 'draft') {
      normalized.status = normalized.status === 'suspended' ? 'suspended' : 'invited';
    }

    normalized.security.invitedAt = normalized.security.invitedAt ?? this.createTimestamp();

    if (identityKind === 'external' && normalized.status === 'inactive' && normalized.inviteState === 'accepted') {
      normalized.security.lastLoginAt = normalized.security.lastLoginAt ?? this.createTimestamp();
    }

    return normalized;
  }

  private normalizeAssignment(
    assignment: AdminUserRecord['assignment'] | undefined,
    source: DirectoryEntitySource,
    entityId: string | null
  ): AdminUserRecord['assignment'] {
    return {
      entityId: assignment?.entityId ?? entityId ?? null,
      entitySource: assignment?.entitySource ?? source,
      vendorId: assignment?.vendorId ?? null,
      vendorName: assignment?.vendorName?.trim() ?? '',
      branchId: assignment?.branchId ?? null,
      branchName: assignment?.branchName?.trim() ?? '',
      region: assignment?.region?.trim() ?? '',
      city: assignment?.city?.trim() ?? ''
    };
  }

  private normalizeVerificationState(
    state: AdminUserRecord['security']['verificationState'],
    identityKind: DirectoryIdentityKind
  ): AdminUserRecord['security']['verificationState'] {
    if (identityKind === 'operational') {
      return state === 'verified' || state === 'pending' || state === 'under_review' || state === 'suspended'
        ? state
        : 'not_required';
    }

    return state === 'not_required' ? 'pending' : state;
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.users));
  }

  private buildIdentity(seed: Partial<AdminUserRecord> & Pick<AdminUserRecord, 'id' | 'fullName' | 'personaType' | 'rolePresetId' | 'status' | 'inviteState' | 'source' | 'entityPath'>): AdminUserRecord {
    const preset = getRolePresetById(seed.rolePresetId);
    return {
      id: seed.id,
      entityId: seed.entityId ?? null,
      source: seed.source,
      fullName: seed.fullName,
      email: seed.email ?? '',
      phone: seed.phone ?? '',
      department: seed.department ?? '',
      team: seed.team ?? '',
      personaType: seed.personaType,
      audienceType: seed.audienceType ?? getAudienceTypeByPersona(seed.personaType),
      identityKind: seed.identityKind ?? getIdentityKindByPersona(seed.personaType),
      panelScope: seed.panelScope ?? getPanelScopeByPersona(seed.personaType),
      rolePresetId: seed.rolePresetId,
      roleDefinitionId: seed.roleDefinitionId ?? null,
      roleCode: seed.roleCode ?? seed.rolePresetId,
      roleName: seed.roleName ?? preset.id,
      rolePermissions: seed.rolePermissions ?? preset.permissions,
      accessLevel: seed.accessLevel ?? preset.accessLevel,
      status: seed.status,
      inviteState: seed.inviteState,
      mustChangePassword: seed.mustChangePassword ?? false,
      grantedPermissions: seed.grantedPermissions ?? [],
      revokedPermissions: seed.revokedPermissions ?? [],
      security: seed.security ?? {
        mfaEnabled: false,
        lastLoginAt: null,
        invitedBy: 'Access Control Desk',
        invitedAt: this.createTimestamp(),
        acceptedAt: null,
        verificationState: 'not_required'
      },
      avatarHue: seed.avatarHue ?? preset.accent,
      assignment: seed.assignment ?? {
        entityId: seed.entityId ?? null,
        entitySource: seed.source,
        vendorId: null,
        vendorName: '',
        branchId: null,
        branchName: '',
        region: '',
        city: ''
      },
      communication: seed.communication ?? this.createCommunicationProfile({ primaryEmail: seed.email ?? '' }),
      featureToggles: seed.featureToggles ?? [],
      entityPath: seed.entityPath,
      tags: seed.tags ?? []
    };
  }

  private createCommunicationProfile(
    config: Partial<Omit<DirectoryCommunicationProfile, 'emailOptIn'>> & {
      primaryEmail: string;
      emailOptIn?: Partial<DirectoryCommunicationProfile['emailOptIn']>;
    }
  ): DirectoryCommunicationProfile {
    return {
      primaryEmail: config.primaryEmail.trim().toLowerCase(),
      notificationEmails: this.unique((config.notificationEmails ?? [])
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)),
      replyTo: (config.replyTo ?? config.primaryEmail).trim().toLowerCase(),
      escalationEmails: this.unique((config.escalationEmails ?? [])
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)),
      preferredLocale: config.preferredLocale ?? 'bilingual',
      emailOptIn: {
        accessInvites: Boolean(config.emailOptIn?.accessInvites),
        branchAlerts: Boolean(config.emailOptIn?.branchAlerts),
        dispatchNotifications: Boolean(config.emailOptIn?.dispatchNotifications),
        complianceEmails: Boolean(config.emailOptIn?.complianceEmails),
        financeDigests: Boolean(config.emailOptIn?.financeDigests),
        supportEscalations: Boolean(config.emailOptIn?.supportEscalations),
        orderIssueUpdates: Boolean(config.emailOptIn?.orderIssueUpdates),
        marketingOptIn: Boolean(config.emailOptIn?.marketingOptIn)
      }
    };
  }

  private createLegacySeedUsers(): AdminUserRecord[] {
    return [];
  }

  private buildVendorBranches(vendor: VendorDetail): DirectoryBranchOption[] {
    const count = Math.max(1, Math.min(vendor.branchesCount || 1, 4));

    return Array.from({ length: count }, (_, index) => ({
      id: `${vendor.id}-branch-${index + 1}`,
      vendorId: vendor.id,
      vendorName: vendor.businessNameEn || vendor.businessNameAr,
      name: `Branch ${index + 1}`,
      region: vendor.region ?? '',
      city: vendor.city ?? ''
    }));
  }

  private getDefaultFeatureToggles(
    personaType: DirectoryPersonaType,
    sourceRecord?: CustomerDetailRecord | Driver
  ): DirectoryFeatureToggleId[] {
    switch (personaType) {
      case 'driver': {
        const driver = sourceRecord as Driver | undefined;
        return this.unique([
          'driver.dispatch_notifications',
          ...(driver && driver.verificationStatus !== VerificationStatus.Verified ? ['driver.compliance_emails' as const] : []),
          ...(driver && driver.collectionPaymentStatus !== 'critical' ? ['driver.finance_digests' as const] : [])
        ]);
      }
      case 'customer': {
        const customer = sourceRecord as CustomerDetailRecord | undefined;
        return this.unique([
          'customer.order_issue_updates',
          ...(customer && customer.reviewState !== 'none' ? ['customer.support_escalations' as const] : []),
          ...(customer && customer.segment !== 'watchlist' ? ['customer.marketing_opt_in' as const] : [])
        ]);
      }
      default:
        return [];
    }
  }

  private mapVendorStatus(status: VendorDetail['status']): DirectoryIdentityRecord['status'] {
    switch (status) {
      case 'Suspended':
        return 'suspended';
      case 'Pending':
        return 'invited';
      case 'Rejected':
        return 'inactive';
      default:
        return 'active';
    }
  }

  private mapCustomerStatus(customer: CustomerDetailRecord): DirectoryIdentityRecord['status'] {
    switch (customer.accountState) {
      case 'suspended':
        return 'suspended';
      case 'dormant':
        return 'inactive';
      default:
        return 'active';
    }
  }

  private mapDriverStatus(status: Driver['status']): DirectoryIdentityRecord['status'] {
    switch (status) {
      case 'Suspended':
        return 'suspended';
      case 'Offline':
        return 'inactive';
      default:
        return 'active';
    }
  }

  private mapDriverVerificationState(status: VerificationStatus): AdminUserRecord['security']['verificationState'] {
    switch (status) {
      case VerificationStatus.Verified:
        return 'verified';
      case VerificationStatus.UnderReview:
        return 'under_review';
      case VerificationStatus.Suspended:
        return 'suspended';
      default:
        return 'pending';
    }
  }

  private mapCityToRegion(city: string): string {
    const normalized = city.trim();
    const cityMap: Record<string, string> = {
      Riyadh: 'Central',
      Jeddah: 'West',
      Dammam: 'East',
      Khobar: 'East',
      Makkah: 'West',
      Madinah: 'West',
      Taif: 'West',
      Tabuk: 'North',
      'الرياض': 'Central',
      'جدة': 'West',
      'الدمام': 'East',
      'الخبر': 'East',
      'مكة': 'West',
      'المدينة': 'West',
      'الطائف': 'West',
      'تبوك': 'North'
    };

    return cityMap[normalized] ?? 'National';
  }

  private createRelativeTimestamp(date: Date): string {
    const timestamp = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);

    return timestamp.replace(',', '');
  }

  private getEntityPathByPersona(personaType: DirectoryPersonaType): string {
    switch (personaType) {
      case 'driver':
        return '/drivers';
      case 'customer':
        return '/customers';
      case 'vendor_owner':
      case 'vendor_company_manager':
      case 'vendor_branch_manager':
      case 'vendor_branch_employee':
      case 'vendor_finance':
      case 'vendor_support':
        return '/vendors';
      default:
        return '/admin-users';
    }
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private findRecipientsByPersona(
    users: AdminUserRecord[],
    personaTypes: DirectoryPersonaType[]
  ): AdminUserRecord[] {
    return users.filter((identity) => personaTypes.includes(identity.personaType));
  }

  private pushRecipient(target: Set<string>, email: string | null | undefined): void {
    const normalized = email?.trim().toLowerCase();
    if (normalized) {
      target.add(normalized);
    }
  }

  private unique<T>(values: T[]): T[] {
    return [...new Set(values)];
  }

  private uniqueBy<T>(values: T[], getKey: (value: T) => string): T[] {
    const seen = new Set<string>();
    return values.filter((value) => {
      const key = getKey(value);
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  private createTimestamp(): string {
    const now = new Date();
    const datePart = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(now);

    return `${datePart} ${timePart}`;
  }
}
