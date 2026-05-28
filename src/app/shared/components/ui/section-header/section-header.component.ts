import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type SectionHeaderTone = 'primary' | 'neutral' | 'warning' | 'danger' | 'success';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss'
})
export class SectionHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() eyebrow = '';
  @Input() icon = '';
  @Input() shouldTranslate = true;
  @Input() compact = false;
  @Input() tone: SectionHeaderTone = 'primary';

  get iconWrapperClasses(): string {
    const toneClasses: Record<SectionHeaderTone, string> = {
      primary: 'bg-zadna-primary/10 text-zadna-primary',
      neutral: 'bg-slate-100 text-slate-500',
      warning: 'bg-amber-100 text-amber-700',
      danger: 'bg-red-100 text-red-600',
      success: 'bg-emerald-100 text-emerald-600'
    };

    return `${this.compact ? 'h-9 w-9 rounded-xl' : 'h-11 w-11 rounded-2xl'} ${toneClasses[this.tone]} flex items-center justify-center shrink-0`;
  }

  get titleClasses(): string {
    return this.compact
      ? 'text-sm font-black text-slate-900'
      : 'text-sm font-black text-slate-900 sm:text-[15px]';
  }
}
