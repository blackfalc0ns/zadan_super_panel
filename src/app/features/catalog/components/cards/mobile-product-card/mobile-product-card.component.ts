import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface ProductCardData {
 id: string;
 nameAr: string;
 nameEn: string;
 sku: string;
 status: 'Active' | 'Inactive' | 'Pending' | 'Rejected';
 price?: number;
 currency?: string;
 category?: string;
 brand?: string;
 stock?: number;
 imageUrl?: string;
 rating?: number;
 reviewsCount?: number;
}

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-mobile-product-card',
 standalone: true,
 imports: [CommonModule, RouterModule],
 template: `
 <div (click)="onCardClick()"
 class="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
 
 <!-- Header with Image, Checkbox and Status -->
 <div class="flex items-start justify-between mb-3">
 <div class="flex items-center gap-3 flex-1">
 <input type="checkbox" 
 [checked]="isSelected" 
 (change)="onSelectionChange($event)"
 (click)="$event.stopPropagation()"
 class="w-4 h-4 rounded border-slate-300 text-zadna-primary focus:ring-zadna-primary/20 flex-shrink-0">
 
 <div class="relative w-12 h-12 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
 <img *ngIf="product.imageUrl" 
 [src]="product.imageUrl" 
 [alt]="getDisplayName()"
 class="w-full h-full object-cover">
 <span *ngIf="!product.imageUrl" class="text-xl font-black text-slate-400">
 {{ getProductInitial() }}
 </span>
 </div>
 
 <div class="flex-1 min-w-0">
 <h3 class="text-sm font-bold text-slate-900 truncate">
 {{ getDisplayName() }}
 </h3>
 <p class="text-xs text-slate-500 truncate">
 {{ product.sku }}
 </p>
 </div>
 </div>
 
 <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
 [ngClass]="getStatusClasses()">
 <span class="w-1 h-1 rounded-full" [ngClass]="getStatusDotClasses()"></span>
 {{ getStatusLabel() }}
 </div>
 </div>

 <!-- Details Grid -->
 <div class="space-y-2 mb-4">
 <div class="flex items-center justify-between">
 <span class="text-xs text-slate-500">السعر</span>
 <span class="text-xs font-bold text-zadna-primary">
 {{ getPriceLabel() }}
 </span>
 </div>
 
 <div class="flex items-center justify-between">
 <span class="text-xs text-slate-500">الفئة</span>
 <span class="text-xs font-medium text-slate-700 truncate max-w-[150px]">
 {{ product.category || '-' }}
 </span>
 </div>
 
 <div class="flex items-center justify-between">
 <span class="text-xs text-slate-500">المخزون</span>
 <div class="flex items-center gap-2">
 <span class="text-xs font-bold" [ngClass]="getStockClasses()">
 {{ getStockLabel() }}
 </span>
 </div>
 </div>
 
 <div class="flex items-center justify-between" *ngIf="product.rating">
 <span class="text-xs text-slate-500">التقييم</span>
 <div class="flex items-center gap-1">
 <span class="text-xs font-bold text-amber-600">{{ product.rating }}/5</span>
 <span class="text-[9px] text-slate-400">({{ product.reviewsCount || 0 }})</span>
 </div>
 </div>
 </div>

 <!-- Actions -->
 <div class="flex gap-2 pt-3 border-t border-slate-100" (click)="$event.stopPropagation()">
 <button [routerLink]="['/catalog/products', product.id]" 
 class="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium hover:bg-blue-500 hover:text-white transition-all">
 <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
 </svg>
 عرض
 </button>
 
 <button *ngIf="product.status === 'Pending'" 
 (click)="onQuickApprove($event)"
 class="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-500 hover:text-white transition-all">
 <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
 </svg>
 موافقة
 </button>
 
 <button (click)="onEdit($event)"
 class="flex items-center justify-center gap-2 py-2 px-3 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium hover:bg-amber-500 hover:text-white transition-all">
 <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
 </svg>
 تعديل
 </button>
 </div>
 </div>
 `
})
export class MobileProductCardComponent {
 @Input() product!: ProductCardData;
 @Input() isSelected = false;
 @Input() activeLang = 'ar';
 
 @Output() cardClick = new EventEmitter<ProductCardData>();
 @Output() selectionChange = new EventEmitter<{ productId: string; selected: boolean }>();
 @Output() quickApprove = new EventEmitter<{ product: ProductCardData; event: Event }>();
 @Output() edit = new EventEmitter<{ product: ProductCardData; event: Event }>();

 onCardClick(): void {
 this.cardClick.emit(this.product);
 }

 onSelectionChange(event: Event): void {
 const checkbox = event.target as HTMLInputElement;
 this.selectionChange.emit({
 productId: this.product.id,
 selected: checkbox.checked
 });
 }

 onQuickApprove(event: Event): void {
 this.quickApprove.emit({ product: this.product, event });
 }

 onEdit(event: Event): void {
 this.edit.emit({ product: this.product, event });
 }

 getProductInitial(): string {
 const name = this.activeLang === 'ar' ? this.product.nameAr : this.product.nameEn;
 return name.charAt(0).toUpperCase();
 }

 getDisplayName(): string {
 return this.activeLang === 'ar' ? this.product.nameAr : this.product.nameEn;
 }

 getStatusLabel(): string {
 const statusLabels = {
 'Active': 'نشط',
 'Inactive': 'غير نشط',
 'Pending': 'في الانتظار',
 'Rejected': 'مرفوض'
 };
 return statusLabels[this.product.status] || this.product.status;
 }

 getStatusClasses(): string {
 const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0';
 
 switch (this.product.status) {
 case 'Active':
 return `${baseClasses} bg-emerald-50 text-emerald-600`;
 case 'Pending':
 return `${baseClasses} bg-amber-50 text-amber-600`;
 case 'Rejected':
 case 'Inactive':
 return `${baseClasses} bg-red-50 text-red-600`;
 default:
 return `${baseClasses} bg-slate-50 text-slate-600`;
 }
 }

 getStatusDotClasses(): string {
 switch (this.product.status) {
 case 'Active':
 return 'bg-emerald-500';
 case 'Pending':
 return 'bg-amber-500';
 case 'Rejected':
 case 'Inactive':
 return 'bg-red-500';
 default:
 return 'bg-slate-500';
 }
 }

 getPriceLabel(): string {
 if (!this.product.price) return 'غير محدد';
 
 const currency = this.product.currency || 'ر.س';
 return `${this.product.price} ${currency}`;
 }

 getStockLabel(): string {
 if (this.product.stock === undefined || this.product.stock === null) return 'غير محدد';
 
 if (this.product.stock === 0) return 'نفد المخزون';
 if (this.product.stock < 10) return `${this.product.stock} (منخفض)`;
 return `${this.product.stock}`;
 }

 getStockClasses(): string {
 if (this.product.stock === undefined || this.product.stock === null) return 'text-slate-400';
 
 if (this.product.stock === 0) return 'text-red-600';
 if (this.product.stock < 10) return 'text-amber-600';
 return 'text-emerald-600';
 }
}