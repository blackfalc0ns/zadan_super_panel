import { normalizeAdminPagePath, resolveAdminPageTitleKey } from './admin-page-title.config';

describe('admin-page-title.config', () => {
  it('normalizes paths with query strings and trailing slashes', () => {
    expect(normalizeAdminPagePath('/orders?tab=1')).toBe('/orders');
    expect(normalizeAdminPagePath('/vendors/')).toBe('/vendors');
  });

  it('resolves titles for main admin routes', () => {
    expect(resolveAdminPageTitleKey('/dashboard')).toBe('PAGE_TITLES.DASHBOARD');
    expect(resolveAdminPageTitleKey('/catalog/products/create')).toBe('PAGE_TITLES.CATALOG_PRODUCT_CREATE');
    expect(resolveAdminPageTitleKey('/vendors/abc/overview')).toBe('PAGE_TITLES.VENDOR_OVERVIEW');
    expect(resolveAdminPageTitleKey('/finances/wallets/wallet-1')).toBe('PAGE_TITLES.FINANCES_WALLET_DETAIL');
    expect(resolveAdminPageTitleKey('/finances/payout-reconciliation')).toBe('PAGE_TITLES.FINANCES_PAYOUT_RECONCILIATION');
    expect(resolveAdminPageTitleKey('/orders/order-1')).toBe('PAGE_TITLES.ORDER_DETAIL');
  });

  it('falls back to default for unknown routes', () => {
    expect(resolveAdminPageTitleKey('/unknown-page')).toBe('PAGE_TITLES.DEFAULT');
  });
});
