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
    brandsCount?: number;
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
    brandNameAr?: string;
    brandNameEn?: string;
    unitOfMeasureId?: string;
    unitNameAr?: string;
    unitNameEn?: string;
    status: 'Draft' | 'Active' | 'Inactive' | 'Discontinued';
    isInVendorStore?: boolean;
    images?: MasterProductImage[];
    createdAtUtc?: string;
    updatedAtUtc?: string;
}

export interface MasterProductImage {
    masterProductId: string;
    imageBankId: string;
    displayOrder: number;
    isPrimary: boolean;
    url?: string;
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
    categoryId?: string | null;
    categoryNameAr?: string;
    categoryNameEn?: string;
    isActive: boolean;
    masterProductsCount?: number;
    createdAtUtc?: string;
    updatedAtUtc?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortDescriptor {
    field: string;
    direction: SortDirection;
    label?: string;
}

export interface CatalogSearchRequest<TFilters> {
    pagination?: {
        pageNumber: number;
        pageSize: number;
    };
    sort?: SortDescriptor;
    search?: string;
    filters?: TFilters;
}

export interface CatalogFacetCount {
    key: string;
    labelAr?: string | null;
    labelEn?: string | null;
    count: number;
}

export interface CatalogSearchResponse<TItem, TFilters, TFacets> {
    items: TItem[];
    totalCount: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    appliedFilters?: TFilters;
    availableSorts?: SortDescriptor[];
    facets?: TFacets;
}

export interface ProductSearchFilters {
    subcategoryIds?: string[];
    brandIds?: string[];
    statuses?: Array<MasterProduct['status']>;
    isActiveBrand?: boolean | null;
    hasBrand?: boolean | null;
}

export interface CategorySearchFilters {
    parentCategoryId?: string | null;
    level?: number | null;
    isActive?: boolean | null;
    hasChildren?: boolean | null;
    createdAtFrom?: string;
    createdAtTo?: string;
}

export interface BrandSearchFilters {
    categoryId?: string | null;
    isActive?: boolean | null;
    hasProducts?: boolean | null;
    createdAtFrom?: string;
    createdAtTo?: string;
}

export interface ProductSearchFacets {
    statuses?: CatalogFacetCount[];
    brands?: CatalogFacetCount[];
    categories?: CatalogFacetCount[];
}

export interface CategorySearchFacets {
    levels?: CatalogFacetCount[];
    activeCount?: number;
    inactiveCount?: number;
    withChildrenCount?: number;
}

export interface BrandSearchFacets {
    activeCount?: number;
    inactiveCount?: number;
    withProductsCount?: number;
}


export type CatalogRequestType = 'product' | 'brand' | 'category';
export type ProductRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ProductRequest {
    id: string;
    requestType: CatalogRequestType;
    suggestedNameAr: string;
    suggestedNameEn: string;
    suggestedCategoryId?: string | null;
    suggestedBrandId?: string;
    suggestedBrandName?: string;
    suggestedBrandNameEn?: string;
    suggestedDescriptionAr?: string;
    suggestedDescriptionEn?: string;
    imageUrl?: string;
    parentCategoryNameAr?: string;
    parentCategoryNameEn?: string;
    displayOrder?: number | null;
    unitNameAr?: string;
    unitNameEn?: string;
    status: ProductRequestStatus;
    isInVendorStore?: boolean;
    adminNotes?: string;
    reviewedBy?: string;
    reviewedAtUtc?: string;
    vendorId: string;
    vendorName?: string;
    createdAtUtc: string;
    
    // UI Helpers
    categoryPathAr?: string;
    categoryPathEn?: string;
}
