import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export interface KeyValueGridItem {
  label: string;
  value: string;
  helper?: string;
  icon?: string;
  translateLabel?: boolean;
  translateValue?: boolean;
  translateHelper?: boolean;
  valueDir?: 'rtl' | 'ltr' | 'auto';
  valueTone?: 'default' | 'accent' | 'danger' | 'warning' | 'muted';
}

@Component({
  selector: 'app-key-value-grid',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './key-value-grid.component.html',
  styleUrl: './key-value-grid.component.scss'
})
export class KeyValueGridComponent {
  @Input() items: KeyValueGridItem[] = [];
  @Input() columns: 1 | 2 | 3 | 4 = 2;
  @Input() dense = false;
  @Input() bordered = false;

  get gridClasses(): string {
    const columnsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
    };

    return `grid ${columnsMap[this.columns]} ${this.dense ? 'gap-3' : 'gap-4'}`;
  }

  getItemClasses(): string {
    return this.bordered
      ? 'rounded-[1.25rem] border border-slate-200/70 bg-white/60 p-5 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.04)] hover:bg-white hover:border-slate-300/60 hover:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)] transition-all duration-300'
      : '';
  }

  getValueClasses(item: KeyValueGridItem): string {
    const tones = {
      default: 'text-slate-800',
      accent: 'text-zadna-primary',
      danger: 'text-red-600',
      warning: 'text-amber-700',
      muted: 'text-slate-500'
    };

    return `text-sm font-black ${tones[item.valueTone || 'default']}`;
  }
}
