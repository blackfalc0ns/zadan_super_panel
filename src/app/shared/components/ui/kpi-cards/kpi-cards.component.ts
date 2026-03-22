import { Component, Input, Output, EventEmitter } from '@angular/core';
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

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-in fade-in slide-in-from-top-5 duration-700">
      <div *ngFor="let card of cards" 
           class="bg-white border border-slate-100 rounded-[1.5rem] p-5 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 shadow-sm"
           [class.border-r-4]="card.id === 'high-risk'"
           [style.border-right-color]="card.id === 'high-risk' ? card.color : null"
           (click)="onCardClick(card)">
        
        <div class="flex items-start justify-between">
           <div class="flex flex-col">
            <p class="text-[12px] font-black uppercase tracking-tight mb-2 text-slate-400">
               {{ card.title | translate }}
            </p>
            <div class="flex items-baseline gap-2">
                <h3 class="text-2xl font-black text-slate-800">
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

           <div class="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500"
                [style.background-color]="card.color + '10'">
                <div [innerHTML]="card.icon" 
                    class="w-6 h-6 flex items-center justify-center"
                    [style.color]="card.color"></div>
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

  onCardClick(card: KPICard) {
    if (card.clickable) {
      this.cardClick.emit(card);
    }
  }
}