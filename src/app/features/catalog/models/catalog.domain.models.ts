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
    activityNameAr?: string;
    activityNameEn?: string;
    level?: number;
    subCategories?: Category[];
}

export interface MasterProduct {
    id: string;
    nameAr: string;
    nameEn: string;
    slug?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    barcode?: string;
    categoryId: string;
    categoryNameAr?: string;
    categoryNameEn?: string;
    brandId?: string;
    brandNameAr?: string;
    brandNameEn?: string;
    unitOfMeasureId?: string;
    unitNameAr?: string;
    unitNameEn?: string;
    packageTypeId?: string | null;
    packageTypeNameAr?: string;
    packageTypeNameEn?: string;
    measurementValue?: number | null;
    measurementUnitId?: string | null;
    measurementUnitNameAr?: string;
    measurementUnitNameEn?: string;
    variantGroupId?: string;
    displaySizeAr?: string;
    displaySizeEn?: string;
    status: 'Draft' | 'Active' | 'Inactive' | 'Discontinued';
    isInVendorStore?: boolean;
    images?: MasterProductImage[];
    variants?: MasterProductVariantOption[];
    createdAtUtc?: string;
    updatedAtUtc?: string;
}

export interface MasterProductVariantOption {
    id: string;
    defaultVendorProductId?: string | null;
    nameAr: string;
    nameEn: string;
    displaySizeAr?: string;
    displaySizeEn?: string;
    isCurrent: boolean;
    imageUrl?: string;
    images?: string[];
    barcode?: string;
    slug?: string;
    packageTypeNameAr?: string;
    packageTypeNameEn?: string;
    measurementValue?: number | null;
    measurementUnitNameAr?: string;
    measurementUnitNameEn?: string;
    unit?: string;
    price?: number | null;
    oldPrice?: number | null;
    isDiscounted?: boolean;
}

export interface MasterProductImage {
    masterProductId: string;
    imageBankId: string;
    displayOrder: number;
    isPrimary: boolean;
    url?: string;
}

export interface CatalogUnit {
    id: string;
    nameAr: string;
    nameEn: string;
    kind?: 'Packaging' | 'Measurement';
    isActive?: boolean;
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
    coverImageUrl?: string;
    categoryId?: string | null;
    categoryIds?: string[];
    categories?: Array<{
        categoryId: string;
        categoryNameAr?: string | null;
        categoryNameEn?: string | null;
    }>;
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
    packageTypeId?: string | null;
    measurementUnitId?: string | null;
    measurementValue?: number | null;
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

export interface BulkMasterProductDraft {
    rowId: string;
    nameAr: string;
    nameEn: string;
    slug?: string | null;
    barcode?: string | null;
    categoryId?: string | null;
    brandId?: string | null;
    unitId?: string | null;
    packageTypeId?: string | null;
    measurementValue?: number | null;
    measurementUnitId?: string | null;
    variantGroupId?: string | null;
    status: MasterProduct['status'];
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    images?: Array<{
        url: string;
        altText?: string | null;
        displayOrder: number;
        isPrimary: boolean;
    }> | null;
    selected?: boolean;
}

export interface BulkBrandDraft {
    rowId: string;
    nameAr: string;
    nameEn: string;
    categoryId?: string | null;
    categoryIds?: string[];
    logoUrl?: string | null;
    coverImageUrl?: string | null;
    isActive: boolean;
    selected?: boolean;
}

export interface BulkBrandRowResult {
    rowId: string;
    status: 'Succeeded' | 'Failed' | 'Pending';
    brandId?: string | null;
    errorMessage?: string | null;
}

export interface AdminBrandBulkOperation {
    id: string;
    idempotencyKey: string;
    status: 'Pending' | 'Processing' | 'Completed' | 'CompletedWithErrors' | 'Failed';
    totalRows: number;
    processedRows: number;
    succeededRows: number;
    failedRows: number;
    errorMessage?: string | null;
    createdAtUtc: string;
    startedAtUtc?: string | null;
    completedAtUtc?: string | null;
}

export interface AdminBrandBulkOperationItem {
    id: string;
    rowNumber: number;
    nameAr: string;
    nameEn: string;
    logoUrl?: string | null;
    coverImageUrl?: string | null;
    categoryId: string;
    categoryIds?: string[];
    isActive: boolean;
    status: 'Pending' | 'Succeeded' | 'Failed' | 'Skipped';
    errorMessage?: string | null;
    createdBrandId?: string | null;
}

export interface AdminMasterProductBulkOperation {
    id: string;
    idempotencyKey: string;
    status: 'Pending' | 'Processing' | 'Completed' | 'CompletedWithErrors' | 'Failed';
    totalRows: number;
    processedRows: number;
    succeededRows: number;
    failedRows: number;
    errorMessage?: string | null;
    createdAtUtc: string;
    startedAtUtc?: string | null;
    completedAtUtc?: string | null;
}

export interface AdminMasterProductBulkOperationItem {
    id: string;
    rowNumber: number;
    nameAr: string;
    nameEn: string;
    slug: string;
    barcode?: string | null;
    categoryId: string;
    brandId?: string | null;
    unitId?: string | null;
    packageTypeId?: string | null;
    measurementValue?: number | null;
    measurementUnitId?: string | null;
    variantGroupId?: string | null;
    statusValue: MasterProduct['status'];
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    status: 'Pending' | 'Succeeded' | 'Failed' | 'Skipped';
    errorMessage?: string | null;
    createdMasterProductId?: string | null;
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
export type CategoryRequestKind = 'category' | 'sub_category';

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
    requestKind?: CategoryRequestKind;
    requestedLevelKey?: string;
    requestedPathAr?: string;
    requestedPathEn?: string;
    approvedPathAr?: string;
    approvedPathEn?: string;
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
