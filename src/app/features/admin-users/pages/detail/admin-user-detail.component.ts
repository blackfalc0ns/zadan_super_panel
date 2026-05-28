import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { SearchableSelectComponent } from '@shared/components/ui/form-controls/select/searchable-select.component';
import { StatusPillComponent, StatusPillVariant } from '@shared/components/ui/status-pill/status-pill.component';
import { AdminAccessApiService, AccessAuditLogDto, PermissionDefinitionDto, RoleDefinitionDto } from '../../../../core/services/admin-access-api.service';
import {
  ADMIN_ROLE_PRESETS,
  AdminAccessLevel,
  AdminAccessStatus,
  AdminRolePreset,
  AdminRolePresetId,
  AdminUserRecord,
  DIRECTORY_LOCALE_LABELS,
  DIRECTORY_PANEL_LABELS,
  DIRECTORY_PERSONA_LABELS,
  DirectoryFeatureToggleDefinition,
  DirectoryFeatureToggleId,
  DirectoryPersonaType,
  PERMISSION_ACTION_LABELS,
  PermissionActionId,
  PermissionGroup,
  buildPermissionKey,
  getAudienceTypeByPersona,
  getDefaultRolePresetForPersona,
  getIdentityKindByPersona,
  getPanelScopeByPersona,
  getRolePresetById
} from '../../models/admin-users.models';
import { AdminUsersService } from '../../services/admin-users.service';

type CommunicationFlagKey = keyof AdminUserRecord['communication']['emailOptIn'];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AppPageHeaderComponent, SearchableSelectComponent, StatusPillComponent],
  templateUrl: './admin-user-detail.component.html',
  styleUrl: './admin-user-detail.component.scss'
})
export class AdminUserDetailComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  user: AdminUserRecord | null = null;
  isLoading = false;
  isAuditLoading = false;
  saveError = '';
  activeTab: 'general' | 'access' | 'communication' | 'audit' = 'general';
  permissionGroups: PermissionGroup[] = [];
  permissionDefinitions: PermissionDefinitionDto[] = [];
  availablePermissionKeys = new Set<string>();
  sensitivePermissionKeys = new Set<string>();
  auditLogs: AccessAuditLogDto[] = [];
  temporaryPassword = '';
  isResettingPassword = false;
  resetPasswordError = '';
  rolePresets: AdminRolePreset[] = [];
  roleDefinitions: RoleDefinitionDto[] = [];
  featureToggleDefinitions: DirectoryFeatureToggleDefinition[] = [];
  readonly permissionActionLabels = PERMISSION_ACTION_LABELS;
  notificationEmailsText = '';
  escalationEmailsText = '';

  readonly statusOptions: Array<{ value: AdminAccessStatus; labelKey: string }> = [
    { value: 'active', labelKey: 'ADMIN_USERS.STATUS.ACTIVE' },
    { value: 'invited', labelKey: 'ADMIN_USERS.STATUS.INVITED' },
    { value: 'suspended', labelKey: 'ADMIN_USERS.STATUS.SUSPENDED' },
    { value: 'inactive', labelKey: 'ADMIN_USERS.STATUS.INACTIVE' }
  ];

  readonly accessLevelOptions: Array<{ value: AdminAccessLevel; labelKey: string }> = [
    { value: 'full', labelKey: 'ADMIN_USERS.ACCESS_LEVEL.FULL' },
    { value: 'restricted', labelKey: 'ADMIN_USERS.ACCESS_LEVEL.RESTRICTED' },
    { value: 'observer', labelKey: 'ADMIN_USERS.ACCESS_LEVEL.OBSERVER' }
  ];

  readonly inviteStateOptions: Array<{ value: AdminUserRecord['inviteState']; labelKey: string }> = [
    { value: 'draft', labelKey: 'ADMIN_USERS.INVITE.DRAFT' },
    { value: 'pending', labelKey: 'ADMIN_USERS.INVITE.PENDING' },
    { value: 'accepted', labelKey: 'ADMIN_USERS.INVITE.ACCEPTED' },
    { value: 'expired', labelKey: 'ADMIN_USERS.INVITE.EXPIRED' }
  ];

  readonly personaOptions = Object.entries(DIRECTORY_PERSONA_LABELS).map(([value, labelKey]) => ({
    value: value as DirectoryPersonaType,
    labelKey
  }));

  readonly localeOptions = Object.entries(DIRECTORY_LOCALE_LABELS).map(([value, labelKey]) => ({
    value,
    labelKey
  }));

  readonly communicationFlagOptions: Array<{ id: CommunicationFlagKey; labelKey: string; descriptionKey: string }> = [
    {
      id: 'accessInvites',
      labelKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.ACCESS_INVITES.LABEL',
      descriptionKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.ACCESS_INVITES.DESC'
    },
    {
      id: 'branchAlerts',
      labelKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.BRANCH_ALERTS.LABEL',
      descriptionKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.BRANCH_ALERTS.DESC'
    },
    {
      id: 'dispatchNotifications',
      labelKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.DISPATCH_NOTIFICATIONS.LABEL',
      descriptionKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.DISPATCH_NOTIFICATIONS.DESC'
    },
    {
      id: 'complianceEmails',
      labelKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.COMPLIANCE_EMAILS.LABEL',
      descriptionKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.COMPLIANCE_EMAILS.DESC'
    },
    {
      id: 'financeDigests',
      labelKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.FINANCE_DIGESTS.LABEL',
      descriptionKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.FINANCE_DIGESTS.DESC'
    },
    {
      id: 'supportEscalations',
      labelKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.SUPPORT_ESCALATIONS.LABEL',
      descriptionKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.SUPPORT_ESCALATIONS.DESC'
    },
    {
      id: 'orderIssueUpdates',
      labelKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.ORDER_UPDATES.LABEL',
      descriptionKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.ORDER_UPDATES.DESC'
    },
    {
      id: 'marketingOptIn',
      labelKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.MARKETING_OPT_IN.LABEL',
      descriptionKey: 'ADMIN_USERS.COMMUNICATION_FLAGS.MARKETING_OPT_IN.DESC'
    }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly adminAccessApiService: AdminAccessApiService,
    private readonly adminUsersService: AdminUsersService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  get selectedPreset(): AdminRolePreset {
    return this.user ? getRolePresetById(this.user.rolePresetId) : ADMIN_ROLE_PRESETS[0];
  }

  get effectivePermissionCount(): number {
    return this.user ? this.adminUsersService.getEffectivePermissions(this.user).length : 0;
  }

  get customPermissionCount(): number {
    return this.user ? this.adminUsersService.getCustomPermissionCount(this.user) : 0;
  }

  get grantedOverrideCount(): number {
    return this.user?.grantedPermissions.length ?? 0;
  }

  get revokedOverrideCount(): number {
    return this.user?.revokedPermissions.length ?? 0;
  }

  get headerStatusVariant(): StatusPillVariant {
    const status = this.user?.status ?? 'inactive';
    const variants: Record<AdminAccessStatus, StatusPillVariant> = {
      active: 'success',
      invited: 'warning',
      suspended: 'danger',
      inactive: 'neutral'
    };

    return variants[status];
  }

  get isOperationalIdentity(): boolean {
    return this.user?.identityKind === 'operational';
  }

  get isVendorIdentity(): boolean {
    return this.user?.panelScope === 'vendor_panel';
  }

  get panelLabelKey(): string {
    return this.user ? DIRECTORY_PANEL_LABELS[this.user.panelScope] : 'ADMIN_USERS.PANELS.SUPER_ADMIN_PANEL';
  }

  get personaLabelKey(): string {
    return this.user ? DIRECTORY_PERSONA_LABELS[this.user.personaType] : 'ADMIN_USERS.PERSONAS.SUPER_ADMIN_STAFF';
  }

  get verificationLabelKey(): string {
    return this.user ? `ADMIN_USERS.VERIFICATION.${this.user.security.verificationState.toUpperCase()}` : 'ADMIN_USERS.VERIFICATION.PENDING';
  }

  get verificationVariant(): StatusPillVariant {
    if (!this.user) {
      return 'neutral';
    }

    switch (this.user.security.verificationState) {
      case 'verified':
        return 'success';
      case 'pending':
      case 'under_review':
        return 'warning';
      case 'suspended':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  get vendorOptions(): Array<{ id: string; name: string }> {
    return this.adminUsersService.getVendorOptions().map((vendor) => ({ id: vendor.id, name: vendor.name }));
  }

  get branchOptions(): Array<{ id: string; name: string }> {
    return this.adminUsersService.getBranchOptions(this.user?.assignment.vendorId ?? null)
      .map((branch) => ({ id: branch.id, name: branch.name }));
  }

  get visibleCommunicationFlags(): Array<{ id: CommunicationFlagKey; labelKey: string; descriptionKey: string }> {
    const currentUser = this.user;

    if (!currentUser) {
      return [];
    }

    return this.communicationFlagOptions.filter((flag) => {
      if (currentUser.identityKind === 'operational') {
        return ['accessInvites', 'branchAlerts', 'supportEscalations', 'financeDigests'].includes(flag.id);
      }

      if (currentUser.personaType === 'driver') {
        return ['dispatchNotifications', 'complianceEmails', 'financeDigests', 'supportEscalations'].includes(flag.id);
      }

      return ['marketingOptIn', 'orderIssueUpdates', 'supportEscalations'].includes(flag.id);
    });
  }

  saveUser(): void {
    if (!this.user) {
      return;
    }

    this.applyCommunicationEditors();
    const panelScope = this.mapPanelScopeToNumber(this.user.panelScope);
    this.saveError = '';
    this.isLoading = true;
    this.adminAccessApiService.updateUser(this.user.id, {
      fullName: this.user.fullName,
      email: this.user.email,
      phone: this.user.phone,
      roleDefinitionId: this.user.roleDefinitionId ?? '',
      panelScope,
      scopeType: this.resolveScopeType(panelScope, this.user),
      scopeEntityId: this.resolveScopeEntityId(panelScope, this.user),
      department: this.user.department || null,
      team: this.user.team || null,
      status: this.user.status,
      notes: null,
      grantedPermissions: this.user.grantedPermissions,
      revokedPermissions: this.user.revokedPermissions
    }).subscribe({
      next: (updatedUser) => {
        this.cdr.markForCheck();
        this.user = updatedUser;
        this.isLoading = false;
        this.refreshSupportingData();
        this.loadAudit(updatedUser.id);
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to save access user', err);
        this.saveError = err.error?.message || err.error?.title || 'Failed to save access changes.';
        this.isLoading = false;
      }
    });
  }

  resetToPreset(): void {
    if (!this.user) {
      return;
    }

    this.user.grantedPermissions = [];
    this.user.revokedPermissions = [];
    this.refreshSupportingData();
  }

  resendInvite(): void {
    if (!this.user) {
      return;
    }

    this.user.inviteState = 'pending';
    if (this.user.status !== 'suspended') {
      this.user.status = 'invited';
    }
    this.saveUser();
    this.refreshSupportingData();
  }

  toggleSuspension(): void {
    if (!this.user) {
      return;
    }

    this.user.status = this.user.status === 'suspended' ? 'active' : 'suspended';
    this.saveUser();
  }

  resetTemporaryPassword(): void {
    if (!this.user || !this.temporaryPassword.trim()) {
      return;
    }

    this.isResettingPassword = true;
    this.resetPasswordError = '';
    this.adminAccessApiService.resetTemporaryPassword(this.user.id, this.temporaryPassword).subscribe({
      next: (updatedUser) => {
        this.cdr.markForCheck();
        this.user = updatedUser;
        this.temporaryPassword = '';
        this.isResettingPassword = false;
        this.refreshSupportingData();
        this.loadAudit(updatedUser.id);
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to reset temporary password', err);
        this.resetPasswordError = err.error?.message || err.error?.title || 'Failed to reset temporary password.';
        this.isResettingPassword = false;
      }
    });
  }

  duplicateAsNewRole(): void {
    if (!this.user || !this.isOperationalIdentity) {
      return;
    }

    this.router.navigate(['/admin-users']);
  }

  onPresetChange(rolePresetId: AdminRolePresetId): void {
    if (!this.user) {
      return;
    }

    const preset = getRolePresetById(rolePresetId);
    this.user.rolePresetId = rolePresetId;
    this.user.accessLevel = preset.accessLevel;
  }

  onRoleDefinitionChange(roleDefinitionId: string): void {
    if (!this.user) {
      return;
    }

    const role = this.roleDefinitions.find((entry) => entry.id === roleDefinitionId);
    if (!role) {
      return;
    }

    this.user.roleDefinitionId = role.id;
    this.user.roleCode = role.code;
    this.user.roleName = role.name;
    this.user.rolePermissions = role.permissions;
    this.user.panelScope = this.mapPanelScopeToString(role.panelScope);
    this.user.rolePresetId = this.mapRoleCodeToPreset(role.code);
    this.user.accessLevel = getRolePresetById(this.user.rolePresetId).accessLevel;
    this.user.grantedPermissions = [];
    this.user.revokedPermissions = [];
    this.refreshSupportingData();
  }

  onPersonaChange(personaType: DirectoryPersonaType): void {
    if (!this.user) {
      return;
    }

    this.user.personaType = personaType;
    this.user.audienceType = getAudienceTypeByPersona(personaType);
    this.user.panelScope = getPanelScopeByPersona(personaType);
    this.user.identityKind = getIdentityKindByPersona(personaType);
    this.user.rolePresetId = getDefaultRolePresetForPersona(personaType);
    this.user.accessLevel = getRolePresetById(this.user.rolePresetId).accessLevel;
    if (this.user.panelScope !== 'vendor_panel') {
      this.user.assignment.vendorId = null;
      this.user.assignment.vendorName = '';
      this.user.assignment.branchId = null;
      this.user.assignment.branchName = '';
    }
    this.refreshSupportingData();
  }

  onVendorChange(vendorId: string): void {
    if (!this.user) {
      return;
    }

    const vendor = this.adminUsersService.getVendorOptions().find((entry) => entry.id === vendorId);
    this.user.assignment.vendorId = vendorId || null;
    this.user.assignment.vendorName = vendor?.name ?? '';
    this.user.assignment.region = vendor?.region ?? this.user.assignment.region;
    this.user.assignment.city = vendor?.city ?? this.user.assignment.city;
    this.user.assignment.branchId = null;
    this.user.assignment.branchName = '';
  }

  onBranchChange(branchId: string): void {
    if (!this.user) {
      return;
    }

    const branch = this.adminUsersService.getBranchOptions(this.user.assignment.vendorId)
      .find((entry) => entry.id === branchId);

    this.user.assignment.branchId = branchId || null;
    this.user.assignment.branchName = branch?.name ?? '';
    this.user.assignment.region = branch?.region ?? this.user.assignment.region;
    this.user.assignment.city = branch?.city ?? this.user.assignment.city;
  }

  hasPermission(groupId: PermissionGroup['id'], action: PermissionActionId): boolean {
    if (!this.user) {
      return false;
    }

    return this.adminUsersService
      .getEffectivePermissions(this.user)
      .includes(buildPermissionKey(groupId, action));
  }

  togglePermission(groupId: PermissionGroup['id'], action: PermissionActionId, enabled: boolean): void {
    if (!this.user) {
      return;
    }

    const key = buildPermissionKey(groupId, action);
    if (!this.availablePermissionKeys.has(key)) {
      return;
    }

    const basePermissions = new Set(this.user.rolePermissions?.length ? this.user.rolePermissions : getRolePresetById(this.user.rolePresetId).permissions);
    const hasBasePermission = basePermissions.has(key);

    this.user.grantedPermissions = this.user.grantedPermissions.filter((permission) => permission !== key);
    this.user.revokedPermissions = this.user.revokedPermissions.filter((permission) => permission !== key);

    if (enabled && !hasBasePermission) {
      this.user.grantedPermissions = [...this.user.grantedPermissions, key];
    }

    if (!enabled && hasBasePermission) {
      this.user.revokedPermissions = [...this.user.revokedPermissions, key];
    }
  }

  getGroupEnabledCount(group: PermissionGroup): number {
    return group.actions.filter((action) => this.isPermissionAvailable(group.id, action) && this.hasPermission(group.id, action)).length;
  }

  getGroupAvailableActions(group: PermissionGroup): PermissionActionId[] {
    return group.actions.filter((action) => this.isPermissionAvailable(group.id, action));
  }

  isPermissionAvailable(groupId: PermissionGroup['id'], action: PermissionActionId): boolean {
    return this.availablePermissionKeys.has(buildPermissionKey(groupId, action));
  }

  isSensitivePermission(groupId: PermissionGroup['id'], action: PermissionActionId): boolean {
    return this.sensitivePermissionKeys.has(buildPermissionKey(groupId, action));
  }

  hasFeatureToggle(toggleId: DirectoryFeatureToggleId): boolean {
    return Boolean(this.user?.featureToggles.includes(toggleId));
  }

  toggleFeatureToggle(toggleId: DirectoryFeatureToggleId, enabled: boolean): void {
    if (!this.user) {
      return;
    }

    const current = new Set(this.user.featureToggles);
    if (enabled) {
      current.add(toggleId);
    } else {
      current.delete(toggleId);
    }

    this.user.featureToggles = [...current];
  }

  toggleCommunicationFlag(flag: CommunicationFlagKey, enabled: boolean): void {
    if (!this.user) {
      return;
    }

    this.user.communication.emailOptIn[flag] = enabled;
  }

  navigateBack(): void {
    this.router.navigate(['/admin-users']);
  }

  private loadUser(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.user = null;
      this.refreshSupportingData();
      return;
    }

    this.isLoading = true;
    this.adminAccessApiService.getUser(id).subscribe({
      next: (user) => {
        this.cdr.markForCheck();
        this.user = user;
        this.isLoading = false;
        this.refreshSupportingData();
        this.loadRoles();
        this.loadPermissions();
        this.loadAudit(user.id);
      },
      error: () => {
        this.cdr.markForCheck();
        this.adminAccessApiService.getUsers().subscribe({
          next: (users) => {
        this.cdr.markForCheck();
            this.user = users.find((entry) => entry.id === id) ?? this.adminUsersService.getUserById(id) ?? null;
            this.isLoading = false;
            this.refreshSupportingData();
            this.loadRoles();
            this.loadPermissions();
            if (this.user) this.loadAudit(this.user.id);
          },
          error: () => {
        this.cdr.markForCheck();
            this.user = this.adminUsersService.getUserById(id) ?? null;
            this.isLoading = false;
            this.refreshSupportingData();
            this.loadRoles();
            this.loadPermissions();
            if (this.user) this.loadAudit(this.user.id);
          }
        });
      }
    });
  }

  private refreshSupportingData(): void {
    if (!this.user) {
      this.permissionGroups = [];
      this.rolePresets = [];
      this.featureToggleDefinitions = [];
      return;
    }

    this.rolePresets = this.adminUsersService.getAvailableRolePresets(this.user);
    this.permissionGroups = this.adminUsersService
      .getPermissionGroups(this.user.panelScope, this.user.identityKind)
      .filter((group) => group.actions.some((action) => this.isPermissionAvailable(group.id, action)));
    this.featureToggleDefinitions = this.adminUsersService.getFeatureToggleDefinitions(this.user.personaType);
    this.notificationEmailsText = this.user.communication.notificationEmails.join(', ');
    this.escalationEmailsText = this.user.communication.escalationEmails.join(', ');
  }

  private applyCommunicationEditors(): void {
    if (!this.user) {
      return;
    }

    this.user.communication.notificationEmails = this.parseRecipients(this.notificationEmailsText);
    this.user.communication.escalationEmails = this.parseRecipients(this.escalationEmailsText);
  }

  private parseRecipients(value: string): string[] {
    return value
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
  }

  get mappedVendorOptions(): any[] {
    return [
        {value: null, labelKey: 'ADMIN_USERS.FILTERS.ALL'},
        ...this.vendorOptions.map((v: any) => ({value: v.id, label: v.name}))
    ];
  }
  get mappedBranchOptions(): any[] {
    return [
        {value: null, labelKey: 'ADMIN_USERS.FILTERS.ALL'},
        ...this.branchOptions.map((v: any) => ({value: v.id, label: v.name}))
    ];
  }

  private loadRoles(): void {
    this.adminAccessApiService.getRoles().subscribe({
      next: (roles) => {
        this.cdr.markForCheck();
        this.roleDefinitions = roles;
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to load role definitions', err);
        this.roleDefinitions = [];
      }
    });
  }

  private loadPermissions(): void {
    this.adminAccessApiService.getPermissions().subscribe({
      next: (permissions) => {
        this.cdr.markForCheck();
        this.permissionDefinitions = permissions;
        this.availablePermissionKeys = new Set(permissions.map((permission) => permission.key));
        this.sensitivePermissionKeys = new Set(permissions.filter((permission) => permission.isSensitive).map((permission) => permission.key));
        this.refreshSupportingData();
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to load permission definitions', err);
        this.permissionDefinitions = [];
        this.availablePermissionKeys = new Set<string>();
        this.sensitivePermissionKeys = new Set<string>();
        this.refreshSupportingData();
      }
    });
  }

  private loadAudit(userId: string): void {
    this.isAuditLoading = true;
    this.adminAccessApiService.getUserAudit(userId).subscribe({
      next: (logs) => {
        this.cdr.markForCheck();
        this.auditLogs = logs;
        this.isAuditLoading = false;
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to load audit logs', err);
        this.auditLogs = [];
        this.isAuditLoading = false;
      }
    });
  }

  get rolePresetOptions(): Array<{ value: AdminRolePresetId; labelKey: string }> {
    return this.rolePresets.map((preset) => ({
      value: preset.id,
      labelKey: preset.nameKey
    }));
  }

  get roleDefinitionOptions(): Array<{ value: string; label: string }> {
    return this.roleDefinitions
      .filter((role) => role.isActive && this.mapPanelScopeToString(role.panelScope) === this.user?.panelScope)
      .map((role) => ({
        value: role.id,
        label: role.name
      }));
  }

  private mapPanelScopeToNumber(scope: AdminUserRecord['panelScope']): number {
    switch (scope) {
      case 'vendor_panel': return 1;
      case 'driver_app': return 2;
      case 'customer_app': return 3;
      default: return 0;
    }
  }

  private mapPanelScopeToString(scope: RoleDefinitionDto['panelScope']): AdminUserRecord['panelScope'] {
    if (scope === 1 || scope === '1' || scope === 'VendorPanel' || scope === 'vendor_panel') return 'vendor_panel';
    if (scope === 2 || scope === '2' || scope === 'DriverApp' || scope === 'driver_app') return 'driver_app';
    if (scope === 3 || scope === '3' || scope === 'CustomerApp' || scope === 'customer_app') return 'customer_app';
    return 'super_admin_panel';
  }

  private resolveScopeType(panelScope: number, user: AdminUserRecord): number {
    if (panelScope === 1) return user.assignment.branchId ? 2 : 1;
    if (panelScope === 2) return 3;
    if (panelScope === 3) return 4;
    return 0;
  }

  private resolveScopeEntityId(panelScope: number, user: AdminUserRecord): string | null {
    if (panelScope === 1) return user.assignment.branchId ?? user.assignment.vendorId ?? user.entityId ?? null;
    if (panelScope === 2) return user.entityId ?? user.assignment.entityId ?? null;
    return null;
  }

  private defaultScopeTypeForPanel(panelScope: number): number {
    if (panelScope === 1) return 1;
    if (panelScope === 2) return 3;
    if (panelScope === 3) return 4;
    return 0;
  }

  private mapRoleCodeToPreset(code: string): AdminRolePresetId {
    switch (code) {
      case 'super_admin_all': return 'super_admin';
      case 'admin_operations': return 'operations_lead';
      case 'vendor_branch_staff': return 'vendor_branch_employee';
      case 'vendor_owner':
      case 'vendor_company_manager':
      case 'vendor_branch_manager':
      case 'vendor_finance_manager':
      case 'vendor_support_manager':
      case 'driver_account':
      case 'customer_account':
      case 'risk_admin':
      case 'finance_admin':
      case 'support_admin':
        return code;
      default:
        return this.user?.panelScope === 'vendor_panel' ? 'vendor_branch_employee' : 'operations_lead';
    }
  }
}
