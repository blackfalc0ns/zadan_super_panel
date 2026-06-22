import { CatalogRequestType } from '@catalog/models/catalog.domain.models';

export function catalogManagementPath(requestType: CatalogRequestType): string {
  switch (requestType) {
    case 'brand':
      return '/catalog/brands';
    case 'category':
      return '/catalog/categories';
    default:
      return '/catalog/products';
  }
}

export function buildCatalogRequestManagementUrl(
  requestType: CatalogRequestType,
  requestId?: string | null
): string {
  const query = new URLSearchParams({ requests: '1' });
  if (requestId) {
    query.set('requestId', requestId);
  }

  return `${catalogManagementPath(requestType)}?${query.toString()}`;
}

export function resolveCatalogRequestTypeFromNotificationType(type: string | null | undefined): CatalogRequestType {
  const normalized = (type ?? '').toLowerCase();
  if (normalized.includes('brand_request')) {
    return 'brand';
  }
  if (normalized.includes('category_request')) {
    return 'category';
  }
  return 'product';
}
