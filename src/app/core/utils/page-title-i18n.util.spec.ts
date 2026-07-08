import { buildLocalizedPageTitle, isUnresolvedTranslation } from './page-title-i18n.util';

describe('page-title-i18n.util', () => {
 it('detects unresolved translation values', () => {
 expect(isUnresolvedTranslation('PAGE_TITLES.BRAND', 'PAGE_TITLES.BRAND')).toBe(true);
 expect(isUnresolvedTranslation('PAGE_TITLES.BRAND', 'زادنا')).toBe(false);
 });

 it('returns null when translations are still keys', () => {
 expect(buildLocalizedPageTitle('PAGE_TITLES.DASHBOARD', {
 'PAGE_TITLES.DASHBOARD': 'PAGE_TITLES.DASHBOARD',
 'PAGE_TITLES.BRAND': 'PAGE_TITLES.BRAND',
 'PAGE_TITLES.DEFAULT': 'PAGE_TITLES.DEFAULT'
 })).toBeNull();
 });

 it('builds a localized title when translations are ready', () => {
 expect(buildLocalizedPageTitle('PAGE_TITLES.DASHBOARD', {
 'PAGE_TITLES.DASHBOARD': 'الرئيسية',
 'PAGE_TITLES.BRAND': 'زادنا',
 'PAGE_TITLES.DEFAULT': 'لوحة المشرف'
 })).toBe('الرئيسية | زادنا');
 });
});
