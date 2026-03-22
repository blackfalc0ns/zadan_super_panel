import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface FilterOption {
  value: any;
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
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: { [key: string]: any };
}

@Component({
  selector: 'app-advanced-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div *ngIf="isExpanded" 
         class="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-5 shadow-xl animate-in slide-in-from-top-3 duration-300">
      
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div *ngFor="let field of fields" class="space-y-1.5">
          <label class="flex items-center gap-2 text-[10px] font-black text-slate-500 px-1">
            <div class="w-1.5 h-1.5 rounded-full" [style.background-color]="field.color || '#6366f1'"></div>
            {{ field.label | translate }}
          </label>
          
          <!-- Select Field -->
          <div *ngIf="field.type === 'select'" class="relative">
            <select [(ngModel)]="filters[field.key]" (change)="onFilterChange()"
                    class="w-full px-3.5 py-2 text-[11px] font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-20 focus:border-primary transition-all duration-200 bg-white hover:border-slate-300 appearance-none cursor-pointer text-slate-700">
              <option [value]="undefined">{{ 'COMMON.HIDE_INACTIVE' | translate }}</option>
              <option *ngFor="let option of field.options" [value]="option.value">{{ option.label | translate }}</option>
            </select>
            <div class="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
              <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="hasActiveFilters" class="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ activeFiltersLabel | translate }}:</span>
        <div class="flex flex-wrap gap-1.5">
          <ng-container *ngFor="let field of fields">
            <span *ngIf="filters[field.key]" 
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black rounded border transition-all"
                  [style.background-color]="(field.color || '#6366f1') + '08'"
                  [style.border-color]="(field.color || '#6366f1') + '20'"
                  [style.color]="field.color || '#6366f1'">
              {{ getFilterDisplayValue(field, filters[field.key]) | translate }}
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
export class AdvancedFilterPanelComponent implements OnInit {
  @Input() isExpanded = false;
  @Input() title = 'VENDORS.FILTER_VENDORS';
  @Input() subtitle = 'VENDORS.ADJUST_CRITERIA';
  @Input() resetLabel = 'COMMON.RESET_FILTERS';
  @Input() saveLabel = 'COMMON.SAVE';
  @Input() activeFiltersLabel = 'VENDORS.KPI.PENDING_APPROVAL';
  @Input() fields: FilterField[] = [];
  @Input() filters: { [key: string]: any } = {};
  @Input() presets: FilterPreset[] = [];

  @Output() filtersChange = new EventEmitter<{ [key: string]: any }>();
  @Output() reset = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ [key: string]: any }>();

  ngOnInit() {
    // Set CSS custom properties for theming
    document.documentElement.style.setProperty('--primary-color', '#127c8c');
    document.documentElement.style.setProperty('--primary-color-90', '#127c8ce6');
    document.documentElement.style.setProperty('--primary-color-20', '#127c8c33');
  }

  get hasActiveFilters(): boolean {
    return Object.keys(this.filters).some(key => 
      this.filters[key] !== undefined && this.filters[key] !== null && this.filters[key] !== ''
    );
  }

  onFilterChange() {
    this.filtersChange.emit(this.filters);
  }

  onReset() {
    this.filters = {};
    this.reset.emit();
    this.filtersChange.emit(this.filters);
  }

  onSave() {
    this.save.emit(this.filters);
  }

  removeFilter(key: string) {
    delete this.filters[key];
    this.onFilterChange();
  }

  getFilterDisplayValue(field: FilterField, value: any): string {
    if (field.options) {
      const option = field.options.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    return value;
  }
}