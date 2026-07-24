export type FeaturedPlacementType = 'VendorProduct' | 'MasterProduct';
export type HomeSectionTheme = 'soft-blue' | 'fresh-orange' | 'bold-dark';
export type CouponDiscountType = 'Fixed' | 'Percentage';

export type HomeContentSectionType =
  | 'Banners'
  | 'Categories'
  | 'SpecialOffers'
  | 'Recommended'
  | 'BestSelling'
  | 'Brands'
  | 'FeaturedProducts'
  | 'ExploreMore'
  | 'DynamicSections';

export interface MarketingBanner {
  id: string;
  tagAr: string;
  tagEn: string;
  titleAr: string;
  titleEn: string;
  subtitleAr?: string | null;
  subtitleEn?: string | null;
  actionLabelAr?: string | null;
  actionLabelEn?: string | null;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  startsAtUtc?: string | null;
  endsAtUtc?: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface MarketingBannerPayload {
  tagAr: string;
  tagEn: string;
  titleAr: string;
  titleEn: string;
  subtitleAr?: string | null;
  subtitleEn?: string | null;
  actionLabelAr?: string | null;
  actionLabelEn?: string | null;
  imageUrl: string;
  displayOrder: number;
  startsAtUtc?: string | null;
  endsAtUtc?: string | null;
}

export interface MarketingBannerUpdatePayload extends MarketingBannerPayload {
  isActive: boolean;
}

export interface FeaturedPlacement {
  id: string;
  placementType: FeaturedPlacementType;
  vendorProductId?: string | null;
  masterProductId?: string | null;
  displayNameAr?: string | null;
  displayNameEn?: string | null;
  displayOrder: number;
  isActive: boolean;
  startsAtUtc?: string | null;
  endsAtUtc?: string | null;
  note?: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface FeaturedPlacementPayload {
  placementType: FeaturedPlacementType;
  vendorProductId?: string | null;
  masterProductId?: string | null;
  displayOrder: number;
  startsAtUtc?: string | null;
  endsAtUtc?: string | null;
  note?: string | null;
}

export interface FeaturedPlacementUpdatePayload extends FeaturedPlacementPayload {
  isActive: boolean;
}

export interface MarketingHomeSection {
  id: string;
  categoryId: string;
  categoryNameAr: string;
  categoryNameEn: string;
  theme: HomeSectionTheme;
  themeLabelAr: string;
  themeLabelEn: string;
  displayOrder: number;
  productsTake: number;
  isActive: boolean;
  startsAtUtc?: string | null;
  endsAtUtc?: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface MarketingHomeSectionPayload {
  categoryId: string;
  theme: HomeSectionTheme;
  displayOrder: number;
  productsTake: number;
  startsAtUtc?: string | null;
  endsAtUtc?: string | null;
}

export interface MarketingHomeSectionUpdatePayload extends MarketingHomeSectionPayload {
  isActive: boolean;
}

export interface HomeSectionThemeOption {
  key: HomeSectionTheme;
  labelAr: string;
  labelEn: string;
}

export interface HomeContentSectionSetting {
  sectionType: HomeContentSectionType;
  isEnabled: boolean;
}

export interface HomeContentSectionSettingPayload {
  isEnabled: boolean;
}

export interface ProductCardPriceVisibilitySetting {
  showPriceOnCard: boolean;
  totalProducts: number;
  visibleProducts: number;
  hiddenProducts: number;
  isMixed: boolean;
}

export interface MarketingCategoryOption {
  id: string;
  nameAr: string;
  nameEn: string;
  level: number;
  pathLabel: string;
  isSelectable: boolean;
}

export interface MasterProductLookupOption {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface VendorProductLookupOption {
  id: string;
  nameAr: string;
  nameEn: string;
  vendorNameAr: string;
  vendorNameEn: string;
}

export interface MarketingCouponVendor {
  vendorId: string;
  vendorNameAr: string;
  vendorNameEn: string;
}

export interface MarketingCoupon {
  id: string;
  code: string;
  title: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startsAtUtc?: string | null;
  endsAtUtc?: string | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  isActive: boolean;
  assignedVendorsCount: number;
  applicableVendors: MarketingCouponVendor[];
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface MarketingCouponPayload {
  code: string;
  title: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startsAtUtc?: string | null;
  endsAtUtc?: string | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  vendorIds?: string[] | null;
}

export interface MarketingCouponUpdatePayload extends MarketingCouponPayload {
  isActive: boolean;
}

export interface PlatformContactSettings {
  supportEmail?: string | null;
  supportPhone?: string | null;
  whatsAppUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  tikTokUrl?: string | null;
  snapchatUrl?: string | null;
  facebookUrl?: string | null;
  youTubeUrl?: string | null;
  linkedInUrl?: string | null;
  updatedAtUtc?: string | null;
}

export interface PlatformContactSettingsPayload {
  supportEmail?: string | null;
  supportPhone?: string | null;
  whatsAppUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  tikTokUrl?: string | null;
  snapchatUrl?: string | null;
  facebookUrl?: string | null;
  youTubeUrl?: string | null;
  linkedInUrl?: string | null;
}

export type PlatformLegalDocumentType =
  | 'CustomerTerms'
  | 'CustomerPrivacy'
  | 'DriverTerms'
  | 'DriverPrivacy'
  | 'VendorTerms'
  | 'VendorPrivacy';

export interface PlatformLegalDocument {
  documentType: PlatformLegalDocumentType | string;
  contentAr: string;
  contentEn: string;
  version: string;
  effectiveAtUtc: string;
  updatedAtUtc: string;
}

export interface PlatformLegalDocumentPayload {
  contentAr?: string | null;
  contentEn?: string | null;
  version?: string | null;
  effectiveAtUtc?: string | null;
}
