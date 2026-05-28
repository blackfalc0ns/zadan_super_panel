export type SupportCaseWorkflowStatus = 'submitted' | 'in_review' | 'awaiting_customer_evidence' | 'approved' | 'rejected' | 'resolved';
export type SupportCaseType = 'complaint' | 'return_request' | 'driver_report' | 'driver_dispute' | 'driver_account';
export type SupportCaseActorRole = 'customer' | 'vendor' | 'driver' | 'admin';

export type DisputeStatus = 'open' | 'review' | 'merchant' | 'resolved'; // legacy
export type DisputePriority = 'critical' | 'high' | 'medium' | 'low';
export type RiskLevel = 'high' | 'medium' | 'low';
export type RejectionReason = 'policy' | 'evidence' | 'delivered' | 'expired' | 'misuse' | 'other';
export type RequestInfoTarget = 'customer' | 'vendor' | 'driver';
export type RequestInfoType = 'invoice' | 'photos' | 'statement' | 'proof';
export type RequestInfoPriority = 'normal' | 'urgent';
export type EscalationTarget = 'finance' | 'legal' | 'risk' | 'operations' | 'support' | 'driverops';
export type EscalationPriority = 'medium' | 'high' | 'critical';
export type EscalationReason = 'conflicting_evidence' | 'high_amount' | 'fraud' | 'legal_sensitivity' | 'repeat_issues' | 'other';
export type SupportCaseModalKey = 'approval' | 'escalation' | 'rejection' | 'request_info';
export type SupportCaseQuickActionType = 'approve_complaint' | 'resolve' | 'reopen' | 'add_note' | 'send_message';


export interface TimelineItem {
  title: string;
  time: string;
  tone: 'primary' | 'warning' | 'muted';
}

export interface SupportCaseMessage {
  id: string;
  action: string;
  messageType: string;
  messageTypeLabel?: string | null;
  title: string;
  localizedTitle?: string | null;
  body: string | null;
  localizedBody?: string | null;
  authorRole: string;
  authorRoleLabel?: string | null;
  visibleTo: string[];
  isInternalOnly: boolean;
  createdAt: string;
}

export interface SupportCaseParticipant {
  role: string;
  roleLabel?: string | null;
  isInitiator: boolean;
  isAwaitingResponse: boolean;
  hasMessages: boolean;
}

export interface EvidenceItem {
  type: 'image' | 'pdf';
  label: string;
  preview?: string;
  fileUrl?: string;
}

export interface DisputeWorkflowContext {
  productName?: string;
  brandName?: string;
  categoryName?: string;
  sku?: string;
}

export interface SupportCaseRow {
  id: string;
  orderId: string | null;
  orderDisplayId: string;
  customerName: string;
  customerEmail: string;
  customerInitials: string;
  merchantName: string;
  type: SupportCaseType | string;
  typeLabel?: string | null;
  reason: string;
  amount: number;
  caseStatus: SupportCaseWorkflowStatus;
  caseStatusLabel?: string | null;
  status: DisputeStatus; // fallback for legacy
  statusLabel?: string | null;
  priority: DisputePriority;
  priorityLabel?: string | null;
  owner: string;
  queue: string;
  queueLabel?: string | null;
  risk: RiskLevel;
  createdAt: string;
  sla: string;
  note: string;
  paymentMethod: 'cash' | 'card' | 'bank' | 'wallet' | 'apple_pay' | 'mada' | string;
  paymentMask: string;
  customerSummary: string;
  merchantSummary: string;
  compensationType?: 'cash_refund' | 'coupon_compensation' | string | null;
  settlementStatus?: 'pending_review' | 'cash_refunded' | 'coupon_issued' | 'coupon_redeemed' | 'rejected' | 'approved' | string | null;
  vendorRecoveryStatus?: 'pending' | 'partial' | 'recovered' | string | null;
  vendorRecoveredAmount?: number;
  vendorOutstandingAmount?: number;
  couponCode?: string | null;
  couponExpiresAtUtc?: string | null;
  couponRedeemed?: boolean;
  evidence: EvidenceItem[];
  timeline: TimelineItem[];
  workflowContext?: DisputeWorkflowContext;
  initiatorRole: string;
  initiatorRoleLabel?: string | null;
  waitingOnRole?: string;
  waitingOnRoleLabel?: string | null;
  participants?: SupportCaseParticipant[];
  allowedActions?: string[];
  messages?: SupportCaseMessage[];
  vendorResponse?: string;
  driverResponse?: string;
}

export interface RefundDecisionForm {
  refundType: 'full' | 'partial';
  refundAmount: string;
  refundMethod: 'same_method' | 'coupon';
  approvalReason: string;
  costBearer: 'vendor' | 'platform' | 'shared' | 'driver';
  internalNotes: string;
  customerMessage: string;
  notifyCustomer: boolean;
  notifyFinance: boolean;
}

export interface RejectionDecisionForm {
  reason: RejectionReason;
  additionalExplanation: string;
  customerMessage: string;
  internalNotes: string;
  notifyEmail: boolean;
  notifySms: boolean;
}

export interface RequestInfoForm {
  target: RequestInfoTarget;
  infoType: RequestInfoType;
  title: string;
  details: string;
  dueDate: string;
  priority: RequestInfoPriority;
  pauseSla: boolean;
  alertSupervisor: boolean;
  internalNotes: string;
}

export interface EscalationDecisionForm {
  target: EscalationTarget;
  priority: EscalationPriority;
  reason: EscalationReason;
  detailedExplanation: string;
  reviewedSummary: string;
  requestedAction: string;
  responseDeadline: string;
  notifyEscalatedTeam: boolean;
  notifyCurrentReviewer: boolean;
  addTrackingNote: boolean;
  markHighRisk: boolean;
}

export interface SupportCaseModalState {
  activeModal: SupportCaseModalKey | null;
  isDetailsDrawerOpen: boolean;
}

export interface SupportCaseFormDrafts {
  approval: RefundDecisionForm | null;
  escalation: EscalationDecisionForm | null;
  rejection: RejectionDecisionForm | null;
  requestInfo: RequestInfoForm | null;
}

export function createEmptySupportCaseModalState(): SupportCaseModalState {
  return {
    activeModal: null,
    isDetailsDrawerOpen: false
  };
}

export function createEmptySupportCaseFormDrafts(): SupportCaseFormDrafts {
  return {
    approval: null,
    escalation: null,
    rejection: null,
    requestInfo: null
  };
}

export function createDefaultSupportCaseRefundDecisionForm(
  supportCase: Pick<SupportCaseRow, 'amount' | 'paymentMethod'>,
  defaultApprovalReason: string,
  defaultCustomerMessage: string
): RefundDecisionForm {
  const refundMethod: RefundDecisionForm['refundMethod'] = supportCase.paymentMethod === 'cash' ? 'coupon' : 'same_method';
  const refundType: RefundDecisionForm['refundType'] = supportCase.amount > 450 ? 'partial' : 'full';

  return {
    refundType,
    refundAmount: Math.min(supportCase.amount, 450).toFixed(2),
    refundMethod,
    approvalReason: defaultApprovalReason,
    costBearer: 'shared',
    internalNotes: '',
    customerMessage: defaultCustomerMessage,
    notifyCustomer: true,
    notifyFinance: true
  };
}

export function createDefaultSupportCaseEscalationDecisionForm(
  supportCase: Pick<SupportCaseRow, 'amount' | 'priority' | 'risk' | 'reason' | 'note' | 'caseStatus'>,
  defaultAction: string,
  deadlineIsoLocal: string
): EscalationDecisionForm {
  return {
    target: supportCase.amount >= 3000 ? 'finance' : supportCase.risk === 'high' ? 'risk' : 'operations',
    priority: supportCase.priority === 'critical' ? 'critical' : supportCase.priority === 'high' ? 'high' : 'medium',
    reason: supportCase.amount >= 3000
      ? 'high_amount'
      : supportCase.risk === 'high'
        ? 'fraud'
        : supportCase.caseStatus === 'awaiting_customer_evidence'
          ? 'conflicting_evidence'
          : 'conflicting_evidence',
    detailedExplanation: supportCase.reason,
    reviewedSummary: supportCase.note,
    requestedAction: defaultAction,
    responseDeadline: deadlineIsoLocal,
    notifyEscalatedTeam: true,
    notifyCurrentReviewer: true,
    addTrackingNote: false,
    markHighRisk: supportCase.risk === 'high'
  };
}

export function resolveSupportCaseRequestInfoTargets(
  supportCase: Pick<SupportCaseRow, 'waitingOnRole' | 'participants'>
): RequestInfoTarget[] {
  const roles = new Set<RequestInfoTarget>();

  const waitingOnRole = normalizeRoleToken(supportCase.waitingOnRole);
  if (waitingOnRole === 'vendor' || waitingOnRole === 'driver' || waitingOnRole === 'customer') {
    roles.add(waitingOnRole);
  }

  for (const participant of supportCase.participants ?? []) {
    const role = normalizeRoleToken(participant.role);
    if (role === 'vendor' || role === 'driver' || role === 'customer') {
      roles.add(role);
    }
  }

  if (roles.size === 0) {
    roles.add('customer');
    roles.add('vendor');
  }

  return Array.from(roles);
}

export function createDefaultSupportCaseRequestInfoForm(
  supportCase: Pick<SupportCaseRow, 'waitingOnRole' | 'participants'>,
  dueDate: string
): RequestInfoForm {
  const targets = resolveSupportCaseRequestInfoTargets(supportCase);
  return {
    target: targets[0] ?? 'customer',
    infoType: 'invoice',
    title: '',
    details: '',
    dueDate,
    priority: 'urgent',
    pauseSla: false,
    alertSupervisor: false,
    internalNotes: ''
  };
}

function normalizeRoleToken(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

export interface SupportCaseQuickActionModalConfig {
  type: SupportCaseQuickActionType;
  title: string;
  subtitle: string;
  icon: string;
  confirmLabel: string;
  confirmClass: string;
  primaryLabel?: string;
  primaryPlaceholder?: string;
  primaryRequired?: boolean;
  secondaryLabel?: string;
  secondaryPlaceholder?: string;
  secondaryRequired?: boolean;
}

export interface SupportCaseQuickActionFormValue {
  primaryValue: string;
  secondaryValue: string;
}

export function createEmptySupportCaseQuickActionFormValue(): SupportCaseQuickActionFormValue {
  return {
    primaryValue: '',
    secondaryValue: ''
  };
}

export interface AdminCaseCountByLabel {
  label: string;
  count: number;
}

export interface AdminOrderCaseStatsResponse {
  totalOpen: number;
  slaBreachedCount: number;
  avgResolutionHours: number;
  byStatus: AdminCaseCountByLabel[];
  byPriority: AdminCaseCountByLabel[];
  byQueue: AdminCaseCountByLabel[];
  byType: AdminCaseCountByLabel[];
}

