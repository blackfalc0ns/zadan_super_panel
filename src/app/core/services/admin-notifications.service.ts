import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { AdminNotificationSound, normalizeAdminNotificationSound } from './admin-notification-sound.service';
import { resolveAdminNotificationTargetUrl, sanitizeAdminNotificationInternalPath } from '../utils/admin-notification-routing.utils';

export type AdminNotificationPriority = 'low' | 'normal' | 'high' | 'critical' | string;
export type AdminNotificationCategory =
 | 'drivers'
 | 'vendors'
 | 'disputes'
 | 'refunds'
 | 'settlements'
 | 'support'
 | 'system'
 | string;

export interface AdminNotification {
 id: string;
 titleAr: string;
 titleEn: string;
 bodyAr: string;
 bodyEn: string;
 type?: string | null;
 category?: AdminNotificationCategory | null;
 priority?: AdminNotificationPriority | null;
 referenceId?: string | null;
 data?: string | null;
 dataObject?: Record<string, unknown> | null;
 isRead: boolean;
 createdAtUtc?: string | null;
}

export interface AdminNotificationListResponse {
 items: AdminNotification[];
 page: number;
 perPage: number;
 total: number;
 unreadCount: number;
 hasMore: boolean;
}

export interface AdminNotificationFilters {
 page?: number;
 perPage?: number;
 type?: string | null;
 category?: string | null;
 priority?: string | null;
 isRead?: boolean | null;
 fromUtc?: string | null;
 toUtc?: string | null;
}

export interface AdminNotificationCategoryPreferences {
 drivers: boolean;
 vendors: boolean;
 catalog: boolean;
 disputes: boolean;
 refunds: boolean;
 settlements: boolean;
 support: boolean;
 system: boolean;
}

export interface AdminNotificationPreferences {
 pushEnabled: boolean;
 categories: AdminNotificationCategoryPreferences;
 sound: AdminNotificationSound;
 criticalAlwaysOn: boolean;
 webDeviceCount: number;
}

interface AdminUnreadCountResponse {
 count: number;
}

interface AdminNotificationPreferencesApiResponse {
 pushEnabled?: boolean;
 categories?: Partial<AdminNotificationCategoryPreferences> | null;
 sound?: string | null;
 criticalAlwaysOn?: boolean;
 webDeviceCount?: number;
}

@Injectable({
 providedIn: 'root'
})
export class AdminNotificationsService {
 private readonly apiUrl = `${environment.apiUrl}/admin/notifications`;
 private readonly unreadCountSubject = new BehaviorSubject<number>(0);
 private readonly recentSubject = new BehaviorSubject<AdminNotification[]>([]);

 readonly unreadCount$ = this.unreadCountSubject.asObservable();
 readonly recent$ = this.recentSubject.asObservable();

 constructor(
 private readonly http: HttpClient,
 private readonly authService: AuthService
 ) {}

 get requiresApiSession(): boolean {
 return this.authService.isDevelopmentBypassActive &&!this.authService.hasApiSession;
 }

 getPreferences(): Observable<AdminNotificationPreferences> {
 if (this.requiresApiSession) {
 return of(this.createDefaultPreferences());
 }

 return this.http.get<AdminNotificationPreferencesApiResponse>(`${this.apiUrl}/preferences`).pipe(
 map((response) => this.normalizePreferences(response)),
 catchError(() => of(this.createDefaultPreferences()))
 );
 }

 updatePreferences(payload: AdminNotificationPreferences): Observable<AdminNotificationPreferences> {
 const requestBody = {
 pushEnabled: payload.pushEnabled,
 categories: payload.categories,
 sound: normalizeAdminNotificationSound(payload.sound)
 };

 if (this.requiresApiSession) {
 return of(this.normalizePreferences({...requestBody,
 criticalAlwaysOn: true,
 webDeviceCount: 0
 }));
 }

 return this.http.put<AdminNotificationPreferencesApiResponse>(`${this.apiUrl}/preferences`, requestBody).pipe(
 map((response) => this.normalizePreferences(response)),
 catchError(() => of(this.normalizePreferences({...requestBody,
 criticalAlwaysOn: true,
 webDeviceCount: 0
 })))
 );
 }

 list(filters: AdminNotificationFilters = {}): Observable<AdminNotificationListResponse> {
 if (this.requiresApiSession) {
 return of({
 items: [],
 page: filters.page ?? 1,
 perPage: filters.perPage ?? 20,
 total: 0,
 unreadCount: 0,
 hasMore: false
 });
 }

 let params = new HttpParams().set('page', String(filters.page ?? 1)).set('per_page', String(filters.perPage ?? 20));

 if (filters.type) params = params.set('type', filters.type);
 if (filters.category) params = params.set('category', filters.category);
 if (filters.priority) params = params.set('priority', filters.priority);
 if (filters.isRead!== undefined && filters.isRead!== null) params = params.set('is_read', String(filters.isRead));
 if (filters.fromUtc) params = params.set('from_utc', filters.fromUtc);
 if (filters.toUtc) params = params.set('to_utc', filters.toUtc);

 return this.http.get<AdminNotificationListResponse>(this.apiUrl, { params }).pipe(
 map((response) => ({...response,
 items: this.uniqueNotifications((response.items ?? []).map((item) => this.normalizeNotification(item)))
 }))
 );
 }

 refreshRecent(): Observable<AdminNotificationListResponse> {
 return this.list({ page: 1, perPage: 8 }).pipe(
 tap((response) => {
 this.recentSubject.next(response.items);
 this.unreadCountSubject.next(Math.max(0, response.unreadCount || 0));
 }),
 catchError(() => of({
 items: [],
 page: 1,
 perPage: 8,
 total: 0,
 unreadCount: 0,
 hasMore: false
 }))
 );
 }

 getUnreadCount(): Observable<number> {
 if (this.requiresApiSession) {
 this.unreadCountSubject.next(0);
 return of(0);
 }

 return this.http.get<AdminUnreadCountResponse>(`${this.apiUrl}/unread-count`).pipe(
 map((response) => Math.max(0, response.count || 0)),
 tap((count) => this.unreadCountSubject.next(count)),
 catchError(() => of(0))
 );
 }

 markAsRead(id: string): Observable<void> {
 if (this.requiresApiSession) {
 return of(void 0);
 }

 return this.http.post<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
 tap(() => this.markLocalRead(id))
 );
 }

 markAllAsRead(): Observable<void> {
 if (this.requiresApiSession) {
 return of(void 0);
 }

 return this.http.post<void>(`${this.apiUrl}/read-all`, {}).pipe(
 tap(() => {
 this.recentSubject.next(this.recentSubject.value.map((item) => ({...item, isRead: true })));
 this.unreadCountSubject.next(0);
 })
 );
 }

 sendTestNotification(): Observable<{ eventId?: string; status?: string }> {
 if (this.requiresApiSession) {
 return of({});
 }

 return this.http.post<{ eventId?: string; status?: string }>(`${this.apiUrl}/test`, {});
 }

 mergeRealtimeNotification(notification: AdminNotification): void {
 const normalized = this.normalizeNotification(notification);
 const existing = this.recentSubject.value.filter((item) => item.id!== normalized.id);
 this.recentSubject.next(this.uniqueNotifications([normalized,...existing]).slice(0, 8));
 this.unreadCountSubject.next(this.unreadCountSubject.value + (notification.isRead ? 0 : 1));
 }

 getLocalizedTitle(notification: AdminNotification, lang: string): string {
 return this.resolveLocalizedNotificationText(notification, lang, 'title');
 }

 getLocalizedBody(notification: AdminNotification, lang: string): string {
 return this.resolveLocalizedNotificationText(notification, lang, 'body');
 }

 getPriorityLabel(priority: string | null | undefined, lang: string): string {
 const key = (priority ?? 'normal').toLowerCase();
 const labels: Record<string, { ar: string; en: string }> = {
 low: { ar: 'منخفض', en: 'Low' },
 normal: { ar: 'عادي', en: 'Normal' },
 high: { ar: 'مهم', en: 'High' },
 critical: { ar: 'حرج', en: 'Critical' }
 };

 return labels[key]?.[this.resolveLang(lang)] ?? (priority || labels['normal'][this.resolveLang(lang)]);
 }

 getCategoryLabel(category: string | null | undefined, lang: string): string {
 const key = (category ?? 'system').toLowerCase();
 const labels: Record<string, { ar: string; en: string }> = {
 drivers: { ar: 'المندوبون', en: 'Drivers' },
 vendors: { ar: 'التجار', en: 'Vendors' },
 catalog: { ar: 'الكتالوج', en: 'Catalog' },
 disputes: { ar: 'النزاعات', en: 'Disputes' },
 refunds: { ar: 'الاسترجاعات', en: 'Refunds' },
 settlements: { ar: 'التسويات', en: 'Settlements' },
 support: { ar: 'الدعم', en: 'Support' },
 system: { ar: 'النظام', en: 'System' },
 delivery: { ar: 'التوصيل', en: 'Delivery' }
 };

 return labels[key]?.[this.resolveLang(lang)] ?? (category || labels['system'][this.resolveLang(lang)]);
 }

 resolveTargetUrl(notification: AdminNotification): string {
 return resolveAdminNotificationTargetUrl(notification);
 }

 /**
 * Validates that a server-supplied targetUrl is a SAFE in-app navigation path.
 *
 * Rules:
 * - Must start with a single forward slash (in-app absolute path).
 * - Must NOT start with two slashes (protocol-relative URLs like //evil.com).
 * - Must NOT contain a scheme (e.g. javascript:, data:, vbscript:).
 * - Must NOT contain control characters.
 *
 * Anything else is rejected to prevent open-redirect / XSS via navigateByUrl.
 */
 private sanitizeInternalPath(value: unknown): string | null {
 return sanitizeAdminNotificationInternalPath(value);
 }

 private tryParseData(data?: string | null): Record<string, unknown> | null {
 if (!data?.trim()) {
 return null;
 }

 try {
 const parsed = JSON.parse(data);
 return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
 } catch {
 return null;
 }
 }

 private extractString(value: unknown): string | null {
 return typeof value === 'string' && value.trim() ? value.trim() : null;
 }

 private markLocalRead(id: string): void {
 const updated = this.recentSubject.value.map((item) => item.id === id ? {...item, isRead: true } : item);
 this.recentSubject.next(updated);
 this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
 }

 private normalizeNotification(notification: AdminNotification): AdminNotification {
 const parsedData = this.tryParseData(notification.data);
 const dataObject = notification.dataObject ?? parsedData ?? null;

 return {...notification,
 dataObject,
 titleAr: notification.titleAr || this.resolveLocalizedNotificationText(notification, 'ar', 'title'),
 titleEn: notification.titleEn || this.resolveLocalizedNotificationText(notification, 'en', 'title'),
 bodyAr: notification.bodyAr || this.resolveLocalizedNotificationText(notification, 'ar', 'body'),
 bodyEn: notification.bodyEn || this.resolveLocalizedNotificationText(notification, 'en', 'body')
 };
 }

 private resolveLocalizedNotificationText(
 notification: AdminNotification,
 lang: string,
 field: 'title' | 'body'
 ): string {
 const normalizedLang = this.resolveLang(lang);
 const primary = normalizedLang === 'ar'
 ? (field === 'title' ? notification.titleAr : notification.bodyAr)
 : (field === 'title' ? notification.titleEn : notification.bodyEn);
 const secondary = normalizedLang === 'ar'
 ? (field === 'title' ? notification.titleEn : notification.bodyEn)
 : (field === 'title' ? notification.titleAr : notification.bodyAr);

 if (this.isUsableLocalizedText(primary, normalizedLang)) {
 return primary;
 }

 const fallback = this.getNotificationTemplate(notification.type, field, normalizedLang);
 if (fallback) {
 return fallback;
 }

 if (secondary?.trim()) {
 return secondary.trim();
 }

 return normalizedLang === 'ar'
 ? (field === 'title' ? 'إشعار إداري' : 'يوجد تحديث إداري جديد يحتاج إلى المتابعة.')
 : (field === 'title' ? 'Admin notification' : 'A new admin update needs attention.');
 }

 private getNotificationTemplate(type: string | null | undefined, field: 'title' | 'body', lang: 'ar' | 'en'): string | null {
 const key = (type ?? '').toLowerCase();
 const templates: Record<string, { title: { ar: string; en: string }; body: { ar: string; en: string } }> = {
 'admin.test': {
 title: { ar: 'اختبار إشعارات الأدمن', en: 'Admin notification test' },
 body: { ar: 'هذا إشعار اختبار للتأكد من عمل صندوق الوارد والتنبيهات الفورية.', en: 'This is a test notification for inbox and real-time delivery.' }
 },
 'driver.approval_requested': {
 title: { ar: 'طلب اعتماد مندوب جديد', en: 'New driver approval request' },
 body: { ar: 'يوجد مندوب جديد بانتظار مراجعة بياناته واعتماده.', en: 'A new driver is waiting for profile review and approval.' }
 },
 'driver.documents_submitted': {
 title: { ar: 'مستندات مندوب جاهزة للمراجعة', en: 'Driver documents ready for review' },
 body: { ar: 'قام المندوب بإرسال مستندات تحتاج إلى مراجعة الامتثال.', en: 'The driver submitted documents that need compliance review.' }
 },
 'driver.approval_blocked': {
 title: { ar: 'ما قدرنا اعتماد مندوب', en: 'Driver approval blocked' },
 body: { ar: 'اعتماد المندوب متوقف بسبب متطلبات أو مستندات ناقصة.', en: 'Driver approval is blocked by missing requirements or documents.' }
 },
 'vendor.approval_requested': {
 title: { ar: 'طلب اعتماد تاجر جديد', en: 'New vendor approval request' },
 body: { ar: 'يوجد تاجر جديد بانتظار مراجعة بياناته واعتماده.', en: 'A new vendor is waiting for onboarding review and approval.' }
 },
 'vendor.documents_submitted': {
 title: { ar: 'مستندات تاجر جاهزة للمراجعة', en: 'Vendor documents ready for review' },
 body: { ar: 'قام التاجر بإرسال مستندات تحتاج إلى مراجعة.', en: 'The vendor submitted documents that need review.' }
 },
 'vendor.critical_change_submitted': {
 title: { ar: 'تغيير حساس من تاجر', en: 'Critical vendor change submitted' },
 body: { ar: 'قام تاجر بإرسال تغيير حساس يحتاج إلى مراجعة الأدمن.', en: 'A vendor submitted a critical change that needs admin review.' }
 },
 'vendor.store_updated': {
 title: { ar: 'بيانات متجر جاهزة للمراجعة', en: 'Vendor store ready for review' },
 body: { ar: 'قام التاجر بتحديث بيانات المتجر وهي بانتظار مراجعتك.', en: 'A vendor updated store profile details and they are waiting for your review.' }
 },
 'vendor.owner_updated': {
 title: { ar: 'بيانات مالك جاهزة للمراجعة', en: 'Vendor owner details ready for review' },
 body: { ar: 'قام التاجر بتحديث بيانات المالك وهي بانتظار مراجعتك.', en: 'A vendor updated owner details and they are waiting for your review.' }
 },
 'vendor.contact_updated': {
 title: { ar: 'بيانات تواصل جاهزة للمراجعة', en: 'Vendor contact details ready for review' },
 body: { ar: 'قام التاجر بتحديث بيانات التواصل وهي بانتظار مراجعتك.', en: 'A vendor updated contact details and they are waiting for your review.' }
 },
 'vendor.legal_updated': {
 title: { ar: 'بيانات قانونية جاهزة للمراجعة', en: 'Vendor legal details ready for review' },
 body: { ar: 'قام التاجر بتحديث البيانات القانونية وهي بانتظار مراجعتك.', en: 'A vendor updated legal and tax details and they are waiting for your review.' }
 },
 'vendor.banking_updated': {
 title: { ar: 'بيانات بنكية جاهزة للمراجعة', en: 'Vendor banking details ready for review' },
 body: { ar: 'قام التاجر بتحديث البيانات البنكية وهي بانتظار مراجعتك.', en: 'A vendor updated payout banking details and they are waiting for your review.' }
 },
 'vendor.hours_updated': {
 title: { ar: 'تم تحديث ساعات عمل تاجر', en: 'Vendor operating hours updated' },
 body: { ar: 'قام أحد التجار بتحديث ساعات العمل.', en: 'A vendor updated operating hours.' }
 },
 'vendor.operations_updated': {
 title: { ar: 'تم تحديث إعدادات تشغيل تاجر', en: 'Vendor operations updated' },
 body: { ar: 'قام أحد التجار بتحديث إعدادات التشغيل.', en: 'A vendor updated operations settings.' }
 },
 'vendor.notification_settings_updated': {
 title: { ar: 'تم تحديث تفضيلات إشعارات تاجر', en: 'Vendor notification preferences updated' },
 body: { ar: 'قام أحد التجار بتحديث تفضيلات الإشعارات.', en: 'A vendor updated notification preferences.' }
 },
 'catalog.product_request_submitted': {
 title: { ar: 'طلب منتج جديد', en: 'New product request' },
 body: { ar: 'يوجد طلب منتج جديد بانتظار مراجعة الكتالوج.', en: 'A new product request is waiting for catalog review.' }
 },
 'catalog.brand_request_submitted': {
 title: { ar: 'طلب علامة تجارية جديد', en: 'New brand request' },
 body: { ar: 'يوجد طلب علامة تجارية جديد بانتظار المراجعة.', en: 'A new brand request is waiting for review.' }
 },
 'catalog.category_request_submitted': {
 title: { ar: 'طلب تصنيف جديد', en: 'New category request' },
 body: { ar: 'يوجد طلب تصنيف جديد بانتظار مراجعة الكتالوج.', en: 'A new category request is waiting for catalog review.' }
 },
 'dispute.created': {
 title: { ar: 'نزاع جديد', en: 'New dispute' },
 body: { ar: 'يوجد نزاع جديد يحتاج إلى متابعة فريق الدعم.', en: 'A new dispute needs support team attention.' }
 },
 'dispute.escalated': {
 title: { ar: 'تم تصعيد نزاع', en: 'Dispute escalated' },
 body: { ar: 'تم تصعيد نزاع ويحتاج إلى إجراء عاجل.', en: 'A dispute was escalated and needs urgent action.' }
 },
 'refund.requested': {
 title: { ar: 'طلب استرجاع جديد', en: 'New refund request' },
 body: { ar: 'يوجد طلب استرجاع يحتاج إلى مراجعة واعتماد.', en: 'A refund request needs review and approval.' }
 },
 'settlement.requested': {
 title: { ar: 'طلب تسوية جديد', en: 'New settlement request' },
 body: { ar: 'يوجد طلب تسوية مالية يحتاج إلى متابعة.', en: 'A financial settlement request needs attention.' }
 },
 'settlement.failed': {
 title: { ar: 'فشل تنفيذ تسوية', en: 'Settlement failed' },
 body: { ar: 'فشلت تسوية مالية وتحتاج إلى مراجعة السبب.', en: 'A financial settlement failed and needs review.' }
 },
 'support.critical_created': {
 title: { ar: 'حالة دعم حرجة', en: 'Critical support case' },
 body: { ar: 'توجد حالة دعم عالية الأولوية بانتظار المراجعة.', en: 'A high priority support case is waiting for review.' }
 },
 'support.created': {
 title: { ar: 'حالة دعم جديدة', en: 'New support case' },
 body: { ar: 'توجد حالة دعم جديدة بانتظار المراجعة.', en: 'A new support case is waiting for review.' }
 },
 'support.updated': {
 title: { ar: 'تحديث على حالة دعم', en: 'Support case updated' },
 body: { ar: 'تم تحديث حالة دعم وتحتاج إلى متابعة.', en: 'A support case was updated and may need follow-up.' }
 },
 'support.ticket_created': {
 title: { ar: 'تذكرة دعم تاجر جديدة', en: 'New vendor support ticket' },
 body: { ar: 'فتح تاجر تذكرة دعم جديدة بانتظار مراجعة الفريق.', en: 'A vendor opened a new support ticket for review.' }
 },
 'support.ticket_updated': {
 title: { ar: 'رد جديد على دعم التاجر', en: 'Vendor support ticket updated' },
 body: { ar: 'أضاف تاجر ردا جديدا على تذكرة دعم.', en: 'A vendor added a new reply to a support ticket.' }
 },
 'system.integration_failure': {
 title: { ar: 'فشل في تكامل النظام', en: 'System integration failure' },
 body: { ar: 'حدث خطأ في تكامل خارجي ويحتاج إلى مراجعة تقنية.', en: 'An external integration failed and needs technical review.' }
 },
 'system.onesignal_failure': {
 title: { ar: 'ما قدرنا نرسل إشعارات الدفع', en: 'Push notification failure' },
 body: { ar: 'ما قدرنا نرسل بعض إشعارات الدفع عبر OneSignal.', en: 'Some push notifications could not be sent through OneSignal.' }
 }
 };

 return templates[key]?.[field][lang] ?? null;
 }

 private isUsableLocalizedText(value: string | null | undefined, lang: 'ar' | 'en'): value is string {
 const text = value?.trim();
 if (!text) {
 return false;
 }

 if (lang === 'ar') {
 return /[\u0600-\u06FF]/.test(text) &&!/[ØÙÃ]/.test(text);
 }

 return!/[ØÙÃ]/.test(text);
 }

 private uniqueNotifications(notifications: AdminNotification[]): AdminNotification[] {
 const seen = new Set<string>();
 return notifications.filter((notification) => {
 const key = notification.id || [
 notification.type ?? '',
 notification.referenceId ?? '',
 notification.createdAtUtc ?? '',
 notification.titleEn ?? notification.titleAr ?? ''
 ].join('|');

 if (seen.has(key)) {
 return false;
 }

 seen.add(key);
 return true;
 });
 }

 private resolveLang(lang: string): 'ar' | 'en' {
 return lang?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
 }

 private createDefaultPreferences(): AdminNotificationPreferences {
 return {
 pushEnabled: true,
 categories: {
 drivers: true,
 vendors: true,
 catalog: true,
 disputes: true,
 refunds: true,
 settlements: true,
 support: true,
 system: true
 },
 sound: 'classic',
 criticalAlwaysOn: true,
 webDeviceCount: 0
 };
 }

 private normalizePreferences(response?: AdminNotificationPreferencesApiResponse | null): AdminNotificationPreferences {
 const fallback = this.createDefaultPreferences();
 return {
 pushEnabled: response?.pushEnabled ?? fallback.pushEnabled,
 categories: {
 drivers: response?.categories?.drivers ?? fallback.categories.drivers,
 vendors: response?.categories?.vendors ?? fallback.categories.vendors,
 catalog: response?.categories?.catalog ?? fallback.categories.catalog,
 disputes: response?.categories?.disputes ?? fallback.categories.disputes,
 refunds: response?.categories?.refunds ?? fallback.categories.refunds,
 settlements: response?.categories?.settlements ?? fallback.categories.settlements,
 support: response?.categories?.support ?? fallback.categories.support,
 system: response?.categories?.system ?? fallback.categories.system
 },
 sound: normalizeAdminNotificationSound(response?.sound),
 criticalAlwaysOn: response?.criticalAlwaysOn ?? fallback.criticalAlwaysOn,
 webDeviceCount: Math.max(0, response?.webDeviceCount ?? fallback.webDeviceCount)
 };
 }

}
