import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';
import { ZoneFinanceSettings } from '../../models/finance.models';
import { FinanceService } from '../../services/finance.service';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { ToastService } from '../../../../shared/services/toast.service';

type NumericZoneField =
  | 'baseDeliveryFee'
  | 'includedKm'
  | 'extraKmFee'
  | 'minDeliveryFee'
  | 'maxDeliveryFee'
  | 'vatPercent'
  | 'codFlatFee'
  | 'codPercent';

@Component({
  selector: 'app-platform-pricing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppCardComponent,
    AppButtonComponent,
    AppPageHeaderComponent
  ],
  template: `
    <div *ngIf="showConfirm" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="closeConfirm()"></div>
      <div class="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50">
          <span class="material-symbols-outlined text-[24px] text-amber-500">warning</span>
        </div>
        <h3 class="mb-2 text-center text-lg font-black text-slate-900">تأكيد حفظ الإعدادات</h3>
        <p class="mb-6 text-center text-[13px] font-medium leading-relaxed text-slate-500">
          سيتم حفظ إعدادات التسعير وضريبة القيمة المضافة ورسوم الدفع عند الاستلام للمنطقة المحددة.
        </p>
        <div class="flex gap-3">
          <app-button
            variant="ghost"
            size="md"
            customClass="!flex-1 !rounded-xl !bg-slate-50 hover:!bg-slate-100"
            [disabled]="isSaving"
            (btnClick)="closeConfirm()">
            إلغاء
          </app-button>
          <app-button
            variant="primary"
            size="md"
            customClass="!flex-1 !rounded-xl shadow-md shadow-zadna-primary/20"
            [isLoading]="isSaving"
            [disabled]="!canSave"
            (btnClick)="savePricing()">
            تأكيد الحفظ
          </app-button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <app-page-header
        title="إعدادات التسعير والرسوم"
        subtitle="إدارة رسوم التوصيل والضريبة ورسوم الدفع عند الاستلام لكل منطقة من البيانات الحقيقية في الباك إند.">
        <div actions class="flex flex-wrap items-center gap-3">
          <div class="relative w-64">
            <select
              *ngIf="zones.length"
              [(ngModel)]="selectedZoneId"
              (ngModelChange)="onZoneChange()"
              class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 pe-10 text-[13px] font-bold text-slate-800 outline-none transition-all focus:border-zadna-primary focus:ring-2 focus:ring-zadna-primary/20">
              <option *ngFor="let zone of zones" [value]="zone.zoneId">
                {{ displayZoneName(zone.zoneName) }} ({{ displayCityName(zone.city) }})
              </option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
              expand_more
            </span>
          </div>

          <div *ngIf="isLoading" class="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-zadna-primary"></div>
            <span class="text-xs font-bold text-slate-500">جاري تحميل المناطق...</span>
          </div>

          <app-button
            variant="outline"
            size="sm"
            customClass="!rounded-xl !bg-white hover:!bg-slate-50"
            [disabled]="isLoading || isSaving"
            (btnClick)="loadData()">
            تحديث
          </app-button>

          <app-button
            variant="outline"
            size="sm"
            customClass="!rounded-xl !bg-white hover:!bg-slate-50"
            [disabled]="!isDirty || isSaving"
            (btnClick)="resetChanges()">
            تجاهل التغييرات
          </app-button>

          <app-button
            variant="primary"
            size="sm"
            customClass="!rounded-xl shadow-sm"
            [disabled]="!canSave"
            [isLoading]="isSaving"
            (btnClick)="confirmSave()">
            <span class="material-symbols-outlined text-[16px] rtl:ml-1 ltr:mr-1">save</span>
            حفظ الإعدادات
          </app-button>
        </div>
      </app-page-header>

      <div *ngIf="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
        {{ errorMessage }}
      </div>

      <div *ngIf="zones.length" class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 class="text-[15px] font-black text-slate-900">المناطق المتاحة</h3>
            <p class="mt-1 text-[12px] font-medium text-slate-500">
              اختر المنطقة التي تريد تعديلها، ثم احفظ إعدادات التسعير والضريبة ورسوم الدفع عند الاستلام الخاصة بها.
            </p>
          </div>
          <div class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-600">
            {{ zones.length }} منطقة
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(320px,420px)_1fr] lg:items-end">
          <div class="space-y-2">
            <label class="block text-[11px] font-bold text-slate-400">قائمة المناطق</label>
            <div class="relative">
              <select
                [(ngModel)]="selectedZoneId"
                (ngModelChange)="onZoneChange()"
                class="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pe-11 text-[14px] font-bold text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-2 focus:ring-zadna-primary/20">
                <option *ngFor="let zone of zones" [value]="zone.zoneId">
                  {{ displayZoneName(zone.zoneName) }} ({{ displayCityName(zone.city) }})
                </option>
              </select>
              <span class="material-symbols-outlined pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                expand_more
              </span>
            </div>
          </div>

          <div *ngIf="selectedZone" class="flex flex-wrap items-center gap-2 lg:justify-end">
            <span
              class="rounded-full px-3 py-1.5 text-[11px] font-black"
              [ngClass]="selectedZone.isPricingActive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'">
              {{ selectedZone.isPricingActive ? 'نشطة' : 'موقوفة' }}
            </span>
            <span class="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
              ضريبة {{ selectedZone.vatPercent }}%
            </span>
            <span class="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
              الدفع عند الاستلام {{ selectedZone.codFeeType === 'percent' ? (selectedZone.codPercent + '%') : (selectedZone.codFlatFee + ' SAR') }}
            </span>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading && !zones.length" class="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
          <span class="material-symbols-outlined text-[30px]">location_off</span>
        </div>
        <h3 class="text-lg font-black text-slate-900">لا توجد مناطق متاحة</h3>
        <p class="mt-2 text-sm font-medium text-slate-500">لم يتم العثور على مناطق تسعير قابلة للإدارة من الباك إند.</p>
      </div>

      <div *ngIf="selectedZone" class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-[11px] font-bold text-slate-400">المنطقة المختارة</p>
          <h3 class="mt-1 text-lg font-black text-slate-900">{{ displayZoneName(selectedZone.zoneName) }} <span class="text-slate-400">/</span> {{ displayCityName(selectedZone.city) }}</h3>
          <p class="mt-1 text-[12px] font-medium" [ngClass]="isDirty ? 'text-amber-600' : 'text-slate-500'">
            {{ isDirty ? 'توجد تغييرات غير محفوظة لهذه المنطقة.' : 'كل تغييرات هذه المنطقة محفوظة.' }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <app-button
            variant="outline"
            size="sm"
            customClass="!rounded-xl !bg-white hover:!bg-slate-50"
            [disabled]="!isDirty || isSaving"
            (btnClick)="resetChanges()">
            تجاهل التغييرات
          </app-button>

          <app-button
            variant="primary"
            size="sm"
            customClass="!rounded-xl shadow-sm"
            [disabled]="!canSave"
            [isLoading]="isSaving"
            (btnClick)="confirmSave()">
            <span class="material-symbols-outlined text-[16px] rtl:ml-1 ltr:mr-1">save</span>
            حفظ التغييرات
          </app-button>
        </div>
      </div>

      <div *ngIf="selectedZone" class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <app-card variant="default" rounded="2xl" padding="none" customClass="flex h-full flex-col overflow-visible border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
          <div class="flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-slate-50/60 px-5 py-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-100 bg-amber-50">
                <span class="material-symbols-outlined text-[20px] text-amber-500">local_shipping</span>
              </div>
              <div>
                <h3 class="text-[15px] font-black text-slate-900">التسعير الأساسي للتوصيل</h3>
                <p class="mt-0.5 text-[11px] font-bold text-slate-500">مرتبط مباشرة بقاعدة التسعير الخاصة بالمنطقة.</p>
              </div>
            </div>
            <button
              type="button"
              (click)="togglePricingActive()"
              class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zadna-primary focus:ring-offset-2"
              [ngClass]="selectedZone.isPricingActive ? 'bg-zadna-primary' : 'bg-slate-200'">
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                [ngClass]="selectedZone.isPricingActive ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>

          <div
            class="flex-1 space-y-5 p-5 transition-opacity duration-200"
            [class.pointer-events-none]="!selectedZone.isPricingActive"
            [class.opacity-40]="!selectedZone.isPricingActive">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-slate-600">الرسوم الأساسية</label>
                <div class="relative">
                  <input
                    type="number"
                    [ngModel]="selectedZone.baseDeliveryFee"
                    (ngModelChange)="updateNumberField('baseDeliveryFee', $event)"
                    min="0"
                    class="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">SAR</span>
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-slate-600">المسافة المشمولة</label>
                <div class="relative">
                  <input
                    type="number"
                    [ngModel]="selectedZone.includedKm"
                    (ngModelChange)="updateNumberField('includedKm', $event)"
                    min="0"
                    step="0.5"
                    class="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">KM</span>
                </div>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-[11px] font-bold text-slate-600">رسوم الكيلومتر الإضافي</label>
              <div class="relative">
                <input
                  type="number"
                  [ngModel]="selectedZone.extraKmFee"
                  (ngModelChange)="updateNumberField('extraKmFee', $event)"
                  min="0"
                  step="0.5"
                  class="w-full rounded-xl border border-slate-200 bg-white pl-16 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">SAR/KM</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-slate-600">الحد الأدنى للرسوم</label>
                <div class="relative">
                  <input
                    type="number"
                    [ngModel]="selectedZone.minDeliveryFee"
                    (ngModelChange)="updateNumberField('minDeliveryFee', $event)"
                    min="0"
                    class="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">SAR</span>
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-slate-600">الحد الأقصى للرسوم</label>
                <div class="relative">
                  <input
                    type="number"
                    [ngModel]="selectedZone.maxDeliveryFee"
                    (ngModelChange)="updateNumberField('maxDeliveryFee', $event)"
                    min="0"
                    class="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">SAR</span>
                </div>
              </div>
            </div>
          </div>
        </app-card>

        <app-card variant="default" rounded="2xl" padding="none" customClass="flex h-full flex-col overflow-visible border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
          <div class="flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-slate-50/60 px-5 py-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50">
                <span class="material-symbols-outlined text-[20px] text-indigo-500">local_atm</span>
              </div>
              <div>
                <h3 class="text-[15px] font-black text-slate-900">رسوم الدفع عند الاستلام</h3>
                <p class="mt-0.5 text-[11px] font-bold text-slate-500">مطابقة تمامًا للهيكل المدعوم في الباك إند.</p>
              </div>
            </div>
            <button
              type="button"
              (click)="toggleCodActive()"
              class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              [ngClass]="selectedZone.isCodFeeActive ? 'bg-indigo-500' : 'bg-slate-200'">
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                [ngClass]="selectedZone.isCodFeeActive ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>

          <div
            class="flex-1 space-y-5 p-5 transition-opacity duration-200"
            [class.pointer-events-none]="!selectedZone.isCodFeeActive"
            [class.opacity-40]="!selectedZone.isCodFeeActive">
            <div class="space-y-1.5">
              <label class="block text-[11px] font-bold text-slate-600">نوع الرسوم</label>
              <div class="relative">
                <select
                  [(ngModel)]="selectedZone.codFeeType"
                  (ngModelChange)="markDirty()"
                  class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-black text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                  <option value="flat">رسوم ثابتة</option>
                  <option value="percent">نسبة مئوية</option>
                </select>
                <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">unfold_more</span>
              </div>
              <p class="text-[11px] font-medium text-slate-400">
                الباك إند يدعم حاليًا نوعًا واحدًا فعالًا لكل منطقة: ثابت أو نسبة.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5" [class.opacity-30]="selectedZone.codFeeType === 'flat'">
                <label class="block text-[11px] font-bold text-slate-600">النسبة المئوية</label>
                <div class="relative">
                  <input
                    type="number"
                    [ngModel]="selectedZone.codPercent"
                    (ngModelChange)="updateNumberField('codPercent', $event)"
                    min="0"
                    max="100"
                    step="0.1"
                    [disabled]="selectedZone.codFeeType === 'flat'"
                    class="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50" />
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-black text-slate-400">%</span>
                </div>
              </div>
              <div class="space-y-1.5" [class.opacity-30]="selectedZone.codFeeType === 'percent'">
                <label class="block text-[11px] font-bold text-slate-600">الرسوم الثابتة</label>
                <div class="relative">
                  <input
                    type="number"
                    [ngModel]="selectedZone.codFlatFee"
                    (ngModelChange)="updateNumberField('codFlatFee', $event)"
                    min="0"
                    [disabled]="selectedZone.codFeeType === 'percent'"
                    class="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50" />
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">SAR</span>
                </div>
              </div>
            </div>
          </div>
        </app-card>

        <app-card variant="default" rounded="2xl" padding="none" customClass="flex h-full flex-col overflow-visible border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
          <div class="flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-slate-50/60 px-5 py-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-100 bg-purple-50">
                <span class="material-symbols-outlined text-[20px] text-purple-500">account_balance</span>
              </div>
              <div>
                <h3 class="text-[15px] font-black text-slate-900">ضريبة القيمة المضافة</h3>
                <p class="mt-0.5 text-[11px] font-bold text-slate-500">تُستخدم مباشرة في حسابات الـ checkout.</p>
              </div>
            </div>
            <button
              type="button"
              (click)="toggleVatActive()"
              class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              [ngClass]="selectedZone.isVatActive ? 'bg-purple-500' : 'bg-slate-200'">
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                [ngClass]="selectedZone.isVatActive ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>

          <div
            class="flex flex-1 flex-col items-center justify-center space-y-6 p-5 transition-opacity duration-200"
            [class.pointer-events-none]="!selectedZone.isVatActive"
            [class.opacity-40]="!selectedZone.isVatActive">
            <div class="text-center">
              <div class="mb-2 text-4xl font-black text-purple-600 tabular-nums">
                {{ selectedZone.vatPercent }}<span class="text-2xl text-purple-400">%</span>
              </div>
              <p class="text-[11px] font-bold text-slate-500">النسبة الحالية المطبقة على المنطقة المحددة</p>
            </div>

            <div class="w-full">
              <input
                type="range"
                [ngModel]="selectedZone.vatPercent"
                (ngModelChange)="updateNumberField('vatPercent', $event)"
                min="0"
                max="25"
                step="1"
                class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-purple-600" />
              <div class="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
                <span>0%</span>
                <span>25%</span>
              </div>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class PlatformPricingComponent implements OnInit {
  private readonly financeService = inject(FinanceService);
  private readonly toastService = inject(ToastService);
  private readonly cityArabicMap: Record<string, string> = {
    riyadh: 'الرياض',
    jeddah: 'جدة',
    dammam: 'الدمام',
    khobar: 'الخبر',
    'al khobar': 'الخبر',
    makkah: 'مكة',
    mecca: 'مكة',
    madinah: 'المدينة',
    medina: 'المدينة',
    taif: 'الطائف',
    tabuk: 'تبوك'
  };
  private readonly zoneArabicMap: Record<string, string> = {
    'al olaya': 'العليا',
    olaya: 'العليا',
    'al sulaymaniyah': 'السليمانية',
    sulaymaniyah: 'السليمانية',
    'al malqa': 'الملقا',
    malqa: 'الملقا',
    'al yasmin': 'الياسمين',
    yasmin: 'الياسمين',
    'al nakheel': 'النخيل',
    nakheel: 'النخيل',
    'al rawdah': 'الروضة',
    rawdah: 'الروضة',
    standard: 'قياسي',
    central: 'المركزية',
    remote: 'البعيدة',
    north: 'الشمال',
    south: 'الجنوب',
    east: 'الشرق',
    west: 'الغرب',
    airport: 'المطار',
    industrial: 'الصناعية',
    branch: 'الفرع',
    zone: 'المنطقة'
  };

  zones: ZoneFinanceSettings[] = [];
  selectedZoneId: string | null = null;
  selectedZone: ZoneFinanceSettings | null = null;

  isLoading = false;
  isSaving = false;
  isDirty = false;
  showConfirm = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadData();
  }

  get canSave(): boolean {
    return Boolean(this.selectedZone) && this.isDirty && !this.isSaving;
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.financeService.getZonePricingSettings().pipe(take(1)).subscribe({
      next: (zones) => {
        this.zones = zones;
        if (zones.length > 0) {
          if (!this.selectedZoneId || !zones.some((zone) => zone.zoneId === this.selectedZoneId)) {
            this.selectedZoneId = zones[0].zoneId;
          }
          this.onZoneChange();
        } else {
          this.selectedZone = null;
        }
        this.isDirty = false;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.describeApiError(error);
        this.zones = [];
        this.selectedZone = null;
        this.isLoading = false;
      }
    });
  }

  onZoneChange(): void {
    const zone = this.zones.find((item) => item.zoneId === this.selectedZoneId);
    this.selectedZone = zone ? this.clone(zone) : null;
    this.isDirty = false;
    this.showConfirm = false;
  }

  resetChanges(): void {
    this.onZoneChange();
  }

  confirmSave(): void {
    if (!this.canSave) {
      return;
    }

    this.showConfirm = true;
  }

  closeConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.showConfirm = false;
  }

  savePricing(): void {
    if (!this.selectedZone || this.isSaving) {
      return;
    }

    const payload = this.buildSavePayload(this.selectedZone);
    this.isSaving = true;
    this.errorMessage = '';

    this.financeService.updateZonePricingSettings(payload.zoneId, payload).pipe(take(1)).subscribe({
      next: (savedZone) => {
        const index = this.zones.findIndex((zone) => zone.zoneId === savedZone.zoneId);
        if (index >= 0) {
          this.zones[index] = this.clone(savedZone);
        }
        this.selectedZone = this.clone(savedZone);
        this.isDirty = false;
        this.isSaving = false;
        this.showConfirm = false;
        this.toastService.success('تم حفظ إعدادات المنطقة وربطها بالباك إند بنجاح.', 'التسعير');
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = this.describeApiError(error);
        this.toastService.error(this.errorMessage, 'التسعير');
      }
    });
  }

  togglePricingActive(): void {
    if (!this.selectedZone) {
      return;
    }

    this.selectedZone.isPricingActive = !this.selectedZone.isPricingActive;
    this.markDirty();
  }

  toggleCodActive(): void {
    if (!this.selectedZone) {
      return;
    }

    this.selectedZone.isCodFeeActive = !this.selectedZone.isCodFeeActive;
    this.markDirty();
  }

  toggleVatActive(): void {
    if (!this.selectedZone) {
      return;
    }

    this.selectedZone.isVatActive = !this.selectedZone.isVatActive;
    this.markDirty();
  }

  updateNumberField(field: NumericZoneField, value: number | string): void {
    if (!this.selectedZone) {
      return;
    }

    const numericValue = Number(value);
    this.selectedZone[field] = Number.isFinite(numericValue)
      ? Math.max(0, numericValue)
      : 0;

    this.markDirty();
  }

  markDirty(): void {
    this.isDirty = true;
  }

  displayCityName(city: string): string {
    if (!city) {
      return '';
    }

    if (this.containsArabic(city)) {
      return city;
    }

    return this.cityArabicMap[this.normalizeLookupKey(city)] ?? city;
  }

  displayZoneName(zoneName: string): string {
    if (!zoneName) {
      return '';
    }

    if (this.containsArabic(zoneName)) {
      return zoneName;
    }

    const normalized = this.normalizeLookupKey(zoneName);
    if (this.zoneArabicMap[normalized]) {
      return this.zoneArabicMap[normalized];
    }

    const translated = normalized
      .split(/\s+/)
      .map((part) => this.zoneArabicMap[part] ?? part)
      .join(' ')
      .trim();

    return translated || zoneName;
  }

  private buildSavePayload(zone: ZoneFinanceSettings): ZoneFinanceSettings {
    const minDeliveryFee = Math.min(zone.minDeliveryFee, zone.maxDeliveryFee || zone.minDeliveryFee);
    const maxDeliveryFee = Math.max(zone.maxDeliveryFee, minDeliveryFee);

    return {
      ...this.clone(zone),
      baseDeliveryFee: this.normalizeNumber(zone.baseDeliveryFee),
      includedKm: this.normalizeNumber(zone.includedKm),
      extraKmFee: this.normalizeNumber(zone.extraKmFee),
      minDeliveryFee: this.normalizeNumber(minDeliveryFee),
      maxDeliveryFee: this.normalizeNumber(maxDeliveryFee),
      vatPercent: this.normalizeNumber(zone.vatPercent),
      codFlatFee: this.normalizeNumber(zone.codFlatFee),
      codPercent: this.normalizeNumber(zone.codPercent),
      codFeeType: zone.codFeeType === 'percent' ? 'percent' : 'flat'
    };
  }

  private normalizeNumber(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.round((value + Number.EPSILON) * 100) / 100);
  }

  private describeApiError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'تعذر الاتصال بالباك إند الخاص بالتسعير. شغّل الـ API ثم أعد المحاولة.';
      }

      const apiMessage =
        (typeof error.error === 'string' && error.error) ||
        error.error?.message ||
        error.error?.title ||
        error.message;

      return apiMessage || 'تعذر حفظ إعدادات التسعير حاليًا.';
    }

    return 'تعذر حفظ إعدادات التسعير حاليًا.';
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  private normalizeLookupKey(value: string): string {
    return value
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private containsArabic(value: string): boolean {
    return /[\u0600-\u06FF]/.test(value);
  }
}
