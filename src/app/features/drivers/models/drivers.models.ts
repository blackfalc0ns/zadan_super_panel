import { Driver, DriverStatus, VerificationStatus } from '@drivers/models/drivers.domain.models';

export type DriverTripStatus = 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
export type DriverDocumentStatus = 'valid' | 'expiring' | 'review' | 'rejected';
export type DriverLifecycleStageState = 'completed' | 'current' | 'upcoming' | 'attention';
export type DriverTaskStatus = 'IN_PROGRESS' | 'PREPARING' | 'WAITING_DRIVER' | 'COMPLETED' | 'FAILED';
export type DriverSupportTicketStatus = 'WAITING' | 'IN_PROGRESS' | 'RESOLVED';
export type DriverSupportTicketPriority = 'NORMAL' | 'HIGH' | 'CRITICAL';
export type DriverIncidentSeverity = 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DriverIncidentStatus = 'NEW' | 'REVIEW' | 'WAITING_DOCS' | 'RESOLVED';
export type DriverFinanceEntryStatus = 'SETTLED' | 'PENDING' | 'FAILED';
export type DriverWorkflowState =
  | 'PENDING_DOCUMENTS'
  | 'VERIFICATION_REVIEW'
  | 'READY_TO_ACTIVATE'
  | 'READY_FOR_DISPATCH'
  | 'ACTIVE_DELIVERY'
  | 'FINANCE_HOLD'
  | 'COMPLIANCE_REVIEW'
  | 'SUSPENDED';
export type DriverWorkflowReadiness = 'READY' | 'LIMITED' | 'BLOCKED';
export type DriverWorkflowActionTone = 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
export type DriverWorkflowTargetTab =
  | 'overview'
  | 'operations'
  | 'performance'
  | 'support'
  | 'compliance'
  | 'finance'
  | 'verification';
export type DriverWorkflowActionId =
  | 'APPROVE_VERIFICATION'
  | 'REQUEST_DOCUMENTS'
  | 'REJECT_VERIFICATION'
  | 'CLEAR_FINANCE_HOLD'
  | 'SUSPEND_DRIVER'
  | 'REACTIVATE_DRIVER'
  | 'MARK_READY_FOR_DISPATCH'
  | 'OPEN_OPERATIONS'
  | 'OPEN_SUPPORT'
  | 'OPEN_FINANCE'
  | 'REVIEW_COMPLIANCE';

export interface DriverRecentTrip {
  id: string;
  time: string;
  category: string;
  status: DriverTripStatus;
  duration: string;
  codAmount: number;
  delayText?: string;
}

export interface DriverInternalNote {
  author: string;
  role: string;
  createdAt: string;
  message: string;
}

export interface DriverDocumentRecord {
  id: string;
  title: string;
  imageUrl?: string;
  secondaryImageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  contentType?: string;
  documentType?: string;
  numberValue?: string;
  status: DriverDocumentStatus;
  statusLabel: string;
  expiryDate: string;
  reviewDecision?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  subtitle?: string;
}

export interface DriverWeeklyEfficiencyPoint {
  label: string;
  driver: number;
  benchmark: number;
}

export interface DriverLifecycleStage {
  id: string;
  label: string;
  description: string;
  state: DriverLifecycleStageState;
  metric: string;
}

export interface DriverWorkflowAction {
  id: DriverWorkflowActionId;
  label: string;
  helper: string;
  icon: string;
  tone: DriverWorkflowActionTone;
  targetTab: DriverWorkflowTargetTab;
}

export interface DriverWorkflowSummary {
  state: DriverWorkflowState;
  stateLabel: string;
  summary: string;
  nextActionLabel: string;
  readiness: DriverWorkflowReadiness;
  readinessLabel: string;
  ownerTeamLabel: string;
  queueLabel: string;
  blockers: string[];
  alerts: string[];
  actions: DriverWorkflowAction[];
}

export interface DriverTaskAssignment {
  id: string;
  vendor: string;
  zone: string;
  status: DriverTaskStatus;
  statusLabel: string;
  assignedAt: string;
  duration: string;
  delayLabel: string;
  codAmount: number;
}

export interface DriverOperationsSnapshot {
  zoneName: string;
  zoneCapacityLabel: string;
  zoneUtilizationPercent: number;
  avgDeliveryTimeLabel: string;
  activeDriversLabel: string;
  stabilityLabel: string;
  locationUpdatesBlocked: boolean;
  locationBlockReason?: string;
  locationBlockedAtLabel?: string;
  lastLocationLabel?: string;
  rules: string[];
  taskAssignments: DriverTaskAssignment[];
}

export interface DriverPerformanceMetricCard {
  id: string;
  title: string;
  value: string;
  helper: string;
  deltaLabel?: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
}

export interface DriverPerformanceBenchmark {
  label: string;
  driverValue: number;
  regionValue: number;
  fleetValue: number;
  unit: string;
  insight: string;
}

export interface DriverInsightGroup {
  title: string;
  icon: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
  items: string[];
}

export interface DriverHeatmapRow {
  label: string;
  cells: number[];
}

export interface DriverPerformanceSnapshot {
  routeScore: number;
  rankInZone?: number | null;
  rankInFleet?: number | null;
  metricCards: DriverPerformanceMetricCard[];
  benchmarks: DriverPerformanceBenchmark[];
  insightGroups: DriverInsightGroup[];
  heatmapRows: DriverHeatmapRow[];
}

export interface DriverSupportTicket {
  id: string;
  subject: string;
  status: DriverSupportTicketStatus;
  statusLabel: string;
  priority: DriverSupportTicketPriority;
  priorityLabel: string;
  reviewer: string;
  updatedAt: string;
  linkedOrder: string;
}

export interface DriverChatMessage {
  direction: 'driver' | 'support';
  message: string;
  time: string;
}

export interface DriverTag {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
}

export interface DriverFollowUp {
  title: string;
  dueLabel: string;
  tone: 'primary' | 'warning' | 'danger';
}

export interface DriverSupportSnapshot {
  openNotesCount: number;
  ticketsCount: number;
  pendingFollowUpsCount: number;
  escalationsCount: number;
  unresolvedCount: number;
  lastUpdateLabel: string;
  reviewerName: string;
  reviewerRole: string;
  reviewerOnline: boolean;
  chatMessages: DriverChatMessage[];
  tickets: DriverSupportTicket[];
  tags: DriverTag[];
  followUps: DriverFollowUp[];
}

export interface DriverIncidentRecord {
  id: string;
  type: string;
  severity: DriverIncidentSeverity;
  severityLabel: string;
  status: DriverIncidentStatus;
  statusLabel: string;
  reviewer: string;
  createdAt: string;
  linkedOrder: string;
  summary: string;
  evidenceImages: string[];
}

export interface DriverComplianceSnapshot {
  openCases: number;
  criticalCases: number;
  safetyAlerts: number;
  expiredDocuments: number;
  suspensions: number;
  riskLabel: string;
  documentHealth: {
    valid: number;
    expiring: number;
    review: number;
  };
  incidents: DriverIncidentRecord[];
}

export interface DriverFinanceEntry {
  id: string;
  reference: string;
  type: string;
  status: DriverFinanceEntryStatus;
  statusLabel: string;
  amount: number;
  fee: number;
  method: string;
  date: string;
}

export interface DriverFinanceSnapshot {
  availableBalance: number;
  dueAmount: number;
  codCollected: number;
  pendingDeductions: number;
  nextPayoutDate: string;
  payoutMethod: string;
  statementPeriod: string;
  entries: DriverFinanceEntry[];
}

export interface DriverVerificationChecklistItem {
  label: string;
  completed: boolean;
  note?: string;
  critical?: boolean;
}

export interface DriverProfileReadinessSnapshot {
  isProfileComplete: boolean;
  completionPercent: number;
  missingRequirements: string[];
  canSubmitForReview: boolean;
  checklist: DriverVerificationChecklistItem[];
}

export interface DriverVerificationSnapshot {
  applicationId: string;
  submittedAt: string;
  reviewer: string;
  trustScore: number;
  progressPercentage: number;
  recommendation: string;
  recommendationReason: string;
  checklist: DriverVerificationChecklistItem[];
  decisionNote: string;
  internalNote: string;
  rejectionReasonOptions: string[];
  allRequiredDocumentsApproved?: boolean;
}

export interface DriverDetailRecord extends Driver {
  displayName: string;
  email: string;
  address?: string;
  joinedAt: string;
  vehicleLabel: string;
  licenseNumber: string;
  nationalIdExpiryDate?: string;
  driverLicenseExpiryDate?: string;
  vehicleLicenseNumber?: string;
  vehicleLicenseExpiryDate?: string;
  zoneName?: string;
  liveZone: string;
  liveLatitude?: number | null;
  liveLongitude?: number | null;
  liveSpeedKmh?: number | null;
  liveMissionId?: string | null;
  todayTrips: number;
  todayTripsDelta: string;
  completionRate: number;
  averageDelayMinutes: number;
  codPendingAmount: number;
  totalEarnings: number;
  currentDueAmount: number;
  codCollectedAmount: number;
  complianceStatusLabel: string;
  complianceStatusVariant: 'success' | 'warning' | 'danger';
  complianceRiskPoints: number;
  complianceRiskThreshold: number;
  complianceAlertThreshold: number;
  routeEfficiencyDelta: string;
  lifetimeTrips: number;
  weeklyEfficiency: DriverWeeklyEfficiencyPoint[];
  profileReadiness: DriverProfileReadinessSnapshot;
  documents: DriverDocumentRecord[];
  notes: DriverInternalNote[];
  recentTrips: DriverRecentTrip[];
  lifecycleStages: DriverLifecycleStage[];
  workflow: DriverWorkflowSummary;
  operations: DriverOperationsSnapshot;
  performanceSnapshot: DriverPerformanceSnapshot;
  support: DriverSupportSnapshot;
  compliance: DriverComplianceSnapshot;
  finance: DriverFinanceSnapshot;
  verification: DriverVerificationSnapshot;
}

export interface DriverProfileInfo {
  phoneNumber: string;
  email: string;
  joinedAt: string;
  vehicleLabel: string;
  licenseNumber: string;
}

export interface DriverStatusSummary {
  status: DriverStatus;
  verificationStatus: VerificationStatus;
  statusLabel: string;
  verificationLabel: string;
  lastSeenLabel: string;
}
