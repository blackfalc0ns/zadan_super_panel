import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminAccessApiService, RoleDefinitionDto } from '../../../../core/services/admin-access-api.service';
import {
  AdminUserRecord,
  DIRECTORY_AUDIENCE_LABELS,
  DIRECTORY_PANEL_LABELS,
  getRolePresetById
} from '../../models/admin-users.models';
import { Subscription } from 'rxjs';
import { VendorService } from '@vendors/public-api';
import { DriverService } from '@drivers/public-api';

import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/ui/data-table/data-table.component';
import { KpiCardsComponent, KPICard } from '../../../../shared/components/ui/kpi-cards/kpi-cards.component';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TranslateModule,
    AppPageHeaderComponent,
    AppPaginationComponent,
    DataTableComponent,
    KpiCardsComponent,
    StatusPillComponent
  ],
  templateUrl: './admin-users-list.component.html',
  styles: [`
    table {
      border-collapse: separate !important;
      border-spacing: 0 !important;
      table-layout: fixed !important;
    }

    thead th {
      position: sticky;
      top: 0;
      background: white;
      z-index: 10;
    }

    tbody tr {
      background: rgba(255, 255, 255, 0.5);
    }

    tbody tr:hover {
      background: white;
    }

    td, th {
      vertical-align: middle !important;
      text-align: center !important;
    }

    td:first-child, th:first-child {
      text-align: center !important;
    }

    td:nth-child(2), th:nth-child(2) {
      text-align: start !important;
    }
  `]
})
export class AdminUsersListComponent implements OnInit, OnDestroy {
  users: AdminUserRecord[] = [];
  roles: RoleDefinitionDto[] = [];
  isLoading = false;
  isCreatingUser = false;
  showCreateUserModal = false;
  createUserError = '';
  searchTerm = '';
  isFiltersExpanded = false;
  createUserForm = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleDefinitionId: '',
    department: '',
    team: '',
    scopeEntityId: '',
    notes: ''
  };

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  get isRTL(): boolean {
    return this.translate.currentLang === 'ar';
  }

  kpiCards: KPICard[] = [];
  
  tableColumns: TableColumn[] = [
    { key: 'identity', title: 'ADMIN_USERS.TABLE.IDENTITY', width: '30%', align: 'left', type: 'custom' },
    { key: 'role', title: 'ADMIN_USERS.TABLE.ROLE', width: '20%', align: 'left', type: 'custom' },
    { key: 'scope', title: 'ADMIN_USERS.TABLE.SCOPE', width: '15%', align: 'center', type: 'custom' },
    { key: 'status', title: 'ADMIN_USERS.TABLE.STATUS', width: '15%', align: 'center', type: 'custom' },
    { key: 'actions', title: 'ADMIN_USERS.TABLE.ACTIONS', width: '10%', align: 'center', type: 'actions' }
  ];

  tableActions: TableAction[] = [
    { id: 'view', label: 'ADMIN_USERS.ACTIONS.VIEW', icon: 'visibility' },
    { id: 'edit', label: 'ADMIN_USERS.ACTIONS.EDIT_ROLE', icon: 'edit' }
  ];

  private readonly subscriptions = new Subscription();

  constructor(
    private adminAccessApi: AdminAccessApiService,
    private translate: TranslateService,
    private router: Router,
    private vendorService: VendorService,
    private driverService: DriverService
  ) {}

  ngOnInit() {
    this.updateKPICards();
    this.loadUsers();
    this.loadRolesSummary();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  get totalRoles(): number {
    return this.roles.length;
  }

  get systemRolesCount(): number {
    return this.roles.filter((role) => role.isSystem).length;
  }

  get customRolesCount(): number {
    return this.roles.filter((role) => !role.isSystem).length;
  }

  get permissionsCatalogCount(): number {
    return new Set(this.roles.flatMap((role) => role.permissions)).size;
  }

  updateKPICards() {
    this.kpiCards = [
      {
        id: 'total',
        title: 'ADMIN_USERS.STATS.TOTAL',
        value: this.users.length,
        icon: '<span class="material-symbols-outlined text-[20px]">group</span>',
        color: '#127c8c',
        clickable: false
      },
      {
        id: 'active',
        title: 'ADMIN_USERS.STATS.ACTIVE',
        value: this.users.filter(u => u.status === 'active').length,
        icon: '<span class="material-symbols-outlined text-[20px]">check_circle</span>',
        color: '#10b981',
        clickable: true
      },
      {
        id: 'suspended',
        title: 'ADMIN_USERS.STATS.LOCKED',
        value: this.users.filter(u => u.status === 'suspended').length,
        icon: '<span class="material-symbols-outlined text-[20px]">lock</span>',
        color: '#ef4444',
        clickable: true
      }
    ];
  }

  loadUsers() {
    this.isLoading = true;
    const usersSub = this.adminAccessApi.getUsersPage({
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchTerm.trim() || undefined
    }).subscribe({
      next: (page) => {
        this.users = page.items;
        this.totalCount = page.totalCount;
        this.totalPages = page.totalPages;
        this.updateKPICards();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load admin users', err);
        this.isLoading = false;
      }
    });
    this.subscriptions.add(usersSub);
  }

  loadRolesSummary() {
    const rolesSub = this.adminAccessApi.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        if (!this.createUserForm.roleDefinitionId && roles.length > 0) {
          this.createUserForm.roleDefinitionId = roles[0].id;
        }
      },
      error: (err) => {
        console.error('Failed to load roles summary', err);
        this.roles = [];
      }
    });
    this.subscriptions.add(rolesSub);
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.loadUsers();
    }
  }

  onSearch() {
    this.pageNumber = 1;
    this.loadUsers();
  }

  toggleFilters() {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  onKPICardClick(card: KPICard) {
    // Handle KPI clicks
  }

  onTableRowClick(user: AdminUserRecord) {
    this.router.navigate(['/admin-users', user.id]);
  }

  onTableAction(event: { action: TableAction, item: AdminUserRecord }) {
    if (event.action.id === 'view') {
      this.router.navigate(['/admin-users', event.item.id]);
    } else if (event.action.id === 'edit') {
      this.openRolesManagement();
    }
  }

  openRolesManagement() {
    this.router.navigate(['/admin-users/roles']);
  }

  openCreateUserModal(): void {
    const firstRole = this.roles[0];
    this.createUserForm = {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      roleDefinitionId: firstRole?.id ?? '',
      department: '',
      team: '',
      scopeEntityId: '',
      notes: ''
    };
    this.createUserError = '';
    this.showCreateUserModal = true;
  }

  closeCreateUserModal(): void {
    if (!this.isCreatingUser) {
      this.showCreateUserModal = false;
    }
  }

  onCreateRoleChange(): void {
    this.createUserForm.scopeEntityId = '';
    this.createUserError = '';
  }

  createUser(): void {
    const role = this.roles.find((entry) => entry.id === this.createUserForm.roleDefinitionId);
    if (!role || !this.createUserForm.fullName.trim() || !this.createUserForm.email.trim() || !this.createUserForm.password.trim()) {
      return;
    }

    const panelScope = this.mapPanelScopeToNumber(role.panelScope);
    const scopeEntityId = this.resolveCreateScopeEntityId(panelScope);
    if (scopeEntityId === undefined) {
      this.createUserError = 'Vendor and driver accounts must be linked to an existing entity id.';
      return;
    }

    this.isCreatingUser = true;
    this.createUserError = '';
    const createSub = this.adminAccessApi.createUser({
      fullName: this.createUserForm.fullName.trim(),
      email: this.createUserForm.email.trim(),
      phone: this.createUserForm.phone.trim(),
      password: this.createUserForm.password,
      roleDefinitionId: role.id,
      panelScope,
      scopeType: this.defaultScopeTypeForPanel(panelScope),
      scopeEntityId,
      department: this.createUserForm.department.trim() || null,
      team: this.createUserForm.team.trim() || null,
      notes: this.createUserForm.notes.trim() || null
    }).subscribe({
      next: (user) => {
        this.users = [user, ...this.users.filter((entry) => entry.id !== user.id)];
        this.totalCount += 1;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.updateKPICards();
        this.isCreatingUser = false;
        this.showCreateUserModal = false;
        this.router.navigate(['/admin-users', user.id]);
      },
      error: (err) => {
        console.error('Failed to create admin user', err);
        this.createUserError = err.error?.message || err.error?.title || 'Failed to create account. Please review the role and scope.';
        this.isCreatingUser = false;
      }
    });
    this.subscriptions.add(createSub);
  }

  getInitials(user: AdminUserRecord): string {
    return user.fullName.charAt(0).toUpperCase();
  }

  getAvatarGradient(user: AdminUserRecord): string {
    const gradients = [
      'linear-gradient(135deg, #3b82f6, #2563eb)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'linear-gradient(135deg, #ec4899, #db2777)',
      'linear-gradient(135deg, #127c8c, #0d5f6b)',
      'linear-gradient(135deg, #f43f5e, #e11d48)'
    ];
    let hash = 0;
    for (let i = 0; i < user.id.length; i++) {
      hash = user.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  }

  getScopeBadgeClasses(user: AdminUserRecord): string {
    if (user.audienceType === 'vendor_network') return 'bg-amber-100 text-amber-600';
    if (user.audienceType === 'drivers') return 'bg-emerald-100 text-emerald-600';
    if (user.audienceType === 'customers') return 'bg-purple-100 text-purple-600';
    return 'bg-blue-100 text-blue-600';
  }

  getScopeIcon(user: AdminUserRecord): string {
    if (user.audienceType === 'vendor_network') return 'storefront';
    if (user.audienceType === 'drivers') return 'local_shipping';
    if (user.audienceType === 'customers') return 'person';
    return 'admin_panel_settings';
  }

  getStatusVariant(status: string): StatusPillVariant {
    if (status === 'active') return 'success';
    if (status === 'suspended') return 'danger';
    if (status === 'inactive') return 'warning';
    return 'neutral';
  }

  getRoleNameKey(user: AdminUserRecord): string {
    return getRolePresetById(user.rolePresetId).nameKey;
  }

  getRoleDisplay(user: AdminUserRecord): string {
    return user.roleName || this.translate.instant(this.getRoleNameKey(user));
  }

  getAudienceLabelKey(user: AdminUserRecord): string {
    return DIRECTORY_AUDIENCE_LABELS[user.audienceType];
  }

  getPanelLabelKey(user: AdminUserRecord): string {
    return DIRECTORY_PANEL_LABELS[user.panelScope];
  }

  getRoleOptionLabel(role: RoleDefinitionDto): string {
    const preset = getRolePresetById(this.adminAccessApiRoleCodeToPreset(role.code));
    return role.isSystem ? this.translate.instant(preset.nameKey) : role.name;
  }

  getCreateScopeHint(): string {
    const panelScope = this.selectedCreatePanelScopeNumber();
    if (panelScope === 1) return 'Required: existing vendor or branch id';
    if (panelScope === 2) return 'Required: existing driver id';
    if (panelScope === 3) return 'Customer scope will be linked to the created user automatically';
    return 'Global scope';
  }

  shouldShowScopeEntityInput(): boolean {
    const panelScope = this.selectedCreatePanelScopeNumber();
    return panelScope === 1 || panelScope === 2;
  }

  getCreateScopeOptions(): Array<{ value: string; label: string }> {
    const panelScope = this.selectedCreatePanelScopeNumber();
    if (panelScope === 1) {
      return this.vendorService.getVendorsSnapshot().map((vendor) => ({
        value: vendor.id,
        label: `${vendor.businessNameEn || vendor.businessNameAr} - ${vendor.id}`
      }));
    }

    if (panelScope === 2) {
      return this.driverService.getDriversSnapshot().map((driver) => ({
        value: driver.id,
        label: `${driver.firstName} ${driver.lastName} - ${driver.driverId || driver.id}`
      }));
    }

    return [];
  }

  private adminAccessApiRoleCodeToPreset(code: string): any {
    switch (code) {
      case 'super_admin_all': return 'super_admin';
      case 'admin_operations': return 'operations_lead';
      case 'vendor_branch_staff': return 'vendor_branch_employee';
      default: return code;
    }
  }

  private mapPanelScopeToNumber(scope: RoleDefinitionDto['panelScope']): number {
    if (scope === 0 || scope === '0' || scope === 'SuperAdminPanel' || scope === 'super_admin_panel') return 0;
    if (scope === 1 || scope === '1' || scope === 'VendorPanel' || scope === 'vendor_panel') return 1;
    if (scope === 2 || scope === '2' || scope === 'DriverApp' || scope === 'driver_app') return 2;
    if (scope === 3 || scope === '3' || scope === 'CustomerApp' || scope === 'customer_app') return 3;
    return 0;
  }

  private defaultScopeTypeForPanel(panelScope: number): number {
    if (panelScope === 1) return 1;
    if (panelScope === 2) return 3;
    if (panelScope === 3) return 4;
    return 0;
  }

  private selectedCreatePanelScopeNumber(): number {
    const role = this.roles.find((entry) => entry.id === this.createUserForm.roleDefinitionId);
    return role ? this.mapPanelScopeToNumber(role.panelScope) : 0;
  }

  private resolveCreateScopeEntityId(panelScope: number): string | null | undefined {
    if (panelScope === 1 || panelScope === 2) {
      const value = this.createUserForm.scopeEntityId.trim();
      return value || undefined;
    }

    return null;
  }
}
