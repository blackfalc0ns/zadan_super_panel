import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminUserRecord,
  AdminUserSecurity,
  DirectoryCommunicationProfile,
  DirectoryEmailOptIn,
  DirectoryFeatureToggleId,
  DirectoryRolePresetId,
  getRolePresetById
} from '../../features/admin-users/models/admin-users.models';

export interface RoleDefinitionDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  identityRole: number | string; // enum representation
  panelScope: number | string; // enum representation
  permissions: string[];
  usersCount: number;
}

export interface PermissionDefinitionDto {
  id: string;
  key: string;
  name: string;
  domain: string;
  action: string;
  panelScope: number | string;
  description: string | null;
  isSensitive: boolean;
}

export interface RoleUpsertRequest {
  id?: string;
  code?: string;
  name: string;
  description?: string | null;
  identityRole: number | string;
  panelScope: number | string;
  permissions: string[];
  isActive?: boolean;
}

export interface UserEffectiveAccessDto {
  userId: string;
  roleCode: string;
  roleName: string;
  rolePermissions: string[];
  grantedOverrides: string[];
  revokedOverrides: string[];
  effectivePermissions: string[];
}

export interface AdminUserRecordDto {
  id: string;
  entityId: string | null;
  source: AdminUserRecord['source'];
  fullName: string;
  email: string;
  phone: string;
  department: string;
  team: string;
  personaType: AdminUserRecord['personaType'];
  audienceType: AdminUserRecord['audienceType'];
  identityKind: AdminUserRecord['identityKind'];
  panelScope: AdminUserRecord['panelScope'] | number | string;
  roleDefinitionId: string | null;
  roleCode: string;
  roleName: string;
  rolePermissions: string[];
  rolePresetId: string;
  accessLevel: string;
  status: AdminUserRecord['status'];
  inviteState: AdminUserRecord['inviteState'];
  mustChangePassword: boolean;
  grantedPermissions: string[];
  revokedPermissions: string[];
  security: Partial<AdminUserSecurity>;
  avatarHue: string;
  assignment: AdminUserRecord['assignment'];
  communication: Partial<DirectoryCommunicationProfile>;
  featureToggles: string[];
  entityPath: string;
  tags: string[];
}

export interface CreateAdminAccessUserRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  roleDefinitionId: string;
  panelScope: number;
  scopeType: number;
  scopeEntityId?: string | null;
  department?: string | null;
  team?: string | null;
  notes?: string | null;
}

export interface UpdateAdminAccessUserRequest {
  fullName: string;
  email: string;
  phone: string;
  roleDefinitionId: string;
  panelScope: number;
  scopeType: number;
  scopeEntityId?: string | null;
  department?: string | null;
  team?: string | null;
  status?: string | null;
  notes?: string | null;
  grantedPermissions: string[];
  revokedPermissions: string[];
  communication?: Partial<DirectoryCommunicationProfile>;
}

export interface PagedResultDto<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AccessAuditLogDto {
  id: string;
  actorUserId: string | null;
  actorFullName: string | null;
  actorEmail: string | null;
  targetUserId: string;
  action: string;
  summary: string;
  beforeJson: string | null;
  afterJson: string | null;
  createdAtUtc: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AccessApprovalReviewFieldDto {
  key: string;
  labelAr: string;
  labelEn: string;
  currentValue: unknown;
  requestedValue: unknown;
  isChanged: boolean;
  isDocument: boolean;
  isSensitive: boolean;
}

export interface AccessApprovalReviewDetailsDto {
  entityType: string;
  entityId: string;
  action: string;
  operation: string;
  fields: AccessApprovalReviewFieldDto[];
}

export interface AccessApprovalRequestDto {
  id: string;
  requestedByUserId: string;
  requestedByFullName: string | null;
  requestedByEmail: string | null;
  targetUserId: string | null;
  targetFullName: string | null;
  targetEmail: string | null;
  action: string;
  summary: string;
  payloadHash: string;
  payloadJson: string;
  status: string;
  createdAtUtc: string;
  decidedByUserId: string | null;
  decidedByFullName: string | null;
  decidedByEmail: string | null;
  decidedAtUtc: string | null;
  decisionNote: string | null;
  consumedAtUtc: string | null;
  reviewDetails: AccessApprovalReviewDetailsDto | null;
}

export interface AdminUsersQuery {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  roleDefinitionId?: string;
  panelScope?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAccessApiService {
  private readonly baseUrl = `${environment.apiUrl}/admin/access`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<RoleDefinitionDto[]> {
    return this.http.get<RoleDefinitionDto[]>(`${this.baseUrl}/roles`);
  }

  getUsers(query: AdminUsersQuery = {}): Observable<AdminUserRecord[]> {
    return this.getUsersPage(query).pipe(map((page) => page.items));
  }

  getUsersPage(query: AdminUsersQuery = {}): Observable<PagedResultDto<AdminUserRecord>> {
    const params = Object.fromEntries(
      Object.entries(query)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    );

    return this.http
      .get<PagedResultDto<AdminUserRecordDto> | AdminUserRecordDto[]>(`${this.baseUrl}/users`, { params })
      .pipe(map((response) => {
        const page = Array.isArray(response)
          ? { items: response, pageNumber: 1, pageSize: response.length, totalCount: response.length, totalPages: 1 }
          : response;

        return {
          ...page,
          items: page.items.map((user) => this.mapUserRecord(user))
        };
      }));
  }

  getUser(id: string): Observable<AdminUserRecord> {
    return this.http
      .get<AdminUserRecordDto>(`${this.baseUrl}/users/${id}`)
      .pipe(map((user) => this.mapUserRecord(user)));
  }

  createRole(data: RoleUpsertRequest): Observable<RoleDefinitionDto> {
    return this.http.post<RoleDefinitionDto>(`${this.baseUrl}/roles`, data);
  }

  updateRole(id: string, data: RoleUpsertRequest): Observable<RoleDefinitionDto> {
    return this.http.put<RoleDefinitionDto>(`${this.baseUrl}/roles/${id}`, data);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/roles/${id}`);
  }

  getPermissions(): Observable<PermissionDefinitionDto[]> {
    return this.http.get<PermissionDefinitionDto[]>(`${this.baseUrl}/permissions`);
  }

  createUser(data: CreateAdminAccessUserRequest): Observable<AdminUserRecord> {
    return this.http
      .post<AdminUserRecordDto>(`${this.baseUrl}/users`, data)
      .pipe(map((user) => this.mapUserRecord(user)));
  }

  updateUser(userId: string, data: UpdateAdminAccessUserRequest): Observable<AdminUserRecord> {
    return this.http
      .put<AdminUserRecordDto>(`${this.baseUrl}/users/${userId}`, data)
      .pipe(map((user) => this.mapUserRecord(user)));
  }

  resetTemporaryPassword(userId: string, temporaryPassword: string): Observable<AdminUserRecord> {
    return this.http
      .post<AdminUserRecordDto>(`${this.baseUrl}/users/${userId}/temporary-password`, { temporaryPassword })
      .pipe(map((user) => this.mapUserRecord(user)));
  }

  updateUserScope(userId: string, data: {
    roleDefinitionId: string;
    panelScope: number;
    scopeType: number;
    scopeEntityId?: string | null;
    notes?: string | null;
  }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/users/${userId}/scope`, data);
  }

  updateUserOverrides(userId: string, data: {
    grantedPermissions: string[];
    revokedPermissions: string[];
  }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/users/${userId}/overrides`, data);
  }

  getUserEffectiveAccess(userId: string): Observable<UserEffectiveAccessDto> {
    return this.http.get<UserEffectiveAccessDto>(`${this.baseUrl}/users/${userId}/effective-access`);
  }

  getUserAudit(userId: string): Observable<AccessAuditLogDto[]> {
    return this.http.get<AccessAuditLogDto[]>(`${this.baseUrl}/users/${userId}/audit`);
  }

  getApprovals(query: {
    status?: string;
    requestedByUserId?: string;
    targetUserId?: string;
    pageSize?: number;
  } = {}): Observable<AccessApprovalRequestDto[]> {
    const params = Object.fromEntries(
      Object.entries(query)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    );

    return this.http.get<AccessApprovalRequestDto[]>(`${this.baseUrl}/approvals`, { params });
  }

  approveApproval(id: string, note?: string | null): Observable<AccessApprovalRequestDto> {
    return this.http.post<AccessApprovalRequestDto>(`${this.baseUrl}/approvals/${id}/approve`, {
      note: note?.trim() || null
    });
  }

  rejectApproval(id: string, note?: string | null): Observable<AccessApprovalRequestDto> {
    return this.http.post<AccessApprovalRequestDto>(`${this.baseUrl}/approvals/${id}/reject`, {
      note: note?.trim() || null
    });
  }

  private mapUserRecord(dto: AdminUserRecordDto): AdminUserRecord {
    const panelScope = this.normalizePanelScope(dto.panelScope);
    const rolePresetId = this.normalizeRolePresetId(dto.rolePresetId, panelScope, dto.personaType);
    const preset = getRolePresetById(rolePresetId);
    const emailOptIn = this.buildEmailOptIn(dto.communication.emailOptIn);

    return {
      id: dto.id,
      entityId: dto.entityId,
      source: dto.source,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      department: dto.department || '',
      team: dto.team || '',
      personaType: dto.personaType,
      audienceType: dto.audienceType,
      identityKind: dto.identityKind,
      panelScope,
      roleDefinitionId: dto.roleDefinitionId ?? null,
      roleCode: dto.roleCode || dto.rolePresetId,
      roleName: dto.roleName || preset.id,
      rolePermissions: dto.rolePermissions ?? preset.permissions,
      rolePresetId,
      accessLevel: (dto.accessLevel as AdminUserRecord['accessLevel']) || preset.accessLevel,
      status: dto.status,
      inviteState: dto.inviteState,
      mustChangePassword: Boolean(dto.mustChangePassword),
      grantedPermissions: dto.grantedPermissions ?? [],
      revokedPermissions: dto.revokedPermissions ?? [],
      security: {
        mfaEnabled: Boolean(dto.security.mfaEnabled),
        lastLoginAt: dto.security.lastLoginAt ?? null,
        invitedBy: dto.security.invitedBy ?? 'System',
        invitedAt: dto.security.invitedAt ?? null,
        acceptedAt: dto.security.acceptedAt ?? null,
        verificationState: dto.security.verificationState as AdminUserSecurity['verificationState'] ?? 'pending'
      },
      avatarHue: dto.avatarHue,
      assignment: {
        entityId: dto.assignment?.entityId ?? dto.entityId,
        entitySource: dto.assignment?.entitySource ?? dto.source,
        vendorId: dto.assignment?.vendorId ?? null,
        vendorName: dto.assignment?.vendorName ?? '',
        branchId: dto.assignment?.branchId ?? null,
        branchName: dto.assignment?.branchName ?? '',
        region: dto.assignment?.region ?? '',
        city: dto.assignment?.city ?? ''
      },
      communication: {
        primaryEmail: dto.communication.primaryEmail ?? dto.email,
        notificationEmails: dto.communication.notificationEmails ?? [],
        replyTo: dto.communication.replyTo ?? dto.email,
        escalationEmails: dto.communication.escalationEmails ?? [],
        preferredLocale: (dto.communication.preferredLocale as DirectoryCommunicationProfile['preferredLocale']) ?? 'ar',
        emailOptIn,
        rawEmailOptInKeys: dto.communication.emailOptIn ? Object.keys(dto.communication.emailOptIn) : []
      },
      featureToggles: (dto.featureToggles ?? []) as DirectoryFeatureToggleId[],
      entityPath: dto.entityPath,
      tags: dto.tags ?? []
    };
  }

  private normalizeRolePresetId(
    rolePresetId: string,
    panelScope: AdminUserRecord['panelScope'],
    personaType: AdminUserRecord['personaType']
  ): DirectoryRolePresetId {
    switch (rolePresetId) {
      case 'super_admin_all':
        return 'super_admin';
      case 'admin_operations':
        return 'operations_lead';
      case 'vendor_branch_staff':
        return 'vendor_branch_employee';
      case 'vendor_owner':
      case 'vendor_branch_manager':
      case 'driver_account':
      case 'customer_account':
      case 'operations_lead':
      case 'super_admin':
      case 'vendor_company_manager':
      case 'vendor_branch_employee':
      case 'vendor_finance_manager':
      case 'vendor_support_manager':
      case 'risk_admin':
      case 'finance_admin':
      case 'support_admin':
        return rolePresetId;
      default:
        if (panelScope === 'vendor_panel' && personaType === 'vendor_company_manager') {
          return 'vendor_company_manager';
        }
        if (panelScope === 'vendor_panel') {
          return 'vendor_branch_employee';
        }
        if (panelScope === 'driver_app') {
          return 'driver_account';
        }
        if (panelScope === 'customer_app') {
          return 'customer_account';
        }
        return 'operations_lead';
    }
  }

  private normalizePanelScope(scope: AdminUserRecordDto['panelScope']): AdminUserRecord['panelScope'] {
    if (scope === 0 || scope === '0' || scope === 'SuperAdminPanel') return 'super_admin_panel';
    if (scope === 1 || scope === '1' || scope === 'VendorPanel') return 'vendor_panel';
    if (scope === 2 || scope === '2' || scope === 'DriverApp') return 'driver_app';
    if (scope === 3 || scope === '3' || scope === 'CustomerApp') return 'customer_app';
    if (scope === 'super_admin_panel' || scope === 'vendor_panel' || scope === 'driver_app' || scope === 'customer_app') {
      return scope;
    }
    return 'super_admin_panel';
  }

  private buildEmailOptIn(source: unknown): DirectoryEmailOptIn {
    const raw = (source ?? {}) as Partial<DirectoryEmailOptIn>;
    return {
      accessInvites: raw.accessInvites !== false,
      branchAlerts: raw.branchAlerts !== false,
      dispatchNotifications: raw.dispatchNotifications !== false,
      complianceEmails: raw.complianceEmails !== false,
      financeDigests: raw.financeDigests !== false,
      supportEscalations: raw.supportEscalations !== false,
      orderIssueUpdates: raw.orderIssueUpdates !== false,
      marketingOptIn: raw.marketingOptIn !== false
    };
  }
}
