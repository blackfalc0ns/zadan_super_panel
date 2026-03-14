export interface Vendor {
    id: string;
    userId: string;
    businessNameAr: string;
    businessNameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    contactEmail: string;
    contactPhone: string;
    commercialRecord: string | null;
    taxNumber: string | null;
    status: VendorStatus;
    isActive: boolean;
    commissionRate: number;
}

export enum VendorStatus {
    Pending = 'Pending',
    Active = 'Active',
    Rejected = 'Rejected',
    Suspended = 'Suspended'
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
