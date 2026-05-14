export interface Vendor {
  id: string;
  businessNameAr: string;
  businessNameEn: string;
  businessType: string;
  status: VendorStatus;
  accountStatus?: string;
  isLoginLocked?: boolean;
  lockedAtUtc?: string | null;
  archivedAtUtc?: string | null;
  suspendedAtUtc?: string | null;
  suspensionReason?: string | null;
  lockReason?: string | null;
  archiveReason?: string | null;
  ownerName: string;
  contactPhone: string;
  createdAtUtc: string;
  contactEmail: string;
  commissionRate: number | null;
  city?: string;
  region?: string;
  onboardingStage?: OnboardingStage;
  verificationStatus?: VerificationStatus;
  documentsStatus?: DocumentsStatus;
  riskLevel?: RiskLevel;
  payoutStatus?: PayoutStatus;
  lastActiveAtUtc?: string;
  performanceRating?: number;
  documentsCompleteness?: number;
  hasKYC?: boolean;
  hasPendingCompliance?: boolean;
  hasFraudFlag?: boolean;
  complaintsCount?: number;
  isLowPerformance?: boolean;
  reviewState?: VendorReviewState;
  assignedReviewer?: string | null;
  reviewSubmittedAtUtc?: string | null;
  reviewUpdatedAtUtc?: string | null;
}

export enum VendorStatus {
  Pending = 'Pending',
  Active = 'Active',
  Rejected = 'Rejected',
  Suspended = 'Suspended'
}

export enum OnboardingStage {
  New = 'New',
  DocumentsPending = 'DocumentsPending',
  UnderReview = 'UnderReview',
  Approved = 'Approved'
}

export enum VerificationStatus {
  Verified = 'Verified',
  Unverified = 'Unverified',
  Pending = 'Pending'
}

export enum DocumentsStatus {
  Complete = 'Complete',
  Incomplete = 'Incomplete',
  Missing = 'Missing'
}

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum PayoutStatus {
  Active = 'Active',
  Blocked = 'Blocked',
  Pending = 'Pending'
}

export type VendorReviewState =
  | 'awaiting_submission'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'verified'
  | 'rejected'
  | 'suspended';

export type VendorReviewDocumentStatus = 'completed' | 'pending' | 'missing';
export type VendorReviewDecision = 'pending' | 'approved' | 'rejected';
export type VendorDocumentPreviewKind = 'pdf' | 'image' | 'structured' | 'unavailable';

export interface VendorReviewDocument {
  id: string;
  type: 'identity' | 'commercial' | 'tax' | 'bank' | 'license';
  titleKey: string;
  descriptionKey: string;
  icon: string;
  status: VendorReviewDocumentStatus;
  statusLabelKey: string;
  iconBgClass: string;
  isRequired: boolean;
  isUploaded: boolean;
  previewKind: VendorDocumentPreviewKind;
  fileUrl?: string | null;
  reviewDecision: VendorReviewDecision;
  rejectionReason?: string | null;
  reviewedAtUtc?: string | null;
  reviewedBy?: string | null;
}

export interface VendorRiskIndicator {
  id: string;
  titleKey: string;
  descriptionKey: string;
  severity: 'high' | 'medium' | 'low';
  severityLabelKey: string;
  icon: string;
}

export interface VendorReviewNote {
  id: string;
  authorName: string;
  roleLabel: string;
  createdAtUtc: string;
  message?: string;
  messageKey?: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
  isSystem?: boolean;
}

export type VendorProfileReviewItemStatus = 'approved' | 'submitted' | 'changes_requested' | 'pending_vendor';
export type VendorProfileReviewTargetType = 'field' | 'document';

export interface VendorProfileReviewItem {
  code: string;
  status: VendorProfileReviewItemStatus;
  targetType: VendorProfileReviewTargetType;
  step: number;
  reviewerId?: string | null;
  reviewerName?: string | null;
  decisionNote?: string | null;
  lastSubmittedAtUtc?: string | null;
  reviewedAtUtc?: string | null;
}

export interface VendorRequiredAction {
  code: string;
  message: string;
}

export type VendorActivitySeverity = 'info' | 'success' | 'warning' | 'danger';

export interface VendorActivityLogEntry {
  id: string;
  type: string;
  severity: VendorActivitySeverity;
  actorName: string;
  roleLabel: string;
  createdAtUtc: string;
  message: string;
  isSystem: boolean;
}

export interface VendorActivityLogPage {
  items: VendorActivityLogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface VendorActivityLogFilters {
  type?: string | null;
  severity?: VendorActivitySeverity | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  page?: number;
  pageSize?: number;
}

export interface PaginatedVendors {
  items: Vendor[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface VendorDetail extends Vendor {
  commercialRegistrationNumber: string;
  commercialRegistrationExpiryDate?: string | null;
  taxId: string | null;
  licenseNumber?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  nationalAddress?: string | null;
  idNumber?: string | null;
  nationality?: string | null;
  payoutCycle?: string | null;
  financialLifecycleMode?: string | null;
  rejectionReason: string | null;
  logoUrl: string | null;
  commercialRegisterDocumentUrl: string | null;
  taxDocumentUrl?: string | null;
  licenseDocumentUrl?: string | null;
  approvedAtUtc: string | null;
  approvedBy: string | null;
  updatedAtUtc?: string | null;
  ownerEmail: string;
  ownerPhone: string;
  operationsSettings?: VendorOperationsSettings | null;
  notificationSettings?: VendorNotificationSettings | null;
  operatingHours?: VendorOperatingHour[];
  primaryBankAccount?: VendorBankAccount | null;
  primaryBranchLatitude?: number | null;
  primaryBranchLongitude?: number | null;
  branchesCount: number;
  bankAccountsCount: number;
  reviewStartedAtUtc: string | null;
  reviewCompletedAtUtc: string | null;
  requestedChangesAtUtc: string | null;
  reviewDecisionReason: string | null;
  readyForFinalApproval?: boolean;
  reviewItems: VendorProfileReviewItem[];
  requiredActions: VendorRequiredAction[];
  reviewDocuments: VendorReviewDocument[];
  reviewNotes: VendorReviewNote[];
  riskIndicators: VendorRiskIndicator[];
}

export type VendorFinancialLifecycleMode =
  | 'per_order_direct_payout'
  | 'weekly'
  | 'biweekly'
  | 'monthly';

export interface VendorBankAccount {
  id: string;
  bankName: string;
  accountHolderName: string;
  iban: string;
  swiftCode?: string | null;
  isPrimary: boolean;
  status: string;
  rejectionReason?: string | null;
  verifiedAtUtc?: string | null;
}

export interface VendorOperatingHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface VendorOperationsSettings {
  acceptOrders: boolean;
  minimumOrderAmount?: number | null;
  preparationTimeMinutes?: number | null;
}

export interface VendorNotificationSettings {
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  newOrdersNotificationsEnabled: boolean;
}

export interface VendorKPIs {
  pendingApproval: number;
  missingDocuments: number;
  highRisk: number;
  payoutBlocked: number;
  suspended: number;
}

export interface VendorFilters {
  searchTerm?: string;
  status?: VendorStatus;
  city?: string;
  region?: string;
  onboardingStage?: OnboardingStage;
  verificationStatus?: VerificationStatus;
  documentsStatus?: DocumentsStatus;
  riskLevel?: RiskLevel;
  payoutStatus?: PayoutStatus;
  reviewState?: VendorReviewState;
  createdFrom?: string;
  createdTo?: string;
  lastActiveDays?: number;
  minRating?: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: VendorFilters;
}
