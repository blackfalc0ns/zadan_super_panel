import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MobileVendorCardComponent, VendorCardData } from '../mobile-vendor-card/mobile-vendor-card.component';

// Re-export VendorCardData for external use
export type { VendorCardData };

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      <div class="min-h-[320px] rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50/35 px-6 py-16 text-center flex flex-col items-center justify-center">
        <span class="material-symbols-outlined mb-5 text-[28px] leading-none text-[#8bbfca]">storefront</span>
        <h3 class="text-[1.35rem] font-black text-slate-900 tracking-normal leading-tight">{{ 'COMMON.NO_RESULTS' | translate }}</h3>
        <p class="mt-3 max-w-md text-[0.86rem] font-extrabold text-slate-500 leading-6">{{ 'VENDORS.NO_VENDORS' | translate }}</p>
        <button (click)="onRefresh()"
                class="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-[0.8rem] bg-zadna-primary px-6 text-[0.82rem] font-black text-white shadow-lg shadow-zadna-primary/20 transition hover:bg-teal-700 active:scale-95">
          <span class="material-symbols-outlined text-[20px]">refresh</span>
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
