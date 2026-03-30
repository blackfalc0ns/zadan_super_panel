import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DisputesService } from '../../../../../core/services/disputes.service';
import { BulkAction, DataTableComponent, TableAction, TableColumn } from '../../../../../shared/components/ui/data-table/data-table.component';
import { KPICard, KpiCardsComponent } from '../../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPaginationComponent } from '../../../../../shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '../../../../../shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import { DisputeApprovalModalComponent } from '../../../components/dispute-approval-modal/dispute-approval-modal.component';
import { DisputeEscalationModalComponent } from '../../../components/dispute-escalation-modal/dispute-escalation-modal.component';
import { DisputeRejectionModalComponent } from '../../../components/dispute-rejection-modal/dispute-rejection-modal.component';
import { DisputeRequestInfoModalComponent } from '../../../components/dispute-request-info-modal/dispute-request-info-modal.component';
import { DisputeFilterId, DisputePriority, DisputeRow, DisputeStatus, RiskLevel, TimelineItem } from '../../../models/disputes.models';

@Component({
  selector: 'app-disputes-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
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
  readonly disputes: DisputeRow[];

  kpiCards: KPICard[] = [];
  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];
  bulkActions: BulkAction[] = [];

  page = 1;
  pageSize = 8;
  searchTerm = '';
  activeFilter: DisputeFilterId = 'all';
  selectedDispute: DisputeRow;
  isDetailsDrawerOpen = false;
  isApprovalModalOpen = false;
  isEscalationModalOpen = false;
  isRejectionModalOpen = false;
  isRequestInfoModalOpen = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly disputesService: DisputesService,
    public translate: TranslateService
  ) {
    this.disputes = this.disputesService.getDisputesSnapshot();
    this.selectedDispute = this.disputes[0];
    this.buildUiConfig();

    this.translate.onLangChange.subscribe(() => {
      this.buildUiConfig();
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const search = params.get('search')?.trim() ?? '';
      const filter = params.get('status');
      const focus = params.get('focus');

      this.searchTerm = search;
      this.activeFilter = this.isValidFilter(filter) ? filter : 'all';
      this.resetToFirstPage();

      if (focus) {
        const dispute = this.disputes.find((item) => item.id === focus);
        if (dispute) {
          this.selectDispute(dispute);
        }
      }
    });
  }

  get filteredDisputes(): DisputeRow[] {
    return this.disputes.filter((dispute) => this.matchesFilter(dispute) && this.matchesSearch(dispute));
  }

  get hasActiveFilters(): boolean {
    return this.activeFilter !== 'all' || this.searchTerm.trim().length > 0;
  }

  get totalFilteredItems(): number {
    return this.filteredDisputes.length;
  }

  get paginatedDisputes(): DisputeRow[] {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.filteredDisputes.slice(startIndex, startIndex + this.pageSize);
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
      resolved: this.t('DISPUTES_DASHBOARD.FILTERS.RESOLVED')
    }[this.activeFilter];
  }

  get isRtl(): boolean {
    return this.translate.currentLang === 'ar';
  }

  selectDispute(dispute: DisputeRow): void {
    this.selectedDispute = dispute;
    this.isDetailsDrawerOpen = true;
  }

  onTableRowClick(dispute: DisputeRow): void {
    this.selectDispute(dispute);
  }

  onTableAction(event: { action: TableAction; item: DisputeRow }): void {
    if (event.action.id === 'view') {
      this.selectDispute(event.item);
    }
  }

  onBulkAction(event: { action: BulkAction; items: DisputeRow[] }): void {
    if (event.items.length > 0) {
      this.selectDispute(event.items[0]);

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
  }

  toggleActiveCases(): void {
    this.activeFilter = this.activeFilter === 'active' ? 'all' : 'active';
    this.resetToFirstPage();
  }

  toggleCriticalFilter(): void {
    this.activeFilter = this.activeFilter === 'critical' ? 'all' : 'critical';
    this.resetToFirstPage();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.activeFilter = 'all';
    this.resetToFirstPage();
  }

  changePage(newPage: number): void {
    const totalPages = Math.max(1, Math.ceil(this.totalFilteredItems / this.pageSize));

    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    this.page = newPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeDetailsDrawer(): void {
    this.isDetailsDrawerOpen = false;
  }

  openApprovalModal(): void {
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

  submitApproval(): void {
    this.closeApprovalModal();
  }

  openEscalationModal(): void {
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

  submitEscalation(): void {
    this.closeEscalationModal();
  }

  openRejectionModal(): void {
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

  submitRejection(): void {
    this.closeRejectionModal();
  }

  openRequestInfoModal(): void {
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

  submitRequestInfo(): void {
    this.closeRequestInfoModal();
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

  getStatusLabel(status: DisputeStatus): string {
    return {
      open: this.t('DISPUTES_DASHBOARD.STATUS.OPEN'),
      review: this.t('DISPUTES_DASHBOARD.STATUS.REVIEW'),
      merchant: this.t('DISPUTES_DASHBOARD.STATUS.MERCHANT'),
      resolved: this.t('DISPUTES_DASHBOARD.STATUS.RESOLVED')
    }[status];
  }

  getStatusClass(status: DisputeStatus): string {
    return {
      open: 'text-sky-600',
      review: 'text-amber-500',
      merchant: 'text-violet-500',
      resolved: 'text-emerald-500'
    }[status];
  }

  getStatusVariant(status: DisputeStatus): StatusPillVariant {
    const variants: Record<DisputeStatus, StatusPillVariant> = {
      open: 'info',
      review: 'warning',
      merchant: 'processing',
      resolved: 'success'
    };

    return variants[status];
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

  private matchesFilter(dispute: DisputeRow): boolean {
    switch (this.activeFilter) {
      case 'active':
        return dispute.status !== 'resolved';
      case 'critical':
        return dispute.priority === 'critical';
      case 'review':
        return dispute.status === 'review';
      case 'merchant':
        return dispute.status === 'merchant';
      case 'resolved':
        return dispute.status === 'resolved';
      default:
        return true;
    }
  }

  private matchesSearch(dispute: DisputeRow): boolean {
    const query = this.searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      dispute.id,
      dispute.orderId,
      dispute.customerName,
      dispute.customerEmail,
      dispute.merchantName,
      dispute.type,
      dispute.reason,
      dispute.owner
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  }

  private getTotalDisputeValue(): string {
    return this.disputes
      .reduce((sum, dispute) => sum + dispute.amount, 0)
      .toLocaleString('en-US');
  }

  private resetToFirstPage(): void {
    this.page = 1;
  }

  private buildUiConfig(): void {
    this.kpiCards = [
      {
        id: 'active',
        title: this.t('DISPUTES_DASHBOARD.KPI.ACTIVE'),
        value: this.disputes.filter((item) => item.status !== 'resolved').length,
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
        id: 'review',
        title: this.t('DISPUTES_DASHBOARD.KPI.REVIEW'),
        value: this.disputes.filter((item) => item.status === 'review').length,
        color: '#f59e0b',
        icon: '<span class="material-symbols-outlined text-[20px]">fact_check</span>',
        trend: { value: 0, isPositive: true, label: this.t('DISPUTES_DASHBOARD.KPI.REVIEW_TREND') },
        clickable: true
      },
      {
        id: 'merchant',
        title: this.t('DISPUTES_DASHBOARD.KPI.MERCHANT'),
        value: this.disputes.filter((item) => item.status === 'merchant').length,
        color: '#8b5cf6',
        icon: '<span class="material-symbols-outlined text-[20px]">storefront</span>',
        trend: { value: 0, isPositive: true, label: this.t('DISPUTES_DASHBOARD.KPI.MERCHANT_TREND') },
        clickable: true
      },
      {
        id: 'resolved',
        title: this.t('DISPUTES_DASHBOARD.KPI.RESOLVED'),
        value: this.disputes.filter((item) => item.status === 'resolved').length,
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

    this.bulkActions = [
      { id: 'assign', label: this.t('DISPUTES_DASHBOARD.BULK.ASSIGN'), icon: 'person_add', color: 'bg-zadna-primary text-white shadow-zadna-primary/20' },
      { id: 'escalate', label: this.t('DISPUTES_DASHBOARD.BULK.ESCALATE'), icon: 'priority_high', color: 'bg-amber-500 text-white shadow-amber-500/20' },
      { id: 'note', label: this.t('DISPUTES_DASHBOARD.BULK.ADD_NOTE'), icon: 'note_add', color: 'bg-slate-700 text-white shadow-slate-700/20' },
      { id: 'delete', label: this.t('COMMON.DELETE'), icon: 'delete', color: 'bg-red-500 text-white shadow-red-500/20' }
    ];
  }

  private isValidFilter(value: string | null): value is DisputeFilterId {
    return value === 'all'
      || value === 'active'
      || value === 'critical'
      || value === 'review'
      || value === 'merchant'
      || value === 'resolved';
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }
}

