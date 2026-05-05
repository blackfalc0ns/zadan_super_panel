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

export interface MarketingCategoryOption {
  id: string;
  nameAr: string;
  nameEn: string;
  level: number;
  pathLabel: string;
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
