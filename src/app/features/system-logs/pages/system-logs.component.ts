import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { interval, Subscription } from 'rxjs';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { KpiCardsComponent, KPICard } from '@shared/components/ui/kpi-cards/kpi-cards.component';
import { DataTableComponent, TableColumn } from '@shared/components/ui/data-table/data-table.component';
import { AppPaginationComponent } from '@shared/components/ui/pagination/pagination.component';
import { AdvancedFilterPanelComponent, FilterField } from '@shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { SystemLogEntryDto, SystemLogsApiService, SystemLogsQuery } from '../../../core/services/system-logs-api.service';
import { ToastService } from '@shared/services/toast.service';
import { buildSafeApiErrorLog, describeApiError } from '@shared/utils/api-error.util';

type LogStatusFilter = boolean | '';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-system-logs',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule, RouterModule, DatePipe,
    AppPageHeaderComponent, KpiCardsComponent, DataTableComponent, AppPaginationComponent,
    AdvancedFilterPanelComponent
  ],
  templateUrl: './system-logs.component.html',
  styles: [`
    table { border-collapse: separate !important; border-spacing: 0 !important; table-layout: fixed !important; }
    thead th { position: sticky; top: 0; background: white; z-index: 10; }
    tbody tr { background: rgba(255, 255, 255, 0.5); }
    tbody tr:hover { background: white; }
    td, th { vertical-align: middle !important; }
  `]
})
export class SystemLogsComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  logs: SystemLogEntryDto[] = [];
  isLoading = false;
  isExporting = false;
  errorMessage = '';
  lastRefreshAt: Date | null = null;
  isLiveMode = false;
  newEntriesCount = 0;
  isFiltersExpanded = false;
  searchTerm = '';
  private liveSubscription: Subscription | null = null;
  private readonly destroyRef = inject(DestroyRef);

  filters: { sourceApp: string; module: string; isSuccess: LogStatusFilter } = {
    sourceApp: '', module: '', isSuccess: ''
  };
  page = { pageNumber: 1, pageSize: 25, totalCount: 0, totalPages: 0 };

  kpiCards: KPICard[] = [];

  tableColumns: TableColumn[] = [
    { key: 'index', title: 'COMMON.INDEX', width: '3%', align: 'center' },
    { key: 'occurredAtUtc', title: 'SYSTEM_LOGS.TABLE.TIMESTAMP', width: '12%', align: 'center', type: 'custom' },
    { key: 'sourceApp', title: 'SYSTEM_LOGS.FILTERS.SOURCE', width: '10%', align: 'center', type: 'custom' },
    { key: 'module', title: 'SYSTEM_LOGS.FILTERS.MODULE', width: '10%', align: 'center', type: 'custom' },
    { key: 'httpMethod', title: 'SYSTEM_LOGS.TABLE.METHOD', width: '7%', align: 'center', type: 'custom' },
    { key: 'summary', title: 'SYSTEM_LOGS.TABLE.SUMMARY', width: '22%', align: 'left', type: 'custom' },
    { key: 'actorFullName', title: 'SYSTEM_LOGS.FIELDS.ACTOR', width: '12%', align: 'center', type: 'custom' },
    { key: 'isSuccess', title: 'SYSTEM_LOGS.FILTERS.STATUS', width: '8%', align: 'center', type: 'custom' },
    { key: 'statusCode', title: 'SYSTEM_LOGS.TABLE.STATUS_CODE', width: '6%', align: 'center' }
  ];

  readonly sourceOptions = [
    { value: 'super_admin_panel' }, { value: 'vendor_panel' },
    { value: 'customer_app' }, { value: 'driver_app' }, { value: 'public_api' }
  ];

  readonly moduleOptions = [
    { value: 'identity' }, { value: 'vendors' }, { value: 'catalog' },
    { value: 'orders' }, { value: 'customers' }, { value: 'drivers' },
    { value: 'marketing' }, { value: 'notifications' }, { value: 'finances' },
    { value: 'wallets' }, { value: 'disputes' }
  ];

  private readonly api = inject(SystemLogsApiService);
  readonly translate = inject(TranslateService);

  filterFields: FilterField[] = [
    { key: 'sourceApp', label: 'SYSTEM_LOGS.FILTERS.SOURCE', type: 'select', color: '#127c8c', options: [] },
    { key: 'module', label: 'SYSTEM_LOGS.FILTERS.MODULE', type: 'select', color: '#3b82f6', options: [] },
    { key: 'isSuccess', label: 'SYSTEM_LOGS.FILTERS.STATUS', type: 'select', color: '#10b981', options: [
      { label: 'SYSTEM_LOGS.FILTERS.ALL', value: '' },
      { label: 'SYSTEM_LOGS.STATUS.SUCCESS', value: true },
      { label: 'SYSTEM_LOGS.STATUS.FAILED', value: false }
    ] }
  ];

  get isRTL(): boolean { return this.translate.currentLang === 'ar'; }
  get hasActiveFilters(): boolean {
    return !!(this.filters.sourceApp || this.filters.module || this.filters.isSuccess !== '' || this.searchTerm.trim());
  }

  ngOnInit(): void {
    // We populate the localized options at runtime so they react to language changes if needed
    // The shared AdvancedFilterPanelComponent expects an array of { label, value }
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.cdr.markForCheck();
      this.updateFilterOptions();
    });
    this.updateFilterOptions();
    this.loadLogs();
  }

  constructor(private readonly toastService: ToastService) {}

  private updateFilterOptions(): void {
    this.filterFields[0].options = [
      { label: 'SYSTEM_LOGS.FILTERS.ALL', value: '' },
      ...this.sourceOptions.map(opt => ({ label: this.sourceLabel(opt.value), value: opt.value }))
    ];
    this.filterFields[1].options = [
      { label: 'SYSTEM_LOGS.FILTERS.ALL', value: '' },
      ...this.moduleOptions.map(opt => ({ label: this.moduleLabel(opt.value), value: opt.value }))
    ];
  }

  loadLogs(pageNumber: number = this.page.pageNumber): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.newEntriesCount = 0;

    const query: SystemLogsQuery = {
      pageNumber, pageSize: this.page.pageSize,
      search: this.searchTerm.trim() || undefined,
      sourceApp: this.filters.sourceApp || undefined,
      module: this.filters.module || undefined,
      isSuccess: this.filters.isSuccess
    };

    this.api.getLogs(query).subscribe({
      next: (response) => {
        this.cdr.markForCheck();
        this.logs = response.items;
        this.page = {
          pageNumber: response.pageNumber, pageSize: response.pageSize,
          totalCount: response.totalCount, totalPages: response.totalPages
        };
        this.lastRefreshAt = new Date();
        this.isLoading = false;
        this.updateKpiCards();
      },
      error: (error) => {
        this.cdr.markForCheck();
        console.error('Failed to load system logs', buildSafeApiErrorLog(error));
        this.errorMessage = describeApiError(error, this.translate, {
          fallbackKey: 'SYSTEM_LOGS.STATES.ERROR'
        });
        this.logs = [];
        this.isLoading = false;
      }
    });
  }

  updateKpiCards(): void {
    this.kpiCards = [
      {
        id: 'total', title: 'SYSTEM_LOGS.CARDS.TOTAL', value: this.page.totalCount,
        icon: '<span class="material-symbols-outlined text-[20px]">article</span>',
        color: '#127c8c', clickable: false
      },
      {
        id: 'page', title: 'SYSTEM_LOGS.CARDS.PAGE',
        value: `${this.page.pageNumber} / ${this.page.totalPages || 1}`,
        icon: '<span class="material-symbols-outlined text-[20px]">pages</span>',
        color: '#3b82f6', clickable: false
      },
      {
        id: 'live', title: 'SYSTEM_LOGS.LIVE.LABEL',
        value: this.isLiveMode
          ? this.translate.instant('SYSTEM_LOGS.LIVE.ON')
          : this.translate.instant('SYSTEM_LOGS.LIVE.OFF'),
        icon: '<span class="material-symbols-outlined text-[20px]">stream</span>',
        color: this.isLiveMode ? '#10b981' : '#64748b',
        clickable: true
      },
      {
        id: 'refresh', title: 'SYSTEM_LOGS.CARDS.LAST_REFRESH',
        value: this.lastRefreshAt
          ? this.lastRefreshAt.toLocaleTimeString(undefined, { timeZone: 'Asia/Riyadh' })
          : '...',
        icon: '<span class="material-symbols-outlined text-[20px]">schedule</span>',
        color: '#f59e0b', clickable: false
      }
    ];

    if (this.isLiveMode && this.newEntriesCount > 0) {
      this.kpiCards.push({
        id: 'new', title: 'SYSTEM_LOGS.LIVE.NEW_ENTRIES',
        value: this.newEntriesCount,
        icon: '<span class="material-symbols-outlined text-[20px]">fiber_new</span>',
        color: '#ef4444', clickable: false
      });
    }
  }

  onKPICardClick(card: KPICard): void {
    if (card.id === 'live') {
      this.toggleLiveMode();
    }
  }

  toggleLiveMode(): void {
    this.isLiveMode = !this.isLiveMode;
    this.updateKpiCards();
    if (this.isLiveMode) {
      this.startLivePolling();
    } else {
      this.stopLivePolling();
    }
  }

  private startLivePolling(): void {
    this.stopLivePolling();
    this.liveSubscription = interval(30000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
      this.cdr.markForCheck();
        if (this.page.pageNumber === 1 && !this.isLoading) {
          this.silentRefresh();
        }
      });
  }

  private stopLivePolling(): void {
    this.liveSubscription?.unsubscribe();
    this.liveSubscription = null;
  }

  private silentRefresh(): void {
    const query: SystemLogsQuery = {
      pageNumber: 1, pageSize: this.page.pageSize,
      search: this.searchTerm.trim() || undefined,
      sourceApp: this.filters.sourceApp || undefined,
      module: this.filters.module || undefined,
      isSuccess: this.filters.isSuccess
    };

    this.api.getLogs(query).subscribe({
      next: (response) => {
        this.cdr.markForCheck();
        const oldFirstId = this.logs.length > 0 ? this.logs[0].id : null;
        const newItems = response.items;
        if (oldFirstId && newItems.length > 0 && newItems[0].id !== oldFirstId) {
          const newCount = newItems.findIndex(i => i.id === oldFirstId);
          this.newEntriesCount = newCount === -1 ? newItems.length : newCount;
        }
        this.logs = newItems;
        this.page = {
          pageNumber: response.pageNumber, pageSize: response.pageSize,
          totalCount: response.totalCount, totalPages: response.totalPages
        };
        this.lastRefreshAt = new Date();
        this.updateKpiCards();
      }
    });
  }

  exportCsv(): void {
    this.isExporting = true;
    const query: SystemLogsQuery = {
      search: this.searchTerm.trim() || undefined,
      sourceApp: this.filters.sourceApp || undefined,
      module: this.filters.module || undefined,
      isSuccess: this.filters.isSuccess
    };

    this.api.exportCsv(query).subscribe({
      next: (blob) => {
        this.cdr.markForCheck();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.isExporting = false;
        this.toastService.success(
          this.translate.instant('SYSTEM_LOGS.MESSAGES.EXPORT_SUCCESS'),
          this.translate.instant('SYSTEM_LOGS.TITLE')
        );
      },
      error: (error) => {
        this.cdr.markForCheck();
        this.isExporting = false;
        this.toastService.error(
          describeApiError(error, this.translate, {
            fallbackKey: 'SYSTEM_LOGS.MESSAGES.EXPORT_FAILED'
          }),
          this.translate.instant('SYSTEM_LOGS.TITLE')
        );
      }
    });
  }

  onSearch(): void { this.page.pageNumber = 1; this.loadLogs(1); }
  toggleFilters(): void { this.isFiltersExpanded = !this.isFiltersExpanded; }
  
  onFiltersChange(newFilters: Record<string, any>): void {
    this.filters = {
      sourceApp: newFilters['sourceApp'] ?? '',
      module: newFilters['module'] ?? '',
      isSuccess: newFilters['isSuccess'] ?? ''
    };
    this.page.pageNumber = 1;
    this.loadLogs(1);
  }

  resetFilters(): void {
    this.filters = { sourceApp: '', module: '', isSuccess: '' };
    this.searchTerm = '';
    this.loadLogs(1);
  }
  
  onFilterReset(): void {
    this.resetFilters();
  }

  onFilterSave(savedFilters: Record<string, any>): void {
    this.onFiltersChange(savedFilters);
  }
  changePage(newPage: number): void { this.loadLogs(newPage); }
  trackByLogId(_: number, log: SystemLogEntryDto): string { return log.id; }

  sourceLabel(source: string | null | undefined): string {
    return this.translate.instant(`SYSTEM_LOGS.SOURCES.${(source || 'public_api').toUpperCase()}`);
  }

  moduleLabel(module: string | null | undefined): string {
    const key = (module || 'system').replace(/[^a-z_]/gi, '_').toUpperCase();
    const translated = this.translate.instant(`SYSTEM_LOGS.MODULES.${key}`);
    return translated === `SYSTEM_LOGS.MODULES.${key}` ? (module || 'system') : translated;
  }

  sourceBadgeClasses(source: string): string {
    switch (source) {
      case 'super_admin_panel': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'vendor_panel': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'customer_app': return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'driver_app': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  methodBadgeClasses(method: string): string {
    switch (method.toUpperCase()) {
      case 'POST': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'PUT': case 'PATCH': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'DELETE': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  translateSummary(summary: string): string {
    if (this.translate.currentLang !== 'ar') return summary;

    const regex = /^(Created or triggered|Updated|Deleted|Processed) ([a-zA-Z_]+) via ([a-zA-Z_]+)(?: target (.*))? \((\d+)\)\.$/i;
    const match = summary.match(regex);
    if (!match) return summary;

    const [_, operation, module, sourceApp, target, statusCode] = match;

    const opMap: Record<string, string> = {
      'created or triggered': 'تم إنشاء أو تشغيل',
      'updated': 'تم التحديث في',
      'deleted': 'تم الحذف من',
      'processed': 'تمت المعالجة في'
    };

    const opAr = opMap[operation.toLowerCase()] || operation;
    const moduleAr = this.moduleLabel(module);
    const sourceAr = this.sourceLabel(sourceApp);

    let result = `${opAr} ${moduleAr} عبر ${sourceAr}`;
    if (target) {
      result += ` (الهدف: ${target})`;
    }
    result += ` (${statusCode})`;

    return result;
  }
}
