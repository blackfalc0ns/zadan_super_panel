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
  DashboardSupplyBucket
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

  getDashboardSnapshot(
    filterState: DashboardFilterState,
    lang: 'ar' | 'en' = 'ar'
  ): Observable<DashboardSnapshot> {
    let params = new HttpParams()
      .set('period', filterState.dateRange)
      .set('region', filterState.region);

    if (filterState.vendorId !== 'all') {
      params = params.set('vendorId', filterState.vendorId);
    }

    return this.http
      .get<AdminDashboardOverviewDto>(`${environment.apiUrl}/admin/dashboard/overview`, { params })
      .pipe(map((response) => this.mapResponse(response, filterState, lang)));
  }

  private mapResponse(
    response: AdminDashboardOverviewDto,
    filterState: DashboardFilterState,
    lang: 'ar' | 'en'
  ): DashboardSnapshot {
    return {
      filterState: {
        ...filterState,
        dateRange: response.meta.period,
        region: response.meta.region,
        vendorId: response.meta.vendorId || 'all',
        refreshMode: 'manual'
      },
      filterOptions: {
        dateRanges: this.mapFilterOptions(response.filters.dateRanges),
        regions: this.mapFilterOptions(response.filters.regions),
        vendors: this.mapFilterOptions(response.filters.vendors)
      },
      headerSummary: response.meta.scopeSummary,
      lastUpdatedLabel: this.formatDateTime(response.meta.generatedAtUtc, lang),
      systemMode: response.meta.mode,
      systemStatusLabelKey: response.meta.mode === 'live'
        ? 'DASHBOARD.SYSTEM_STATUS.LIVE'
        : 'DASHBOARD.SYSTEM_STATUS.SNAPSHOT',
      kpis: response.heroKpis.map((kpi): DashboardKpiCard => ({
        id: kpi.id,
        labelKey: kpi.labelKey,
        value: kpi.displayValue,
        unitLabel: kpi.unit ?? undefined,
        trendLabel: kpi.changeLabel,
        trendDirection: kpi.trendDirection,
        severity: kpi.severity,
        contextKey: kpi.contextKey
      })),
      alerts: response.alerts,
      queues: response.queues,
      charts: response.charts,
      attentionItems: response.attentionItems,
      auditItems: response.auditFeed,
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
      ]
    };
  }

  private mapFilterOptions(options: Array<{ value: string; label: string; count?: number }>): DashboardFilterOption[] {
    return options.map((option) => ({
      value: option.value,
      label: option.label,
      count: option.count
    }));
  }

  private formatDateTime(value: string, lang: 'ar' | 'en'): string {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(value));
  }
}
