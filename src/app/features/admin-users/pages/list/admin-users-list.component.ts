import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
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
import {
  ADMIN_DEPARTMENT_STRUCTURE,
  findAdminDepartmentByValue,
  findAdminTeamByValue,
  resolveAdminOrgDefaultsForRoleCode
} from '../../models/admin-org-structure';
import { forkJoin, Subscription } from 'rxjs';

import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/ui/data-table/data-table.component';
import { KpiCardsComponent, KPICard } from '../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { AdvancedFilterPanelComponent, FilterField } from '../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { SearchableSelectComponent, SearchableSelectOption } from '@shared/components/ui/form-controls/select/searchable-select.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    StatusPillComponent,
    AdvancedFilterPanelComponent,
    SearchableSelectComponent
  ],
  templateUrl: './admin-users-list.component.html',
  styleUrl: './admin-users-list.component.scss'
})
export class AdminUsersListComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  users: AdminUserRecord[] = [];
  roles: RoleDefinitionDto[] = [];
  isLoading = false;
  isCreatingUser = false;
  showCreateUserModal = false;
  createUserError = '';
  searchTerm = '';
  isFiltersExpanded = false;
  filters: Record<string, any> = {
    status: '',
    roleDefinitionId: '',
    panelScope: ''
  };
  filterFields: FilterField[] = [];
  createUserForm = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleDefinitionId: '',
    department: '',
    team: '',
    notes: ''
  };

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  statsActiveCount = 0;
  statsSuspendedCount = 0;

  get isRTL(): boolean {
    return this.translate.currentLang === 'ar';
  }

  get adminCreateRoles(): RoleDefinitionDto[] {
    return this.roles.filter((role) => this.isSuperAdminPanelRole(role));
  }

  get mappedRolesOptions(): SearchableSelectOption[] {
    return this.adminCreateRoles.map((role) => ({
      value: role.id,
      label: this.getRoleOptionLabel(role)
    }));
  }

  get mappedDepartmentOptions(): SearchableSelectOption[] {
    return ADMIN_DEPARTMENT_STRUCTURE.map((department) => ({
      value: department.value,
      label: this.translate.instant(department.labelKey)
    }));
  }

  get mappedTeamOptions(): SearchableSelectOption[] {
    const department = findAdminDepartmentByValue(this.createUserForm.department);
    if (!department) {
      return [];
    }

    return department.teams.map((team) => ({
      value: team.value,
      label: this.translate.instant(team.labelKey)
    }));
  }

  get selectedCreateRole(): RoleDefinitionDto | null {
    return this.adminCreateRoles.find((entry) => entry.id === this.createUserForm.roleDefinitionId) ?? null;
  }

  get canSubmitCreateUser(): boolean {
    if (!this.createUserForm.fullName.trim()
      || !this.createUserForm.email.trim()
      || !this.createUserForm.password.trim()
      || !this.createUserForm.roleDefinitionId) {
      return false;
    }

    return this.adminCreateRoles.length > 0;
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
    { id: 'edit', label: 'ADMIN_USERS.ACTIONS.EDIT_USER', icon: 'edit' }
  ];

  private readonly subscriptions = new Subscription();

  constructor(
    private adminAccessApi: AdminAccessApiService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.subscriptions.add(
      this.translate.onLangChange.subscribe(() => {
        this.cdr.markForCheck();
        this.initializeFilterFields();
        if (this.showCreateUserModal) {
          this.cdr.markForCheck();
        }
        const roleField = this.filterFields.find(f => f.key === 'roleDefinitionId');
        if (roleField && this.roles.length > 0) {
          roleField.options = this.roles.map(r => ({
            value: r.id,
            label: this.getRoleOptionLabel(r)
          }));
        }
      })
    );
  }

  ngOnInit() {
    this.initializeFilterFields();
    this.updateKPICards();
    this.loadUsers();
    this.loadUserStats();
    this.loadRolesSummary();
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.searchTerm.trim()) count += 1;
    if (this.filters['status']) count += 1;
    if (this.filters['roleDefinitionId']) count += 1;
    if (this.filters['panelScope'] !== undefined && this.filters['panelScope'] !== '') count += 1;
    return count;
  }

  get activeFilterCountLabel(): string {
    return this.translate.instant('ADMIN_USERS.FILTERS.ACTIVE_COUNT_VALUE', { count: this.activeFilterCount });
  }

  get quickStatusFilter(): '' | 'active' | 'suspended' {
    const status = this.filters['status'];
    return status === 'active' || status === 'suspended' ? status : '';
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  initializeFilterFields() {
    this.filterFields = [
      {
        key: 'status',
        label: 'ADMIN_USERS.FILTERS.STATUS',
        type: 'select',
        color: '#10b981',
        placeholder: 'ADMIN_USERS.FILTERS.ALL',
        options: [
          { value: 'active', label: this.translate.instant('ADMIN_USERS.STATUS.ACTIVE') },
          { value: 'suspended', label: this.translate.instant('ADMIN_USERS.STATUS.SUSPENDED') },
          { value: 'inactive', label: this.translate.instant('ADMIN_USERS.STATUS.INACTIVE') }
        ]
      },
      {
        key: 'roleDefinitionId',
        label: 'ADMIN_USERS.FILTERS.ROLE',
        type: 'select',
        color: '#0ea5e9',
        placeholder: 'ADMIN_USERS.FILTERS.ALL',
        options: []
      },
      {
        key: 'panelScope',
        label: 'ADMIN_USERS.FILTERS.PANEL',
        type: 'select',
        color: '#8b5cf6',
        placeholder: 'ADMIN_USERS.FILTERS.ALL',
        options: [
          { value: '0', label: this.translate.instant('ADMIN_USERS.PANELS.SUPER_ADMIN_PANEL') },
          { value: '1', label: this.translate.instant('ADMIN_USERS.PANELS.VENDOR_PANEL') },
          { value: '2', label: this.translate.instant('ADMIN_USERS.PANELS.DRIVER_APP') },
          { value: '3', label: this.translate.instant('ADMIN_USERS.PANELS.CUSTOMER_APP') }
        ]
      }
    ];
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
        title: 'ADMIN_USERS.KPI.TOTAL',
        value: this.totalCount,
        icon: 'group',
        color: '#127c8c',
        clickable: true
      },
      {
        id: 'active',
        title: 'ADMIN_USERS.KPI.ACTIVE',
        value: this.statsActiveCount,
        icon: 'check_circle',
        color: '#10b981',
        clickable: true
      },
      {
        id: 'suspended',
        title: 'ADMIN_USERS.KPI.SUSPENDED',
        value: this.statsSuspendedCount,
        icon: 'lock',
        color: '#ef4444',
        clickable: true
      }
    ];
  }

  loadUserStats(): void {
    const statsSub = forkJoin({
      active: this.adminAccessApi.getUsersPage({ pageNumber: 1, pageSize: 1, status: 'active' }),
      suspended: this.adminAccessApi.getUsersPage({ pageNumber: 1, pageSize: 1, status: 'suspended' })
    }).subscribe({
      next: ({ active, suspended }) => {
        this.cdr.markForCheck();
        this.statsActiveCount = active.totalCount;
        this.statsSuspendedCount = suspended.totalCount;
        this.updateKPICards();
      },
      error: () => {
        this.cdr.markForCheck();
        this.statsActiveCount = 0;
        this.statsSuspendedCount = 0;
        this.updateKPICards();
      }
    });
    this.subscriptions.add(statsSub);
  }

  loadUsers() {
    this.isLoading = true;
    const usersSub = this.adminAccessApi.getUsersPage({
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchTerm.trim() || undefined,
      status: this.filters['status'] || undefined,
      roleDefinitionId: this.filters['roleDefinitionId'] || undefined,
      panelScope: this.filters['panelScope'] !== undefined && this.filters['panelScope'] !== '' ? Number(this.filters['panelScope']) : undefined
    }).subscribe({
      next: (page) => {
        this.cdr.markForCheck();
        this.users = page.items;
        this.totalCount = page.totalCount;
        this.totalPages = page.totalPages;
        this.updateKPICards();
        this.isLoading = false;
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to load admin users', err);
        this.isLoading = false;
        this.users = [];
      }
    });
    this.subscriptions.add(usersSub);
  }

  loadRolesSummary() {
    const rolesSub = this.adminAccessApi.getRoles().subscribe({
      next: (roles) => {
        this.cdr.markForCheck();
        this.roles = roles;
        const roleField = this.filterFields.find(f => f.key === 'roleDefinitionId');
        if (roleField) {
          roleField.options = roles.map(r => ({
            value: r.id,
            label: this.getRoleOptionLabel(r)
          }));
        }
        const adminRoles = roles.filter((role) => this.isSuperAdminPanelRole(role));
        if (!this.createUserForm.roleDefinitionId && adminRoles.length > 0) {
          this.createUserForm.roleDefinitionId = adminRoles[0].id;
        }
      },
      error: (err) => {
        this.cdr.markForCheck();
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

  onFilterChange() {
    this.pageNumber = 1;
    this.loadUsers();
  }

  resetFilters() {
    this.filters = {
      status: '',
      roleDefinitionId: '',
      panelScope: ''
    };
    this.searchTerm = '';
    this.pageNumber = 1;
    this.loadUsers();
  }

  onKPICardClick(card: KPICard) {
    if (card.id === 'total') {
      this.applyQuickStatusFilter('');
      return;
    }

    if (card.id === 'active') {
      this.applyQuickStatusFilter('active');
      return;
    }

    if (card.id === 'suspended') {
      this.applyQuickStatusFilter('suspended');
    }
  }

  applyQuickStatusFilter(status: '' | 'active' | 'suspended'): void {
    this.filters = {
      ...this.filters,
      status
    };
    this.pageNumber = 1;
    this.loadUsers();
  }

  onTableRowClick(user: AdminUserRecord) {
    this.router.navigate(['/admin-users', user.id]);
  }

  onTableAction(event: { action: TableAction, item: AdminUserRecord }) {
    if (event.action.id === 'view') {
      this.router.navigate(['/admin-users', event.item.id]);
    } else if (event.action.id === 'edit') {
      this.router.navigate(['/admin-users', event.item.id]);
    }
  }

  openRolesManagement() {
    this.router.navigate(['/admin-users/roles']);
  }

  openCreateUserModal(): void {
    const firstRole = this.adminCreateRoles[0];
    this.createUserForm = {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      roleDefinitionId: firstRole?.id ?? '',
      department: '',
      team: '',
      notes: ''
    };
    this.createUserError = '';
    this.showCreateUserModal = true;
    this.applyRoleOrgDefaults();
    this.cdr.markForCheck();
  }

  closeCreateUserModal(): void {
    if (!this.isCreatingUser) {
      this.showCreateUserModal = false;
    }
  }

  onCreateRoleChange(): void {
    this.createUserError = '';
    this.applyRoleOrgDefaults();
    this.cdr.markForCheck();
  }

  onCreateDepartmentChange(): void {
    const department = findAdminDepartmentByValue(this.createUserForm.department);
    const team = findAdminTeamByValue(department, this.createUserForm.team);
    if (!team && department?.teams.length) {
      this.createUserForm.team = department.teams[0].value;
    }
    this.cdr.markForCheck();
  }

  private applyRoleOrgDefaults(): void {
    const role = this.selectedCreateRole;
    const defaults = resolveAdminOrgDefaultsForRoleCode(role?.code);
    if (!defaults) {
      return;
    }

    this.createUserForm.department = defaults.department.value;
    this.createUserForm.team = defaults.team.value;
  }

  generateTemporaryPassword(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i += 1) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.createUserForm.password = password;
    this.cdr.markForCheck();
  }

  createUser(): void {
    const role = this.selectedCreateRole;
    if (!role || !this.canSubmitCreateUser || !this.isSuperAdminPanelRole(role)) {
      this.createUserError = this.translate.instant('ADMIN_USERS.CREATE.VALIDATION_REQUIRED');
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
      panelScope: 0,
      scopeType: 0,
      scopeEntityId: null,
      department: this.createUserForm.department.trim() || null,
      team: this.createUserForm.team.trim() || null,
      notes: this.createUserForm.notes.trim() || null
    }).subscribe({
      next: (user) => {
        this.cdr.markForCheck();
        this.users = [user, ...this.users.filter((entry) => entry.id !== user.id)];
        this.totalCount += 1;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.updateKPICards();
        this.isCreatingUser = false;
        this.showCreateUserModal = false;
        this.loadUserStats();
        this.router.navigate(['/admin-users', user.id]);
      },
      error: (err) => {
        this.cdr.markForCheck();
        console.error('Failed to create admin user', err);
        this.createUserError = this.resolveCreateUserError(err);
        this.isCreatingUser = false;
      }
    });
    this.subscriptions.add(createSub);
  }

  getInitials(user: AdminUserRecord): string {
    const parts = user.fullName.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return 'AD';
    }

    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  getStatusLabelKey(status: string): string {
    return `ADMIN_USERS.STATUS.${status.toUpperCase()}`;
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
    const roleName = role.isSystem ? this.translate.instant(preset.nameKey) : role.name;
    const panelKey = this.getPanelLabelKeyForRole(role);
    return `${roleName} · ${this.translate.instant(panelKey)}`;
  }

  getPanelLabelKeyForRole(role: RoleDefinitionDto): string {
    const panelScope = this.mapPanelScopeToNumber(role.panelScope);
    const keys: Record<number, string> = {
      0: DIRECTORY_PANEL_LABELS.super_admin_panel,
      1: DIRECTORY_PANEL_LABELS.vendor_panel,
      2: DIRECTORY_PANEL_LABELS.driver_app,
      3: DIRECTORY_PANEL_LABELS.customer_app
    };
    return keys[panelScope] ?? DIRECTORY_PANEL_LABELS.super_admin_panel;
  }

  private resolveCreateUserError(err: { error?: { code?: string; message?: string; title?: string } }): string {
    const code = err.error?.code;
    if (code) {
      const key = `ADMIN_USERS.CREATE.ERRORS.${code}`;
      const translated = this.translate.instant(key);
      if (translated !== key) {
        return translated;
      }
    }

    return err.error?.message || err.error?.title || this.translate.instant('ADMIN_USERS.CREATE.FAILED');
  }

  private adminAccessApiRoleCodeToPreset(code: string): any {
    switch (code) {
      case 'super_admin_all': return 'super_admin';
      case 'admin_operations': return 'operations_lead';
      case 'risk_admin': return 'risk_admin';
      case 'finance_admin': return 'finance_admin';
      case 'support_admin': return 'support_admin';
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

  private isSuperAdminPanelRole(role: RoleDefinitionDto): boolean {
    return this.mapPanelScopeToNumber(role.panelScope) === 0;
  }
}
