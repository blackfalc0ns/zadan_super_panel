import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LedgerDirection } from '../../models/finance.models';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-money-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1 font-black tabular-nums" [ngClass]="getClasses()">
      <span *ngIf="showDirection" class="material-symbols-outlined text-[13px]">
        {{ direction === 'credit' ? 'add' : 'remove' }}
      </span>
      <span>{{ formattedAmount }}</span>
      <span *ngIf="currency" class="font-medium opacity-70 text-[0.8em]">{{ currency }}</span>
    </span>
  `
})
export class MoneyBadgeComponent {
  private translate = inject(TranslateService);

  @Input() amount: number = 0;
  @Input() currency: string = 'SAR';
  @Input() direction: LedgerDirection | null = null;
  @Input() showDirection: boolean = false;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'sm';

  get formattedAmount(): string {
    return this.amount.toLocaleString(getFinanceLocale(this.translate.currentLang), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  getClasses(): string {
    const sizeMap = { xs: 'text-[10px]', sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
    const size = sizeMap[this.size];
    if (this.direction === 'credit') return `${size} text-emerald-600`;
    if (this.direction === 'debit')  return `${size} text-red-600`;
    if (this.amount < 0) return `${size} text-red-600`;
    return `${size} text-slate-800`;
  }
}
