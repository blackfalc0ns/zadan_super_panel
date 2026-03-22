import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AppButtonComponent } from '../ui/button/button.component';
import { AppCardComponent } from '../ui/card/card.component';

@Component({
  selector: 'app-delete-confirmation-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule, AppButtonComponent, AppCardComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div *ngIf="isOpen" class="delete-modal-overlay">
      <!-- Enhanced Backdrop with Stronger Blur - Covers Everything -->
      <div class="delete-modal-backdrop" (click)="onClose()"></div>

      <!-- Modal Content -->
      <app-card 
        variant="default"
        padding="none"
        customClass="delete-modal-card">
        
        <div class="p-8 text-center bg-white">
            <!-- Warning Icon Area -->
            <div class="mx-auto w-24 h-24 rounded-[2.5rem] bg-red-50 flex items-center justify-center mb-6 relative group overflow-hidden border border-red-100/50">
              <div class="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent"></div>
              <svg class="w-12 h-12 text-red-500 relative z-10 animate-shake" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <!-- Text Area -->
            <h3 class="text-2xl font-black text-slate-900 mb-2 leading-tight">
              {{ title | translate }}
            </h3>
            <p class="text-slate-500 text-sm font-bold leading-relaxed mb-8">
              {{ message | translate }}
            </p>

            <!-- Action Bar -->
            <div class="flex gap-4">
              <app-button 
                variant="ghost" 
                customClass="flex-1"
                (btnClick)="onClose()">
                {{ 'COMMON.CANCEL' | translate }}
              </app-button>
              
              <app-button 
                variant="danger" 
                customClass="flex-1"
                [isLoading]="isLoading"
                (btnClick)="onConfirm()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {{ 'COMMON.CONFIRM_DELETE' | translate }}
              </app-button>
            </div>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .delete-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      overflow: hidden;
      animation: fadeIn 0.3s ease-out;
    }
    
    .delete-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      z-index: 1;
    }
    
    .delete-modal-card {
      width: 450px;
      max-width: 100%;
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      border-radius: 3rem;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: scale(0.9) translateY(40px); 
      }
      to { 
        opacity: 1; 
        transform: scale(1) translateY(0); 
      }
    }

    @keyframes shake {
      0%, 100% { transform: rotate(0); }
      20%, 60% { transform: rotate(-10deg); }
      40%, 80% { transform: rotate(10deg); }
    }
    
    .animate-shake { 
      animation: shake 1s infinite; 
    }
  `]
})
export class DeleteConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = 'COMMON.DELETE_CONFIRM_TITLE';
  @Input() message = 'COMMON.DELETE_CONFIRM_MSG';
  @Input() isLoading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onClose() {
    this.close.emit();
  }
}
