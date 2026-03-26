export type DisputeStatus = 'open' | 'review' | 'merchant' | 'resolved';
export type DisputePriority = 'critical' | 'high' | 'medium' | 'low';
export type RiskLevel = 'high' | 'medium' | 'low';
export type DisputeFilterId = 'all' | 'active' | 'critical' | 'review' | 'merchant' | 'resolved';
export type RejectionReason = 'policy' | 'evidence' | 'delivered' | 'expired' | 'misuse' | 'other';
export type RequestInfoTarget = 'customer' | 'merchant' | 'internal';
export type RequestInfoType = 'invoice' | 'photos' | 'statement' | 'proof';
export type RequestInfoPriority = 'normal' | 'urgent';
export type EscalationTarget = 'finance' | 'legal' | 'risk' | 'operations' | 'support';
export type EscalationPriority = 'medium' | 'high' | 'critical';
export type EscalationReason = 'conflicting_evidence' | 'high_amount' | 'fraud' | 'legal_sensitivity' | 'repeat_issues' | 'other';

export interface TimelineItem {
  titleKey: string;
  timeKey: string;
  tone: 'primary' | 'warning' | 'muted';
}

export interface EvidenceItem {
  type: 'image' | 'pdf';
  label: string;
  preview?: string;
}

export interface DisputeWorkflowContext {
  productName?: string;
  brandName?: string;
  categoryName?: string;
  sku?: string;
}

export interface DisputeRow {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerInitials: string;
  merchantName: string;
  type: string;
  reason: string;
  amount: number;
  status: DisputeStatus;
  priority: DisputePriority;
  owner: string;
  risk: RiskLevel;
  createdAt: string;
  sla: string;
  note: string;
  paymentMask: string;
  customerSummary: string;
  merchantSummary: string;
  evidence: EvidenceItem[];
  timeline: TimelineItem[];
  workflowContext?: DisputeWorkflowContext;
}

export interface RefundDecisionForm {
  refundType: 'full' | 'partial';
  refundAmount: string;
  refundMethod: 'same_method' | 'wallet' | 'manual';
  approvalReason: string;
  costBearer: 'vendor' | 'platform' | 'shared';
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
