import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface TableColumn {
 key: string;
 title: string;
 width?: string;
 sortable?: boolean;
 type?: 'text' | 'badge' | 'progress' | 'actions' | 'custom';
 align?: 'left' | 'center' | 'right';
 sticky?: boolean;
}

export interface TableAction {
 id: string;
 label: string;
 icon: string;
 color?: string;
 condition?: (item: Record<string, unknown>) => boolean;
}

export interface BulkAction {
 id: string;
 label: string;
 icon: string;
 color?: string;
}

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-data-table',
 standalone: true,
 imports: [CommonModule, FormsModule, TranslateModule],
 template: `
 <!-- Bulk Actions Toolbar -->
 <div *ngIf="showBulkActions && selectedItems.size > 0" 
 class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
 <div class="bg-white/90 backdrop-blur-xl rounded-[2rem] px-6 py-4 shadow-2xl border border-slate-200/60 flex items-center gap-6">
 <!-- Selected Count -->
 <div class="flex items-center gap-3 px-4 border-l border-slate-200">
 <div class="w-8 h-8 rounded-full bg-zadna-primary text-white flex items-center justify-center text-xs font-black">
 {{ selectedItems.size }}
 </div>
 <span class="text-sm font-black text-slate-700">{{ 'COMMON.SELECTED_ITEMS' | translate }}</span>
 </div>
 
 <!-- Action Buttons -->
 <div class="flex items-center gap-3">
 <button *ngFor="let action of bulkActions" 
 (click)="onBulkAction(action)"
 [class]="'flex items-center gap-2 px-5 py-2.5 rounded-[1.2rem] text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-lg ' + (action.color || 'bg-zadna-primary text-white')">
 <span class="material-symbols-outlined text-[18px]">{{ action.icon }}</span>
 {{ action.label | translate }}
 </button>
 </div>
 
 <!-- Close Button -->
 <button (click)="clearSelection()" 
 class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors ml-2">
 <span class="material-symbols-outlined text-[20px]">close</span>
 </button>
 </div>
 </div>

 <!-- Desktop Table Content -->
 <div [class]="'hidden md:block w-full overflow-x-auto relative ' + containerClass">

 <div
 *ngIf="isLoading"
 class="admin-skeleton-table animate-in fade-in duration-300"
 [style.--skeleton-columns]="skeletonColumnCount">
 <div class="admin-skeleton-table-header">
 <span *ngFor="let col of skeletonColumnsArray" class="admin-skeleton admin-skeleton-line sm"></span>
 </div>
 <div *ngFor="let row of skeletonRowsArray" class="admin-skeleton-table-row">
 <span *ngIf="selectable" class="admin-skeleton admin-skeleton-line sm!w-4"></span>
 <span *ngFor="let col of columns; let i = index"
 class="admin-skeleton admin-skeleton-line"
 [class.lg]="i === 0"
 [style.width.%]="getSkeletonLineWidth(i)">
 </span>
 </div>
 </div>

 <table *ngIf="!isLoading" class="w-full border-separate border-spacing-y-0" style="min-width: 800px;">
 <colgroup>
 <col *ngIf="selectable" [style.width]="selectionColumnWidth">
 <col *ngFor="let col of columns" [style.width]="getColumnWidth(col)">
 </colgroup>
 <thead class="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-slate-100/50">
 <tr>
 <th *ngIf="selectable" class="w-12 px-3 py-7 text-center align-middle">
 <input type="checkbox" 
 [checked]="allSelected" 
 (change)="toggleSelectAll()"
 class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20">
 </th>
 <th *ngFor="let col of columns" 
 class="px-5 py-4 align-middle text-[10px] font-black uppercase text-slate-400/80 tracking-tighter"
 [class.text-center]="col.align === 'center'"
 [class.text-start]="col.align === 'left'"
 [class.text-end]="col.align === 'right'"
 [style.width]="col.width">
 <span class="inline-block transition-transform hover:scale-105 cursor-default">{{ col.title | translate }}</span>
 </th>
 </tr>
 </thead>
 <tbody>
 <tr *ngFor="let item of data; let i = index" 
 class="group bg-white/50 hover:bg-white transition-all duration-500 border-b border-slate-100/60"
 [class.cursor-pointer]="clickableRows"
 (click)="onRowClick(item)">
 
 <td *ngIf="selectable" class="w-12 px-3 py-3 text-center align-middle" (click)="$event.stopPropagation()">
 <input type="checkbox" 
 [checked]="isSelected(item)" 
 (change)="toggleSelectItem(item)"
 class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20">
 </td>

 <td *ngFor="let col of columns" 
 class="px-5 py-3 align-middle overflow-hidden"
 [class.text-center]="col.align === 'center'"
 [class.text-start]="col.align === 'left'"
 [class.text-end]="col.align === 'right'">
 
 <!-- Text Column -->
 <ng-container *ngIf="col.type === 'text' ||!col.type">
 <div class="min-w-0 truncate text-sm font-bold text-slate-700">
 {{ getColumnValue(item, col.key) }}
 </div>
 </ng-container>

 <!-- Badge Column -->
 <div *ngIf="col.type === 'badge'" class="flex justify-center">
 <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-50 bg-white shadow-sm text-xs font-black">
 {{ getColumnValue(item, col.key) | translate }}
 </span>
 </div>

 <!-- Progress Column -->
 <div *ngIf="col.type === 'progress'" class="flex flex-col items-center gap-1">
 <div class="w-full max-w-[60px] bg-slate-100 rounded-full h-1.5 overflow-hidden">
 <div class="h-full rounded-full transition-all bg-primary"
 [style.width.%]="getProgressValue(item, col.key)"></div>
 </div>
 <span class="text-[9px] font-bold text-slate-500">{{ getProgressValue(item, col.key) }}%</span>
 </div>

 <!-- Actions Column -->
 <div *ngIf="col.type === 'actions'" class="flex justify-center gap-1.5 flex-wrap" (click)="$event.stopPropagation()">
 <button *ngFor="let action of getItemActions(item)" 
 (click)="onAction(action, item)"
 class="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
 [title]="action.label | translate">
 <ng-container [ngSwitch]="action.icon">
 <svg *ngSwitchCase="'visibility'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
 </svg>
 <svg *ngSwitchCase="'check_circle'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <svg *ngSwitchCase="'block'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
 </svg>
 </ng-container>
 </button>
 </div>

 <!-- Custom Column -->
 <ng-container *ngIf="col.type === 'custom'">
 <ng-container *ngTemplateOutlet="customColumnTemplate; context: { $implicit: item, column: col }"></ng-container>
 </ng-container>
 </td>
 </tr>
 </tbody>
 </table>
 </div>

 <!-- Mobile Cards -->
 <div class="md:hidden space-y-4 relative">
 <div *ngIf="isLoading" class="space-y-3 animate-in fade-in duration-300">
 <div *ngFor="let row of mobileSkeletonRowsArray" class="admin-skeleton-card">
 <div class="flex items-start justify-between gap-3">
 <div class="flex min-w-0 flex-1 items-center gap-3">
 <span class="admin-skeleton admin-skeleton-avatar"></span>
 <div class="min-w-0 flex-1 space-y-2">
 <span class="admin-skeleton admin-skeleton-line lg w-3/4"></span>
 <span class="admin-skeleton admin-skeleton-line sm w-1/2"></span>
 </div>
 </div>
 <span class="admin-skeleton admin-skeleton-chip"></span>
 </div>
 <div class="mt-4 grid grid-cols-2 gap-3">
 <span class="admin-skeleton admin-skeleton-line"></span>
 <span class="admin-skeleton admin-skeleton-line"></span>
 <span class="admin-skeleton admin-skeleton-line sm"></span>
 <span class="admin-skeleton admin-skeleton-line sm"></span>
 </div>
 </div>
 </div>

 <ng-container *ngIf="!isLoading">
 <ng-container *ngIf="mobileCardTemplate; else defaultMobileCards">
 <div *ngFor="let item of data" 
 class="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-all"
 [class.cursor-pointer]="clickableRows"
 (click)="onRowClick(item)">
 <ng-container *ngTemplateOutlet="mobileCardTemplate; context: { $implicit: item }"></ng-container>
 </div>
 </ng-container>

 <ng-template #defaultMobileCards>
 <div *ngFor="let item of data" 
 class="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
 [class.cursor-pointer]="clickableRows"
 (click)="onRowClick(item)">
 
 <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
 <div class="flex items-center gap-3 min-w-0">
 <input *ngIf="selectable" type="checkbox" 
 [checked]="isSelected(item)" 
 (change)="toggleSelectItem(item); $event.stopPropagation()"
 class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 shrink-0">
 
 <div class="min-w-0 flex flex-col text-start">
 <ng-container *ngIf="columns.length > 0">
 <div class="text-sm font-black text-slate-900 leading-snug">
 <ng-container *ngIf="columns[0].type === 'custom' && customColumnTemplate; else plainFirstCol">
 <ng-container *ngTemplateOutlet="customColumnTemplate; context: { $implicit: item, column: columns[0] }"></ng-container>
 </ng-container>
 <ng-template #plainFirstCol>
 {{ getColumnValue(item, columns[0].key) }}
 </ng-template>
 </div>
 </ng-container>
 </div>
 </div>
 </div>

 <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] py-1">
 <ng-container *ngFor="let col of columns; let idx = index">
 <div *ngIf="idx > 0 && col.type!== 'actions'" class="flex flex-col gap-1 min-w-0">
 <span class="text-[10px] font-black text-slate-400 uppercase tracking-tight">{{ col.title | translate }}</span>
 <div class="font-bold text-slate-700 truncate">
 <ng-container *ngIf="col.type === 'custom' && customColumnTemplate; else standardCell">
 <ng-container *ngTemplateOutlet="customColumnTemplate; context: { $implicit: item, column: col }"></ng-container>
 </ng-container>
 <ng-template #standardCell>
 <div *ngIf="col.type === 'progress'" class="flex items-center gap-1.5">
 <div class="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
 <div class="h-full rounded-full bg-primary" [style.width.%]="getProgressValue(item, col.key)"></div>
 </div>
 <span class="text-[10px] font-bold text-slate-500">{{ getProgressValue(item, col.key) }}%</span>
 </div>
 
 <span *ngIf="col.type === 'badge'" class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-50 bg-white shadow-sm text-[10px] font-black">
 {{ getColumnValue(item, col.key) | translate }}
 </span>
 
 <span *ngIf="col.type!== 'progress' && col.type!== 'badge'">
 {{ getColumnValue(item, col.key) }}
 </span>
 </ng-template>
 </div>
 </div>
 </ng-container>
 </div>

 <div *ngIf="actions.length > 0" class="flex items-center justify-end gap-2 border-t border-slate-100 pt-3" (click)="$event.stopPropagation()">
 <button *ngFor="let action of getItemActions(item)" 
 (click)="onAction(action, item)"
 class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 hover:bg-primary hover:text-white transition-all text-xs font-black text-slate-500">
 <span class="material-symbols-outlined text-[16px]">{{ action.icon }}</span>
 {{ action.label | translate }}
 </button>
 </div>

 </div>
 </ng-template>
 </ng-container>
 </div>

 <!-- Empty State -->
 <div *ngIf="data.length === 0 &&!isLoading"
 class="animate-in zoom-in duration-500"
 [ngClass]="emptyStateCompact ? 'p-1.5' : 'p-4'">
 <div
 class="rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50/35 text-center flex flex-col items-center justify-center"
 [ngClass]="emptyStateCompact
 ? 'min-h-[96px] px-3 py-4'
 : 'min-h-[320px] px-6 py-16'">
 <span
 class="material-symbols-outlined leading-none text-[#8bbfca]"
 [ngClass]="emptyStateCompact ? 'mb-2 text-[20px]' : 'mb-5 text-[28px]'">{{ emptyStateIcon }}</span>
 <h3
 class="font-black text-slate-900 tracking-normal leading-tight"
 [ngClass]="emptyStateCompact ? 'text-[0.92rem]' : 'text-[1.35rem]'">{{ emptyStateTitle | translate }}</h3>
 <p
 class="max-w-md font-extrabold text-slate-500"
 [ngClass]="emptyStateCompact ? 'mt-1 text-[0.72rem] leading-5' : 'mt-3 text-[0.86rem] leading-6'">{{ emptyStateMessage | translate }}</p>

 <div *ngIf="emptyStateActionsTemplate || emptyStateActionLabel"
 class="flex flex-wrap items-center justify-center gap-3"
 [ngClass]="emptyStateCompact ? 'mt-3' : 'mt-7'">
 <ng-container *ngIf="emptyStateActionsTemplate; else defaultEmptyStateAction"
 [ngTemplateOutlet]="emptyStateActionsTemplate"></ng-container>
 <ng-template #defaultEmptyStateAction>
 <button
 type="button"
 (click)="emptyStateAction.emit()"
 class="inline-flex h-12 items-center justify-center gap-2 rounded-[0.8rem] bg-zadna-primary px-6 text-[0.82rem] font-black text-white shadow-lg shadow-zadna-primary/20 transition hover:bg-teal-700 active:scale-95">
 <span class="material-symbols-outlined text-[20px]">{{ emptyStateActionIcon }}</span>
 {{ emptyStateActionLabel | translate }}
 </button>
 </ng-template>
 </div>
 </div>
 </div>
 `,
 styles: [`.primary { color: var(--primary-color, #127c8c); }.bg-primary { background-color: var(--primary-color, #127c8c); }.text-primary { color: var(--primary-color, #127c8c); }.border-primary { border-color: var(--primary-color, #127c8c); }.focus\\:ring-primary\\/20:focus { box-shadow: 0 0 0 4px var(--primary-color-20, #127c8c33); }.hover\\:bg-primary:hover { background-color: var(--primary-color, #127c8c); }
 `]
})
export class DataTableComponent<T extends object = Record<string, unknown>> {
 @Input() data: T[] = [];
 @Input() columns: TableColumn[] = [];
 @Input() actions: TableAction[] = [];
 @Input() bulkActions: BulkAction[] = [];
 @Input() selectable = false;
 @Input() showBulkActions = true;
 @Input() clickableRows = false;
 @Input() emptyStateTitle = 'ما لقينا عناصر';
 @Input() emptyStateMessage = 'ما فيه أنشطة رئيسية مهيأة بعد.';
 @Input() emptyStateIcon = 'category';
 @Input() emptyStateActionLabel = '';
 @Input() emptyStateActionIcon = 'add';
 @Input() emptyStateCompact = false;
 @Input() idField = 'id';
 @Input() isLoading = false;
 @Input() skeletonRows = 6;
 @Input() containerClass = '';

 @Output() rowClick = new EventEmitter<T>();
 @Output() actionClick = new EventEmitter<{ action: TableAction; item: T }>();
 @Output() bulkActionClick = new EventEmitter<{ action: BulkAction; items: T[] }>();
 @Output() selectionChange = new EventEmitter<T[]>();
 @Output() emptyStateAction = new EventEmitter<void>();

 @ContentChild('customColumn') customColumnTemplate: TemplateRef<unknown> | null = null;
 @ContentChild('mobileCard') mobileCardTemplate: TemplateRef<unknown> | null = null;
 @ContentChild('emptyStateActions') emptyStateActionsTemplate: TemplateRef<unknown> | null = null;

 selectedItems = new Set<unknown>();
 readonly selectionColumnWidth = '3.5rem';

 get skeletonColumnCount(): number {
 return Math.max(1, this.columns.length + (this.selectable ? 1 : 0));
 }

 get skeletonColumnsArray(): number[] {
 return Array.from({ length: this.skeletonColumnCount }, (_, index) => index);
 }

 get skeletonRowsArray(): number[] {
 return Array.from({ length: Math.max(1, this.skeletonRows) }, (_, index) => index);
 }

 get mobileSkeletonRowsArray(): number[] {
 return Array.from({ length: Math.max(1, Math.min(this.skeletonRows, 5)) }, (_, index) => index);
 }

 get allSelected(): boolean {
 return this.data.length > 0 && this.data.every((item) => this.selectedItems.has(this.getItemId(item)));
 }

 toggleSelectAll() {
 if (this.allSelected) {
 this.selectedItems.clear();
 } else {
 this.data.forEach((item) => this.selectedItems.add(this.getItemId(item)));
 }
 this.emitSelectionChange();
 }

 toggleSelectItem(item: T) {
 const id = this.getItemId(item);
 if (this.selectedItems.has(id)) {
 this.selectedItems.delete(id);
 } else {
 this.selectedItems.add(id);
 }
 this.emitSelectionChange();
 }

 isSelected(item: T): boolean {
 return this.selectedItems.has(this.getItemId(item));
 }

 onRowClick(item: T) {
 if (this.clickableRows) {
 this.rowClick.emit(item);
 }
 }

 onAction(action: TableAction, item: T) {
 this.actionClick.emit({ action, item });
 }

 onBulkAction(action: BulkAction) {
 const selectedData = this.data.filter((item) => this.selectedItems.has(this.getItemId(item)));
 this.bulkActionClick.emit({ action, items: selectedData });
 }

 clearSelection() {
 this.selectedItems.clear();
 this.emitSelectionChange();
 }

 getColumnValue(item: T, key: string): string {
 const value = this.getResolvedColumnValue(item, key);
 return value == null ? '' : String(value);
 }

 getProgressValue(item: T, key: string): number {
 const value = this.getResolvedColumnValue(item, key);
 return typeof value === 'number' ? value : Number(value ?? 0);
 }

 getItemActions(item: T): TableAction[] {
 return this.actions.filter((action) =>!action.condition || action.condition(item as Record<string, unknown>));
 }

 getColumnWidth(column: TableColumn): string | null {
 return column.width ?? null;
 }

 getSkeletonLineWidth(index: number): number {
 const widths = [82, 58, 70, 48, 64, 52, 76, 44];
 return widths[index % widths.length];
 }

 private getItemId(item: T): unknown {
 return this.getFieldValue(item, this.idField);
 }

 private getResolvedColumnValue(item: T, key: string): unknown {
 let current: unknown = item;
 for (const property of key.split('.')) {
 if (!current || typeof current !== 'object') {
 return undefined;
 }
 current = (current as Record<string, unknown>)[property];
 }
 return current;
 }

 private getFieldValue(item: T, field: string): unknown {
 return (item as Record<string, unknown>)[field];
 }

 private emitSelectionChange() {
 const selectedData = this.data.filter((item) => this.selectedItems.has(this.getItemId(item)));
 this.selectionChange.emit(selectedData);
 }
}
