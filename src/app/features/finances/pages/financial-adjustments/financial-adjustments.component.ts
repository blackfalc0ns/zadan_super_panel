import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { FinancialAdjustment, EntityType, AdjustmentDirection } from '../../models/finance.models';
import { FinanceStatusBadgeComponent } from '../../components/finance-status-badge/finance-status-badge.component';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { FINANCE_ENTITY_LABEL_KEYS, getFinanceLocale } from '../../utils/finance-i18n.utils';

@Component({
  selector: 'app-financial-adjustments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    FinanceStatusBadgeComponent,
    ModalShellComponent,
    AppButtonComponent,
    AppCardComponent,
    SectionHeaderComponent
  ],
  template: `
    <app-modal-shell
      *ngIf="showCreateModal"
      [dir]="modalDir"
      icon="add_circle"
      title="FINANCES.ADJUSTMENTS.FORM.TITLE"
      subtitle="FINANCES.ADJUSTMENTS.FORM.SUBTITLE"
      maxWidthClass="max-w-2xl"
      [showFooter]="false"
      (close)="closeCreateModal()">
      <form modal-body class="space-y-4" (ngSubmit)="submitAdjustment()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{{ 'FINANCES.ADJUSTMENTS.FORM.ENTITY_TYPE' | translate }}</label>
              <div class="flex gap-2">
                <button type="button" *ngFor="let et of entityTypes"
                        (click)="form.entityType = et.value"
                        class="flex-1 py-2 rounded-xl text-[10px] font-black border transition-all"
                        [ngClass]="form.entityType === et.value
                          ? 'bg-zadna-primary text-white border-zadna-primary'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'">
                  <span class="material-symbols-outlined text-[14px] block mx-auto mb-0.5">{{ et.icon }}</span>
                  {{ et.labelKey | translate }}
                </button>
              </div>
            </div>

            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{{ 'FINANCES.ADJUSTMENTS.FORM.ENTITY_NAME' | translate }}</label>
              <input type="text" [(ngModel)]="form.entityName" name="entityName" required
                     [placeholder]="'FINANCES.ADJUSTMENTS.FORM.ENTITY_PLACEHOLDER' | translate"
                     class="w-full h-10 px-3 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all"/>
            </div>
        </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{{ 'FINANCES.ADJUSTMENTS.FORM.DIRECTION' | translate }}</label>
              <div class="flex gap-2">
                <button type="button"
                        (click)="form.direction = 'credit'"
                        class="flex-1 h-10 rounded-xl text-[11px] font-black border transition-all flex items-center justify-center gap-1.5"
                        [ngClass]="form.direction === 'credit' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-500 border-slate-200'">
                  <span class="material-symbols-outlined text-[15px]">add</span> {{ 'FINANCES.DIRECTIONS.CREDIT' | translate }}
                </button>
                <button type="button"
                        (click)="form.direction = 'debit'"
                        class="flex-1 h-10 rounded-xl text-[11px] font-black border transition-all flex items-center justify-center gap-1.5"
                        [ngClass]="form.direction === 'debit' ? 'bg-red-500 text-white border-red-500' : 'bg-slate-50 text-slate-500 border-slate-200'">
                  <span class="material-symbols-outlined text-[15px]">remove</span> {{ 'FINANCES.DIRECTIONS.DEBIT' | translate }}
                </button>
              </div>
              </div>

              <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{{ 'FINANCES.ADJUSTMENTS.FORM.AMOUNT' | translate }}</label>
              <div class="relative">
                <input type="number" [(ngModel)]="form.amount" name="amount" min="0" required
                       placeholder="0.00"
                       class="w-full h-10 px-3 pe-16 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all tabular-nums font-bold"/>
                <span class="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">SAR</span>
              </div>
              </div>
            </div>

            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{{ 'FINANCES.ADJUSTMENTS.FORM.CATEGORY' | translate }}</label>
              <select [(ngModel)]="form.category" name="category"
                      class="w-full h-10 px-3 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary outline-none transition-all text-slate-600">
                <option *ngFor="let category of categories" [value]="category.value">{{ category.labelKey | translate }}</option>
              </select>
            </div>

            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                {{ 'FINANCES.ADJUSTMENTS.FORM.REASON' | translate }} <span class="text-red-500">*</span>
              </label>
              <textarea [(ngModel)]="form.reason" name="reason" required rows="3"
                        [placeholder]="'FINANCES.ADJUSTMENTS.FORM.REASON_PLACEHOLDER' | translate"
                        class="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none resize-none transition-all">
              </textarea>
              <p class="text-[9px] font-medium text-slate-400 mt-1">{{ 'FINANCES.ADJUSTMENTS.FORM.REASON_HELPER' | translate }}</p>
            </div>

            <div *ngIf="form.amount && form.direction"
                 class="p-4 rounded-xl border"
                 [ngClass]="form.direction === 'credit' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'">
              <p class="text-[9px] font-black uppercase tracking-widest mb-1"
                 [ngClass]="form.direction === 'credit' ? 'text-emerald-500' : 'text-red-500'">{{ 'FINANCES.ADJUSTMENTS.FORM.PREVIEW' | translate }}</p>
              <p class="text-xl font-black tabular-nums"
                 [ngClass]="form.direction === 'credit' ? 'text-emerald-700' : 'text-red-700'">
                {{ form.direction === 'credit' ? '+' : '-' }}{{ formatNumber(form.amount) }} SAR
              </p>
              <p class="text-[10px] font-medium mt-0.5"
                 [ngClass]="form.direction === 'credit' ? 'text-emerald-500' : 'text-red-500'">
                {{ 'FINANCES.ADJUSTMENTS.FORM.FOR' | translate:{ entity: form.entityName || ('FINANCES.COMMON.ENTITY' | translate) } }}
              </p>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <app-button variant="ghost" size="sm" customClass="!rounded-xl !bg-slate-100 hover:!bg-slate-200" (btnClick)="closeCreateModal()">
                {{ 'FINANCES.COMMON.CANCEL' | translate }}
              </app-button>
              <app-button type="submit"
                          size="sm"
                          customClass="!rounded-xl"
                          [disabled]="!form.reason || !form.amount || !form.entityName">
                <span class="material-symbols-outlined text-[16px]">add_circle</span>
                {{ 'FINANCES.ADJUSTMENTS.FORM.SUBMIT' | translate }}
              </app-button>
            </div>
      </form>
    </app-modal-shell>

    <div class="flex flex-col gap-6 animate-in fade-in duration-700">
      <app-card variant="default" rounded="2xl" padding="sm" customClass="border-slate-200/70 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <app-section-header
            [compact]="true"
            icon="rule"
            title="FINANCES.ADJUSTMENTS.HISTORY.TITLE"
            description="FINANCES.ADJUSTMENTS.HISTORY.SUBTITLE">
          </app-section-header>

          <app-button size="sm" customClass="!rounded-xl" (btnClick)="openCreateModal()">
            <span class="material-symbols-outlined text-[16px]">add_circle</span>
            {{ 'FINANCES.ADJUSTMENTS.FORM.TITLE' | translate }}
          </app-button>
        </div>
      </app-card>

      <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200/70 shadow-sm overflow-hidden extraordinary-table-container">
          <div class="px-6 py-4 border-b border-slate-100">
            <p class="text-[10px] font-bold text-slate-400">{{ 'FINANCES.ADJUSTMENTS.HISTORY.SUBTITLE' | translate }}</p>
          </div>

          <table class="w-full">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-100">
                <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.ADJUSTMENTS.TABLE.REF' | translate }}</th>
                <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.ENTITY' | translate }}</th>
                <th class="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.DIRECTION' | translate }}</th>
                <th class="px-6 py-4 text-end text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.AMOUNT' | translate }}</th>
                <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.ADJUSTMENTS.TABLE.REASON' | translate }}</th>
                <th class="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.STATUS' | translate }}</th>
                <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.ADJUSTMENTS.TABLE.BY' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let adj of adjustments; trackBy: trackById"
                  class="group hover:bg-slate-50/60 transition-all duration-200 table-row-object">

                <td class="px-6 py-4">
                  <span class="text-[10px] font-black text-slate-600 font-mono">{{ adj.adjustmentRef }}</span>
                </td>

                <td class="px-6 py-4">
                  <div>
                    <p class="text-xs font-bold text-slate-800">{{ adj.entityName | translate }}</p>
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{{ getEntityLabelKey(adj.entityType) | translate }}</p>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <div class="flex justify-center">
                    <span class="w-7 h-7 rounded-full flex items-center justify-center"
                          [ngClass]="adj.direction === 'credit' ? 'bg-emerald-50' : 'bg-red-50'">
                      <span class="material-symbols-outlined text-[14px]"
                            [ngClass]="adj.direction === 'credit' ? 'text-emerald-500' : 'text-red-500'">
                        {{ adj.direction === 'credit' ? 'add' : 'remove' }}
                      </span>
                    </span>
                  </div>
                </td>

                <td class="px-6 py-4 text-end">
                  <span class="text-sm font-black tabular-nums"
                        [ngClass]="adj.direction === 'credit' ? 'text-emerald-700' : 'text-red-700'">
                    {{ adj.direction === 'credit' ? '+' : '-' }}{{ formatNumber(adj.amount) }} SAR
                  </span>
                </td>

                <td class="px-6 py-4">
                  <p class="text-xs font-medium text-slate-600 line-clamp-2 max-w-[180px]">{{ adj.reason | translate }}</p>
                </td>

                <td class="px-6 py-4">
                  <div class="flex justify-center">
                    <app-finance-status-badge [status]="adj.status"></app-finance-status-badge>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <div>
                    <p class="text-[10px] font-bold text-slate-700">{{ adj.adminName | translate }}</p>
                    <p class="text-[9px] font-medium text-slate-400">{{ formatDate(adj.createdAt) }}</p>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
      </app-card>
    </div>
  `
})
export class FinancialAdjustmentsComponent implements OnInit {
  private financeService = inject(FinanceService);
  private translate = inject(TranslateService);

  adjustments: FinancialAdjustment[] = [];
  showCreateModal = false;

  form: {
    entityType: EntityType;
    entityName: string;
    direction: AdjustmentDirection;
    amount: number;
    reason: string;
    category: string;
  } = {
    entityType: 'vendor',
    entityName: '',
    direction: 'credit',
    amount: 0,
    reason: '',
    category: 'compensation'
  };

  entityTypes = [
    { value: 'vendor' as EntityType, labelKey: FINANCE_ENTITY_LABEL_KEYS['vendor'], icon: 'store' },
    { value: 'driver' as EntityType, labelKey: FINANCE_ENTITY_LABEL_KEYS['driver'], icon: 'local_shipping' }
  ];

  categories = [
    { value: 'compensation', labelKey: 'FINANCES.ADJUSTMENTS.CATEGORIES.COMPENSATION' },
    { value: 'cod_recovery', labelKey: 'FINANCES.ADJUSTMENTS.CATEGORIES.COD_RECOVERY' },
    { value: 'promotion', labelKey: 'FINANCES.ADJUSTMENTS.CATEGORIES.PROMOTION' },
    { value: 'penalty', labelKey: 'FINANCES.ADJUSTMENTS.CATEGORIES.PENALTY' },
    { value: 'correction', labelKey: 'FINANCES.ADJUSTMENTS.CATEGORIES.CORRECTION' },
    { value: 'other', labelKey: 'FINANCES.ADJUSTMENTS.CATEGORIES.OTHER' }
  ];

  ngOnInit(): void {
    this.financeService.getAdjustments().pipe(take(1)).subscribe(data => {
      this.adjustments = data;
    });
  }

  get modalDir(): 'rtl' | 'ltr' {
    return this.translate.currentLang?.startsWith('ar') ? 'rtl' : 'ltr';
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  submitAdjustment(): void {
    if (!this.form.reason || !this.form.amount || !this.form.entityName) return;
    const newAdj: Partial<FinancialAdjustment> = {
      entityType: this.form.entityType,
      entityName: this.form.entityName,
      entityId: 'manual',
      direction: this.form.direction,
      amount: this.form.amount,
      currency: 'SAR',
      reason: this.form.reason,
      category: this.form.category,
      adminId: 'adm-001',
      adminName: 'FINANCES.ADMINS.SUPER_ADMIN'
    };
    this.financeService.createAdjustment(newAdj).pipe(take(1)).subscribe(adj => {
      this.adjustments = [adj, ...this.adjustments];
      this.resetForm();
      this.showCreateModal = false;
    });
  }

  getEntityLabelKey(type: string): string {
    return FINANCE_ENTITY_LABEL_KEYS[type] ?? type;
  }

  trackById(_: number, a: FinancialAdjustment): string { return a.id; }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString(getFinanceLocale(this.translate.currentLang), { calendar: 'gregory' });
  }

  formatNumber(value: number): string {
    return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  private resetForm(): void {
    this.form = { entityType: 'vendor', entityName: '', direction: 'credit', amount: 0, reason: '', category: 'compensation' };
  }
}
