import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-delete-confirmation-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div *ngIf="isOpen" class="zadana-modal-overlay">
      <!-- Premium Glassmorphism Backdrop -->
      <div class="zadana-modal-backdrop" (click)="onClose()"></div>

      <!-- Modal Card -->
      <div class="zadana-modal-card">
        
        <!-- Close Button -->
        <button 
          type="button" 
          (click)="onClose()" 
          class="zadana-modal-close"
          aria-label="Close">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="zadana-modal-content">
          <!-- Icon Area -->
          <div class="zadana-modal-icon-wrapper" [ngClass]="'icon-' + type">
            <div class="zadana-modal-icon-bg"></div>
            <!-- Danger Icon -->
            <svg *ngIf="type === 'danger'" class="w-6 h-6 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <!-- Warning Icon -->
            <svg *ngIf="type === 'warning'" class="w-6 h-6 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <!-- Success Icon -->
            <svg *ngIf="type === 'success'" class="w-6 h-6 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <!-- Info Icon -->
            <svg *ngIf="type === 'info'" class="w-6 h-6 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Text Content -->
          <div class="zadana-modal-text">
            <h3 class="zadana-modal-title">{{ title | translate }}</h3>
            <p class="zadana-modal-desc">{{ message | translate }}</p>
          </div>

          <!-- Error Alert Banner -->
          <div *ngIf="errorMessage" class="zadana-modal-error">
            <svg class="w-4 h-4 shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Actions -->
          <div class="zadana-modal-actions">
            <button 
              type="button"
              [disabled]="isLoading"
              (click)="onClose()"
              class="zadana-btn-secondary">
              {{ cancelText | translate }}
            </button>
            
            <button 
              type="button"
              [disabled]="isLoading"
              (click)="onConfirm()"
              class="zadana-btn-primary"
              [ngClass]="'btn-' + type">
              
              <!-- Premium Spinner -->
              <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>

              <span>{{ confirmText | translate }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Overlay */
    .zadana-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    
    /* Backdrop */
    .zadana-modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.3);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 1;
      animation: fadeIn 0.2s ease-out forwards;
    }
    
    /* Card */
    .zadana-modal-card {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 400px;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid rgba(226, 232, 240, 0.6);
      overflow: hidden;
      animation: slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* Close Button */
    .zadana-modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: #94a3b8;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 20;
    }
    [dir="rtl"] .zadana-modal-close {
      right: auto;
      left: 16px;
    }
    .zadana-modal-close:hover {
      background-color: #f1f5f9;
      color: #475569;
    }

    /* Content Layout */
    .zadana-modal-content {
      padding: 32px 24px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    /* Icon Area */
    .zadana-modal-icon-wrapper {
      position: relative;
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .zadana-modal-icon-bg {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0.15;
    }

    /* Icon Types */
    .icon-danger { color: #ef4444; }
    .icon-danger .zadana-modal-icon-bg { background-color: #ef4444; }
    
    .icon-warning { color: #f59e0b; }
    .icon-warning .zadana-modal-icon-bg { background-color: #f59e0b; }
    
    .icon-success { color: #10b981; }
    .icon-success .zadana-modal-icon-bg { background-color: #10b981; }
    
    .icon-info { color: #3b82f6; }
    .icon-info .zadana-modal-icon-bg { background-color: #3b82f6; }

    /* Text */
    .zadana-modal-text {
      margin-bottom: 24px;
    }
    .zadana-modal-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px 0;
      letter-spacing: -0.01em;
    }
    .zadana-modal-desc {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }

    /* Error Alert */
    .zadana-modal-error {
      width: 100%;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px 16px;
      background-color: #fef2f2;
      border-radius: 12px;
      margin-bottom: 24px;
      font-size: 0.8125rem;
      color: #b91c1c;
      font-weight: 500;
      text-align: right;
    }
    [dir="ltr"] .zadana-modal-error {
      text-align: left;
    }

    /* Actions */
    .zadana-modal-actions {
      display: flex;
      gap: 12px;
      width: 100%;
    }

    /* Buttons */
    .zadana-btn-secondary,
    .zadana-btn-primary {
      flex: 1;
      height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      outline: none;
    }
    .zadana-btn-secondary:disabled,
    .zadana-btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .zadana-btn-secondary {
      background-color: #f1f5f9;
      color: #475569;
    }
    .zadana-btn-secondary:hover:not(:disabled) {
      background-color: #e2e8f0;
      color: #1e293b;
    }

    .zadana-btn-primary {
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .zadana-btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.15);
    }
    .zadana-btn-primary:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    /* Button Types */
    .btn-danger { background-color: #ef4444; }
    .btn-danger:hover:not(:disabled) { background-color: #dc2626; }
    
    .btn-warning { background-color: #f59e0b; color: #fff; }
    .btn-warning:hover:not(:disabled) { background-color: #d97706; }
    
    .btn-success { background-color: #10b981; }
    .btn-success:hover:not(:disabled) { background-color: #059669; }
    
    .btn-info { background-color: #3b82f6; }
    .btn-info:hover:not(:disabled) { background-color: #2563eb; }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUpFade {
      from { 
        opacity: 0; 
        transform: translateY(16px) scale(0.98); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }
  `]
})
export class DeleteConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() type: 'danger' | 'warning' | 'success' | 'info' = 'danger';
  @Input() title = 'COMMON.DELETE_CONFIRM_TITLE';
  @Input() message = 'COMMON.DELETE_CONFIRM_MSG';
  @Input() confirmText = 'COMMON.CONFIRM_DELETE';
  @Input() cancelText = 'COMMON.CANCEL';
  @Input() isLoading = false;
  @Input() errorMessage: string | null = null;

  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onClose() {
    this.close.emit();
  }
}
