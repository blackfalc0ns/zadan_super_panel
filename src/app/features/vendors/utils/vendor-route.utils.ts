import { ActivatedRoute } from '@angular/router';

export const VENDOR_DETAIL_TABS = [
  'overview',
  'data',
  'analytics',
  'products',
  'orders',
  'finance',
  'compliance',
  'workspace',
  'logs',
  'settings'
] as const;

export type VendorDetailTabId = (typeof VENDOR_DETAIL_TABS)[number];

export const DEFAULT_VENDOR_DETAIL_TAB: VendorDetailTabId = 'overview';

export function normalizeVendorDetailTab(value: string | null | undefined): VendorDetailTabId {
  return VENDOR_DETAIL_TABS.includes(value as VendorDetailTabId)
    ? (value as VendorDetailTabId)
    : DEFAULT_VENDOR_DETAIL_TAB;
}

export function getLegacyVendorDetailTab(value: string | null | undefined): VendorDetailTabId | null {
  return value == null ? null : normalizeVendorDetailTab(value);
}

export function getVendorRouteParamSource(route: ActivatedRoute): ActivatedRoute {
  return route.parent ?? route;
}

export function getVendorRouteChildTab(route: ActivatedRoute): VendorDetailTabId | null {
  const childPath = route.firstChild?.snapshot.routeConfig?.path ?? null;

  return childPath ? normalizeVendorDetailTab(childPath) : null;
}
