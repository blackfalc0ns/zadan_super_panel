import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SettlementStatus, RefundStatus, CodStatus } from '../../models/finance.models';
import { FINANCE_STATUS_LABEL_KEYS } from '../../utils/finance-i18n.utils';

type FinanceStatusValue = SettlementStatus | RefundStatus | CodStatus | 'pending_approval' | string;

interface StatusConfig {
  labelKey: string;
  dotColor: string;
  badgeClass: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-finance-status-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border"
      [ngClass]="config.badgeClass"
    >
      <span class="w-1.5 h-1.5 rounded-full shrink-0" [ngClass]="config.dotColor"
            [class.animate-pulse]="isPulsing()"></span>
      {{ config.labelKey | translate }}
    </span>
  `
})
export class FinanceStatusBadgeComponent {
  @Input() status: FinanceStatusValue = 'pending';

  get config(): StatusConfig {
    const map: Record<string, StatusConfig> = {
      // Settlement statuses
      pending:            { labelKey: FINANCE_STATUS_LABEL_KEYS['pending'],          dotColor: 'bg-amber-400',   badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
      pending_review:     { labelKey: FINANCE_STATUS_LABEL_KEYS['pending_review'],   dotColor: 'bg-amber-400',   badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
      approved:           { labelKey: FINANCE_STATUS_LABEL_KEYS['approved'],         dotColor: 'bg-blue-400',    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
      on_hold:            { labelKey: FINANCE_STATUS_LABEL_KEYS['on_hold'],          dotColor: 'bg-slate-400',   badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
      processing:         { labelKey: FINANCE_STATUS_LABEL_KEYS['processing'],       dotColor: 'bg-blue-400',    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
      paid:               { labelKey: FINANCE_STATUS_LABEL_KEYS['paid'],             dotColor: 'bg-emerald-400', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      settled:            { labelKey: FINANCE_STATUS_LABEL_KEYS['settled'],          dotColor: 'bg-emerald-400', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      failed:             { labelKey: FINANCE_STATUS_LABEL_KEYS['failed'],           dotColor: 'bg-red-400',     badgeClass: 'bg-red-50 text-red-700 border-red-200' },
      reversed:           { labelKey: FINANCE_STATUS_LABEL_KEYS['reversed'],         dotColor: 'bg-orange-400',  badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
      disputed:           { labelKey: FINANCE_STATUS_LABEL_KEYS['disputed'],         dotColor: 'bg-purple-400',  badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
      // Refund statuses
      open:               { labelKey: FINANCE_STATUS_LABEL_KEYS['open'],         dotColor: 'bg-slate-400',   badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
      under_review:       { labelKey: FINANCE_STATUS_LABEL_KEYS['under_review'], dotColor: 'bg-blue-400',    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
      rejected:           { labelKey: FINANCE_STATUS_LABEL_KEYS['rejected'],     dotColor: 'bg-red-400',     badgeClass: 'bg-red-50 text-red-700 border-red-200' },
      escalated:          { labelKey: FINANCE_STATUS_LABEL_KEYS['escalated'],    dotColor: 'bg-orange-400',  badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
      // COD statuses
      collected:          { labelKey: FINANCE_STATUS_LABEL_KEYS['collected'],    dotColor: 'bg-emerald-400', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      overdue:            { labelKey: FINANCE_STATUS_LABEL_KEYS['overdue'],      dotColor: 'bg-red-400',     badgeClass: 'bg-red-50 text-red-700 border-red-200' },
      // Adjustment
      pending_approval:   { labelKey: FINANCE_STATUS_LABEL_KEYS['pending_approval'], dotColor: 'bg-amber-400', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' }
    };
    return map[this.status] ?? { labelKey: this.status, dotColor: 'bg-slate-400', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' };
  }

  isPulsing(): boolean {
    return ['processing', 'under_review', 'pending_approval'].includes(this.status);
  }
}
