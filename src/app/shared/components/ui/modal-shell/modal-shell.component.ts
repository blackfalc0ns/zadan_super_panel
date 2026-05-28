import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-modal-shell',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './modal-shell.component.html',
  styleUrl: './modal-shell.component.scss'
})
export class ModalShellComponent {
  @Input() dir: 'rtl' | 'ltr' | 'auto' = 'rtl';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() shouldTranslate = true;
  @Input() maxWidthClass = 'max-w-4xl';
  @Input() panelClass = '';
  @Input() headerClass = '';
  @Input() bodyClass = '';
  @Input() footerClass = '';
  @Input() titleClass = 'text-xl font-black tracking-tight text-zadna-primary';
  @Input() subtitleClass = 'text-sm font-medium text-slate-500';
  @Input() closeButtonClass = 'rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600';
  @Input() backdropClass = 'bg-slate-900/35 p-4 backdrop-blur-sm';
  @Input() showFooter = true;

  @Output() close = new EventEmitter<void>();

  get panelClasses(): string {
    const base = 'modal-shell-panel relative isolate flex max-h-[92vh] w-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_20px_50px_-12px_rgba(15,23,42,0.22)]';
    return `${base} ${this.maxWidthClass} ${this.panelClass}`.trim();
  }

  get headerClasses(): string {
    const base = 'modal-shell-header relative z-[1] sticky top-0 flex items-start justify-between gap-4 border-b border-slate-200/70 bg-white px-6 py-5';
    return `${base} ${this.headerClass}`.trim();
  }

  get isRtl(): boolean {
    return this.dir !== 'ltr';
  }

  get headerContentClasses(): string {
    const base = 'flex min-w-0 flex-1 items-start gap-4';
    return `${base} ${this.isRtl ? 'flex-row-reverse' : ''}`.trim();
  }

  get titleWrapperClasses(): string {
    const base = 'min-w-0 flex-1 flex flex-col';
    return `${base} ${this.isRtl ? 'items-end text-right' : 'items-start text-left'}`.trim();
  }

  get titleRowClasses(): string {
    const base = 'inline-flex max-w-full min-w-0 items-center gap-2';
    return `${base} ${this.isRtl ? 'flex-row-reverse justify-end' : 'flex-row justify-start'}`.trim();
  }

  get bodyClasses(): string {
    const base = 'modal-shell-body relative z-[1] flex-1 overflow-y-auto bg-white px-6 py-6';
    return `${base} ${this.bodyClass}`.trim();
  }

  get footerClasses(): string {
    const base = 'modal-shell-footer relative z-[1] sticky bottom-0 border-t border-slate-200/70 bg-white px-6 py-4';
    return `${base} ${this.footerClass}`.trim();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
