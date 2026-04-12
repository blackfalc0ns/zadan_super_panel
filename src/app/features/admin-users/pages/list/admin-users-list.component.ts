import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataTableComponent, TableColumn } from '@shared/components/ui/data-table/data-table.component';
import { KpiCardsComponent, KPICard } from '@shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPaginationComponent } from '@shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '@shared/components/ui/status-pill/status-pill.component';
import {
  AdminAccessLevel,
  AdminAccessStatus,
  AdminRolePreset,
  AdminUserRecord,
  DIRECTORY_AUDIENCE_LABELS,
  DIRECTORY_PANEL_LABELS,
  DIRECTORY_PERSONA_LABELS,
  DirectoryAudienceType,
  DirectoryPanelScope,
  DirectoryPersonaType
} from '../../models/admin-users.models';
import { AdminUsersService } from '../../services/admin-users.service';

type FilterValue<T extends string> = 'all' | T;

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    DataTableComponent,
    KpiCardsComponent,
    AppPaginationComponent,
    AppPageHeaderComponent,
    StatusPillComponent
  ],
  templateUrl: './admin-users-list.component.html',
  styleUrl: './admin-users-list.component.scss'
})
export class AdminUsersListComponent implements OnInit {
  page = 1;
  pageSize = 8;
  searchTerm = '';
  selectedAudience: FilterValue<DirectoryAudienceType> = 'all';
  statusFilter: FilterValue<AdminAccessStatus> = 'all';
  accessLevelFilter: FilterValue<AdminAccessLevel> = 'all';
  roleFilter = 'all';
  panelFilter: FilterValue<DirectoryPanelScope> = 'all';
  personaFilter: FilterValue<DirectoryPersonaType> = 'all';
  vendorFilter = 'all';
  branchFilter = 'all';

  users: AdminUserRecord[] = [];
  rolePresets: AdminRolePreset[] = [];

  readonly audienceTabs: Array<{ value: FilterValue<DirectoryAudienceType>; labelKey: string }> = [
    { value: 'all', labelKey: 'ADMIN_USERS.AUDIENCE.ALL' },
    { value: 'super_admin', labelKey: DIRECTORY_AUDIENCE_LABELS.super_admin },
    { value: 'vendor_network', labelKey: DIRECTORY_AUDIENCE_LABELS.vendor_network },
    { value: 'drivers', labelKey: DIRECTORY_AUDIENCE_LABELS.drivers },
    { value: 'customers', labelKey: DIRECTORY_AUDIENCE_LABELS.customers }
  ];

  readonly statusOptions: Array<{ value: FilterValue<AdminAccessStatus>; labelKey: string }> = [
    { value: 'all', labelKey: 'ADMIN_USERS.FILTERS.ALL' },
    { value: 'active', labelKey: 'ADMIN_USERS.STATUS.ACTIVE' },
    { value: 'invited', labelKey: 'ADMIN_USERS.STATUS.INVITED' },
    { value: 'suspended', labelKey: 'ADMIN_USERS.STATUS.SUSPENDED' },
    { value: 'inactive', labelKey: 'ADMIN_USERS.STATUS.INACTIVE' }
  ];

  readonly accessLevelOptions: Array<{ value: FilterValue<AdminAccessLevel>; labelKey: string }> = [
    { value: 'all', labelKey: 'ADMIN_USERS.FILTERS.ALL' },
    { value: 'full', labelKey: 'ADMIN_USERS.ACCESS_LEVEL.FULL' },
    { value: 'restricted', labelKey: 'ADMIN_USERS.ACCESS_LEVEL.RESTRICTED' },
    { value: 'observer', labelKey: 'ADMIN_USERS.ACCESS_LEVEL.OBSERVER' }
  ];

  readonly panelOptions: Array<{ value: FilterValue<DirectoryPanelScope>; labelKey: string }> = [
    { value: 'all', labelKey: 'ADMIN_USERS.FILTERS.ALL' },
    { value: 'super_admin_panel', labelKey: DIRECTORY_PANEL_LABELS.super_admin_panel },
    { value: 'vendor_panel', labelKey: DIRECTORY_PANEL_LABELS.vendor_panel },
    { value: 'driver_app', labelKey: DIRECTORY_PANEL_LABELS.driver_app },
    { value: 'customer_app', labelKey: DIRECTORY_PANEL_LABELS.customer_app }
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'identity', title: 'ADMIN_USERS.TABLE.IDENTITY', width: '25%', align: 'left', type: 'custom' },
    { key: 'persona', title: 'ADMIN_USERS.TABLE.PERSONA', width: '16%', align: 'left', type: 'custom' },
    { key: 'scope', title: 'ADMIN_USERS.TABLE.SCOPE', width: '17%', align: 'left', type: 'custom' },
    { key: 'role', title: 'ADMIN_USERS.TABLE.ROLE', width: '16%', align: 'left', type: 'custom' },
    { key: 'status', title: 'ADMIN_USERS.TABLE.STATUS', width: '12%', align: 'center', type: 'custom' },
    { key: 'security', title: 'ADMIN_USERS.TABLE.SECURITY', width: '14%', align: 'center', type: 'custom' }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly adminUsersService: AdminUsersService,
    public readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.rolePresets = this.adminUsersService.getRolePresets();
    this.users = this.adminUsersService.getUsers();

    this.route.queryParamMap.subscribe((params) => {
      this.searchTerm = params.get('q') ?? '';
      this.selectedAudience = this.normalizeAudience(params.get('audience'));
      this.statusFilter = this.normalizeStatus(params.get('status'));
      this.accessLevelFilter = this.normalizeAccessLevel(params.get('access'));
      this.roleFilter = params.get('role') ?? 'all';
      this.panelFilter = this.normalizePanel(params.get('panel'));
      this.personaFilter = this.normalizePersona(params.get('persona'));
      this.vendorFilter = params.get('vendor') ?? 'all';
      this.branchFilter = params.get('branch') ?? 'all';
      this.page = 1;
    });
  }

  get kpiCards(): KPICard[] {
    const snapshot = this.adminUsersService.getKpiSnapshot(this.filteredUsers);

    return [
      {
        id: 'total-identities',
        title: 'ADMIN_USERS.KPI.TOTAL',
        value: snapshot.totalIdentities,
        icon: '<span class="material-symbols-outlined text-[20px]">hub</span>',
        color: '#127c8c'
      },
      {
        id: 'operational-identities',
        title: 'ADMIN_USERS.KPI.OPERATIONAL',
        value: snapshot.operationalIdentities,
        icon: '<span class="material-symbols-outlined text-[20px]">shield_person</span>',
        color: '#2563eb'
      },
      {
        id: 'vendor-panel',
        title: 'ADMIN_USERS.KPI.VENDOR_PANEL',
        value: snapshot.vendorPanelIdentities,
        icon: '<span class="material-symbols-outlined text-[20px]">storefront</span>',
        color: '#10b981'
      },
      {
        id: 'external-accounts',
        title: 'ADMIN_USERS.KPI.EXTERNAL',
        value: snapshot.externalAccounts,
        icon: '<span class="material-symbols-outlined text-[20px]">person_search</span>',
        color: '#8b5cf6'
      },
      {
        id: 'mfa-gaps',
        title: 'ADMIN_USERS.KPI.MFA_GAPS',
        value: snapshot.mfaGapIdentities,
        icon: '<span class="material-symbols-outlined text-[20px]">security_update_warning</span>',
        color: '#f59e0b'
      },
      {
        id: 'custom-access',
        title: 'ADMIN_USERS.KPI.CUSTOM_ACCESS',
        value: snapshot.customRoleIdentities,
        icon: '<span class="material-symbols-outlined text-[20px]">tune</span>',
        color: '#0f766e'
      }
    ];
  }

  get personaOptions(): Array<{ value: FilterValue<DirectoryPersonaType>; labelKey: string }> {
    const personas = Object.entries(DIRECTORY_PERSONA_LABELS)
      .filter(([persona]) => this.selectedAudience === 'all' || this.mapPersonaToAudience(persona as DirectoryPersonaType) === this.selectedAudience)
      .map(([persona, labelKey]) => ({ value: persona as DirectoryPersonaType, labelKey }));

    return [{ value: 'all', labelKey: 'ADMIN_USERS.FILTERS.ALL' }, ...personas];
  }

  get vendorOptions(): Array<{ id: string; name: string }> {
    return this.adminUsersService.getVendorOptions().map((vendor) => ({ id: vendor.id, name: vendor.name }));
  }

  get branchOptions(): Array<{ id: string; name: string }> {
    return this.adminUsersService.getBranchOptions(this.vendorFilter === 'all' ? null : this.vendorFilter)
      .map((branch) => ({ id: branch.id, name: branch.name }));
  }

  get filteredRolePresets(): AdminRolePreset[] {
    return this.rolePresets.filter((preset) => this.panelFilter === 'all' || preset.panelScope === this.panelFilter);
  }

  get filteredUsers(): AdminUserRecord[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.users.filter((user) => {
      const matchesSearch = !search || [
        user.fullName,
        user.email,
        user.team,
        user.department,
        user.assignment.vendorName,
        user.assignment.branchName
      ].some((value) => value.toLowerCase().includes(search));

      const matchesAudience = this.selectedAudience === 'all' || user.audienceType === this.selectedAudience;
      const matchesStatus = this.statusFilter === 'all' || user.status === this.statusFilter;
      const matchesAccess = this.accessLevelFilter === 'all' || user.accessLevel === this.accessLevelFilter;
      const matchesRole = this.roleFilter === 'all' || user.rolePresetId === this.roleFilter;
      const matchesPanel = this.panelFilter === 'all' || user.panelScope === this.panelFilter;
      const matchesPersona = this.personaFilter === 'all' || user.personaType === this.personaFilter;
      const matchesVendor = this.vendorFilter === 'all' || user.assignment.vendorId === this.vendorFilter;
      const matchesBranch = this.branchFilter === 'all' || user.assignment.branchId === this.branchFilter;

      return matchesSearch
        && matchesAudience
        && matchesStatus
        && matchesAccess
        && matchesRole
        && matchesPanel
        && matchesPersona
        && matchesVendor
        && matchesBranch;
    });
  }

  get paginatedUsers(): AdminUserRecord[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalItems(): number {
    return this.filteredUsers.length;
  }

  get activeFilterCount(): number {
    return [
      this.searchTerm.trim().length > 0,
      this.selectedAudience !== 'all',
      this.statusFilter !== 'all',
      this.accessLevelFilter !== 'all',
      this.roleFilter !== 'all',
      this.panelFilter !== 'all',
      this.personaFilter !== 'all',
      this.vendorFilter !== 'all',
      this.branchFilter !== 'all'
    ].filter(Boolean).length;
  }

  setAudience(audience: FilterValue<DirectoryAudienceType>): void {
    this.selectedAudience = audience;
    if (this.personaFilter !== 'all' && this.mapPersonaToAudience(this.personaFilter) !== audience && audience !== 'all') {
      this.personaFilter = 'all';
    }
    this.applyFilters();
  }

  applyFilters(): void {
    this.page = 1;
    this.persistRouteState();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedAudience = 'all';
    this.statusFilter = 'all';
    this.accessLevelFilter = 'all';
    this.roleFilter = 'all';
    this.panelFilter = 'all';
    this.personaFilter = 'all';
    this.vendorFilter = 'all';
    this.branchFilter = 'all';
    this.page = 1;
    this.persistRouteState();
  }

  changePage(page: number): void {
    this.page = page;
  }

  openUser(user: AdminUserRecord): void {
    this.router.navigate(['/admin-users', user.id]);
  }

  createIdentity(): void {
    const persona = this.selectedAudience === 'vendor_network'
      ? 'vendor_company_manager'
      : this.selectedAudience === 'drivers'
        ? 'driver'
        : this.selectedAudience === 'customers'
          ? 'customer'
          : 'super_admin_staff';

    const user = this.adminUsersService.createDraftUser(persona);
    this.router.navigate(['/admin-users', user.id]);
  }

  openEmailCenter(): void {
    this.router.navigate(['/email-center'], {
      queryParams: {
        audience: this.selectedAudience === 'all' ? null : this.selectedAudience
      },
      queryParamsHandling: 'merge'
    });
  }

  getRolePresetName(user: AdminUserRecord): string {
    return this.rolePresets.find((preset) => preset.id === user.rolePresetId)?.nameKey ?? 'ADMIN_USERS.PRESETS.SUPPORT_ADMIN.NAME';
  }

  getPersonaLabel(user: AdminUserRecord): string {
    return DIRECTORY_PERSONA_LABELS[user.personaType];
  }

  getPanelLabel(user: AdminUserRecord): string {
    return DIRECTORY_PANEL_LABELS[user.panelScope];
  }

  getScopeSummary(user: AdminUserRecord): string {
    if (user.assignment.branchName) {
      return `${user.assignment.vendorName} - ${user.assignment.branchName}`;
    }

    if (user.assignment.vendorName) {
      return user.assignment.vendorName;
    }

    if (user.team) {
      return user.team;
    }

    if (user.assignment.city) {
      return user.assignment.city;
    }

    return this.translate.instant('ADMIN_USERS.SCOPE.GLOBAL');
  }

  getStatusVariant(status: AdminAccessStatus): StatusPillVariant {
    const variants: Record<AdminAccessStatus, StatusPillVariant> = {
      active: 'success',
      invited: 'warning',
      suspended: 'danger',
      inactive: 'neutral'
    };

    return variants[status];
  }

  getAccessLevelVariant(level: AdminAccessLevel): StatusPillVariant {
    const variants: Record<AdminAccessLevel, StatusPillVariant> = {
      full: 'primary',
      restricted: 'info',
      observer: 'neutral'
    };

    return variants[level];
  }

  getSecurityLabel(user: AdminUserRecord): string {
    if (user.identityKind === 'external') {
      return `ADMIN_USERS.VERIFICATION.${user.security.verificationState.toUpperCase()}`;
    }

    return user.security.mfaEnabled ? 'ADMIN_USERS.SECURITY.MFA_ON' : 'ADMIN_USERS.SECURITY.MFA_OFF';
  }

  getSecurityVariant(user: AdminUserRecord): StatusPillVariant {
    if (user.identityKind === 'external') {
      switch (user.security.verificationState) {
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

    return user.security.mfaEnabled ? 'success' : 'warning';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  getCustomPermissionCount(user: AdminUserRecord): number {
    return this.adminUsersService.getCustomPermissionCount(user);
  }

  private persistRouteState(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchTerm.trim() || null,
        audience: this.selectedAudience !== 'all' ? this.selectedAudience : null,
        status: this.statusFilter !== 'all' ? this.statusFilter : null,
        access: this.accessLevelFilter !== 'all' ? this.accessLevelFilter : null,
        role: this.roleFilter !== 'all' ? this.roleFilter : null,
        panel: this.panelFilter !== 'all' ? this.panelFilter : null,
        persona: this.personaFilter !== 'all' ? this.personaFilter : null,
        vendor: this.vendorFilter !== 'all' ? this.vendorFilter : null,
        branch: this.branchFilter !== 'all' ? this.branchFilter : null
      },
      replaceUrl: true
    });
  }

  private normalizeAudience(value: string | null): FilterValue<DirectoryAudienceType> {
    return this.audienceTabs.some((option) => option.value === value) ? (value as FilterValue<DirectoryAudienceType>) : 'all';
  }

  private normalizeStatus(value: string | null): FilterValue<AdminAccessStatus> {
    return this.statusOptions.some((option) => option.value === value) ? (value as FilterValue<AdminAccessStatus>) : 'all';
  }

  private normalizeAccessLevel(value: string | null): FilterValue<AdminAccessLevel> {
    return this.accessLevelOptions.some((option) => option.value === value) ? (value as FilterValue<AdminAccessLevel>) : 'all';
  }

  private normalizePanel(value: string | null): FilterValue<DirectoryPanelScope> {
    return this.panelOptions.some((option) => option.value === value) ? (value as FilterValue<DirectoryPanelScope>) : 'all';
  }

  private normalizePersona(value: string | null): FilterValue<DirectoryPersonaType> {
    return value && value in DIRECTORY_PERSONA_LABELS ? value as FilterValue<DirectoryPersonaType> : 'all';
  }

  private mapPersonaToAudience(persona: DirectoryPersonaType): DirectoryAudienceType {
    switch (persona) {
      case 'super_admin_manager':
      case 'super_admin_staff':
        return 'super_admin';
      case 'vendor_owner':
      case 'vendor_company_manager':
      case 'vendor_branch_manager':
      case 'vendor_branch_employee':
      case 'vendor_finance':
      case 'vendor_support':
        return 'vendor_network';
      case 'driver':
        return 'drivers';
      case 'customer':
        return 'customers';
    }
  }
}
