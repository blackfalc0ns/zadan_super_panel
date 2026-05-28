import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface PreviewAction {
  id: string;
  label: string;
  icon: string;
  color?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

const VALID_ICON_NAME = /^[a-z][a-z0-9_]*$/;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-quick-preview-drawer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div *ngIf="isOpen"
         class="fixed inset-0 z-50 overflow-hidden"
         (click)="onClose()">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"></div>

      <div class="fixed inset-y-0 max-w-md w-full bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-out"
           [ngClass]="{
             'left-0': isRTL,
             'right-0': !isRTL,
             'translate-x-0': isOpen && isRTL,
             '-translate-x-0': isOpen && !isRTL,
             '-translate-x-full': !isOpen && isRTL,
             'translate-x-full': !isOpen && !isRTL
           }"
           (click)="$event.stopPropagation()">

        <div class="h-full flex flex-col" [attr.dir]="isRTL ? 'rtl' : 'ltr'">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div class="flex items-center gap-3">
              <div *ngIf="headerIcon"
                   class="w-10 h-10 rounded-2xl flex items-center justify-center"
                   [style.background-color]="headerColor + '20'">
                <span class="material-symbols-outlined text-[20px]"
                      [style.color]="headerColor">{{ getIconName(headerIcon) }}</span>
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-900">{{ title }}</h3>
                <p *ngIf="subtitle" class="text-sm text-slate-500 font-medium">{{ subtitle }}</p>
              </div>
            </div>
            <button (click)="onClose()"
                    class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <ng-container *ngTemplateOutlet="contentTemplate; context: { $implicit: data }"></ng-container>
          </div>

          <!-- Footer Actions -->
          <div *ngIf="actions.length > 0" class="p-6 border-t border-slate-100 bg-slate-50/50">
            <div class="space-y-3">
              <button *ngFor="let action of primaryActions"
                      (click)="onAction(action)"
                      class="w-full py-3 rounded-2xl font-bold transition-all text-sm"
                      [ngClass]="getActionClasses(action)">
                <div class="flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">{{ getIconName(action.icon) }}</span>
                  {{ action.label | translate }}
                </div>
              </button>

              <div *ngIf="secondaryActions.length > 0" class="grid grid-cols-2 gap-3">
                <button *ngFor="let action of secondaryActions"
                        (click)="onAction(action)"
                        class="py-2 rounded-2xl font-bold transition-all text-sm"
                        [ngClass]="getActionClasses(action)">
                  <div class="flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-[16px]">{{ getIconName(action.icon) }}</span>
                    {{ action.label | translate }}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class QuickPreviewDrawerComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() headerIcon = '';
  @Input() headerColor = '#127c8c';
  @Input() data: unknown = null;
  @Input() actions: PreviewAction[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<PreviewAction>();

  @ContentChild('content') contentTemplate!: TemplateRef<unknown>;

  constructor(private translate: TranslateService) {}

  get isRTL(): boolean {
    return this.translate.currentLang === 'ar';
  }

  get primaryActions(): PreviewAction[] {
    return this.actions.filter(action => action.variant === 'primary' || !action.variant);
  }

  get secondaryActions(): PreviewAction[] {
    return this.actions.filter(action => action.variant !== 'primary' && action.variant);
  }

  onClose() {
    this.close.emit();
  }

  onAction(action: PreviewAction) {
    this.actionClick.emit(action);
  }

  /**
   * Returns a safe Material Symbols icon name from either a bare token
   * or a legacy HTML wrapper. Falls back to a neutral icon for unknown
   * inputs so we never inject untrusted HTML.
   */
  getIconName(value: string | undefined | null): string {
    if (!value) {
      return 'circle';
    }

    const trimmed = value.trim();
    if (VALID_ICON_NAME.test(trimmed)) {
      return trimmed;
    }

    const innerMatch = trimmed.match(/>\s*([a-z][a-z0-9_]*)\s*</i);
    if (innerMatch && VALID_ICON_NAME.test(innerMatch[1].toLowerCase())) {
      return innerMatch[1].toLowerCase();
    }

    return 'circle';
  }

  getActionClasses(action: PreviewAction): string {
    const baseClasses = 'transition-all duration-200';

    switch (action.variant) {
      case 'primary':
        return `${baseClasses} bg-zadna-primary hover:bg-zadna-primary/90 text-white shadow-md hover:shadow-lg active:scale-95`;
      case 'success':
        return `${baseClasses} bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white`;
      case 'danger':
        return `${baseClasses} bg-red-50 text-red-600 hover:bg-red-500 hover:text-white`;
      case 'secondary':
      default:
        return `${baseClasses} bg-slate-50 text-slate-600 hover:bg-slate-200`;
    }
  }
}
