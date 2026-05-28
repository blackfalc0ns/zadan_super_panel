import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppCardComponent } from '../card/card.component';
import { AppPageHeaderComponent } from '../page-header/page-header.component';

type RouteTarget = string | Array<string | number>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-feature-placeholder-page',
  standalone: true,
  imports: [CommonModule, RouterModule, AppPageHeaderComponent, AppCardComponent],
  template: `
    <div class="px-4 py-4 sm:px-6 sm:py-6">
      <app-page-header [title]="title" [subtitle]="subtitle"></app-page-header>

      <div class="mt-6 grid gap-4 lg:grid-cols-[2fr,1fr]">
        <app-card variant="glass" rounded="3xl" customClass="border border-slate-200/60">
          <div class="space-y-3">
            <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{{ eyebrow }}</p>
            <h2 class="text-2xl font-black tracking-tight text-slate-900">{{ title }}</h2>
            <p class="max-w-3xl text-sm leading-7 text-slate-600">{{ description }}</p>
          </div>
        </app-card>

        <app-card variant="default" rounded="3xl" customClass="border border-slate-200/60">
          <div class="space-y-3">
            <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Status</p>
            <p class="text-lg font-black text-slate-900">Scaffolded</p>
            <p class="text-sm leading-6 text-slate-600">{{ statusNote }}</p>
            <a
              *ngIf="primaryRoute"
              class="inline-flex rounded-2xl bg-zadna-primary px-4 py-2 text-sm font-black text-white transition hover:opacity-90"
              [routerLink]="primaryRoute">
              {{ primaryLabel }}
            </a>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class FeaturePlaceholderPageComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() eyebrow = 'Roadmap Feature';
  @Input() description = '';
  @Input() statusNote = 'This section has been scaffolded during the architecture refactor and is ready for feature-specific implementation.';
  @Input() primaryLabel = 'Open';
  @Input() primaryRoute: RouteTarget | null = null;
}
