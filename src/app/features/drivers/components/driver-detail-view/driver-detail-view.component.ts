import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DriverStatus, VerificationStatus } from '../../../../core/models/driver';
import { DataTableComponent, TableColumn } from '../../../../shared/components/ui/data-table/data-table.component';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { KpiCardsComponent, KPICard } from '../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { QuickPreviewDrawerComponent, PreviewAction } from '../../../../shared/components/ui/quick-preview-drawer/quick-preview-drawer.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { DriverLifecycleTabDefinition, DriverLifecycleTabId, DriverPreviewType } from '../../driver-view.types';
import {
  getComplianceVariant as getCompliancePillVariant,
  getDocumentStatusVariant as getDocumentPillVariant,
  getDriverStatusLabel as getDriverStatusText,
  getFinanceStatusVariant as getFinancePillVariant,
  getIncidentSeverityVariant as getIncidentSeverityPillVariant,
  getIncidentStatusVariant as getIncidentStatusPillVariant,
  getLifecycleDriverStatusVariant as getLifecycleStatusPillVariant,
  getPriorityVariant as getPriorityPillVariant,
  getSupportStatusVariant as getSupportPillVariant,
  getTaskStatusVariant as getTaskPillVariant,
  getVerificationLabel as getVerificationText,
  getVerificationVariant as getVerificationPillVariant
} from '../../driver-ui.utils';
import {
  DriverDetailRecord,
  DriverVerificationChecklistItem,
  DriverFinanceEntry,
  DriverIncidentRecord,
  DriverLifecycleStage,
  DriverSupportTicket,
  DriverTaskAssignment
} from '../../drivers.models';

@Component({
  selector: 'app-driver-detail-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppPageHeaderComponent,
    KpiCardsComponent,
    SectionHeaderComponent,
    StatusPillComponent,
    KeyValueGridComponent,
    InlineBannerComponent,
    DataTableComponent,
    QuickPreviewDrawerComponent
  ],
  templateUrl: './driver-detail-view.component.html',
  styleUrl: './driver-detail-view.component.scss'
})
export class DriverDetailViewComponent {
  @Input() driverDetail: DriverDetailRecord | null = null;
  @Input() currentTab: DriverLifecycleTabId = 'overview';
  @Input() quickNote = '';
  @Input() reviewerDecisionNote = '';
  @Input() internalReviewNote = '';
  @Input() selectedRejectionReason = '';
  @Input() mapPreviewUrl = '';
  @Input() previewType: DriverPreviewType | null = null;
  @Input() selectedTask: DriverTaskAssignment | null = null;
  @Input() selectedIncident: DriverIncidentRecord | null = null;
  @Input() isLoading = false;

  @Output() editDriverRequested = new EventEmitter<void>();
  @Output() openTasksRequested = new EventEmitter<void>();
  @Output() toggleSuspensionRequested = new EventEmitter<void>();
  @Output() tabChange = new EventEmitter<DriverLifecycleTabId>();
  @Output() quickNoteChange = new EventEmitter<string>();
  @Output() quickNoteAdded = new EventEmitter<void>();
  @Output() reviewerDecisionNoteChange = new EventEmitter<string>();
  @Output() internalReviewNoteChange = new EventEmitter<string>();
  @Output() selectedRejectionReasonChange = new EventEmitter<string>();
  @Output() taskPreviewRequested = new EventEmitter<DriverTaskAssignment>();
  @Output() incidentPreviewRequested = new EventEmitter<DriverIncidentRecord>();
  @Output() previewClosed = new EventEmitter<void>();
  @Output() previewActionClick = new EventEmitter<PreviewAction>();

  readonly operationsColumns: TableColumn[] = [
    { key: 'id', title: 'رقم المهمة', width: '14%', align: 'left', type: 'custom' },
    { key: 'vendor', title: 'التاجر', width: '19%', align: 'left', type: 'custom' },
    { key: 'zone', title: 'المنطقة', width: '18%', align: 'left', type: 'custom' },
    { key: 'status', title: 'الحالة', width: '14%', align: 'center', type: 'custom' },
    { key: 'assignedAt', title: 'وقت التعيين', width: '15%', align: 'center', type: 'custom' },
    { key: 'duration', title: 'المدة', width: '10%', align: 'center', type: 'custom' },
    { key: 'codAmount', title: 'COD', width: '10%', align: 'center', type: 'custom' }
  ];

  readonly supportColumns: TableColumn[] = [
    { key: 'id', title: 'رقم التذكرة', width: '14%', align: 'left', type: 'custom' },
    { key: 'subject', title: 'الموضوع', width: '26%', align: 'left', type: 'custom' },
    { key: 'status', title: 'الحالة', width: '14%', align: 'center', type: 'custom' },
    { key: 'priority', title: 'الأولوية', width: '12%', align: 'center', type: 'custom' },
    { key: 'reviewer', title: 'المراجع', width: '16%', align: 'left', type: 'custom' },
    { key: 'updatedAt', title: 'آخر تحديث', width: '12%', align: 'center', type: 'custom' },
    { key: 'open', title: '', width: '6%', align: 'center', type: 'custom' }
  ];

  readonly incidentsColumns: TableColumn[] = [
    { key: 'id', title: 'رقم الحالة', width: '14%', align: 'left', type: 'custom' },
    { key: 'type', title: 'النوع', width: '22%', align: 'left', type: 'custom' },
    { key: 'severity', title: 'الأهمية', width: '12%', align: 'center', type: 'custom' },
    { key: 'status', title: 'الحالة', width: '14%', align: 'center', type: 'custom' },
    { key: 'reviewer', title: 'المراجع', width: '16%', align: 'left', type: 'custom' },
    { key: 'createdAt', title: 'تاريخ الإنشاء', width: '14%', align: 'center', type: 'custom' },
    { key: 'open', title: '', width: '8%', align: 'center', type: 'custom' }
  ];

  readonly financeColumns: TableColumn[] = [
    { key: 'reference', title: 'المرجع', width: '16%', align: 'left', type: 'custom' },
    { key: 'type', title: 'العملية', width: '24%', align: 'left', type: 'custom' },
    { key: 'amount', title: 'القيمة', width: '14%', align: 'center', type: 'custom' },
    { key: 'status', title: 'الحالة', width: '14%', align: 'center', type: 'custom' },
    { key: 'method', title: 'الوسيلة', width: '16%', align: 'left', type: 'custom' },
    { key: 'date', title: 'التاريخ', width: '16%', align: 'center', type: 'custom' }
  ];

  get kpiCards(): KPICard[] {
    if (!this.driverDetail) {
      return [];
    }

    const driver = this.driverDetail;
    const activeTasks = driver.operations.taskAssignments.filter((task) => task.status !== 'COMPLETED' && task.status !== 'FAILED').length;

    return [
      {
        id: 'active-tasks',
        title: 'المهام النشطة',
        value: activeTasks,
        icon: '<span class="material-symbols-outlined text-[20px]">local_shipping</span>',
        color: '#127c8c'
      },
      {
        id: 'support',
        title: 'تذاكر الدعم المفتوحة',
        value: driver.support.unresolvedCount,
        icon: '<span class="material-symbols-outlined text-[20px]">support_agent</span>',
        color: '#0f766e'
      },
      {
        id: 'compliance',
        title: 'حالات الامتثال',
        value: driver.compliance.openCases,
        icon: '<span class="material-symbols-outlined text-[20px]">gpp_maybe</span>',
        color: '#ef4444'
      },
      {
        id: 'finance',
        title: 'مستحقات حالية',
        value: `${Math.round(driver.finance.dueAmount).toLocaleString('en-US')} SAR`,
        icon: '<span class="material-symbols-outlined text-[20px]">payments</span>',
        color: '#8f4e00'
      },
      {
        id: 'verification',
        title: 'تقدم التوثيق',
        value: `${driver.verification.progressPercentage}%`,
        icon: '<span class="material-symbols-outlined text-[20px]">fact_check</span>',
        color: '#2563eb'
      },
      {
        id: 'route-score',
        title: 'Route Score',
        value: `${driver.performanceSnapshot.routeScore}%`,
        icon: '<span class="material-symbols-outlined text-[20px]">query_stats</span>',
        color: '#0f766e'
      }
    ];
  }

  get profileItems(): KeyValueGridItem[] {
    if (!this.driverDetail) {
      return [];
    }

    const driver = this.driverDetail;

    return [
      { label: 'رقم الجوال', value: driver.phoneNumber, translateLabel: false, translateValue: false, valueDir: 'ltr' },
      { label: 'البريد الإلكتروني', value: driver.email, translateLabel: false, translateValue: false, valueDir: 'ltr' },
      { label: 'المدينة', value: driver.city, translateLabel: false, translateValue: false },
      { label: 'المنطقة الحالية', value: driver.operations.zoneName, translateLabel: false, translateValue: false },
      { label: 'المركبة', value: driver.vehicleLabel, translateLabel: false, translateValue: false },
      { label: 'اللوحة', value: driver.plateNumber, translateLabel: false, translateValue: false, valueDir: 'ltr' }
    ];
  }

  get accountItems(): KeyValueGridItem[] {
    if (!this.driverDetail) {
      return [];
    }

    const driver = this.driverDetail;

    return [
      { label: 'تاريخ التسجيل', value: driver.joinedAt, translateLabel: false, translateValue: false, valueDir: 'ltr' },
      { label: 'المراجع الحالي', value: driver.verification.reviewer, translateLabel: false, translateValue: false },
      { label: 'آخر تحديث دعم', value: driver.support.lastUpdateLabel, translateLabel: false, translateValue: false },
      { label: 'موعد الصرف القادم', value: driver.finance.nextPayoutDate, translateLabel: false, translateValue: false, valueDir: 'ltr' }
    ];
  }

  get lifecycleTabs(): DriverLifecycleTabDefinition[] {
    if (!this.driverDetail) {
      return [
        { id: 'overview', label: 'ملخص', icon: 'dashboard' },
        { id: 'operations', label: 'التشغيل', icon: 'map' },
        { id: 'performance', label: 'الأداء', icon: 'speed' },
        { id: 'support', label: 'الدعم', icon: 'support_agent' },
        { id: 'compliance', label: 'الامتثال', icon: 'gavel' },
        { id: 'finance', label: 'المالية', icon: 'payments' },
        { id: 'verification', label: 'التوثيق', icon: 'verified_user' }
      ];
    }

    const driver = this.driverDetail;

    return [
      { id: 'overview', label: 'ملخص', icon: 'dashboard' },
      { id: 'operations', label: 'التشغيل', icon: 'map', count: driver.operations.taskAssignments.length },
      { id: 'performance', label: 'الأداء', icon: 'speed', count: `${driver.performanceSnapshot.routeScore}%` },
      { id: 'support', label: 'الدعم', icon: 'support_agent', count: driver.support.unresolvedCount, attention: driver.support.pendingFollowUpsCount > 1 },
      { id: 'compliance', label: 'الامتثال', icon: 'gavel', count: driver.compliance.openCases, attention: driver.compliance.criticalCases > 0 },
      { id: 'finance', label: 'المالية', icon: 'payments', count: `${Math.round(driver.finance.dueAmount)} SAR`, attention: driver.finance.dueAmount > 1400 },
      { id: 'verification', label: 'التوثيق', icon: 'verified_user', count: `${driver.verification.progressPercentage}%`, attention: driver.verification.progressPercentage < 100 }
    ];
  }

  get statusVariant(): StatusPillVariant {
    return this.driverDetail ? getLifecycleStatusPillVariant(this.driverDetail.status) : 'neutral';
  }

  get verificationVariant(): StatusPillVariant {
    return this.driverDetail ? getVerificationPillVariant(this.driverDetail.verificationStatus) : 'neutral';
  }

  get complianceVariant(): StatusPillVariant {
    return this.driverDetail ? getCompliancePillVariant(this.driverDetail.complianceStatusVariant) : 'neutral';
  }

  get previewTitle(): string {
    if (this.previewType === 'task' && this.selectedTask) {
      return `تفاصيل المهمة ${this.selectedTask.id}`;
    }

    if (this.previewType === 'incident' && this.selectedIncident) {
      return `تفاصيل الحالة ${this.selectedIncident.id}`;
    }

    return '';
  }

  get previewSubtitle(): string {
    if (this.previewType === 'task' && this.selectedTask) {
      return `${this.selectedTask.vendor} • ${this.selectedTask.zone}`;
    }

    if (this.previewType === 'incident' && this.selectedIncident) {
      return `${this.selectedIncident.type} • ${this.selectedIncident.linkedOrder}`;
    }

    return '';
  }

  get previewActions(): PreviewAction[] {
    if (this.previewType === 'task') {
      return [
        {
          id: 'reassign',
          label: 'إعادة تعيين المهمة',
          icon: '<span class="material-symbols-outlined text-[18px]">swap_horiz</span>',
          variant: 'primary'
        },
        {
          id: 'urgent',
          label: 'تصعيد عاجل',
          icon: '<span class="material-symbols-outlined text-[18px]">warning</span>',
          variant: 'danger'
        }
      ];
    }

    if (this.previewType === 'incident') {
      return [
        {
          id: 'resolve',
          label: 'إغلاق الحالة كـ محلولة',
          icon: '<span class="material-symbols-outlined text-[18px]">task_alt</span>',
          variant: 'primary'
        },
        {
          id: 'suspend-driver',
          label: 'إيقاف السائق',
          icon: '<span class="material-symbols-outlined text-[18px]">block</span>',
          variant: 'danger'
        },
        {
          id: 'request-docs',
          label: 'طلب مستندات',
          icon: '<span class="material-symbols-outlined text-[18px]">description</span>',
          variant: 'secondary'
        }
      ];
    }

    return [];
  }

  editDriver(): void {
    this.editDriverRequested.emit();
  }

  openTasks(): void {
    this.openTasksRequested.emit();
  }

  toggleSuspension(): void {
    this.toggleSuspensionRequested.emit();
  }

  setTab(tabId: DriverLifecycleTabId): void {
    this.tabChange.emit(tabId);
  }

  addQuickNote(): void {
    this.quickNoteChange.emit(this.quickNote);
    this.quickNoteAdded.emit();
  }

  openTaskPreview(task: DriverTaskAssignment): void {
    this.taskPreviewRequested.emit(task);
  }

  openIncidentPreview(incident: DriverIncidentRecord): void {
    this.incidentPreviewRequested.emit(incident);
  }

  closePreview(): void {
    this.previewClosed.emit();
  }

  handlePreviewAction(action: PreviewAction): void {
    this.previewActionClick.emit(action);
  }

  onQuickNoteChange(value: string): void {
    this.quickNote = value;
    this.quickNoteChange.emit(value);
  }

  onReviewerDecisionNoteChange(value: string): void {
    this.reviewerDecisionNote = value;
    this.reviewerDecisionNoteChange.emit(value);
  }

  onInternalReviewNoteChange(value: string): void {
    this.internalReviewNote = value;
    this.internalReviewNoteChange.emit(value);
  }

  onSelectedRejectionReasonChange(value: string): void {
    this.selectedRejectionReason = value;
    this.selectedRejectionReasonChange.emit(value);
  }

  getDriverStatusLabel(status: DriverStatus): string {
    return getDriverStatusText(status);
  }

  getVerificationLabel(status: VerificationStatus): string {
    return getVerificationText(status);
  }

  getTaskStatusVariant(status: DriverTaskAssignment['status']): StatusPillVariant {
    return getTaskPillVariant(status);
  }

  getSupportStatusVariant(status: DriverSupportTicket['status']): StatusPillVariant {
    return getSupportPillVariant(status);
  }

  getPriorityVariant(priority: DriverSupportTicket['priority']): StatusPillVariant {
    return getPriorityPillVariant(priority);
  }

  getIncidentStatusVariant(status: DriverIncidentRecord['status']): StatusPillVariant {
    return getIncidentStatusPillVariant(status);
  }

  getIncidentSeverityVariant(severity: DriverIncidentRecord['severity']): StatusPillVariant {
    return getIncidentSeverityPillVariant(severity);
  }

  getFinanceStatusVariant(status: DriverFinanceEntry['status']): StatusPillVariant {
    return getFinancePillVariant(status);
  }

  getDocumentStatusVariant(status: DriverDetailRecord['documents'][number]['status']): StatusPillVariant {
    return getDocumentPillVariant(status);
  }

  getStageCardClasses(stage: DriverLifecycleStage): string {
    const shared = 'group relative overflow-hidden rounded-[1.1rem] border px-3 py-3 transition-all';
    const stateClasses: Record<DriverLifecycleStage['state'], string> = {
      completed: 'border-emerald-100 bg-emerald-50/70',
      current: 'border-cyan-200 bg-cyan-50/70',
      upcoming: 'border-slate-200 bg-white/80',
      attention: 'border-red-100 bg-red-50/70'
    };

    return `${shared} ${stateClasses[stage.state]}`;
  }

  getStageIconClasses(state: DriverLifecycleStage['state']): string {
    const stateClasses: Record<DriverLifecycleStage['state'], string> = {
      completed: 'bg-emerald-500',
      current: 'bg-zadna-primary',
      upcoming: 'bg-slate-300',
      attention: 'bg-red-500'
    };

    return stateClasses[state];
  }

  getTagClasses(tone: 'success' | 'warning' | 'danger' | 'info'): string {
    const toneClasses: Record<'success' | 'warning' | 'danger' | 'info', string> = {
      success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      warning: 'bg-amber-100 text-amber-700 border border-amber-200',
      danger: 'bg-red-100 text-red-700 border border-red-200',
      info: 'bg-cyan-100 text-cyan-700 border border-cyan-200'
    };

    return `inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black ${toneClasses[tone]}`;
  }

  getInsightCardClasses(tone: 'primary' | 'success' | 'warning' | 'danger'): string {
    const toneClasses: Record<'primary' | 'success' | 'warning' | 'danger', string> = {
      primary: 'border-zadna-primary/25 bg-cyan-50/50',
      success: 'border-emerald-200 bg-emerald-50/70',
      warning: 'border-amber-200 bg-amber-50/70',
      danger: 'border-red-200 bg-red-50/70'
    };

    return `rounded-[1.15rem] border p-5 ${toneClasses[tone]}`;
  }

  getHeatCellClasses(value: number): string {
    const shades = [
      'bg-slate-100',
      'bg-emerald-100',
      'bg-emerald-200',
      'bg-emerald-400/80',
      'bg-emerald-500'
    ];

    return shades[value] ?? shades[0];
  }

  getCompletedChecklistCount(driver: DriverDetailRecord): number {
    return driver.verification.checklist.filter((item) => item.completed).length;
  }

  getPendingChecklistCount(driver: DriverDetailRecord): number {
    return driver.verification.checklist.filter((item) => !item.completed).length;
  }

  getCriticalChecklistCount(driver: DriverDetailRecord): number {
    return driver.verification.checklist.filter((item) => item.critical).length;
  }

  getVerificationRecommendationVariant(driver: DriverDetailRecord): StatusPillVariant {
    if (driver.verification.progressPercentage >= 100) {
      return 'success';
    }

    if (this.getCriticalChecklistCount(driver) > 0) {
      return 'warning';
    }

    return 'info';
  }

  getChecklistItemClasses(item: DriverVerificationChecklistItem): string {
    if (item.completed) {
      return 'border-emerald-200 bg-emerald-50/80';
    }

    if (item.critical) {
      return 'border-red-200 bg-red-50/80';
    }

    return 'border-slate-200 bg-white';
  }

  getChecklistItemStatusLabel(item: DriverVerificationChecklistItem): string {
    return item.completed ? 'مكتمل' : item.critical ? 'يتطلب مراجعة' : 'مطلوب';
  }

  getChecklistItemStatusVariant(item: DriverVerificationChecklistItem): StatusPillVariant {
    if (item.completed) {
      return 'success';
    }

    return item.critical ? 'warning' : 'neutral';
  }
}
