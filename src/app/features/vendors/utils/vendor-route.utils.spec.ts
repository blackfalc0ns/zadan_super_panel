import {
  DEFAULT_VENDOR_DETAIL_TAB,
  getLegacyVendorDetailTab,
  normalizeVendorDetailTab
} from './vendor-route.utils';

describe('Vendor Route Utils', () => {
  it('normalizes valid vendor detail tabs', () => {
    expect(normalizeVendorDetailTab('finance')).toBe('finance');
    expect(normalizeVendorDetailTab('orders')).toBe('orders');
  });

  it('falls back unknown tabs to overview', () => {
    expect(normalizeVendorDetailTab('unknown')).toBe(DEFAULT_VENDOR_DETAIL_TAB);
    expect(normalizeVendorDetailTab(null)).toBe(DEFAULT_VENDOR_DETAIL_TAB);
  });

  it('preserves legacy tab links when present and normalizes invalid values', () => {
    expect(getLegacyVendorDetailTab('finance')).toBe('finance');
    expect(getLegacyVendorDetailTab('unknown')).toBe(DEFAULT_VENDOR_DETAIL_TAB);
    expect(getLegacyVendorDetailTab(null)).toBeNull();
  });
});
