const PAGE_TITLE_BRAND_KEY = 'PAGE_TITLES.BRAND';
const PAGE_TITLE_DEFAULT_KEY = 'PAGE_TITLES.DEFAULT';

/** Typical ngx-translate key shape, e.g. PAGE_TITLES.DASHBOARD or SIDEBAR.SUPPORT */
const I18N_KEY_PATTERN = /^[A-Z][A-Z0-9_]*(\.[A-Z0-9_]+)+$/;

export function isUnresolvedTranslation(key: string, value: string | undefined | null): boolean {
  if (!value?.trim()) {
    return true;
  }

  const trimmed = value.trim();
  if (trimmed === key) {
    return true;
  }

  // Guard against flashing raw i18n keys while translation JSON is still loading.
  return I18N_KEY_PATTERN.test(trimmed);
}

/** Returns a browser title only when translations are fully resolved (never raw i18n keys). */
export function buildLocalizedPageTitle(
  titleKey: string,
  translations: Record<string, string>
): string | null {
  const brand = translations[PAGE_TITLE_BRAND_KEY];
  if (isUnresolvedTranslation(PAGE_TITLE_BRAND_KEY, brand)) {
    return null;
  }

  const primary = translations[titleKey];
  const fallback = translations[PAGE_TITLE_DEFAULT_KEY];

  const pageTitle = !isUnresolvedTranslation(titleKey, primary)
    ? primary.trim()
    : !isUnresolvedTranslation(PAGE_TITLE_DEFAULT_KEY, fallback)
      ? fallback.trim()
      : null;

  if (!pageTitle) {
    return null;
  }

  return `${pageTitle} | ${brand.trim()}`;
}

export function resolveSplashFallbackTitle(lang: string | null | undefined): string {
  return lang === 'en' ? 'Zadna | Super Admin Panel' : 'زادنا | لوحة الإدارة العليا';
}
