import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EntityType, FinancePeriod, LedgerEntryType, LedgerDirection, LedgerFilter } from '../../models/finance.models';
import { AdvancedFilterPanelComponent, FilterField } from '../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import {
  FINANCE_ENTITY_LABEL_KEYS,
  FINANCE_LEDGER_TYPE_LABEL_KEYS,
  FINANCE_DIRECTION_LABEL_KEYS
} from '../../utils/finance-i18n.utils';

@Component({
  selector: 'app-finance-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AdvancedFilterPanelComponent],
  template: `
    <div class="flex flex-col gap-3">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div class="w-full lg:w-[450px] group relative order-1">
          <div class="absolute inset-y-0 start-5 flex items-center pointer-events-none">
            <span class="material-symbols-outlined text-[22px] text-zadna-primary group-focus-within:scale-110 transition-transform duration-500">search</span>
          </div>
          <input
            type="text"
            [(ngModel)]="filter.search"
            (ngModelChange)="emitFilter()"
            [placeholder]="'FINANCES.FILTERS.SEARCH_PLACEHOLDER' | translate"
            class="w-full py-4 ps-14 pe-6 bg-white border border-slate-200/60 rounded-[1.5rem] text-[13px] font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-zadna-primary/50 focus:ring-4 focus:ring-zadna-primary/5 transition-all shadow-sm"
          />
        </div>

        <div class="flex items-center gap-4 order-2 self-stretch lg:self-auto">
          <div class="flex items-center bg-white border border-slate-200/60 rounded-full h-[60px] shadow-sm px-2 transition-all hover:shadow-md overflow-hidden">
            <div class="flex items-center gap-3 px-6 h-full cursor-pointer select-none hover:bg-slate-50 transition-colors group"
                 (click)="toggleFilters()"
                 [class.bg-teal-50]="isFiltersExpanded">
              <span class="material-symbols-outlined text-[24px] text-zadna-primary transition-transform duration-500"
                    [class.rotate-180]="isFiltersExpanded">filter_list</span>
              <div class="flex flex-col">
                <span class="text-[13px] font-black text-slate-800">{{ 'FINANCES.FILTERS.TITLE' | translate }}</span>
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{{ 'FINANCES.FILTERS.SUBTITLE' | translate }}</span>
              </div>
              <span class="material-symbols-outlined text-[18px] text-slate-300 group-hover:translate-y-0.5 transition-transform ms-2"
                    [class.rotate-180]="isFiltersExpanded">keyboard_arrow_down</span>
            </div>
          </div>

          <button *ngIf="hasActiveFilters"
                  (click)="clearFilters()"
                  class="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-all group">
            <span class="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">close</span>
            <span class="text-[11px] font-black uppercase tracking-widest">{{ 'FINANCES.FILTERS.CLEAR' | translate }}</span>
          </button>

          <button *ngIf="showExport"
                  (click)="export.emit()"
                  class="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-all group">
            <span class="material-symbols-outlined text-[18px] group-hover:-translate-y-0.5 transition-transform">download</span>
            <span class="text-[11px] font-black uppercase tracking-widest">{{ 'FINANCES.EXPORT' | translate }}</span>
          </button>
        </div>
      </div>

      <div *ngIf="isFiltersExpanded" class="relative z-30 animate-in slide-in-from-top-3 duration-500 overflow-visible rounded-[1.5rem] border border-slate-200/60 shadow-xl">
        <app-advanced-filter-panel
          [isExpanded]="true"
          [title]="'FINANCES.FILTERS.TITLE'"
          [subtitle]="'FINANCES.FILTERS.SUBTITLE'"
          [activeFiltersLabel]="'FINANCES.FILTERS.ACTIVE'"
          [fields]="filterFields"
          [filters]="panelFilters"
          (filtersChange)="onPanelFiltersChange($event)"
          (reset)="clearFilters()">
        </app-advanced-filter-panel>
      </div>
    </div>
  `
})
export class FinanceFilterBarComponent {
  @Input() showEntityType = true;
  @Input() showLedgerType = false;
  @Input() showDirection = false;
  @Input() showExport = false;

  @Output() filterChange = new EventEmitter<LedgerFilter>();
  @Output() export = new EventEmitter<void>();

  isFiltersExpanded = false;

  periodOptions: Array<{ value: FinancePeriod; labelKey: string }> = [
    { value: 'today', labelKey: 'FINANCES.PERIODS.TODAY' },
    { value: 'week', labelKey: 'FINANCES.PERIODS.THIS_WEEK' },
    { value: 'month', labelKey: 'FINANCES.PERIODS.THIS_MONTH' },
    { value: 'quarter', labelKey: 'FINANCES.PERIODS.THIS_QUARTER' }
  ];

  entityOptions: Array<{ value: EntityType; labelKey: string }> = [
    { value: 'vendor', labelKey: FINANCE_ENTITY_LABEL_KEYS['vendor'] },
    { value: 'driver', labelKey: FINANCE_ENTITY_LABEL_KEYS['driver'] },
    { value: 'order', labelKey: FINANCE_ENTITY_LABEL_KEYS['order'] },
    { value: 'platform', labelKey: FINANCE_ENTITY_LABEL_KEYS['platform'] }
  ];

  ledgerTypeOptions: Array<{ value: LedgerEntryType; labelKey: string }> = [
    { value: 'commission', labelKey: FINANCE_LEDGER_TYPE_LABEL_KEYS['commission'] },
    { value: 'payout', labelKey: FINANCE_LEDGER_TYPE_LABEL_KEYS['payout'] },
    { value: 'refund', labelKey: FINANCE_LEDGER_TYPE_LABEL_KEYS['refund'] },
    { value: 'settlement', labelKey: FINANCE_LEDGER_TYPE_LABEL_KEYS['settlement'] },
    { value: 'adjustment', labelKey: FINANCE_LEDGER_TYPE_LABEL_KEYS['adjustment'] },
    { value: 'service_fee', labelKey: FINANCE_LEDGER_TYPE_LABEL_KEYS['service_fee'] },
    { value: 'delivery_fee', labelKey: FINANCE_LEDGER_TYPE_LABEL_KEYS['delivery_fee'] },
    { value: 'vat', labelKey: FINANCE_LEDGER_TYPE_LABEL_KEYS['vat'] },
    { value: 'bonus', labelKey: FINANCE_LEDGER_TYPE_LABEL_KEYS['bonus'] },
    { value: 'penalty', labelKey: FINANCE_LEDGER_TYPE_LABEL_KEYS['penalty'] },
    { value: 'cod_collection', labelKey: FINANCE_LEDGER_TYPE_LABEL_KEYS['cod_collection'] }
  ];

  directionOptions: Array<{ value: LedgerDirection; labelKey: string }> = [
    { value: 'credit', labelKey: FINANCE_DIRECTION_LABEL_KEYS['credit'] },
    { value: 'debit', labelKey: FINANCE_DIRECTION_LABEL_KEYS['debit'] }
  ];

  filter: LedgerFilter = {};
  panelFilters: Record<string, any> = {};

  get hasActiveFilters(): boolean {
    return !!(this.filter.search || this.filter.period || this.filter.entityType || this.filter.type || this.filter.direction);
  }

  get filterFields(): FilterField[] {
    const fields: FilterField[] = [
      {
        key: 'period',
        label: 'FINANCES.FILTERS.PERIOD',
        type: 'select',
        placeholder: 'FINANCES.FILTERS.ALL_PERIODS',
        color: '#127c8c',
        options: this.periodOptions.map((option) => ({ value: option.value, label: option.labelKey }))
      }
    ];

    if (this.showEntityType) {
      fields.push({
        key: 'entityType',
        label: 'FINANCES.COMMON.ENTITY',
        type: 'select',
        placeholder: 'FINANCES.FILTERS.ALL_ENTITIES',
        color: '#0f766e',
        options: this.entityOptions.map((option) => ({ value: option.value, label: option.labelKey }))
      });
    }

    if (this.showLedgerType) {
      fields.push({
        key: 'type',
        label: 'FINANCES.COMMON.TYPE',
        type: 'select',
        placeholder: 'FINANCES.FILTERS.ALL_TYPES',
        color: '#2563eb',
        options: this.ledgerTypeOptions.map((option) => ({ value: option.value, label: option.labelKey }))
      });
    }

    if (this.showDirection) {
      fields.push({
        key: 'direction',
        label: 'FINANCES.COMMON.DIRECTION',
        type: 'select',
        placeholder: 'FINANCES.FILTERS.ALL',
        color: '#dc2626',
        options: this.directionOptions.map((option) => ({ value: option.value, label: option.labelKey }))
      });
    }

    return fields;
  }

  emitFilter(): void {
    this.syncPanelFilters();
    this.filterChange.emit({ ...this.filter });
  }

  setDirection(dir: LedgerDirection | null): void {
    this.filter.direction = dir ?? undefined;
    this.emitFilter();
  }

  clearFilters(): void {
    this.filter = {};
    this.panelFilters = {};
    this.filterChange.emit({});
  }

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  onPanelFiltersChange(filters: Record<string, any>): void {
    this.filter = {
      ...this.filter,
      period: filters['period'] || undefined,
      entityType: filters['entityType'] || undefined,
      type: filters['type'] || undefined,
      direction: filters['direction'] || undefined
    };
    this.syncPanelFilters();
    this.filterChange.emit({ ...this.filter });
  }

  private syncPanelFilters(): void {
    this.panelFilters = {
      period: this.filter.period,
      entityType: this.filter.entityType,
      type: this.filter.type,
      direction: this.filter.direction
    };
  }
}
