import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VendorService } from '@vendors/services/vendor.api.service';
import { 
  Vendor, 
  VendorDetail,
  VendorStatus, 
  VendorKPIs, 
  VendorFilters,
  OnboardingStage,
  VerificationStatus,
  DocumentsStatus,
  RiskLevel,
  PayoutStatus
} from '@vendors/models/vendors.domain.models';
import { AppButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { AppInputComponent } from '../../../../../shared/components/ui/form-controls/input/input.component';
import { AppPaginationComponent } from '../../../../../shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '../../../../../shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';

// Import new components
import { AdvancedFilterPanelComponent, FilterField } from '../../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { KpiCardsComponent, KPICard } from '../../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { DataTableComponent, TableColumn, TableAction, BulkAction } from '../../../../../shared/components/ui/data-table/data-table.component';
import { QuickPreviewDrawerComponent, PreviewAction } from '../../../../../shared/components/ui/quick-preview-drawer/quick-preview-drawer.component';
import { MobileVendorCardsComponent, VendorCardData } from '@vendors/components/cards/mobile-vendor-cards/mobile-vendor-cards.component';

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
    MobileVendorCardsComponent,
    AppPageHeaderComponent,
    StatusPillComponent
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
    { id: 'approve', label: 'VENDORS.ACTIONS.APPROVE', icon: 'check_circle', condition: (item) => this.canShowApproveAction(item as unknown as Vendor) },
    { id: 'suspend', label: 'VENDORS.ACTIONS.SUSPEND', icon: 'block', condition: (item) => item['status'] === 'Active' }
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
  previewVendorDetail: VendorDetail | null = null;
  previewLoading = false;
  previewError = '';
  showPreviewDrawer = false;

  constructor(
    private vendorService: VendorService,
    public translate: TranslateService,
    private router: Router
  ) {
    this.translate.onLangChange.subscribe(() => {
      this.initializeFilterOptions();
      this.updateKPICards();
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

    this.vendorService.getVendors(this.pageNumber, this.pageSize, this.searchTerm, this.filters.status)
      .subscribe({
        next: (response) => {
          this.vendors = (response.items ?? []).map(vendor => ({ ...vendor }));
          this.totalCount = response.totalCount ?? 0;
          this.totalPages = response.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
          this.pageNumber = response.pageNumber ?? this.pageNumber;
          this.hasPreviousPage = response.hasPreviousPage ?? this.pageNumber > 1;
          this.hasNextPage = response.hasNextPage ?? this.pageNumber < this.totalPages;
          this.isLoading = false;
          this.loadKPIs();
          this.refreshPreviewVendor();
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
    this.vendorService.getVendorKPIs().subscribe((kpis) => {
      this.kpis = kpis;
      this.updateKPICards();
    });
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

  getVendorStatusVariant(status?: string): StatusPillVariant {
    const variants: Record<string, StatusPillVariant> = {
      Active: 'success',
      Pending: 'warning',
      PendingReview: 'warning',
      Suspended: 'danger',
      Rejected: 'danger',
      Inactive: 'paused',
      Blocked: 'high-risk'
    };

    return variants[status || ''] ?? 'neutral';
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
    const map: any = { 'Verified': 'VENDOR_DETAIL.STATUS_VERIFIED', 'Unverified': 'VENDOR_REVIEW.STATUS.UNVERIFIED', 'Pending': 'VENDORS.STATUS.PENDING' };
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
    switch (event.action.id) {
      case 'approve':
        event.items.forEach((vendor) => this.quickApprove(vendor, new Event('click')));
        break;
      case 'documents':
        event.items.forEach((vendor) => this.handleVendorMutation(this.vendorService.requestVendorDocuments(vendor.id)));
        break;
      case 'block':
        event.items
          .filter((vendor) => vendor.status === VendorStatus.Active)
          .forEach((vendor) => this.handleVendorMutation(this.vendorService.suspendVendorAccount(vendor.id)));
        break;
    }
  }

  onPreviewAction(action: PreviewAction) {
    if (!this.previewVendor) return;
    switch (action.id) {
      case 'view-details': 
        this.router.navigate(['/vendors', this.previewVendor.id]); 
        break;
      case 'approve': this.quickApprove(this.previewVendor, new Event('click')); break;
      case 'documents': this.quickRequestDocuments(this.previewVendor, new Event('click')); break;
    }
  }

  quickApprove(vendor: Vendor, event: Event) {
    event.stopPropagation();
    if (!this.canShowApproveAction(vendor)) {
      this.showApprovalBlockedMessage();
      return;
    }

    this.handleVendorMutation(
      this.vendorService.getVendorById(vendor.id).pipe(
        switchMap((detail) => this.canApproveVendorFromDetail(detail)
          ? this.vendorService.approveVendorReview(vendor.id, vendor.commissionRate ?? 13)
          : this.blockApproveAttempt())
      )
    );
  }

  quickSuspend(vendor: Vendor, event: Event) {
    event.stopPropagation();
    if (vendor.status !== VendorStatus.Active) {
      return;
    }

    this.handleVendorMutation(this.vendorService.suspendVendorAccount(vendor.id));
  }

  // Drawer
  openPreview(vendor: Vendor) {
    this.previewVendor = { ...vendor };
    this.previewVendorDetail = null;
    this.previewError = '';
    this.previewLoading = true;
    this.showPreviewDrawer = true;
    this.loadPreviewDetail(vendor.id);
  }

  closePreview() {
    this.showPreviewDrawer = false;
    this.previewLoading = false;
    setTimeout(() => {
      this.previewVendor = null;
      this.previewVendorDetail = null;
      this.previewError = '';
    }, 300);
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
    this.handleVendorMutation(this.vendorService.requestVendorDocuments(vendor.id));
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
    this.vendors = this.vendors.map((vendor) => ({ ...vendor }));
  }

  private handleVendorMutation(request$: Observable<unknown>) {
    request$.subscribe({
      next: () => {
        this.showError = false;
        this.errorMessage = '';
        this.loadVendors();
        if (this.showPreviewDrawer && this.previewVendor?.id) {
          this.loadPreviewDetail(this.previewVendor.id);
        }
      },
      error: (error) => {
        console.error('Vendor action failed', error);
        this.showError = true;
        this.errorMessage = error?.error?.message || this.translate.instant('VENDORS.LOAD_ERROR');
      }
    });
  }

  private canShowApproveAction(vendor: Vendor): boolean {
    return vendor.status === 'Pending'
      && !vendor.isLoginLocked
      && !vendor.archivedAtUtc
      && !vendor.suspendedAtUtc;
  }

  private canApproveVendorFromDetail(vendor: VendorDetail): boolean {
    return vendor.status === VendorStatus.Pending
      && !!vendor.readyForFinalApproval
      && !vendor.approvedAtUtc
      && !vendor.isLoginLocked
      && !vendor.archivedAtUtc;
  }

  private blockApproveAttempt(): Observable<never> {
    this.showApprovalBlockedMessage();
    return of(null).pipe(
      switchMap(() => {
        throw new Error(this.errorMessage);
      })
    );
  }

  private showApprovalBlockedMessage(): void {
    this.showError = true;
    this.errorMessage = this.translate.currentLang === 'ar'
      ? 'لا يمكن اعتماد التاجر الآن. أكمل مراجعة المستندات المطلوبة أولًا أو افتح تبويب الامتثال.'
      : 'This vendor cannot be approved yet. Complete the required compliance review first or open the compliance tab.';
  }

  private refreshPreviewVendor(vendorId: string | null = this.previewVendor?.id ?? null): void {
    if (!vendorId) {
      return;
    }

    const updatedVendor = this.vendors.find((vendor) => vendor.id === vendorId);
    if (updatedVendor) {
      this.previewVendor = { ...updatedVendor };
    }
  }

  get previewTitle(): string {
    return this.getDisplayVendorName(this.previewVendorDetail ?? this.previewVendor);
  }

  get previewSubtitle(): string {
    return this.previewVendorDetail?.contactEmail
      || this.previewVendorDetail?.ownerEmail
      || this.previewVendor?.contactEmail
      || '';
  }

  get previewCompletion(): number {
    return this.previewVendorDetail?.documentsCompleteness
      ?? this.previewVendor?.documentsCompleteness
      ?? 0;
  }

  get previewOperationalScore(): number {
    const vendor = this.previewVendorDetail;
    if (!vendor) {
      return this.previewCompletion;
    }

    let score = vendor.documentsCompleteness ?? 0;

    if (vendor.primaryBankAccount?.status?.toLowerCase() === 'verified') {
      score += 10;
    }

    if (vendor.operationsSettings?.acceptOrders) {
      score += 5;
    }

    if (vendor.isLoginLocked) {
      score -= 20;
    }

    switch (vendor.riskLevel) {
      case 'Critical':
        score -= 35;
        break;
      case 'High':
        score -= 20;
        break;
      case 'Medium':
        score -= 10;
        break;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  get previewBlockingDocuments() {
    return (this.previewVendorDetail?.reviewDocuments ?? []).filter((document) => document.status !== 'completed');
  }

  get previewLatestNote() {
    return this.previewVendorDetail?.reviewNotes?.[0] ?? null;
  }

  get previewReviewerName(): string {
    const vendor = this.previewVendorDetail;
    if (!vendor) {
      return '---';
    }

    return vendor.approvedBy
      || vendor.reviewNotes.find((note) => !!note.authorName?.trim())?.authorName
      || vendor.assignedReviewer
      || '---';
  }

  get previewWorkingHours(): string {
    const hours = this.previewVendorDetail?.operatingHours ?? [];
    const openDays = hours.filter((hour) => hour.isOpen);
    if (openDays.length === 0) {
      return '---';
    }

    const first = openDays[0];
    return `${openDays.length}/7 • ${first.openTime}-${first.closeTime}`;
  }

  get previewBankStatusLabel(): string {
    const status = this.previewVendorDetail?.primaryBankAccount?.status;
    if (!status) {
      return '---';
    }

    const normalized = status.toLowerCase();
    const map: Record<string, string> = {
      verified: 'VENDOR_DETAIL.STATUS_VERIFIED',
      pendingverification: 'VENDORS.STATUS.PENDING',
      rejected: 'VENDORS.STATUS.REJECTED'
    };

    const key = map[normalized];
    return key ? this.translate.instant(key) : status;
  }

  get previewAcceptOrdersLabel(): string {
    const acceptOrders = this.previewVendorDetail?.operationsSettings?.acceptOrders;
    if (acceptOrders == null) {
      return '---';
    }

    return this.translate.instant(acceptOrders ? 'COMMON.ACTIVE' : 'COMMON.INACTIVE');
  }

  get previewWorkingHoursSummary(): string {
    const hours = this.previewVendorDetail?.operatingHours ?? [];
    const openDays = hours.filter((hour) => hour.isOpen);
    if (openDays.length === 0) {
      return '---';
    }

    const first = openDays[0];
    return `${openDays.length}/7 - ${first.openTime}-${first.closeTime}`;
  }

  get previewLatestNoteMessage(): string {
    const note = this.previewLatestNote;
    if (!note) {
      return '';
    }

    if (note.message?.trim()) {
      return note.message;
    }

    if (note.messageKey) {
      const translated = this.translate.instant(note.messageKey);
      return translated === note.messageKey ? '' : translated;
    }

    return '';
  }

  formatPreviewDate(value?: string | null): string {
    if (!value) {
      return '---';
    }

    return new Intl.DateTimeFormat(this.activeLang === 'ar' ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }

  formatPreviewDateTime(value?: string | null): string {
    if (!value) {
      return '---';
    }

    return new Intl.DateTimeFormat(this.activeLang === 'ar' ? 'ar-EG' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  private loadPreviewDetail(vendorId: string): void {
    this.previewLoading = true;
    this.previewError = '';

    this.vendorService.getVendorById(vendorId).subscribe({
      next: (vendorDetail) => {
        if (this.previewVendor?.id !== vendorId) {
          return;
        }

        this.previewVendorDetail = vendorDetail;
        this.previewLoading = false;
      },
      error: (error) => {
        console.error('Error loading preview vendor detail', error);
        if (this.previewVendor?.id !== vendorId) {
          return;
        }

        this.previewVendorDetail = null;
        this.previewLoading = false;
        this.previewError = this.translate.instant('VENDORS.LOAD_ERROR');
      }
    });
  }

  private getDisplayVendorName(vendor: Vendor | VendorDetail | null): string {
    if (!vendor) {
      return '';
    }

    const preferred = this.activeLang === 'ar' ? vendor.businessNameAr : vendor.businessNameEn;
    const alternate = this.activeLang === 'ar' ? vendor.businessNameEn : vendor.businessNameAr;
    return preferred || alternate || vendor.ownerName || vendor.contactEmail || '';
  }
}


