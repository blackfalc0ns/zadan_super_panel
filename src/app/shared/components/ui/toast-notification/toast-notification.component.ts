import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  id?: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div *ngIf="isVisible" 
         class="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300"
         [class.animate-out]="isClosing"
         [class.slide-out-to-bottom-5]="isClosing">
      
      <div class="flex items-start gap-4 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl max-w-md"
           [ngClass]="getToastClasses()">
        
        <!-- Icon -->
        <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
          <svg *ngIf="config.type === 'success'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg *ngIf="config.type === 'error'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg *ngIf="config.type === 'warning'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <svg *ngIf="config.type === 'info'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h4 *ngIf="config.title" class="text-sm font-bold text-white mb-1">{{ config.title }}</h4>
          <p class="text-sm text-white/90 font-medium leading-relaxed">{{ config.message }}</p>
          
          <!-- Action Button -->
          <button *ngIf="config.action" 
                  (click)="onActionClick()"
                  class="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold text-white transition-all">
            {{ config.action.label }}
          </button>
        </div>

        <!-- Close Button -->
        <button *ngIf="!config.persistent" 
                (click)="close()"
                class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .animate-out {
      animation-duration: 200ms;
      animation-fill-mode: forwards;
    }
    
    .slide-out-to-bottom-5 {
      animation-name: slideOutToBottom;
    }
    
    @keyframes slideOutToBottom {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(1.25rem);
        opacity: 0;
      }
    }
  `]
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  @Input() config!: ToastConfig;
  @Output() dismiss = new EventEmitter<string>();

  isVisible = false;
  isClosing = false;
  private timeoutId?: number;

  ngOnInit() {
    this.isVisible = true;
    
    if (!this.config.persistent) {
      const duration = this.config.duration || 5000;
      this.timeoutId = window.setTimeout(() => {
        this.close();
      }, duration);
    }
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  close() {
    this.isClosing = true;
    setTimeout(() => {
      this.isVisible = false;
      this.dismiss.emit(this.config.id);
    }, 200);
  }

  onActionClick() {
    if (this.config.action) {
      this.config.action.handler();
      this.close();
    }
  }

  getToastClasses(): string {
    const baseClasses = 'border-2';
    
    switch (this.config.type) {
      case 'success':
        return `${baseClasses} bg-emerald-500 border-emerald-400`;
      case 'error':
        return `${baseClasses} bg-red-500 border-red-400`;
      case 'warning':
        return `${baseClasses} bg-amber-500 border-amber-400`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-500 border-blue-400`;
    }
  }
}