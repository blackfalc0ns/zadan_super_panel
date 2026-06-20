export type CustomerSegment = 'vip' | 'business' | 'new' | 'watchlist' | 'dormant';
export type CustomerStatus = 'active' | 'low_activity' | 'restricted' | 'dormant';
export type CustomerRisk = 'low' | 'medium' | 'high' | 'critical';
export type CustomerSpendRange = 'all' | 'lt_1000' | '1000_5000' | 'gt_5000';
export type CustomerAccountState = 'active' | 'under_review' | 'restricted' | 'suspended' | 'dormant';
export type CustomerTrustState = 'clear' | 'watch' | 'blocked';
export type CustomerPaymentState = 'healthy' | 'monitoring' | 'blocked';
export type CustomerEngagementState = 'new' | 'growing' | 'loyal' | 'at_risk' | 'dormant';
export type CustomerReviewState = 'none' | 'flagged' | 'escalated';
export type CustomerWorkflowState = 'healthy' | 'monitoring' | 'retention' | 'under_review' | 'suspended';
export type CustomerWorkflowActionId =
  | 'open_orders'
  | 'open_support'
  | 'flag_review'
  | 'escalate_review'
  | 'clear_review'
  | 'suspend_account'
  | 'reactivate_account';
export type CustomerWorkflowActionTone = 'neutral' | 'primary' | 'warning' | 'danger' | 'success';
export type CustomerLifecycleTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  cityCode?: string;
  cityAr?: string;
  cityEn?: string;
  isOnlineNow?: boolean;
  segment: CustomerSegment;
  status: CustomerStatus;
  risk: CustomerRisk;
  totalOrders: number;
  totalSpent: number;
  averageBasket: number;
  lifetimeValue: number;
  refundsCount: number;
  disputesCount: number;
  activeDays30: number;
  lastOrderAt: string;
  lastOrderValue: number;
  joinedAt: string;
  loyaltyScore: number;
  preferredChannel: string;
  watchFlags: string[];
  notes: string;
  preferredLanguage?: 'ar' | 'en';
}

export interface CustomerRecentOrder {
  id: string;
  displayId: string;
  date: string;
  total: number;
  status: 'DELIVERED' | 'REFUNDED' | 'PROCESSING';
}

export interface CustomerInternalNote {
  author?: string;
  authorKey?: string;
  role?: string;
  roleKey?: string;
  createdAt: string;
  message?: string;
  messageKey?: string;
  tone?: CustomerLifecycleTone;
  isSystem?: boolean;
}

export interface CustomerWorkflowAction {
  id: CustomerWorkflowActionId;
  labelKey: string;
  helperKey: string;
  tone: CustomerWorkflowActionTone;
  icon: string;
}

export interface CustomerWorkflowSummary {
  state: CustomerWorkflowState;
  ownerTeamLabelKey: string;
  queueLabelKey: string;
  summaryKey: string;
  nextStepKey: string;
  blockers: string[];
  alerts: string[];
  actions: CustomerWorkflowAction[];
}

export interface CustomerLifecycleStage {
  id: 'account' | 'trust' | 'payments' | 'engagement';
  labelKey: string;
  valueKey: string;
  hintKey: string;
  tone: CustomerLifecycleTone;
}

export interface CustomerDetailRecord extends CustomerRecord {
  registrationDate: string;
  riskScore: number;
  riskSummary: string;
  lastSeenAt: string;
  lastSeenAtUtc?: string | null;
  preferredLanguageLabel: string;
  isVerified: boolean;
  suspiciousLoginAttempts: string;
  repeatedPaymentFailureRate: string;
  complaintRateLabel: string;
  analysisSummary: string;
  refundsClosedCount: number;
  refundsInProgressCount: number;
  refundsTotalAmount: number;
  complaintsSolvedCount: number;
  lastSupportContact: string;
  accountTeam: string;
  accountManager: string;
  accountState: CustomerAccountState;
  trustState: CustomerTrustState;
  paymentState: CustomerPaymentState;
  engagementState: CustomerEngagementState;
  reviewState: CustomerReviewState;
  workflow: CustomerWorkflowSummary;
  lifecycle: CustomerLifecycleStage[];
  recentOrders: CustomerRecentOrder[];
  internalNotes: CustomerInternalNote[];
}
