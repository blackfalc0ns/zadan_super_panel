import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class AppBadgeComponent {
  @Input() variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral';
  @Input() showDot = false;
  @Input() customClass = '';

  get badgeClasses(): string {
    const base = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all';
    
    const variants = {
      success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      warning: 'bg-zadna-accent/10 text-zadna-accent border-zadna-accent/20',
      danger: 'bg-red-50 text-red-600 border-red-100',
      info: 'bg-blue-50 text-blue-600 border-blue-100',
      neutral: 'bg-slate-50 text-slate-500 border-slate-100'
    }[this.variant];

    return `${base} ${variants} ${this.customClass}`;
  }

  get dotClasses(): string {
    return {
      success: 'bg-emerald-500',
      warning: 'bg-zadna-accent',
      danger: 'bg-red-500',
      info: 'bg-blue-500',
      neutral: 'bg-slate-400'
    }[this.variant];
  }
}
