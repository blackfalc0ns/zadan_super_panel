import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { AuditLogEntry, EntityType } from '../../models/finance.models';
import { FINANCE_ENTITY_LABEL_KEYS, getFinanceLocale } from '../../utils/finance-i18n.utils';

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
 imports: [CommonModule, TranslateModule],
 template: `
  <div class="flex flex-col gap-5 animate-in fade-in duration-500">
    <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-start gap-3 min-w-0">
          <span class="material-symbols-outlined h-10 w-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">fact_check</span>
          <div class="min-w-0">
            <h2 class="text-base font-black text-slate-900">{{ 'FINANCES.AUDIT.TITLE' | translate }}</h2>
            <p class="text-xs font-semibold text-slate-500 mt-1 max-w-3xl">{{ 'FINANCES.AUDIT.BANNER_DESC' | translate }}</p>
          </div>
        </div>

        <button
          type="button"
          class="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors disabled:opacity-60"
          [disabled]="isLoading"
          (click)="loadAuditLog()">
          <span class="material-symbols-outlined text-[18px]" [class.animate-spin]="isLoading">refresh</span>
          {{ 'FINANCES.AUDIT.FILTERS.REFRESH' | translate }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div class="p-5">
          <p class="text-[11px] font-black text-slate-400">{{ 'FINANCES.AUDIT.STATS.TOTAL' | translate }}</p>
          <p class="text-2xl font-black text-slate-900 mt-2 tabular-nums">{{ entries.length }}</p>
        </div>
        <div class="p-5">
          <p class="text-[11px] font-black text-slate-400">{{ 'FINANCES.AUDIT.STATS.FINANCE_ENGINE' | translate }}</p>
          <p class="text-2xl font-black text-emerald-700 mt-2 tabular-nums">{{ systemEntriesCount }}</p>
        </div>
        <div class="p-5">
          <p class="text-[11px] font-black text-slate-400">{{ 'FINANCES.AUDIT.STATS.MANUAL_ACTIONS' | translate }}</p>
          <p class="text-2xl font-black text-amber-700 mt-2 tabular-nums">{{ manualActionsCount }}</p>
        </div>
        <div class="p-5">
          <p class="text-[11px] font-black text-slate-400">{{ 'FINANCES.AUDIT.STATS.AFFECTED_ENTITIES' | translate }}</p>
          <p class="text-2xl font-black text-indigo-700 mt-2 tabular-nums">{{ affectedEntitiesCount }}</p>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-sm font-black text-slate-900">{{ 'FINANCES.AUDIT.BANNER_TITLE' | translate }}</p>
          <p class="text-xs font-semibold text-slate-500 mt-1">
            {{ filteredEntries.length }} {{ 'FINANCES.AUDIT.ENTRIES' | translate }}
            <span *ngIf="lastEventLabel" class="text-slate-300 mx-1">/</span>
            <span *ngIf="lastEventLabel">{{ 'FINANCES.AUDIT.LAST_EVENT' | translate }}: {{ lastEventLabel }}</span>
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full xl:max-w-3xl">
          <label class="flex flex-col gap-1">
            <span class="text-[10px] font-black text-slate-400">{{ 'FINANCES.AUDIT.FILTERS.SEARCH' | translate }}</span>
            <span class="relative">
              <span class="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input
                class="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 ps-10 pe-3 text-xs font-bold text-slate-700 outline-none focus:border-zadna-primary focus:bg-white"
                [value]="searchTerm"
                (input)="setSearch($any($event.target).value)"
                [placeholder]="'FINANCES.AUDIT.FILTERS.SEARCH_PLACEHOLDER' | translate">
            </span>
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-[10px] font-black text-slate-400">{{ 'FINANCES.AUDIT.FILTERS.CATEGORY' | translate }}</span>
            <select
              class="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-zadna-primary focus:bg-white"
              [value]="categoryFilter"
              (change)="setCategory($any($event.target).value)">
              <option *ngFor="let option of categoryOptions; trackBy: trackByValue" [value]="option.value">{{ option.labelKey | translate }}</option>
            </select>
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-[10px] font-black text-slate-400">{{ 'FINANCES.AUDIT.FILTERS.ENTITY' | translate }}</span>
            <select
              class="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-zadna-primary focus:bg-white"
              [value]="entityFilter"
              (change)="setEntity($any($event.target).value)">
              <option *ngFor="let option of entityOptions; trackBy: trackByValue" [value]="option.value">{{ option.labelKey | translate }}</option>
            </select>
          </label>
        </div>
      </div>

      <div *ngIf="isLoading" class="p-5 space-y-3">
        <div class="h-12 rounded-lg bg-slate-100 animate-pulse"></div>
        <div class="h-12 rounded-lg bg-slate-100 animate-pulse"></div>
        <div class="h-12 rounded-lg bg-slate-100 animate-pulse"></div>
        <p class="text-xs font-bold text-slate-400">{{ 'FINANCES.AUDIT.STATES.LOADING' | translate }}</p>
      </div>

      <div *ngIf="!isLoading && hasLoadError" class="px-5 py-10 text-center">
        <span class="material-symbols-outlined text-rose-500 text-3xl">error</span>
        <p class="text-sm font-black text-slate-900 mt-2">{{ 'FINANCES.AUDIT.STATES.ERROR_TITLE' | translate }}</p>
        <p class="text-xs font-semibold text-slate-500 mt-1">{{ 'FINANCES.AUDIT.STATES.ERROR_DESC' | translate }}</p>
      </div>

      <div *ngIf="!isLoading && !hasLoadError && !filteredEntries.length" class="px-5 py-12 text-center">
        <span class="material-symbols-outlined text-slate-300 text-4xl">manage_search</span>
        <p class="text-sm font-black text-slate-900 mt-2">{{ 'FINANCES.AUDIT.STATES.EMPTY_TITLE' | translate }}</p>
        <p class="text-xs font-semibold text-slate-500 mt-1">{{ 'FINANCES.AUDIT.STATES.EMPTY_DESC' | translate }}</p>
      </div>

      <div *ngIf="!isLoading && !hasLoadError && filteredEntries.length" class="overflow-x-auto">
        <table class="w-full min-w-[980px]">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="px-5 py-3 text-start text-[10px] font-black text-slate-500">{{ 'FINANCES.COMMON.TIMESTAMP' | translate }}</th>
              <th class="px-5 py-3 text-start text-[10px] font-black text-slate-500">{{ 'FINANCES.AUDIT.TABLE.ADMIN' | translate }}</th>
              <th class="px-5 py-3 text-start text-[10px] font-black text-slate-500">{{ 'FINANCES.AUDIT.TABLE.ACTION' | translate }}</th>
              <th class="px-5 py-3 text-start text-[10px] font-black text-slate-500">{{ 'FINANCES.AUDIT.TABLE.CATEGORY' | translate }}</th>
              <th class="px-5 py-3 text-start text-[10px] font-black text-slate-500">{{ 'FINANCES.COMMON.ENTITY' | translate }}</th>
              <th class="px-5 py-3 text-center text-[10px] font-black text-slate-500">{{ 'FINANCES.AUDIT.TABLE.CHANGES' | translate }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <ng-container *ngFor="let entry of filteredEntries; trackBy: trackById">
              <tr class="hover:bg-slate-50 transition-colors cursor-pointer" (click)="toggleExpand(entry.id)">
                <td class="px-5 py-4 align-top">
                  <p class="text-xs font-black text-slate-800 tabular-nums">{{ formatDate(entry.timestamp) }}</p>
                  <p class="text-[10px] font-bold text-slate-400 tabular-nums mt-1">{{ formatTime(entry.timestamp) }}</p>
                </td>

                <td class="px-5 py-4 align-top">
                  <div class="flex items-center gap-2.5">
                    <span class="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                      {{ getInitials(entry.adminName) }}
                    </span>
                    <span class="min-w-0">
                      <span class="block text-xs font-black text-slate-800 truncate">{{ entry.adminName | translate }}</span>
                      <span class="block text-[10px] font-bold text-slate-400 truncate">{{ entry.adminRole | translate }}</span>
                    </span>
                  </div>
                </td>

                <td class="px-5 py-4 align-top">
                  <p class="text-xs font-black text-slate-800">{{ entry.action | translate }}</p>
                  <p *ngIf="entry.orderId" class="text-[10px] font-bold text-slate-400 mt-1">#{{ entry.orderId }}</p>
                </td>

                <td class="px-5 py-4 align-top">
                  <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black"
                        [ngClass]="getCategoryClass(entry.actionCategory)">
                    {{ getCategoryLabelKey(entry.actionCategory) | translate }}
                  </span>
                </td>

                <td class="px-5 py-4 align-top">
                  <p class="text-xs font-black text-slate-800 truncate max-w-[220px]">{{ entry.entityName || '-' }}</p>
                  <p class="text-[10px] font-bold text-slate-400 mt-1">
                    {{ getEntityLabelKey(entry.entityType) | translate }}
                    <span *ngIf="entry.entityId" class="font-mono">/ {{ entry.entityId }}</span>
                  </p>
                </td>

                <td class="px-5 py-4 align-top">
                  <div class="flex justify-center">
                    <button
                      type="button"
                      class="h-8 min-w-24 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-[10px] font-black flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors"
                      (click)="$event.stopPropagation(); toggleExpand(entry.id)">
                      <span class="material-symbols-outlined text-[16px]">{{ expandedId === entry.id ? 'expand_less' : 'expand_more' }}</span>
                      {{ expandedId === entry.id ? ('FINANCES.COMMON.HIDE' | translate) : ('FINANCES.COMMON.VIEW' | translate) }}
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="expandedId === entry.id">
                <td colspan="6" class="px-5 py-5 bg-slate-50">
                  <div class="grid grid-cols-1 xl:grid-cols-3 gap-3">
                    <div class="rounded-xl border border-slate-200 bg-white p-4">
                      <p class="text-[10px] font-black text-slate-400">{{ 'FINANCES.AUDIT.TABLE.DETAILS' | translate }}</p>
                      <dl class="mt-3 space-y-2 text-xs">
                        <div class="flex items-center justify-between gap-3">
                          <dt class="font-bold text-slate-400">{{ 'FINANCES.AUDIT.TABLE.ENTITY_ID' | translate }}</dt>
                          <dd class="font-mono font-bold text-slate-700 truncate">{{ entry.entityId || '-' }}</dd>
                        </div>
                        <div class="flex items-center justify-between gap-3">
                          <dt class="font-bold text-slate-400">{{ 'FINANCES.COMMON.ENTITY' | translate }}</dt>
                          <dd class="font-bold text-slate-700">{{ getEntityLabelKey(entry.entityType) | translate }}</dd>
                        </div>
                        <div class="flex items-center justify-between gap-3">
                          <dt class="font-bold text-slate-400">{{ 'FINANCES.AUDIT.TABLE.CATEGORY' | translate }}</dt>
                          <dd class="font-bold text-slate-700">{{ getCategoryLabelKey(entry.actionCategory) | translate }}</dd>
                        </div>
                      </dl>
                    </div>

                    <div class="rounded-xl border border-rose-100 bg-rose-50 p-4 min-w-0">
                      <p class="text-[10px] font-black text-rose-500">{{ 'FINANCES.COMMON.BEFORE' | translate }}</p>
                      <pre class="mt-3 text-[11px] leading-5 font-mono text-rose-800 whitespace-pre-wrap break-words">{{ formatJson(entry.before) }}</pre>
                    </div>

                    <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 min-w-0">
                      <p class="text-[10px] font-black text-emerald-600">{{ 'FINANCES.COMMON.AFTER' | translate }}</p>
                      <pre class="mt-3 text-[11px] leading-5 font-mono text-emerald-800 whitespace-pre-wrap break-words">{{ formatJson(entry.after) }}</pre>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </section>
  </div>
 `
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
 expandedId: string | null = null;
 searchTerm = '';
 categoryFilter: AuditCategoryFilter = 'all';
 entityFilter: AuditEntityFilter = 'all';
 isLoading = false;
 hasLoadError = false;

 ngOnInit(): void {
 this.loadAuditLog();
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

 loadAuditLog(): void {
 this.isLoading = true;
 this.hasLoadError = false;
 this.cdr.markForCheck();

 this.financeService.getAuditLog().pipe(take(1)).subscribe({
 next: (entries) => {
 this.entries = entries;
 this.applyFilters();
 this.isLoading = false;
 this.cdr.markForCheck();
 },
 error: () => {
 this.entries = [];
 this.filteredEntries = [];
 this.isLoading = false;
 this.hasLoadError = true;
 this.cdr.markForCheck();
 }
 });
 }

 setSearch(value: string): void {
 this.searchTerm = value;
 this.applyFilters();
 }

 setCategory(value: AuditCategoryFilter): void {
 this.categoryFilter = value;
 this.applyFilters();
 }

 setEntity(value: AuditEntityFilter): void {
 this.entityFilter = value;
 this.applyFilters();
 }

 toggleExpand(id: string): void {
 this.expandedId = this.expandedId === id ? null : id;
 }

 getInitials(name: string): string {
 const translated = String(this.translate.instant(name) ?? name);
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

 trackByValue(_: number, option: AuditFilterOption<string>): string {
 return option.value;
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
 this.translate.instant(entry.action),
 this.translate.instant(entry.adminName),
 this.translate.instant(entry.adminRole),
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

 if (this.expandedId && !this.filteredEntries.some((entry) => entry.id === this.expandedId)) {
 this.expandedId = null;
 }

 this.cdr.markForCheck();
 }

 private normalize(value: string): string {
 return value.toLowerCase().trim();
 }
}
