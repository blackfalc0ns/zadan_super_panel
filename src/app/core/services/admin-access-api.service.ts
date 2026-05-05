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
  identityRole: number; // enum representation
  panelScope: number; // enum representation
  permissions: string[];
  usersCount: number;
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
  panelScope: AdminUserRecord['panelScope'];
  rolePresetId: string;
  accessLevel: string;
  status: AdminUserRecord['status'];
  inviteState: AdminUserRecord['inviteState'];
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

@Injectable({
  providedIn: 'root'
})
export class AdminAccessApiService {
  private readonly baseUrl = `${environment.apiUrl}/admin/access`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<RoleDefinitionDto[]> {
    return this.http.get<RoleDefinitionDto[]>(`${this.baseUrl}/roles`);
  }

  getUsers(): Observable<AdminUserRecord[]> {
    return this.http
      .get<AdminUserRecordDto[]>(`${this.baseUrl}/users`)
      .pipe(map((users) => users.map((user) => this.mapUserRecord(user))));
  }

  getUser(id: string): Observable<AdminUserRecord> {
    return this.http
      .get<AdminUserRecordDto>(`${this.baseUrl}/users/${id}`)
      .pipe(map((user) => this.mapUserRecord(user)));
  }

  createRole(data: any): Observable<RoleDefinitionDto> {
    return this.http.post<RoleDefinitionDto>(`${this.baseUrl}/roles`, data);
  }

  updateRole(id: string, data: any): Observable<RoleDefinitionDto> {
    return this.http.put<RoleDefinitionDto>(`${this.baseUrl}/roles/${id}`, data);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/roles/${id}`);
  }

  private mapUserRecord(dto: AdminUserRecordDto): AdminUserRecord {
    const rolePresetId = this.normalizeRolePresetId(dto.rolePresetId, dto.panelScope, dto.personaType);
    const preset = getRolePresetById(rolePresetId);
    const emailOptIn = this.buildEmailOptIn(dto.communication.emailOptIn);

    return {
      id: dto.id,
      entityId: dto.entityId,
      source: dto.source,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      department: dto.department || 'Operations',
      team: dto.team || 'Core',
      personaType: dto.personaType,
      audienceType: dto.audienceType,
      identityKind: dto.identityKind,
      panelScope: dto.panelScope,
      rolePresetId,
      accessLevel: preset.accessLevel,
      status: dto.status,
      inviteState: dto.inviteState,
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
        emailOptIn
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

  private buildEmailOptIn(source: unknown): DirectoryEmailOptIn {
    const raw = (source ?? {}) as Partial<DirectoryEmailOptIn>;
    return {
      accessInvites: Boolean(raw.accessInvites),
      branchAlerts: Boolean(raw.branchAlerts),
      dispatchNotifications: Boolean(raw.dispatchNotifications),
      complianceEmails: Boolean(raw.complianceEmails),
      financeDigests: Boolean(raw.financeDigests),
      supportEscalations: Boolean(raw.supportEscalations),
      orderIssueUpdates: Boolean(raw.orderIssueUpdates),
      marketingOptIn: Boolean(raw.marketingOptIn)
    };
  }
}
