import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VendorService } from '../../../core/services/vendor.service';
import { 
  Vendor, 
  VendorStatus, 
  VendorKPIs, 
  VendorFilters,
  OnboardingStage,
  VerificationStatus,
  DocumentsStatus,
  RiskLevel,
  PayoutStatus
} from '../../../core/models/vendor';
import { AppButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AppInputComponent } from '../../../shared/components/ui/form-controls/input.component';
import { AppPaginationComponent } from '../../../shared/components/ui/pagination/pagination.component';

// Import new components
import { AdvancedFilterPanelComponent, FilterField } from '../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { KpiCardsComponent, KPICard } from '../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { DataTableComponent, TableColumn, TableAction, BulkAction } from '../../../shared/components/ui/data-table/data-table.component';
import { QuickPreviewDrawerComponent, PreviewAction } from '../../../shared/components/ui/quick-preview-drawer/quick-preview-drawer.component';
import { MobileVendorCardsComponent, VendorCardData } from '../../../shared/components/ui/mobile-vendor-cards/mobile-vendor-cards.component';

@Component({
  selector: 'app-vendors-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppPaginationComponent,
    AdvancedFilterPanelComponent,
    KpiCardsComponent,
    DataTableComponent,
    QuickPreviewDrawerComponent,
    MobileVendorCardsComponent
  ],
  templateUrl: './vendors-list.component.html',
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

    td:nth-child(3), th:nth-child(3) {
      text-align: start !important;
    }
  `]
})
export class VendorsListComponent implements OnInit {
  Math = Math;

  vendors: Vendor[] = [];
  isLoading = false;
  showError = false;
  errorMessage = '';

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  // Filters
  searchTerm = '';
  filters: VendorFilters = {};
  isFiltersExpanded = false;
  
  // Options
  statusOptions = Object.values(VendorStatus);
  onboardingStageOptions = Object.values(OnboardingStage);
  verificationStatusOptions = Object.values(VerificationStatus);
  documentsStatusOptions = Object.values(DocumentsStatus);
  riskLevelOptions = Object.values(RiskLevel);
  payoutStatusOptions = Object.values(PayoutStatus);
  cityOptions = [
    'COMMON.CITIES.RIYADH',
    'COMMON.CITIES.JEDDAH',
    'COMMON.CITIES.DAMMAM',
    'COMMON.CITIES.MAKKAH',
    'COMMON.CITIES.MADINAH',
    'COMMON.CITIES.TAIF',
    'COMMON.CITIES.TABUK',
    'COMMON.CITIES.ABHA',
    'COMMON.CITIES.KHOBAR',
    'COMMON.CITIES.QATIF'
  ];
  regionOptions = [
    'COMMON.REGIONS.CENTRAL',
    'COMMON.REGIONS.WESTERN',
    'COMMON.REGIONS.EASTERN',
    'COMMON.REGIONS.NORTHERN',
    'COMMON.REGIONS.SOUTHERN'
  ];
  
  // KPIs
  kpis: VendorKPIs = {
    pendingApproval: 0,
    missingDocuments: 0,
    highRisk: 0,
    payoutBlocked: 0,
    suspended: 0
  };

  kpiCards: KPICard[] = [];
  
  // Configuration for components
  filterFields: FilterField[] = [
    { key: 'city', label: 'VENDOR_DETAIL.LOCATION_CITY', type: 'select', color: '#0ea5e9', options: [] },
    { key: 'status', label: 'COMMON.STATUS', type: 'select', color: '#10b981', options: [] },
    { key: 'riskLevel', label: 'VENDORS.RISK_LEVEL_TITLE', type: 'select', color: '#ef4444', options: [] },
    { key: 'onboardingStage', label: 'VENDORS.PREVIEW.ONBOARDING_STAGE', type: 'select', color: '#8b5cf6', options: [] },
    { key: 'documentsStatus', label: 'VENDORS.PREVIEW.VERIFICATION_STATUS', type: 'select', color: '#3b82f6', options: [] },
    { key: 'payoutStatus', label: 'VENDORS.PREVIEW.PAYOUT_STATUS', type: 'select', color: '#f59e0b', options: [] },
    { key: 'verificationStatus', label: 'VENDORS.PREVIEW.VERIFICATION_STATUS', type: 'select', color: '#6366f1', options: [] },
    { key: 'region', label: 'VENDOR_DETAIL.LOCATION_CITY', type: 'select', color: '#f97316', options: [] }
  ];

  tableColumns: TableColumn[] = [
    { key: 'index', title: 'COMMON.INDEX', width: '3%', align: 'center' },
    { key: 'logo', title: 'VENDORS.TABLE.LOGO', width: '6%', align: 'center', type: 'custom' },
    { key: 'businessName', title: 'VENDORS.TABLE.VENDOR', width: '20%', align: 'left', type: 'custom' },
    { key: 'contactEmail', title: 'VENDORS.TABLE.CONTACT', width: '15%', align: 'center' },
    { key: 'documentsCompleteness', title: 'VENDORS.TABLE.DOCUMENTS', width: '10%', align: 'center', type: 'progress' },
    { key: 'riskLevel', title: 'VENDORS.TABLE.RISK', width: '10%', align: 'center', type: 'custom' },
    { key: 'status', title: 'VENDORS.TABLE.STATUS', width: '10%', align: 'center', type: 'custom' },
    { key: 'actions', title: 'VENDORS.TABLE.ACTIONS', width: '10%', align: 'center', type: 'actions' }
  ];

  tableActions: TableAction[] = [
    { id: 'view', label: 'VENDORS.ACTIONS.VIEW', icon: 'visibility' },
    { id: 'approve', label: 'VENDORS.ACTIONS.APPROVE', icon: 'check_circle', condition: (item) => item.status === 'Pending' },
    { id: 'suspend', label: 'VENDORS.ACTIONS.SUSPEND', icon: 'block', condition: (item) => item.status === 'Active' }
  ];

  bulkActions: BulkAction[] = [
    { id: 'approve', label: 'VENDORS.ACTIONS.APPROVE', icon: 'check_circle', color: 'bg-zadna-primary text-white shadow-zadna-primary/20' },
    { id: 'documents', label: 'VENDORS.PREVIEW.PENDING_REQUIREMENTS', icon: 'mail', color: 'bg-blue-500 text-white shadow-blue-500/20' },
    { id: 'block', label: 'VENDORS.ACTIONS.SUSPEND', icon: 'block', color: 'bg-red-500 text-white shadow-red-500/20' },
    { id: 'export', label: 'DASHBOARD.EXPORT', icon: 'download', color: 'bg-slate-600 text-white shadow-slate-600/20' }
  ];

  previewActions: PreviewAction[] = [
    { id: 'view-details', label: 'VENDORS.VIEW_DETAILS', icon: '<span class="material-symbols-outlined">info</span>', variant: 'primary' },
    { id: 'approve', label: 'VENDORS.ACTIONS.APPROVE', icon: '<span class="material-symbols-outlined">check</span>', variant: 'success' },
    { id: 'documents', label: 'VENDORS.PREVIEW.PENDING_REQUIREMENTS', icon: '<span class="material-symbols-outlined">description</span>', variant: 'secondary' }
  ];

  selectedVendorIds: Set<string> = new Set();
  showBulkActions = false;
  previewVendor: Vendor | null = null;
  showPreviewDrawer = false;

  constructor(
    private vendorService: VendorService,
    public translate: TranslateService,
    private router: Router
  ) {
    this.translate.onLangChange.subscribe(() => {
      this.initializeFilterOptions();
      this.updateKPICards();

      if (this.vendors.length > 0) {
        this.addMockDataToVendors();
      }
    });
  }

  get hasActiveFilters(): boolean {
    return Object.keys(this.filters).some(key => {
      const value = this.filters[key as keyof VendorFilters];
      return value !== undefined && value !== null && value !== '';
    });
  }

  ngOnInit(): void {
    this.initializeFilterOptions();
    this.loadVendors();
    this.loadKPIs();
  }

  // Lifecycle/Initialization
  initializeFilterOptions() {
    this.filterFields.forEach(field => {
      switch (field.key) {
        case 'city':
          field.options = this.cityOptions.map(cityKey => {
            const city = this.translate.instant(cityKey);
            return { value: city, label: city };
          });
          break;
        case 'status':
          field.options = this.statusOptions.map(status => ({ value: status, label: this.getStatusLabel(status) }));
          break;
        case 'riskLevel':
          field.options = this.riskLevelOptions.map(level => ({ value: level, label: this.getRiskLevelLabel(level) }));
          break;
        case 'onboardingStage':
          field.options = this.onboardingStageOptions.map(stage => ({ value: stage, label: this.getOnboardingStageLabel(stage) }));
          break;
        case 'documentsStatus':
          field.options = this.documentsStatusOptions.map(status => ({ value: status, label: this.getDocumentsStatusLabel(status) }));
          break;
        case 'payoutStatus':
          field.options = this.payoutStatusOptions.map(status => ({ value: status, label: this.getPayoutStatusLabel(status) }));
          break;
        case 'verificationStatus':
          field.options = this.verificationStatusOptions.map(status => ({ value: status, label: this.getVerificationStatusLabel(status) }));
          break;
        case 'region':
          field.options = this.regionOptions.map(regionKey => {
            const region = this.translate.instant(regionKey);
            return { value: region, label: region };
          });
          break;
      }
    });
  }

  // Data Loading
  loadVendors() {
    this.isLoading = true;
    this.showError = false;
    
    const allFilters = {
      ...this.filters,
      searchTerm: this.searchTerm || undefined
    };

    this.vendorService.getVendors(this.pageNumber, this.pageSize, this.searchTerm, allFilters.status)
      .subscribe({
        next: (response) => {
          this.vendors = response.items ?? [];
          this.totalCount = response.totalCount ?? 0;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          this.hasPreviousPage = this.pageNumber > 1;
          this.hasNextPage = this.pageNumber < this.totalPages;
          this.isLoading = false;
          this.addMockDataToVendors();
          this.loadKPIs();
        },
        error: (err) => {
          console.error('Error loading vendors', err);
          this.vendors = [];
          this.isLoading = false;
          this.showError = true;
          this.errorMessage = this.translate.instant('VENDORS.LOAD_ERROR');
        }
      });
  }

  loadKPIs() {
    setTimeout(() => {
      const pendingCount = this.vendors.filter(v => v.status === 'Pending').length;
      const missingDocsCount = this.vendors.filter(v => (v.documentsCompleteness || 0) < 100).length;
      const highRiskCount = this.vendors.filter(v => v.riskLevel === 'High' || v.riskLevel === 'Critical').length;
      const payoutBlockedCount = this.vendors.filter(v => v.payoutStatus === 'Blocked').length;
      const suspendedCount = this.vendors.filter(v => v.status === 'Suspended').length;

      this.kpis = {
        pendingApproval: pendingCount || 12,
        missingDocuments: missingDocsCount || 8,
        highRisk: highRiskCount || 3,
        payoutBlocked: payoutBlockedCount || 2,
        suspended: suspendedCount || 5
      };

      this.updateKPICards();
    }, 200);
  }

  updateKPICards() {
    this.kpiCards = [
      {
        id: 'pending',
        title: 'VENDORS.KPI.PENDING_APPROVAL',
        value: this.kpis.pendingApproval,
        icon: '<span class="material-symbols-outlined text-[20px]">pending_actions</span>',
        color: '#f59e0b',
        clickable: true
      },
      {
        id: 'missing-docs',
        title: 'VENDORS.KPI.MISSING_DOCS',
        value: this.kpis.missingDocuments,
        icon: '<span class="material-symbols-outlined text-[20px]">description</span>',
        color: '#3b82f6',
        clickable: true
      },
      {
        id: 'high-risk',
        title: 'VENDORS.KPI.HIGH_RISK',
        value: this.kpis.highRisk,
        icon: '<span class="material-symbols-outlined text-[20px]">warning</span>',
        color: '#ef4444',
        trend: { value: 1, isPositive: false, label: '+1 ' + this.translate.instant('VENDORS.KPI.THIS_WEEK') },
        clickable: true
      },
      {
        id: 'payout-blocked',
        title: 'VENDORS.KPI.PAYOUT_BLOCKED',
        value: this.kpis.payoutBlocked,
        icon: '<span class="material-symbols-outlined text-[20px]">block</span>',
        color: '#8b5cf6',
        trend: { value: 0, isPositive: true, label: '- ' + this.translate.instant('VENDORS.KPI.THIS_WEEK') },
        clickable: true
      },
      {
        id: 'suspended',
        title: 'VENDORS.KPI.SUSPENDED',
        value: this.kpis.suspended,
        icon: '<span class="material-symbols-outlined text-[20px]">pause_circle</span>',
        color: '#64748b',
        clickable: true
      },
      {
        id: 'total',
        title: 'VENDORS.KPI.TOTAL_VENDORS',
        value: this.totalCount.toLocaleString(),
        icon: '<span class="material-symbols-outlined text-[20px]">group</span>',
        color: '#10b981',
        clickable: false
      }
    ];
  }

  // Filter handlers
  onSearch() {
    this.pageNumber = 1;
    this.loadVendors();
  }

  onFilterChange() {
    this.pageNumber = 1;
    this.loadVendors();
  }

  onFiltersChange(newFilters: VendorFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.onFilterChange();
  }

  onFilterReset() {
    this.filters = {};
    this.searchTerm = '';
    this.loadVendors();
  }

  onFilterSave(filters: VendorFilters) {
    this.saveFilterPreset();
  }

  toggleFilters() {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  resetFilters() {
    this.filters = {};
    this.searchTerm = '';
    this.loadVendors();
  }

  saveFilterPreset() {
    // Filter saved
  }

  // Label Helpers
  getStatusLabel(status?: string): string {
    if (!status) return 'VENDORS.FILTER_ALL';
    const map: any = {
      'Active': 'VENDORS.STATUS.ACTIVE', 'Inactive': 'COMMON.INACTIVE', 'Suspended': 'VENDORS.STATUS.SUSPENDED',
      'Pending': 'VENDORS.STATUS.PENDING', 'Blocked': 'VENDORS.KPI.PAYOUT_BLOCKED', 'Rejected': 'VENDORS.STATUS.REJECTED'
    };
    return map[status] || status;
  }

  getRiskLevelLabel(level?: string): string {
    if (!level) return 'VENDORS.FILTER_ALL';
    const map: any = { 'Low': 'VENDORS.RISK_LEVEL.LOW', 'Medium': 'VENDORS.RISK_LEVEL.MEDIUM', 'High': 'VENDORS.RISK_LEVEL.HIGH', 'Critical': 'VENDORS.RISK_LEVEL.CRITICAL' };
    return map[level] || level;
  }

  getRiskLevelColor(level?: string): string {
    if (!level) return 'text-slate-400';
    const map: any = { 'Low': 'text-emerald-500', 'Medium': 'text-amber-500', 'High': 'text-orange-500', 'Critical': 'text-red-500' };
    return map[level] || 'text-slate-400';
  }

  getDocumentsStatusLabel(status?: string): string {
    if (!status) return 'VENDORS.FILTER_ALL';
    const map: any = { 'Complete': 'COMPLIANCE.COMPLETED', 'Missing': 'COMPLIANCE.STATUS.MISSING', 'Expired': 'VENDORS.PREVIEW.EXPIRY_DATE', 'Pending': 'VENDORS.STATUS.PENDING', 'Incomplete': 'VENDORS.PREVIEW.LOW_QUALITY' };
    return map[status] || status;
  }

  getPayoutStatusLabel(status?: string): string {
    if (!status) return '-';
    const map: any = { 'Active': 'VENDORS.STATUS.ACTIVE', 'Blocked': 'VENDORS.KPI.PAYOUT_BLOCKED', 'Pending': 'VENDORS.STATUS.PENDING' };
    return map[status] || status;
  }

  getVerificationStatusLabel(status?: string): string {
    if (!status) return '-';
    const map: any = { 'Verified': 'VENDOR_DETAIL.STATUS_VERIFIED', 'Unverified': 'VENDOR_DETAIL.UNDER_REVIEW', 'Pending': 'VENDORS.STATUS.PENDING' };
    return map[status] || status;
  }

  getOnboardingStageLabel(stage?: string): string {
    if (!stage) return '-';
    const map: any = { 'New': 'VENDOR_FINANCE.GENERAL_STATUS.NEW', 'DocumentsPending': 'VENDORS.KPI.MISSING_DOCS', 'UnderReview': 'VENDORS.STATUS.PENDING', 'Approved': 'VENDOR_DETAIL.STATUS_VERIFIED' };
    return map[stage] || stage;
  }

  get selectedVendorIdsArray(): string[] { return Array.from(this.selectedVendorIds); }

  getCommissionLabel(vendor: Vendor): string {
    return vendor.commissionRate == null ? '-' : `${vendor.commissionRate}%`;
  }

  // Table/UI Actions
  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.loadVendors();
    }
  }

  onTableRowClick(vendor: Vendor) {
    this.openPreview(vendor);
  }

  onKPICardClick(card: KPICard) {
    switch (card.id) {
      case 'pending': this.filters.status = VendorStatus.Pending; break;
      case 'high-risk': this.filters.riskLevel = RiskLevel.High; break;
      case 'payout-blocked': this.filters.payoutStatus = PayoutStatus.Blocked; break;
      case 'suspended': this.filters.status = VendorStatus.Suspended; break;
    }
    this.onFilterChange();
  }

  onTableAction(event: { action: TableAction, item: Vendor }) {
    switch (event.action.id) {
      case 'view': this.openPreview(event.item); break;
      case 'approve': this.quickApprove(event.item, new Event('click')); break;
      case 'suspend': this.quickSuspend(event.item, new Event('click')); break;
    }
  }

  onBulkAction(event: { action: BulkAction, items: Vendor[] }) {
    // Bulk action executed
  }

  onPreviewAction(action: PreviewAction) {
    if (!this.previewVendor) return;
    switch (action.id) {
      case 'view-details': 
        this.router.navigate(['/vendors', this.previewVendor.id]); 
        break;
      case 'approve': this.quickApprove(this.previewVendor, new Event('click')); break;
    }
  }

  quickApprove(vendor: Vendor, event: Event) {
    event.stopPropagation();
    // Vendor approved
  }

  quickSuspend(vendor: Vendor, event: Event) {
    event.stopPropagation();
    // Vendor suspended
  }

  // Drawer
  openPreview(vendor: Vendor) {
    this.previewVendor = vendor;
    this.showPreviewDrawer = true;
  }

  closePreview() {
    this.showPreviewDrawer = false;
    setTimeout(() => this.previewVendor = null, 300);
  }

  // Getters
  get activeLang(): string { return this.translate.currentLang || 'ar'; }
  
  get isRTL(): boolean {
    return this.translate.currentLang === 'ar';
  }
  
  get headerIconSvg(): string {
     return '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>';
  }

  quickRequestDocuments(vendor: Vendor, event: Event) {
    event.stopPropagation();
    // Documents requested
  }

  updateBulkActionsVisibility() {
    this.showBulkActions = this.selectedVendorIds.size > 0;
  }

  // Mobile Handlers
  onMobileCardClick(vendor: VendorCardData): void { this.openPreview(vendor as Vendor); }

  onMobileQuickApprove(event: { vendor: VendorCardData; event: Event }): void {
    this.quickApprove(event.vendor as Vendor, event.event);
  }

  onMobileRequestDocuments(event: { vendor: VendorCardData; event: Event }): void {
    this.quickRequestDocuments(event.vendor as Vendor, event.event);
  }

  onMobileSelectionChange(event: { vendorId: string; selected: boolean }): void {
    if (event.selected) this.selectedVendorIds.add(event.vendorId);
    else this.selectedVendorIds.delete(event.vendorId);
    this.updateBulkActionsVisibility();
  }

  get vendorCardsData(): VendorCardData[] {
    return this.vendors.map(v => ({
      ...v,
      id: v.id,
      status: v.status as any,
      riskLevel: v.riskLevel as any,
      alerts: this.getAlertsList(v)
    }));
  }

  getAlertsList(vendor: Vendor): string[] {
    const alerts: string[] = [];
    if (vendor.riskLevel === 'High' || vendor.riskLevel === 'Critical') alerts.push(this.translate.instant('VENDORS.KPI.HIGH_RISK'));
    if (vendor.documentsCompleteness && vendor.documentsCompleteness < 100) alerts.push(this.translate.instant('VENDORS.KPI.MISSING_DOCS'));
    return alerts;
  }

  // Mock data generator
  addMockDataToVendors() {
    this.vendors = this.vendors.map((v, i) => ({
      ...v,
      city: this.translate.instant(this.cityOptions[i % this.cityOptions.length]),
      documentsCompleteness: Math.floor(Math.random() * 100),
      riskLevel: (['Low', 'Medium', 'High', 'Critical'])[i % 4] as any,
      payoutStatus: (['Active', 'Blocked', 'Pending'])[i % 3] as any
    }));
  }
}
