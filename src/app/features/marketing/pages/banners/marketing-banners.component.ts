import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
 MarketingBanner,
 MarketingBannerPayload,
 MarketingBannerUpdatePayload
} from '@marketing/models/marketing.models';
import { MarketingApiService } from '@marketing/services/marketing.api.service';
import { describeApiError, formatDateRange, formatDateTime } from '@marketing/utils/marketing-date.utils';
import { BannerFormModalComponent } from '@marketing/components/banner-form-modal/banner-form-modal.component';
import { DeleteConfirmationModalComponent } from '@shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { DataTableComponent, TableColumn } from '@shared/components/ui/data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/form-controls/input/input.component';
import { StatusPillComponent } from '@shared/components/ui/status-pill/status-pill.component';
import { ToastService } from '@shared/services/toast.service';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-marketing-banners',
 standalone: true,
 imports: [
 CommonModule,
 FormsModule,
 TranslateModule,
 AppButtonComponent,
 AppInputComponent,
 StatusPillComponent,
 DeleteConfirmationModalComponent,
 BannerFormModalComponent,
 DataTableComponent
 ],
 template: `
 <div class="space-y-6">

 <!-- Action Bar -->
 <div class="flex flex-wrap items-center justify-between gap-4">
 <div class="max-w-[24rem] w-full">
 <app-input
 [(ngModel)]="searchTerm"
 [placeholder]="'MARKETING.BANNERS.SEARCH_PLACEHOLDER' | translate"
 [hasIcon]="true"
 [inputClass]="'!bg-transparent!border-0!ring-0!text-slate-900!placeholder-slate-400'"
 [customClass]="'bg-white/70 backdrop-blur-xl border border-slate-200/60 focus-within:bg-white focus-within:border-zadna-primary/50 focus-within:shadow-[0_8px_30px_-5px_rgba(18,124,140,0.15)] hover:bg-white/80 transition-all shadow-sm rounded-2xl overflow-hidden'">
 <span icon class="material-symbols-outlined text-slate-400 text-[20px]">search</span>
 </app-input>
 </div>

 <div class="flex items-center gap-3">
 <button
 type="button"
 (click)="loadBanners()"
 [disabled]="loading"
 class="h-11 px-4 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
 <span class="material-symbols-outlined text-[18px]" [class.opacity-40]="loading">refresh</span>
 {{ 'MARKETING.ACTIONS.REFRESH' | translate }}
 </button>

 <button
 type="button"
 (click)="openCreate()"
 class="h-11 px-5 rounded-2xl bg-zadna-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-zadna-primary/90 hover:shadow-lg hover:shadow-zadna-primary/20 transition-all">
 <span class="material-symbols-outlined text-[18px]">add</span>
 {{ 'MARKETING.BANNERS.ACTIONS.ADD_NEW' | translate }}
 </button>
 </div>
 </div>

 <div *ngIf="error" class="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
 {{ error }}
 </div>

 <!-- Data Table -->
 <app-data-table
 [data]="filteredBanners"
 [columns]="tableColumns"
 [isLoading]="loading"
 [emptyStateIcon]="'ad_group'"
 [emptyStateActionLabel]="'MARKETING.BANNERS.ACTIONS.ADD_NEW' | translate"
 [emptyStateTitle]="'MARKETING.BANNERS.MESSAGES.EMPTY_TITLE' | translate"
 [emptyStateMessage]="'MARKETING.BANNERS.MESSAGES.EMPTY_SUBTITLE' | translate"
 [containerClass]="'bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/70 shadow-sm'"
 (emptyStateAction)="openCreate()">

 <ng-template #customColumn let-banner let-column="column">
 <ng-container *ngIf="column.key === 'tag'">
 <div class="flex flex-col text-start">
 <span class="text-[13px] font-black text-slate-900">
 {{ banner.tagAr || '--' }}
 </span>
 <span class="mt-1 text-[10px] font-bold text-slate-400">
 {{ banner.tagEn || '--' }}
 </span>
 </div>
 </ng-container>

 <ng-container *ngIf="column.key === 'title'">
 <div class="flex items-center gap-3 text-start">
 <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.1rem] bg-zadna-primary/10 text-zadna-primary border border-zadna-primary/10">
 <span class="material-symbols-outlined text-[20px]">ad_group</span>
 </div>
 <div class="min-w-0">
 <div class="truncate text-[13px] font-black text-slate-900">
 {{ banner.titleAr }}
 </div>
 <div class="mt-1 truncate text-[11px] font-bold text-slate-400">
 {{ banner.titleEn }}
 </div>
 </div>
 </div>
 </ng-container>

 <ng-container *ngIf="column.key === 'displayOrder'">
 <span class="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
 {{ banner.displayOrder }}
 </span>
 </ng-container>

 <ng-container *ngIf="column.key === 'schedule'">
 <div class="flex items-center gap-2">
 <span class="material-symbols-outlined text-[14px] text-slate-400">calendar_month</span>
 <span class="text-[11px] font-bold text-slate-600" dir="ltr">
 {{ formatDateRangeLabel(banner) }}
 </span>
 </div>
 </ng-container>

 <ng-container *ngIf="column.key === 'status'">
 <div class="flex justify-start">
 <app-status-pill
 [label]="(banner.isActive ? 'MARKETING.VISIBILITY.ENABLED' : 'MARKETING.VISIBILITY.DISABLED') | translate"
 [variant]="banner.isActive ? 'success' : 'neutral'"
 size="sm">
 </app-status-pill>
 </div>
 </ng-container>

 <ng-container *ngIf="column.key === 'actions'">
 <div class="flex justify-end gap-1.5" (click)="$event.stopPropagation()">
 <button
 type="button"
 class="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-zadna-primary/10 hover:text-zadna-primary transition-colors"
 (click)="openEdit(banner.id)"
 [title]="'MARKETING.PERMISSIONS.ACTIONS.EDIT' | translate">
 <span class="material-symbols-outlined text-[18px]">edit</span>
 </button>

 <button
 type="button"
 class="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
 [ngClass]="banner.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'"
 (click)="toggleStatus(banner)"
 [title]="(banner.isActive ? 'MARKETING.ACTIONS.DEACTIVATE' : 'MARKETING.ACTIONS.ACTIVATE') | translate">
 <span class="material-symbols-outlined text-[18px]">
 {{ banner.isActive ? 'pause' : 'play_arrow' }}
 </span>
 </button>

 <button
 type="button"
 class="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
 (click)="promptDelete(banner)"
 [title]="'MARKETING.BANNERS.MESSAGES.DELETE_TITLE' | translate">
 <span class="material-symbols-outlined text-[18px]">delete</span>
 </button>
 </div>
 </ng-container>
 </ng-template>
 </app-data-table>
 </div>

 <app-banner-form-modal [isOpen]="isModalOpen" [isSaving]="saving" [banner]="selectedBanner" (close)="closeModal()" (save)="saveBanner($event)"></app-banner-form-modal>

 <app-delete-confirmation-modal
 [isOpen]="deleteTarget!== null"
 [isLoading]="deleting"
 [title]="'MARKETING.BANNERS.MESSAGES.DELETE_TITLE' | translate"
 [message]="'MARKETING.BANNERS.MESSAGES.DELETE_MESSAGE' | translate"
 (close)="deleteTarget = null"
 (confirm)="confirmDelete()">
 </app-delete-confirmation-modal>
 `
})
export class MarketingBannersComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 banners: MarketingBanner[] = [];
 loading = false;
 saving = false;
 deleting = false;
 error = '';
 searchTerm = '';
 isModalOpen = false;
 selectedBanner: MarketingBanner | null = null;
 deleteTarget: MarketingBanner | null = null;

 readonly tableColumns: TableColumn[] = [
 { key: 'title', title: 'MARKETING.BANNERS.TABLE.TITLE', type: 'custom', width: '20rem', align: 'left' },
 { key: 'tag', title: 'MARKETING.BANNERS.TABLE.TAG', type: 'custom', width: '12rem', align: 'left' },
 { key: 'displayOrder', title: 'MARKETING.BANNERS.TABLE.ORDER', type: 'custom', width: '6rem', align: 'center' },
 { key: 'schedule', title: 'MARKETING.BANNERS.TABLE.SCHEDULE', type: 'custom', width: '14rem', align: 'left' },
 { key: 'status', title: 'MARKETING.BANNERS.TABLE.STATUS', type: 'custom', width: '8rem', align: 'left' },
 { key: 'actions', title: 'MARKETING.BANNERS.TABLE.ACTIONS', type: 'custom', width: '10rem', align: 'right' }
 ];

 constructor(
 private readonly marketingApi: MarketingApiService,
 private readonly toastService: ToastService,
 readonly translateService: TranslateService
 ) {}

 get filteredBanners(): MarketingBanner[] {
 const query = this.searchTerm.trim().toLocaleLowerCase();
 if (!query) {
 return this.banners;
 }

 return this.banners.filter((banner) =>
 [banner.tagAr, banner.tagEn, banner.titleAr, banner.titleEn, banner.subtitleAr, banner.subtitleEn].filter((value): value is string => Boolean(value)).some((value) => value.toLocaleLowerCase().includes(query))
 );
 }
 
 ngOnInit(): void {
 this.loadBanners();
 }

 loadBanners(): void {
 this.loading = true;
 this.error = '';

 this.marketingApi.getBanners().subscribe({
 next: (banners) => {
 this.cdr.markForCheck();
 this.banners = [...banners].sort(
 (left, right) => left.displayOrder - right.displayOrder || right.updatedAtUtc.localeCompare(left.updatedAtUtc)
 );
 this.loading = false;
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.loading = false;
 this.error = describeApiError(error);
 }
 });
 }

 openCreate(): void {
 this.selectedBanner = null;
 this.isModalOpen = true;
 }

 openEdit(id: string): void {
 this.saving = true;
 this.marketingApi.getBannerById(id).subscribe({
 next: (banner) => {
 this.cdr.markForCheck();
 this.selectedBanner = banner;
 this.isModalOpen = true;
 this.saving = false;
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.saving = false;
 this.toastService.error(describeApiError(error), this.translateService.instant('MARKETING.BANNERS.TABS.BANNERS'));
 }
 });
 }

 closeModal(): void {
 this.isModalOpen = false;
 this.selectedBanner = null;
 }

 saveBanner(payload: MarketingBannerUpdatePayload): void {
 this.saving = true;

 const request$ = this.selectedBanner
 ? this.marketingApi.updateBanner(this.selectedBanner.id, payload)
 : this.marketingApi.createBanner(toCreatePayload(payload));

 request$.subscribe({
 next: () => {
 this.cdr.markForCheck();
 this.saving = false;
 this.closeModal();
 this.loadBanners();
 this.toastService.success(
 this.selectedBanner 
 ? this.translateService.instant('MARKETING.BANNERS.MESSAGES.UPDATED') 
 : this.translateService.instant('MARKETING.BANNERS.MESSAGES.CREATED'),
 this.translateService.instant('MARKETING.SHELL.TITLE')
 );
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.saving = false;
 this.toastService.error(describeApiError(error), 'البنرات الإعلانية');
 }
 });
 }

 toggleStatus(banner: MarketingBanner): void {
 const request$ = banner.isActive ? this.marketingApi.deactivateBanner(banner.id) : this.marketingApi.activateBanner(banner.id);

 request$.subscribe({
 next: () => {
 this.cdr.markForCheck();
 this.toastService.success(
 banner.isActive 
 ? this.translateService.instant('MARKETING.BANNERS.MESSAGES.DEACTIVATED') 
 : this.translateService.instant('MARKETING.BANNERS.MESSAGES.ACTIVATED'),
 this.translateService.instant('MARKETING.SHELL.TITLE')
 );
 this.loadBanners();
 },
 error: (error) => this.toastService.error(describeApiError(error), this.translateService.instant('MARKETING.BANNERS.TABS.BANNERS'))
 });
 }

 promptDelete(banner: MarketingBanner): void {
 this.deleteTarget = banner;
 }

 confirmDelete(): void {
 if (!this.deleteTarget) {
 return;
 }

 this.deleting = true;
 this.marketingApi.deleteBanner(this.deleteTarget.id).subscribe({
 next: () => {
 this.cdr.markForCheck();
 this.deleting = false;
 this.deleteTarget = null;
 this.toastService.success(this.translateService.instant('MARKETING.BANNERS.MESSAGES.DELETED'), this.translateService.instant('MARKETING.SHELL.TITLE'));
 this.loadBanners();
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.deleting = false;
 this.toastService.error(describeApiError(error), this.translateService.instant('MARKETING.BANNERS.TABS.BANNERS'));
 }
 });
 }

 formatDateRangeLabel(banner: MarketingBanner): string {
 return formatDateRange(banner.startsAtUtc, banner.endsAtUtc);
 }

 formatDateTimeLabel(value: string): string {
 return formatDateTime(value);
 }
}

function toCreatePayload(payload: MarketingBannerUpdatePayload): MarketingBannerPayload {
 const { isActive: _,...createPayload } = payload;
 return createPayload;
}
