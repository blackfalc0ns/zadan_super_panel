import { AdminNotification } from '../services/admin-notifications.service';
import { resolveAdminNotificationTargetUrl } from './admin-notification-routing.utils';

function buildNotification(overrides: Partial<AdminNotification> = {}): AdminNotification {
 return {
 id: 'notification-1',
 titleAr: 'عنوان',
 titleEn: 'Title',
 bodyAr: 'نص',
 bodyEn: 'Body',
 isRead: false,...overrides
 };
}

describe('resolveAdminNotificationTargetUrl', () => {
 it('normalizes legacy admin order routes to orders detail', () => {
 const url = resolveAdminNotificationTargetUrl(buildNotification({
 type: 'delivery.dispatch_stuck',
 category: 'delivery',
 referenceId: 'order-1',
 dataObject: {
 targetUrl: '/admin/orders/order-1',
 orderId: 'order-1'
 }
 }));

 expect(url).toBe('/orders/order-1');
 });

 it('routes vendor support tickets to support center tab', () => {
 const url = resolveAdminNotificationTargetUrl(buildNotification({
 type: 'support.ticket_created',
 category: 'support',
 referenceId: 'ticket-1',
 dataObject: {
 targetUrl: '/notifications?category=support',
 source: 'vendor_support',
 payload: {
 ticketId: 'ticket-1'
 }
 }
 }));

 expect(url).toBe('/support?tab=vendor&ticketId=ticket-1');
 });

 it('routes driver onboarding alerts to driver detail', () => {
 const url = resolveAdminNotificationTargetUrl(buildNotification({
 type: 'driver.approval_requested',
 category: 'drivers',
 referenceId: 'driver-1',
 data: JSON.stringify({
 targetUrl: '/drivers/driver-1',
 payload: { driverId: 'driver-1' }
 })
 }));

 expect(url).toBe('/drivers/driver-1?tab=verification&focus=approval');
 });

 it('routes payout review alerts to withdrawals queue with payoutId focus', () => {
 const url = resolveAdminNotificationTargetUrl(buildNotification({
 type: 'payout.requires_review',
 category: 'settlements',
 referenceId: 'payout-1',
 dataObject: {
 targetUrl: '/finances/payouts',
 payload: {
 payoutId: 'payout-1'
 }
 }
 }));

 expect(url).toBe('/finances/withdrawals?payoutId=payout-1');
 });

 it('routes driver withdrawal alerts to withdrawals queue with focus', () => {
 const url = resolveAdminNotificationTargetUrl(buildNotification({
 type: 'settlement.requested',
 category: 'settlements',
 referenceId: 'withdrawal-1',
 dataObject: {
 targetUrl: '/finances/withdrawals',
 payload: {
 withdrawalId: 'withdrawal-1'
 }
 }
 }));

 expect(url).toBe('/finances/withdrawals?focus=withdrawal-1');
 });

 it('routes settlement failure alerts to settlement detail focus', () => {
 const url = resolveAdminNotificationTargetUrl(buildNotification({
 type: 'settlement.failed',
 category: 'settlements',
 referenceId: 'payout-1',
 dataObject: {
 targetUrl: '/finances/settlements',
 payload: {
 settlementId: 'settlement-1',
 payoutId: 'payout-1'
 }
 }
 }));

 expect(url).toBe('/finances/settlements?focus=settlement-1&payoutId=payout-1');
 });

 it('maps dispute caseId query params to focus', () => {
 const url = resolveAdminNotificationTargetUrl(buildNotification({
 type: 'dispute.created',
 category: 'disputes',
 referenceId: 'case-1',
 dataObject: {
 targetUrl: '/disputes?caseId=case-1',
 caseId: 'case-1'
 }
 }));

 expect(url).toBe('/disputes?focus=case-1');
 });

 it('routes legacy access approval inbox links to driver verification focus', () => {
 const url = resolveAdminNotificationTargetUrl(buildNotification({
 type: 'driver.critical_change_submitted',
 category: 'drivers',
 referenceId: 'driver-1',
 dataObject: {
 targetUrl: '/admin/access/approvals',
 payload: { driverId: 'driver-1', section: 'personal' }
 }
 }));

 expect(url).toBe('/drivers/driver-1?tab=verification&focus=approval');
 });

 it('routes vendor section review alerts to compliance review focus', () => {
 const url = resolveAdminNotificationTargetUrl(buildNotification({
 type: 'vendor.banking_updated',
 category: 'vendors',
 referenceId: 'vendor-1',
 dataObject: {
 targetUrl: '/vendors/vendor-1/compliance',
 payload: { vendorId: 'vendor-1', section: 'banking' }
 }
 }));

 expect(url).toBe('/vendors/vendor-1/compliance?section=banking&focus=review');
 });

 it('routes support ticket paths to vendor support tab', () => {
 const url = resolveAdminNotificationTargetUrl(buildNotification({
 type: 'support.ticket_created',
 category: 'support',
 referenceId: 'ticket-1',
 dataObject: {
 targetUrl: '/support/tickets/ticket-1'
 }
 }));

 expect(url).toBe('/support?tab=vendor&ticketId=ticket-1');
 });

 it('routes order case paths to the correct admin queue', () => {
 const url = resolveAdminNotificationTargetUrl(buildNotification({
 type: 'support.created',
 category: 'support',
 referenceId: 'case-1',
 dataObject: {
 targetUrl: '/orders/order-1/cases/case-1',
 type: 'driver_account',
 caseId: 'case-1'
 }
 }));

 expect(url).toBe('/support?tab=driver&driverCaseId=case-1');
 });
});
