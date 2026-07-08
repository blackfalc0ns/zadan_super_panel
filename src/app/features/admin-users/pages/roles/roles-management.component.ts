import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
 AdminAccessLevel,
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
 email: string;
 notificationEmails: string;
 accessLevel: AdminAccessLevel;
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
 styles: [
 `
 @keyframes fadeIn {
 from { opacity: 0; }
 to { opacity: 1; }
 }
 @keyframes slideInRight {
 from { transform: translateX(100%); }
 to { transform: translateX(0); }
 }
 @keyframes slideUp {
 from { opacity: 0; transform: translateY(20px) scale(0.98); }
 to { opacity: 1; transform: translateY(0) scale(1); }
 }
 :host { display: block; height: 100%; }
 `
 ]
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
 activeDetailTab: 'permissions' | 'email' | 'users' = 'permissions';

 detailTabs = [
 { id: 'permissions' as const, label: 'الصلاحيات', icon: 'key' },
 { id: 'email' as const, label: 'البريد والإشعارات', icon: 'mail' },
 { id: 'users' as const, label: 'المستخدمين', icon: 'group' }
 ];

 newRoleName = '';
 newRoleDescription = '';
 newRoleEmail = '';
 newRoleNotificationEmails = '';
 newRoleAccessLevel: AdminAccessLevel = 'restricted';
 newRolePanelScope: DirectoryPanelScope = 'super_admin_panel';
 permissionDefinitions: PermissionDefinitionDto[] = [];
 availablePermissionKeys = new Set<string>();

 get systemRolesCount(): number { return this.roles.filter(r => r.isSystem).length; }
 get customRolesCount(): number { return this.roles.filter(r =>!r.isSystem).length; }

 accessLevelOptions = [
 { value: 'full' as AdminAccessLevel, label: 'كامل', icon: 'admin_panel_settings' },
 { value: 'restricted' as AdminAccessLevel, label: 'مقيد', icon: 'tune' },
 { value: 'observer' as AdminAccessLevel, label: 'مراقب', icon: 'visibility' }
 ];

 panelScopeOptions = [
 { value: 'super_admin_panel' as DirectoryPanelScope, label: 'لوحة الأدمن', icon: 'dashboard' },
 { value: 'vendor_panel' as DirectoryPanelScope, label: 'لوحة التاجر', icon: 'storefront' }
 ];

 permissionActions: PermissionActionId[] = ['view', 'create', 'edit', 'approve', 'export', 'manage_settings'];

 private customRoles: CustomRole[] = [];
 isLoading = false;

 private readonly systemRoleTranslationMap: Record<string, string> = {
 super_admin_all: 'SUPER_ADMIN',
 admin_operations: 'OPERATIONS_LEAD',
 risk_admin: 'RISK_ADMIN',
 finance_admin: 'FINANCE_ADMIN',
 support_admin: 'SUPPORT_ADMIN',
 vendor_owner: 'VENDOR_OWNER',
 vendor_company_manager: 'VENDOR_COMPANY_MANAGER',
 vendor_branch_manager: 'VENDOR_BRANCH_MANAGER',
 vendor_branch_staff: 'VENDOR_BRANCH_EMPLOYEE',
 vendor_finance_manager: 'VENDOR_FINANCE_MANAGER',
 vendor_support_manager: 'VENDOR_SUPPORT_MANAGER',
 driver_account: 'DRIVER_ACCOUNT',
 customer_account: 'CUSTOMER_ACCOUNT'
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
 this.permissionDefinitions = permissions;
 this.availablePermissionKeys = new Set(permissions.map((permission) => permission.key));
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
 this.customRoles = dtoRoles.map((dto) => this.mapDtoToCustomRole(dto));
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
 email: '',
 notificationEmails: '',
 accessLevel: dto.isSystem ? 'full' : 'restricted',
 panelScope: this.mapPanelScopeNumToString(dto.panelScope),
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
 default: return 'super_admin_panel';
 }
 }

 private mapIdentityRoleToNumber(role: number | string): number {
 if (typeof role === 'number') return role;
 if (/^\d+$/.test(role)) return Number(role);
 switch (role) {
 case 'Customer': return 0;
 case 'Vendor': return 1;
 case 'VendorStaff': return 2;
 case 'Driver': return 3;
 case 'Admin': return 4;
 case 'SuperAdmin': return 5;
 default: return 4;
 }
 }

 private mapPanelScopeStringToNum(scope: DirectoryPanelScope): number {
 switch (scope) {
 case 'super_admin_panel': return 0;
 case 'vendor_panel': return 1;
 case 'driver_app': return 2;
 case 'customer_app': return 3;
 default: return 0;
 }
 }

 selectRole(role: CustomRole): void {
 this.selectedRole = role;
 this.activeDetailTab = 'permissions';
 this.editingPermissions =!role.isSystem;
 }

 getFilteredGroups(): PermissionGroup[] {
 if (!this.selectedRole) return [];
 return PERMISSION_GROUPS.filter((group) =>
 group.panelScopes.includes(this.selectedRole!.panelScope) && this.getAvailableGroupActions(group).length > 0
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
 if (!this.selectedRole || this.selectedRole.isSystem ||!this.isPermissionAvailable(domain, action)) return;
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
 } else {
 if (index < 0) this.selectedRole!.permissions.push(key);
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
 panelScope: this.mapPanelScopeStringToNum(this.selectedRole.panelScope),
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
 this.newRoleEmail = '';
 this.newRoleAccessLevel = 'restricted';
 this.newRolePanelScope = 'super_admin_panel';
 this.createRoleError = '';
 this.showModal = true;
 }

 createRole(): void {
 if (!this.newRoleName.trim()) return;
 this.isCreatingRole = true;
 this.createRoleError = '';
 const payload = {
 name: this.newRoleName.trim(),
 description: this.newRoleDescription.trim(),
 identityRole: this.defaultIdentityRoleForPanel(this.newRolePanelScope),
 panelScope: this.mapPanelScopeStringToNum(this.newRolePanelScope),
 permissions: []
 };

 this.accessApi.createRole(payload).subscribe({
 next: (response) => {
 this.cdr.markForCheck();
 const newRole = this.mapDtoToCustomRole(response);
 newRole.email = this.newRoleEmail.trim();
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
 this.customRoles = this.customRoles.filter((entry) => entry.id!== this.roleToDelete!.id);
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

 getPanelLabel(scope: DirectoryPanelScope): string {
 return DIRECTORY_PANEL_LABELS[scope] || scope;
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

 getAccessLevelLabel(level: AdminAccessLevel): string {
 const labels: Record<AdminAccessLevel, string> = {
 full: 'ADMIN_USERS.ACCESS_LEVEL.FULL',
 restricted: 'ADMIN_USERS.ACCESS_LEVEL.RESTRICTED',
 observer: 'ADMIN_USERS.ACCESS_LEVEL.OBSERVER'
 };
 return labels[level];
 }

 getAvailableGroupActionCount(group: PermissionGroup): number {
 return this.getAvailableGroupActions(group).length;
 }

 private defaultIdentityRoleForPanel(scope: DirectoryPanelScope): number {
 switch (scope) {
 case 'vendor_panel': return 2;
 case 'driver_app': return 3;
 case 'customer_app': return 0;
 default: return 4;
 }
 }
}
