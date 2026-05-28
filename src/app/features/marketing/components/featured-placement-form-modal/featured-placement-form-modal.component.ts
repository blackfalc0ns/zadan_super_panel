import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeaturedPlacement, FeaturedPlacementType, FeaturedPlacementUpdatePayload, MasterProductLookupOption, VendorProductLookupOption } from '@marketing/models/marketing.models';
import { toDateTimeLocalInput, toNullableUtcIso } from '@marketing/utils/marketing-date.utils';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { AppInputComponent } from '@shared/components/ui/form-controls/input/input.component';
import { AppTextareaComponent } from '@shared/components/ui/form-controls/textarea/textarea.component';
import { ModalShellComponent } from '@shared/components/ui/modal-shell/modal-shell.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-featured-placement-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ModalShellComponent,
    AppInputComponent,
    AppTextareaComponent,
    AppButtonComponent
  ],
  template: `
    <app-modal-shell
      *ngIf="isOpen"
      [title]="(placement ? 'MARKETING.FEATURED.MODAL.EDIT_TITLE' : 'MARKETING.FEATURED.MODAL.CREATE_TITLE') | translate"
      [subtitle]="'MARKETING.FEATURED.MODAL.SUBTITLE' | translate"
      [icon]="'star'"
      [maxWidthClass]="'max-w-4xl'"
      (close)="close.emit()"
    >
      <form [formGroup]="form" modal-body class="space-y-6" (ngSubmit)="submit()">
        
        <div class="grid gap-6 md:grid-cols-2">
          
          <div class="md:col-span-2 p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col gap-4">
            <label class="text-sm font-black text-slate-700">
              {{ 'MARKETING.FEATURED.FIELDS.TARGET_TYPE' | translate }} <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-3">
               <label class="relative flex cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-zadna-primary/50 transition-colors" [ngClass]="{'border-zadna-primary ring-1 ring-zadna-primary bg-zadna-primary/5': isVendorPlacement}">
                  <input type="radio" formControlName="placementType" value="VendorProduct" class="peer sr-only">
                  <div class="flex items-start gap-3">
                     <span class="material-symbols-outlined text-[24px]" [ngClass]="isVendorPlacement ? 'text-zadna-primary' : 'text-slate-400'">storefront</span>
                     <div>
                        <h4 class="text-sm font-black" [ngClass]="isVendorPlacement ? 'text-zadna-primary' : 'text-slate-700'">{{ 'MARKETING.FEATURED.TYPES.VENDOR_PRODUCT' | translate }}</h4>
                        <p class="text-[11px] font-bold mt-1 text-slate-500">{{ 'MARKETING.FEATURED.TYPES.VENDOR_PRODUCT_DESC' | translate }}</p>
                     </div>
                  </div>
               </label>

               <label class="relative flex cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-zadna-primary/50 transition-colors" [ngClass]="{'border-zadna-primary ring-1 ring-zadna-primary bg-zadna-primary/5': isMasterPlacement}">
                  <input type="radio" formControlName="placementType" value="MasterProduct" class="peer sr-only">
                  <div class="flex items-start gap-3">
                     <span class="material-symbols-outlined text-[24px]" [ngClass]="isMasterPlacement ? 'text-zadna-primary' : 'text-slate-400'">inventory_2</span>
                     <div>
                        <h4 class="text-sm font-black" [ngClass]="isMasterPlacement ? 'text-zadna-primary' : 'text-slate-700'">{{ 'MARKETING.FEATURED.TYPES.MASTER_PRODUCT' | translate }}</h4>
                        <p class="text-[11px] font-bold mt-1 text-slate-500">{{ 'MARKETING.FEATURED.TYPES.MASTER_PRODUCT_DESC' | translate }}</p>
                     </div>
                  </div>
               </label>
            </div>
          </div>

          <!-- Vendor Product Searchable Dropdown -->
          <div *ngIf="isVendorPlacement" class="md:col-span-2 space-y-2">
            <label class="text-sm font-black text-slate-700">
              {{ 'MARKETING.FEATURED.FIELDS.SELECT_VENDOR_PRODUCT' | translate }} <span class="text-red-500">*</span>
            </label>
            <div class="dropdown-container">
              <!-- Search Input -->
              <div class="relative">
                <span class="absolute inset-y-0 right-4 flex items-center text-slate-400 pointer-events-none">
                  <span class="material-symbols-outlined text-[20px]">storefront</span>
                </span>
                <input
                  type="text"
                  [value]="showVendorDropdown ? vendorSearchTerm : (selectedVendorProduct ? (isAr ? selectedVendorProduct.nameAr : selectedVendorProduct.nameEn) : '')"
                  (input)="onVendorSearch($event)"
                  (focus)="showVendorDropdown = true; vendorSearchTerm = ''"
                  [placeholder]="'MARKETING.FEATURED.FIELDS.VENDOR_PRODUCT_SEARCH' | translate"
                  class="min-h-[3.25rem] w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-12 text-sm font-bold text-slate-800 outline-none transition-all hover:bg-white focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10"
                />
                <button *ngIf="selectedVendorProduct" type="button" (click)="clearVendorSelection(); $event.stopPropagation()" class="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-red-500 transition-colors z-10">
                  <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <!-- Selected Badge (when dropdown is closed) -->
              <div *ngIf="selectedVendorProduct && !showVendorDropdown" class="mt-2 flex items-center gap-2 rounded-xl bg-zadna-primary/5 border border-zadna-primary/20 px-3 py-2">
                <span class="material-symbols-outlined text-[16px] text-zadna-primary">check_circle</span>
                <span class="text-[13px] font-bold text-slate-800 truncate">{{ isAr ? selectedVendorProduct.nameAr : selectedVendorProduct.nameEn }}</span>
                <span *ngIf="isAr ? selectedVendorProduct.vendorNameAr : selectedVendorProduct.vendorNameEn" class="shrink-0 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-black text-amber-700">{{ isAr ? selectedVendorProduct.vendorNameAr : selectedVendorProduct.vendorNameEn }}</span>
              </div>

              <!-- Dropdown List -->
              <div *ngIf="showVendorDropdown" class="mt-2 w-full max-h-[12rem] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                <div *ngIf="vendorProductsLoading" class="space-y-2 px-4 py-3">
                  <div *ngFor="let item of [1,2,3]" class="flex items-center gap-3">
                    <span class="admin-skeleton admin-skeleton-avatar !h-8 !w-8 rounded-lg"></span>
                    <span class="admin-skeleton admin-skeleton-line flex-1"></span>
                    <span class="admin-skeleton admin-skeleton-chip"></span>
                  </div>
                </div>
                <div *ngIf="!vendorProductsLoading && filteredVendorProducts.length === 0" class="flex flex-col items-center justify-center py-5 gap-1">
                  <span class="material-symbols-outlined text-[24px] text-slate-300">search_off</span>
                  <span class="text-xs font-bold text-slate-400">{{ 'MARKETING.FEATURED.NO_RESULTS' | translate }}</span>
                </div>
                <button
                  *ngFor="let product of filteredVendorProducts"
                  type="button"
                  (click)="selectVendorProduct(product)"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-zadna-primary/5 transition-colors border-b border-slate-100 last:border-b-0"
                  [ngClass]="{'bg-zadna-primary/5': selectedVendorProduct?.id === product.id}">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <span class="material-symbols-outlined text-[16px]">shopping_bag</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-[13px] font-black text-slate-800 truncate">{{ isAr ? product.nameAr : product.nameEn }}</div>
                    <div class="text-[11px] font-bold text-slate-400 truncate">{{ isAr ? product.nameEn : product.nameAr }}</div>
                  </div>
                  <span class="shrink-0 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-black text-amber-700">{{ isAr ? product.vendorNameAr : product.vendorNameEn }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Master Product Searchable Dropdown -->
          <div *ngIf="isMasterPlacement" class="md:col-span-2 space-y-2">
            <label class="text-sm font-black text-slate-700">
              {{ 'MARKETING.FEATURED.FIELDS.SELECT_MASTER_PRODUCT' | translate }} <span class="text-red-500">*</span>
            </label>
            <div class="dropdown-container">
              <div class="relative">
                <span class="absolute inset-y-0 right-4 flex items-center text-slate-400 pointer-events-none">
                  <span class="material-symbols-outlined text-[20px]">inventory_2</span>
                </span>
                <input
                  type="text"
                  [value]="showMasterDropdown ? masterSearchTerm : (selectedMasterProduct ? (isAr ? selectedMasterProduct.nameAr : selectedMasterProduct.nameEn) : '')"
                  (input)="onMasterSearch($event)"
                  (focus)="showMasterDropdown = true; masterSearchTerm = ''"
                  [placeholder]="'MARKETING.FEATURED.FIELDS.MASTER_PRODUCT_SEARCH' | translate"
                  class="min-h-[3.25rem] w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-12 text-sm font-bold text-slate-800 outline-none transition-all hover:bg-white focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10"
                />
                <button *ngIf="selectedMasterProduct" type="button" (click)="clearMasterSelection(); $event.stopPropagation()" class="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-red-500 transition-colors z-10">
                  <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <!-- Selected Badge -->
              <div *ngIf="selectedMasterProduct && !showMasterDropdown" class="mt-2 flex items-center gap-2 rounded-xl bg-zadna-primary/5 border border-zadna-primary/20 px-3 py-2">
                <span class="material-symbols-outlined text-[16px] text-zadna-primary">check_circle</span>
                <span class="text-[13px] font-bold text-slate-800 truncate">{{ isAr ? selectedMasterProduct.nameAr : selectedMasterProduct.nameEn }}</span>
              </div>

              <!-- Dropdown List -->
              <div *ngIf="showMasterDropdown" class="mt-2 w-full max-h-[12rem] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                <div *ngIf="masterProductsLoading" class="space-y-2 px-4 py-3">
                  <div *ngFor="let item of [1,2,3]" class="flex items-center gap-3">
                    <span class="admin-skeleton admin-skeleton-avatar !h-8 !w-8 rounded-lg"></span>
                    <span class="admin-skeleton admin-skeleton-line flex-1"></span>
                    <span class="admin-skeleton admin-skeleton-chip"></span>
                  </div>
                </div>
                <div *ngIf="!masterProductsLoading && filteredMasterProducts.length === 0" class="flex flex-col items-center justify-center py-5 gap-1">
                  <span class="material-symbols-outlined text-[24px] text-slate-300">search_off</span>
                  <span class="text-xs font-bold text-slate-400">{{ 'MARKETING.FEATURED.NO_RESULTS' | translate }}</span>
                </div>
                <button
                  *ngFor="let product of filteredMasterProducts"
                  type="button"
                  (click)="selectMasterProduct(product)"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-zadna-primary/5 transition-colors border-b border-slate-100 last:border-b-0"
                  [ngClass]="{'bg-zadna-primary/5': selectedMasterProduct?.id === product.id}">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                    <span class="material-symbols-outlined text-[16px]">inventory_2</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-[13px] font-black text-slate-800 truncate">{{ isAr ? product.nameAr : product.nameEn }}</div>
                    <div class="text-[11px] font-bold text-slate-400 truncate">{{ isAr ? product.nameEn : product.nameAr }}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div class="md:col-span-2 h-px bg-slate-200 my-1"></div>

          <app-input formControlName="displayOrder" type="number" [label]="'MARKETING.BANNERS.FIELDS.ORDER' | translate" [placeholder]="'MARKETING.BANNERS.FIELDS.ORDER_PLACEHOLDER' | translate" [isRequired]="true"></app-input>
          
          <div class="flex items-end">
            <div class="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 hover:border-zadna-primary/50 transition-colors">
              <label class="flex w-full cursor-pointer items-center justify-between gap-3 text-sm font-bold text-slate-700 select-none">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-[20px] text-zadna-primary">star</span>
                  <span>{{ 'MARKETING.FEATURED.FIELDS.ACTIVATE' | translate }}</span>
                </div>
                <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" formControlName="isActive" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-slate-300 appearance-none cursor-pointer transition-all duration-300 checked:right-0 checked:border-zadna-primary focus:outline-none focus:ring-0 focus:ring-offset-0" style="right: 1.25rem;" [style.right]="form.get('isActive')?.value ? '0' : '1.25rem'" [style.borderColor]="form.get('isActive')?.value ? '#127c8c' : '#cbd5e1'"/>
                  <label class="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer transition-colors duration-300" [style.backgroundColor]="form.get('isActive')?.value ? '#77cdd8' : '#cbd5e1'"></label>
                </div>
              </label>
            </div>
          </div>

          <app-input formControlName="startsAtUtc" type="datetime-local" [label]="'MARKETING.BANNERS.FIELDS.STARTS_AT' | translate" placeholder=""></app-input>
          <app-input formControlName="endsAtUtc" type="datetime-local" [label]="'MARKETING.BANNERS.FIELDS.ENDS_AT' | translate" placeholder=""></app-input>

          <div class="md:col-span-2">
            <app-textarea formControlName="note" [label]="'MARKETING.FEATURED.FIELDS.NOTE' | translate" [placeholder]="'MARKETING.FEATURED.FIELDS.NOTE_PLACEHOLDER' | translate" [rows]="3"></app-textarea>
          </div>

        </div>

        <div *ngIf="submitAttempted && targetValidationMessage" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">error</span>
          {{ targetValidationMessage }}
        </div>
      </form>

      <div modal-footer class="flex items-center justify-end gap-3 w-full bg-slate-50/80 p-4 border-t border-slate-200">
        <app-button variant="ghost" size="sm" (btnClick)="close.emit()" customClass="!rounded-xl text-slate-600 hover:bg-slate-200 hover:text-slate-900">{{ 'MARKETING.COUPONS.ACTIONS.CANCEL' | translate }}</app-button>
        <app-button variant="primary" size="sm" [isLoading]="isSaving" (btnClick)="submit()" customClass="!rounded-xl bg-zadna-primary hover:bg-zadna-primary/90 shadow-lg shadow-zadna-primary/20 text-white">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">save</span>
            {{ (placement ? 'MARKETING.BANNERS.ACTIONS.SAVE_CHANGES' : 'MARKETING.FEATURED.ACTIONS.ADD_PRODUCT') | translate }}
          </div>
        </app-button>
      </div>
    </app-modal-shell>
  `,
  styles: [`
    .toggle-checkbox:checked { right: 0; border-color: #127c8c; }
    .toggle-label { background-color: #cbd5e1; }
    .toggle-checkbox:checked + .toggle-label { background-color: #77cdd8; }
  `],
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class FeaturedPlacementFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() placement: FeaturedPlacement | null = null;
  @Input() masterProductOptions: MasterProductLookupOption[] = [];
  @Input() vendorProductOptions: VendorProductLookupOption[] = [];
  @Input() masterProductsLoading = false;
  @Input() vendorProductsLoading = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<FeaturedPlacementUpdatePayload>();
  @Output() searchMasterProducts = new EventEmitter<string>();
  @Output() searchVendorProducts = new EventEmitter<string>();

  submitAttempted = false;
  showVendorDropdown = false;
  showMasterDropdown = false;
  vendorSearchTerm = '';
  masterSearchTerm = '';
  selectedVendorProduct: VendorProductLookupOption | null = null;
  selectedMasterProduct: MasterProductLookupOption | null = null;

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly formBuilder = inject(FormBuilder);
  readonly translateService = inject(TranslateService);

  readonly form = this.formBuilder.nonNullable.group({
    placementType: ['VendorProduct' as FeaturedPlacementType, Validators.required],
    vendorProductId: [''],
    masterProductId: [''],
    displayOrder: ['0', Validators.required],
    startsAtUtc: [''],
    endsAtUtc: [''],
    note: [''],
    isActive: true
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen'] || changes['placement']) && this.isOpen) {
      this.submitAttempted = false;
      this.showVendorDropdown = false;
      this.showMasterDropdown = false;
      const placement = this.placement;
      this.form.reset({
        placementType: placement?.placementType ?? 'VendorProduct',
        vendorProductId: placement?.vendorProductId ?? '',
        masterProductId: placement?.masterProductId ?? '',
        displayOrder: String(placement?.displayOrder ?? 0),
        startsAtUtc: toDateTimeLocalInput(placement?.startsAtUtc),
        endsAtUtc: toDateTimeLocalInput(placement?.endsAtUtc),
        note: placement?.note ?? '',
        isActive: placement?.isActive ?? true
      });

      // Restore selection from placement data
      if (placement?.vendorProductId) {
        const found = this.vendorProductOptions.find(o => o.id === placement.vendorProductId);
        if (found) {
          this.selectedVendorProduct = found;
          this.vendorSearchTerm = '';
        } else {
          this.selectedVendorProduct = {
            id: placement.vendorProductId,
            nameAr: placement.displayNameAr || placement.vendorProductId,
            nameEn: placement.displayNameEn || placement.vendorProductId,
            vendorNameAr: '',
            vendorNameEn: ''
          };
          this.vendorSearchTerm = '';
        }
      } else {
        this.selectedVendorProduct = null;
        this.vendorSearchTerm = '';
      }

      if (placement?.masterProductId) {
        const found = this.masterProductOptions.find(o => o.id === placement.masterProductId);
        if (found) {
          this.selectedMasterProduct = found;
          this.masterSearchTerm = '';
        } else {
          this.selectedMasterProduct = {
            id: placement.masterProductId,
            nameAr: placement.displayNameAr || placement.masterProductId,
            nameEn: placement.displayNameEn || placement.masterProductId
          };
          this.masterSearchTerm = '';
        }
      } else {
        this.selectedMasterProduct = null;
        this.masterSearchTerm = '';
      }
    }

    // Update selection when options arrive
    if (changes['vendorProductOptions'] && this.selectedVendorProduct) {
      const found = this.vendorProductOptions.find(o => o.id === this.selectedVendorProduct!.id);
      if (found) {
        this.selectedVendorProduct = found;
      }
    }
    if (changes['masterProductOptions'] && this.selectedMasterProduct) {
      const found = this.masterProductOptions.find(o => o.id === this.selectedMasterProduct!.id);
      if (found) {
        this.selectedMasterProduct = found;
      }
    }
  }

  get isAr(): boolean {
    return this.translateService.currentLang === 'ar';
  }

  get isVendorPlacement(): boolean {
    return this.form.controls.placementType.value === 'VendorProduct';
  }

  get isMasterPlacement(): boolean {
    return this.form.controls.placementType.value === 'MasterProduct';
  }

  get filteredVendorProducts(): VendorProductLookupOption[] {
    return this.vendorProductOptions;
  }

  get filteredMasterProducts(): MasterProductLookupOption[] {
    return this.masterProductOptions;
  }

  get targetValidationMessage(): string {
    if (this.isVendorPlacement && !this.selectedVendorProduct) {
      return this.translateService.instant('MARKETING.FEATURED.MESSAGES.REQUIRED_VENDOR_PRODUCT');
    }
    if (this.isMasterPlacement && !this.selectedMasterProduct) {
      return this.translateService.instant('MARKETING.FEATURED.MESSAGES.REQUIRED_MASTER_PRODUCT');
    }
    return '';
  }

  onVendorSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.vendorSearchTerm = value;
    this.showVendorDropdown = true;
    this.debounceSearch(() => this.searchVendorProducts.emit(value));
  }

  onMasterSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.masterSearchTerm = value;
    this.showMasterDropdown = true;
    this.debounceSearch(() => this.searchMasterProducts.emit(value));
  }

  selectVendorProduct(product: VendorProductLookupOption): void {
    this.selectedVendorProduct = product;
    this.form.controls.vendorProductId.setValue(product.id);
    this.vendorSearchTerm = '';
    this.showVendorDropdown = false;
  }

  selectMasterProduct(product: MasterProductLookupOption): void {
    this.selectedMasterProduct = product;
    this.form.controls.masterProductId.setValue(product.id);
    this.masterSearchTerm = '';
    this.showMasterDropdown = false;
  }

  clearVendorSelection(): void {
    this.selectedVendorProduct = null;
    this.form.controls.vendorProductId.setValue('');
    this.vendorSearchTerm = '';
  }

  clearMasterSelection(): void {
    this.selectedMasterProduct = null;
    this.form.controls.masterProductId.setValue('');
    this.masterSearchTerm = '';
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('[class*="relative"]')) {
      this.showVendorDropdown = false;
      this.showMasterDropdown = false;
    }
  }

  submit(): void {
    this.submitAttempted = true;
    if (this.form.invalid || this.targetValidationMessage) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const isVendorPlacement = value.placementType === 'VendorProduct';

    this.save.emit({
      placementType: value.placementType,
      vendorProductId: isVendorPlacement ? (this.selectedVendorProduct?.id ?? null) : null,
      masterProductId: isVendorPlacement ? null : (this.selectedMasterProduct?.id ?? null),
      displayOrder: Number(value.displayOrder) || 0,
      startsAtUtc: toNullableUtcIso(value.startsAtUtc),
      endsAtUtc: toNullableUtcIso(value.endsAtUtc),
      note: normalizeOptional(value.note),
      isActive: value.isActive
    });
  }

  private debounceSearch(callback: () => void): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(callback, 300);
  }
}

function normalizeOptional(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
