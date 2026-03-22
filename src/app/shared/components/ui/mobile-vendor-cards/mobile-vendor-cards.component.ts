import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MobileVendorCardComponent, VendorCardData } from '../mobile-vendor-card/mobile-vendor-card.component';

// Re-export VendorCardData for external use
export type { VendorCardData };

@Component({
  selector: 'app-mobile-vendor-cards',
  standalone: true,
  imports: [CommonModule, MobileVendorCardComponent, TranslateModule],
  template: `
    <!-- Mobile Cards View -->
    <div *ngIf="!isLoading && !showError && vendors.length > 0" 
         class="md:hidden space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      
      <app-mobile-vendor-card
        *ngFor="let vendor of vendors; let i = index"
        [vendor]="vendor"
        [isSelected]="isVendorSelected(vendor.id)"
        [activeLang]="activeLang"
        (cardClick)="onCardClick($event)"
        (selectionChange)="onSelectionChange($event)"
        (quickApprove)="onQuickApprove($event)"
        (requestDocuments)="onRequestDocuments($event)">
      </app-mobile-vendor-card>
    </div>

    <!-- Loading State -->
    <div *ngIf="isLoading" class="md:hidden space-y-4">
      <div *ngFor="let item of [1,2,3,4,5]" 
           class="bg-white/60 rounded-2xl border border-slate-200/40 p-4 animate-pulse">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3 flex-1">
            <div class="w-4 h-4 bg-slate-200 rounded"></div>
            <div class="w-12 h-12 bg-slate-200 rounded-xl"></div>
            <div class="flex-1">
              <div class="h-4 bg-slate-200 rounded mb-1"></div>
              <div class="h-3 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
          <div class="w-16 h-6 bg-slate-200 rounded-full"></div>
        </div>
        <div class="space-y-2 mb-4">
          <div class="flex justify-between">
            <div class="h-3 bg-slate-200 rounded w-1/3"></div>
            <div class="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div class="flex justify-between">
            <div class="h-3 bg-slate-200 rounded w-1/4"></div>
            <div class="h-3 bg-slate-200 rounded w-1/3"></div>
          </div>
        </div>
        <div class="flex gap-2 pt-3 border-t border-slate-100">
          <div class="flex-1 h-8 bg-slate-200 rounded-lg"></div>
          <div class="w-20 h-8 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="showError" class="md:hidden">
      <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-red-900 mb-2">{{ 'COMMON.ERROR' | translate }}</h3>
        <p class="text-red-700 mb-4">{{ errorMessage || ('COMMON.FAILED_TO_LOAD' | translate) }}</p>
        <button (click)="onRetry()" 
                class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
          {{ 'COMMON.RETRY' | translate }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!isLoading && !showError && vendors.length === 0" class="md:hidden">
      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">{{ 'COMMON.NO_RESULTS' | translate }}</h3>
        <p class="text-slate-600 mb-4">{{ 'VENDORS.NO_VENDORS' | translate }}</p>
        <button (click)="onRefresh()" 
                class="px-4 py-2 bg-zadna-primary text-white rounded-lg font-medium hover:bg-zadna-primary/90 transition-colors">
          {{ 'COMMON.REFRESH' | translate }}
        </button>
      </div>
    </div>
  `
})
export class MobileVendorCardsComponent {
  @Input() vendors: VendorCardData[] = [];
  @Input() selectedVendorIds: string[] = [];
  @Input() isLoading = false;
  @Input() showError = false;
  @Input() errorMessage = '';
  @Input() activeLang = 'ar';

  @Output() cardClick = new EventEmitter<VendorCardData>();
  @Output() selectionChange = new EventEmitter<{ vendorId: string; selected: boolean }>();
  @Output() quickApprove = new EventEmitter<{ vendor: VendorCardData; event: Event }>();
  @Output() requestDocuments = new EventEmitter<{ vendor: VendorCardData; event: Event }>();
  @Output() retry = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  isVendorSelected(vendorId: string): boolean {
    return this.selectedVendorIds.includes(vendorId);
  }

  onCardClick(vendor: VendorCardData): void {
    this.cardClick.emit(vendor);
  }

  onSelectionChange(event: { vendorId: string; selected: boolean }): void {
    this.selectionChange.emit(event);
  }

  onQuickApprove(event: { vendor: VendorCardData; event: Event }): void {
    this.quickApprove.emit(event);
  }

  onRequestDocuments(event: { vendor: VendorCardData; event: Event }): void {
    this.requestDocuments.emit(event);
  }

  onRetry(): void {
    this.retry.emit();
  }

  onRefresh(): void {
    this.refresh.emit();
  }
}