import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { finalize, take } from 'rxjs';
import { AccessService } from '../../../../core/services/access.service';
import {
  PayoutBankStatementEntry,
  PayoutBankStatementImport,
  PayoutReconciliationService
} from '../../services/payout-reconciliation.service';

@Component({
  selector: 'app-payout-reconciliation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="mx-auto max-w-[1480px] space-y-6 px-4 py-5 pb-10 md:px-6 lg:px-8" [attr.dir]="isArabic ? 'rtl' : 'ltr'">
    <header class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-start md:justify-between">
      <div>
        <div class="flex items-center gap-2 text-cyan-700">
          <span class="material-symbols-outlined">account_balance</span>
          <span class="text-[11px] font-black uppercase tracking-[0.18em]">{{ t('عمليات مالية محمية', 'Protected finance operations') }}</span>
        </div>
        <h1 class="mt-2 text-xl font-black text-slate-950">{{ t('مطابقة التحويلات البنكية', 'Bank transfer reconciliation') }}</h1>
        <p class="mt-2 max-w-3xl text-[13px] leading-6 font-medium text-slate-600">{{ t('ارفع كشف البنك بصيغة CSV لمراجعة مراجع التحويل والمبالغ. المطابقة سجل تدقيقي فقط ولا تعتبر التسوية مدفوعة ولا تتجاوز الإثبات والتأكيد.', 'Upload a CSV bank statement to review transfer references and amounts. Matching is audit-only: it never marks a payout paid or bypasses proof and confirmation.') }}</p>
      </div>
      <label *ngIf="canApprovePayoutReconciliation; else readOnlyMode" class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 text-[12px] font-black text-white transition hover:bg-cyan-800 disabled:opacity-50" [class.pointer-events-none]="isImporting">
        <span class="material-symbols-outlined text-[18px]">upload_file</span>
        {{ isImporting ? t('جارٍ رفع الكشف...', 'Uploading statement...') : t('رفع كشف CSV', 'Upload CSV statement') }}
        <input type="file" accept=".csv,text/csv" class="hidden" (change)="onFileSelected($event)" [disabled]="isImporting" />
      </label>
      <ng-template #readOnlyMode>
        <span class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-black text-slate-500">{{ t('عرض فقط', 'Read only') }}</span>
      </ng-template>
    </header>

    <p *ngIf="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700">{{ error }}</p>

    <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-[15px] font-black text-slate-900">{{ t('الكشوف المستوردة', 'Imported statements') }}</h2>
          <p class="mt-1 text-[12px] text-slate-500">{{ t('اختر كشفاً لتصفية صفوف المطابقة الخاصة به.', 'Choose a statement to filter its reconciliation rows.') }}</p>
        </div>
        <button *ngIf="selectedImportId" type="button" class="text-[12px] font-black text-cyan-700 hover:underline" (click)="clearImportFilter()">{{ t('عرض كل الكشوف', 'Show all statements') }}</button>
      </div>
      <div *ngIf="imports.length; else noImports" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <button *ngFor="let item of imports; trackBy: trackImport" type="button" (click)="selectImport(item)" class="rounded-2xl border p-4 text-start transition" [ngClass]="selectedImportId === item.id ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 hover:border-cyan-300 hover:bg-slate-50'">
          <div class="flex items-start justify-between gap-3">
            <span class="truncate text-[13px] font-black text-slate-900" [title]="item.fileName">{{ item.fileName }}</span>
            <span class="rounded-full bg-white px-2 py-1 text-[10px] font-black text-cyan-700 shadow-sm">{{ item.matchedRows }}/{{ item.totalRows }}</span>
          </div>
          <p class="mt-2 text-[11px] font-medium text-slate-500">{{ formatDate(item.importedAtUtc) }}</p>
          <div class="mt-3 grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
            <span class="rounded-lg bg-emerald-50 px-1 py-1 text-emerald-700">{{ t('مطابق', 'Matched') }} {{ item.matchedRows }}</span>
            <span class="rounded-lg bg-amber-50 px-1 py-1 text-amber-700">{{ t('معلق', 'Open') }} {{ item.unmatchedRows }}</span>
            <span class="rounded-lg bg-orange-50 px-1 py-1 text-orange-700">{{ t('ملتبس', 'Ambig.') }} {{ item.ambiguousRows }}</span>
            <span class="rounded-lg bg-rose-50 px-1 py-1 text-rose-700">{{ t('خطأ', 'Mismatch') }} {{ item.mismatchRows }}</span>
          </div>
        </button>
      </div>
      <ng-template #noImports><p class="py-6 text-center text-[13px] font-medium text-slate-500">{{ t('ما تم رفع أي كشف بنك إلى الآن.', 'No bank statement has been uploaded yet.') }}</p></ng-template>
    </section>

    <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-[15px] font-black text-slate-900">{{ t('صفوف المطابقة', 'Reconciliation entries') }}</h2>
          <p class="mt-1 text-[12px] text-slate-500">{{ entries.length }} {{ t('صف ظاهر', 'rows shown') }}</p>
        </div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="loadEntries()" class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-700 outline-none focus:border-cyan-500">
          <option value="">{{ t('كل الحالات', 'All statuses') }}</option>
          <option value="Unmatched">{{ t('غير مطابق', 'Unmatched') }}</option>
          <option value="Ambiguous">{{ t('ملتبس', 'Ambiguous') }}</option>
          <option value="Mismatch">{{ t('اختلاف', 'Mismatch') }}</option>
          <option value="Matched">{{ t('مطابق', 'Matched') }}</option>
          <option value="Ignored">{{ t('متجاهل', 'Ignored') }}</option>
        </select>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-start">
          <thead class="bg-slate-50 text-[10px] font-black uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">{{ t('المرجع البنكي', 'Bank reference') }}</th>
              <th class="px-4 py-3">{{ t('المبلغ', 'Amount') }}</th>
              <th class="px-4 py-3">{{ t('المستفيد', 'Beneficiary') }}</th>
              <th class="px-4 py-3">{{ t('الحالة', 'Status') }}</th>
              <th *ngIf="canApprovePayoutReconciliation" class="px-4 py-3">{{ t('إجراء', 'Action') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let entry of entries; trackBy: trackEntry" class="align-top">
              <td class="px-4 py-4"><p dir="ltr" class="font-mono text-[12px] font-bold text-slate-900">{{ entry.bankReference }}</p><p class="mt-1 text-[10px] text-slate-500">{{ formatDate(entry.transactionDateUtc) }}</p></td>
              <td class="px-4 py-4 text-[12px] font-black text-slate-900" dir="ltr">{{ formatAmount(entry.amount) }} {{ entry.currencyCode }}</td>
              <td class="px-4 py-4 text-[12px] font-medium text-slate-600">{{ entry.beneficiaryMasked || '—' }}</td>
              <td class="px-4 py-4"><span class="rounded-full px-2.5 py-1 text-[10px] font-black" [ngClass]="statusClass(entry.status)">{{ statusLabel(entry.status) }}</span><p *ngIf="entry.resolutionNote" class="mt-2 max-w-xs text-[10px] leading-4 text-slate-500">{{ entry.resolutionNote }}</p></td>
              <td *ngIf="canApprovePayoutReconciliation" class="min-w-[270px] px-4 py-4">
                <ng-container *ngIf="canResolve(entry); else resolved">
                  <div class="flex flex-col gap-2 sm:flex-row">
                    <input [(ngModel)]="payoutIds[entry.id]" type="text" dir="ltr" class="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-2 text-[11px] font-mono outline-none focus:border-cyan-500" [placeholder]="t('معرف التسوية (Payout ID)', 'Payout ID')" />
                    <button type="button" (click)="match(entry)" [disabled]="isEntryWorking(entry) || !(payoutIds[entry.id] || '').trim()" class="h-9 rounded-lg bg-cyan-700 px-3 text-[11px] font-black text-white hover:bg-cyan-800 disabled:opacity-50">{{ t('مطابقة', 'Match') }}</button>
                    <button type="button" (click)="ignore(entry)" [disabled]="isEntryWorking(entry)" class="h-9 rounded-lg border border-slate-200 px-3 text-[11px] font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50">{{ t('تجاهل', 'Ignore') }}</button>
                  </div>
                </ng-container>
                <ng-template #resolved><span *ngIf="entry.payoutId" dir="ltr" class="text-[11px] font-mono font-bold text-emerald-700">{{ shortId(entry.payoutId) }}</span><span *ngIf="!entry.payoutId" class="text-[11px] font-medium text-slate-500">—</span></ng-template>
              </td>
            </tr>
            <tr *ngIf="!isLoadingEntries && !entries.length"><td [attr.colspan]="canApprovePayoutReconciliation ? 5 : 4" class="px-4 py-10 text-center text-[13px] font-medium text-slate-500">{{ t('ما فيه صفوف تطابق وفق الفلتر الحالي.', 'No reconciliation rows match the current filter.') }}</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
  `
})
export class PayoutReconciliationComponent implements OnInit {
  private readonly service = inject(PayoutReconciliationService);
  private readonly translate = inject(TranslateService);
  private readonly accessService = inject(AccessService);
  private readonly cdr = inject(ChangeDetectorRef);

  imports: PayoutBankStatementImport[] = [];
  entries: PayoutBankStatementEntry[] = [];
  payoutIds: Record<string, string> = {};
  selectedImportId: string | undefined;
  statusFilter = '';
  isLoadingEntries = false;
  isImporting = false;
  workingEntryIds = new Set<string>();
  error = '';

  get isArabic(): boolean {
    return (this.translate.currentLang || 'ar').toLowerCase().startsWith('ar');
  }

  get canApprovePayoutReconciliation(): boolean {
    return this.accessService.hasPermission('finances.approve');
  }

  ngOnInit(): void {
    this.loadImports();
    this.loadEntries();
  }

  t(arabic: string, english: string): string {
    return this.isArabic ? arabic : english;
  }

  onFileSelected(event: Event): void {
    if (!this.canApprovePayoutReconciliation) return;

    const file = (event.target as HTMLInputElement).files?.item(0);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.error = this.t('ارفع كشفاً بصيغة CSV فقط.', 'Upload a CSV statement only.');
      return;
    }

    this.isImporting = true;
    this.error = '';
    this.service.importStatement(file).pipe(
      take(1),
      finalize(() => {
        this.isImporting = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (imported) => {
        this.selectedImportId = imported.id;
        this.loadImports();
        this.loadEntries();
      },
      error: (error) => this.error = this.describeError(error)
    });
  }

  selectImport(item: PayoutBankStatementImport): void {
    this.selectedImportId = item.id;
    this.loadEntries();
  }

  clearImportFilter(): void {
    this.selectedImportId = undefined;
    this.loadEntries();
  }

  loadImports(): void {
    this.service.getImports().pipe(take(1)).subscribe({
      next: (response) => {
        this.imports = response.items;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.error = this.describeError(error);
        this.cdr.markForCheck();
      }
    });
  }

  loadEntries(): void {
    this.isLoadingEntries = true;
    this.error = '';
    this.service.getEntries(this.statusFilter || undefined, this.selectedImportId).pipe(
      take(1),
      finalize(() => {
        this.isLoadingEntries = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => this.entries = response.items,
      error: (error) => this.error = this.describeError(error)
    });
  }

  match(entry: PayoutBankStatementEntry): void {
    if (!this.canApprovePayoutReconciliation) return;

    const payoutId = this.payoutIds[entry.id]?.trim();
    if (!payoutId) return;
    this.runEntryAction(entry, this.service.matchEntry(entry.id, payoutId));
  }

  ignore(entry: PayoutBankStatementEntry): void {
    if (!this.canApprovePayoutReconciliation) return;

    this.runEntryAction(entry, this.service.ignoreEntry(entry.id));
  }

  canResolve(entry: PayoutBankStatementEntry): boolean {
    return entry.status !== 'Matched' && entry.status !== 'Ignored';
  }

  isEntryWorking(entry: PayoutBankStatementEntry): boolean {
    return this.workingEntryIds.has(entry.id);
  }

  statusLabel(status: string): string {
    const labels: Record<string, [string, string]> = {
      Matched: ['مطابق', 'Matched'],
      Unmatched: ['غير مطابق', 'Unmatched'],
      Ambiguous: ['ملتبس', 'Ambiguous'],
      Mismatch: ['اختلاف', 'Mismatch'],
      Ignored: ['متجاهل', 'Ignored']
    };
    const label = labels[status] ?? [status, status];
    return this.t(label[0], label[1]);
  }

  statusClass(status: string): string {
    return ({
      Matched: 'bg-emerald-50 text-emerald-700',
      Unmatched: 'bg-amber-50 text-amber-700',
      Ambiguous: 'bg-orange-50 text-orange-700',
      Mismatch: 'bg-rose-50 text-rose-700',
      Ignored: 'bg-slate-100 text-slate-600'
    } as Record<string, string>)[status] ?? 'bg-slate-100 text-slate-600';
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat(this.isArabic ? 'ar-SA' : 'en-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat(this.isArabic ? 'ar-SA' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  shortId(value: string): string {
    return `PAYOUT-${value.slice(0, 8).toUpperCase()}`;
  }

  trackImport(_: number, item: PayoutBankStatementImport): string {
    return item.id;
  }

  trackEntry(_: number, item: PayoutBankStatementEntry): string {
    return item.id;
  }

  private runEntryAction(entry: PayoutBankStatementEntry, action: ReturnType<PayoutReconciliationService['matchEntry']>): void {
    this.workingEntryIds.add(entry.id);
    this.error = '';
    action.pipe(
      take(1),
      finalize(() => {
        this.workingEntryIds.delete(entry.id);
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.loadImports();
        this.loadEntries();
      },
      error: (error) => this.error = this.describeError(error)
    });
  }

  private describeError(error: unknown): string {
    const code = error instanceof HttpErrorResponse
      ? (error.error?.error || error.error?.title || error.error?.message)
      : null;
    return typeof code === 'string' && code.trim()
      ? code
      : this.t('ما قدرنا نكمل العملية. راجع البيانات وحاول مرة ثانية.', 'We could not complete the operation. Review the data and try again.');
  }
}
