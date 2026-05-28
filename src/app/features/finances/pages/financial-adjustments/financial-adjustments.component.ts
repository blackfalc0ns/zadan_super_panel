import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    <!-- Modal for Creating Adjustment -->
    <app-modal-shell
      *ngIf="showCreateModal"
      [dir]="modalDir"
      icon="account_balance_wallet"
      title="FINANCES.ADJUSTMENTS.FORM.TITLE"
      subtitle="FINANCES.ADJUSTMENTS.FORM.SUBTITLE"
      maxWidthClass="max-w-3xl"
      [showFooter]="false"
      (close)="closeCreateModal()">
      <form modal-body class="space-y-8 p-2" (ngSubmit)="submitAdjustment()">
        
        <div class="space-y-3">
          <label class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            {{ 'FINANCES.ADJUSTMENTS.FORM.ENTITY_TYPE' | translate }}
          </label>
          <div class="grid grid-cols-2 gap-4">
            <button type="button" *ngFor="let et of entityTypes"
                    (click)="form.entityType = et.value"
                    class="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all duration-300 overflow-hidden"
                    [ngClass]="form.entityType === et.value
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-lg shadow-indigo-500/20'
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'">
              <div *ngIf="form.entityType === et.value" class="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full"></div>
              <span class="material-symbols-outlined text-[32px] transition-transform duration-300 group-hover:scale-110"
                    [ngClass]="form.entityType === et.value ? 'text-indigo-600' : 'text-slate-400'">{{ et.icon }}</span>
              <span class="font-black text-sm">{{ et.labelKey | translate }}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-3">
            <label class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              {{ 'FINANCES.ADJUSTMENTS.FORM.ENTITY_NAME' | translate }}
            </label>
            <input type="text" [(ngModel)]="form.entityName" name="entityName" required
                   [placeholder]="'FINANCES.ADJUSTMENTS.FORM.ENTITY_PLACEHOLDER' | translate"
                   class="w-full h-14 px-5 text-sm bg-slate-50/50 hover:bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"/>
          </div>

          <div class="space-y-3">
            <label class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {{ 'FINANCES.ADJUSTMENTS.FORM.AMOUNT' | translate }}
            </label>
            <div class="relative">
              <input type="number" [(ngModel)]="form.amount" name="amount" min="0" required
                     placeholder="0.00"
                     class="w-full h-14 px-5 pe-16 text-lg bg-slate-50/50 hover:bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all tabular-nums font-black text-slate-900 placeholder:text-slate-300"/>
              <span class="absolute end-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 bg-slate-200/50 px-2 py-1 rounded-md">SAR</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-3">
            <label class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span class="w-1.5 h-1.5 rounded-full" [ngClass]="form.direction === 'credit' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
              {{ 'FINANCES.ADJUSTMENTS.FORM.DIRECTION' | translate }}
            </label>
            <div class="flex gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              <button type="button" (click)="form.direction = 'credit'"
                      class="flex-1 h-12 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2"
                      [ngClass]="form.direction === 'credit' ? 'bg-white text-emerald-600 shadow-md shadow-emerald-600/10 border border-emerald-100' : 'text-slate-400 hover:text-slate-600'">
                <span class="material-symbols-outlined text-[18px]">add_circle</span> {{ 'FINANCES.DIRECTIONS.CREDIT' | translate }}
              </button>
              <button type="button" (click)="form.direction = 'debit'"
                      class="flex-1 h-12 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2"
                      [ngClass]="form.direction === 'debit' ? 'bg-white text-rose-600 shadow-md shadow-rose-600/10 border border-rose-100' : 'text-slate-400 hover:text-slate-600'">
                <span class="material-symbols-outlined text-[18px]">remove_circle</span> {{ 'FINANCES.DIRECTIONS.DEBIT' | translate }}
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <label class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              {{ 'FINANCES.ADJUSTMENTS.FORM.CATEGORY' | translate }}
            </label>
            <div class="relative">
              <select [(ngModel)]="form.category" name="category"
                      class="w-full h-14 px-5 appearance-none bg-slate-50/50 hover:bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800">
                <option *ngFor="let category of categories" [value]="category.value">{{ category.labelKey | translate }}</option>
              </select>
              <span class="absolute end-5 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-slate-400">expand_more</span>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <label class="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              {{ 'FINANCES.ADJUSTMENTS.FORM.REASON' | translate }}
            </div>
            <span class="text-[10px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">مطلوب*</span>
          </label>
          <textarea [(ngModel)]="form.reason" name="reason" required rows="3"
                    [placeholder]="'FINANCES.ADJUSTMENTS.FORM.REASON_PLACEHOLDER' | translate"
                    class="w-full px-5 py-4 text-sm bg-slate-50/50 hover:bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none transition-all font-medium text-slate-800 placeholder:text-slate-300"></textarea>
        </div>

        <div *ngIf="form.amount && form.direction" class="animate-in slide-in-from-bottom-4 duration-500">
          <div class="relative overflow-hidden rounded-3xl p-6 border-2"
               [ngClass]="form.direction === 'credit' ? 'bg-gradient-to-br from-emerald-50 to-teal-50/30 border-emerald-100' : 'bg-gradient-to-br from-rose-50 to-red-50/30 border-rose-100'">
            <div class="absolute right-0 top-0 w-32 h-32 opacity-10 rounded-full mix-blend-multiply blur-2xl"
                 [ngClass]="form.direction === 'credit' ? 'bg-emerald-500' : 'bg-rose-500'"></div>
            <div class="relative z-10 flex items-center justify-between">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest mb-1"
                   [ngClass]="form.direction === 'credit' ? 'text-emerald-600' : 'text-rose-600'">{{ 'FINANCES.ADJUSTMENTS.FORM.PREVIEW' | translate }}</p>
                <p class="text-3xl font-black tabular-nums tracking-tight"
                   [ngClass]="form.direction === 'credit' ? 'text-emerald-700' : 'text-rose-700'">
                  {{ form.direction === 'credit' ? '+' : '-' }}{{ formatNumber(form.amount) }} <span class="text-lg">SAR</span>
                </p>
                <p class="text-xs font-bold mt-2" [ngClass]="form.direction === 'credit' ? 'text-emerald-600/80' : 'text-rose-600/80'">
                  {{ 'FINANCES.ADJUSTMENTS.FORM.FOR' | translate:{ entity: form.entityName || ('FINANCES.COMMON.ENTITY' | translate) } }}
                </p>
              </div>
              <div class="h-16 w-16 rounded-full flex items-center justify-center shadow-inner bg-white/50 backdrop-blur-sm">
                <span class="material-symbols-outlined text-[32px]" [ngClass]="form.direction === 'credit' ? 'text-emerald-500' : 'text-rose-500'">
                  {{ form.direction === 'credit' ? 'trending_up' : 'trending_down' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-4 pt-6 border-t-2 border-slate-100/60">
          <button type="button" (click)="closeCreateModal()"
                  class="px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all">
            {{ 'FINANCES.COMMON.CANCEL' | translate }}
          </button>
          <button type="submit" [disabled]="!form.reason || !form.amount || !form.entityName"
                  class="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black text-white transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                  [ngClass]="form.direction === 'credit' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'">
            <span class="material-symbols-outlined text-[20px]">task_alt</span>
            <span>{{ 'FINANCES.ADJUSTMENTS.FORM.SUBMIT' | translate }}</span>
          </button>
        </div>
      </form>
    </app-modal-shell>

    <div class="relative min-h-screen bg-slate-50/50" [dir]="modalDir">
      <div class="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/80 to-transparent pointer-events-none z-0"></div>
      <div class="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-400/5 blur-[120px] pointer-events-none z-0"></div>
      
      <div class="relative z-10 p-6 md:p-10 flex flex-col gap-10 max-w-[1600px] mx-auto animate-in fade-in duration-1000">
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/60 shadow-sm mb-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">المركز المالي</span>
            </div>
            <h1 class="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              {{ 'FINANCES.ADJUSTMENTS.HISTORY.TITLE' | translate }}
            </h1>
            <p class="text-sm font-semibold text-slate-500 max-w-lg leading-relaxed">
              {{ 'FINANCES.ADJUSTMENTS.HISTORY.SUBTITLE' | translate }}
            </p>
          </div>
          
          <button (click)="openCreateModal()" 
                  class="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-95 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span class="material-symbols-outlined text-[20px]">add</span>
            <span>{{ 'FINANCES.ADJUSTMENTS.FORM.TITLE' | translate }}</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div class="group relative bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)] transition-all duration-500 hover:-translate-y-1">
            <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
            <div class="relative z-10">
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 shadow-inner border border-emerald-100/50 group-hover:scale-110 transition-transform duration-500">
                <span class="material-symbols-outlined text-[24px]">arrow_downward</span>
              </div>
              <p class="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">إجمالي الإضافات</p>
              <div class="flex items-baseline gap-2" dir="ltr">
                <span class="text-4xl font-black tracking-tighter text-slate-900">{{ totalCredits | number:'1.2-2' }}</span>
                <span class="text-sm font-bold text-slate-400">SAR</span>
              </div>
            </div>
            <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          <div class="group relative bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(244,63,94,0.12)] transition-all duration-500 hover:-translate-y-1">
            <div class="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors duration-500"></div>
            <div class="relative z-10">
              <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6 shadow-inner border border-rose-100/50 group-hover:scale-110 transition-transform duration-500">
                <span class="material-symbols-outlined text-[24px]">arrow_upward</span>
              </div>
              <p class="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">إجمالي الخصومات</p>
              <div class="flex items-baseline gap-2" dir="ltr">
                <span class="text-4xl font-black tracking-tighter text-slate-900">{{ totalDebits | number:'1.2-2' }}</span>
                <span class="text-sm font-bold text-slate-400">SAR</span>
              </div>
            </div>
            <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          <div class="group relative rounded-3xl p-8 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500">
            <div class="absolute inset-0 bg-slate-900 z-0"></div>
            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] opacity-20 z-0 mix-blend-overlay"></div>
            <div class="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/30 blur-[60px] group-hover:bg-indigo-400/40 transition-colors duration-700 z-0"></div>
            
            <div class="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-start mb-6">
                  <div class="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <span class="material-symbols-outlined text-[24px]">account_balance</span>
                  </div>
                  <div *ngIf="pendingCount > 0" class="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span class="text-[10px] font-black text-white uppercase tracking-wider">{{ pendingCount }} طلب معلق</span>
                  </div>
                </div>
                <p class="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">صافي أثر التسويات</p>
                <div class="flex items-baseline gap-2 text-white" dir="ltr">
                  <span class="text-4xl font-black tracking-tighter" [ngClass]="netAdjustments >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ netAdjustments >= 0 ? '+' : '' }}{{ netAdjustments | number:'1.2-2' }}
                  </span>
                  <span class="text-sm font-bold text-slate-400">SAR</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="sticky top-6 z-40 p-2 bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col xl:flex-row items-center justify-between gap-4">
          
          <div class="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            <button (click)="selectedDirection = 'all'"
                    class="px-6 py-3 rounded-full text-xs font-black transition-all"
                    [ngClass]="selectedDirection === 'all' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'">
              عرض الكل
            </button>
            <button (click)="selectedDirection = 'credit'"
                    class="px-6 py-3 rounded-full text-xs font-black transition-all"
                    [ngClass]="selectedDirection === 'credit' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'">
              الإضافات فقط
            </button>
            <button (click)="selectedDirection = 'debit'"
                    class="px-6 py-3 rounded-full text-xs font-black transition-all"
                    [ngClass]="selectedDirection === 'debit' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'">
              الخصومات فقط
            </button>
            <div class="w-[1px] h-8 bg-slate-200 mx-2 hidden sm:block"></div>
            <div class="relative w-full sm:w-auto flex-1 sm:flex-none">
              <select [(ngModel)]="selectedCategory" 
                      class="w-full sm:w-48 appearance-none bg-transparent px-4 py-3 text-xs font-black text-slate-700 outline-none cursor-pointer">
                <option value="all">كل التصنيفات المتاحة</option>
                <option *ngFor="let cat of categories" [value]="cat.value">{{ cat.labelKey | translate }}</option>
              </select>
              <span class="absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-slate-400 text-[18px]">keyboard_arrow_down</span>
            </div>
          </div>

          <div class="relative w-full xl:w-80 shrink-0">
            <span class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
              <span class="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input type="text" [(ngModel)]="searchQuery"
                   [placeholder]="'FINANCES.FILTERS.SEARCH_PLACEHOLDER' | translate"
                   class="w-full py-3.5 pr-12 pl-5 bg-slate-100/50 border-none rounded-full text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:bg-slate-100 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none">
          </div>

        </div>

        <div class="flex flex-col gap-4">
          
          <div *ngIf="getFilteredAdjustments().length === 0" class="flex flex-col items-center justify-center py-32 text-center">
            <div class="relative w-24 h-24 mb-6">
              <div class="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping"></div>
              <div class="absolute inset-0 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-indigo-300">
                <span class="material-symbols-outlined text-[40px]">receipt_long</span>
              </div>
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-2">لا توجد سجلات مطابقة</h3>
            <p class="text-sm font-medium text-slate-500 max-w-sm">لم يتم العثور على أي تسويات تطابق معايير التصفية والبحث المحددة حالياً.</p>
          </div>

          <div *ngFor="let adj of getFilteredAdjustments()" 
               class="group flex flex-col bg-white rounded-[2rem] border border-slate-100/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-slate-200 transition-all duration-300 overflow-hidden">
            
            <div (click)="toggleRow(adj.id)" class="flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 cursor-pointer gap-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-1.5 h-full"
                   [ngClass]="adj.direction === 'credit' ? 'bg-emerald-500' : 'bg-rose-500'"></div>
              
              <div class="flex items-center gap-6 md:w-1/3">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white shadow-inner"
                     [ngClass]="adj.direction === 'credit' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'">
                  <span class="material-symbols-outlined text-[24px]">
                    {{ adj.direction === 'credit' ? 'arrow_downward' : 'arrow_upward' }}
                  </span>
                </div>
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-mono text-xs font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md" dir="ltr">#{{ adj.adjustmentRef }}</span>
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 px-2 py-0.5 rounded-md">{{ getEntityLabelKey(adj.entityType) | translate }}</span>
                  </div>
                  <h4 class="text-sm font-black text-slate-900">{{ adj.entityName | translate }}</h4>
                </div>
              </div>

              <div class="md:w-1/4 flex flex-col md:items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black"
                      [ngClass]="getCategoryColor(adj.category)">
                  <span class="material-symbols-outlined text-[16px]">{{ getCategoryIcon(adj.category) }}</span>
                  <span>{{ getCategoryLabelKey(adj.category) | translate }}</span>
                </span>
                <span class="text-[11px] font-bold text-slate-400" dir="ltr">{{ formatDate(adj.createdAt) }}</span>
              </div>

              <div class="md:w-1/3 flex items-center justify-between md:justify-end gap-6">
                <div class="flex flex-col items-start md:items-end">
                  <span class="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">المبلغ</span>
                  <span class="font-mono text-xl font-black tracking-tight" dir="ltr"
                        [ngClass]="adj.direction === 'credit' ? 'text-emerald-600' : 'text-rose-600'">
                    {{ adj.direction === 'credit' ? '+' : '-' }}{{ adj.amount | number:'1.2-2' }}
                  </span>
                </div>
                <div class="flex items-center gap-4">
                  <app-finance-status-badge [status]="adj.status"></app-finance-status-badge>
                  <button class="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-800 transition-colors">
                    <span class="material-symbols-outlined text-[20px] transition-transform duration-300" [ngClass]="{'rotate-180': expandedAdjustmentId === adj.id}">
                      expand_more
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div *ngIf="expandedAdjustmentId === adj.id" class="border-t border-slate-100 bg-slate-50/50 p-6 md:p-8 animate-in slide-in-from-top-4 fade-in duration-500">
              <div class="flex flex-col lg:flex-row gap-8 items-start">
                
                <div class="flex-1 space-y-6">
                  <div>
                    <h5 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <span class="material-symbols-outlined text-[16px]">history_edu</span>
                      السجل التدقيقي للتسوية
                    </h5>
                    <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5 text-sm">
                      <div class="flex items-start gap-4 pb-5 border-b border-slate-100">
                        <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                          <span class="material-symbols-outlined text-[20px]">person</span>
                        </div>
                        <div>
                          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">المسؤول المالي (المنشئ)</p>
                          <p class="font-bold text-slate-800">{{ adj.adminName | translate }} <span class="text-slate-400 font-mono text-xs">(ID: {{ adj.adminId }})</span></p>
                        </div>
                      </div>
                      
                      <div class="flex items-start gap-4 pb-5 border-b border-slate-100">
                        <div class="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                          <span class="material-symbols-outlined text-[20px]">notes</span>
                        </div>
                        <div>
                          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">السبب الإداري</p>
                          <p class="font-medium text-slate-700 leading-relaxed">{{ adj.reason | translate }}</p>
                        </div>
                      </div>

                      <div *ngIf="adj.approvedAt || adj.status === 'pending_approval'" class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                             [ngClass]="adj.status === 'approved' ? 'bg-emerald-50 text-emerald-500' : (adj.status === 'rejected' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500')">
                          <span class="material-symbols-outlined text-[20px]">
                            {{ adj.status === 'approved' ? 'verified' : (adj.status === 'rejected' ? 'cancel' : 'pending_actions') }}
                          </span>
                        </div>
                        <div class="flex-1">
                          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">حالة الاعتماد</p>
                          
                          <div *ngIf="adj.approvedBy">
                            <p class="font-bold text-slate-800">{{ adj.approvedBy | translate }}</p>
                            <p class="text-xs text-slate-500 font-mono mt-1" dir="ltr">{{ formatDate(adj.approvedAt!) }}</p>
                          </div>

                          <div *ngIf="adj.status === 'pending_approval'" class="mt-2 flex gap-3">
                            <button (click)="approveAdjustment(adj.id, $event)" 
                                    class="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                              <span class="material-symbols-outlined text-[18px]">check_circle</span>
                              اعتماد المعاملة
                            </button>
                            <button (click)="rejectAdjustment(adj.id, $event)" 
                                    class="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-rose-500/20 active:scale-95">
                              <span class="material-symbols-outlined text-[18px]">cancel</span>
                              رفض وإلغاء
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div class="w-full lg:w-80 shrink-0">
                  <h5 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px]">verified</span>
                    مستند إلكتروني
                  </h5>
                  <div class="relative bg-white rounded-3xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                    <div class="h-16 flex items-center justify-center"
                         [ngClass]="adj.direction === 'credit' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'">
                      <span class="text-sm font-black tracking-widest uppercase">Zadana Logistics</span>
                    </div>
                    
                    <div class="p-6">
                      <div class="text-center mb-6">
                        <p class="text-2xl font-black text-slate-900 tracking-tighter" dir="ltr">
                          {{ adj.amount | number:'1.2-2' }} <span class="text-sm">SAR</span>
                        </p>
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">قيمة التسوية المعتمده</p>
                      </div>

                      <div class="space-y-4 text-xs">
                        <div class="flex justify-between items-center pb-3 border-b border-slate-100 border-dashed">
                          <span class="font-bold text-slate-500">نوع العملية</span>
                          <span class="font-black text-slate-800">{{ getCategoryLabelKey(adj.category) | translate }}</span>
                        </div>
                        <div class="flex justify-between items-center pb-3 border-b border-slate-100 border-dashed">
                          <span class="font-bold text-slate-500">رقم المرجع</span>
                          <span class="font-mono font-black text-slate-800" dir="ltr">#{{ adj.adjustmentRef }}</span>
                        </div>
                        <div class="flex justify-between items-center pb-3 border-b border-slate-100 border-dashed">
                          <span class="font-bold text-slate-500">التاريخ</span>
                          <span class="font-mono font-black text-slate-800" dir="ltr">{{ formatDate(adj.createdAt) }}</span>
                        </div>
                        <div class="flex flex-col gap-1 pt-2">
                          <span class="font-bold text-slate-500">الكيان</span>
                          <span class="font-black text-slate-800">{{ adj.entityName | translate }}</span>
                        </div>
                      </div>

                      <div class="mt-8 flex justify-center">
                        <div class="h-12 w-full max-w-[200px] opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjAiIC8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzAwMCIgeD0iNSIgLz48cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwIiB4PSI4IiAvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjE0IiAvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjE4IiAvPjxyZWN0IHdpZHRoPSI1IiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjIyIiAvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjMwIiAvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjM0IiAvPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjM3IiAvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjQyIiAvPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjQ2IiAvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjUzIiAvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjU2IiAvPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjYxIiAvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjY3IiAvPjxyZWN0IHdpZHRoPSI1IiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjcwIiAvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9Ijc3IiAvPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjgyIiAvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9Ijg3IiAvPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjkwIiAvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9Ijk2IiAvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiIHg9IjEwMCIgLz48L3N2Zz4=')] bg-repeat-x"></div>
                      </div>
                    </div>
                    
                    <div class="absolute top-[64px] -left-3 w-6 h-6 bg-slate-50/50 rounded-full border-r border-slate-100"></div>
                    <div class="absolute top-[64px] -right-3 w-6 h-6 bg-slate-50/50 rounded-full border-l border-slate-100"></div>
                  </div>

                  <button class="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-slate-50 text-xs font-black text-slate-700 rounded-2xl transition-all border border-slate-200/80 shadow-sm active:scale-95 group">
                    <span class="material-symbols-outlined text-[18px] group-hover:-translate-y-1 transition-transform">download</span>
                    <span>تحميل نسخة PDF</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
`
})
export class FinancialAdjustmentsComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private financeService = inject(FinanceService);
  private translate = inject(TranslateService);

  adjustments: FinancialAdjustment[] = [];
  showCreateModal = false;

  // Filter properties
  searchQuery: string = '';
  selectedDirection: 'all' | 'credit' | 'debit' = 'all';
  selectedCategory: string = 'all';
  expandedAdjustmentId: string | null = null;

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
      this.cdr.markForCheck();
      this.adjustments = data;
    });
  }

  // Getters for Stats calculation
  get totalCredits(): number {
    return this.adjustments
      .filter(a => a.direction === 'credit' && a.status === 'approved')
      .reduce((sum, a) => sum + a.amount, 0);
  }

  get totalDebits(): number {
    return this.adjustments
      .filter(a => a.direction === 'debit' && a.status === 'approved')
      .reduce((sum, a) => sum + a.amount, 0);
  }

  get netAdjustments(): number {
    return this.totalCredits - this.totalDebits;
  }

  get pendingCount(): number {
    return this.adjustments.filter(a => a.status === 'pending_approval').length;
  }

  // Get filtered adjustments list
  getFilteredAdjustments(): FinancialAdjustment[] {
    return this.adjustments.filter(adj => {
      // 1. Direction Filter
      if (this.selectedDirection !== 'all' && adj.direction !== this.selectedDirection) {
        return false;
      }
      // 2. Category Filter
      if (this.selectedCategory !== 'all' && adj.category !== this.selectedCategory) {
        return false;
      }
      // 3. Search Query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        const ref = (adj.adjustmentRef || '').toLowerCase();
        const entityName = (adj.entityName || '').toLowerCase();
        const reason = (adj.reason || '').toLowerCase();
        if (!ref.includes(query) && !entityName.includes(query) && !reason.includes(query)) {
          return false;
        }
      }
      return true;
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
      adminName: 'FINANCES.ADMINS.SUPER_ADMIN',
      status: 'pending_approval' // New adjustments start as pending approval
    };
    this.financeService.createAdjustment(newAdj).pipe(take(1)).subscribe(adj => {
      this.cdr.markForCheck();
      this.adjustments = [adj, ...this.adjustments];
      this.resetForm();
      this.showCreateModal = false;
    });
  }

  toggleRow(id: string): void {
    this.expandedAdjustmentId = this.expandedAdjustmentId === id ? null : id;
  }

  approveAdjustment(id: string, event: Event): void {
    event.stopPropagation();
    const adj = this.adjustments.find(a => a.id === id);
    if (adj) {
      adj.status = 'approved';
      adj.approvedAt = new Date().toISOString();
      adj.approvedBy = 'FINANCES.ADMINS.SUPER_ADMIN';
    }
  }

  rejectAdjustment(id: string, event: Event): void {
    event.stopPropagation();
    const adj = this.adjustments.find(a => a.id === id);
    if (adj) {
      adj.status = 'rejected';
      adj.approvedAt = new Date().toISOString();
      adj.approvedBy = 'FINANCES.ADMINS.SUPER_ADMIN';
    }
  }

  getEntityLabelKey(type: string): string {
    return FINANCE_ENTITY_LABEL_KEYS[type] ?? type;
  }

  getCategoryLabelKey(cat: string): string {
    const map: Record<string, string> = {
      compensation: 'FINANCES.ADJUSTMENTS.CATEGORIES.COMPENSATION',
      cod_recovery: 'FINANCES.ADJUSTMENTS.CATEGORIES.COD_RECOVERY',
      promotion: 'FINANCES.ADJUSTMENTS.CATEGORIES.PROMOTION',
      penalty: 'FINANCES.ADJUSTMENTS.CATEGORIES.PENALTY',
      correction: 'FINANCES.ADJUSTMENTS.CATEGORIES.CORRECTION',
      other: 'FINANCES.ADJUSTMENTS.CATEGORIES.OTHER'
    };
    return map[cat] ?? cat;
  }

  getCategoryIcon(cat: string): string {
    switch (cat) {
      case 'compensation': return 'monetization_on';
      case 'cod_recovery': return 'payments';
      case 'promotion': return 'redeem';
      case 'penalty': return 'gavel';
      case 'correction': return 'build';
      default: return 'help_outline';
    }
  }

  getCategoryColor(cat: string): string {
    switch (cat) {
      case 'compensation': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cod_recovery': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'promotion': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'penalty': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'correction': return 'bg-sky-50 text-sky-600 border-sky-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
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
