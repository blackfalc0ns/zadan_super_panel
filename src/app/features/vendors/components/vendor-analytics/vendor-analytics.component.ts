import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as echarts from 'echarts/core';
import { EChartsOption } from 'echarts';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import {
 AdminVendorAnalyticsDto,
 AdminVendorAnalyticsRange,
 VendorService
} from '@vendors/services/vendor.api.service';
import { VendorDetail } from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

echarts.use([
 LineChart,
 BarChart,
 PieChart,
 GridComponent,
 LegendComponent,
 TooltipComponent,
 CanvasRenderer
]);

interface AnalyticsRangeOption {
 value: AdminVendorAnalyticsRange;
 labelKey: string;
}

interface AnalyticsKpiCard {
 icon: string;
 labelKey: string;
 value: string;
 tone: 'primary' | 'success' | 'warning';
}

interface AnalyticsStatusLegendItem {
 key: string;
 labelKey: string;
 count: string;
 percentage: string;
 color: string;
}

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-vendor-analytics',
 standalone: true,
 imports: [CommonModule, TranslateModule, NgxEchartsDirective],
 providers: [provideEchartsCore({ echarts })],
 templateUrl: './vendor-analytics.component.html',
 styleUrl: './vendor-analytics.component.scss'
})
export class VendorAnalyticsComponent {
 private readonly cdr = inject(ChangeDetectorRef);
 private readonly destroyRef = inject(DestroyRef);

 readonly rangeOptions: AnalyticsRangeOption[] = [
 { value: '7d', labelKey: 'VENDOR_ANALYTICS.RANGE.7D' },
 { value: '30d', labelKey: 'VENDOR_ANALYTICS.RANGE.30D' },
 { value: '90d', labelKey: 'VENDOR_ANALYTICS.RANGE.90D' }
 ];

 readonly statusColors: Record<string, string> = {
 completed: '#127c8c',
 in_progress: '#f59e0b',
 awaiting_action: '#3b82f6',
 cancelled: '#ef4444',
 failed: '#7c3aed'
 };

 currentLang = 'ar';
 isRTL = true;
 selectedRange: AdminVendorAnalyticsRange = '30d';

 vendorDetail: VendorDetail | null = null;
 analytics: AdminVendorAnalyticsDto | null = null;

 isLoading = false;
 hasLoaded = false;
 hasError = false;

 kpiCards: AnalyticsKpiCard[] = [];
 statusLegendItems: AnalyticsStatusLegendItem[] = [];
 salesTrendOptions: EChartsOption = {};
 statusBreakdownOptions: EChartsOption = {};
 topProductsOptions: EChartsOption = {};

 constructor(
 private readonly translate: TranslateService,
 private readonly vendorService: VendorService,
 private readonly vendorDetailFacade: VendorDetailFacade
 ) {
 this.currentLang = this.translate.currentLang || 'ar';
 this.isRTL = this.currentLang === 'ar';

 this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
 this.cdr.markForCheck();
 this.currentLang = event.lang;
 this.isRTL = event.lang === 'ar';
 this.rebuildView();
 });

 this.vendorDetailFacade.vendor$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((vendor) => {
 this.cdr.markForCheck();
 if (!vendor) {
 return;
 }

 const vendorChanged = vendor.id!== this.vendorDetail?.id;
 this.vendorDetail = vendor;

 if (vendorChanged ||!this.hasLoaded) {
 this.loadAnalytics();
 return;
 }

 this.rebuildView();
 });
 }

 get hasExecutiveData(): boolean {
 return!!this.analytics && (this.analytics.summary.totalOrders > 0 || this.analytics.topProducts.length > 0);
 }

 get vendorDisplayName(): string {
 if (!this.vendorDetail) {
 return '';
 }

 return this.currentLang === 'ar'
 ? (this.vendorDetail.businessNameAr || this.vendorDetail.businessNameEn)
 : (this.vendorDetail.businessNameEn || this.vendorDetail.businessNameAr);
 }

 get generatedAtLabel(): string {
 const value = this.analytics?.meta.generatedAtUtc;
 return value ? this.formatDateTime(value) : '-';
 }

 get periodLabel(): string {
 if (!this.analytics) {
 return '-';
 }

 return `${this.formatShortDate(this.analytics.meta.fromUtc)} - ${this.formatShortDate(this.analytics.meta.toUtc)}`;
 }

 get topProductsMaxRevenue(): number {
 return Math.max(...(this.analytics?.topProducts.map((item) => item.revenue) ?? [0]));
 }

 get hasStatusBreakdownData(): boolean {
 return this.statusLegendItems.length > 0 && (this.analytics?.summary.totalOrders ?? 0) > 0;
 }

 get activeWorkloadCount(): number {
 if (!this.analytics) return 0;
 return this.analytics.orderStatusBreakdown.filter((s) => ['pending', 'processing', 'shipped', 'in_progress'].some(term => s.status.toLowerCase().includes(term))).reduce((sum, s) => sum + s.count, 0);
 }

 get dailyAverageRevenue(): number {
 if (!this.analytics) return 0;
 const days = parseInt(this.analytics.meta.range.replace(/\D/g, ''), 10) || 30;
 return this.analytics.summary.totalRevenue / days;
 }

 get revenueConcentration(): number {
 if (!this.analytics || this.analytics.summary.totalRevenue === 0) return 0;
 const topProductsRevenue = this.analytics.topProducts.reduce((sum, p) => sum + p.revenue, 0);
 return topProductsRevenue / this.analytics.summary.totalRevenue;
 }

 get inventoryRiskRatio(): number {
 if (!this.analytics) return 0;
 const h = this.analytics.productHealth;
 const total = h.available + h.lowStock + h.outOfStock + h.inactive;
 if (total === 0) return 0;
 return (h.lowStock + h.outOfStock) / total;
 }

 get totalProductHealthCount(): number {
 if (!this.analytics) return 0;
 const h = this.analytics.productHealth;
 return h.available + h.lowStock + h.outOfStock + h.inactive;
 }

 get topProductRevenueShare(): number {
 if (!this.analytics || this.analytics.summary.totalRevenue === 0 || this.analytics.topProducts.length === 0) {
 return 0;
 }

 return this.analytics.topProducts[0].revenue / this.analytics.summary.totalRevenue;
 }

 get performanceScore(): number {
 if (!this.analytics) return 0;

 const summary = this.analytics.summary;
 const health = this.analytics.productHealth;
 const totalProducts = this.totalProductHealthCount;
 const completionScore = Math.max(0, Math.min(summary.completionRate, 100)) / 100;
 const cancellationScore = 1 - (Math.max(0, Math.min(summary.cancellationRate, 100)) / 100);
 const stockScore = 1 - this.inventoryRiskRatio;
 const availabilityScore = totalProducts > 0 ? health.available / totalProducts : 0;

 return Math.max(0, Math.min(1, (completionScore * 0.45) + (cancellationScore * 0.25) + (stockScore * 0.2) + (availabilityScore * 0.1)));
 }

 get performanceScoreLabel(): string {
 return this.formatPercent(this.performanceScore * 100);
 }

 get dominantProductName(): string {
 return this.analytics?.topProducts[0]?.productName ?? '-';
 }

 get performanceRingStyle(): string {
 const degrees = Math.round(this.performanceScore * 360);
 return `conic-gradient(#127c8c ${degrees}deg, #e2e8f0 ${degrees}deg)`;
 }

 get performanceScoreTone(): 'success' | 'warning' | 'danger' {
 if (this.performanceScore >= 0.75) {
 return 'success';
 }
 if (this.performanceScore >= 0.5) {
 return 'warning';
 }
 return 'danger';
 }

 getProductHealthShare(kind: 'available' | 'lowStock' | 'outOfStock' | 'inactive'): number {
 const total = this.totalProductHealthCount;
 if (!this.analytics || total === 0) {
 return 0;
 }

 const health = this.analytics.productHealth;
 const value = health[kind];
 return (value / total) * 100;
 }

 get operationsSignalLabel(): string {
 if (!this.analytics) return '-';

 if (this.inventoryRiskRatio > 0.3) {
 return this.isRTL ? 'راجع المخزون الحين' : 'Review inventory now';
 }

 if (this.analytics.summary.cancellationRate > 15) {
 return this.isRTL ? 'قلل الإلغاءات' : 'Reduce cancellations';
 }

 if (this.activeWorkloadCount > 0) {
 return this.isRTL ? 'تابع الطلبات النشطة' : 'Track active workload';
 }

 return this.isRTL ? 'الأداء مستقر' : 'Performance is steady';
 }

 selectRange(range: AdminVendorAnalyticsRange): void {
 if (range === this.selectedRange || this.isLoading) {
 return;
 }

 this.selectedRange = range;
 this.loadAnalytics();
 }

 getStatusToneClass(status: string): string {
 return ({
 completed: 'bg-primary/10 text-primary border-primary/15',
 in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
 awaiting_action: 'bg-sky-50 text-sky-700 border-sky-200',
 cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
 failed: 'bg-violet-50 text-violet-700 border-violet-200'
 } as Record<string, string>)[status] ?? 'bg-slate-100 text-slate-700 border-slate-200';
 }

 trackByRange(_: number, option: AnalyticsRangeOption): AdminVendorAnalyticsRange {
 return option.value;
 }

 trackByProduct(index: number): string {
 return this.analytics?.topProducts[index]?.vendorProductId ?? index.toString();
 }

 private loadAnalytics(): void {
 if (!this.vendorDetail) {
 return;
 }

 this.isLoading = true;
 this.hasError = false;

 this.vendorService.getVendorAnalytics(this.vendorDetail.id, this.selectedRange).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
 next: (analytics) => {
 this.cdr.markForCheck();
 this.analytics = analytics;
 this.hasLoaded = true;
 this.isLoading = false;
 this.rebuildView();
 },
 error: () => {
 this.cdr.markForCheck();
 this.analytics = null;
 this.kpiCards = [];
 this.statusLegendItems = [];
 this.salesTrendOptions = {};
 this.statusBreakdownOptions = {};
 this.topProductsOptions = {};
 this.hasLoaded = true;
 this.hasError = true;
 this.isLoading = false;
 }
 });
 }

 private rebuildView(): void {
 if (!this.analytics) {
 return;
 }

 const summary = this.analytics.summary;

 this.kpiCards = [
 {
 icon: 'payments',
 labelKey: 'VENDOR_ANALYTICS.KPIS.TOTAL_REVENUE',
 value: this.formatCurrency(summary.totalRevenue),
 tone: 'primary'
 },
 {
 icon: 'receipt_long',
 labelKey: 'VENDOR_ANALYTICS.KPIS.TOTAL_ORDERS',
 value: this.formatNumber(summary.totalOrders),
 tone: 'primary'
 },
 {
 icon: 'monitoring',
 labelKey: 'VENDOR_ANALYTICS.KPIS.AVERAGE_ORDER',
 value: this.formatCurrency(summary.averageOrderValue),
 tone: 'success'
 },
 {
 icon: 'task_alt',
 labelKey: 'VENDOR_ANALYTICS.KPIS.COMPLETION_RATE',
 value: this.formatPercent(summary.completionRate),
 tone: 'success'
 },
 {
 icon: 'warning',
 labelKey: 'VENDOR_ANALYTICS.KPIS.CANCELLATION_RATE',
 value: this.formatPercent(summary.cancellationRate),
 tone: 'warning'
 },
 {
 icon: 'inventory_2',
 labelKey: 'VENDOR_ANALYTICS.KPIS.STOCK_RISK',
 value: this.formatNumber(summary.lowStockProducts),
 tone: 'warning'
 }
 ];

 this.statusLegendItems = this.analytics.orderStatusBreakdown.map((item) => ({
 key: item.status,
 labelKey: `VENDOR_ANALYTICS.STATUS.${item.status.toUpperCase()}`,
 count: this.formatNumber(item.count),
 percentage: this.formatPercent(item.percentage),
 color: this.statusColors[item.status] ?? '#94a3b8'
 }));

 this.salesTrendOptions = this.buildSalesTrendOptions();
 this.statusBreakdownOptions = this.buildStatusBreakdownOptions();
 this.topProductsOptions = this.buildTopProductsOptions();
 }

 private buildSalesTrendOptions(): EChartsOption {
 const trend = this.analytics?.salesTrend ?? [];

 return {
 animationDuration: 400,
 grid: {
 left: 16,
 right: 16,
 top: 18,
 bottom: 8,
 containLabel: true
 },
 tooltip: {
 trigger: 'axis',
 backgroundColor: '#0f172a',
 borderWidth: 0,
 textStyle: {
 color: '#f8fafc',
 fontFamily: 'Cairo, sans-serif'
 },
 formatter: (params: unknown) => this.formatTrendTooltip(params)
 },
 xAxis: {
 type: 'category',
 boundaryGap: false,
 data: trend.map((point) => this.formatAxisDate(point.date)),
 axisTick: { show: false },
 axisLine: { lineStyle: { color: '#dbe5ee' } },
 axisLabel: {
 color: '#64748b',
 fontSize: 11
 }
 },
 yAxis: [
 {
 type: 'value',
 splitLine: { lineStyle: { color: '#e8eef4' } },
 axisLabel: {
 color: '#64748b',
 fontSize: 11,
 formatter: (value: number) => this.formatCompactNumber(value)
 }
 },
 {
 type: 'value',
 splitLine: { show: false },
 axisLabel: {
 color: '#94a3b8',
 fontSize: 11,
 formatter: (value: number) => this.formatCompactNumber(value)
 }
 }
 ],
 series: [
 {
 name: this.translate.instant('VENDOR_ANALYTICS.CHARTS.REVENUE_SERIES'),
 type: 'line',
 smooth: true,
 showSymbol: false,
 data: trend.map((point) => point.revenue),
 lineStyle: {
 width: 3,
 color: '#127c8c'
 },
 areaStyle: {
 color: 'rgba(18, 124, 140, 0.16)'
 }
 },
 {
 name: this.translate.instant('VENDOR_ANALYTICS.CHARTS.ORDERS_SERIES'),
 type: 'line',
 smooth: true,
 showSymbol: false,
 yAxisIndex: 1,
 data: trend.map((point) => point.ordersCount),
 lineStyle: {
 width: 2,
 color: '#f59e0b'
 }
 }
 ]
 };
 }

 private buildStatusBreakdownOptions(): EChartsOption {
 const statusItems = this.analytics?.orderStatusBreakdown ?? [];

 return {
 animationDuration: 400,
 tooltip: {
 trigger: 'item',
 backgroundColor: '#0f172a',
 borderWidth: 0,
 textStyle: {
 color: '#f8fafc',
 fontFamily: 'Cairo, sans-serif'
 },
 formatter: (params: any) => {
 const label = params?.data?.labelKey ? this.translate.instant(params.data.labelKey) : '';
 const count = this.formatNumber(params?.data?.count ?? 0);
 const percentage = this.formatPercent(params?.data?.percentage ?? 0);
 return `${label}<br/>${count} - ${percentage}`;
 }
 },
 series: [
 {
 type: 'pie',
 radius: ['62%', '80%'],
 center: ['50%', '50%'],
 avoidLabelOverlap: false,
 label: { show: false },
 labelLine: { show: false },
 itemStyle: {
 borderColor: '#ffffff',
 borderWidth: 5
 },
 data: statusItems.map((item) => ({
 value: item.count,
 name: this.translate.instant(`VENDOR_ANALYTICS.STATUS.${item.status.toUpperCase()}`),
 count: item.count,
 percentage: item.percentage,
 labelKey: `VENDOR_ANALYTICS.STATUS.${item.status.toUpperCase()}`,
 itemStyle: {
 color: this.statusColors[item.status] ?? '#94a3b8'
 }
 }))
 }
 ]
 };
 }

 private buildTopProductsOptions(): EChartsOption {
 const products = [...(this.analytics?.topProducts ?? [])].sort((a, b) => b.revenue - a.revenue).slice(0, 6).reverse();

 return {
 animationDuration: 450,
 grid: {
 left: this.isRTL ? 18 : 160,
 right: 18,
 top: 10,
 bottom: 8,
 containLabel: true
 },
 tooltip: {
 trigger: 'axis',
 axisPointer: {
 type: 'shadow'
 },
 backgroundColor: '#0f172a',
 borderWidth: 0,
 textStyle: {
 color: '#f8fafc',
 fontFamily: 'Cairo, sans-serif'
 },
 formatter: (params: any) => {
 const item = Array.isArray(params) ? params[0] : params;
 const index = item?.dataIndex ?? 0;
 const product = products[index];

 if (!product) {
 return '';
 }

 return [
 product.productName,
 `${this.isRTL ? 'الدخل' : 'Revenue'}: ${this.formatCurrency(product.revenue)}`,
 `${this.isRTL ? 'الوحدات' : 'Units'}: ${this.formatNumber(product.unitsSold)}`,
 `${this.isRTL ? 'الطلبات' : 'Orders'}: ${this.formatNumber(product.ordersCount)}`
 ].join('<br/>');
 }
 },
 xAxis: {
 type: 'value',
 splitLine: { lineStyle: { color: '#e8eef4' } },
 axisLabel: {
 color: '#64748b',
 fontSize: 10,
 formatter: (value: number) => this.formatCompactNumber(value)
 }
 },
 yAxis: {
 type: 'category',
 data: products.map((product) => product.productName),
 axisTick: { show: false },
 axisLine: { show: false },
 axisLabel: {
 color: '#334155',
 fontSize: 12,
 fontWeight: 800,
 width: 155,
 overflow: 'truncate'
 }
 },
 series: [
 {
 type: 'bar',
 data: products.map((product, index) => ({
 value: product.revenue,
 itemStyle: {
 color: index === products.length - 1 ? '#e48215' : '#127c8c'
 }
 })),
 barWidth: 12,
 barMaxWidth: 16,
 label: {
 show: true,
 position: this.isRTL ? 'left' : 'right',
 color: '#0f172a',
 fontSize: 10,
 fontWeight: 800,
 formatter: (params: any) => this.formatCompactNumber(Number(params.value ?? 0))
 },
 itemStyle: {
 borderRadius: [8, 8, 8, 8]
 }
 }
 ]
 };
 }

 private formatTrendTooltip(params: unknown): string {
 const items = Array.isArray(params) ? params as Array<{ seriesName: string; value: number; axisValueLabel: string }> : [];
 if (items.length === 0) {
 return '';
 }

 const title = items[0]?.axisValueLabel ?? '';
 const lines = items.map((item) => {
 const value = item.seriesName === this.translate.instant('VENDOR_ANALYTICS.CHARTS.REVENUE_SERIES')
 ? this.formatCurrency(item.value)
 : this.formatNumber(item.value);

 return `${item.seriesName}: ${value}`;
 });

 return [title,...lines].join('<br/>');
 }

 formatNumber(value: number): string {
 return new Intl.NumberFormat(this.locale, {
 maximumFractionDigits: 0
 }).format(value);
 }

 formatCompactNumber(value: number): string {
 return new Intl.NumberFormat(this.locale, {
 notation: 'compact',
 maximumFractionDigits: 1
 }).format(value);
 }

 formatCurrency(value: number): string {
 return `${new Intl.NumberFormat(this.locale, {
 minimumFractionDigits: 0,
 maximumFractionDigits: 1
 }).format(value)} ${this.translate.instant('COMMON.CURRENCY_SAR')}`;
 }

 formatPercent(value: number): string {
 return `${new Intl.NumberFormat(this.locale, {
 minimumFractionDigits: 0,
 maximumFractionDigits: 1
 }).format(value)}%`;
 }

 formatShortDate(value: string): string {
 return new Intl.DateTimeFormat(this.locale, { timeZone: 'Asia/Riyadh',
 day: 'numeric',
 month: 'short'
 }).format(new Date(value));
 }

 formatAxisDate(value: string): string {
 return new Intl.DateTimeFormat(this.locale, { timeZone: 'Asia/Riyadh',
 day: 'numeric',
 month: 'numeric'
 }).format(new Date(value));
 }

 formatDateTime(value: string): string {
 return new Intl.DateTimeFormat(this.locale, { timeZone: 'Asia/Riyadh',
 day: 'numeric',
 month: 'short',
 hour: 'numeric',
 minute: '2-digit'
 }).format(new Date(value));
 }

 private get locale(): string {
 return this.currentLang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US';
 }
}
