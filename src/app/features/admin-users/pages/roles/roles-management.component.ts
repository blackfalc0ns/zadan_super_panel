import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
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
import { AdminAccessApiService, RoleDefinitionDto } from '../../../../core/services/admin-access-api.service';

interface CustomRole {
  id: string;
  code: string;
  name: string;
  description: string;
  accessLevel: AdminAccessLevel;
  panelScope: DirectoryPanelScope;
  permissions: string[];
  accent: string;
  isSystem: boolean;
  usersCount: number;
}

@Component({
  selector: 'app-roles-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, StatusPillComponent],
  template: `
    <div class="h-full flex bg-white font-sans overflow-hidden border-t border-slate-200" dir="rtl">
      
      <!-- Left Sidebar (Roles List) -->
      <div class="w-96 shrink-0 border-l border-slate-200 flex flex-col bg-slate-50/50">
        <!-- Header -->
        <div class="p-5 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm shadow-slate-100/50">
          <div class="flex items-center gap-3">
            <button (click)="goBack()" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <span class="material-symbols-outlined text-[20px] rtl:rotate-180">arrow_back</span>
            </button>
            <h1 class="text-lg font-bold text-slate-900">{{ 'ADMIN_USERS.ROLES_MANAGEMENT.TITLE' | translate }}</h1>
          </div>
          <button (click)="openCreateModal()" class="w-9 h-9 rounded-lg bg-zadna-primary text-white flex items-center justify-center hover:bg-zadna-primary/90 transition-colors shadow-sm">
            <span class="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto">
          <div *ngFor="let role of roles" 
               (click)="selectRole(role)"
               class="p-5 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-100/50 relative"
               [class.bg-blue-50]="selectedRole?.id === role.id"
               [class.hover:bg-blue-50]="selectedRole?.id === role.id"
               [class.border-l-2]="selectedRole?.id === role.id"
               [class.border-l-zadna-primary]="selectedRole?.id === role.id">
            
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" [style.background]="role.accent">
                  <span class="material-symbols-outlined text-[20px]">{{ role.isSystem ? 'verified_user' : 'shield' }}</span>
                </div>
                <div>
                  <h3 class="text-[14px] font-bold text-slate-900" [class.text-zadna-primary]="selectedRole?.id === role.id">{{ getRoleName(role) | translate }}</h3>
                  <p class="text-[12px] text-slate-500 mt-0.5 line-clamp-1">{{ getRoleDescription(role) | translate }}</p>
                </div>
              </div>
              <app-status-pill [label]="getRoleBadgeLabel(role)" [variant]="role.isSystem ? 'info' : 'warning'" size="sm"></app-status-pill>
            </div>
            
            <div class="flex items-center gap-4 mt-4 pl-13 rtl:pl-0 rtl:pr-13">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px] text-slate-400">key</span>
                <span class="text-[12px] font-medium text-slate-600">{{ role.permissions.length }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px] text-slate-400">group</span>
                <span class="text-[12px] font-medium text-slate-600">{{ role.usersCount }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full" [ngClass]="{'bg-emerald-500': role.accessLevel === 'full', 'bg-amber-500': role.accessLevel === 'restricted', 'bg-slate-400': role.accessLevel === 'observer'}"></span>
                <span class="text-[11px] font-medium text-slate-600 truncate max-w-[80px]">{{ getAccessLevelLabel(role.accessLevel) | translate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Area (Details & Matrix) -->
      <div class="flex-1 flex flex-col bg-white overflow-hidden relative">
        <ng-container *ngIf="selectedRole; else noSelection">
          <!-- Right Header -->
          <div class="p-6 lg:px-8 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-white sticky top-0 z-10 shrink-0">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm" [style.background]="selectedRole.accent">
                <span class="material-symbols-outlined text-[24px]">{{ selectedRole.isSystem ? 'verified_user' : 'shield' }}</span>
              </div>
              <div>
                <h2 class="text-xl font-bold text-slate-900">{{ getRoleName(selectedRole) | translate }}</h2>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[13px] text-slate-500">{{ getRoleDescription(selectedRole) | translate }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[12px] font-medium text-zadna-primary">{{ getPanelLabel(selectedRole.panelScope) | translate }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button *ngIf="!selectedRole.isSystem" (click)="deleteRole(selectedRole)" class="h-9 px-4 rounded-lg bg-white border border-red-200 text-red-600 text-[13px] font-medium hover:bg-red-50 transition-colors flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px]">delete</span>
                {{ 'ADMIN_USERS.ROLES_MANAGEMENT.ACTIONS.DELETE_ROLE' | translate }}
              </button>
              
              <button *ngIf="!selectedRole.isSystem && editingPermissions" (click)="savePermissions()" class="h-9 px-5 rounded-lg bg-zadna-primary text-white text-[13px] font-medium hover:bg-zadna-primary/90 transition-colors shadow-sm flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px]">save</span>
                {{ 'ADMIN_USERS.ROLES_MANAGEMENT.ACTIONS.SAVE_CHANGES' | translate }}
              </button>
            </div>
          </div>

          <!-- Matrix -->
          <div class="flex-1 overflow-y-auto p-6 lg:px-8 bg-slate-50/50">
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table class="w-full text-start text-sm">
                <thead class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th class="text-start px-6 py-3.5 text-[12px] font-bold text-slate-600 w-[240px]">{{ 'ADMIN_USERS.ROLES_MANAGEMENT.MATRIX.SECTION' | translate }}</th>
                    <th *ngFor="let action of permissionActions" class="text-center px-2 py-3.5 text-[12px] font-bold text-slate-600 w-20">
                      <div class="flex flex-col items-center gap-1">
                        <span class="material-symbols-outlined text-[18px] text-slate-400">{{ getActionIcon(action) }}</span>
                        <span class="hidden xl:block font-medium">{{ getActionLabel(action) | translate }}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngFor="let group of getFilteredGroups()" class="hover:bg-slate-50/50 transition-colors group">
                    <td class="px-6 py-4 align-top">
                      <p class="text-[13px] font-bold text-slate-800">{{ group.labelKey | translate }}</p>
                      <p class="text-[12px] text-slate-500 mt-0.5">{{ group.descriptionKey | translate }}</p>
                    </td>
                    <td *ngFor="let action of permissionActions" class="text-center px-2 py-4 align-top pt-5">
                      <ng-container *ngIf="group.actions.includes(action); else unavailableAction">
                        <label class="relative flex items-center justify-center cursor-pointer" [class.pointer-events-none]="selectedRole.isSystem">
                          <input type="checkbox" [checked]="hasPermission(group.id, action)" (change)="togglePermission(group.id, action)" [disabled]="selectedRole.isSystem" class="sr-only peer" />
                          <div class="w-5 h-5 rounded border border-slate-300 peer-checked:bg-zadna-primary peer-checked:border-zadna-primary flex items-center justify-center transition-colors disabled:opacity-50 disabled:bg-slate-100 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-zadna-primary/50 group-hover:border-slate-400 peer-checked:group-hover:border-zadna-primary">
                            <span class="material-symbols-outlined text-[14px] text-white opacity-0 peer-checked:opacity-100 font-bold scale-50 peer-checked:scale-100 transition-all">check</span>
                          </div>
                        </label>
                      </ng-container>
                      <ng-template #unavailableAction>
                        <div class="w-5 h-5 mx-auto flex items-center justify-center">
                          <div class="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                        </div>
                      </ng-template>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div *ngIf="getFilteredGroups().length === 0" class="py-16 text-center text-slate-500">
                <span class="material-symbols-outlined text-[40px] text-slate-300 mb-2">security</span>
                <p class="text-[14px]">{{ 'ADMIN_USERS.ROLES_MANAGEMENT.MATRIX.NO_PERMISSIONS' | translate }}</p>
              </div>
            </div>
          </div>
        </ng-container>
        
        <ng-template #noSelection>
          <div class="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
            <div class="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span class="material-symbols-outlined text-[40px] text-slate-300">touch_app</span>
            </div>
            <p class="text-[16px] font-medium text-slate-600">Select a role</p>
            <p class="text-[13px] mt-1 text-slate-500">Choose a role from the list to view or edit its permissions.</p>
          </div>
        </ng-template>
      </div>

      <!-- Create Modal (Slide Over Drawer) -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 flex justify-end rtl:justify-start">
        <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" (click)="showModal = false" style="animation: fadeIn 0.2s ease-out;"></div>
        
        <div class="w-full max-w-md bg-white h-full shadow-2xl relative z-10 flex flex-col" style="animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 class="text-lg font-bold text-slate-900">{{ 'ADMIN_USERS.ROLES_MANAGEMENT.CREATE.TITLE' | translate }}</h2>
              <p class="text-[13px] text-slate-500 mt-1">{{ 'ADMIN_USERS.ROLES_MANAGEMENT.CREATE.SUBTITLE' | translate }}</p>
            </div>
            <button (click)="showModal = false" class="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div class="p-6 space-y-6 flex-1 overflow-y-auto">
            <div class="space-y-2">
              <label class="text-[13px] font-bold text-slate-700">
                {{ 'ADMIN_USERS.ROLES_MANAGEMENT.CREATE.NAME' | translate }} <span class="text-red-500">*</span>
              </label>
              <input type="text" [(ngModel)]="newRoleName" class="w-full h-11 rounded-lg border border-slate-300 px-3 text-[14px] focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all" />
            </div>

            <div class="space-y-2">
              <label class="text-[13px] font-bold text-slate-700">
                {{ 'ADMIN_USERS.ROLES_MANAGEMENT.CREATE.DESCRIPTION' | translate }}
              </label>
              <textarea [(ngModel)]="newRoleDescription" rows="3" class="w-full rounded-lg border border-slate-300 p-3 text-[14px] focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all resize-none"></textarea>
            </div>

            <div class="space-y-2">
              <label class="text-[13px] font-bold text-slate-700">
                {{ 'ADMIN_USERS.ROLES_MANAGEMENT.CREATE.ACCESS_LEVEL' | translate }}
              </label>
              <select [(ngModel)]="newRoleAccessLevel" class="w-full h-11 rounded-lg border border-slate-300 px-3 text-[14px] focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all bg-white">
                <option value="full">{{ 'ADMIN_USERS.ACCESS_LEVEL.FULL' | translate }}</option>
                <option value="restricted">{{ 'ADMIN_USERS.ACCESS_LEVEL.RESTRICTED' | translate }}</option>
                <option value="observer">{{ 'ADMIN_USERS.ACCESS_LEVEL.OBSERVER' | translate }}</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-[13px] font-bold text-slate-700">
                {{ 'ADMIN_USERS.ROLES_MANAGEMENT.CREATE.PANEL_SCOPE' | translate }}
              </label>
              <select [(ngModel)]="newRolePanelScope" class="w-full h-11 rounded-lg border border-slate-300 px-3 text-[14px] focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all bg-white">
                <option value="super_admin_panel">{{ 'ADMIN_USERS.PANELS.SUPER_ADMIN_PANEL' | translate }}</option>
                <option value="vendor_panel">{{ 'ADMIN_USERS.PANELS.VENDOR_PANEL' | translate }}</option>
              </select>
            </div>
          </div>

          <div class="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50 shrink-0">
            <button (click)="showModal = false" class="flex-1 h-11 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
              {{ 'ADMIN_USERS.ROLES_MANAGEMENT.ACTIONS.CANCEL' | translate }}
            </button>
            <button (click)="createRole()" [disabled]="!newRoleName.trim()" class="flex-1 h-11 rounded-lg bg-zadna-primary text-white font-medium hover:bg-zadna-primary/90 disabled:opacity-50 transition-colors shadow-sm">
              {{ 'ADMIN_USERS.ROLES_MANAGEMENT.ACTIONS.CREATE_ROLE' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
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
    `
  ]
})
export class RolesManagementComponent implements OnInit {
  roles: CustomRole[] = [];
  selectedRole: CustomRole | null = null;
  editingPermissions = false;
  showModal = false;

  newRoleName = '';
  newRoleDescription = '';
  newRoleAccessLevel: AdminAccessLevel = 'restricted';
  newRolePanelScope: DirectoryPanelScope = 'super_admin_panel';

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
    private readonly accessApi: AdminAccessApiService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading = true;

    this.accessApi.getRoles().subscribe({
      next: (dtoRoles) => {
        this.customRoles = dtoRoles.map((dto) => this.mapDtoToCustomRole(dto));
        this.roles = [...this.customRoles];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading roles', err);
        this.isLoading = false;
      }
    });
  }

  private mapDtoToCustomRole(dto: RoleDefinitionDto): CustomRole {
    const accents = ['#0891b2', '#7c3aed', '#dc2626', '#059669', '#d97706', '#4f46e5'];
    const index = Array.from(dto.id).reduce((acc, char) => acc + char.charCodeAt(0), 0) % accents.length;

    return {
      id: dto.id,
      code: dto.code,
      name: dto.name,
      description: dto.description || '',
      accessLevel: dto.isSystem ? 'full' : 'restricted',
      panelScope: this.mapPanelScopeNumToString(dto.panelScope),
      permissions: dto.permissions,
      accent: accents[index],
      isSystem: dto.isSystem,
      usersCount: dto.usersCount
    };
  }

  private mapPanelScopeNumToString(scope: number): DirectoryPanelScope {
    switch (scope) {
      case 0:
        return 'super_admin_panel';
      case 1:
        return 'vendor_panel';
      case 2:
        return 'driver_app';
      case 3:
        return 'customer_app';
      default:
        return 'super_admin_panel';
    }
  }

  private mapPanelScopeStringToNum(scope: DirectoryPanelScope): number {
    switch (scope) {
      case 'super_admin_panel':
        return 0;
      case 'vendor_panel':
        return 1;
      case 'driver_app':
        return 2;
      case 'customer_app':
        return 3;
      default:
        return 0;
    }
  }

  selectRole(role: CustomRole): void {
    this.selectedRole = role;
    this.editingPermissions = !role.isSystem;
  }

  getFilteredGroups(): PermissionGroup[] {
    if (!this.selectedRole) {
      return [];
    }

    return PERMISSION_GROUPS.filter((group) => group.panelScopes.includes(this.selectedRole!.panelScope));
  }

  hasPermission(domain: PermissionDomainId, action: PermissionActionId): boolean {
    if (!this.selectedRole) {
      return false;
    }

    return this.selectedRole.permissions.includes(buildPermissionKey(domain, action));
  }

  togglePermission(domain: PermissionDomainId, action: PermissionActionId): void {
    if (!this.selectedRole || this.selectedRole.isSystem) {
      return;
    }

    this.editingPermissions = true;
    const key = buildPermissionKey(domain, action);
    const index = this.selectedRole.permissions.indexOf(key);

    if (index >= 0) {
      this.selectedRole.permissions.splice(index, 1);
      return;
    }

    this.selectedRole.permissions.push(key);
  }

  savePermissions(): void {
    if (!this.selectedRole || this.selectedRole.isSystem) {
      return;
    }

    this.isLoading = true;
    const payload = {
      id: this.selectedRole.id,
      name: this.selectedRole.name,
      description: this.selectedRole.description,
      identityRole: 1,
      panelScope: this.mapPanelScopeStringToNum(this.selectedRole.panelScope),
      permissions: this.selectedRole.permissions
    };

    this.accessApi.updateRole(this.selectedRole.id, payload).subscribe({
      next: (response) => {
        const updatedRole = this.mapDtoToCustomRole(response);
        const index = this.customRoles.findIndex((role) => role.id === updatedRole.id);

        if (index >= 0) {
          this.customRoles[index] = updatedRole;
        }

        this.roles = [...this.customRoles];
        this.selectedRole = updatedRole;
        this.editingPermissions = false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error saving role', err);
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.newRoleName = '';
    this.newRoleDescription = '';
    this.newRoleAccessLevel = 'restricted';
    this.newRolePanelScope = 'super_admin_panel';
    this.showModal = true;
  }

  createRole(): void {
    if (!this.newRoleName.trim()) {
      return;
    }

    this.isLoading = true;
    const payload = {
      name: this.newRoleName.trim(),
      description: this.newRoleDescription.trim(),
      identityRole: 1,
      panelScope: this.mapPanelScopeStringToNum(this.newRolePanelScope),
      permissions: []
    };

    this.accessApi.createRole(payload).subscribe({
      next: (response) => {
        const newRole = this.mapDtoToCustomRole(response);
        this.customRoles.push(newRole);
        this.roles = [...this.customRoles];
        this.selectedRole = newRole;
        this.editingPermissions = true;
        this.showModal = false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error creating role', err);
        this.isLoading = false;
      }
    });
  }

  deleteRole(role: CustomRole): void {
    if (role.isSystem) {
      return;
    }

    this.isLoading = true;
    this.accessApi.deleteRole(role.id).subscribe({
      next: () => {
        this.customRoles = this.customRoles.filter((entry) => entry.id !== role.id);
        this.roles = [...this.customRoles];
        this.selectedRole = null;
        this.editingPermissions = false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error deleting role', err);
        this.isLoading = false;
      }
    });
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
    if (role.isSystem && presetKey) {
      return `ADMIN_USERS.PRESETS.${presetKey}.NAME`;
    }

    return role.name;
  }

  getRoleDescription(role: CustomRole): string {
    const presetKey = this.systemRoleTranslationMap[role.code];
    if (role.isSystem && presetKey) {
      return `ADMIN_USERS.PRESETS.${presetKey}.DESC`;
    }

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
}
