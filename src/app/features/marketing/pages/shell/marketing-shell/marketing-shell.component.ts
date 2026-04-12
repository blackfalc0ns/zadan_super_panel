import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-marketing-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="h-full flex flex-col bg-slate-50/50 font-sans pb-10 overflow-y-auto" [dir]="'SIDEBAR.DIR' | translate">
      <div class="flex-1 min-h-0 px-4 md:px-10 py-4 max-w-[120rem] mx-auto w-full space-y-6 animate-in slide-in-from-bottom-10 duration-700">
        <div class="space-y-6">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [':host { display: block; height: 100%; }']
})
export class MarketingShellComponent {}
