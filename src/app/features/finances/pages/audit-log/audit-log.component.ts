import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { AuditLogEntry, EntityType } from '../../models/finance.models';
import { FINANCE_ENTITY_LABEL_KEYS, getFinanceLocale } from '../../utils/finance-i18n.utils';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { KpiCardsComponent, KPICard } from '../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { AdvancedFilterPanelComponent, FilterField } from '../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';

type AuditCategoryFilter = AuditLogEntry['actionCategory'] | 'all';
type AuditEntityFilter = EntityType | 'all';

interface AuditFilterOption<T extends string> {
 value: T;
 labelKey: string;
}

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-audit-log',
 standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppPageHeaderComponent,
    KpiCardsComponent,
    AppCardComponent,
    AppButtonComponent,
    InlineBannerComponent,
    AdvancedFilterPanelComponent,
    AppPaginationComponent
  ],
  templateUrl: './audit-log.component.html'
})
export class AuditLogComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 private readonly financeService = inject(FinanceService);
 private readonly translate = inject(TranslateService);

 readonly categoryOptions: AuditFilterOption<AuditCategoryFilter>[] = [
 { value: 'all', labelKey: 'FINANCES.AUDIT.CATEGORIES.ALL' },
 { value: 'settlement', labelKey: 'FINANCES.AUDIT.CATEGORIES.SETTLEMENT' },
 { value: 'refund', labelKey: 'FINANCES.AUDIT.CATEGORIES.REFUND' },
 { value: 'adjustment', labelKey: 'FINANCES.AUDIT.CATEGORIES.ADJUSTMENT' },
 { value: 'pricing', labelKey: 'FINANCES.AUDIT.CATEGORIES.PRICING' },
 { value: 'override', labelKey: 'FINANCES.AUDIT.CATEGORIES.OVERRIDE' },
 { value: 'auth', labelKey: 'FINANCES.AUDIT.CATEGORIES.AUTH' }
 ];

 readonly entityOptions: AuditFilterOption<AuditEntityFilter>[] = [
 { value: 'all', labelKey: 'FINANCES.AUDIT.FILTERS.ALL_ENTITIES' },
 { value: 'vendor', labelKey: 'FINANCES.ENTITIES.VENDOR' },
 { value: 'driver', labelKey: 'FINANCES.ENTITIES.DRIVER' },
 { value: 'order', labelKey: 'FINANCES.ENTITIES.ORDER' },
 { value: 'platform', labelKey: 'FINANCES.ENTITIES.PLATFORM' },
 { value: 'customer', labelKey: 'FINANCES.ENTITIES.CUSTOMER' }
 ];

 entries: AuditLogEntry[] = [];
 filteredEntries: AuditLogEntry[] = [];
  selectedEntry: AuditLogEntry | null = null;
 searchTerm = '';
 categoryFilter: AuditCategoryFilter = 'all';
 entityFilter: AuditEntityFilter = 'all';
 isLoading = false;
 hasLoadError = false;
  isFiltersExpanded = false;
  kpiCards: KPICard[] = [];
  panelFilters: Record<string, string> = { category: 'all', entity: 'all' };
  currentPage = 1;
  readonly pageSize = 15;

  filterFields: FilterField[] = [
    {
      key: 'category',
      label: 'FINANCES.AUDIT.FILTERS.CATEGORY',
      type: 'select',
      color: '#127c8c',
      options: []
    },
    {
      key: 'entity',
      label: 'FINANCES.AUDIT.FILTERS.ENTITY',
      type: 'select',
      color: '#0f766e',
      options: []
    }
  ];

 ngOnInit(): void {
    this.updateFilterOptions();
 this.loadAuditLog();
 }

  get isRTL(): boolean {
    return this.translate.currentLang === 'ar';
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredEntries.length / this.pageSize));
  }

  get pagedEntries(): AuditLogEntry[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredEntries.slice(startIndex, startIndex + this.pageSize);
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm.trim() || this.categoryFilter !== 'all' || this.entityFilter !== 'all');
  }

 get systemEntriesCount(): number {
 return this.entries.filter((entry) => entry.adminId === 'finance-system' || entry.adminName === 'FINANCES.AUDIT.ADMINS.FINANCE_SYSTEM').length;
 }

 get manualActionsCount(): number {
 return Math.max(this.entries.length - this.systemEntriesCount, 0);
 }

 get affectedEntitiesCount(): number {
 return new Set(this.entries.map((entry) => `${entry.entityType}:${entry.entityId ?? entry.orderId ?? entry.id}`)).size;
 }

 get lastEventLabel(): string {
 const [latest] = this.entries;
 return latest ? `${this.formatDate(latest.timestamp)} ${this.formatTime(latest.timestamp)}` : '';
 }

  get entriesSummary(): string {
    const entriesLabel = `${this.filteredEntries.length} ${this.translate.instant('FINANCES.AUDIT.ENTRIES')}`;
    if (!this.lastEventLabel) {
      return entriesLabel;
    }

    return `${entriesLabel} / ${this.translate.instant('FINANCES.AUDIT.LAST_EVENT')}: ${this.lastEventLabel}`;
  }

 loadAuditLog(): void {
 this.isLoading = true;
 this.hasLoadError = false;
 this.cdr.markForCheck();

 this.financeService.getAuditLog().pipe(take(1)).subscribe({
 next: (entries) => {
 this.entries = entries;
 this.applyFilters();
 this.isLoading = false;
        this.updateKpiCards();
 this.cdr.markForCheck();
 },
 error: () => {
 this.entries = [];
 this.filteredEntries = [];
 this.isLoading = false;
 this.hasLoadError = true;
        this.updateKpiCards();
 this.cdr.markForCheck();
 }
 });
 }

  onSearchChange(): void {
    this.currentPage = 1;
 this.applyFilters();
 }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.cdr.markForCheck();
  }

  openDetail(entry: AuditLogEntry): void {
    this.selectedEntry = entry;
  }

  closeDetail(): void {
    this.selectedEntry = null;
  }

  resolveLabel(keyOrText: string): string {
    const translated = this.translate.instant(keyOrText);
    return translated && translated !== keyOrText ? translated : keyOrText;
  }

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  onPanelFiltersChange(filters: Record<string, unknown>): void {
    this.panelFilters = {
      category: String(filters['category'] ?? 'all'),
      entity: String(filters['entity'] ?? 'all')
    };
    this.categoryFilter = this.panelFilters['category'] as AuditCategoryFilter;
    this.entityFilter = this.panelFilters['entity'] as AuditEntityFilter;
    this.currentPage = 1;
 this.applyFilters();
 }

  resetFilters(): void {
    this.searchTerm = '';
    this.categoryFilter = 'all';
    this.entityFilter = 'all';
    this.panelFilters = { category: 'all', entity: 'all' };
    this.currentPage = 1;
 this.applyFilters();
 }

 getInitials(name: string): string {
    const translated = this.resolveLabel(name);
 return translated
 .split(/\s+/)
 .filter(Boolean)
 .slice(0, 2)
 .map((part) => part[0]?.toUpperCase())
 .join('') || 'SA';
 }

 getEntityLabelKey(type: string): string {
 return FINANCE_ENTITY_LABEL_KEYS[type] ?? type;
 }

 getCategoryLabelKey(category: AuditCategoryFilter): string {
 return `FINANCES.AUDIT.CATEGORIES.${category.toUpperCase()}`;
 }

 getCategoryClass(category: string): string {
 const map: Record<string, string> = {
 settlement: 'bg-emerald-50 text-emerald-700 border-emerald-200',
 refund: 'bg-rose-50 text-rose-700 border-rose-200',
 adjustment: 'bg-indigo-50 text-indigo-700 border-indigo-200',
 pricing: 'bg-sky-50 text-sky-700 border-sky-200',
 override: 'bg-amber-50 text-amber-700 border-amber-200',
 auth: 'bg-slate-100 text-slate-700 border-slate-200'
 };
 return map[category] ?? 'bg-slate-100 text-slate-700 border-slate-200';
 }

 formatDate(timestamp: string): string {
 const date = new Date(timestamp);
 if (Number.isNaN(date.getTime())) {
 return '-';
 }
 return date.toLocaleDateString(getFinanceLocale(this.translate.currentLang), { timeZone: 'Asia/Riyadh', calendar: 'gregory' });
 }

 formatTime(timestamp: string): string {
 const date = new Date(timestamp);
 if (Number.isNaN(date.getTime())) {
 return '-';
 }
 return date.toLocaleTimeString(getFinanceLocale(this.translate.currentLang), { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit' });
 }

 formatJson(value?: Record<string, unknown>): string {
 if (!value || !Object.keys(value).length) {
 return '-';
 }

 return JSON.stringify(value, null, 2);
 }

 trackById(_: number, entry: AuditLogEntry): string {
 return entry.id;
 }

  private updateFilterOptions(): void {
    this.filterFields[0].options = this.categoryOptions.map((option) => ({
      value: option.value,
      label: option.labelKey
    }));
    this.filterFields[1].options = this.entityOptions.map((option) => ({
      value: option.value,
      label: option.labelKey
    }));
  }

  private updateKpiCards(): void {
    this.kpiCards = [
      {
        id: 'total',
        title: 'FINANCES.AUDIT.STATS.TOTAL',
        value: this.entries.length,
        icon: 'history',
        color: '#0f172a'
      },
      {
        id: 'system',
        title: 'FINANCES.AUDIT.STATS.FINANCE_ENGINE',
        value: this.systemEntriesCount,
        icon: 'settings_suggest',
        color: '#059669'
      },
      {
        id: 'manual',
        title: 'FINANCES.AUDIT.STATS.MANUAL_ACTIONS',
        value: this.manualActionsCount,
        icon: 'person_edit',
        color: '#d97706'
      },
      {
        id: 'entities',
        title: 'FINANCES.AUDIT.STATS.AFFECTED_ENTITIES',
        value: this.affectedEntitiesCount,
        icon: 'hub',
        color: '#4f46e5'
      }
    ];
 }

 private applyFilters(): void {
 const normalizedSearch = this.normalize(this.searchTerm);

 this.filteredEntries = this.entries.filter((entry) => {
 if (this.categoryFilter !== 'all' && entry.actionCategory !== this.categoryFilter) {
 return false;
 }

 if (this.entityFilter !== 'all' && entry.entityType !== this.entityFilter) {
 return false;
 }

 if (!normalizedSearch) {
 return true;
 }

 const haystack = [
        this.resolveLabel(entry.action),
        this.resolveLabel(entry.adminName),
        this.resolveLabel(entry.adminRole),
 entry.entityName,
 entry.entityId,
 entry.orderId,
 entry.actionCategory,
 entry.entityType,
 JSON.stringify(entry.before ?? {}),
 JSON.stringify(entry.after ?? {})
 ].join(' ');

 return this.normalize(haystack).includes(normalizedSearch);
 });

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
 }

 this.cdr.markForCheck();
 }

 private normalize(value: string): string {
 return value.toLowerCase().trim();
 }
}
