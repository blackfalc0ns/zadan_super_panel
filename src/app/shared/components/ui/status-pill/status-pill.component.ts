import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export type StatusPillVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'processing'
  | 'paused'
  | 'high-risk'
  | 'overdue';

@Component({
  selector: 'app-status-pill',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './status-pill.component.html',
  styleUrl: './status-pill.component.scss'
})
export class StatusPillComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() shouldTranslate = true;
  @Input() showDot = true;
  @Input() size: 'sm' | 'md' = 'md';
  @Input() variant: StatusPillVariant = 'neutral';

  get pillClasses(): string {
    const base = this.size === 'sm'
      ? 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black'
      : 'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black';

    const variants: Record<StatusPillVariant, string> = {
      primary: 'bg-zadna-primary/10 text-zadna-primary border border-zadna-primary/15',
      success: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      warning: 'bg-amber-50 text-amber-700 border border-amber-100',
      danger: 'bg-red-50 text-red-600 border border-red-100',
      info: 'bg-blue-50 text-blue-600 border border-blue-100',
      neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
      processing: 'bg-zadna-primary/10 text-zadna-primary border border-zadna-primary/15',
      paused: 'bg-slate-100 text-slate-500 border border-slate-200',
      'high-risk': 'bg-red-50 text-red-600 border border-red-100',
      overdue: 'bg-amber-50 text-amber-700 border border-amber-100'
    };

    return `${base} ${variants[this.variant]}`;
  }

  get dotClasses(): string {
    const variants: Record<StatusPillVariant, string> = {
      primary: 'bg-zadna-primary',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
      info: 'bg-blue-500',
      neutral: 'bg-slate-400',
      processing: 'bg-zadna-primary',
      paused: 'bg-slate-400',
      'high-risk': 'bg-red-500',
      overdue: 'bg-amber-500'
    };

    return variants[this.variant];
  }
}
