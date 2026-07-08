import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
 DashboardAlert,
 DashboardAuditItem,
 DashboardDateRange,
 DashboardFilterOption,
 DashboardFilterState,
 DashboardKpiCard,
 DashboardQueue,
 DashboardSection,
 DashboardSeriesChart,
 DashboardSnapshot,
 DashboardSupplyBucket,
 GeographyCoverageSnapshot
} from '../models/dashboard.models';

interface AdminDashboardOverviewDto {
 meta: {
 period: DashboardDateRange;
 region: string;
 vendorId?: string | null;
 scopeSummary: string;
 mode: 'live' | 'snapshot';
 generatedAtUtc: string;
 };
 filters: {
 dateRanges: Array<{ value: string; label: string; count?: number }>;
 regions: Array<{ value: string; label: string; count?: number }>;
 vendors: Array<{ value: string; label: string; count?: number }>;
 };
 heroKpis: Array<{
 id: string;
 labelKey: string;
 value: number;
 displayValue: string;
 unit?: string | null;
 changeLabel: string;
 trendDirection: 'up' | 'down' | 'flat';
 severity: 'critical' | 'warning' | 'info' | 'success' | 'neutral';
 contextKey: string;
 }>;
 charts: {
 ordersTrend: DashboardSeriesChart;
 revenueTrend: DashboardSeriesChart;
 regionPressure: DashboardSnapshot['charts']['regionPressure'];
 vendorReadiness: DashboardSupplyBucket[];
 driverReadiness: DashboardSupplyBucket[];
 };
 alerts: Array<{
 id: string;
 severity: DashboardAlert['severity'];
 titleKey: string;
 summaryKey: string;
 summaryParams?: Record<string, string | number>;
 count: number;
 route: string;
 }>;
 queues: {
 live: DashboardQueue[];
 risk: DashboardQueue[];
 };
 attentionItems: DashboardSnapshot['attentionItems'];
 auditFeed: Array<{
 id: string;
 titleKey: string;
 titleParams?: Record<string, string | number>;
 subtitleKey: string;
 subtitleParams?: Record<string, string | number>;
 severity: DashboardAuditItem['severity'];
 timestampUtc: string;
 route: string;
 }>;
 sections: {
 systemHealth: DashboardSection;
 orderOps: DashboardSection;
 vendorOps: DashboardSection;
 driverOps: DashboardSection;
 customerSupport: DashboardSection;
 financeOps: DashboardSection;
 catalogHealth: DashboardSection;
 marketingPulse: DashboardSection;
 accessSecurity: DashboardSection;
 };
}

@Injectable({
 providedIn: 'root'
})
export class SuperAdminDashboardService {
 constructor(private readonly http: HttpClient) {}

 getGeographyCoverage(region = 'all', gapsOnly = false): Observable<GeographyCoverageSnapshot> {
 let params = new HttpParams().set('region', region);
 if (gapsOnly) {
 params = params.set('gapsOnly', 'true');
 }
 return this.http.get<Record<string, unknown>>(`${environment.apiUrl}/admin/geography/coverage`, { params }).pipe(map((response) => this.mapGeographyCoverageResponse(response)));
 }

 private mapGeographyCoverageResponse(response: Record<string, unknown>): GeographyCoverageSnapshot {
 const summary = this.readRecord(response, 'summary') ?? this.readRecord(response, 'Summary');
 const cities = this.readArray(response, 'cities') ?? this.readArray(response, 'Cities') ?? [];

 return {
 summary: {
 officialCityCount: this.readNumber(summary, 'officialCityCount', 'OfficialCityCount'),
 citiesWithGaps: this.readNumber(summary, 'citiesWithGaps', 'CitiesWithGaps'),
 customersWithoutVendor: this.readNumber(summary, 'customersWithoutVendor', 'CustomersWithoutVendor'),
 customersWithoutDriver: this.readNumber(summary, 'customersWithoutDriver', 'CustomersWithoutDriver'),
 unmappedCustomers: this.readNumber(summary, 'unmappedCustomers', 'UnmappedCustomers'),
 topDemandGaps: this.readTopDemandGaps(summary)
 },
 cities: cities.map((city) => this.mapCoverageCity(city)),
 regionRollup: (this.readArray(response, 'regionRollup') ?? this.readArray(response, 'RegionRollup') ?? []).map(
 (row) => {
 const region = row as Record<string, unknown>;
 return {
 regionCode: this.readString(region, 'regionCode', 'RegionCode'),
 regionNameAr: this.readString(region, 'regionNameAr', 'RegionNameAr'),
 regionNameEn: this.readString(region, 'regionNameEn', 'RegionNameEn'),
 customerCount: this.readNumber(region, 'customerCount', 'CustomerCount'),
 activeVendorCount: this.readNumber(region, 'activeVendorCount', 'ActiveVendorCount'),
 readyDriverCount: this.readNumber(region, 'readyDriverCount', 'ReadyDriverCount'),
 citiesWithGaps: this.readNumber(region, 'citiesWithGaps', 'CitiesWithGaps')
 };
 }
 )
 };
 }

 private mapCoverageCity(city: unknown): GeographyCoverageSnapshot['cities'][number] {
 const row = city as Record<string, unknown>;
 const routes = this.readRecord(row, 'routes') ?? this.readRecord(row, 'Routes');

 return {
 cityCode: this.readString(row, 'cityCode', 'CityCode'),
 regionCode: this.readString(row, 'regionCode', 'RegionCode'),
 cityNameAr: this.readString(row, 'cityNameAr', 'CityNameAr'),
 cityNameEn: this.readString(row, 'cityNameEn', 'CityNameEn'),
 customerCount: this.readNumber(row, 'customerCount', 'CustomerCount'),
 activeVendorCount: this.readNumber(row, 'activeVendorCount', 'ActiveVendorCount'),
 readyDriverCount: this.readNumber(row, 'readyDriverCount', 'ReadyDriverCount'),
 verifiedDriverCount: this.readNumber(row, 'verifiedDriverCount', 'VerifiedDriverCount'),
 activeBranchCount: this.readNumber(row, 'activeBranchCount', 'ActiveBranchCount'),
 gapFlags: (this.readArray(row, 'gapFlags') ?? this.readArray(row, 'GapFlags') ?? []) as GeographyCoverageSnapshot['cities'][number]['gapFlags'],
 routes: {
 customers: this.readString(routes, 'customers', 'Customers') || '/customers',
 vendors: this.readString(routes, 'vendors', 'Vendors') || '/vendors',
 drivers: this.readString(routes, 'drivers', 'Drivers') || '/drivers'
 }
 };
 }

 private readTopDemandGaps(summary: Record<string, unknown> | null): GeographyCoverageSnapshot['summary']['topDemandGaps'] {
 const rows = this.readArray(summary, 'topDemandGaps') ?? this.readArray(summary, 'TopDemandGaps') ?? [];
 return rows.map((row) => {
 const item = row as Record<string, unknown>;
 return {
 cityCode: this.readString(item, 'cityCode', 'CityCode'),
 cityNameAr: this.readString(item, 'cityNameAr', 'CityNameAr'),
 cityNameEn: this.readString(item, 'cityNameEn', 'CityNameEn'),
 customerCount: this.readNumber(item, 'customerCount', 'CustomerCount'),
 gapFlags: (this.readArray(item, 'gapFlags') ?? this.readArray(item, 'GapFlags') ?? []) as GeographyCoverageSnapshot['summary']['topDemandGaps'][number]['gapFlags']
 };
 });
 }

 private readRecord(source: Record<string, unknown> | null, key: string): Record<string, unknown> | null {
 const value = source?.[key];
 return value && typeof value === 'object' &&!Array.isArray(value) ? (value as Record<string, unknown>) : null;
 }

 private readArray(source: Record<string, unknown> | null, key: string): unknown[] | null {
 const value = source?.[key];
 return Array.isArray(value) ? value : null;
 }

 private readString(source: Record<string, unknown> | null | undefined,...keys: string[]): string {
 if (!source) {
 return '';
 }

 for (const key of keys) {
 const value = source[key];
 if (typeof value === 'string') {
 return value;
 }
 }

 return '';
 }

 private readNumber(source: Record<string, unknown> | null | undefined,...keys: string[]): number {
 if (!source) {
 return 0;
 }

 for (const key of keys) {
 const value = source[key];
 if (typeof value === 'number') {
 return value;
 }
 }

 return 0;
 }

 getDashboardSnapshot(
 filterState: DashboardFilterState,
 lang: 'ar' | 'en' = 'ar'
 ): Observable<DashboardSnapshot> {
 let params = new HttpParams().set('period', filterState.dateRange).set('region', filterState.region);

 if (filterState.vendorId!== 'all') {
 params = params.set('vendorId', filterState.vendorId);
 }

 return this.http.get<AdminDashboardOverviewDto>(`${environment.apiUrl}/admin/dashboard/overview`, { params }).pipe(map((response) => this.mapResponse(response, filterState, lang)));
 }

 private mapResponse(
 response: AdminDashboardOverviewDto,
 filterState: DashboardFilterState,
 lang: 'ar' | 'en'
 ): DashboardSnapshot {
 return {
 filterState: {...filterState,
 dateRange: response.meta.period,
 region: response.meta.region,
 vendorId: response.meta.vendorId || 'all',
 refreshMode: 'manual'
 },
 filterOptions: {
 dateRanges: this.mapFilterOptions(response.filters.dateRanges, lang),
 regions: this.mapFilterOptions(response.filters.regions, lang),
 vendors: this.mapFilterOptions(response.filters.vendors, lang)
 },
 headerSummary: this.localizeText(response.meta.scopeSummary, lang),
 lastUpdatedLabel: this.formatDateTime(response.meta.generatedAtUtc, lang),
 systemMode: response.meta.mode,
 systemStatusLabelKey: response.meta.mode === 'live'
 ? 'DASHBOARD.SYSTEM_STATUS.LIVE'
 : 'DASHBOARD.SYSTEM_STATUS.SNAPSHOT',
 kpis: response.heroKpis.map((kpi): DashboardKpiCard => ({
 id: kpi.id,
 labelKey: kpi.labelKey,
 value: kpi.displayValue,
 unitLabel: this.localizeText(kpi.unit ?? undefined, lang) || undefined,
 trendLabel: this.localizeText(kpi.changeLabel, lang),
 trendDirection: kpi.trendDirection,
 severity: kpi.severity,
 contextKey: kpi.contextKey
 })),
 alerts: response.alerts.map((alert) => this.withNormalizedRoute(alert)),
 queues: {
 live: response.queues.live.map((queue) => this.withNormalizedRoute(queue)),
 risk: response.queues.risk.map((queue) => this.withNormalizedRoute(queue))
 },
 charts: this.localizeCharts(response.charts, lang),
 attentionItems: response.attentionItems.map((item) => this.withNormalizedRoute({...item,
 entityName: this.localizeText(item.entityName, lang),
 summary: this.localizeText(item.summary, lang),
 owner: this.localizeText(item.owner, lang)
 })),
 auditItems: response.auditFeed.map((item) => this.withNormalizedRoute(item)),
 sections: [
 response.sections.systemHealth,
 response.sections.orderOps,
 response.sections.vendorOps,
 response.sections.driverOps,
 response.sections.customerSupport,
 response.sections.financeOps,
 response.sections.catalogHealth,
 response.sections.marketingPulse,
 response.sections.accessSecurity
 ].map((section) => this.normalizeSection(section, lang))
 };
 }

 private normalizeSection(section: DashboardSection, lang: 'ar' | 'en'): DashboardSection {
 return {...section,
 route: this.normalizeDashboardRoute(section.route),
 stats: section.stats.map((stat) => ({...stat,
 displayValue: this.localizeText(stat.displayValue, lang),
 unit: this.localizeText(stat.unit, lang) || undefined
 })),
 rankedLists: section.rankedLists.map((list) => ({...list,
 rows: list.rows.map((row) => this.withNormalizedRoute({...row,
 label: this.localizeText(row.label, lang),
 value: this.localizeText(row.value, lang),
 secondaryValue: this.localizeText(row.secondaryValue, lang) || undefined,
 metaLabel: this.localizeText(row.metaLabel, lang) || undefined
 }))
 })),
 exceptions: section.exceptions.map((exception) => this.withNormalizedRoute({...exception,
 entityLabel: this.localizeText(exception.entityLabel, lang),
 issueLabel: this.localizeText(exception.issueLabel, lang),
 ownerLabel: this.localizeText(exception.ownerLabel, lang),
 metricLabel: this.localizeText(exception.metricLabel, lang)
 }))
 };
 }

 private localizeCharts(charts: DashboardSnapshot['charts'], lang: 'ar' | 'en'): DashboardSnapshot['charts'] {
 return {
 ordersTrend: {...charts.ordersTrend,
 series: charts.ordersTrend.series.map((series) => ({...series,
 points: series.points.map((point) => ({...point,
 label: this.localizeText(point.label, lang)
 }))
 }))
 },
 revenueTrend: {...charts.revenueTrend,
 series: charts.revenueTrend.series.map((series) => ({...series,
 points: series.points.map((point) => ({...point,
 label: this.localizeText(point.label, lang)
 }))
 }))
 },
 regionPressure: charts.regionPressure.map((row) => this.withNormalizedRoute({...row,
 regionLabel: this.localizeText(row.regionLabel, lang)
 })),
 vendorReadiness: charts.vendorReadiness,
 driverReadiness: charts.driverReadiness
 };
 }

 private withNormalizedRoute<T extends { route: string }>(item: T): T {
 return {...item,
 route: this.normalizeDashboardRoute(item.route)
 };
 }

 private normalizeDashboardRoute(route: string | null | undefined): string {
 const fallbackRoute = '/dashboard';
 const trimmed = route?.trim();
 if (!trimmed) return fallbackRoute;

 const urlOnlyPath = trimmed.replace(/^https?:\/\/[^/]+/i, '');
 const normalized = urlOnlyPath.startsWith('/') ? urlOnlyPath : `/${urlOnlyPath}`;
 const [pathWithQuery, fragment = ''] = normalized.split('#');
 const [path, query = ''] = pathWithQuery.split('?');
 const suffix = `${query ? `?${query}` : ''}${fragment ? `#${fragment}` : ''}`;
 const cleanPath = path.replace(/\/+$/, '') || fallbackRoute;

 const orderCaseMatch = cleanPath.match(/^\/orders\/([^/]+)\/cases\/([^/]+)$/i);
 if (orderCaseMatch) {
 return `/disputes?focus=${encodeURIComponent(orderCaseMatch[2])}`;
 }

 const disputeDetailMatch = cleanPath.match(/^\/disputes\/([^/]+)$/i);
 if (disputeDetailMatch) {
 return `/disputes?focus=${encodeURIComponent(disputeDetailMatch[1])}`;
 }

 if (cleanPath === '/wallets') return `/finances/wallets${suffix}`;
 if (cleanPath.startsWith('/wallets/')) return `/finances${cleanPath}${suffix}`;
 if (cleanPath === '/notifications') return `/email-center${suffix}`;
 if (cleanPath.startsWith('/notifications/')) return `/email-center${suffix}`;
 if (cleanPath === '/catalog/product-requests' || cleanPath === '/catalog/requests') {
 return `/catalog/products?requests=1${suffix}`;
 }

 const catalogRequestViewMatch = cleanPath.match(/^\/catalog\/(?:product-requests|requests)\/view\/([^/]+)$/i);
 if (catalogRequestViewMatch) {
 return `/catalog/products?requests=1&requestId=${encodeURIComponent(catalogRequestViewMatch[1])}${suffix}`;
 }

 if (cleanPath.startsWith('/catalog/product-requests/')) {
 const legacyId = cleanPath.split('/').pop();
 return legacyId
 ? `/catalog/products?requests=1&requestId=${encodeURIComponent(legacyId)}${suffix}`
 : `/catalog/products?requests=1${suffix}`;
 }

 const knownRoots = [
 '/dashboard',
 '/orders',
 '/vendors',
 '/drivers',
 '/customers',
 '/disputes',
 '/finances',
 '/catalog',
 '/marketing',
 '/admin-users',
 '/email-center'
 ];

 if (knownRoots.some((root) => cleanPath === root || cleanPath.startsWith(`${root}/`))) {
 return `${cleanPath}${suffix}`;
 }

 return fallbackRoute;
 }

 private mapFilterOptions(
 options: Array<{ value: string; label: string; count?: number }>,
 lang: 'ar' | 'en'
 ): DashboardFilterOption[] {
 return options.map((option) => ({
 value: option.value,
 label: this.localizeText(option.label, lang),
 count: option.count
 }));
 }

 localizeText(value: string | number | null | undefined, lang: 'ar' | 'en'): string {
 if (value === null || value === undefined) return '';
 const text = `${value}`.trim();
 if (!text || lang!== 'ar') return text;

 const exact = this.dashboardArabicDictionary[text.toLowerCase()];
 if (exact) return exact;

 const queueMatch = text.match(/^Queue\s+(.+?)\s+still holds this case in\s+(.+)\.?$/i);
 if (queueMatch) {
 return `ما زالت قائمة ${this.localizeText(queueMatch[1], lang)} تحتفظ بهذه الحالة في مرحلة ${this.localizeText(queueMatch[2], lang)}.`;
 }

 const riskMatch = text.match(/^([\d,.]+)\s+risk$/i);
 if (riskMatch) return `${riskMatch[1]} مخاطر`;

 const criticalMatch = text.match(/^([\d,.]+)\s+critical$/i);
 if (criticalMatch) return `${criticalMatch[1]} حرجة`;

 const gapMatch = text.match(/^([\d,.]+)\s+gap$/i);
 if (gapMatch) return `${gapMatch[1]} فجوة`;

 const latePaymentMatch = text.match(/^([\d,.]+)\s+late\s*\/\s*([\d,.]+)\s+payment$/i);
 if (latePaymentMatch) return `${latePaymentMatch[1]} متأخرة / ${latePaymentMatch[2]} دفع`;

 const weekMatch = text.match(/^W(\d+)$/i);
 if (weekMatch) return `الأسبوع ${weekMatch[1]}`;

 const reviewMatch = text.match(/^Review #(.+)$/i);
 if (reviewMatch) return `مراجعة #${reviewMatch[1]}`;

 if (/^[\d,.]+\s+SAR$/i.test(text)) {
 return text.replace(/\s*SAR$/i, ' ر.س');
 }

 return text.replace(/\bSAR\b/g, 'ر.س').replace(/\bMon\b/g, 'الاثنين').replace(/\bTue\b/g, 'الثلاثاء').replace(/\bWed\b/g, 'الأربعاء').replace(/\bThu\b/g, 'الخميس').replace(/\bFri\b/g, 'الجمعة').replace(/\bSat\b/g, 'السبت').replace(/\bSun\b/g, 'الأحد');
 }

 private readonly dashboardArabicDictionary: Record<string, string> = {
 'today': 'اليوم',
 '7 days': 'آخر 7 أيام',
 '30 days': 'آخر 30 يوم',
 'all regions': 'كل المناطق',
 'all vendors': 'كل التجار',
 'all network': 'كل الشبكة',
 'central region': 'المنطقة الوسطى',
 'western region': 'المنطقة الغربية',
 'eastern region': 'المنطقة الشرقية',
 'northern region': 'المنطقة الشمالية',
 'southern region': 'المنطقة الجنوبية',
 'other regions': 'مناطق أخرى',
 'vendor': 'تاجر',
 'driver ops': 'عمليات المناديب',
 'vendor desk': 'فريق التجار',
 'driver finance': 'مالية المناديب',
 'customer experience': 'تجربة العملاء',
 'wallets': 'المحافظ',
 'finances': 'المالية',
 'catalog': 'الكتالوج',
 'superadmin': 'مدير عام',
 'admin': 'أدمن',
 'vendor + driver': 'التجار + المناديب',
 '+ healthy': '+ مستقر',
 '- needs action': '- يحتاج إجراء',
 '+0 payment': '+0 دفع',
 '+1 payment': '+1 دفع',
 '+2 payment': '+2 دفع',
 '+3 payment': '+3 دفع',
 'payment failure requires reviewer action.': 'فشل الدفع يحتاج إجراء من المراجع.',
 'order is drifting outside the target delivery band.': 'الطلب خرج عن نطاق التسليم المستهدف.',
 'vendor readiness is blocked and needs compliance or operational review.': 'جاهزية التاجر متوقفة وتحتاج مراجعة امتثال أو تشغيل.',
 'driver availability is blocked by verification or account hold.': 'إتاحة المندوب متوقفة بسبب التحقق أو تعليق الحساب.',
 'payment failure': 'فشل الدفع',
 'delivery flow outside target band': 'مسار التسليم خارج النطاق المستهدف',
 'vendor blocked': 'التاجر محظور',
 'orders currently disabled': 'استقبال الطلبات متوقف الحين',
 'driver withdrawals': 'سحوبات المناديب',
 'pending payout review': 'مراجعة صرف معلقة',
 'processing payout batch': 'دفعة صرف تحت المعالجة',
 'low rating without vendor reply': 'تقييم منخفض بدون رد من التاجر',
 'failed payments': 'مدفوعات فاشلة',
 'pending payments': 'مدفوعات معلقة',
 'pending settlements': 'تسويات معلقة',
 'failed settlements': 'تسويات فاشلة',
 'wallet inflow': 'تدفق داخل للمحفظة',
 'tracked inflow for selected window': 'تدفق داخل مرصود خلال الفترة المحددة',
 'wallet outflow': 'تدفق خارج من المحفظة',
 'tracked outflow for selected window': 'تدفق خارج مرصود خلال الفترة المحددة',
 'refund operations': 'عمليات الاسترجاع',
 'refund cases created in selected window': 'حالات استرجاع تم إنشاؤها خلال الفترة المحددة',
 'product requests': 'طلبات المنتجات',
 'pending catalog approvals': 'موافقات كتالوج معلقة',
 'brand requests': 'طلبات العلامات التجارية',
 'pending brand approvals': 'موافقات علامات تجارية معلقة',
 'category requests': 'طلبات التصنيفات',
 'pending category approvals': 'موافقات تصنيفات معلقة',
 'unavailable vendor products': 'منتجات تجار غير متاحة',
 'catalog entries not ready for selling': 'عناصر كتالوج غير جاهزة للبيع',
 'recent notifications': 'إشعارات حديثة',
 'unread notifications': 'إشعارات غير مقروءة',
 'low reviews needing reply': 'تقييمات منخفضة تحتاج رد',
 'admin accounts': 'حسابات الأدمن',
 'locked admin accounts': 'حسابات أدمن مقفلة',
 'permission version overrides': 'تجاوزات إصدار الصلاحيات',
 'admin login locked': 'تسجيل دخول الأدمن مقفل',
 'admin not active': 'الأدمن غير نشط',
 'Critical': 'حرجة',
 'critical': 'حرجة',
 'High': 'عالية',
 'high': 'عالية',
 'Medium': 'متوسطة',
 'medium': 'متوسطة',
 'Low': 'منخفضة',
 'low': 'منخفضة',
 'Submitted': 'مقدمة',
 'submitted': 'مقدمة',
 'InReview': 'تحت المراجعة',
 'inreview': 'تحت المراجعة',
 'Pending': 'معلق',
 'pending': 'معلق',
 'Processing': 'تحت المعالجة',
 'processing': 'تحت المعالجة',
 'Suspended': 'موقوف',
 'suspended': 'موقوف',
 'Active': 'نشط',
 'active': 'نشط',
 'Inactive': 'غير نشط',
 'inactive': 'غير نشط'
 };

 private formatDateTime(value: string, lang: 'ar' | 'en'): string {
 return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', { timeZone: 'Asia/Riyadh',
 day: 'numeric',
 month: 'short',
 hour: 'numeric',
 minute: '2-digit'
 }).format(new Date(value));
 }
}
