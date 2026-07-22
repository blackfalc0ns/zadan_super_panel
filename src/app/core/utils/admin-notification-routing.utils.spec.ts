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

 expect(url).toBe('/drivers/driver-1');
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
});
