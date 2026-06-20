import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type FilterValue = unknown;

export interface FilterOption {
  value: FilterValue;
  label: string;
  color?: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'daterange' | 'number';
  options?: FilterOption[];
  placeholder?: string;
  color?: string;
  icon?: string;
  /** When false, option labels are shown as-is (e.g. bilingual text from API). Defaults to true. */
  localizeOptions?: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, FilterValue>;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-advanced-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div *ngIf="isExpanded" 
         class="relative z-10 overflow-visible bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-5 shadow-xl animate-in slide-in-from-top-3 duration-300">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900 tracking-tight leading-none mb-0.5">{{ title | translate }}</h3>
            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{{ subtitle | translate }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <button (click)="onReset()" 
                  class="flex items-center gap-2 px-3.5 py-1.5 text-[10px] font-black text-slate-500 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-all duration-200 border border-slate-200/50 hover:border-red-200 shadow-sm uppercase tracking-wider">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ resetLabel | translate }}
          </button>
        </div>
      </div>
      
      <!-- Filters Grid -->
      <div class="relative z-0 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 overflow-visible">
        <div *ngFor="let field of fields" class="relative z-0 space-y-1.5 overflow-visible focus-within:z-30">
          <label class="flex items-center gap-2 text-[10px] font-black text-slate-500 px-1">
            <div class="w-1.5 h-1.5 rounded-full" [style.background-color]="field.color || '#6366f1'"></div>
            {{ field.label | translate }}
          </label>
          
          <!-- Select Field -->
          <div *ngIf="field.type === 'select'" class="relative z-10 overflow-visible">
            <button
              type="button"
              (click)="toggleDropdown(field.key)"
              class="relative z-10 flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-bold text-slate-700 transition-all duration-200 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-20 focus:border-primary"
              [attr.aria-expanded]="isDropdownOpen(field.key)">
              <span class="truncate">
                {{ getSelectDisplayLabel(field) }}
              </span>
              <svg
                class="h-3 w-3 shrink-0 text-slate-400 transition-transform duration-200"
                [class.rotate-180]="isDropdownOpen(field.key)"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              *ngIf="isDropdownOpen(field.key)"
              class="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-[1rem] border border-slate-200 bg-white shadow-[0_18px_40px_-16px_rgba(15,23,42,0.35)]">
              <div class="max-h-64 overflow-y-auto py-2">
                <button
                  type="button"
                  (click)="clearFilterValue(field.key)"
                  class="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-start text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800">
                  <span class="truncate">{{ (field.placeholder || 'COMMON.HIDE_INACTIVE') | translate }}</span>
                  <svg *ngIf="!hasFilterValue(field.key)" class="h-4 w-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                <button
                  *ngFor="let option of field.options"
                  type="button"
                  (click)="selectDropdownOption(field.key, option.value)"
                  class="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-start text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  [ngClass]="{
                    'bg-zadna-primary/5 text-zadna-primary': isOptionSelected(field.key, option.value)
                  }">
                  <span class="truncate">{{ getOptionLabel(field, option.label) }}</span>
                  <svg *ngIf="isOptionSelected(field.key, option.value)" class="h-4 w-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="hasActiveFilters" class="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ activeFiltersLabel | translate }}:</span>
        <div class="flex flex-wrap gap-1.5">
          <ng-container *ngFor="let field of fields">
            <span *ngIf="getFilterValue(field.key)" 
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black rounded border transition-all"
                  [style.background-color]="(field.color || '#6366f1') + '08'"
                  [style.border-color]="(field.color || '#6366f1') + '20'"
                  [style.color]="field.color || '#6366f1'">
              {{ getOptionLabel(field, getFilterDisplayValue(field, getFilterValue(field.key))) }}
              <button (click)="removeFilter(field.key)" class="hover:scale-110 transition-transform">
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .primary { color: var(--primary-color, #127c8c); }
    .from-primary { background: linear-gradient(to right, var(--primary-color, #127c8c), var(--primary-color-90, #127c8ce6)); }
    .to-primary { background: linear-gradient(to right, var(--primary-color-90, #127c8ce6), var(--primary-color, #127c8c)); }
    .border-primary { border-color: var(--primary-color, #127c8c); }
    .ring-primary-20 { box-shadow: 0 0 0 4px var(--primary-color-20, #127c8c33); }
  `]
})
export class AdvancedFilterPanelComponent<TFilters extends object = Record<string, FilterValue>> implements OnInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly translate = inject(TranslateService);

  @Input() isExpanded = false;
  @Input() title = 'VENDORS.FILTER_VENDORS';
  @Input() subtitle = 'VENDORS.ADJUST_CRITERIA';
  @Input() resetLabel = 'COMMON.RESET_FILTERS';
  @Input() saveLabel = 'COMMON.SAVE';
  @Input() activeFiltersLabel = 'VENDORS.KPI.PENDING_APPROVAL';
  @Input() fields: FilterField[] = [];
  @Input() filters = {} as TFilters;
  @Input() presets: FilterPreset[] = [];

  @Output() filtersChange = new EventEmitter<TFilters>();
  @Output() reset = new EventEmitter<void>();
  @Output() save = new EventEmitter<TFilters>();

  openDropdownKey: string | null = null;

  ngOnInit() {
    // Set CSS custom properties for theming
    document.documentElement.style.setProperty('--primary-color', '#127c8c');
    document.documentElement.style.setProperty('--primary-color-90', '#127c8ce6');
    document.documentElement.style.setProperty('--primary-color-20', '#127c8c33');
  }

  get hasActiveFilters(): boolean {
    return Object.keys(this.asMutableFilters()).some((key) =>
      this.getFilterValue(key) !== undefined && this.getFilterValue(key) !== null && this.getFilterValue(key) !== ''
    );
  }

  onFilterChange() {
    this.filtersChange.emit(this.filters);
  }

  onReset() {
    this.filters = {} as TFilters;
    this.openDropdownKey = null;
    this.reset.emit();
    this.filtersChange.emit(this.filters);
  }

  onSave() {
    this.save.emit(this.filters);
  }

  removeFilter(key: string) {
    delete this.asMutableFilters()[key];
    this.onFilterChange();
  }

  toggleDropdown(key: string): void {
    this.openDropdownKey = this.openDropdownKey === key ? null : key;
  }

  isDropdownOpen(key: string): boolean {
    return this.openDropdownKey === key;
  }

  selectDropdownOption(key: string, value: FilterValue): void {
    this.setFilterValue(key, value);
    this.openDropdownKey = null;
  }

  clearFilterValue(key: string): void {
    delete this.asMutableFilters()[key];
    this.onFilterChange();
    this.openDropdownKey = null;
  }

  hasFilterValue(key: string): boolean {
    const value = this.getFilterValue(key);
    return value !== undefined && value !== null && value !== '';
  }

  isOptionSelected(key: string, value: FilterValue): boolean {
    return this.getFilterValue(key) === value;
  }

  getSelectDisplayLabel(field: FilterField): string {
    const value = this.getFilterValue(field.key);
    if (value === undefined || value === null || value === '') {
      return this.translateLabel(field.placeholder || 'COMMON.HIDE_INACTIVE');
    }

    return this.getOptionLabel(field, this.getFilterDisplayValue(field, value));
  }

  getFilterDisplayValue(field: FilterField, value: FilterValue): string {
    if (field.options) {
      const option = field.options.find((opt) => opt.value === value);
      return option ? option.label : String(value ?? '');
    }
    return String(value ?? '');
  }

  getOptionLabel(field: FilterField, label: string): string {
    if (field.localizeOptions === false) {
      return label;
    }

    return this.translateLabel(label);
  }

  private translateLabel(label: string): string {
    const translated = this.translate.instant(label);
    return translated || label;
  }

  getFilterValue(key: string): FilterValue {
    return this.asMutableFilters()[key];
  }

  setFilterValue(key: string, value: FilterValue): void {
    this.asMutableFilters()[key] = value;
    this.onFilterChange();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(target)) {
      this.openDropdownKey = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.openDropdownKey = null;
  }

  private asMutableFilters(): Record<string, FilterValue> {
    return this.filters as Record<string, FilterValue>;
  }
}
