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
    return '/finances/withdrawals';
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

  if (sanitized.startsWith('/catalog/requests') || sanitized.startsWith('/drivers/') || sanitized.startsWith('/vendors/') || sanitized.startsWith('/finances/')) {
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

  if (type.startsWith('catalog.') && requestId) {
    return `/catalog/requests/view/${encodeURIComponent(requestId)}`;
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
    return '/finances/withdrawals';
  }

  if (type.startsWith('settlement.')) {
    return '/finances/settlements';
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
    case 'catalog':
      return referenceId ? `/catalog/requests/view/${encodeURIComponent(referenceId)}` : '/catalog/requests';
    case 'delivery':
      return orderId
        ? `/orders/${encodeURIComponent(orderId)}`
        : referenceId
          ? `/orders/${encodeURIComponent(referenceId)}`
          : '/orders';
    case 'refunds':
      return caseId ? `/finances/refunds?focus=${encodeURIComponent(caseId)}` : '/finances/refunds';
    case 'settlements':
      return '/finances/settlements';
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
