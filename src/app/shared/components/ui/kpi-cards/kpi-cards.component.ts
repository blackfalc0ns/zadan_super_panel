import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface KPICard {
  id: string;
  title: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: {
    value: number | string;
    isPositive: boolean;
    label?: string;
  };
  clickable?: boolean;
}

/**
 * Pattern that matches a valid Material Symbols icon name. Allows only
 * lowercase letters, digits and underscores. Anything else is rejected to
 * defend against arbitrary HTML injection.
 */
const VALID_ICON_NAME = /^[a-z][a-z0-9_]*$/;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div
      class="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-5 duration-700 md:grid-cols-3"
      [ngClass]="gridColumnClass">
      <div *ngFor="let card of cards"
           class="bg-white border border-slate-100 rounded-[1.3rem] px-4 py-4 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-slate-200/40 hover:-translate-y-0.5 shadow-sm"
           [class.border-r-4]="card.id === 'high-risk'"
           [style.border-right-color]="card.id === 'high-risk' ? card.color : null"
           (click)="onCardClick(card)">

        <div class="flex items-start justify-between">
           <div class="flex flex-col">
            <p class="text-[10px] font-black uppercase tracking-tight mb-1.5 text-slate-400">
               {{ card.title | translate }}
            </p>
            <div class="flex items-baseline gap-2">
                <h3 class="text-xl font-black text-slate-800">
                    {{ card.value }}
                </h3>
                <div *ngIf="card.trend" class="flex items-center gap-0.5 whitespace-nowrap">
                   <span class="text-[10px] font-bold flex items-center"
                         [class.text-emerald-500]="card.trend.isPositive"
                         [class.text-red-500]="!card.trend.isPositive">
                        <span *ngIf="card.trend.isPositive && !card.trend.label" class="material-symbols-outlined text-[10px]">trending_up</span>
                        <span *ngIf="!card.trend.isPositive && !card.trend.label" class="material-symbols-outlined text-[10px]">trending_down</span>
                        {{ card.trend.label || (card.trend.value + '%') }}
                   </span>
                </div>
            </div>
           </div>

           <div class="zadana-icon-box w-10 h-10 rounded-xl group-hover:rotate-12 transition-transform duration-500"
                [style.background-color]="card.color + '10'">
                <span class="material-symbols-outlined text-[20px]"
                      [style.color]="card.color">{{ getIconName(card.icon) }}</span>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class KpiCardsComponent {
  @Input() cards: KPICard[] = [];
  @Output() cardClick = new EventEmitter<KPICard>();

  get gridColumnClass(): string {
    return this.cards.length > 5
      ? 'lg:grid-cols-3 xl:grid-cols-6'
      : 'lg:grid-cols-5';
  }

  /**
   * Extracts a safe Material Symbols icon name from either:
   *   - a bare name like "pending_actions", or
   *   - a legacy HTML wrapper like "<span class=...>pending_actions</span>".
   *
   * Anything that does not match the strict whitelist is replaced with a
   * neutral fallback so we never inject untrusted HTML.
   */
  getIconName(value: string | undefined | null): string {
    if (!value) {
      return 'circle';
    }

    const trimmed = value.trim();

    if (VALID_ICON_NAME.test(trimmed)) {
      return trimmed;
    }

    const innerMatch = trimmed.match(/>\s*([a-z][a-z0-9_]*)\s*</i);
    if (innerMatch && VALID_ICON_NAME.test(innerMatch[1].toLowerCase())) {
      return innerMatch[1].toLowerCase();
    }

    return 'circle';
  }

  onCardClick(card: KPICard) {
    if (card.clickable) {
      this.cardClick.emit(card);
    }
  }
}
