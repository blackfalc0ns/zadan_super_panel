import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface VendorCardData {
  id: string;
  businessNameAr: string;
  businessNameEn: string;
  contactEmail: string;
  status: 'Active' | 'Pending' | 'PendingReview' | 'Rejected' | 'Suspended';
  documentsCompleteness?: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  commissionRate?: number | null;
  commissionType?: 'Percentage' | 'Fixed';
  alerts?: string[];
}

@Component({
  selector: 'app-mobile-vendor-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div (click)="onCardClick()"
         class="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
      
      <!-- Header with Logo, Checkbox and Status -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3 flex-1">
          <input type="checkbox" 
                 [checked]="isSelected" 
                 (change)="onSelectionChange($event)"
                 (click)="$event.stopPropagation()"
                 class="w-4 h-4 rounded border-slate-300 text-zadna-primary focus:ring-zadna-primary/20 flex-shrink-0">
          
          <div class="relative w-12 h-12 bg-[#f0f9fa]/80 rounded-xl border border-[#e0f2f4] flex items-center justify-center flex-shrink-0">
            <span class="text-xl font-black text-zadna-primary">
              {{ getVendorInitial() }}
            </span>
          </div>
          
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold text-slate-900 truncate">
              {{ getDisplayName() }}
            </h3>
            <p class="text-xs text-slate-500 truncate">
              {{ getSecondaryName() }}
            </p>
          </div>
        </div>
        
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
             [ngClass]="getStatusClasses()">
          <span class="w-1 h-1 rounded-full" [ngClass]="getStatusDotClasses()"></span>
          {{ getStatusLabel() | translate }}
        </div>
      </div>

      <div class="space-y-2 mb-4">
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500">{{ 'VENDORS.TABLE.CONTACT' | translate }}</span>
          <span class="text-xs font-medium text-slate-700 truncate max-w-[200px]">
            {{ vendor.contactEmail }}
          </span>
        </div>
        
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500">{{ 'VENDORS.COL_COMMISSION' | translate }}</span>
          <code class="text-xs font-bold text-zadna-primary bg-zadna-primary/5 px-2 py-1 rounded">
            {{ getCommissionLabel() }}
          </code>
        </div>
        
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500">{{ 'VENDORS.TABLE.DOCUMENTS' | translate }}</span>
          <div class="flex items-center gap-2">
            <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div class="h-full rounded-full transition-all"
                   [style.width.%]="vendor.documentsCompleteness || 0"
                   [ngClass]="getDocumentsProgressClasses()"></div>
            </div>
            <span class="text-[9px] font-bold text-slate-500">{{ vendor.documentsCompleteness || 0 }}%</span>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500">{{ 'VENDORS.TABLE.RISK' | translate }}</span>
          <span class="text-xs font-bold" [ngClass]="getRiskLevelClasses()">
            {{ getRiskLevelLabel() | translate }}
          </span>
        </div>
      </div>

      <!-- Alerts -->
      <div *ngIf="hasAlerts()" class="mb-4 flex flex-wrap gap-1">
        <span *ngFor="let alert of vendor.alerts" 
              class="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
          {{ alert }}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 pt-3 border-t border-slate-100" (click)="$event.stopPropagation()">
        <button [routerLink]="['/vendors', vendor.id]" 
                class="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium hover:bg-blue-500 hover:text-white transition-all">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {{ 'VENDORS.ACTIONS.VIEW' | translate }}
        </button>
        
        <button *ngIf="vendor.status === 'Pending'" 
                (click)="onQuickApprove($event)"
                class="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-500 hover:text-white transition-all">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ 'VENDORS.ACTIONS.APPROVE' | translate }}
        </button>
        
        <button (click)="onRequestDocuments($event)"
                class="flex items-center justify-center gap-2 py-2 px-3 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium hover:bg-amber-500 hover:text-white transition-all">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ 'VENDORS.TABLE.DOCUMENTS' | translate }}
        </button>
      </div>
    </div>
  `
})
export class MobileVendorCardComponent {
  @Input() vendor!: VendorCardData;
  @Input() isSelected = false;
  @Input() activeLang = 'ar';
  
  @Output() cardClick = new EventEmitter<VendorCardData>();
  @Output() selectionChange = new EventEmitter<{ vendorId: string; selected: boolean }>();
  @Output() quickApprove = new EventEmitter<{ vendor: VendorCardData; event: Event }>();
  @Output() requestDocuments = new EventEmitter<{ vendor: VendorCardData; event: Event }>();

  onCardClick(): void {
    this.cardClick.emit(this.vendor);
  }

  onSelectionChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.selectionChange.emit({
      vendorId: this.vendor.id,
      selected: checkbox.checked
    });
  }

  onQuickApprove(event: Event): void {
    this.quickApprove.emit({ vendor: this.vendor, event });
  }

  onRequestDocuments(event: Event): void {
    this.requestDocuments.emit({ vendor: this.vendor, event });
  }

  getVendorInitial(): string {
    const name = this.getDisplayName();
    return name.charAt(0).toUpperCase();
  }

  getDisplayName(): string {
    return (this.activeLang === 'ar' ? this.vendor.businessNameAr : this.vendor.businessNameEn)
      || (this.activeLang === 'ar' ? this.vendor.businessNameEn : this.vendor.businessNameAr)
      || this.vendor.contactEmail
      || 'Vendor';
  }

  getSecondaryName(): string {
    return (this.activeLang === 'ar' ? this.vendor.businessNameEn : this.vendor.businessNameAr)
      || this.vendor.contactEmail
      || '';
  }

  getStatusLabel(): string {
    const statusLabels = {
      'Active': 'VENDORS.STATUS_ACTIVE',
      'Pending': 'VENDORS.STATUS_PENDING',
      'PendingReview': 'VENDORS.PREVIEW.VERIFY_BANK',
      'Rejected': 'VENDORS.STATUS_REJECTED',
      'Suspended': 'VENDORS.STATUS_SUSPENDED'
    };
    return statusLabels[this.vendor.status] || this.vendor.status;
  }

  getStatusClasses(): string {
    const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0';
    
    switch (this.vendor.status) {
      case 'Active':
        return `${baseClasses} bg-emerald-50 text-emerald-600`;
      case 'Pending':
      case 'PendingReview':
        return `${baseClasses} bg-amber-50 text-amber-600`;
      case 'Rejected':
      case 'Suspended':
        return `${baseClasses} bg-red-50 text-red-600`;
      default:
        return `${baseClasses} bg-slate-50 text-slate-600`;
    }
  }

  getStatusDotClasses(): string {
    switch (this.vendor.status) {
      case 'Active':
        return 'bg-emerald-500';
      case 'Pending':
      case 'PendingReview':
        return 'bg-amber-500';
      case 'Rejected':
      case 'Suspended':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  }

  getCommissionLabel(): string {
    if (!this.vendor.commissionRate) return '-';
    
    const rate = this.vendor.commissionRate;
    const type = this.vendor.commissionType || 'Percentage';
    
    return type === 'Percentage' ? `${rate}%` : `${rate} ${this.activeLang === 'ar' ? 'ر.س' : 'SAR'}`;
  }

  getDocumentsProgressClasses(): string {
    const completeness = this.vendor.documentsCompleteness || 0;
    
    if (completeness >= 80) return 'bg-emerald-500';
    if (completeness >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  }

  getRiskLevelLabel(): string {
    const riskLabels = {
      'Low': 'VENDORS.RISK_LEVEL.LOW',
      'Medium': 'VENDORS.RISK_LEVEL.MEDIUM',
      'High': 'VENDORS.RISK_LEVEL.HIGH'
    };
    return riskLabels[this.vendor.riskLevel] || this.vendor.riskLevel;
  }

  getRiskLevelClasses(): string {
    switch (this.vendor.riskLevel) {
      case 'Low':
        return 'text-emerald-600';
      case 'Medium':
        return 'text-amber-600';
      case 'High':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  }

  hasAlerts(): boolean {
    return !!(this.vendor.alerts && this.vendor.alerts.length > 0);
  }
}
