import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { AuditLogEntry } from '../../models/finance.models';
import { FINANCE_ENTITY_LABEL_KEYS, getFinanceLocale } from '../../utils/finance-i18n.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="flex flex-col gap-5 animate-in fade-in duration-700">

      <div class="flex items-start gap-3 px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl">
        <span class="material-symbols-outlined text-blue-500 text-[20px] shrink-0">info</span>
        <div>
          <p class="text-xs font-black text-blue-800">{{ 'FINANCES.AUDIT.BANNER_TITLE' | translate }}</p>
          <p class="text-[11px] font-medium text-blue-600 mt-0.5">{{ 'FINANCES.AUDIT.BANNER_DESC' | translate }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden extraordinary-table-container">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-black text-slate-800">{{ 'FINANCES.AUDIT.TITLE' | translate }}</h3>
          <span class="text-[10px] font-bold text-slate-400">{{ entries.length }} {{ 'FINANCES.AUDIT.ENTRIES' | translate }}</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-100">
                <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.TIMESTAMP' | translate }}</th>
                <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.AUDIT.TABLE.ADMIN' | translate }}</th>
                <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.AUDIT.TABLE.ACTION' | translate }}</th>
                <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.ENTITY' | translate }}</th>
                <th class="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.AUDIT.TABLE.CHANGES' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let entry of entries; trackBy: trackById"
                  class="group hover:bg-slate-50/60 transition-all duration-200 table-row-object cursor-pointer"
                  (click)="toggleExpand(entry.id)">

                <td class="px-6 py-4">
                  <div>
                    <p class="text-xs font-bold text-slate-700 tabular-nums">{{ formatDate(entry.timestamp) }}</p>
                    <p class="text-[9px] font-medium text-slate-400 tabular-nums">{{ formatTime(entry.timestamp) }}</p>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-zadna-primary to-zadna-primaryLight flex items-center justify-center shrink-0">
                      <span class="text-white text-[10px] font-black">{{ getInitials(entry.adminName) }}</span>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-slate-800">{{ entry.adminName | translate }}</p>
                      <p class="text-[9px] font-bold text-slate-400">{{ entry.adminRole | translate }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <span class="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black border"
                        [ngClass]="getCategoryClass(entry.actionCategory)">
                    {{ entry.action | translate }}
                  </span>
                </td>

                <td class="px-6 py-4">
                  <div *ngIf="entry.entityName">
                    <p class="text-xs font-bold text-slate-700">{{ entry.entityName | translate }}</p>
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{{ getEntityLabelKey(entry.entityType) | translate }}</p>
                  </div>
                  <span *ngIf="!entry.entityName" class="text-[10px] text-slate-300">&mdash;</span>
                </td>

                <td class="px-6 py-4">
                  <div class="flex justify-center items-center gap-1">
                    <button class="h-7 px-2.5 text-[9px] font-black text-slate-600 bg-slate-100 rounded-lg border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1">
                      <span class="material-symbols-outlined text-[12px]">{{ expandedId === entry.id ? 'expand_less' : 'expand_more' }}</span>
                      {{ expandedId === entry.id ? ('FINANCES.COMMON.HIDE' | translate) : ('FINANCES.COMMON.VIEW' | translate) }}
                    </button>
                  </div>
                </td>

              </tr>

              <tr *ngFor="let entry of entries; trackBy: trackById"
                  [ngClass]="{ 'hidden': expandedId !== entry.id }">
                <td colspan="5" class="px-6 py-5 bg-slate-50/80">
                  <div class="grid grid-cols-2 gap-4">
                    <div *ngIf="entry.before" class="p-4 bg-red-50 border border-red-100 rounded-xl">
                      <p class="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2">{{ 'FINANCES.COMMON.BEFORE' | translate }}</p>
                      <pre class="text-[10px] font-mono text-red-700 whitespace-pre-wrap">{{ entry.before | json }}</pre>
                    </div>
                    <div *ngIf="entry.after" class="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">{{ 'FINANCES.COMMON.AFTER' | translate }}</p>
                      <pre class="text-[10px] font-mono text-emerald-700 whitespace-pre-wrap">{{ entry.after | json }}</pre>
                    </div>
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AuditLogComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private financeService = inject(FinanceService);
  private translate = inject(TranslateService);

  entries: AuditLogEntry[] = [];
  expandedId: string | null = null;

  ngOnInit(): void {
    this.financeService.getAuditLog().pipe(take(1)).subscribe(data => {
      this.cdr.markForCheck();
      this.entries = data;
    });
  }

  toggleExpand(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'SA';
  }

  getEntityLabelKey(type: string): string {
    return FINANCE_ENTITY_LABEL_KEYS[type] ?? type;
  }

  getCategoryClass(cat: string): string {
    const map: Record<string, string> = {
      settlement: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      refund: 'bg-red-50 text-red-600 border-red-200',
      adjustment: 'bg-purple-50 text-purple-700 border-purple-200',
      pricing: 'bg-zadna-primary/10 text-zadna-primary border-zadna-primary/20',
      override: 'bg-orange-50 text-orange-700 border-orange-200',
      auth: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return map[cat] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  }

  trackById(_: number, e: AuditLogEntry): string { return e.id; }

  formatDate(ts: string): string {
    return new Date(ts).toLocaleDateString(getFinanceLocale(this.translate.currentLang), { timeZone: 'Asia/Riyadh', calendar: 'gregory' });
  }

  formatTime(ts: string): string {
    return new Date(ts).toLocaleTimeString(getFinanceLocale(this.translate.currentLang), { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit' });
  }
}
