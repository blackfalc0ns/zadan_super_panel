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
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { KpiCardsComponent, KPICard } from '../../../../shared/components/ui/kpi-cards/kpi-cards.component';
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
    AppPageHeaderComponent,
    KpiCardsComponent
  ],
  templateUrl: './financial-adjustments.component.html'
})
export class FinancialAdjustmentsComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
  private readonly financeService = inject(FinanceService);
  private readonly translate = inject(TranslateService);

 adjustments: FinancialAdjustment[] = [];
 showCreateModal = false;
  selectedAdjustment: FinancialAdjustment | null = null;
  kpiCards: KPICard[] = [];

  searchQuery = '';
 selectedDirection: 'all' | 'credit' | 'debit' = 'all';
  selectedCategory = 'all';

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
      this.refreshKpiCards();
 this.cdr.markForCheck();
 });
 }

  get isRTL(): boolean {
    return this.translate.currentLang?.startsWith('ar') ?? true;
  }

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

  get modalDir(): 'rtl' | 'ltr' {
    return this.isRTL ? 'rtl' : 'ltr';
  }

 getFilteredAdjustments(): FinancialAdjustment[] {
 return this.adjustments.filter(adj => {
      if (this.selectedDirection !== 'all' && adj.direction !== this.selectedDirection) {
 return false;
 }

      if (this.selectedCategory !== 'all' && adj.category !== this.selectedCategory) {
 return false;
 }

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

 openCreateModal(): void {
 this.showCreateModal = true;
 }

 closeCreateModal(): void {
 this.showCreateModal = false;
 this.resetForm();
 }

  openDetail(adjustment: FinancialAdjustment): void {
    this.selectedAdjustment = adjustment;
  }

  closeDetail(): void {
    this.selectedAdjustment = null;
 }

 submitAdjustment(): void {
    if (!this.form.reason || !this.form.amount || !this.form.entityName) {
      return;
    }

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
      status: 'pending_approval'
 };

 this.financeService.createAdjustment(newAdj).pipe(take(1)).subscribe(adj => {
      this.adjustments = [adj, ...this.adjustments];
      this.refreshKpiCards();
 this.resetForm();
 this.showCreateModal = false;
      this.cdr.markForCheck();
 });
 }

 approveAdjustment(id: string, event: Event): void {
 event.stopPropagation();
 const adj = this.adjustments.find(a => a.id === id);
    if (!adj) {
      return;
    }

 adj.status = 'approved';
 adj.approvedAt = new Date().toISOString();
 adj.approvedBy = 'FINANCES.ADMINS.SUPER_ADMIN';
    this.refreshKpiCards();
    this.cdr.markForCheck();
 }

 rejectAdjustment(id: string, event: Event): void {
 event.stopPropagation();
 const adj = this.adjustments.find(a => a.id === id);
    if (!adj) {
      return;
    }

 adj.status = 'rejected';
 adj.approvedAt = new Date().toISOString();
 adj.approvedBy = 'FINANCES.ADMINS.SUPER_ADMIN';
    this.refreshKpiCards();
    this.cdr.markForCheck();
 }

 getEntityLabelKey(type: string): string {
 return FINANCE_ENTITY_LABEL_KEYS[type] ?? type;
 }

  getEntityBadgeClass(type: string): string {
    return type === 'vendor'
      ? 'bg-cyan-50 text-cyan-700 border-cyan-100'
      : 'bg-amber-50 text-amber-700 border-amber-100';
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

  trackById(_: number, adjustment: FinancialAdjustment): string {
    return adjustment.id;
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString(getFinanceLocale(this.translate.currentLang), {
      timeZone: 'Asia/Riyadh',
      calendar: 'gregory'
    });
 }

 formatNumber(value: number): string {
 return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2
 });
 }

  private refreshKpiCards(): void {
    const currency = this.translate.instant('FINANCES.CURRENCY');
    this.kpiCards = [
      {
        id: 'credits',
        title: 'FINANCES.ADJUSTMENTS.KPI.TOTAL_CREDITS',
        value: `${this.formatNumber(this.totalCredits)} ${currency}`,
        icon: 'arrow_downward',
        color: '#10b981'
      },
      {
        id: 'debits',
        title: 'FINANCES.ADJUSTMENTS.KPI.TOTAL_DEBITS',
        value: `${this.formatNumber(this.totalDebits)} ${currency}`,
        icon: 'arrow_upward',
        color: '#f43f5e'
      },
      {
        id: 'net',
        title: 'FINANCES.ADJUSTMENTS.KPI.NET_IMPACT',
        value: `${this.netAdjustments >= 0 ? '+' : ''}${this.formatNumber(this.netAdjustments)} ${currency}`,
        icon: 'account_balance',
        color: '#6366f1'
      },
      {
        id: 'pending',
        title: 'FINANCES.ADJUSTMENTS.KPI.PENDING',
        value: this.pendingCount,
        icon: 'pending_actions',
        color: '#f59e0b',
        trend: this.pendingCount > 0
          ? { value: this.pendingCount, isPositive: false, label: String(this.pendingCount) }
          : undefined
      }
    ];
 }

 private resetForm(): void {
    this.form = {
      entityType: 'vendor',
      entityName: '',
      direction: 'credit',
      amount: 0,
      reason: '',
      category: 'compensation'
    };
 }
}
