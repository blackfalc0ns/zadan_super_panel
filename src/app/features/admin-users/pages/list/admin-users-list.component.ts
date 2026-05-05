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
  searchTerm = '';
  isFiltersExpanded = false;

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
    private router: Router
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
    const usersSub = this.adminAccessApi.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.totalCount = data.length;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
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
    // Basic local filter simulation or API fetch
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
    if (status === 'locked') return 'danger';
    if (status === 'inactive') return 'warning';
    return 'neutral';
  }

  getRoleNameKey(user: AdminUserRecord): string {
    return getRolePresetById(user.rolePresetId).nameKey;
  }

  getAudienceLabelKey(user: AdminUserRecord): string {
    return DIRECTORY_AUDIENCE_LABELS[user.audienceType];
  }

  getPanelLabelKey(user: AdminUserRecord): string {
    return DIRECTORY_PANEL_LABELS[user.panelScope];
  }
}
