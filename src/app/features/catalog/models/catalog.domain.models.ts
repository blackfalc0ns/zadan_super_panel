export interface Category {
    id: string;
    nameAr: string;
    nameEn: string;
    imageUrl?: string;
    parentCategoryId?: string | null;
    displayOrder: number;
    isActive: boolean;
    parentNameAr?: string;
    parentNameEn?: string;
    createdAtUtc?: string;
    updatedAtUtc?: string;
    masterProductsCount?: number;
    level?: number;
    subCategories?: Category[];
}

export interface MasterProduct {
    id: string;
    nameAr: string;
    nameEn: string;
    descriptionAr?: string;
    descriptionEn?: string;
    barcode?: string;
    categoryId: string;
    brandId?: string;
    unitOfMeasureId?: string;
    status: 'Draft' | 'Active' | 'Inactive' | 'Discontinued';
    images?: MasterProductImage[];
}

export interface MasterProductImage {
    masterProductId: string;
    imageBankId: string;
    displayOrder: number;
    isPrimary: boolean;
    url?: string; // Appended for UI convenience if joined from ImageBank
}

export interface ImageBankAsset {
    id: string;
    url: string;
    altText?: string;
    tags?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    uploadedByVendorId?: string;
    rejectionReason?: string;
}

export interface Brand {
    id: string;
    nameAr: string;
    nameEn: string;
    logoUrl?: string;
    isActive: boolean;
    masterProductsCount?: number;
    createdAtUtc?: string;
    updatedAtUtc?: string;
}

