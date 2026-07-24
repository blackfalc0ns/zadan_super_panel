export interface AdminPageTitleRule {
  pattern: RegExp;
  titleKey: string;
}

/** Most specific patterns first. */
export const ADMIN_PAGE_TITLE_RULES: readonly AdminPageTitleRule[] = [
  { pattern: /^\/login$/, titleKey: 'PAGE_TITLES.LOGIN' },
  { pattern: /^\/change-temporary-password$/, titleKey: 'PAGE_TITLES.CHANGE_PASSWORD' },
  { pattern: /^\/unauthorized$/, titleKey: 'PAGE_TITLES.UNAUTHORIZED' },

  { pattern: /^\/dashboard$/, titleKey: 'PAGE_TITLES.DASHBOARD' },

  { pattern: /^\/catalog\/categories\/[^/]+$/, titleKey: 'PAGE_TITLES.CATALOG_CATEGORY_DETAIL' },
  { pattern: /^\/catalog\/categories$/, titleKey: 'PAGE_TITLES.CATALOG_CATEGORIES' },
  { pattern: /^\/catalog\/products\/create$/, titleKey: 'PAGE_TITLES.CATALOG_PRODUCT_CREATE' },
  { pattern: /^\/catalog\/products\/edit\/[^/]+$/, titleKey: 'PAGE_TITLES.CATALOG_PRODUCT_EDIT' },
  { pattern: /^\/catalog\/products\/view\/[^/]+$/, titleKey: 'PAGE_TITLES.CATALOG_PRODUCT_DETAIL' },
  { pattern: /^\/catalog\/products\/bulk-create$/, titleKey: 'PAGE_TITLES.CATALOG_PRODUCTS_BULK' },
  { pattern: /^\/catalog\/products$/, titleKey: 'PAGE_TITLES.CATALOG_PRODUCTS' },
  { pattern: /^\/catalog\/brands\/view\/[^/]+$/, titleKey: 'PAGE_TITLES.CATALOG_BRAND_DETAIL' },
  { pattern: /^\/catalog\/brands\/bulk-create$/, titleKey: 'PAGE_TITLES.CATALOG_BRANDS_BULK' },
  { pattern: /^\/catalog\/brands$/, titleKey: 'PAGE_TITLES.CATALOG_BRANDS' },
  { pattern: /^\/catalog\/requests\/view\/[^/]+$/, titleKey: 'PAGE_TITLES.CATALOG_REQUESTS' },
  { pattern: /^\/catalog\/requests$/, titleKey: 'PAGE_TITLES.CATALOG_REQUESTS' },
  { pattern: /^\/catalog\/recycle-bin$/, titleKey: 'PAGE_TITLES.CATALOG_RECYCLE_BIN' },

  { pattern: /^\/vendors\/[^/]+\/settings$/, titleKey: 'PAGE_TITLES.VENDOR_SETTINGS' },
  { pattern: /^\/vendors\/[^/]+\/logs$/, titleKey: 'PAGE_TITLES.VENDOR_LOGS' },
  { pattern: /^\/vendors\/[^/]+\/compliance$/, titleKey: 'PAGE_TITLES.VENDOR_COMPLIANCE' },
  { pattern: /^\/vendors\/[^/]+\/finance$/, titleKey: 'PAGE_TITLES.VENDOR_FINANCE' },
  { pattern: /^\/vendors\/[^/]+\/disputes$/, titleKey: 'PAGE_TITLES.VENDOR_DISPUTES' },
  { pattern: /^\/vendors\/[^/]+\/orders$/, titleKey: 'PAGE_TITLES.VENDOR_ORDERS' },
  { pattern: /^\/vendors\/[^/]+\/products$/, titleKey: 'PAGE_TITLES.VENDOR_PRODUCTS' },
  { pattern: /^\/vendors\/[^/]+\/analytics$/, titleKey: 'PAGE_TITLES.VENDOR_ANALYTICS' },
  { pattern: /^\/vendors\/[^/]+\/data$/, titleKey: 'PAGE_TITLES.VENDOR_DATA' },
  { pattern: /^\/vendors\/[^/]+\/overview$/, titleKey: 'PAGE_TITLES.VENDOR_OVERVIEW' },
  { pattern: /^\/vendors\/[^/]+$/, titleKey: 'PAGE_TITLES.VENDOR_OVERVIEW' },
  { pattern: /^\/vendors$/, titleKey: 'PAGE_TITLES.VENDORS' },

  { pattern: /^\/orders\/[^/]+$/, titleKey: 'PAGE_TITLES.ORDER_DETAIL' },
  { pattern: /^\/orders$/, titleKey: 'PAGE_TITLES.ORDERS' },

  { pattern: /^\/customers\/[^/]+$/, titleKey: 'PAGE_TITLES.CUSTOMER_DETAIL' },
  { pattern: /^\/customers$/, titleKey: 'PAGE_TITLES.CUSTOMERS' },

  { pattern: /^\/drivers\/[^/]+$/, titleKey: 'PAGE_TITLES.DRIVER_DETAIL' },
  { pattern: /^\/drivers$/, titleKey: 'PAGE_TITLES.DRIVERS' },

  { pattern: /^\/support$/, titleKey: 'PAGE_TITLES.SUPPORT' },
  { pattern: /^\/disputes$/, titleKey: 'PAGE_TITLES.DISPUTES' },

  { pattern: /^\/finances\/wallets\/[^/]+$/, titleKey: 'PAGE_TITLES.FINANCES_WALLET_DETAIL' },
  { pattern: /^\/finances\/wallets$/, titleKey: 'PAGE_TITLES.FINANCES_WALLETS' },
  { pattern: /^\/finances\/withdrawals$/, titleKey: 'PAGE_TITLES.FINANCES_WITHDRAWALS' },
  { pattern: /^\/finances\/payout-reconciliation$/, titleKey: 'PAGE_TITLES.FINANCES_PAYOUT_RECONCILIATION' },
  { pattern: /^\/finances\/platform-account$/, titleKey: 'PAGE_TITLES.FINANCES_PLATFORM_ACCOUNT' },
  { pattern: /^\/finances\/audit$/, titleKey: 'PAGE_TITLES.FINANCES_AUDIT' },
  { pattern: /^\/finances\/adjustments$/, titleKey: 'PAGE_TITLES.FINANCES_ADJUSTMENTS' },
  { pattern: /^\/finances\/cod$/, titleKey: 'PAGE_TITLES.FINANCES_COD' },
  { pattern: /^\/finances\/refunds$/, titleKey: 'PAGE_TITLES.FINANCES_REFUNDS' },
  { pattern: /^\/finances\/settlements$/, titleKey: 'PAGE_TITLES.FINANCES_SETTLEMENTS' },
  { pattern: /^\/finances\/ledger$/, titleKey: 'PAGE_TITLES.FINANCES_LEDGER' },
  { pattern: /^\/finances\/pricing$/, titleKey: 'PAGE_TITLES.FINANCES_PRICING' },
  { pattern: /^\/finances\/overview$/, titleKey: 'PAGE_TITLES.FINANCES_OVERVIEW' },
  { pattern: /^\/finances$/, titleKey: 'PAGE_TITLES.FINANCES_OVERVIEW' },

  { pattern: /^\/marketing\/coupons$/, titleKey: 'PAGE_TITLES.MARKETING_COUPONS' },
  { pattern: /^\/marketing\/banners$/, titleKey: 'PAGE_TITLES.MARKETING_BANNERS' },
  { pattern: /^\/marketing\/featured-products$/, titleKey: 'PAGE_TITLES.MARKETING_FEATURED_PRODUCTS' },
  { pattern: /^\/marketing\/home-sections$/, titleKey: 'PAGE_TITLES.MARKETING_HOME_SECTIONS' },
  { pattern: /^\/marketing\/home-visibility$/, titleKey: 'PAGE_TITLES.MARKETING_HOME_VISIBILITY' },
  { pattern: /^\/marketing\/contact-social$/, titleKey: 'PAGE_TITLES.MARKETING_CONTACT_SOCIAL' },
  { pattern: /^\/marketing\/legal-documents$/, titleKey: 'PAGE_TITLES.MARKETING_LEGAL_DOCUMENTS' },
  { pattern: /^\/marketing$/, titleKey: 'PAGE_TITLES.MARKETING_BANNERS' },

  { pattern: /^\/notifications$/, titleKey: 'PAGE_TITLES.NOTIFICATIONS' },

  { pattern: /^\/admin-users\/roles$/, titleKey: 'PAGE_TITLES.ADMIN_ROLES' },
  { pattern: /^\/admin-users\/[^/]+$/, titleKey: 'PAGE_TITLES.ADMIN_USER_DETAIL' },
  { pattern: /^\/admin-users$/, titleKey: 'PAGE_TITLES.ADMIN_USERS' },

  { pattern: /^\/profile$/, titleKey: 'PAGE_TITLES.PROFILE' },
  { pattern: /^\/live-ops$/, titleKey: 'PAGE_TITLES.LIVE_OPS' },
  { pattern: /^\/system-logs$/, titleKey: 'PAGE_TITLES.SYSTEM_LOGS' },
  { pattern: /^\/email-center\/history$/, titleKey: 'PAGE_TITLES.EMAIL_CENTER_HISTORY' },
  { pattern: /^\/email-center\/rules\/[^/]+$/, titleKey: 'PAGE_TITLES.EMAIL_CENTER_RULE' },
  { pattern: /^\/email-center$/, titleKey: 'PAGE_TITLES.EMAIL_CENTER' },

  { pattern: /^\/$/, titleKey: 'PAGE_TITLES.DASHBOARD' }
];

export function normalizeAdminPagePath(url: string): string {
  const path = (url.split('?')[0]?.split('#')[0] ?? '/').trim();
  if (!path || path === '/') {
    return '/';
  }

  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export function resolveAdminPageTitleKey(url: string): string {
  const path = normalizeAdminPagePath(url);

  for (const rule of ADMIN_PAGE_TITLE_RULES) {
    if (rule.pattern.test(path)) {
      return rule.titleKey;
    }
  }

  return 'PAGE_TITLES.DEFAULT';
}
