import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DIRECTORY_PANEL_LABELS,
  DirectoryPanelScope,
  PERMISSION_ACTION_LABELS,
  PERMISSION_GROUPS,
  PermissionActionId,
  PermissionDomainId,
  PermissionGroup,
  buildPermissionKey
} from '../../models/admin-users.models';
import { StatusPillComponent } from '@shared/components/ui/status-pill/status-pill.component';
import { DeleteConfirmationModalComponent } from '@shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { AdminAccessApiService, PermissionDefinitionDto, RoleDefinitionDto } from '../../../../core/services/admin-access-api.service';
import { ToastService } from '@shared/services/toast.service';
import { buildSafeApiErrorLog, describeApiError } from '@shared/utils/api-error.util';

interface CustomRole {
  id: string;
  code: string;
  name: string;
  description: string;
  panelScope: DirectoryPanelScope;
  identityRole: number;
  permissions: string[];
  accent: string;
  isSystem: boolean;
  usersCount: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-roles-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, StatusPillComponent, DeleteConfirmationModalComponent],
  templateUrl: './roles-management.component.html',
  styleUrl: './roles-management.component.scss'
})
export class RolesManagementComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  roles: CustomRole[] = [];
  selectedRole: CustomRole | null = null;
  editingPermissions = false;
  showModal = false;
  isDeleteModalOpen = false;
  roleToDelete: CustomRole | null = null;
  isDeleting = false;
  isSavingPermissions = false;
  isCreatingRole = false;
  deleteError = '';
  pageError = '';
  createRoleError = '';
  activeDetailTab: 'permissions' | 'users' = 'permissions';

  readonly detailTabs = [
    { id: 'permissions' as const, labelKey: 'ADMIN_USERS.ROLES_MANAGEMENT.TABS.PERMISSIONS', icon: 'key' },
    { id: 'users' as const, labelKey: 'ADMIN_USERS.ROLES_MANAGEMENT.TABS.USERS', icon: 'group' }
  ];

  newRoleName = '';
  newRoleDescription = '';
  permissionDefinitions: PermissionDefinitionDto[] = [];
  availablePermissionKeys = new Set<string>();
  permissionActions: PermissionActionId[] = ['view', 'create', 'edit', 'approve', 'export', 'manage_settings'];

  private customRoles: CustomRole[] = [];
  isLoading = false;

  private readonly systemRoleTranslationMap: Record<string, string> = {
    super_admin_all: 'SUPER_ADMIN',
    admin_operations: 'OPERATIONS_LEAD',
    risk_admin: 'RISK_ADMIN',
    finance_admin: 'FINANCE_ADMIN',
    support_admin: 'SUPPORT_ADMIN'
  };

  constructor(
    private readonly router: Router,
    private readonly accessApi: AdminAccessApiService,
    private readonly translate: TranslateService,
    private readonly toastService: ToastService
  ) {}

  get isRTL(): boolean {
    return this.translate.currentLang === 'ar';
  }

  get systemRolesCount(): number {
    return this.roles.filter((role) => role.isSystem).length;
  }

  get customRolesCount(): number {
    return this.roles.filter((role) => !role.isSystem).length;
  }

  trackByRoleId(_index: number, role: CustomRole): string {
    return role.id;
  }

  ngOnInit(): void {
    this.loadPermissions();
    this.loadRoles();
  }

  loadPermissions(): void {
    this.accessApi.getPermissions().subscribe({
      next: (permissions) => {
        this.cdr.markForCheck();
        this.permissionDefinitions = permissions.filter(
          (permission) => this.mapPanelScopeNumToString(permission.panelScope) === 'super_admin_panel'
        );
        this.availablePermissionKeys = new Set(this.permissionDefinitions.map((permission) => permission.key));
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Error loading permissions', buildSafeApiErrorLog(err));
        this.permissionDefinitions = [];
        this.availablePermissionKeys = new Set<string>();
        this.toastService.error(
          describeApiError(err, this.translate, {
            fallbackKey: 'ADMIN_USERS.ROLES_MANAGEMENT.MESSAGES.LOAD_PERMISSIONS_FAILED'
          }),
          this.translate.instant('ADMIN_USERS.ROLES_MANAGEMENT.TITLE')
        );
      }
    });
  }

  loadRoles(): void {
    this.isLoading = true;
    this.pageError = '';

    this.accessApi.getRoles().subscribe({
      next: (dtoRoles) => {
        this.cdr.markForCheck();
        this.customRoles = dtoRoles
          .filter((dto) => this.isSuperAdminPanelRole(dto))
          .map((dto) => this.mapDtoToCustomRole(dto));
        this.roles = [...this.customRoles];
        this.isLoading = false;
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Error loading roles', buildSafeApiErrorLog(err));
        this.pageError = describeApiError(err, this.translate, {
          fallbackKey: 'ADMIN_USERS.ROLES_MANAGEMENT.MESSAGES.LOAD_ROLES_FAILED'
        });
        this.isLoading = false;
      }
    });
  }

  private mapDtoToCustomRole(dto: RoleDefinitionDto): CustomRole {
    const accents = ['#127c8c', '#2563eb', '#dc2626', '#059669', '#7c3aed', '#d97706'];
    const index = Array.from(dto.id).reduce((acc, char) => acc + char.charCodeAt(0), 0) % accents.length;

    return {
      id: dto.id,
      code: dto.code,
      name: dto.name,
      description: dto.description || '',
      panelScope: 'super_admin_panel',
      identityRole: this.mapIdentityRoleToNumber(dto.identityRole),
      permissions: dto.permissions,
      accent: accents[index],
      isSystem: dto.isSystem,
      usersCount: dto.usersCount
    };
  }

  private mapPanelScopeNumToString(scope: number | string): DirectoryPanelScope {
    switch (scope) {
      case 0:
      case '0':
      case 'SuperAdminPanel':
      case 'super_admin_panel':
        return 'super_admin_panel';
      case 1:
      case '1':
      case 'VendorPanel':
      case 'vendor_panel':
        return 'vendor_panel';
      case 2:
      case '2':
      case 'DriverApp':
      case 'driver_app':
        return 'driver_app';
      case 3:
      case '3':
      case 'CustomerApp':
      case 'customer_app':
        return 'customer_app';
      default:
        return 'super_admin_panel';
    }
  }

  private mapIdentityRoleToNumber(role: number | string): number {
    if (typeof role === 'number') return role;
    if (/^\d+$/.test(role)) return Number(role);
    switch (role) {
      case 'Customer':
        return 0;
      case 'Vendor':
        return 1;
      case 'VendorStaff':
        return 2;
      case 'Driver':
        return 3;
      case 'Admin':
        return 4;
      case 'SuperAdmin':
        return 5;
      default:
        return 4;
    }
  }

  private isSuperAdminPanelRole(dto: RoleDefinitionDto): boolean {
    return this.mapPanelScopeNumToString(dto.panelScope) === 'super_admin_panel';
  }

  selectRole(role: CustomRole): void {
    this.selectedRole = role;
    this.activeDetailTab = 'permissions';
    this.editingPermissions = !role.isSystem;
  }

  getFilteredGroups(): PermissionGroup[] {
    if (!this.selectedRole) return [];
    return PERMISSION_GROUPS.filter(
      (group) =>
        group.panelScopes.includes('super_admin_panel') && this.getAvailableGroupActions(group).length > 0
    );
  }

  hasPermission(domain: PermissionDomainId, action: PermissionActionId): boolean {
    if (!this.selectedRole) return false;
    return this.selectedRole.permissions.includes(buildPermissionKey(domain, action));
  }

  isPermissionAvailable(domain: PermissionDomainId, action: PermissionActionId): boolean {
    return this.availablePermissionKeys.has(buildPermissionKey(domain, action));
  }

  getAvailableGroupActions(group: PermissionGroup): PermissionActionId[] {
    return group.actions.filter((action) => this.isPermissionAvailable(group.id, action));
  }

  togglePermission(domain: PermissionDomainId, action: PermissionActionId): void {
    if (!this.selectedRole || this.selectedRole.isSystem || !this.isPermissionAvailable(domain, action)) return;
    this.editingPermissions = true;
    const key = buildPermissionKey(domain, action);
    const index = this.selectedRole.permissions.indexOf(key);
    if (index >= 0) {
      this.selectedRole.permissions.splice(index, 1);
    } else {
      this.selectedRole.permissions.push(key);
    }
  }

  toggleAllGroupPermissions(group: PermissionGroup): void {
    if (!this.selectedRole || this.selectedRole.isSystem) return;
    this.editingPermissions = true;
    const actions = this.getAvailableGroupActions(group);
    const allEnabled = actions.every((action) => this.hasPermission(group.id, action));
    actions.forEach((action) => {
      const key = buildPermissionKey(group.id, action);
      const index = this.selectedRole!.permissions.indexOf(key);
      if (allEnabled) {
        if (index >= 0) this.selectedRole!.permissions.splice(index, 1);
      } else if (index < 0) {
        this.selectedRole!.permissions.push(key);
      }
    });
  }

  isGroupFullyEnabled(group: PermissionGroup): boolean {
    if (!this.selectedRole) return false;
    const actions = this.getAvailableGroupActions(group);
    return actions.length > 0 && actions.every((action) => this.hasPermission(group.id, action));
  }

  getGroupEnabledCount(group: PermissionGroup): number {
    if (!this.selectedRole) return 0;
    return this.getAvailableGroupActions(group).filter((action) => this.hasPermission(group.id, action)).length;
  }

  savePermissions(): void {
    if (!this.selectedRole || this.selectedRole.isSystem) return;
    this.isSavingPermissions = true;
    const payload = {
      id: this.selectedRole.id,
      name: this.selectedRole.name,
      description: this.selectedRole.description,
      identityRole: this.selectedRole.identityRole,
      panelScope: 0,
      permissions: this.selectedRole.permissions.filter((permission) => this.availablePermissionKeys.has(permission))
    };

    this.accessApi.updateRole(this.selectedRole.id, payload).subscribe({
      next: (response) => {
        this.cdr.markForCheck();
        const updatedRole = this.mapDtoToCustomRole(response);
        const index = this.customRoles.findIndex((role) => role.id === updatedRole.id);
        if (index >= 0) this.customRoles[index] = updatedRole;
        this.roles = [...this.customRoles];
        this.selectedRole = updatedRole;
        this.editingPermissions = false;
        this.isSavingPermissions = false;
        this.toastService.success(
          this.translate.instant('ADMIN_USERS.ROLES_MANAGEMENT.MESSAGES.SAVE_SUCCESS'),
          this.translate.instant('ADMIN_USERS.ROLES_MANAGEMENT.TITLE')
        );
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Error saving role', buildSafeApiErrorLog(err));
        this.isSavingPermissions = false;
        this.toastService.error(
          describeApiError(err, this.translate, {
            fallbackKey: 'ADMIN_USERS.ROLES_MANAGEMENT.MESSAGES.SAVE_FAILED',
            codePrefix: 'ADMIN_USERS.ROLES_MANAGEMENT.ERROR_CODES'
          }),
          this.translate.instant('ADMIN_USERS.ROLES_MANAGEMENT.TITLE')
        );
      }
    });
  }

  openCreateModal(): void {
    this.newRoleName = '';
    this.newRoleDescription = '';
    this.createRoleError = '';
    this.showModal = true;
  }

  createRole(): void {
    if (!this.newRoleName.trim()) return;
    this.isCreatingRole = true;
    this.createRoleError = '';
    const payload = {
      name: this.newRoleName.trim(),
      description: this.newRoleDescription.trim() || undefined,
      identityRole: 4,
      panelScope: 0,
      permissions: [] as string[]
    };

    this.accessApi.createRole(payload).subscribe({
      next: (response) => {
        this.cdr.markForCheck();
        const newRole = this.mapDtoToCustomRole(response);
        this.customRoles.push(newRole);
        this.roles = [...this.customRoles];
        this.selectedRole = newRole;
        this.editingPermissions = true;
        this.showModal = false;
        this.isCreatingRole = false;
        this.toastService.success(
          this.translate.instant('ADMIN_USERS.ROLES_MANAGEMENT.MESSAGES.CREATE_SUCCESS'),
          this.translate.instant('ADMIN_USERS.ROLES_MANAGEMENT.TITLE')
        );
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Error creating role', buildSafeApiErrorLog(err));
        this.createRoleError = describeApiError(err, this.translate, {
          fallbackKey: 'ADMIN_USERS.ROLES_MANAGEMENT.MESSAGES.CREATE_FAILED',
          codePrefix: 'ADMIN_USERS.ROLES_MANAGEMENT.ERROR_CODES'
        });
        this.isCreatingRole = false;
        this.toastService.error(
          this.createRoleError,
          this.translate.instant('ADMIN_USERS.ROLES_MANAGEMENT.CREATE.CREATE_ROLE')
        );
      }
    });
  }

  deleteRole(role: CustomRole): void {
    if (role.isSystem) return;
    this.roleToDelete = role;
    this.deleteError = '';
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (!this.roleToDelete) return;
    this.isDeleting = true;
    this.deleteError = '';
    this.accessApi.deleteRole(this.roleToDelete.id).subscribe({
      next: () => {
        this.cdr.markForCheck();
        this.customRoles = this.customRoles.filter((entry) => entry.id !== this.roleToDelete!.id);
        this.roles = [...this.customRoles];
        this.selectedRole = null;
        this.editingPermissions = false;
        this.isDeleting = false;
        this.isDeleteModalOpen = false;
        this.roleToDelete = null;
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Error deleting role', buildSafeApiErrorLog(err));
        this.deleteError = describeApiError(err, this.translate, {
          fallbackKey: 'ADMIN_USERS.ROLES_MANAGEMENT.MESSAGES.DELETE_FAILED',
          codePrefix: 'ADMIN_USERS.ROLES_MANAGEMENT.ERROR_CODES'
        });
        this.isDeleting = false;
      }
    });
  }

  cancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.roleToDelete = null;
    this.deleteError = '';
  }

  goBack(): void {
    void this.router.navigate(['/admin-users']);
  }

  openAddUserForRole(role: CustomRole): void {
    void this.router.navigate(['/admin-users'], {
      queryParams: { create: '1', roleId: role.id }
    });
  }

  getPanelLabel(): string {
    return DIRECTORY_PANEL_LABELS.super_admin_panel;
  }

  getActionLabel(action: PermissionActionId): string {
    return PERMISSION_ACTION_LABELS[action] || action;
  }

  getActionIcon(action: PermissionActionId): string {
    const icons: Record<PermissionActionId, string> = {
      view: 'visibility',
      create: 'add_circle',
      edit: 'edit_square',
      approve: 'check_circle',
      export: 'download',
      manage_settings: 'settings'
    };
    return icons[action] || 'check';
  }

  getRoleName(role: CustomRole): string {
    const presetKey = this.systemRoleTranslationMap[role.code];
    if (role.isSystem && presetKey) return `ADMIN_USERS.PRESETS.${presetKey}.NAME`;
    return role.name;
  }

  getRoleDescription(role: CustomRole): string {
    const presetKey = this.systemRoleTranslationMap[role.code];
    if (role.isSystem && presetKey) return `ADMIN_USERS.PRESETS.${presetKey}.DESC`;
    return role.description;
  }

  getRoleBadgeLabel(role: CustomRole): string {
    return role.isSystem
      ? 'ADMIN_USERS.ROLES_MANAGEMENT.BADGES.SYSTEM'
      : 'ADMIN_USERS.ROLES_MANAGEMENT.BADGES.CUSTOM';
  }

  getAvailableGroupActionCount(group: PermissionGroup): number {
    return this.getAvailableGroupActions(group).length;
  }
}
