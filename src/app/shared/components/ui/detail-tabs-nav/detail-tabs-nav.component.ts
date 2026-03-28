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
      <div class="flex w-max items-center bg-slate-900/[0.04] p-[3px] rounded-xl border border-slate-900/5 gap-1">
        <ng-container *ngFor="let tab of tabs">
          <a
            *ngIf="tab.route; else actionTab"
            [routerLink]="tab.route"
            (click)="onTabClick(tab.id)"
            class="relative px-3 sm:px-6 py-1.5 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-black transition-all duration-300 rounded-lg sm:rounded-xl whitespace-nowrap z-10 shrink-0 flex items-center justify-center tracking-tight group/tab"
            [ngClass]="isActive(tab.id)
              ? 'text-white shadow-md bg-gradient-to-br from-[#127c8c] to-[#0e5f6b]'
              : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'"
            [attr.aria-label]="tab.labelKey | translate">
            <div
              *ngIf="isActive(tab.id)"
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shine_3s_infinite] rounded-lg sm:rounded-xl overflow-hidden pointer-events-none">
            </div>

            <div class="flex items-center gap-2 px-1 relative z-10 w-full h-full justify-center">
              <span *ngIf="tab.icon" class="material-symbols-outlined text-[16px] sm:text-[18px]">{{ tab.icon }}</span>
              <span class="transition-transform duration-300 group-hover/tab:scale-105 whitespace-nowrap">{{ tab.labelKey | translate }}</span>
              <span
                *ngIf="tab.count !== undefined"
                class="text-[9px] sm:text-[10px] min-w-[20px] sm:min-w-[22px] h-[16px] sm:h-[18px] flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 font-bold px-1.5"
                [class]="isActive(tab.id) ? 'bg-white/20 text-white' : 'bg-slate-200/50 text-slate-500 group-hover/tab:bg-slate-200'">
                {{ tab.count }}
              </span>
              <span *ngIf="tab.attention" class="h-2 w-2 rounded-full bg-red-500"></span>
            </div>
          </a>

          <ng-template #actionTab>
            <button
              type="button"
              (click)="onTabClick(tab.id)"
              class="relative px-3 sm:px-6 py-1.5 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-black transition-all duration-300 rounded-lg sm:rounded-xl whitespace-nowrap z-10 shrink-0 flex items-center justify-center tracking-tight group/tab"
              [ngClass]="isActive(tab.id)
                ? 'text-white shadow-md bg-gradient-to-br from-[#127c8c] to-[#0e5f6b]'
                : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'"
              [attr.aria-label]="tab.labelKey | translate">
              <div
                *ngIf="isActive(tab.id)"
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shine_3s_infinite] rounded-lg sm:rounded-xl overflow-hidden pointer-events-none">
              </div>

              <div class="flex items-center gap-2 px-1 relative z-10 w-full h-full justify-center">
                <span *ngIf="tab.icon" class="material-symbols-outlined text-[16px] sm:text-[18px]">{{ tab.icon }}</span>
                <span class="transition-transform duration-300 group-hover/tab:scale-105 whitespace-nowrap">{{ tab.labelKey | translate }}</span>
                <span
                  *ngIf="tab.count !== undefined"
                  class="text-[9px] sm:text-[10px] min-w-[20px] sm:min-w-[22px] h-[16px] sm:h-[18px] flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 font-bold px-1.5"
                  [class]="isActive(tab.id) ? 'bg-white/20 text-white' : 'bg-slate-200/50 text-slate-500 group-hover/tab:bg-slate-200'">
                  {{ tab.count }}
                </span>
                <span *ngIf="tab.attention" class="h-2 w-2 rounded-full bg-red-500"></span>
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
