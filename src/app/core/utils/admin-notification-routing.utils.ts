import {
  buildCatalogRequestManagementUrl,
  resolveCatalogRequestTypeFromNotificationType
} from '@catalog/utils/catalog-request-navigation.util';
import { AdminNotification } from '../services/admin-notifications.service';

type NotificationData = Record<string, unknown>;

export function resolveAdminNotificationTargetUrl(notification: AdminNotification): string {
  const parsedData = tryParseNotificationData(notification.data);
  const dataObject = (notification.dataObject ?? parsedData) as NotificationData | null;
  const payload = extractNotificationPayload(dataObject, parsedData);

  const supportUrl = resolveAdminSupportTargetUrl(notification, dataObject, parsedData, payload);
  if (supportUrl) {
    return supportUrl;
  }

  const explicitTarget = normalizeAdminNotificationTargetUrl(
    extractNotificationTargetUrl(dataObject, parsedData, payload),
    notification,
    dataObject,
    parsedData,
    payload
  );
  if (explicitTarget) {
    return explicitTarget;
  }

  const typeTarget = resolveAdminNotificationTypeTargetUrl(notification, dataObject, parsedData, payload);
  if (typeTarget) {
    return typeTarget;
  }

  const categoryTarget = resolveAdminNotificationCategoryTargetUrl(notification, dataObject, parsedData, payload);
  if (categoryTarget) {
    return categoryTarget;
  }

  return '/notifications';
}

export function sanitizeAdminNotificationInternalPath(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') {
    return null;
  }

  if (!trimmed.startsWith('/')) {
    return null;
  }

  if (trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return null;
  }

  if (/[\u0000-\u001F\u007F]/.test(trimmed)) {
    return null;
  }

  if (/^\/[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return null;
  }

  return trimmed;
}

function resolveAdminSupportTargetUrl(
  notification: AdminNotification,
  dataObject: NotificationData | null,
  parsedData: NotificationData | null,
  payload: NotificationData | null
): string | null {
  if (!isSupportNotification(notification, dataObject, parsedData, payload)) {
    return null;
  }

  const ticketId = extractString(
    payload?.['ticketId'],
    dataObject?.['ticketId'],
    parsedData?.['ticketId'],
    isVendorSupportTicketNotification(notification, dataObject, parsedData, payload)
      ? notification.referenceId
      : null
  );

  if (ticketId) {
    return `/support?tab=vendor&ticketId=${encodeURIComponent(ticketId)}`;
  }

  const driverCaseId = extractString(
    payload?.['caseId'],
    dataObject?.['caseId'],
    parsedData?.['caseId'],
    isDriverSupportCaseNotification(notification, dataObject, parsedData, payload)
      ? notification.referenceId
      : null
  );

  const supportType = `${payload?.['type'] ?? ''} ${dataObject?.['type'] ?? ''} ${parsedData?.['type'] ?? ''}`.toLowerCase();
  if (driverCaseId && (supportType.includes('driver_account') || supportType.includes('driver_report') || supportType.includes('driver_dispute'))) {
    return `/support?tab=driver&driverCaseId=${encodeURIComponent(driverCaseId)}`;
  }

  const legacyCaseId = extractString(
    payload?.['caseId'],
    dataObject?.['caseId'],
    parsedData?.['caseId'],
    !isVendorSupportTicketNotification(notification, dataObject, parsedData, payload)
    && !isDriverSupportCaseNotification(notification, dataObject, parsedData, payload)
      ? notification.referenceId
      : null
  );

  if (legacyCaseId) {
    return `/support?tab=legacy&legacyCaseId=${encodeURIComponent(legacyCaseId)}`;
  }

  return '/support';
}

function normalizeAdminNotificationTargetUrl(
  rawTargetUrl: string | null,
  notification: AdminNotification,
  dataObject: NotificationData | null,
  parsedData: NotificationData | null,
  payload: NotificationData | null
): string | null {
  const sanitized = sanitizeAdminNotificationInternalPath(rawTargetUrl);
  if (!sanitized) {
    return null;
  }

  const adminOrderMatch = /^\/admin\/orders\/([^/?#]+)/i.exec(sanitized);
  if (adminOrderMatch) {
    return `/orders/${encodeURIComponent(adminOrderMatch[1])}`;
  }

  if (sanitized === '/finances/payouts') {
    return buildFinanceWithdrawalsTargetUrl(notification, dataObject, parsedData, payload);
  }

  if (sanitized.startsWith('/finances/withdrawals')) {
    return buildFinanceWithdrawalsTargetUrl(notification, dataObject, parsedData, payload, sanitized);
  }

  if (sanitized.startsWith('/finances/settlements')) {
    return buildFinanceSettlementsTargetUrl(notification, dataObject, parsedData, payload, sanitized);
  }

  const disputeCaseMatch = /^\/disputes\?(?:.*&)?caseId=([^&#]+)/i.exec(sanitized)
    ?? /^\/disputes\?caseId=([^&#]+)/i.exec(sanitized);
  if (disputeCaseMatch) {
    return `/disputes?focus=${encodeURIComponent(disputeCaseMatch[1])}`;
  }

  if (sanitized.startsWith('/disputes?focus=')) {
    return sanitized;
  }

  if (sanitized.startsWith('/finances/refunds?focus=')) {
    return sanitized;
  }

  if (sanitized.startsWith('/support?')) {
    return sanitized;
  }

  if (sanitized.startsWith('/orders/')) {
    return sanitized;
  }

  if (/^\/vendors\/[^/?#]+$/i.test(sanitized)) {
    return `${sanitized}/overview`;
  }

  if (sanitized === '/notifications?category=support') {
    const supportUrl = resolveAdminSupportTargetUrl(notification, dataObject, parsedData, payload);
    return supportUrl && supportUrl !== '/support' ? supportUrl : '/support';
  }

  if (sanitized.startsWith('/notifications')) {
    return sanitized;
  }

  if (sanitized === '/catalog/requests' || sanitized.startsWith('/catalog/requests/')) {
    const viewMatch = /^\/catalog\/requests\/view\/([^/?#]+)/i.exec(sanitized);
    const requestType = resolveCatalogRequestTypeFromNotificationType(notification.type);
    return buildCatalogRequestManagementUrl(requestType, viewMatch?.[1] ?? null);
  }

  if (sanitized.startsWith('/drivers/') || sanitized.startsWith('/vendors/') || sanitized.startsWith('/finances/')) {
    return sanitized;
  }

  const orderId = extractString(payload?.['orderId'], dataObject?.['orderId'], parsedData?.['orderId'], notification.referenceId);
  if (sanitized === '/finances' && orderId) {
    return `/orders/${encodeURIComponent(orderId)}`;
  }

  return sanitized;
}

function resolveAdminNotificationTypeTargetUrl(
  notification: AdminNotification,
  dataObject: NotificationData | null,
  parsedData: NotificationData | null,
  payload: NotificationData | null
): string | null {
  const type = (notification.type ?? '').toLowerCase();
  const referenceId = extractString(notification.referenceId);
  const orderId = extractString(payload?.['orderId'], dataObject?.['orderId'], parsedData?.['orderId']);
  const caseId = extractString(payload?.['caseId'], dataObject?.['caseId'], parsedData?.['caseId'], referenceId);
  const driverId = extractString(payload?.['driverId'], dataObject?.['driverId'], parsedData?.['driverId']);
  const vendorId = extractString(payload?.['vendorId'], dataObject?.['vendorId'], parsedData?.['vendorId']);
  const requestId = extractString(
    payload?.['productRequestId'],
    payload?.['categoryRequestId'],
    payload?.['brandRequestId'],
    referenceId
  );

  if (type.startsWith('catalog.')) {
    const requestType = resolveCatalogRequestTypeFromNotificationType(type);
    return buildCatalogRequestManagementUrl(requestType, requestId);
  }

  if (type.startsWith('delivery.') && orderId) {
    return `/orders/${encodeURIComponent(orderId)}`;
  }

  if (type.startsWith('driver.') && driverId) {
    return `/drivers/${encodeURIComponent(driverId)}`;
  }

  if (type.startsWith('vendor.') && vendorId) {
    const section = extractString(payload?.['section'], dataObject?.['section'], parsedData?.['section']);
    if (section && isVendorProfileSection(section)) {
      return `/vendors/${encodeURIComponent(vendorId)}/compliance`;
    }

    if (type === 'vendor.documents_submitted' || type === 'vendor.critical_change_submitted') {
      return `/vendors/${encodeURIComponent(vendorId)}/compliance`;
    }

    return `/vendors/${encodeURIComponent(vendorId)}/overview`;
  }

  if (type === 'payout.requires_review') {
    return buildFinanceWithdrawalsTargetUrl(notification, dataObject, parsedData, payload);
  }

  if (type === 'settlement.requested') {
    return buildFinanceSettlementsTargetUrl(notification, dataObject, parsedData, payload)
      ?? buildFinanceWithdrawalsTargetUrl(notification, dataObject, parsedData, payload)
      ?? '/finances/settlements';
  }

  if (type === 'settlement.failed') {
    return buildFinanceSettlementsTargetUrl(notification, dataObject, parsedData, payload)
      ?? '/finances/settlements';
  }

  if (type.startsWith('settlement.')) {
    return buildFinanceSettlementsTargetUrl(notification, dataObject, parsedData, payload)
      ?? '/finances/settlements';
  }

  if (type.startsWith('refund.')) {
    return caseId ? `/finances/refunds?focus=${encodeURIComponent(caseId)}` : '/finances/refunds';
  }

  if (type.startsWith('dispute.') && caseId) {
    return `/disputes?focus=${encodeURIComponent(caseId)}`;
  }

  if ((type.startsWith('support.') || type.includes('support_case')) && caseId) {
    const supportType = `${payload?.['type'] ?? ''} ${dataObject?.['type'] ?? ''} ${parsedData?.['type'] ?? ''}`.toLowerCase();
    if (supportType.includes('driver_account') || supportType.includes('driver_report') || supportType.includes('driver_dispute')) {
      return `/support?tab=driver&driverCaseId=${encodeURIComponent(caseId)}`;
    }
    if (supportType.includes('return_request')) {
      return `/finances/refunds?focus=${encodeURIComponent(caseId)}`;
    }
    if (supportType.includes('complaint')) {
      return `/support?tab=legacy&legacyCaseId=${encodeURIComponent(caseId)}`;
    }
    return `/disputes?focus=${encodeURIComponent(caseId)}`;
  }

  return null;
}

function resolveAdminNotificationCategoryTargetUrl(
  notification: AdminNotification,
  dataObject: NotificationData | null,
  parsedData: NotificationData | null,
  payload: NotificationData | null
): string | null {
  const category = (notification.category ?? '').toLowerCase();
  const referenceId = extractString(notification.referenceId);
  const orderId = extractString(payload?.['orderId'], dataObject?.['orderId'], parsedData?.['orderId']);
  const driverId = extractString(payload?.['driverId'], dataObject?.['driverId'], parsedData?.['driverId']);
  const caseId = extractString(payload?.['caseId'], dataObject?.['caseId'], parsedData?.['caseId'], referenceId);

  switch (category) {
    case 'drivers':
      if (caseId && `${notification.type ?? ''}`.toLowerCase().includes('dispute')) {
        return `/disputes?focus=${encodeURIComponent(caseId)}`;
      }
      return driverId
        ? `/drivers/${encodeURIComponent(driverId)}`
        : referenceId
          ? `/drivers/${encodeURIComponent(referenceId)}`
          : '/drivers';
    case 'vendors':
      return referenceId ? `/vendors/${encodeURIComponent(referenceId)}/overview` : '/vendors';
    case 'catalog': {
      const requestType = resolveCatalogRequestTypeFromNotificationType(notification.type);
      return buildCatalogRequestManagementUrl(requestType, referenceId);
    }
    case 'delivery':
      return orderId
        ? `/orders/${encodeURIComponent(orderId)}`
        : referenceId
          ? `/orders/${encodeURIComponent(referenceId)}`
          : '/orders';
    case 'refunds':
      return caseId ? `/finances/refunds?focus=${encodeURIComponent(caseId)}` : '/finances/refunds';
    case 'settlements':
      return buildFinanceSettlementsTargetUrl(notification, dataObject, parsedData, payload)
        ?? buildFinanceWithdrawalsTargetUrl(notification, dataObject, parsedData, payload)
        ?? '/finances/settlements';
    case 'disputes':
      return caseId ? `/disputes?focus=${encodeURIComponent(caseId)}` : '/disputes';
    case 'support':
      return resolveAdminSupportTargetUrl(notification, dataObject, parsedData, payload) ?? '/support';
    case 'system':
      return '/notifications';
    default:
      return null;
  }
}

function extractNotificationTargetUrl(
  dataObject: NotificationData | null,
  parsedData: NotificationData | null,
  payload: NotificationData | null
): string | null {
  return extractString(
    dataObject?.['targetUrl'],
    dataObject?.['TargetUrl'],
    parsedData?.['targetUrl'],
    parsedData?.['TargetUrl'],
    payload?.['targetUrl'],
    payload?.['TargetUrl']
  );
}

function extractNotificationPayload(
  dataObject: NotificationData | null,
  parsedData: NotificationData | null
): NotificationData | null {
  const nested = dataObject?.['payload'] ?? parsedData?.['payload'];
  return nested && typeof nested === 'object' && !Array.isArray(nested)
    ? nested as NotificationData
    : null;
}

function isSupportNotification(
  notification: AdminNotification,
  dataObject: NotificationData | null,
  parsedData: NotificationData | null,
  payload: NotificationData | null
): boolean {
  const category = (notification.category ?? '').toLowerCase();
  const type = (notification.type ?? '').toLowerCase();
  const source = `${payload?.['source'] ?? ''} ${dataObject?.['source'] ?? ''} ${parsedData?.['source'] ?? ''}`.toLowerCase();
  const targetUrl = `${extractNotificationTargetUrl(dataObject, parsedData, payload) ?? ''}`.toLowerCase();

  return category === 'support'
    || type.startsWith('support.')
    || type.includes('vendor_support_ticket')
    || source.includes('vendor_support')
    || targetUrl.includes('/support')
    || targetUrl.includes('category=support');
}

function isVendorSupportTicketNotification(
  notification: AdminNotification,
  dataObject: NotificationData | null,
  parsedData: NotificationData | null,
  payload: NotificationData | null
): boolean {
  const type = (notification.type ?? '').toLowerCase();
  const source = `${payload?.['source'] ?? ''} ${dataObject?.['source'] ?? ''} ${parsedData?.['source'] ?? ''}`.toLowerCase();
  const targetUrl = `${extractNotificationTargetUrl(dataObject, parsedData, payload) ?? ''}`.toLowerCase();

  return type.includes('vendor_support_ticket')
    || type === 'support.ticket_created'
    || type === 'support.ticket_updated'
    || source.includes('vendor_support')
    || targetUrl.includes('/support/tickets/');
}

function isDriverSupportCaseNotification(
  notification: AdminNotification,
  dataObject: NotificationData | null,
  parsedData: NotificationData | null,
  payload: NotificationData | null
): boolean {
  const type = `${notification.type ?? ''} ${payload?.['type'] ?? ''} ${dataObject?.['type'] ?? ''} ${parsedData?.['type'] ?? ''}`.toLowerCase();
  const targetUrl = `${extractNotificationTargetUrl(dataObject, parsedData, payload) ?? ''}`.toLowerCase();

  return type.includes('driver_account')
    || type.includes('driver_report')
    || type.includes('driver_dispute')
    || targetUrl.includes('type=driver_account')
    || targetUrl.includes('type=driver_report')
    || targetUrl.includes('tab=driver');
}

function tryParseNotificationData(data?: string | null): NotificationData | null {
  if (!data?.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(data);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as NotificationData : null;
  } catch {
    return null;
  }
}

function extractString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function isVendorProfileSection(section: string): boolean {
  const normalized = section.trim().toLowerCase();
  return normalized === 'store'
    || normalized === 'owner'
    || normalized === 'contact'
    || normalized === 'legal'
    || normalized === 'banking';
}

function buildFinanceWithdrawalsTargetUrl(
  notification: AdminNotification,
  dataObject: NotificationData | null,
  parsedData: NotificationData | null,
  payload: NotificationData | null,
  fallback = '/finances/withdrawals'
): string {
  const sanitizedFallback = sanitizeAdminNotificationInternalPath(fallback) ?? '/finances/withdrawals';
  if (/focus=|payoutid=/i.test(sanitizedFallback)) {
    return sanitizedFallback;
  }

  const withdrawalId = extractString(
    payload?.['withdrawalId'],
    dataObject?.['withdrawalId'],
    parsedData?.['withdrawalId'],
    notification.referenceId
  );
  if (withdrawalId) {
    return `/finances/withdrawals?focus=${encodeURIComponent(withdrawalId)}`;
  }

  const payoutId = extractString(
    payload?.['payoutId'],
    payload?.['Id'],
    dataObject?.['payoutId'],
    parsedData?.['payoutId'],
    notification.referenceId
  );
  if (payoutId) {
    return `/finances/withdrawals?payoutId=${encodeURIComponent(payoutId)}`;
  }

  return sanitizedFallback;
}

function buildFinanceSettlementsTargetUrl(
  notification: AdminNotification,
  dataObject: NotificationData | null,
  parsedData: NotificationData | null,
  payload: NotificationData | null,
  fallback = '/finances/settlements'
): string | null {
  const sanitizedFallback = sanitizeAdminNotificationInternalPath(fallback) ?? '/finances/settlements';
  if (sanitizedFallback.includes('focus=')) {
    return appendFinanceQueryParam(sanitizedFallback, 'payoutId', extractString(
      payload?.['payoutId'],
      payload?.['Id'],
      dataObject?.['payoutId'],
      parsedData?.['payoutId']
    ));
  }

  const settlementId = extractString(
    payload?.['settlementId'],
    dataObject?.['settlementId'],
    parsedData?.['settlementId'],
    notification.referenceId
  );
  if (!settlementId) {
    return sanitizedFallback === '/finances/settlements' ? null : sanitizedFallback;
  }

  const payoutId = extractString(
    payload?.['payoutId'],
    payload?.['Id'],
    dataObject?.['payoutId'],
    parsedData?.['payoutId']
  );

  let url = `/finances/settlements?focus=${encodeURIComponent(settlementId)}`;
  if (payoutId) {
    url = appendFinanceQueryParam(url, 'payoutId', payoutId);
  }

  return url;
}

function appendFinanceQueryParam(url: string, key: string, value: string | null): string {
  if (!value || url.toLowerCase().includes(`${key.toLowerCase()}=`)) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${key}=${encodeURIComponent(value)}`;
}
