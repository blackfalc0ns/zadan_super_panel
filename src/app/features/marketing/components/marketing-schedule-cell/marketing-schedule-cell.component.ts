import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { formatMarketingScheduleDate, isAlwaysActiveSchedule } from '@marketing/utils/marketing-date.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-marketing-schedule-cell',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    @if (isAlwaysActive) {
      <span class="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/70 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
        <span class="material-symbols-outlined text-[14px]">all_inclusive</span>
        {{ 'MARKETING.COMMON.SCHEDULE_DISPLAY.ALWAYS_ACTIVE' | translate }}
      </span>
    } @else {
      <div class="flex min-w-0 flex-col gap-1">
        @if (startsAtUtc) {
          <div class="flex min-w-0 items-center gap-1.5">
            <span class="shrink-0 text-[10px] font-black uppercase tracking-wide text-slate-400">
              {{ 'MARKETING.COMMON.SCHEDULE_DISPLAY.FROM' | translate }}
            </span>
            <span class="truncate text-[11px] font-bold text-slate-700 tabular-nums" dir="ltr">
              {{ formatDate(startsAtUtc) }}
            </span>
          </div>
        }
        @if (endsAtUtc) {
          <div class="flex min-w-0 items-center gap-1.5">
            <span class="shrink-0 text-[10px] font-black uppercase tracking-wide text-slate-400">
              {{ 'MARKETING.COMMON.SCHEDULE_DISPLAY.UNTIL' | translate }}
            </span>
            <span class="truncate text-[11px] font-bold text-slate-700 tabular-nums" dir="ltr">
              {{ formatDate(endsAtUtc) }}
            </span>
          </div>
        }
      </div>
    }
  `
})
export class MarketingScheduleCellComponent {
  @Input() startsAtUtc?: string | null;
  @Input() endsAtUtc?: string | null;

  get isAlwaysActive(): boolean {
    return isAlwaysActiveSchedule(this.startsAtUtc, this.endsAtUtc);
  }

  formatDate(value?: string | null): string {
    return formatMarketingScheduleDate(value);
  }
}
