import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface DetailTabNavItem {
  id: string;
  labelKey: string;
  icon?: string;
  count?: number | string;
  attention?: boolean;
  route?: string;
}

@Component({
  selector: 'app-detail-tabs-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div
      class="w-full max-w-full relative overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 pb-2">
      <div class="flex w-max items-center bg-white/70 backdrop-blur-md p-1.5 rounded-[1.25rem] border border-slate-200/60 shadow-sm gap-1">
        <ng-container *ngFor="let tab of tabs">
          <a
            *ngIf="tab.route; else actionTab"
            [routerLink]="tab.route"
            (click)="onTabClick(tab.id)"
            class="relative px-4 sm:px-6 py-2 sm:py-2.5 text-[11px] sm:text-[13px] font-black transition-all duration-300 rounded-[1rem] whitespace-nowrap z-10 shrink-0 flex items-center justify-center tracking-wide group/tab"
            [ngClass]="isActive(tab.id)
              ? 'text-zadna-primary bg-white shadow-sm ring-1 ring-slate-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'"
            [attr.aria-label]="tab.labelKey | translate">

            <div class="flex items-center gap-2 px-1 relative z-10 w-full h-full justify-center">
              <span *ngIf="tab.icon" class="material-symbols-outlined text-[18px] sm:text-[20px]" [ngClass]="isActive(tab.id) ? 'text-zadna-primary' : 'text-slate-400'">{{ tab.icon }}</span>
              <span class="transition-transform duration-300 group-hover/tab:scale-105 whitespace-nowrap">{{ tab.labelKey | translate }}</span>
              <span
                *ngIf="tab.count !== undefined"
                class="text-[10px] min-w-[22px] h-[18px] flex items-center justify-center rounded-full transition-all duration-300 font-bold px-1.5"
                [class]="isActive(tab.id) ? 'bg-zadna-primary/10 text-zadna-primary' : 'bg-slate-100 text-slate-500 group-hover/tab:bg-slate-200'">
                {{ tab.count }}
              </span>
              <span *ngIf="tab.attention" class="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </div>
          </a>

          <ng-template #actionTab>
            <button
              type="button"
              (click)="onTabClick(tab.id)"
              class="relative px-4 sm:px-6 py-2 sm:py-2.5 text-[11px] sm:text-[13px] font-black transition-all duration-300 rounded-[1rem] whitespace-nowrap z-10 shrink-0 flex items-center justify-center tracking-wide group/tab"
              [ngClass]="isActive(tab.id)
                ? 'text-zadna-primary bg-white shadow-sm ring-1 ring-slate-100'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'"
              [attr.aria-label]="tab.labelKey | translate">

              <div class="flex items-center gap-2 px-1 relative z-10 w-full h-full justify-center">
                <span *ngIf="tab.icon" class="material-symbols-outlined text-[18px] sm:text-[20px]" [ngClass]="isActive(tab.id) ? 'text-zadna-primary' : 'text-slate-400'">{{ tab.icon }}</span>
                <span class="transition-transform duration-300 group-hover/tab:scale-105 whitespace-nowrap">{{ tab.labelKey | translate }}</span>
                <span
                  *ngIf="tab.count !== undefined"
                  class="text-[10px] min-w-[22px] h-[18px] flex items-center justify-center rounded-full transition-all duration-300 font-bold px-1.5"
                  [class]="isActive(tab.id) ? 'bg-zadna-primary/10 text-zadna-primary' : 'bg-slate-100 text-slate-500 group-hover/tab:bg-slate-200'">
                  {{ tab.count }}
                </span>
                <span *ngIf="tab.attention" class="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </div>
            </button>
          </ng-template>
        </ng-container>

        <div class="w-1 h-1 shrink-0"></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    @keyframes shine {
      100% {
        transform: translateX(100%);
      }
    }
  `]
})
export class DetailTabsNavComponent {
  @Input() tabs: DetailTabNavItem[] = [];
  @Input() activeTab = '';
  @Output() tabChange = new EventEmitter<string>();

  isActive(tabId: string): boolean {
    return this.activeTab === tabId;
  }

  onTabClick(tabId: string): void {
    this.tabChange.emit(tabId);
  }
}
