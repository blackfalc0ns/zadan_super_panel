import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, forkJoin, of } from 'rxjs';
import { AccessService } from '../../../../../core/services/access.service';
import { AdminSupportCaseRealtimeService } from '../../../../../core/services/admin-support-case-realtime.service';
import { DisputesService } from '@disputes/services/disputes.api.service';
import { BulkAction, DataTableComponent, TableAction, TableColumn } from '../../../../../shared/components/ui/data-table/data-table.component';
import { KPICard, KpiCardsComponent } from '../../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPaginationComponent } from '../../../../../shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '../../../../../shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import { AdvancedFilterPanelComponent, FilterField } from '../../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { ToastService } from '../../../../../shared/services/toast.service';
import { DisputeApprovalModalComponent } from '../../../components/dispute-approval-modal/dispute-approval-modal.component';
import { DisputeEscalationModalComponent } from '../../../components/dispute-escalation-modal/dispute-escalation-modal.component';
import { DisputeQuickActionModalComponent } from '../../../components/dispute-quick-action-modal/dispute-quick-action-modal.component';
import { DisputeRejectionModalComponent } from '../../../components/dispute-rejection-modal/dispute-rejection-modal.component';
import { DisputeRequestInfoModalComponent } from '../../../components/dispute-request-info-modal/dispute-request-info-modal.component';
import { describeApiError } from '../../../../marketing/utils/marketing-date.utils';
import {
  AdminOrderCaseStats,
  createEmptyAdminOrderCaseStats,
  createEmptyQuickActionFormValue,
  createEmptyFormDrafts,
  createEmptyModalState,
  DisputeFilterId,
  DisputeFormDrafts,
  DisputeDashboardAlertCard,
  DisputeDashboardAlertTone,
  DisputeModalKey,
  DisputeModalState,
  DisputePriority,
  DisputeQuickActionFormValue,
  DisputeQuickActionModalConfig,
  DisputeQuickActionType,
  SupportCaseRow,
  SupportCaseWorkflowStatus,
  SupportCaseType,
  EscalationDecisionForm,
  RefundDecisionForm,
  RejectionDecisionForm,
  RequestInfoForm,
  RiskLevel,
  TimelineItem
} from '../../../models/disputes.models';

type DisputeServerFilters = {
  status?: string;
  priority?: string;
  queue?: string;
  type?: string;
  initiatorRole?: string;
  vendorId?: string;
  driverId?: string;
};

@Component({
  selector: 'app-disputes-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule,
    KpiCardsComponent,
    DataTableComponent,
    AppPaginationComponent,
    AppPageHeaderComponent,
    StatusPillComponent,
    AdvancedFilterPanelComponent,
    DisputeApprovalModalComponent,
    DisputeEscalationModalComponent,
    DisputeQuickActionModalComponent,
    DisputeRejectionModalComponent,
    DisputeRequestInfoModalComponent
  ],
  templateUrl: './disputes-dashboard.component.html',
  styleUrl: './disputes-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisputesDashboardComponent implements OnInit {
  private readonly disputeListTypesQuery = 'return_request,driver_dispute';
  private readonly cdr = inject(ChangeDetectorRef);

  disputes: SupportCaseRow[] = [];
  caseStats: AdminOrderCaseStats = createEmptyAdminOrderCaseStats();
  dashboardAlerts: DisputeDashboardAlertCard[] = [];
  totalCount = 0;
  isLoading = false;
  loadError = '';
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private focusedDisputeId: string | null = null;

  kpiCards: KPICard[] = [];
  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];
  bulkActions: BulkAction[] = [];

  page = 1;
  pageSize = 8;
  searchTerm = '';
  activeFilter: DisputeFilterId = 'all';
  typeFilter = 'all';
  priorityFilter = 'all';
  queueFilter = 'all';
  initiatorRoleFilter: string = 'all';
  vendorIdFilter = '';
  driverIdFilter = '';
  isFiltersExpanded = false;
  panelFilters: Record<string, string | null | undefined> = {};
  filterFields: FilterField[] = [
    { key: 'type', label: 'DISPUTES_DASHBOARD.FILTER_FIELDS.TYPE', type: 'select', color: '#127c8c', options: [] },
    { key: 'priority', label: 'DISPUTES_DASHBOARD.FILTER_FIELDS.PRIORITY', type: 'select', color: '#f97316', options: [] },
    { key: 'queue', label: 'DISPUTES_DASHBOARD.FILTER_FIELDS.QUEUE', type: 'select', color: '#6366f1', options: [] },
    { key: 'initiatorRole', label: 'DISPUTES_DASHBOARD.FILTER_FIELDS.INITIATOR', type: 'select', color: '#0ea5e9', options: [] }
  ];
  selectedEvidenceImage: string | null = null;
  selectedDispute: SupportCaseRow = this.createEmptyDispute();
  modalState: DisputeModalState = createEmptyModalState();
  formDrafts: DisputeFormDrafts = createEmptyFormDrafts();
  quickActionConfig: DisputeQuickActionModalConfig | null = null;
  quickActionValue: DisputeQuickActionFormValue = createEmptyQuickActionFormValue();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly accessService: AccessService,
    private readonly disputesService: DisputesService,
    private readonly adminSupportCaseRealtime: AdminSupportCaseRealtimeService,
    public translate: TranslateService
  ) {
    this.buildUiConfig();

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.initializeFilterOptions();
        this.buildUiConfig();
      });
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.searchTerm = params.get('search')?.trim() ?? '';
        this.activeFilter = this.isValidFilter(params.get('status')) ? params.get('status') as DisputeFilterId : 'all';
        this.typeFilter = this.normalizeDisputeTypeFilter(params.get('type')?.trim() ?? 'all');
        this.priorityFilter = params.get('priority')?.trim() ?? 'all';
        this.queueFilter = params.get('queue')?.trim() ?? 'all';
        this.initiatorRoleFilter = params.get('initiatorRole')?.trim() ?? 'all';
        this.vendorIdFilter = params.get('vendorId')?.trim() ?? '';
        this.driverIdFilter = params.get('driverId')?.trim() ?? '';
        this.focusedDisputeId = params.get('focus')?.trim() ?? null;
        this.syncPanelFilters();
        this.resetToFirstPage();
        this.loadDisputes();
      });

    this.adminSupportCaseRealtime.getEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.targetUrl?.startsWith('/disputes')) {
          this.loadDisputes();
        }
      });

    this.initializeFilterOptions();
  }

  get hasActiveFilters(): boolean {
    return this.activeFilter !== 'all'
      || this.searchTerm.trim().length > 0
      || this.typeFilter !== 'all'
      || this.priorityFilter !== 'all'
      || this.queueFilter !== 'all'
      || this.initiatorRoleFilter !== 'all'
      || this.vendorIdFilter.trim().length > 0
      || this.driverIdFilter.trim().length > 0;
  }

  get totalFilteredItems(): number {
    return this.totalCount;
  }

  get canManageSelectedDispute(): boolean {
    return this.canEditDisputes || this.canApproveDisputes;
  }

  get isDetailsDrawerOpen(): boolean {
    return this.modalState.isDetailsDrawerOpen;
  }

  get isApprovalModalOpen(): boolean {
    return this.modalState.activeModal === 'approval';
  }

  get isEscalationModalOpen(): boolean {
    return this.modalState.activeModal === 'escalation';
  }

  get isRejectionModalOpen(): boolean {
    return this.modalState.activeModal === 'rejection';
  }

  get isRequestInfoModalOpen(): boolean {
    return this.modalState.activeModal === 'request_info';
  }

  get isQuickActionModalOpen(): boolean {
    return this.quickActionConfig !== null;
  }

  get canEditDisputes(): boolean {
    return this.accessService.hasPermission('disputes.edit');
  }

  get canApproveDisputes(): boolean {
    return this.accessService.hasPermission('disputes.approve');
  }

  get canCreateDisputes(): boolean {
    return this.canEditDisputes;
  }

  get typeOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'all', label: this.isRtl ? 'كل الأنواع' : 'All types' },
      { value: 'return_request', label: this.getTypeLabel('return_request') },
      { value: 'driver_dispute', label: this.getTypeLabel('driver_dispute') }
    ];
  }

  get priorityOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'all', label: this.isRtl ? 'كل الأولويات' : 'All priorities' },
      { value: 'critical', label: this.getPriorityLabel('critical') },
      { value: 'high', label: this.getPriorityLabel('high') },
      { value: 'medium', label: this.getPriorityLabel('medium') },
      { value: 'low', label: this.getPriorityLabel('low') }
    ];
  }

  get queueOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'all', label: this.isRtl ? 'كل المسارات' : 'All queues' },
      { value: 'support', label: this.isRtl ? 'الدعم' : 'Support' },
      { value: 'finance', label: this.isRtl ? 'المالية' : 'Finance' },
      { value: 'operations', label: this.isRtl ? 'العمليات' : 'Operations' },
      { value: 'risk', label: this.isRtl ? 'المخاطر' : 'Risk' },
      { value: 'legal', label: this.isRtl ? 'القانوني' : 'Legal' },
      { value: 'driverops', label: this.isRtl ? 'عمليات المندوبين' : 'Driver Ops' }
    ];
  }

  get initiatorRoleOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'all', label: this.isRtl ? 'كل المصادر' : 'All initiators' },
      { value: 'customer', label: this.getInitiatorRoleLabel('customer') },
      { value: 'vendor', label: this.getInitiatorRoleLabel('vendor') },
      { value: 'driver', label: this.getInitiatorRoleLabel('driver') },
      { value: 'admin', label: this.getInitiatorRoleLabel('admin') }
    ];
  }

  get paginatedDisputes(): SupportCaseRow[] {
    return this.disputes;
  }

  get currentStartItem(): number {
    return this.totalFilteredItems === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get currentEndItem(): number {
    return Math.min(this.page * this.pageSize, this.totalFilteredItems);
  }

  openEvidenceImage(url?: string): void {
    this.selectedEvidenceImage = url?.trim() || null;
  }

  closeEvidenceImage(): void {
    this.selectedEvidenceImage = null;
  }

  openEvidenceUrl(url?: string): void {
    if (!url?.trim()) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  get activeFilterLabel(): string {
    return {
      all: this.t('DISPUTES_DASHBOARD.FILTERS.ALL'),
      active: this.t('DISPUTES_DASHBOARD.FILTERS.ACTIVE'),
      critical: this.t('DISPUTES_DASHBOARD.FILTERS.CRITICAL'),
      review: this.t('DISPUTES_DASHBOARD.FILTERS.REVIEW'),
      merchant: this.t('DISPUTES_DASHBOARD.FILTERS.MERCHANT'),
      resolved: this.t('DISPUTES_DASHBOARD.FILTERS.RESOLVED'),
      submitted: this.t('DISPUTES_DASHBOARD.STATUS.OPEN'),
      in_review: this.t('DISPUTES_DASHBOARD.STATUS.REVIEW'),
      awaiting_customer_evidence: this.t('DISPUTES_DASHBOARD.STATUS.AWAITING_CUSTOMER'),
      approved: this.t('DISPUTES_DASHBOARD.STATUS.APPROVED'),
      rejected: this.t('DISPUTES_DASHBOARD.STATUS.REJECTED'),
      driver: 'Driver Cases',
      customer: 'Customer Cases',
      vendor: 'Vendor Cases'
    }[this.activeFilter] || this.activeFilter;
  }

  get isRtl(): boolean {
    return this.translate.currentLang === 'ar';
  }

  selectDispute(dispute: SupportCaseRow): void {
    this.selectedDispute = dispute;
    this.modalState.isDetailsDrawerOpen = true;
  }

  onTableRowClick(dispute: SupportCaseRow): void {
    this.selectDispute(dispute);
  }

  onTableAction(event: { action: TableAction; item: SupportCaseRow }): void {
    if (event.action.id === 'view') {
      this.selectDispute(event.item);
    }
  }

  onBulkAction(event: { action: BulkAction; items: SupportCaseRow[] }): void {
    if (event.items.length > 0) {
      this.selectDispute(event.items[0]);

      if (event.action.id === 'assign') {
        this.assignCase();
        return;
      }

      if (event.action.id === 'note') {
        this.addNote();
        return;
      }

      if (event.action.id === 'escalate') {
        this.openEscalationModal();
      }
    }
  }

  onKpiCardClick(card: KPICard): void {
    switch (card.id) {
      case 'active':
      case 'critical':
      case 'review':
      case 'merchant':
      case 'in_review':
      case 'awaiting_customer_evidence':
      case 'resolved':
        this.activeFilter = card.id as DisputeFilterId;
        break;
      default:
        this.activeFilter = 'all';
        break;
    }

    this.resetToFirstPage();
  }

  onSearchChange(): void {
    this.resetToFirstPage();
    this.loadDisputes();
  }

  onAdvancedFiltersChange(): void {
    this.syncPanelFilters();
    this.resetToFirstPage();
    this.loadDisputes();
  }

  toggleFiltersPanel(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  onPanelFiltersChange(filters: Record<string, unknown>): void {
    this.typeFilter = this.normalizeDisputeTypeFilter(this.toNullableFilterValue(filters['type']) ?? 'all');
    this.priorityFilter = this.toNullableFilterValue(filters['priority']) ?? 'all';
    this.queueFilter = this.toNullableFilterValue(filters['queue']) ?? 'all';
    this.initiatorRoleFilter = this.toNullableFilterValue(filters['initiatorRole']) ?? 'all';
    this.syncPanelFilters();
    this.resetToFirstPage();
    this.loadDisputes();
  }

  toggleActiveCases(): void {
    this.activeFilter = this.activeFilter === 'active' ? 'all' : 'active';
    this.resetToFirstPage();
    this.loadDisputes();
  }

  toggleCriticalFilter(): void {
    this.activeFilter = this.activeFilter === 'critical' ? 'all' : 'critical';
    this.resetToFirstPage();
    this.loadDisputes();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.activeFilter = 'all';
    this.typeFilter = 'all';
    this.priorityFilter = 'all';
    this.queueFilter = 'all';
    this.initiatorRoleFilter = 'all';
    this.vendorIdFilter = '';
    this.driverIdFilter = '';
    this.syncPanelFilters();
    this.resetToFirstPage();
    this.loadDisputes();
  }

  changePage(newPage: number): void {
    const totalPages = Math.max(1, Math.ceil(this.totalFilteredItems / this.pageSize));

    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    this.page = newPage;
    this.loadDisputes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeDetailsDrawer(): void {
    this.modalState.isDetailsDrawerOpen = false;
  }

  openApprovalModal(): void {
    if (!this.canApproveReturnSelectedDispute) {
      return;
    }

    this.openModal('approval');
  }

  closeApprovalModal(): void {
    this.closeModal('approval');
  }

  saveApprovalDraft(form: RefundDecisionForm): void {
    this.formDrafts.approval = { ...form };
    this.closeApprovalModal();
  }

  submitApproval(form: RefundDecisionForm): void {
    this.disputesService.approveReturnRequest(this.selectedDispute.id, form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.formDrafts.approval = null;
          this.closeApprovalModal();
          this.handleMutationSuccess(dispute, this.isRtl ? 'تم اعتماد الاسترجاع بنجاح.' : 'Return request approved successfully.');
        },
        error: (error) => this.handleMutationError(error, 'Failed to approve support case.')
      });
  }

  openEscalationModal(): void {
    if (!this.canEscalateSelectedDispute) {
      return;
    }

    this.openModal('escalation');
  }

  closeEscalationModal(): void {
    this.closeModal('escalation');
  }

  saveEscalationDraft(form: EscalationDecisionForm): void {
    this.formDrafts.escalation = { ...form };
    this.closeEscalationModal();
  }

  submitEscalation(form: EscalationDecisionForm): void {
    this.disputesService.escalateCase(this.selectedDispute.id, form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.formDrafts.escalation = null;
          this.closeEscalationModal();
          this.handleMutationSuccess(dispute, this.isRtl ? 'تم تصعيد النزاع بنجاح.' : 'Support case escalated successfully.');
        },
        error: (error) => this.handleMutationError(error, 'Failed to escalate support case.')
      });
  }

  openRejectionModal(): void {
    if (!this.canRejectSelectedDispute) {
      return;
    }

    this.openModal('rejection');
  }

  closeRejectionModal(): void {
    this.closeModal('rejection');
  }

  saveRejectionDraft(form: RejectionDecisionForm): void {
    this.formDrafts.rejection = { ...form };
    this.closeRejectionModal();
  }

  submitRejection(form: RejectionDecisionForm): void {
    this.disputesService.rejectCase(this.selectedDispute.id, form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.formDrafts.rejection = null;
          this.closeRejectionModal();
          this.handleMutationSuccess(dispute, this.isRtl ? 'تم رفض الحالة بنجاح.' : 'Support case rejected successfully.');
        },
        error: (error) => this.handleMutationError(error, 'Failed to reject support case.')
      });
  }

  openRequestInfoModal(): void {
    if (!this.canRequestEvidenceForSelectedDispute) {
      return;
    }

    this.openModal('request_info');
  }

  closeRequestInfoModal(): void {
    this.closeModal('request_info');
  }

  saveRequestInfoDraft(form: RequestInfoForm): void {
    this.formDrafts.requestInfo = { ...form };
    this.closeRequestInfoModal();
  }

  submitRequestInfo(form: RequestInfoForm): void {
    this.disputesService.requestEvidence(this.selectedDispute.id, form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.formDrafts.requestInfo = null;
          this.closeRequestInfoModal();
          this.handleMutationSuccess(dispute, this.isRtl ? 'تم إرسال طلب المعلومات الإضافية بنجاح.' : 'Additional information request sent successfully.');
        },
        error: (error) => this.handleMutationError(error, 'Failed to request additional evidence.')
      });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedEvidenceImage) {
      this.closeEvidenceImage();
      return;
    }

    if (this.isQuickActionModalOpen) {
      this.closeQuickActionModal();
      return;
    }

    if (this.isEscalationModalOpen) {
      this.closeEscalationModal();
      return;
    }

    if (this.isRequestInfoModalOpen) {
      this.closeRequestInfoModal();
      return;
    }

    if (this.isRejectionModalOpen) {
      this.closeRejectionModal();
      return;
    }

    if (this.isApprovalModalOpen) {
      this.closeApprovalModal();
      return;
    }

    if (this.isDetailsDrawerOpen) {
      this.closeDetailsDrawer();
    }
  }

  getStatusLabel(status: SupportCaseWorkflowStatus): string {
    return {
      submitted: this.t('DISPUTES_DASHBOARD.STATUS.OPEN'),
      in_review: this.t('DISPUTES_DASHBOARD.STATUS.REVIEW'),
      awaiting_customer_evidence: this.t('DISPUTES_DASHBOARD.STATUS.AWAITING_CUSTOMER'),
      approved: this.t('DISPUTES_DASHBOARD.STATUS.APPROVED'),
      rejected: this.t('DISPUTES_DASHBOARD.STATUS.REJECTED'),
      resolved: this.t('DISPUTES_DASHBOARD.STATUS.RESOLVED')
    }[status] || status;
  }

  getDisputeStatusLabel(dispute: Pick<SupportCaseRow, 'caseStatus' | 'caseStatusLabel'>): string {
    return dispute.caseStatusLabel?.trim() || this.getStatusLabel(dispute.caseStatus);
  }

  getStatusClass(status: SupportCaseWorkflowStatus): string {
    return {
      submitted: 'text-sky-600',
      in_review: 'text-amber-500',
      awaiting_customer_evidence: 'text-orange-500',
      approved: 'text-emerald-600',
      rejected: 'text-red-500',
      resolved: 'text-emerald-500'
    }[status] || 'text-slate-500';
  }

  getStatusVariant(status: SupportCaseWorkflowStatus): StatusPillVariant {
    const variants: Record<SupportCaseWorkflowStatus, StatusPillVariant> = {
      submitted: 'info',
      in_review: 'warning',
      awaiting_customer_evidence: 'processing',
      approved: 'success',
      rejected: 'danger',
      resolved: 'success'
    };

    return variants[status] || 'info';
  }

  getPriorityClass(priority: DisputePriority): string {
    return {
      critical: 'text-red-600 bg-red-50 border-red-100',
      high: 'text-orange-600 bg-orange-50 border-orange-100',
      medium: 'text-blue-600 bg-blue-50 border-blue-100',
      low: 'text-slate-500 bg-slate-100 border-slate-200'
    }[priority];
  }

  getPriorityLabel(priority: DisputePriority): string {
    return {
      critical: this.t('DISPUTES_DASHBOARD.PRIORITY.CRITICAL'),
      high: this.t('DISPUTES_DASHBOARD.PRIORITY.HIGH'),
      medium: this.t('DISPUTES_DASHBOARD.PRIORITY.MEDIUM'),
      low: this.t('DISPUTES_DASHBOARD.PRIORITY.LOW')
    }[priority];
  }

  getDisputePriorityLabel(dispute: Pick<SupportCaseRow, 'priority' | 'priorityLabel'>): string {
    return dispute.priorityLabel?.trim() || this.getPriorityLabel(dispute.priority);
  }

  getPriorityFilterLabel(priority: string): string {
    switch (priority) {
      case 'critical':
      case 'high':
      case 'medium':
      case 'low':
        return this.getPriorityLabel(priority as DisputePriority);
      default:
        return priority;
    }
  }

  getRiskClass(risk: RiskLevel): string {
    return {
      high: 'text-red-500 bg-red-50',
      medium: 'text-amber-600 bg-amber-50',
      low: 'text-emerald-600 bg-emerald-50'
    }[risk];
  }

  getRiskLabel(risk: RiskLevel): string {
    return {
      high: this.t('DISPUTES_DASHBOARD.RISK.HIGH'),
      medium: this.t('DISPUTES_DASHBOARD.RISK.MEDIUM'),
      low: this.t('DISPUTES_DASHBOARD.RISK.LOW')
    }[risk];
  }

  getTimelineDotClass(tone: TimelineItem['tone']): string {
    return {
      primary: 'bg-zadna-primary',
      warning: 'bg-amber-500',
      muted: 'bg-slate-300'
    }[tone];
  }

  getTimelineTextClass(tone: TimelineItem['tone']): string {
    return tone === 'warning' ? 'text-amber-700' : 'text-slate-800';
  }

  getTypeLabel(type: SupportCaseType | string): string {
    const key = (() => {
      switch ((type || '').toLowerCase()) {
        case 'return_request':
          return 'DISPUTES_DASHBOARD.TYPE.RETURN_REQUEST';
        case 'driver_report':
          return 'DISPUTES_DASHBOARD.TYPE.DRIVER_REPORT';
        case 'driver_dispute':
          return 'DISPUTES_DASHBOARD.TYPE.DRIVER_DISPUTE';
        case 'driver_account':
        case 'driveraccountappeal':
          return 'DISPUTES_DASHBOARD.TYPE.DRIVER_ACCOUNT';
        default:
          return 'DISPUTES_DASHBOARD.TYPE.COMPLAINT';
      }
    })();

    if (!key.startsWith('DISPUTES_DASHBOARD.')) {
      return key;
    }

    return this.t(key);
  }

  getDisputeTypeLabel(dispute: Pick<SupportCaseRow, 'type' | 'typeLabel'>): string {
    return dispute.typeLabel?.trim() || this.getTypeLabel(dispute.type);
  }

  getDisputeListPrimaryLabel(dispute: SupportCaseRow): string {
    const orderReference = dispute.orderDisplayId?.trim();
    if (orderReference) {
      return orderReference;
    }

    return this.getDisputeTypeLabel(dispute);
  }

  getDisputeListSecondaryLabel(dispute: SupportCaseRow): string {
    const orderReference = dispute.orderDisplayId?.trim();
    if (orderReference) {
      return dispute.createdAt;
    }

    return dispute.merchantName;
  }

  getDisputeDisplayTypeLabel(dispute: Pick<SupportCaseRow, 'type' | 'typeLabel' | 'caseStatus'>): string {
    const baseLabel = this.getDisputeTypeLabel(dispute);

    if (dispute.caseStatus !== 'resolved') {
      return baseLabel;
    }

    switch ((dispute.type || '').toLowerCase()) {
      case 'return_request':
        return this.t('DISPUTES_DASHBOARD.TYPE_CLOSED.RETURN_REQUEST');
      case 'driver_report':
        return this.t('DISPUTES_DASHBOARD.TYPE_CLOSED.DRIVER_REPORT');
      case 'driver_dispute':
        return this.t('DISPUTES_DASHBOARD.TYPE_CLOSED.DRIVER_DISPUTE');
      case 'driver_account':
      case 'driveraccountappeal':
        return this.t('DISPUTES_DASHBOARD.TYPE_CLOSED.DRIVER_ACCOUNT');
      default:
        return this.t('DISPUTES_DASHBOARD.TYPE_CLOSED.COMPLAINT');
    }
  }

  getDisputeTypeMetaLabel(
    dispute: Pick<SupportCaseRow, 'reason' | 'caseStatus' | 'settlementStatus' | 'compensationType'>
  ): string {
    const settlementStatus = (dispute.settlementStatus || '').toLowerCase();
    const compensationType = (dispute.compensationType || '').toLowerCase();

    if (settlementStatus === 'coupon_redeemed') {
      return this.t('DISPUTES_DASHBOARD.META.CLOSED_AFTER_COUPON_REDEMPTION');
    }

    if (settlementStatus === 'cash_refunded') {
      return this.t('DISPUTES_DASHBOARD.META.CLOSED_AFTER_REFUND_COMPLETION');
    }

    if (dispute.caseStatus === 'resolved') {
      if (compensationType === 'coupon_compensation') {
        return this.t('DISPUTES_DASHBOARD.META.CLOSED_AFTER_COUPON_COMPENSATION');
      }

      if (compensationType === 'cash_refund') {
        return this.t('DISPUTES_DASHBOARD.META.CLOSED_AFTER_COMPENSATION_APPROVAL');
      }

      return this.t('DISPUTES_DASHBOARD.META.CASE_CLOSED');
    }

    return dispute.reason;
  }

  getDisputeQueueLabel(dispute: Pick<SupportCaseRow, 'queue' | 'queueLabel'>): string {
    return dispute.queueLabel?.trim() || dispute.queue;
  }

  getDisputeInitiatorRoleLabel(dispute: Pick<SupportCaseRow, 'initiatorRole' | 'initiatorRoleLabel'>): string {
    return dispute.initiatorRoleLabel?.trim() || this.getInitiatorRoleLabel(dispute.initiatorRole);
  }

  getParticipantRoleLabel(participant: { role: string; roleLabel?: string | null }): string {
    return participant.roleLabel?.trim() || this.getInitiatorRoleLabel(participant.role);
  }

  getMessageMetaLabel(message: { authorRole: string; authorRoleLabel?: string | null; messageType: string; messageTypeLabel?: string | null }): string {
    const authorRole = message.authorRoleLabel?.trim() || this.getInitiatorRoleLabel(message.authorRole);
    const messageType = message.messageTypeLabel?.trim() || message.messageType;
    return `${authorRole} • ${messageType}`;
  }

  getUiLabel(
    key:
      | 'type'
      | 'priority'
      | 'queue'
      | 'initiator'
      | 'vendor'
      | 'driver'
      | 'status'
      | 'vendorResponse'
      | 'driverResponse'
      | 'compensationOutcome'
      | 'coupon'
      | 'expires'
      | 'redeemed'
      | 'notRedeemedYet'
      | 'vendorRecovery'
      | 'recovered'
      | 'outstanding'
      | 'loadingDisputes'
      | 'reopen'
  ): string {
    const labels = {
      type: 'TYPE',
      priority: 'PRIORITY',
      queue: 'QUEUE',
      initiator: 'INITIATOR',
      vendor: 'VENDOR',
      driver: 'DRIVER',
      status: 'STATUS',
      vendorResponse: 'VENDOR_RESPONSE',
      driverResponse: 'DRIVER_RESPONSE',
      compensationOutcome: 'COMPENSATION_OUTCOME',
      coupon: 'COUPON',
      expires: 'EXPIRES',
      redeemed: 'REDEEMED',
      notRedeemedYet: 'NOT_REDEEMED_YET',
      vendorRecovery: 'VENDOR_RECOVERY',
      recovered: 'RECOVERED',
      outstanding: 'OUTSTANDING',
      loadingDisputes: 'LOADING_DISPUTES',
      reopen: 'REOPEN'
    } as const;

    return this.t(`DISPUTES_DASHBOARD.UI_LABELS.${labels[key]}`);
  }

  getInitiatorRoleLabel(role: string): string {
    const key = (() => {
      switch ((role || '').toLowerCase()) {
        case 'vendor':
          return 'DISPUTES_DASHBOARD.INITIATOR.VENDOR';
        case 'driver':
          return 'DISPUTES_DASHBOARD.INITIATOR.DRIVER';
        case 'admin':
          return 'DISPUTES_DASHBOARD.INITIATOR.ADMIN';
        default:
          return 'DISPUTES_DASHBOARD.INITIATOR.CUSTOMER';
      }
    })();

    return this.t(key);
  }
  getPaymentMethodLabel(paymentMethod: string): string {
    const key = (() => {
      switch ((paymentMethod || '').toLowerCase()) {
        case 'cash':
          return 'DISPUTES_DASHBOARD.PAYMENT_METHOD.CASH';
        case 'card':
          return 'DISPUTES_DASHBOARD.PAYMENT_METHOD.CARD';
        case 'bank':
          return 'DISPUTES_DASHBOARD.PAYMENT_METHOD.BANK';
        case 'wallet':
          return 'DISPUTES_DASHBOARD.PAYMENT_METHOD.WALLET';
        case 'apple_pay':
          return 'DISPUTES_DASHBOARD.PAYMENT_METHOD.APPLE_PAY';
        case 'mada':
          return 'DISPUTES_DASHBOARD.PAYMENT_METHOD.MADA';
        default:
          return '';
      }
    })();

    return key ? this.t(key) : (paymentMethod || this.t('DISPUTES_DASHBOARD.PAYMENT_METHOD.UNKNOWN'));
  }
  getCompensationTypeLabel(compensationType?: string | null): string {
    const key = (() => {
      switch ((compensationType || '').toLowerCase()) {
        case 'cash_refund':
          return 'DISPUTES_DASHBOARD.COMPENSATION.CASH_REFUND';
        case 'coupon_compensation':
          return 'DISPUTES_DASHBOARD.COMPENSATION.COUPON_COMPENSATION';
        default:
          return '';
      }
    })();

    return key ? this.t(key) : (compensationType || this.t('DISPUTES_DASHBOARD.COMPENSATION.NOT_SET'));
  }
  getSettlementStatusLabel(settlementStatus?: string | null): string {
    const key = (() => {
      switch ((settlementStatus || '').toLowerCase()) {
        case 'pending_review':
          return 'DISPUTES_DASHBOARD.SETTLEMENT.PENDING_REVIEW';
        case 'cash_refunded':
          return 'DISPUTES_DASHBOARD.SETTLEMENT.CASH_REFUNDED';
        case 'coupon_issued':
          return 'DISPUTES_DASHBOARD.SETTLEMENT.COUPON_ISSUED';
        case 'coupon_redeemed':
          return 'DISPUTES_DASHBOARD.SETTLEMENT.COUPON_REDEEMED';
        case 'rejected':
          return 'DISPUTES_DASHBOARD.SETTLEMENT.REJECTED';
        case 'approved':
          return 'DISPUTES_DASHBOARD.SETTLEMENT.APPROVED';
        default:
          return '';
      }
    })();

    return key ? this.t(key) : (settlementStatus || this.t('DISPUTES_DASHBOARD.SETTLEMENT.NOT_SET'));
  }
  getVendorRecoveryStatusLabel(status?: string | null): string {
    const key = (() => {
      switch ((status || '').toLowerCase()) {
        case 'pending':
          return 'DISPUTES_DASHBOARD.VENDOR_RECOVERY.PENDING';
        case 'partial':
          return 'DISPUTES_DASHBOARD.VENDOR_RECOVERY.PARTIAL';
        case 'recovered':
          return 'DISPUTES_DASHBOARD.VENDOR_RECOVERY.RECOVERED';
        default:
          return '';
      }
    })();

    return key ? this.t(key) : (status || this.t('DISPUTES_DASHBOARD.VENDOR_RECOVERY.NOT_APPLICABLE'));
  }
  canPerformAction(action: string, permission: 'disputes.edit' | 'disputes.approve'): boolean {
    const isAllowedByCase = this.selectedDispute.allowedActions?.includes(action) ?? false;
    return this.accessService.hasPermission(permission) && isAllowedByCase;
  }

  get canAssignSelectedDispute(): boolean {
    return this.canPerformAction('assign', 'disputes.edit');
  }

  get canAddNoteToSelectedDispute(): boolean {
    return this.canPerformAction('note', 'disputes.edit');
  }

  get canMessageSelectedDispute(): boolean {
    return this.canPerformAction('message', 'disputes.edit');
  }

  get canRequestEvidenceForSelectedDispute(): boolean {
    return this.canPerformAction('request_evidence', 'disputes.edit');
  }

  get canEscalateSelectedDispute(): boolean {
    return this.canPerformAction('escalate', 'disputes.edit');
  }

  get canApproveReturnSelectedDispute(): boolean {
    return this.selectedDispute.type === 'return_request' && this.canPerformAction('approve', 'disputes.approve');
  }

  get canApproveComplaintSelectedDispute(): boolean {
    return this.selectedDispute.type !== 'return_request' && this.canPerformAction('approve', 'disputes.approve');
  }

  get canRejectSelectedDispute(): boolean {
    return this.canPerformAction('reject', 'disputes.approve');
  }

  get canResolveSelectedDispute(): boolean {
    return this.canPerformAction('resolve', 'disputes.approve');
  }

  get canReopenSelectedDispute(): boolean {
    return this.canPerformAction('reopen', 'disputes.approve');
  }

  private matchesFilter(dispute: SupportCaseRow): boolean {
    return true; // Filtering is now server-side
  }

  private matchesSearch(dispute: SupportCaseRow): boolean {
    return true; // Filtering is now server-side
  }

  private getTotalDisputeValue(): string {
    return this.disputes
      .reduce((sum, dispute) => sum + dispute.amount, 0)
      .toLocaleString('en-US');
  }

  private countStatsByLabels(
    groups: Array<{ label: string; count: number }>,
    ...labels: string[]
  ): number {
    const normalized = new Set(labels.map((label) => label.trim().toLowerCase()));
    return groups
      .filter((group) => normalized.has(group.label.trim().toLowerCase()))
      .reduce((sum, group) => sum + group.count, 0);
  }

  private loadDisputes(): void {
    const filters = this.resolveServerFilters();

    this.isLoading = true;
    this.loadError = '';

    forkJoin({
      list: this.getDisputesPage(filters),
      stats: this.disputesService.getStats().pipe(
        catchError(() => of(createEmptyAdminOrderCaseStats()))
      )
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ list, stats }) => {
          this.disputes = list.items;
          this.totalCount = list.totalCount;
          this.caseStats = stats;
          this.applyFocusedSelection();
          this.normalizeCurrentPage();
          this.buildDashboardAlerts();
          this.buildUiConfig();
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.disputes = [];
          this.totalCount = 0;
          this.caseStats = createEmptyAdminOrderCaseStats();
          this.dashboardAlerts = [];
          this.applyFocusedSelection();
          this.buildUiConfig();
          this.loadError = this.isRtl
            ? 'تعذر تحميل النزاعات من الخادم. تحقق من تسجيل الدخول ثم أعد المحاولة.'
            : 'Unable to load disputes from the server. Check your session and try again.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  private getDisputesPage(filters: DisputeServerFilters) {
    const type = filters.type ?? this.disputeListTypesQuery;

    return this.disputesService.getDisputes(
      this.page,
      this.pageSize,
      this.searchTerm,
      filters.status,
      filters.priority,
      filters.queue,
      type,
      filters.initiatorRole,
      filters.vendorId,
      filters.driverId
    );
  }

  private normalizeDisputeTypeFilter(value: string): string {
    const normalized = value.trim();

    if (!normalized || normalized === 'complaint' || normalized === 'driver_report' || normalized === 'driver_account' || normalized === 'driveraccountappeal') {
      return 'all';
    }

    return normalized;
  }

  private resetToFirstPage(): void {
    this.page = 1;
  }

  private initializeFilterOptions(): void {
    const typeField = this.filterFields.find((field) => field.key === 'type');
    const priorityField = this.filterFields.find((field) => field.key === 'priority');
    const queueField = this.filterFields.find((field) => field.key === 'queue');
    const initiatorField = this.filterFields.find((field) => field.key === 'initiatorRole');

    if (typeField) {
      typeField.options = [
        { value: 'return_request', label: this.t('DISPUTES_DASHBOARD.TYPE.RETURN_REQUEST') },
        { value: 'driver_dispute', label: this.t('DISPUTES_DASHBOARD.TYPE.DRIVER_DISPUTE') }
      ];
      typeField.placeholder = 'DISPUTES_DASHBOARD.FILTER_FIELDS.ALL_TYPES';
    }

    if (priorityField) {
      priorityField.options = [
        { value: 'critical', label: this.t('DISPUTES_DASHBOARD.PRIORITY.CRITICAL') },
        { value: 'high', label: this.t('DISPUTES_DASHBOARD.PRIORITY.HIGH') },
        { value: 'medium', label: this.t('DISPUTES_DASHBOARD.PRIORITY.MEDIUM') },
        { value: 'low', label: this.t('DISPUTES_DASHBOARD.PRIORITY.LOW') }
      ];
      priorityField.placeholder = 'DISPUTES_DASHBOARD.FILTER_FIELDS.ALL_PRIORITIES';
    }

    if (queueField) {
      queueField.options = [
        { value: 'support', label: this.isRtl ? 'الدعم' : 'Support' },
        { value: 'finance', label: this.isRtl ? 'المالية' : 'Finance' },
        { value: 'operations', label: this.isRtl ? 'العمليات' : 'Operations' },
        { value: 'risk', label: this.isRtl ? 'المخاطر' : 'Risk' },
        { value: 'legal', label: this.isRtl ? 'القانوني' : 'Legal' },
        { value: 'driverops', label: this.isRtl ? 'عمليات المندوبين' : 'Driver Ops' }
      ];
      queueField.placeholder = 'DISPUTES_DASHBOARD.FILTER_FIELDS.ALL_QUEUES';
    }

    if (initiatorField) {
      initiatorField.options = [
        { value: 'customer', label: this.t('DISPUTES_DASHBOARD.INITIATOR.CUSTOMER') },
        { value: 'vendor', label: this.t('DISPUTES_DASHBOARD.INITIATOR.VENDOR') },
        { value: 'driver', label: this.t('DISPUTES_DASHBOARD.INITIATOR.DRIVER') },
        { value: 'admin', label: this.t('DISPUTES_DASHBOARD.INITIATOR.ADMIN') }
      ];
      initiatorField.placeholder = 'DISPUTES_DASHBOARD.FILTER_FIELDS.ALL_INITIATORS';
    }

    this.syncPanelFilters();
  }

  private syncPanelFilters(): void {
    this.panelFilters = {
      type: this.typeFilter !== 'all' ? this.typeFilter : null,
      priority: this.priorityFilter !== 'all' ? this.priorityFilter : null,
      queue: this.queueFilter !== 'all' ? this.queueFilter : null,
      initiatorRole: this.initiatorRoleFilter !== 'all' ? this.initiatorRoleFilter : null
    };
  }

  private toNullableFilterValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private normalizeCurrentPage(): void {
    const totalPages = Math.max(1, Math.ceil(this.totalFilteredItems / this.pageSize));
    this.page = Math.min(this.page, totalPages);
  }

  private buildDashboardAlerts(): void {
    const stats = this.caseStats;
    const alerts: DisputeDashboardAlertCard[] = [];

    if (stats.slaBreachedCount > 0) {
      alerts.push({
        id: 'sla-breach',
        titleKey: 'DISPUTES_DASHBOARD.INFO.OPERATIONAL_ALERT',
        description: this.isRtl
          ? `${stats.slaBreachedCount} قضية تجاوزت موعد SLA أو تقترب منه.`
          : `${stats.slaBreachedCount} case(s) breached or are close to breaching SLA.`,
        tone: 'amber'
      });
    }

    alerts.push({
      id: 'open-cases',
      titleKey: 'DISPUTES_DASHBOARD.INFO.TEAM_CAPACITY',
      description: this.isRtl
        ? `${stats.totalOpen} قضية مفتوحة حالياً على النظام.`
        : `${stats.totalOpen} open case(s) in the system right now.`,
      meta: this.isRtl
        ? `متوسط زمن الحل: ${stats.avgResolutionHours} ساعة`
        : `Average resolution time: ${stats.avgResolutionHours}h`,
      tone: 'teal'
    });

    const driverCases = this.countStatsByLabels(stats.byType, 'DriverDispute', 'driver_dispute');
    if (driverCases > 0) {
      alerts.push({
        id: 'driver-cases',
        title: this.isRtl ? 'نزاعات المناديب' : 'Driver disputes',
        description: this.isRtl ? `${driverCases} قضية من هذا النوع.` : `${driverCases} case(s) of this type.`,
        tone: 'violet'
      });
    }

    this.dashboardAlerts = alerts.slice(0, 3);
  }

  private buildUiConfig(): void {
    const stats = this.caseStats;

    this.kpiCards = [
      {
        id: 'active',
        title: this.t('DISPUTES_DASHBOARD.KPI.ACTIVE'),
        value: stats.totalOpen,
        color: '#127c8c',
        icon: '<span class="material-symbols-outlined text-[20px]">gavel</span>',
        clickable: true
      },
      {
        id: 'critical',
        title: this.t('DISPUTES_DASHBOARD.KPI.CRITICAL'),
        value: this.countStatsByLabels(stats.byPriority, 'Critical', 'critical'),
        color: '#ef4444',
        icon: '<span class="material-symbols-outlined text-[20px]">priority_high</span>',
        clickable: true
      },
      {
        id: 'in_review',
        title: this.t('DISPUTES_DASHBOARD.KPI.REVIEW'),
        value: this.countStatsByLabels(stats.byStatus, 'InReview', 'in_review'),
        color: '#f59e0b',
        icon: '<span class="material-symbols-outlined text-[20px]">fact_check</span>',
        clickable: true
      },
      {
        id: 'awaiting_customer_evidence',
        title: this.t('DISPUTES_DASHBOARD.KPI.MERCHANT'),
        value: this.countStatsByLabels(stats.byStatus, 'AwaitingCustomerEvidence', 'awaiting_customer_evidence'),
        color: '#8b5cf6',
        icon: '<span class="material-symbols-outlined text-[20px]">storefront</span>',
        clickable: true
      },
      {
        id: 'resolved',
        title: this.t('DISPUTES_DASHBOARD.KPI.RESOLVED'),
        value: this.countStatsByLabels(stats.byStatus, 'Resolved', 'resolved'),
        color: '#10b981',
        icon: '<span class="material-symbols-outlined text-[20px]">check_circle</span>',
        clickable: true
      },
      {
        id: 'value',
        title: this.t('DISPUTES_DASHBOARD.KPI.VALUE'),
        value: this.getTotalDisputeValue(),
        color: '#0f172a',
        icon: '<span class="material-symbols-outlined text-[20px]">payments</span>',
        clickable: false
      }
    ];

    const driverInitiated = this.disputes.filter((item) => item.initiatorRole === 'driver').length;
    if (driverInitiated > 0) {
      this.kpiCards.splice(4, 0, {
        id: 'driver',
        title: this.isRtl ? 'قضايا المندوب (الصفحة)' : 'Driver cases (page)',
        value: driverInitiated,
        color: '#6366f1',
        icon: '<span class="material-symbols-outlined text-[20px]">local_shipping</span>',
        clickable: true
      });
    }

    this.tableColumns = [
      { key: 'id', title: this.t('DISPUTES_DASHBOARD.TABLE.ID'), width: '14%', align: 'left', type: 'custom' },
      { key: 'customer', title: this.t('DISPUTES_DASHBOARD.TABLE.CUSTOMER'), width: '17%', align: 'left', type: 'custom' },
      { key: 'merchant', title: this.t('DISPUTES_DASHBOARD.TABLE.MERCHANT'), width: '15%', align: 'left', type: 'custom' },
      { key: 'type', title: this.t('DISPUTES_DASHBOARD.TABLE.TYPE_REASON'), width: '18%', align: 'left', type: 'custom' },
      { key: 'amount', title: this.t('DISPUTES_DASHBOARD.TABLE.AMOUNT'), width: '9%', align: 'center', type: 'custom' },
      { key: 'status', title: this.t('DISPUTES_DASHBOARD.TABLE.STATUS'), width: '10%', align: 'center', type: 'custom' },
      { key: 'priority', title: this.t('DISPUTES_DASHBOARD.TABLE.PRIORITY'), width: '10%', align: 'center', type: 'custom' },
      { key: 'owner', title: this.t('DISPUTES_DASHBOARD.TABLE.OWNER'), width: '12%', align: 'left', type: 'custom' },
      { key: 'actions', title: this.t('COMMON.ACTIONS'), width: '8%', align: 'center', type: 'actions' }
    ];

    this.tableActions = [
      { id: 'view', label: this.t('COMMON.VIEW_DETAILS'), icon: 'visibility' }
    ];

    const bulkActions: BulkAction[] = [];

    if (this.canEditDisputes) {
      bulkActions.push(
        { id: 'assign', label: this.t('DISPUTES_DASHBOARD.BULK.ASSIGN'), icon: 'person_add', color: 'bg-zadna-primary text-white shadow-zadna-primary/20' },
        { id: 'escalate', label: this.t('DISPUTES_DASHBOARD.BULK.ESCALATE'), icon: 'priority_high', color: 'bg-amber-500 text-white shadow-amber-500/20' },
        { id: 'note', label: this.t('DISPUTES_DASHBOARD.BULK.ADD_NOTE'), icon: 'note_add', color: 'bg-slate-700 text-white shadow-slate-700/20' }
      );
    }

    this.bulkActions = bulkActions;
  }

  private isValidFilter(value: string | null): value is DisputeFilterId {
    return value === 'all'
      || value === 'active'
      || value === 'critical'
      || value === 'review'
      || value === 'merchant'
      || value === 'submitted'
      || value === 'in_review'
      || value === 'awaiting_customer_evidence'
      || value === 'approved'
      || value === 'rejected'
      || value === 'resolved'
      || value === 'driver'
      || value === 'customer'
      || value === 'vendor';
  }

  private resolveServerFilters(): DisputeServerFilters {
    const baseFilters = {
      type: this.typeFilter !== 'all' ? this.typeFilter : undefined,
      priority: this.priorityFilter !== 'all' ? this.priorityFilter : undefined,
      queue: this.queueFilter !== 'all' ? this.queueFilter : undefined,
      initiatorRole: this.initiatorRoleFilter !== 'all' ? this.initiatorRoleFilter : undefined,
      vendorId: this.vendorIdFilter.trim() || undefined,
      driverId: this.driverIdFilter.trim() || undefined
    };

    switch (this.activeFilter) {
      case 'active':
        return { ...baseFilters, status: 'active' };
      case 'critical':
        return { ...baseFilters, priority: 'critical' };
      case 'review':
      case 'in_review':
        return { ...baseFilters, status: 'in_review' };
      case 'merchant':
      case 'awaiting_customer_evidence':
        return { ...baseFilters, status: 'awaiting_customer_evidence' };
      case 'submitted':
      case 'approved':
      case 'rejected':
      case 'resolved':
        return { ...baseFilters, status: this.activeFilter };
      case 'driver':
        return { ...baseFilters, initiatorRole: 'driver' };
      case 'customer':
        return { ...baseFilters, initiatorRole: 'customer' };
      case 'vendor':
        return { ...baseFilters, initiatorRole: 'vendor' };
      default:
        return baseFilters;
    }
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  closeQuickActionModal(): void {
    this.quickActionConfig = null;
    this.quickActionValue = createEmptyQuickActionFormValue();
  }

  submitQuickAction(value: DisputeQuickActionFormValue): void {
    const config = this.quickActionConfig;
    if (!config) {
      return;
    }

    this.closeQuickActionModal();

    switch (config.type) {
      case 'approve_complaint':
        this.approveComplaint(value.primaryValue || undefined, value.secondaryValue || undefined);
        return;
      case 'resolve':
        this.submitResolveCase(value.primaryValue || undefined);
        return;
      case 'reopen':
        this.submitReopenCase(value.primaryValue || undefined);
        return;
      case 'add_note':
        this.submitAddNote(value.primaryValue);
        return;
      case 'send_message':
        this.submitPublicMessage(value.primaryValue);
        return;
    }
  }

  alertCardClass(tone: DisputeDashboardAlertTone): string {
    switch (tone) {
      case 'amber':
        return 'border-amber-200/70 bg-amber-50';
      case 'violet':
        return 'border-violet-200/70 bg-violet-50';
      default:
        return 'border-slate-200/70 bg-white';
    }
  }

  private openModal(modal: DisputeModalKey): void {
    this.modalState.activeModal = modal;
  }

  private closeModal(modal: DisputeModalKey): void {
    if (this.modalState.activeModal === modal) {
      this.modalState.activeModal = null;
    }
  }

  private openQuickActionModal(type: DisputeQuickActionType): void {
    this.quickActionConfig = this.buildQuickActionConfig(type);
    this.quickActionValue = this.createQuickActionDefaults(type);
  }

  private buildQuickActionConfig(type: DisputeQuickActionType): DisputeQuickActionModalConfig {
    switch (type) {
      case 'approve_complaint':
        return {
          type,
          title: this.isRtl ? 'اعتماد الشكوى' : 'Approve complaint',
          subtitle: this.isRtl ? 'أدخل ملاحظات الموافقة الداخلية والرسالة الاختيارية للعميل.' : 'Add the internal approval note and optional customer message.',
          icon: 'check_circle',
          confirmLabel: this.isRtl ? 'اعتماد الشكوى' : 'Approve complaint',
          confirmClass: 'bg-emerald-600 hover:bg-emerald-700',
          primaryLabel: this.isRtl ? 'ملاحظات الموافقة الداخلية' : 'Internal approval notes',
          primaryPlaceholder: this.isRtl ? 'اكتب سبب اعتماد الشكوى...' : 'Write the internal reason for approval...',
          primaryRequired: true,
          secondaryLabel: this.isRtl ? 'رسالة العميل (اختياري)' : 'Customer message (optional)',
          secondaryPlaceholder: this.isRtl ? 'رسالة تظهر للعميل إذا لزم الأمر...' : 'Message shown to the customer if needed...'
        };
      case 'resolve':
        return {
          type,
          title: this.isRtl ? 'حل الحالة' : 'Resolve case',
          subtitle: this.isRtl ? 'يمكنك إضافة ملاحظة ختامية اختيارية قبل حل الحالة.' : 'You can add an optional closing note before resolving the case.',
          icon: 'done_all',
          confirmLabel: this.isRtl ? 'حل الحالة' : 'Resolve case',
          confirmClass: 'bg-emerald-600 hover:bg-emerald-700',
          primaryLabel: this.isRtl ? 'ملاحظة ختامية (اختياري)' : 'Closing note (optional)',
          primaryPlaceholder: this.isRtl ? 'اكتب أي ملاحظة ختامية...' : 'Write any closing note...'
        };
      case 'reopen':
        return {
          type,
          title: this.isRtl ? 'إعادة فتح الحالة' : 'Reopen case',
          subtitle: this.isRtl ? 'أضف سببا أو ملاحظة لإعادة فتح الحالة.' : 'Add a reason or note for reopening the case.',
          icon: 'restart_alt',
          confirmLabel: this.isRtl ? 'إعادة الفتح' : 'Reopen',
          confirmClass: 'bg-amber-600 hover:bg-amber-700',
          primaryLabel: this.isRtl ? 'ملاحظة إعادة الفتح' : 'Reopen note',
          primaryPlaceholder: this.isRtl ? 'اكتب سبب إعادة فتح الحالة...' : 'Write the reason for reopening the case...'
        };
      case 'add_note':
        return {
          type,
          title: this.isRtl ? 'إضافة ملاحظة' : 'Add note',
          subtitle: this.isRtl ? 'هذه الملاحظة داخلية ويتم حفظها داخل مسار الحالة.' : 'This note is internal and saved to the case timeline.',
          icon: 'note_add',
          confirmLabel: this.isRtl ? 'حفظ الملاحظة' : 'Save note',
          confirmClass: 'bg-slate-900 hover:bg-slate-800',
          primaryLabel: this.isRtl ? 'ملاحظة الحالة' : 'Case note',
          primaryPlaceholder: this.isRtl ? 'اكتب ملاحظة الحالة...' : 'Write the case note...',
          primaryRequired: true
        };
      case 'send_message':
      default:
        return {
          type: 'send_message',
          title: this.isRtl ? 'إرسال رسالة' : 'Send message',
          subtitle: this.isRtl ? 'اكتب الرسالة التي تريد إرسالها إلى الأطراف المعنية.' : 'Write the message you want to send to the relevant parties.',
          icon: 'send',
          confirmLabel: this.isRtl ? 'إرسال الرسالة' : 'Send message',
          confirmClass: 'bg-zadna-primary hover:bg-zadna-primaryDark',
          primaryLabel: this.isRtl ? 'نص الرسالة' : 'Message',
          primaryPlaceholder: this.isRtl ? 'اكتب الرسالة هنا...' : 'Write the message here...',
          primaryRequired: true
        };
    }
  }

  private createQuickActionDefaults(type: DisputeQuickActionType): DisputeQuickActionFormValue {
    if (type === 'approve_complaint') {
      return {
        primaryValue: '',
        secondaryValue: ''
      };
    }

    return createEmptyQuickActionFormValue();
  }

  private applyFocusedSelection(): void {
    const hadFocusedSelection = !!this.focusedDisputeId;
    const selectedFromFocus = this.focusedDisputeId
      ? this.disputes.find((item) => item.id === this.focusedDisputeId)
      : undefined;
    const selectedFromCurrent = this.selectedDispute.id
      ? this.disputes.find((item) => item.id === this.selectedDispute.id)
      : undefined;

    this.selectedDispute = selectedFromFocus
      ?? selectedFromCurrent
      ?? this.disputes[0]
      ?? this.createEmptyDispute();

    if (!this.disputes.length) {
      this.modalState.isDetailsDrawerOpen = false;
      return;
    }

    if (selectedFromFocus) {
      this.modalState.isDetailsDrawerOpen = true;
      return;
    }

    if (hadFocusedSelection) {
      this.focusedDisputeId = null;
      this.modalState.isDetailsDrawerOpen = false;
    }
  }

  private applyDisputeUpdate(updated: SupportCaseRow): void {
    const index = this.disputes.findIndex((item) => item.id === updated.id);

    if (index === -1) {
      this.disputes = [updated, ...this.disputes];
    } else {
      this.disputes = this.disputes.map((item, currentIndex) => currentIndex === index ? updated : item);
    }

    this.selectedDispute = this.selectedDispute.id === updated.id ? updated : this.selectedDispute;
    this.normalizeCurrentPage();
    this.buildUiConfig();
  }

  private createEmptyDispute(): SupportCaseRow {
    return {
      id: '',
      orderId: null,
      orderDisplayId: '',
      customerName: '',
      customerEmail: '',
      customerInitials: '',
      merchantName: '',
      type: 'complaint',
      reason: '',
      amount: 0,
      caseStatus: 'submitted',
      status: 'open',
      priority: 'low',
      owner: '',
      queue: '',
      risk: 'low',
      createdAt: '',
      sla: '',
      note: '',
      paymentMethod: 'card',
      paymentMask: '',
      customerSummary: '',
      merchantSummary: '',
      compensationType: null,
      settlementStatus: null,
      vendorRecoveryStatus: null,
      vendorRecoveredAmount: 0,
      vendorOutstandingAmount: 0,
      couponCode: null,
      couponExpiresAtUtc: null,
      couponRedeemed: false,
      evidence: [],
      timeline: [],
      initiatorRole: 'customer',
      waitingOnRole: 'customer',
      participants: [],
      allowedActions: [],
      messages: []
    };
  }
  
  approveComplaint(internalNotes?: string, customerMessage?: string): void {
    if (!this.canApproveComplaintSelectedDispute) {
      return;
    }

    if (internalNotes === undefined && customerMessage === undefined) {
      this.openQuickActionModal('approve_complaint');
      return;
    }

    this.disputesService.approveComplaint(this.selectedDispute.id, internalNotes, customerMessage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.handleMutationSuccess(dispute, this.isRtl ? 'تم اعتماد الشكوى بنجاح.' : 'Complaint approved successfully.');
        },
        error: (error) => this.handleMutationError(error, 'Failed to approve complaint.')
      });
  }
  
  resolveCase(): void {
    if (!this.canResolveSelectedDispute) {
      return;
    }

    this.openQuickActionModal('resolve');
  }
  
  private submitResolveCase(note?: string): void {
    this.disputesService.resolveCase(this.selectedDispute.id, note)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.handleMutationSuccess(dispute, this.isRtl ? 'تم حل الحالة بنجاح.' : 'Support case resolved successfully.');
        },
        error: (error) => this.handleMutationError(error, 'Failed to resolve case.')
      });
  }
  
  assignCase(): void {
    if (!this.canAssignSelectedDispute) return;
    this.disputesService.assignCase(this.selectedDispute.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.handleMutationSuccess(dispute, this.isRtl ? 'تم إسناد الحالة بنجاح.' : 'Support case assigned successfully.');
        },
        error: (error) => this.handleMutationError(error, 'Failed to assign case.')
      });
  }
  
  addNote(): void {
    if (!this.canAddNoteToSelectedDispute) {
      return;
    }

    this.openQuickActionModal('add_note');
  }

  private submitAddNote(note: string): void {
    this.disputesService.addNote(this.selectedDispute.id, note)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.handleMutationSuccess(dispute, this.isRtl ? 'تمت إضافة الملاحظة بنجاح.' : 'Case note added successfully.');
        },
        error: (error) => this.handleMutationError(error, 'Failed to add note.')
      });
  }

  sendPublicMessage(): void {
    if (!this.canMessageSelectedDispute) {
      return;
    }

    this.openQuickActionModal('send_message');
  }

  private submitPublicMessage(message: string): void {
    const audience = this.resolveAudienceForSelectedDispute();
    this.disputesService.addPublicMessage(this.selectedDispute.id, message, audience)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.handleMutationSuccess(dispute, this.isRtl ? 'تم إرسال الرسالة بنجاح.' : 'Message sent successfully.');
        },
        error: (error) => this.handleMutationError(error, 'Failed to send public message.')
      });
  }

  waitingOnLabel(role?: string): string {
    switch ((role || '').toLowerCase()) {
      case 'vendor':
        return this.t('DISPUTES_DASHBOARD.WAITING_ON.VENDOR');
      case 'driver':
        return this.t('DISPUTES_DASHBOARD.WAITING_ON.DRIVER');
      case 'customer':
        return this.t('DISPUTES_DASHBOARD.WAITING_ON.CUSTOMER');
      default:
        return this.t('DISPUTES_DASHBOARD.WAITING_ON.REVIEW');
    }
  }

  private resolveAudienceForSelectedDispute(): string {
    const waitingOn = this.selectedDispute.waitingOnRole?.toLowerCase();
    if (waitingOn === 'vendor') return 'vendor';
    if (waitingOn === 'driver') return 'driver';
    if (waitingOn === 'customer') return 'customer';
    return 'customer,vendor';
  }

  reopenCase(): void {
    if (!this.canReopenSelectedDispute) {
      return;
    }

    this.openQuickActionModal('reopen');
  }

  private submitReopenCase(note?: string): void {
    this.disputesService.reopenCase(this.selectedDispute.id, note)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.handleMutationSuccess(dispute, this.isRtl ? 'تمت إعادة فتح الحالة بنجاح.' : 'Support case reopened successfully.');
        },
        error: (error) => this.handleMutationError(error, 'Failed to reopen case.')
      });
  }

  private handleMutationSuccess(updated: SupportCaseRow, message: string): void {
    this.applyDisputeUpdate(updated);
    this.focusedDisputeId = updated.id;
    this.modalState.isDetailsDrawerOpen = true;
    this.toastService.success(message, this.isRtl ? 'النزاعات والاسترجاعات' : 'Disputes');
    this.loadDisputes();
  }

  private handleMutationError(error: unknown, logMessage: string): void {
    console.error(logMessage, error);
    this.toastService.error(
      describeApiError(error),
      this.isRtl ? 'النزاعات والاسترجاعات' : 'Disputes'
    );
  }
}
