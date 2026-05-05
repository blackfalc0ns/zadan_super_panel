import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AccessService } from '../../../../../core/services/access.service';
import { AdminSupportCaseRealtimeService } from '../../../../../core/services/admin-support-case-realtime.service';
import { DisputesService } from '@disputes/services/disputes.api.service';
import { BulkAction, DataTableComponent, TableAction, TableColumn } from '../../../../../shared/components/ui/data-table/data-table.component';
import { KPICard, KpiCardsComponent } from '../../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPaginationComponent } from '../../../../../shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '../../../../../shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import { DisputeApprovalModalComponent } from '../../../components/dispute-approval-modal/dispute-approval-modal.component';
import { DisputeEscalationModalComponent } from '../../../components/dispute-escalation-modal/dispute-escalation-modal.component';
import { DisputeRejectionModalComponent } from '../../../components/dispute-rejection-modal/dispute-rejection-modal.component';
import { DisputeRequestInfoModalComponent } from '../../../components/dispute-request-info-modal/dispute-request-info-modal.component';
import {
  DisputeFilterId,
  DisputePriority,
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
    DisputeApprovalModalComponent,
    DisputeEscalationModalComponent,
    DisputeRejectionModalComponent,
    DisputeRequestInfoModalComponent
  ],
  templateUrl: './disputes-dashboard.component.html',
  styleUrl: './disputes-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisputesDashboardComponent implements OnInit {
  disputes: SupportCaseRow[] = [];
  totalCount = 0;
  isLoading = false;
  loadError = '';
  private readonly destroyRef = inject(DestroyRef);
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
  selectedDispute: SupportCaseRow = this.createEmptyDispute();
  isDetailsDrawerOpen = false;
  isApprovalModalOpen = false;
  isEscalationModalOpen = false;
  isRejectionModalOpen = false;
  isRequestInfoModalOpen = false;

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
        this.buildUiConfig();
      });
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.searchTerm = params.get('search')?.trim() ?? '';
        this.activeFilter = this.isValidFilter(params.get('status')) ? params.get('status') as DisputeFilterId : 'all';
        this.typeFilter = params.get('type')?.trim() ?? 'all';
        this.priorityFilter = params.get('priority')?.trim() ?? 'all';
        this.queueFilter = params.get('queue')?.trim() ?? 'all';
        this.initiatorRoleFilter = params.get('initiatorRole')?.trim() ?? 'all';
        this.vendorIdFilter = params.get('vendorId')?.trim() ?? '';
        this.driverIdFilter = params.get('driverId')?.trim() ?? '';
        this.focusedDisputeId = params.get('focus')?.trim() ?? null;
        this.resetToFirstPage();
        this.applyFocusedSelection();
      });

    this.adminSupportCaseRealtime.getEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.targetUrl?.startsWith('/disputes')) {
          this.loadDisputes();
        }
      });

    this.loadDisputes();
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
      { value: 'complaint', label: this.getTypeLabel('complaint') },
      { value: 'driver_report', label: this.getTypeLabel('driver_report') },
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
    this.isDetailsDrawerOpen = true;
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
    this.isDetailsDrawerOpen = false;
  }

  openApprovalModal(): void {
    if (!this.canApproveReturnSelectedDispute) {
      return;
    }

    this.isEscalationModalOpen = false;
    this.isRejectionModalOpen = false;
    this.isRequestInfoModalOpen = false;
    this.isApprovalModalOpen = true;
  }

  closeApprovalModal(): void {
    this.isApprovalModalOpen = false;
  }

  saveApprovalDraft(): void {
    this.closeApprovalModal();
  }

  submitApproval(form: RefundDecisionForm): void {
    this.disputesService.approveReturnRequest(this.selectedDispute.id, form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.applyDisputeUpdate(dispute);
          this.closeApprovalModal();
        },
        error: (error) => console.error('Failed to approve support case.', error)
      });
  }

  openEscalationModal(): void {
    if (!this.canEscalateSelectedDispute) {
      return;
    }

    this.isApprovalModalOpen = false;
    this.isRejectionModalOpen = false;
    this.isRequestInfoModalOpen = false;
    this.isEscalationModalOpen = true;
  }

  closeEscalationModal(): void {
    this.isEscalationModalOpen = false;
  }

  saveEscalationDraft(): void {
    this.closeEscalationModal();
  }

  submitEscalation(form: EscalationDecisionForm): void {
    this.disputesService.escalateCase(this.selectedDispute.id, form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.applyDisputeUpdate(dispute);
          this.closeEscalationModal();
        },
        error: (error) => console.error('Failed to escalate support case.', error)
      });
  }

  openRejectionModal(): void {
    if (!this.canRejectSelectedDispute) {
      return;
    }

    this.isApprovalModalOpen = false;
    this.isEscalationModalOpen = false;
    this.isRequestInfoModalOpen = false;
    this.isRejectionModalOpen = true;
  }

  closeRejectionModal(): void {
    this.isRejectionModalOpen = false;
  }

  saveRejectionDraft(): void {
    this.closeRejectionModal();
  }

  submitRejection(form: RejectionDecisionForm): void {
    this.disputesService.rejectCase(this.selectedDispute.id, form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.applyDisputeUpdate(dispute);
          this.closeRejectionModal();
        },
        error: (error) => console.error('Failed to reject support case.', error)
      });
  }

  openRequestInfoModal(): void {
    if (!this.canRequestEvidenceForSelectedDispute) {
      return;
    }

    this.isApprovalModalOpen = false;
    this.isEscalationModalOpen = false;
    this.isRejectionModalOpen = false;
    this.isRequestInfoModalOpen = true;
  }

  closeRequestInfoModal(): void {
    this.isRequestInfoModalOpen = false;
  }

  saveRequestInfoDraft(): void {
    this.closeRequestInfoModal();
  }

  submitRequestInfo(form: RequestInfoForm): void {
    this.disputesService.requestEvidence(this.selectedDispute.id, form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.applyDisputeUpdate(dispute);
          this.closeRequestInfoModal();
        },
        error: (error) => console.error('Failed to request additional evidence.', error)
      });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
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
    switch ((type || '').toLowerCase()) {
      case 'return_request':
        return this.isRtl ? 'استرجاع / تعويض' : 'Return request';
      case 'driver_report':
        return this.isRtl ? 'بلاغ مندوب' : 'Driver report';
      case 'driver_dispute':
        return this.isRtl ? 'نزاع مندوب' : 'Driver dispute';
      default:
        return this.isRtl ? 'شكوى / نزاع' : 'Complaint';
    }
  }

  getInitiatorRoleLabel(role: string): string {
    switch ((role || '').toLowerCase()) {
      case 'vendor':
        return this.isRtl ? 'المتجر' : 'Vendor';
      case 'driver':
        return this.isRtl ? 'المندوب' : 'Driver';
      case 'admin':
        return this.isRtl ? 'الأدمن' : 'Admin';
      default:
        return this.isRtl ? 'العميل' : 'Customer';
    }
  }

  getPaymentMethodLabel(paymentMethod: string): string {
    switch ((paymentMethod || '').toLowerCase()) {
      case 'cash':
        return this.isRtl ? 'الدفع عند الاستلام' : 'Cash on delivery';
      case 'card':
        return this.isRtl ? 'بطاقة' : 'Card';
      case 'bank':
        return this.isRtl ? 'تحويل بنكي' : 'Bank transfer';
      case 'wallet':
        return this.isRtl ? 'محفظة' : 'Wallet';
      case 'apple_pay':
        return 'Apple Pay';
      case 'mada':
        return 'Mada';
      default:
        return paymentMethod || 'Unknown';
    }
  }

  getCompensationTypeLabel(compensationType?: string | null): string {
    switch ((compensationType || '').toLowerCase()) {
      case 'cash_refund':
        return this.isRtl ? 'استرجاع نقدي' : 'Cash refund';
      case 'coupon_compensation':
        return this.isRtl ? 'تعويض بكوبون' : 'Coupon compensation';
      default:
        return compensationType || (this.isRtl ? 'غير محدد' : 'Not set');
    }
  }

  getSettlementStatusLabel(settlementStatus?: string | null): string {
    switch ((settlementStatus || '').toLowerCase()) {
      case 'pending_review':
        return this.isRtl ? 'بانتظار المراجعة' : 'Pending review';
      case 'cash_refunded':
        return this.isRtl ? 'تم الاسترجاع النقدي' : 'Cash refunded';
      case 'coupon_issued':
        return this.isRtl ? 'تم إصدار الكوبون' : 'Coupon issued';
      case 'coupon_redeemed':
        return this.isRtl ? 'تم استخدام الكوبون' : 'Coupon redeemed';
      case 'rejected':
        return this.isRtl ? 'مرفوض' : 'Rejected';
      case 'approved':
        return this.isRtl ? 'تمت الموافقة' : 'Approved';
      default:
        return settlementStatus || (this.isRtl ? 'غير محدد' : 'Not set');
    }
  }

  getVendorRecoveryStatusLabel(status?: string | null): string {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return this.isRtl ? 'بانتظار التحصيل' : 'Pending recovery';
      case 'partial':
        return this.isRtl ? 'تم التحصيل جزئيًا' : 'Partially recovered';
      case 'recovered':
        return this.isRtl ? 'تم التحصيل بالكامل' : 'Recovered in full';
      default:
        return status || (this.isRtl ? 'لا يوجد' : 'Not applicable');
    }
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

  private loadDisputes(): void {
    const filters = this.resolveServerFilters();

    this.isLoading = true;
    this.loadError = '';

    this.disputesService.getDisputes(
      this.page,
      this.pageSize,
      this.searchTerm,
      filters.status,
      filters.priority,
      filters.queue,
      filters.type,
      filters.initiatorRole,
      filters.vendorId,
      filters.driverId
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.disputes = response.items;
          this.totalCount = response.totalCount;
          this.applyFocusedSelection();
          this.normalizeCurrentPage();
          this.buildUiConfig();
          this.isLoading = false;
        },
        error: () => {
          this.disputes = [];
          this.totalCount = 0;
          this.applyFocusedSelection();
          this.buildUiConfig();
          this.loadError = this.isRtl
            ? 'تعذر تحميل النزاعات حالياً.'
            : 'Unable to load disputes right now.';
          this.isLoading = false;
        }
      });
  }

  private resetToFirstPage(): void {
    this.page = 1;
  }

  private normalizeCurrentPage(): void {
    const totalPages = Math.max(1, Math.ceil(this.totalFilteredItems / this.pageSize));
    this.page = Math.min(this.page, totalPages);
  }

  private buildUiConfig(): void {
    this.kpiCards = [
      {
        id: 'active',
        title: this.t('DISPUTES_DASHBOARD.KPI.ACTIVE'),
        value: this.disputes.filter((item) => item.caseStatus !== 'resolved' && item.caseStatus !== 'rejected').length,
        color: '#127c8c',
        icon: '<span class="material-symbols-outlined text-[20px]">gavel</span>',
        trend: { value: 6, isPositive: true, label: this.t('DISPUTES_DASHBOARD.KPI.ACTIVE_TREND') },
        clickable: true
      },
      {
        id: 'critical',
        title: this.t('DISPUTES_DASHBOARD.KPI.CRITICAL'),
        value: this.disputes.filter((item) => item.priority === 'critical').length,
        color: '#ef4444',
        icon: '<span class="material-symbols-outlined text-[20px]">priority_high</span>',
        trend: { value: 0, isPositive: false, label: this.t('DISPUTES_DASHBOARD.KPI.CRITICAL_TREND') },
        clickable: true
      },
      {
        id: 'in_review',
        title: this.t('DISPUTES_DASHBOARD.KPI.REVIEW'),
        value: this.disputes.filter((item) => item.caseStatus === 'in_review').length,
        color: '#f59e0b',
        icon: '<span class="material-symbols-outlined text-[20px]">fact_check</span>',
        trend: { value: 0, isPositive: true, label: this.t('DISPUTES_DASHBOARD.KPI.REVIEW_TREND') },
        clickable: true
      },
      {
        id: 'awaiting_customer_evidence',
        title: this.t('DISPUTES_DASHBOARD.KPI.MERCHANT'),
        value: this.disputes.filter((item) => item.caseStatus === 'awaiting_customer_evidence').length,
        color: '#8b5cf6',
        icon: '<span class="material-symbols-outlined text-[20px]">storefront</span>',
        trend: { value: 0, isPositive: true, label: this.t('DISPUTES_DASHBOARD.KPI.MERCHANT_TREND') },
        clickable: true
      },
      {
        id: 'resolved',
        title: this.t('DISPUTES_DASHBOARD.KPI.RESOLVED'),
        value: this.disputes.filter((item) => item.caseStatus === 'resolved').length,
        color: '#10b981',
        icon: '<span class="material-symbols-outlined text-[20px]">check_circle</span>',
        trend: { value: 91, isPositive: true, label: this.t('DISPUTES_DASHBOARD.KPI.RESOLVED_TREND') },
        clickable: true
      },
      {
        id: 'value',
        title: this.t('DISPUTES_DASHBOARD.KPI.VALUE'),
        value: this.getTotalDisputeValue(),
        color: '#0f172a',
        icon: '<span class="material-symbols-outlined text-[20px]">payments</span>',
        trend: { value: 0, isPositive: true, label: this.t('COMMON.CURRENCY_SAR') },
        clickable: false
      }
    ];

    // Add driver cases KPI if any exist
    const driverCases = this.disputes.filter((item) => item.initiatorRole === 'driver');
    if (driverCases.length > 0) {
      this.kpiCards.splice(4, 0, {
        id: 'driver' as string,
        title: 'Driver Cases',
        value: driverCases.length,
        color: '#6366f1',
        icon: '<span class="material-symbols-outlined text-[20px]">local_shipping</span>',
        trend: { value: 0, isPositive: true, label: 'Driver-initiated' },
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

  private resolveServerFilters(): { status?: string; priority?: string; queue?: string; type?: string; initiatorRole?: string; vendorId?: string; driverId?: string } {
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

  private applyFocusedSelection(): void {
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
      this.isDetailsDrawerOpen = false;
      return;
    }

    if (selectedFromFocus) {
      this.isDetailsDrawerOpen = true;
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
      orderId: '',
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
    if (!this.canApproveComplaintSelectedDispute) return;
    const note = internalNotes || prompt(this.t('DISPUTES_DASHBOARD.DRAWER.APPROVE_COMPLAINT_PROMPT') || 'Enter approval notes:') || undefined;
    this.disputesService.approveComplaint(this.selectedDispute.id, note, customerMessage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.applyDisputeUpdate(dispute);
        },
        error: (error) => console.error('Failed to approve complaint.', error)
      });
  }
  
  resolveCase(): void {
    if (!this.canResolveSelectedDispute) return;
    if (!confirm(this.t('DISPUTES_DASHBOARD.DRAWER.RESOLVE_CONFIRM') || 'Are you sure you want to resolve this case?')) return;
    this.disputesService.resolveCase(this.selectedDispute.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.applyDisputeUpdate(dispute);
        },
        error: (error) => console.error('Failed to resolve case.', error)
      });
  }
  
  assignCase(): void {
    if (!this.canAssignSelectedDispute) return;
    this.disputesService.assignCase(this.selectedDispute.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.applyDisputeUpdate(dispute);
        },
        error: (error) => console.error('Failed to assign case.', error)
      });
  }
  
  addNote(): void {
    if (!this.canAddNoteToSelectedDispute) return;
    const note = prompt(this.t('DISPUTES_DASHBOARD.DRAWER.ADD_NOTE_PROMPT') || 'Enter note:');
    if (!note) return;
    this.disputesService.addNote(this.selectedDispute.id, note)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.applyDisputeUpdate(dispute);
        },
        error: (error) => console.error('Failed to add note.', error)
      });
  }

  sendPublicMessage(): void {
    if (!this.canMessageSelectedDispute) return;
    const message = prompt(this.t('DISPUTES_DASHBOARD.DRAWER.SEND_MESSAGE_PROMPT') || 'Enter message:');
    if (!message) return;

    const audience = this.resolveAudienceForSelectedDispute();
    this.disputesService.addPublicMessage(this.selectedDispute.id, message, audience)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.applyDisputeUpdate(dispute);
        },
        error: (error) => console.error('Failed to send public message.', error)
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
    if (!this.canReopenSelectedDispute) return;
    const note = prompt(this.isRtl ? 'أضف ملاحظة إعادة الفتح (اختياري)' : 'Add a reopen note (optional)') || undefined;
    this.disputesService.reopenCase(this.selectedDispute.id, note)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dispute) => {
          this.applyDisputeUpdate(dispute);
        },
        error: (error) => console.error('Failed to reopen case.', error)
      });
  }
}


