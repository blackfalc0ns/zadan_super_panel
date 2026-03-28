import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DriverStatus, VerificationStatus } from '../../../../core/models/driver';
import { DataTableComponent, TableColumn } from '../../../../shared/components/ui/data-table/data-table.component';
import { DetailTabsNavComponent, DetailTabNavItem } from '../../../../shared/components/ui/detail-tabs-nav/detail-tabs-nav.component';
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
  DriverTaskAssignment,
  DriverWorkflowActionId,
  DriverWorkflowActionTone
} from '../../drivers.models';

const WORKFLOW_STATE_LABEL_KEYS: Record<DriverDetailRecord['workflow']['state'], string> = {
  SUSPENDED: 'DRIVERS.DETAIL.WORKFLOW.STATE_LABELS.SUSPENDED',
  VERIFICATION_REVIEW: 'DRIVERS.DETAIL.WORKFLOW.STATE_LABELS.VERIFICATION_REVIEW',
  PENDING_DOCUMENTS: 'DRIVERS.DETAIL.WORKFLOW.STATE_LABELS.PENDING_DOCUMENTS',
  COMPLIANCE_REVIEW: 'DRIVERS.DETAIL.WORKFLOW.STATE_LABELS.COMPLIANCE_REVIEW',
  FINANCE_HOLD: 'DRIVERS.DETAIL.WORKFLOW.STATE_LABELS.FINANCE_HOLD',
  ACTIVE_DELIVERY: 'DRIVERS.DETAIL.WORKFLOW.STATE_LABELS.ACTIVE_DELIVERY',
  READY_FOR_DISPATCH: 'DRIVERS.DETAIL.WORKFLOW.STATE_LABELS.READY_FOR_DISPATCH',
  READY_TO_ACTIVATE: 'DRIVERS.DETAIL.WORKFLOW.STATE_LABELS.READY_TO_ACTIVATE'
};

const WORKFLOW_SUMMARY_KEYS: Record<DriverDetailRecord['workflow']['state'], string> = {
  SUSPENDED: 'DRIVERS.DETAIL.WORKFLOW.SUMMARIES.SUSPENDED',
  VERIFICATION_REVIEW: 'DRIVERS.DETAIL.WORKFLOW.SUMMARIES.VERIFICATION_REVIEW',
  PENDING_DOCUMENTS: 'DRIVERS.DETAIL.WORKFLOW.SUMMARIES.PENDING_DOCUMENTS',
  COMPLIANCE_REVIEW: 'DRIVERS.DETAIL.WORKFLOW.SUMMARIES.COMPLIANCE_REVIEW',
  FINANCE_HOLD: 'DRIVERS.DETAIL.WORKFLOW.SUMMARIES.FINANCE_HOLD',
  ACTIVE_DELIVERY: 'DRIVERS.DETAIL.WORKFLOW.SUMMARIES.ACTIVE_DELIVERY',
  READY_FOR_DISPATCH: 'DRIVERS.DETAIL.WORKFLOW.SUMMARIES.READY_FOR_DISPATCH',
  READY_TO_ACTIVATE: 'DRIVERS.DETAIL.WORKFLOW.SUMMARIES.READY_TO_ACTIVATE'
};

const WORKFLOW_NEXT_STEP_KEYS: Record<DriverDetailRecord['workflow']['state'], string> = {
  SUSPENDED: 'DRIVERS.DETAIL.WORKFLOW.NEXT_STEPS.SUSPENDED',
  VERIFICATION_REVIEW: 'DRIVERS.DETAIL.WORKFLOW.NEXT_STEPS.VERIFICATION_REVIEW',
  PENDING_DOCUMENTS: 'DRIVERS.DETAIL.WORKFLOW.NEXT_STEPS.PENDING_DOCUMENTS',
  COMPLIANCE_REVIEW: 'DRIVERS.DETAIL.WORKFLOW.NEXT_STEPS.COMPLIANCE_REVIEW',
  FINANCE_HOLD: 'DRIVERS.DETAIL.WORKFLOW.NEXT_STEPS.FINANCE_HOLD',
  ACTIVE_DELIVERY: 'DRIVERS.DETAIL.WORKFLOW.NEXT_STEPS.ACTIVE_DELIVERY',
  READY_FOR_DISPATCH: 'DRIVERS.DETAIL.WORKFLOW.NEXT_STEPS.READY_FOR_DISPATCH',
  READY_TO_ACTIVATE: 'DRIVERS.DETAIL.WORKFLOW.NEXT_STEPS.READY_TO_ACTIVATE'
};

const WORKFLOW_QUEUE_LABEL_KEYS: Record<DriverDetailRecord['workflow']['state'], string> = {
  SUSPENDED: 'DRIVERS.DETAIL.WORKFLOW.QUEUE_LABELS.SUSPENDED',
  VERIFICATION_REVIEW: 'DRIVERS.DETAIL.WORKFLOW.QUEUE_LABELS.VERIFICATION_REVIEW',
  PENDING_DOCUMENTS: 'DRIVERS.DETAIL.WORKFLOW.QUEUE_LABELS.PENDING_DOCUMENTS',
  COMPLIANCE_REVIEW: 'DRIVERS.DETAIL.WORKFLOW.QUEUE_LABELS.COMPLIANCE_REVIEW',
  FINANCE_HOLD: 'DRIVERS.DETAIL.WORKFLOW.QUEUE_LABELS.FINANCE_HOLD',
  ACTIVE_DELIVERY: 'DRIVERS.DETAIL.WORKFLOW.QUEUE_LABELS.ACTIVE_DELIVERY',
  READY_FOR_DISPATCH: 'DRIVERS.DETAIL.WORKFLOW.QUEUE_LABELS.READY_FOR_DISPATCH',
  READY_TO_ACTIVATE: 'DRIVERS.DETAIL.WORKFLOW.QUEUE_LABELS.READY_TO_ACTIVATE'
};

const WORKFLOW_READINESS_LABEL_KEYS: Record<string, string> = {
  'متوقف بالكامل': 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.FULLY_STOPPED',
  'محجوب حتى الاعتماد': 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.BLOCKED_UNTIL_APPROVAL',
  'محجوب بالامتثال': 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.BLOCKED_BY_COMPLIANCE',
  'جاهز جزئيًا': 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.PARTIALLY_READY',
  'يعمل الآن': 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.WORKING_NOW',
  'جاهز بالكامل': 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.FULLY_READY',
  'جاهز للإدراج': 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.READY_TO_REJOIN',
  'جاهز مع متابعة': 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.READY_WITH_MONITORING'
};

const WORKFLOW_OWNER_TEAM_LABEL_KEYS: Record<string, string> = {
  'الامتثال + العمليات': 'DRIVERS.DETAIL.WORKFLOW.OWNER_TEAMS.COMPLIANCE_AND_OPERATIONS',
  'فريق التوثيق': 'DRIVERS.DETAIL.WORKFLOW.OWNER_TEAMS.VERIFICATION_TEAM',
  'فريق الامتثال': 'DRIVERS.DETAIL.WORKFLOW.OWNER_TEAMS.COMPLIANCE_TEAM',
  'المالية + العمليات': 'DRIVERS.DETAIL.WORKFLOW.OWNER_TEAMS.FINANCE_AND_OPERATIONS',
  'العمليات الحية': 'DRIVERS.DETAIL.WORKFLOW.OWNER_TEAMS.LIVE_OPERATIONS',
  'العمليات': 'DRIVERS.DETAIL.WORKFLOW.OWNER_TEAMS.OPERATIONS'
};

const WORKFLOW_ITEM_KEYS: Record<string, string> = {
  'الملف لم يحصل على اعتماد التوثيق بعد، ولا يجب فتح السائق للإسناد.': 'DRIVERS.DETAIL.WORKFLOW.ITEMS.VERIFICATION_PENDING',
  'الحساب موقوف حاليًا ولا يمكن إسناد مهام أو صرف مستحقات جديدة.': 'DRIVERS.DETAIL.WORKFLOW.ITEMS.ACCOUNT_SUSPENDED',
  'يوجد تعليق مالي أو COD غير مسوى ويحتاج حسم قبل أي صرف جديد.': 'DRIVERS.DETAIL.WORKFLOW.ITEMS.FINANCE_HOLD',
  'هناك حالة امتثال أو بلاغ مفتوح يحتاج قرارًا قبل العودة للتشغيل الطبيعي.': 'DRIVERS.DETAIL.WORKFLOW.ITEMS.COMPLIANCE_CASE',
  'بعض المستندات تقترب من الانتهاء وتحتاج متابعة قبل أن تتحول إلى إيقاف.': 'DRIVERS.DETAIL.WORKFLOW.ITEMS.DOCUMENTS_EXPIRING',
  'يوجد مستند أو صورة هوية تحت المراجعة اليدوية.': 'DRIVERS.DETAIL.WORKFLOW.ITEMS.DOCUMENT_UNDER_REVIEW',
  'أداء السائق يحتاج متابعة قبل زيادة الحمل التشغيلي عليه.': 'DRIVERS.DETAIL.WORKFLOW.ITEMS.PERFORMANCE_ALERT'
};

const WORKFLOW_ACTION_LABEL_KEYS: Record<DriverWorkflowActionId, string> = {
  APPROVE_VERIFICATION: 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.APPROVE_VERIFICATION',
  REQUEST_DOCUMENTS: 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.REQUEST_DOCUMENTS',
  CLEAR_FINANCE_HOLD: 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.CLEAR_FINANCE_HOLD',
  SUSPEND_DRIVER: 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.SUSPEND_DRIVER',
  REACTIVATE_DRIVER: 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.REACTIVATE_DRIVER',
  MARK_READY_FOR_DISPATCH: 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.MARK_READY_FOR_DISPATCH',
  OPEN_OPERATIONS: 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.OPEN_OPERATIONS',
  OPEN_SUPPORT: 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.OPEN_SUPPORT',
  OPEN_FINANCE: 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.OPEN_FINANCE',
  REVIEW_COMPLIANCE: 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.REVIEW_COMPLIANCE'
};

const WORKFLOW_ACTION_HELPER_KEYS: Record<DriverWorkflowActionId, string> = {
  APPROVE_VERIFICATION: 'DRIVERS.DETAIL.WORKFLOW.ACTION_HELPERS.APPROVE_VERIFICATION',
  REQUEST_DOCUMENTS: 'DRIVERS.DETAIL.WORKFLOW.ACTION_HELPERS.REQUEST_DOCUMENTS',
  CLEAR_FINANCE_HOLD: 'DRIVERS.DETAIL.WORKFLOW.ACTION_HELPERS.CLEAR_FINANCE_HOLD',
  SUSPEND_DRIVER: 'DRIVERS.DETAIL.WORKFLOW.ACTION_HELPERS.SUSPEND_DRIVER',
  REACTIVATE_DRIVER: 'DRIVERS.DETAIL.WORKFLOW.ACTION_HELPERS.REACTIVATE_DRIVER',
  MARK_READY_FOR_DISPATCH: 'DRIVERS.DETAIL.WORKFLOW.ACTION_HELPERS.MARK_READY_FOR_DISPATCH',
  OPEN_OPERATIONS: 'DRIVERS.DETAIL.WORKFLOW.ACTION_HELPERS.OPEN_OPERATIONS',
  OPEN_SUPPORT: 'DRIVERS.DETAIL.WORKFLOW.ACTION_HELPERS.OPEN_SUPPORT',
  OPEN_FINANCE: 'DRIVERS.DETAIL.WORKFLOW.ACTION_HELPERS.OPEN_FINANCE',
  REVIEW_COMPLIANCE: 'DRIVERS.DETAIL.WORKFLOW.ACTION_HELPERS.REVIEW_COMPLIANCE'
};

const TASK_STATUS_LABEL_KEYS: Record<DriverTaskAssignment['status'], string> = {
  IN_PROGRESS: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.IN_PROGRESS',
  PREPARING: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.PREPARING',
  WAITING_DRIVER: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.WAITING_DRIVER',
  COMPLETED: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.COMPLETED',
  FAILED: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.FAILED'
};

const SUPPORT_STATUS_LABEL_KEYS: Record<DriverSupportTicket['status'], string> = {
  WAITING: 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.STATUS.WAITING',
  IN_PROGRESS: 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.STATUS.IN_PROGRESS',
  RESOLVED: 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.STATUS.RESOLVED'
};

const SUPPORT_PRIORITY_LABEL_KEYS: Record<DriverSupportTicket['priority'], string> = {
  NORMAL: 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.PRIORITY.NORMAL',
  HIGH: 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.PRIORITY.HIGH',
  CRITICAL: 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.PRIORITY.CRITICAL'
};

const SUPPORT_TAG_LABEL_KEYS: Record<string, string> = {
  'High Risk': 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.TAGS.HIGH_RISK',
  'Active Support': 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.TAGS.ACTIVE_SUPPORT',
  'Payment Issue': 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.TAGS.PAYMENT_ISSUE',
  'Stable Wallet': 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.TAGS.STABLE_WALLET',
  'On Mission': 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.TAGS.ON_MISSION',
  'Driver Follow-up': 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.TAGS.DRIVER_FOLLOW_UP'
};

const INCIDENT_STATUS_LABEL_KEYS: Record<DriverIncidentRecord['status'], string> = {
  NEW: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.STATUS.NEW',
  REVIEW: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.STATUS.REVIEW',
  WAITING_DOCS: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.STATUS.WAITING_DOCS',
  RESOLVED: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.STATUS.RESOLVED'
};

const INCIDENT_SEVERITY_LABEL_KEYS: Record<DriverIncidentRecord['severity'], string> = {
  MEDIUM: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.SEVERITY.MEDIUM',
  HIGH: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.SEVERITY.HIGH',
  CRITICAL: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.SEVERITY.CRITICAL'
};

const INCIDENT_TYPE_KEYS: Record<string, string> = {
  'حادث مروري': 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.TYPES.TRAFFIC_ACCIDENT',
  'اشتباه احتيال': 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.TYPES.FRAUD_SUSPECTED',
  'تأخير متكرر': 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.TYPES.REPEATED_DELAY'
};

const INCIDENT_SUMMARY_KEYS: Record<string, string> = {
  'حادث بسيط أثناء التسليم يحتاج استكمال تقرير المرور والصور الميدانية.': 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.SUMMARIES.TRAFFIC_ACCIDENT',
  'مطابقة غير مكتملة بين قيمة COD وإثبات التحصيل وتتطلب مراجعة فريق المالية.': 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.SUMMARIES.FRAUD_SUSPECTED',
  'تم إغلاق الحالة بعد إعادة توزيع المنطقة وتحسن الأداء خلال 48 ساعة.': 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.SUMMARIES.REPEATED_DELAY'
};

const COMPLIANCE_RISK_LABEL_KEYS: Record<string, string> = {
  'مرتفع': 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.RISK.HIGH',
  'متوسط': 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.RISK.MEDIUM',
  'منخفض': 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.RISK.LOW'
};

const FINANCE_STATUS_LABEL_KEYS: Record<DriverFinanceEntry['status'], string> = {
  SETTLED: 'DRIVERS.DETAIL.FINANCE.DYNAMIC.STATUS.SETTLED',
  PENDING: 'DRIVERS.DETAIL.FINANCE.DYNAMIC.STATUS.PENDING',
  FAILED: 'DRIVERS.DETAIL.FINANCE.DYNAMIC.STATUS.FAILED'
};

const FINANCE_TYPE_KEYS: Record<string, string> = {
  'تحويل أرباح أسبوعي': 'DRIVERS.DETAIL.FINANCE.DYNAMIC.TYPES.WEEKLY_EARNINGS_TRANSFER',
  'تحويل بنكي': 'DRIVERS.DETAIL.FINANCE.DYNAMIC.TYPES.BANK_TRANSFER',
  'تسوية COD متأخرة': 'DRIVERS.DETAIL.FINANCE.DYNAMIC.TYPES.DELAYED_COD_SETTLEMENT'
};

const FINANCE_METHOD_KEYS: Record<string, string> = {
  'تحويل أسبوعي إلى STC Pay': 'DRIVERS.DETAIL.FINANCE.DYNAMIC.METHODS.WEEKLY_STC_PAY'
};

const VERIFICATION_RECOMMENDATION_KEYS: Record<string, string> = {
  'قبول التوثيق': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.RECOMMENDATIONS.ACCEPT',
  'قبول بشروط': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.RECOMMENDATIONS.CONDITIONAL',
  'طلب استكمال': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.RECOMMENDATIONS.COMPLETE'
};

const VERIFICATION_REASON_KEYS: Record<string, string> = {
  'المستندات مكتملة والهوية والمركبة متطابقتان مع متطلبات التشغيل.': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.REASONS.ACCEPT',
  'الملف جاهز تشغيليًا لكن توجد نقاط بسيطة تحتاج متابعة قبل الاعتماد النهائي.': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.REASONS.CONDITIONAL',
  'لا يزال الملف يحتاج استكمال مستندات أو توضيحات قبل التفعيل.': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.REASONS.COMPLETE'
};

const VERIFICATION_CHECKLIST_LABEL_KEYS: Record<string, string> = {
  'اكتمال البيانات الأساسية': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.CHECKLIST.BASIC_DATA_COMPLETE',
  'تطابق بيانات المركبة': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.CHECKLIST.VEHICLE_MATCH',
  'وضوح صورة الهوية الوطنية': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.CHECKLIST.NATIONAL_ID_CLEAR',
  'سريان صلاحية الرخصة': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.CHECKLIST.LICENSE_VALID',
  'وضوح صور المركبة': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.CHECKLIST.VEHICLE_PHOTOS_CLEAR',
  'تطابق الصورة الشخصية للواقع': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.CHECKLIST.SELFIE_MATCH'
};

const VERIFICATION_CHECKLIST_NOTE_KEYS: Record<string, string> = {
  'تنتهي قريبًا وتحتاج تأكيد': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.CHECKLIST_NOTES.LICENSE_EXPIRING',
  'يحتاج اعتماد المراجع': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.CHECKLIST_NOTES.SELFIE_REVIEW'
};

const VERIFICATION_REJECTION_REASON_KEYS: Record<string, string> = {
  'المستندات غير واضحة': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.REJECTION_REASONS.DOCUMENTS_UNCLEAR',
  'انتهاء صلاحية المستندات': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.REJECTION_REASONS.DOCUMENTS_EXPIRED',
  'عدم تطابق الصور': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.REJECTION_REASONS.IMAGES_MISMATCH',
  'بيانات المركبة غير صحيحة': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.REJECTION_REASONS.VEHICLE_DATA_INVALID'
};

const DOCUMENT_TITLE_KEYS: Record<string, string> = {
  'الهوية الوطنية': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.TITLES.NATIONAL_ID',
  'رخصة القيادة': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.TITLES.LICENSE',
  'صورة المركبة': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.TITLES.VEHICLE',
  'صورة التحقق الشخصي': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.TITLES.SELFIE'
};

const DOCUMENT_STATUS_LABEL_KEYS: Record<string, string> = {
  'صالح': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.STATUS.VALID',
  'صالحة': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.STATUS.VALID_FEMININE',
  'تنتهي قريبًا': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.STATUS.EXPIRING',
  'قيد المراجعة': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.STATUS.UNDER_REVIEW',
  'مطابقة': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.STATUS.MATCHED',
  'تحتاج تأكيد': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.STATUS.NEEDS_CONFIRMATION'
};

const DOCUMENT_SUBTITLE_KEYS: Record<string, string> = {
  'آخر تحديث: 2026/03/12': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.SUBTITLES.NATIONAL_ID',
  'تنتهي خلال 120 يوم': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.SUBTITLES.LICENSE',
  'مطابقة الوجه والهوية': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.SUBTITLES.SELFIE'
};

const DOCUMENT_EXPIRY_KEYS: Record<string, string> = {
  'تم الالتقاط مؤخرًا': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.EXPIRY.RECENT_CAPTURE',
  'تحقق حيوي': 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.EXPIRY.BIOMETRIC_CHECK'
};

const OPERATIONS_STABILITY_KEYS: Record<string, string> = {
  'ضغط مرتفع': 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STABILITY.HIGH_LOAD',
  'مستقر': 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STABILITY.STABLE'
};

const OPERATIONS_RULE_KEYS: Record<string, string> = {
  'الحد الأقصى للمهام: 8 مهام لكل سائق': 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.RULES.MAX_TASKS',
  'تغطية نصف قطر 5 كم من مركز المنطقة': 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.RULES.ZONE_RADIUS',
  'إعادة التوزيع تلقائيًا عند تجاوز SLA': 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.RULES.AUTO_REDISTRIBUTION'
};

@Component({
  selector: 'app-driver-detail-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    AppPageHeaderComponent,
    KpiCardsComponent,
    SectionHeaderComponent,
    StatusPillComponent,
    KeyValueGridComponent,
    DetailTabsNavComponent,
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
  @Output() workflowActionRequested = new EventEmitter<DriverWorkflowActionId>();

  constructor(private readonly translate: TranslateService) {}

  get isRTL(): boolean {
    return (this.translate.currentLang || 'ar') === 'ar';
  }

  get direction(): 'rtl' | 'ltr' {
    return this.isRTL ? 'rtl' : 'ltr';
  }

  private translateKey(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  private translateFromMap(value: string | undefined | null, keyMap: Record<string, string>): string {
    if (!value) {
      return '';
    }

    const translationKey = keyMap[value];
    return translationKey ? this.translateKey(translationKey) : value;
  }

  readonly operationsColumns: TableColumn[] = [
    { key: 'id', title: 'DRIVERS.DETAIL.OPERATIONS.TABLE_TASK_ID', width: '14%', align: 'left', type: 'custom' },
    { key: 'vendor', title: 'DRIVERS.DETAIL.OPERATIONS.TABLE_VENDOR', width: '19%', align: 'left', type: 'custom' },
    { key: 'zone', title: 'DRIVERS.DETAIL.OPERATIONS.TABLE_ZONE', width: '18%', align: 'left', type: 'custom' },
    { key: 'status', title: 'DRIVERS.DETAIL.OPERATIONS.TABLE_STATUS', width: '14%', align: 'center', type: 'custom' },
    { key: 'assignedAt', title: 'DRIVERS.DETAIL.OPERATIONS.TABLE_ASSIGNED_AT', width: '15%', align: 'center', type: 'custom' },
    { key: 'duration', title: 'DRIVERS.DETAIL.OPERATIONS.TABLE_DURATION', width: '10%', align: 'center', type: 'custom' },
    { key: 'codAmount', title: 'COD', width: '10%', align: 'center', type: 'custom' }
  ];

  readonly supportColumns: TableColumn[] = [
    { key: 'id', title: 'DRIVERS.DETAIL.SUPPORT.TABLE_TICKET_ID', width: '14%', align: 'left', type: 'custom' },
    { key: 'subject', title: 'DRIVERS.DETAIL.SUPPORT.TABLE_SUBJECT', width: '26%', align: 'left', type: 'custom' },
    { key: 'status', title: 'DRIVERS.DETAIL.SUPPORT.TABLE_STATUS', width: '14%', align: 'center', type: 'custom' },
    { key: 'priority', title: 'DRIVERS.DETAIL.SUPPORT.TABLE_PRIORITY', width: '12%', align: 'center', type: 'custom' },
    { key: 'reviewer', title: 'DRIVERS.DETAIL.SUPPORT.TABLE_REVIEWER', width: '16%', align: 'left', type: 'custom' },
    { key: 'updatedAt', title: 'DRIVERS.DETAIL.SUPPORT.TABLE_UPDATED', width: '12%', align: 'center', type: 'custom' },
    { key: 'open', title: '', width: '6%', align: 'center', type: 'custom' }
  ];

  readonly incidentsColumns: TableColumn[] = [
    { key: 'id', title: 'DRIVERS.DETAIL.COMPLIANCE.TABLE_CASE_ID', width: '14%', align: 'left', type: 'custom' },
    { key: 'type', title: 'DRIVERS.DETAIL.COMPLIANCE.TABLE_TYPE', width: '22%', align: 'left', type: 'custom' },
    { key: 'severity', title: 'DRIVERS.DETAIL.COMPLIANCE.TABLE_SEVERITY', width: '12%', align: 'center', type: 'custom' },
    { key: 'status', title: 'DRIVERS.DETAIL.COMPLIANCE.TABLE_STATUS', width: '14%', align: 'center', type: 'custom' },
    { key: 'reviewer', title: 'DRIVERS.DETAIL.COMPLIANCE.TABLE_REVIEWER', width: '16%', align: 'left', type: 'custom' },
    { key: 'createdAt', title: 'DRIVERS.DETAIL.COMPLIANCE.TABLE_CREATED', width: '14%', align: 'center', type: 'custom' },
    { key: 'open', title: '', width: '8%', align: 'center', type: 'custom' }
  ];

  readonly financeColumns: TableColumn[] = [
    { key: 'reference', title: 'DRIVERS.DETAIL.FINANCE.TABLE_REFERENCE', width: '16%', align: 'left', type: 'custom' },
    { key: 'type', title: 'DRIVERS.DETAIL.FINANCE.TABLE_TYPE', width: '24%', align: 'left', type: 'custom' },
    { key: 'amount', title: 'DRIVERS.DETAIL.FINANCE.TABLE_AMOUNT', width: '14%', align: 'center', type: 'custom' },
    { key: 'status', title: 'DRIVERS.DETAIL.FINANCE.TABLE_STATUS', width: '14%', align: 'center', type: 'custom' },
    { key: 'method', title: 'DRIVERS.DETAIL.FINANCE.TABLE_METHOD', width: '16%', align: 'left', type: 'custom' },
    { key: 'date', title: 'DRIVERS.DETAIL.FINANCE.TABLE_DATE', width: '16%', align: 'center', type: 'custom' }
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
        title: 'DRIVERS.DETAIL.KPI.ACTIVE_TASKS',
        value: activeTasks,
        icon: '<span class="material-symbols-outlined text-[20px]">local_shipping</span>',
        color: '#127c8c'
      },
      {
        id: 'support',
        title: 'DRIVERS.DETAIL.KPI.OPEN_TICKETS',
        value: driver.support.unresolvedCount,
        icon: '<span class="material-symbols-outlined text-[20px]">support_agent</span>',
        color: '#0f766e'
      },
      {
        id: 'compliance',
        title: 'DRIVERS.DETAIL.KPI.COMPLIANCE_CASES',
        value: driver.compliance.openCases,
        icon: '<span class="material-symbols-outlined text-[20px]">gpp_maybe</span>',
        color: '#ef4444'
      },
      {
        id: 'finance',
        title: 'DRIVERS.DETAIL.KPI.DUE_AMOUNT',
        value: `${Math.round(driver.finance.dueAmount).toLocaleString('en-US')} SAR`,
        icon: '<span class="material-symbols-outlined text-[20px]">payments</span>',
        color: '#8f4e00'
      },
      {
        id: 'verification',
        title: 'DRIVERS.DETAIL.KPI.VERIFICATION_PROGRESS',
        value: `${driver.verification.progressPercentage}%`,
        icon: '<span class="material-symbols-outlined text-[20px]">fact_check</span>',
        color: '#2563eb'
      },
      {
        id: 'route-score',
        title: 'DRIVERS.DETAIL.KPI.ROUTE_SCORE',
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
      { label: 'DRIVERS.DETAIL.PROFILE.PHONE', value: driver.phoneNumber, translateLabel: true, translateValue: false, valueDir: 'ltr' },
      { label: 'DRIVERS.DETAIL.PROFILE.EMAIL', value: driver.email, translateLabel: true, translateValue: false, valueDir: 'ltr' },
      { label: 'DRIVERS.DETAIL.PROFILE.CITY', value: driver.city, translateLabel: true, translateValue: false },
      { label: 'DRIVERS.DETAIL.PROFILE.ZONE', value: driver.operations.zoneName, translateLabel: true, translateValue: false },
      { label: 'DRIVERS.DETAIL.PROFILE.VEHICLE', value: driver.vehicleLabel, translateLabel: true, translateValue: false },
      { label: 'DRIVERS.DETAIL.PROFILE.PLATE', value: driver.plateNumber, translateLabel: true, translateValue: false, valueDir: 'ltr' }
    ];
  }

  get accountItems(): KeyValueGridItem[] {
    if (!this.driverDetail) {
      return [];
    }

    const driver = this.driverDetail;

    return [
      { label: 'DRIVERS.DETAIL.ACCOUNT.JOIN_DATE', value: driver.joinedAt, translateLabel: true, translateValue: false, valueDir: 'ltr' },
      { label: 'DRIVERS.DETAIL.ACCOUNT.REVIEWER', value: driver.verification.reviewer, translateLabel: true, translateValue: false },
      { label: 'DRIVERS.DETAIL.ACCOUNT.LAST_SUPPORT_UPDATE', value: driver.support.lastUpdateLabel, translateLabel: true, translateValue: false },
      { label: 'DRIVERS.DETAIL.ACCOUNT.NEXT_PAYOUT', value: driver.finance.nextPayoutDate, translateLabel: true, translateValue: false, valueDir: 'ltr' }
    ];
  }

  get lifecycleTabs(): DriverLifecycleTabDefinition[] {
    if (!this.driverDetail) {
      return [
        { id: 'overview', label: 'DRIVERS.TABS.OVERVIEW', icon: 'dashboard' },
        { id: 'operations', label: 'DRIVERS.TABS.OPERATIONS', icon: 'map' },
        { id: 'performance', label: 'DRIVERS.TABS.PERFORMANCE', icon: 'speed' },
        { id: 'support', label: 'DRIVERS.TABS.SUPPORT', icon: 'support_agent' },
        { id: 'compliance', label: 'DRIVERS.TABS.COMPLIANCE', icon: 'gavel' },
        { id: 'finance', label: 'DRIVERS.TABS.FINANCE', icon: 'payments' },
        { id: 'verification', label: 'DRIVERS.TABS.VERIFICATION', icon: 'verified_user' }
      ];
    }

    const driver = this.driverDetail;

    return [
      { id: 'overview', label: 'DRIVERS.TABS.OVERVIEW', icon: 'dashboard' },
      { id: 'operations', label: 'DRIVERS.TABS.OPERATIONS', icon: 'map', count: driver.operations.taskAssignments.length },
      { id: 'performance', label: 'DRIVERS.TABS.PERFORMANCE', icon: 'speed', count: `${driver.performanceSnapshot.routeScore}%` },
      { id: 'support', label: 'DRIVERS.TABS.SUPPORT', icon: 'support_agent', count: driver.support.unresolvedCount, attention: driver.support.pendingFollowUpsCount > 1 },
      { id: 'compliance', label: 'DRIVERS.TABS.COMPLIANCE', icon: 'gavel', count: driver.compliance.openCases, attention: driver.compliance.criticalCases > 0 },
      { id: 'finance', label: 'DRIVERS.TABS.FINANCE', icon: 'payments', count: `${Math.round(driver.finance.dueAmount)} SAR`, attention: driver.finance.dueAmount > 1400 },
      { id: 'verification', label: 'DRIVERS.TABS.VERIFICATION', icon: 'verified_user', count: `${driver.verification.progressPercentage}%`, attention: driver.verification.progressPercentage < 100 }
    ];
  }

  get navTabs(): DetailTabNavItem[] {
    return this.lifecycleTabs.map((tab) => ({
      id: tab.id,
      labelKey: tab.label,
      icon: tab.icon,
      count: tab.count,
      attention: tab.attention
    }));
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
      return this.translateKey('DRIVERS.DETAIL.PREVIEW.TASK_TITLE', { id: this.selectedTask.id });
    }

    if (this.previewType === 'incident' && this.selectedIncident) {
      return this.translateKey('DRIVERS.DETAIL.PREVIEW.INCIDENT_TITLE', { id: this.selectedIncident.id });
    }

    return '';
  }

  get previewSubtitle(): string {
    if (this.previewType === 'task' && this.selectedTask) {
      return `${this.selectedTask.vendor} • ${this.selectedTask.zone}`;
    }

    if (this.previewType === 'incident' && this.selectedIncident) {
      return `${this.getIncidentTypeLabel(this.selectedIncident.type)} • ${this.selectedIncident.linkedOrder}`;
    }

    return '';
  }

  get previewActions(): PreviewAction[] {
    if (this.previewType === 'task') {
      return [
        {
          id: 'reassign',
          label: 'DRIVERS.DETAIL.PREVIEW.ACTION_REASSIGN',
          icon: '<span class="material-symbols-outlined text-[18px]">swap_horiz</span>',
          variant: 'primary'
        },
        {
          id: 'urgent',
          label: 'DRIVERS.DETAIL.PREVIEW.ACTION_ESCALATE',
          icon: '<span class="material-symbols-outlined text-[18px]">warning</span>',
          variant: 'danger'
        }
      ];
    }

    if (this.previewType === 'incident') {
      return [
        {
          id: 'resolve',
          label: 'DRIVERS.DETAIL.PREVIEW.ACTION_RESOLVE',
          icon: '<span class="material-symbols-outlined text-[18px]">task_alt</span>',
          variant: 'primary'
        },
        {
          id: 'suspend-driver',
          label: 'DRIVERS.DETAIL.PREVIEW.ACTION_SUSPEND',
          icon: '<span class="material-symbols-outlined text-[18px]">block</span>',
          variant: 'danger'
        },
        {
          id: 'request-docs',
          label: 'DRIVERS.DETAIL.PREVIEW.ACTION_REQUEST_DOCS',
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

  onNavTabChange(tabId: string): void {
    this.setTab(tabId as DriverLifecycleTabId);
  }

  addQuickNote(): void {
    this.quickNoteChange.emit(this.quickNote);
    this.quickNoteAdded.emit();
  }

  triggerWorkflowAction(actionId: DriverWorkflowActionId): void {
    this.workflowActionRequested.emit(actionId);
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

  getWorkflowStateLabel(workflow: DriverDetailRecord['workflow']): string {
    return this.translateKey(WORKFLOW_STATE_LABEL_KEYS[workflow.state]);
  }

  getWorkflowSummary(workflow: DriverDetailRecord['workflow']): string {
    return this.translateKey(WORKFLOW_SUMMARY_KEYS[workflow.state]);
  }

  getWorkflowNextStepLabel(workflow: DriverDetailRecord['workflow']): string {
    return this.translateKey(WORKFLOW_NEXT_STEP_KEYS[workflow.state]);
  }

  getWorkflowQueueLabel(workflow: DriverDetailRecord['workflow']): string {
    return this.translateKey(WORKFLOW_QUEUE_LABEL_KEYS[workflow.state]);
  }

  getWorkflowReadinessLabel(workflow: DriverDetailRecord['workflow']): string {
    return this.translateFromMap(workflow.readinessLabel, WORKFLOW_READINESS_LABEL_KEYS);
  }

  getWorkflowOwnerTeamLabel(workflow: DriverDetailRecord['workflow']): string {
    return this.translateFromMap(workflow.ownerTeamLabel, WORKFLOW_OWNER_TEAM_LABEL_KEYS);
  }

  getWorkflowItemLabel(item: string): string {
    const followUpsMatch = item.match(/^هناك\s+(\d+)\s+متابعات دعم معلقة على هذا السائق\.$/);

    if (followUpsMatch) {
      return this.translateKey('DRIVERS.DETAIL.WORKFLOW.ITEMS.SUPPORT_FOLLOWUPS', { count: followUpsMatch[1] });
    }

    return this.translateFromMap(item, WORKFLOW_ITEM_KEYS);
  }

  getWorkflowActionLabel(action: DriverDetailRecord['workflow']['actions'][number]): string {
    return this.translateKey(WORKFLOW_ACTION_LABEL_KEYS[action.id]);
  }

  getWorkflowActionHelper(action: DriverDetailRecord['workflow']['actions'][number]): string {
    return this.translateKey(WORKFLOW_ACTION_HELPER_KEYS[action.id]);
  }

  getTaskStatusVariant(status: DriverTaskAssignment['status']): StatusPillVariant {
    return getTaskPillVariant(status);
  }

  getTaskStatusLabel(status: DriverTaskAssignment['status']): string {
    return this.translateKey(TASK_STATUS_LABEL_KEYS[status]);
  }

  getSupportStatusVariant(status: DriverSupportTicket['status']): StatusPillVariant {
    return getSupportPillVariant(status);
  }

  getSupportStatusLabel(status: DriverSupportTicket['status']): string {
    return this.translateKey(SUPPORT_STATUS_LABEL_KEYS[status]);
  }

  getPriorityVariant(priority: DriverSupportTicket['priority']): StatusPillVariant {
    return getPriorityPillVariant(priority);
  }

  getSupportPriorityLabel(priority: DriverSupportTicket['priority']): string {
    return this.translateKey(SUPPORT_PRIORITY_LABEL_KEYS[priority]);
  }

  getIncidentStatusVariant(status: DriverIncidentRecord['status']): StatusPillVariant {
    return getIncidentStatusPillVariant(status);
  }

  getIncidentStatusLabel(status: DriverIncidentRecord['status']): string {
    return this.translateKey(INCIDENT_STATUS_LABEL_KEYS[status]);
  }

  getIncidentSeverityVariant(severity: DriverIncidentRecord['severity']): StatusPillVariant {
    return getIncidentSeverityPillVariant(severity);
  }

  getIncidentSeverityLabel(severity: DriverIncidentRecord['severity']): string {
    return this.translateKey(INCIDENT_SEVERITY_LABEL_KEYS[severity]);
  }

  getIncidentTypeLabel(type: string): string {
    return this.translateFromMap(type, INCIDENT_TYPE_KEYS);
  }

  getIncidentSummary(summary: string): string {
    return this.translateFromMap(summary, INCIDENT_SUMMARY_KEYS);
  }

  getFinanceStatusVariant(status: DriverFinanceEntry['status']): StatusPillVariant {
    return getFinancePillVariant(status);
  }

  getFinanceStatusLabel(status: DriverFinanceEntry['status']): string {
    return this.translateKey(FINANCE_STATUS_LABEL_KEYS[status]);
  }

  getFinanceTypeLabel(type: string): string {
    return this.translateFromMap(type, FINANCE_TYPE_KEYS);
  }

  getFinanceMethodLabel(method: string): string {
    return this.translateFromMap(method, FINANCE_METHOD_KEYS);
  }

  getDocumentStatusVariant(status: DriverDetailRecord['documents'][number]['status']): StatusPillVariant {
    return getDocumentPillVariant(status);
  }

  getDocumentTitle(title: string): string {
    return this.translateFromMap(title, DOCUMENT_TITLE_KEYS);
  }

  getDocumentStatusLabel(label: string): string {
    return this.translateFromMap(label, DOCUMENT_STATUS_LABEL_KEYS);
  }

  getDocumentSubtitle(subtitle?: string): string {
    return this.translateFromMap(subtitle, DOCUMENT_SUBTITLE_KEYS);
  }

  getDocumentExpiryText(expiry: string): string {
    return this.translateFromMap(expiry, DOCUMENT_EXPIRY_KEYS);
  }

  getDocumentExpiryDirection(expiry: string): 'rtl' | 'ltr' {
    return DOCUMENT_EXPIRY_KEYS[expiry] ? this.direction : 'ltr';
  }

  getVerificationRecommendation(recommendation: string): string {
    return this.translateFromMap(recommendation, VERIFICATION_RECOMMENDATION_KEYS);
  }

  getVerificationReason(reason: string): string {
    return this.translateFromMap(reason, VERIFICATION_REASON_KEYS);
  }

  getChecklistItemLabel(label: string): string {
    return this.translateFromMap(label, VERIFICATION_CHECKLIST_LABEL_KEYS);
  }

  getChecklistItemNote(note?: string): string {
    return this.translateFromMap(note, VERIFICATION_CHECKLIST_NOTE_KEYS);
  }

  getRejectionReasonLabel(reason: string): string {
    return this.translateFromMap(reason, VERIFICATION_REJECTION_REASON_KEYS);
  }

  getSupportTagLabel(label: string): string {
    return this.translateFromMap(label, SUPPORT_TAG_LABEL_KEYS);
  }

  getComplianceRiskLabel(label: string): string {
    return this.translateFromMap(label, COMPLIANCE_RISK_LABEL_KEYS);
  }

  getOperationsStabilityLabel(label: string): string {
    return this.translateFromMap(label, OPERATIONS_STABILITY_KEYS);
  }

  getOperationsRuleLabel(rule: string): string {
    return this.translateFromMap(rule, OPERATIONS_RULE_KEYS);
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

  getWorkflowReadinessVariant(readiness: DriverDetailRecord['workflow']['readiness']): StatusPillVariant {
    const variants: Record<DriverDetailRecord['workflow']['readiness'], StatusPillVariant> = {
      READY: 'success',
      LIMITED: 'warning',
      BLOCKED: 'danger'
    };

    return variants[readiness];
  }

  getWorkflowActionClasses(tone: DriverWorkflowActionTone): string {
    const tones: Record<DriverWorkflowActionTone, string> = {
      primary: 'border-zadna-primary/20 bg-zadna-primary text-white hover:opacity-90 hover:shadow-cyan-100/80',
      success: 'border-emerald-200 bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-100/80',
      warning: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:shadow-amber-100/80',
      danger: 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-red-100/80',
      secondary: 'border-slate-200 bg-white text-slate-700 hover:border-zadna-primary/20 hover:text-zadna-primary hover:shadow-slate-200/80'
    };

    return `inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.8rem] border text-[10px] font-extrabold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${tones[tone]}`;
  }

  getWorkflowActionNoteClasses(tone: DriverWorkflowActionTone): string {
    const tones: Record<DriverWorkflowActionTone, string> = {
      primary: 'border-zadna-primary/15 bg-cyan-50/60',
      success: 'border-emerald-200 bg-emerald-50/70',
      warning: 'border-amber-200 bg-amber-50/70',
      danger: 'border-red-200 bg-red-50/70',
      secondary: 'border-slate-200 bg-white/85'
    };

    return `rounded-[0.95rem] border bg-white/80 px-3.5 py-3 shadow-sm ${tones[tone]}`;
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
    if (item.completed) {
      return this.translateKey('DRIVERS.DETAIL.VERIFICATION.STATUS_COMPLETED');
    }

    if (item.critical) {
      return this.translateKey('DRIVERS.DETAIL.VERIFICATION.STATUS_NEEDS_REVIEW');
    }

    return this.translateKey('DRIVERS.DETAIL.VERIFICATION.STATUS_REQUIRED');
  }

  getChecklistItemStatusVariant(item: DriverVerificationChecklistItem): StatusPillVariant {
    if (item.completed) {
      return 'success';
    }

    return item.critical ? 'warning' : 'neutral';
  }
}
