import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type InlineBannerVariant = 'info' | 'success' | 'warning' | 'error' | 'critical';

@Component({
  selector: 'app-inline-banner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './inline-banner.component.html',
  styleUrl: './inline-banner.component.scss'
})
export class InlineBannerComponent {
  @Input() title = '';
  @Input() message = '';
  @Input() translate = true;
  @Input() icon = '';
  @Input() compact = false;
  @Input() variant: InlineBannerVariant = 'info';

  get wrapperClasses(): string {
    const base = this.compact
      ? 'flex items-start gap-3 rounded-xl border p-3'
      : 'flex items-start gap-3 rounded-xl border p-4';

    const variants: Record<InlineBannerVariant, string> = {
      info: 'border-blue-100 bg-blue-50/80 text-blue-700',
      success: 'border-emerald-100 bg-emerald-50/80 text-emerald-700',
      warning: 'border-amber-100 bg-amber-50/80 text-amber-800',
      error: 'border-red-100 bg-red-50/80 text-red-700',
      critical: 'border-red-200 bg-red-50 text-red-700'
    };

    return `${base} ${variants[this.variant]}`;
  }

  get resolvedIcon(): string {
    if (this.icon) {
      return this.icon;
    }

    const defaults: Record<InlineBannerVariant, string> = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
      critical: 'report'
    };

    return defaults[this.variant];
  }
}
