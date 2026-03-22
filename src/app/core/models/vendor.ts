export interface Vendor {
    id: string;
    businessNameAr: string;
    businessNameEn: string;
    businessType: string;
    status: string;
    ownerName: string;
    contactPhone: string;
    createdAtUtc: string;
    contactEmail: string;
    commissionRate: number | null;
    // Extended fields for operational features
    city?: string;
    region?: string;
    onboardingStage?: OnboardingStage;
    verificationStatus?: VerificationStatus;
    documentsStatus?: DocumentsStatus;
    riskLevel?: RiskLevel;
    payoutStatus?: PayoutStatus;
    lastActiveAtUtc?: string;
    performanceRating?: number;
    documentsCompleteness?: number; // 0-100
    hasKYC?: boolean;
    hasPendingCompliance?: boolean;
    hasFraudFlag?: boolean;
    complaintsCount?: number;
    isLowPerformance?: boolean;
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

export interface PaginatedVendors {
    items: Vendor[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface VendorDetail {
    id: string;
    businessNameAr: string;
    businessNameEn: string;
    businessType: string;
    commercialRegistrationNumber: string;
    taxId: string | null;
    contactEmail: string;
    contactPhone: string;
    commissionRate: number | null;
    status: string;
    rejectionReason: string | null;
    logoUrl: string | null;
    commercialRegisterDocumentUrl: string | null;
    approvedAtUtc: string | null;
    approvedBy: string | null;
    createdAtUtc: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    branchesCount: number;
    bankAccountsCount: number;
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
