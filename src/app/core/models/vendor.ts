export interface Vendor {
  id: string;
  businessNameAr: string;
  businessNameEn: string;
  businessType: string;
  status: VendorStatus;
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

export interface VendorReviewDocument {
  id: string;
  type: 'identity' | 'commercial' | 'tax' | 'bank' | 'license';
  titleKey: string;
  descriptionKey: string;
  icon: string;
  status: VendorReviewDocumentStatus;
  statusLabelKey: string;
  iconBgClass: string;
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
  taxId: string | null;
  rejectionReason: string | null;
  logoUrl: string | null;
  commercialRegisterDocumentUrl: string | null;
  approvedAtUtc: string | null;
  approvedBy: string | null;
  ownerEmail: string;
  ownerPhone: string;
  branchesCount: number;
  bankAccountsCount: number;
  reviewStartedAtUtc: string | null;
  reviewCompletedAtUtc: string | null;
  requestedChangesAtUtc: string | null;
  reviewDecisionReason: string | null;
  reviewDocuments: VendorReviewDocument[];
  reviewNotes: VendorReviewNote[];
  riskIndicators: VendorRiskIndicator[];
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
