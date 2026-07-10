import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
 HomeSectionTheme,
 HomeSectionThemeOption,
 MarketingCategoryOption,
 MarketingHomeSection,
 MarketingHomeSectionUpdatePayload
} from '@marketing/models/marketing.models';
import { toDateTimeLocalInput, toNullableUtcIso } from '@marketing/utils/marketing-date.utils';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { ModalShellComponent } from '@shared/components/ui/modal-shell/modal-shell.component';
import { SearchableSelectComponent, SearchableSelectOption } from '@shared/components/ui/form-controls/select/searchable-select.component';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-home-section-form-modal',
 standalone: true,
 imports: [CommonModule, ReactiveFormsModule, TranslateModule, ModalShellComponent, AppButtonComponent, SearchableSelectComponent],
 template: `
 <app-modal-shell
 *ngIf="isOpen"
 [title]="(section ? 'MARKETING.HOME_SECTIONS.MODAL.EDIT_TITLE' : 'MARKETING.HOME_SECTIONS.MODAL.CREATE_TITLE') | translate"
 [subtitle]="'MARKETING.HOME_SECTIONS.MODAL.SUBTITLE' | translate"
 [icon]="'grid_view'"
 [maxWidthClass]="'max-w-4xl'"
 [panelClass]="'rounded-[2rem] border-slate-200/90 shadow-[0_28px_80px_-24px_rgba(15,23,42,0.35)]'"
 [headerClass]="'px-7 py-6'"
 [bodyClass]="'px-7 py-6'"
 [footerClass]="'px-7 py-5'"
 (close)="close.emit()"
 >
 <form [formGroup]="form" modal-body class="space-y-6" (ngSubmit)="submit()">
 
 <div class="grid gap-6 md:grid-cols-2">

 <div class="md:col-span-2 space-y-3">
 <app-searchable-select
 formControlName="categoryId"
 [label]="'MARKETING.HOME_SECTIONS.FIELDS.TARGET_CATEGORY' | translate"
 [placeholder]="'MARKETING.HOME_SECTIONS.FIELDS.TARGET_CATEGORY_PLACEHOLDER' | translate"
 [searchPlaceholder]="'MARKETING.HOME_SECTIONS.FIELDS.CATEGORY_SEARCH' | translate"
 [noResultsText]="'MARKETING.VISIBILITY.MESSAGES.EMPTY_TITLE' | translate"
 [options]="selectableCategoryOptions"
 [isRequired]="true"
 [allowClear]="false"
 [searchable]="true">
 </app-searchable-select>
 <p *ngIf="!categoryOptions.length" class="text-sm font-bold text-amber-600 flex items-center gap-2 mt-2">
 <span class="material-symbols-outlined text-[16px]">warning</span>
 {{ 'MARKETING.HOME_SECTIONS.MESSAGES.NO_CATEGORIES' | translate }}
 </p>
 </div>

 <div class="space-y-3">
 <label class="text-sm font-black text-slate-700">
 {{ 'MARKETING.HOME_SECTIONS.FIELDS.THEME' | translate }}
 <span class="text-red-500">*</span>
 </label>
 <div class="relative">
 <span class="absolute inset-y-0 right-4 flex items-center text-slate-400">
 <span class="material-symbols-outlined text-[20px]">palette</span>
 </span>
 <select
 formControlName="theme"
 class="min-h-[3.75rem] w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-12 text-sm font-bold text-slate-800 outline-none transition-all hover:bg-white focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10">
 <option value="" disabled>{{ 'MARKETING.HOME_SECTIONS.FIELDS.THEME_PLACEHOLDER' | translate }}</option>
 <option *ngFor="let option of themeOptions" [value]="option.key">
 {{ getThemeOptionLabel(option) }}
 </option>
 </select>
 </div>
 </div>

 <div class="space-y-3">
 <label class="text-sm font-black text-slate-700">
 {{ 'MARKETING.HOME_SECTIONS.FIELDS.TAKE' | translate }}
 <span class="text-red-500">*</span>
 </label>
 <input
 formControlName="productsTake"
 type="number"
 min="1"
 class="min-h-[3.75rem] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition-all hover:bg-white focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10"
 placeholder="{{ 'MARKETING.HOME_SECTIONS.PLACEHOLDERS.PRODUCTS_TAKE' | translate }}" />
 <p class="text-[11px] font-bold text-slate-400">
 {{ 'MARKETING.HOME_SECTIONS.FIELDS.TAKE_DESC' | translate }}
 </p>
 </div>

 <div class="md:col-span-2 h-px bg-slate-200 my-1"></div>

 <div class="space-y-3">
 <label class="text-sm font-black text-slate-700">
 {{ 'MARKETING.BANNERS.FIELDS.ORDER' | translate }}
 <span class="text-red-500">*</span>
 </label>
 <input
 formControlName="displayOrder"
 type="number"
 min="0"
 class="min-h-[3.75rem] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition-all hover:bg-white focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10"
 [placeholder]="'MARKETING.BANNERS.FIELDS.ORDER_PLACEHOLDER' | translate" />
 </div>

 <div class="flex items-end">
 <div class="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 hover:border-zadna-primary/50 transition-colors">
 <label class="flex w-full cursor-pointer items-center justify-between gap-3 text-sm font-bold text-slate-700 select-none">
 <div class="flex items-center gap-3">
 <span class="material-symbols-outlined text-[20px] text-zadna-primary">visibility</span>
 <span>{{ 'MARKETING.HOME_SECTIONS.FIELDS.ACTIVATE' | translate }}</span>
 </div>
 <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
 <input type="checkbox" formControlName="isActive" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-slate-300 appearance-none cursor-pointer transition-all duration-300 checked:right-0 checked:border-zadna-primary focus:outline-none focus:ring-0 focus:ring-offset-0" style="right: 1.25rem;" [style.right]="form.get('isActive')?.value ? '0' : '1.25rem'" [style.borderColor]="form.get('isActive')?.value ? '#127c8c' : '#cbd5e1'"/>
 <label class="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer transition-colors duration-300" [style.backgroundColor]="form.get('isActive')?.value ? '#77cdd8' : '#cbd5e1'"></label>
 </div>
 </label>
 </div>
 </div>

 </div>

 <section class="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-4">
 <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
 <div class="space-y-1">
 <h3 class="text-sm font-black text-slate-800">
 {{ 'MARKETING.HOME_SECTIONS.FIELDS.SCHEDULE' | translate }}
 </h3>
 <p class="text-[11px] font-bold text-slate-500">
 {{ form.controls.alwaysVisible.value
                  ? ('MARKETING.HOME_SECTIONS.FIELDS.ALWAYS_VISIBLE_DESC' | translate)
                  : ('MARKETING.HOME_SECTIONS.FIELDS.SCHEDULED_DESC' | translate) }}
 </p>
 </div>

 <div class="flex items-center gap-2">
 <label class="flex cursor-pointer items-center gap-3 text-sm font-bold text-slate-700">
 <input type="checkbox" formControlName="alwaysVisible" class="h-4 w-4 rounded border-slate-300 text-zadna-primary focus:ring-zadna-primary" />
 {{ 'MARKETING.HOME_SECTIONS.FIELDS.ALWAYS_VISIBLE' | translate }}
 </label>
 </div>
 </div>

 <div class="grid gap-4 md:grid-cols-2 pt-2 border-t border-slate-200/60" [class.opacity-50]="form.controls.alwaysVisible.value">
 <div class="space-y-2">
 <label class="text-xs font-black text-slate-500">
 {{ 'MARKETING.BANNERS.FIELDS.STARTS_AT' | translate }}
 </label>
 <input
 formControlName="startsAtUtc"
 type="datetime-local"
 [disabled]="form.controls.alwaysVisible.value"
 class="min-h-[3.25rem] w-full rounded-xl border px-4 text-sm font-bold outline-none transition"
 [ngClass]="form.controls.alwaysVisible.value
 ? 'border-slate-200 bg-slate-100/50 text-slate-400'
 : 'border-slate-200 bg-white text-slate-800 focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10'" />
 </div>

 <div class="space-y-2">
 <label class="text-xs font-black text-slate-500">
 {{ 'MARKETING.BANNERS.FIELDS.ENDS_AT' | translate }}
 </label>
 <input
 formControlName="endsAtUtc"
 type="datetime-local"
 [disabled]="form.controls.alwaysVisible.value"
 class="min-h-[3.25rem] w-full rounded-xl border px-4 text-sm font-bold outline-none transition"
 [ngClass]="form.controls.alwaysVisible.value
 ? 'border-slate-200 bg-slate-100/50 text-slate-400'
 : 'border-slate-200 bg-white text-slate-800 focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10'" />
 </div>
 </div>
 </section>

 <div *ngIf="submitAttempted && form.invalid" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 flex items-center gap-2">
 <span class="material-symbols-outlined text-[18px]">error</span>
 {{ 'MARKETING.BANNERS.MESSAGES.REQUIRED_FIELDS' | translate }}
 </div>
 </form>

 <div modal-footer class="flex items-center justify-end gap-3 w-full bg-slate-50/80 p-4 border-t border-slate-200">
 <app-button variant="ghost" size="sm" (btnClick)="close.emit()" customClass="!rounded-xl text-slate-600 hover:bg-slate-200 hover:text-slate-900">{{ 'MARKETING.COUPONS.ACTIONS.CANCEL' | translate }}</app-button>
 <app-button variant="primary" size="sm" [isLoading]="isSaving" (btnClick)="submit()" customClass="!rounded-xl bg-zadna-primary hover:bg-zadna-primary/90 shadow-lg shadow-zadna-primary/20 text-white">
 <div class="flex items-center gap-2">
 <span class="material-symbols-outlined text-[18px]">save</span>
 {{ (section ? 'MARKETING.BANNERS.ACTIONS.SAVE_CHANGES' : 'MARKETING.HOME_SECTIONS.ACTIONS.ADD_SECTION') | translate }}
 </div>
 </app-button>
 </div>
 </app-modal-shell>
 `,
 styles: [`.toggle-checkbox:checked { right: 0; border-color: #127c8c; }.toggle-label { background-color: #cbd5e1; }.toggle-checkbox:checked +.toggle-label { background-color: #77cdd8; }
 `]
})
export class HomeSectionFormModalComponent implements OnChanges, OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 @Input() isOpen = false;
 @Input() isSaving = false;
 @Input() section: MarketingHomeSection | null = null;
 @Input() categoryOptions: MarketingCategoryOption[] = [];
 @Input() themeOptions: HomeSectionThemeOption[] = [];

 @Output() close = new EventEmitter<void>();
 @Output() save = new EventEmitter<MarketingHomeSectionUpdatePayload>();

 submitAttempted = false;

 private readonly formBuilder = inject(FormBuilder);
 readonly translateService = inject(TranslateService);

 get selectableCategoryOptions(): SearchableSelectOption<string>[] {
 return this.categoryOptions.filter(opt => opt.isSelectable).map(opt => ({
 value: opt.id,
 label: opt.pathLabel
 }));
 }

 readonly form = this.formBuilder.nonNullable.group({
 categoryId: ['', Validators.required],
 theme: ['' as HomeSectionTheme | '', Validators.required],
 displayOrder: ['0', Validators.required],
 productsTake: ['8', Validators.required],
 startsAtUtc: [''],
 endsAtUtc: [''],
 alwaysVisible: true,
 isActive: true
 });

 ngOnInit(): void {
 this.form.controls.alwaysVisible.valueChanges.subscribe(() => {
 this.cdr.markForCheck();
 this.toggleScheduleInputs();
 });
 this.toggleScheduleInputs();
 }

 ngOnChanges(changes: SimpleChanges): void {
 if ((changes['isOpen'] || changes['section']) && this.isOpen) {
 this.submitAttempted = false;
 const section = this.section;
 this.form.reset({
 categoryId: section?.categoryId ?? '',
 theme: section?.theme ?? '',
 displayOrder: String(section?.displayOrder ?? 0),
 productsTake: String(section?.productsTake ?? 8),
 startsAtUtc: toDateTimeLocalInput(section?.startsAtUtc),
 endsAtUtc: toDateTimeLocalInput(section?.endsAtUtc),
 alwaysVisible:!section?.startsAtUtc &&!section?.endsAtUtc,
 isActive: section?.isActive ?? true
 });
 }

 if (changes['isOpen']) {
 this.toggleScheduleInputs();
 }
 }

 submit(): void {
 this.submitAttempted = true;
 if (this.form.invalid) {
 this.form.markAllAsTouched();
 return;
 }

 const value = this.form.getRawValue();
 const startsAtUtc = value.alwaysVisible ? null : toNullableUtcIso(value.startsAtUtc);
 const endsAtUtc = value.alwaysVisible ? null : toNullableUtcIso(value.endsAtUtc);

 this.save.emit({
 categoryId: value.categoryId,
 theme: value.theme as HomeSectionTheme,
 displayOrder: Number(value.displayOrder) || 0,
 productsTake: Number(value.productsTake) || 0,
 startsAtUtc,
 endsAtUtc,
 isActive: value.isActive
 });
 }

 private toggleScheduleInputs(): void {
 const alwaysVisible = this.form.controls.alwaysVisible.value;
 const startsAtControl = this.form.controls.startsAtUtc;
 const endsAtControl = this.form.controls.endsAtUtc;

 if (alwaysVisible) {
 startsAtControl.setValue('', { emitEvent: false });
 endsAtControl.setValue('', { emitEvent: false });
 startsAtControl.disable({ emitEvent: false });
 endsAtControl.disable({ emitEvent: false });
 return;
 }

 startsAtControl.enable({ emitEvent: false });
 endsAtControl.enable({ emitEvent: false });
 }

 getThemeOptionLabel(option: HomeSectionThemeOption): string {
 return this.translateService.currentLang === 'ar' ? option.labelAr : option.labelEn;
 }
}
